// Forja · Lectores beta (testers, probadores): rondas de prueba sobre una copia de lo que eliges mostrar.
// Un solo archivo para la herramienta del proyecto (#lectores), la sala de quien lee (prueba/?t=), la ayuda y la guía.
// Tablas public.rondas, ronda_lectores, ronda_respuestas, ronda_comentarios; todo se escribe por funciones (ver supabase/esquema.sql).
import { sb, esc, toast, limite, hace, fecha, u } from "./forja.js";

// Cómo se llama quien prueba, según la categoría del proyecto.
const NOMBRES = {
  historia: ["lectores beta", "lector beta", "Lectores beta", "leer"], comic: ["lectores beta", "lector beta", "Lectores beta", "leer"], contenido: ["lectores beta", "lector beta", "Lectores beta", "ver"], otro: ["lectores beta", "lector beta", "Lectores beta", "leer"],
  videojuego: ["testers", "tester", "Testers", "jugar"], juegomesa: ["testers", "tester", "Testers", "jugar"], producto: ["probadores", "probador", "Probadores", "probar"],
};
export const quienes = (tipo) => { const n = NOMBRES[tipo] || NOMBRES.otro; return { plural: n[0], uno: n[1], titulo: n[2], verbo: n[3], palabra: n[0].split(" ")[0] }; };

// Preguntas fijas por categoría, escritas para Forja. Quien crea elige cuáles usar; con Forja Más agrega las suyas.
const P_HIST = [
  { k: "entendio", t: "¿Se entendió de qué se trata? Cuéntalo con tus palabras." },
  { k: "mejor", t: "¿Qué fue lo mejor? Lo que te quedó dando vueltas." },
  { k: "confuso", t: "¿Qué te confundió o te sacó de la lectura?" },
  { k: "lento", t: "¿En qué parte se hizo lento o perdiste el interés?" },
  { k: "seguir", t: "¿Seguirías leyendo? ¿Por qué sí o por qué no?" },
];
const P_COMIC = [
  { k: "entendio", t: "¿Se entendió de qué se trata? Cuéntalo con tus palabras." },
  { k: "orden", t: "¿Hubo alguna página donde no supiste qué viñeta o qué globo leer primero?" },
  { k: "quien", t: "¿Confundiste a algún personaje con otro? ¿En qué página?" },
  { k: "vuelta", t: "¿Qué página te dio ganas de dar vuelta la hoja?" },
  { k: "mejor", t: "¿Qué fue lo mejor? Una viñeta, un diálogo, un momento." },
  { k: "seguir", t: "¿Seguirías leyendo? ¿Por qué sí o por qué no?" },
];
const P_JUEGO = [
  { k: "cuanto", t: "¿Cuánto jugaste y con cuántas personas?" },
  { k: "entendio", t: "¿Entendiste qué tenías que hacer sin que nadie te explicara?" },
  { k: "trabo", t: "¿Dónde te trabaste o no supiste qué hacer?" },
  { k: "mejor", t: "¿Qué fue lo mejor de jugarlo?" },
  { k: "aburrio", t: "¿Hubo un momento aburrido o injusto? ¿Cuál?" },
  { k: "otra", t: "¿Jugarías otra partida? ¿Por qué?" },
];
const P_PROD = [
  { k: "uso", t: "¿Para qué lo usarías tú?" },
  { k: "mejor", t: "¿Qué fue lo mejor?" },
  { k: "confuso", t: "¿Qué te confundió, incomodó o no funcionó como esperabas?" },
  { k: "pagaria", t: "¿Cuánto pagarías por él?" },
  { k: "cambio", t: "Si pudieras cambiarle una sola cosa, ¿cuál sería?" },
];
const P_CONT = [
  { k: "entendio", t: "¿Qué te llevaste al terminar?" },
  { k: "gancho", t: "¿Te enganchó el comienzo? ¿En qué momento decidiste seguir (o no)?" },
  { k: "mejor", t: "¿Qué fue lo mejor?" },
  { k: "lento", t: "¿Dónde se hizo largo o perdiste el hilo?" },
  { k: "compartir", t: "¿Se lo mostrarías a alguien? ¿A quién?" },
];
export const PREGUNTAS = { historia: P_HIST, comic: P_COMIC, otro: P_HIST, contenido: P_CONT, videojuego: P_JUEGO, juegomesa: P_JUEGO, producto: P_PROD };
export const preguntasDe = (tipo) => PREGUNTAS[tipo] || P_HIST;
export const MARCAS = { opinion: "Opinión", mejora: "Hay que mejorar", resuelta: "Ya resuelta" };

// Una parte de sección se divide en párrafos (líneas en blanco) para poder comentarlos uno por uno.
export const parrafos = (t) => String(t || "").split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
const enlaceSeguro = (v) => /^https:\/\/[^\s"'<>]+$/i.test(String(v || "").trim()) ? String(v).trim() : "";

/* ======================= estilos (herramienta y sala) ======================= */
export const CSS_LECTORES = `
.lb{display:flex;flex-direction:column;gap:18px}
.lb-rondas{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.lb-rondas button{font:inherit;font-size:13.5px;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:10px;padding:5px 12px;cursor:pointer}
.lb-rondas button[aria-pressed="true"]{border-color:var(--fg);background:var(--fg);color:var(--bg)}
.lb-rondas button small{opacity:.7;margin-left:4px}
.lb-vacia{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:22px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:22px}
@media (max-width:760px){.lb-vacia{grid-template-columns:minmax(0,1fr)}}
.lb-vacia h3{font-family:var(--f-display);font-size:22px;margin:0 0 6px}
.lb-vacia p{margin:0 0 10px;color:var(--muted)}
.lb-circuito{position:relative;aspect-ratio:16/10;border-radius:14px;background:var(--field);overflow:hidden}
.lb-circuito svg{position:absolute;inset:0;width:100%;height:100%}
.lb-circuito .t{font:600 11px var(--f-body);fill:var(--fg)}
.lb-circuito .s{font:400 9.5px var(--f-body);fill:var(--muted)}
.lb-form{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:16px}
.lb-form h3{font-family:var(--f-display);font-size:19px;margin:0}
.lb-paso{display:grid;grid-template-columns:32px minmax(0,1fr);gap:4px 12px}
.lb-paso>.n{grid-row:span 2;width:28px;height:28px;border-radius:50%;border:1.5px solid var(--fg);display:grid;place-items:center;font:700 13px var(--f-num)}
.lb-paso>b{font-family:var(--f-display);font-size:16px;align-self:center}
.lb-paso>div{display:flex;flex-direction:column;gap:8px;min-width:0}
.lb-elegir{display:flex;flex-wrap:wrap;gap:6px}
.lb-elegir button{font:inherit;font-size:14px;text-align:left;border:1px dashed var(--line);background:var(--bg);color:var(--fg);border-radius:10px;padding:7px 11px;cursor:pointer;display:flex;flex-direction:column;gap:1px;max-width:100%}
.lb-elegir button small{font-size:12px;color:var(--muted)}
.lb-elegir button[aria-pressed="true"]{border-style:solid;border-color:var(--tc,var(--accent));background:color-mix(in srgb,var(--tc,var(--accent)) 9%,var(--card))}
.lb-elegir button:disabled{opacity:.5;cursor:default}
.lb-f{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--muted)}
.lb-f input,.lb-f textarea{font:inherit;font-size:15px;border:1px solid var(--line);background:var(--bg);color:var(--fg);border-radius:10px;padding:8px 10px;width:100%}
.lb-f textarea{min-height:64px;resize:vertical}
.lb-dos{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}
@media (max-width:620px){.lb-dos{grid-template-columns:minmax(0,1fr)}}
.lb-q{display:flex;gap:8px;align-items:flex-start;font-size:14.5px;border-bottom:1px dashed var(--line);padding:7px 0}
.lb-q:last-child{border-bottom:0}
.lb-q input[type=checkbox]{margin-top:4px;accent-color:var(--fg)}
.lb-q .x{margin-left:auto;font:inherit;border:0;background:none;color:var(--muted);cursor:pointer;font-size:18px;line-height:1}
.lb-propia{display:flex;gap:8px}
.lb-propia input{flex:1;min-width:0;font:inherit;font-size:14.5px;border:1px solid var(--line);background:var(--bg);color:var(--fg);border-radius:10px;padding:7px 10px}
.lb-acc{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:flex-end}
.lb-acc .hint{margin-right:auto}
.lb-ronda{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:18px;align-items:start}
@media (max-width:900px){.lb-ronda{grid-template-columns:minmax(0,1fr)}}
.lb-cab{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:baseline}
.lb-cab h3{font-family:var(--f-display);font-size:21px;margin:0}
.lb-cab .estado{font:700 11px var(--f-num);letter-spacing:.08em;text-transform:uppercase;border:1.5px solid currentColor;border-radius:6px;padding:1px 7px;color:var(--good)}
.lb-cab .estado.cerrada{color:var(--muted)}
.lb-cab small{color:var(--muted);font-size:13px}
.lb-gente{position:sticky;top:12px;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:12px}
@media (max-width:900px){.lb-gente{position:static}}
.lb-gente h4{margin:0;font-family:var(--f-display);font-size:16px;display:flex;justify-content:space-between;align-items:baseline}
.lb-gente h4 small{font:500 12px var(--f-num);color:var(--muted)}
.lb-boleto{position:relative;border:1px solid var(--line);border-radius:12px;padding:10px 12px 10px 16px;display:flex;flex-direction:column;gap:6px;background:var(--bg)}
.lb-boleto::before{content:"";position:absolute;left:-1px;top:50%;width:9px;height:18px;margin-top:-9px;border-radius:0 9px 9px 0;background:var(--card);border:1px solid var(--line);border-left:0}
.lb-boleto .fila{display:flex;justify-content:space-between;gap:8px;align-items:baseline}
.lb-boleto b{font-size:15px}
.lb-boleto .est{font-size:12.5px;color:var(--muted)}
.lb-boleto .est.ok{color:var(--good)}
.lb-boleto .enl{display:flex;gap:6px}
.lb-boleto .enl input{flex:1;min-width:0;font:12px var(--f-num);border:1px dashed var(--line);border-radius:8px;padding:5px 7px;background:var(--card);color:var(--muted)}
.lb-boleto.quitado{opacity:.55}
.lb-nuevo{display:flex;gap:6px}
.lb-nuevo input{flex:1;min-width:0;font:inherit;font-size:14.5px;border:1px solid var(--line);background:var(--bg);color:var(--fg);border-radius:10px;padding:7px 10px}
.lb-preg{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 16px;display:flex;flex-direction:column;gap:10px}
.lb-preg>h4{margin:0;font-size:15.5px;font-family:var(--f-display)}
.lb-voz{border-left:3px solid var(--line);padding:2px 0 2px 12px;display:flex;flex-direction:column;gap:6px}
.lb-voz.mejora{border-left-color:var(--ember)}.lb-voz.resuelta{border-left-color:var(--good);opacity:.75}.lb-voz.opinion{border-left-color:var(--accent)}
.lb-voz p{margin:0;white-space:pre-wrap;font-size:15px}
.lb-voz .quien{font-size:12.5px;color:var(--muted);display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center}
.lb-voz q{display:block;font-size:13px;color:var(--muted);font-style:italic;quotes:"«" "»"}
.lb-marcas{display:flex;gap:4px;flex-wrap:wrap}
.lb-marcas button{font:inherit;font-size:12px;border:1px solid var(--line);background:transparent;color:var(--muted);border-radius:10px;padding:2px 9px;cursor:pointer}
.lb-marcas button[aria-pressed="true"]{color:var(--fg);border-color:var(--fg);background:var(--field)}
.lb-senal{font:700 10.5px var(--f-num);letter-spacing:.06em;text-transform:uppercase;color:var(--ember)}
.lb-sin{color:var(--muted);font-size:14px;margin:0;border:1.5px dashed var(--line);border-radius:12px;padding:14px}
/* sala */
.sala{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:22px}
.sala-cab small{font:600 12px var(--f-num);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.sala-cab h1{font-family:var(--f-display);font-size:clamp(28px,6vw,40px);line-height:1.05;margin:4px 0 8px}
.sala-cab p{margin:0;color:var(--muted)}
.sala-intro{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;white-space:pre-wrap;margin:0}
.sala-parte{display:flex;flex-direction:column;gap:2px}
.sala-parte h2{font-family:var(--f-display);font-size:22px;margin:8px 0 6px}
.sala-p{position:relative;margin:0;padding:6px 10px;border-radius:8px;font-size:17px;line-height:1.7;cursor:pointer;white-space:pre-wrap}
.sala-p:hover{background:var(--field)}
.sala-p.con{background:color-mix(in srgb,var(--ember) 8%,transparent)}
.sala-p.con::after{content:attr(data-n);position:absolute;right:4px;top:-6px;font:700 11px var(--f-num);color:var(--card);background:var(--ember);border-radius:999px;min-width:18px;height:18px;display:grid;place-items:center;padding:0 5px}
.sala.leer .sala-p{cursor:default}
.sala-com{margin:4px 10px 10px;border:1px solid var(--line);border-radius:12px;background:var(--card);padding:10px 12px;display:flex;flex-direction:column;gap:8px}
.sala-com textarea{font:inherit;font-size:15px;border:1px solid var(--line);background:var(--bg);color:var(--fg);border-radius:10px;padding:8px 10px;min-height:64px;resize:vertical}
.sala-com .mio{display:flex;justify-content:space-between;gap:8px;font-size:14.5px;border-bottom:1px dashed var(--line);padding-bottom:6px}
.sala-com .mio button{font:inherit;font-size:12.5px;border:0;background:none;color:var(--muted);cursor:pointer;text-decoration:underline}
.sala-enl{display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px}
.sala-enl a{font-weight:700;text-decoration:none;border:1.5px solid var(--fg);color:var(--fg);border-radius:10px;padding:8px 14px;white-space:nowrap}
.sala-img{margin:0}.sala-img img{width:100%;border-radius:12px;display:block}.sala-img figcaption{font-size:13px;color:var(--muted);margin-top:4px}
.sala-preg{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:14px}
.sala-preg h2{font-family:var(--f-display);font-size:22px;margin:0}
.sala-preg label{display:flex;flex-direction:column;gap:6px;font-weight:700;font-size:15.5px}
.sala-preg textarea{font:inherit;font-weight:400;font-size:15.5px;border:1px solid var(--line);background:var(--bg);color:var(--fg);border-radius:12px;padding:10px 12px;min-height:90px;resize:vertical}
.sala-pie{text-align:center;font:500 12px var(--f-num);color:var(--muted);letter-spacing:.04em;border-top:1px dashed var(--line);padding-top:14px}
.sala-marca{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.035;background-repeat:repeat;background-size:360px 200px}
`;

/* ======================= herramienta del proyecto ======================= */
// ctx: { P, SECS, PL, panel, ed (puede manejar), volver (html del botón), conVolver(), alAbrir(), alCerrar(resumen) }
let RONDAS = [], sel = null, PANEL = null, borrador = null;

export async function vista(ctx) {
  const { P, panel } = ctx, Q = quienes(P.tipo);
  const { data, error } = await sb.from("rondas").select("id,numero,titulo,estado,cierra,contenido,preguntas,resumen,creado_en,cerrada_en").eq("proyecto_id", P.id).order("numero", { ascending: false });
  if (error) { panel.innerHTML = '<p class="fx-empty">No se pudieron cargar las rondas.</p>'; return; }
  RONDAS = data || [];
  if (sel && !RONDAS.some((r) => r.id === sel)) sel = null;
  if (!sel && RONDAS.length && !borrador) sel = (RONDAS.find((r) => r.estado === "abierta") || RONDAS[0]).id;
  const abiertas = RONDAS.filter((r) => r.estado === "abierta").length, puedeNueva = ctx.ed && (ctx.PL.mas || !abiertas);
  panel.innerHTML = '<section class="herr lb" style="--tc:' + ctx.tc + '"><div class="herr-cab">' + ctx.volver + "<div><h2>" + Q.titulo + '</h2><p class="hint">Comparte una copia de lo que quieras probar con pocas personas y hazles preguntas concretas. Nunca ven el proyecto real, y lo que cambies después no les llega hasta otra ronda.</p></div></div>' +
    (RONDAS.length ? '<div class="lb-rondas" role="group" aria-label="Rondas">' + RONDAS.map((r) => '<button type="button" data-ronda="' + r.id + '" aria-pressed="' + (r.id === sel && !borrador) + '">' + esc(r.titulo) + "<small>" + (r.estado === "abierta" ? "abierta" : "cerrada") + "</small></button>").join("") +
      (puedeNueva ? '<button type="button" data-nueva aria-pressed="' + !!borrador + '">+ Nueva ronda</button>' : "") + "</div>" : "") +
    '<div id="lb-cuerpo"></div></section>';
  ctx.conVolver();
  panel.querySelectorAll("[data-ronda]").forEach((b) => b.onclick = () => { sel = b.dataset.ronda; borrador = null; vista(ctx); });
  const bn = panel.querySelector("[data-nueva]"); if (bn) bn.onclick = () => { borrador = nuevoBorrador(ctx); vista(ctx); };
  const cuerpo = panel.querySelector("#lb-cuerpo");
  if (borrador) return formRonda(ctx, cuerpo);
  if (!RONDAS.length) return vacia(ctx, cuerpo);
  if (!ctx.PL.mas && abiertas && ctx.ed) cuerpo.dataset.nota = "";
  return ronda(ctx, cuerpo, RONDAS.find((r) => r.id === sel));
}

function vacia(ctx, el) {
  const Q = quienes(ctx.P.tipo);
  el.innerHTML = '<div class="lb-vacia"><div><h3>Tu primera ronda de ' + Q.plural + "</h3>" +
    "<p>Eliges qué mostrar (partes del Taller, el enlace a tu prototipo o imágenes), Forja guarda una copia y te da un enlace distinto para cada persona. Cada enlace queda amarrado a la primera cuenta que lo abre: si alguien lo reenvía, no le sirve a otra persona.</p>" +
    "<p>Leen o juegan en una sala sin menú del proyecto, responden tus preguntas y pueden comentar un párrafo. Tú ves todo junto por pregunta y Forja destaca lo que dos o más personas señalan.</p>" +
    (ctx.ed ? '<button type="button" class="btn prim" id="lb-empezar">Abrir la primera ronda</button>' : '<p class="hint">Solo quien edita el Taller puede abrir rondas.</p>') + "</div>" +
    '<div class="lb-circuito" aria-hidden="true">' + circuito(Q) + "</div></div>";
  const b = el.querySelector("#lb-empezar"); if (b) b.onclick = () => { borrador = nuevoBorrador(ctx); vista(ctx); };
}
// Dibujo del recorrido de una ronda: copia → enlaces → sala → respuestas → bitácora.
function circuito(Q) {
  const pts = [[14, 30, "Una copia", "lo que eliges"], [42, 18, "Un enlace", "por persona"], [70, 30, "La sala", Q.verbo + " y responder"], [80, 72, "Respuestas", "juntas por pregunta"], [36, 76, "Bitácora", "queda el resumen"]];
  const W = 320, H = 200, x = (p) => p * W / 100, y = (p) => p * H / 100;
  let s = '<svg viewBox="0 0 ' + W + " " + H + '"><path d="' + pts.map((p, i) => (i ? "L" : "M") + x(p[0]) + " " + y(p[1])).join(" ") + '" fill="none" stroke="var(--tc,var(--accent))" stroke-width="1.5" stroke-dasharray="4 5"/>';
  pts.forEach((p, i) => { s += '<circle cx="' + x(p[0]) + '" cy="' + y(p[1]) + '" r="' + (i === 2 ? 9 : 6) + '" fill="var(--card)" stroke="var(--fg)" stroke-width="1.5"/><text class="t" x="' + x(p[0]) + '" y="' + (y(p[1]) + 22) + '" text-anchor="middle">' + p[2] + '</text><text class="s" x="' + x(p[0]) + '" y="' + (y(p[1]) + 34) + '" text-anchor="middle">' + p[3] + "</text>"; });
  return s + "</svg>";
}

function nuevoBorrador(ctx) {
  const conTexto = ctx.SECS.filter((s) => (s.texto || "").trim());
  return { titulo: "Ronda " + (RONDAS.reduce((a, r) => Math.max(a, r.numero), 0) + 1), secs: new Set(conTexto.slice(0, 1).map((s) => s.id)), intro: "", enlaces: [{ titulo: "", url: "" }], imagenes: "", cierra: "",
    preguntas: preguntasDe(ctx.P.tipo).map((q) => ({ ...q, on: true })), propia: "" };
}
function formRonda(ctx, el) {
  const B = borrador, Q = quienes(ctx.P.tipo), mas = ctx.PL.mas;
  const pal = (t) => ((t || "").trim().match(/\S+/g) || []).length;
  el.innerHTML = '<form class="lb-form" id="lb-f" autocomplete="off"><h3>Abrir una ronda</h3>' +
    '<div class="lb-paso"><span class="n">1</span><b>Qué van a ' + Q.verbo + "</b><div>" +
      '<p class="hint" style="margin:0">Toca las partes del Taller que quieres mostrar. Se copian tal como están hoy.</p>' +
      '<div class="lb-elegir" id="lb-secs">' + (ctx.SECS.length ? ctx.SECS.map((s) => '<button type="button" data-sec="' + s.id + '" aria-pressed="' + B.secs.has(s.id) + '"' + ((s.texto || "").trim() ? "" : " disabled") + ">" + esc(s.titulo) + "<small>" + ((s.texto || "").trim() ? pal(s.texto).toLocaleString("es-CL") + " palabras" : "vacía") + "</small></button>").join("") : '<span class="hint">El Taller aún no tiene secciones.</span>') + "</div>" +
      '<div class="lb-dos"><label class="lb-f">Enlace a tu prototipo, demo o archivo (opcional)<input id="lb-url" type="url" placeholder="https://…" value="' + esc(B.enlaces[0].url) + '"></label>' +
      '<label class="lb-f">Cómo se llama ese enlace<input id="lb-urlt" maxlength="80" placeholder="Ej.: Demo jugable, PDF de las reglas" value="' + esc(B.enlaces[0].titulo) + '"></label></div>' +
      '<label class="lb-f">Imágenes por enlace, una por línea (opcional)<textarea id="lb-imgs" placeholder="https://i.ibb.co/…">' + esc(B.imagenes) + "</textarea></label>" +
      '<label class="lb-f">Un mensaje para quienes van a ' + Q.verbo + ' (opcional)<textarea id="lb-intro" maxlength="1500" placeholder="Ej.: Son los primeros capítulos. Me importa sobre todo si se entiende quién es quién.">' + esc(B.intro) + "</textarea></label></div></div>" +
    '<div class="lb-paso"><span class="n">2</span><b>Qué les vas a preguntar</b><div>' +
      '<div id="lb-preg">' + B.preguntas.map((q, i) => '<label class="lb-q"><input type="checkbox" data-q="' + i + '"' + (q.on ? " checked" : "") + "><span>" + esc(q.t) + "</span>" + (q.propia ? '<button type="button" class="x" data-qx="' + i + '" aria-label="Quitar la pregunta">×</button>' : "") + "</label>").join("") + "</div>" +
      (mas ? '<div class="lb-propia"><input id="lb-propia" maxlength="300" placeholder="Agrega una pregunta tuya" value="' + esc(B.propia) + '"><button type="button" class="btn" id="lb-propia-b">Agregar</button></div>'
        : '<a class="btn bloq-mas" href="../planes/" style="align-self:flex-start">Agregar preguntas propias <small>Forja Más</small></a>') + "</div></div>" +
    '<div class="lb-paso"><span class="n">3</span><b>Nombre y cierre</b><div><div class="lb-dos"><label class="lb-f">Nombre de la ronda<input id="lb-tit" maxlength="120" value="' + esc(B.titulo) + '"></label>' +
      '<label class="lb-f">Cierra el (opcional)<input id="lb-cierra" type="date" min="' + new Date().toISOString().slice(0, 10) + '" value="' + esc(B.cierra) + '"></label></div></div></div>' +
    '<div class="lb-acc"><span class="hint">' + (mas ? "Rondas sin límite." : "Plan gratis: una ronda abierta a la vez.") + " Hasta " + (ctx.tope ?? "∞") + " " + Q.plural + " por ronda.</span>" +
      (RONDAS.length ? '<button type="button" class="btn" id="lb-cancelar">Cancelar</button>' : '<button type="button" class="btn" id="lb-cancelar">Ahora no</button>') +
      '<button type="submit" class="btn prim" id="lb-ok">Abrir la ronda</button></div></form>';
  const f = el.querySelector("#lb-f"), leer = () => {
    B.enlaces = [{ url: f.querySelector("#lb-url").value.trim(), titulo: f.querySelector("#lb-urlt").value.trim() }];
    B.imagenes = f.querySelector("#lb-imgs").value; B.intro = f.querySelector("#lb-intro").value; B.titulo = f.querySelector("#lb-tit").value; B.cierra = f.querySelector("#lb-cierra").value;
    if (f.querySelector("#lb-propia")) B.propia = f.querySelector("#lb-propia").value;
  };
  f.querySelectorAll("[data-sec]").forEach((b) => b.onclick = () => { const id = b.dataset.sec; B.secs.has(id) ? B.secs.delete(id) : B.secs.add(id); b.setAttribute("aria-pressed", String(B.secs.has(id))); });
  f.querySelectorAll("[data-q]").forEach((c) => c.onchange = () => { B.preguntas[+c.dataset.q].on = c.checked; });
  f.querySelectorAll("[data-qx]").forEach((b) => b.onclick = (e) => { e.preventDefault(); leer(); B.preguntas.splice(+b.dataset.qx, 1); formRonda(ctx, el); });
  const bp = f.querySelector("#lb-propia-b");
  if (bp) bp.onclick = () => { leer(); const t = B.propia.trim(); if (t.length < 3) return; B.preguntas.push({ k: "p" + Date.now().toString(36), t, propia: true, on: true }); B.propia = ""; formRonda(ctx, el); };
  f.querySelector("#lb-cancelar").onclick = () => { borrador = null; vista(ctx); };
  f.onsubmit = async (e) => {
    e.preventDefault(); leer();
    const partes = ctx.SECS.filter((s) => B.secs.has(s.id) && (s.texto || "").trim()).map((s) => ({ tipo: "seccion", titulo: s.titulo, texto: s.texto }));
    const url = enlaceSeguro(B.enlaces[0].url);
    if (B.enlaces[0].url && !url) { toast("El enlace debe empezar con https://"); return; }
    if (url) partes.push({ tipo: "enlace", titulo: B.enlaces[0].titulo || "Abrir", url });
    B.imagenes.split(/\s+/).map(enlaceSeguro).filter(Boolean).slice(0, 20).forEach((im) => partes.push({ tipo: "imagen", url: im }));
    if (!partes.length) { toast("Elige al menos una parte del Taller, un enlace o una imagen."); return; }
    const preguntas = B.preguntas.filter((q) => q.on).map((q) => ({ k: q.k, t: q.t, ...(q.propia ? { propia: true } : {}) }));
    if (!preguntas.length) { toast("Deja al menos una pregunta."); return; }
    const ok = f.querySelector("#lb-ok"); ok.disabled = true; ok.textContent = "Abriendo…";
    const { data: id, error } = await sb.rpc("abrir_ronda", { p: ctx.P.id, titulo: B.titulo.trim(), contenido: { intro: B.intro.trim(), partes }, preguntas, cierra: B.cierra || null });
    if (error) { toast(limite(error) || "No se pudo abrir la ronda."); ok.disabled = false; ok.textContent = "Abrir la ronda"; return; }
    borrador = null; sel = id; toast("Ronda abierta. Ahora crea un enlace para cada persona.");
    ctx.alAbrir(); vista(ctx);
  };
}

async function ronda(ctx, el, R) {
  const Q = quienes(ctx.P.tipo);
  el.innerHTML = '<p class="hint">Cargando la ronda…</p>';
  const { data: D, error } = await sb.rpc("ronda_panel", { r: R.id });
  if (error || !D) { el.innerHTML = '<p class="fx-empty">No se pudo cargar la ronda.</p>'; return; }
  const abierta = R.estado === "abierta", maneja = D.maneja && ctx.ed, activos = D.lectores.filter((l) => !l.quitado), tope = D.tope;
  const nom = Object.fromEntries(D.lectores.map((l) => [l.id, l.nombre]));
  const preg = R.preguntas || [];
  const partes = (R.contenido && R.contenido.partes) || [];
  // Señal fuerte: dos o más personas comentan el mismo párrafo.
  const porLugar = {}; D.comentarios.forEach((c) => { const k = c.parte + "-" + c.parrafo; (porLugar[k] = porLugar[k] || new Set()).add(c.lector); });
  const fuerte = (c) => porLugar[c.parte + "-" + c.parrafo].size >= 2;
  const marcas = (tipo, x) => maneja ? '<span class="lb-marcas" role="group" aria-label="Cómo la tomas">' + Object.entries(MARCAS).map(([k, n]) => '<button type="button" data-marca="' + k + '" data-tipo="' + tipo + '" data-id="' + x.id + '" aria-pressed="' + (x.marca === k) + '">' + n + "</button>").join("") + "</span>" : (x.marca ? '<span class="lb-senal">' + MARCAS[x.marca] + "</span>" : "");
  const voz = (tipo, x, extra) => '<div class="lb-voz ' + (x.marca || "") + '">' + (extra || "") + "<p>" + esc(x.texto) + '</p><div class="quien"><span>' + esc(nom[x.lector] || "Alguien") + " · " + hace(x.en) + (tipo === "comentario" && fuerte(x) ? ' · <span class="lb-senal">Señal fuerte</span>' : "") + "</span>" + marcas(tipo, x) + "</div></div>";
  const resp = preg.map((q) => { const rs = D.respuestas.filter((r) => r.pregunta === q.k);
    return '<section class="lb-preg"><h4>' + esc(q.t) + "</h4>" + (rs.length ? rs.map((r) => voz("respuesta", r)).join("") : '<p class="lb-sin">Nadie ha respondido todavía.</p>') + "</section>"; }).join("");
  const coms = D.comentarios.length ? '<section class="lb-preg"><h4>Comentarios sobre párrafos</h4>' + D.comentarios.slice().sort((a, b) => (fuerte(b) - fuerte(a)) || a.parte - b.parte || a.parrafo - b.parrafo).map((c) => {
      const p = partes[c.parte]; return voz("comentario", c, '<q>' + esc((p && p.titulo ? p.titulo + ": " : "") + (c.cita || "")) + "</q>"); }).join("") + "</section>" : "";
  const enlace = (t) => u("prueba/?t=" + t);
  el.innerHTML = '<div class="lb-ronda"><div class="lb">' +
    '<div class="lb-cab"><h3>' + esc(R.titulo) + '</h3><span class="estado' + (abierta ? "" : " cerrada") + '">' + (abierta ? "Abierta" : "Cerrada") + "</span><small>" +
      partes.length + (partes.length === 1 ? " parte" : " partes") + " · " + preg.length + (preg.length === 1 ? " pregunta" : " preguntas") + (R.cierra ? " · " + (abierta ? "cierra el " : "cerraba el ") + fecha(R.cierra + "T12:00:00") : "") + "</small></div>" +
    (R.resumen ? '<p class="sala-intro">' + esc(R.resumen) + "</p>" : "") +
    (D.respuestas.length || D.comentarios.length ? resp + coms : '<p class="lb-sin">' + (abierta ? "Las respuestas aparecen aquí apenas alguien responda. Mientras tanto, crea los enlaces y mándalos por donde quieras." : "Esta ronda se cerró sin respuestas.") + "</p>" + (D.lectores.length ? resp : "")) +
    (maneja ? '<div class="lb-acc">' + (abierta ? '<button type="button" class="btn" id="lb-cerrar">Cerrar la ronda…</button>' : "") + (ctx.publica ? '<button type="button" class="btn peligro" id="lb-borrar">Borrar la ronda…</button>' : "") + "</div>" : "") +
    "</div>" +
    '<aside class="lb-gente"><h4>' + Q.titulo + " <small>" + activos.length + (tope != null ? " de " + tope : "") + "</small></h4>" +
    (maneja && abierta ? '<form class="lb-nuevo" id="lb-nuevo"><label class="fx-sr" for="lb-nom">Nombre de la persona</label><input id="lb-nom" maxlength="60" placeholder="Nombre de la persona"' + (tope != null && activos.length >= tope ? " disabled" : "") + '><button class="btn prim" type="submit"' + (tope != null && activos.length >= tope ? " disabled" : "") + ">Crear enlace</button></form>" +
      (tope != null && activos.length >= tope ? '<p class="hint" style="margin:0">Llegaste a las ' + tope + " personas de tu plan en esta ronda. Quita a alguien para invitar a otra. " + '<a href="../planes/">Ver planes</a></p>' : '<p class="hint" style="margin:0">Cada enlace es para una sola persona: cópialo y mándalo por donde quieras. Forja no envía correos para esto.</p>') : "") +
    (D.lectores.length ? D.lectores.map((l) => '<div class="lb-boleto' + (l.quitado ? " quitado" : "") + '" data-l="' + l.id + '"><div class="fila"><b>' + esc(l.nombre) + '</b><span class="est' + (l.respuestas || l.comentarios ? " ok" : "") + '">' +
        (l.quitado ? "Sin acceso" : l.respuestas || l.comentarios ? (l.respuestas + l.comentarios) + " aportes" : l.entro ? "Entró, aún sin responder" : "Aún no abre su enlace") + "</span></div>" +
        (l.token && abierta ? '<div class="enl"><input readonly value="' + esc(enlace(l.token)) + '" aria-label="Enlace de ' + esc(l.nombre) + '"><button type="button" class="btn chico" data-copiar="' + esc(enlace(l.token)) + '">Copiar</button></div>' : "") +
        (maneja && !l.quitado ? '<button type="button" class="btn chico" data-quitar style="align-self:flex-start">Quitar acceso</button>' : "") + "</div>").join("")
      : '<p class="lb-sin">Aún no hay ' + Q.plural + " en esta ronda.</p>") +
    "</aside></div>";
  el.querySelectorAll("[data-marca]").forEach((b) => b.onclick = async () => {
    const x = (b.dataset.tipo === "respuesta" ? D.respuestas : D.comentarios).find((y) => y.id === b.dataset.id), nueva = x.marca === b.dataset.marca ? null : b.dataset.marca;
    const { error } = await sb.rpc("marcar_opinion", { tipo: b.dataset.tipo, id: x.id, marca: nueva });
    if (error) { toast(limite(error) || "No se pudo marcar."); return; }
    x.marca = nueva; ronda(ctx, el, R);
  });
  el.querySelectorAll("[data-copiar]").forEach((b) => b.onclick = async () => { try { await navigator.clipboard.writeText(b.dataset.copiar); toast("Enlace copiado."); } catch (e) { b.previousElementSibling.select(); toast("Selecciónalo y cópialo."); } });
  el.querySelectorAll("[data-quitar]").forEach((b) => b.onclick = async () => {
    if (b.dataset.seguro !== "1") { b.dataset.seguro = "1"; b.textContent = "¿Seguro? Toca de nuevo"; return; }
    const { error } = await sb.rpc("quitar_lector", { l: b.closest("[data-l]").dataset.l });
    if (error) { toast(limite(error) || "No se pudo quitar."); return; }
    toast("Listo: su enlace ya no funciona."); ronda(ctx, el, R);
  });
  const fn = el.querySelector("#lb-nuevo");
  if (fn) fn.onsubmit = async (e) => {
    e.preventDefault(); const nombre = fn.querySelector("#lb-nom").value.trim(); if (!nombre) { fn.querySelector("#lb-nom").focus(); return; }
    const { data: tk, error } = await sb.rpc("invitar_lector", { r: R.id, nombre });
    if (error) { toast(limite(error) || "No se pudo crear el enlace."); return; }
    try { await navigator.clipboard.writeText(enlace(tk)); toast("Enlace de " + nombre + " creado y copiado."); } catch (er) { toast("Enlace de " + nombre + " creado."); }
    ronda(ctx, el, R);
  };
  const bc = el.querySelector("#lb-cerrar");
  if (bc) bc.onclick = async () => {
    if (bc.dataset.seguro !== "1") { bc.dataset.seguro = "1"; bc.textContent = "Nadie podrá responder más. ¿Cerrar?"; return; }
    const { data: res, error } = await sb.rpc("cerrar_ronda", { r: R.id, palabra: Q.palabra });
    if (error) { toast(limite(error) || "No se pudo cerrar."); return; }
    toast("Ronda cerrada. La Bitácora anotó: " + res); ctx.alCerrar(res); vista(ctx);
  };
  const bb = el.querySelector("#lb-borrar");
  if (bb) bb.onclick = async () => {
    if (bb.dataset.seguro !== "1") { bb.dataset.seguro = "1"; bb.textContent = "Se borran también sus respuestas. ¿Borrar?"; return; }
    const { error } = await sb.rpc("borrar_ronda", { r: R.id });
    if (error) { toast(limite(error) || "No se pudo borrar."); return; }
    sel = null; toast("Ronda borrada."); vista(ctx);
  };
}

/* ======================= sala de quien lee ======================= */
// Lo que se muestra de la copia: secciones por párrafos (se tocan para comentar), enlaces e imágenes.
export function pintarSala(el, D, tk) {
  const Q = quienes(D.tipo), abierta = !!D.abierta;
  let coms = D.comentarios || [], resp = { ...(D.respuestas || {}) }, abiertoEn = null;
  const marca = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="360" height="200"><text x="20" y="110" transform="rotate(-18 180 100)" font-family="sans-serif" font-size="15" fill="#000">Copia para ' + String(D.copia_para || "").replace(/[<&>"]/g, "") + "</text></svg>");
  const pintar = () => {
    const partes = (D.contenido && D.contenido.partes) || [];
    el.innerHTML = '<div class="sala-marca" style="background-image:url(\'' + marca + '\')" aria-hidden="true"></div><article class="sala' + (abierta ? "" : " leer") + '" style="position:relative;z-index:1">' +
      '<header class="sala-cab"><small>' + esc(D.titulo) + " · para " + esc(D.nombre) + "</small><h1>" + esc(D.proyecto) + "</h1><p>" +
        (abierta ? "Esto es una copia para " + Q.verbo + " y opinar. " + (partes.some((p) => p.tipo === "seccion") ? "Toca un párrafo para comentarlo. " : "") + "Al final están las preguntas." + (D.cierra ? " Puedes responder hasta el " + fecha(D.cierra + "T12:00:00") + "." : "")
          : "Esta ronda ya cerró: puedes leer lo que respondiste, pero no cambiarlo.") + "</p></header>" +
      (D.contenido && D.contenido.intro ? '<p class="sala-intro">' + esc(D.contenido.intro) + "</p>" : "") +
      partes.map((p, i) => {
        if (p.tipo === "enlace") { const url = enlaceSeguro(p.url); return url ? '<div class="sala-enl"><span>' + esc(p.titulo || "Enlace") + '</span><a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">Abrir ↗</a></div>' : ""; }
        if (p.tipo === "imagen") { const url = enlaceSeguro(p.url); return url ? '<figure class="sala-img"><img src="' + esc(url) + '" alt="' + esc(p.pie || "Imagen de la ronda") + '" loading="lazy">' + (p.pie ? "<figcaption>" + esc(p.pie) + "</figcaption>" : "") + "</figure>" : ""; }
        return '<section class="sala-parte">' + (p.titulo ? "<h2>" + esc(p.titulo) + "</h2>" : "") + parrafos(p.texto).map((t, j) => {
          const mios = coms.filter((c) => c.parte === i && c.parrafo === j), k = i + "-" + j;
          return '<p class="sala-p' + (mios.length ? " con" : "") + '" data-p="' + k + '"' + (mios.length ? ' data-n="' + mios.length + '"' : "") + (abierta ? ' tabindex="0" role="button" aria-label="Comentar este párrafo"' : "") + ">" + esc(t) + "</p>" +
            (abiertoEn === k || (!abierta && mios.length) ? '<div class="sala-com">' + mios.map((c) => '<div class="mio"><span>' + esc(c.texto) + "</span>" + (abierta ? '<button type="button" data-borrar="' + c.id + '">Borrar</button>' : "") + "</div>").join("") +
              (abierta && abiertoEn === k ? '<textarea maxlength="2000" placeholder="¿Qué te pasó al leer esto?" data-com="' + k + '"></textarea><div class="lb-acc"><button type="button" class="btn chico" data-cerrar>Cerrar</button><button type="button" class="btn chico prim" data-guardar="' + k + '">Guardar comentario</button></div>' : "") + "</div>" : "");
        }).join("") + "</section>";
      }).join("") +
      '<section class="sala-preg" id="preguntas"><h2>Tus respuestas</h2>' + (D.preguntas || []).map((q) => '<label>' + esc(q.t) + '<textarea data-q="' + esc(q.k) + '" maxlength="4000"' + (abierta ? "" : " readonly") + ">" + esc(resp[q.k] || "") + "</textarea></label>").join("") +
        (abierta ? '<div class="lb-acc"><span class="hint" id="sala-estado">Se guarda solo mientras escribes.</span><button type="button" class="btn" id="sala-borrar">Borrar todo lo que respondí</button></div>' : "") + "</section>" +
      '<p class="sala-pie">Copia para ' + esc(D.copia_para || D.nombre) + " · no la compartas · Forja</p></article>";
    if (!abierta) return;
    el.querySelectorAll("[data-p]").forEach((p) => { const abrir = () => { abiertoEn = abiertoEn === p.dataset.p ? null : p.dataset.p; pintar(); const t = el.querySelector("[data-com]"); if (t) t.focus(); }; p.onclick = abrir; p.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(); } }; });
    const c = el.querySelector("[data-cerrar]"); if (c) c.onclick = () => { abiertoEn = null; pintar(); };
    const g = el.querySelector("[data-guardar]");
    if (g) g.onclick = async () => {
      const [i, j] = g.dataset.guardar.split("-").map(Number), texto = el.querySelector("[data-com]").value.trim(); if (!texto) return;
      const parte = D.contenido.partes[i], cita = parrafos(parte.texto)[j].slice(0, 200);
      const { data: id, error } = await sb.rpc("comentar_ronda", { t: tk, parte: i, parrafo: j, cita, texto });
      if (error) { toast(limite(error) || "No se pudo guardar el comentario."); return; }
      coms = [...coms, { id, parte: i, parrafo: j, cita, texto }]; abiertoEn = null; pintar(); toast("Comentario guardado.");
    };
    el.querySelectorAll("[data-borrar]").forEach((b) => b.onclick = async () => {
      const { error } = await sb.rpc("borrar_comentario_ronda", { t: tk, c: b.dataset.borrar });
      if (error) { toast(limite(error) || "No se pudo borrar."); return; }
      coms = coms.filter((x) => x.id !== b.dataset.borrar); pintar();
    });
    let pend = {}, tm = null;
    const guardarR = async () => {
      const envio = pend; pend = {}; const est = el.querySelector("#sala-estado");
      const { error } = await sb.rpc("responder_ronda", { t: tk, respuestas: envio });
      if (est) est.textContent = error ? (limite(error) || "No se pudo guardar. Revisa tu conexión.") : "Guardado.";
    };
    el.querySelectorAll("[data-q]").forEach((t) => t.oninput = () => { resp[t.dataset.q] = t.value; pend[t.dataset.q] = t.value; const est = el.querySelector("#sala-estado"); if (est) est.textContent = "Guardando…"; clearTimeout(tm); tm = setTimeout(guardarR, 900); });
    const bb = el.querySelector("#sala-borrar");
    bb.onclick = async () => {
      if (bb.dataset.seguro !== "1") { bb.dataset.seguro = "1"; bb.textContent = "¿Borrar respuestas y comentarios?"; return; }
      const { error } = await sb.rpc("borrar_mis_respuestas", { t: tk });
      if (error) { toast(limite(error) || "No se pudo borrar."); return; }
      resp = {}; coms = []; pintar(); toast("Listo: borramos todo lo que respondiste.");
    };
  };
  pintar();
}
