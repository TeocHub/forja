// Forja: caché simple para que la app abra sin conexión.
// Los datos se piden primero a la red (siempre lo más nuevo) y solo se usa la caché si no hay conexión.
const CACHE = "forja-v13";
const SHELL = ["./", "index.html", "oportunidades.html", "proyectos.html", "proyecto.html", "cotizador.html", "biblia.html", "entrar.html", "planes.html", "eventos.html", "cotizaciones.html", "manifest.webmanifest", "icon.svg", "js/forja.js", "js/brujula.js", "js/guias.js", "js/planes.js", "js/pizarra.js", "css/forja.css"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; }).catch(() => caches.match(req)));
});
