// Forja: caché simple para que la app abra sin conexión.
// Los datos se piden primero a la red (siempre lo más nuevo) y solo se usa la caché si no hay conexión.
// Al instalar se guarda solo lo esencial; cada página queda guardada la primera vez que se visita.
// Al cambiar de versión, lo ya guardado pasa a la caché nueva (no se vuelve a descargar todo el sitio).
// Las páginas se guardan sin su ?consulta (proyecto/?p=… es siempre el mismo archivo): así la caché no crece
// con cada proyecto o vitrina que se abre, y sin conexión cualquier proyecto abre su página.
const CACHE = "forja-v33";
const SHELL = ["./", "proyectos/", "manifest.webmanifest", "icon.svg", "css/forja.css", "js/forja.js"];
const clave = (req) => (req.mode === "navigate" ? new URL(req.url).origin + new URL(req.url).pathname : req);
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil((async () => {
  const nueva = await caches.open(CACHE);
  for (const k of await caches.keys()) {
    if (k === CACHE) continue;
    const vieja = await caches.open(k);
    for (const req of await vieja.keys()) {
      const u = new URL(req.url);
      if (u.search && /\/$/.test(u.pathname)) continue; // copias viejas de páginas con ?consulta: no se traspasan
      if (!(await nueva.match(req))) { const res = await vieja.match(req); if (res) await nueva.put(req, res); }
    }
    await caches.delete(k);
  }
  await self.clients.claim();
})()));
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(req);
      if (res.status === 200 && res.type === "basic") { const copia = res.clone(); e.waitUntil(caches.open(CACHE).then((c) => c.put(clave(req), copia)).catch(() => {})); }
      return res;
    } catch (err) {
      const guardada = (await caches.match(clave(req))) || (req.mode === "navigate" ? await caches.match(new URL("./", location).href) : null);
      return guardada || new Response("Sin conexión", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
  })());
});
