// Forja · base común: conexión a Supabase, sesión, navegación y utilidades.
// El repositorio es público: aquí solo va la URL y la clave publicable (pensada para el navegador).
// Lo privado de cada persona queda en Supabase, protegido por las reglas de cada tabla.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

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
// Menú de la cuenta. Íconos dibujados a mano, de trazo, para que se lean en la barra del celular.
const ICONO = {
  proyectos: '<path d="M4 6.5h6l2 2h8v9.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-10.5a1 1 0 0 1 1-1z"/>',
  semillero: '<path d="M12 20v-6.5"/><path d="M12 13.5c0-3.6 2.6-6.2 6.5-6.2 0 3.6-2.7 6.2-6.5 6.2Z"/><path d="M12 15.5c0-2.8-2.2-5-5.4-5 0 2.8 2.2 5 5.4 5Z"/><path d="M5 20h14"/>',
  eventos: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  cotizaciones: '<path d="M6 3h9l4 4v14H6z"/><path d="M14.5 3v4.5H19M9 12h7M9 16h5"/>',
  plan: '<path d="M12 3.5l2.4 5 5.5.7-4 3.8 1 5.4-4.9-2.7-4.9 2.7 1-5.4-4-3.8 5.5-.7z"/>',
};
const APP = [
  { href: u("proyectos/"), nombre: "Proyectos", id: "proyectos" },
  { href: u("semillero/"), nombre: "Semillero", id: "semillero" },
  { href: u("eventos/"), nombre: "Eventos", id: "eventos" },
  { href: u("cotizaciones/"), nombre: "Cotizaciones", id: "cotizaciones" },
  { href: u("planes/"), nombre: "Planes", id: "plan" },
];
const svg = (k) => '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">' + ICONO[k] + "</svg>";

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
    '<a class="fx-logo" href="' + u() + '">Forja</a><span class="fx-mods">' +
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
    '<a class="fx-logo" href="' + u("proyectos/") + '">Forja<span class="fx-esp" id="fx-esp" hidden></span></a>' +
    '<nav class="fx-menu" aria-label="Mi forja">' + APP.map((m) => '<a href="' + m.href + '" class="m-' + m.id + '"' + (m.id === actual ? ' aria-current="page"' : "") + ">" + svg(m.id) + "<span>" + m.nombre + "</span></a>").join("") + "</nav>" +
    '<button type="button" class="fx-ayuda" id="fx-ayuda" aria-label="Ayuda: cómo funciona esta página" title="Ayuda">?</button>' +
    '<details class="fx-cuenta" id="fx-cuenta"><summary aria-label="Mi cuenta"><span class="fx-ini" id="fx-ini">·</span></summary><div class="fx-pop">' +
    '<span class="fx-mail" id="fx-mail2"></span><span class="fx-planb" id="fx-planb">Plan gratis</span><div class="fx-espacios" id="fx-espacios" hidden></div>' +
    '<a href="' + u("cuenta/") + '">Mi cuenta <span class="fx-nav-n" id="fx-avisos-n" hidden></span></a><a href="' + u("admin/") + '" id="fx-admin" hidden>Moderación</a>' +
    '<a href="' + u("guia/") + '">Guía de Forja</a><a href="' + u("boletin/") + '">Boletín de Forja</a><button type="button" class="fx-link" id="fx-pistas">Volver a ver las pistas</button><a href="' + u() + '">Ver el sitio público</a><a href="' + u("oportunidades/") + '">Calendario de oportunidades</a><span class="fx-legal"><a href="' + u("terminos/") + '">Términos</a> · <a href="' + u("privacidad/") + '">Privacidad</a> · <a href="' + u("normas/") + '">Normas</a></span><button type="button" class="fx-link" id="fx-salir">Cerrar sesión</button></div></details>';
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
    const [{ count }, adm] = await Promise.all([sb.from("avisos").select("id", { count: "exact", head: true }).eq("leido", false), sb.rpc("soy_admin")]);
    if (count) { $("fx-avisos-n").textContent = count; $("fx-avisos-n").hidden = false; $("fx-ini").insertAdjacentHTML("afterend", '<span class="fx-punto" title="Tienes avisos nuevos"></span>'); }
    if (adm && adm.data === true) $("fx-admin").hidden = false;
  });
  $("fx-salir").onclick = async () => { await sb.auth.signOut(); location.href = u(); };
  // La ayuda se carga solo cuando se pide.
  $("fx-ayuda").onclick = async () => { const a = await import("./ayuda.js"); a.abrirAyuda(); };
  $("fx-pistas").onclick = async () => { const a = await import("./ayuda.js"); a.reiniciarPistas(); toast("Las pistas y los primeros pasos volverán a aparecer."); $("fx-cuenta").open = false; setTimeout(() => location.reload(), 900); };
  document.addEventListener("click", (e) => { const c = $("fx-cuenta"); if (c && c.open && !c.contains(e.target)) c.open = false; });
}

/* --- plan y límites (los mismos que aplica la base de datos en privado.limite y privado.tope) --- */
export const LIMITES = { proyectos: 3, palabras: 20000, referentes: 30, pizarras: 1, tarjetas: 20, ideas: 50, analisis: 3 };
// Topes que cambian por plan (privado.tope): null = sin límite. «lectores» = personas por ronda de Lectores beta.
export const TOPES = {
  libre: { proyectos: 3, invitados: 1, lectores: 3, ideas: 50 },
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
const MSG = {
  FORJA_LIMITE_PROYECTOS: "Llegaste al máximo de proyectos en curso de tu plan (3 gratis, 15 con Forja Más). Archiva uno para plantar o reactivar otro.",
  FORJA_LIMITE_PALABRAS: "Llegaste al límite de 20.000 palabras por proyecto del plan gratis. Lo que escribiste antes está guardado.",
  FORJA_LIMITE_IDEAS: "Llegaste al máximo de ideas en el Semillero de tu plan (50 gratis, 500 con Forja Más). Planta o borra alguna para anotar otra.",
  FORJA_LIMITE_ANALISIS: "El plan gratis permite analizar 3 obras por proyecto. Con Forja Más no hay límite.",
  FORJA_LIMITE_REFERENTES: "El plan gratis permite 30 referentes por proyecto. Quita uno para agregar otro.",
  FORJA_SOLO_LECTURA: "Este proyecto está en solo lectura: hay más proyectos en curso que los que permite tu plan, o está archivado en el plan gratis.",
  FORJA_LIMITE_PIZARRAS: "El plan gratis incluye una pizarra por proyecto.",
  FORJA_LIMITE_TARJETAS: "El plan gratis permite 20 tarjetas por pizarra. Quita una para agregar otra.",
  FORJA_SOLO_MAS: "Esta pizarra es de Forja Más: puedes verla o borrarla.",
  FORJA_PIZARRA_GRANDE: "La pizarra es demasiado grande para guardarla. Divídela en dos.",
  FORJA_VITRINA_GRANDE: "La vitrina es demasiado grande para publicarla. Quita algunas piezas o pizarras.",
  FORJA_NO_PERMITIDO: "No tienes permiso para hacer eso.",
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
  FORJA_INVITAR_LIMITE: "Llegaste al máximo de personas para este proyecto (1 en el plan gratis, 5 con Forja Más, 15 con Forja Estudio). Anula una invitación o quita a alguien para invitar a otra persona.",
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
  FORJA_LIMITE_LECTORES: "Llegaste al máximo de personas por ronda de tu plan (3 gratis, 15 con Forja Más, 40 con Forja Estudio).",
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
  if (!intereses) { const { data } = await sb.from("interes_funciones").select("funcion"); intereses = new Set((data || []).map((x) => x.funcion)); }
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
let espaciosCache = null, espacioCache = null;
export async function espacios() {
  if (espaciosCache) return espaciosCache;
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return [];
  const { data, error } = await sb.rpc("mis_espacios");
  if (error) throw error;
  espaciosCache = data || [];
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
  if (!(await aceptado())) { await pedirAceptacion(); }
  caja.innerHTML = "";
  try { await listo(data.session); } catch (e) { console.error(e); caja.innerHTML = '<div class="fx-empty">No se pudieron cargar tus datos. Revisa tu conexión y recarga la página.</div>'; }
}

/* --- documentos: términos, privacidad y normas --- */
// Al cambiar un documento de forma importante, subir la versión: todos lo vuelven a aceptar al entrar.
export const DOCS = { version: "2026-11-06", fecha: "6 de noviembre de 2026" };
// Se recuerda en este navegador cuando la versión vigente ya está aceptada, para no consultarlo en cada página.
async function aceptado() {
  const { data: { session } } = await sb.auth.getSession();
  const llave = "forja-acepta-" + (session ? session.user.id : "") + "-" + DOCS.version;
  try { if (localStorage.getItem(llave) === "1") return true; } catch (e) {}
  const { data, error } = await sb.from("aceptaciones").select("documento").eq("version", DOCS.version);
  if (error) return true; // si falla la consulta no se bloquea el uso; se vuelve a pedir en la próxima visita
  const d = new Set((data || []).map((x) => x.documento));
  const ok = ["terminos", "privacidad", "normas"].every((k) => d.has(k));
  if (ok) try { localStorage.setItem(llave, "1"); } catch (e) {}
  return ok;
}
function pedirAceptacion() {
  return new Promise((listo) => {
    const dl = document.createElement("dialog"); dl.className = "fx-acepta"; dl.setAttribute("aria-labelledby", "fx-acepta-t");
    dl.innerHTML = '<form method="dialog" class="fx-acepta-c"><h2 id="fx-acepta-t">Antes de seguir</h2>' +
      "<p>Forja es un lugar para crear. Para usarla necesitamos que leas y aceptes cómo funciona: qué es tuyo, qué hacemos con tus datos y qué se permite publicar.</p>" +
      '<div class="fx-acepta-docs"><a href="' + u("terminos/") + '" target="_blank" rel="noopener"><b>Términos de uso</b><span>Tu contenido es tuyo. Qué puedes esperar de Forja y qué esperamos de ti.</span></a>' +
      '<a href="' + u("privacidad/") + '" target="_blank" rel="noopener"><b>Política de privacidad</b><span>Qué datos guardamos, para qué, quién más los procesa y tus derechos.</span></a>' +
      '<a href="' + u("normas/") + '" target="_blank" rel="noopener"><b>Normas de la comunidad</b><span>Qué se puede publicar, cómo funcionan los reportes y las sanciones.</span></a></div>' +
      '<label class="fx-acepta-ok"><input type="checkbox" id="fx-acepta-chk"> <span>Tengo 14 años o más, leí y acepto los Términos de uso, la Política de privacidad y las Normas de la comunidad (versión del ' + DOCS.fecha + ").</span></label>" +
      '<div class="fx-acepta-pie"><button type="button" class="fx-link" id="fx-acepta-no">No acepto, salir</button><button type="button" class="fx-primary" id="fx-acepta-si" disabled>Aceptar y seguir</button></div></form>';
    document.body.appendChild(dl);
    dl.addEventListener("cancel", (e) => e.preventDefault()); // no se puede cerrar con Escape
    dl.showModal();
    $("fx-acepta-chk").onchange = (e) => { $("fx-acepta-si").disabled = !e.target.checked; };
    $("fx-acepta-no").onclick = async () => { await sb.auth.signOut(); location.href = u(); };
    $("fx-acepta-si").onclick = async () => {
      $("fx-acepta-si").disabled = true;
      const { error } = await sb.from("aceptaciones").insert(["terminos", "privacidad", "normas"].map((documento) => ({ documento, version: DOCS.version })));
      if (error && !/duplicate|23505/i.test(error.message + (error.code || ""))) { toast("No se pudo guardar. Revisa tu conexión e intenta de nuevo."); $("fx-acepta-si").disabled = false; return; }
      dl.close(); dl.remove(); listo();
    };
  });
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
    '<h2>Entrar a Forja</h2>' +
    '<p>' + esc(texto || "Tus proyectos y cotizaciones son privados: solo los ves tú, desde cualquier dispositivo.") + "</p>" +
    '<form id="fx-f1" class="fx-row"><label class="fx-sr" for="fx-mail">Correo</label>' +
    '<input id="fx-mail" type="email" autocomplete="email" required placeholder="tu@correo.cl"><button class="fx-primary" type="submit">Enviarme el enlace</button></form>' +
    '<button class="fx-link" type="button" id="fx-tengo" hidden>¿Te llegó un código en vez de enlace?</button>' +
    '<form id="fx-f2" class="fx-row" hidden><label class="fx-sr" for="fx-code">Código</label>' +
    '<input id="fx-code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,10}" required placeholder="Código del correo"><button class="fx-primary" type="submit">Entrar</button>' +
    '<button class="fx-link" type="button" id="fx-otro">Usar otro correo</button></form>' +
    '<p class="fx-hint" id="fx-msg">Sin contraseñas: te llega un enlace al correo y al tocarlo quedas dentro. La primera vez se crea tu cuenta.</p>' +
    '<p class="fx-hint fx-legal-e">Al crear tu cuenta te pediremos aceptar los <a href="' + u("terminos/") + '">Términos</a>, la <a href="' + u("privacidad/") + '">Política de privacidad</a> y las <a href="' + u("normas/") + '">Normas de la comunidad</a>.</p>' +
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
    $("fx-msg").textContent = "Listo. Revisa " + mail + " (también spam) y toca el enlace desde este mismo dispositivo. El correo llega en inglés, con el asunto «Your Magic Link».";
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
