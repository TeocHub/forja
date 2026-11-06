// Forja · Pizarra. Un tablero dentro de cada proyecto, en cuatro modos:
//   libre      tarjetas, colores y flechas para ordenar ideas (plan gratis: una por proyecto, 20 tarjetas)
//   relaciones personajes o facciones unidos por lazos con nombre          (Forja Más)
//   mapa       lugares, regiones y rutas, sobre la imagen de un mapa         (Forja Más)
//   escaleta   escenas por actos que se reordenan arrastrando                (Forja Más)
// Todo es texto y enlaces: la imagen del mapa o de un referente es un enlace, nunca un archivo.
// Los datos de una pizarra viven en public.pizarras.datos:
//   { tarjetas:[{id,x,y,titulo,sub,texto,color,enlace:{t:"s"|"r",id},acto,min}], flechas:[{id,de,a,texto,lazo,dir}],
//     regiones:[{id,x,y,w,h,nombre,color}], actos:[{id,n}], fondo:{url,w} }

export const MODOS = {
  libre: { n: "Pizarra libre", corto: "Libre", d: "Tarjetas, colores y flechas para ordenar ideas, con tus secciones y referentes a mano.", mas: false },
  relaciones: { n: "Mapa de relaciones", corto: "Relaciones", d: "Personajes o facciones unidos por lazos con nombre: familia, amor, rivalidad…", mas: true },
  escaleta: { n: "Escaleta", corto: "Escaleta", d: "Escenas en tarjetas, por actos, que se reordenan arrastrando. El orden puede volver al Taller.", mas: true },
  mapa: { n: "Mapa del mundo", corto: "Mapa", d: "Lugares, regiones y rutas, sobre la imagen de tu mapa si tienes una.", mas: true },
};
export const COLORES = [["", "Sin color"], ["#2a3fd1", "Azul"], ["#e0602f", "Brasa"], ["#0f7a4f", "Verde"], ["#c48a00", "Ámbar"], ["#7a3fc4", "Violeta"], ["#c2366b", "Rosa"], ["#5b6275", "Grafito"]];
export const LAZOS = {
  familia: { n: "Familia", c: "#0f7a4f" }, amor: { n: "Amor", c: "#c2366b" }, amistad: { n: "Amistad", c: "#2a3fd1" },
  alianza: { n: "Alianza", c: "#c48a00" }, mentor: { n: "Mentor", c: "#7a3fc4" }, rivalidad: { n: "Rivalidad", c: "#e0602f", dash: "7 5" },
  secreto: { n: "Secreto", c: "#5b6275", dash: "2 5" }, otro: { n: "Otro", c: "#5b6275" },
};
const ANCHO = { libre: 200, relaciones: 168, mapa: 150 };
const NOMBRE_T = { libre: "Tarjeta", relaciones: "Personaje", mapa: "Lugar", escaleta: "Escena" };
const PLURAL = { libre: "tarjetas", relaciones: "personajes", mapa: "lugares", escaleta: "escenas" };
const SUB = { libre: "Detalle corto", relaciones: "Rol o facción", mapa: "Qué es (ciudad, bosque, ruinas…)", escaleta: "Dónde y cuándo" };

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const uid = () => Math.random().toString(36).slice(2, 10);
const arr = (x) => (Array.isArray(x) ? x : []);
const num = (v, d) => (v !== "" && v != null && Number.isFinite(+v) ? +v : d);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const iniciales = (t) => (String(t || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("") || "?").toUpperCase();
const minTxt = (m) => (m >= 60 ? Math.floor(m / 60) + " h " + (Math.round(m % 60) ? Math.round(m % 60) + " min" : "") : (Math.round(m * 10) / 10).toString().replace(".", ",") + " min").trim();
const okColor = (c) => (/^#[0-9a-f]{6}$/i.test(c || "") ? c : "");
const okUrl = (u) => (/^https:\/\/[^\s"'<>]+$/i.test(u || "") ? u : "");

// Deja los datos con forma conocida (sirve también para datos viejos o vacíos).
export function normal(d, modo) {
  d = d && typeof d === "object" ? d : {};
  const out = {
    tarjetas: arr(d.tarjetas).filter((t) => t && t.id).map((t) => ({ ...t, x: num(t.x, 0), y: num(t.y, 0) })),
    flechas: arr(d.flechas).filter((f) => f && f.id && f.de && f.a),
    regiones: arr(d.regiones).filter((r) => r && r.id).map((r) => ({ ...r, x: num(r.x, 0), y: num(r.y, 0), w: num(r.w, 320), h: num(r.h, 220) })),
    actos: arr(d.actos).filter((a) => a && a.id),
    fondo: d.fondo && okUrl(d.fondo.url) ? { url: d.fondo.url, w: num(d.fondo.w, 1600), ...(num(d.fondo.r, 0) > 0 ? { r: +d.fondo.r } : {}) } : null,
  };
  const ids = new Set(out.tarjetas.map((t) => t.id));
  out.flechas = out.flechas.filter((f) => ids.has(f.de) && ids.has(f.a));
  if (modo === "escaleta") {
    if (!out.actos.length) out.actos = [{ id: uid(), n: "Inicio" }, { id: uid(), n: "Desarrollo" }, { id: uid(), n: "Final" }];
    const actos = new Set(out.actos.map((a) => a.id));
    out.tarjetas.forEach((t) => { if (!actos.has(t.acto)) t.acto = out.actos[0].id; });
    const pos = new Map(out.actos.map((a, i) => [a.id, i]));
    out.tarjetas = out.tarjetas.map((t, i) => [t, i]).sort((a, b) => pos.get(a[0].acto) - pos.get(b[0].acto) || a[1] - b[1]).map((x) => x[0]);
  }
  return out;
}
export const cuentaTarjetas = (d) => arr(d && d.tarjetas).length;

/* ---------- geometría compartida (editor y biblia) ---------- */
function borde(r, px, py) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, dx = px - cx, dy = py - cy;
  if (!dx && !dy) return [cx, cy];
  const s = Math.min(dx ? (r.w / 2 + 5) / Math.abs(dx) : Infinity, dy ? (r.h / 2 + 5) / Math.abs(dy) : Infinity);
  return [cx + dx * s, cy + dy * s];
}
function trazo(ra, rb, curva) {
  const ca = [ra.x + ra.w / 2, ra.y + ra.h / 2], cb = [rb.x + rb.w / 2, rb.y + rb.h / 2];
  const dx = cb[0] - ca[0], dy = cb[1] - ca[1], L = Math.hypot(dx, dy) || 1;
  const k = [(ca[0] + cb[0]) / 2 - (dy / L) * curva, (ca[1] + cb[1]) / 2 + (dx / L) * curva];
  const p0 = borde(ra, k[0], k[1]), p2 = borde(rb, k[0], k[1]);
  const c = [2 * k[0] - (p0[0] + p2[0]) / 2, 2 * k[1] - (p0[1] + p2[1]) / 2];
  const r1 = (n) => Math.round(n * 10) / 10;
  return { d: "M" + p0.map(r1) + " Q" + c.map(r1) + " " + p2.map(r1), p0, c, p2, k };
}
function punta(desde, hasta, t = 11) {
  const a = Math.atan2(hasta[1] - desde[1], hasta[0] - desde[0]);
  const p = (g) => [hasta[0] - t * Math.cos(a + g), hasta[1] - t * Math.sin(a + g)].map((n) => Math.round(n * 10) / 10);
  return "M" + hasta.map((n) => Math.round(n * 10) / 10) + "L" + p(0.42) + "L" + p(-0.42) + "Z";
}
// Varias flechas entre las mismas dos tarjetas se abren en abanico para que no se tapen.
function curvas(flechas) {
  const g = {}, out = {};
  flechas.forEach((f) => { const k = [f.de, f.a].sort().join("|"); (g[k] = g[k] || []).push(f); });
  Object.values(g).forEach((l) => l.forEach((f, i) => { const s = (i - (l.length - 1) / 2) * 38; out[f.id] = f.de < f.a ? s : -s; }));
  return out;
}
const estiloFlecha = (f, modo) => {
  const l = modo === "relaciones" ? LAZOS[f.lazo] || LAZOS.otro : null;
  return { color: l ? l.c : "", dash: l && l.dash ? l.dash : modo === "mapa" ? "8 6" : "", texto: f.texto || (l && f.lazo && f.lazo !== "otro" ? l.n : "") };
};
const dirDef = (modo) => (modo === "libre" ? "a" : "nada");

/* ---------- editor ---------- */
// o: { piz:{id,nombre,modo,datos}, editable, max, secciones:[{id,titulo}], referentes:[{id,tipo,valor,titulo}],
//      guardar(datos)→Promise<string|null>, irSeccion(id), irReferente(id), ordenarTaller(ids)?, aviso(msg), alLimite() }
export function montar(raiz, o) {
  const modo = MODOS[o.piz.modo] ? o.piz.modo : "libre", ed = !!o.editable, max = o.max ?? Infinity;
  const D = normal(o.piz.datos, modo);
  const ES = modo === "escaleta";
  let sel = null, V = { x: 40, y: 40, z: 1 }, hist = [], rehacer = [], pendiente = false, tGuardar = null, vivo = true, fondoMal = false;
  const tam = new Map();
  const claveVista = "forja-pz-vista-" + o.piz.id;
  const T = (id) => D.tarjetas.find((t) => t.id === id);
  const SEC = (id) => (o.secciones || []).find((s) => s.id === id);
  const REF = (id) => (o.referentes || []).find((r) => r.id === id);

  raiz.innerHTML = '<div class="pz" data-modo="' + modo + '"' + (ed ? "" : ' data-ro="1"') + ">" +
    '<div class="pz-barra" role="toolbar" aria-label="Herramientas de la pizarra"></div>' +
    '<div class="pz-cuerpo">' +
    (ES ? '<div class="pz-esc" tabindex="0" aria-label="Escaleta"></div>'
      : '<div class="pz-lienzo" tabindex="0" aria-label="Pizarra: arrastra el fondo para moverte, doble toque para crear">' +
        '<div class="pz-mundo"><img class="pz-fondo" alt="" referrerpolicy="no-referrer" hidden><div class="pz-regiones"></div>' +
        '<svg class="pz-lineas" width="1" height="1" aria-hidden="true"><g class="pz-ls"></g><path class="pz-temp" d=""/></svg>' +
        '<div class="pz-etiquetas"></div><div class="pz-tarjetas"></div></div>' +
        '<div class="pz-zoom pz-libre"><button type="button" data-z="-" aria-label="Alejar">−</button><button type="button" data-z="0" class="pz-zpct" title="Ver todo">100%</button><button type="button" data-z="+" aria-label="Acercar">+</button></div>' +
        '<div class="pz-leyenda" aria-label="Lazos"></div>' +
        '<p class="pz-vacio" hidden></p></div>') +
    '<aside class="pz-insp" aria-label="Detalle de lo seleccionado"></aside></div></div>';
  const root = raiz.querySelector(".pz"), barra = root.querySelector(".pz-barra"), aside = root.querySelector(".pz-insp");
  const lienzo = root.querySelector(".pz-lienzo"), mundo = root.querySelector(".pz-mundo"), escW = root.querySelector(".pz-esc");

  /* ----- historia y guardado ----- */
  const foto = () => JSON.stringify(D);
  function antes() { hist.push(foto()); if (hist.length > 80) hist.shift(); rehacer = []; pintarBarra(); }
  function volver(de, a) { if (!de.length) return; a.push(foto()); Object.assign(D, JSON.parse(de.pop())); if (sel && !existe(sel)) sel = null; todo(); cambio(); }
  const existe = (s) => (s.k === "t" ? T(s.id) : s.k === "f" ? D.flechas.some((f) => f.id === s.id) : s.k === "r" ? D.regiones.some((r) => r.id === s.id) : s.k === "a" ? D.actos.some((a) => a.id === s.id) : false);
  function cambio() { if (!ed) return; pendiente = true; estado("Guardando…"); clearTimeout(tGuardar); tGuardar = setTimeout(guardarYa, 700); pintarBarra(); }
  async function guardarYa() {
    clearTimeout(tGuardar); if (!pendiente) return; pendiente = false;
    const datos = JSON.parse(foto()), err = await o.guardar(datos);
    if (!vivo) return;
    estado(err ? "Sin guardar" : "Guardado", !!err); if (err) o.aviso && o.aviso(err);
  }
  function estado(t, mal) { const e = barra.querySelector(".pz-estado"); if (e) { e.textContent = t; e.classList.toggle("mal", !!mal); } }
  const puedeCrear = () => { if (D.tarjetas.length < max) return true; o.alLimite && o.alLimite(); return false; };

  /* ----- barra ----- */
  function pintarBarra() {
    const n = D.tarjetas.length, lim = Number.isFinite(max) && ed;
    const conteo = '<span class="pz-cuenta' + (lim && n >= max - 2 ? " cerca" : "") + '">' + n + (lim ? " de " + max : "") + " " + (n === 1 ? NOMBRE_T[modo].toLowerCase() : PLURAL[modo]) + (ES ? minTotal() : "") + "</span>";
    const b = (id, txt, extra = "") => '<button type="button" class="pz-b" data-b="' + id + '"' + extra + ">" + txt + "</button>";
    barra.innerHTML = (ed
      ? b("nueva", "+ " + NOMBRE_T[modo], ' title="O doble toque en el fondo"') + (modo === "mapa" ? b("region", "+ Región") : "") + (ES ? b("acto", "+ Acto") : "") +
        '<span class="pz-traer-w">' + b("traer", "Traer del proyecto", ' aria-expanded="false"') + "</span>" +
        '<span class="pz-sep"></span>' + b("deshacer", '<span aria-hidden="true">↶</span>', ' aria-label="Deshacer" title="Deshacer (Ctrl+Z)"' + (hist.length ? "" : " disabled")) + b("rehacer", '<span aria-hidden="true">↷</span>', ' aria-label="Rehacer" title="Rehacer"' + (rehacer.length ? "" : " disabled")) +
        (ES && o.ordenarTaller && D.tarjetas.some((t) => t.enlace && t.enlace.t === "s") ? b("taller", "Ordenar el Taller así", ' title="Las secciones enlazadas quedan en el orden de la escaleta"') : "")
      : '<span class="pz-ro">Solo lectura</span>') +
      '<span class="pz-der">' + conteo + (ed ? '<span class="pz-estado" aria-live="polite">' + (pendiente ? "Guardando…" : "Guardado") + "</span>" : "") +
      '<button type="button" class="pz-b pz-libre" data-b="full" aria-pressed="' + root.classList.contains("pz-full") + '">' + (root.classList.contains("pz-full") ? "Salir" : "Pantalla completa") + "</button></span>";
    barra.querySelectorAll("[data-b]").forEach((x) => x.onclick = () => accion(x.dataset.b, x));
  }
  function minTotal() { const m = D.tarjetas.reduce((s, t) => s + num(t.min, 0), 0); return m ? " · " + minTxt(m) : ""; }
  function accion(k, btn) {
    if (k === "nueva") { if (ES) nuevaEscena(sel && sel.k === "t" && T(sel.id) ? T(sel.id).acto : sel && sel.k === "a" ? sel.id : D.actos[D.actos.length - 1].id); else { const c = centro(); crearTarjeta(c[0] - ANCHO[modo] / 2, c[1] - 30); } }
    else if (k === "region") { const c = centro(); antes(); const r = { id: uid(), x: Math.round(c[0] - 180), y: Math.round(c[1] - 120), w: 360, h: 240, nombre: "Región", color: COLORES[1 + D.regiones.length % 7][0] }; D.regiones.push(r); sel = { k: "r", id: r.id }; todo(); cambio(); enfocar(); }
    else if (k === "acto") { antes(); const a = { id: uid(), n: "Acto " + (D.actos.length + 1) }; D.actos.push(a); sel = { k: "a", id: a.id }; todo(); cambio(); enfocar(); }
    else if (k === "traer") menuTraer(btn);
    else if (k === "deshacer") volver(hist, rehacer);
    else if (k === "rehacer") volver(rehacer, hist);
    else if (k === "taller") ordenarTaller();
    else if (k === "full") { root.classList.toggle("pz-full"); document.documentElement.classList.toggle("pz-sin-scroll", root.classList.contains("pz-full")); pintarBarra(); if (!ES) requestAnimationFrame(() => aplicarVista()); }
  }
  function menuTraer(btn) {
    const w = btn.parentElement, ya = w.querySelector(".pz-menu");
    if (ya) { ya.remove(); btn.setAttribute("aria-expanded", "false"); return; }
    const usada = (t, id) => D.tarjetas.some((x) => x.enlace && x.enlace.t === t && x.enlace.id === id);
    const secs = o.secciones || [], refs = o.referentes || [];
    const op = (t, id, n, sub) => '<button type="button" data-tr="' + t + ":" + id + '"><span>' + esc(n) + "</span>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + (usada(t, id) ? '<i aria-label="ya está en la pizarra">✓</i>' : "") + "</button>";
    w.insertAdjacentHTML("beforeend", '<div class="pz-menu" role="menu">' +
      (secs.length ? "<b>Del Taller</b>" + secs.map((s) => op("s", s.id, s.titulo)).join("") : "") +
      (refs.length ? "<b>Referentes</b>" + refs.map((r) => op("r", r.id, nombreRef(r), r.tipo)).join("") : "") +
      (!secs.length && !refs.length ? '<p>Este proyecto aún no tiene secciones ni referentes.</p>' : "") + "</div>");
    btn.setAttribute("aria-expanded", "true");
    const cerrar = (e) => { if (!w.contains(e.target)) { const m = w.querySelector(".pz-menu"); if (m) m.remove(); btn.setAttribute("aria-expanded", "false"); document.removeEventListener("pointerdown", cerrar, true); } };
    document.addEventListener("pointerdown", cerrar, true);
    w.querySelectorAll("[data-tr]").forEach((x) => x.onclick = () => {
      const [t, id] = x.dataset.tr.split(":"); w.querySelector(".pz-menu").remove(); document.removeEventListener("pointerdown", cerrar, true);
      const extra = { enlace: { t, id } };
      if (t === "s") extra.titulo = (SEC(id) || {}).titulo || "";
      else { const r = REF(id) || {}; extra.titulo = r.titulo || (r.tipo === "cita" ? "Cita" : nombreRef(r)); if (r.tipo === "cita") extra.texto = r.valor; if (r.tipo === "color") extra.color = okColor(r.valor); }
      if (ES) nuevaEscena(D.actos[D.actos.length - 1].id, extra);
      else { const c = centro(); crearTarjeta(c[0] - ANCHO[modo] / 2, c[1] - 30, extra); }
    });
  }
  const nombreRef = (r) => r.titulo || (r.tipo === "color" ? r.valor : String(r.valor || "").replace(/^https?:\/\/(www\.)?/, "").slice(0, 48));

  /* ----- crear ----- */
  function crearTarjeta(x, y, extra = {}) {
    if (!ed || !puedeCrear()) return;
    for (let i = 0; i < 40 && D.tarjetas.some((t) => Math.abs(t.x - x) < 18 && Math.abs(t.y - y) < 18); i++) { x += 26; y += 26; } // no tapar otra tarjeta
    antes();
    const t = { id: uid(), x: Math.round(x), y: Math.round(y), titulo: extra.titulo ?? "", sub: "", texto: extra.texto || "", color: extra.color ?? (modo === "relaciones" ? COLORES[1 + D.tarjetas.length % 7][0] : ""), ...(extra.enlace ? { enlace: extra.enlace } : {}) };
    D.tarjetas.push(t); sel = { k: "t", id: t.id }; todo(); cambio(); enfocar(true);
  }
  function nuevaEscena(acto, extra = {}) {
    if (!ed || !puedeCrear()) return;
    antes();
    const t = { id: uid(), x: 0, y: 0, titulo: extra.titulo ?? "", sub: "", texto: extra.texto || "", color: extra.color || "", acto, ...(extra.enlace ? { enlace: extra.enlace } : {}) };
    D.tarjetas.splice(finDeActo(acto), 0, t); // la escena nueva va al final de su acto
    sel = { k: "t", id: t.id }; todo(); cambio(); enfocar(true);
  }
  function enfocar(nuevo) {
    requestAnimationFrame(() => {
      const i = aside.querySelector("[data-campo=titulo], [data-campo=nombre], [data-campo=n], [data-campo=texto]");
      if (!i) return;
      if (matchMedia("(max-width: 820px)").matches) aside.scrollIntoView({ block: "nearest", behavior: "smooth" });
      i.focus({ preventScroll: true }); if (nuevo && i.select) i.select();
    });
  }
  function borrarSel() {
    if (!ed || !sel) return;
    antes();
    if (sel.k === "t") { D.tarjetas = D.tarjetas.filter((t) => t.id !== sel.id); D.flechas = D.flechas.filter((f) => f.de !== sel.id && f.a !== sel.id); }
    else if (sel.k === "f") D.flechas = D.flechas.filter((f) => f.id !== sel.id);
    else if (sel.k === "r") D.regiones = D.regiones.filter((r) => r.id !== sel.id);
    else if (sel.k === "a") {
      if (D.actos.length < 2) { hist.pop(); o.aviso && o.aviso("La escaleta necesita al menos un acto."); return; }
      const i = D.actos.findIndex((a) => a.id === sel.id), dest = D.actos[i ? i - 1 : 1].id;
      D.tarjetas.forEach((t) => { if (t.acto === sel.id) t.acto = dest; });
      D.actos.splice(i, 1); ordenarPorActos();
    }
    sel = null; todo(); cambio(); (lienzo || escW).focus({ preventScroll: true });
  }
  // Índice donde termina un acto en la lista (las escenas están ordenadas por acto).
  function finDeActo(acto) {
    const pos = new Map(D.actos.map((a, q) => [a.id, q])), j = pos.get(acto);
    const k = D.tarjetas.findIndex((x) => pos.get(x.acto) > j);
    return k < 0 ? D.tarjetas.length : k;
  }
  function ordenarPorActos() { const pos = new Map(D.actos.map((a, i) => [a.id, i])); D.tarjetas = D.tarjetas.map((t, i) => [t, i]).sort((a, b) => pos.get(a[0].acto) - pos.get(b[0].acto) || a[1] - b[1]).map((x) => x[0]); }

  /* ----- pintar ----- */
  function todo() { if (ES) pintarEsc(); else pintarTablero(); pintarInsp(); pintarBarra(); }
  function marcar() { root.querySelectorAll(".pz-sel").forEach((x) => x.classList.remove("pz-sel")); if (!sel) return; const q = sel.k === "f" ? '[data-f="' + sel.id + '"]' : sel.k === "a" ? '[data-acto="' + sel.id + '"]' : '[data-id="' + sel.id + '"]'; root.querySelectorAll(q).forEach((x) => x.classList.add("pz-sel")); }
  function chip(t) {
    if (!t.enlace) return "";
    const s = t.enlace.t === "s" ? SEC(t.enlace.id) : REF(t.enlace.id);
    if (!s) return '<span class="pz-chip roto" title="Ya no existe en el proyecto">enlace perdido</span>';
    return '<button type="button" class="pz-chip" data-ir="' + t.enlace.t + ":" + t.enlace.id + '" tabindex="-1">' + (t.enlace.t === "s" ? "§ " + esc(s.titulo) : "✦ " + esc(nombreRef(s))) + "</button>";
  }
  function media(t) {
    const r = t.enlace && t.enlace.t === "r" ? REF(t.enlace.id) : null;
    if (!r) return "";
    if (r.tipo === "imagen" && okUrl(r.valor)) return '<img class="pz-img" src="' + esc(r.valor) + '" alt="" loading="lazy" referrerpolicy="no-referrer" draggable="false">';
    if (r.tipo === "color" && okColor(r.valor)) return '<span class="pz-muestra" style="background:' + r.valor + '"></span>';
    return "";
  }
  function htmlTarjeta(t) {
    const c = okColor(t.color), st = 'left:' + t.x + "px;top:" + t.y + "px;width:" + ANCHO[modo] + "px" + (c ? ";--c:" + c : "");
    const vacio = !t.titulo && !t.texto;
    let cuerpo;
    if (modo === "relaciones") cuerpo = '<span class="pz-avatar" aria-hidden="true">' + esc(iniciales(t.titulo)) + "</span><b>" + (t.titulo ? esc(t.titulo) : "<i>Sin nombre</i>") + "</b>" + (t.sub ? '<span class="pz-sub">' + esc(t.sub) + "</span>" : "");
    else if (modo === "mapa") cuerpo = '<svg class="pz-pin" viewBox="0 0 24 30" aria-hidden="true"><path d="M12 29C12 29 2 17.5 2 11a10 10 0 0 1 20 0c0 6.5-10 18-10 18Z"/><circle cx="12" cy="11" r="3.6"/></svg><span class="pz-et"><b>' + (t.titulo ? esc(t.titulo) : "<i>Lugar</i>") + "</b>" + (t.sub ? '<span class="pz-sub">' + esc(t.sub) + "</span>" : "") + "</span>";
    else cuerpo = media(t) + "<b>" + (t.titulo ? esc(t.titulo) : vacio ? "<i>Tarjeta vacía</i>" : "") + "</b>" + (t.sub ? '<span class="pz-sub">' + esc(t.sub) + "</span>" : "") + (t.texto ? "<p>" + esc(t.texto) + "</p>" : "");
    return '<div class="pz-t" data-id="' + t.id + '" style="' + st + '" tabindex="0" role="button" aria-label="' + esc(NOMBRE_T[modo] + ": " + (t.titulo || "sin título")) + '">' + cuerpo + chip(t) +
      (ed ? '<span class="pz-asa" title="Arrastra hasta otra ' + (modo === "relaciones" ? "persona" : "tarjeta") + ' para unirlas" aria-hidden="true"></span>' : "") + "</div>";
  }
  function pintarTablero() {
    const fondo = mundo.querySelector(".pz-fondo");
    if (D.fondo) {
      if (fondo.getAttribute("src") !== D.fondo.url) { fondoMal = false; fondo.src = D.fondo.url; }
      fondo.style.width = D.fondo.w + "px"; fondo.hidden = fondoMal;
      fondo.onerror = () => { fondo.hidden = true; fondoMal = true; if (!sel) pintarInsp(); };
      fondo.onload = () => { fondoMal = false; fondo.hidden = false; const r = Math.round(fondo.naturalHeight / fondo.naturalWidth * 1000) / 1000; if (D.fondo && r && D.fondo.r !== r && ed) { D.fondo.r = r; cambio(); } if (!sel) pintarInsp(); };
    }
    else { fondo.hidden = true; fondo.removeAttribute("src"); }
    mundo.querySelector(".pz-regiones").innerHTML = D.regiones.map((r) => { const c = okColor(r.color) || "#5b6275"; return '<div class="pz-reg" data-id="' + r.id + '" style="left:' + r.x + "px;top:" + r.y + "px;width:" + r.w + "px;height:" + r.h + "px;--c:" + c + '"><span>' + esc(r.nombre || "Región") + "</span>" + (ed ? '<i class="pz-reg-asa" aria-hidden="true"></i>' : "") + "</div>"; }).join("");
    mundo.querySelector(".pz-tarjetas").innerHTML = D.tarjetas.map(htmlTarjeta).join("");
    mundo.querySelectorAll(".pz-img").forEach((im) => im.onerror = () => { im.remove(); medir(); pintarLineas(); });
    medir(); pintarLineas(); marcar(); pintarLeyenda();
    const v = lienzo.querySelector(".pz-vacio");
    v.hidden = !!(D.tarjetas.length || D.regiones.length || D.fondo);
    v.innerHTML = ed ? (modo === "relaciones" ? "Toca dos veces el fondo para agregar un personaje.<br>Luego arrastra su punto <span class=\"pz-punto\"></span> hasta otro para crear el lazo."
      : modo === "mapa" ? "Toca dos veces para poner un lugar, o agrega una región.<br>Si tienes la imagen de tu mapa, pega su enlace a la derecha."
        : "Toca dos veces el fondo para crear una tarjeta, o trae secciones y referentes del proyecto.<br>Arrastra el punto <span class=\"pz-punto\"></span> de una tarjeta hasta otra para unirlas.") : "Esta pizarra está vacía.";
  }
  function medir() { mundo.querySelectorAll(".pz-t").forEach((el) => tam.set(el.dataset.id, { w: el.offsetWidth, h: el.offsetHeight })); }
  const rect = (t) => { const s = tam.get(t.id) || { w: ANCHO[modo], h: 60 }; return { x: t.x, y: t.y, w: s.w, h: s.h }; };
  function pintarLineas() {
    const cv = curvas(D.flechas);
    let svg = "", et = "";
    D.flechas.forEach((f) => {
      const a = T(f.de), b = T(f.a); if (!a || !b) return;
      const tr = trazo(rect(a), rect(b), cv[f.id] || 0), st = estiloFlecha(f, modo), dir = f.dir || dirDef(modo), col = st.color ? ' style="--lc:' + st.color + '"' : "";
      svg += '<g class="pz-f" data-f="' + f.id + '"' + col + '><path class="pz-hit" d="' + tr.d + '"/><path class="pz-l" d="' + tr.d + '"' + (st.dash ? ' stroke-dasharray="' + st.dash + '"' : "") + "/>" +
        (dir !== "nada" ? '<path class="pz-p" d="' + punta(tr.c, tr.p2) + '"/>' : "") + (dir === "ambas" ? '<path class="pz-p" d="' + punta(tr.c, tr.p0) + '"/>' : "") + "</g>";
      if (st.texto) et += '<span class="pz-e" data-f="' + f.id + '" style="left:' + tr.k[0] + "px;top:" + tr.k[1] + "px" + (st.color ? ";--lc:" + st.color : "") + '">' + esc(st.texto) + "</span>";
    });
    mundo.querySelector(".pz-ls").innerHTML = svg;
    mundo.querySelector(".pz-etiquetas").innerHTML = et;
    if (sel && sel.k === "f") marcar();
  }
  function pintarLeyenda() {
    const l = lienzo.querySelector(".pz-leyenda"); if (modo !== "relaciones") { l.hidden = true; return; }
    const usados = [...new Set(D.flechas.map((f) => f.lazo || "otro"))].filter((k) => LAZOS[k]);
    l.hidden = !usados.length;
    l.innerHTML = usados.map((k) => '<span><i style="--lc:' + LAZOS[k].c + (LAZOS[k].dash ? ";border-top-style:dashed" : "") + '"></i>' + LAZOS[k].n + "</span>").join("");
  }

  /* ----- vista: mover y acercar ----- */
  function aplicarVista() {
    if (!lienzo) return;
    mundo.style.transform = "translate(" + V.x + "px," + V.y + "px) scale(" + V.z + ")";
    const g = 24 * V.z;
    lienzo.style.backgroundSize = g + "px " + g + "px";
    lienzo.style.backgroundPosition = V.x + "px " + V.y + "px";
    const p = root.querySelector(".pz-zpct"); if (p) p.textContent = Math.round(V.z * 100) + "%";
    guardarVista();
  }
  const guardarVista = debounceL(() => { try { localStorage.setItem(claveVista, JSON.stringify(V)); } catch (e) {} }, 400);
  function aWorld(cx, cy) { const r = lienzo.getBoundingClientRect(); return [(cx - r.left - V.x) / V.z, (cy - r.top - V.y) / V.z]; }
  function centro() { if (!lienzo) return [0, 0]; const r = lienzo.getBoundingClientRect(); return aWorld(r.left + r.width / 2, r.top + r.height / 2); }
  function zoomEn(cx, cy, f) {
    const r = lienzo.getBoundingClientRect(), z = clamp(V.z * f, 0.2, 2.5), px = cx - r.left, py = cy - r.top;
    V.x = px - ((px - V.x) / V.z) * z; V.y = py - ((py - V.y) / V.z) * z; V.z = z; aplicarVista();
  }
  function verTodo() {
    const cajas = D.tarjetas.map(rect).concat(D.regiones.map((r) => ({ x: r.x, y: r.y, w: r.w, h: r.h })));
    if (D.fondo) { const f = mundo.querySelector(".pz-fondo"); cajas.push({ x: 0, y: 0, w: D.fondo.w, h: f.naturalWidth ? D.fondo.w * f.naturalHeight / f.naturalWidth : D.fondo.w * 0.6 }); }
    const r = lienzo.getBoundingClientRect();
    if (!cajas.length || !r.width) { V = { x: r.width / 2 - 100, y: r.height / 2 - 60, z: 1 }; aplicarVista(); return; }
    const x0 = Math.min(...cajas.map((c) => c.x)), y0 = Math.min(...cajas.map((c) => c.y)), x1 = Math.max(...cajas.map((c) => c.x + c.w)), y1 = Math.max(...cajas.map((c) => c.y + c.h));
    const z = clamp(Math.min((r.width - 60) / (x1 - x0 || 1), (r.height - 60) / (y1 - y0 || 1)), 0.25, 1.2);
    V = { z, x: (r.width - (x1 - x0) * z) / 2 - x0 * z, y: (r.height - (y1 - y0) * z) / 2 - y0 * z };
    aplicarVista();
  }

  /* ----- gestos en el tablero ----- */
  if (lienzo) {
    const ptrs = new Map(); let g = null, ultimoToque = { t: 0, x: 0, y: 0 };
    const dist = () => { const [a, b] = [...ptrs.values()]; return Math.hypot(a[0] - b[0], a[1] - b[1]); };
    const medio = () => { const [a, b] = [...ptrs.values()]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
    lienzo.addEventListener("pointerdown", (e) => {
      if (e.button > 0 || e.target.closest(".pz-zoom, .pz-leyenda")) return;
      ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      try { lienzo.setPointerCapture(e.pointerId); } catch (x) {}
      if (ptrs.size === 2) { const m = medio(); g = { tipo: "pinch", d0: dist(), z0: V.z, w: aWorld(m[0], m[1]) }; return; }
      if (ptrs.size > 2) return;
      const t = e.target, w = aWorld(e.clientX, e.clientY);
      const tar = t.closest(".pz-t"), reg = t.closest(".pz-reg"), fl = t.closest("[data-f]");
      const base = { sx: e.clientX, sy: e.clientY, movido: false };
      if (tar && ed && t.closest(".pz-asa")) { g = { ...base, tipo: "unir", de: tar.dataset.id }; e.preventDefault(); return; }
      if (tar) {
        const T0 = T(tar.dataset.id); seleccionar({ k: "t", id: T0.id });
        g = ed ? { ...base, tipo: "mover", id: T0.id, ox: w[0] - T0.x, oy: w[1] - T0.y, ir: t.closest("[data-ir]") } : { ...base, tipo: "pan", vx: V.x, vy: V.y, ir: t.closest("[data-ir]") };
        return;
      }
      if (fl) { seleccionar({ k: "f", id: fl.dataset.f }); g = { ...base, tipo: "pan", vx: V.x, vy: V.y }; return; }
      if (reg) {
        const R = D.regiones.find((r) => r.id === reg.dataset.id); seleccionar({ k: "r", id: R.id });
        if (!ed) g = { ...base, tipo: "pan", vx: V.x, vy: V.y };
        else if (t.closest(".pz-reg-asa")) g = { ...base, tipo: "tamano", id: R.id, w0: R.w, h0: R.h, wx: w[0], wy: w[1] };
        else g = { ...base, tipo: "region", id: R.id, ox: w[0] - R.x, oy: w[1] - R.y };
        return;
      }
      g = { ...base, tipo: "pan", vx: V.x, vy: V.y, fondo: true };
    });
    lienzo.addEventListener("pointermove", (e) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (!g) return;
      if (g.tipo === "pinch") { if (ptrs.size < 2) return; const m = medio(), r = lienzo.getBoundingClientRect(); V.z = clamp(g.z0 * dist() / g.d0, 0.2, 2.5); V.x = m[0] - r.left - g.w[0] * V.z; V.y = m[1] - r.top - g.w[1] * V.z; aplicarVista(); return; }
      if (!g.movido && Math.hypot(e.clientX - g.sx, e.clientY - g.sy) < 5) return;
      const w = aWorld(e.clientX, e.clientY);
      if (g.tipo === "pan") { g.movido = true; V.x = g.vx + e.clientX - g.sx; V.y = g.vy + e.clientY - g.sy; aplicarVista(); }
      else if (g.tipo === "mover" && ed) {
        if (!g.movido) { antes(); g.movido = true; mundo.querySelector('.pz-t[data-id="' + g.id + '"]').classList.add("arrastrando"); }
        const t = T(g.id); t.x = Math.round(w[0] - g.ox); t.y = Math.round(w[1] - g.oy);
        const el = mundo.querySelector('.pz-t[data-id="' + g.id + '"]'); el.style.left = t.x + "px"; el.style.top = t.y + "px"; pintarLineas();
      } else if (g.tipo === "region" && ed) {
        if (!g.movido) { antes(); g.movido = true; }
        const r = D.regiones.find((x) => x.id === g.id); r.x = Math.round(w[0] - g.ox); r.y = Math.round(w[1] - g.oy);
        const el = mundo.querySelector('.pz-reg[data-id="' + g.id + '"]'); el.style.left = r.x + "px"; el.style.top = r.y + "px";
      } else if (g.tipo === "tamano") {
        if (!g.movido) { antes(); g.movido = true; }
        const r = D.regiones.find((x) => x.id === g.id); r.w = Math.round(Math.max(120, g.w0 + w[0] - g.wx)); r.h = Math.round(Math.max(80, g.h0 + w[1] - g.wy));
        const el = mundo.querySelector('.pz-reg[data-id="' + g.id + '"]'); el.style.width = r.w + "px"; el.style.height = r.h + "px";
      } else if (g.tipo === "unir") {
        g.movido = true;
        const a = rect(T(g.de)), cx = a.x + a.w / 2, cy = a.y + a.h / 2;
        mundo.querySelector(".pz-temp").setAttribute("d", "M" + cx + "," + cy + " L" + w[0] + "," + w[1]);
        const bajo = document.elementFromPoint(e.clientX, e.clientY), dest = bajo && bajo.closest(".pz-t");
        mundo.querySelectorAll(".pz-t.destino").forEach((x) => x.classList.remove("destino"));
        if (dest && dest.dataset.id !== g.de) dest.classList.add("destino");
      }
    });
    const fin = (e, cancelado) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.delete(e.pointerId);
      if (!g) return;
      if (g.tipo === "pinch") { if (!ptrs.size) g = null; return; }
      const G = g; g = null;
      if (cancelado) { if (G.movido && ["mover", "region", "tamano"].includes(G.tipo)) cambio(); mundo.querySelector(".pz-temp").setAttribute("d", ""); return; }
      if (G.tipo === "mover") {
        const el = mundo.querySelector('.pz-t[data-id="' + G.id + '"]'); if (el) el.classList.remove("arrastrando");
        if (G.movido) { medir(); cambio(); return; }
        if (G.ir) { irEnlace(G.ir.dataset.ir); return; }
        if (Date.now() - ultimoToque.t < 380 && ultimoToque.id === G.id) enfocar(); // doble toque: editar
        ultimoToque = { t: Date.now(), id: G.id };
      } else if (G.tipo === "region" && !G.movido) { dobleToque(e); // dentro de una región también se pueden poner lugares
      } else if (G.tipo === "region" || G.tipo === "tamano") { if (G.movido) cambio(); }
      else if (G.tipo === "unir") {
        mundo.querySelector(".pz-temp").setAttribute("d", "");
        const d = mundo.querySelector(".pz-t.destino"); if (d) d.classList.remove("destino");
        if (d && d.dataset.id !== G.de) {
          antes();
          const f = { id: uid(), de: G.de, a: d.dataset.id, texto: "", dir: dirDef(modo), ...(modo === "relaciones" ? { lazo: "otro" } : {}) };
          D.flechas.push(f); sel = { k: "f", id: f.id }; pintarLineas(); pintarInsp(); pintarLeyenda(); cambio();
        }
      } else if (G.tipo === "pan" && G.ir && !G.movido) { irEnlace(G.ir.dataset.ir);
      } else if (G.tipo === "pan" && G.fondo && !G.movido) { if (!dobleToque(e)) seleccionar(null); }
    };
    // Segundo toque cerca del primero y a tiempo: crea una tarjeta ahí. Devuelve true si la creó.
    const dobleToque = (e) => {
      const now = Date.now();
      if (ed && now - ultimoToque.t < 380 && !ultimoToque.id && Math.hypot(e.clientX - ultimoToque.x, e.clientY - ultimoToque.y) < 24) {
        const w = aWorld(e.clientX, e.clientY); crearTarjeta(w[0] - (modo === "mapa" ? 14 : ANCHO[modo] / 2), w[1] - (modo === "mapa" ? 20 : 24)); ultimoToque = { t: 0 }; return true;
      }
      ultimoToque = { t: now, x: e.clientX, y: e.clientY }; return false;
    };
    lienzo.addEventListener("pointerup", (e) => fin(e, false));
    lienzo.addEventListener("pointercancel", (e) => fin(e, true));
    lienzo.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rueda = e.deltaMode === 1 || (Math.abs(e.deltaY) >= 50 && !e.deltaX && Number.isInteger(e.deltaY));
      if (e.ctrlKey || e.metaKey || rueda) zoomEn(e.clientX, e.clientY, Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : rueda ? 0.0018 : 0.01)));
      else { V.x -= e.deltaX; V.y -= e.deltaY; aplicarVista(); }
    }, { passive: false });
    root.querySelector(".pz-zoom").onclick = (e) => { const b = e.target.closest("[data-z]"); if (!b) return; const r = lienzo.getBoundingClientRect(); if (b.dataset.z === "0") verTodo(); else zoomEn(r.left + r.width / 2, r.top + r.height / 2, b.dataset.z === "+" ? 1.25 : 0.8); };
    lienzo.addEventListener("focusin", (e) => { const t = e.target.closest(".pz-t"); if (t && !(sel && sel.id === t.dataset.id)) seleccionar({ k: "t", id: t.dataset.id }); });
  }
  function irEnlace(v) { const [t, id] = v.split(":"); if (t === "s" && SEC(id)) o.irSeccion && o.irSeccion(id); else if (t === "r" && REF(id)) o.irReferente && o.irReferente(id); }
  function seleccionar(s) { if (JSON.stringify(s) === JSON.stringify(sel)) return; sel = s; marcar(); pintarInsp(); }

  /* ----- teclado ----- */
  root.addEventListener("keydown", (e) => {
    const enCampo = e.target.closest("input, textarea, select, [contenteditable]");
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !enCampo && ed) { e.preventDefault(); e.shiftKey ? volver(rehacer, hist) : volver(hist, rehacer); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y" && !enCampo && ed) { e.preventDefault(); volver(rehacer, hist); return; }
    if (enCampo) { if (e.key === "Escape") { e.target.blur(); (lienzo || escW).focus({ preventScroll: true }); } return; }
    if (e.key === "Escape") { if (root.classList.contains("pz-full")) accion("full"); else seleccionar(null); return; }
    if ((e.key === "Delete" || e.key === "Backspace") && sel) { e.preventDefault(); borrarSel(); return; }
    if (e.key === "Enter" && sel) { e.preventDefault(); enfocar(); return; }
    if (lienzo && (e.key === "+" || e.key === "=")) { const r = lienzo.getBoundingClientRect(); zoomEn(r.left + r.width / 2, r.top + r.height / 2, 1.2); return; }
    if (lienzo && e.key === "-") { const r = lienzo.getBoundingClientRect(); zoomEn(r.left + r.width / 2, r.top + r.height / 2, 0.83); return; }
    const flechas = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (flechas && ed && sel && sel.k === "t" && !ES) { e.preventDefault(); const t = T(sel.id), p = e.shiftKey ? 40 : 10; antes(); t.x += flechas[0] * p; t.y += flechas[1] * p; const el = mundo.querySelector('.pz-t[data-id="' + t.id + '"]'); el.style.left = t.x + "px"; el.style.top = t.y + "px"; pintarLineas(); cambio(); }
    else if (flechas && ed && sel && sel.k === "t" && ES) { e.preventDefault(); moverEscena(sel.id, flechas[0], flechas[1]); }
  });

  /* ----- inspector ----- */
  function pintarInsp() {
    const ro = ed ? "" : " disabled";
    const s = sel;
    if (!s) { aside.innerHTML = inspGeneral(); enlazarInsp(); return; }
    if (s.k === "t") {
      const t = T(s.id); if (!t) { sel = null; pintarInsp(); return; }
      const secs = o.secciones || [], refs = o.referentes || [], en = t.enlace ? t.enlace.t + ":" + t.enlace.id : "";
      const rel = D.flechas.filter((f) => f.de === t.id || f.a === t.id);
      aside.innerHTML = '<div class="pz-i-cab"><span>' + NOMBRE_T[modo] + (ES ? " " + (D.tarjetas.indexOf(t) + 1) : "") + '</span><button type="button" class="pz-x" data-i="cerrar" aria-label="Cerrar detalle">×</button></div>' +
        campo("titulo", modo === "relaciones" ? "Nombre" : "Título", t.titulo, ro) + campo("sub", SUB[modo], t.sub, ro) +
        '<label class="pz-c"><span>' + (ES ? "Qué pasa" : modo === "relaciones" ? "Quién es, qué quiere" : "Notas") + '</span><textarea data-campo="texto" rows="4" maxlength="4000"' + ro + ">" + esc(t.texto || "") + "</textarea></label>" +
        (ES ? '<label class="pz-c pz-c-min"><span>Duración aproximada (min)</span><input data-campo="min" type="number" inputmode="decimal" min="0" step="0.5" value="' + esc(t.min ?? "") + '"' + ro + "></label>" : "") +
        colores(t.color, ro) +
        '<label class="pz-c"><span>Enlazar con</span><select data-i="enlace"' + ro + '><option value="">Nada</option>' +
        (secs.length ? '<optgroup label="Taller">' + secs.map((x) => '<option value="s:' + x.id + '"' + (en === "s:" + x.id ? " selected" : "") + ">" + esc(x.titulo) + "</option>").join("") + "</optgroup>" : "") +
        (refs.length ? '<optgroup label="Referentes">' + refs.map((x) => '<option value="r:' + x.id + '"' + (en === "r:" + x.id ? " selected" : "") + ">" + esc(nombreRef(x)) + "</option>").join("") + "</optgroup>" : "") + "</select></label>" +
        (t.enlace && (t.enlace.t === "s" ? SEC(t.enlace.id) : REF(t.enlace.id)) ? '<button type="button" class="pz-b pz-libre" data-i="ir">Abrir ' + (t.enlace.t === "s" ? "en el Taller" : "en Referentes") + " →</button>" : "") +
        (ES && ed ? '<div class="pz-mover" role="group" aria-label="Mover escena"><button type="button" class="pz-b" data-m="0,-1">↑ Antes</button><button type="button" class="pz-b" data-m="0,1">↓ Después</button><button type="button" class="pz-b" data-m="-1,0">← Acto</button><button type="button" class="pz-b" data-m="1,0">Acto →</button></div>' : "") +
        (!ES && rel.length ? '<div class="pz-rel"><span>' + (modo === "relaciones" ? "Lazos" : modo === "mapa" ? "Rutas" : "Flechas") + "</span>" + rel.map((f) => { const otro = T(f.de === t.id ? f.a : f.de), st = estiloFlecha(f, modo); return '<button type="button" data-sf="' + f.id + '"' + (st.color ? ' style="--lc:' + st.color + '"' : "") + '><i></i>' + (st.texto ? esc(st.texto) + " · " : "") + esc(otro.titulo || "sin título") + "</button>"; }).join("") + "</div>" : "") +
        (ed ? '<div class="pz-i-pie"><button type="button" class="pz-b" data-i="duplicar">Duplicar</button><button type="button" class="pz-b peligro" data-i="borrar">Borrar</button></div>' : "") +
        (ed && !ES && !rel.length ? '<p class="pz-tip">Para unirla con otra, arrastra el punto <span class="pz-punto"></span> de su borde.</p>' : "");
    } else if (s.k === "f") {
      const f = D.flechas.find((x) => x.id === s.id), a = T(f.de), b = T(f.a), dir = f.dir || dirDef(modo);
      aside.innerHTML = '<div class="pz-i-cab"><span>' + (modo === "relaciones" ? "Lazo" : modo === "mapa" ? "Ruta" : "Flecha") + '</span><button type="button" class="pz-x" data-i="cerrar" aria-label="Cerrar detalle">×</button></div>' +
        '<p class="pz-de">' + esc(a.titulo || "sin título") + " <b>" + (dir === "ambas" ? "↔" : dir === "nada" ? "—" : "→") + "</b> " + esc(b.titulo || "sin título") + "</p>" +
        (modo === "relaciones" ? '<div class="pz-c"><span>Qué los une</span><div class="pz-lazos" role="radiogroup">' + Object.entries(LAZOS).map(([k, l]) => '<button type="button" role="radio" aria-checked="' + ((f.lazo || "otro") === k) + '" data-lazo="' + k + '" style="--lc:' + l.c + '"' + ro + ">" + l.n + "</button>").join("") + "</div></div>" : "") +
        campo("texto", modo === "relaciones" ? "En sus palabras (opcional)" : modo === "mapa" ? "Distancia o cómo se viaja" : "Etiqueta", f.texto, ro, modo === "relaciones" ? "Ej.: hermanos que no se hablan" : modo === "mapa" ? "Ej.: 3 días a caballo" : "Ej.: causa, luego, revela…") +
        '<div class="pz-c"><span>Dirección</span><div class="pz-seg" role="radiogroup">' + [["a", "→"], ["ambas", "↔"], ["nada", "—"]].map(([k, n]) => '<button type="button" role="radio" aria-checked="' + (dir === k) + '" data-dir="' + k + '"' + ro + ">" + n + "</button>").join("") + "</div></div>" +
        (ed ? '<div class="pz-i-pie"><button type="button" class="pz-b" data-i="invertir">Invertir</button><button type="button" class="pz-b peligro" data-i="borrar">Borrar</button></div>' : "");
    } else if (s.k === "r") {
      const r = D.regiones.find((x) => x.id === s.id);
      aside.innerHTML = '<div class="pz-i-cab"><span>Región</span><button type="button" class="pz-x" data-i="cerrar" aria-label="Cerrar detalle">×</button></div>' +
        campo("nombre", "Nombre", r.nombre, ro) + colores(r.color, ro, true) + '<p class="pz-tip">Arrastra la esquina inferior derecha para cambiar su tamaño.</p>' +
        (ed ? '<div class="pz-i-pie"><span></span><button type="button" class="pz-b peligro" data-i="borrar">Borrar</button></div>' : "");
    } else if (s.k === "a") {
      const a = D.actos.find((x) => x.id === s.id), i = D.actos.indexOf(a);
      aside.innerHTML = '<div class="pz-i-cab"><span>Acto ' + (i + 1) + '</span><button type="button" class="pz-x" data-i="cerrar" aria-label="Cerrar detalle">×</button></div>' +
        campo("n", "Nombre", a.n, ro) +
        (ed ? '<div class="pz-mover"><button type="button" class="pz-b" data-am="-1"' + (i ? "" : " disabled") + '>← Antes</button><button type="button" class="pz-b" data-am="1"' + (i < D.actos.length - 1 ? "" : " disabled") + ">Después →</button></div>" +
          '<div class="pz-i-pie"><span class="pz-tip">' + (D.actos.length > 1 ? "Al borrarlo, sus escenas pasan al acto vecino." : "") + '</span><button type="button" class="pz-b peligro" data-i="borrar"' + (D.actos.length > 1 ? "" : " disabled") + ">Borrar acto</button></div>" : "");
    }
    enlazarInsp();
  }
  function campo(k, label, v, ro, ph) { return '<label class="pz-c"><span>' + label + '</span><input data-campo="' + k + '" maxlength="' + (k === "titulo" || k === "nombre" || k === "n" ? 120 : 200) + '" value="' + esc(v || "") + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : "") + ro + "></label>"; }
  function colores(actual, ro, sinVacio) {
    return '<div class="pz-c"><span>Color</span><div class="pz-colores" role="radiogroup">' + COLORES.filter(([c]) => !sinVacio || c).map(([c, n]) => '<button type="button" role="radio" aria-checked="' + ((actual || "") === c) + '" aria-label="' + n + '" title="' + n + '" data-color="' + c + '" style="--c:' + (c || "transparent") + '"' + ro + "></button>").join("") + "</div></div>";
  }
  function inspGeneral() {
    const n = D.tarjetas.length;
    if (modo === "mapa") return '<div class="pz-i-cab"><span>Mapa</span></div>' +
      '<label class="pz-c"><span>Imagen del mapa (enlace)</span><input data-g="fondo" type="url" inputmode="url" placeholder="https://…" value="' + esc(D.fondo ? D.fondo.url : "") + '"' + (ed ? "" : " disabled") + "></label>" +
      (D.fondo ? '<label class="pz-c"><span>Tamaño de la imagen</span><input data-g="ancho" type="range" min="400" max="6000" step="100" value="' + D.fondo.w + '"' + (ed ? "" : " disabled") + "></label>" : "") +
      (D.fondo && fondoMal ? '<p class="pz-tip pz-mal" role="alert">No se pudo cargar esa imagen. Revisa que el enlace lleve directo a la imagen (al abrirlo debe verse solo la imagen) y que sea pública.</p>' : "") +
      '<p class="pz-tip">Pega el enlace directo de una imagen (que termine en .jpg, .png o .webp, o de un servicio como Imgur). Forja no guarda archivos: solo el enlace.</p>' + ayuda();
    if (ES) { const m = D.tarjetas.reduce((s, t) => s + num(t.min, 0), 0); return '<div class="pz-i-cab"><span>Escaleta</span></div><p class="pz-resumen"><b>' + n + "</b> " + (n === 1 ? "escena" : "escenas") + " en <b>" + D.actos.length + "</b> " + (D.actos.length === 1 ? "acto" : "actos") + (m ? " · <b>" + minTxt(m) + "</b>" : "") + "</p>" + ayuda(); }
    return '<div class="pz-i-cab"><span>' + MODOS[modo].n + "</span></div>" + ayuda();
  }
  function ayuda() {
    const toque = matchMedia("(pointer: coarse)").matches;
    const l = ES ? [ed ? (toque ? "Arrastra una escena desde su asa ⠿ para cambiarla de lugar o de acto." : "Arrastra una escena para cambiarla de lugar o de acto.") : "", "Toca una escena para ver su detalle.", ed ? "Con una escena elegida, las flechas del teclado la mueven." : ""]
      : [ed ? "Doble " + (toque ? "toque" : "clic") + " en el fondo crea " + (modo === "relaciones" ? "un personaje" : modo === "mapa" ? "un lugar" : "una tarjeta") + "." : "", ed ? "Arrastra el punto <span class=\"pz-punto\"></span> del borde hasta otra para unirlas." : "", toque ? "Arrastra el fondo para moverte; pellizca para acercar." : "Arrastra el fondo para moverte; la rueda o Ctrl + rueda acercan.", ed ? "Supr borra lo elegido; Ctrl + Z deshace." : ""];
    return '<div class="pz-ayuda">' + l.filter(Boolean).map((x) => "<p>" + x + "</p>").join("") + "</div>";
  }
  function enlazarInsp() {
    let tomado = false;
    const obj = () => (sel && sel.k === "t" ? T(sel.id) : sel && sel.k === "f" ? D.flechas.find((f) => f.id === sel.id) : sel && sel.k === "r" ? D.regiones.find((r) => r.id === sel.id) : sel && sel.k === "a" ? D.actos.find((a) => a.id === sel.id) : null);
    aside.querySelectorAll("[data-campo]").forEach((i) => {
      i.addEventListener("focus", () => { tomado = false; });
      i.addEventListener("input", () => {
        if (!ed) return; const x = obj(); if (!x) return;
        if (!tomado) { antes(); tomado = true; }
        const k = i.dataset.campo; x[k] = k === "min" ? (i.value === "" ? null : Math.max(0, num(i.value.replace(",", "."), 0))) : i.value;
        repintarUno(); cambio();
      });
    });
    aside.querySelectorAll("[data-color]").forEach((b) => b.onclick = () => { if (!ed) return; antes(); obj().color = b.dataset.color; repintarUno(); pintarInsp(); cambio(); });
    aside.querySelectorAll("[data-lazo]").forEach((b) => b.onclick = () => { if (!ed) return; antes(); obj().lazo = b.dataset.lazo; pintarLineas(); pintarLeyenda(); pintarInsp(); cambio(); });
    aside.querySelectorAll("[data-dir]").forEach((b) => b.onclick = () => { if (!ed) return; antes(); obj().dir = b.dataset.dir; pintarLineas(); pintarInsp(); cambio(); });
    aside.querySelectorAll("[data-sf]").forEach((b) => b.onclick = () => seleccionar({ k: "f", id: b.dataset.sf }));
    aside.querySelectorAll("[data-m]").forEach((b) => b.onclick = () => { const [dx, dy] = b.dataset.m.split(",").map(Number); moverEscena(sel.id, dx, dy); });
    aside.querySelectorAll("[data-am]").forEach((b) => b.onclick = () => { const i = D.actos.findIndex((a) => a.id === sel.id), j = i + +b.dataset.am; if (j < 0 || j >= D.actos.length) return; antes(); [D.actos[i], D.actos[j]] = [D.actos[j], D.actos[i]]; ordenarPorActos(); todo(); cambio(); });
    const en = aside.querySelector("[data-i=enlace]");
    if (en) en.onchange = () => {
      const t = obj(); antes();
      if (!en.value) delete t.enlace; else { const [k, id] = en.value.split(":"); t.enlace = { t: k, id }; if (!t.titulo) t.titulo = k === "s" ? (SEC(id) || {}).titulo || "" : nombreRef(REF(id) || {}); }
      todo(); cambio();
    };
    aside.querySelectorAll("[data-i]").forEach((b) => { if (b.tagName === "BUTTON") b.onclick = () => {
      const k = b.dataset.i;
      if (k === "cerrar") { seleccionar(null); (lienzo || escW).focus({ preventScroll: true }); }
      else if (k === "borrar") borrarSel();
      else if (k === "ir") { const t = obj(); irEnlace(t.enlace.t + ":" + t.enlace.id); }
      else if (k === "invertir") { antes(); const f = obj(); [f.de, f.a] = [f.a, f.de]; pintarLineas(); pintarInsp(); cambio(); }
      else if (k === "duplicar") {
        if (!puedeCrear()) return; antes(); const t = obj(), c = { ...JSON.parse(JSON.stringify(t)), id: uid(), x: t.x + 24, y: t.y + 24 };
        D.tarjetas.splice(D.tarjetas.indexOf(t) + 1, 0, c); sel = { k: "t", id: c.id }; todo(); cambio();
      }
    }; });
    const fondo = aside.querySelector("[data-g=fondo]");
    if (fondo) fondo.onchange = () => {
      const u = fondo.value.trim();
      if (u && !okUrl(u)) { o.aviso && o.aviso("El enlace debe empezar con https://"); return; }
      antes(); D.fondo = u ? { url: u, w: D.fondo ? D.fondo.w : 1600 } : null; pintarTablero(); pintarInsp(); cambio();
      if (u) mundo.querySelector(".pz-fondo").addEventListener("load", () => verTodo(), { once: true });
    };
    const ancho = aside.querySelector("[data-g=ancho]");
    if (ancho) { ancho.onpointerdown = ancho.onfocus = () => { tomado = false; }; ancho.oninput = () => { if (!tomado) { antes(); tomado = true; } D.fondo.w = +ancho.value; mundo.querySelector(".pz-fondo").style.width = D.fondo.w + "px"; cambio(); }; }
  }
  // Cambió el texto o color de lo elegido: se repinta solo lo necesario, sin tocar el foco del inspector.
  function repintarUno() {
    if (!sel) return;
    if (ES) { if (sel.k === "a") { const h = escW.querySelector('[data-acto="' + sel.id + '"] .pz-acto-n'); if (h) h.textContent = D.actos.find((a) => a.id === sel.id).n || "Acto"; } else pintarEsc(); pintarBarra(); return; }
    if (sel.k === "t") { const t = T(sel.id), el = mundo.querySelector('.pz-t[data-id="' + t.id + '"]'); if (el) { el.outerHTML = htmlTarjeta(t); const n = mundo.querySelector('.pz-t[data-id="' + t.id + '"]'); n.classList.add("pz-sel"); tam.set(t.id, { w: n.offsetWidth, h: n.offsetHeight }); n.querySelectorAll(".pz-img").forEach((im) => im.onerror = () => { im.remove(); medir(); pintarLineas(); }); } pintarLineas(); }
    else if (sel.k === "f") pintarLineas();
    else if (sel.k === "r") pintarTablero();
  }

  /* ----- escaleta ----- */
  function pintarEsc() {
    let n = 0;
    escW.innerHTML = D.actos.map((a) => {
      const ts = D.tarjetas.filter((t) => t.acto === a.id), m = ts.reduce((s, t) => s + num(t.min, 0), 0);
      return '<section class="pz-acto" data-acto="' + a.id + '"><header><button type="button" class="pz-acto-n pz-libre" data-sel-acto="' + a.id + '">' + esc(a.n || "Acto") + "</button><small>" + ts.length + (ts.length === 1 ? " escena" : " escenas") + (m ? " · " + minTxt(m) : "") + '</small></header><div class="pz-lista" data-lista="' + a.id + '">' +
        ts.map((t) => htmlEscena(t, ++n)).join("") + (ts.length ? "" : '<p class="pz-lista-vacia">' + (ed ? "Arrastra escenas aquí" : "Sin escenas") + "</p>") + "</div>" +
        (ed ? '<button type="button" class="pz-mas-e" data-mas-e="' + a.id + '">+ Escena</button>' : "") + "</section>";
    }).join("");
    escW.querySelectorAll("[data-mas-e]").forEach((b) => b.onclick = () => nuevaEscena(b.dataset.masE));
    escW.querySelectorAll("[data-sel-acto]").forEach((b) => b.onclick = () => { seleccionar({ k: "a", id: b.dataset.selActo }); enfocar(); });
    marcar();
  }
  function htmlEscena(t, n) {
    const c = okColor(t.color);
    return '<article class="pz-e2" data-id="' + t.id + '" tabindex="0"' + (c ? ' style="--c:' + c + '"' : "") + '><div class="pz-e2-top"><span class="pz-num">' + n + "</span>" + (ed ? '<span class="pz-mango" aria-hidden="true" title="Arrastrar">⠿</span>' : "") + "</div>" +
      media(t) + "<b>" + (t.titulo ? esc(t.titulo) : "<i>Escena sin título</i>") + "</b>" + (t.sub ? '<span class="pz-sub">' + esc(t.sub) + "</span>" : "") + (t.texto ? "<p>" + esc(t.texto) + "</p>" : "") +
      '<div class="pz-e2-pie">' + chip(t) + (num(t.min, 0) ? '<span class="pz-min">' + minTxt(num(t.min, 0)) + "</span>" : "") + "</div></article>";
  }
  function moverEscena(id, dx, dy) {
    if (!ed) return;
    const t = T(id); if (!t) return;
    antes();
    if (dx) {
      const i = D.actos.findIndex((a) => a.id === t.acto), j = i + dx; if (j < 0 || j >= D.actos.length) { hist.pop(); return; }
      D.tarjetas.splice(D.tarjetas.indexOf(t), 1); t.acto = D.actos[j].id;
      D.tarjetas.splice(finDeActo(t.acto), 0, t);
    } else {
      const mismas = D.tarjetas.filter((x) => x.acto === t.acto), i = mismas.indexOf(t), j = i + dy;
      if (j < 0 || j >= mismas.length) { hist.pop(); return; }
      const a = D.tarjetas.indexOf(t), b = D.tarjetas.indexOf(mismas[j]);[D.tarjetas[a], D.tarjetas[b]] = [D.tarjetas[b], D.tarjetas[a]];
    }
    todo(); cambio();
    requestAnimationFrame(() => { const el = escW.querySelector('[data-id="' + id + '"]'); if (el && !aside.contains(document.activeElement)) el.focus({ preventScroll: false }); });
  }
  if (escW) {
    let g = null;
    escW.addEventListener("pointerdown", (e) => {
      const c = e.target.closest(".pz-e2"); if (!c || e.button > 0) return;
      if (e.target.closest("[data-ir]")) { g = { ir: e.target.closest("[data-ir]").dataset.ir, sx: e.clientX, sy: e.clientY }; return; }
      seleccionar({ k: "t", id: c.dataset.id });
      if (!ed || (e.pointerType !== "mouse" && !e.target.closest(".pz-mango"))) { g = null; return; }
      g = { id: c.dataset.id, el: c, sx: e.clientX, sy: e.clientY, movido: false };
      try { escW.setPointerCapture(e.pointerId); } catch (x) {}
      if (e.target.closest(".pz-mango")) e.preventDefault();
    });
    escW.addEventListener("pointermove", (e) => {
      if (!g || !g.el) return;
      if (!g.movido) {
        if (Math.hypot(e.clientX - g.sx, e.clientY - g.sy) < 6) return;
        g.movido = true; antes();
        const r = g.el.getBoundingClientRect();
        g.dx = e.clientX - r.left; g.dy = e.clientY - r.top;
        g.ph = document.createElement("div"); g.ph.className = "pz-hueco"; g.ph.style.height = r.height + "px";
        g.el.after(g.ph); g.el.classList.add("volando"); g.el.style.width = r.width + "px";
      }
      g.el.style.left = e.clientX - g.dx + "px"; g.el.style.top = e.clientY - g.dy + "px";
      const bajo = document.elementFromPoint(e.clientX, e.clientY), acto = bajo && bajo.closest(".pz-acto");
      if (acto) {
        const lista = acto.querySelector(".pz-lista"), hermanos = [...lista.querySelectorAll(".pz-e2:not(.volando)")];
        const antesDe = hermanos.find((h) => { const r = h.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; });
        const vacia = lista.querySelector(".pz-lista-vacia"); if (vacia) vacia.remove();
        if (antesDe) lista.insertBefore(g.ph, antesDe); else lista.appendChild(g.ph);
      }
      const r = escW.getBoundingClientRect();
      if (e.clientX > r.right - 48) escW.scrollLeft += 14; else if (e.clientX < r.left + 48) escW.scrollLeft -= 14;
    });
    const soltar = (e, cancelado) => {
      if (!g) return;
      const G = g; g = null;
      if (G.ir) { if (!cancelado && Math.hypot(e.clientX - G.sx, e.clientY - G.sy) < 6) irEnlace(G.ir); return; }
      if (!G.movido) return;
      G.el.classList.remove("volando"); ["left", "top", "width"].forEach((k) => G.el.style.removeProperty(k));
      if (cancelado) { G.ph.remove(); hist.pop(); pintarEsc(); pintarBarra(); return; }
      G.ph.replaceWith(G.el);
      const orden = [];
      escW.querySelectorAll(".pz-lista").forEach((l) => l.querySelectorAll(".pz-e2").forEach((x) => orden.push([x.dataset.id, l.dataset.lista])));
      D.tarjetas = orden.map(([id, acto]) => { const t = T(id); t.acto = acto; return t; });
      todo(); cambio();
    };
    escW.addEventListener("pointerup", (e) => soltar(e, false));
    escW.addEventListener("pointercancel", (e) => soltar(e, true));
    escW.addEventListener("focusin", (e) => { const t = e.target.closest(".pz-e2"); if (t && !(sel && sel.id === t.dataset.id)) seleccionar({ k: "t", id: t.dataset.id }); });
  }
  async function ordenarTaller() {
    const ids = []; D.tarjetas.forEach((t) => { if (t.enlace && t.enlace.t === "s" && SEC(t.enlace.id) && !ids.includes(t.enlace.id)) ids.push(t.enlace.id); });
    if (!ids.length) return;
    const ok = await o.ordenarTaller(ids);
    if (ok) o.aviso && o.aviso(ids.length === 1 ? "Solo hay una sección enlazada; enlaza más escenas a secciones para ordenarlas." : "El Taller quedó en el orden de la escaleta (" + ids.length + " secciones).");
  }

  /* ----- arranque ----- */
  pintarBarra(); todo();
  if (lienzo) {
    let guardada = null; try { guardada = JSON.parse(localStorage.getItem(claveVista) || "null"); } catch (e) {}
    requestAnimationFrame(() => { medir(); pintarLineas(); if (guardada && Number.isFinite(guardada.z)) { V = guardada; aplicarVista(); } else verTodo(); });
    if (D.fondo) mundo.querySelector(".pz-fondo").addEventListener("load", () => { if (!guardada) verTodo(); }, { once: true });
  }
  const alSalir = () => { if (pendiente) guardarYa(); };
  window.addEventListener("pagehide", alSalir);
  const ro2 = lienzo && "ResizeObserver" in window ? new ResizeObserver(() => aplicarVista()) : null; if (ro2) ro2.observe(lienzo);
  return {
    destruir() { alSalir(); vivo = false; window.removeEventListener("pagehide", alSalir); if (ro2) ro2.disconnect(); document.documentElement.classList.remove("pz-sin-scroll"); },
    hayCambios: () => pendiente,
  };
}
function debounceL(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

/* ---------- versión para imprimir (biblia) ---------- */
// Dibuja la pizarra sin interacción: SVG para libre, relaciones y mapa; columnas para la escaleta.
export function estatica(piz, o = {}) {
  const modo = MODOS[piz.modo] ? piz.modo : "libre", D = normal(piz.datos, modo);
  const SEC = (id) => (o.secciones || []).find((s) => s.id === id), REF = (id) => (o.referentes || []).find((r) => r.id === id);
  const enlace = (t) => !t.enlace ? "" : t.enlace.t === "s" ? (SEC(t.enlace.id) ? "§ " + SEC(t.enlace.id).titulo : "") : REF(t.enlace.id) ? "✦ " + (REF(t.enlace.id).titulo || REF(t.enlace.id).tipo) : "";
  if (!D.tarjetas.length && !D.regiones.length && !D.fondo) return '<p class="pz-st-vacia">Pizarra vacía.</p>';
  if (modo === "escaleta") {
    let n = 0;
    return '<div class="pz-st-esc">' + D.actos.map((a) => { const ts = D.tarjetas.filter((t) => t.acto === a.id), m = ts.reduce((s, t) => s + num(t.min, 0), 0);
      return '<section><h4>' + esc(a.n || "Acto") + (m ? " <small>" + minTxt(m) + "</small>" : "") + "</h4>" + ts.map((t) => '<div class="pz-st-e"' + (okColor(t.color) ? ' style="border-left-color:' + t.color + '"' : "") + "><b>" + ++n + ". " + esc(t.titulo || "Escena") + "</b>" + (t.sub ? "<small>" + esc(t.sub) + "</small>" : "") + (t.texto ? "<p>" + esc(t.texto) + "</p>" : "") + (enlace(t) ? "<small>" + esc(enlace(t)) + (num(t.min, 0) ? " · " + minTxt(num(t.min, 0)) : "") + "</small>" : num(t.min, 0) ? "<small>" + minTxt(num(t.min, 0)) + "</small>" : "") + "</div>").join("") + "</section>"; }).join("") + "</div>";
  }
  const W = ANCHO[modo], LH = 15;
  const partir = (s, cpl, maxL) => { const out = []; let l = ""; String(s || "").split(/\s+/).forEach((w) => { if ((l + " " + w).trim().length > cpl) { if (l) out.push(l); l = w; } else l = (l + " " + w).trim(); }); if (l) out.push(l); if (out.length > maxL) { out.length = maxL; out[maxL - 1] += "…"; } return out; };
  const caja = new Map();
  const bloques = D.tarjetas.map((t) => {
    const tit = partir(t.titulo || (modo === "mapa" ? "Lugar" : "—"), modo === "mapa" ? 18 : Math.floor(W / 7.6), 2), sub = t.sub ? partir(t.sub, Math.floor(W / 6.6), 1) : [];
    const tx = modo === "libre" && t.texto ? partir(t.texto, Math.floor(W / 6.6), 5) : [], en = modo === "libre" ? enlace(t) : "";
    const top = modo === "relaciones" ? 56 : 14;
    const h = top + tit.length * 17 + sub.length * LH + (tx.length ? 6 + tx.length * LH : 0) + (en ? 20 : 0) + 12;
    caja.set(t.id, { x: t.x, y: t.y, w: W, h }); return { t, tit, sub, tx, en, top, h };
  });
  const cv = curvas(D.flechas);
  let lineas = "", etiq = "";
  D.flechas.forEach((f) => {
    const a = caja.get(f.de), b = caja.get(f.a); if (!a || !b) return;
    const tr = trazo(a, b, cv[f.id] || 0), st = estiloFlecha(f, modo), c = st.color || "#5b6275", dir = f.dir || dirDef(modo);
    lineas += '<path d="' + tr.d + '" fill="none" stroke="' + c + '" stroke-width="1.8"' + (st.dash ? ' stroke-dasharray="' + st.dash + '"' : "") + "/>" + (dir !== "nada" ? '<path d="' + punta(tr.c, tr.p2) + '" fill="' + c + '"/>' : "") + (dir === "ambas" ? '<path d="' + punta(tr.c, tr.p0) + '" fill="' + c + '"/>' : "");
    if (st.texto) { const w = Math.min(180, st.texto.length * 6.4 + 14); etiq += '<rect x="' + (tr.k[0] - w / 2) + '" y="' + (tr.k[1] - 10) + '" width="' + w + '" height="20" rx="10" fill="#fff" stroke="' + c + '"/><text x="' + tr.k[0] + '" y="' + (tr.k[1] + 4) + '" text-anchor="middle" font-size="11" fill="' + c + '">' + esc(st.texto.length > 28 ? st.texto.slice(0, 27) + "…" : st.texto) + "</text>"; }
  });
  const regs = D.regiones.map((r) => { const c = okColor(r.color) || "#5b6275"; return '<rect x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '" rx="18" fill="' + c + '" fill-opacity=".1" stroke="' + c + '" stroke-dasharray="6 5"/><text x="' + (r.x + 14) + '" y="' + (r.y + 22) + '" font-size="12" letter-spacing="1.5" fill="' + c + '" font-weight="700">' + esc((r.nombre || "Región").toUpperCase()) + "</text>"; }).join("");
  const tarjs = bloques.map(({ t, tit, sub, tx, en, top, h }) => {
    const c = okColor(t.color), x = t.x, y = t.y; let s = "";
    let yy = y + top;
    if (modo === "relaciones") {
      s += '<rect x="' + x + '" y="' + y + '" width="' + W + '" height="' + h + '" rx="16" fill="#fff" stroke="#dfe2ea"/><circle cx="' + (x + W / 2) + '" cy="' + (y + 28) + '" r="19" fill="' + (c || "#5b6275") + '"/><text x="' + (x + W / 2) + '" y="' + (y + 33) + '" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">' + esc(iniciales(t.titulo)) + "</text>";
      tit.forEach((l) => { yy += 15; s += '<text x="' + (x + W / 2) + '" y="' + yy + '" text-anchor="middle" font-size="13" font-weight="700" fill="#161a26">' + esc(l) + "</text>"; });
      sub.forEach((l) => { yy += LH; s += '<text x="' + (x + W / 2) + '" y="' + yy + '" text-anchor="middle" font-size="11" fill="#5b6275">' + esc(l) + "</text>"; });
    } else if (modo === "mapa") {
      s += '<path transform="translate(' + (x + 4) + "," + (y + 6) + ')" d="M9 22C9 22 1.5 13.4 1.5 8.4a7.5 7.5 0 0 1 15 0c0 5-7.5 13.6-7.5 13.6Z" fill="' + (c || "#e0602f") + '"/>';
      tit.forEach((l) => { yy += 15; s += '<text x="' + (x + 26) + '" y="' + yy + '" font-size="13" font-weight="700" fill="#161a26" paint-order="stroke" stroke="#fff" stroke-width="3">' + esc(l) + "</text>"; });
      sub.forEach((l) => { yy += LH; s += '<text x="' + (x + 26) + '" y="' + yy + '" font-size="11" fill="#5b6275" paint-order="stroke" stroke="#fff" stroke-width="3">' + esc(l) + "</text>"; });
    } else {
      s += '<rect x="' + x + '" y="' + y + '" width="' + W + '" height="' + h + '" rx="10" fill="' + (c ? c + "14" : "#fff") + '" stroke="' + (c || "#dfe2ea") + '"/>' + (c ? '<rect x="' + x + '" y="' + y + '" width="5" height="' + h + '" rx="2.5" fill="' + c + '"/>' : "");
      tit.forEach((l) => { yy += 15; s += '<text x="' + (x + 14) + '" y="' + yy + '" font-size="13" font-weight="700" fill="#161a26">' + esc(l) + "</text>"; });
      sub.forEach((l) => { yy += LH; s += '<text x="' + (x + 14) + '" y="' + yy + '" font-size="11" fill="#5b6275">' + esc(l) + "</text>"; });
      if (tx.length) yy += 6; tx.forEach((l) => { yy += LH; s += '<text x="' + (x + 14) + '" y="' + yy + '" font-size="11.5" fill="#2b3040">' + esc(l) + "</text>"; });
      if (en) s += '<text x="' + (x + 14) + '" y="' + (yy + 18) + '" font-size="10.5" fill="#2a3fd1">' + esc(en.length > 30 ? en.slice(0, 29) + "…" : en) + "</text>";
    }
    return s;
  }).join("");
  const todas = [...caja.values(), ...D.regiones];
  if (!todas.length) todas.push({ x: 0, y: 0, w: 1, h: 1 });
  let x0 = Math.min(...todas.map((c) => c.x)) - 30, y0 = Math.min(...todas.map((c) => c.y)) - 30, x1 = Math.max(...todas.map((c) => c.x + c.w)) + 30, y1 = Math.max(...todas.map((c) => c.y + c.h)) + 30;
  let fondo = "";
  if (D.fondo) { const h = Math.round(D.fondo.w * (D.fondo.r || 0.66)); fondo = '<image href="' + esc(D.fondo.url) + '" x="0" y="0" width="' + D.fondo.w + '" height="' + h + '" preserveAspectRatio="xMinYMin meet"/>'; x0 = Math.min(x0, 0); y0 = Math.min(y0, 0); x1 = Math.max(x1, D.fondo.w); y1 = Math.max(y1, h); }
  const leyenda = modo === "relaciones" ? [...new Set(D.flechas.map((f) => f.lazo || "otro"))].filter((k) => LAZOS[k]).map((k) => '<span><i style="background:' + LAZOS[k].c + '"></i>' + LAZOS[k].n + "</span>").join("") : "";
  return '<svg class="pz-st" viewBox="' + [x0, y0, x1 - x0, y1 - y0].map(Math.round).join(" ") + '" font-family="Atkinson Hyperlegible, system-ui, sans-serif" role="img" aria-label="' + esc(piz.nombre) + '">' + fondo + regs + lineas + etiq + tarjs + "</svg>" + (leyenda ? '<div class="pz-st-ley">' + leyenda + "</div>" : "");
}

/* ---------- estilos ---------- */
export const CSS_PIZARRA = `
.pz{display:flex;flex-direction:column;gap:0;border:1px solid var(--line);border-radius:16px;background:var(--card);overflow:hidden;min-width:0}
.pz.pz-full{position:fixed;inset:0;z-index:60;border-radius:0;border:0}
html.pz-sin-scroll,html.pz-sin-scroll body{overflow:hidden}
.pz-barra{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid var(--line);background:var(--card);position:relative;z-index:3}
.pz-b{font:inherit;font-size:13px;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:8px;padding:5px 10px;cursor:pointer;white-space:nowrap}
.pz-b:hover:not(:disabled){border-color:var(--accent)}
.pz-b:disabled{opacity:.45;cursor:default}
.pz-b.peligro{color:var(--bad)}
.pz-b[data-b=nueva]{background:var(--fg);color:var(--bg);border-color:var(--fg);font-weight:700}
.pz-sep{width:1px;height:20px;background:var(--line);margin:0 2px}
.pz-der{margin-left:auto;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
@media (max-width:640px){.pz-barra{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}.pz-barra::-webkit-scrollbar{display:none}.pz-der{flex-wrap:nowrap;flex:none}.pz-traer-w{position:static}.pz-menu{position:fixed;left:16px;right:16px;top:auto;bottom:90px;width:auto;max-height:50vh}}
.pz-cuenta{font-family:var(--f-num);font-size:12px;color:var(--muted)}
.pz-cuenta.cerca{color:var(--e-pausa,#c48a00);font-weight:700}
.pz-estado{font-size:12px;color:var(--muted)}
.pz-estado.mal{color:var(--bad);font-weight:700}
.pz-ro{font-size:13px;color:var(--muted);font-weight:700}
.pz-traer-w{position:relative}
.pz-menu{position:absolute;left:0;top:calc(100% + 6px);z-index:20;width:min(300px,80vw);max-height:340px;overflow:auto;background:var(--card);border:1px solid var(--line);border-radius:12px;box-shadow:0 12px 32px rgba(10,14,30,.18);padding:6px;display:flex;flex-direction:column}
.pz-menu b{font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);padding:8px 8px 4px}
.pz-menu p{margin:8px;font-size:13px;color:var(--muted)}
.pz-menu button{font:inherit;font-size:14px;text-align:left;border:0;background:none;color:var(--fg);border-radius:8px;padding:6px 8px;display:flex;gap:8px;align-items:baseline;cursor:pointer}
.pz-menu button:hover{background:var(--field)}
.pz-menu button span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pz-menu small{font-size:11px;color:var(--muted)}
.pz-menu i{font-style:normal;color:var(--good)}
.pz-cuerpo{display:grid;grid-template-columns:minmax(0,1fr) 280px;min-height:0}
.pz-full .pz-cuerpo{flex:1}
@media (max-width:820px){.pz-cuerpo{grid-template-columns:minmax(0,1fr)}.pz-full .pz-cuerpo{grid-template-rows:minmax(0,1fr) auto}}
.pz-lienzo{position:relative;overflow:hidden;height:min(68vh,640px);min-height:360px;touch-action:none;cursor:grab;outline:none;
  background-color:var(--field);background-image:radial-gradient(circle at 1px 1px,color-mix(in srgb,var(--muted) 38%,transparent) 1px,transparent 1.4px)}
.pz-lienzo:focus-visible{box-shadow:inset 0 0 0 2px var(--accent)}
.pz-full .pz-lienzo{height:auto;min-height:0}
.pz[data-modo=mapa] .pz-lienzo{background-color:color-mix(in srgb,var(--field) 88%,#c9a86a);background-image:linear-gradient(color-mix(in srgb,var(--muted) 16%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--muted) 16%,transparent) 1px,transparent 1px)}
.pz-lienzo:active{cursor:grabbing}
.pz-mundo{position:absolute;left:0;top:0;transform-origin:0 0;width:0;height:0}
.pz-fondo{position:absolute;left:0;top:0;max-width:none;height:auto;pointer-events:none;user-select:none;border-radius:6px;box-shadow:0 2px 14px rgba(0,0,0,.12)}
.pz-lineas{position:absolute;left:0;top:0;overflow:visible;pointer-events:none}
.pz-f{color:var(--lc,var(--muted))}
.pz-l{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
.pz-p{fill:currentColor}
.pz-hit{fill:none;stroke:transparent;stroke-width:16;pointer-events:stroke;cursor:pointer}
.pz-f.pz-sel{color:var(--accent)} .pz-f.pz-sel .pz-l{stroke-width:3}
.pz-temp{fill:none;stroke:var(--accent);stroke-width:2;stroke-dasharray:6 5}
.pz-etiquetas{position:absolute;left:0;top:0}
.pz-e{position:absolute;transform:translate(-50%,-50%);white-space:nowrap;max-width:220px;overflow:hidden;text-overflow:ellipsis;font-size:12px;line-height:1.2;padding:3px 9px;border-radius:999px;background:var(--card);border:1px solid var(--lc,var(--line));color:var(--lc,var(--muted));cursor:pointer}
.pz-e.pz-sel{border-color:var(--accent);color:var(--accent);font-weight:700}
.pz-t{position:absolute;display:flex;flex-direction:column;gap:3px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 12px 11px 14px;box-shadow:0 1px 2px rgba(10,14,30,.06),0 4px 14px rgba(10,14,30,.05);cursor:pointer;user-select:none;-webkit-user-select:none;outline:none}
.pz-t[style*="--c"]{background:color-mix(in srgb,var(--c) 7%,var(--card));border-color:color-mix(in srgb,var(--c) 38%,var(--line))}
.pz-t[style*="--c"]::before{content:"";position:absolute;left:0;top:8px;bottom:8px;width:4px;border-radius:0 3px 3px 0;background:var(--c)}
.pz-t.pz-sel,.pz-t:focus-visible{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent),0 8px 24px rgba(10,14,30,.12)}
.pz-t.arrastrando{box-shadow:0 14px 34px rgba(10,14,30,.22);z-index:4}
.pz-t.destino{box-shadow:0 0 0 3px var(--ember)}
.pz-t b{font-family:var(--f-display);font-size:15px;line-height:1.25;overflow-wrap:anywhere}
.pz-t b i,.pz-e2 b i{font-weight:400;color:var(--muted)}
.pz-sub{font-size:12px;color:var(--muted);line-height:1.3;overflow-wrap:anywhere}
.pz-t p{margin:2px 0 0;font-size:13px;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:6;-webkit-box-orient:vertical;overflow:hidden}
.pz-img{display:block;width:calc(100% + 26px);margin:-10px -12px 4px -14px;max-height:150px;object-fit:cover;border-radius:11px 11px 0 0;pointer-events:none}
.pz-muestra{display:block;height:34px;border-radius:7px;margin-bottom:3px;border:1px solid rgba(0,0,0,.08)}
.pz-chip{align-self:flex-start;font:inherit;font-size:11.5px;line-height:1.2;margin-top:4px;border:1px solid color-mix(in srgb,var(--accent) 35%,var(--line));background:var(--accent-soft);color:var(--accent);border-radius:999px;padding:2px 8px;cursor:pointer;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pz-chip.roto{background:none;color:var(--muted);border-style:dashed;cursor:default}
.pz-asa{position:absolute;right:-8px;top:50%;width:16px;height:16px;margin-top:-8px;border-radius:50%;background:var(--card);border:2px solid var(--accent);cursor:crosshair;opacity:0;transition:opacity .12s}
.pz-asa::after{content:"";position:absolute;inset:-10px}
.pz-t:hover .pz-asa,.pz-t.pz-sel .pz-asa{opacity:1}
@media (pointer:coarse){.pz-asa{opacity:.85;width:20px;height:20px;margin-top:-10px;right:-10px}}
.pz-punto{display:inline-block;width:10px;height:10px;border-radius:50%;border:2px solid var(--accent);vertical-align:-1px}
.pz[data-modo=relaciones] .pz-t{align-items:center;text-align:center;border-radius:18px;padding:12px 12px 12px}
.pz[data-modo=relaciones] .pz-t::before{display:none}
.pz[data-modo=relaciones] .pz-t[style*="--c"]{background:var(--card);border-color:var(--line)}
.pz-avatar{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--c,var(--muted));color:#fff;font-family:var(--f-display);font-weight:700;font-size:16px;margin-bottom:3px;box-shadow:0 0 0 4px color-mix(in srgb,var(--c,var(--muted)) 18%,transparent)}
.pz[data-modo=relaciones] .pz-chip{align-self:center}
.pz[data-modo=mapa] .pz-t{flex-direction:row;align-items:flex-start;gap:6px;background:transparent;border-color:transparent;box-shadow:none;padding:4px 6px}
.pz[data-modo=mapa] .pz-t::before{display:none}
.pz[data-modo=mapa] .pz-t[style*="--c"]{background:transparent;border-color:transparent}
.pz[data-modo=mapa] .pz-t.pz-sel{background:color-mix(in srgb,var(--card) 85%,transparent);border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
.pz-pin{flex:none;width:20px;height:25px;fill:var(--c,var(--ember));filter:drop-shadow(0 2px 2px rgba(0,0,0,.25))}
.pz-pin circle{fill:var(--card)}
.pz-et{display:flex;flex-direction:column;min-width:0}
.pz[data-modo=mapa] .pz-t b,.pz[data-modo=mapa] .pz-sub{text-shadow:0 0 3px var(--card),0 0 3px var(--card),0 0 6px var(--card)}
.pz[data-modo=mapa] .pz-chip{align-self:flex-start}
.pz-reg{position:absolute;border-radius:22px;background:color-mix(in srgb,var(--c) 11%,transparent);border:1.5px dashed color-mix(in srgb,var(--c) 70%,transparent);cursor:move}
.pz-reg span{position:absolute;left:14px;top:9px;font-family:var(--f-display);font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:var(--c);pointer-events:none}
.pz-reg.pz-sel{border-style:solid;border-color:var(--accent)}
.pz-reg-asa{position:absolute;right:-6px;bottom:-6px;width:16px;height:16px;border-radius:5px;background:var(--card);border:2px solid var(--c);cursor:nwse-resize}
.pz-zoom{position:absolute;right:12px;bottom:12px;display:flex;background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(10,14,30,.08);z-index:2}
.pz-zoom button{font:inherit;border:0;background:none;color:var(--fg);padding:6px 11px;cursor:pointer;font-size:15px}
.pz-zoom button+button{border-left:1px solid var(--line)}
.pz-zoom .pz-zpct{font-family:var(--f-num);font-size:12px;min-width:56px}
.pz-zoom button:hover{background:var(--field)}
.pz-leyenda[hidden]{display:none}
.pz-leyenda{position:absolute;left:12px;bottom:12px;display:flex;flex-wrap:wrap;gap:4px 12px;max-width:calc(100% - 200px);background:color-mix(in srgb,var(--card) 92%,transparent);border:1px solid var(--line);border-radius:10px;padding:6px 10px;font-size:12px;color:var(--muted);z-index:2}
.pz-leyenda span{display:inline-flex;align-items:center;gap:6px}
.pz-leyenda i{display:inline-block;width:18px;border-top:2.5px solid var(--lc)}
.pz-vacio{position:absolute;inset:0;margin:auto;height:max-content;max-width:40ch;text-align:center;color:var(--muted);font-size:14px;line-height:1.6;pointer-events:none;padding:0 20px}
.pz-insp{border-left:1px solid var(--line);padding:14px;display:flex;flex-direction:column;gap:12px;overflow:auto;max-height:min(68vh,640px);background:var(--card)}
.pz-full .pz-insp{max-height:none}
@media (max-width:820px){.pz-insp{border-left:0;border-top:1px solid var(--line);max-height:none}.pz-full .pz-insp{max-height:42vh}}
.pz-i-cab{display:flex;justify-content:space-between;align-items:center;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700}
.pz-x{border:0;background:none;color:var(--muted);font-size:20px;line-height:1;cursor:pointer;padding:0 4px}
.pz-c{display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted)}
.pz-c input:not([type=range]),.pz-c textarea,.pz-c select{font:inherit;font-size:14px;color:var(--fg);border:1px solid var(--line);background:var(--field);border-radius:8px;padding:7px 9px;width:100%}
.pz-c textarea{resize:vertical;min-height:84px;line-height:1.45}
.pz-c input[type=range]{accent-color:var(--accent)}
.pz-colores{display:flex;flex-wrap:wrap;gap:6px}
.pz-colores button{width:26px;height:26px;border-radius:50%;border:2px solid var(--card);background:var(--c);box-shadow:0 0 0 1px var(--line);cursor:pointer;padding:0}
.pz-colores button[data-color=""]{background:linear-gradient(135deg,transparent 45%,var(--muted) 46% 54%,transparent 55%),var(--field)}
.pz-colores button[aria-checked=true]{box-shadow:0 0 0 2px var(--fg)}
.pz-lazos{display:flex;flex-wrap:wrap;gap:5px}
.pz-lazos button{font:inherit;font-size:12.5px;border:1px solid color-mix(in srgb,var(--lc) 45%,var(--line));color:var(--lc);background:var(--card);border-radius:999px;padding:3px 10px;cursor:pointer}
.pz-lazos button[aria-checked=true]{background:var(--lc);color:#fff;font-weight:700}
.pz-seg{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden;align-self:flex-start}
.pz-seg button{font:inherit;font-size:15px;border:0;background:var(--card);color:var(--fg);padding:4px 14px;cursor:pointer}
.pz-seg button+button{border-left:1px solid var(--line)}
.pz-seg button[aria-checked=true]{background:var(--fg);color:var(--bg)}
.pz-de{margin:0;font-size:14px}
.pz-de b{color:var(--accent);padding:0 4px}
.pz-rel{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--muted)}
.pz-rel button{font:inherit;font-size:13px;text-align:left;border:1px solid var(--line);background:var(--field);color:var(--fg);border-radius:8px;padding:5px 8px;cursor:pointer;display:flex;align-items:center;gap:7px}
.pz-rel button i{flex:none;width:14px;border-top:2.5px solid var(--lc,var(--muted))}
.pz-i-pie{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-top:2px;padding-top:10px;border-top:1px solid var(--line)}
.pz-mover{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.pz-tip{margin:0;font-size:12px;color:var(--muted);line-height:1.45}
.pz-tip.pz-mal{color:var(--bad);font-weight:700}
.pz-ayuda{display:flex;flex-direction:column;gap:6px;font-size:13px;color:var(--muted);line-height:1.45;border-top:1px dashed var(--line);padding-top:10px}
.pz-ayuda p{margin:0}
.pz-resumen{margin:0;font-size:15px}
.pz-esc{display:flex;gap:12px;overflow-x:auto;padding:14px;min-height:420px;max-height:min(72vh,680px);align-items:flex-start;background:var(--field);outline:none;scroll-snap-type:x proximity}
.pz-full .pz-esc{max-height:none;height:100%}
.pz-acto{flex:0 0 260px;scroll-snap-align:start;display:flex;flex-direction:column;gap:8px;background:color-mix(in srgb,var(--card) 55%,var(--field));border:1px solid var(--line);border-radius:14px;padding:10px;max-height:100%}
.pz-acto.pz-sel{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
.pz-acto header{display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:2px 2px 4px}
.pz-acto-n{font:inherit;font-family:var(--f-display);font-weight:700;font-size:16px;border:0;background:none;color:var(--fg);padding:0;cursor:pointer;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pz-acto-n:hover{color:var(--accent)}
.pz-acto header small{font-family:var(--f-num);font-size:11px;color:var(--muted);white-space:nowrap}
.pz-lista{display:flex;flex-direction:column;gap:8px;min-height:60px;overflow-y:auto;padding:2px}
.pz-lista-vacia{margin:0;border:1.5px dashed var(--line);border-radius:10px;padding:16px 10px;text-align:center;font-size:13px;color:var(--muted)}
.pz-e2{position:relative;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:9px 11px 10px 13px;display:flex;flex-direction:column;gap:3px;cursor:pointer;user-select:none;-webkit-user-select:none;outline:none}
.pz-e2[style*="--c"]{border-left:4px solid var(--c);padding-left:10px}
.pz-e2.pz-sel,.pz-e2:focus-visible{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent)}
.pz-e2.volando{position:fixed;z-index:80;pointer-events:none;box-shadow:0 18px 40px rgba(10,14,30,.25);transform:rotate(-1.5deg)}
.pz-e2 b{font-family:var(--f-display);font-size:14.5px;line-height:1.25;overflow-wrap:anywhere}
.pz-e2 p{margin:1px 0 0;font-size:13px;line-height:1.45;color:var(--fg);white-space:pre-wrap;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.pz-e2 .pz-img{width:calc(100% + 24px);margin:-9px -11px 4px -13px}
.pz-e2-top{display:flex;justify-content:space-between;align-items:center}
.pz-num{font-family:var(--f-num);font-size:11px;font-weight:700;color:var(--muted)}
.pz-mango{font-size:16px;line-height:1;color:var(--muted);cursor:grab;touch-action:none;padding:2px 4px;margin:-4px -6px -4px 0}
.pz-e2-pie{display:flex;justify-content:space-between;align-items:center;gap:6px}
.pz-e2-pie:empty{display:none}
.pz-min{font-family:var(--f-num);font-size:11px;color:var(--muted);margin-left:auto}
.pz-hueco{border:2px dashed var(--accent);border-radius:12px;background:var(--accent-soft);flex:none}
.pz-mas-e{font:inherit;font-size:13px;border:1.5px dashed var(--line);background:none;color:var(--muted);border-radius:10px;padding:7px;cursor:pointer}
.pz-mas-e:hover{border-color:var(--accent);color:var(--accent)}
.pz-st{display:block;width:100%;height:auto;max-height:240mm;border:1px solid #dfe2ea;border-radius:10px;background:#fafbfc}
.pz-st-ley{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:11px;color:#5b6275;margin-top:6px}
.pz-st-ley i{display:inline-block;width:14px;height:3px;border-radius:2px;margin-right:5px;vertical-align:3px}
.pz-st-vacia{color:#5b6275;font-style:italic}
.pz-st-esc{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.pz-st-esc section{display:flex;flex-direction:column;gap:6px}
.pz-st-esc h4{margin:0;font-size:13px;text-transform:uppercase;letter-spacing:.08em}
.pz-st-esc h4 small{font-weight:400;color:#5b6275;letter-spacing:0;text-transform:none}
.pz-st-e{border:1px solid #dfe2ea;border-left:3px solid #dfe2ea;border-radius:6px;padding:6px 8px;display:flex;flex-direction:column;gap:2px;break-inside:avoid;font-size:12px}
.pz-st-e p{margin:0;font-size:11.5px;line-height:1.4;white-space:pre-wrap}
.pz-st-e small{color:#5b6275;font-size:10.5px}
@media (prefers-reduced-motion:reduce){.pz-asa{transition:none}.pz-e2.volando{transform:none}}
`;
