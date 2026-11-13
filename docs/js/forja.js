// Forja · base común: conexión a Supabase, sesión, navegación y utilidades.
// El repositorio es público: aquí solo va la URL y la clave publicable (pensada para el navegador).
// Lo privado de cada persona queda en Supabase, protegido por las reglas de cada tabla.
// Versión fija (probada): con "@2" una actualización del CDN podía cambiar el cliente sin aviso. Para subirla, probar antes.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/+esm";

export const SB_URL = "https://gfkiwldxxvffnkjcesws.supabase.co";
export const SB_KEY = "sb_publishable_dwtoMBdzb5V50q-tMuE1SQ_Y55x1G_j";
export const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });

// Raíz del sitio (la carpeta de index.html), sacada de la ubicación de este archivo: sirve igual en
// forja.digitalmonster.cl (antes teochub.github.io/forja/) que en cualquier otro dominio. Cada página vive en su carpeta: proyectos/, proyecto/?p=…
export const RAIZ = new URL("../", import.meta.url).href;
export const u = (ruta = "") => RAIZ + ruta;
const PUBLICO = [
  { href: u("guia/"), nombre: "Cómo funciona", id: "guia" },
  { href: u("oportunidades/"), nombre: "Oportunidades", id: "oportunidades" },
  { href: u("planes/"), nombre: "Planes", id: "planes" },
  { href: u("boletin/"), nombre: "Boletín", id: "boletin" },
];
// Explorar aparece en el menú solo cuando hay suficientes proyectos para que no se vea vacío.
export const MIN_EXPLORAR = 6;
const APP = [
  { href: u("proyectos/"), nombre: "Proyectos", id: "proyectos" },
  { href: u("semillero/"), nombre: "Semillero", id: "semillero" },
  { href: u("eventos/"), nombre: "Eventos", id: "eventos" },
  { href: u("cotizaciones/"), nombre: "Cotizaciones", id: "cotizaciones" },
  { href: u("planes/"), nombre: "Planes", id: "plan" },
];
const MENU_ICO = { proyectos: "fichas", semillero: "semilla", eventos: "calendario", cotizaciones: "moneda", plan: "chispa" };
const svg = (k) => ico(MENU_ICO[k], 22);

/* --- identidad «Grafito con color propio»: marca, íconos y piezas compartidas (estilos en forja.css) --- */
// Íconos de trazo del taller (viewBox 24, puntas redondas). Las cinco partes: Ruta = regla, Idea = chispa, Crear = martillo, Probar = lupa, Mostrar = vitrina.
export const ICONOS = {
  regla: "M2.5 8.5h19v7h-19z M6 8.5v3 M9.5 8.5v4 M13 8.5v3 M16.5 8.5v4", chispa: "M12 3 Q13.2 10.8 21 12 Q13.2 13.2 12 21 Q10.8 13.2 3 12 Q10.8 10.8 12 3 Z",
  martillo: "M9 4h9v5H9z M9 6.5H5.5 M13.5 9v11", lupa: "M10.5 4.5a6 6 0 1 0 0 12a6 6 0 1 0 0-12z M15 15l5 5", vitrina: "M4 10h16v10H4z M3 10l2-6h14l2 6 M9.5 20v-5h5v5",
  pluma: "M4 20l4-1 11-11-3-3L5 16z M14 7l3 3", fichas: "M8 3.5h11v14H8z M5 6.5v14h11", pizarra: "M3 4h18v12H3z M7.5 8.5a1.5 1.5 0 1 0 0 .01 M16.5 11.5a1.5 1.5 0 1 0 0 .01 M9 9l6 2.5 M12 16v4",
  mapa: "M12 3l7.5 4.3v9.4L12 21l-7.5-4.3V7.3z M12 10.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3", curva: "M3 18c3.5 0 4.5-11 9-11s5.5 11 9 11 M3 21h18",
  brujula: "M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16z M15 9l-1.8 4.2L9 15l1.8-4.2z", chinche: "M9 3h6l-1 5 3 3H7l3-3z M12 11v10",
  ojo: "M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z M12 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5", cuaderno: "M6 3h11a2 2 0 0 1 2 2v16H8a2 2 0 0 1-2-2z M6 17.5a2 2 0 0 1 2-2h11",
  moneda: "M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16z M14.5 9.5c0-1.2-1.1-1.8-2.5-1.8s-2.5.7-2.5 1.8 1.1 1.6 2.5 1.9 2.5.8 2.5 2-1.1 1.9-2.5 1.9-2.5-.6-2.5-1.9 M12 6.5v11",
  calendario: "M4 6h16v14H4z M4 10h16 M8 3v5 M16 3v5", flecha: "M4 12h15 M13 6l6 6-6 6", persona: "M12 4a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7z M5 20c.8-4 3.6-6 7-6s6.2 2 7 6",
  semilla: "M12 20v-6 M12 14c-4 0-6-2.5-6-6 3.5 0 6 2 6 6z M12 14c0-3 2-5.5 6-5.5 0 3.5-2.5 5.5-6 5.5z", desarrollo: "M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16z M12 4v16",
  pausa: "M9 6v12 M15 6v12", listo: "M5 12.5l4.5 4.5L19 7.5", archivado: "M4 5h16v4H4z M5.5 9v10h13V9 M10 13h4",
};
// Ícono de cada parte del proyecto y de cada herramienta (la mesa de boletos y la guía).
export const ICONO_DE = { ruta: "regla", idea: "chispa", crear: "martillo", probar: "lupa", mostrar: "vitrina",
  mapa: "mapa", estructura: "curva", brujula: "brujula", referentes: "chinche", taller: "pluma", fichas: "fichas", pizarra: "pizarra",
  lectores: "ojo", bitacora: "cuaderno", vitrina: "vitrina", costos: "moneda", oportunidades: "calendario" };
export const ico = (k, tam = 20) => '<svg class="fx-ico" viewBox="0 0 24 24" width="' + tam + '" height="' + tam + '" aria-hidden="true"><path d="' + (ICONOS[k] || ICONOS[ICONO_DE[k]] || ICONOS.chispa) + '"/></svg>';
const CHISPA = "M0 -6 Q0.9 -0.9 6 0 Q0.9 0.9 0 6 Q-0.9 0.9 -6 0 Q-0.9 -0.9 0 -6 Z";
export const chispa = (tam = 18) => '<svg class="fx-chispa" viewBox="-7 -7 14 14" width="' + tam + '" height="' + tam + '" aria-hidden="true"><path d="' + CHISPA + '"/></svg>';
const F_FORMA = "M19 13h28v10H30v8h14v10H30v11H19z", F_Y = [17, 22, 27, 32, 37, 42, 47];
// La marca: la F-regla. Sus siete marcas son las siete etapas de la Ruta; la chispa al pie es la idea que enciende todo.
export const marca = (tam = 32) => '<svg class="fx-f" viewBox="8 8 50 50" width="' + tam + '" height="' + tam + '" aria-hidden="true"><path class="p" d="' + F_FORMA + '"/>' +
  F_Y.map((y, i) => '<line class="m" x1="19" y1="' + y + '" x2="' + (19 + (i % 3 ? 3.5 : 6)) + '" y2="' + y + '"/>').join("") + '<path class="ch" transform="translate(50 47) scale(1.05)" d="' + CHISPA + '"/></svg>';
// La F de avance: lo hecho se marca largo y de color, la etapa actual cruza el palo con la chispa al lado, lo que falta queda corto.
// etapa = índice 0–6, o -1 si el proyecto todavía no marca etapa.
export const fAvance = (etapa, tam = 56, etiqueta) => '<svg class="fx-f" viewBox="2 8 56 50" width="' + tam + '" height="' + tam + '"' + (etiqueta ? ' role="img" aria-label="' + esc(etiqueta) + '"' : ' aria-hidden="true"') + '><path class="p" d="' + F_FORMA + '"/>' +
  F_Y.map((y, i) => { const act = i === etapa, hecho = i < etapa; return '<line class="m' + (act || hecho ? " on" : "") + '" x1="19" y1="' + y + '" x2="' + (19 + (act ? 11 : hecho ? 7 : 3)) + '" y2="' + y + '"' + (act ? ' style="stroke-width:2.4"' : "") + "/>"; }).join("") +
  (etapa >= 0 ? '<path class="ch" transform="translate(12 ' + F_Y[etapa] + ')" d="' + CHISPA + '"/>' : "") + "</svg>";
// La regla de avance: siete marcas que se tocan. Con `botones`, cada marca es un botón (data-etapa = índice).
// nombres = los siete nombres de etapa (para leerlos en voz alta). etapa = índice o -1.
export function regla(etapa, nombres, { botones = false, chica = false, pie = true, etiqueta = "Etapas de la Ruta" } = {}) {
  const pct = etapa < 0 ? 0 : ((etapa + 0.5) / 7) * 100, tag = botones ? "button" : "span";
  return '<div class="fx-regla' + (chica ? " chica" : "") + '"><div class="fx-regla-r"' + (botones ? ' role="group"' : ' role="img"') + ' aria-label="' + esc(etiqueta) + (botones || etapa < 0 ? "" : ": etapa " + (etapa + 1) + " de 7, " + esc(nombres[etapa] || "")) + '" style="--pct:' + pct.toFixed(1) + '%">' +
    nombres.map((n, i) => "<" + tag + (botones ? ' type="button" data-etapa="' + i + '" aria-pressed="' + (i === etapa) + '" aria-label="' + (i + 1) + ": " + esc(n) + '"' : ' aria-hidden="true"') + ' class="' + (i === etapa ? "aqui" : i < etapa ? "ya" : "") + '">' + chispa(18) + "<i></i><span>" + (i + 1) + "</span></" + tag + ">").join("") +
    "</div>" + (pie ? '<div class="fx-regla-pie"><span>Primera chispa</span><span>Listo para mostrar</span></div>' : "") + "</div>";
}
// Etiqueta colgante: la categoría del proyecto.
export const etiqueta = (tipo, nombre) => '<span class="fx-etq" style="--tc:var(--t-' + esc(tipo || "otro") + ')">' + esc(nombre) + "</span>";
// Boleto numerado: una herramienta con su ícono.
export const boleto = (n, k, nombre) => '<span class="fx-boleto">' + ico(k, 16) + "N.º " + String(n).padStart(2, "0") + " · " + esc(nombre) + "</span>";
// El color de Forja lo pone el proyecto: la chispa toma el color de su categoría. Fuera de un proyecto, el del último que se abrió.
export function colorDe(tipo) {
  const t = /^[a-z]+$/.test(tipo || "") ? tipo : "historia";
  document.documentElement.style.setProperty("--cat", "var(--t-" + t + ")");
  try { localStorage.setItem("forja-ultimo-tipo", t); } catch (e) {}
}
try { const t = localStorage.getItem("forja-ultimo-tipo"); if (/^[a-z]+$/.test(t || "")) document.documentElement.style.setProperty("--cat", "var(--t-" + t + ")"); } catch (e) {}

export const $ = (id) => document.getElementById(id);
export function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
let tt;
export function toast(m) {
  let el = document.querySelector(".fx-toast");
  if (!el) { el = document.createElement("div"); el.className = "fx-toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
  el.textContent = m; el.hidden = false; clearTimeout(tt); tt = setTimeout(() => { el.hidden = true; }, 2800);
}
export function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
export function fecha(iso) { const d = new Date(iso); return d.getDate() + " " + MES[d.getMonth()] + " " + d.getFullYear(); }
export function hace(iso) {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 60) return "recién";
  if (s < 3600) return "hace " + Math.round(s / 60) + " min";
  if (s < 86400) return "hace " + Math.round(s / 3600) + " h";
  if (s < 86400 * 7) { const d = Math.round(s / 86400); return d === 1 ? "ayer" : "hace " + d + " días"; }
  return fecha(iso);
}

/* --- navegación --- */
// Sitio público: lo que ve cualquiera, con o sin cuenta.
export function nav(actual) {
  const el = document.querySelector("[data-forja-nav]");
  if (!el) return;
  el.className = "fx-nav";
  el.innerHTML =
    '<a class="fx-logo" href="' + u() + '" aria-label="forja, inicio">' + marca(32) + "<span>forja</span></a><span class=\"fx-mods\">" +
    PUBLICO.map((m) => '<a href="' + m.href + '"' + (m.id === actual ? ' aria-current="page"' : "") + ">" + m.nombre + "</a>").join("") +
    '</span><span class="fx-user" id="fx-user"><a class="fx-entrar" href="' + u("entrar/") + '">Entrar</a></span>';
  sb.from("vitrinas_publicadas").select("slug", { count: "exact", head: true }).eq("en_explorar", true).then(({ count }) => {
    if ((count || 0) >= MIN_EXPLORAR || actual === "explorar") el.querySelector(".fx-mods > a").insertAdjacentHTML("afterend", '<a href="' + u("explorar/") + '"' + (actual === "explorar" ? ' aria-current="page"' : "") + ">Explorar</a>");
  });
  sb.auth.getSession().then(({ data }) => { if (data.session && $("fx-user")) $("fx-user").innerHTML = '<a class="fx-entrar lleno" href="' + u("proyectos/") + '">Ir a mi forja</a>'; });
}
// Dentro de la cuenta: menú propio (arriba en pantallas grandes, abajo en el celular).
export function navApp(actual) {
  const el = document.querySelector("[data-forja-nav]");
  if (!el) return;
  el.className = "fx-app";
  el.innerHTML =
    '<a class="fx-logo" href="' + u("proyectos/") + '" aria-label="forja, mis proyectos">' + marca(32) + '<span>forja</span><span class="fx-esp" id="fx-esp" hidden></span></a>' +
    '<nav class="fx-menu" aria-label="Mi forja">' + APP.map((m) => '<a href="' + m.href + '" class="m-' + m.id + '"' + (m.id === actual ? ' aria-current="page"' : "") + ">" + svg(m.id) + "<span>" + m.nombre + "</span></a>").join("") + "</nav>" +
    '<button type="button" class="fx-ayuda" id="fx-ayuda" aria-label="Ayuda: cómo funciona esta página" title="Ayuda">?</button>' +
    '<details class="fx-cuenta" id="fx-cuenta"><summary aria-label="Mi cuenta"><span class="fx-ini" id="fx-ini">·</span></summary><div class="fx-pop">' +
    '<span class="fx-mail" id="fx-mail2"></span><span class="fx-planb" id="fx-planb">Plan gratis</span><div class="fx-espacios" id="fx-espacios" hidden></div>' +
    '<a href="' + u("cuenta/") + '">Mi cuenta <span class="fx-nav-n" id="fx-avisos-n" hidden></span></a><a href="' + u("admin/") + '" id="fx-admin" hidden>Moderación</a>' +
    '<a href="' + u("guia/") + '">Guía de Forja</a><a href="' + u("boletin/") + '">Boletín de Forja</a><button type="button" class="fx-link" id="fx-pistas">Volver a ver las pistas</button><a href="' + u() + '">Ver el sitio público</a><a href="' + u("oportunidades/") + '">Calendario de oportunidades</a><span class="fx-legal"><a href="' + u("terminos/") + '">Términos</a> · <a href="' + u("privacidad/") + '">Privacidad</a> · <a href="' + u("normas/") + '">Normas</a> · <a href="' + u("documentos/") + '">Todos los documentos</a></span><button type="button" class="fx-link" id="fx-salir">Cerrar sesión</button></div></details>';
  document.body.classList.add("fx-con-app");
  sb.auth.getSession().then(async ({ data }) => {
    const ses = data.session; if (!ses) return;
    $("fx-ini").textContent = ses.user.email.slice(0, 1).toUpperCase();
    $("fx-mail2").textContent = ses.user.email;
    const [lista, act] = await Promise.all([espacios(), espacioActual()]);
    if (lista.length > 1 && act) {
      $("fx-espacios").hidden = false;
      $("fx-espacios").innerHTML = '<span class="fx-esp-t">Trabajando en</span>' + lista.map((x) => '<button type="button" class="fx-esp-b" data-esp="' + x.id + '" aria-pressed="' + (x.id === act.id) + '"><b>' + esc(x.tipo === "personal" ? "Mi forja" : x.nombre) + "</b><small>" + (x.tipo === "personal" ? "Tus proyectos personales" : "Equipo · " + ({ dueno: "administras", editor: "editas", lector: "puedes ver" })[x.rol]) + "</small></button>").join("") +
        (act.tipo === "equipo" ? '<a href="' + u("equipo/") + '">Personas del equipo</a>' : "");
      $("fx-espacios").querySelectorAll("[data-esp]").forEach((b) => b.onclick = () => { if (b.dataset.esp !== act.id) cambiarEspacio(b.dataset.esp); else $("fx-cuenta").open = false; });
      if (act.tipo === "equipo") { $("fx-esp").hidden = false; $("fx-esp").textContent = act.nombre; }
    }
    const pl = await plan();
    $("fx-planb").textContent = pl.nombre;
    $("fx-planb").classList.toggle("mas", pl.mas);
    // avisos sin leer (la moderación explica sus decisiones aquí) y acceso a moderación
    // Si la cuenta modera se recuerda en esta pestaña (sessionStorage): no hace falta preguntarlo en cada página.
    const llaveAdm = "forja-admin-" + ses.user.id;
    let adm = null; try { adm = sessionStorage.getItem(llaveAdm); } catch (e) {}
    const [{ count }, r] = await Promise.all([sb.from("avisos").select("id", { count: "exact", head: true }).eq("leido", false), adm === null ? sb.rpc("soy_admin") : null]);
    if (r && !r.error) { adm = r.data === true ? "1" : "0"; try { sessionStorage.setItem(llaveAdm, adm); } catch (e) {} }
    if (count) { $("fx-avisos-n").textContent = count; $("fx-avisos-n").hidden = false; $("fx-ini").insertAdjacentHTML("afterend", '<span class="fx-punto" title="Tienes avisos nuevos"></span>'); }
    if (adm === "1") $("fx-admin").hidden = false;
  });
  $("fx-salir").onclick = async () => { await sb.auth.signOut(); location.href = u(); };
  // La ayuda se carga solo cuando se pide.
  $("fx-ayuda").onclick = async () => { const a = await import("./ayuda.js"); a.abrirAyuda(); };
  $("fx-pistas").onclick = async () => { const a = await import("./ayuda.js"); a.reiniciarPistas(); toast("Las pistas y los primeros pasos volverán a aparecer."); $("fx-cuenta").open = false; setTimeout(() => location.reload(), 900); };
  document.addEventListener("click", (e) => { const c = $("fx-cuenta"); if (c && c.open && !c.contains(e.target)) c.open = false; });
}

/* --- plan y límites (los mismos que aplica la base de datos en privado.limite y privado.tope) --- */
export const LIMITES = { proyectos: 3, palabras: 20000, referentes: 30, pizarras: 1, tarjetas: 20, ideas: 50, analisis: 3, colecciones: 2, fichas: 60 };
// Topes que cambian por plan (privado.tope): null = sin límite. «lectores» = personas por ronda de Lectores beta.
export const TOPES = {
  libre: { proyectos: 3, invitados: 1, lectores: 3, ideas: 50, colecciones: 2, fichas: 60 },
  mas: { proyectos: 15, invitados: 5, lectores: 15, ideas: 500 },
  estudio: { proyectos: null, invitados: 15, lectores: 40, ideas: null },
};
export const NOMBRE_PLAN = { libre: "Plan gratis", mas: "Forja Más", estudio: "Forja Estudio" };
// tope({plan} o {mas}, "proyectos") → número, o null si no hay límite.
export const tope = (pl, clave) => { const k = (pl && pl.plan) || (pl && pl.mas ? "mas" : "libre"); return (TOPES[k] || TOPES.libre)[clave] ?? null; };
export const palabras = (t) => ((t || "").trim().match(/\S+/g) || []).length;
// El plan del espacio elegido sale de mis_espacios (ya cargado para el menú): no hace falta otra consulta.
export async function plan() {
  const e = await espacioActual();
  const k = e && (e.plan || (e.mas ? "mas" : "libre")) || "libre";
  return { mas: k !== "libre", plan: k, nombre: NOMBRE_PLAN[k], hasta: (e && e.hasta) || null };
}
// Puede editarse si no hay más proyectos en curso que el tope del plan; en el plan gratis, además, si no está archivado.
export const editable = (p, activos, pl) => { const t = tope(pl, "proyectos"); return t === null || (activos <= t && (pl.mas || p.estado !== "archivado")); };
// «3 gratis, 15 con Forja Más, sin límite con Forja Estudio»: sale de TOPES para que los mensajes no queden desfasados.
const fmt = (n) => n.toLocaleString("es-CL");
export const porPlan = (clave) => [["libre", "gratis"], ["mas", "con Forja Más"], ["estudio", "con Forja Estudio"]]
  .map(([k, t]) => (TOPES[k][clave] == null ? "sin límite" : fmt(TOPES[k][clave])) + " " + t).join(", ");
const MSG = {
  FORJA_LIMITE_PROYECTOS: "Llegaste al máximo de proyectos en curso de tu plan (" + porPlan("proyectos") + "). Archiva uno para plantar o reactivar otro.",
  FORJA_LIMITE_PALABRAS: "Llegaste al límite de " + fmt(LIMITES.palabras) + " palabras por proyecto del plan gratis. Lo que escribiste antes está guardado.",
  FORJA_LIMITE_IDEAS: "Llegaste al máximo de ideas en el Semillero de tu plan (" + porPlan("ideas") + "). Planta o borra alguna para anotar otra.",
  FORJA_LIMITE_ANALISIS: "El plan gratis permite analizar " + LIMITES.analisis + " obras por proyecto. Con Forja Más y Forja Estudio no hay límite.",
  FORJA_LIMITE_REFERENTES: "El plan gratis permite " + LIMITES.referentes + " referentes por proyecto. Quita uno para agregar otro.",
  FORJA_SOLO_LECTURA: "Este proyecto está en solo lectura: hay más proyectos en curso que los que permite tu plan, o está archivado en el plan gratis.",
  FORJA_LIMITE_PIZARRAS: "El plan gratis incluye una pizarra por proyecto.",
  FORJA_LIMITE_TARJETAS: "El plan gratis permite " + LIMITES.tarjetas + " tarjetas por pizarra. Quita una para agregar otra.",
  FORJA_SOLO_MAS: "Esto es parte de Forja Más. Lo que ya tienes se puede ver y borrar.",
  FORJA_LIMITE_COLECCIONES: "El plan gratis permite " + LIMITES.colecciones + " colecciones de fichas por proyecto. Borra una para crear otra.",
  FORJA_LIMITE_FICHAS: "El plan gratis permite " + LIMITES.fichas + " fichas por proyecto. Borra alguna para agregar otra.",
  FORJA_OTRA_CATEGORIA: "Esa colección es de otra categoría: queda para ver o borrar.",
  FORJA_SOLO_EQUIPO: "Esta herramienta todavía está en prueba con el equipo de Forja.",
  FORJA_PIZARRA_GRANDE: "La pizarra es demasiado grande para guardarla. Divídela en dos.",
  FORJA_VITRINA_GRANDE: "La vitrina es demasiado grande para publicarla. Quita algunas piezas o pizarras.",
  FORJA_NO_PERMITIDO: "No tienes permiso para hacer eso.",
  FORJA_ESPACIO_FIJO: "Una idea no se cambia de espacio así: usa «Pasar a…» en el Semillero.",
  FORJA_ULTIMO_DUENO: "El equipo necesita al menos una persona que lo administre. Primero dale ese rol a otra persona.",
  FORJA_MOVER_PUBLICADA: "Este proyecto tiene una vitrina publicada: solo quien administra el equipo puede traerlo.",
  FORJA_VITRINA_SUSPENDIDA: "Esta vitrina está suspendida por moderación. Puedes apelar desde el editor.",
  FORJA_REPORTE_SIN_CUENTA: "Para reportar necesitas entrar con tu cuenta.",
  FORJA_REPORTE_PROPIO: "No puedes reportar tu propia vitrina.",
  FORJA_REPORTE_CUENTA_NUEVA: "Tu cuenta es muy nueva para reportar: podrás hacerlo desde mañana. Así evitamos reportes automáticos.",
  FORJA_REPORTE_BLOQUEADO: "Tu cuenta ya no puede enviar reportes porque varios fueron revisados como de mala fe.",
  FORJA_REPORTE_LIMITE: "Llegaste al máximo de 5 reportes por día. Si es urgente, escríbenos desde Mi cuenta.",
  FORJA_REPORTE_REPETIDO: "Ya reportaste esta vitrina. Una persona la va a revisar.",
  FORJA_NO_ENCONTRADA: "No encontramos eso. Puede que ya no esté disponible.",
  FORJA_MENSAJES_LIMITE: "Enviaste varios mensajes hoy. Espera nuestra respuesta o escribe mañana.",
  FORJA_FALTA_MENSAJE: "Escribe el mensaje para la persona.",
  FORJA_CONFIRMAR: "Escribe BORRAR para confirmar.",
  FORJA_SEGUIR_SIN_CUENTA: "Entra a Forja para seguir proyectos.",
  FORJA_ANOTAR_SIN_CUENTA: "Entra a Forja para anotarte.",
  FORJA_ANOTAR_CERRADO: "Esta recompensa ya no recibe interesados.",
  FORJA_ANOTAR_PROPIA: "Es tu propia vitrina.",
  FORJA_ANOTAR_LIMITE: "Te anotaste en muchas recompensas hoy. Intenta mañana.",
  FORJA_INVITAR_CORREO: "Ese correo no parece válido. Revísalo.",
  FORJA_INVITAR_PROPIO: "Ese es tu propio correo.",
  FORJA_INVITAR_YA_ESTA: "Esa persona ya tiene acceso a este proyecto.",
  FORJA_INVITAR_PENDIENTE: "Ya hay una invitación pendiente para ese correo.",
  FORJA_INVITAR_LIMITE: "Llegaste al máximo de personas invitadas a este proyecto (" + porPlan("invitados") + "). Anula una invitación o quita a alguien para invitar a otra persona.",
  FORJA_INVITAR_MUCHAS: "Enviaste muchas invitaciones hoy. Intenta mañana.",
  FORJA_INVITACION_NO: "Esta invitación ya no está disponible.",
  FORJA_INVITACION_VENCIDA: "Esta invitación venció. Pídele a quien te invitó que te envíe otra.",
  FORJA_INVITACION_OTRO: "Esta invitación es para otro correo. Entra con el correo al que llegó.",
  FORJA_SEGUIR_CERRADO: "Este proyecto no tiene activado el botón para seguirlo.",
  FORJA_SEGUIR_PROPIA: "Es tu propia vitrina.",
  FORJA_SEGUIR_LIMITE: "Seguiste muchos proyectos hoy. Vuelve a intentarlo mañana.",
  FORJA_AVISO_SIN_PUBLICAR: "Publica la vitrina antes de avisar a tus seguidores.",
  FORJA_AVISO_CUENTA_NUEVA: "Las cuentas nuevas pueden avisar a sus seguidores desde su tercer día.",
  FORJA_AVISO_TEXTO: "El título va de 3 a 120 caracteres y el mensaje de 10 a 2.000.",
  FORJA_AVISO_ESPERA: "Puedes avisar a tus seguidores una vez cada 7 días.",
  FORJA_VITRINA_ENLACES: "La vitrina admite hasta 10 enlaces en «Dónde seguirlo».",
  FORJA_VITRINA_PAGO_TIER: "Un enlace de pago de una recompensa no es de un medio de pago conocido (Mercado Pago, PayPal, Flow, Ko-fi, Webpay…).",
  FORJA_RONDA_ABIERTA: "El plan gratis permite una ronda abierta a la vez. Cierra la actual para abrir otra.",
  FORJA_RONDA_VACIA: "Elige al menos una parte del Taller, un enlace o una imagen para la ronda.",
  FORJA_RONDA_GRANDE: "La ronda es demasiado grande. Elige menos partes del Taller.",
  FORJA_RONDA_PREGUNTAS: "Deja entre 1 y 12 preguntas, de 3 a 300 caracteres cada una.",
  FORJA_RONDA_FECHA: "La fecha de cierre no puede estar en el pasado.",
  FORJA_RONDA_CERRADA: "Esta ronda ya cerró: no recibe más respuestas.",
  FORJA_RONDA_NO: "Este enlace ya no funciona.",
  FORJA_RONDA_OTRA: "Este enlace es de otra persona.",
  FORJA_RONDA_SIN_CUENTA: "Entra con tu cuenta y confirma tu correo para abrir la ronda.",
  FORJA_LIMITE_LECTORES: "Llegaste al máximo de personas por ronda de tu plan (" + porPlan("lectores") + ").",
  FORJA_LECTOR_NOMBRE: "Escribe el nombre de la persona (hasta 60 caracteres).",
  FORJA_COMENTARIO_TEXTO: "El comentario va de 1 a 2.000 caracteres.",
  FORJA_COMENTARIO_LIMITE: "Ya dejaste muchos comentarios en esta ronda.",
  FORJA_SUGERIR_SIN_CUENTA: "Para dejar una sugerencia entra con tu cuenta y confirma tu correo.",
  FORJA_SUGERIR_TEXTO: "La sugerencia va de 10 a 800 caracteres.",
  FORJA_SUGERIR_LIMITE: "Ya dejaste 5 sugerencias hoy. ¡Gracias! Puedes dejar más mañana.",
  FORJA_SUGERIR_REPETIDA: "Ya nos dejaste esa misma sugerencia. La estamos leyendo.",
  FORJA_VITRINA_PAGOS: "La vitrina admite hasta 2 enlaces de pago o apoyo (Mercado Pago, PayPal, Ko-fi, Kickstarter…).",
};
export function limite(error) { const m = error && (error.message || ""); const k = Object.keys(MSG).find((c) => m.includes(c)); return k ? MSG[k] : null; }
// Tarjeta "Próximamente" de una función de Forja Más, con botón "Avísame" que guarda el interés.
export function proximamente(k, titulo, texto, chico) {
  return '<div class="fx-pronto' + (chico ? " chico" : "") + '" data-funcion="' + k + '"><span class="fx-pronto-tag">Próximamente · Forja Más</span><b>' + esc(titulo) + "</b>" + (texto ? "<span>" + esc(texto) + "</span>" : "") +
    '<button type="button" class="fx-avisame" data-avisame="' + k + '">Avísame</button></div>';
}
let intereses = null;
export async function activarAvisame(root) {
  const { data: { session } } = await sb.auth.getSession();
  const botones = [...(root || document).querySelectorAll("[data-avisame]")];
  if (!botones.length) return;
  if (!session) { botones.forEach((b) => { b.textContent = "Entra para que te avisemos"; b.onclick = () => { location.href = u("entrar/?siguiente=" + encodeURIComponent("planes/")); }; }); return; }
  if (!intereses) intereses = sb.from("interes_funciones").select("funcion").then(({ data }) => new Set((data || []).map((x) => x.funcion)));
  intereses = await intereses;
  const marcar = (b) => { const on = intereses.has(b.dataset.avisame); b.textContent = on ? "Te avisaremos ✓" : "Avísame"; b.setAttribute("aria-pressed", String(on)); };
  botones.forEach((b) => {
    marcar(b);
    b.onclick = async () => {
      const k = b.dataset.avisame, on = intereses.has(k);
      const r = on ? await sb.from("interes_funciones").delete().eq("funcion", k) : await sb.from("interes_funciones").insert({ funcion: k });
      if (r.error && !String(r.error.message).includes("duplicate")) { toast("No se pudo guardar."); return; }
      on ? intereses.delete(k) : intereses.add(k);
      document.querySelectorAll('[data-avisame="' + k + '"]').forEach(marcar);
      if (!on) toast("Listo: te avisaremos por correo cuando esté disponible.");
    };
  });
}
export const MAS_PRONTO = "Forja Más llega pronto, con más proyectos, palabras y pizarras sin límite y todas las herramientas.";
export const MAS_LINK = ' <a href="' + u("planes/") + '">Ver Forja Más</a>';

/* --- sesión --- */
// Cada persona tiene su espacio personal y puede ser parte de equipos (hoy, Digital Monster).
// El espacio elegido se recuerda en este navegador; si ya no es miembro, vuelve al personal.
// Se guarda la promesa (no el resultado): si varias partes de la página la piden a la vez, se consulta una sola vez.
let espaciosCache = null, espacioCache = null;
// Herramientas en prueba: solo las ve el equipo Digital Monster (la base lo revisa en privado.herramientas_equipo).
let equipoP = null;
export function equipo() {
  if (!equipoP) equipoP = sb.rpc("herramientas_equipo").then(({ data }) => data === true, () => false);
  return equipoP;
}
export function espacios() {
  if (!espaciosCache) espaciosCache = (async () => {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return [];
    const { data, error } = await sb.rpc("mis_espacios");
    if (error) throw error;
    return data || [];
  })().catch((e) => { espaciosCache = null; throw e; });
  return espaciosCache;
}
export async function espacioActual() {
  const lista = await espacios();
  let elegido = null; try { elegido = localStorage.getItem("forja-espacio"); } catch (e) {}
  return lista.find((x) => x.id === elegido) || lista.find((x) => x.tipo === "personal") || lista[0] || null;
}
export async function espacio() {
  if (espacioCache) return espacioCache;
  const e = await espacioActual();
  espacioCache = e ? e.id : null;
  return espacioCache;
}
// Cambiar de espacio lleva a sus proyectos (cada página carga los datos del espacio elegido).
export function cambiarEspacio(id, destino = "proyectos/") {
  try { localStorage.setItem("forja-espacio", id); } catch (e) {}
  location.href = u(destino);
}
// Qué puede hacer la persona en un proyecto: { acceso: "editar" | "ver", publica, rol, espacio, tipo } o null.
export async function accesoProyecto(id) {
  const { data } = await sb.rpc("acceso_proyecto", { p: id });
  return data || null;
}

// Páginas de la cuenta: si no hay sesión, se va a entrar/ y se vuelve aquí al entrar.
// Antes de usar Forja hay que aceptar la versión vigente de los documentos.
export async function conSesion(caja, listo) {
  const { data } = await sb.auth.getSession();
  if (!data.session) { location.replace(u("entrar/?siguiente=" + encodeURIComponent(location.href.slice(RAIZ.length)))); return; }
  if (!(await aceptado(data.session))) { await pedirAceptacion(); }
  marcarAcceso(data.session); avisoProxima();
  caja.innerHTML = "";
  try { await listo(data.session); } catch (e) { console.error(e); caja.innerHTML = '<div class="fx-empty">No se pudieron cargar tus datos. Revisa tu conexión y recarga la página.</div>'; }
}

/* --- documentos: términos, privacidad, normas, cookies y pagos --- */
// Las versiones las decide la base (rpc legal_estado), no esta página: una versión existe solo si Moderación la avisó por
// correo a todas las cuentas, y rige 15 días después del aviso (no se puede activar antes; la base solo deja aceptar la vigente).
// El texto vive en legal/<versión>/<documento>.json y el índice en legal/versiones.json (ver legal.js y CLAUDE.md).
export const DOCUMENTOS = ["terminos", "privacidad", "normas", "cookies", "pagos"];
export const NOMBRE_DOC = { terminos: "Términos de uso", privacidad: "Política de privacidad", normas: "Normas de la comunidad y uso aceptable", cookies: "Política de cookies y almacenamiento", pagos: "Planes, pagos y reembolsos" };
const LEMA_DOC = { terminos: "Tu contenido es tuyo. Qué puedes esperar de Forja y qué esperamos de ti.", privacidad: "Qué datos guardamos, para qué, quién más los procesa y tus derechos.",
  normas: "Qué se puede publicar, cómo se usa la plataforma, los reportes y las medidas.", cookies: "Qué guarda Forja en tu navegador y para qué.", pagos: "Cómo funcionarán los planes pagados, la cancelación y los reembolsos." };
export const hoyChile = () => { try { return new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" }); } catch (e) { return new Date().toISOString().slice(0, 10); } };
// Respaldo si la base no responde: la última versión vigente conocida (nunca adelanta una nueva).
const LEGAL_RESPALDO = { respaldo: true, vigente: "2026-11-06", versiones: [{ version: "2026-11-06", rige: "2026-11-06", estado: "vigente", documentos: ["terminos", "privacidad", "normas"] }] };
let legalP = null;
export function estadoLegal(fresco = false) {
  if (legalP && !fresco) return legalP;
  legalP = (async () => {
    try { const c = JSON.parse(sessionStorage.getItem("forja-legal") || "null"); if (!fresco && c && Date.now() - c.t < 15 * 60e3 && c.d.hoy === hoyChile()) return c.d; } catch (e) {}
    const { data, error } = await sb.rpc("legal_estado");
    if (error || !data || !data.vigente) return LEGAL_RESPALDO;
    try { sessionStorage.setItem("forja-legal", JSON.stringify({ t: Date.now(), d: data })); } catch (e) {}
    return data;
  })();
  return legalP;
}
export const fechaDia = (f) => { try { return new Date(String(f).slice(0, 10) + "T12:00:00Z").toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }); } catch (e) { return f; } };
export const versionDe = (E, v) => (E.versiones || []).find((x) => x.version === v) || null;
export const proximaLegal = (E) => (E.versiones || []).find((x) => x.estado === "proxima") || null;
// "del 6 de noviembre de 2026": las versiones se nombran por el día en que rigen.
export const fechaDocs = (E, v) => { const x = versionDe(E, v); return x && x.rige ? fechaDia(x.rige) : v; };
// Se recuerda en este navegador cuando la versión vigente ya está aceptada, para no consultarlo en cada página.
async function aceptado(session) {
  const E = await estadoLegal(), V = versionDe(E, E.vigente);
  const llave = "forja-acepta-" + session.user.id + "-" + E.vigente;
  try { if (localStorage.getItem(llave) === "1") return true; } catch (e) {}
  const { data, error } = await sb.from("aceptaciones").select("documento").eq("version", E.vigente);
  if (error) return true; // si falla la consulta no se bloquea el uso; se vuelve a pedir en la próxima visita
  const d = new Set((data || []).map((x) => x.documento));
  const ok = (V ? V.documentos : DOCUMENTOS.slice(0, 3)).every((k) => d.has(k));
  if (ok) try { localStorage.setItem(llave, "1"); } catch (e) {}
  return ok;
}
async function pedirAceptacion() {
  const E = await estadoLegal(), V = versionDe(E, E.vigente), docs = V ? V.documentos : DOCUMENTOS.slice(0, 3);
  return new Promise((listo) => {
    const dl = document.createElement("dialog"); dl.className = "fx-acepta"; dl.setAttribute("aria-labelledby", "fx-acepta-t");
    dl.innerHTML = '<form method="dialog" class="fx-acepta-c"><h2 id="fx-acepta-t">Antes de seguir</h2>' +
      "<p>Forja es un lugar para crear. Para usarla necesitamos que leas y aceptes cómo funciona: qué es tuyo, qué hacemos con tus datos y qué se permite publicar.</p>" +
      '<div class="fx-acepta-docs">' + docs.map((k) => '<a href="' + u(k + "/") + '" target="_blank" rel="noopener"><b>' + NOMBRE_DOC[k] + "</b><span>" + LEMA_DOC[k] + "</span></a>").join("") + "</div>" +
      '<label class="fx-acepta-ok"><input type="checkbox" id="fx-acepta-chk"> <span>Tengo 14 años o más, leí y acepto ' + (docs.length > 3 ? "los documentos de Forja" : "los Términos de uso, la Política de privacidad y las Normas de la comunidad") + " (versión del " + fechaDocs(E, E.vigente) + ").</span></label>" +
      '<div class="fx-acepta-pie"><button type="button" class="fx-link" id="fx-acepta-no">No acepto, salir</button><button type="button" class="fx-primary" id="fx-acepta-si" disabled>Aceptar y seguir</button></div></form>';
    document.body.appendChild(dl);
    dl.addEventListener("cancel", (e) => e.preventDefault()); // no se puede cerrar con Escape
    dl.showModal();
    $("fx-acepta-chk").onchange = (e) => { $("fx-acepta-si").disabled = !e.target.checked; };
    $("fx-acepta-no").onclick = async () => { await sb.auth.signOut(); location.href = u(); };
    $("fx-acepta-si").onclick = async () => {
      $("fx-acepta-si").disabled = true;
      const { error } = await sb.from("aceptaciones").insert(docs.map((documento) => ({ documento, version: E.vigente })));
      if (error && /FORJA_VERSION_NO_VIGENTE/.test(error.message)) { try { sessionStorage.removeItem("forja-legal"); } catch (e) {} location.reload(); return; } // cambió la versión vigente mientras tanto
      if (error && !/duplicate|23505/i.test(error.message + (error.code || ""))) { toast("No se pudo guardar. Revisa tu conexión e intenta de nuevo."); $("fx-acepta-si").disabled = false; return; }
      dl.close(); dl.remove(); listo();
    };
  });
}
// Mientras corre el plazo de una versión nueva, las cuentas que entran ven la fecha y el enlace a lo que cambia.
async function avisoProxima() {
  const E = await estadoLegal(), P = proximaLegal(E);
  if (!P) return;
  const llave = "forja-legal-visto-" + P.version;
  try { if (localStorage.getItem(llave)) return; } catch (e) {}
  const el = document.createElement("div"); el.className = "fx-legal-prox"; el.setAttribute("role", "status");
  el.innerHTML = "<span><b>Los documentos de Forja cambian el " + esc(fechaDia(P.rige)) + ".</b> Hasta entonces rige la versión actual.</span>" +
    '<a href="' + u("documentos/?v=" + encodeURIComponent(P.version)) + '">Ver qué cambia</a><button type="button" class="fx-link">Entendido</button>';
  el.querySelector("button").onclick = () => { try { localStorage.setItem(llave, "1"); } catch (e) {} el.remove(); };
  const cab = document.querySelector("header");
  if (cab) cab.insertAdjacentElement("afterend", el); else document.body.prepend(el);
}
// Último ingreso (regla de cuentas inactivas): una vez al día por cuenta.
function marcarAcceso(session) {
  const llave = "forja-acceso-" + session.user.id, hoy = hoyChile();
  try { if (localStorage.getItem(llave) === hoy) return; } catch (e) {}
  sb.rpc("marcar_acceso").then(({ error }) => { if (!error) try { localStorage.setItem(llave, hoy); } catch (e) {} });
}

/* --- avisos: lo que Forja te explica (moderación, respuestas a tus mensajes) --- */
// Muestra los avisos sin leer como tarjetas con "Entendido". Devuelve cuántos había.
export async function avisos(caja) {
  if (!caja) return 0;
  const { data } = await sb.from("avisos").select("id,tipo,titulo,texto,enlace,creado_en").eq("leido", false).order("creado_en", { ascending: false }).limit(5);
  const l = data || [];
  caja.innerHTML = l.map((a) => '<div class="fx-aviso fx-aviso-' + esc(a.tipo) + '" data-aviso="' + a.id + '"><div><b>' + esc(a.titulo) + "</b><span>" + esc(a.texto) + "</span><small>" + hace(a.creado_en) + "</small></div>" +
    '<div class="fx-aviso-acc">' + (a.enlace && u(a.enlace) !== location.href.split(/[?#]/)[0] ? '<a href="' + esc(u(a.enlace)) + '">Ver</a>' : "") + '<button type="button" class="fx-link">Entendido</button></div></div>').join("");
  caja.querySelectorAll("[data-aviso]").forEach((el) => {
    const leer = () => sb.from("avisos").update({ leido: true }).eq("id", el.dataset.aviso);
    el.querySelector("button").onclick = async () => { await leer(); el.remove(); };
    const a = el.querySelector("a"); if (a) a.onclick = (e) => { e.preventDefault(); leer().then(() => { location.href = a.href; }); };
  });
  return l.length;
}

export function pintarEntrada(caja, texto) {
  caja.innerHTML =
    '<section class="fx-entrada">' +
    marca(44) + '<h2>Entrar a Forja</h2>' +
    '<p>' + esc(texto || "Tus proyectos y cotizaciones son privados: solo los ves tú, desde cualquier dispositivo.") + "</p>" +
    '<form id="fx-f1" class="fx-row"><label class="fx-sr" for="fx-mail">Correo</label>' +
    '<input id="fx-mail" type="email" autocomplete="email" required placeholder="tu@correo.cl"><button class="fx-primary" type="submit">Enviarme el enlace</button></form>' +
    '<button class="fx-link" type="button" id="fx-tengo" hidden>¿Te llegó un código en vez de enlace?</button>' +
    '<form id="fx-f2" class="fx-row" hidden><label class="fx-sr" for="fx-code">Código</label>' +
    '<input id="fx-code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,10}" required placeholder="Código del correo"><button class="fx-primary" type="submit">Entrar</button>' +
    '<button class="fx-link" type="button" id="fx-otro">Usar otro correo</button></form>' +
    '<p class="fx-hint" id="fx-msg">Sin contraseñas: te llega un enlace al correo y al tocarlo quedas dentro. La primera vez se crea tu cuenta.</p>' +
    '<p class="fx-hint fx-legal-e">Al crear tu cuenta te pediremos aceptar los <a href="' + u("terminos/") + '">Términos</a>, la <a href="' + u("privacidad/") + '">Política de privacidad</a> y los <a href="' + u("documentos/") + '">demás documentos de Forja</a>.</p>' +
    "</section>";
  let mail = "";
  $("fx-f1").onsubmit = async (e) => {
    e.preventDefault();
    const b = e.submitter || e.target.querySelector("button"); b.disabled = true;
    mail = $("fx-mail").value.trim().toLowerCase();
    const { error } = await sb.auth.signInWithOtp({ email: mail, options: { emailRedirectTo: location.href.split("#")[0] } });
    b.disabled = false;
    if (error) { $("fx-msg").textContent = error.status === 429 ? "Se enviaron muchos correos seguidos. Espera unos minutos e intenta de nuevo." : "No se pudo enviar el correo: " + error.message; return; }
    $("fx-f1").hidden = true; $("fx-tengo").hidden = false;
    $("fx-msg").textContent = "Listo. Revisa " + mail + " (también spam) y toca el enlace desde este mismo dispositivo. Llega desde forja@digitalmonster.cl.";
  };
  $("fx-f2").onsubmit = async (e) => {
    e.preventDefault();
    const { error } = await sb.auth.verifyOtp({ email: mail, token: $("fx-code").value.trim(), type: "email" });
    if (error) $("fx-msg").textContent = "Ese código no funcionó o ya venció. Revisa que sea el último que te llegó.";
  };
  $("fx-tengo").onclick = () => { $("fx-tengo").hidden = true; $("fx-f2").hidden = false; $("fx-code").focus(); };
  $("fx-otro").onclick = () => { $("fx-f2").hidden = true; $("fx-tengo").hidden = true; $("fx-f1").hidden = false; $("fx-msg").textContent = ""; };
}

if ("serviceWorker" in navigator) navigator.serviceWorker.register(u("sw.js"), { scope: RAIZ }).catch(() => {}); // uno solo, en la raíz, para todas las carpetas

/* ---------- imágenes por enlace ----------
   Forja no guarda archivos: las imágenes van por enlace directo. Como no todo el mundo sabe dónde subirlas,
   ayudaImagenes() muestra tres servicios gratis y qué enlace copiar, y probarImagen() revisa que el enlace sea de verdad una imagen. */
export function ayudaImagenes(abierta = false) {
  return '<details class="fx-ayimg"' + (abierta ? " open" : "") + '><summary>¿Dónde subo mis imágenes?</summary>' +
    '<p>Forja no guarda archivos: necesitas el <b>enlace directo</b> de la imagen, el que se abre solo con la imagen. Puedes subirla gratis a uno de estos sitios:</p>' +
    '<div class="fx-ayimg-g">' +
      '<a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer"><b>ImgBB</b><span>No pide cuenta. Al subirla, en «Códigos de inserción» elige «Enlaces directos» y copia el que empieza con <code>i.ibb.co</code>.</span></a>' +
      '<a href="https://postimages.org/" target="_blank" rel="noopener noreferrer"><b>Postimages</b><span>No pide cuenta. Copia el «Enlace directo», el que empieza con <code>i.postimg.cc</code>.</span></a>' +
      '<a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer"><b>Imgur</b><span>Ábrela ya subida, mantén presionada la imagen (o clic derecho) y elige «Copiar dirección de la imagen» (<code>i.imgur.com</code>).</span></a>' +
    '</div><p class="fx-ayimg-no">No sirven los enlaces de Google Drive, Instagram, Pinterest o Facebook (son páginas, no imágenes) ni los de Discord (vencen). Sube solo imágenes tuyas o que puedas usar.</p></details>';
}
// Revisa un enlace de imagen y escribe el resultado en `salida` (un elemento). Devuelve una promesa con true/false.
export function probarImagen(url, salida) {
  return new Promise((ok) => {
    if (!salida) salida = document.createElement("span");
    url = String(url || "").trim();
    if (!url) { salida.textContent = ""; salida.className = "fx-imgprueba"; return ok(false); }
    if (!/^https:\/\//i.test(url)) { salida.textContent = "El enlace debe empezar con https://"; salida.className = "fx-imgprueba mal"; return ok(false); }
    salida.textContent = "Revisando la imagen…"; salida.className = "fx-imgprueba";
    const im = new Image(), t = setTimeout(() => fin(false), 9000);
    const fin = (bien) => { clearTimeout(t); im.onload = im.onerror = null;
      salida.textContent = bien ? "✓ La imagen carga bien." : /drive\.google|instagram\.com|pinterest\.|facebook\.com|discord/i.test(url) ? "Ese enlace es de una página, no de la imagen. Mira «¿Dónde subo mis imágenes?»." : "No pudimos abrir la imagen. ¿Es el enlace directo? Mira «¿Dónde subo mis imágenes?».";
      salida.className = "fx-imgprueba " + (bien ? "bien" : "mal"); ok(bien); };
    im.referrerPolicy = "no-referrer"; im.onload = () => fin(im.naturalWidth > 0); im.onerror = () => fin(false); im.src = url;
  });
}
