/* KONCEPT JUNCTION — app.js (V1)  Student Mode */
(function () {
  const KJ = window.KJ, C = KJ.C, $ = KJ.$, esc = KJ.esc, S = KJ.store;
  const app = () => $("#app");

  /* ---------------- shell ---------------- */
  function shell() {
    $("#tb-name").textContent = C.APP_NAME;
    $("#tb-tag").textContent = KJ.lang() === "te" ? C.TAGLINE_TE : C.TAGLINE;
    $("#tb-logo").src = C.LOGO;
    const ls = $("#tb-lang"); ls.value = KJ.lang();
    ls.onchange = () => { S.set("lang", ls.value); render(); };
    $("#tb-theme").onclick = () => {
      const cur = S.get("theme", "auto"), nxt = cur === "auto" ? "dark" : cur === "dark" ? "light" : "auto";
      S.set("theme", nxt); applyTheme(); KJ.toast("Theme: " + nxt);
    };
    applyTheme();
  }
  function applyTheme() {
    const t = S.get("theme", "auto");
    if (t === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", t);
  }
  function nav(active) {
    const items = [["home", "🏠", "home"], ["practice", "📘", "practice"], ["mock", "📝", "mock"], ["papers", "📄", "papers"], ["profile", "👤", "profile"]];
    $("#bnav").innerHTML = items.map(([r, i, k]) => `<a href="#/${r}" class="${active === r ? "on" : ""}"><i>${i}</i>${KJ.t(k)}</a>`).join("");
  }
  const target = () => S.get("target", "appsc_g2");

  /* ---------------- router ---------------- */
  async function render() {
    const parts = (location.hash.replace(/^#\/?/, "") || "home").split("/");
    const r = parts[0];
    if (r !== "exam") document.body.classList.remove("exam");
    if (S.get("live", null) && r !== "exam" && r !== "result" && !render._warned) { render._warned = true; }
    nav(r); shell();
    const el = app();
    el.innerHTML = '<div class="empty">Loading…</div>';
    try {
      const V = views[r] || views.home;
      await V(el, parts.slice(1));
      KJ.math(el);
    } catch (e) {
      console.error(e);
      el.innerHTML = `<div class="card"><b>Could not load data.</b><div class="small muted">${esc(e.message)}</div>
        <p class="small">If you opened the file directly from disk, run it through a local server (see README) or the GitHub Pages link.</p></div>`;
    }
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", render);

  /* ---------------- helpers ---------------- */
  const tile = (href, ic, b, span) => `<a class="tile" href="${href}" style="text-decoration:none"><span class="ic">${ic}</span><b>${b}</b><span>${span || ""}</span></a>`;
  const bm = () => new Set(S.get("bm", []));
  function toggleBm(id) {
    const s = bm(); s.has(id) ? s.delete(id) : s.add(id); S.set("bm", [...s]);
    return s.has(id);
  }

  /* Review card used by results, bookmarks and wrong-answers */
  KJ.reviewCard = function (q, n, a) {
    const isBm = bm().has(q.id);
    const opts = q.type === "conv" ? "" : `<div class="opts">${(q.o?.en || []).map((_, i) => {
      const cls = i === q.a ? "right" : i === a ? "wrong" : "";
      return `<div class="opt ${cls}"><span class="k">${KJ.LETTERS[i]}</span><span>${KJ.optTxt(q, i)}</span></div>`;
    }).join("")}</div>`;
    const verdict = q.type === "conv" ? "" : a == null ? '<span class="pill">Not attempted</span>' : a === q.a ? '<span class="pill" style="color:var(--ok)">Correct</span>' : '<span class="pill" style="color:var(--bad)">Wrong</span>';
    return `<div class="card">
 <div class="row small"><span class="qno">Q${n}</span>${verdict}<span class="tag">${esc(q.topic || "")}${q.year ? " · " + esc(q.year) : ""}</span><span class="sp"></span>
  <button class="btn alt sm" data-bm="${esc(q.id)}">${isBm ? "★" : "☆"}</button></div>
 <div class="qtext">${KJ.txt(q.q)}</div>${q.img ? `<img class="qimg" src="${esc(q.img)}">` : ""}
 ${opts}
 ${q.e && (q.e.en || q.e.te) ? `<div class="exp">${KJ.txt(q.e)}</div>` : ""}
 ${q.video ? `<button class="btn acc sm" style="margin-top:10px" data-vid="${esc(q.video)}">🎬 ${KJ.t("video")}</button>` : ""}
</div>`;
  };
  KJ.bindReview = function (el) {
    el.onclick = (e) => {
      const b = e.target.closest("[data-bm]"); if (b) { b.textContent = toggleBm(b.dataset.bm) ? "★" : "☆"; return; }
      const v = e.target.closest("[data-vid]"); if (v) KJ.playVideo(v.dataset.vid);
    };
  };
  KJ.markDaily = function () {
    const d = S.get("daily", { last: "", streak: 0 }), t = KJ.today();
    if (d.last === t) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    const ys = y.getFullYear() + "-" + String(y.getMonth() + 1).padStart(2, "0") + "-" + String(y.getDate()).padStart(2, "0");
    d.streak = d.last === ys ? d.streak + 1 : 1; d.last = t; S.set("daily", d);
  };

  async function subjectName(id) { const s = await KJ.subject(id); return s ? KJ.nm(s.name) : id; }

  /* build mock paper for an exam pattern */
  async function buildMock(ex) {
    const out = [];
    for (const sec of ex.sections) {
      const bank = (await KJ.bank(sec.subject)).filter((q) => q.type !== "conv");
      const tagged = bank.filter((q) => (q.exams || []).includes(ex.id)), rest = bank.filter((q) => !(q.exams || []).includes(ex.id));
      out.push(...[...KJ.shuffle(tagged), ...KJ.shuffle(rest)].slice(0, sec.count));
    }
    return out;
  }
  async function sectionOfFactory() {
    const subs = await KJ.subjects(); const m = new Map(subs.map((s) => [s.id, KJ.nm(s.name)]));
    return (q) => m.get(q.subject) || q.subject;
  }

  /* ================= VIEWS ================= */
  const views = {};

  views.home = async (el) => {
    const [exams, ann] = await Promise.all([KJ.exams(), KJ.load("data/announcements.json").catch(() => [])]);
    const res = S.get("results", []), d = S.get("daily", { last: "", streak: 0 }), ps = S.get("pstat", { seen: 0, right: 0 });
    const tot = res.reduce((a, r) => [a[0] + r.c, a[1] + r.c + r.w], [0, 0]);
    const acc = tot[1] ? Math.round((tot[0] / tot[1]) * 100) + "%" : "–";
    const live = S.get("live", null), P = S.get("profile", {});
    const ex = exams.find((x) => x.id === target()) || exams[0];
    el.innerHTML = `
<div class="card hero">
  <img src="${esc(C.LOGO)}" alt="logo">
  <div><div class="brandline" style="font-size:16px">${esc(C.APP_NAME)}</div><div class="motto">${esc(C.MOTTO || "")}</div>
  <div class="small muted">${P.name ? "Hi " + esc(P.name) + " 👋 · " : ""}${esc(KJ.lang() === "te" ? C.TAGLINE_TE : C.TAGLINE)}</div></div>
</div>
${live ? `<div class="card" style="border-color:var(--accent)"><div class="row"><b>⏳ ${esc(live.title)}</b><span class="sp"></span><a class="btn acc sm" href="#/exam">${KJ.t("resume")}</a></div></div>` : ""}
<div class="card">
  <label>${KJ.t("target")}</label>
  <select id="tg">${exams.map((x) => `<option value="${x.id}" ${x.id === ex.id ? "selected" : ""}>${esc(KJ.nm(x.name))}</option>`).join("")}</select>
</div>
<div class="stats">
  <div class="stat"><b>${res.length}</b><span>Tests taken</span></div>
  <div class="stat"><b>${acc}</b><span>Test accuracy</span></div>
  <div class="stat"><b>${d.last === KJ.today() || isYesterday(d.last) ? d.streak : 0}🔥</b><span>Daily streak</span></div>
  <div class="stat"><b>${ps.seen}</b><span>Practised</span></div>
</div>
<h2>${esc(KJ.nm(ex.name))}</h2>
<div class="grid">
  ${tile("#/daily", "☀️", KJ.t("daily"), d.last === KJ.today() ? "Done today ✔" : C.DAILY_QUIZ_SIZE + " Qs · today")}
  ${tile("#/mockstart/" + ex.id, "📝", "Full Mock", ex.sections.reduce((a, s) => a + s.count, 0) + " Qs · " + ex.duration_min + " min")}
  ${tile("#/papers", "📄", KJ.t("papers"), "Set-wise papers")}
  ${tile("#/practice", "📘", KJ.t("practice"), "Subject & topic wise")}
  ${tile("#/custom", "⚙️", KJ.t("custom"), "Choose subjects & time")}
  ${tile("#/notes/notes", "📒", KJ.t("notes"), C.NOTES_BRAND)}
  ${tile("#/notes/concepts", "💡", KJ.t("concepts"), C.CONCEPTS_BRAND)}
  ${tile("#/ca", "📰", KJ.t("ca"), "Daily updates")}
  ${tile("#/bookmarks", "★", KJ.t("bookmarks"), bm().size + " saved")}
  ${tile("#/wrong", "❌", KJ.t("wrong"), S.get("wrong", []).length + " to revise")}
  ${tile("#/history", "📊", KJ.t("results"), res.length + " attempts")}
</div>
${ann.length ? `<h2>📢 Announcements</h2>` + ann.slice().sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || String(b.date).localeCompare(a.date)).slice(0, 5).map((a) => `
<div class="card"><div class="row"><b>${KJ.txt(a.title)}</b><span class="sp"></span><span class="tag">${esc(a.date || "")}</span></div>
<div class="small">${KJ.txt(a.body)}</div>${a.link ? `<a class="small" href="${esc(a.link)}" target="_blank" rel="noopener">Open link ↗</a>` : ""}</div>`).join("") : ""}
<p class="small muted" style="text-align:center">${esc(C.APP_NAME)} ${esc(C.VERSION)}</p>`;
    $("#tg").onchange = (e) => { S.set("target", e.target.value); render(); };
  };
  function isYesterday(s) { const y = new Date(); y.setDate(y.getDate() - 1); return s === y.toISOString().slice(0, 10) || s === (y.getFullYear() + "-" + String(y.getMonth() + 1).padStart(2, "0") + "-" + String(y.getDate()).padStart(2, "0")); }

  /* ---------- practice ---------- */
  views.practice = async (el, [sid, topic]) => {
    if (!sid) {
      const subs = await KJ.subjects();
      const counts = await Promise.all(subs.map((s) => KJ.bank(s.id).then((b) => b.length)));
      el.innerHTML = `<h2>📘 ${KJ.t("practice")}</h2><div class="grid">${subs.map((s, i) => tile("#/practice/" + s.id, s.icon || "📘", esc(KJ.nm(s.name)), counts[i] + " Qs")).join("")}</div>`;
      return;
    }
    const bank = await KJ.bank(sid), name = await subjectName(sid);
    const topics = [...new Set(bank.map((q) => q.topic).filter(Boolean))];
    const ex = target();
    let list = topic ? bank.filter((q) => q.topic === decodeURIComponent(topic)) : bank;
    const onlyT = S.get("onlyTarget", false);
    if (onlyT) list = list.filter((q) => (q.exams || []).includes(ex));
    el.innerHTML = `<h2>${esc(name)}</h2>
<div class="row" style="margin-bottom:8px">
 <a class="pill ${!topic ? "acc" : ""}" href="#/practice/${sid}" style="text-decoration:none">All (${bank.length})</a>
 ${topics.map((t) => `<a class="pill ${decodeURIComponent(topic || "") === t ? "acc" : ""}" style="text-decoration:none" href="#/practice/${sid}/${encodeURIComponent(t)}">${esc(t)}</a>`).join("")}
</div>
<label class="row small" style="gap:6px"><input type="checkbox" id="ot" style="width:auto" ${onlyT ? "checked" : ""}> Only questions tagged for my target exam</label>
<div id="pq"></div>`;
    $("#ot").onchange = (e) => { S.set("onlyTarget", e.target.checked); render(); };
    practiceSession($("#pq"), list);
  };

  function practiceSession(el, list) {
    if (!list.length) { el.innerHTML = `<div class="empty">${KJ.t("noq")}</div>`; return; }
    let i = 0;
    const draw = () => {
      const q = list[i];
      const done = {}; // answer state for this view
      el.innerHTML = `<div class="card">
 <div class="row small"><span class="qno">${i + 1} / ${list.length}</span><span class="tag">${esc(q.topic || "")} · ${esc(q.level || "")}${q.year ? " · PYQ " + esc(q.year) : ""}</span><span class="sp"></span>
 <button class="btn alt sm" id="pbm">${bm().has(q.id) ? "★" : "☆"}</button></div>
 <div class="qtext">${KJ.txt(q.q)}</div>${q.img ? `<img class="qimg" src="${esc(q.img)}">` : ""}
 ${q.type === "conv"
   ? `<button class="btn acc sm" id="show">${KJ.t("answer")}</button><div id="ans"></div>`
   : `<div class="opts">${q.o.en.map((_, k) => `<button class="opt" data-o="${k}"><span class="k">${KJ.LETTERS[k]}</span><span>${KJ.optTxt(q, k)}</span></button>`).join("")}</div><div id="ans"></div>`}
 <div class="row" style="margin-top:14px"><button class="btn alt sm" id="pp" ${i ? "" : "disabled"}>◀ ${KJ.t("prev")}</button><span class="sp"></span>
 <button class="btn sm" id="pn" ${i < list.length - 1 ? "" : "disabled"}>Next ▶</button></div></div>`;
      const reveal = (a) => {
        $("#ans", el).innerHTML = (q.e && (q.e.en || q.e.te) ? `<div class="exp">${KJ.txt(q.e)}</div>` : "") +
          (q.video ? `<button class="btn acc sm" style="margin-top:10px" id="vid">🎬 ${KJ.t("video")}</button>` : "");
        if (q.video) $("#vid", el).onclick = () => KJ.playVideo(q.video);
        KJ.math($("#ans", el));
      };
      el.querySelectorAll("[data-o]").forEach((b) => (b.onclick = () => {
        if (done.v != null) return;
        const a = +b.dataset.o; done.v = a;
        el.querySelectorAll("[data-o]").forEach((x, k) => { if (k === q.a) x.classList.add("right"); else if (k === a) x.classList.add("wrong"); });
        const ps = S.get("pstat", { seen: 0, right: 0 }); ps.seen++; if (a === q.a) ps.right++; S.set("pstat", ps);
        const w = new Set(S.get("wrong", [])); a === q.a ? w.delete(q.id) : w.add(q.id); S.set("wrong", [...w]);
        reveal(a);
      }));
      const sh = $("#show", el); if (sh) sh.onclick = () => { reveal(); sh.remove(); };
      $("#pbm", el).onclick = (e) => (e.target.textContent = toggleBm(q.id) ? "★" : "☆");
      $("#pp", el).onclick = () => { i--; draw(); };
      $("#pn", el).onclick = () => { i++; draw(); };
      KJ.math(el);
    };
    draw();
  }

  /* ---------- mocks ---------- */
  views.mock = async (el) => {
    const exams = await KJ.exams();
    el.innerHTML = `<h2>📝 ${KJ.t("mock")}</h2>` + exams.map((x) => {
      const n = x.sections.reduce((a, s) => a + s.count, 0);
      return `<div class="card"><div class="row"><b>${esc(KJ.nm(x.name))}</b><span class="pill">${esc(x.board)}</span>${x.id === target() ? '<span class="pill acc">Target</span>' : ""}</div>
<div class="small muted">${n} Qs · ${x.duration_min} min · +${x.mark} ${x.negative ? "/ −" + (+(x.mark * x.negative).toFixed(2)) : "· no negative"}</div>
${x.note ? `<div class="tag">${esc(x.note)}</div>` : ""}
<div class="row" style="margin-top:8px"><span class="sp"></span><a class="btn sm" href="#/mockstart/${x.id}">Open</a></div></div>`;
    }).join("");
  };
  views.mockstart = async (el, [id]) => {
    const ex = (await KJ.exams()).find((x) => x.id === id);
    if (!ex) { el.innerHTML = '<div class="empty">Exam not found.</div>'; return; }
    const rows = await Promise.all(ex.sections.map(async (s) => ({ s, name: await subjectName(s.subject), have: (await KJ.bank(s.subject)).filter((q) => q.type !== "conv").length })));
    const need = rows.reduce((a, r) => a + r.s.count, 0), have = rows.reduce((a, r) => a + Math.min(r.have, r.s.count), 0);
    const dur = Math.max(1, Math.round(ex.duration_min * (have / need)));
    el.innerHTML = `<div class="card"><h2 style="margin-top:0">${esc(KJ.nm(ex.name))}</h2>
<table class="t"><tr><th>Section</th><th>Pattern</th><th>In bank</th></tr>${rows.map((r) => `<tr><td>${esc(r.name)}</td><td>${r.s.count}</td><td>${Math.min(r.have, r.s.count)}</td></tr>`).join("")}
<tr><th>Total</th><th>${need}</th><th>${have}</th></tr></table>
<ul class="small">
 <li>Duration: <b>${ex.duration_min} min</b> for full paper${have < need ? ` → <b>${dur} min</b> scaled for the ${have} questions available now` : ""}</li>
 <li>Marks: +${ex.mark} per correct${ex.negative ? `, <b>−${+(ex.mark * ex.negative).toFixed(2)}</b> per wrong answer` : ", no negative marking"}</li>
 <li>Use <b>Save &amp; Next</b> to save an answer. Answers marked for review are also evaluated.</li>
 <li>The test auto-submits when time runs out. You can close the app and resume later (timer keeps running).</li>
</ul>
<div class="row"><span class="sp"></span><button class="btn acc" id="go" ${have ? "" : "disabled"}>${KJ.t("start")}</button></div></div>`;
    $("#go").onclick = async () => {
      if (S.get("live", null) && !KJ.confirm("Another test is in progress. Discard it?")) return;
      KJ.Exam.start({ title: KJ.nm(ex.name) + " – Mock", kind: "mock", meta: { exam: ex.id }, questions: await buildMock(ex),
        durationMin: dur, mark: ex.mark, negative: ex.negative, sectionOf: await sectionOfFactory() });
    };
  };

  /* ---------- model papers ---------- */
  views.papers = async (el) => {
    const papers = (await KJ.load("data/papers.json").catch(() => [])).filter((p) => p.visible !== false);
    el.innerHTML = `<h2>📄 ${KJ.t("papers")}</h2>` + (papers.length ? papers.map((p) => `
<div class="card"><div class="row"><b>${esc(KJ.nm(p.title))}</b><span class="sp"></span><span class="pill acc">Set ${esc(p.set || "-")}</span></div>
<div class="small muted">${p.qids.length} Qs · ${p.duration_min} min · +${p.mark}${p.negative ? " / −" + +(p.mark * p.negative).toFixed(2) : ""} · ${esc(p.date || "")}</div>
<div class="row" style="margin-top:8px"><button class="btn alt sm" data-print="${esc(p.id)}">🖨 Paper</button><span class="sp"></span><button class="btn sm" data-start="${esc(p.id)}">${KJ.t("start")}</button></div></div>`).join("")
      : `<div class="empty">No model papers yet.</div>`);
    el.onclick = async (e) => {
      const s = e.target.closest("[data-start]"), pr = e.target.closest("[data-print]");
      const p = papers.find((x) => x.id === (s || pr)?.dataset[s ? "start" : "print"]); if (!p) return;
      const qs = await KJ.byIds(p.qids);
      if (s) KJ.Exam.start({ title: KJ.nm(p.title) + " (Set " + (p.set || "-") + ")", kind: "paper", meta: { paper: p.id }, questions: qs, durationMin: p.duration_min, mark: p.mark, negative: p.negative, sectionOf: await sectionOfFactory() });
      else KJ.printPaper({ title: KJ.nm(p.title), set: p.set, questions: qs, lang: KJ.lang(), showKey: false });
    };
  };

  /* ---------- daily quiz ---------- */
  views.daily = async (el) => {
    const ex = (await KJ.exams()).find((x) => x.id === target());
    const subs = ex ? ex.sections.map((s) => s.subject) : null;
    const pool = (await KJ.allQuestions(subs)).filter((q) => q.type !== "conv");
    const qs = KJ.shuffle(pool, KJ.seeded(KJ.today() + target())).slice(0, C.DAILY_QUIZ_SIZE || 10);
    const d = S.get("daily", {});
    el.innerHTML = `<div class="card"><h2 style="margin-top:0">☀️ ${KJ.t("daily")} · ${KJ.today()}</h2>
<p class="small">${qs.length} questions from ${esc(ex ? KJ.nm(ex.name) : "all subjects")} · ${qs.length} min · same set for every student today.</p>
${d.last === KJ.today() ? '<p class="small" style="color:var(--ok)">✔ You already completed today\'s quiz – you can retake it.</p>' : ""}
<div class="row"><span class="sp"></span><button class="btn acc" id="go" ${qs.length ? "" : "disabled"}>${KJ.t("start")}</button></div></div>`;
    $("#go").onclick = async () => KJ.Exam.start({ title: KJ.t("daily") + " " + KJ.today(), kind: "daily", questions: qs, durationMin: qs.length, mark: 1, negative: ex ? ex.negative : 0, sectionOf: await sectionOfFactory() });
  };

  /* ---------- custom ---------- */
  views.custom = async (el) => {
    const subs = await KJ.subjects();
    const counts = await Promise.all(subs.map((s) => KJ.bank(s.id).then((b) => b.filter((q) => q.type !== "conv").length)));
    el.innerHTML = `<div class="card"><h2 style="margin-top:0">⚙️ ${KJ.t("custom")}</h2>
<label>Subjects</label>${subs.map((s, i) => `<label class="row small" style="gap:6px;color:var(--ink)"><input type="checkbox" style="width:auto" value="${s.id}" ${counts[i] ? "checked" : "disabled"}> ${esc(KJ.nm(s.name))} <span class="muted">(${counts[i]})</span></label>`).join("")}
<div class="row"><div style="flex:1"><label>No. of questions</label><input id="cn" type="number" min="1" value="20"></div>
<div style="flex:1"><label>Minutes</label><input id="cm" type="number" min="1" value="20"></div>
<div style="flex:1"><label>Negative per wrong</label><select id="cg"><option value="0">None</option><option value="0.25">1/4</option><option value="0.3333">1/3</option><option value="0.2">1/5</option></select></div></div>
<div class="row" style="margin-top:12px"><span class="sp"></span><button class="btn acc" id="go">${KJ.t("start")}</button></div></div>`;
    $("#go").onclick = async () => {
      const ids = KJ.$$("input[type=checkbox]:checked", el).map((x) => x.value);
      if (!ids.length) return KJ.toast("Pick at least one subject");
      const pool = (await KJ.allQuestions(ids)).filter((q) => q.type !== "conv");
      const qs = KJ.shuffle(pool).slice(0, Math.max(1, +$("#cn").value || 20));
      KJ.Exam.start({ title: KJ.t("custom"), kind: "custom", questions: qs, durationMin: +$("#cm").value || qs.length, mark: 1, negative: +$("#cg").value, sectionOf: await sectionOfFactory() });
    };
  };

  /* ---------- notes & concepts ---------- */
  views.notes = async (el, [type = "notes"]) => {
    const [all, subs] = await Promise.all([KJ.load("data/notes.json").catch(() => []), KJ.subjects()]);
    const list = all.filter((n) => (n.type || "notes") === type && n.visible !== false);
    const brand = type === "concepts" ? C.CONCEPTS_BRAND : C.NOTES_BRAND;
    const saved = await Promise.all(list.map((n) => KJ.isPdfSaved(n.url)));
    el.innerHTML = `<h2>${type === "concepts" ? "💡 " + KJ.t("concepts") : "📒 " + KJ.t("notes")}</h2>
<div class="card" style="text-align:center"><div class="brandline" style="font-size:15px">${esc(C.APP_NAME)}</div><div class="small muted">${esc(brand)}</div></div>` +
      (list.length ? subs.map((s) => {
        const items = list.map((n, i) => ({ n, i })).filter(({ n }) => n.subject === s.id);
        if (!items.length) return "";
        return `<h3>${s.icon || ""} ${esc(KJ.nm(s.name))}</h3>` + items.map(({ n, i }) => `<div class="card"><div class="row"><b>${KJ.txt(n.title)}</b><span class="sp"></span><span class="tag">${esc(n.date || "")}</span></div>
<div class="row" style="margin-top:8px"><button class="btn sm" data-open="${i}">Open PDF</button><button class="btn alt sm" data-save="${i}">${saved[i] ? "✔ Offline" : "⬇ Save offline"}</button></div></div>`).join("");
      }).join("") : `<div class="empty">No ${type} uploaded yet.</div>`);
    el.onclick = async (e) => {
      const o = e.target.closest("[data-open]"), sv = e.target.closest("[data-save]");
      if (o) KJ.openPdf(list[+o.dataset.open].url);
      if (sv && (await KJ.savePdfOffline(list[+sv.dataset.save].url))) sv.textContent = "✔ Offline";
    };
  };

  /* ---------- current affairs ---------- */
  views.ca = async (el) => {
    const list = (await KJ.load("data/current_affairs.json").catch(() => [])).slice().sort((a, b) => String(b.date).localeCompare(a.date));
    el.innerHTML = `<h2>📰 ${KJ.t("ca")}</h2>` + (list.length ? list.map((c) => `<div class="card"><div class="row"><b>${KJ.txt(c.title)}</b><span class="sp"></span><span class="tag">${esc(c.date)}</span></div>
<div class="small" style="margin-top:4px">${KJ.txt(c.body)}</div>${(c.tags || []).map((t) => `<span class="pill">${esc(t)}</span> `).join("")}</div>`).join("")
      : `<div class="empty">No updates yet.</div>`) +
      `<div class="row"><span class="sp"></span><a class="btn alt sm" href="#/practice/current">Practise current-affairs MCQs</a></div>`;
  };

  /* ---------- bookmarks / wrong ---------- */
  async function idList(el, title, ids, emptyMsg, allowClear) {
    const qs = await KJ.byIds(ids);
    el.innerHTML = `<h2>${title}</h2>${qs.length ? `<div class="row" style="margin-bottom:8px"><button class="btn acc sm" id="rt">Retest these (${qs.filter((q) => q.type !== "conv").length})</button>${allowClear ? '<span class="sp"></span><button class="btn alt sm" id="cl">Clear list</button>' : ""}</div>` : ""}
<div id="lst">${qs.length ? qs.map((q, i) => KJ.reviewCard(q, i + 1)).join("") : `<div class="empty">${emptyMsg}</div>`}</div>`;
    KJ.bindReview($("#lst"));
    if ($("#rt")) $("#rt").onclick = async () => KJ.Exam.start({ title: title + " – Retest", kind: "custom", questions: KJ.shuffle(qs), durationMin: qs.length, mark: 1, negative: 0, sectionOf: await sectionOfFactory() });
    return qs;
  }
  views.bookmarks = (el) => idList(el, "★ " + KJ.t("bookmarks"), [...bm()], "Tap ☆ on any question to bookmark it.");
  views.wrong = async (el) => {
    await idList(el, "❌ " + KJ.t("wrong"), S.get("wrong", []), "No wrong answers to revise 🎉", true);
    if ($("#cl")) $("#cl").onclick = () => { if (KJ.confirm("Clear the wrong-answer list?")) { S.set("wrong", []); render(); } };
  };

  /* ---------- history / result ---------- */
  views.history = async (el) => {
    const res = S.get("results", []);
    el.innerHTML = `<h2>📊 ${KJ.t("results")}</h2>` + (res.length ? `<div class="card"><table class="t"><tr><th>Test</th><th>Date</th><th>Score</th><th></th></tr>
${res.map((r) => `<tr><td>${esc(r.title)}</td><td class="small">${new Date(r.date).toLocaleString()}</td><td><b>${r.score}</b>/${r.max}</td><td><a href="#/result/${r.id}">View</a></td></tr>`).join("")}</table></div>`
      : `<div class="empty">No tests taken yet.</div>`);
  };
  views.result = (el, [id]) => KJ.Exam.renderResult(el, id);
  views.exam = (el) => KJ.Exam.render(el);

  /* ---------- profile ---------- */
  views.profile = async (el) => {
    const P = S.get("profile", {});
    el.innerHTML = `<div class="card hero"><img src="${esc(C.LOGO)}" alt=""><div><div class="brandline" style="font-size:16px">${esc(C.APP_NAME)}</div><div class="motto">${esc(C.MOTTO || "")}</div></div></div>
<div class="card"><h3 style="margin-top:0">👤 ${KJ.t("profile")}</h3>
<label>Name (shown in exam hall)</label><input id="pn" value="${esc(P.name || "")}">
<label>Mobile (optional)</label><input id="pm" value="${esc(P.mobile || "")}" inputmode="tel">
<div class="row" style="margin-top:10px"><span class="sp"></span><button class="btn sm" id="ps">Save</button></div></div>
<div class="card"><h3 style="margin-top:0">🗂 Data on this phone</h3>
<p class="small muted">Results, bookmarks and progress are saved only on this device.</p>
<div class="row"><button class="btn alt sm" id="cr">Clear results</button><button class="btn alt sm" id="cp">Clear saved PDFs</button><button class="btn bad sm" id="ca">Reset everything</button></div></div>
<div class="card small"><b>${esc(C.APP_NAME)}</b> ${esc(C.VERSION)} · build ${esc(C.BUILD_DATE)}<br>
Contact: <a href="mailto:${esc(C.CONTACT_EMAIL)}">${esc(C.CONTACT_EMAIL)}</a>${C.CONTACT_PHONE ? " · " + esc(C.CONTACT_PHONE) : ""}<br>
<a href="teacher.html" class="muted" style="font-size:11px">Teacher login</a></div>`;
    $("#ps").onclick = () => { S.set("profile", { name: $("#pn").value.trim(), mobile: $("#pm").value.trim() }); KJ.toast("Saved"); };
    $("#cr").onclick = () => { if (KJ.confirm("Delete all results?")) { S.set("results", []); KJ.toast("Cleared"); } };
    $("#cp").onclick = async () => { try { await caches.delete("kj-pdf"); } catch (e) {} KJ.toast("Saved PDFs removed"); };
    $("#ca").onclick = () => { if (KJ.confirm("Reset all app data on this phone?")) { Object.keys(localStorage).filter((k) => k.startsWith("kj_")).forEach((k) => localStorage.removeItem(k)); render(); } };
  };

  /* ---------------- boot ---------------- */
  document.addEventListener("DOMContentLoaded", () => {
    if (!S.get("lang", null)) S.set("lang", C.DEFAULT_LANG || "bi");
    KJ.registerSW();
    render();
  });
})();
