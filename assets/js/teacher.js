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
      cloud: s.cloud || C.CLOUDINARY.cloud_name, preset: s.preset || C.CLOUDINARY.upload_preset, folder: s.folder || C.CLOUDINARY.folder,
      sheet: s.sheet || (C.SHEET && C.SHEET.webapp_url) || ""
    };
  };
  const pat = () => S.get("t_pat", "");

  /* ---------------- working copy ---------------- */
  const W = {};                       // path -> data
  let dirty = new Set(S.get("t_dirtylist", []));
  let SUBS = [], EXAMS = [];
  const FIXED = ["data/exams.json", "data/papers.json", "data/notes.json", "data/current_affairs.json", "data/announcements.json", "data/subjects.json"];
  function markDirty(path) {
    dirty.add(path); S.set("t_dirtylist", [...dirty]);
    let saved = false; try { localStorage.setItem("kj_t_work_" + path, JSON.stringify(W[path])); saved = true; } catch (e) {}
    if (!saved && !markDirty._warned) { markDirty._warned = true; KJ.toast("Big change – too large to keep in this browser. Press 🚀 Publish before closing this tab.", 6000); }
    pill();
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
    /* V2 fix: handler must not return false – that blocked every key in the PIN box */
    ["#lc", "#lp"].forEach((id) => { const f = $(id); if (f) f.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); go(); } }); });
    if ($("#lr")) $("#lr").onclick = (e) => { e.preventDefault(); S.del("t_device_ok"); lock(); };
  }

  /* ================= MAIN ================= */
  const TABS = [["add", "➕ Add / Edit"], ["students", "👥 Students"], ["bank", "📚 Question Bank"], ["import", "📥 Bulk Import"], ["papers", "🎯 Topic Tests"],
    ["notes", "📒 Notes & Concepts"], ["ca", "📰 Current Affairs"], ["ann", "📢 Announcements"], ["exams", "📋 Exam Patterns"],
    ["export", "📤 Export"], ["publish", "🚀 Publish"], ["settings", "⚙️ Settings"]];
  let tab = "add", editing = null;

  async function boot() {
    root().innerHTML = '<div class="empty">Loading data…</div>';
    try { await loadAll(); } catch (e) { root().innerHTML = `<div class="card">Could not load data: ${esc(e.message)}</div>`; return; }
    draw();
  }
  function draw() {
    /* V5: header ⚙️ Settings button + reminder when GitHub / Cloudinary are not set yet */
    const hb = $("#hdrSet"); hb.style.display = ""; hb.onclick = () => { tab = "settings"; editing = null; draw(); };
    const G = cfg(), miss = [];
    if (!pat()) miss.push("GitHub token");
    if (!G.owner || G.owner.startsWith("YOUR_")) miss.push("GitHub user");
    /* V13: Cloudinary is optional now – uploads go to GitHub when it is not set */
    const bar = miss.length && tab !== "settings" ? `<div class="setbar">⚙️ Not set yet: <b>${miss.join(", ")}</b><span class="sp"></span><button class="btn acc sm" id="goSet">Open Settings</button></div>` : "";
    root().innerHTML = bar + `<div class="tabs">${TABS.map(([k, n]) => `<button data-tab="${k}" class="${k === tab ? "on" : ""}">${n}${k === "publish" && dirty.size ? " (" + dirty.size + ")" : ""}</button>`).join("")}</div><div id="tp"></div>`;
    if ($("#goSet")) $("#goSet").onclick = () => { tab = "settings"; draw(); };
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
<p class="small muted" style="margin:4px 0 0">📋 <b>Match the following:</b> put each table row on its own line with <code> | </code> between the two columns – e.g. <code>List-I: Revolution | List-II: Product</code>, <code>a) Green Revolution | i) Fish production</code> – and the same rows in the Telugu box. Students see a table.</p>
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
      $("#pv").innerHTML = `<div class="qtext">${KJ.qHtml(o.q, "bi")}</div>${o.img ? `<img class="qimg" src="${esc(o.img)}">` : ""}
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
        await loadScript(TESS_URL);
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
  const isTe = (s) => /[ఀ-౿]/.test(s);
  /* V7: splits one line into English / Telugu parts.
     "English / తెలుగు"  ·  "English text తెలుగు text"  ·  pure Telugu  ·  pure English */
  function splitEnTe(t) {
    t = t.trim();
    if (!isTe(t)) return { en: t, te: "" };
    const sl = t.split(/\s+\/\s+|\s\/(?=\s*[ఀ-౿])|\/\s(?=[ఀ-౿])/);
    if (sl.length > 1 && !isTe(sl[0])) return { en: sl[0].trim(), te: sl.slice(1).join(" / ").trim() };
    const m = t.match(/^([^ఀ-౿]*?)\s+([ఀ-౿“"‘'(].*)$/);
    if (m && (m[1].match(/[A-Za-z]/g) || []).length >= 8) return { en: m[1].trim(), te: m[2].trim() };
    return { en: "", te: t };
  }
  /* V13: a two-column table row of a "Match List-I with List-II" question, e.g.
       a) Green Revolution / హరిత విప్లవం   i) Fish production / చేపల ఉత్పత్తి
       List-I (Coast) / జాబితా-I (తీరం)     List-II (State) / జాబితా-II (రాష్ట్రం)
     → English line  "a) Green Revolution  |  i) Fish production"
       Telugu line   "a) హరిత విప్లవం  |  i) చేపల ఉత్పత్తి"
     Row markers are renumbered in order (OCR often reads i/ii as 1/11, d as 1). */
  const ROMAN = ["i", "ii", "iii", "iv", "v", "vi"];
  function splitTableRow(l, cur) {
    const m = l.match(/^(.*?[A-Za-z].*?)\s\/\s([\u0C00-\u0C7F][^A-Za-z]*?)\s+([\[|(]?(?:List\b|[0-9A-Za-z\u0C66-\u0C6F]{1,4}[.):]).*?\s\/\s.+)$/);
    if (!m) return null;
    const right = m[3].match(/^(.*?)\s\/\s(.+)$/);
    if (!right) return null;
    const mk = /^[\[|(]?\s*([0-9A-Za-z\u0C66-\u0C6F]{1,4})\s*[.):]\s*/;
    const edge = (x) => x.replace(/^[\s|\[\]'"`]+|[\s|\[\]'"`]+$/g, "");
    let lEn = edge(m[1]), lTe = edge(m[2]), rEn = edge(right[1]), rTe = edge(right[2]);
    if (/^List\b/i.test(lEn) || /^[\[|(]?List\b/i.test(rEn)) {              // header row
      const fix = (s, n) => s.replace(/(List|జాబితా)\s*[-–]?\s*[0-9Il!|\]]*/i, (a, w) => w + "-" + n);
      cur.tbl = { rows: 0 };
      return { en: fix(lEn, "I") + "   |   " + fix(rEn.replace(/^[\[|(]\s*/, ""), "II"), te: fix(lTe, "I") + "   |   " + fix(rTe, "II") };
    }
    const lm = lEn.match(mk), rm = rEn.match(mk);
    if (!lm || !rm) return null;
    const t = (cur.tbl = cur.tbl || { rows: 0 }), k = t.rows++;
    if (k === 0) { t.lNum = /^\d/.test(lm[1]); t.lUp = /^[A-Z]$/.test(lm[1]); t.rLet = /^[A-D]$/.test(rm[1]) || (t.lNum && /^[a-dA-DpP]$/.test(rm[1])); }
    const L = t.lNum ? (k + 1) + "." : (t.lUp ? "ABCDEF" : "abcdef")[k] + ")";
    const R = t.rLet ? "ABCDEF"[k] + "." : ROMAN[k] + ")";
    lEn = lEn.replace(mk, ""); rEn = rEn.replace(mk, "");
    return { en: `${L} ${lEn}   |   ${R} ${rEn}`, te: `${L} ${lTe}   |   ${R} ${rTe}` };
  }
  /* Model-paper text (Word paste or PDF read):
       1. English question …            ← a new question only when the number is the next one (1, 2, 3 …)
       తెలుగు ప్రశ్న …                     so statement lists "1. … 2. …" inside a question stay inside it
       A) English / తెలుగు   or  (A) …  or  (1) …
       B) English            (Telugu may also come on the next line)
     Answer key:  1-B 2-C 3-D   or  1) B   or  1-2 (option number)  */
  KJ.parsePaperText = function (txt, keyTxt) {
    const key = {};
    (keyTxt || "").replace(/(\d+)\s*[-:.)=]\s*\(?([A-Da-d1-4])\)?/g, (_, n, l) => (key[+n] = /\d/.test(l) ? +l - 1 : "ABCD".indexOf(l.toUpperCase())));
    const lines = txt.replace(/\r/g, "")
      .split("\n").flatMap((l) => (/^\s*\(?A\).*\(B\).*\(C\).*\(D\)/.test(l) ? l.split(/[ \t]+(?=\([B-D]\)\s)/) : [l]))  // "(A) In (B) On (C) At (D) By" → one per line
      .map((l) => l.trim()).filter(Boolean);
    const out = []; let cur = null, last = 0;
    const OPT = /^\(?([A-D])\s*\)(?!\s*:)\s*(.*)$/, NOPT = /^\(([1-4])\)(?!\s*:)\s*(.*)$/;   // "(A): statement" is not an option
    for (const l of lines) {
      const m = l.match(/^(\d{1,3})\s*[.)]\s*(.*)$/);
      if (m && +m[1] === last + 1 && (!cur || cur.o.en.length >= 2)) {
        cur = { no: +m[1], q: { en: [], te: [] }, o: { en: [], te: [] }, inOpt: false }; out.push(cur); last = +m[1];
        if (m[2]) { const p = splitEnTe(m[2]); p.en && cur.q.en.push(p.en); p.te && cur.q.te.push(p.te); }
        continue;
      }
      if (!cur) continue;
      let om = l.match(OPT) || l.match(NOPT);
      const nOpt = cur.o.en.length, exp = "ABCD"[cur.blk2 != null ? cur.blk2 : nOpt];
      if (om && cur.inOpt && exp) {                                       // letter read wrongly but in the option sequence
        const i0 = /\d/.test(om[1]) ? +om[1] - 1 : "ABCD".indexOf(om[1]);
        if (i0 !== "ABCD".indexOf(exp) && !(i0 === 0 && nOpt >= 2)) om = [l, exp, om[2]];
      }
      if (!om && cur.inOpt && exp && (/^\(\S\)\s/.test(l) || /^\(?[0O8]\s*\)/.test(l) || new RegExp("^\\(?" + exp + "[\\]}|Y.,:]\\s").test(l)))
        om = [l, exp, l.replace(/^\(?\S\S?\s*\)?\s*/, "")];              // OCR slips: "(9) …", "(౧) …", "0) …", "DY …" → expected letter
      if (om) {
        const idx = /\d/.test(om[1]) ? +om[1] - 1 : "ABCD".indexOf(om[1]);
        if (cur.inOpt && idx < nOpt && (idx === 0 || cur.blk2 === idx)) {  // 2nd list "A) తెలుగు … D) …" = Telugu of the same options
          const p2 = splitEnTe(om[2]); cur.o.te[idx] = p2.te || p2.en; cur.blk2 = idx + 1; continue;
        }
        cur.inOpt = true;
        const p = splitEnTe(om[2]);
        cur.o.en.push(p.en || p.te); cur.o.te.push(p.te);
        continue;
      }
      if (cur.inOpt && cur.blk2) { const k = cur.blk2 - 1; cur.o.te[k] = (cur.o.te[k] + " " + l).trim(); continue; }
      if (cur.inOpt && cur.o.en.length) {
        const k = cur.o.en.length - 1, p = splitEnTe(l);
        if (p.en) cur.o.en[k] = (cur.o.en[k] + " " + p.en).trim();
        if (p.te) cur.o.te[k] = (cur.o.te[k] ? cur.o.te[k] + " " : "") + p.te;
        continue;
      }
      const row = splitTableRow(l, cur);                  // V13: match-the-following rows
      if (row) { cur.q.en.push(row.en); cur.q.te.push(row.te); continue; }
      const p = splitEnTe(l);
      if (p.en) cur.q.en.push(p.en); if (p.te) cur.q.te.push(p.te);
    }
    return out.map((x) => ({ no: x.no, q: { en: x.q.en.join("\n"), te: x.q.te.join("\n") }, o: { en: x.o.en, te: x.o.te.map((t, i) => t || x.o.en[i]) }, a: key[x.no] != null ? key[x.no] : null }));
  };

  /* ---------- V7: read a PDF question paper into the paste box ----------
     • PDF with clean text (English-only papers)  → read the text directly (exact, fast)
     • PDF with Telugu (Word "Print to PDF" fonts give broken text) or scanned PDF → OCR English + Telugu */
  const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
  const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const TESS_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
  function cleanPaperText(t) {
    return t.replace(/‌(?=[\s\/,.?:)]|$)/gm, "")
      .split("\n").map((l) => l.replace(/\s+$/, ""))
      .filter((l) => !/KONCEPT\s*JUNCTION|DREAM\s*TO\s*ACHIEVE|^\s*(?:DREAM|KONCEPT|JUNCTION|ACHIEVE|JUN|CEPT)[A-Z ]{0,12}$|CONTACT\s*:|^\s*[_\-—=–.]{5,}\s*$|^\s*\[?\s*\]?\s*$/i.test(l))
      .map((l) => l.replace(/^(\s*\d{1,3}),\s/, "$1. ").replace(/^(\s*\d{1,3})\s+\.\s*/, "$1. "))
      .map((l) => ((l.match(/\s(?:-?>|—>|→)\s/g) || []).length >= 3 ? l.replace(/\s(?:-?>|—>)\s/g, " → ") : l))   // arrows read as ">"
      .map((l) => (isTe(l) ? l.replace(/(^|[\s:])8908(?=\s|$|[:,])/g, "$1క్రింది") : l))                   // common OCR slip for క్రింది
      .join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }
  KJ.readPdfPaper = async function (file, onProg) {
    await loadScript(PDFJS);
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
    const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const n = pdf.numPages, pages = [];
    let text = "", set = "";
    for (let i = 1; i <= n; i++) {
      const tc = await (await pdf.getPage(i)).getTextContent();
      text += tc.items.map((it) => it.str + (it.hasEOL ? "\n" : "")).join("") + "\n";
    }
    const setM = text.match(/^\s*([A-Z])\s*$/m); if (setM) set = setM[1];
    const useText = !isTe(text) && (text.match(/[A-Za-z]/g) || []).length > 200;
    if (useText) { onProg && onProg("Read text from " + n + " page(s)"); return { text: cleanPaperText(text), set, pages: n, mode: "text" }; }
    await loadScript(TESS_URL);
    onProg && onProg("Loading Telugu + English reader (first time ~15 MB)…");
    const worker = await window.Tesseract.createWorker(["eng", "tel"], 1);
    await worker.setParameters({ tessedit_pageseg_mode: "6", preserve_interword_spaces: "1" });
    let all = "";
    for (let i = 1; i <= n; i++) {
      onProg && onProg("Reading page " + i + " of " + n + "…");
      const page = await pdf.getPage(i), vp = page.getViewport({ scale: 3.5 });
      const c = document.createElement("canvas"); c.width = vp.width; c.height = vp.height;
      const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      const im = ctx.getImageData(0, 0, c.width, c.height), d = im.data;      // remove the grey watermark
      const Wd = c.width, Ht = c.height, dark = new Uint8Array(Wd * Ht), keep = new Uint8Array(Wd * Ht);
      for (let k = 0, q = 0; k < d.length; k += 4, q++) dark[q] = keep[q] = (d[k] * 0.3 + d[k + 1] * 0.59 + d[k + 2] * 0.11) < 140 ? 1 : 0;
      /* V13: erase table border lines (long straight runs) so OCR reads the table cells */
      const hMin = Math.round(120 * vp.scale / 3.5), vMin = Math.round(45 * vp.scale / 3.5);
      for (let y = 0; y < Ht; y++) { let x = 0; while (x < Wd) { if (dark[y * Wd + x]) { const s0 = x; while (x < Wd && dark[y * Wd + x]) x++; if (x - s0 >= hMin) for (let z = s0; z < x; z++) keep[y * Wd + z] = 0; } else x++; } }
      for (let x = 0; x < Wd; x++) { let y = 0; while (y < Ht) { if (dark[y * Wd + x]) { const s0 = y; while (y < Ht && dark[y * Wd + x]) y++; if (y - s0 >= vMin) for (let z = s0; z < y; z++) keep[z * Wd + x] = 0; } else y++; } }
      for (let k = 0, q = 0; k < d.length; k += 4, q++) { const v = keep[q] ? 0 : 255; d[k] = d[k + 1] = d[k + 2] = v; }
      ctx.putImageData(im, 0, 0);
      const r = await worker.recognize(c);
      all += r.data.text + "\n";
    }
    await worker.terminate();
    const sm = all.match(/^\s*([A-Z])\s*$/m); if (sm && !set) set = sm[1];
    return { text: cleanPaperText(all), set, pages: n, mode: "ocr" };
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

  /* ---------- V13: "Already Uploaded" check ---------- */
  const normQ = (q) => String((q && q.q && (q.q.en || q.q.te)) || "").toLowerCase().replace(/[^a-z0-9\u0C00-\u0C7F]+/g, " ").trim();
  function findExisting(list, title, set, key) {
    const papers = W["data/papers.json"] || [];
    const tl = String(title || "").trim().toLowerCase(), st = String(set || "").trim().toLowerCase();
    let paper = papers.find((p) => (key && p.key === key) || (tl && String(p.title?.en || "").trim().toLowerCase() === tl && String(p.set || "").trim().toLowerCase() === st));
    const have = new Map(); allQs().forEach((q) => { const k = normQ(q); if (k.length > 12) have.set(k, q); });
    const dupIds = []; list.forEach((x) => { const h = have.get(normQ(x)); if (h) dupIds.push(h.id); });
    if (!paper && dupIds.length) {                       // which test do the repeated questions belong to?
      let best = null, n = 0; papers.forEach((p) => { const c = p.qids.filter((id) => dupIds.includes(id)).length; if (c > n) { n = c; best = p; } });
      paper = n ? best : null;
    }
    const ratio = list.length ? dupIds.length / list.length : 0;
    return { paper, dupIds, dups: dupIds.length, ratio, blocked: !!(key && papers.some((p) => p.key === key)) || !!(tl && papers.some((p) => String(p.title?.en || "").trim().toLowerCase() === tl && String(p.set || "").trim().toLowerCase() === st)) || ratio >= 0.6, have };
  }
  /* V15: "Already Uploaded" pop-up with a choice: 🔁 Reupload  or  ✋ No need of upload */
  function alreadyPopup(info, total, onReupload, onNoNeed) {
    const p = info.paper;
    const m = document.createElement("div"); m.className = "modal"; m.id = "dupModal";
    m.innerHTML = `<div class="box" style="max-width:520px"><h3 style="margin-top:0;color:var(--bad)">⚠ Already Uploaded</h3>
<p>${p ? `This paper is already in the app as <b>${esc(p.title.en)}</b> (Set ${esc(p.set || "-")}, ${p.qids.length} Qs).` : "These questions are already in the question bank."}</p>
<p class="small">${info.dups} of ${total} questions are already in the bank.</p>
<p class="small muted"><b>🔁 Reupload</b> – the old ${p ? "test and its questions are" : "copies of these questions are"} removed and this paper is uploaded once again (fresh copy).<br><b>✋ No need of upload</b> – keep the old one, nothing is added.</p>
<div class="row dup-btns" style="margin-top:12px;gap:10px;align-items:stretch;flex-wrap:nowrap"><button class="btn alt" id="dupNo" style="flex:1">✋ No need of upload</button><button class="btn ok" id="dupRe" style="flex:1">🔁 Reupload</button></div></div>`;
    const close = () => m.remove();
    m.addEventListener("click", (e) => { if (e.target === m) { close(); onNoNeed && onNoNeed(); } });
    document.body.appendChild(m);
    m.querySelector("#dupNo").onclick = () => { close(); onNoNeed && onNoNeed(); KJ.toast("No upload – the old paper is kept"); };
    m.querySelector("#dupRe").onclick = () => { close(); onReupload && onReupload(); };
  }
  /* V15: remove the old copy (test + its questions + repeated questions) before a Reupload */
  function removeOld(info, title, set, key) {
    const papers = W["data/papers.json"] || [];
    const tl = String(title || "").trim().toLowerCase(), st = String(set || "").trim().toLowerCase();
    const old = papers.filter((p) => p === info.paper || (key && p.key === key) || (tl && String(p.title?.en || "").trim().toLowerCase() === tl && String(p.set || "").trim().toLowerCase() === st));
    const keepUsed = new Set(papers.filter((p) => !old.includes(p)).flatMap((p) => p.qids));
    const del = new Set([...old.flatMap((p) => p.qids), ...(info.dupIds || [])].filter((id) => !keepUsed.has(id)));
    let n = 0;
    SUBS.forEach((s) => { const bk = bank(s.id), n0 = bk.length; for (let i = bk.length - 1; i >= 0; i--) if (del.has(bk[i].id)) bk.splice(i, 1); if (bk.length !== n0) { n += n0 - bk.length; markDirty(bankPath(s.id)); } });
    old.forEach((p) => papers.splice(papers.indexOf(p), 1));
    if (old.length) markDirty("data/papers.json");
    return { tests: old.length, qs: n };
  }

  P.import = (el) => {
    /* V9: left = paper (PDF / file / text) · right = subject & Topic Test details */
    /* V16: ① Subject + Exam Type first (right card) → ② upload paper → ③ Import */
    const selSub = S.get("t_imp_sub", ""), selEx = S.get("t_imp_ex", []);
    el.innerHTML = `<div class="two imp-two">
<div class="card" id="impL"><h3 style="margin-top:0">② Question paper – PDF, file or pasted text</h3>
<div class="lock-note" id="lockNote">🔒 First select <b>Subject</b> and <b>Exam Type</b> in <b>① Select Subject &amp; Exam Type</b> <span class="arrow-r">→</span><span class="arrow-d">↑</span></div>
<div class="row"><label class="btn acc sm" style="margin:0">📄 Read PDF question paper<input type="file" id="pdfin" accept="application/pdf,.pdf" hidden></label>
<button class="btn alt sm" id="tpl">⬇ CSV template</button>
<label class="btn acc sm" style="margin:0" title="Topic Test file (.json) adds the questions and creates the test in one step">📂 CSV / JSON / Topic Test file<input type="file" id="cf" accept=".csv,.json" hidden></label></div>
<div class="small" id="pdfst" style="margin-top:6px"></div><div id="cres" class="small" style="margin-top:4px"></div>
<p class="small muted">The PDF is read into the box below (Telugu pages are read with OCR, about 10–30 s per page – use a laptop). <b>Check the text</b>, type the <b>answer key</b>, then Preview → Import. Diagrams are not read – add them later in ➕ Add / Edit. You can also paste text from a Word file here.</p>
<textarea id="pt" style="min-height:260px" placeholder="1. Ginger and turmeric propagate naturally through:&#10;అల్లం మరియు పసుపు …?&#10;A) Tubers / దుంపలు&#10;B) Rhizomes / భూగర్భ కాండాలు&#10;C) Bulbs / కాండాలు&#10;D) Runners / నేలపై పాకే కాండాలు">${esc(S.get("t_import_text", ""))}</textarea>
<label>Answer key (e.g. 1-B 2-C 3-D 4-B)</label><input id="pk">
<div class="row" style="margin-top:10px"><button class="btn alt sm" id="pp">Preview</button><span class="sp"></span><button class="btn ok" id="pi">③ Import</button></div>
<div id="pres"></div></div>
<div class="card" id="impR" style="align-self:start"><h3 style="margin-top:0">① Select Subject &amp; Exam Type</h3>
<div class="row"><div style="flex:2;min-width:180px"><label>Subject <span style="color:var(--bad)">*</span></label><select id="ps"><option value="">— Select subject —</option>${SUBS.map((s) => `<option value="${s.id}" ${s.id === selSub ? "selected" : ""}>${esc(s.name.en)}</option>`).join("")}</select></div>
<div style="flex:2;min-width:180px"><label>Topic</label><input id="pto"></div></div>
<label>Exam Type <span style="color:var(--bad)">*</span> <span class="small muted">(tick one or more)</span></label><div id="pe">${EXAMS.map((x) => `<label class="chk"><input type="checkbox" value="${x.id}" ${selEx.includes(x.id) ? "checked" : ""}>${esc(x.name.en)}</label>`).join("")}</div>
<div class="small" id="selSt" style="margin-top:6px"></div>
<div class="row" style="margin-top:10px"><label class="chk"><input type="checkbox" id="mkp"> Also create a Topic Test – Set</label><label class="chk"><input type="checkbox" id="pvis" checked> Visible to students</label></div>
<div class="row"><div style="width:80px"><label>Set</label><input id="pset" value="A"></div><div style="flex:1"><label>Test title</label><input id="ptitle" placeholder="Test title"></div></div>
</div></div>`;
    const prev = () => {
      const r = KJ.parsePaperText($("#pt").value, $("#pk").value);
      const noKey = r.filter((x) => x.a == null).length, bad4 = r.filter((x) => x.o.en.length !== 4);
      $("#pres").innerHTML = `<p class="small"><b>${r.length}</b> questions found · <span style="${noKey ? "color:var(--bad);font-weight:700" : ""}">${noKey} without answer key</span> · <span style="${bad4.length ? "color:var(--warn);font-weight:700" : ""}">${bad4.length} not having 4 options${bad4.length ? " (Q" + bad4.map((x) => x.no).join(", Q") + ")" : ""}</span></p>` +
        r.slice(0, 200).map((x) => `<div class="small" style="border-top:1px solid var(--line);padding:4px 0"><b>${x.no}.</b> ${esc(x.q.en)} <span class="t-te" style="display:inline">${esc(x.q.te)}</span><br>${x.o.en.map((o, i) => `<span class="${i === x.a ? "pill acc" : "pill"}">${KJ.LETTERS[i]}) ${esc(o)}${x.o.te[i] ? " / " + esc(x.o.te[i]) : ""}</span>`).join(" ")}</div>`).join("");
      return r;
    };
    /* V16: Subject + Exam Type must be chosen before a paper can be uploaded */
    const selReady = () => !!$("#ps").value && $$("#pe input:checked").length > 0;
    const updLock = () => {
      const ok = selReady(), sn = $("#ps").value, en = $$("#pe input:checked").length;
      $("#impL").classList.toggle("locked", !ok); $("#impR").classList.toggle("need", !ok);
      $("#selSt").innerHTML = ok ? `<span style="color:var(--ok)">✔ ${esc(subName(sn))} · ${en} exam type(s) – now upload the paper in ②</span>`
        : `<span style="color:var(--bad)">${!sn ? "Select the subject. " : ""}${!en ? "Tick the exam type." : ""}</span>`;
    };
    const needSel = () => {
      if (selReady()) return false;
      const m = document.createElement("div"); m.className = "modal"; m.id = "selModal";
      m.innerHTML = `<div class="box" style="max-width:460px"><h3 style="margin-top:0;color:var(--bad)">⚠ Select the subject name and Exam type</h3>
<p>Before uploading the paper, choose in <b>① Select Subject &amp; Exam Type</b>:</p>
<p style="margin:4px 0">${$("#ps").value ? "✔" : "✖"} <b>Subject</b> &nbsp; ${$$("#pe input:checked").length ? "✔" : "✖"} <b>Exam Type</b></p>
<p class="small muted">Then upload the paper (📄 PDF / 📂 file / paste text) and press <b>③ Import</b>.</p>
<div class="row" style="margin-top:12px"><span class="sp"></span><button class="btn ok" id="selGo">OK – select now</button></div></div>`;
      const go = () => { m.remove(); $("#impR").scrollIntoView({ behavior: "smooth", block: "center" }); $("#impR").classList.add("flash"); setTimeout(() => $("#impR").classList.remove("flash"), 1600); ($("#ps").value ? $("#pe input") : $("#ps")).focus(); };
      m.addEventListener("click", (e) => { if (e.target === m) go(); });
      document.body.appendChild(m); m.querySelector("#selGo").onclick = go;
      return true;
    };
    $("#ps").onchange = () => { S.set("t_imp_sub", $("#ps").value); updLock(); };
    $("#pe").onchange = () => { S.set("t_imp_ex", $$("#pe input:checked").map((x) => x.value)); updLock(); };
    $$("#pdfin,#cf").forEach((inp) => inp.closest("label").addEventListener("click", (e) => { if (needSel()) e.preventDefault(); }));
    $("#pt").addEventListener("focus", () => { if (!$("#pt").value.trim()) needSel(); });
    updLock();
    let staged = null;                                   // V16: chosen file waits for ③ Import
    $("#pp").onclick = () => { if (staged) return showStaged(); prev(); };
    $("#pdfin").onchange = async (e) => {                 // V7
      const f = e.target.files[0]; if (!f) return;
      if (needSel()) { e.target.value = ""; return; }
      staged = null; $("#cres").innerHTML = "";
      const st = $("#pdfst"); st.textContent = "Opening " + f.name + "…";
      try {
        const r = await KJ.readPdfPaper(f, (m) => (st.textContent = m));
        $("#pt").value = r.text; S.set("t_import_text", r.text);
        if (r.set) $("#pset").value = r.set;
        if (!$("#ptitle").value) $("#ptitle").value = f.name.replace(/\.pdf$/i, "").replace(/^KJ[_ ]*/i, "").replace(/_/g, " ").trim() + (r.set ? " – Set " + r.set : "");
        $("#mkp").checked = true;
        const q = prev();
        const ex0 = findExisting(q, $("#ptitle").value, $("#pset").value, "");                           // V13
        reupOK = false;
        if (ex0.blocked) alreadyPopup(ex0, q.length,
          () => { reupOK = true; KJ.toast("🔁 Reupload: check the text + answer key, then press Import – the old copy will be replaced"); },
          () => { $("#pt").value = ""; S.del("t_import_text"); $("#pres").innerHTML = ""; st.innerHTML = "✋ No need of upload – the old paper is kept."; });
        st.innerHTML = `✔ ${r.pages} page(s) read ${r.mode === "ocr" ? "with OCR" : "as text"} → <b>${q.length}</b> questions. ${r.mode === "ocr" ? "Please check spellings, " : ""}type the answer key, then press <b>③ Import</b>.`;
      } catch (err) { st.innerHTML = '<span style="color:var(--bad)">✖ Could not read the PDF: ' + esc(err.message) + "</span>"; }
      e.target.value = "";
    };
    let reupOK = false;                                  // V15: Reupload already chosen after Read PDF
    $("#pt").oninput = () => S.set("t_import_text", $("#pt").value);
    $("#pi").onclick = () => {
      if (needSel()) return;                               // V16
      if (staged) { const st0 = staged; return importItems(st0.items, st0.TT, st0.fname, () => { staged = null; }); }
      const r = prev(); if (!r.length) return KJ.toast("Nothing to import – upload a paper first");
      const tt0 = $("#mkp").checked ? $("#ptitle").value : "";
      const dupInfo = findExisting(r, tt0, $("#pset").value, "");      // V13
      if (dupInfo.blocked) {                                         // V15: ask Reupload / No need of upload
        const re = () => { const g = removeOld(dupInfo, tt0, $("#pset").value, ""); KJ.toast("Old copy removed (" + g.tests + " test, " + g.qs + " Qs) – uploading again"); reupOK = false; $("#pi").onclick(); };
        if (reupOK) return re();
        return alreadyPopup(dupInfo, r.length, re, () => { $("#pres").innerHTML = '<p class="small">✋ No need of upload – nothing imported.</p>'; });
      }
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
        const papers = W["data/papers.json"]; let pn = papers.length + 1, pid; do { pid = "KJ-TT-" + String(pn++).padStart(3, "0"); } while (papers.some((p) => p.id === pid));
        papers.push({ id: pid, subject: sid, topic: $("#pto").value.trim(), set: $("#pset").value.trim() || "A", title: { en: $("#ptitle").value.trim() || $("#pto").value.trim() || "Topic Test " + (papers.length + 1), te: "" },
          date: KJ.today(), duration_min: ids.length, mark: 1, negative: 0.25, visible: $("#pvis").checked, exams: ex, qids: ids });
        bank(sid).forEach((q) => ids.includes(q.id) && (q.paper = pid));
        markDirty("data/papers.json");
      }
      S.del("t_import_text");
      KJ.toast("Imported " + ids.length + " questions"); tab = "bank"; S.set("t_bsub", sid); draw();
    };
    $("#tpl").onclick = () => download("kj_questions_template.csv", "\ufeff" + CSV_HEAD.join(",") + "\npolity,Fundamental Rights,appsc_g2;group4,,easy,\"Article 21 deals with:\",\"ఆర్టికల్ 21 దేనికి సంబంధించినది?\",Equality,Life and personal liberty,Religion,Remedies,సమానత్వం,ప్రాణం & వ్యక్తిగత స్వేచ్ఛ,మతం,పరిహారాలు,B,,,,\n", "text/csv");
    $("#cf").onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      if (needSel()) { e.target.value = ""; return; }
      const text = (await f.text()).replace(/^\ufeff/, "");
      let items = [], TT = null;
      try {
        if (f.name.endsWith(".json")) {
          items = JSON.parse(text);
          /* V6: Topic Test bundle  { "topic_test": {...}, "questions": [...] }  → questions + Topic Test in one go */
          if (items && !Array.isArray(items) && Array.isArray(items.questions)) { TT = items.topic_test || null; items = items.questions; }
          if (!Array.isArray(items)) throw new Error("JSON must be a list of questions or a Topic Test bundle");
          /* V13: duplicate test → "Already Uploaded" (checked below for all file types) */
        }
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
      e.target.value = "";
      staged = { items, TT, fname: f.name }; showStaged();        // V16: wait for ③ Import
    };
    const showStaged = () => {
      const { items, TT, fname } = staged;
      $("#cres").innerHTML = `📂 <b>${esc(fname)}</b> is ready: <b>${items.length}</b> questions${TT ? ` + Topic Test <b>${esc(TT.title?.en || "")}</b> (Set ${esc(TT.set || "-")})` : ""}.<br>Subject: <b>${esc(subName($("#ps").value))}</b> · Exam Type: <b>${$$("#pe input:checked").length}</b> selected → now press <b>③ Import</b>. <a href="#" id="unst">cancel</a>`;
      $("#unst").onclick = (ev) => { ev.preventDefault(); staged = null; $("#cres").innerHTML = "File removed."; };
    };
    /* V15: import step on its own, so 🔁 Reupload can run it again after removing the old copy */
    const importItems = (items, TT, fname, done) => {
      const ex = findExisting(items, TT && TT.title && TT.title.en, TT && TT.set, TT && TT.key);   // V13
      if (ex.blocked) {
        $("#cres").innerHTML = '<span style="color:var(--bad)">⚠ Already Uploaded – choose Reupload or No need of upload.</span>';
        return alreadyPopup(ex, items.length,
          () => { const g = removeOld(ex, TT && TT.title && TT.title.en, TT && TT.set, TT && TT.key); KJ.toast("Old copy removed (" + g.tests + " test, " + g.qs + " Qs) – uploading again"); importItems(items, TT, fname, done); },
          () => { done && done(); $("#cres").innerHTML = '✋ No need of upload – nothing imported, the old paper is kept.'; });
      }
      done && done();
      /* V16: the chosen Subject + Exam Type are applied to the imported questions and the Topic Test */
      const selS = $("#ps").value, selE = $$("#pe input:checked").map((x) => x.value);
      items.forEach((it) => { if (!SUBS.find((s) => s.id === it.subject)) it.subject = selS; it.exams = Array.from(new Set([...(it.exams || []), ...selE])); });
      let skipped = 0;
      items = items.filter((x) => { if (ex.have.has(normQ(x))) { skipped++; return false; } return true; });
      let ok = 0, bad = []; const newIds = [];
      const usedIds = new Set(allQs().map((q) => q.id)), touched = new Set(), maxNo = {};      // V13: fast id handling
      const nextIdFast = (sid) => {
        if (maxNo[sid] == null) maxNo[sid] = Math.max(0, ...bank(sid).map((q) => +(String(q.id).split("-")[1] || 0)).filter((x) => !isNaN(x)));
        let id; do { id = sid.slice(0, 3) + "-" + String(++maxNo[sid]).padStart(4, "0"); } while (usedIds.has(id));
        return id;
      };
      items.forEach((it, i) => {
        const row = TT ? "Q" + (i + 1) : "row " + (i + 2);
        if (!SUBS.find((s) => s.id === it.subject)) return bad.push(row + ": unknown subject '" + it.subject + "'");
        if (it.type === "mcq" && !(it.a >= 0)) return bad.push(row + ": bad answer");
        it.id = it.id && !usedIds.has(it.id) ? it.id : nextIdFast(it.subject);
        usedIds.add(it.id);
        it.img = it.img || ""; it.video = it.video || ""; it.e = it.e || { en: "", te: "" };
        bank(it.subject).push(it); touched.add(it.subject); ok++; newIds.push(it.id);
      });
      touched.forEach((sid) => markDirty(bankPath(sid)));          // V13: save once per subject (fast for big files)
      let ttMsg = "";
      if (TT && newIds.length) {                         // V6: create the Topic Test from the imported questions
        const papers = W["data/papers.json"];
        let n = papers.length + 1, pid; do { pid = "KJ-TT-" + String(n++).padStart(3, "0"); } while (papers.some((p) => p.id === pid));
        const p = { id: pid, key: TT.key || "", subject: selS, exams: selE, topic: TT.topic || "",
          set: TT.set || "A", title: { en: TT.title?.en || "Topic Test", te: TT.title?.te || "" }, date: TT.date || KJ.today(),
          duration_min: +TT.duration_min || newIds.length, mark: +TT.mark || 1, negative: TT.negative != null ? +TT.negative : 0.25,
          visible: TT.visible !== false, qids: newIds };
        papers.push(p); markDirty("data/papers.json");
        items.forEach((it) => { if (newIds.includes(it.id)) it.paper = pid; });
        ttMsg = `<br>✔ Topic Test created: <b>${esc(p.title.en)}</b> (Set ${esc(p.set)}, ${newIds.length} Qs, ${p.duration_min} min, ${p.visible ? "Visible" : "Hidden"}) – check it in 🎯 Topic Tests, then 🚀 Publish.`;
      }
      $("#cres").innerHTML = `✔ Imported ${ok} questions` + (skipped ? ` · skipped ${skipped} already in the bank` : "") + ttMsg + (bad.length ? `<br>✖ Skipped ${bad.length}:<br>${bad.map(esc).join("<br>")}` : "");
      pill();
    };
  };

  /* ---------- Model papers ---------- */
  /* V17: 🧹 Clear all – every Topic Test and its questions (optionally the whole question bank) */
  function clearAllPopup(after) {
    const papers = W["data/papers.json"] || [];
    const inTests = new Set(papers.flatMap((p) => p.qids));
    const total = allQs().length, nT = papers.length, nQ = allQs().filter((q) => inTests.has(q.id)).length;
    const m = document.createElement("div"); m.className = "modal"; m.id = "clrModal";
    m.innerHTML = `<div class="box" style="max-width:500px"><h3 style="margin-top:0;color:var(--bad)">🧹 Clear all tests</h3>
<p>This deletes <b>all ${nT} Topic Test(s)</b> and <b>their ${nQ} question(s)</b> from the app.</p>
<label class="chk"><input type="checkbox" id="clrBank"> Also clear the <b>whole Question Bank</b> (all ${total} questions in all subjects)</label>
<p class="small muted" style="margin:8px 0 4px">Notes, Current Affairs, Announcements, Exam Patterns and Settings are <b>not</b> touched. After clearing, press 🚀 <b>Publish</b> so students see the change.</p>
<label>Type <b>CLEAR</b> to confirm</label><input id="clrTxt" autocomplete="off" placeholder="CLEAR">
<div class="row" style="margin-top:12px;gap:10px;align-items:stretch;flex-wrap:nowrap"><button class="btn alt" id="clrNo" style="flex:1">Cancel</button><button class="btn bad" id="clrGo" style="flex:1" disabled>🧹 Clear all</button></div></div>`;
    document.body.appendChild(m);
    const go = m.querySelector("#clrGo");
    m.querySelector("#clrTxt").oninput = (e) => (go.disabled = e.target.value.trim().toUpperCase() !== "CLEAR");
    m.querySelector("#clrNo").onclick = () => m.remove();
    m.addEventListener("click", (e) => { if (e.target === m) m.remove(); });
    m.querySelector("#clrTxt").focus();
    go.onclick = () => {
      const whole = m.querySelector("#clrBank").checked; let nq = 0;
      SUBS.forEach((sb) => { const bk = bank(sb.id), n0 = bk.length;
        for (let i = bk.length - 1; i >= 0; i--) if (whole || inTests.has(bk[i].id) || bk[i].paper) bk.splice(i, 1);
        if (bk.length !== n0) { nq += n0 - bk.length; markDirty(bankPath(sb.id)); } });
      papers.splice(0, papers.length); markDirty("data/papers.json");
      m.remove(); KJ.toast(`Cleared ${nT} test(s) and ${nq} question(s) – press 🚀 Publish`); after && after();
    };
  }

  P.papers = (el) => {
    const papers = W["data/papers.json"];
    const map = new Map(allQs().map((q) => [q.id, q]));
    el.innerHTML = `<div class="card"><div class="row"><h3 style="margin:0">🎯 Topic Tests</h3><span class="sp"></span><button class="btn bad sm" id="clrAll" title="Delete every Topic Test and its questions">🧹 Clear all tests</button><button class="btn sm" id="np">➕ New topic test</button></div>
<p class="small muted">Students see these under <b>Topic Tests</b>, grouped by Subject, only when switched <b>Visible</b>. Printing uses the KONCEPT JUNCTION layout (Set box, watermark logo, contact footer).</p></div>
${papers.map((p, k) => `<div class="card"><div class="row"><b>${esc(p.id)}</b><span class="sp"></span><label class="chk"><input type="checkbox" data-vis="${k}" ${p.visible !== false ? "checked" : ""}>Visible</label></div>
<div class="row"><div style="flex:1"><label>Subject</label><select data-k="${k}" data-f="subject">${SUBS.map((s) => `<option value="${s.id}" ${s.id === p.subject ? "selected" : ""}>${esc(s.name.en)}</option>`).join("")}</select></div>
<div style="flex:1"><label>Topic</label><input data-k="${k}" data-f="topic" value="${esc(p.topic || "")}" placeholder="e.g. Fundamental Rights"></div></div>
<div class="row"><div style="flex:2"><label>Title (English)</label><input data-k="${k}" data-f="title.en" value="${esc(p.title.en || "")}"></div><div style="flex:2"><label>Title (తెలుగు)</label><input data-k="${k}" data-f="title.te" value="${esc(p.title.te || "")}"></div>
<div style="flex:.6"><label>Set</label><input data-k="${k}" data-f="set" value="${esc(p.set || "")}"></div></div>
<div class="row"><div style="flex:1"><label>Minutes</label><input type="number" data-k="${k}" data-f="duration_min" value="${p.duration_min}"></div><div style="flex:1"><label>Mark</label><input type="number" step="0.25" data-k="${k}" data-f="mark" value="${p.mark}"></div>
<div style="flex:1"><label>Negative fraction</label><input type="number" step="0.01" data-k="${k}" data-f="negative" value="${p.negative}"></div><div style="flex:1"><label>Date</label><input type="date" data-k="${k}" data-f="date" value="${esc(p.date || "")}"></div></div>
<label>Question IDs in order (comma separated) – ${p.qids.length} Qs, ${p.qids.filter((id) => !map.has(id)).length} missing</label><textarea data-k="${k}" data-f="qids">${esc(p.qids.join(", "))}</textarea>
<div class="row" style="margin-top:8px"><button class="btn alt sm" data-pr="${k}">🖨 Question paper</button><button class="btn alt sm" data-prk="${k}">🖨 With answer key</button><button class="btn alt sm" data-word="${k}">⬇ Word</button><span class="sp"></span><button class="btn bad sm" data-del="${k}">Delete test</button><button class="btn bad sm" data-delall="${k}" title="Delete the test and its questions from the bank">🗑 Delete test + its questions</button></div></div>`).join("")}`;
    $("#clrAll").onclick = () => clearAllPopup(draw);                     // V17
    $("#np").onclick = () => { papers.push({ id: "KJ-TT-" + String(papers.length + 1).padStart(3, "0"), subject: SUBS[0].id, topic: "", set: "A", title: { en: "New Topic Test", te: "" }, date: KJ.today(), duration_min: 30, mark: 1, negative: 0.25, visible: false, qids: [] }); markDirty("data/papers.json"); draw(); };
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
      const b = e.target.closest("[data-pr],[data-prk],[data-word],[data-del],[data-delall]"); if (!b) return;
      const k = +(b.dataset.pr ?? b.dataset.prk ?? b.dataset.word ?? b.dataset.del ?? b.dataset.delall), p = papers[k];
      if (b.dataset.delall != null) {                     // V13: remove the test and the questions used only by it
        const used = new Set(papers.filter((x, i) => i !== k).flatMap((x) => x.qids));
        const del = p.qids.filter((id) => !used.has(id));
        if (!KJ.confirm(`Delete "${p.title.en}" and its ${del.length} question(s) from the bank?` + (p.qids.length > del.length ? `\n(${p.qids.length - del.length} question(s) also used in other tests will be kept.)` : "") + "\nPress 🚀 Publish afterwards.")) return;
        SUBS.forEach((s) => { const bk = bank(s.id), n0 = bk.length; for (let i = bk.length - 1; i >= 0; i--) if (del.includes(bk[i].id)) bk.splice(i, 1); if (bk.length !== n0) markDirty(bankPath(s.id)); });
        papers.splice(k, 1); markDirty("data/papers.json"); draw(); KJ.toast("Deleted test and " + del.length + " question(s)"); return;
      }
      const qs = p.qids.map((id) => map.get(id)).filter(Boolean);
      if (b.dataset.del != null) { if (KJ.confirm("Delete topic test " + p.id + "? (questions stay in the bank)")) { papers.splice(k, 1); markDirty("data/papers.json"); draw(); } return; }
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
<label>PDF URL (or upload)</label><input id="nu"><div class="row" style="margin-top:6px"><label class="btn alt sm" style="margin:0">⬆ Upload PDF to Cloudinary<input type="file" id="nf" accept="application/pdf" hidden></label>
<label class="btn acc sm" style="margin:0">⬆ Upload PDF to GitHub (≤ ${GH_MAX_MB} MB)<input type="file" id="nfg" accept="application/pdf" hidden></label></div>
<div class="small muted" id="nst"></div>
<div class="row" style="margin-top:10px"><span class="sp"></span><button class="btn ok" id="na">Add</button></div></div></div>`;
    $("#nfg").onchange = async (e) => { const f = e.target.files[0]; if (!f) return;          // V13
      try { $("#nst").textContent = "Uploading " + (f.size / 1048576).toFixed(2) + " MB to GitHub…"; $("#nu").value = await ghUploadFile(f, "notes"); $("#nst").textContent = "✔ Uploaded to GitHub – students can open it after 1–3 min"; if (!$("#ne").value) $("#ne").value = f.name.replace(/\.pdf$/i, ""); }
      catch (err) { $("#nst").textContent = "✖ " + err.message; } e.target.value = ""; };
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

  /* ---------- Exam patterns (V5: form instead of JSON code) ---------- */
  let XD = null;                                   // unsaved draft of exam patterns
  const NEG = [[0, "No negative marking"], [0.25, "−1/4 per wrong"], [0.3333, "−1/3 per wrong"], [0.2, "−1/5 per wrong"], [0.5, "−1/2 per wrong"]];
  P.exams = (el) => {
    if (!XD) XD = JSON.parse(JSON.stringify(EXAMS));
    const mcqIn = (sid) => bank(sid).filter((q) => q.type !== "conv").length;
    const negSel = (v) => {
      const known = NEG.some(([n]) => Math.abs(n - v) < 1e-4);
      return NEG.map(([n, t]) => `<option value="${n}" ${Math.abs(n - v) < 1e-4 ? "selected" : ""}>${t}</option>`).join("") +
        (known ? "" : `<option value="${v}" selected>−${v} per wrong (custom)</option>`);
    };
    const card = (x, k) => {
      const total = x.sections.reduce((t, s) => t + (+s.count || 0), 0);
      return `<div class="card" data-x="${k}">
<div class="row"><b>${esc(x.name.en || "New exam")}</b><span class="pill">${total} Qs · ${x.duration_min} min · +${x.mark}${x.negative ? " / −" + +(x.mark * x.negative).toFixed(2) : ""}</span><span class="tag">id: ${esc(x.id)}</span>
<span class="sp"></span><button class="btn alt sm" data-up="${k}" ${k ? "" : "disabled"} title="Move up">↑</button><button class="btn alt sm" data-dn="${k}" ${k < XD.length - 1 ? "" : "disabled"} title="Move down">↓</button><button class="btn bad sm" data-del="${k}">Delete</button></div>
<div class="row"><div style="flex:2;min-width:200px"><label>Exam name (English)</label><input data-f="name.en" value="${esc(x.name.en || "")}"></div>
<div style="flex:2;min-width:200px"><label>పరీక్ష పేరు (తెలుగు)</label><input data-f="name.te" value="${esc(x.name.te || "")}"></div>
<div style="flex:1;min-width:120px"><label>Board</label><input data-f="board" value="${esc(x.board || "")}" placeholder="APPSC"></div></div>
<div class="row"><div style="flex:1;min-width:120px"><label>Duration (minutes)</label><input type="number" min="1" data-f="duration_min" value="${x.duration_min}"></div>
<div style="flex:1;min-width:120px"><label>Marks per question</label><input type="number" min="0.25" step="0.25" data-f="mark" value="${x.mark}"></div>
<div style="flex:2;min-width:180px"><label>Negative marking</label><select data-f="negative">${negSel(+x.negative || 0)}</select></div></div>
<label>Sections – subject and number of questions</label>
<div style="overflow-x:auto"><table class="t sec-t"><tr><th>Subject</th><th style="width:120px">Questions</th><th>In your bank</th><th></th></tr>
${x.sections.map((s, i) => `<tr><td><select data-s="${i}" data-sf="subject">${SUBS.map((u) => `<option value="${u.id}" ${u.id === s.subject ? "selected" : ""}>${esc(u.name.en)}</option>`).join("")}</select></td>
<td><input type="number" min="1" data-s="${i}" data-sf="count" value="${s.count}"></td>
<td class="small ${mcqIn(s.subject) < s.count ? "dirty" : "muted"}">${mcqIn(s.subject)} MCQs${mcqIn(s.subject) < s.count ? " – add more" : ""}</td>
<td><button class="btn alt sm" data-sdel="${i}" title="Remove">✕</button></td></tr>`).join("")}</table></div>
<div class="row" style="margin-top:6px"><button class="btn alt sm" data-sadd="1">➕ Add subject</button><span class="sp"></span><span class="small muted">Total: <b>${total}</b> questions</span></div>
<label>Note shown to students</label><input data-f="note" value="${esc(x.note || "")}" placeholder="e.g. As per APPSC notification 2026">
</div>`;
    };
    const paint = () => {
      el.innerHTML = `<div class="card"><div class="row"><h3 style="margin:0">📋 Exam patterns</h3><span class="sp"></span><button class="btn sm" id="xa">➕ Add exam</button></div>
<p class="small muted" style="margin-bottom:0">Students' <b>Full Mock</b>, <b>Daily Quiz</b> and the <b>Target exam</b> list follow these patterns. Edit, then press <b>Save exam patterns</b> and <b>🚀 Publish</b>.</p></div>
${XD.map(card).join("")}
<div class="row" style="margin:4px 0 14px"><span class="small" id="eres"></span><span class="sp"></span><button class="btn alt sm" id="xr">Undo changes</button><button class="btn ok" id="es">Save exam patterns</button></div>
<details class="card"><summary>Advanced: view / paste as JSON</summary><p class="small muted">Only for copying patterns between devices. Normal editing uses the form above.</p>
<textarea id="ej" style="min-height:260px;font:12.5px ui-monospace,Consolas,monospace">${esc(JSON.stringify(XD, null, 2))}</textarea>
<div class="row" style="margin-top:6px"><span class="sp"></span><button class="btn alt sm" id="ejs">Apply JSON to form</button></div></details>`;
    };
    paint();
    const setF = (x, f, v) => { if (f.startsWith("name.")) x.name[f.slice(5)] = v; else x[f] = v; };
    el.oninput = (e) => {                          // keep draft in step while typing (no repaint → no lost focus)
      const c = e.target.closest("[data-x]"); if (!c) return;
      const x = XD[+c.dataset.x], t = e.target;
      if (t.dataset.f) setF(x, t.dataset.f, t.type === "number" || t.tagName === "SELECT" && t.dataset.f === "negative" ? +t.value : t.value);
      if (t.dataset.sf) x.sections[+t.dataset.s][t.dataset.sf] = t.dataset.sf === "count" ? +t.value : t.value;
    };
    el.onchange = (e) => { el.oninput(e); if (e.target.closest("[data-x]") && e.target.id !== "ej") { const y = window.scrollY; paint(); window.scrollTo(0, y); } };
    el.onclick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const c = b.closest("[data-x]"), k = c ? +c.dataset.x : -1, y = window.scrollY;
      if (b.id === "xa") {
        XD.push({ id: "exam_" + Date.now().toString(36), board: "", name: { en: "New exam", te: "" }, duration_min: 60, mark: 1, negative: 0, sections: [{ subject: SUBS[0].id, count: 10 }], note: "" });
        paint(); window.scrollTo(0, document.body.scrollHeight); return;
      }
      if (b.dataset.del != null) { if (KJ.confirm("Delete exam \"" + XD[k].name.en + "\"?")) XD.splice(k, 1); }
      else if (b.dataset.up != null) [XD[k - 1], XD[k]] = [XD[k], XD[k - 1]];
      else if (b.dataset.dn != null) [XD[k + 1], XD[k]] = [XD[k], XD[k + 1]];
      else if (b.dataset.sadd) XD[k].sections.push({ subject: SUBS.find((u) => !XD[k].sections.some((s) => s.subject === u.id))?.id || SUBS[0].id, count: 10 });
      else if (b.dataset.sdel != null) XD[k].sections.splice(+b.dataset.sdel, 1);
      else if (b.id === "xr") { XD = JSON.parse(JSON.stringify(EXAMS)); }
      else if (b.id === "ejs") {
        try { const j = JSON.parse($("#ej").value); if (!Array.isArray(j)) throw new Error("must be a list [ … ]"); XD = j; }
        catch (err) { $("#eres").textContent = "✖ JSON: " + err.message; return; }
      }
      else if (b.id === "es") {
        const errs = [];
        XD.forEach((x, i) => {
          const n = x.name.en || "Exam " + (i + 1);
          if (!x.name.en) errs.push(`Exam ${i + 1}: enter the English name`);
          if (!(x.duration_min > 0)) errs.push(`${n}: duration must be more than 0`);
          if (!(x.mark > 0)) errs.push(`${n}: marks per question must be more than 0`);
          if (!x.sections.length) errs.push(`${n}: add at least one subject`);
          x.sections.forEach((s) => { if (!(s.count > 0)) errs.push(`${n}: question count must be more than 0`); });
          const d = x.sections.map((s) => s.subject).filter((v, j, a) => a.indexOf(v) !== j);
          if (d.length) errs.push(`${n}: ${subName(d[0])} is listed twice`);
          if (!x.id) x.id = "exam_" + Date.now().toString(36) + i;
        });
        if (errs.length) { $("#eres").innerHTML = '<span style="color:var(--bad)">✖ ' + errs.map(esc).join("<br>✖ ") + "</span>"; return; }
        W["data/exams.json"] = EXAMS = JSON.parse(JSON.stringify(XD));
        markDirty("data/exams.json"); XD = null;
        draw(); KJ.toast("Exam patterns saved – press 🚀 Publish to send to students"); return;
      }
      else return;
      paint(); window.scrollTo(0, y);
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
  /* ---------- V13: GitHub Git Data API – large files (up to 25 MB each), all files in ONE commit ----------
     The Contents API used before only handles files up to 1 MB comfortably; blobs + trees handle up to 100 MB.
     KJ keeps a safe limit of 25 MB per file (same as Power Pulse). */
  const GH_MAX_MB = 25;
  async function ghApi(path, method = "GET", body) {
    const G = cfg();
    const r = await fetch(`https://api.github.com/repos/${G.owner}/${G.repo}${path}`, { method, cache: "no-store",
      headers: { Authorization: "Bearer " + pat(), Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(r.status + " " + (j.message || ""));
    return j;
  }
  /* files: [{ path, b64, size }]  →  one commit on the branch */
  async function ghCommit(files, message, log) {
    const G = cfg(), br = encodeURIComponent(G.branch);
    for (const f of files) if (f.size > GH_MAX_MB * 1048576) throw new Error(`${f.path} is ${(f.size / 1048576).toFixed(1)} MB – the limit is ${GH_MAX_MB} MB per file`);
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const ref = await ghApi(`/git/ref/heads/${br}`), base = ref.object.sha;
        const baseTree = (await ghApi(`/git/commits/${base}`)).tree.sha, tree = [];
        for (const f of files) {
          log && log(`  ⬆ ${f.path} (${f.size >= 1048576 ? (f.size / 1048576).toFixed(2) + " MB" : (f.size / 1024).toFixed(1) + " KB"})`);
          const b = await ghApi("/git/blobs", "POST", { content: f.b64, encoding: "base64" });
          tree.push({ path: G.prefix + f.path, mode: "100644", type: "blob", sha: b.sha });
        }
        const nt = await ghApi("/git/trees", "POST", { base_tree: baseTree, tree });
        const nc = await ghApi("/git/commits", "POST", { message, tree: nt.sha, parents: [base] });
        await ghApi(`/git/refs/heads/${br}`, "PATCH", { sha: nc.sha });
        return nc.sha;
      } catch (err) {
        if (attempt === 2 || !/^(409|422)/.test(err.message)) throw err;        // branch moved meanwhile → try once more
        log && log("  … branch changed, retrying");
      }
    }
  }
  const fileB64 = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1] || ""); r.onerror = () => rej(new Error("could not read file")); r.readAsDataURL(file); });
  /* upload a PDF / image / video straight into the repo (media/…) – returns the path used by the app */
  async function ghUploadFile(file, kind, onProg) {
    if (!pat()) throw new Error("Add your GitHub token in ⚙️ Settings first");
    if (file.size > GH_MAX_MB * 1048576) throw new Error(`File is ${(file.size / 1048576).toFixed(1)} MB – GitHub limit here is ${GH_MAX_MB} MB${/video/.test(file.type) ? ". For longer videos use a YouTube (unlisted) link." : ""}`);
    onProg && onProg("reading");
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "_").replace(/_+/g, "_").slice(-60);
    const path = `media/${kind}/${KJ.today()}_${Date.now().toString(36)}_${safe}`;
    const b64data = await fileB64(file); onProg && onProg("uploading");
    await ghCommit([{ path, b64: b64data, size: file.size }], "KJ upload: " + path);
    return path;
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
<p class="small muted">Limit per file: <b>${GH_MAX_MB} MB</b> (largest data file now: ${Math.max(0, ...sizes.map((x) => +x.kb)).toFixed(1)} KB). Media go to Cloudinary, or to the repo's <code>media/</code> folder (up to ${GH_MAX_MB} MB each).</p></div></div>`;
    const log = (m) => { $("#plog").textContent += "\n" + m; $("#plog").scrollTop = 1e9; };
    $("#pub").onclick = async () => {
      if (!pat()) return KJ.toast("Add your GitHub token in Settings first");
      $("#pub").disabled = true;
      /* V13: one commit with all changed files (handles large files) */
      try {
        const list = [...dirty], files = list.map((p) => { const txt = JSON.stringify(W[p], null, 1), bb = b64(txt); return { path: p, b64: bb, size: new Blob([txt]).size }; });
        log("→ " + list.length + " file(s) in one commit");
        await ghCommit(files, "KJ Teacher Upload: " + list.length + " file(s) (" + new Date().toLocaleString() + ")", log);
        list.forEach(clearDirty); log("  ✔ published"); log("All done ✔"); setTimeout(draw, 1500); return;
      } catch (err) {
        log("  ✖ " + err.message + (/401|Bad credentials/.test(err.message) ? "  → token wrong/expired (Settings)" : /403|404/.test(err.message) ? "  → check repo name & token permission: Contents = Read and write" : ""));
        if (/limit is/.test(err.message)) { $("#pub").disabled = false; return; }
        log("Trying file-by-file (older method)…");
      }
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

  /* ---------- V4: Students (Google Sheet master data) ---------- */
  let STU = null;
  P.students = async (el) => {
    const url = cfg().sheet;
    if (!/^https:\/\/script\.google\.com\//.test(url)) {
      el.innerHTML = `<div class="card"><h3 style="margin-top:0">👥 Students</h3><p>Connect the Google Sheet first: <b>⚙️ Settings → Google Sheet</b>. Steps are in README section 0.</p></div>`; return;
    }
    const drawList = () => {
      const q = (S.get("t_sq", "") || "").toLowerCase(), fx = S.get("t_sx", "");
      const H = STU.head, ix = (n) => H.indexOf(n);
      const rows = STU.rows.filter((r) => (!fx || r[ix("Exam")] === fx) && (!q || r.join(" ").toLowerCase().includes(q)));
      const cnt = (col) => { const m = {}; STU.rows.forEach((r) => { const k = String(r[ix(col)] || "—"); m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
      const day = 864e5, now = Date.now();
      const newW = STU.rows.filter((r) => now - new Date(r[ix("Registered On")]) < 7 * day).length;
      const act7 = STU.rows.filter((r) => now - new Date(r[ix("Last Seen")]) < 7 * day).length;
      const d = (v) => (v ? new Date(v).toLocaleDateString() : "");
      el.innerHTML = `<div class="stats">
<div class="stat"><b>${STU.rows.length}</b><span>Total students</span></div><div class="stat"><b>${newW}</b><span>New this week</span></div>
<div class="stat"><b>${act7}</b><span>Active last 7 days</span></div><div class="stat"><b>${cnt("College").length}</b><span>Colleges</span></div></div>
<div class="two" style="margin-top:12px"><div class="card"><h3 style="margin-top:0">By exam</h3><table class="t">${cnt("Exam").map(([k, v]) => `<tr><td>${esc(k)}</td><td><b>${v}</b></td></tr>`).join("")}</table></div>
<div class="card"><h3 style="margin-top:0">Top colleges</h3><table class="t">${cnt("College").slice(0, 10).map(([k, v]) => `<tr><td>${esc(k)}</td><td><b>${v}</b></td></tr>`).join("")}</table></div></div>
<div class="card"><div class="row"><input id="sq" placeholder="Search name / mail / college" value="${esc(S.get("t_sq", ""))}" style="max-width:260px">
<select id="sx" style="max-width:240px"><option value="">All exams</option>${cnt("Exam").map(([k]) => `<option ${k === fx ? "selected" : ""}>${esc(k)}</option>`).join("")}</select>
<span class="sp"></span><span class="small muted">${rows.length} shown</span><button class="btn alt sm" id="srf">⟳ Refresh</button><button class="btn alt sm" id="scsv">⬇ CSV</button></div>
<div style="overflow-x:auto;margin-top:8px"><table class="t"><tr><th>#</th><th>Name</th><th>Mail ID</th><th>Exam</th><th>College</th><th>Registered</th><th>Last seen</th><th>Days</th></tr>
${rows.map((r, n) => `<tr><td>${n + 1}</td><td>${esc(r[ix("Name")])}</td><td>${esc(r[ix("Mail ID")])}</td><td>${esc(r[ix("Exam")])}</td><td>${esc(r[ix("College")])}</td><td class="small">${d(r[ix("Registered On")])}</td><td class="small">${d(r[ix("Last Seen")])}</td><td>${esc(r[ix("Days Active")])}</td></tr>`).join("")}</table></div></div>
<p class="small muted">Live copy of the Google Sheet "Students" tab. Open the sheet itself for full details.</p>`;
      $("#sq").onchange = (e) => { S.set("t_sq", e.target.value); drawList(); };
      $("#sx").onchange = (e) => { S.set("t_sx", e.target.value); drawList(); };
      $("#srf").onclick = () => { STU = null; P.students(el); };
      $("#scsv").onclick = () => {
        const csv = [STU.head, ...rows].map((r) => r.map((x) => '"' + String(x ?? "").replace(/"/g, '""') + '"').join(",")).join("\n");
        download("kj_students_" + KJ.today() + ".csv", "\ufeff" + csv, "text/csv");
      };
    };
    if (STU) return drawList();
    el.innerHTML = '<div class="empty">Loading students from Google Sheet…</div>';
    try {
      const j = await (await fetch(url + "?action=list&key=" + encodeURIComponent(S.get("t_sheetkey", "")))).json();
      if (!j.ok) throw new Error(j.error === "wrong key" ? "Read key is wrong – fix it in ⚙️ Settings" : j.error);
      STU = j; drawList();
    } catch (err) { el.innerHTML = `<div class="card"><b>Could not load students.</b><div class="small" style="color:var(--bad)">${esc(err.message)}</div></div>`; }
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
<div class="card"><h3 style="margin-top:0">📋 Google Sheet – student register</h3>
<label>Apps Script Web app URL (…/exec)</label><input id="gu" value="${esc(G.sheet.startsWith("YOUR_") ? "" : G.sheet)}" placeholder="https://script.google.com/macros/s/…/exec">
<label>Read key (same as READ_KEY in the script)</label><input id="gk" type="password" value="${esc(S.get("t_sheetkey", ""))}">
<p class="small muted">Setup steps: README → section 0 → "Google Sheet setup". Students' app uses the URL from config.js.</p>
<div class="row"><button class="btn alt sm" id="gt">Test sheet</button><span class="small" id="gr"></span></div></div>
<div class="row"><span class="sp"></span><button class="btn ok" id="ss">Save settings</button></div>
<div class="card small" style="margin-top:12px"><b>Lock</b>: to change Setup Code / PIN, open <code>tools/hash_tool.html</code>, make new hashes and paste into <code>config.js → TEACHER_LOCK</code>, then upload config.js.
<div class="row" style="margin-top:6px"><button class="btn alt sm" id="lo">🔒 Lock now</button></div></div>`;
    const saveS = () => { S.set("t_settings", { owner: $("#so").value.trim(), repo: $("#sr").value.trim(), branch: $("#sb").value.trim() || "main", prefix: $("#sp").value.trim(), cloud: $("#cc").value.trim(), preset: $("#cp").value.trim(), folder: $("#cfo").value.trim(), sheet: $("#gu").value.trim() }); S.set("t_pat", $("#st").value.trim()); S.set("t_sheetkey", $("#gk").value.trim()); };
    $("#ss").onclick = () => { saveS(); KJ.toast("Settings saved on this device"); };
    $("#tt").onclick = async () => {
      saveS(); $("#tr").textContent = "Checking…";
      const r = await gh("data/subjects.json");
      $("#tr").textContent = r.ok ? "✔ Connected – can read data/subjects.json" : "✖ " + r.status + " " + (r.j.message || "");
    };
    $("#ct").onchange = async (e) => { saveS(); const f = e.target.files[0]; if (!f) return; $("#cr").textContent = "Uploading…";
      try { const u = await cloudUpload(f, "test"); $("#cr").innerHTML = '✔ <a target="_blank" href="' + esc(u) + '">uploaded</a>'; } catch (err) { $("#cr").textContent = "✖ " + err.message; } };
    $("#lo").onclick = () => { sessionStorage.removeItem("kj_t_ok"); lock(); };
    $("#gt").onclick = async () => {
      saveS(); $("#gr").textContent = "Checking…";
      try {
        const c = await (await fetch(cfg().sheet + "?action=count")).json();
        const l = await (await fetch(cfg().sheet + "?action=list&key=" + encodeURIComponent(S.get("t_sheetkey", "")))).json();
        $("#gr").textContent = "✔ Connected – " + c.count + " students" + (l.ok ? " · key OK" : " · ✖ key wrong (list hidden)");
      } catch (err) { $("#gr").textContent = "✖ " + err.message + " – check the URL and that access is 'Anyone'"; }
    };
  };

  /* ---------------- utilities ---------------- */
  function cloudUpload(file, kind, onProg) {
    const G = cfg();
    if (!G.cloud || G.cloud.startsWith("YOUR_") || !G.preset || G.preset.startsWith("YOUR_"))   // V13: no Cloudinary → upload to GitHub (≤ 25 MB)
      return ghUploadFile(file, kind, (s) => onProg && onProg(s === "uploading" ? 50 : 5));
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
