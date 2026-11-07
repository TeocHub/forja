// Forja: caché simple para que la app abra sin conexión.
// Los datos se piden primero a la red (siempre lo más nuevo) y solo se usa la caché si no hay conexión.
// Al instalar se guarda solo lo esencial; cada página queda guardada la primera vez que se visita.
// Al cambiar de versión, lo ya guardado pasa a la caché nueva (no se vuelve a descargar todo el sitio).
const CACHE = "forja-v31";
const SHELL = ["./", "proyectos/", "manifest.webmanifest", "icon.svg", "css/forja.css", "js/forja.js"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil((async () => {
  const nueva = await caches.open(CACHE);
  for (const k of await caches.keys()) {
    if (k === CACHE) continue;
    const vieja = await caches.open(k);
    for (const req of await vieja.keys()) { if (!(await nueva.match(req))) { const res = await vieja.match(req); if (res) await nueva.put(req, res); } }
    await caches.delete(k);
  }
  await self.clients.claim();
})()));
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; }).catch(() => caches.match(req)));
});
