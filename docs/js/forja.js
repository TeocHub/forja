// Forja · base común: conexión a Supabase, sesión, navegación y utilidades.
// El repositorio es público: aquí solo va la URL y la clave publicable (pensada para el navegador).
// Lo privado de cada persona queda en Supabase, protegido por las reglas de cada tabla.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

export const SB_URL = "https://gfkiwldxxvffnkjcesws.supabase.co";
export const SB_KEY = "sb_publishable_dwtoMBdzb5V50q-tMuE1SQ_Y55x1G_j";
export const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });

const MODULOS = [
  { href: "proyectos.html", nombre: "Proyectos", id: "proyectos" },
  { href: "./", nombre: "Oportunidades", id: "oportunidades" },
  { href: "cotizador.html", nombre: "Cotizador", id: "cotizador" },
];

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
export function nav(actual) {
  const el = document.querySelector("[data-forja-nav]");
  if (!el) return;
  el.className = "fx-nav";
  el.innerHTML =
    '<a class="fx-logo" href="proyectos.html">Forja</a><span class="fx-mods">' +
    MODULOS.map((m) => '<a href="' + m.href + '"' + (m.id === actual ? ' aria-current="page"' : "") + ">" + m.nombre + "</a>").join("") +
    '</span><span class="fx-user" id="fx-user"></span>';
  const pinta = (ses) => {
    const u = $("fx-user"); if (!u) return;
    if (ses) {
      u.innerHTML = '<span class="fx-mail" title="' + esc(ses.user.email) + '">' + esc(ses.user.email.split("@")[0]) + '</span><button type="button" class="fx-link" id="fx-salir">Salir</button>';
      $("fx-salir").onclick = async () => { await sb.auth.signOut(); location.reload(); };
    } else if (actual === "oportunidades") {
      u.innerHTML = '<a href="proyectos.html">Entrar</a>';
    } else u.innerHTML = "";
  };
  sb.auth.getSession().then(({ data }) => pinta(data.session));
  sb.auth.onAuthStateChange((_e, ses) => pinta(ses));
}

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

// Muestra la entrada por correo dentro de `caja` si no hay sesión; si la hay (o cuando se inicia), llama a `listo(session)`.
export async function conSesion(caja, listo, texto) {
  let lanzado = false;
  const lanzar = async (ses) => {
    if (lanzado || !ses) return; lanzado = true;
    caja.innerHTML = "";
    try { await listo(ses); } catch (e) { console.error(e); caja.innerHTML = '<div class="fx-empty">No se pudieron cargar tus datos. Revisa tu conexión y recarga la página.</div>'; }
  };
  const { data } = await sb.auth.getSession();
  if (data.session) return lanzar(data.session);
  sb.auth.onAuthStateChange((ev, ses) => { if (ses && (ev === "SIGNED_IN" || ev === "INITIAL_SESSION")) lanzar(ses); });
  pintarEntrada(caja, texto);
}

function pintarEntrada(caja, texto) {
  caja.innerHTML =
    '<section class="fx-entrada">' +
    '<h2>Entra para ver lo tuyo</h2>' +
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
