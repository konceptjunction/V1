/* KONCEPT JUNCTION — service worker (V1)
   Bump VERSION in every new upload pack so phones pick up new files. */
const VERSION = "kj-v18";
const SHELL = [
  "./", "home.html", "index.html", "manifest.json",
  "assets/css/app.css",
  "assets/js/config.js", "assets/js/common.js", "assets/js/exam.js", "assets/js/app.js", "assets/js/share.js", "assets/js/vendor/qrcode.js",
  "assets/icons/logo.png", "assets/icons/watermark.png", "assets/icons/icon-192.png", "assets/icons/icon-512.png",
  "data/subjects.json", "data/exams.json", "data/papers.json", "data/notes.json",
  "data/current_affairs.json", "data/announcements.json",
  "data/questions/polity.json", "data/questions/history.json", "data/questions/state.json",
  "data/questions/geography.json", "data/questions/economy.json", "data/questions/science.json",
  "data/questions/reasoning.json", "data/questions/quant.json", "data/questions/english.json",
  "data/questions/eee.json", "data/questions/current.json"
];
const CDN = /(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com|unpkg\.com)/;
const BYPASS = /(api\.github\.com|api\.cloudinary\.com|script\.google\.com|script\.googleusercontent\.com)/;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION && k !== "kj-pdf" && k !== "kj-cdn").map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

async function networkFirst(req) {
  const c = await caches.open(VERSION);
  try {
    const r = await fetch(req, { cache: "no-cache" });
    if (r && r.ok) c.put(req.url.split("?")[0], r.clone());
    return r;
  } catch (e) {
    const hit = await c.match(req.url.split("?")[0]) || await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === "navigate") return (await c.match("home.html")) || Response.error();
    throw e;
  }
}
async function cacheFirst(req) {
  const c = await caches.open(VERSION);
  const hit = await c.match(req, { ignoreSearch: true });
  if (hit) return hit;
  const r = await fetch(req);
  if (r && r.ok) c.put(req, r.clone());
  return r;
}
async function staleWhileRevalidate(req) {
  const c = await caches.open("kj-cdn");
  const hit = await c.match(req);
  const net = fetch(req).then((r) => { if (r && (r.ok || r.type === "opaque")) c.put(req, r.clone()); return r; }).catch(() => hit);
  return hit || net;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (BYPASS.test(url.host)) return;
  if (CDN.test(url.host)) { e.respondWith(staleWhileRevalidate(req)); return; }
  if (url.origin !== location.origin) return;
  if (/\.(pdf|mp4|webm|mov|m4v)$/i.test(url.pathname)) return;   // V13: big media from media/ – network only ("Save offline" keeps PDFs)
  if (req.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.includes("/data/") || url.pathname.endsWith("config.js")) {
    e.respondWith(networkFirst(req)); return;
  }
  e.respondWith(cacheFirst(req));
});
