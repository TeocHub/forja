// Forja · Vitrina: la página pública de un proyecto.
// El contenido NO se lee en vivo del Taller, la bitácora ni las pizarras: el editor guarda copias en
// public.vitrinas.borrador y "Publicar" deja una versión filtrada en public.vitrinas_publicadas (lo único legible sin cuenta).
// Esta misma función pinta la vista previa del editor y la página pública, para que se vea igual.
//
// datos = { v:1, titulo, lema, firma, tipo, formato, portada:{url,foco}, tono, acento,
//           historia:[{id,titulo,texto}], galeria:[{id,tipo,valor,titulo,nota}],
//           pizarras:[{id,nombre,modo,soloTitulos,ocultas:[],datos}], novedades:[{id,fecha,titulo,texto}], enlaces:[{id,nombre,url}] }
import { TIPOS } from "./guias.js";
import { FORMATOS } from "./brujula.js";
import { montar, MODOS, CSS_PIZARRA } from "./pizarra.js";

export const TONOS = {
  claro: { n: "Claro", d: "Fondo luminoso, limpio." },
  noche: { n: "Noche", d: "Oscuro, para imágenes con brillo." },
  papel: { n: "Papel", d: "Cálido y con letra de libro." },
};
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
export const okUrl = (u) => (/^https:\/\/[^\s"'<>]+$/i.test(String(u || "").trim()) ? String(u).trim() : "");
export const okColor = (c) => (/^#[0-9a-f]{6}$/i.test(c || "") ? c.toLowerCase() : "");
export const uid = () => Math.random().toString(36).slice(2, 10);
const arr = (x) => (Array.isArray(x) ? x : []);
const corta = (s, n) => String(s ?? "").slice(0, n);
const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fechaTxt = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ""); return m ? +m[3] + " " + MES[+m[2] - 1] + " " + m[1] : ""; };

/* ---------- reconocer enlaces (igual que en Referentes) ---------- */
export function yt(u) { const m = String(u).match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/i); return m && m[1]; }
export function vimeo(u) { const m = String(u).match(/vimeo\.com\/(?:video\/)?(\d+)/i); return m && m[1]; }
export function spotify(u) { const m = String(u).match(/open\.spotify\.com\/(?:embed\/)?(track|album|playlist|episode|show|artist)\/([\w]+)/i); return m && [m[1], m[2]]; }
const soundcloud = (u) => /^https:\/\/(www\.|m\.)?soundcloud\.com\/[\w-]+\/[\w-]+/i.test(u);
export function detectar(v) {
  v = String(v || "").trim();
  if (okColor(v)) return { tipo: "color", valor: v.toLowerCase() };
  if (!okUrl(v)) return null;
  if (yt(v) || vimeo(v)) return { tipo: "video", valor: v };
  if (spotify(v) || soundcloud(v)) return { tipo: "audio", valor: v };
  if (/\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(v) || /^https:\/\/(i\.imgur\.com|images\.unsplash\.com|pbs\.twimg\.com|i\.pinimg\.com)\//i.test(v)) return { tipo: "imagen", valor: v };
  return { tipo: "enlace", valor: v };
}
const dominio = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };

/* ---------- datos ---------- */
export function nuevaVitrina(P) {
  return { v: 1, titulo: P.nombre || "", lema: corta(P.resumen || "", 180), firma: "", tipo: P.tipo, formato: P.formato || null,
    portada: null, tono: "claro", acento: ACENTO_TIPO[P.tipo] || ACENTO_TIPO.otro, historia: [], galeria: [], pizarras: [], novedades: [], enlaces: [] };
}
export const ACENTO_TIPO = { historia: "#7a3fc4", videojuego: "#2a3fd1", juegomesa: "#0f7a4f", contenido: "#c2366b", producto: "#a86200", otro: "#5b6275" };
export function normal(d) {
  d = d && typeof d === "object" ? d : {};
  return {
    v: 1, titulo: corta(d.titulo, 160), lema: corta(d.lema, 240), firma: corta(d.firma, 80), tipo: d.tipo || "otro", formato: d.formato || null,
    portada: d.portada && okUrl(d.portada.url) ? { url: okUrl(d.portada.url), foco: Math.min(100, Math.max(0, +d.portada.foco || 50)) } : null,
    tono: TONOS[d.tono] ? d.tono : "claro", acento: okColor(d.acento) || "#2a3fd1",
    historia: arr(d.historia).filter((h) => h && h.id).map((h) => ({ id: h.id, titulo: corta(h.titulo, 160), texto: corta(h.texto, 60000), ...(h.de ? { de: h.de } : {}) })),
    galeria: arr(d.galeria).filter((g) => g && g.id && (g.tipo === "color" ? okColor(g.valor) : g.tipo === "cita" ? g.valor : okUrl(g.valor))).map((g) => ({ id: g.id, tipo: g.tipo, valor: g.tipo === "cita" ? corta(g.valor, 2000) : g.valor, titulo: corta(g.titulo, 160), nota: corta(g.nota, 600), ...(g.de ? { de: g.de } : {}) })),
    pizarras: arr(d.pizarras).filter((z) => z && z.id && MODOS[z.modo]).map((z) => ({ id: z.id, nombre: corta(z.nombre, 120), modo: z.modo, soloTitulos: !!z.soloTitulos, ocultas: arr(z.ocultas), datos: z.datos || {}, ...(z.tomada ? { tomada: z.tomada } : {}) })),
    novedades: arr(d.novedades).filter((n) => n && n.id).map((n) => ({ id: n.id, fecha: /^\d{4}-\d{2}-\d{2}$/.test(n.fecha || "") ? n.fecha : "", titulo: corta(n.titulo, 160), texto: corta(n.texto, 8000) })),
    enlaces: arr(d.enlaces).filter((e) => e && e.id).map((e) => ({ id: e.id, nombre: corta(e.nombre, 60), url: String(e.url || "").trim() })),
  };
}
// Lo que de verdad se publica: sin tarjetas ocultas, sin notas si se pidió "solo títulos", sin enlaces internos,
// sin bloques vacíos y, en el plan gratis, sin pizarras.
export function paraPublicar(b, { mas }) {
  const d = normal(JSON.parse(JSON.stringify(b)));
  d.historia = d.historia.filter((h) => h.titulo.trim() || h.texto.trim()).map(({ id, titulo, texto }) => ({ id, titulo, texto }));
  d.galeria = d.galeria.map(({ id, tipo, valor, titulo, nota }) => ({ id, tipo, valor, titulo, nota }));
  d.novedades = d.novedades.filter((n) => n.titulo.trim() || n.texto.trim()).sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  d.enlaces = d.enlaces.filter((e) => okUrl(e.url)).map((e) => ({ ...e, nombre: e.nombre.trim() || dominio(e.url) }));
  d.pizarras = !mas ? [] : d.pizarras.map((z) => {
    const ocultas = new Set(z.ocultas), x = z.datos || {};
    const tarjetas = arr(x.tarjetas).filter((t) => !ocultas.has(t.id)).map((t) => { const c = { ...t }; delete c.enlace; if (z.soloTitulos) delete c.texto; return c; });
    const ids = new Set(tarjetas.map((t) => t.id));
    return { id: z.id, nombre: z.nombre, modo: z.modo, datos: { tarjetas, flechas: arr(x.flechas).filter((f) => ids.has(f.de) && ids.has(f.a)), regiones: arr(x.regiones), actos: arr(x.actos), fondo: x.fondo || null } };
  }).filter((z) => z.datos.tarjetas.length || z.datos.regiones.length);
  return d;
}

/* ---------- pintar ---------- */
// opts: { previa: bool } — en la vista previa no hay barra de Forja ni enlaces que saquen de la página.
export function pintarVitrina(raiz, datos, opts = {}) {
  const d = normal(datos), previa = !!opts.previa;
  (raiz._pizarras || []).forEach((e) => e.destruir()); raiz._pizarras = [];
  const formato = FORMATOS.find((f) => f.k === d.formato);
  const etiqueta = [TIPOS[d.tipo], formato && formato.n !== TIPOS[d.tipo] ? formato.n : ""].filter(Boolean).join(" · ");
  const colores = d.galeria.filter((g) => g.tipo === "color").map((g) => g.valor);
  const piezas = d.galeria.filter((g) => g.tipo !== "color");
  const partes = [
    d.historia.length && ["historia", "La historia"],
    (piezas.length || colores.length) && ["galeria", "Galería"],
    d.pizarras.length && ["mundo", "El mundo"],
    d.novedades.length && ["novedades", "Novedades"],
    d.enlaces.length && ["enlaces", "Dónde seguirlo"],
  ].filter(Boolean);
  const fondoHero = d.portada
    ? '<img class="vt-portada" src="' + esc(d.portada.url) + '" alt="" referrerpolicy="no-referrer" style="object-position:50% ' + d.portada.foco + '%">'
    : '<div class="vt-generativa" aria-hidden="true" style="--c2:' + (colores[0] || "var(--vt-acento)") + ";--c3:" + (colores[1] || colores[0] || "var(--vt-acento)") + '"><span>' + esc((d.titulo || "?").trim()[0] || "?") + "</span></div>";

  raiz.innerHTML = '<div class="vt' + (d.portada ? "" : " sin-portada") + '" data-tono="' + d.tono + '" style="--vt-acento:' + d.acento + '">' +
    (previa ? "" : '<div class="vt-barra"><a href="index.html" class="vt-marca">Forja</a><a href="entrar.html" class="vt-crea">Crea la vitrina de tu proyecto</a></div>') +
    '<header class="vt-hero' + (d.portada ? " con-imagen" : "") + '">' + fondoHero +
      '<div class="vt-hero-txt">' + (etiqueta ? '<span class="vt-etq">' + esc(etiqueta) + "</span>" : "") +
      "<h1>" + (d.titulo ? esc(d.titulo) : "<i>Sin título</i>") + "</h1>" + (d.lema ? '<p class="vt-lema">' + esc(d.lema) + "</p>" : "") +
      (d.firma ? '<p class="vt-firma">por ' + esc(d.firma) + "</p>" : "") + "</div></header>" +
    (partes.length > 1 ? '<nav class="vt-indice" aria-label="Secciones">' + partes.map(([k, n]) => '<a href="#vt-' + k + '" data-ir="' + k + '">' + n + "</a>").join("") + "</nav>" : "") +
    '<main class="vt-cuerpo">' +
    (d.historia.length ? '<section class="vt-sec vt-historia" id="vt-historia"><h2 class="vt-h2">La historia</h2>' + d.historia.map((h, i) =>
      '<article class="vt-cap"><span class="vt-num" aria-hidden="true">' + String(i + 1).padStart(2, "0") + "</span><div>" + (h.titulo ? "<h3>" + esc(h.titulo) + "</h3>" : "") + parrafos(h.texto) + "</div></article>").join("") + "</section>" : "") +
    (piezas.length || colores.length ? '<section class="vt-sec" id="vt-galeria"><h2 class="vt-h2">Galería</h2>' +
      (colores.length ? '<div class="vt-paleta" role="img" aria-label="Paleta de colores: ' + colores.join(", ") + '">' + colores.map((c) => '<span style="background:' + c + '"><i>' + c.toUpperCase() + "</i></span>").join("") + "</div>" : "") +
      (piezas.length ? '<div class="vt-galeria">' + piezas.map(pieza).join("") + "</div>" : "") + "</section>" : "") +
    (d.pizarras.length ? '<section class="vt-sec" id="vt-mundo"><h2 class="vt-h2">El mundo</h2><p class="vt-guia">Explóralo: arrastra para moverte, acerca con la rueda o pellizcando, y toca una tarjeta para leerla.</p>' +
      (d.pizarras.length > 1 ? '<div class="vt-tabs" role="tablist">' + d.pizarras.map((z, i) => '<button type="button" role="tab" aria-selected="' + !i + '" data-pz="' + i + '">' + esc(z.nombre) + "<small>" + MODOS[z.modo].corto + "</small></button>").join("") + "</div>" : "") +
      '<div class="vt-pizarra"></div></section>' : "") +
    (d.novedades.length ? '<section class="vt-sec" id="vt-novedades"><h2 class="vt-h2">Novedades</h2><div class="vt-linea">' + d.novedades.map((n) =>
      '<article class="vt-nov"><time datetime="' + esc(n.fecha) + '">' + esc(fechaTxt(n.fecha)) + "</time><div>" + (n.titulo ? "<h3>" + esc(n.titulo) + "</h3>" : "") + parrafos(n.texto, 600) + "</div></article>").join("") + "</div></section>" : "") +
    (d.enlaces.length ? '<section class="vt-sec" id="vt-enlaces"><h2 class="vt-h2">Dónde seguirlo</h2><div class="vt-enlaces">' + d.enlaces.map((e) =>
      '<a href="' + esc(e.url) + '" target="_blank" rel="noopener noreferrer"' + (previa ? ' tabindex="-1"' : "") + "><b>" + esc(e.nombre || dominio(e.url)) + "</b><small>" + esc(dominio(e.url)) + "</small></a>").join("") + "</div></section>" : "") +
    (!partes.length ? '<p class="vt-vacia">' + (previa ? "Agrega la historia, imágenes o novedades desde el panel y aparecerán aquí." : "Esta vitrina se está preparando.") + "</p>" : "") +
    "</main>" +
    '<footer class="vt-pie"><span>' + (opts.fecha ? "Actualizada el " + esc(fechaTxt(opts.fecha)) + " · " : "") + 'Vitrina hecha con <a href="index.html"' + (previa ? ' tabindex="-1"' : "") + ">Forja</a></span></footer>" +
    '<dialog class="vt-caja"><button type="button" class="vt-cerrar" aria-label="Cerrar">×</button><figure></figure></dialog></div>';

  const vt = raiz.querySelector(".vt");
  // videos: se cargan solo al tocar (sin cookies antes de eso)
  vt.querySelectorAll("[data-video]").forEach((b) => b.onclick = () => { b.parentElement.innerHTML = reproductor(b.dataset.video); });
  // leer más en novedades largas
  vt.querySelectorAll(".vt-mas").forEach((b) => b.onclick = () => { b.previousElementSibling.hidden = false; b.remove(); });
  // caja de imágenes
  const caja = vt.querySelector(".vt-caja");
  vt.querySelectorAll("[data-zoom]").forEach((b) => b.onclick = () => {
    const g = piezas.find((x) => x.id === b.dataset.zoom);
    caja.querySelector("figure").innerHTML = '<img src="' + esc(g.valor) + '" alt="' + esc(g.titulo || "") + '" referrerpolicy="no-referrer">' + (g.titulo || g.nota ? "<figcaption>" + (g.titulo ? "<b>" + esc(g.titulo) + "</b>" : "") + (g.nota ? "<span>" + esc(g.nota) + "</span>" : "") + "</figcaption>" : "");
    caja.showModal();
  });
  caja.querySelector(".vt-cerrar").onclick = () => caja.close();
  caja.onclick = (e) => { if (e.target === caja) caja.close(); };
  vt.querySelectorAll("img").forEach((im) => im.addEventListener("error", () => {
    if (im.closest(".vt-media")) { im.outerHTML = '<div class="vt-sinmini"></div>'; return; } // video sin miniatura: se ve igual
    const p = im.closest(".vt-pieza"); if (p) p.classList.add("rota"); else if (im.classList.contains("vt-portada")) im.remove();
  }));
  // índice: desplazamiento suave dentro del contenedor (sirve también en la vista previa)
  vt.querySelectorAll("[data-ir]").forEach((a) => a.onclick = (e) => { e.preventDefault(); const s = vt.querySelector("#vt-" + a.dataset.ir); if (s) s.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); });
  // pizarras de solo lectura
  if (d.pizarras.length) {
    const caja2 = vt.querySelector(".vt-pizarra");
    const abrir = (i) => {
      (raiz._pizarras || []).forEach((e) => e.destruir());
      const z = d.pizarras[i];
      raiz._pizarras = [montar(caja2, { piz: { id: "vt-" + z.id, nombre: z.nombre, modo: z.modo, datos: z.datos }, editable: false, publico: true, secciones: [], referentes: [], guardar: async () => null })];
      vt.querySelectorAll("[data-pz]").forEach((b) => b.setAttribute("aria-selected", String(+b.dataset.pz === i)));
    };
    vt.querySelectorAll("[data-pz]").forEach((b) => b.onclick = () => abrir(+b.dataset.pz));
    abrir(0);
  }
  return () => { (raiz._pizarras || []).forEach((e) => e.destruir()); raiz._pizarras = []; };
}
function parrafos(t, corte) {
  const ps = String(t || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p) => "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>");
  if (!corte || String(t).length <= corte || ps.length < 2) return ps.join("");
  let n = 0, i = 0; for (; i < ps.length && n < corte; i++) n += ps[i].length;
  return ps.slice(0, i).join("") + (i < ps.length ? '<div hidden>' + ps.slice(i).join("") + '</div><button type="button" class="vt-mas">Leer más</button>' : "");
}
function reproductor(u) {
  const y = yt(u), v = vimeo(u), s = spotify(u);
  if (y) return '<div class="vt-video"><iframe src="https://www.youtube-nocookie.com/embed/' + y + '?autoplay=1" title="Video de YouTube" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>';
  if (v) return '<div class="vt-video"><iframe src="https://player.vimeo.com/video/' + v + '?autoplay=1" title="Video de Vimeo" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>';
  if (s) return '<iframe class="vt-audio" src="https://open.spotify.com/embed/' + s[0] + "/" + s[1] + '" height="' + (s[0] === "track" || s[0] === "episode" ? 152 : 352) + '" title="Spotify" allow="encrypted-media" loading="lazy"></iframe>';
  if (soundcloud(u)) return '<iframe class="vt-audio" height="166" title="SoundCloud" loading="lazy" allow="autoplay" src="https://w.soundcloud.com/player/?url=' + encodeURIComponent(u) + '&color=%23333333&visual=false"></iframe>';
  return "";
}
function pieza(g) {
  const pie = g.titulo || g.nota ? '<figcaption>' + (g.titulo ? "<b>" + esc(g.titulo) + "</b>" : "") + (g.nota ? "<span>" + esc(g.nota) + "</span>" : "") + "</figcaption>" : "";
  if (g.tipo === "imagen") return '<figure class="vt-pieza"><button type="button" class="vt-zoom" data-zoom="' + g.id + '" aria-label="Ampliar imagen' + (g.titulo ? ": " + esc(g.titulo) : "") + '"><img src="' + esc(g.valor) + '" alt="' + esc(g.titulo || "") + '" loading="lazy" referrerpolicy="no-referrer"></button>' + pie + "</figure>";
  if (g.tipo === "video") { const y = yt(g.valor); return '<figure class="vt-pieza"><div class="vt-media">' + (y ? '<img src="https://i.ytimg.com/vi/' + y + '/hqdefault.jpg" alt="" loading="lazy">' : '<div class="vt-sinmini"></div>') + '<button type="button" class="vt-play" data-video="' + esc(g.valor) + '"><span>▶ Reproducir</span></button></div>' + pie + "</figure>"; }
  if (g.tipo === "audio") return '<figure class="vt-pieza">' + reproductor(g.valor) + pie + "</figure>";
  if (g.tipo === "cita") return '<figure class="vt-pieza vt-cita"><blockquote>' + esc(g.valor) + "</blockquote>" + pie + "</figure>";
  return '<figure class="vt-pieza vt-link"><a href="' + esc(g.valor) + '" target="_blank" rel="noopener noreferrer"><small>' + esc(dominio(g.valor)) + "</small><b>" + esc(g.titulo || g.valor.replace(/^https:\/\/(www\.)?/, "").slice(0, 80)) + "</b></a>" + (g.nota ? "<figcaption><span>" + esc(g.nota) + "</span></figcaption>" : "") + "</figure>";
}

/* ---------- estilos ---------- */
export const FUENTES = "https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@500;700&family=Atkinson+Hyperlegible:wght@400;700&family=JetBrains+Mono:wght@500;700&family=Fraunces:opsz,wght@9..144,400;9..144,600&display=swap";
export const CSS_VITRINA = CSS_PIZARRA + `
.vt{--vt-bg:#f5f4ef;--vt-fg:#16171c;--vt-muted:#5e6271;--vt-card:#fff;--vt-line:#e3e1d9;--vt-field:#eeece5;--vt-titulo:var(--f-display,"Familjen Grotesk",system-ui,sans-serif);--vt-texto:var(--f-body,"Atkinson Hyperlegible",system-ui,sans-serif);
  --bg:var(--vt-bg);--fg:var(--vt-fg);--muted:var(--vt-muted);--card:var(--vt-card);--line:var(--vt-line);--field:var(--vt-field);--accent:var(--vt-acento);--accent-soft:color-mix(in srgb,var(--vt-acento) 12%,var(--vt-card));
  --vt-ac:var(--vt-acento);background:var(--vt-bg);color:var(--vt-fg);font-family:var(--vt-texto);font-size:17px;line-height:1.6;min-height:100%;position:relative;overflow-x:clip}
.vt[data-tono=noche]{--vt-bg:#111218;--vt-fg:#ecebe6;--vt-muted:#a0a2b0;--vt-card:#1a1c24;--vt-line:#2b2e39;--vt-field:#16181f;--vt-ac:color-mix(in srgb,var(--vt-acento) 55%,#fff)}
.vt[data-tono=papel]{--vt-ac:color-mix(in srgb,var(--vt-acento) 80%,#000)}
.vt[data-tono=papel]{--vt-bg:#efe7d8;--vt-fg:#2a2219;--vt-muted:#6e604e;--vt-card:#f8f2e6;--vt-line:#dccfb8;--vt-field:#e8dfcd;--vt-titulo:"Fraunces",Georgia,serif;--vt-texto:"Fraunces",Georgia,serif}
.vt *{box-sizing:border-box}
.vt a{color:var(--vt-ac)}
.vt :where(button,a):focus-visible{outline:2px solid var(--vt-acento);outline-offset:3px}
.vt-barra{position:absolute;top:0;left:0;right:0;z-index:5;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px max(18px,env(safe-area-inset-left));font-size:14px}
.vt-marca{font-family:"Familjen Grotesk",system-ui,sans-serif;font-weight:700;font-size:18px;text-decoration:none;color:#fff!important;text-shadow:0 1px 8px rgba(0,0,0,.35)}
.vt-crea{color:#fff!important;text-decoration:none;border:1px solid rgba(255,255,255,.55);border-radius:999px;padding:5px 12px;backdrop-filter:blur(6px);background:rgba(0,0,0,.18)}
.vt.sin-portada .vt-marca{color:var(--vt-fg)!important;text-shadow:none}
.vt.sin-portada .vt-crea{color:var(--vt-fg)!important;border-color:var(--vt-line);background:color-mix(in srgb,var(--vt-card) 70%,transparent)}
.vt-hero{position:relative;min-height:min(78vh,720px);display:flex;align-items:flex-end;overflow:hidden;isolation:isolate}
.vt-portada{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}
.vt-hero.con-imagen::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(0,0,0,.25) 0%,rgba(0,0,0,0) 30%,rgba(0,0,0,.15) 55%,rgba(0,0,0,.72) 100%)}
.vt-generativa{position:absolute;inset:0;z-index:-2;background:radial-gradient(60% 70% at 18% 22%,color-mix(in srgb,var(--vt-acento) 55%,transparent),transparent 70%),radial-gradient(55% 60% at 85% 75%,color-mix(in srgb,var(--c3) 45%,transparent),transparent 70%),radial-gradient(40% 50% at 70% 15%,color-mix(in srgb,var(--c2) 35%,transparent),transparent 70%),var(--vt-bg)}
.vt-generativa span{position:absolute;right:-.06em;bottom:-.28em;font-family:var(--vt-titulo);font-weight:700;font-size:min(62vw,560px);line-height:1;color:color-mix(in srgb,var(--vt-fg) 7%,transparent);user-select:none}
.vt-hero-txt{width:100%;max-width:1100px;margin:0 auto;padding:120px max(20px,env(safe-area-inset-left)) clamp(28px,6vw,64px)}
.vt-hero.con-imagen .vt-hero-txt{color:#fff}
.vt-etq{display:inline-block;font-family:"JetBrains Mono",monospace;font-size:12px;letter-spacing:.12em;text-transform:uppercase;padding:4px 10px;border-radius:999px;background:color-mix(in srgb,var(--vt-acento) 85%,#000);color:#fff}
.vt h1{font-family:var(--vt-titulo);font-weight:700;font-size:clamp(40px,8.5vw,96px);line-height:.95;letter-spacing:-.02em;margin:14px 0 0;max-width:16ch;text-wrap:balance}
.vt[data-tono=papel] h1{font-weight:600;letter-spacing:-.01em}
.vt h1 i{opacity:.5;font-weight:500}
.vt-lema{font-size:clamp(18px,2.4vw,23px);line-height:1.45;max-width:48ch;margin:16px 0 0;opacity:.92;text-wrap:pretty}
.vt-firma{margin:12px 0 0;font-size:15px;opacity:.8}
.vt-indice{position:sticky;top:0;z-index:4;display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;padding:10px max(16px,calc((100% - 1100px)/2 + 16px));background:color-mix(in srgb,var(--vt-bg) 88%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--vt-line)}
.vt-indice::-webkit-scrollbar{display:none}
.vt-indice a{flex:none;text-decoration:none;color:var(--vt-muted);font-size:14px;padding:6px 12px;border-radius:999px}
.vt-indice a:hover{color:var(--vt-fg);background:var(--vt-field)}
.vt-cuerpo{max-width:1100px;margin:0 auto;padding:0 max(20px,env(safe-area-inset-left))}
.vt-sec{padding:clamp(48px,8vw,96px) 0 0;scroll-margin-top:56px}
.vt-h2{font-family:"JetBrains Mono",monospace;font-weight:700;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:var(--vt-ac);margin:0 0 28px;display:flex;align-items:center;gap:14px}
.vt-h2::after{content:"";flex:1;height:1px;background:var(--vt-line)}
.vt-cap{display:grid;grid-template-columns:72px minmax(0,1fr);gap:8px 24px;padding:0 0 40px}
.vt-cap+.vt-cap{border-top:1px solid var(--vt-line);padding-top:36px}
.vt-num{font-family:var(--vt-titulo);font-size:40px;line-height:1;color:var(--vt-ac);font-weight:700;opacity:.9}
.vt-cap h3,.vt-nov h3{font-family:var(--vt-titulo);font-size:clamp(22px,3vw,30px);line-height:1.15;margin:0 0 14px;text-wrap:balance}
.vt-cap p,.vt-nov p{margin:0 0 1em;max-width:66ch;text-wrap:pretty}
.vt[data-tono=papel] .vt-cap>div>p:first-of-type::first-letter{float:left;font-size:3.4em;line-height:.85;padding:.06em .08em 0 0;font-weight:600;color:var(--vt-ac)}
@media (max-width:640px){.vt-cap{grid-template-columns:1fr}.vt-num{font-size:28px}}
.vt-paleta{display:flex;height:96px;border-radius:16px;overflow:hidden;margin-bottom:18px;border:1px solid var(--vt-line)}
.vt-paleta span{flex:1;display:flex;align-items:flex-end;padding:8px 10px;transition:flex .3s}
.vt-paleta span:hover{flex:1.8}
.vt-paleta i{font-style:normal;font-family:"JetBrains Mono",monospace;font-size:11px;padding:2px 6px;border-radius:5px;background:rgba(255,255,255,.82);color:#111}
.vt-galeria{columns:3 280px;column-gap:16px}
.vt-pieza{break-inside:avoid;margin:0 0 16px;background:var(--vt-card);border:1px solid var(--vt-line);border-radius:14px;overflow:hidden}
.vt-pieza.rota{display:none}
.vt-zoom{display:block;width:100%;padding:0;border:0;background:none;cursor:zoom-in}
.vt-pieza img{display:block;width:100%;height:auto}
.vt-pieza figcaption{padding:10px 14px 12px;display:flex;flex-direction:column;gap:2px;font-size:14px;line-height:1.45}
.vt-pieza figcaption b{font-family:var(--vt-titulo);font-size:16px}
.vt-pieza figcaption span{color:var(--vt-muted)}
.vt-media{position:relative;aspect-ratio:16/9;background:#000}
.vt-media img{width:100%;height:100%;object-fit:cover;opacity:.85}
.vt-sinmini{position:absolute;inset:0;background:linear-gradient(135deg,var(--vt-acento),#000)}
.vt-play{position:absolute;inset:0;margin:auto;width:max-content;height:max-content;font:inherit;font-size:15px;border:0;border-radius:999px;padding:10px 18px;background:rgba(255,255,255,.92);color:#111;cursor:pointer;font-weight:700}
.vt-video{aspect-ratio:16/9}.vt-video iframe{width:100%;height:100%;border:0;display:block}
.vt-audio{width:100%;border:0;display:block}
.vt-cita blockquote{margin:0;padding:22px 22px 8px;font-family:var(--vt-titulo);font-size:21px;line-height:1.4}
.vt-cita blockquote::before{content:"“";display:block;font-size:56px;line-height:.6;color:var(--vt-acento)}
.vt-link a{display:flex;flex-direction:column;gap:2px;padding:16px;text-decoration:none;color:var(--vt-fg)}
.vt-link small{font-family:"JetBrains Mono",monospace;font-size:11px;color:var(--vt-muted)}
.vt-guia{margin:-12px 0 16px;color:var(--vt-muted);font-size:15px}
.vt-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.vt-tabs button{font:inherit;font-size:15px;border:1px solid var(--vt-line);background:var(--vt-card);color:var(--vt-fg);border-radius:12px;padding:8px 14px;cursor:pointer;display:flex;gap:8px;align-items:baseline}
.vt-tabs small{font-size:12px;color:var(--vt-muted)}
.vt-tabs [aria-selected=true]{border-color:var(--vt-acento);box-shadow:inset 0 -3px 0 var(--vt-acento)}
.vt .pz{font-size:15px;line-height:1.5}
.vt-linea{position:relative;display:flex;flex-direction:column;gap:28px;padding-left:28px}
.vt-linea::before{content:"";position:absolute;left:5px;top:8px;bottom:8px;width:2px;background:var(--vt-line)}
.vt-nov{position:relative;display:grid;grid-template-columns:120px minmax(0,1fr);gap:4px 24px}
.vt-nov::before{content:"";position:absolute;left:-28px;top:8px;width:12px;height:12px;border-radius:50%;background:var(--vt-bg);border:2.5px solid var(--vt-acento)}
.vt-nov time{font-family:"JetBrains Mono",monospace;font-size:13px;color:var(--vt-muted);padding-top:6px}
.vt-nov h3{font-size:22px;margin-bottom:8px}
.vt-mas{font:inherit;font-size:14px;border:0;background:none;color:var(--vt-ac);padding:0;cursor:pointer;font-weight:700}
@media (max-width:640px){.vt-nov{grid-template-columns:1fr}.vt-nov time{padding:0}}
.vt-enlaces{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.vt-enlaces a{display:flex;flex-direction:column;gap:2px;text-decoration:none;color:var(--vt-fg);background:var(--vt-card);border:1px solid var(--vt-line);border-radius:14px;padding:16px 18px;transition:border-color .15s,transform .15s}
.vt-enlaces a:hover{border-color:var(--vt-acento);transform:translateY(-2px)}
.vt-enlaces b{font-family:var(--vt-titulo);font-size:18px}
.vt-enlaces small{font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--vt-muted)}
.vt-vacia{padding:64px 0;text-align:center;color:var(--vt-muted)}
.vt-pie{max-width:1100px;margin:0 auto;padding:72px max(20px,env(safe-area-inset-left)) 40px;font-size:13px;color:var(--vt-muted);display:flex;justify-content:center}
.vt-pie a{color:inherit;font-weight:700}
.vt-caja{border:0;padding:0;background:transparent;max-width:min(1100px,94vw);max-height:92vh}
.vt-caja::backdrop{background:rgba(8,9,12,.86)}
.vt-caja figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:10px}
.vt-caja img{max-width:100%;max-height:82vh;border-radius:8px;display:block}
.vt-caja figcaption{color:#eee;font-size:15px;text-align:center;display:flex;flex-direction:column}
.vt-caja figcaption span{opacity:.75}
.vt-cerrar{position:fixed;top:14px;right:18px;font-size:32px;line-height:1;border:0;background:none;color:#fff;cursor:pointer}
@media (prefers-reduced-motion:reduce){.vt-paleta span,.vt-enlaces a{transition:none}}
`;
