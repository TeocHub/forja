// Forja · Vitrina: la página pública de un proyecto.
// El contenido NO se lee en vivo del Taller, la bitácora ni las pizarras: el editor guarda copias en
// public.vitrinas.borrador y "Publicar" deja una versión filtrada en public.vitrinas_publicadas (lo único legible sin cuenta).
// Esta misma función pinta la vista previa del editor y la página pública, para que se vea igual.
//
// datos = { v:1, titulo, lema, firma, tipo, formato, portada:{url,foco}, tono, acento,
//           historia:[{id,titulo,texto}], galeria:[{id,tipo,valor,titulo,nota}],
//           pizarras:[{id,nombre,modo,soloTitulos,ocultas:[],datos}], novedades:[{id,fecha,titulo,texto}], enlaces:[{id,nombre,url}],
//           recompensas:{activo,plataforma,enlace,estado,abre,meta,verMeta,interes,contador,tiers:[{id,nombre,precio,desc,incluye:[],envio,limite,entrega}]} }
import { TIPOS } from "./guias.js";
import { FORMATOS } from "./brujula.js";
import { montar, MODOS, CSS_PIZARRA } from "./pizarra.js";

export const TONOS = {
  claro: { n: "Claro", d: "Fondo luminoso, limpio." },
  noche: { n: "Noche", d: "Oscuro, para imágenes con brillo." },
  papel: { n: "Papel", d: "Cálido y con letra de libro." },
};
const RAIZ = new URL("../", import.meta.url).href; // raíz del sitio, para enlazar desde cualquier carpeta
// La marca de Forja (la F-regla con su chispa), la misma de marca() en forja.js; aquí sin cargar el resto de la base.
const marca = (t) => '<svg class="fx-f" viewBox="8 8 50 50" width="' + t + '" height="' + t + '" aria-hidden="true"><path class="p" d="M19 13h28v10H30v8h14v10H30v11H19z"/>' +
  [17, 22, 27, 32, 37, 42, 47].map((y, i) => '<line class="m" x1="19" y1="' + y + '" x2="' + (19 + (i % 3 ? 3.5 : 6)) + '" y2="' + y + '"/>').join("") +
  '<path class="ch" transform="translate(50 47) scale(1.05)" d="M0 -6 Q0.9 -0.9 6 0 Q0.9 0.9 0 6 Q-0.9 0.9 -6 0 Q-0.9 -0.9 0 -6 Z"/></svg>';
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
// Enlaces de pago, apoyo o financiamiento (el mismo criterio que privado.es_pago en la base).
export const PAGO = /^https?:\/\/([a-z0-9-]+\.)*(mpago\.la|mercadopago\.[a-z.]+|paypal\.(me|com)|ko-fi\.com|buymeacoffee\.com|patreon\.com|flow\.cl|khipu\.com|webpay\.cl|transbank\.cl|sumup\.[a-z.]+|stripe\.com|gofundme\.com|kickstarter\.com|gamefound\.com|indiegogo\.com|verkami\.com|idea\.me|crowdfundchile\.cl|gumroad\.com|hotmart\.com|cafecito\.app|apoia\.se)([/?#:]|$)/i;
export const esPago = (u) => PAGO.test(String(u || "").trim());
export const LIM = { enlaces: 10, pagos: 2 };
export const cuentaPagos = (d) => [...arr(d.enlaces).map((e) => e.url), ...arr(d.galeria).map((g) => g.valor)].filter(esPago).length;
// Botón para seguir el proyecto: la persona elige el texto.
export const SEGUIR_TEXTOS = { seguir: "Seguir el proyecto", lanzamiento: "Avísame cuando lance", jugar: "Quiero jugarlo", leer: "Quiero leerlo", tener: "Lo quiero" };
const dominio = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };

/* ---------- recompensas de la campaña (copiadas desde la pestaña Campaña del cotizador) ---------- */
export const ESTADOS_CAMP = { pronto: "Abre pronto", abierta: "Campaña abierta", cerrada: "Campaña cerrada" };
export const ENVIOS = { aparte: "Envío aparte", incluido: "Envío incluido", digital: "Digital: sin envío" };
export const MAX_TIERS = 12;
// Bloques de la página de la campaña (como en Kickstarter o Gamefound): se arma con texto e imágenes.
export const BLOQUES = { titulo: "Título", texto: "Texto", imagen: "Imagen", video: "Video", cita: "Cita destacada" };
// Diseño de la vitrina: una columna (como siempre) o paneles de distintos tamaños, en el orden que elijas.
export const SECCIONES_VT = [["recompensas", "Campaña y recompensas"], ["historia", "La historia"], ["galeria", "Galería"], ["mundo", "El mundo"], ["novedades", "Novedades"], ["enlaces", "Dónde seguirlo"]];
export const TAMANOS = { completo: "Completo", dos: "2/3", medio: "Mitad", tercio: "1/3" };
export function normalDiseno(x) {
  x = x && typeof x === "object" ? x : {};
  const claves = SECCIONES_VT.map(([k]) => k), orden = arr(x.orden).filter((k) => claves.includes(k));
  claves.forEach((k) => { if (!orden.includes(k)) orden.push(k); });
  const tam = {}; claves.forEach((k) => { tam[k] = TAMANOS[(x.tam || {})[k]] ? x.tam[k] : k === "novedades" || k === "enlaces" ? "medio" : "completo"; });
  return { estilo: x.estilo === "paneles" ? "paneles" : "columna", orden, tam };
}
// Nombre del medio de pago según el dominio del enlace.
export function medioPago(url) {
  const d = (dominio(url) || "").toLowerCase();
  return /mercadopago|mpago/.test(d) ? "Mercado Pago" : /paypal/.test(d) ? "PayPal" : /ko-fi/.test(d) ? "Ko-fi" : /flow\.cl/.test(d) ? "Flow" : /webpay|transbank/.test(d) ? "Webpay" : /kickstarter/.test(d) ? "Kickstarter" : /gamefound/.test(d) ? "Gamefound" : /patreon/.test(d) ? "Patreon" : /buymeacoffee/.test(d) ? "Buy Me a Coffee" : "el enlace de pago";
}
export function normalRecompensas(x) {
  x = x && typeof x === "object" ? x : {};
  return {
    activo: !!x.activo, plataforma: corta(x.plataforma, 60), enlace: okUrl(x.enlace), estado: ESTADOS_CAMP[x.estado] ? x.estado : "pronto",
    abre: /^\d{4}-\d{2}-\d{2}$/.test(x.abre || "") ? x.abre : "", meta: Math.max(0, Math.round(+x.meta || 0)), verMeta: !!x.verMeta,
    interes: x.interes !== false, contador: !!x.contador,
    recaudado: Math.max(0, Math.round(+x.recaudado || 0)), apoyos: Math.max(0, Math.round(+x.apoyos || 0)), cierra: /^\d{4}-\d{2}-\d{2}$/.test(x.cierra || "") ? x.cierra : "",
    bloques: arr(x.bloques).filter((b) => b && b.id && BLOQUES[b.tipo]).slice(0, 40).map((b) => ({ id: String(b.id).slice(0, 20), tipo: b.tipo, texto: corta(b.texto, b.tipo === "texto" ? 4000 : 300), url: b.tipo === "imagen" || b.tipo === "video" ? okUrl(b.url) : "", pie: corta(b.pie, 200) })),
    metas: arr(x.metas).filter((m) => m && m.id).slice(0, 20).map((m) => ({ id: String(m.id).slice(0, 20), monto: Math.max(0, Math.round(+m.monto || 0)), titulo: corta(m.titulo, 100), desc: corta(m.desc, 400), imagen: okUrl(m.imagen) })).sort((a, b) => a.monto - b.monto), ...(x.tomada ? { tomada: String(x.tomada).slice(0, 30) } : {}),
    tiers: arr(x.tiers).filter((t) => t && t.id).slice(0, MAX_TIERS).map((t) => ({ id: String(t.id).slice(0, 20), nombre: corta(t.nombre, 80), precio: Math.max(0, Math.round(+t.precio || 0)),
      desc: corta(t.desc, 600), incluye: arr(t.incluye).map((i) => corta(i, 80)).filter(Boolean).slice(0, 12), envio: ENVIOS[t.envio] ? t.envio : "aparte",
      limite: Math.max(0, Math.round(+t.limite || 0)) || null, pago: esPago(okUrl(t.pago)) ? okUrl(t.pago) : "", entrega: /^\d{4}-\d{2}$/.test(t.entrega || "") ? t.entrega : "" })),
  };
}
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const mesTxt = (s) => { const m = /^(\d{4})-(\d{2})/.exec(s || ""); return m ? MESES[+m[2] - 1] + " de " + m[1] : ""; };
const pesos = (n) => "$" + Math.round(n).toLocaleString("es-CL");
function bloqueHTML(b, previa) {
  if (b.tipo === "titulo") return '<h3 class="vt-cb-t">' + esc(b.texto) + "</h3>";
  if (b.tipo === "texto") return '<div class="vt-cb-x">' + parrafos(b.texto) + "</div>";
  if (b.tipo === "cita") return '<blockquote class="vt-cb-q">' + esc(b.texto) + "</blockquote>";
  if (b.tipo === "imagen") return '<figure class="vt-cb-i"><img src="' + esc(b.url) + '" alt="' + esc(b.pie || "") + '" loading="lazy" referrerpolicy="no-referrer">' + (b.pie ? "<figcaption>" + esc(b.pie) + "</figcaption>" : "") + "</figure>";
  if (b.tipo === "video") { const id = videoDe(b.url); return id ? '<div class="vt-cb-v"><button type="button" class="vt-play" data-video="' + esc(b.url) + '"' + (previa ? " disabled" : "") + '><span>▶ Ver video</span></button>' + (b.pie ? '<p class="vt-cb-pie">' + esc(b.pie) + "</p>" : "") + "</div>" : ""; }
  return "";
}
const videoDe = (u) => yt(u) || vimeo(u);
function dias(fecha) { if (!fecha) return null; const d = Math.ceil((new Date(fecha + "T23:59:59") - Date.now()) / 864e5); return d; }
function recompensasHTML(R, previa) {
  const plat = R.plataforma || "la campaña", abierta = R.estado === "abierta" && R.enlace;
  const tope = Math.max(R.meta || 0, ...R.metas.map((m) => m.monto), R.recaudado, 1);
  const pct = R.meta ? Math.round(R.recaudado / R.meta * 100) : null;
  const dCierra = R.estado === "abierta" ? dias(R.cierra) : null, dAbre = R.estado === "pronto" ? dias(R.abre) : null;
  const proxima = R.metas.find((m) => m.monto > R.recaudado);
  const cab = R.estado === "abierta" ? "La campaña está abierta" + (R.plataforma ? " en " + esc(R.plataforma) : "") + "."
    : R.estado === "cerrada" ? "La campaña ya cerró. Gracias a quienes apoyaron."
    : "La campaña abre " + (R.abre ? "el " + esc(fechaTxt(R.abre)) : "pronto") + (R.plataforma ? " en " + esc(R.plataforma) : "") + "." + (R.interes ? " Anótate en lo que te interese y te avisamos." : "");
  // Avance: lo recaudado (lo actualiza quien crea la vitrina), la meta y las metas extra marcadas en la barra.
  const avance = (R.recaudado || (R.verMeta && R.meta) || R.apoyos || dCierra != null || dAbre != null) ? '<div class="vt-camp-av">' +
    ((R.verMeta && R.meta) || R.recaudado ? '<div class="vt-camp-barra" role="img" aria-label="' + (R.recaudado ? pesos(R.recaudado) + " recaudados" : "") + (R.verMeta && R.meta ? " de " + pesos(R.meta) : "") + '"><i style="width:' + Math.min(100, R.recaudado / tope * 100) + '%"></i>' +
      (R.verMeta && R.meta ? '<b class="vt-camp-mk meta" style="left:' + (R.meta / tope * 100) + '%" title="Meta"></b>' : "") +
      R.metas.map((m) => '<b class="vt-camp-mk' + (R.recaudado >= m.monto ? " ok" : "") + '" style="left:' + (m.monto / tope * 100) + '%" title="' + esc(m.titulo) + '"></b>').join("") + "</div>" : "") +
    '<div class="vt-camp-nums">' +
      (R.recaudado ? "<span><b>" + pesos(R.recaudado) + "</b>recaudados" + (R.verMeta && pct != null ? " · " + pct + "% de la meta" : "") + "</span>" : R.verMeta && R.meta ? "<span><b>" + pesos(R.meta) + "</b>meta</span>" : "") +
      (R.apoyos ? "<span><b>" + R.apoyos.toLocaleString("es-CL") + "</b>" + (R.apoyos === 1 ? "persona apoya" : "personas apoyan") + "</span>" : "") +
      (dCierra != null && dCierra >= 0 ? "<span><b>" + dCierra + "</b>" + (dCierra === 1 ? "día para cerrar" : "días para cerrar") + "</span>" : "") +
      (dAbre != null && dAbre >= 0 ? "<span><b>" + dAbre + "</b>" + (dAbre === 1 ? "día para abrir" : "días para abrir") + "</span>" : "") + "</div></div>" : "";
  const tiers = R.tiers.map((t, i) => {
    const boton = R.estado === "cerrada" ? ""
      : t.pago ? '<a class="vt-tier-b pagar" href="' + esc(t.pago) + '" target="_blank" rel="noopener noreferrer"' + (previa ? ' tabindex="-1"' : "") + ">Apoyar con " + esc(medioPago(t.pago)) + " ↗</a>"
      : abierta ? '<a class="vt-tier-b" href="' + esc(R.enlace) + '" target="_blank" rel="noopener noreferrer"' + (previa ? ' tabindex="-1"' : "") + ">Apoyar en " + esc(plat) + " ↗</a>"
      : R.interes ? '<button type="button" class="vt-tier-b" data-anotar="' + esc(t.id) + '" aria-pressed="false"' + (previa ? " disabled" : "") + '><span>Me interesa</span></button><span class="vt-tier-cuenta" hidden></span>' : "";
    return '<article class="vt-tier" data-tier="' + esc(t.id) + '"><div class="vt-tier-top"><span class="vt-tier-n">' + String(i + 1).padStart(2, "0") + "</span>" + (t.limite ? '<span class="vt-tier-cupo">' + t.limite + " cupos</span>" : "") + "</div>" +
      "<h3>" + esc(t.nombre || "Recompensa") + '</h3><p class="vt-tier-precio">' + (t.precio ? pesos(t.precio) : "Lo que quieras") + "</p>" +
      (t.desc ? '<p class="vt-tier-desc">' + esc(t.desc) + "</p>" : "") +
      (t.incluye.length ? '<ul class="vt-tier-inc">' + t.incluye.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul>" : "") +
      '<p class="vt-tier-pie">' + ENVIOS[t.envio] + (t.entrega ? " · Entrega estimada: " + esc(mesTxt(t.entrega)) : "") + "</p>" + boton + "</article>";
  }).join("");
  const metas = R.metas.length ? '<div class="vt-metas"><h3 class="vt-cb-t">Metas desbloqueables</h3>' + (proxima && R.recaudado ? '<p class="vt-guia">Próxima meta: faltan <b>' + pesos(proxima.monto - R.recaudado) + "</b> para «" + esc(proxima.titulo) + "».</p>" : "") +
    '<ol class="vt-metas-l">' + R.metas.map((m) => '<li class="' + (R.recaudado >= m.monto ? "ok" : m === proxima ? "prox" : "") + '"><span class="vt-meta-m">' + pesos(m.monto) + "</span><div><b>" + esc(m.titulo) + (R.recaudado >= m.monto ? ' <i class="vt-meta-ok">Desbloqueada</i>' : "") + "</b>" + (m.desc ? "<p>" + esc(m.desc) + "</p>" : "") + "</div>" + (m.imagen ? '<img src="' + esc(m.imagen) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : "") + "</li>").join("") + "</ol></div>" : "";
  const historia = R.bloques.length ? '<div class="vt-camp-historia">' + R.bloques.map((b) => bloqueHTML(b, previa)).join("") + "</div>" : "";
  return '<p class="vt-guia vt-camp-cab">' + cab + "</p>" + avance +
    (abierta ? '<p><a class="vt-camp-ir" href="' + esc(R.enlace) + '" target="_blank" rel="noopener noreferrer"' + (previa ? ' tabindex="-1"' : "") + ">Ir a la campaña en " + esc(plat) + " ↗</a></p>" : "") +
    '<div class="vt-camp' + (historia || metas ? " con-historia" : "") + '"><div class="vt-camp-izq">' + historia + metas + '</div><aside class="vt-camp-der" aria-label="Recompensas"><div class="vt-tiers">' + tiers + "</div></aside></div>" +
    '<p class="vt-camp-nota">' + (R.tiers.some((t) => t.pago) || abierta ? "El apoyo y el pago se hacen fuera de Forja, en " + (abierta ? esc(plat) : "el medio de pago de cada recompensa") + "." : "Anotarte no es un pago ni un compromiso: sirve para que el proyecto sepa qué quiere la gente y te avise cuando abra.") + "</p>";
}

/* ---------- datos ---------- */
export function nuevaVitrina(P) {
  return { v: 1, titulo: P.nombre || "", lema: corta(P.resumen || "", 180), firma: "", tipo: P.tipo, formato: P.formato || null,
    portada: null, tono: "claro", acento: ACENTO_TIPO[P.tipo] || ACENTO_TIPO.otro, historia: [], galeria: [], pizarras: [], novedades: [], enlaces: [] };
}
export const ACENTO_TIPO = { historia: "#7a3fc4", comic: "#0e6c82", videojuego: "#2a3fd1", juegomesa: "#0f7a4f", contenido: "#c2366b", producto: "#a86200", otro: "#5b6275" };
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
    enlaces: arr(d.enlaces).filter((e) => e && e.id).slice(0, LIM.enlaces).map((e) => ({ id: e.id, nombre: corta(e.nombre, 60), url: String(e.url || "").trim() })),
    recompensas: normalRecompensas(d.recompensas),
    diseno: normalDiseno(d.diseno),
    seguir: { activo: !!(d.seguir && d.seguir.activo), texto: d.seguir && SEGUIR_TEXTOS[d.seguir.texto] ? d.seguir.texto : "seguir", contador: !!(d.seguir && d.seguir.contador) },
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
  d.recompensas.tiers = d.recompensas.tiers.filter((t) => t.nombre.trim());
  d.recompensas.bloques = d.recompensas.bloques.filter((b) => (b.tipo === "imagen" || b.tipo === "video" ? b.url : b.texto.trim()));
  d.recompensas.metas = d.recompensas.metas.filter((m) => m.titulo.trim() && m.monto > 0);
  if (!d.recompensas.activo || !d.recompensas.tiers.length) delete d.recompensas;
  else delete d.recompensas.tomada;
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
  // Cada sección se arma aparte; el diseño decide el orden y, en "paneles", el tamaño de cada una.
  const R = d.recompensas, hayCamp = R && R.activo && R.tiers.length;
  const SEC = {
    recompensas: hayCamp && ["Recompensas", recompensasHTML(R, previa)],
    historia: d.historia.length && ["La historia", d.historia.map((h, i) =>
      '<article class="vt-cap"><span class="vt-num" aria-hidden="true">' + String(i + 1).padStart(2, "0") + "</span><div>" + (h.titulo ? "<h3>" + esc(h.titulo) + "</h3>" : "") + parrafos(h.texto) + "</div></article>").join("")],
    galeria: (piezas.length || colores.length) && ["Galería",
      (colores.length ? '<div class="vt-paleta" role="img" aria-label="Paleta de colores: ' + colores.join(", ") + '">' + colores.map((c) => '<span style="background:' + c + '"><i>' + c.toUpperCase() + "</i></span>").join("") + "</div>" : "") +
      (piezas.length ? '<div class="vt-galeria">' + piezas.map(pieza).join("") + "</div>" : "")],
    mundo: d.pizarras.length && ["El mundo", '<p class="vt-guia">Explóralo: arrastra para moverte, acerca con la rueda o pellizcando, y toca una tarjeta para leerla.</p>' +
      (d.pizarras.length > 1 ? '<div class="vt-tabs" role="tablist">' + d.pizarras.map((z, i) => '<button type="button" role="tab" aria-selected="' + !i + '" data-pz="' + i + '">' + esc(z.nombre) + "<small>" + MODOS[z.modo].corto + "</small></button>").join("") + "</div>" : "") +
      '<div class="vt-pizarra"></div>'],
    novedades: d.novedades.length && ["Novedades", '<div class="vt-linea">' + d.novedades.map((n) =>
      '<article class="vt-nov"><time datetime="' + esc(n.fecha) + '">' + esc(fechaTxt(n.fecha)) + "</time><div>" + (n.titulo ? "<h3>" + esc(n.titulo) + "</h3>" : "") + parrafos(n.texto, 600) + "</div></article>").join("") + "</div>"],
    enlaces: d.enlaces.length && ["Dónde seguirlo", '<div class="vt-enlaces">' + d.enlaces.map((e) =>
      '<a href="' + esc(e.url) + '" target="_blank" rel="noopener noreferrer"' + (previa ? ' tabindex="-1"' : "") + "><b>" + esc(e.nombre || dominio(e.url)) + "</b><small>" + esc(dominio(e.url)) + "</small></a>").join("") + "</div>"],
  };
  const partes = d.diseno.orden.filter((k) => SEC[k]).map((k) => [k, SEC[k][0]]);
  const paneles = d.diseno.estilo === "paneles";
  const fondoHero = d.portada
    ? '<img class="vt-portada" src="' + esc(d.portada.url) + '" alt="" referrerpolicy="no-referrer" style="object-position:50% ' + d.portada.foco + '%">'
    : '<div class="vt-generativa" aria-hidden="true" style="--c2:' + (colores[0] || "var(--vt-acento)") + ";--c3:" + (colores[1] || colores[0] || "var(--vt-acento)") + '"><span>' + esc((d.titulo || "?").trim()[0] || "?") + "</span></div>";

  raiz.innerHTML = '<div class="vt' + (d.portada ? "" : " sin-portada") + '" data-tono="' + d.tono + '" style="--vt-acento:' + d.acento + '">' +
    (previa ? "" : '<div class="vt-barra"><a href="' + RAIZ + '" class="vt-marca" aria-label="forja">' + marca(26) + "<span>forja</span></a>" + '<a href="' + RAIZ + 'entrar/" class="vt-crea">Crea la vitrina de tu proyecto</a></div>') +
    '<header class="vt-hero' + (d.portada ? " con-imagen" : "") + '">' + fondoHero +
      '<div class="vt-hero-txt">' + (etiqueta ? '<span class="vt-etq">' + esc(etiqueta) + "</span>" : "") +
      "<h1>" + (d.titulo ? esc(d.titulo) : "<i>Sin título</i>") + "</h1>" + (d.lema ? '<p class="vt-lema">' + esc(d.lema) + "</p>" : "") +
      (d.firma ? '<p class="vt-firma">por ' + esc(d.firma) + "</p>" : "") +
      (d.seguir.activo ? '<div class="vt-seguir-caja"><button type="button" class="vt-seguir" data-seguir aria-pressed="false"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 14.2 6.9 13.2C3 9.7.5 7.4.5 4.6.5 2.4 2.2.7 4.4.7c1.2 0 2.4.6 3.1 1.5h1C9.2 1.3 10.4.7 11.6.7c2.2 0 3.9 1.7 3.9 3.9 0 2.8-2.5 5.1-6.4 8.6L8 14.2Z"/></svg><span>' + esc(SEGUIR_TEXTOS[d.seguir.texto]) + '</span></button><span class="vt-seguir-n" hidden></span></div>' : "") +
      "</div></header>" +
    (partes.length > 1 ? '<nav class="vt-indice" aria-label="Secciones">' + partes.map(([k, n]) => '<a href="#vt-' + k + '" data-ir="' + k + '">' + n + "</a>").join("") + "</nav>" : "") +
    '<main class="vt-cuerpo' + (paneles ? " vt-paneles" : "") + '">' +
    partes.map(([k]) => '<section class="vt-sec vt-s-' + k + (k === "historia" ? " vt-historia" : "") + (paneles ? " vt-t-" + d.diseno.tam[k] : "") + '" id="vt-' + k + '"><h2 class="vt-h2">' + SEC[k][0] + "</h2>" + SEC[k][1] + "</section>").join("") +
    (!partes.length ? '<p class="vt-vacia">' + (previa ? "Agrega la historia, imágenes o novedades desde el panel y aparecerán aquí." : "Esta vitrina se está preparando.") + "</p>" : "") +
    "</main>" +
    '<footer class="vt-pie"><span>' + (opts.fecha ? "Actualizada el " + esc(fechaTxt(opts.fecha)) + " · " : "") + 'Vitrina hecha con <a href="' + RAIZ + '"' + (previa ? ' tabindex="-1"' : "") + ">Forja</a>" + (previa ? "" : ' · <a href="' + RAIZ + 'normas/">Normas</a> · <button type="button" class="vt-reportar" id="reportar">Reportar esta vitrina</button>') + "</span></footer>" +
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
export const CSS_VITRINA = CSS_PIZARRA + `
.vt{--f-display:"Familjen Grotesk",system-ui,sans-serif;--f-num:"JetBrains Mono",ui-monospace,monospace;--btn:var(--vt-acento);--btn-tx:#fff;--suave:var(--vt-field);--mesa:var(--vt-field);--vt-bg:#f5f4ef;--vt-fg:#16171c;--vt-muted:#5e6271;--vt-card:#fff;--vt-line:#e3e1d9;--vt-field:#eeece5;--vt-titulo:"Familjen Grotesk",system-ui,sans-serif;--vt-texto:var(--f-body,"Atkinson Hyperlegible",system-ui,sans-serif);
  --bg:var(--vt-bg);--fg:var(--vt-fg);--muted:var(--vt-muted);--card:var(--vt-card);--line:var(--vt-line);--field:var(--vt-field);--accent:var(--vt-acento);--accent-soft:color-mix(in srgb,var(--vt-acento) 12%,var(--vt-card));
  --vt-ac:var(--vt-acento);background:var(--vt-bg);color:var(--vt-fg);font-family:var(--vt-texto);font-size:17px;line-height:1.6;min-height:100%;position:relative;overflow-x:clip}
.vt[data-tono=noche]{--vt-bg:#111218;--vt-fg:#ecebe6;--vt-muted:#a0a2b0;--vt-card:#1a1c24;--vt-line:#2b2e39;--vt-field:#16181f;--vt-ac:color-mix(in srgb,var(--vt-acento) 55%,#fff)}
.vt[data-tono=papel]{--vt-ac:color-mix(in srgb,var(--vt-acento) 80%,#000)}
.vt[data-tono=papel]{--vt-bg:#efe7d8;--vt-fg:#2a2219;--vt-muted:#6e604e;--vt-card:#f8f2e6;--vt-line:#dccfb8;--vt-field:#e8dfcd;--vt-titulo:"Fraunces",Georgia,serif;--vt-texto:"Fraunces",Georgia,serif}
.vt *{box-sizing:border-box}
.vt a{color:var(--vt-ac)}
.vt :where(button,a):focus-visible{outline:2px solid var(--vt-acento);outline-offset:3px}
.vt-barra{position:absolute;top:0;left:0;right:0;z-index:5;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px max(18px,env(safe-area-inset-left));font-size:14px}
.vt-marca{display:inline-flex;align-items:center;gap:7px;font-family:"Mona Sans",system-ui,sans-serif;font-weight:800;font-stretch:115%;letter-spacing:-.02em;font-size:20px;line-height:1;text-decoration:none;color:#fff!important;text-shadow:0 1px 8px rgba(0,0,0,.35);--tc:var(--vt-acento);--f-hueco:rgba(0,0,0,.6)}
.vt-marca .fx-f{filter:drop-shadow(0 1px 6px rgba(0,0,0,.3))}
.vt-marca .fx-f .p{fill:currentColor}
.vt.sin-portada .vt-marca{--f-hueco:var(--vt-bg)}
.vt.sin-portada .vt-marca .fx-f{filter:none}
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
.vt-seguir-caja{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:18px}
.vt-seguir{font:inherit;font-size:15px;font-weight:700;display:inline-flex;align-items:center;gap:8px;border:2px solid var(--vt-acento);background:var(--vt-acento);color:#fff;border-radius:999px;padding:10px 20px;cursor:pointer;transition:transform .15s,background .15s}
.vt-seguir:hover{transform:translateY(-1px)}
.vt-seguir[aria-pressed=true]{background:transparent;color:inherit}
.vt-seguir[aria-pressed=true] svg{color:var(--vt-acento)}
.vt-seguir:disabled{opacity:.6;cursor:default;transform:none}
.vt-seguir-n{font-size:14px;opacity:.85}
/* paneles: secciones en una grilla de 12 columnas, cada una con su tamaño; en el teléfono, una debajo de otra */
.vt-paneles{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:clamp(14px,2vw,22px);padding-top:clamp(28px,5vw,56px)}
.vt-paneles > .vt-sec{grid-column:span 12;padding:clamp(20px,3vw,32px);background:var(--vt-card);border:1px solid var(--vt-line);border-radius:22px;min-width:0;container-type:inline-size}
.vt-paneles > .vt-t-dos{grid-column:span 8}.vt-paneles > .vt-t-medio{grid-column:span 6}.vt-paneles > .vt-t-tercio{grid-column:span 4}
.vt-paneles .vt-h2{margin-bottom:18px}
@media (max-width:820px){.vt-paneles > .vt-sec{grid-column:span 12 !important}}
.vt-sec{container-type:inline-size;min-width:0}
.vt-pizarra{max-width:100%}
/* campaña */
.vt-camp-av{margin:0 0 20px;display:flex;flex-direction:column;gap:10px}
.vt-camp-barra{position:relative;height:14px;border-radius:999px;background:color-mix(in srgb,var(--vt-acento) 14%,transparent)}
.vt-camp-barra i{position:absolute;inset:0 auto 0 0;border-radius:999px;background:var(--vt-acento)}
.vt-camp-mk{position:absolute;top:-4px;width:4px;height:22px;margin-left:-2px;border-radius:2px;background:var(--vt-muted);opacity:.7}
.vt-camp-mk.meta{background:var(--vt-fg,#111);opacity:1;width:3px}
.vt-camp-mk.ok{background:var(--vt-acento);opacity:1}
.vt-camp-nums{display:flex;flex-wrap:wrap;gap:8px 28px}
.vt-camp-nums span{display:flex;flex-direction:column;font-size:13px;color:var(--vt-muted)}
.vt-camp-nums b{font-family:"JetBrains Mono",monospace;font-size:clamp(20px,3vw,28px);color:var(--vt-acento)}
.vt-camp{display:block}
@container (min-width:760px){.vt-camp.con-historia{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(260px,1fr);gap:clamp(20px,3vw,40px);align-items:start}.vt-camp.con-historia .vt-camp-der{position:sticky;top:64px}.vt-camp.con-historia .vt-tiers{grid-template-columns:1fr}}
.vt-camp.con-historia .vt-camp-der{margin-top:18px}
@container (min-width:760px){.vt-camp.con-historia .vt-camp-der{margin-top:0}}
.vt-camp-historia{display:flex;flex-direction:column;gap:18px}
.vt-cb-t{font-family:var(--vt-titulo);font-size:clamp(22px,3vw,30px);line-height:1.15;margin:12px 0 0}
.vt-cb-x p{margin:0 0 1em;max-width:66ch;text-wrap:pretty}
.vt-cb-q{margin:0;font-family:var(--vt-titulo);font-size:clamp(20px,2.6vw,26px);line-height:1.35;border-left:4px solid var(--vt-acento);padding:4px 0 4px 18px}
.vt-cb-i{margin:0}.vt-cb-i img{display:block;width:100%;height:auto;border-radius:14px}
.vt-cb-i figcaption,.vt-cb-pie{font-size:13px;color:var(--vt-muted);margin-top:6px}
.vt-play{width:100%;aspect-ratio:16/9;border:0;border-radius:14px;background:color-mix(in srgb,var(--vt-acento) 18%,#000);color:#fff;font:inherit;font-weight:700;cursor:pointer}
.vt-metas{margin-top:26px}
.vt-metas .vt-guia{margin:8px 0 14px}
.vt-metas-l{list-style:none;margin:12px 0 0;padding:0 0 0 18px;border-left:2px dashed var(--vt-line);display:flex;flex-direction:column;gap:14px}
.vt-metas-l li{position:relative;display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:start}
.vt-metas-l li::before{content:"";position:absolute;left:-26px;top:6px;width:12px;height:12px;border-radius:50%;background:var(--vt-card);border:2px solid var(--vt-line)}
.vt-metas-l li.ok::before{background:var(--vt-acento);border-color:var(--vt-acento)}
.vt-metas-l li.prox::before{border-color:var(--vt-acento)}
.vt-meta-m{font-family:"JetBrains Mono",monospace;font-weight:700;color:var(--vt-acento);white-space:nowrap}
.vt-metas-l p{margin:2px 0 0;color:var(--vt-muted);font-size:14px}
.vt-metas-l img{width:72px;height:72px;object-fit:cover;border-radius:10px}
.vt-meta-ok{font-style:normal;font-size:11px;font-weight:700;color:var(--vt-acento);border:1px solid var(--vt-acento);border-radius:999px;padding:0 7px;margin-left:6px;vertical-align:2px}
@media (max-width:520px){.vt-metas-l li{grid-template-columns:1fr}.vt-metas-l img{width:100%;height:auto;max-height:160px}}
.vt-tier-b.pagar{background:var(--vt-acento);color:#fff}
.vt-camp-cab{margin-top:-6px}
.vt-camp-ir{display:inline-block;background:var(--vt-acento);color:#fff;text-decoration:none;font-weight:700;border-radius:999px;padding:10px 20px}
.vt-tiers{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;margin-top:8px}
.vt-tier{position:relative;display:flex;flex-direction:column;gap:8px;background:var(--vt-card);border:1px solid var(--vt-line);border-radius:18px;padding:18px 18px 16px;overflow:hidden}
.vt-tier::before{content:"";position:absolute;inset:0 0 auto;height:4px;background:var(--vt-acento);opacity:.85}
.vt-tier-top{display:flex;justify-content:space-between;align-items:center}
.vt-tier-n{font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--vt-muted)}
.vt-tier-cupo{font-size:12px;font-weight:700;color:var(--vt-acento);border:1px solid var(--vt-acento);border-radius:999px;padding:1px 9px}
.vt-tier h3{margin:0;font-family:var(--vt-titulo);font-size:21px;line-height:1.15}
.vt-tier-precio{margin:0;font-family:"JetBrains Mono",monospace;font-size:24px;font-weight:700;color:var(--vt-acento)}
.vt-tier-desc{margin:0;color:var(--vt-muted)}
.vt-tier-inc{margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:6px}
.vt-tier-inc li{font-size:13px;border:1px solid var(--vt-line);border-radius:999px;padding:2px 10px}
.vt-tier-pie{margin:auto 0 0;font-size:12.5px;color:var(--vt-muted);padding-top:4px}
.vt-tier-b{display:inline-flex;justify-content:center;font:inherit;font-weight:700;cursor:pointer;text-decoration:none;border-radius:12px;padding:10px 14px;border:1.5px solid var(--vt-acento);background:transparent;color:var(--vt-acento)}
.vt-tier-b[aria-pressed="true"],a.vt-tier-b{background:var(--vt-acento);color:#fff}
.vt-tier-b:disabled{opacity:.6;cursor:default}
.vt-tier-cuenta{font-size:12.5px;color:var(--vt-muted);text-align:center}
.vt-tier-cuenta[hidden]{display:none}
.vt-camp-nota{font-size:13px;color:var(--vt-muted);margin:14px 0 0}
.vt-enlaces{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.vt-enlaces a{display:flex;flex-direction:column;gap:2px;text-decoration:none;color:var(--vt-fg);background:var(--vt-card);border:1px solid var(--vt-line);border-radius:14px;padding:16px 18px;transition:border-color .15s,transform .15s}
.vt-enlaces a:hover{border-color:var(--vt-acento);transform:translateY(-2px)}
.vt-enlaces b{font-family:var(--vt-titulo);font-size:18px}
.vt-enlaces small{font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--vt-muted)}
.vt-vacia{padding:64px 0;text-align:center;color:var(--vt-muted)}
.vt-pie{max-width:1100px;margin:0 auto;padding:72px max(20px,env(safe-area-inset-left)) 40px;font-size:13px;color:var(--vt-muted);display:flex;justify-content:center}
.vt-pie a{color:inherit;font-weight:700}
.vt-reportar{font:inherit;font-size:13px;border:0;background:none;color:inherit;padding:0;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.vt-caja{border:0;padding:0;background:transparent;max-width:min(1100px,94vw);max-height:92vh}
.vt-caja::backdrop{background:rgba(8,9,12,.86)}
.vt-caja figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:10px}
.vt-caja img{max-width:100%;max-height:82vh;border-radius:8px;display:block}
.vt-caja figcaption{color:#eee;font-size:15px;text-align:center;display:flex;flex-direction:column}
.vt-caja figcaption span{opacity:.75}
.vt-cerrar{position:fixed;top:14px;right:18px;font-size:32px;line-height:1;border:0;background:none;color:#fff;cursor:pointer}
@media (prefers-reduced-motion:reduce){.vt-paleta span,.vt-enlaces a{transition:none}}
`;
