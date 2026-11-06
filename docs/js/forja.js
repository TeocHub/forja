// Forja · base común: conexión a Supabase, sesión, navegación y utilidades.
// El repositorio es público: aquí solo va la URL y la clave publicable (pensada para el navegador).
// Lo privado de cada persona queda en Supabase, protegido por las reglas de cada tabla.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

export const SB_URL = "https://gfkiwldxxvffnkjcesws.supabase.co";
export const SB_KEY = "sb_publishable_dwtoMBdzb5V50q-tMuE1SQ_Y55x1G_j";
export const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });

const PUBLICO = [
  { href: "oportunidades.html", nombre: "Oportunidades", id: "oportunidades" },
  { href: "planes.html", nombre: "Planes", id: "planes" },
];
// Menú de la cuenta. Íconos dibujados a mano, de trazo, para que se lean en la barra del celular.
const ICONO = {
  proyectos: '<path d="M4 6.5h6l2 2h8v9.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-10.5a1 1 0 0 1 1-1z"/>',
  eventos: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  cotizaciones: '<path d="M6 3h9l4 4v14H6z"/><path d="M14.5 3v4.5H19M9 12h7M9 16h5"/>',
  plan: '<path d="M12 3.5l2.4 5 5.5.7-4 3.8 1 5.4-4.9-2.7-4.9 2.7 1-5.4-4-3.8 5.5-.7z"/>',
};
const APP = [
  { href: "proyectos.html", nombre: "Proyectos", id: "proyectos" },
  { href: "eventos.html", nombre: "Eventos", id: "eventos" },
  { href: "cotizaciones.html", nombre: "Cotizaciones", id: "cotizaciones" },
  { href: "planes.html", nombre: "Mejorar plan", id: "plan" },
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
    '<a class="fx-logo" href="./">Forja</a><span class="fx-mods">' +
    PUBLICO.map((m) => '<a href="' + m.href + '"' + (m.id === actual ? ' aria-current="page"' : "") + ">" + m.nombre + "</a>").join("") +
    '</span><span class="fx-user" id="fx-user"><a class="fx-entrar" href="entrar.html">Entrar</a></span>';
  sb.auth.getSession().then(({ data }) => { if (data.session && $("fx-user")) $("fx-user").innerHTML = '<a class="fx-entrar lleno" href="proyectos.html">Ir a mi forja</a>'; });
}
// Dentro de la cuenta: menú propio (arriba en pantallas grandes, abajo en el celular).
export function navApp(actual) {
  const el = document.querySelector("[data-forja-nav]");
  if (!el) return;
  el.className = "fx-app";
  el.innerHTML =
    '<a class="fx-logo" href="proyectos.html">Forja</a>' +
    '<nav class="fx-menu" aria-label="Mi forja">' + APP.map((m) => '<a href="' + m.href + '" class="m-' + m.id + '"' + (m.id === actual ? ' aria-current="page"' : "") + ">" + svg(m.id) + "<span>" + m.nombre + "</span></a>").join("") + "</nav>" +
    '<details class="fx-cuenta" id="fx-cuenta"><summary aria-label="Mi cuenta"><span class="fx-ini" id="fx-ini">·</span></summary><div class="fx-pop">' +
    '<span class="fx-mail" id="fx-mail2"></span><span class="fx-planb" id="fx-planb">Plan gratis</span>' +
    '<a href="./">Ver el sitio público</a><a href="oportunidades.html">Calendario de oportunidades</a><button type="button" class="fx-link" id="fx-salir">Cerrar sesión</button></div></details>';
  document.body.classList.add("fx-con-app");
  sb.auth.getSession().then(async ({ data }) => {
    const ses = data.session; if (!ses) return;
    $("fx-ini").textContent = ses.user.email.slice(0, 1).toUpperCase();
    $("fx-mail2").textContent = ses.user.email;
    const pl = await plan();
    $("fx-planb").textContent = pl.mas ? "Forja Más" : "Plan gratis";
    $("fx-planb").classList.toggle("mas", pl.mas);
  });
  $("fx-salir").onclick = async () => { await sb.auth.signOut(); location.href = "./"; };
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
  if (!session) { botones.forEach((b) => { b.textContent = "Entra para que te avisemos"; b.onclick = () => { location.href = "entrar.html?siguiente=" + encodeURIComponent("planes.html"); }; }); return; }
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
export const MAS_LINK = ' <a href="planes.html">Ver Forja Más</a>';

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

// Páginas de la cuenta: si no hay sesión, se va a entrar.html y se vuelve aquí al entrar.
export async function conSesion(caja, listo) {
  const { data } = await sb.auth.getSession();
  if (!data.session) { location.replace("entrar.html?siguiente=" + encodeURIComponent(location.pathname.split("/").pop() + location.search + location.hash)); return; }
  caja.innerHTML = "";
  try { await listo(data.session); } catch (e) { console.error(e); caja.innerHTML = '<div class="fx-empty">No se pudieron cargar tus datos. Revisa tu conexión y recarga la página.</div>'; }
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

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
