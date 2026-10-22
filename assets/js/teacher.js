/* KONCEPT JUNCTION — teacher.js (V1)  Teacher Upload
   Lock (Setup Code + PIN) → edit working copy → publish to GitHub (Contents API).
   Media (images, videos, PDFs) go to Cloudinary via an unsigned preset. */
(function () {
  const KJ = window.KJ, C = KJ.C, $ = KJ.$, $$ = KJ.$$, esc = KJ.esc, S = KJ.store;
  const root = () => $("#t");

  /* ---------------- settings (override config.js per device) ---------------- */
  const cfg = () => {
    const s = S.get("t_settings", {});
    return {
      owner: s.owner || C.GITHUB.owner, repo: s.repo || C.GITHUB.repo, branch: s.branch || C.GITHUB.branch,
      prefix: s.prefix != null ? s.prefix : C.GITHUB.path_prefix || "",
      cloud: s.cloud || C.CLOUDINARY.cloud_name, preset: s.preset || C.CLOUDINARY.upload_preset, folder: s.folder || C.CLOUDINARY.folder
    };
  };
  const pat = () => S.get("t_pat", "");

  /* ---------------- working copy ---------------- */
  const W = {};                       // path -> data
  let dirty = new Set(S.get("t_dirtylist", []));
  let SUBS = [], EXAMS = [];
  const FIXED = ["data/exams.json", "data/papers.json", "data/notes.json", "data/current_affairs.json", "data/announcements.json", "data/subjects.json"];
  function markDirty(path) {
    dirty.add(path); S.set("t_dirtylist", [...dirty]); S.set("t_work_" + path, W[path]); pill();
  }
  function clearDirty(path) { dirty.delete(path); S.set("t_dirtylist", [...dirty]); S.del("t_work_" + path); pill(); }
  function pill() { const p = $("#dirtyPill"); p.style.display = dirty.size ? "" : "none"; p.textContent = dirty.size + " unpublished"; }
  async function loadAll() {
    SUBS = await KJ.load("data/subjects.json", true);
    const paths = [...FIXED, ...SUBS.map((s) => s.file)];
    await Promise.all(paths.map(async (p) => {
      if (dirty.has(p)) { W[p] = S.get("t_work_" + p, null); if (W[p] != null) return; }
      try { W[p] = await KJ.load(p, true); } catch (e) { W[p] = []; }
    }));
    if (dirty.has("data/subjects.json")) SUBS = W["data/subjects.json"];
    EXAMS = W["data/exams.json"];
    pill();
  }
  const bankPath = (sid) => (SUBS.find((s) => s.id === sid) || {}).file || "data/questions/" + sid + ".json";
  const bank = (sid) => (W[bankPath(sid)] = W[bankPath(sid)] || []);
  const allQs = () => SUBS.flatMap((s) => bank(s.id));
  const subName = (sid) => (SUBS.find((s) => s.id === sid) || { name: { en: sid } }).name.en;
  function nextId(sid) {
    const pre = sid.slice(0, 3);
    const n = bank(sid).map((q) => +(String(q.id).split("-")[1] || 0)).filter((x) => !isNaN(x));
    return pre + "-" + String((n.length ? Math.max(...n) : 0) + 1).padStart(4, "0");
  }

  /* ================= LOCK ================= */
  async function lock() {
    const dev = S.get("t_device_ok", false);
    root().innerHTML = `<div class="card lock"><img src="${esc(C.LOGO)}" alt=""><h2>Teacher Upload</h2>
${dev ? "" : `<label>Setup Code (once per device)</label><input id="lc" type="password" autocomplete="off">`}
<label>PIN</label><input id="lp" type="password" inputmode="numeric" autocomplete="off">
<button class="btn" id="lb" style="width:100%;margin-top:14px">Unlock</button>
${dev ? `<p class="small"><a href="#" id="lr">Forget this device</a></p>` : ""}
<p class="small muted">Students never need this page.</p></div>`;
    const go = async () => {
      if (!dev) {
        if ((await KJ.sha256($("#lc").value.trim())) !== C.TEACHER_LOCK.setup_code_sha256) return KJ.toast("Wrong Setup Code");
      }
      if ((await KJ.sha256($("#lp").value.trim())) !== C.TEACHER_LOCK.pin_sha256) return KJ.toast("Wrong PIN");
      S.set("t_device_ok", true); sessionStorage.setItem("kj_t_ok", "1"); boot();
    };
    $("#lb").onclick = go;
    $("#lp").onkeydown = (e) => e.key === "Enter" && go();
    if ($("#lr")) $("#lr").onclick = (e) => { e.preventDefault(); S.del("t_device_ok"); lock(); };
  }

  /* ================= MAIN ================= */
  const TABS = [["add", "➕ Add / Edit"], ["bank", "📚 Question Bank"], ["import", "📥 Bulk Import"], ["papers", "📄 Model Papers"],
    ["notes", "📒 Notes & Concepts"], ["ca", "📰 Current Affairs"], ["ann", "📢 Announcements"], ["exams", "🎯 Exams"],
    ["export", "📤 Export"], ["publish", "🚀 Publish"], ["settings", "⚙️ Settings"]];
  let tab = "add", editing = null;

  async function boot() {
    root().innerHTML = '<div class="empty">Loading data…</div>';
    try { await loadAll(); } catch (e) { root().innerHTML = `<div class="card">Could not load data: ${esc(e.message)}</div>`; return; }
    draw();
  }
  function draw() {
    root().innerHTML = `<div class="tabs">${TABS.map(([k, n]) => `<button data-tab="${k}" class="${k === tab ? "on" : ""}">${n}${k === "publish" && dirty.size ? " (" + dirty.size + ")" : ""}</button>`).join("")}</div><div id="tp"></div>`;
    $(".tabs").onclick = (e) => { const b = e.target.closest("[data-tab]"); if (b) { tab = b.dataset.tab; if (tab !== "add") editing = null; draw(); } };
    (P[tab] || P.add)($("#tp"));
    KJ.math($("#tp"));
  }
  const P = {};

  /* ---------- Add / Edit question ---------- */
  P.add = (el) => {
    const q = editing ? JSON.parse(JSON.stringify(editing.q)) : { type: "mcq", subject: S.get("t_lastsub", SUBS[0]?.id), exams: S.get("t_lastexams", []), level: "easy", q: {}, o: { en: ["", "", "", ""], te: ["", "", "", ""] }, a: 0, e: {}, img: "", video: "", topic: S.get("t_lasttopic", ""), year: "", paper: "" };
    el.innerHTML = `<div class="two3"><div class="card">
<h3 style="margin-top:0">${editing ? "✏️ Edit " + esc(q.id) : "➕ New question"}</h3>
<div class="row"><div style="flex:2"><label>Subject</label><select id="fs">${SUBS.map((s) => `<option value="${s.id}" ${s.id === q.subject ? "selected" : ""}>${esc(s.name.en)}</option>`).join("")}</select></div>
<div style="flex:1"><label>Type</label><select id="ft"><option value="mcq">MCQ</option><option value="conv">Conventional (Mains)</option></select></div>
<div style="flex:1"><label>Level</label><select id="fl"><option>easy</option><option>medium</option><option>hard</option></select></div></div>
<div class="row"><div style="flex:2"><label>Topic</label><input id="fto" value="${esc(q.topic || "")}" list="topics"><datalist id="topics"></datalist></div>
<div style="flex:1"><label>PYQ year (optional)</label><input id="fy" value="${esc(q.year || "")}" placeholder="e.g. APPSC 2023"></div></div>
<label>Exams this question suits</label><div id="fe">${EXAMS.map((x) => `<label class="chk"><input type="checkbox" value="${x.id}" ${(q.exams || []).includes(x.id) ? "checked" : ""}>${esc(x.name.en)}</label>`).join("")}</div>
<label>Question – English</label><textarea id="qe">${esc(q.q.en || "")}</textarea>
<label>ప్రశ్న – తెలుగు</label><textarea id="qt" class="t-te" style="color:var(--ink)">${esc(q.q.te || "")}</textarea>
<div id="mcqBox"><label>Options (English | తెలుగు) – tick the correct one</label>
${[0, 1, 2, 3].map((i) => `<div class="optrow"><label class="chk" style="margin:0"><input type="radio" name="fa" value="${i}" ${q.a === i ? "checked" : ""}>${KJ.LETTERS[i]}</label>
<input id="oe${i}" value="${esc(q.o?.en?.[i] || "")}"><input id="ot${i}" value="${esc(q.o?.te?.[i] || "")}"></div>`).join("")}</div>
<label id="expLbl">Explanation – English</label><textarea id="ee">${esc(q.e?.en || "")}</textarea>
<label>వివరణ – తెలుగు</label><textarea id="et">${esc(q.e?.te || "")}</textarea>
<div class="row"><div style="flex:1"><label>Image URL</label><input id="fi" value="${esc(q.img || "")}"></div><div><label>&nbsp;</label><label class="btn alt sm" style="margin:0">⬆ Upload<input type="file" id="fiu" accept="image/*" hidden></label></div></div>
<div class="row"><div style="flex:1"><label>Video solution URL (Cloudinary / YouTube)</label><input id="fv" value="${esc(q.video || "")}"></div><div><label>&nbsp;</label><label class="btn alt sm" style="margin:0">⬆ Upload<input type="file" id="fvu" accept="video/*" hidden></label></div></div>
<div class="small muted" id="upst"></div>
<div class="row" style="margin-top:12px"><label class="btn alt sm" style="margin:0">🔍 OCR from image<input type="file" id="ocr" accept="image/*" hidden></label>
<span class="sp"></span>${editing ? '<button class="btn alt sm" id="cancel">Cancel</button>' : ""}<button class="btn ok" id="save">${editing ? "Update" : "Save question"}</button></div>
<div id="ocrOut"></div>
<p class="small muted">Maths: write LaTeX between $…$ e.g. <code>$R=\\dfrac{V^2}{P}$</code>. Saved questions stay on this device until you Publish.</p>
</div>
<div><div class="card"><h3 style="margin-top:0">👁 Student preview</h3><div id="pv"></div></div>
<div class="card small"><b>Last 5 in this subject</b><div id="recent" class="qlist"></div></div></div></div>`;
    $("#ft").value = q.type || "mcq"; $("#fl").value = q.level || "easy";
    const topics = () => { $("#topics").innerHTML = [...new Set(bank($("#fs").value).map((x) => x.topic).filter(Boolean))].map((t) => `<option value="${esc(t)}">`).join(""); };
    const read = () => {
      const o = { ...q, subject: $("#fs").value, type: $("#ft").value, level: $("#fl").value, topic: $("#fto").value.trim(), year: $("#fy").value.trim(),
        exams: $$("#fe input:checked").map((x) => x.value), q: { en: $("#qe").value.trim(), te: $("#qt").value.trim() },
        e: { en: $("#ee").value.trim(), te: $("#et").value.trim() }, img: $("#fi").value.trim(), video: $("#fv").value.trim() };
      if (o.type === "mcq") {
        o.o = { en: [0, 1, 2, 3].map((i) => $("#oe" + i).value.trim()), te: [0, 1, 2, 3].map((i) => $("#ot" + i).value.trim()) };
        o.a = +($$("input[name=fa]:checked")[0]?.value ?? 0);
      } else { delete o.o; delete o.a; }
      return o;
    };
    const preview = () => {
      const o = read();
      $("#mcqBox").style.display = o.type === "mcq" ? "" : "none";
      $("#expLbl").textContent = o.type === "mcq" ? "Explanation – English" : "Model answer – English";
      $("#pv").innerHTML = `<div class="qtext">${KJ.txt(o.q, "bi")}</div>${o.img ? `<img class="qimg" src="${esc(o.img)}">` : ""}
${o.type === "mcq" ? `<div class="opts">${o.o.en.map((_, i) => `<div class="opt ${i === o.a ? "right" : ""}"><span class="k">${KJ.LETTERS[i]}</span><span>${KJ.optTxt(o, i, "bi")}</span></div>`).join("")}</div>` : ""}
${o.e.en || o.e.te ? `<div class="exp">${KJ.txt(o.e, "bi")}</div>` : ""}${o.video ? '<div class="small">🎬 video attached</div>' : ""}`;
      KJ.math($("#pv"));
      $("#recent").innerHTML = bank(o.subject).slice(-5).reverse().map((x) => `<div class="qi"><span class="q">${esc(x.id)} · ${esc((x.q.en || x.q.te || "").slice(0, 80))}</span></div>`).join("") || '<span class="muted">none</span>';
    };
    el.oninput = preview; el.onchange = (e) => { if (e.target.id === "fs") topics(); preview(); };
    topics(); preview();
    const up = (inp, kind, target) => (inp.onchange = async () => {
      const f = inp.files[0]; if (!f) return;
      try { $(target).value = await cloudUpload(f, kind, (p) => ($("#upst").textContent = "Uploading " + p + "%")); $("#upst").textContent = "✔ Uploaded"; preview(); }
      catch (e) { $("#upst").textContent = "✖ " + e.message; }
    });
    up($("#fiu"), "images", "#fi"); up($("#fvu"), "videos", "#fv");
    $("#ocr").onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      $("#ocrOut").innerHTML = '<div class="small muted">Running OCR (English + Telugu)… first time downloads language data.</div>';
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js");
        const r = await window.Tesseract.recognize(f, "eng+tel");
        $("#ocrOut").innerHTML = `<label>OCR text – copy what you need</label><textarea style="min-height:140px">${esc(r.data.text)}</textarea>
<button class="btn alt sm" id="ocrImp">Send to Bulk Import parser</button>`;
        $("#ocrImp").onclick = () => { S.set("t_import_text", r.data.text); tab = "import"; draw(); };
      } catch (err) { $("#ocrOut").innerHTML = '<div class="small" style="color:var(--bad)">OCR failed: ' + esc(err.message) + "</div>"; }
    };
    if ($("#cancel")) $("#cancel").onclick = () => { editing = null; tab = "bank"; draw(); };
    $("#save").onclick = () => {
      const o = read();
      if (!o.q.en && !o.q.te) return KJ.toast("Enter the question");
      if (o.type === "mcq" && o.o.en.filter(Boolean).length < 2 && o.o.te.filter(Boolean).length < 2) return KJ.toast("Enter at least two options");
      if (editing && editing.sid !== o.subject) {            // moved to another subject
        const ob = bank(editing.sid); ob.splice(ob.findIndex((x) => x.id === o.id), 1); markDirty(bankPath(editing.sid));
        o.id = nextId(o.subject);
      }
      const b = bank(o.subject);
      if (!o.id) o.id = nextId(o.subject);
      const k = b.findIndex((x) => x.id === o.id);
      k >= 0 ? (b[k] = o) : b.push(o);
      markDirty(bankPath(o.subject));
      S.set("t_lastsub", o.subject); S.set("t_lastexams", o.exams); S.set("t_lasttopic", o.topic);
      KJ.toast((editing ? "Updated " : "Saved ") + o.id);
      editing = null; draw();
    };
  };

  /* ---------- Question bank ---------- */
  P.bank = (el) => {
    const fsub = S.get("t_bsub", "all"), fq = S.get("t_bq", "");
    let list = fsub === "all" ? allQs() : bank(fsub);
    if (fq) list = list.filter((q) => JSON.stringify(q).toLowerCase().includes(fq.toLowerCase()));
    el.innerHTML = `<div class="card"><div class="row"><select id="bs" style="max-width:280px"><option value="all">All subjects (${allQs().length})</option>
${SUBS.map((s) => `<option value="${s.id}" ${s.id === fsub ? "selected" : ""}>${esc(s.name.en)} (${bank(s.id).length})</option>`).join("")}</select>
<input id="bq" placeholder="Search text / id / topic" value="${esc(fq)}" style="max-width:260px"><span class="sp"></span><span class="small muted">${list.length} shown</span></div>
<div class="qlist" style="margin-top:8px">${list.map((q) => `<div class="qi"><span class="pill">${esc(q.id)}</span><span class="q">${esc((q.q.en || q.q.te || "").slice(0, 140))}
<div class="tag">${esc(subName(q.subject))} · ${esc(q.topic || "")} · ${q.type === "conv" ? "Conventional" : "Ans " + KJ.LETTERS[q.a]}${q.video ? " · 🎬" : ""}${q.paper ? " · " + esc(q.paper) : ""}</div></span>
<button class="btn alt sm" data-ed="${esc(q.id)}" data-s="${q.subject}">Edit</button><button class="btn alt sm" data-del="${esc(q.id)}" data-s="${q.subject}">🗑</button></div>`).join("") || '<div class="empty">No questions</div>'}</div></div>`;
    $("#bs").onchange = (e) => { S.set("t_bsub", e.target.value); draw(); };
    $("#bq").onchange = (e) => { S.set("t_bq", e.target.value); draw(); };
    el.onclick = (e) => {
      const ed = e.target.closest("[data-ed]"), del = e.target.closest("[data-del]");
      if (ed) { editing = { sid: ed.dataset.s, q: bank(ed.dataset.s).find((x) => x.id === ed.dataset.ed) }; tab = "add"; draw(); }
      if (del && KJ.confirm("Delete " + del.dataset.del + "?")) {
        const b = bank(del.dataset.s); b.splice(b.findIndex((x) => x.id === del.dataset.del), 1); markDirty(bankPath(del.dataset.s)); draw();
      }
    };
  };

  /* ---------- Bulk import ---------- */
  /* Model-paper text format (same as KJ question papers):
       1. English question …
       తెలుగు ప్రశ్న …
       A) English / తెలుగు
       B) English            (Telugu may also come on the next line)
          తెలుగు
     Answer key lines like  1-B 2-C 3-D  or  1) B  */
  const isTe = (s) => /[\u0C00-\u0C7F]/.test(s);
  KJ.parsePaperText = function (txt, keyTxt) {
    const key = {};
    (keyTxt || "").replace(/(\d+)\s*[-:.)=]\s*\(?([A-Da-d])\)?/g, (_, n, l) => (key[+n] = "ABCD".indexOf(l.toUpperCase())));
    const blocks = txt.replace(/\r/g, "").split(/\n(?=\s*\d{1,3}\s*[.)]\s+)/).map((b) => b.trim()).filter((b) => /^\d{1,3}\s*[.)]/.test(b));
    return blocks.map((b) => {
      const no = +b.match(/^(\d{1,3})/)[1];
      const lines = b.replace(/^\d{1,3}\s*[.)]\s*/, "").split("\n").map((l) => l.trim()).filter(Boolean);
      const q = { en: [], te: [] }, o = { en: [], te: [] };
      let inOpts = false;
      for (const l of lines) {
        const m = l.match(/^\(?([A-Da-d])\s*[).]\s*(.*)$/);
        if (m) {
          inOpts = true;
          const parts = m[2].split(/\s+\/\s+|\s\/|\/\s/);
          let en = parts[0] || "", te = parts.slice(1).join(" / ");
          if (!te && isTe(en)) { te = en; en = ""; }
          o.en.push(en.trim()); o.te.push(te.trim());
        } else if (inOpts && o.en.length) {
          const k = o.en.length - 1;
          if (isTe(l)) o.te[k] = (o.te[k] ? o.te[k] + " " : "") + l; else o.en[k] = (o.en[k] + " " + l).trim();
        } else (isTe(l) ? q.te : q.en).push(l);
      }
      return { no, q: { en: q.en.join(" "), te: q.te.join(" ") }, o, a: key[no] != null ? key[no] : null };
    });
  };
  function parseCSV(text) {
    const rows = []; let row = [], cur = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
      else if (c === '"') q = true; else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; } else if (c !== "\r") cur += c;
    }
    if (cur || row.length) { row.push(cur); rows.push(row); }
    return rows.filter((r) => r.some((x) => x.trim()));
  }
  const CSV_HEAD = ["subject", "topic", "exams", "year", "level", "q_en", "q_te", "o1_en", "o2_en", "o3_en", "o4_en", "o1_te", "o2_te", "o3_te", "o4_te", "ans", "exp_en", "exp_te", "video", "img"];

  P.import = (el) => {
    el.innerHTML = `<div class="two">
<div class="card"><h3 style="margin-top:0">📄 Paste model-paper text</h3>
<p class="small muted">Paste from your Word file (Unicode Telugu). Text copied out of a PDF made with legacy Telugu fonts comes out garbled – use the Word source or OCR instead.</p>
<textarea id="pt" style="min-height:220px" placeholder="1. Ginger and turmeric propagate naturally through:&#10;అల్లం మరియు పసుపు …?&#10;A) Tubers / దుంపలు&#10;B) Rhizomes / భూగర్భ కాండాలు&#10;C) Bulbs / కాండాలు&#10;D) Runners / నేలపై పాకే కాండాలు">${esc(S.get("t_import_text", ""))}</textarea>
<label>Answer key (e.g. 1-B 2-C 3-D 4-B)</label><input id="pk">
<div class="row"><div style="flex:2"><label>Subject</label><select id="ps">${SUBS.map((s) => `<option value="${s.id}">${esc(s.name.en)}</option>`).join("")}</select></div>
<div style="flex:2"><label>Topic</label><input id="pto"></div></div>
<label>Exams</label><div id="pe">${EXAMS.map((x) => `<label class="chk"><input type="checkbox" value="${x.id}">${esc(x.name.en)}</label>`).join("")}</div>
<div class="row"><label class="chk"><input type="checkbox" id="mkp"> Also create a Model Paper – Set</label><input id="pset" value="A" style="width:60px"><input id="ptitle" placeholder="Paper title" style="flex:1"></div>
<div class="row" style="margin-top:10px"><button class="btn alt sm" id="pp">Preview</button><span class="sp"></span><button class="btn ok" id="pi">Import</button></div>
<div id="pres"></div></div>
<div class="card"><h3 style="margin-top:0">📊 CSV / JSON import</h3>
<p class="small muted">CSV columns: <code>${CSV_HEAD.join(", ")}</code>. <b>exams</b> separated by <code>;</code>, <b>ans</b> = A/B/C/D (blank for conventional).</p>
<div class="row"><button class="btn alt sm" id="tpl">⬇ CSV template</button><label class="btn alt sm" style="margin:0">Choose CSV / JSON<input type="file" id="cf" accept=".csv,.json" hidden></label></div>
<div id="cres" class="small" style="margin-top:10px"></div></div></div>`;
    const prev = () => {
      const r = KJ.parsePaperText($("#pt").value, $("#pk").value);
      $("#pres").innerHTML = `<p class="small"><b>${r.length}</b> questions found · ${r.filter((x) => x.a == null).length} without answer key · ${r.filter((x) => x.o.en.length !== 4).length} not having 4 options</p>` +
        r.slice(0, 40).map((x) => `<div class="small" style="border-top:1px solid var(--line);padding:4px 0"><b>${x.no}.</b> ${esc(x.q.en)} <span class="t-te" style="display:inline">${esc(x.q.te)}</span><br>${x.o.en.map((o, i) => `<span class="${i === x.a ? "pill acc" : "pill"}">${KJ.LETTERS[i]}) ${esc(o)}${x.o.te[i] ? " / " + esc(x.o.te[i]) : ""}</span>`).join(" ")}</div>`).join("");
      return r;
    };
    $("#pp").onclick = prev;
    $("#pt").oninput = () => S.set("t_import_text", $("#pt").value);
    $("#pi").onclick = () => {
      const r = prev(); if (!r.length) return KJ.toast("Nothing to import");
      if (r.some((x) => x.a == null) && !KJ.confirm("Some questions have no answer in the key – they will default to A. Continue?")) return;
      const sid = $("#ps").value, ex = $$("#pe input:checked").map((x) => x.value), ids = [];
      r.forEach((x) => {
        const id = nextId(sid);
        bank(sid).push({ id, type: "mcq", subject: sid, topic: $("#pto").value.trim(), exams: ex, year: "", level: "easy", q: x.q,
          o: { en: x.o.en, te: x.o.te }, a: x.a == null ? 0 : x.a, e: { en: "", te: "" }, img: "", video: "" });
        ids.push(id);
      });
      markDirty(bankPath(sid));
      if ($("#mkp").checked) {
        const papers = W["data/papers.json"]; const pid = "KJ-MP-" + String(papers.length + 1).padStart(3, "0");
        papers.push({ id: pid, set: $("#pset").value.trim() || "A", title: { en: $("#ptitle").value.trim() || "Model Paper " + (papers.length + 1), te: "" },
          date: KJ.today(), duration_min: ids.length, mark: 1, negative: 0.25, visible: false, qids: ids });
        bank(sid).forEach((q) => ids.includes(q.id) && (q.paper = pid));
        markDirty("data/papers.json");
      }
      S.del("t_import_text");
      KJ.toast("Imported " + ids.length + " questions"); tab = "bank"; S.set("t_bsub", sid); draw();
    };
    $("#tpl").onclick = () => download("kj_questions_template.csv", "\ufeff" + CSV_HEAD.join(",") + "\npolity,Fundamental Rights,appsc_g2;group4,,easy,\"Article 21 deals with:\",\"ఆర్టికల్ 21 దేనికి సంబంధించినది?\",Equality,Life and personal liberty,Religion,Remedies,సమానత్వం,ప్రాణం & వ్యక్తిగత స్వేచ్ఛ,మతం,పరిహారాలు,B,,,,\n", "text/csv");
    $("#cf").onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      const text = (await f.text()).replace(/^\ufeff/, "");
      let items = [];
      try {
        if (f.name.endsWith(".json")) items = JSON.parse(text);
        else {
          const rows = parseCSV(text), h = rows.shift().map((x) => x.trim().toLowerCase());
          const g = (r, k) => (r[h.indexOf(k)] || "").trim();
          items = rows.map((r) => {
            const ans = g(r, "ans").toUpperCase();
            const it = { subject: g(r, "subject"), topic: g(r, "topic"), exams: g(r, "exams").split(";").map((x) => x.trim()).filter(Boolean), year: g(r, "year"), level: g(r, "level") || "easy",
              q: { en: g(r, "q_en"), te: g(r, "q_te") }, e: { en: g(r, "exp_en"), te: g(r, "exp_te") }, video: g(r, "video"), img: g(r, "img") };
            if (ans) { it.type = "mcq"; it.a = "ABCD".indexOf(ans); it.o = { en: [1, 2, 3, 4].map((i) => g(r, "o" + i + "_en")), te: [1, 2, 3, 4].map((i) => g(r, "o" + i + "_te")) }; }
            else it.type = "conv";
            return it;
          });
        }
      } catch (err) { $("#cres").textContent = "✖ " + err.message; return; }
      let ok = 0, bad = [];
      items.forEach((it, i) => {
        if (!SUBS.find((s) => s.id === it.subject)) return bad.push("row " + (i + 2) + ": unknown subject '" + it.subject + "'");
        if (it.type === "mcq" && !(it.a >= 0)) return bad.push("row " + (i + 2) + ": bad answer");
        it.id = it.id && !allQs().some((q) => q.id === it.id) ? it.id : nextId(it.subject);
        it.img = it.img || ""; it.video = it.video || ""; it.e = it.e || { en: "", te: "" };
        bank(it.subject).push(it); markDirty(bankPath(it.subject)); ok++;
      });
      $("#cres").innerHTML = `✔ Imported ${ok}` + (bad.length ? `<br>✖ Skipped ${bad.length}:<br>${bad.map(esc).join("<br>")}` : "");
      pill();
    };
  };

  /* ---------- Model papers ---------- */
  P.papers = (el) => {
    const papers = W["data/papers.json"];
    const map = new Map(allQs().map((q) => [q.id, q]));
    el.innerHTML = `<div class="card"><div class="row"><h3 style="margin:0">📄 Model Papers</h3><span class="sp"></span><button class="btn sm" id="np">➕ New paper</button></div>
<p class="small muted">Students see only papers switched <b>Visible</b>. Printing uses the KONCEPT JUNCTION layout (Set box, watermark logo, contact footer).</p></div>
${papers.map((p, k) => `<div class="card"><div class="row"><b>${esc(p.id)}</b><span class="sp"></span><label class="chk"><input type="checkbox" data-vis="${k}" ${p.visible !== false ? "checked" : ""}>Visible</label></div>
<div class="row"><div style="flex:2"><label>Title (English)</label><input data-k="${k}" data-f="title.en" value="${esc(p.title.en || "")}"></div><div style="flex:2"><label>Title (తెలుగు)</label><input data-k="${k}" data-f="title.te" value="${esc(p.title.te || "")}"></div>
<div style="flex:.6"><label>Set</label><input data-k="${k}" data-f="set" value="${esc(p.set || "")}"></div></div>
<div class="row"><div style="flex:1"><label>Minutes</label><input type="number" data-k="${k}" data-f="duration_min" value="${p.duration_min}"></div><div style="flex:1"><label>Mark</label><input type="number" step="0.25" data-k="${k}" data-f="mark" value="${p.mark}"></div>
<div style="flex:1"><label>Negative fraction</label><input type="number" step="0.01" data-k="${k}" data-f="negative" value="${p.negative}"></div><div style="flex:1"><label>Date</label><input type="date" data-k="${k}" data-f="date" value="${esc(p.date || "")}"></div></div>
<label>Question IDs in order (comma separated) – ${p.qids.length} Qs, ${p.qids.filter((id) => !map.has(id)).length} missing</label><textarea data-k="${k}" data-f="qids">${esc(p.qids.join(", "))}</textarea>
<div class="row" style="margin-top:8px"><button class="btn alt sm" data-pr="${k}">🖨 Question paper</button><button class="btn alt sm" data-prk="${k}">🖨 With answer key</button><button class="btn alt sm" data-word="${k}">⬇ Word</button><span class="sp"></span><button class="btn bad sm" data-del="${k}">Delete</button></div></div>`).join("")}`;
    $("#np").onclick = () => { papers.push({ id: "KJ-MP-" + String(papers.length + 1).padStart(3, "0"), set: "A", title: { en: "New Model Paper", te: "" }, date: KJ.today(), duration_min: 30, mark: 1, negative: 0.25, visible: false, qids: [] }); markDirty("data/papers.json"); draw(); };
    el.onchange = (e) => {
      const t = e.target;
      if (t.dataset.vis != null) { papers[+t.dataset.vis].visible = t.checked; markDirty("data/papers.json"); return; }
      if (t.dataset.k == null) return;
      const p = papers[+t.dataset.k], f = t.dataset.f;
      if (f === "qids") p.qids = t.value.split(/[\s,]+/).filter(Boolean);
      else if (f.startsWith("title.")) p.title[f.split(".")[1]] = t.value;
      else p[f] = t.type === "number" ? +t.value : t.value;
      markDirty("data/papers.json");
    };
    el.onclick = (e) => {
      const b = e.target.closest("[data-pr],[data-prk],[data-word],[data-del]"); if (!b) return;
      const k = +(b.dataset.pr ?? b.dataset.prk ?? b.dataset.word ?? b.dataset.del), p = papers[k];
      const qs = p.qids.map((id) => map.get(id)).filter(Boolean);
      if (b.dataset.del != null) { if (KJ.confirm("Delete paper " + p.id + "? (questions stay in the bank)")) { papers.splice(k, 1); markDirty("data/papers.json"); draw(); } return; }
      if (b.dataset.word != null) return exportWord(p.title.en + " – Set " + p.set, qs, true);
      KJ.printPaper({ title: p.title.en, set: p.set, questions: qs, showKey: b.dataset.prk != null, lang: "bi" });
    };
  };

  /* ---------- Notes & concepts ---------- */
  P.notes = (el) => {
    const notes = W["data/notes.json"];
    el.innerHTML = `<div class="two3"><div class="card"><h3 style="margin-top:0">📒 Notes / 💡 Concepts PDFs</h3>
${notes.length ? `<table class="t"><tr><th>Title</th><th>Subject</th><th>Type</th><th>Visible</th><th></th></tr>${notes.map((n, k) => `<tr><td>${esc(n.title.en || n.title.te)}<div class="tag">${esc(n.date || "")}</div></td><td>${esc(subName(n.subject))}</td><td>${esc(n.type)}</td>
<td><input type="checkbox" style="width:auto" data-vis="${k}" ${n.visible !== false ? "checked" : ""}></td><td><a href="${esc(n.url)}" target="_blank">open</a> <button class="btn alt sm" data-del="${k}">🗑</button></td></tr>`).join("")}</table>` : '<div class="empty">No PDFs yet</div>'}</div>
<div class="card"><h3 style="margin-top:0">➕ Add PDF</h3>
<label>Type</label><select id="nt"><option value="notes">${esc(C.NOTES_BRAND)}</option><option value="concepts">${esc(C.CONCEPTS_BRAND)}</option></select>
<label>Subject</label><select id="ns">${SUBS.map((s) => `<option value="${s.id}">${esc(s.name.en)}</option>`).join("")}</select>
<label>Title (English)</label><input id="ne"><label>Title (తెలుగు)</label><input id="nte">
<label>PDF URL (or upload)</label><input id="nu"><label class="btn alt sm" style="margin-top:6px">⬆ Upload PDF to Cloudinary<input type="file" id="nf" accept="application/pdf" hidden></label>
<div class="small muted" id="nst"></div>
<div class="row" style="margin-top:10px"><span class="sp"></span><button class="btn ok" id="na">Add</button></div></div></div>`;
    $("#nf").onchange = async (e) => { const f = e.target.files[0]; if (!f) return;
      try { $("#nu").value = await cloudUpload(f, "pdfs", (p) => ($("#nst").textContent = "Uploading " + p + "%")); $("#nst").textContent = "✔ Uploaded"; if (!$("#ne").value) $("#ne").value = f.name.replace(/\.pdf$/i, ""); }
      catch (err) { $("#nst").textContent = "✖ " + err.message; } };
    $("#na").onclick = () => {
      if (!$("#nu").value.trim()) return KJ.toast("PDF URL needed");
      notes.push({ id: KJ.uid("n"), type: $("#nt").value, subject: $("#ns").value, title: { en: $("#ne").value.trim(), te: $("#nte").value.trim() }, url: $("#nu").value.trim(), date: KJ.today(), visible: true });
      markDirty("data/notes.json"); draw();
    };
    el.onchange = (e) => { const k = e.target.dataset.vis; if (k != null) { notes[+k].visible = e.target.checked; markDirty("data/notes.json"); } };
    el.onclick = (e) => { const d = e.target.closest("[data-del]"); if (d && KJ.confirm("Remove this PDF from the app?")) { notes.splice(+d.dataset.del, 1); markDirty("data/notes.json"); draw(); } };
  };

  /* ---------- simple bilingual lists (current affairs, announcements) ---------- */
  function listEditor(el, path, title, extra) {
    const list = W[path];
    el.innerHTML = `<div class="two3"><div class="card"><h3 style="margin-top:0">${title}</h3>
${list.slice().map((x, k) => ({ x, k })).sort((a, b) => String(b.x.date).localeCompare(a.x.date)).map(({ x, k }) => `<div class="qlist"><div class="qi"><span class="q"><b>${esc(x.title.en || x.title.te)}</b><div class="tag">${esc(x.date)}${x.pin ? " · 📌" : ""}${(x.tags || []).length ? " · " + esc(x.tags.join(", ")) : ""}</div></span><button class="btn alt sm" data-del="${k}">🗑</button></div></div>`).join("") || '<div class="empty">Nothing yet</div>'}</div>
<div class="card"><h3 style="margin-top:0">➕ Add</h3><label>Date</label><input type="date" id="ld" value="${KJ.today()}">
<label>Title (English)</label><input id="lte"><label>Title (తెలుగు)</label><input id="ltt">
<label>Details (English)</label><textarea id="lbe"></textarea><label>వివరాలు (తెలుగు)</label><textarea id="lbt"></textarea>${extra}
<div class="row" style="margin-top:10px"><span class="sp"></span><button class="btn ok" id="la">Add</button></div></div></div>`;
    $("#la").onclick = () => {
      const o = { id: KJ.uid("i"), date: $("#ld").value, title: { en: $("#lte").value.trim(), te: $("#ltt").value.trim() }, body: { en: $("#lbe").value.trim(), te: $("#lbt").value.trim() } };
      if (!o.title.en && !o.title.te) return KJ.toast("Title needed");
      if ($("#ltag")) o.tags = $("#ltag").value.split(",").map((x) => x.trim()).filter(Boolean);
      if ($("#lpin")) { o.pin = $("#lpin").checked; o.link = $("#llink").value.trim(); }
      list.push(o); markDirty(path); draw();
    };
    el.onclick = (e) => { const d = e.target.closest("[data-del]"); if (d && KJ.confirm("Delete?")) { list.splice(+d.dataset.del, 1); markDirty(path); draw(); } };
  }
  P.ca = (el) => listEditor(el, "data/current_affairs.json", "📰 Current Affairs", '<label>Tags (comma separated)</label><input id="ltag" placeholder="AP, Schemes, Awards">');
  P.ann = (el) => listEditor(el, "data/announcements.json", "📢 Announcements / Exam calendar", '<label>Link (notification URL)</label><input id="llink"><label class="chk" style="margin-top:8px"><input type="checkbox" id="lpin">Pin to top</label>');

  /* ---------- Exams (pattern editor) ---------- */
  P.exams = (el) => {
    el.innerHTML = `<div class="card"><h3 style="margin-top:0">🎯 Exam patterns</h3>
<p class="small muted">Each exam: <code>duration_min</code>, <code>mark</code>, <code>negative</code> (fraction of a mark cut per wrong, e.g. 0.3333 = 1/3) and <code>sections</code> (subject id + number of questions). Subject ids: ${SUBS.map((s) => "<code>" + s.id + "</code>").join(" ")}</p>
<textarea id="ej" style="min-height:420px;font:12.5px ui-monospace,Consolas,monospace">${esc(JSON.stringify(EXAMS, null, 2))}</textarea>
<div class="row" style="margin-top:8px"><span class="small" id="eres"></span><span class="sp"></span><button class="btn ok" id="es">Validate & save</button></div></div>`;
    $("#es").onclick = () => {
      try {
        const j = JSON.parse($("#ej").value);
        if (!Array.isArray(j)) throw new Error("must be a list [ … ]");
        j.forEach((x, i) => {
          if (!x.id || !x.name || !Array.isArray(x.sections)) throw new Error("exam #" + (i + 1) + " needs id, name, sections");
          x.sections.forEach((s) => { if (!SUBS.find((u) => u.id === s.subject)) throw new Error(x.id + ": unknown subject " + s.subject); });
        });
        W["data/exams.json"] = EXAMS = j; markDirty("data/exams.json"); $("#eres").textContent = "✔ Saved (" + j.length + " exams)";
      } catch (err) { $("#eres").textContent = "✖ " + err.message; }
    };
  };

  /* ---------- Export ---------- */
  function exportWord(title, qs, withKey) {
    const body = qs.map((q, n) => `<p><b>${n + 1}. ${esc(q.q.en)}</b><br><span style="font-family:'Nirmala UI','Gautami'">${esc(q.q.te || "")}</span></p>` +
      (q.type === "conv" ? "" : (q.o.en || []).map((o, i) => `<p style="margin:0 0 0 18px">${KJ.LETTERS[i]}) ${esc(o)}${q.o.te?.[i] ? " / " + esc(q.o.te[i]) : ""}</p>`).join("")) +
      (withKey ? `<p style="color:#1f6f3f"><b>Ans: ${q.type === "conv" ? "—" : KJ.LETTERS[q.a]}</b> ${esc(q.e?.en || "")} ${esc(q.e?.te || "")}</p>` : "") + "<hr>").join("");
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(title)}</title></head>
<body style="font-family:'Times New Roman'"><h1 style="text-align:center;margin:0">${esc(C.APP_NAME)}</h1><p style="text-align:center;margin:0">${esc(C.MOTTO || "")}</p><p style="text-align:center">${esc(title)}</p><hr>${body}
<p style="font-size:9pt">[${esc(C.APP_NAME)}] [CONTACT: ${esc(C.CONTACT_PHONE || "")}]</p></body></html>`;
    download(title.replace(/[^\w\- ]+/g, "_") + ".doc", "\ufeff" + html, "application/msword");
  }
  P.export = (el) => {
    el.innerHTML = `<div class="card"><h3 style="margin-top:0">📤 Export question bank</h3>
<label>Subjects</label>${SUBS.map((s) => `<label class="chk"><input type="checkbox" value="${s.id}" checked>${esc(s.name.en)} (${bank(s.id).length})</label>`).join("")}
<div class="row" style="margin-top:10px"><label class="chk"><input type="checkbox" id="xk" checked>Include answers & explanations</label><span class="sp"></span>
<button class="btn alt sm" id="xw">⬇ Word (.doc)</button><button class="btn alt sm" id="xp">🖨 PDF (print)</button><button class="btn alt sm" id="xj">⬇ JSON backup</button></div></div>`;
    const pick = () => $$("input[type=checkbox][value]", el).filter((x) => x.checked).flatMap((x) => bank(x.value));
    $("#xw").onclick = () => exportWord("Question Bank " + KJ.today(), pick(), $("#xk").checked);
    $("#xp").onclick = () => KJ.printPaper({ title: "Question Bank " + KJ.today(), questions: pick(), showKey: $("#xk").checked, lang: "bi" });
    $("#xj").onclick = () => download("kj_backup_" + KJ.today() + ".json", JSON.stringify(W, null, 1), "application/json");
  };

  /* ---------- Publish (GitHub Contents API) ---------- */
  const b64 = (s) => { const u = new TextEncoder().encode(s); let bin = ""; for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(bin); };
  async function gh(path, method = "GET", body) {
    const G = cfg();
    const url = `https://api.github.com/repos/${G.owner}/${G.repo}/contents/${G.prefix}${path}` + (method === "GET" ? `?ref=${encodeURIComponent(G.branch)}&t=${Date.now()}` : "");
    const r = await fetch(url, { method, headers: { Authorization: "Bearer " + pat(), Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, j };
  }
  P.publish = (el) => {
    const G = cfg();
    const sizes = Object.keys(W).map((p) => ({ p, n: Array.isArray(W[p]) ? W[p].length : 0, kb: (new Blob([JSON.stringify(W[p])]).size / 1024).toFixed(1) }));
    el.innerHTML = `<div class="two"><div class="card"><h3 style="margin-top:0">🚀 Publish to GitHub</h3>
<p class="small">Repo: <b>${esc(G.owner)}/${esc(G.repo)}</b> · branch <b>${esc(G.branch)}</b>${G.prefix ? " · folder <b>" + esc(G.prefix) + "</b>" : ""} · token ${pat() ? "✔ set" : '<b style="color:var(--bad)">missing – add in Settings</b>'}</p>
${dirty.size ? `<ul>${[...dirty].map((p) => `<li class="dirty">${esc(p)}</li>`).join("")}</ul>` : '<p class="muted">No unpublished changes.</p>'}
<div class="row"><button class="btn acc" id="pub" ${dirty.size ? "" : "disabled"}>Publish ${dirty.size} file(s)</button><button class="btn alt sm" id="zip" ${dirty.size ? "" : "disabled"}>⬇ Download as ZIP (manual upload)</button>
<span class="sp"></span><button class="btn alt sm" id="disc" ${dirty.size ? "" : "disabled"}>Discard changes</button></div>
<div class="log" id="plog" style="margin-top:10px">Ready.</div>
<p class="small muted">Students see updates after GitHub Pages rebuilds (usually 1–3 minutes) and they reopen the app.</p></div>
<div class="card"><h3 style="margin-top:0">🗄 Storage report</h3><table class="t"><tr><th>File</th><th>Items</th><th>KB</th></tr>
${sizes.map((s) => `<tr><td class="${dirty.has(s.p) ? "dirty" : ""}">${esc(s.p)}</td><td>${s.n}</td><td>${s.kb}</td></tr>`).join("")}</table>
<p class="small muted">Media (images, videos, PDFs) live in Cloudinary, so the repo stays small.</p></div></div>`;
    const log = (m) => { $("#plog").textContent += "\n" + m; $("#plog").scrollTop = 1e9; };
    $("#pub").onclick = async () => {
      if (!pat()) return KJ.toast("Add your GitHub token in Settings first");
      $("#pub").disabled = true;
      for (const p of [...dirty]) {
        try {
          log("→ " + p);
          const cur = await gh(p);
          if (!cur.ok && cur.status !== 404) throw new Error(cur.status + " " + (cur.j.message || ""));
          const put = await gh(p, "PUT", { message: "KJ Teacher Upload: " + p + " (" + new Date().toLocaleString() + ")", content: b64(JSON.stringify(W[p], null, 1)), branch: G.branch, ...(cur.ok ? { sha: cur.j.sha } : {}) });
          if (!put.ok) throw new Error(put.status + " " + (put.j.message || ""));
          clearDirty(p); log("  ✔ published");
        } catch (err) {
          log("  ✖ " + err.message + (/401|Bad credentials/.test(err.message) ? "  → token wrong/expired (Settings)" : /403|404/.test(err.message) ? "  → check repo name & token permission: Contents = Read and write" : ""));
        }
      }
      log(dirty.size ? "Finished with errors." : "All done ✔");
      setTimeout(draw, 1500);
    };
    $("#zip").onclick = async () => {
      await loadScript("https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js");
      const z = new window.JSZip(); [...dirty].forEach((p) => z.file(p, JSON.stringify(W[p], null, 1)));
      const blob = await z.generateAsync({ type: "blob" });
      download("kj_changed_files_" + KJ.today() + ".zip", blob);
    };
    $("#disc").onclick = async () => { if (!KJ.confirm("Discard all unpublished changes on this device?")) return; [...dirty].forEach(clearDirty); await boot(); };
  };

  /* ---------- Settings ---------- */
  P.settings = (el) => {
    const G = cfg();
    el.innerHTML = `<div class="two"><div class="card"><h3 style="margin-top:0">🐙 GitHub</h3>
<label>Owner (user name)</label><input id="so" value="${esc(G.owner)}"><label>Repository</label><input id="sr" value="${esc(G.repo)}">
<div class="row"><div style="flex:1"><label>Branch</label><input id="sb" value="${esc(G.branch)}"></div><div style="flex:1"><label>Folder prefix (blank = root)</label><input id="sp" value="${esc(G.prefix)}"></div></div>
<label>Fine-grained token (only this repo · Contents: Read and write)</label><input id="st" type="password" value="${esc(pat())}" placeholder="github_pat_…">
<p class="small muted">Stored only in this browser. Never paste it into config.js or any file in the repo.</p>
<div class="row"><button class="btn alt sm" id="tt">Test connection</button><span class="small" id="tr"></span></div></div>
<div class="card"><h3 style="margin-top:0">☁️ Cloudinary</h3>
<label>Cloud name</label><input id="cc" value="${esc(G.cloud)}"><label>Unsigned upload preset</label><input id="cp" value="${esc(G.preset)}"><label>Folder</label><input id="cfo" value="${esc(G.folder)}">
<p class="small muted">Cloudinary → Settings → Upload → Add upload preset → Signing mode <b>Unsigned</b>. For PDFs also enable <b>Allow delivery of PDF and ZIP files</b> (Settings → Security).</p>
<div class="row"><label class="btn alt sm" style="margin:0">Test upload (small image)<input type="file" id="ct" accept="image/*" hidden></label><span class="small" id="cr"></span></div></div></div>
<div class="row"><span class="sp"></span><button class="btn ok" id="ss">Save settings</button></div>
<div class="card small" style="margin-top:12px"><b>Lock</b>: to change Setup Code / PIN, open <code>tools/hash_tool.html</code>, make new hashes and paste into <code>config.js → TEACHER_LOCK</code>, then upload config.js.
<div class="row" style="margin-top:6px"><button class="btn alt sm" id="lo">🔒 Lock now</button></div></div>`;
    const saveS = () => { S.set("t_settings", { owner: $("#so").value.trim(), repo: $("#sr").value.trim(), branch: $("#sb").value.trim() || "main", prefix: $("#sp").value.trim(), cloud: $("#cc").value.trim(), preset: $("#cp").value.trim(), folder: $("#cfo").value.trim() }); S.set("t_pat", $("#st").value.trim()); };
    $("#ss").onclick = () => { saveS(); KJ.toast("Settings saved on this device"); };
    $("#tt").onclick = async () => {
      saveS(); $("#tr").textContent = "Checking…";
      const r = await gh("data/subjects.json");
      $("#tr").textContent = r.ok ? "✔ Connected – can read data/subjects.json" : "✖ " + r.status + " " + (r.j.message || "");
    };
    $("#ct").onchange = async (e) => { saveS(); const f = e.target.files[0]; if (!f) return; $("#cr").textContent = "Uploading…";
      try { const u = await cloudUpload(f, "test"); $("#cr").innerHTML = '✔ <a target="_blank" href="' + esc(u) + '">uploaded</a>'; } catch (err) { $("#cr").textContent = "✖ " + err.message; } };
    $("#lo").onclick = () => { sessionStorage.removeItem("kj_t_ok"); lock(); };
  };

  /* ---------------- utilities ---------------- */
  function cloudUpload(file, kind, onProg) {
    const G = cfg();
    if (!G.cloud || G.cloud.startsWith("YOUR_")) return Promise.reject(new Error("Set Cloudinary cloud name & preset in Settings"));
    return new Promise((res, rej) => {
      const fd = new FormData(); fd.append("file", file); fd.append("upload_preset", G.preset); fd.append("folder", G.folder + "/" + kind);
      const x = new XMLHttpRequest();
      x.open("POST", `https://api.cloudinary.com/v1_1/${encodeURIComponent(G.cloud)}/auto/upload`);
      x.upload.onprogress = (e) => e.lengthComputable && onProg && onProg(Math.round((e.loaded / e.total) * 100));
      x.onload = () => { let j = {}; try { j = JSON.parse(x.responseText); } catch (e) {} x.status < 300 && j.secure_url ? res(j.secure_url) : rej(new Error(j.error?.message || "HTTP " + x.status)); };
      x.onerror = () => rej(new Error("network error"));
      x.send(fd);
    });
  }
  function loadScript(src) {
    return new Promise((res, rej) => { if ($(`script[src="${src}"]`)) return res(); const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("could not load " + src)); document.head.appendChild(s); });
  }
  function download(name, data, type) {
    const blob = data instanceof Blob ? data : new Blob([data], { type: type || "application/octet-stream" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  document.addEventListener("DOMContentLoaded", () => {
    S.set("lang", S.get("lang", "bi"));
    sessionStorage.getItem("kj_t_ok") ? boot() : lock();
  });
})();
