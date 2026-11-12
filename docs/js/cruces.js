// Forja · el Taller y Fichas: un elemento, varias miradas (decisión del 2026-11-12).
// Algunas secciones del Taller hablan de un conjunto de cosas que también viven en Fichas (personajes, lugares, mecánicas,
// componentes, productos). Esas secciones se enlazan a su colección (secciones.coleccion_id): la sección guarda el texto
// sobre el conjunto y cada ficha guarda su propia hoja de escritura (elementos.texto). Es el mismo elemento: crearlo en el
// Taller lo crea en Fichas y al revés. Fichas guarda los datos; el Taller, el texto largo.
// Mientras Fichas sea solo del equipo, quien no es del equipo ve el Taller como siempre (la base revisa lo mismo).
// Un solo archivo para proyecto/ (Taller y Fichas), la biblia, la vitrina y lectores beta.
import { PLANTILLAS, sirve, ENLACES } from "./fichas-plantillas.js";

// Sección del Taller (guía de guias.js) → plantilla de Fichas, con preguntas que van más allá de los datos de la ficha.
// `varios`: cómo se nombran en plural; `conjunto`: preguntas para el texto de la sección; `uno`: para la hoja de cada elemento.
export const CRUCES = {
  personajes: { pl: "personajes", varios: "los personajes",
    conjunto: ["¿Qué relación entre ellos cambia más de principio a fin?", "¿Quién se parece a quién, y en qué se diferencian cuando importa?", "¿Qué sabe cada uno que los demás no saben?"],
    uno: ["¿Qué le pasó antes de que empiece la historia que todavía le pesa?", "¿Qué necesita de verdad, aunque diga querer otra cosa?", "¿Qué teme perder?", "¿Cómo cambia de la primera a la última página?", "Escribe una escena corta donde se muestre sin que nadie lo describa."] },
  mundo: { pl: "lugares", varios: "los lugares y objetos",
    conjunto: ["¿Qué regla de este mundo no existe en el nuestro?", "¿Quién tiene el poder y cómo lo mantiene?", "¿Qué se come, qué se celebra, qué se teme?", "Si la magia o la tecnología existen, ¿qué cuestan?"],
    uno: ["¿Qué historia tiene antes de que empiece la tuya?", "¿Quién lo cuida, lo desea o le teme?", "¿Cómo huele, suena o se siente estar ahí, o tenerlo en la mano?", "¿Qué cambia en él durante la historia?"] },
  mecanicas: { pl: "mecanicas", varios: "las mecánicas",
    conjunto: ["¿Cuál es la mecánica que nadie más tiene?", "¿En qué orden aparecen y cómo se enseñan?", "¿Cómo se pierde, y qué se aprende al perder?"],
    uno: ["¿Por qué existe? ¿Qué sensación busca dar?", "¿Cómo la descubre quien juega por primera vez?", "¿Cómo se vuelve más difícil o más profunda con el tiempo?", "¿Qué pasó cuando la probaste y qué cambiarías?"] },
  componentes: { pl: "componentes", varios: "los componentes",
    conjunto: ["¿Qué componente se podría simplificar sin perder diversión?", "¿Cómo se guarda todo en la caja y qué se ve primero al abrirla?", "Cuando esté claro, cotízalos en Costos."],
    uno: ["¿Para qué se usa en la partida y en qué momento se toca?", "¿Qué información lleva impresa y cómo se lee de un vistazo?", "¿Cómo se ve: ilustración, íconos, colores?", "¿Qué pasa si se pierde o se rompe uno?"] },
  proceso: { pl: "producto", varios: "los productos",
    conjunto: ["¿Qué se necesita y en qué orden se hace?", "¿Qué parte se hace a mano y cuál se encarga?", "¿Dónde se te va más tiempo?"],
    uno: ["Paso a paso, ¿cómo se hace?", "¿Cuánto tiempo toma una unidad?", "¿Qué falla seguido y cómo lo evitas?", "¿Qué material o proveedor probaste y descartaste, y por qué?"] },
};

// La plantilla de Fichas que corresponde a una sección en esta categoría (o null si no se cruzan).
export const cruce = (guia, tipo) => { const c = CRUCES[guia]; return c && sirve(c.pl, tipo) ? c : null; };
export const nombrePl = (pl) => (PLANTILLAS[pl] || PLANTILLAS.libre);

// «Pasar a fichas»: busca en el texto de una sección las partes que hablan de un elemento.
// Una parte empieza con una línea de nombre: «## Nombre», «**Nombre**», «Nombre:» (con o sin texto después),
// «- Nombre: …» o una línea corta sola seguida de texto. Las preguntas guía («— ¿…?») nunca son nombres.
// Devuelve { partes: [{ titulo, cuerpo, desde, hasta }], lineas } con los índices de línea de cada parte.
const LIMPIA = (t) => t.replace(/^#{1,3}\s+/, "").replace(/^[-*•]\s+/, "").replace(/^\*\*(.+)\*\*$/, "$1").replace(/\*\*/g, "").trim();
function cabecera(linea, sigue, antesVacia) {
  const l = linea.trim();
  if (!l || /^[—–]/.test(l) || l.length > 90) return null;
  let m;
  if ((m = l.match(/^#{1,3}\s+(.{1,60})$/))) return { titulo: LIMPIA(m[1]), resto: "", largo: true };
  if ((m = l.match(/^\*\*([^*]{1,60})\*\*\s*:?\s*(.*)$/))) return { titulo: m[1].trim(), resto: m[2] };
  if ((m = l.match(/^(?:[-*•]\s+)?([^:¿?.!]{1,40}):\s*(.*)$/)) && m[1].trim().split(/\s+/).length <= 5 && !/^https?$/i.test(m[1].trim())) return { titulo: LIMPIA(m[1]), resto: m[2] };
  // Una línea corta y sola (sin punto final ni pregunta), con texto debajo, después de una línea vacía.
  if (antesVacia && sigue && sigue.trim() && l.length <= 40 && l.split(/\s+/).length <= 5 && !/[.?!:,;]$/.test(l)) return { titulo: LIMPIA(l), resto: "" };
  return null;
}
export function partir(texto) {
  const lineas = String(texto || "").replace(/\r/g, "").split("\n"), partes = [];
  let actual = null;
  lineas.forEach((ln, i) => {
    const c = cabecera(ln, lineas[i + 1], i === 0 || !lineas[i - 1].trim());
    if (c && c.titulo) {
      if (actual) partes.push(actual);
      actual = { titulo: c.titulo.slice(0, 160), cuerpo: c.resto ? [c.resto] : [], desde: i, hasta: i, largo: !!c.largo };
    } else if (actual) {
      // Una pregunta guía o un título de otra cosa corta la parte.
      if (/^\s*[—–]\s/.test(ln)) { partes.push(actual); actual = null; return; }
      // Con «## Nombre» la parte sigue por varios párrafos; con «Nombre:» o «**Nombre**», termina en la primera línea vacía.
      if (!ln.trim() && !actual.largo && actual.cuerpo.some((x) => x.trim())) { partes.push(actual); actual = null; return; }
      actual.cuerpo.push(ln); actual.hasta = i;
    }
  });
  if (actual) partes.push(actual);
  partes.forEach((p) => {
    // Las líneas vacías del final no son de la parte: quedan en el conjunto.
    while (p.cuerpo.length && !p.cuerpo[p.cuerpo.length - 1].trim()) { p.cuerpo.pop(); p.hasta--; }
    p.cuerpo = p.cuerpo.join("\n").trim();
  });
  return { partes: partes.filter((p) => p.titulo), lineas };
}
// El texto que queda en la sección al sacar las partes elegidas (sin dejar más de una línea vacía seguida).
export function sinPartes(lineas, partes) {
  const fuera = new Set(); partes.forEach((p) => { for (let i = p.desde; i <= p.hasta; i++) fuera.add(i); });
  return lineas.filter((_, i) => !fuera.has(i)).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// Para lo que se lee fuera del Taller (biblia, vitrina, lectores beta): el texto de la sección más la hoja de cada ficha.
export const hojasDe = (sec, elementos) => (sec && sec.coleccion_id ? (elementos || []).filter((e) => e.coleccion_id === sec.coleccion_id).sort((a, b) => (a.orden - b.orden) || String(a.creado_en || "").localeCompare(String(b.creado_en || ""))) : []);
export function textoCompleto(sec, elementos) {
  const hs = hojasDe(sec, elementos).filter((e) => (e.texto || "").trim());
  return [String(sec.texto || "").trim(), ...hs.map((e) => e.titulo + "\n" + e.texto.trim())].filter(Boolean).join("\n\n");
}
// Cómo se nombran en plural los elementos de una sección («los personajes»).
export const varios = (guia, pl) => (CRUCES[guia] && CRUCES[guia].varios) || "las " + (PLANTILLAS[pl] || PLANTILLAS.libre).n.toLowerCase();

// La Pizarra y Fichas (desde el 2026-11-12): una pizarra se conecta con una colección (pizarras.coleccion_id). En Relaciones
// las tarjetas son los personajes; en el Mapa, los lugares; en la libre, cualquier colección (un bucle de mecánicas, una ruta de
// pistas). Cada tarjeta nueva con nombre es una ficha, y cada lazo, ruta o flecha entre dos de ellas, un enlace entre fichas.
// Qué plantilla se sugiere por modo (la primera que sirva a la categoría); la libre acepta cualquiera.
export const PLANTILLA_MODO = { relaciones: ["personajes"], mapa: ["lugares"], libre: [] };
const DE_ORDEN = (t) => t === "abre" || t === "necesita";
// Una flecha de la pizarra → el enlace que guarda la ficha de origen: { t, n }.
export function enlaceDeFlecha(f, modo) {
  const texto = String(f.texto || "").trim().slice(0, 120);
  if (modo === "relaciones") return { t: f.lazo && f.lazo !== "otro" ? f.lazo : "lazo", n: texto };
  if (modo === "mapa") return { t: "ruta", n: texto };
  return DE_ORDEN(texto) ? { t: texto, n: "" } : { t: "lleva", n: texto };
}
// Un enlace de ficha → los datos de su flecha en una pizarra (al traer una colección completa).
export function flechaDeEnlace(e, modo) {
  const grupo = (ENLACES[e.t] || [])[2];
  if (modo === "relaciones") return { lazo: grupo === "lazo" && e.t !== "lazo" ? e.t : "otro", texto: e.n || (grupo === "lazo" ? "" : ENLACES[e.t] ? ENLACES[e.t][0] : ""), dir: grupo === "lazo" ? "nada" : "a" };
  if (modo === "mapa") return { texto: e.n || (e.t === "ruta" ? "" : ENLACES[e.t] ? ENLACES[e.t][0] : ""), dir: e.t === "ruta" ? "nada" : "a" };
  return { texto: e.n || (DE_ORDEN(e.t) ? e.t : e.t === "lleva" ? "" : ENLACES[e.t] ? ENLACES[e.t][0] : ""), dir: "a" };
}
// Lo que una tarjeta ya tiene escrito pasa a la ficha nueva: el detalle y las notas van al campo que corresponde a su plantilla.
// Lo que no calza con un campo va a la hoja del Taller de la ficha. La tarjeta no se toca.
export function datosDeTarjeta(t, plantilla) {
  const pl = PLANTILLAS[plantilla] || PLANTILLAS.libre, datos = {}, sub = String(t.sub || "").trim(), texto = String(t.texto || "").trim();
  const opcion = (k) => { const c = pl.campos.find((x) => x.k === k); return c && c.op ? c.op.find((o) => o.toLowerCase() === sub.toLowerCase()) : null; };
  let resto = [];
  if (sub) { const op = opcion("rol") || opcion("clase"); if (op) datos[pl.campos.find((x) => x.k === "rol") ? "rol" : "clase"] = op; else resto.push(sub); }
  const largo = { personajes: "quiere", lugares: "como", mecanicas: "cambia", contenido: "desc", cartas: "efecto", componentes: "notas", pilares: "que", series: "idea", producto: "larga", libre: "notas" }[plantilla];
  if (texto && largo && pl.campos.some((x) => x.k === largo)) datos[largo] = texto.slice(0, 4000); else if (texto) resto.push(texto);
  return { datos, texto: resto.join("\n\n") };
}
