/* KONCEPT JUNCTION — telugu.js (V13)
   Telugu typing for Teacher Upload: type Telugu sounds in English letters, get Telugu script.
     amma → అమ్మ   telugu → తెలుగు   aaMdhrapradES → ఆంధ్రప్రదేశ్   kRuShNa → కృష్ణ
   Works offline. A word is converted when you type a space, Enter or punctuation.
   F2 (or the header button) switches it on/off. Start a word with \ to keep it in English. */
(function () {
  const VOW = [                          // [typed, independent vowel, vowel sign]
    ["aa", "ఆ", "ా"], ["A", "ఆ", "ా"], ["ii", "ఈ", "ీ"], ["ee", "ఈ", "ీ"], ["I", "ఈ", "ీ"],
    ["uu", "ఊ", "ూ"], ["oo", "ఊ", "ూ"], ["U", "ఊ", "ూ"], ["Ru", "ఋ", "ృ"], ["RU", "ౠ", "ౄ"],
    ["ai", "ఐ", "ై"], ["au", "ఔ", "ౌ"], ["ou", "ఔ", "ౌ"], ["E", "ఏ", "ే"], ["O", "ఓ", "ో"],
    ["a", "అ", ""], ["i", "ఇ", "ి"], ["u", "ఉ", "ు"], ["e", "ఎ", "ె"], ["o", "ఒ", "ొ"]
  ];
  const CON = [                          // [typed, consonant]
    ["ksh", "క్ష"], ["chh", "ఛ"], ["Ch", "ఛ"], ["Sh", "ష"], ["sh", "శ"], ["S", "శ"],
    ["kh", "ఖ"], ["gh", "ఘ"], ["ch", "చ"], ["jh", "ఝ"], ["jn", "జ్ఞ"], ["Th", "ఠ"], ["Dh", "ఢ"],
    ["th", "థ"], ["dh", "ధ"], ["ph", "ఫ"], ["bh", "భ"], ["~g", "ఙ"], ["~n", "ఞ"], ["rr", "ఱ"],
    ["k", "క"], ["g", "గ"], ["c", "చ"], ["j", "జ"], ["T", "ట"], ["D", "డ"], ["N", "ణ"],
    ["t", "త"], ["d", "ద"], ["n", "న"], ["p", "ప"], ["f", "ఫ"], ["b", "బ"], ["m", "మ"],
    ["y", "య"], ["r", "ర"], ["R", "ర"], ["l", "ల"], ["L", "ళ"], ["v", "వ"], ["w", "వ"],
    ["s", "స"], ["h", "హ"], ["x", "క్ష"], ["z", "జ"], ["q", "క"], ["K", "ఖ"], ["G", "ఘ"],
    ["J", "ఝ"], ["P", "ఫ"], ["B", "భ"], ["Y", "య"], ["V", "వ"], ["W", "వ"], ["Z", "జ"]
  ];
  const byLen = (a, b) => b[0].length - a[0].length;
  VOW.sort(byLen); CON.sort(byLen);

  function translit(w) {
    let out = "", i = 0, lastC = false;
    while (i < w.length) {
      if (w.startsWith("~M", i)) { out += "ఁ"; lastC = false; i += 2; continue; }
      if (w[i] === "M") { out += "ం"; lastC = false; i++; continue; }
      if (w[i] === "H") { out += "ః"; lastC = false; i++; continue; }
      let hit = VOW.find(([k]) => w.startsWith(k, i));
      if (hit) { out += lastC ? hit[2] : hit[1]; lastC = false; i += hit[0].length; continue; }
      hit = CON.find(([k]) => w.startsWith(k, i));
      if (hit) { if (lastC) out += "్"; out += hit[1]; lastC = true; i += hit[0].length; continue; }
      if (lastC) { out += "్"; lastC = false; }
      out += w[i]; i++;
    }
    if (lastC) out += "్";
    return out;
  }
  /* converts every English-letter word in a text (used by the help pad) */
  const translitText = (t) => t.replace(/\\?[A-Za-z~]+/g, (m) => (m[0] === "\\" ? m.slice(1) : translit(m)));

  const TE = (window.KJTE = { translit, translitText, on: false });
  const store = { get: (k, d) => { try { const v = localStorage.getItem("kj_" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
                  set: (k, v) => { try { localStorage.setItem("kj_" + k, JSON.stringify(v)); } catch (e) {} } };
  /* Telugu fields of the Teacher page */
  TE.FIELDS = '#qt,#et,#ot0,#ot1,#ot2,#ot3,#nte,#ltt,#lbt,#pt,#tepad,[data-f$=".te"]';
  const isField = (el) => el && el.matches && el.matches(TE.FIELDS);
  const SEP = /[\s.,?!;:)\]}\/"'”’\-–—]/;

  let hint = null;
  function showHint(el) {
    if (!TE.on || !isField(el)) return hideHint();
    const pos = el.selectionStart, m = el.value.slice(0, pos).match(/\\?[A-Za-z~]+$/);
    if (!m) return hideHint();
    if (!hint) { hint = document.createElement("div"); hint.className = "te-hint"; document.body.appendChild(hint); }
    hint.textContent = m[0][0] === "\\" ? m[0].slice(1) + "  (English)" : m[0] + "  →  " + translit(m[0]);
    const r = el.getBoundingClientRect();
    hint.style.left = Math.max(8, r.left + window.scrollX) + "px";
    hint.style.top = r.bottom + window.scrollY + 4 + "px";
    hint.style.display = "block";
  }
  function hideHint() { if (hint) hint.style.display = "none"; }

  /* convert the English word just before the caret (pos = index after the word) */
  function convertBefore(el, pos, keepSepLen) {
    const v = el.value, before = v.slice(0, pos), m = before.match(/\\?[A-Za-z~]+$/);
    if (!m) return false;
    const word = m[0], tel = word[0] === "\\" ? word.slice(1) : translit(word);
    if (tel === word) return false;
    el.value = before.slice(0, before.length - word.length) + tel + v.slice(pos);
    const np = pos - word.length + tel.length + (keepSepLen || 0);
    el.setSelectionRange(np, np);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }
  let busy = false;
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (busy || !TE.on || !isField(el) || e.inputType === "insertFromPaste") return showHint(el);
    const pos = el.selectionStart, ch = el.value[pos - 1];
    if (ch && SEP.test(ch)) { busy = true; convertBefore(el, pos - 1, 1); busy = false; }
    showHint(el);
  }, true);
  document.addEventListener("focusout", (e) => {                 // leaving the field converts the last word
    const el = e.target; hideHint();
    if (!TE.on || !isField(el)) return;
    busy = true; convertBefore(el, el.value.length, 0); busy = false;
  }, true);
  document.addEventListener("keydown", (e) => {
    if (e.key === "F2") { e.preventDefault(); TE.set(!TE.on); }
    if (e.key === "Escape") hideHint();
  }, true);
  document.addEventListener("focusin", (e) => showHint(e.target), true);

  TE.set = function (on) {
    TE.on = !!on; store.set("t_te", TE.on);
    document.body.classList.toggle("te-on", TE.on);
    const b = document.getElementById("teBtn");
    if (b) { b.textContent = TE.on ? "అ Telugu typing: ON" : "అ Telugu typing: OFF"; b.classList.toggle("on", TE.on); }
    if (!TE.on) hideHint();
    const t = document.createElement("div"); t.className = "toast";
    t.textContent = TE.on ? "Telugu typing ON (F2 to switch) – type in English letters, e.g. amma → అమ్మ" : "Telugu typing OFF";
    document.body.appendChild(t); setTimeout(() => t.remove(), 2200);
  };

  /* help chart + scratch pad */
  TE.help = function () {
    const rows = [
      ["అ a", "ఆ aa / A", "ఇ i", "ఈ ii / ee / I", "ఉ u", "ఊ uu / oo / U"], ["ఋ Ru", "ఎ e", "ఏ E", "ఐ ai", "ఒ o", "ఓ O", "ఔ au"],
      ["క k", "ఖ kh", "గ g", "ఘ gh", "ఙ ~g"], ["చ ch / c", "ఛ Ch", "జ j", "ఝ jh", "ఞ ~n"], ["ట T", "ఠ Th", "డ D", "ఢ Dh", "ణ N"],
      ["త t", "థ th", "ద d", "ధ dh", "న n"], ["ప p", "ఫ ph / f", "బ b", "భ bh", "మ m"], ["య y", "ర r", "ల l", "వ v / w", "శ S / sh", "ష Sh", "స s", "హ h", "ళ L", "ఱ rr"],
      ["క్ష ksh / x", "జ్ఞ jn", "ం M", "ః H", "ఁ ~M", "్ virama: automatic"]
    ];
    const ex = [["amma", "అమ్మ"], ["telugu", "తెలుగు"], ["praSna", "ప్రశ్న"], ["samaadhaanaM", "సమాధానం"], ["aaMdhrapradES", "ఆంధ్రప్రదేశ్"],
      ["kRuShNa", "కృష్ణ"], ["vidyaarthi", "విద్యార్థి"], ["jnaanaM", "జ్ఞానం"], ["vij~naanaM", "విజ్ఞానం"], ["raajyaaMgaM", "రాజ్యాంగం"]];
    const m = document.createElement("div"); m.className = "modal";
    m.innerHTML = `<div class="box"><h3 style="margin-top:0">అ Telugu typing – how to type</h3>
<p class="small">Switch on with <b>F2</b> or the header button. In Telugu boxes (question, options and explanation in తెలుగు, Telugu titles, the paper text box) type the <b>sound in English letters</b>. The word turns into Telugu when you press <b>space</b>, <b>Enter</b> or punctuation. Capital letters matter (t = త, T = ట). Start a word with <code>\\</code> to keep it in English (e.g. <code>\\APPSC</code>).</p>
<div style="overflow-x:auto"><table class="t te-chart">${rows.map((r) => "<tr>" + r.map((c) => { const [t, ...k] = c.split(" "); return `<td><b class="t-te" style="color:var(--ink);font-size:17px">${t}</b> <code>${k.join(" ")}</code></td>`; }).join("") + "</tr>").join("")}</table></div>
<p class="small" style="margin-bottom:4px"><b>Examples:</b> ${ex.map(([a, b]) => `<code>${a}</code> → <span class="t-te" style="display:inline;color:var(--ink)">${b}</span>`).join(" · ")}</p>
<label>Practice pad (type here, then copy)</label><textarea id="tepad" style="min-height:90px" placeholder="nEnu telugu nErchukuMTunnaanu"></textarea>
<div class="row" style="margin-top:8px"><span class="small muted" id="tepadst"></span><span class="sp"></span><button class="btn alt sm" id="tepadcp">Copy</button><button class="btn alt sm" data-close>Close</button></div></div>`;
    m.addEventListener("click", (e) => { if (e.target === m || e.target.hasAttribute("data-close")) m.remove(); });
    document.body.appendChild(m);
    const pad = m.querySelector("#tepad");
    if (!TE.on) m.querySelector("#tepadst").textContent = "Tip: switch Telugu typing ON (F2) to try the pad.";
    m.querySelector("#tepadcp").onclick = async () => {
      try { await navigator.clipboard.writeText(pad.value); m.querySelector("#tepadst").textContent = "Copied ✔"; }
      catch (e) { pad.select(); m.querySelector("#tepadst").textContent = "Press Ctrl+C to copy"; }
    };
    pad.focus();
  };

  document.addEventListener("DOMContentLoaded", () => {
    const b = document.getElementById("teBtn"), h = document.getElementById("teHelp");
    if (b) b.onclick = () => TE.set(!TE.on);
    if (h) h.onclick = () => TE.help();
    TE.on = !!store.get("t_te", false);
    document.body.classList.toggle("te-on", TE.on);
    if (b) { b.textContent = TE.on ? "అ Telugu typing: ON" : "అ Telugu typing: OFF"; b.classList.toggle("on", TE.on); }
  });
})();
