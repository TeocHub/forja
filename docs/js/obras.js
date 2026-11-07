// Forja · Analizar una obra: la ficha de una obra (libro, juego, película…), su cita y las preguntas del análisis.
// Un solo archivo para la pestaña Referentes, la biblia y la ayuda.
import { esc } from "./forja.js";
// referentes.tipo = "obra"; referentes.ficha = { clase, autores, anio, titulo, edicion, editorial, editores, libro, paginas, album, sitio, fecha, url, formato };
// referentes.analisis = { ve, armada, trata, aprendi: [texto…], en: "YYYY-MM-DD" } ({} = sin analizar; el plan gratis permite 3 por proyecto).
// Una cita de Referentes puede apuntar a una obra: referentes.ficha = { obra: <id>, pagina: "45" } → (Apellido, año, p. 45).

// Cada clase dice qué datos pide la ficha. `a` es cómo se llama quien la hizo en esa clase.
export const CLASES = {
  libro: { n: "Libro o cómic", a: "Autoría", campos: ["autores", "anio", "titulo", "edicion", "editorial"] },
  capitulo: { n: "Capítulo o cuento", a: "Autoría", campos: ["autores", "anio", "titulo", "libro", "editores", "paginas", "editorial"] },
  videojuego: { n: "Videojuego", a: "Estudio", campos: ["autores", "anio", "titulo", "editorial"] },
  juegomesa: { n: "Juego de mesa", a: "Diseño", campos: ["autores", "anio", "titulo", "editorial"] },
  pelicula: { n: "Película o serie", a: "Dirección o creación", campos: ["formato", "autores", "anio", "titulo", "editorial"] },
  cancion: { n: "Canción", a: "Artista", campos: ["autores", "anio", "titulo", "album", "editorial"] },
  web: { n: "Página web o video", a: "Autoría o canal", campos: ["autores", "fecha", "titulo", "sitio", "url"] },
};
export const ORDEN_CLASES = Object.keys(CLASES);

// Etiquetas y ayudas de cada campo, según la clase.
export function campo(k, clase) {
  const C = CLASES[clase] || CLASES.libro;
  return ({
    autores: { n: C.a, ph: clase === "videojuego" ? "Ej.: Estudio Lumbre" : clase === "cancion" ? "Ej.: Los Faroles" : "Apellido, Nombre; Apellido, Nombre", ayuda: clase === "videojuego" || clase === "cancion" || clase === "web" ? "Una persona (Apellido, Nombre), un grupo o un estudio." : "Separa a cada persona con punto y coma. Un grupo o estudio va tal cual." },
    anio: { n: "Año", ph: "2019", max: 12 },
    titulo: { n: clase === "capitulo" ? "Título del capítulo o cuento" : "Título", ph: clase === "capitulo" ? "Ej.: La casa del faro" : "Ej.: El mapa de los que se fueron", req: true },
    edicion: { n: "Edición", ph: "2", ayuda: "Solo si no es la primera.", max: 12 },
    editorial: { n: clase === "videojuego" ? "Distribuidora" : clase === "pelicula" ? "Productora" : clase === "cancion" ? "Sello" : "Editorial", ph: "" },
    editores: { n: "Edición del libro (quien lo editó)", ph: "Apellido, Nombre" },
    libro: { n: "Título del libro", ph: "Ej.: Cuentos del sur" },
    paginas: { n: "Páginas", ph: "10–25", max: 20 },
    album: { n: "Álbum", ph: "" },
    sitio: { n: "Sitio o plataforma", ph: "Ej.: YouTube" },
    fecha: { n: "Fecha", ph: "2024, 3 de mayo", ayuda: "Año, o año y día.", max: 40 },
    url: { n: "Enlace", ph: "https://…", max: 600 },
    formato: { n: "Es una", ph: "" },
  })[k];
}

// Limpia lo que llega de un formulario o de la base.
const s = (v, max = 300) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
export function normalFicha(f) {
  f = f && typeof f === "object" ? f : {};
  const clase = CLASES[f.clase] ? f.clase : "libro", o = { clase };
  for (const k of CLASES[clase].campos) { const c = campo(k, clase), v = s(f[k], c.max || 300); if (v) o[k] = v; }
  if (o.url && !/^https?:\/\/\S+$/i.test(o.url)) delete o.url;
  if (o.formato && !["pelicula", "serie"].includes(o.formato)) delete o.formato;
  return o;
}

/* ---------- personas ---------- */
// "García Márquez, Gabriel; Laura Ruiz; Estudio X" → [{ap, nom}] o [{grupo}]
export function personas(t) {
  return s(t, 600).split(/\s*;\s*/).filter(Boolean).slice(0, 20).map((x) => {
    if (x.includes(",")) { const [ap, ...r] = x.split(","); return { ap: ap.trim(), nom: r.join(",").trim() }; }
    return { grupo: x };
  });
}
const iniciales = (n) => n.split(/[\s-]+/).filter(Boolean).map((p) => p[0].toUpperCase() + ".").join(" ");
const unir = (xs, y = "y") => xs.length < 2 ? xs.join("") : xs.length === 2 ? xs[0] + " " + y + " " + xs[1] : xs.slice(0, -1).join(", ") + ", " + y + " " + xs[xs.length - 1];
// Cómo se llama la persona en la cita corta y en la bibliografía.
const apellido = (p) => p.grupo || p.ap;

/* ---------- citas ---------- */
const punto = (t) => (t && !/[.?!]$/.test(t) ? t + "." : t);
const anioDe = (f) => s(f.clase === "web" ? (f.fecha || "").split(",")[0] : f.anio) || "s. f.";
const tipoAPA = (f) => ({ videojuego: "Videojuego", juegomesa: "Juego de mesa", cancion: "Canción", pelicula: f.formato === "serie" ? "Serie de televisión" : "Película" })[f.clase];
const esVideo = (f) => /youtube\.com|youtu\.be|vimeo\.com|tiktok\.com/i.test(f.url || "") || /youtube|vimeo|tiktok|twitch/i.test(f.sitio || "");

// it(t) pone cursiva en HTML o deja el texto plano.
function apa(f, it) {
  const ps = personas(f.autores);
  let quien = ps.length ? unir(ps.map((p) => (p.grupo ? p.grupo : p.ap + (p.nom ? ", " + iniciales(p.nom) : ""))), "y") : "";
  if (f.clase === "pelicula" && quien) quien += f.formato === "serie" ? " (Creación)" : " (Dirección)";
  const anio = "(" + (f.clase === "web" && f.fecha ? s(f.fecha) : anioDe(f)) + ").";
  const tit = f.titulo || "Sin título";
  const partes = [];
  // Sin autoría, el título pasa al primer lugar (APA).
  if (!quien) { const t0 = f.clase === "capitulo" || f.clase === "cancion" ? tit : it(tit); return [punto(t0) + (f.clase === "libro" || f.clase === "capitulo" || f.clase === "cancion" || f.clase === "web" ? "" : " [" + tipoAPA(f) + "]."), anio, f.clase === "capitulo" ? "En " + it(f.libro || "Título del libro") + (f.paginas ? " (pp. " + s(f.paginas).replace(/-/g, "–") + ")" : "") + "." : "", f.editorial ? punto(f.editorial) : f.clase === "web" ? [f.sitio ? punto(f.sitio) : "", f.url || ""].filter(Boolean).join(" ") : ""].filter(Boolean).join(" ").replace(/\.\s\[/, " ["); }
  partes.push(punto(quien), anio);
  if (f.clase === "capitulo") {
    partes.push(punto(tit));
    const eds = personas(f.editores);
    const en = "En " + (eds.length ? unir(eds.map((p) => (p.grupo ? p.grupo : (p.nom ? iniciales(p.nom) + " " : "") + p.ap)), "y") + (eds.length > 1 ? " (Eds.), " : " (Ed.), ") : "") + it(f.libro || "Título del libro") + (f.paginas ? " (pp. " + s(f.paginas).replace(/-/g, "–") + ")" : "") + ".";
    partes.push(en);
    if (f.editorial) partes.push(punto(f.editorial));
  } else if (f.clase === "libro") {
    partes.push(it(tit) + (f.edicion && f.edicion !== "1" ? " (" + f.edicion.replace(/\D/g, "") + ".ª ed.)" : "") + ".");
    if (f.editorial) partes.push(punto(f.editorial));
  } else if (f.clase === "cancion") {
    partes.push(tit + " [" + tipoAPA(f) + "]." + (f.album ? " En " + it(f.album) + "." : ""));
    if (f.editorial) partes.push(punto(f.editorial));
  } else if (f.clase === "web") {
    partes.push(it(tit) + (esVideo(f) ? " [Video]" : "") + ".");
    if (f.sitio && f.sitio !== quien) partes.push(punto(f.sitio));
    if (f.url) partes.push(f.url);
  } else {
    partes.push(it(tit) + " [" + tipoAPA(f) + "].");
    if (f.editorial) partes.push(punto(f.editorial));
  }
  return partes.join(" ");
}
function mla(f, it) {
  const ps = personas(f.autores);
  const nombre = (p, i) => (p.grupo ? p.grupo : i === 0 ? p.ap + (p.nom ? ", " + p.nom : "") : (p.nom ? p.nom + " " : "") + p.ap);
  const quien = !ps.length ? "" : ps.length > 2 ? nombre(ps[0], 0) + ", et al." : unir(ps.map(nombre), "y");
  const tit = f.titulo || "Sin título", an = anioDe(f) === "s. f." ? "" : anioDe(f);
  const cola = (xs) => xs.filter(Boolean).join(", ");
  const out = [];
  if (quien && !(["videojuego"].includes(f.clase))) out.push(punto(quien));
  if (f.clase === "capitulo") {
    const eds = personas(f.editores);
    out.push("«" + punto(tit) + "»");
    out.push(punto(cola([it(f.libro || "Título del libro"), eds.length ? "editado por " + unir(eds.map((p) => (p.grupo ? p.grupo : (p.nom ? p.nom + " " : "") + p.ap)), "y") : "", f.editorial, an, f.paginas ? "pp. " + f.paginas.replace(/–/g, "-") : ""])));
  } else if (f.clase === "cancion") {
    out.push("«" + punto(tit) + "»");
    out.push(punto(cola([f.album ? it(f.album) : "", f.editorial, an])));
  } else if (f.clase === "web") {
    out.push(punto(it(tit)));
    out.push(punto(cola([f.sitio, f.fecha ? s(f.fecha) : "", f.url ? f.url.replace(/^https?:\/\//, "") : ""])));
  } else {
    out.push(punto(it(tit)));
    out.push(punto(cola([f.clase === "videojuego" && quien ? quien : "", f.edicion && f.edicion !== "1" ? f.edicion.replace(/\D/g, "") + ".ª ed." : "", f.editorial, an])));
  }
  return out.filter((x) => x && x !== ".").join(" ");
}
function chicago(f, it) {
  const ps = personas(f.autores);
  const nombre = (p, i) => (p.grupo ? p.grupo : i === 0 ? p.ap + (p.nom ? ", " + p.nom : "") : (p.nom ? p.nom + " " : "") + p.ap);
  const quien = ps.length ? unir(ps.map(nombre), "y") : "";
  const tit = f.titulo || "Sin título", an = anioDe(f) === "s. f." ? "s. f." : anioDe(f);
  const out = [];
  if (quien) out.push(punto(quien));
  if (f.clase === "capitulo") {
    const eds = personas(f.editores);
    out.push("«" + punto(tit) + "»");
    out.push("En " + it(f.libro || "Título del libro") + (eds.length ? ", editado por " + unir(eds.map((p) => (p.grupo ? p.grupo : (p.nom ? p.nom + " " : "") + p.ap)), "y") : "") + (f.paginas ? ", " + f.paginas.replace(/-/g, "–") : "") + ".");
    out.push(punto([f.editorial, an].filter(Boolean).join(", ")));
  } else if (f.clase === "cancion") {
    out.push("«" + punto(tit) + "»" + (f.album ? " En " + it(f.album) + "." : ""));
    out.push(punto([f.editorial, an].filter(Boolean).join(", ")));
  } else if (f.clase === "web") {
    out.push("«" + punto(tit) + "»");
    out.push(punto([f.sitio, f.fecha ? s(f.fecha) : an].filter(Boolean).join(", ")));
    if (f.url) out.push(punto(f.url));
  } else {
    const t = tipoAPA(f);
    out.push(punto(it(tit)) + (t ? " " + t.replace(" de televisión", "") + "." : ""));
    out.push(punto([f.edicion && f.edicion !== "1" ? f.edicion.replace(/\D/g, "") + ".ª ed." : "", f.editorial, an].filter(Boolean).join(", ")));
  }
  return out.filter(Boolean).join(" ");
}
export const ESTILOS = { apa: "APA 7", mla: "MLA 9", chicago: "Chicago" };
// La referencia completa. html: true devuelve HTML seguro con cursivas; si no, texto plano.
export function cita(ficha, estilo = "apa", html = false) {
  const f = normalFicha(ficha), fn = ({ apa, mla, chicago })[estilo] || apa;
  if (!html) return fn(f, (t) => t);
  // Se arma con marcadores y después se escapa todo menos las cursivas.
  const A = "\u0001", B = "\u0002";
  return esc(fn(f, (t) => A + t + B)).replace(/\u0001/g, "<i>").replace(/\u0002/g, "</i>");
}
// La cita corta dentro del texto: (Apellido, 2019, p. 45).
export function citaCorta(ficha, pagina) {
  const f = normalFicha(ficha), ps = personas(f.autores);
  const q = !ps.length ? (f.titulo || "Sin título") : ps.length === 1 ? apellido(ps[0]) : ps.length === 2 ? apellido(ps[0]) + " y " + apellido(ps[1]) : apellido(ps[0]) + " et al.";
  const pg = s(pagina, 20);
  return "(" + q + ", " + anioDe(f) + (pg ? (/[-–,]/.test(pg) ? ", pp. " : ", p. ") + pg.replace(/-/g, "–") : "") + ")";
}
// Quién y cuándo, corto, para las tarjetas.
export function firma(ficha) {
  const f = normalFicha(ficha), ps = personas(f.autores);
  const q = ps.map((p) => (p.grupo ? p.grupo : (p.nom ? p.nom + " " : "") + p.ap));
  const a = anioDe(f);
  return [q.length > 2 ? q[0] + " y otros" : unir(q, "y"), a === "s. f." ? "" : a].filter(Boolean).join(" · ");
}
// Orden de la bibliografía: por apellido o título, sin tildes.
const llave = (r) => { const f = normalFicha(r.ficha), p = personas(f.autores)[0]; return String(p ? apellido(p) : f.titulo || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); };
export const ordenarBiblio = (obras) => obras.slice().sort((a, b) => llave(a).localeCompare(llave(b), "es") || anioDe(normalFicha(a.ficha)).localeCompare(anioDe(normalFicha(b.ficha))));

/* ---------- análisis ---------- */
// Tres miradas y una pregunta final. Las preguntas cambian según qué es la obra.
export const MIRADAS = [
  { k: "ve", n: "Cómo se ve", d: "Lo que entra por los sentidos: el tono, el ritmo, el ambiente." },
  { k: "armada", n: "Cómo está armada", d: "Las piezas y el orden: cómo empieza, qué la sostiene, cómo termina." },
  { k: "trata", n: "De qué trata", d: "Lo que queda cuando se acaba: el tema de fondo y lo que cambia." },
];
export const APRENDI = { k: "aprendi", n: "Lo que aprendí", d: "Una cosa concreta que quieres probar en tu proyecto. Esta es la que más vale." };
const GRUPO = { libro: "lectura", capitulo: "lectura", videojuego: "juego", juegomesa: "mesa", pelicula: "pantalla", web: "pantalla", cancion: "musica" };
const PREG = {
  ve: {
    todos: ["¿Qué fue lo primero que te llamó la atención?", "Si tuvieras que describir su ambiente con tres palabras, ¿cuáles serían?", "¿Hay algo que se repite: un color, una frase, un sonido?"],
    lectura: ["¿Quién cuenta y desde qué distancia: muy cerca de un personaje o mirando desde arriba?", "¿Las frases son largas y lentas o cortas y rápidas? ¿Cambian en algún momento?"],
    juego: ["¿Qué sentiste en los primeros cinco minutos con el control en la mano?", "¿Cómo te avisa el juego que hiciste algo bien o mal?"],
    mesa: ["¿Qué te dijeron la caja y los componentes antes de leer las reglas?", "¿Cómo se siente la mesa a mitad de partida: tensa, relajada, caótica?"],
    pantalla: ["¿Qué hace la imagen o el montaje cuando algo importante pasa?", "¿Cómo usa el sonido o el silencio?"],
    musica: ["¿Qué instrumento o sonido lleva la canción?", "¿Cambia la energía entre el comienzo y el final?"],
  },
  armada: {
    todos: ["¿Cómo empieza y qué te hizo seguir?", "¿Dónde está el momento más intenso y qué lo prepara antes?", "Si sacaras una parte, ¿qué se caería?"],
    lectura: ["¿Qué sabe quien lee que el personaje todavía no sabe, o al revés?", "¿Cómo termina cada capítulo o escena: cierra algo o deja algo abierto?"],
    juego: ["¿Qué haces una y otra vez? ¿Qué cambia cada vez para que no aburra?", "¿Cómo te enseña a jugar sin decírtelo?"],
    mesa: ["¿Qué hace cada persona en su turno y cuánto espera a las demás?", "¿Cómo termina una partida y quién decide cuándo?"],
    pantalla: ["¿En qué orden te da la información? ¿Qué se guarda para después?", "¿Cuánto dura cada parte y por qué crees que dura eso?"],
    musica: ["¿Cómo se ordenan las partes: estrofa, coro, puente…?", "¿Qué se guarda para el final?"],
  },
  trata: {
    todos: ["Más allá de lo que pasa, ¿de qué habla?", "¿Qué cambia entre el principio y el final: un personaje, un mundo, tú?", "¿Con qué te quedaste pensando después?"],
    lectura: ["¿Qué pregunta le hace la obra a quien lee?"],
    juego: ["¿Qué te hace sentir ganar o perder? ¿Eso calza con lo que cuenta?"],
    mesa: ["¿Qué relación crea entre las personas que juegan: rivales, aliadas, cómplices?"],
    pantalla: ["¿Qué quiere que sientas al terminar?"],
    musica: ["¿A quién le está hablando la canción?"],
  },
  aprendi: {
    todos: ["¿Qué te gustaría robarle con orgullo a esta obra?", "¿Qué harías distinto en tu proyecto después de verla?", "¿Qué error de esta obra no quieres repetir?"],
  },
};
export const preguntas = (k, clase) => [...(PREG[k].todos || []), ...((PREG[k][GRUPO[clase]]) || [])];
// Ejemplos inventados para Forja, para el campo «Lo que aprendí».
export const EJEMPLOS_APRENDI = [
  "Cerrar cada capítulo con una pregunta que se responde en el siguiente.",
  "Mostrar el mapa entero al principio, pero tapado, para que dé ganas de destaparlo.",
  "Que cada turno termine con una decisión difícil, aunque sea chica.",
  "Presentar al personaje haciendo algo, no describiéndolo.",
  "Repetir una frase al inicio y al final para que cambie de sentido.",
];

export function normalAnalisis(a) {
  a = a && typeof a === "object" ? a : {};
  const o = {};
  for (const m of MIRADAS) { const v = String(a[m.k] ?? "").trim().slice(0, 3000); if (v) o[m.k] = v; }
  const ap = (Array.isArray(a.aprendi) ? a.aprendi : []).map((x) => String(x ?? "").trim().slice(0, 300)).filter(Boolean).slice(0, 6);
  if (ap.length) o.aprendi = ap;
  if (Object.keys(o).length) o.en = /^\d{4}-\d{2}-\d{2}$/.test(a.en || "") ? a.en : new Date().toISOString().slice(0, 10);
  return o;
}
export const analizada = (r) => !!(r && r.analisis && Object.keys(r.analisis).length);
// Cuántas de las cuatro partes tienen algo escrito (para el avance de la tarjeta).
export const partesHechas = (a) => [...MIRADAS.map((m) => m.k), "aprendi"].filter((k) => (k === "aprendi" ? (a && a.aprendi || []).length : a && a[k])).length;
// Todo lo aprendido del proyecto, con su obra.
export const aprendizajes = (refs) => refs.filter((r) => r.tipo === "obra").flatMap((r) => ((r.analisis || {}).aprendi || []).map((t) => ({ t, obra: r })));
