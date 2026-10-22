/* KONCEPT JUNCTION — common.js (V1)
   Shared helpers for Student Mode (home.html) and Teacher Upload (teacher.html). */
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
      bookmarks: "Bookmarks", wrong: "Wrong Answers", results: "Results", profile: "Profile", papers: "Topic Tests", perf: "Performance", submit: "Submit",
      next: "Save & Next", prev: "Previous", mark: "Mark for Review & Next", clear: "Clear Response", start: "Start Test", custom: "Custom Test",
      target: "Target exam", answer: "Show answer", video: "Video solution", noq: "No questions available yet.", resume: "Resume test" },
    te: { home: "హోమ్", practice: "సబ్జెక్టులు", mock: "మాక్ టెస్టులు", daily: "డైలీ క్విజ్", notes: "నోట్స్", concepts: "కాన్సెప్ట్స్", ca: "వర్తమాన అంశాలు",
      bookmarks: "బుక్‌మార్క్స్", wrong: "తప్పు సమాధానాలు", results: "ఫలితాలు", profile: "ప్రొఫైల్", papers: "టాపిక్ టెస్టులు", perf: "పనితీరు", submit: "సమర్పించు",
      next: "సేవ్ చేసి తదుపరి", prev: "మునుపటి", mark: "రివ్యూ కోసం గుర్తించి తదుపరి", clear: "సమాధానం తొలగించు", start: "పరీక్ష ప్రారంభించు", custom: "కస్టమ్ టెస్ట్",
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
  /* option label in the model-paper style:  "English / తెలుగు" */
  KJ.optTxt = function (q, i, lang) {
    lang = lang || KJ.lang();
    const en = (q.o?.en || [])[i] || "", te = (q.o?.te || [])[i] || "";
    if (lang === "en" || !te || te === en) return fmt(en || te);
    if (lang === "te") return '<span class="t-te" style="color:inherit">' + fmt(te) + "</span>";
    return en.length + te.length > 60 ? fmt(en) + '<div class="t-te">' + fmt(te) + "</div>" : fmt(en) + ' / <span class="t-te" style="display:inline">' + fmt(te) + "</span>";
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
    try { return await KJ.load(s.file); } catch (e) { console.warn(e); return []; }
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
      let s = '<div class="pq"><div class="qe">' + (n + 1) + ". " + (lang === "te" ? e(qt || qe) : e(qe)) + "</div>";
      if (lang === "bi" && qt && qt !== qe) s += '<div class="qt">' + e(qt) + "</div>";
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
      navigator.serviceWorker.register("sw.js").catch((e) => console.warn("SW", e));
    }
  };
})();
