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
    const pb = $("#tb-prof");
    if (pb) {
      const nm = (S.get("profile", {}).name || "").trim();
      pb.textContent = nm ? nm[0].toUpperCase() : "👤";
      pb.classList.toggle("on", /^#\/profile/.test(location.hash));
    }
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
    /* V3: Subjects (was Practice) · Topic Tests (was Model Papers) · Performance (was Profile – Profile moved to top-right) */
    const items = [["home", "🏠", "home"], ["subjects", "📚", "practice"], ["mock", "📝", "mock"], ["topictests", "🎯", "papers"], ["performance", "📊", "perf"]];
    $("#bnav").innerHTML = items.map(([r, i, k]) => `<a href="#/${r}" class="${active === r ? "on" : ""}"><i>${i}</i>${KJ.t(k)}</a>`).join("");
  }
  const target = () => S.get("target", "appsc_g2");

  /* ---------------- router ---------------- */
  async function render() {
    const parts = (location.hash.replace(/^#\/?/, "") || "home").split("/");
    const ALIAS = { practice: "subjects", papers: "topictests", history: "performance" };   // V3: old links still work
    const r = ALIAS[parts[0]] || parts[0];
    if (r !== "exam") document.body.classList.remove("exam");
    if (S.get("live", null) && r !== "exam" && r !== "result" && !render._warned) { render._warned = true; }
    /* V4: first page = plain registration until the student has registered */
    if (!KJ.student() && r !== "exam") {
      document.body.classList.add("reg"); shell(); $("#bnav").innerHTML = "";
      try { await views.welcome(app()); } catch (e) { console.error(e); app().innerHTML = '<div class="card">Could not load. Check your internet once and reopen.</div>'; }
      window.scrollTo(0, 0); return;
    }
    document.body.classList.remove("reg");
    nav(r === "result" ? "performance" : r); shell();
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
 <div class="qtext">${KJ.qHtml(q.q)}</div>${q.img ? `<img class="qimg" src="${esc(q.img)}">` : ""}
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

  /* ================= V4: student register ================= */
  KJ.student = () => S.get("student", null);
  /* Sends the student's details to the teacher's Google Sheet (Apps Script web app).
     Uses no-cors + text/plain so it works from GitHub Pages without CORS setup.
     If offline or not configured, it is retried on the next open / when back online. */
  KJ.sync = async function (type) {
    const st = KJ.student(); if (!st) return false;
    const url = (C.SHEET && C.SHEET.webapp_url) || "";
    if (!/^https:\/\/script\.google\.com\//.test(url) || !navigator.onLine) { S.set("sync_pending", true); return false; }
    const body = JSON.stringify({ type, id: st.id, name: st.name, email: st.email, exam: st.exam, examId: st.examId, college: st.college,
      mobile: st.mobile || "", ver: C.VERSION, ua: navigator.userAgent.slice(0, 120) });
    try {
      await fetch(url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body });
      S.set("sync_pending", false); S.set("seen_day", KJ.today()); return true;
    } catch (e) { S.set("sync_pending", true); return false; }
  };
  /* V10: is this Mail ID already in the teacher's sheet?  → returns {id,name,email,exam,examId,college} or null */
  KJ.lookupStudent = async function (email) {
    const url = (C.SHEET && C.SHEET.webapp_url) || "";
    if (!/^https:\/\/script\.google\.com\//.test(url) || !navigator.onLine) return null;
    try {
      const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 8000);
      const j = await (await fetch(url + "?action=lookup&email=" + encodeURIComponent(email), { signal: ctl.signal })).json();
      clearTimeout(tm);
      return j && j.ok && j.found && j.student ? j.student : null;
    } catch (e) { return null; }
  };
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function regFields(exams, st, withMobile) {
    const known = exams.some((x) => x.id === st.examId);
    return `
<label for="re">Mail ID <span class="t-te">/ ఈమెయిల్</span></label>
<input id="re" type="email" inputmode="email" autocomplete="email" maxlength="120" value="${esc(st.email || "")}">
<div id="rfound" class="reg-found hide" role="status"></div>
<label for="rn">Student name <span class="t-te">/ విద్యార్థి పేరు</span></label>
<input id="rn" autocomplete="name" maxlength="80" value="${esc(st.name || "")}">
<label for="rx">Exam to be prepared <span class="t-te">/ సిద్ధమవుతున్న పరీక్ష</span></label>
<select id="rx"><option value="">Select exam</option>${exams.map((x) => `<option value="${x.id}" ${x.id === st.examId ? "selected" : ""}>${esc(x.name.en)}</option>`).join("")}
<option value="other" ${st.examId === "other" || (st.examId && !known) ? "selected" : ""}>Other exam</option></select>
<input id="rxo" class="${st.examId === "other" ? "" : "hide"}" maxlength="80" placeholder="Type the exam name" value="${esc(st.examId === "other" ? st.exam || "" : "")}">
<label for="rc">College name <span class="t-te">/ కళాశాల పేరు</span></label>
<input id="rc" autocomplete="organization" maxlength="120" value="${esc(st.college || "")}">
${withMobile ? `<label for="rm">Mobile (optional) <span class="t-te">/ మొబైల్</span></label><input id="rm" inputmode="tel" maxlength="15" value="${esc(st.mobile || "")}">` : ""}`;
  }
  function bindRegFields() { $("#rx").onchange = () => { $("#rxo").classList.toggle("hide", $("#rx").value !== "other"); if ($("#rx").value === "other") $("#rxo").focus(); }; }
  function readReg(exams) {
    const name = $("#rn").value.trim().replace(/\s+/g, " "), email = $("#re").value.trim().toLowerCase(), xid = $("#rx").value, college = $("#rc").value.trim().replace(/\s+/g, " ");
    const other = $("#rxo").value.trim();
    if (name.length < 2) return { err: "Enter the student name.", f: "#rn" };
    if (!EMAIL_RE.test(email)) return { err: "Enter a valid Mail ID, like name@gmail.com.", f: "#re" };
    if (!xid) return { err: "Select the exam you are preparing for.", f: "#rx" };
    if (xid === "other" && !other) return { err: "Type the exam name.", f: "#rxo" };
    if (college.length < 2) return { err: "Enter the college name.", f: "#rc" };
    const ex = exams.find((x) => x.id === xid);
    return { data: { name, email, examId: xid, exam: ex ? ex.name.en : other, college, mobile: $("#rm") ? $("#rm").value.trim() : undefined } };
  }

  /* V3: cumulative subject / topic accuracy.  key = "pstat_sub" (practice) or "tstat_sub" (tests) */
  KJ.addStats = function (key, pairs) {
    const st = S.get(key, {});
    pairs.forEach(([q, ok]) => {
      const s = (st[q.subject] = st[q.subject] || { a: 0, c: 0, t: {} });
      s.a++; if (ok) s.c++;
      const tp = q.topic || "General", t = (s.t[tp] = s.t[tp] || { a: 0, c: 0 });
      t.a++; if (ok) t.c++;
    });
    S.set(key, st);
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
  ${tile("#/topictests", "🎯", KJ.t("papers"), "Subject & topic wise tests")}
  ${tile("#/subjects", "📚", KJ.t("practice"), "Practise topic by topic")}
  ${tile("#/custom", "⚙️", KJ.t("custom"), "Choose subjects & time")}
  ${tile("#/notes/notes", "📒", KJ.t("notes"), C.NOTES_BRAND)}
  ${tile("#/notes/concepts", "💡", KJ.t("concepts"), C.CONCEPTS_BRAND)}
  ${tile("#/ca", "📰", KJ.t("ca"), "Daily updates")}
  ${tile("#/bookmarks", "★", KJ.t("bookmarks"), bm().size + " saved")}
  ${tile("#/wrong", "❌", KJ.t("wrong"), S.get("wrong", []).length + " to revise")}
  ${tile("#/performance", "📊", KJ.t("perf"), res.length + " tests · " + acc + " accuracy")}
</div>
${ann.length ? `<h2>📢 Announcements</h2>` + ann.slice().sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || String(b.date).localeCompare(a.date)).slice(0, 5).map((a) => `
<div class="card"><div class="row"><b>${KJ.txt(a.title)}</b><span class="sp"></span><span class="tag">${esc(a.date || "")}</span></div>
<div class="small">${KJ.txt(a.body)}</div>${a.link ? `<a class="small" href="${esc(a.link)}" target="_blank" rel="noopener">Open link ↗</a>` : ""}</div>`).join("") : ""}
<p class="small muted" style="text-align:center">${esc(C.APP_NAME)} ${esc(C.VERSION)}</p>`;
    $("#tg").onchange = (e) => {
      S.set("target", e.target.value);
      const st = KJ.student(), x = exams.find((y) => y.id === e.target.value);
      if (st && x) { st.examId = x.id; st.exam = x.name.en; S.set("student", st); KJ.sync("update"); }   // V4: keep teacher's sheet current
      render();
    };
  };
  function isYesterday(s) { const y = new Date(); y.setDate(y.getDate() - 1); return s === y.toISOString().slice(0, 10) || s === (y.getFullYear() + "-" + String(y.getMonth() + 1).padStart(2, "0") + "-" + String(y.getDate()).padStart(2, "0")); }

  /* ---------- practice ---------- */
  views.practice = async (el, [sid, topic]) => {
    if (!sid) {
      const subs = await KJ.subjects();
      const counts = await Promise.all(subs.map((s) => KJ.bank(s.id).then((b) => b.length)));
      const pss = S.get("pstat_sub", {}), tss = S.get("tstat_sub", {});
      const accOf = (id) => { const a = (pss[id]?.a || 0) + (tss[id]?.a || 0), c = (pss[id]?.c || 0) + (tss[id]?.c || 0); return a ? " · " + Math.round((c / a) * 100) + "% accuracy" : ""; };
      el.innerHTML = `<h2>📚 ${KJ.t("practice")}</h2><div class="grid">${subs.map((s, i) => tile("#/subjects/" + s.id, s.icon || "📚", esc(KJ.nm(s.name)), counts[i] + " Qs" + accOf(s.id))).join("")}</div>`;
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
 <a class="pill ${!topic ? "acc" : ""}" href="#/subjects/${sid}" style="text-decoration:none">All (${bank.length})</a>
 ${topics.map((t) => `<a class="pill ${decodeURIComponent(topic || "") === t ? "acc" : ""}" style="text-decoration:none" href="#/subjects/${sid}/${encodeURIComponent(t)}">${esc(t)}</a>`).join("")}
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
 <div class="qtext">${KJ.qHtml(q.q)}</div>${q.img ? `<img class="qimg" src="${esc(q.img)}">` : ""}
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
        KJ.addStats("pstat_sub", [[q, a === q.a]]);
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
 <li>The test auto-submits when time runs out. Every test starts with a <b>fresh full timer</b>. If you leave the test, the timer pauses and continues from the same time when you Resume.</li>
</ul>
<div class="row"><span class="sp"></span><button class="btn acc" id="go" ${have ? "" : "disabled"}>${KJ.t("start")}</button></div></div>`;
    $("#go").onclick = async () => {
      KJ.Exam.start({ title: KJ.nm(ex.name) + " – Mock", kind: "mock", meta: { exam: ex.id }, questions: await buildMock(ex),
        durationMin: dur, mark: ex.mark, negative: ex.negative, sectionOf: await sectionOfFactory() });
    };
  };

  /* ---------- V4: first page (registration) ---------- */
  views.welcome = async (el) => {
    const exams = await KJ.exams(), old = S.get("profile", {});
    el.innerHTML = `<div class="reg-wrap">
<img class="reg-logo" src="${esc(C.LOGO)}" alt="KONCEPT JUNCTION logo">
<h1 class="reg-name">${esc(C.APP_NAME)}</h1><div class="reg-motto">${esc(C.MOTTO || "")}</div>
<p class="reg-intro">Register once to start. Already registered? Type the same Mail ID.<br><span class="t-te">ఒకసారి నమోదు చేసుకుని ప్రారంభించండి. ఇప్పటికే నమోదైతే అదే ఈమెయిల్ ఇవ్వండి.</span></p>
<form class="reg-form" id="rf" novalidate>${regFields(exams, { name: old.name || "", examId: S.get("target", "") }, false)}
<div class="reg-err" id="rerr" role="alert"></div>
<button class="btn acc reg-btn" type="submit" id="rgo">Continue</button></form>
<p class="small muted reg-note">Your details are kept by ${esc(C.APP_NAME)} (${esc(C.NOTES_BRAND.replace(/^Notes by /, ""))}) for student records only.</p></div>`;
    bindRegFields();
    /* V10: check the Mail ID against the teacher's student register */
    let found = null, checked = "";
    const enter = async (rec) => {                     // already registered → log in with the existing record
      const st = { id: rec.id, name: rec.name, email: rec.email, examId: rec.examId || "", exam: rec.exam || "", college: rec.college || "", mobile: rec.mobile || old.mobile || "", regAt: rec.registeredOn || new Date().toISOString() };
      S.set("student", st); S.set("profile", { name: st.name, mobile: st.mobile });
      if (st.examId && st.examId !== "other" && exams.some((x) => x.id === st.examId)) S.set("target", st.examId);
      KJ.sync("seen");
      KJ.toast("Welcome back, " + st.name.split(" ")[0] + "!");
      if (location.hash === "#/home" || !location.hash) render(); else location.hash = "#/home";
    };
    const check = async () => {
      const email = $("#re").value.trim().toLowerCase();
      if (!EMAIL_RE.test(email) || email === checked) return found;
      checked = email; const box = $("#rfound");
      box.className = "reg-found"; box.textContent = "Checking this Mail ID…";
      found = await KJ.lookupStudent(email);
      if ($("#re").value.trim().toLowerCase() !== email) return found;      // student kept typing
      if (found) {
        box.innerHTML = `<span>✔ <b>${esc(found.name)}</b>, you are already registered${found.exam ? " (" + esc(found.exam) + ")" : ""}.</span> <button type="button" class="btn ok sm" id="rback">Continue as ${esc(found.name.split(" ")[0])}</button>`;
        $("#rback").onclick = () => enter(found);
        $("#rn").value = found.name; $("#rc").value = found.college || "";
        if (found.examId && [...$("#rx").options].some((o) => o.value === found.examId)) $("#rx").value = found.examId;
        $("#rgo").textContent = "Continue";
      } else { box.className = "reg-found hide"; box.textContent = ""; }
      return found;
    };
    $("#re").addEventListener("change", check);
    $("#re").addEventListener("blur", check);
    $("#rf").addEventListener("submit", async (e) => {
      e.preventDefault();
      const r = readReg(exams);
      if (r.err) { $("#rerr").textContent = r.err; $(r.f).focus(); return; }
      $("#rgo").disabled = true; $("#rgo").textContent = "Checking…";
      const rec = (await check()) || found;
      if (rec && rec.email === r.data.email) return enter({ ...rec, name: r.data.name || rec.name, college: r.data.college || rec.college, examId: r.data.examId, exam: r.data.exam });
      $("#rgo").disabled = false;
      const st = { id: KJ.uid("st"), ...r.data, mobile: old.mobile || "", regAt: new Date().toISOString() };
      S.set("student", st);
      S.set("profile", { name: st.name, mobile: st.mobile });
      if (st.examId !== "other") S.set("target", st.examId);
      $("#rgo").disabled = true; $("#rgo").textContent = "Saving…";
      await KJ.sync("register");
      KJ.toast("Welcome, " + st.name.split(" ")[0] + "!");
      if (location.hash === "#/home" || !location.hash) render(); else location.hash = "#/home";
    });
  };

  /* ---------- topic tests (V3: was Model Papers) ---------- */
  views.topictests = async (el, [sf]) => {
    const [all, subs] = await Promise.all([KJ.load("data/papers.json").catch(() => []), KJ.subjects()]);
    const papers = all.filter((p) => p.visible !== false);
    const res = S.get("results", []);
    const att = (id) => res.filter((r) => r.meta && r.meta.paper === id);
    const sel = sf ? decodeURIComponent(sf) : "";
    const present = subs.filter((s) => papers.some((p) => p.subject === s.id));
    const groups = [...present, ...(papers.some((p) => !subs.find((s) => s.id === p.subject)) ? [{ id: "_", name: { en: "General", te: "సాధారణం" }, icon: "📄" }] : [])]
      .filter((g) => !sel || g.id === sel);
    const card = (p) => {
      const a = att(p.id), best = a.length ? a.reduce((m, r) => (r.score > m.score ? r : m), a[0]) : null;
      return `<div class="card"><div class="row"><b>${esc(KJ.nm(p.title))}</b><span class="sp"></span><span class="pill acc">Set ${esc(p.set || "-")}</span></div>
<div class="small">${p.topic ? "📌 " + esc(p.topic) : ""}</div>
<div class="small muted">${p.qids.length} Qs · ${p.duration_min} min · +${p.mark}${p.negative ? " / −" + +(p.mark * p.negative).toFixed(2) : ""} · ${esc(p.date || "")}</div>
<div class="small" style="margin-top:4px">${best ? `✅ Best <b>${best.score}</b>/${best.max} · ${a.length} attempt${a.length > 1 ? "s" : ""} · <a href="#/result/${best.id}">View</a>` : '<span class="muted">Not attempted yet</span>'}</div>
<div class="row" style="margin-top:8px"><button class="btn alt sm" data-print="${esc(p.id)}">🖨 Paper</button><span class="sp"></span><button class="btn sm" data-start="${esc(p.id)}">${best ? "Retake" : KJ.t("start")}</button></div></div>`;
    };
    el.innerHTML = `<h2>🎯 ${KJ.t("papers")}</h2>` + (papers.length ? `
<div class="chips"><a class="pill ${!sel ? "acc" : ""}" href="#/topictests">All (${papers.length})</a>
${present.map((s) => `<a class="pill ${sel === s.id ? "acc" : ""}" href="#/topictests/${s.id}">${esc(KJ.nm(s.name))} (${papers.filter((p) => p.subject === s.id).length})</a>`).join("")}</div>` +
      groups.map((g) => {
        const list = papers.filter((p) => (g.id === "_" ? !subs.find((s) => s.id === p.subject) : p.subject === g.id));
        return list.length ? `<h3>${g.icon || ""} ${esc(KJ.nm(g.name))}</h3>` + list.map(card).join("") : "";
      }).join("")
      : `<div class="empty">No topic tests yet.</div>`);
    el.onclick = async (e) => {
      const s = e.target.closest("[data-start]"), pr = e.target.closest("[data-print]");
      const p = papers.find((x) => x.id === (s || pr)?.dataset[s ? "start" : "print"]); if (!p) return;
      const qs = await KJ.byIds(p.qids);
      if (s) KJ.Exam.start({ title: KJ.nm(p.title) + " (Set " + (p.set || "-") + ")", kind: "paper", meta: { paper: p.id, subject: p.subject, topic: p.topic }, questions: qs, durationMin: p.duration_min, mark: p.mark, negative: p.negative, sectionOf: await sectionOfFactory() });
      else KJ.printPaper({ title: KJ.nm(p.title), set: p.set, subtitle: KJ.nm(p.title) + (p.topic ? " – " + p.topic : ""), questions: qs, lang: KJ.lang(), showKey: false });
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
      `<div class="row"><span class="sp"></span><a class="btn alt sm" href="#/subjects/current">Practise current-affairs MCQs</a></div>`;
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

  /* ---------- performance (V3: replaces Results history + Profile tab) ---------- */
  views.performance = async (el) => {
    const res = S.get("results", []), subs = await KJ.subjects();
    const ts = S.get("tstat_sub", {}), ps = S.get("pstat_sub", {}), pst = S.get("pstat", { seen: 0, right: 0 }), d = S.get("daily", { last: "", streak: 0 });
    const pc = (c, a) => (a ? Math.round((c / a) * 100) : null);
    const col = (p) => (p < 40 ? "var(--bad)" : p < 70 ? "var(--warn)" : "var(--ok)");
    const bar = (p) => (p == null ? '<span class="muted small">–</span>' : `<div class="row" style="flex-wrap:nowrap;gap:8px"><div class="bar" style="flex:1"><i style="width:${p}%;background:${col(p)}"></i></div><span class="pct">${p}%</span></div>`);
    const tC = res.reduce((x, r) => x + r.c, 0), tW = res.reduce((x, r) => x + r.w, 0);
    const scoreP = (r) => (r.max ? Math.round((Math.max(0, r.score) / r.max) * 100) : 0);
    const avg = res.length ? Math.round(res.reduce((x, r) => x + scoreP(r), 0) / res.length) : null;
    const best = res.length ? Math.max(...res.map(scoreP)) : null;
    const secs = res.reduce((x, r) => x + (r.used || 0), 0);
    const hm = secs >= 3600 ? Math.floor(secs / 3600) + "h " + Math.floor((secs % 3600) / 60) + "m" : Math.round(secs / 60) + "m";
    const streak = d.last === KJ.today() || isYesterday(d.last) ? d.streak : 0;
    const P = S.get("profile", {});

    if (!res.length && !pst.seen) {
      el.innerHTML = `<h2>📊 ${KJ.t("perf")}</h2><div class="card empty">Your scores, subject-wise accuracy and weak topics will appear here.<br><br>
<div class="row" style="justify-content:center"><a class="btn sm" href="#/topictests">🎯 Take a Topic Test</a><a class="btn alt sm" href="#/subjects">📚 Practise a subject</a></div></div>`;
      return;
    }
    /* subject rows */
    const rows = subs.map((s) => {
      const t = ts[s.id] || { a: 0, c: 0, t: {} }, p = ps[s.id] || { a: 0, c: 0, t: {} };
      return { s, t, p, all: pc(t.c + p.c, t.a + p.a), n: t.a + p.a };
    }).filter((r) => r.n);
    /* weak topics: merged test + practice, at least 2 attempts, below 70 % */
    const topics = [];
    rows.forEach(({ s, t, p }) => {
      const names = new Set([...Object.keys(t.t || {}), ...Object.keys(p.t || {})]);
      names.forEach((n) => { const a = (t.t?.[n]?.a || 0) + (p.t?.[n]?.a || 0), c = (t.t?.[n]?.c || 0) + (p.t?.[n]?.c || 0); topics.push({ s, n, a, c, p: pc(c, a) }); });
    });
    const weak = topics.filter((x) => x.a >= 2 && x.p < 70).sort((a, b) => a.p - b.p || b.a - a.a).slice(0, 6);
    const strong = topics.filter((x) => x.a >= 2 && x.p >= 80).sort((a, b) => b.p - a.p || b.a - a.a).slice(0, 4);
    /* test types */
    const KIND = { mock: "Mock tests", paper: KJ.t("papers"), daily: KJ.t("daily"), custom: KJ.t("custom") };
    const kinds = Object.keys(KIND).map((k) => { const l = res.filter((r) => (r.kind || "mock") === k); return { k, n: l.length, avg: l.length ? Math.round(l.reduce((x, r) => x + scoreP(r), 0) / l.length) : null }; }).filter((x) => x.n);
    const last = res.slice(0, 10).reverse();

    el.innerHTML = `<h2>📊 ${KJ.t("perf")}${P.name ? ` <span class="muted small">· ${esc(P.name)}</span>` : ""}</h2>
<div class="stats">
  <div class="stat"><b>${res.length}</b><span>Tests taken</span></div>
  <div class="stat"><b>${avg == null ? "–" : avg + "%"}</b><span>Average score</span></div>
  <div class="stat"><b>${pc(tC, tC + tW) == null ? "–" : pc(tC, tC + tW) + "%"}</b><span>Test accuracy</span></div>
  <div class="stat"><b>${best == null ? "–" : best + "%"}</b><span>Best score</span></div>
  <div class="stat"><b>${pst.seen}</b><span>Practice Qs</span></div>
  <div class="stat"><b>${pc(pst.right, pst.seen) == null ? "–" : pc(pst.right, pst.seen) + "%"}</b><span>Practice accuracy</span></div>
  <div class="stat"><b>${res.length ? hm : "–"}</b><span>Time in tests</span></div>
  <div class="stat"><b>${streak}🔥</b><span>Daily streak</span></div>
</div>
${last.length ? `<div class="card"><h3 style="margin-top:0">Score trend <span class="muted small">· last ${last.length} tests, % of max marks</span></h3>
<div class="trend">${last.map((r) => `<div class="tb" title="${esc(r.title)}" style="height:${Math.max(2, scoreP(r))}%;background:${col(scoreP(r))}"><span>${scoreP(r)}</span></div>`).join("")}</div>
<div class="trend-x">${last.map((r) => `<span>${new Date(r.date).getDate()}/${new Date(r.date).getMonth() + 1}</span>`).join("")}</div></div>` : ""}
${rows.length ? `<div class="card"><h3 style="margin-top:0">Subject-wise accuracy</h3><div class="tbl-wrap"><table class="t">
<tr><th>Subject</th><th>Tests</th><th>Practice</th><th style="min-width:130px">Overall</th></tr>
${rows.map(({ s, t, p, all }) => `<tr><td><a href="#/subjects/${s.id}">${s.icon || ""} ${esc(KJ.nm(s.name))}</a></td>
<td class="small">${t.a ? pc(t.c, t.a) + "% <span class='muted'>(" + t.c + "/" + t.a + ")</span>" : "–"}</td>
<td class="small">${p.a ? pc(p.c, p.a) + "% <span class='muted'>(" + p.c + "/" + p.a + ")</span>" : "–"}</td><td>${bar(all)}</td></tr>`).join("")}</table></div></div>` : ""}
<div class="card"><h3 style="margin-top:0">⚠️ Weak topics <span class="muted small">· below 70%, 2+ attempts</span></h3>
${weak.length ? weak.map((w) => `<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line)"><div style="flex:1;min-width:0"><b class="small">${esc(w.n)}</b><div class="tag">${esc(KJ.nm(w.s.name))} · ${w.c}/${w.a} correct</div></div>
<span class="pct" style="color:${col(w.p)}">${w.p}%</span><a class="btn alt sm" href="#/subjects/${w.s.id}/${encodeURIComponent(w.n)}">Practise</a></div>`).join("") : '<p class="small muted">No weak topics yet. Keep practising.</p>'}
${strong.length ? `<p class="small" style="margin-bottom:0">💪 Strong: ${strong.map((x) => esc(x.n) + " " + x.p + "%").join(" · ")}</p>` : ""}</div>
${kinds.length ? `<div class="card"><h3 style="margin-top:0">By test type</h3><table class="t"><tr><th>Type</th><th>Tests</th><th>Average</th></tr>
${kinds.map((x) => `<tr><td>${esc(KIND[x.k])}</td><td>${x.n}</td><td>${bar(x.avg)}</td></tr>`).join("")}</table></div>` : ""}
${res.length ? `<div class="card"><h3 style="margin-top:0">Recent tests</h3><div class="tbl-wrap"><table class="t"><tr><th>Test</th><th>Date</th><th>Score</th><th></th></tr>
${res.map((r) => `<tr><td>${esc(r.title)}</td><td class="small">${new Date(r.date).toLocaleDateString()}</td><td><b>${r.score}</b>/${r.max}</td><td><a href="#/result/${r.id}">View</a></td></tr>`).join("")}</table></div></div>` : ""}
<div class="row"><a class="btn alt sm" href="#/wrong">❌ ${KJ.t("wrong")} (${S.get("wrong", []).length})</a><a class="btn alt sm" href="#/bookmarks">★ ${KJ.t("bookmarks")} (${bm().size})</a></div>`;
  };
  views.subjects = views.practice;
  views.result = (el, [id]) => KJ.Exam.renderResult(el, id);
  views.exam = (el) => KJ.Exam.render(el);

  /* ---------- profile (V4: register details + sync status) ---------- */
  views.profile = async (el) => {
    const st = KJ.student() || {}, exams = await KJ.exams();
    const status = () => S.get("sync_pending", false)
      ? '<span class="sync wait">⏳ Will be sent to the teacher when you are online</span>'
      : '<span class="sync ok">✔ Sent to the teacher\'s student register</span>';
    el.innerHTML = `<div class="card hero"><img src="${esc(C.LOGO)}" alt=""><div><div class="brandline" style="font-size:16px">${esc(C.APP_NAME)}</div><div class="motto">${esc(C.MOTTO || "")}</div>
<div class="small muted">Registered ${st.regAt ? new Date(st.regAt).toLocaleDateString() : ""}</div></div></div>
<div class="card"><h3 style="margin-top:0">👤 ${KJ.t("profile")}</h3>
<form class="reg-form" id="pf" novalidate style="margin-top:0">${regFields(exams, st, true)}
<div class="reg-err" id="rerr" role="alert"></div>
<div class="row"><span id="sst">${status()}</span><span class="sp"></span><button class="btn sm" type="submit">Save</button></div></form></div>
<div class="row" style="margin-bottom:12px"><a class="btn alt sm" href="#/performance">📊 ${KJ.t("perf")}</a><a class="btn alt sm" href="#/home">🏠 ${KJ.t("home")}</a></div>
<div class="card"><h3 style="margin-top:0">🗂 Data on this phone</h3>
<p class="small muted">Results, bookmarks and progress are saved only on this device.</p>
<div class="row"><button class="btn alt sm" id="cr">Clear results</button><button class="btn alt sm" id="cp">Clear saved PDFs</button><button class="btn bad sm" id="ca">Reset everything</button></div></div>`;
    /* V11: version / contact card removed */
    bindRegFields();
    $("#pf").addEventListener("submit", async (e) => {
      e.preventDefault();
      const r = readReg(exams);
      if (r.err) { $("#rerr").textContent = r.err; $(r.f).focus(); return; }
      $("#rerr").textContent = "";
      const ns = { ...st, ...r.data, id: st.id || KJ.uid("st"), regAt: st.regAt || new Date().toISOString() };
      S.set("student", ns); S.set("profile", { name: ns.name, mobile: ns.mobile || "" });
      if (ns.examId !== "other") S.set("target", ns.examId);
      await KJ.sync("update");
      $("#sst").innerHTML = status(); KJ.toast("Saved"); shell();
    });
    $("#cr").onclick = () => { if (KJ.confirm("Delete all results and performance data?")) { ["results", "tstat_sub", "pstat_sub", "pstat"].forEach((k) => S.del(k)); KJ.toast("Cleared"); render(); } };
    $("#cp").onclick = async () => { try { await caches.delete("kj-pdf"); } catch (e) {} KJ.toast("Saved PDFs removed"); };
    $("#ca").onclick = () => { if (KJ.confirm("Reset all app data on this phone? You will need to register again.")) { Object.keys(localStorage).filter((k) => k.startsWith("kj_")).forEach((k) => localStorage.removeItem(k)); render(); } };
  };

  /* ---------------- boot ---------------- */
  document.addEventListener("DOMContentLoaded", () => {
    if (!S.get("lang", null)) S.set("lang", C.DEFAULT_LANG || "bi");
    if (S.get("tstat_sub", null) == null) {            // V3: build subject stats from earlier results once
      const pairs = []; S.get("results", []).forEach((r) => r.qs.forEach((q, i) => r.ans[i] != null && pairs.push([q, r.ans[i] === q.a])));
      KJ.addStats("tstat_sub", pairs);
    }
    KJ.registerSW();
    /* V4: send pending registration, or a once-a-day "last seen" update */
    if (KJ.student() && (S.get("sync_pending", false) || S.get("seen_day", "") !== KJ.today())) KJ.sync(S.get("sync_pending", false) ? "update" : "seen");
    window.addEventListener("online", () => { if (S.get("sync_pending", false)) KJ.sync("update"); });
    render();
  });
})();
