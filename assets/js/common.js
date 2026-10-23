/* KONCEPT JUNCTION — common.js (V1)
   Shared helpers. */
(function () {
  const C = window.KJ_CONFIG;
  const KJ = (window.KJ = { C });

  KJ.$ = (s, r = document) => r.querySelector(s);
  KJ.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  KJ.esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  KJ.uid = (p) => p + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  KJ.today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  KJ.LETTERS = ["A", "B", "C", "D", "E", "F"];

  /* ---------- local storage ---------- */
  KJ.store = {
    get(k, d) { try { const v = localStorage.getItem("kj_" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("kj_" + k, JSON.stringify(v)); return true; } catch (e) { KJ.toast("Storage full – clear old results in Profile"); return false; } },
    del(k) { try { localStorage.removeItem("kj_" + k); } catch (e) {} }
  };

  /* ---------- language ---------- */
  KJ.lang = () => KJ.store.get("lang", C.DEFAULT_LANG || "bi");
  const UI = {
    en: { home: "Home", practice: "Subjects", mock: "Mock Tests", daily: "Daily Quiz", notes: "Notes", concepts: "Concepts", ca: "Current Affairs",
      bookmarks: "Bookmarks", wrong: "Wrong Answers", results: "Results", profile: "Profile", papers: "Topic Tests", perf: "Performance", submit: "Submit Test",
      next: "Save & Next", prev: "Previous", mark: "Mark for Review & Next", clear: "Edit Answer", back: "Back to Test", start: "Start Test", custom: "Custom Test",
      target: "Target exam", answer: "Show answer", video: "Video solution", noq: "No questions available yet.", resume: "Resume test" },
    te: { home: "హోమ్", practice: "సబ్జెక్టులు", mock: "మాక్ టెస్టులు", daily: "డైలీ క్విజ్", notes: "నోట్స్", concepts: "కాన్సెప్ట్స్", ca: "వర్తమాన అంశాలు",
      bookmarks: "బుక్‌మార్క్స్", wrong: "తప్పు సమాధానాలు", results: "ఫలితాలు", profile: "ప్రొఫైల్", papers: "టాపిక్ టెస్టులు", perf: "పనితీరు", submit: "పరీక్ష సమర్పించు",
      next: "సేవ్ చేసి తదుపరి", prev: "మునుపటి", mark: "రివ్యూ కోసం గుర్తించి తదుపరి", clear: "సమాధానం మార్చు", back: "పరీక్షకు తిరిగి వెళ్లు", start: "పరీక్ష ప్రారంభించు", custom: "కస్టమ్ టెస్ట్",
      target: "లక్ష్య పరీక్ష", answer: "సమాధానం చూపు", video: "వీడియో వివరణ", noq: "ఇంకా ప్రశ్నలు అందుబాటులో లేవు.", resume: "పరీక్ష కొనసాగించు" }
  };
  KJ.t = (k) => (UI[KJ.lang() === "te" ? "te" : "en"][k] || k);
  /* name of a bilingual object {en,te} in the UI language */
  KJ.nm = (o) => (typeof o === "string" ? o : (KJ.lang() === "te" ? o?.te || o?.en : o?.en || o?.te) || "");

  /* bilingual body text → HTML (keeps $…$ for KaTeX, \n → line break) */
  const fmt = (s) => KJ.esc(s).replace(/\n/g, "<br>");
  KJ.txt = function (o, lang) {
    lang = lang || KJ.lang();
    if (o == null) return "";
    if (typeof o === "string") return fmt(o);
    const en = o.en || "", te = o.te || "";
    if (lang === "en") return fmt(en || te);
    if (lang === "te") return '<div class="t-te" style="color:inherit;margin:0">' + fmt(te || en) + "</div>";
    if (!te || te === en) return fmt(en);
    return '<div class="t-en">' + fmt(en) + '</div><div class="t-te">' + fmt(te) + "</div>";
  };
  /* ================= V14: Match-the-following tables =================
     A question line with " | " in the middle is a table row:
       English box:  List-I: Revolution | List-II: Associated product
                     a) Green Revolution | i) Fish production
       Telugu box:   జాబితా-I: విప్లవం | జాబితా-II: సంబంధిత ఉత్పత్తి
                     a) హరిత విప్లవం | i) చేపల ఉత్పత్తి
     It is drawn as a bordered 2-column table; in EN+తె each cell reads "a) Green Revolution / హరిత విప్లవం". */
  const ROWSEP = /\s\|\s/;
  KJ.splitTable = function (o) {
    const parts = (txt) => {
      const L = String(txt || "").split("\n"), before = [], rows = [], after = [];
      L.forEach((l0) => {
        const l = l0.replace(/^\s*\|\s*/, "").replace(/\s*\|\s*$/, "");
        const c = l.split(ROWSEP);
        if (c.length === 2 && c[0].trim() && c[1].trim()) { rows.push(c.map((x) => x.replace(/^[\s|]+|[\s|]+$/g, ""))); }
        else if (/^\s*\|?\s*$/.test(l)) {}
        else (rows.length ? after : before).push(l);
      });
      return { before, rows, after };
    };
    const en = parts(o && o.en), te = parts(o && o.te);
    if (!en.rows.length && !te.rows.length) return null;
    return { en, te };
  };
  const stripMk = (s) => s.replace(/^\(?\s*(?:[a-hA-H]|[ivx]{1,4}|\d{1,2})\s*[.)]\s*/, "");
  const stripListTe = (s) => s.replace(/^జాబితా\s*[-–]\s*[IVX1l]+\s*:\s*/, "");
  function cell(enC, teC, lang, head) {
    enC = enC || ""; teC = teC || "";
    if (lang === "en" || !teC) return fmt(enC || teC);
    if (lang === "te" || !enC) return '<span class="t-te">' + fmt(teC || enC) + "</span>";
    const t = head ? stripListTe(teC) : stripMk(teC);
    return fmt(enC) + (t && t !== enC ? ' / <span class="t-te">' + fmt(t) + "</span>" : "");
  }
  KJ.tableHtml = function (T, lang) {
    const n = Math.max(T.en.rows.length, T.te.rows.length);
    let h = '<div class="mt-wrap"><table class="mt">';
    for (let i = 0; i < n; i++) {
      const e = T.en.rows[i] || ["", ""], t = T.te.rows[i] || ["", ""];
      const head = i === 0 && (/^\s*List\b/i.test(e[0]) || /జాబితా/.test(t[0]));
      const tag = head ? "th" : "td";
      h += "<tr>" + [0, 1].map((k) => `<${tag}>${cell(e[k], t[k], lang, head)}</${tag}>`).join("") + "</tr>";
    }
    return h + "</table></div>";
  };
  /* question text with tables (used everywhere a question is shown) */
  KJ.qHtml = function (o, lang) {
    lang = lang || KJ.lang();
    const T = o && typeof o === "object" ? KJ.splitTable(o) : null;
    if (!T) return KJ.txt(o, lang);
    const blk = (a, b) => KJ.txt({ en: a.join("\n").trim(), te: b.join("\n").trim() }, lang);
    return blk(T.en.before, T.te.before) + KJ.tableHtml(T, lang) + blk(T.en.after, T.te.after);
  };

  /* option label in the model-paper style:  "English / తెలుగు" */
  KJ.optTxt = function (q, i, lang) {
    lang = lang || KJ.lang();
    const en = (q.o?.en || [])[i] || "", te = (q.o?.te || [])[i] || "";
    if (lang === "en" || !te || te === en) return fmt(en || te);
    if (lang === "te") return '<span class="t-te" style="color:inherit">' + fmt(te) + "</span>";
    return en.length + te.length > 60 ? fmt(en) + '<div class="t-te">' + fmt(te) + "</div>" : fmt(en) + ' / <span class="t-te" style="display:inline">' + fmt(te) + "</span>";
  };

  /* ---------- V20: clean OCR mistakes in a question ----------
     1. Match-the-following answer codes  "a-iii, 0-1 c-ii" · "2-1, 0-ఴ, c-iii" · "a-ii, bi, c-iii"  →  "a-iii, b-i, c-ii" …
        (letters are taken from the table, i/ii/iii read as 1/11/111 are corrected, one unreadable value is filled in)
     2. Junk read from the watermark / page edge after an option or question line is removed
     3. Telugu read as numbers ("Certiorari / 288558") is dropped – English is shown – and reported */
  const JUNKCH = /[|\\"=~^<>{}\[\]#@$%&*¬¦]/g, JUNK1 = /[|\\"=~^<>{}\[\]#@$%&*¬¦]/;   // "_" (blanks) is NOT junk
  const tokJunk = (x) => JUNK1.test(x) || x.replace(/[^\wఀ-౿]/g, "").length <= 2;
  KJ.isJunk = function (l) {
    const t = String(l || "").trim(); if (!t) return false;
    const sym = (t.match(JUNKCH) || []).length; if (sym < 2) return false;
    const ns = t.replace(/\s/g, ""), letters = (ns.match(/[A-Za-zఀ-౿]/g) || []).length;
    const toks = t.split(/\s+/), short = toks.filter((x) => x.replace(/[^\wఀ-౿]/g, "").length <= 2).length;
    return sym >= 3 || letters / ns.length < 0.75 || short / toks.length > 0.4;
  };
  const noiseTok = (x) => JUNK1.test(x) || x.replace(/[^\wఀ-౿]/g, "").length <= 2 || /^[A-Z]{2,5}$/.test(x) || /\d/.test(x) && /[A-Za-zఀ-౿]/.test(x);
  const cutJunkTail = (txt) => {                       // "Quo Warranto nr an sr "1, ANAL EE = hid … | | …"  →  "Quo Warranto"
    const toks = String(txt || "").split(/\s+/).filter(Boolean);
    for (let j = 1; j < toks.length; j++) {               // V21: start at the first symbol-junk word, then step back over short / caps noise
      if (!JUNK1.test(toks[j])) continue;
      const tail = toks.slice(j), sym = (tail.join(" ").match(JUNKCH) || []).length;
      if (!(sym >= 2 && tail.filter(tokJunk).length / tail.length >= 0.6)) continue;
      let i = j; while (i > 1 && noiseTok(toks[i - 1]) && !/^\d+[.)]?$/.test(toks[i - 1])) i--;
      return toks.slice(0, i).join(" ").replace(/[\s,;]+$/, "");
    }
    return txt;
  };
  /* V21: OCR noise that REPEATS (watermark read again and again on one line)
     "Punchhi Commission EY UJ PREY UP PN ow J (| PRY " FEY PRS U PREY EY UJ PREY …"  →  "Punchhi Commission"
     "పుంఛీ కమిషన్ ar ఇ 1 ఏ2 EY oh TERRA EA ar rr ఇ ~r <0 \ 0 \ 16 గా \ ar ఇ 1 …"     →  "పుంఛీ కమిషన్"
     A block of 2–40 words seen 3 or more times in a row is cut away, then leftover junk words at the end. */
  KJ.cutRepeat = function (txt) {
    const s = String(txt || ""), toks = s.split(/\s+/).filter(Boolean), n = toks.length;
    if (n < 9) return s;
    for (let i = 0; i < n; i++) {
      for (let p = 2; p <= 40 && i + 3 * p <= n + 1; p++) {
        let run = 0; while (i + p + run < n && toks[i + run] === toks[i + p + run]) run++;
        if (run + p >= 3 * p - 1 && run >= Math.max(6, 2 * p - 1) && toks.slice(i, i + p).filter((x) => /[A-Za-zఀ-౿]/.test(x)).length >= 2) {   // block seen ≥ 3 times, has words
          const keep = toks.slice(0, i);
          while (keep.length > 1 && noiseTok(keep[keep.length - 1]) && !/^[ivx]+[.)]?$|^\d+[.)]?$/i.test(keep[keep.length - 1])) keep.pop();
          return keep.join(" ").replace(/[\s,;:|\\"(]+$/, "");
        }
      }
    }
    return s;
  };
  KJ.isRepeatJunk = (t) => KJ.cutRepeat(t) !== String(t || "");
  /* V21: student side – clean repeated noise in options / question lines before showing (data file is not changed) */
  KJ.tidyQ = function (q) {
    if (!q || q._tidy) return q; q._tidy = 1;
    ["en", "te"].forEach((k) => {
      if (q.q && typeof q.q[k] === "string" && q.q[k].length > 60) q.q[k] = q.q[k].split("\n").map((l) => (l.length > 60 ? KJ.cutRepeat(l) : l)).filter((l, i, a) => l || !a[i]).join("\n");
      if (q.o && Array.isArray(q.o[k])) q.o[k] = q.o[k].map((x) => (typeof x === "string" && x.length > 40 ? cutJunkTail(KJ.cutRepeat(x)) : x));
    });
    if (q.o && Array.isArray(q.o.te) && Array.isArray(q.o.en)) q.o.te = q.o.te.map((t, i) => (t && t !== q.o.en[i] && !/[ఀ-౿]/.test(t) && String(t).replace(/[^A-Za-z0-9]/g, "").length <= 4 && String(q.o.en[i] || "").length > 4 ? q.o.en[i] : t));
    return q;
  };
  const teJunk = (t) => String(t || "").replace(/(?:\s+[ఀ-౿][ా-్ౕౖ]?(?:\.{2,}|…)?){2,}\s*\.*\s*$/, "").replace(/\s*(?:\.{2,}|…)\s*$/, "");
  const romanOf = (r) => { const x = String(r).replace(/[1lI|!ıі\]]/g, "i").replace(/V/g, "v").replace(/X/g, "x").toLowerCase(); return /^(i{1,3}|iv|vi{0,3}|ix|x)$/.test(x) ? x : null; };
  function fixCode(str, lefts, rights) {
    const n = lefts.length, toks = String(str).split(/[,;]+|\s+/).filter(Boolean), got = [];
    for (const tk of toks) {
      if (got.length >= n) break;
      let R = null;
      if (/[-–—]/.test(tk)) R = tk.split(/[-–—]/).pop();
      else if (/^[a-hA-H0-9౦-౯]\S{1,4}$/.test(tk)) R = tk.slice(1);
      else if (got.length) { got.push(null); continue; }
      else return null;                                   // does not start like a code
      const rr = rights.map((x) => x.toLowerCase()), ro = romanOf(R);
      const v = rr.includes(ro) ? rights[rr.indexOf(ro)] : (rr.includes(String(R).toLowerCase()) ? rights[rr.indexOf(String(R).toLowerCase())] : null);
      got.push(v);
    }
    if (got.length < n - 1) return null;
    while (got.length < n) got.push(null);
    const miss = got.filter((v) => v == null).length;
    if (miss > 1) return null;
    if (miss === 1) { const left = rights.filter((r) => !got.includes(r)); if (left.length !== 1) return null; got[got.indexOf(null)] = left[0]; }
    const dash = (String(str).match(/[-–—]/) || ["-"])[0];
    return lefts.map((L, k) => L + dash + got[k]).join(", ");
  }
  KJ.cleanQ = function (q) {
    const warn = [], before = JSON.stringify([q.q, q.o]);
    if (!q || !q.o || !Array.isArray(q.o.en)) return { changed: false, warn };
    const te0 = q.o.te; q.o.te = q.o.te || [];
    // question text: junk lines / Telugu junk tails
    ["en", "te"].forEach((k) => { if (q.q && q.q[k]) q.q[k] = q.q[k].split("\n").map((l) => KJ.cutRepeat(l)).filter((l) => !KJ.isJunk(l)).map((l) => (k === "te" ? teJunk(l) : l)).join("\n"); });
    // match codes
    const T = KJ.splitTable(q.q || {});
    let lefts = null, rights = null;
    if (T && T.en.rows.length) {
      const rows = T.en.rows.filter((r, i) => !(i === 0 && /^\s*List\b/i.test(r[0])));
      const mk = (c) => ((c.match(/^\(?\s*([a-hA-H]|[ivx]{1,4}|\d{1,2})\s*[.)]/) || [])[1] || "");
      lefts = rows.map((r) => mk(r[0])); rights = rows.map((r) => mk(r[1]));
      if (lefts.some((x) => !x) || rights.some((x) => !x)) lefts = null;
    }
    q.o.en.forEach((en, i) => {
      let te = q.o.te[i] || "";
      { const e2 = KJ.cutRepeat(en), t2 = KJ.cutRepeat(te);              // V21: repeated watermark noise
        if (e2 !== en || t2 !== te) { en = e2; te = t2; q.o.en[i] = en; q.o.te[i] = te; warn.push("option " + "ABCD"[i] + ": repeated junk text removed – check"); } }
      if (lefts && /[-–—]/.test(en) && (en.match(/(?:^|[\s,;])[a-hA-H0-9౦-౯]\s?[-–—]?\s?[ivxIl1|]{1,4}(?=$|[\s,;])/g) || []).length > lefts.length) {   // V21: table lost a row – never drop a code
        warn.push("option " + "ABCD"[i] + ": table has fewer rows than the match code – check the table"); en = cutJunkTail(en); q.o.en[i] = en; if (!te || /[-–—]/.test(te)) q.o.te[i] = te = cutJunkTail(te); return;
      }
      if (lefts && /[-–—]/.test(en) && (en.match(/[-–—]/g) || []).length >= Math.max(1, lefts.length - 2)) {
        const f = fixCode(en, lefts, rights) || fixCode(cutJunkTail(en), lefts, rights);
        if (f) {
          q.o.en[i] = f; q.o.te[i] = f;
          const vals = f.split(", ").map((x) => x.split(/[-–—]/)[1]);
          if (new Set(vals).size !== vals.length) warn.push("option " + "ABCD"[i] + ": check the match code (" + f + ")");
          return;
        }
        warn.push("option " + "ABCD"[i] + ": check the match code");
      }
      en = cutJunkTail(en); te = teJunk(cutJunkTail(te));
      const dm = en.match(/^(.*[A-Za-z].*?)\s*\/\s*(\d[\d\s.,]{2,})$/);          // "Certiorari / 288558" in the English part
      if (dm) { en = dm[1].trim(); if (!te || te === q.o.en[i]) te = dm[2]; }
      if (te && /^[\d\s.,:;\-–()]+$/.test(te) && /[A-Za-z]{3}/.test(en)) { te = en; warn.push("option " + "ABCD"[i] + ": Telugu not readable – type it"); }
      if (te && te !== en && !/[ఀ-౿]/.test(te) && te.replace(/[^A-Za-z0-9]/g, "").length <= 4 && en.length > 4) { te = en; warn.push("option " + "ABCD"[i] + ": Telugu not readable – type it"); }   // V21: "nr", "“Fr"
      q.o.en[i] = en; q.o.te[i] = te;
    });
    if (te0 == null && q.o.te.every((x) => !x)) q.o.te = te0;       // keep questions that never had Telugu options as they were
    return { changed: JSON.stringify([q.q, q.o]) !== before, warn };
  };

  /* KaTeX auto-render (loaded from CDN, cached by service worker for offline use) */
  KJ.math = function (el) {
    if (!el || !window.renderMathInElement) return;
    try {
      window.renderMathInElement(el, {
        delimiters: [{ left: "$$", right: "$$", display: true }, { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false }, { left: "$", right: "$", display: false }],
        throwOnError: false
      });
    } catch (e) {}
  };

  /* ---------- data loading ---------- */
  const mem = {};
  KJ.load = async function (path, force) {
    if (!force && mem[path]) return mem[path];
    const r = await fetch(path, { cache: "no-cache" });
    if (!r.ok) throw new Error(path + " → HTTP " + r.status);
    const j = await r.json();
    mem[path] = j;
    return j;
  };
  KJ.subjects = () => KJ.load("data/subjects.json");
  KJ.exams = () => KJ.load("data/exams.json");
  KJ.subject = async (id) => (await KJ.subjects()).find((s) => s.id === id);
  KJ.bank = async function (sid) {
    const s = await KJ.subject(sid);
    if (!s) return [];
    try { const b = await KJ.load(s.file); if (Array.isArray(b)) b.forEach(KJ.tidyQ); return b; } catch (e) { console.warn(e); return []; }   // V21: tidyQ
  };
  KJ.allQuestions = async function (sids) {
    const subs = await KJ.subjects();
    const list = sids ? subs.filter((s) => sids.includes(s.id)) : subs;
    const parts = await Promise.all(list.map((s) => KJ.bank(s.id)));
    return parts.flat();
  };
  KJ.byIds = async function (ids) {
    const all = await KJ.allQuestions();
    const map = new Map(all.map((q) => [q.id, q]));
    return ids.map((id) => map.get(id)).filter(Boolean);
  };

  /* ---------- random ---------- */
  KJ.seeded = function (seedStr) {
    let h = 2166136261;
    for (const ch of seedStr) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return function () { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  KJ.shuffle = function (arr, rnd = Math.random) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  /* ---------- UI bits ---------- */
  KJ.toast = function (msg, ms = 2200) {
    const d = document.createElement("div"); d.className = "toast"; d.textContent = msg;
    document.body.appendChild(d); setTimeout(() => d.remove(), ms);
  };
  KJ.modal = function (html, onClose) {
    const m = document.createElement("div"); m.className = "modal";
    m.innerHTML = '<div class="box">' + html + '<div class="row" style="margin-top:12px"><span class="sp"></span><button class="btn alt sm" data-close>Close</button></div></div>';
    const close = () => { m.remove(); onClose && onClose(); };
    m.addEventListener("click", (e) => { if (e.target === m || e.target.hasAttribute("data-close")) close(); });
    document.body.appendChild(m); KJ.math(m);
    return { el: m, close };
  };
  KJ.confirm = (msg) => window.confirm(msg);

  /* Video solution player: Cloudinary / mp4 → <video>, YouTube → iframe */
  KJ.playVideo = function (url) {
    if (!url) return;
    let html;
    const yt = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    if (yt) html = '<iframe src="https://www.youtube-nocookie.com/embed/' + yt[1] + '?rel=0" allowfullscreen allow="autoplay; encrypted-media"></iframe>';
    else html = '<video src="' + KJ.esc(url) + '" controls playsinline controlsList="nodownload"></video>';
    KJ.modal("<h3>🎬 " + KJ.t("video") + "</h3>" + html);
  };

  /* PDF open: served from offline cache when saved, else online */
  KJ.openPdf = async function (url) {
    try {
      const c = await caches.open("kj-pdf");
      const hit = await c.match(url);
      if (hit) { const b = await hit.blob(); window.open(URL.createObjectURL(b), "_blank"); return; }
    } catch (e) {}
    window.open(url, "_blank");
  };
  KJ.savePdfOffline = async function (url) {
    try {
      const r = await fetch(url, { mode: "cors" });
      if (!r.ok) throw new Error(r.status);
      const c = await caches.open("kj-pdf"); await c.put(url, r);
      KJ.toast("Saved for offline ✔");
      return true;
    } catch (e) { KJ.toast("Could not save offline (" + e.message + ")"); return false; }
  };
  KJ.isPdfSaved = async (url) => { try { return !!(await (await caches.open("kj-pdf")).match(url)); } catch (e) { return false; } };

  /* SHA-256 hex (for Setup Code + PIN lock) */
  KJ.sha256 = async function (txt) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  /* =================================================================
     QUESTION PAPER PRINT — same layout as the KJ model paper:
     big "KONCEPT JUNCTION", "DREAM TO ACHIEVE", Set box, watermark logo,
     bilingual question, options "A) English / తెలుగు", footer with contact.
     ================================================================= */
  KJ.printPaper = function (opts) {
    const { title, set, questions, showKey, lang = "bi", subtitle = "" } = opts;
    const base = location.href.replace(/[^/]*([?#].*)?$/, "");
    const e = KJ.esc;
    const qHtml = questions.map((q, n) => {
      const qe = q.q?.en || "", qt = q.q?.te || "";
      const TB = KJ.splitTable(q.q || {});                    // V14: match-the-following table
      let s;
      if (TB) {
        const j = (a) => e(a.join("\n").trim()).replace(/\n/g, "<br>");
        s = '<div class="pq"><div class="qe">' + (n + 1) + ". " + (lang === "te" ? j(TB.te.before) : j(TB.en.before)) + "</div>";
        if (lang === "bi" && TB.te.before.join("").trim()) s += '<div class="qt">' + j(TB.te.before) + "</div>";
        s += KJ.tableHtml(TB, lang);
        const ea = j(TB.en.after), ta = j(TB.te.after);
        if (lang !== "te" && ea) s += '<div class="qe">' + ea + "</div>";
        if (lang !== "en" && ta) s += '<div class="qt">' + ta + "</div>";
      } else {
        s = '<div class="pq"><div class="qe">' + (n + 1) + ". " + (lang === "te" ? e(qt || qe) : e(qe)) + "</div>";
        if (lang === "bi" && qt && qt !== qe) s += '<div class="qt">' + e(qt) + "</div>";
      }
      if (q.img) s += '<img class="qi" src="' + e(q.img) + '">';
      if (q.type === "conv") {
        s += '<div class="lines"></div>';
      } else {
        (q.o?.en || []).forEach((oe, i) => {
          const ot = (q.o?.te || [])[i] || "";
          const long = oe.length + ot.length > 70;
          let line = KJ.LETTERS[i] + ") " + (lang === "te" ? e(ot || oe) : e(oe));
          if (lang === "bi" && ot && ot !== oe) line += long ? '<div class="qt ind">' + e(ot) + "</div>" : " / " + '<span class="qt">' + e(ot) + "</span>";
          s += '<div class="op">' + line + "</div>";
        });
      }
      return s + "</div>";
    }).join("");
    const key = showKey ? '<div class="key"><h3>Answer Key</h3>' + questions.map((q, n) => (n + 1) + "-" + (q.type === "conv" ? "—" : KJ.LETTERS[q.a])).join(" &nbsp; ") + "</div>" : "";
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${e(title)}</title>
<base href="${base}">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;600&display=swap" rel="stylesheet">
<style>
@page{size:A4;margin:14mm 14mm 18mm}
body{font-family:"Times New Roman",Georgia,serif;color:#111;margin:0;padding-bottom:10mm}
.hd{text-align:center;position:relative}
.hd h1{font-family:Cambria,"Times New Roman",serif;font-weight:400;font-size:40px;letter-spacing:1px;margin:6px 0 0}
.hd .m{font-size:14px;letter-spacing:1px}
.hd .set{position:absolute;right:0;top:0;border:1.5px solid #111;width:42px;height:42px;display:grid;place-items:center;font-size:26px}
.hd .sub{font-size:13px;margin-top:4px}
.rule{border-top:1.5px solid #111;margin:8px 0 6px}
.wm{position:fixed;left:50%;top:50%;width:150mm;transform:translate(-50%,-45%);opacity:.9;z-index:-1}
.pq{padding:10px 0 12px;border-bottom:1.5px solid #111;break-inside:avoid}
.qe{font-size:15px;margin-bottom:3px}
.qt{font-family:"Noto Sans Telugu","Nirmala UI","Gautami",sans-serif;font-size:14px}
.op{font-size:15px;margin:5px 0}
.mt{border-collapse:collapse;margin:8px 0 6px;font-size:14.5px}.mt th,.mt td{border:1.2px solid #111;padding:4px 8px;text-align:left;vertical-align:top}.mt th{font-weight:700}.mt .t-te{font-family:"Noto Sans Telugu","Nirmala UI","Gautami",sans-serif}
.ind{margin-left:22px}
.qi{max-width:60%;display:block;margin:6px 0}
.lines{height:120px;background:repeating-linear-gradient(#fff 0 27px,#bbb 27px 28px)}
.ft{position:fixed;bottom:0;background:#fff;left:0;right:0;display:flex;justify-content:space-between;font-size:13px;border-top:1px solid #111;padding-top:3px}
.key{break-before:page;font-size:14px;line-height:2}
.noprint{position:fixed;top:8px;left:8px}
@media print{.noprint{display:none}}
</style></head><body>
<button class="noprint" onclick="print()">🖨 Print / Save as PDF</button>
<img class="wm" src="assets/icons/watermark.png" alt="">
<div class="hd">${set ? '<div class="set">' + e(set) + "</div>" : ""}
<h1>${e(C.APP_NAME)}</h1><div class="m">${e(C.MOTTO || "")}</div>
${subtitle || title ? '<div class="sub">' + e(subtitle || title) + "</div>" : ""}</div>
<div class="rule"></div>
${qHtml}
${key}
<div class="ft"><span>[${e(C.APP_NAME)} ]</span><span>[CONTACT: ${e(C.CONTACT_PHONE || "")}]</span></div>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) { KJ.toast("Allow pop-ups to print the paper"); return; }
    w.document.open(); w.document.write(html); w.document.close();
  };

  /* register service worker */
  KJ.registerSW = function () {
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      /* V19: always check for a new version (sw.js never taken from the browser cache) and switch to it at once */
      navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then((reg) => {
        reg.update().catch(() => {});
        document.addEventListener("visibilitychange", () => { if (!document.hidden) reg.update().catch(() => {}); });
      }).catch((e) => console.warn("SW", e));
      let reloaded = false;
      const hadCtl = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!hadCtl || reloaded) return;
        const busy = /teacher\.html/.test(location.pathname) || location.hash === "#/exam";   // never reload during a test or teacher editing
        if (busy) { KJ.toast("✔ App updated – it will be used from the next page"); return; }
        reloaded = true; location.reload();
      });
    }
  };
})();
