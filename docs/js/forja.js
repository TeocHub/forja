// Forja · base común: conexión a Supabase, sesión, navegación y utilidades.
// El repositorio es público: aquí solo va la URL y la clave publicable (pensada para el navegador).
// Lo privado de cada persona queda en Supabase, protegido por las reglas de cada tabla.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

export const SB_URL = "https://gfkiwldxxvffnkjcesws.supabase.co";
export const SB_KEY = "sb_publishable_dwtoMBdzb5V50q-tMuE1SQ_Y55x1G_j";
export const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });

// Raíz del sitio (la carpeta de index.html), sacada de la ubicación de este archivo: sirve igual en
// teochub.github.io/forja/ que en un dominio propio. Cada página vive en su carpeta: proyectos/, proyecto/?p=…
export const RAIZ = new URL("../", import.meta.url).href;
export const u = (ruta = "") => RAIZ + ruta;
const PUBLICO = [
  { href: u("oportunidades/"), nombre: "Oportunidades", id: "oportunidades" },
  { href: u("planes/"), nombre: "Planes", id: "planes" },
  { href: u("guia/"), nombre: "Guía", id: "guia" },
];
// Explorar aparece en el menú solo cuando hay suficientes proyectos para que no se vea vacío.
export const MIN_EXPLORAR = 6;
// Menú de la cuenta. Íconos dibujados a mano, de trazo, para que se lean en la barra del celular.
const ICONO = {
  proyectos: '<path d="M4 6.5h6l2 2h8v9.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-10.5a1 1 0 0 1 1-1z"/>',
  eventos: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  cotizaciones: '<path d="M6 3h9l4 4v14H6z"/><path d="M14.5 3v4.5H19M9 12h7M9 16h5"/>',
  plan: '<path d="M12 3.5l2.4 5 5.5.7-4 3.8 1 5.4-4.9-2.7-4.9 2.7 1-5.4-4-3.8 5.5-.7z"/>',
};
const APP = [
  { href: u("proyectos/"), nombre: "Proyectos", id: "proyectos" },
  { href: u("eventos/"), nombre: "Eventos", id: "eventos" },
  { href: u("cotizaciones/"), nombre: "Cotizaciones", id: "cotizaciones" },
  { href: u("planes/"), nombre: "Mejorar plan", id: "plan" },
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
    if ((count || 0) >= MIN_EXPLORAR || actual === "explorar") el.querySelector(".fx-mods").insertAdjacentHTML("afterbegin", '<a href="' + u("explorar/") + '"' + (actual === "explorar" ? ' aria-current="page"' : "") + ">Explorar</a>");
  });
  sb.auth.getSession().then(({ data }) => { if (data.session && $("fx-user")) $("fx-user").innerHTML = '<a class="fx-entrar lleno" href="' + u("proyectos/") + '">Ir a mi forja</a>'; });
}
// Dentro de la cuenta: menú propio (arriba en pantallas grandes, abajo en el celular).
export function navApp(actual) {
  const el = document.querySelector("[data-forja-nav]");
  if (!el) return;
  el.className = "fx-app";
  el.innerHTML =
    '<a class="fx-logo" href="' + u("proyectos/") + '">Forja</a>' +
    '<nav class="fx-menu" aria-label="Mi forja">' + APP.map((m) => '<a href="' + m.href + '" class="m-' + m.id + '"' + (m.id === actual ? ' aria-current="page"' : "") + ">" + svg(m.id) + "<span>" + m.nombre + "</span></a>").join("") + "</nav>" +
    '<button type="button" class="fx-ayuda" id="fx-ayuda" aria-label="Ayuda: cómo funciona esta página" title="Ayuda">?</button>' +
    '<details class="fx-cuenta" id="fx-cuenta"><summary aria-label="Mi cuenta"><span class="fx-ini" id="fx-ini">·</span></summary><div class="fx-pop">' +
    '<span class="fx-mail" id="fx-mail2"></span><span class="fx-planb" id="fx-planb">Plan gratis</span>' +
    '<a href="' + u("cuenta/") + '">Mi cuenta <span class="fx-nav-n" id="fx-avisos-n" hidden></span></a><a href="' + u("admin/") + '" id="fx-admin" hidden>Moderación</a>' +
    '<a href="' + u("guia/") + '">Guía de Forja</a><button type="button" class="fx-link" id="fx-pistas">Volver a ver las pistas</button><a href="' + u() + '">Ver el sitio público</a><a href="' + u("oportunidades/") + '">Calendario de oportunidades</a><span class="fx-legal"><a href="' + u("terminos/") + '">Términos</a> · <a href="' + u("privacidad/") + '">Privacidad</a> · <a href="' + u("normas/") + '">Normas</a></span><button type="button" class="fx-link" id="fx-salir">Cerrar sesión</button></div></details>';
  document.body.classList.add("fx-con-app");
  sb.auth.getSession().then(async ({ data }) => {
    const ses = data.session; if (!ses) return;
    $("fx-ini").textContent = ses.user.email.slice(0, 1).toUpperCase();
    $("fx-mail2").textContent = ses.user.email;
    const pl = await plan();
    $("fx-planb").textContent = pl.mas ? "Forja Más" : "Plan gratis";
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

/* --- plan y límites (los mismos que aplica la base de datos en privado.limite) --- */
export const LIMITES = { proyectos: 3, palabras: 20000, referentes: 30, pizarras: 1, tarjetas: 20 };
export const palabras = (t) => ((t || "").trim().match(/\S+/g) || []).length;
let planCache = null;
export async function plan() {
  if (planCache) return planCache;
  const e = await espacio(); if (!e) return { mas: false };
  const { data } = await sb.from("espacios").select("plan,plan_hasta").eq("id", e).maybeSingle();
  const mas = !!data && data.plan === "mas" && (!data.plan_hasta || new Date(data.plan_hasta) > new Date());
  planCache = { mas, hasta: data && data.plan_hasta };
  return planCache;
}
// Puede editarse si el plan es Más, o si no está archivado y no hay más proyectos en curso que el límite.
export const editable = (p, activos, pl) => pl.mas || (p.estado !== "archivado" && activos <= LIMITES.proyectos);
const MSG = {
  FORJA_LIMITE_PROYECTOS: "El plan gratis permite 3 proyectos en curso. Archiva uno para plantar o reactivar otro.",
  FORJA_LIMITE_PALABRAS: "Llegaste al límite de 20.000 palabras por proyecto del plan gratis. Lo que escribiste antes está guardado.",
  FORJA_LIMITE_REFERENTES: "El plan gratis permite 30 referentes por proyecto. Quita uno para agregar otro.",
  FORJA_SOLO_LECTURA: "Este proyecto está en solo lectura en el plan gratis.",
  FORJA_LIMITE_PIZARRAS: "El plan gratis incluye una pizarra por proyecto.",
  FORJA_LIMITE_TARJETAS: "El plan gratis permite 20 tarjetas por pizarra. Quita una para agregar otra.",
  FORJA_SOLO_MAS: "Esta pizarra es de Forja Más: puedes verla o borrarla.",
  FORJA_PIZARRA_GRANDE: "La pizarra es demasiado grande para guardarla. Divídela en dos.",
  FORJA_VITRINA_GRANDE: "La vitrina es demasiado grande para publicarla. Quita algunas piezas o pizarras.",
  FORJA_NO_PERMITIDO: "No tienes permiso para hacer eso.",
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
      if (!on) toast("Listo: te avisaremos cuando esté disponible.");
    };
  });
}
export const MAS_PRONTO = "Forja Más llega pronto, con proyectos, palabras y pizarras sin límite.";
export const MAS_LINK = ' <a href="' + u("planes/") + '">Ver Forja Más</a>';

/* --- sesión --- */
let espacioCache = null;
export async function espacio() {
  if (espacioCache) return espacioCache;
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return null;
  const { data, error } = await sb.from("miembros").select("espacio_id, rol, espacios(nombre)").eq("user_id", session.user.id).order("creado_en").limit(1);
  if (error) throw error;
  espacioCache = data && data[0] ? data[0].espacio_id : null;
  return espacioCache;
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
async function aceptado() {
  const { data, error } = await sb.from("aceptaciones").select("documento").eq("version", DOCS.version);
  if (error) return true; // si falla la consulta no se bloquea el uso; se vuelve a pedir en la próxima visita
  const d = new Set((data || []).map((x) => x.documento));
  return ["terminos", "privacidad", "normas"].every((k) => d.has(k));
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
