// Forja · documentos legales: un solo lector para términos, privacidad, normas, cookies y pagos, y para la página documentos/.
// Qué versiones existen lo dice la base (estadoLegal(): solo las avisadas por correo a todas las cuentas) y el texto está en
// legal/<versión>/<documento>.json (secciones con id, título y html; resumen «En simple»; «cambios» = qué cambia en la versión).
// Cada sección se marca «Nueva», «Cambió» o «Sin cambios» comparándola, por su id, con la versión base; «Comparar» la muestra
// al lado de la anterior con los cambios resaltados (una columna con los cambios en el texto en pantallas angostas).
// Las versiones sin avisar (borradores) solo las abre Moderación, con una franja que lo dice.
import { sb, nav, navApp, u, esc, estadoLegal, fechaDia, versionDe, proximaLegal, DOCUMENTOS, NOMBRE_DOC } from "./forja.js";

const CORTO = { terminos: "Términos", privacidad: "Privacidad", normas: "Normas", cookies: "Cookies", pagos: "Pagos" };
const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];
const fechaCorta = (f) => { const [a, m, d] = String(f).split("-").map(Number); return d + " " + MES[m - 1] + " " + a; };
// Deja a la vista la parada elegida del riel (en el celular el riel se desliza).
const centrarRiel = (app) => { const p = app.querySelector('.l-parada[aria-pressed="true"]'), r = app.querySelector(".l-riel"); if (p && r) r.scrollLeft = p.offsetLeft - (r.clientWidth - p.offsetWidth) / 2; };
const MARCA = { nueva: "Nueva", cambio: "Cambió", igual: "Sin cambios", quitada: "Se quitó" };
let MANIFIESTO = null;
const cacheDoc = new Map();

export const manifiesto = () => (MANIFIESTO ||= fetch(u("legal/versiones.json")).then((r) => r.json()));
export function documento(version, doc) {
  const k = version + "/" + doc;
  if (!cacheDoc.has(k)) cacheDoc.set(k, fetch(u("legal/" + encodeURIComponent(version) + "/" + doc + ".json")).then((r) => (r.ok ? r.json() : null)).catch(() => null));
  return cacheDoc.get(k);
}

// Versiones que esta persona puede ver: las avisadas (de la base) más, para Moderación, los borradores del repositorio.
export async function versiones() {
  const [E, M] = await Promise.all([estadoLegal(), manifiesto()]);
  const { data: s } = await sb.auth.getSession();
  let admin = false;
  if (s.session) { const { data } = await sb.rpc("soy_admin"); admin = data === true; }
  const avisadas = new Map((E.versiones || []).map((v) => [v.version, v]));
  const lista = M.versiones.map((m) => {
    const v = avisadas.get(m.id);
    if (v) return { ...m, ...v, id: m.id };
    return admin ? { ...m, version: m.id, estado: "borrador" } : null;
  }).filter(Boolean);
  // Orden: por fecha en que rige (los borradores al final).
  lista.sort((a, b) => (a.rige || "9999").localeCompare(b.rige || "9999"));
  return { E, M, lista, admin };
}
// Contra qué versión se compara: la que regía al avisarla (base) o, si no, la anterior que sí rigió.
export function baseDe(lista, v, E) {
  if (v.base && lista.some((x) => x.id === v.base)) return v.base;
  if (v.estado === "borrador") return E.vigente;
  const antes = lista.filter((x) => x.id !== v.id && x.rige && v.rige && x.rige <= v.rige && x.estado !== "reemplazada" && x.estado !== "borrador");
  return antes.length ? antes[antes.length - 1].id : null;
}

/* ---------- comparación ---------- */
const texto = (html) => { const d = document.createElement("div"); d.innerHTML = html || ""; return d; };
// Bloques de una sección (párrafos y subtítulos) como texto plano, para comparar.
function bloques(html) {
  const d = texto(html);
  const els = [...d.children].length ? [...d.children] : [d];
  return els.map((e) => ({ h: /^H\d$/.test(e.tagName), t: e.textContent.replace(/\s+/g, " ").trim() })).filter((b) => b.t);
}
const plano = (html) => bloques(html).map((b) => b.t).join("\n");
export function marcaDe(nueva, vieja) {
  if (!vieja) return "nueva";
  return plano(nueva.html) === plano(vieja.html) && nueva.t.replace(/^\d+\.\s*/, "") === vieja.t.replace(/^\d+\.\s*/, "") ? "igual" : "cambio";
}
export function marcas(doc, base) {
  const prev = new Map(((base && base.secciones) || []).map((s) => [s.id, s]));
  const m = {}; (doc.secciones || []).forEach((s) => { m[s.id] = marcaDe(s, prev.get(s.id)); });
  const quitadas = ((base && base.secciones) || []).filter((s) => !(doc.secciones || []).some((x) => x.id === s.id));
  return { m, quitadas };
}
// Palabras y saltos de párrafo («\n»); el diff se hace por palabras (LCS), suficiente para secciones de pocos cientos de palabras.
function fichas(bs) { const out = []; bs.forEach((b, i) => { if (i) out.push("\n"); out.push(...b.t.split(/\s+/).filter(Boolean)); }); return out; }
function diff(a, b) {
  const n = a.length, m = b.length;
  if (n * m > 3e6) return [["-", a], ["+", b]];
  const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const ops = []; let i = 0, j = 0;
  const push = (t, w) => { const o = ops[ops.length - 1]; if (o && o[0] === t) o[1].push(w); else ops.push([t, [w]]); };
  while (i < n && j < m) { if (a[i] === b[j]) { push("=", a[i]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) push("-", a[i++]); else push("+", b[j++]); }
  while (i < n) push("-", a[i++]); while (j < m) push("+", b[j++]);
  // Una palabra suelta igual entre dos cambios se suma a ellos, para que el resaltado se lea de corrido.
  for (let k = 1; k < ops.length - 1; k++) if (ops[k][0] === "=" && ops[k][1].length === 1 && ops[k][1][0] !== "\n" && ops[k - 1][0] !== "=" && ops[k + 1][0] !== "=") {
    const w = ops[k][1][0];
    if (ops[k - 1][0] !== ops[k + 1][0]) { ops[k - 1][1].push(w); ops[k + 1][1].unshift(w); ops[k][1] = []; }
  }
  return ops.filter((o) => o[1].length);
}
// Pinta el resultado: lado "antes" (= y -), "ahora" (= y +) o "juntos" (todo). Los «\n» cortan párrafos.
function pintarDiff(ops, lado) {
  const pars = [[]];
  for (const [t, ws] of ops) {
    if ((lado === "antes" && t === "+") || (lado === "ahora" && t === "-")) continue;
    for (const w of ws) { if (w === "\n") pars.push([]); else pars[pars.length - 1].push([t, w]); }
  }
  return pars.filter((p) => p.length).map((p) => {
    let html = "", run = null, buf = [];
    const cierra = () => { if (!buf.length) return; const tx = esc(buf.join(" ")); html += (html ? " " : "") + (run === "+" ? "<ins>" + tx + "</ins>" : run === "-" ? "<del>" + tx + "</del>" : tx); buf = []; };
    for (const [t, w] of p) { if (t !== run) { cierra(); run = t; } buf.push(w); }
    cierra();
    return "<p>" + html + "</p>";
  }).join("");
}

/* ---------- página de un documento ---------- */
const enlaces = (html, version, vigente) => html.replace(/href="~([a-z]+\/?)([^"]*)"/g, (m, ruta, resto) => {
  const doc = ruta.replace(/\/$/, "");
  const otra = DOCUMENTOS.includes(doc) && version && version !== vigente;
  const [q, h] = resto.split("#");
  return 'href="' + u(ruta + (otra ? "?v=" + encodeURIComponent(version) : q || "") + (h !== undefined ? "#" + h : "")) + '"';
});

function estadoTexto(v, E, lista) {
  if (v.estado === "borrador") return "Borrador sin avisar: solo lo ve Moderación. No rige ni se publica hasta que se avise a todas las cuentas.";
  if (v.estado === "vigente") return "Vigente desde el " + fechaDia(v.rige) + ".";
  if (v.estado === "proxima") return "Rige desde el " + fechaDia(v.rige) + ". Se avisó el " + fechaDia(v.avisada) + "; hasta entonces sigue la versión del " + fechaDia((versionDe(E, E.vigente) || {}).rige || E.vigente) + ".";
  if (v.estado === "reemplazada") return "Se anunció para el " + fechaDia(v.rige) + ", pero no llegó a regir: la reemplazó una versión posterior.";
  const sig = lista.find((x) => x.rige > v.rige && (x.estado === "vigente" || x.estado === "anterior"));
  return "Versión anterior: rigió desde el " + fechaDia(v.rige) + (sig ? " hasta el " + fechaDia(sig.rige) : "") + ".";
}

export async function legal(id) {
  const { data } = await sb.auth.getSession();
  if (data.session) navApp(null); else nav(id);
  const app = document.getElementById("l-app");
  let V;
  try { V = await versiones(); } catch (e) { app.innerHTML = '<p class="l-error">No se pudo cargar el documento. Revisa tu conexión y recarga la página.</p>'; return; }
  const { E, lista } = V;
  const q = new URLSearchParams(location.search);
  const conDoc = lista.filter((x) => x.docs.includes(id));
  let sel = conDoc.find((x) => x.id === q.get("v")) || conDoc.find((x) => x.id === E.vigente) || conDoc.filter((x) => x.estado === "proxima").pop() || conDoc[conDoc.length - 1];
  if (!sel) { app.innerHTML = '<h1>' + esc(NOMBRE_DOC[id]) + '</h1><p class="l-error">Este documento todavía no se publica.' + (q.get("v") ? " La versión pedida no existe o aún no se avisa." : "") + ' <a href="' + u("documentos/") + '">Ver los documentos de Forja</a></p>'; return; }
  const est = { modo: q.get("comparar") === "1" || location.hash === "#comparar" ? "comparar" : "leer", solo: false, base: null, lado: {} };
  if (q.get("v") && !conDoc.some((x) => x.id === q.get("v"))) est.aviso = "La versión pedida no está publicada. Se muestra la vigente.";

  async function pintar() {
    const v = sel, baseId = est.base || baseDe(lista, v, E);
    const tieneBase = baseId && (lista.find((x) => x.id === baseId) || { docs: [] }).docs.includes(id);
    const [doc, base] = await Promise.all([documento(v.id, id), tieneBase ? documento(baseId, id) : null]);
    if (!doc) { app.innerHTML = '<p class="l-error">No se encontró el texto de esta versión.</p>'; return; }
    const bv = baseId ? lista.find((x) => x.id === baseId) : null;
    const { m, quitadas } = marcas(doc, base);
    const cuenta = { nueva: 0, cambio: 0, igual: 0 }; Object.values(m).forEach((k) => cuenta[k]++);
    const hayBase = !!base, prox = lista.find((x) => x.estado === "proxima"), viendoVigente = v.id === E.vigente;
    const fechaV = (x) => (x && x.rige ? fechaDia(x.rige) : "borrador");
    const comparar = est.modo === "comparar" && hayBase;
    document.title = NOMBRE_DOC[id] + " · Forja";

    // Riel de versiones: una línea con una parada por versión; se toca para leerla.
    const riel = conDoc.length > 1 ? '<div class="l-riel" role="group" aria-label="Versiones">' + conDoc.map((x) =>
      '<button type="button" class="l-parada e-' + x.estado + '" data-v="' + esc(x.id) + '" aria-pressed="' + (x.id === v.id) + '"><i></i><b>' + esc(x.rige ? fechaCorta(x.rige) : "Borrador") + "</b><small>" +
      ({ vigente: "Vigente", proxima: "Próxima", anterior: "Anterior", reemplazada: "No rigió", borrador: "Sin avisar" })[x.estado] + "</small></button>").join("") + "</div>" : "";

    const indice = doc.secciones.map((s) => '<a href="#' + esc(s.id) + '" class="k-' + (hayBase ? m[s.id] : "igual") + '"><span>' + esc(s.t) + "</span>" + (hayBase && m[s.id] !== "igual" ? "<em>" + MARCA[m[s.id]] + "</em>" : "") + "</a>").join("") +
      (comparar ? quitadas.map((s) => '<a href="#q-' + esc(s.id) + '" class="k-quitada"><span>' + esc(s.t) + "</span><em>Se quitó</em></a>").join("") : "");

    const seccion = (s) => {
      const k = hayBase ? m[s.id] : "igual", vieja = base && base.secciones.find((x) => x.id === s.id);
      const oculta = est.solo && k === "igual";
      let cuerpo;
      if (oculta) cuerpo = '<p class="l-plegada">Esta sección sigue igual. <button type="button" class="l-mini" data-abrir="' + esc(s.id) + '">Leerla</button></p>';
      else if (comparar && k === "cambio") {
        const ops = diff(fichas(bloques(vieja.html)), fichas(bloques(s.html)));
        // Si casi todo cambió, las marcas estorban: en una columna se parte mostrando el texto nuevo.
        const igual = ops.filter((o) => o[0] === "=").reduce((n, o) => n + o[1].length, 0), total = ops.filter((o) => o[0] !== "-").reduce((n, o) => n + o[1].length, 0);
        const reescrita = igual < total * 0.45;
        const lado = est.lado[s.id] || (reescrita ? "ahora" : "juntos");
        cuerpo = '<div class="l-dif" data-lado="' + lado + '">' +
          '<div class="l-dif-sel" role="group" aria-label="Cómo ver los cambios">' + [["juntos", "Cambios marcados"], ["antes", "Antes"], ["ahora", "Ahora"]].map(([k2, t]) => '<button type="button" data-lado="' + k2 + '" data-sec="' + esc(s.id) + '" aria-pressed="' + (lado === k2) + '">' + t + "</button>").join("") + "</div>" +
          (reescrita ? '<p class="l-reesc">Esta sección se reescribió casi entera. Toca «Antes» para leer cómo era o «Cambios marcados» para ver cada palabra.</p>' : "") +
          '<div class="l-col l-antes"><span class="l-col-t">Antes · ' + esc(fechaV(bv)) + "</span>" + pintarDiff(ops, "antes") + "</div>" +
          '<div class="l-col l-ahora"><span class="l-col-t">Ahora · ' + esc(fechaV(v)) + "</span>" + pintarDiff(ops, "ahora") + "</div>" +
          '<div class="l-col l-juntos">' + pintarDiff(ops, "juntos") + "</div></div>";
      } else if (comparar && k === "nueva") cuerpo = '<div class="l-nuevo">' + enlaces(s.html, v.id, E.vigente) + "</div>";
      else cuerpo = enlaces(s.html, v.id, E.vigente);
      return '<section id="' + esc(s.id) + '" class="k-' + k + (oculta ? " plegada" : "") + '"><h2>' + esc(s.t) + (hayBase ? ' <span class="l-marca m-' + k + '">' + MARCA[k] + "</span>" : "") + "</h2>" + cuerpo + "</section>";
    };

    app.innerHTML =
      '<span class="l-k">Documentos de Forja</span>' +
      '<nav class="l-docs" aria-label="Documentos">' + DOCUMENTOS.map((d) => '<a href="' + u(d + "/") + (v.id !== E.vigente && v.docs.includes(d) ? "?v=" + encodeURIComponent(v.id) : "") + '"' + (d === id ? ' aria-current="page"' : "") + ">" + CORTO[d] + "</a>").join("") + '<a href="' + u("documentos/") + '" class="l-todos">Qué cambia</a></nav>' +
      "<h1>" + esc(doc.titulo) + "</h1>" +
      '<p class="l-ver">' + esc(estadoTexto(v, E, lista)) + "</p>" +
      (est.aviso ? '<p class="l-ver l-alerta">' + esc(est.aviso) + "</p>" : "") +
      (v.estado === "borrador" ? '<p class="l-borrador">Borrador · solo Moderación lo ve</p>' : "") +
      riel +
      (viendoVigente && prox && prox.docs && prox.docs.includes(id) ? '<div class="l-prox"><span><b>Este documento cambia el ' + esc(fechaDia(prox.rige)) + ".</b> " + esc(prox.resumen || "") + '</span><button type="button" class="l-btn" data-v="' + esc(prox.id) + '" data-comparar="1">Ver qué cambia</button></div>' : "") +
      '<div class="l-simple"><b>En simple</b><p>' + esc(doc.simple) + "</p></div>" +
      (hayBase && doc.cambios ? '<div class="l-cambios"><b>Qué cambia respecto de la versión del ' + esc(fechaV(bv)) + "</b><p>" + enlaces(doc.cambios, v.id, E.vigente) + "</p>" +
        '<div class="l-cuenta">' + [["nueva", "nuevas"], ["cambio", "cambiaron"], ["igual", "sin cambios"]].map(([k, t]) => '<span class="m-' + k + '"><b>' + cuenta[k] + "</b> " + (cuenta[k] === 1 ? t.replace(/s( |$)/, "$1").replace("cambiaron", "cambió") : t) + "</span>").join("") + (quitadas.length ? '<span class="m-quitada"><b>' + quitadas.length + "</b> " + (quitadas.length === 1 ? "se quitó" : "se quitaron") + "</span>" : "") + "</div></div>" : "") +
      (!hayBase && v.id !== (conDoc[0] || {}).id ? '<div class="l-cambios"><b>Documento nuevo</b><p>Este documento no existía en la versión anterior.</p></div>' : "") +
      (hayBase ? '<div class="l-barra"><div class="l-seg" role="group" aria-label="Cómo leer">' +
        '<button type="button" data-modo="leer" aria-pressed="' + (est.modo === "leer") + '">Leer</button><button type="button" data-modo="comparar" aria-pressed="' + (est.modo === "comparar") + '">Comparar<span class="l-larga"> con la del ' + esc(fechaV(bv)) + "</span></button></div>" +
        '<label class="l-solo"><input type="checkbox" id="l-solo"' + (est.solo ? " checked" : "") + "> Solo lo que cambió</label>" +
        (lista.filter((x) => x.id !== v.id && x.docs.includes(id) && x.estado !== "borrador").length > 1 ? '<label class="l-contra">Comparar con <select id="l-base">' + lista.filter((x) => x.id !== v.id && x.docs.includes(id) && x.estado !== "borrador").map((x) => '<option value="' + esc(x.id) + '"' + (x.id === baseId ? " selected" : "") + ">" + esc(fechaV(x)) + "</option>").join("") + "</select></label>" : "") + "</div>" : "") +
      '<div class="l-grid' + (comparar ? " comparando" : "") + '"><details class="l-indice" open><summary>Índice</summary><nav class="l-toc" aria-label="Índice">' + indice + "</nav></details>" +
      '<article class="l-texto" id="l-texto">' + doc.secciones.map(seccion).join("") +
      (comparar && quitadas.length ? quitadas.map((s) => '<section id="q-' + esc(s.id) + '" class="k-quitada"><h2>' + esc(s.t) + ' <span class="l-marca m-quitada">Se quitó</span></h2><div class="l-quitado">' + enlaces(s.html, bv.id, E.vigente) + "</div></section>").join("") : "") +
      "</article></div>" +
      '<div class="l-pie">¿Dudas sobre este documento? Escríbenos desde <a href="' + u("cuenta/") + '">Mi cuenta → Escríbenos</a> o a <a href="mailto:forja@digitalmonster.cl">forja@digitalmonster.cl</a>. Guardamos todas las versiones: puedes leerlas y compararlas arriba.</div>';

    // En el celular el índice parte cerrado.
    centrarRiel(app);
    const angosto = matchMedia("(max-width:820px)").matches || (comparar && matchMedia("(max-width:1180px)").matches);
    if (angosto) app.querySelector(".l-indice").open = false;
    app.querySelectorAll("[data-v]").forEach((b) => b.onclick = () => {
      sel = lista.find((x) => x.id === b.dataset.v); est.base = null; est.lado = {};
      if (b.dataset.comparar) est.modo = "comparar";
      const url = new URL(location.href); if (sel.id === E.vigente) url.searchParams.delete("v"); else url.searchParams.set("v", sel.id);
      if (est.modo === "comparar") url.searchParams.set("comparar", "1"); else url.searchParams.delete("comparar");
      history.replaceState(null, "", url); pintar().then(() => b.dataset.comparar && app.querySelector(".l-barra")?.scrollIntoView({ behavior: "smooth" }));
    });
    app.querySelectorAll("[data-modo]").forEach((b) => b.onclick = () => {
      est.modo = b.dataset.modo; const url = new URL(location.href);
      if (est.modo === "comparar") url.searchParams.set("comparar", "1"); else url.searchParams.delete("comparar");
      history.replaceState(null, "", url); const y = scrollY; pintar().then(() => scrollTo(0, y));
    });
    const so = document.getElementById("l-solo"); if (so) so.onchange = () => { est.solo = so.checked; const y = scrollY; pintar().then(() => scrollTo(0, y)); };
    const bs = document.getElementById("l-base"); if (bs) bs.onchange = () => { est.base = bs.value; const y = scrollY; pintar().then(() => scrollTo(0, y)); };
    app.querySelectorAll("[data-abrir]").forEach((b) => b.onclick = () => { const s = doc.secciones.find((x) => x.id === b.dataset.abrir); const el = document.getElementById(s.id); el.classList.remove("plegada"); el.querySelector(".l-plegada").outerHTML = enlaces(s.html, v.id, E.vigente); });
    app.querySelectorAll("[data-lado]").forEach((b) => { if (b.tagName !== "BUTTON") return; b.onclick = () => { est.lado[b.dataset.sec] = b.dataset.lado; const box = b.closest(".l-dif"); box.dataset.lado = b.dataset.lado; box.querySelectorAll("[data-lado]").forEach((x) => x.tagName === "BUTTON" && x.setAttribute("aria-pressed", x === b)); }; });
    // El índice sigue la lectura.
    const links = [...app.querySelectorAll(".l-toc a")], secs = [...app.querySelectorAll("#l-texto section")];
    const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle("activo", a.hash === "#" + e.target.id)); }), { rootMargin: "-20% 0px -70% 0px" });
    secs.forEach((s) => obs.observe(s));
    if (angosto) links.forEach((a) => a.addEventListener("click", () => { app.querySelector(".l-indice").open = false; }));
  }
  await pintar();
  const h = location.hash.slice(1); if (h && h !== "comparar") { const el = document.getElementById(h); if (el) el.scrollIntoView(); }
}

/* ---------- documentos/: qué cambia en una versión ---------- */
// Arriba la versión (la próxima si hay; si no, la vigente; o la de ?v=), su resumen y el riel; abajo una tarjeta por documento
// con lo que cambia y una tira con una marca por sección. Tocar una tarjeta abre ese documento comparando.
export async function paginaDocumentos() {
  const { data } = await sb.auth.getSession();
  if (data.session) navApp(null); else nav("documentos");
  const app = document.getElementById("l-app");
  let V;
  try { V = await versiones(); } catch (e) { app.innerHTML = '<p class="l-error">No se pudieron cargar los documentos. Revisa tu conexión y recarga la página.</p>'; return; }
  const { E, lista } = V, q = new URLSearchParams(location.search);
  let sel = lista.find((x) => x.id === q.get("v")) || lista.find((x) => x.estado === "proxima") || lista.find((x) => x.id === E.vigente) || lista[lista.length - 1];
  async function pintar() {
    const v = sel, baseId = baseDe(lista, v, E), bv = lista.find((x) => x.id === baseId);
    const pares = await Promise.all(DOCUMENTOS.map(async (d) => {
      if (!v.docs.includes(d)) return null;
      const [doc, base] = await Promise.all([documento(v.id, d), bv && bv.docs.includes(d) ? documento(baseId, d) : null]);
      return doc ? { d, doc, base, ...marcas(doc, base) } : null;
    }));
    const titulo = v.estado === "proxima" ? "Los documentos de Forja cambian el " + fechaDia(v.rige) : v.estado === "vigente" ? "Documentos vigentes desde el " + fechaDia(v.rige) : v.estado === "borrador" ? "Borrador de una versión nueva" : "Versión del " + fechaDia(v.rige);
    app.innerHTML = '<span class="l-k">Documentos de Forja</span>' +
      '<nav class="l-docs" aria-label="Documentos">' + DOCUMENTOS.map((d) => '<a href="' + u(d + "/") + '">' + CORTO[d] + "</a>").join("") + '<a href="' + u("documentos/") + '" aria-current="page">Qué cambia</a></nav>' +
      "<h1>" + esc(titulo) + "</h1><p class=\"l-ver\">" + esc(estadoTexto(v, E, lista)) + "</p>" +
      (v.estado === "borrador" ? '<p class="l-borrador">Borrador · solo Moderación lo ve</p>' : "") +
      (lista.length > 1 ? '<div class="l-riel" role="group" aria-label="Versiones">' + lista.map((x) => '<button type="button" class="l-parada e-' + x.estado + '" data-v="' + esc(x.id) + '" aria-pressed="' + (x.id === v.id) + '"><i></i><b>' + esc(x.rige ? fechaCorta(x.rige) : "Borrador") + "</b><small>" + ({ vigente: "Vigente", proxima: "Próxima", anterior: "Anterior", reemplazada: "No rigió", borrador: "Sin avisar" })[x.estado] + "</small></button>").join("") + "</div>" : "") +
      (v.resumen ? '<div class="l-cambios"><b>' + (bv ? "Qué cambia respecto de la versión del " + esc(fechaDia(bv.rige)) : "Esta versión") + "</b><p>" + esc(v.resumen) + "</p></div>" : "") +
      (v.estado === "proxima" ? '<p class="l-ver">Hasta el ' + esc(fechaDia(v.rige)) + " sigue rigiendo la versión actual. Desde ese día, Forja pedirá aceptar la nueva al entrar. Si no estás de acuerdo, puedes descargar tus datos y borrar tu cuenta desde Mi cuenta.</p>" : "") +
      '<div class="d-docs">' + pares.filter(Boolean).map(({ d, doc, base, m, quitadas }) => {
        const k = Object.values(m), n = k.filter((x) => x === "nueva").length, c = k.filter((x) => x === "cambio").length, ig = k.length - n - c;
        const igual = base && !n && !c && !quitadas.length;
        const etiqueta = !bv ? k.length + " secciones" : !base ? "Documento nuevo · " + k.length + " secciones" : igual ? "Sin cambios" : [n && n + (n === 1 ? " nueva" : " nuevas"), c && c + " " + (c === 1 ? "cambió" : "cambiaron"), ig && ig + " sin cambios", quitadas.length && quitadas.length + (quitadas.length === 1 ? " se quitó" : " se quitaron")].filter(Boolean).join(" · ");
        return '<a class="d-doc' + (igual ? " d-igual" : "") + '" href="' + u(d + "/") + (v.id !== E.vigente ? "?v=" + encodeURIComponent(v.id) + (bv && !igual ? "&comparar=1" : "") : "") + '"><h2>' + esc(NOMBRE_DOC[d]) + "</h2>" +
          (bv ? '<div class="d-tira" aria-hidden="true">' + doc.secciones.map((s) => '<i class="m-' + (base ? m[s.id] : "nueva") + '" title="' + esc(s.t) + '"></i>').join("") + "</div>" : "") +
          '<span class="d-tira-l">' + esc(etiqueta) + "</span><p>" + (bv && doc.cambios ? doc.cambios.replace(/<[^>]+>/g, "") : esc(doc.simple)) + '</p><span class="d-ir">' + (bv && !igual ? "Ver los cambios →" : "Leer →") + "</span></a>";
      }).join("") + "</div>" +
      '<div class="l-pie">Guardamos todas las versiones. Toda versión nueva se avisa por correo a todas las cuentas y rige 15 días después del aviso. ¿Dudas? Escríbenos desde <a href="' + u("cuenta/") + '">Mi cuenta → Escríbenos</a> o a <a href="mailto:forja@digitalmonster.cl">forja@digitalmonster.cl</a>.</div>';
    app.querySelectorAll("[data-v]").forEach((b) => b.onclick = () => {
      sel = lista.find((x) => x.id === b.dataset.v);
      const url = new URL(location.href); url.searchParams.set("v", sel.id); history.replaceState(null, "", url); pintar();
    });
    centrarRiel(app);
  }
  await pintar();
}
