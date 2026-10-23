/* KONCEPT JUNCTION — share.js (V18)
   📤 Share button next to the profile (Student Mode):
     • QR code ("scanner") – a friend scans it with the phone camera and the app opens
     • WhatsApp / Mail (main buttons) · More apps (phone share sheet) · Copy link
     • ⬇ Download QR poster (PNG) to print or send
     • 📷 Scan a QR – reads a friend's KJ QR with the camera (Android Chrome); otherwise use the phone camera app
   Works offline (QR is drawn on the phone, no internet service used). */
(function () {
  const C = window.KJ_CONFIG || {};
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = (k, d) => { try { const v = localStorage.getItem("kj_" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };

  /* link to share: config SHARE_URL if set, otherwise this app's own address */
  function appUrl() {
    if (C.SHARE_URL && !/YOUR_/.test(C.SHARE_URL)) return C.SHARE_URL;
    const u = new URL("home.html", location.href); u.hash = ""; u.search = "";
    return u.href;
  }
  function message() {
    const nm = (store("profile", {}).name || "").trim();
    const name = C.APP_NAME || "KONCEPT JUNCTION";
    return `📘 ${name} – DREAM TO ACHIEVE\n` +
      `Free practice app for APPSC / TGPSC Group-I, II, IV, Police SI, AE/AEE – English + తెలుగు, Topic Tests, Mock tests, Performance.` +
      (nm ? `\nShared by ${nm}.` : "") + `\nOpen / install: `;
  }
  /* QR as an SVG string */
  function qrSvg(text, px) {
    const q = qrcode(0, "M"); q.addData(text); q.make();
    const n = q.getModuleCount(), m = 4, size = n + m * 2;
    let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${px}" height="${px}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
  }
  /* QR poster as PNG (canvas) */
  async function poster(url) {
    const W = 900, H = 1240, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#1b3a6b"; g.fillRect(0, 0, W, 230);
    try {
      const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = C.LOGO || "assets/icons/logo.png"; });
      g.save(); g.beginPath(); g.arc(120, 115, 75, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill(); g.clip(); g.drawImage(img, 45, 40, 150, 150); g.restore();
    } catch (e) {}
    g.fillStyle = "#fff"; g.font = "bold 54px sans-serif"; g.fillText(C.APP_NAME || "KONCEPT JUNCTION", 220, 112);
    g.fillStyle = "#f0a30a"; g.font = "bold 34px sans-serif"; g.fillText("DREAM TO ACHIEVE", 222, 165);
    const q = qrcode(0, "M"); q.addData(url); q.make();
    const n = q.getModuleCount(), cell = Math.floor(640 / (n + 8)), qs = cell * (n + 8), x0 = (W - qs) / 2, y0 = 290;
    g.fillStyle = "#fff"; g.fillRect(x0, y0, qs, qs); g.strokeStyle = "#1b3a6b"; g.lineWidth = 6; g.strokeRect(x0 - 3, y0 - 3, qs + 6, qs + 6);
    g.fillStyle = "#000";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) g.fillRect(x0 + (c + 4) * cell, y0 + (r + 4) * cell, cell, cell);
    g.textAlign = "center"; g.fillStyle = "#1b3a6b"; g.font = "bold 46px sans-serif"; g.fillText("📷 Scan to join", W / 2, y0 + qs + 80);
    g.font = "36px sans-serif"; g.fillStyle = "#333"; g.fillText("స్కాన్ చేసి యాప్ తెరవండి", W / 2, y0 + qs + 135);
    g.font = "24px sans-serif"; g.fillStyle = "#555"; g.fillText(url.length > 60 ? url.slice(0, 60) + "…" : url, W / 2, y0 + qs + 185);
    g.font = "22px sans-serif"; g.fillText("APPSC · TGPSC · Group-I / II / IV · Police SI · AE / AEE – English + తెలుగు", W / 2, H - 40);
    return cv.toDataURL("image/png");
  }

  function toast(t) { if (window.KJ && KJ.toast) return KJ.toast(t); alert(t); }

  /* 📷 in-app scanner (BarcodeDetector – Android Chrome/Edge). iPhone: phone camera app. */
  async function scan(box) {
    if (!("BarcodeDetector" in window) || !navigator.mediaDevices) {
      box.innerHTML = `<p class="small">📷 This phone's browser can't scan inside the app. Open your <b>phone Camera</b> (or Google Lens) and point it at the QR code – tap the link that appears.</p>`;
      return;
    }
    box.innerHTML = `<video id="kjcam" playsinline muted style="width:100%;max-height:300px;border-radius:10px;background:#000"></video><p class="small muted" id="kjcamst">Point the camera at a KJ QR code…</p><button class="btn alt sm" id="kjcamx">Stop</button>`;
    let stream, stop = false;
    try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); }
    catch (e) { box.innerHTML = `<p class="small" style="color:var(--bad)">Camera not allowed. Allow camera for this site, or use the phone Camera app.</p>`; return; }
    const v = box.querySelector("#kjcam"); v.srcObject = stream; await v.play();
    const end = () => { stop = true; stream.getTracks().forEach((t) => t.stop()); };
    box.querySelector("#kjcamx").onclick = () => { end(); box.innerHTML = ""; };
    const det = new BarcodeDetector({ formats: ["qr_code"] });
    const loop = async () => {
      if (stop || !document.body.contains(v)) return end();
      try {
        const r = await det.detect(v);
        if (r.length) {
          const val = r[0].rawValue; end();
          const isUrl = /^https?:\/\//i.test(val);
          box.innerHTML = `<p class="small">✔ Scanned: <b style="word-break:break-all">${esc(val)}</b></p>` + (isUrl ? `<a class="btn ok sm" href="${esc(val)}">Open link</a>` : "");
          return;
        }
      } catch (e) {}
      setTimeout(loop, 300);
    };
    loop();
  }

  function open() {
    const url = appUrl(), msg = message(), full = msg + url;
    const m = document.createElement("div"); m.className = "modal"; m.id = "shareModal";
    m.innerHTML = `<div class="box share-box">
<div class="row" style="align-items:center"><h3 style="margin:0">📤 Share KONCEPT JUNCTION</h3><span class="sp"></span><button class="btn alt sm" data-close>✕</button></div>
<p class="small muted" style="margin:6px 0 10px">Ask your friend to <b>scan this QR</b> with the phone camera – the app opens. Or send the link.</p>
<div class="qr-wrap" id="kjqr">${qrSvg(url, 230)}</div>
<div class="small" style="text-align:center;word-break:break-all;margin:6px 0 12px"><a href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a></div>
<div class="share-main">
  <a class="btn wa" id="shWa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(full)}">🟢 WhatsApp</a>
  <a class="btn ml" id="shMail" href="mailto:?subject=${encodeURIComponent((C.APP_NAME || "KONCEPT JUNCTION") + " – practice app for competitive exams")}&body=${encodeURIComponent("Hi,\n\n" + full + "\n\nScan the QR or open the link on your phone and tap Install / Add to Home screen.\n")}">✉️ Mail</a>
</div>
<div class="share-grid">
  <button class="btn alt" id="shNative">📤 More apps</button>
  <button class="btn alt" id="shCopy">📋 Copy link</button>
  <button class="btn alt" id="shPng">⬇ QR poster</button>
  <button class="btn alt" id="shScan">📷 Scan a QR</button>
</div>
<div id="kjscan" style="margin-top:10px"></div></div>`;
    const close = () => { const v = m.querySelector("video"); if (v && v.srcObject) v.srcObject.getTracks().forEach((t) => t.stop()); m.remove(); };
    m.addEventListener("click", (e) => { if (e.target === m || e.target.closest("[data-close]")) close(); });
    document.body.appendChild(m);
    const nat = m.querySelector("#shNative");
    if (!navigator.share) nat.style.display = "none";
    nat.onclick = async () => { try { await navigator.share({ title: C.APP_NAME || "KONCEPT JUNCTION", text: msg, url }); } catch (e) {} };
    m.querySelector("#shCopy").onclick = async () => {
      try { await navigator.clipboard.writeText(full); toast("Link copied ✔ – paste it in WhatsApp / SMS"); }
      catch (e) { prompt("Copy this link:", url); }
    };
    m.querySelector("#shPng").onclick = async () => {
      const data = await poster(url), a = document.createElement("a");
      a.href = data; a.download = "KONCEPT_JUNCTION_QR.png"; document.body.appendChild(a); a.click(); a.remove();
      toast("QR poster saved – print it or send it");
    };
    m.querySelector("#shScan").onclick = () => scan(m.querySelector("#kjscan"));
  }

  window.KJShare = { open, appUrl, qrSvg, poster };
  document.addEventListener("DOMContentLoaded", () => {
    const b = document.getElementById("tb-share");
    if (b) b.onclick = open;
    if (/[#&?]share\b/.test(location.hash)) setTimeout(open, 300);
  });
})();
