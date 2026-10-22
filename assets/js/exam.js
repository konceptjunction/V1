/* KONCEPT JUNCTION — exam.js (V1)
   Exam-hall engine (TCS iON style): sections, timer, question palette,
   Save & Next / Mark for Review / Clear Response, negative marking,
   auto-submit, resume after reload, result + solution review. */
(function () {
  const KJ = window.KJ, $ = KJ.$, esc = KJ.esc;
  const E = (KJ.Exam = {});
  let st = null, tick = null;

  const save = () => st && KJ.store.set("live", st);
  E.live = () => KJ.store.get("live", null);

  /* cfg: {title, kind, questions, durationMin, mark, negative, sectionOf?(q)->name} */
  E.start = function (cfg) {
    const qs = cfg.questions.filter((q) => q.type !== "conv");
    if (!qs.length) { KJ.toast(KJ.t("noq")); return; }
    const secMap = new Map();
    qs.forEach((q, i) => {
      const name = cfg.sectionOf ? cfg.sectionOf(q) : "All";
      if (!secMap.has(name)) secMap.set(name, []);
      secMap.get(name).push(i);
    });
    st = {
      id: KJ.uid("r"), title: cfg.title, kind: cfg.kind || "mock", meta: cfg.meta || {},
      qs, secs: Array.from(secMap, ([name, idx]) => ({ name, idx })),
      dur: Math.max(1, Math.round(cfg.durationMin || qs.length)), mark: +cfg.mark || 1, neg: +cfg.negative || 0,
      startAt: Date.now(), endAt: Date.now() + Math.max(1, Math.round(cfg.durationMin || qs.length)) * 60000,
      ans: {}, marked: {}, visited: { 0: 1 }, cur: 0, sec: 0, pending: null
    };
    save();
    location.hash = "#/exam";
  };

  E.render = function (root) {
    st = E.live();
    if (!st) { location.hash = "#/home"; return; }
    document.body.classList.add("exam");
    const P = KJ.store.get("profile", {});
    root.innerHTML = `
<div class="xh">
  <div class="xh-top">
    <img src="${esc(KJ.C.LOGO)}" alt="" style="width:30px;height:30px;border-radius:50%;background:#fff">
    <b>${esc(st.title)}</b>
    <select id="xlang" class="tb-btn" style="background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:8px;padding:4px">
      <option value="bi">EN+తె</option><option value="en">EN</option><option value="te">తెలుగు</option></select>
    <span class="timer" id="xt">--:--</span>
    <button class="tb-btn palbtn" id="xpb" style="background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:8px;padding:4px 9px">☰</button>
  </div>
  <div class="xh-sec" id="xs"></div>
  <div class="xh-body">
    <div class="xh-q" id="xq"></div>
    <div class="xh-pal" id="xp"></div>
  </div>
  <div class="xh-bar">
    <button class="btn rev sm" id="bm">${KJ.t("mark")}</button>
    <button class="btn alt sm" id="bc">${KJ.t("clear")}</button>
    <span class="sp"></span>
    <button class="btn alt sm" id="bp">${KJ.t("prev")}</button>
    <button class="btn ok sm" id="bn">${KJ.t("next")}</button>
  </div>
</div>`;
    $("#xlang").value = KJ.lang();
    $("#xlang").onchange = (e) => { KJ.store.set("lang", e.target.value); drawQ(); };
    $("#xpb").onclick = () => $("#xp").classList.toggle("open");
    $("#bn").onclick = () => { commit(); go(st.cur + 1); };
    $("#bm").onclick = () => { commit(); st.marked[st.cur] = 1; go(st.cur + 1); };
    $("#bc").onclick = () => { delete st.ans[st.cur]; st.pending = null; save(); drawQ(); drawPal(); };
    $("#bp").onclick = () => go(st.cur - 1);
    window.onbeforeunload = () => "Test in progress";
    drawAll();
    clearInterval(tick); tick = setInterval(timer, 1000); timer();
    E._name = P.name || "";
  };

  function commit() {
    if (st.pending != null) st.ans[st.cur] = st.pending;
    st.pending = null; save();
  }
  function secOf(i) { return st.secs.findIndex((s) => s.idx.includes(i)); }
  function go(i) {
    if (i < 0) return;
    if (i >= st.qs.length) { i = st.qs.length - 1; KJ.toast("Last question – use Submit when done"); }
    st.pending = null; st.cur = i; st.visited[i] = 1; st.sec = Math.max(0, secOf(i)); save();
    $("#xp").classList.remove("open");
    drawAll();
  }
  function drawAll() { drawSecs(); drawQ(); drawPal(); }

  function drawSecs() {
    const el = $("#xs");
    if (st.secs.length < 2) { el.classList.add("hide"); return; }
    el.innerHTML = st.secs.map((s, k) => `<button class="${k === st.sec ? "on" : ""}" data-s="${k}">${esc(s.name)} (${s.idx.length})</button>`).join("");
    el.onclick = (e) => { const b = e.target.closest("[data-s]"); if (b) go(st.secs[+b.dataset.s].idx[0]); };
  }

  function drawQ() {
    const q = st.qs[st.cur], el = $("#xq");
    const sel = st.pending != null ? st.pending : st.ans[st.cur];
    el.innerHTML = `
<div class="row small muted"><span class="qno">Question ${st.cur + 1} of ${st.qs.length}</span><span class="sp"></span>
<span class="pill">+${st.mark}${st.neg ? " / −" + +(st.mark * st.neg).toFixed(2) : ""}</span></div>
<div class="qtext">${KJ.txt(q.q)}</div>
${q.img ? `<img class="qimg" src="${esc(q.img)}" alt="">` : ""}
<div class="opts">${(q.o?.en || []).map((_, i) => `<button class="opt ${sel === i ? "sel" : ""}" data-o="${i}"><span class="k">${KJ.LETTERS[i]}</span><span>${KJ.optTxt(q, i)}</span></button>`).join("")}</div>`;
    el.onclick = (e) => {
      const b = e.target.closest("[data-o]"); if (!b) return;
      st.pending = +b.dataset.o; save();
      KJ.$$(".opt", el).forEach((x) => x.classList.toggle("sel", x === b));
    };
    KJ.math(el); el.scrollTop = 0;
  }

  function status(i) {
    const a = st.ans[i] != null, m = !!st.marked[i];
    if (a && m) return "am"; if (m) return "mr"; if (a) return "an"; if (st.visited[i]) return "na"; return "";
  }
  function counts() {
    const c = { an: 0, na: 0, nv: 0, mr: 0, am: 0 };
    st.qs.forEach((_, i) => { const s = status(i); c[s || "nv"]++; });
    return c;
  }
  function drawPal() {
    const c = counts(), sec = st.secs[st.sec];
    $("#xp").innerHTML = `
<div class="row" style="margin-bottom:10px"><b class="small">👤 ${esc(E._name || "Candidate")}</b></div>
<div class="legend">
 <span><i class="pb an">${c.an}</i>Answered</span><span><i class="pb na">${c.na}</i>Not Answered</span>
 <span><i class="pb">${c.nv}</i>Not Visited</span><span><i class="pb mr">${c.mr}</i>Marked</span>
 <span style="grid-column:1/3"><i class="pb am">${c.am}</i>Answered &amp; Marked (evaluated)</span>
</div>
<div class="small muted" style="margin-bottom:6px">${esc(sec ? sec.name : "")}</div>
<div class="pal">${(sec ? sec.idx : st.qs.map((_, i) => i)).map((i) => `<button class="pb ${status(i)} ${i === st.cur ? "cur" : ""}" data-q="${i}">${i + 1}</button>`).join("")}</div>
<button class="btn bad" id="bs" style="width:100%;margin-top:16px">${KJ.t("submit")}</button>`;
    $("#xp").onclick = (e) => { const b = e.target.closest("[data-q]"); if (b) go(+b.dataset.q); };
    $("#bs").onclick = () => {
      commit(); const k = counts();
      if (KJ.confirm(`Submit test?\n\nAnswered: ${k.an + k.am}\nNot answered: ${k.na + k.mr}\nNot visited: ${k.nv}`)) finish();
    };
  }

  function timer() {
    if (!st) return;
    const left = Math.max(0, Math.round((st.endAt - Date.now()) / 1000));
    const el = $("#xt"); if (!el) { clearInterval(tick); return; }
    const h = Math.floor(left / 3600), m = Math.floor((left % 3600) / 60), s = left % 60;
    el.textContent = (h ? h + ":" : "") + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    el.classList.toggle("low", left <= 300);
    if (left <= 0) { KJ.toast("Time up – auto submitted"); commit(); finish(); }
  }

  function finish() {
    clearInterval(tick); window.onbeforeunload = null;
    const rec = E.evaluate(st);
    const hist = KJ.store.get("results", []);
    hist.unshift(rec); KJ.store.set("results", hist.slice(0, 30));
    // wrong-answer bank
    const wrong = new Set(KJ.store.get("wrong", []));
    rec.qs.forEach((q, i) => { if (rec.ans[i] != null && rec.ans[i] !== q.a) wrong.add(q.id); else if (rec.ans[i] === q.a) wrong.delete(q.id); });
    KJ.store.set("wrong", [...wrong]);
    KJ.addStats && KJ.addStats("tstat_sub", rec.qs.map((q, i) => [q, rec.ans[i] === q.a, rec.ans[i] != null]).filter((x) => x[2]));  // V3
    if (rec.kind === "daily") KJ.markDaily && KJ.markDaily();
    KJ.store.del("live"); st = null;
    document.body.classList.remove("exam");
    location.hash = "#/result/" + rec.id;
  }

  E.evaluate = function (s) {
    let c = 0, w = 0, u = 0;
    const per = s.secs.map((sec) => ({ name: sec.name, n: sec.idx.length, c: 0, w: 0, u: 0, score: 0 }));
    s.qs.forEach((q, i) => {
      const k = s.secs.findIndex((x) => x.idx.includes(i)), a = s.ans[i];
      if (a == null) { u++; per[k].u++; } else if (a === q.a) { c++; per[k].c++; } else { w++; per[k].w++; }
    });
    const sc = (cc, ww) => Math.round((cc * s.mark - ww * s.mark * s.neg) * 100) / 100;
    per.forEach((p) => (p.score = sc(p.c, p.w)));
    return {
      id: s.id, title: s.title, kind: s.kind, meta: s.meta, date: new Date().toISOString(),
      used: Math.min(s.dur * 60, Math.round((Date.now() - s.startAt) / 1000)), dur: s.dur,
      mark: s.mark, neg: s.neg, qs: s.qs, ans: s.ans, secs: s.secs,
      c, w, u, score: sc(c, w), max: s.qs.length * s.mark, per
    };
  };

  /* ---------------- result + review ---------------- */
  E.renderResult = function (root, id) {
    document.body.classList.remove("exam");
    const rec = KJ.store.get("results", []).find((r) => r.id === id);
    if (!rec) { root.innerHTML = '<div class="empty">Result not found.</div>'; return; }
    const acc = rec.c + rec.w ? Math.round((rec.c / (rec.c + rec.w)) * 100) : 0;
    const pct = rec.max ? Math.max(0, rec.score) / rec.max : 0;
    const mm = (t) => Math.floor(t / 60) + "m " + (t % 60) + "s";
    root.innerHTML = `
<div class="card">
 <div class="brandline">${esc(KJ.C.APP_NAME)} · ${esc(KJ.C.MOTTO || "")}</div>
 <h2 style="margin-top:4px">${esc(rec.title)}</h2>
 <div class="score">
  <div class="ring" style="background:conic-gradient(var(--ok) ${pct * 360}deg,var(--line) 0)"><div style="background:var(--card);width:86px;height:86px;border-radius:50%;display:grid;place-items:center">${rec.score}</div></div>
  <div>
   <div><b>${rec.score}</b> / ${rec.max} marks ${rec.neg ? `<span class="pill">−${+(rec.mark * rec.neg).toFixed(2)} per wrong</span>` : ""}</div>
   <div class="small muted">✅ ${rec.c} correct · ❌ ${rec.w} wrong · ⏭ ${rec.u} unattempted</div>
   <div class="small muted">🎯 Accuracy ${acc}% · ⏱ ${mm(rec.used)} of ${rec.dur} min</div>
  </div>
 </div>
 ${rec.per.length > 1 ? `<table class="t" style="margin-top:12px"><tr><th>Section</th><th>Qs</th><th>✅</th><th>❌</th><th>⏭</th><th>Score</th></tr>
 ${rec.per.map((p) => `<tr><td>${esc(p.name)}</td><td>${p.n}</td><td>${p.c}</td><td>${p.w}</td><td>${p.u}</td><td><b>${p.score}</b></td></tr>`).join("")}</table>` : ""}
 <div class="row noprint" style="margin-top:12px">
  <button class="btn sm" data-f="all">All</button><button class="btn alt sm" data-f="w">Wrong</button>
  <button class="btn alt sm" data-f="u">Unattempted</button><button class="btn alt sm" data-f="c">Correct</button>
  <span class="sp"></span><button class="btn acc sm" id="rp">🖨 Print / PDF</button>
 </div>
</div>
<div id="rv"></div>`;
    const draw = (f) => {
      const rows = rec.qs.map((q, i) => ({ q, i, a: rec.ans[i] })).filter(({ q, a }) =>
        f === "all" || (f === "w" && a != null && a !== q.a) || (f === "u" && a == null) || (f === "c" && a === q.a));
      $("#rv").innerHTML = rows.length ? rows.map(({ q, i, a }) => KJ.reviewCard(q, i + 1, a)).join("") : '<div class="empty">Nothing here.</div>';
      KJ.bindReview($("#rv")); KJ.math($("#rv"));
    };
    root.querySelector(".row.noprint").onclick = (e) => {
      const b = e.target.closest("[data-f]"); if (!b) return;
      KJ.$$("[data-f]", root).forEach((x) => (x.className = "btn sm " + (x === b ? "" : "alt")));
      draw(b.dataset.f);
    };
    $("#rp").onclick = () => window.print();
    draw("all");
  };
})();
