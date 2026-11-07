// Forja · Estructura (proyectos.estructura): primero se resume el proyecto en seis momentos y después se prueba en modelos dibujados.
// estructura = { m: { inicio, conflicto, escalada, climax, desenlace, final }, modelo: "<clave>", comparar: "<clave>", notas: { <modelo>: { <i>: "texto" } } }
// Los modelos son formas de ordenar conocidas por todos; las descripciones y preguntas están escritas para Forja.
import { esc } from "./forja.js";
// Plan gratis: los dos primeros modelos de la categoría. Forja Más: todos, comparar dos lado a lado y pasarlo a la Escaleta.

export const CLAVES = ["inicio", "conflicto", "escalada", "climax", "desenlace", "final"];
// Cómo se llama cada momento según la categoría, con una pregunta corta.
export const MOMENTOS = {
  historia: [["Inicio", "¿Cómo es la vida antes de que todo cambie?"], ["Conflicto", "¿Qué pasa que obliga a actuar?"], ["Se complica", "¿Qué sale mal al intentar arreglarlo?"], ["Clímax", "¿Cuál es el enfrentamiento o la decisión más difícil?"], ["Desenlace", "¿Qué queda después del golpe?"], ["Final", "¿Cómo es el mundo ahora, y qué cambió?"]],
  videojuego: [["Primer contacto", "¿Qué ve y hace quien juega en el primer minuto?"], ["Aprender", "¿Cómo descubre las reglas sin leerlas?"], ["Se complica", "¿Qué nuevo obstáculo cambia la forma de jugar?"], ["La gran prueba", "¿Cuál es el desafío que usa todo lo aprendido?"], ["Recompensa", "¿Qué gana o descubre al superarlo?"], ["Volver a jugar", "¿Qué queda abierto para querer otra partida?"]],
  juegomesa: [["Preparación", "¿Cómo se arma la mesa y qué tiene cada quien al empezar?"], ["Primeros turnos", "¿Qué se hace mientras todos aprenden?"], ["Medio juego", "¿Qué se pone tenso o escaso?"], ["Turno decisivo", "¿Cuándo una jugada puede dar vuelta todo?"], ["Recuento", "¿Cómo se cuentan los puntos o se sabe quién ganó?"], ["Revancha", "¿Qué hace que pidan otra partida?"]],
  contenido: [["Gancho", "¿Qué se ve o se dice en los primeros segundos?"], ["La promesa", "¿Qué va a recibir quien se quede?"], ["Desarrollo", "¿Cuáles son los pasos o las ideas, en orden?"], ["Remate", "¿Cuál es el momento que la gente va a recordar?"], ["Cierre", "¿Cómo se ata todo en una frase?"], ["Llamado", "¿Qué pides al final: seguir, comentar, comprar?"]],
  producto: [["Lo descubre", "¿Dónde y cómo se entera de que existe?"], ["Duda", "¿Qué le hace dudar antes de comprarlo?"], ["Lo prueba", "¿Cómo es la primera vez que lo usa?"], ["Le resuelve", "¿En qué momento siente que valió la pena?"], ["Lo usa seguido", "¿Cómo entra en su rutina?"], ["Lo recomienda", "¿Qué le cuenta a otra persona?"]],
};
MOMENTOS.otro = MOMENTOS.historia;
export const momentos = (tipo) => (MOMENTOS[tipo] || MOMENTOS.otro).map(([n, q], i) => ({ k: CLAVES[i], n, q }));

// Modelos. forma "curva" (x e y de 0 a 1, y = intensidad) o "ciclo" (los pasos en círculo). `m` = qué momento tuyo cae en ese paso (null = paso propio del modelo).
// `actos` agrupa los pasos al pasar a la Escaleta.
export const MODELOS = {
  tres: { n: "Tres actos", forma: "curva", solo: ["historia", "otro", "contenido"], d: "Planteamiento, confrontación y resolución. La forma más usada: cada acto termina con algo que cambia.",
    actos: [["Acto I", [0, 1]], ["Acto II", [2, 3, 4]], ["Acto III", [5, 6]]],
    p: [{ n: "Planteamiento", x: .03, y: .18, m: "inicio" }, { n: "Detonante", x: .17, y: .32, m: "conflicto" }, { n: "Sin vuelta atrás", x: .29, y: .42, m: null, q: "¿Qué decisión hace imposible volver al inicio?" }, { n: "Todo se complica", x: .5, y: .62, m: "escalada" }, { n: "El punto más bajo", x: .7, y: .38, m: null, q: "¿Cuándo parece que todo está perdido?" }, { n: "Clímax", x: .86, y: .96, m: "climax" }, { n: "Resolución", x: .98, y: .3, m: "final" }] },
  piramide: { n: "Pirámide", forma: "curva", solo: ["historia", "otro"], d: "Sube hasta un punto alto justo en la mitad y después baja hacia el cierre. Calza con tragedias y con historias de caída.",
    actos: [["Subida", [0, 1]], ["Cumbre", [2]], ["Bajada", [3, 4]]],
    p: [{ n: "Presentación", x: .04, y: .15, m: "inicio" }, { n: "Subida", x: .26, y: .55, m: "escalada" }, { n: "Cumbre", x: .5, y: .97, m: "climax" }, { n: "Caída", x: .74, y: .5, m: "desenlace" }, { n: "Cierre", x: .97, y: .12, m: "final" }] },
  cuatro: { n: "Cuatro tiempos", forma: "curva", solo: ["historia", "otro", "contenido"], d: "Presentación, desarrollo, giro e integración. No necesita un enemigo: la fuerza está en un giro que cambia cómo se ve todo lo anterior.",
    actos: [["Presentación", [0]], ["Desarrollo", [1]], ["Giro", [2]], ["Integración", [3]]],
    p: [{ n: "Presentación", x: .08, y: .3, m: "inicio" }, { n: "Desarrollo", x: .36, y: .38, m: "escalada" }, { n: "Giro", x: .64, y: .92, m: "climax" }, { n: "Integración", x: .93, y: .45, m: "final" }] },
  viaje: { n: "El viaje", forma: "ciclo", solo: ["historia", "videojuego", "otro"], d: "Alguien sale de su mundo conocido, atraviesa pruebas en uno extraño y vuelve distinto, trayendo algo consigo.",
    actos: [["Partida", [0, 1, 2]], ["Pruebas", [3, 4]], ["Regreso", [5, 6]]],
    p: [{ n: "Mundo conocido", m: "inicio" }, { n: "El llamado", m: "conflicto" }, { n: "Cruza el umbral", m: null, q: "¿Qué deja atrás al entrar al mundo extraño?" }, { n: "Pruebas y aliados", m: "escalada" }, { n: "La prueba mayor", m: "climax" }, { n: "Lo que gana", m: "desenlace" }, { n: "Vuelve cambiado", m: "final" }] },
  circulo: { n: "Círculo de ocho pasos", forma: "ciclo", solo: ["historia", "contenido", "otro"], d: "Ocho pasos en círculo: estar cómodo, querer algo, ir a buscarlo, adaptarse, conseguirlo, pagar el precio, volver y haber cambiado.",
    actos: [["Lo conocido", [0, 1]], ["Lo desconocido", [2, 3, 4, 5]], ["El regreso", [6, 7]]],
    p: [{ n: "Está cómodo", m: "inicio" }, { n: "Quiere algo", m: "conflicto" }, { n: "Va a buscarlo", m: null, q: "¿A dónde tiene que ir que nunca había ido?" }, { n: "Se adapta", m: "escalada" }, { n: "Lo consigue", m: null, q: "¿Cómo lo consigue, y por qué no es lo que esperaba?" }, { n: "Paga el precio", m: "climax" }, { n: "Vuelve", m: "desenlace" }, { n: "Ha cambiado", m: "final" }] },
  dificultad: { n: "Curva de dificultad", forma: "curva", solo: ["videojuego"], d: "Olas de tensión y alivio que suben poco a poco. Cada ola enseña algo y la siguiente lo pone a prueba.",
    actos: [["Aprender", [0, 1]], ["Dominar", [2, 3, 4]], ["Demostrar", [5, 6]]],
    p: [{ n: "Primer minuto", x: .03, y: .1, m: "inicio" }, { n: "Primera ola", x: .18, y: .4, m: "conflicto" }, { n: "Respiro", x: .3, y: .2, m: null, q: "¿Dónde descansa quien juega y qué recibe?" }, { n: "Ola mayor", x: .5, y: .65, m: "escalada" }, { n: "Respiro", x: .64, y: .42, m: null, q: "¿Qué cambia antes del gran final?" }, { n: "Jefe o prueba final", x: .84, y: .98, m: "climax" }, { n: "Recompensa", x: .97, y: .35, m: "desenlace" }] },
  ciclojuego: { n: "Ciclo de juego", forma: "ciclo", solo: ["videojuego", "juegomesa"], d: "Lo que se repite: cada vuelta debe dejar algo nuevo para que la siguiente sea distinta.",
    actos: [["Explorar", [0]], ["Desafío", [1, 2]], ["Mejorar", [3, 4]]],
    p: [{ n: "Explorar", m: "inicio" }, { n: "Encontrar un desafío", m: "conflicto" }, { n: "Superarlo", m: "climax" }, { n: "Recompensa", m: "desenlace" }, { n: "Mejorar y volver", m: "final" }] },
  partida: { n: "Arco de partida", forma: "curva", solo: ["juegomesa"], d: "Apertura, medio juego y cierre. La partida debería ponerse más tensa justo antes de terminar, no apagarse.",
    actos: [["Apertura", [0, 1]], ["Medio juego", [2, 3]], ["Cierre", [4, 5]]],
    p: [{ n: "Montaje", x: .03, y: .08, m: "inicio" }, { n: "Apertura", x: .2, y: .3, m: "conflicto" }, { n: "Medio juego", x: .48, y: .55, m: "escalada" }, { n: "Último giro", x: .78, y: .95, m: "climax" }, { n: "Recuento", x: .9, y: .5, m: "desenlace" }, { n: "¿Otra?", x: .99, y: .3, m: "final" }] },
  turno: { n: "Turno en fases", forma: "ciclo", solo: ["juegomesa"], d: "Lo que pasa en un turno, paso a paso. Si una fase no tiene decisiones, quizá sobra.",
    actos: [["Recibir", [0]], ["Decidir", [1, 2]], ["Resolver", [3]]],
    p: [{ n: "Recibir", m: null, q: "¿Qué recibe cada persona al empezar su turno?" }, { n: "Decidir", m: "escalada" }, { n: "Actuar", m: "climax" }, { n: "Resolver y pasar", m: "desenlace" }] },
  gancho: { n: "Gancho, desarrollo y remate", forma: "curva", solo: ["contenido"], d: "Arriba de entrada para atrapar, un desarrollo que mantiene el interés y un remate antes de pedir algo.",
    actos: [["Gancho", [0, 1]], ["Desarrollo", [2]], ["Remate", [3, 4]]],
    p: [{ n: "Gancho", x: .03, y: .85, m: "inicio" }, { n: "Promesa", x: .18, y: .5, m: "conflicto" }, { n: "Desarrollo", x: .5, y: .6, m: "escalada" }, { n: "Remate", x: .8, y: .95, m: "climax" }, { n: "Llamado", x: .97, y: .55, m: "final" }] },
  problema: { n: "Problema y solución", forma: "curva", solo: ["contenido", "producto", "otro"], d: "Muestra un problema que duele, búscale salida y termina con la prueba de que funciona.",
    actos: [["Problema", [0, 1]], ["Solución", [2, 3]], ["Prueba", [4]]],
    p: [{ n: "El problema", x: .05, y: .7, m: "inicio" }, { n: "Por qué duele", x: .25, y: .9, m: "conflicto" }, { n: "La salida", x: .5, y: .5, m: "escalada" }, { n: "Funciona", x: .75, y: .25, m: "climax" }, { n: "La prueba", x: .97, y: .15, m: "final" }] },
  antes: { n: "Antes y después", forma: "curva", solo: ["contenido", "producto"], d: "Dos fotos y el camino entre ellas. El cambio es la historia.",
    actos: [["Antes", [0]], ["El camino", [1, 2]], ["Después", [3]]],
    p: [{ n: "Antes", x: .05, y: .2, m: "inicio" }, { n: "El intento", x: .35, y: .45, m: "escalada" }, { n: "El tropiezo", x: .55, y: .3, m: null, q: "¿Qué salió mal en el camino?" }, { n: "Después", x: .95, y: .95, m: "final" }] },
  recorrido: { n: "Recorrido de quien lo usa", forma: "curva", solo: ["producto"], d: "Del primer vistazo a recomendarlo. Cada paso es un lugar donde se puede perder a alguien o ganarlo.",
    actos: [["Descubre", [0, 1]], ["Prueba", [2, 3]], ["Se queda", [4, 5]]],
    p: [{ n: "Lo descubre", x: .03, y: .3, m: "inicio" }, { n: "Duda", x: .2, y: .15, m: "conflicto" }, { n: "Lo prueba", x: .42, y: .5, m: "escalada" }, { n: "Le resuelve", x: .62, y: .85, m: "climax" }, { n: "Rutina", x: .8, y: .7, m: "desenlace" }, { n: "Lo recomienda", x: .97, y: .95, m: "final" }] },
  uso: { n: "Ciclo de uso", forma: "ciclo", solo: ["producto"], d: "Cada cuánto se usa, se acaba o se renueva. Lo que hace volver a comprar.",
    actos: [["Comprar", [0]], ["Usar", [1, 2]], ["Volver", [3]]],
    p: [{ n: "Lo compra", m: "inicio" }, { n: "Lo usa", m: "escalada" }, { n: "Se acaba o se gasta", m: null, q: "¿Cuándo y por qué se termina?" }, { n: "Vuelve por más", m: "final" }] },
};
// El orden importa: los dos primeros de cada categoría vienen en el plan gratis.
const ORDEN = {
  historia: ["tres", "cuatro", "piramide", "viaje", "circulo"],
  videojuego: ["dificultad", "ciclojuego", "viaje"],
  juegomesa: ["partida", "turno", "ciclojuego"],
  contenido: ["gancho", "problema", "tres", "cuatro", "circulo", "antes"],
  producto: ["recorrido", "problema", "antes", "uso"],
  otro: ["tres", "problema", "cuatro", "piramide", "viaje", "circulo"],
};
export const LIBRES = 2;
export const modelosDe = (tipo) => (ORDEN[tipo] || ORDEN.otro).map((k) => ({ k, ...MODELOS[k] }));
export const libre = (tipo, k) => (ORDEN[tipo] || ORDEN.otro).indexOf(k) < LIBRES;

export function normalEstructura(e) {
  e = e && typeof e === "object" ? e : {};
  const m = {};
  for (const k of CLAVES) { const t = String((e.m || {})[k] ?? "").slice(0, 2000); if (t.trim()) m[k] = t; }
  const notas = {};
  for (const [mk, ns] of Object.entries(e.notas && typeof e.notas === "object" ? e.notas : {})) {
    if (!MODELOS[mk] || !ns || typeof ns !== "object") continue;
    const o = {}; for (const [i, t] of Object.entries(ns)) { const v = String(t ?? "").slice(0, 1000); if (/^\d+$/.test(i) && v.trim()) o[i] = v; }
    if (Object.keys(o).length) notas[mk] = o;
  }
  const out = { m };
  if (MODELOS[e.modelo]) out.modelo = e.modelo;
  if (MODELOS[e.comparar] && e.comparar !== e.modelo) out.comparar = e.comparar;
  if (Object.keys(notas).length) out.notas = notas;
  return out;
}

/* ---------- dibujo ---------- */
// Curva suave entre puntos (Catmull-Rom pasada a Bézier).
function suave(pts) {
  if (pts.length < 2) return "";
  let d = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += " C" + c1.map((v) => v.toFixed(1)).join(" ") + " " + c2.map((v) => v.toFixed(1)).join(" ") + " " + p2.map((v) => v.toFixed(1)).join(" ");
  }
  return d;
}
// Dibuja un modelo. `llenos` = índices de pasos con algo escrito; `sel` = paso marcado. Los pasos llevan data-paso para tocarlos.
export function dibujo(k, { llenos = new Set(), sel = -1, etiquetas = true } = {}) {
  const M = MODELOS[k]; if (!M) return "";
  const pasoSVG = (x, y, i, lx, ly, ancla) =>
    '<g class="es-p' + (llenos.has(i) ? " lleno" : "") + (i === sel ? " sel" : "") + '" data-paso="' + i + '" tabindex="0" role="button" aria-label="' + esc((i + 1) + ". " + M.p[i].n) + '">' +
    '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="13"/><text class="es-num" x="' + x.toFixed(1) + '" y="' + (y + 4.5).toFixed(1) + '">' + (i + 1) + "</text>" +
    (etiquetas ? '<text class="es-lbl" x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="' + ancla + '">' + esc(M.p[i].n) + "</text>" : "") + "</g>";
  if (M.forma === "ciclo") {
    const W = 420, H = 340, cx = W / 2, cy = H / 2, R = 118, n = M.p.length;
    const pts = M.p.map((_, i) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; return [cx + R * Math.cos(a), cy + R * Math.sin(a), a]; });
    return '<svg class="es-dib ciclo" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(M.n) + '"><defs><marker id="es-fl-' + k + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="es-fl"/></marker></defs>' +
      '<circle class="es-orbita" cx="' + cx + '" cy="' + cy + '" r="' + R + '"/>' +
      pts.map((p, i) => { const q = pts[(i + 1) % n], a1 = p[2] + 0.19, a2 = q[2] - 0.19 + (i === n - 1 ? Math.PI * 2 : 0); return '<path class="es-arco" d="M' + (cx + R * Math.cos(a1)).toFixed(1) + " " + (cy + R * Math.sin(a1)).toFixed(1) + " A" + R + " " + R + " 0 0 1 " + (cx + R * Math.cos(a2)).toFixed(1) + " " + (cy + R * Math.sin(a2)).toFixed(1) + '" marker-end="url(#es-fl-' + k + ')"/>'; }).join("") +
      pts.map((p, i) => { const c = Math.cos(p[2]), s = Math.sin(p[2]); return pasoSVG(p[0], p[1], i, cx + (R + 24) * c, cy + (R + 24) * s + 4 + (s > .5 ? 6 : s < -.5 ? -4 : 0), Math.abs(c) < .3 ? "middle" : c > 0 ? "start" : "end"); }).join("") + "</svg>";
  }
  const W = 640, H = 250, x0 = 34, x1 = W - 34, y0 = 200, y1 = 46;
  const pts = M.p.map((p) => [x0 + p.x * (x1 - x0), y0 - p.y * (y0 - y1)]);
  const cerrar = suave(pts);
  return '<svg class="es-dib curva" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(M.n) + '">' +
    '<line class="es-eje" x1="' + x0 + '" y1="' + (y0 + 18) + '" x2="' + x1 + '" y2="' + (y0 + 18) + '"/><text class="es-ejet" x="' + x0 + '" y="' + (y0 + 34) + '">comienzo</text><text class="es-ejet" x="' + x1 + '" y="' + (y0 + 34) + '" text-anchor="end">final</text>' +
    '<path class="es-area" d="' + cerrar + " L" + pts[pts.length - 1][0].toFixed(1) + " " + (y0 + 18) + " L" + pts[0][0].toFixed(1) + " " + (y0 + 18) + 'Z"/><path class="es-linea" d="' + cerrar + '"/>' +
    pts.map((p, i) => pasoSVG(p[0], p[1], i, Math.min(x1, Math.max(x0, p[0])), p[1] - 20, i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle")).join("") + "</svg>";
}
export const CSS_ESTRUCTURA = `
.es-dib{width:100%;height:auto;display:block;overflow:visible}
.es-dib .es-eje{stroke:var(--line);stroke-width:1.5}
.es-dib .es-ejet{font-size:11px;fill:var(--muted)}
.es-dib .es-area{fill:color-mix(in srgb,var(--tc,var(--accent)) 9%,transparent)}
.es-dib .es-linea{fill:none;stroke:var(--tc,var(--accent));stroke-width:3;stroke-linecap:round}
.es-dib .es-orbita{fill:color-mix(in srgb,var(--tc,var(--accent)) 6%,transparent);stroke:none}
.es-dib .es-arco{fill:none;stroke:var(--tc,var(--accent));stroke-width:2.5;stroke-linecap:round}
.es-dib .es-fl{fill:var(--tc,var(--accent))}
.es-dib .es-p{cursor:pointer;outline:none}
.es-dib .es-p circle{fill:var(--card);stroke:var(--tc,var(--accent));stroke-width:2.5;transition:r .15s}
.es-dib .es-p.lleno circle{fill:var(--tc,var(--accent))}
.es-dib .es-p .es-num{font-family:var(--f-num);font-size:12px;font-weight:700;text-anchor:middle;fill:var(--tc,var(--accent))}
.es-dib .es-p.lleno .es-num{fill:var(--card)}
.es-dib .es-p .es-lbl{font-size:12.5px;font-weight:700;fill:var(--fg);paint-order:stroke;stroke:var(--bg);stroke-width:4px;stroke-linejoin:round}
.es-dib .es-p.sel circle,.es-dib .es-p:focus-visible circle{stroke:var(--ember);stroke-width:4}
@media (max-width:560px){.es-dib .es-p .es-lbl{font-size:15px}}
`;
