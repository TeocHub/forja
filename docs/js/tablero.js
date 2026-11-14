// Forja · Tablero de producción (desde el 2026-11-14, para todas las cuentas).
// Las piezas del proyecto (una página, una función, un sprite, un reel, una carta) pasan por estados en columnas,
// cada una con su oficio, responsable y fecha. Vive en Crear (vista #tablero, área de permisos «tablero»).
// Tablas public.tableros (columnas [{k, n}], la última cuenta como «lista») y public.piezas (estado = clave de columna).
// Gratis: 1 tablero por proyecto (TOPES.tableros = privado.tope 'tableros'); Forja Más y Estudio, sin límite.
// La lista de oficios es la de la Bitácora (OFICIOS de bitacora.js = checks de notas y piezas).
import { OFICIOS, oficioDe } from "./bitacora.js";

// Plantillas: columnas por donde pasa cada pieza y las clases de pieza con su oficio por defecto.
// `serie` = nombre para numerar («Página 1…24»). Cambiar la lista de claves junto con el check de public.tableros.
export const PLANTILLAS = {
  funciones: { n: "Funciones y assets", d: "Lo que hay que programar, dibujar y componer para tu juego, de la idea a probado.",
    col: [["hacer", "Por hacer"], ["proceso", "En proceso"], ["probando", "Probando"], ["lista", "Lista"]],
    clases: [["Función", "codigo"], ["Nivel", "diseno"], ["Personaje", "arte"], ["Escenario", "arte"], ["Animación", "arte"], ["Sonido", "sonido"], ["Música", "sonido"], ["Interfaz", "diseno"], ["Error", "codigo"]],
    base: "Función", ej: "Salto doble" },
  paginas: { n: "Páginas", d: "Cada página de tu cómic, del boceto a las letras.",
    col: [["boceto", "Boceto"], ["lapiz", "Lápiz"], ["tinta", "Tinta"], ["color", "Color"], ["letras", "Letras"], ["lista", "Lista"]],
    clases: [["Página", "arte"], ["Portada", "arte"], ["Ilustración", "arte"], ["Guion", "escritura"]],
    base: "Página", serie: "Página", ej: "Página 1" },
  capitulos: { n: "Capítulos", d: "Cada capítulo o escena, del borrador a listo para leer.",
    col: [["escribir", "Por escribir"], ["borrador", "Borrador"], ["revision", "Revisión"], ["correccion", "Corrección"], ["listo", "Listo"]],
    clases: [["Capítulo", "escritura"], ["Escena", "escritura"], ["Ilustración", "arte"], ["Portada", "diseno"]],
    base: "Capítulo", serie: "Capítulo", ej: "Capítulo 1" },
  publicaciones: { n: "Publicaciones", d: "Cada publicación, de la idea a publicada, con su fecha.",
    col: [["idea", "Idea"], ["guion", "Guion"], ["grabar", "Grabación"], ["edicion", "Edición"], ["programada", "Programada"], ["publicada", "Publicada"]],
    clases: [["Reel", "produccion"], ["Video", "produccion"], ["Carrusel", "diseno"], ["Post", "escritura"], ["Historia", "produccion"], ["Episodio", "sonido"]],
    base: "Reel", ej: "Reel del proceso" },
  prototipo: { n: "Piezas del prototipo", d: "Cartas, tablero, fichas y reglamento, del diseño a probados en mesa.",
    col: [["hacer", "Por hacer"], ["diseno", "Diseño"], ["imprimir", "Para imprimir"], ["prueba", "En prueba"], ["lista", "Lista"]],
    clases: [["Carta", "diseno"], ["Tablero", "arte"], ["Ficha", "diseno"], ["Dado", "produccion"], ["Caja", "arte"], ["Reglamento", "escritura"]],
    base: "Carta", ej: "Mazo de eventos" },
  variantes: { n: "Variantes", d: "Cada variante, empaque o muestra, de la idea a aprobada.",
    col: [["idea", "Idea"], ["diseno", "Diseño"], ["muestra", "Muestra"], ["aprobada", "Aprobada"], ["lista", "Lista"]],
    clases: [["Variante", "diseno"], ["Empaque", "diseno"], ["Etiqueta", "diseno"], ["Foto", "arte"], ["Muestra", "produccion"]],
    base: "Variante", ej: "Color bosque" },
  libre: { n: "Libre", d: "Tres columnas para cualquier cosa. Puedes renombrarlas y sumar más.",
    col: [["hacer", "Por hacer"], ["haciendo", "Haciendo"], ["listo", "Listo"]], clases: [], base: null, ej: "Lo primero que harás" },
};
// Qué plantillas ofrece cada categoría (la primera es la sugerida).
export const DE_TIPO = {
  historia: ["capitulos", "libre"], comic: ["paginas", "capitulos", "libre"], videojuego: ["funciones", "libre"],
  juegomesa: ["prototipo", "libre"], contenido: ["publicaciones", "libre"], producto: ["variantes", "libre"],
};
export const plantillasDe = (tipo) => DE_TIPO[tipo] || Object.keys(PLANTILLAS);
export const columnasDe = (pl) => (PLANTILLAS[pl] || PLANTILLAS.libre).col.map(([k, n]) => ({ k, n }));
// Cuántas listas: lo que está en la última columna de cada tablero.
export const resumen = (tableros, piezas) => ({ total: piezas.length, listas: piezas.filter((z) => z.hecho_en).length });

const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];
const hoyISO = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const dias = (f) => Math.round((new Date(f + "T12:00:00") - new Date(hoyISO() + "T12:00:00")) / 864e5);
const fechaCorta = (f) => { const d = new Date(f + "T12:00:00"); return d.getDate() + " " + MES[d.getMonth()]; };
const limpio = (u) => { try { const x = new URL(u); return x.protocol === "https:" ? x.href : null; } catch (e) { return null; } };
const inicial = (n) => (n || "?").replace(/[^a-záéíóúñ0-9]/gi, "").slice(0, 2).toUpperCase() || "?";
const svg = (d, t = 16) => '<svg viewBox="0 0 24 24" width="' + t + '" height="' + t + '" aria-hidden="true"><path d="' + d + '"/></svg>';
const I = { mas: "M12 5v14 M5 12h14", flecha: "M5 12h13 M13 7l5 5-5 5", enlace: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  cal: "M4 6h16v14H4z M4 10h16 M8 3v5 M16 3v5", lapiz: "M4 20l4-1 11-11-3-3L5 16z", candado: "M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3", nota: "M6 4h12v16H6z M9 9h6 M9 13h6" };
const clave = (n) => (n || "col").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 16) || "col";

export const CSS_TABLERO = `
.tb{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;margin-top:14px;min-width:0}
.tb>*{min-width:0}
.tb-cab{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:10px 16px}
.tb-cab h2{margin:0;font-family:var(--f-display);font-weight:800;font-stretch:110%;font-size:24px}
.tb-cab .hint{margin:4px 0 0;max-width:60ch}
.tb-chips{display:flex;gap:8px;flex-wrap:wrap}
.tb-chip{font:inherit;font-size:14px;min-height:40px;padding:0 14px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--fg);cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.tb-chip small{font:700 12px var(--f-num);color:var(--muted)}
.tb-chip[aria-selected="true"]{background:var(--fg);color:var(--bg);border-color:var(--fg)}
.tb-chip[aria-selected="true"] small{color:inherit}
.tb-chip svg,.tb-btn svg,.tb-z svg,.tb-sello svg,.tb-col-mas svg,.tb-lock svg{fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.tb-btn{font:inherit;font-size:14px;min-height:40px;padding:0 13px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--fg);cursor:pointer;display:inline-flex;align-items:center;gap:6px;text-decoration:none}
.tb-btn:hover{border-color:var(--fg)}
.tb-btn.prim{background:var(--btn);border-color:var(--btn);color:var(--btn-tx);font-weight:700}
.tb-btn.peligro{color:var(--bad)}
.tb-btn:disabled{opacity:.45;cursor:default}
/* Elegir plantilla: cada una muestra su recorrido como una tira de etapas */
.tb-plant{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;padding:16px;border-radius:14px;background:var(--mesa)}
.tb-pl{font:inherit;text-align:left;color:var(--fg);background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:10px;cursor:pointer;box-shadow:0 5px 14px var(--sombra);transition:transform .15s ease}
.tb-pl:hover{transform:translateY(-2px);border-color:var(--fg)}
.tb-pl b{font-family:var(--f-display);font-weight:800;font-stretch:110%;font-size:19px}
.tb-pl small{color:var(--muted);font-size:13.5px;line-height:1.4}
.tb-pl .sug{align-self:flex-start;font:700 11px var(--f-num);text-transform:uppercase;letter-spacing:.05em;color:var(--card);background:var(--tc);border-radius:4px;padding:2px 7px}
.tb-tira{display:flex;align-items:stretch;gap:3px;margin-top:2px}
.tb-tira i{flex:1;font-style:normal;font:600 10.5px var(--f-num);color:var(--muted);background:var(--suave);border-radius:4px;padding:5px 3px;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tb-tira i:last-child{background:var(--tc);color:var(--card)}
/* La regla de producción: cada columna es un tramo, del gris al color del proyecto */
.tb-regla{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;display:grid;gap:10px}
.tb-regla-top{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap}
.tb-regla-top input{font:800 19px var(--f-display);font-stretch:110%;color:var(--fg);background:transparent;border:1px solid transparent;border-radius:8px;padding:2px 6px;margin-left:-7px;min-width:0;flex:1 1 200px}
.tb-regla-top input:hover:not(:disabled),.tb-regla-top input:focus{border-color:var(--line);background:var(--field)}
.tb-regla-top .acc{display:flex;gap:6px;flex-wrap:wrap}
.tb-tramos{display:flex;height:34px;border-radius:9px;overflow:hidden;border:1px solid var(--line);background:var(--mesa)}
.tb-tramo{font:inherit;border:0;border-left:1px solid var(--card);min-width:30px;display:flex;align-items:center;justify-content:center;font:700 12px var(--f-num);color:var(--fg);background:color-mix(in srgb,var(--tc) var(--p),var(--suave));cursor:pointer;padding:0 6px;overflow:hidden;white-space:nowrap}
.tb-tramo:first-child{border-left:0}
.tb-tramo.fin{color:var(--card);background:var(--tc)}
.tb-tramo.vacio{flex:0 0 30px;background:transparent;color:var(--muted)}
.tb-dice{margin:0;color:var(--muted);font-size:14.5px;line-height:1.45}
.tb-dice strong{color:var(--fg)}
.tb-filtros{display:flex;gap:8px;flex-wrap:wrap}
.tb-f{font:inherit;font-size:13.5px;display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--fg);cursor:pointer}
.tb-f small{font:700 12px var(--f-num);color:var(--muted)}
.tb-f[aria-pressed="true"]{border-color:var(--fg);background:var(--fg);color:var(--bg)}
.tb-f[aria-pressed="true"] small{color:inherit}
.tb-f.atr:not([aria-pressed="true"]){border-color:color-mix(in srgb,var(--warn) 55%,var(--line));color:var(--warn)}
.tb-lock{display:flex;gap:10px;align-items:center;border:1.5px solid var(--e-pausa,var(--warn));background:color-mix(in srgb,var(--warn) 8%,var(--card));border-radius:12px;padding:10px 14px;font-size:14px}
.tb-lock svg{flex:none;fill:none;stroke:currentColor;stroke-width:1.9}
/* Las columnas */
.tb-cols{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(232px,1fr);gap:12px;overflow-x:auto;padding:4px 2px 14px;scroll-snap-type:x proximity;overscroll-behavior-x:contain}
.tb-col{background:var(--mesa);border-radius:14px;display:flex;flex-direction:column;min-width:0;min-height:180px;scroll-snap-align:start;border:1px solid transparent}
.tb-col.encima{border-color:var(--tc);background:color-mix(in srgb,var(--tc) 8%,var(--mesa))}
.tb-col-cab{display:flex;align-items:center;gap:8px;padding:12px 14px 8px;position:sticky;top:0}
.tb-col-cab b{font-family:var(--f-display);font-weight:800;font-size:16px;font-stretch:105%}
.tb-col-cab .n{font:700 12px var(--f-num);color:var(--muted);margin-left:auto}
.tb-col-cab i{width:9px;height:9px;border-radius:50%;flex:none;background:color-mix(in srgb,var(--tc) var(--p),var(--line))}
.tb-col.fin .tb-col-cab i{background:var(--tc)}
.tb-col-z{display:flex;flex-direction:column;gap:8px;padding:2px 10px 10px;flex:1;min-height:40px}
.tb-z{position:relative;min-width:0;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px 9px;display:grid;gap:6px;cursor:pointer;box-shadow:0 2px 6px var(--sombra);-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;touch-action:manipulation}
.tb-z:hover{border-color:color-mix(in srgb,var(--fg) 40%,var(--line))}
.tb-z:focus-visible{outline:2px solid var(--tc);outline-offset:2px}
.tb-z.fin{border-left:3px solid var(--tc)}
.tb-z.atr{border-left:3px solid var(--warn)}
.tb-z.yendo{opacity:.35;border-style:dashed;box-shadow:none}
.tb-z.fantasma{position:fixed;z-index:90;pointer-events:none;transform:rotate(2deg);box-shadow:0 14px 30px var(--sombra);opacity:.96;margin:0}
.tb-z-top{display:flex;gap:6px;align-items:center;font:600 11.5px var(--f-num);color:var(--muted);min-height:16px}
.tb-z-top .cl{text-transform:uppercase;letter-spacing:.04em}
.tb-z-top .fe{margin-left:auto;display:inline-flex;gap:4px;align-items:center}
.tb-z-top .fe.atr{color:var(--warn);font-weight:700}
.tb-z-top .fe.pronto{color:var(--fg)}
.tb-z b{font-weight:700;font-size:15px;line-height:1.3;overflow-wrap:anywhere}
.tb-z-pie{display:flex;align-items:center;gap:6px;min-height:28px;flex-wrap:wrap;min-width:0}
.tb-z-pie .of{font-size:12px;border:1px solid var(--line);border-radius:4px;padding:1px 7px;color:var(--muted)}
.tb-z-pie .ic{color:var(--muted);display:inline-flex}
.tb-z-pie .der{margin-left:auto;display:flex;gap:6px;align-items:center}
.tb-z-pie .quien{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font:700 11px var(--f-num);background:var(--suave);color:var(--fg);border:1.5px solid var(--card)}
.tb-z-pie .quien.yo{border-color:var(--tc)}
.tb-z-pie .sig{width:32px;height:28px;border-radius:7px;border:1px solid var(--line);background:var(--card);color:var(--fg);display:grid;place-items:center;cursor:pointer;padding:0}
.tb-z-pie .sig:hover{border-color:var(--tc);color:var(--tc)}
.tb-col-mas{padding:0 10px 12px}
.tb-col-mas button{font:inherit;width:100%;min-height:40px;border:1px dashed var(--line);border-radius:10px;background:transparent;color:var(--muted);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px}
.tb-col-mas button:hover{border-color:var(--fg);color:var(--fg)}
.tb-col-mas form{display:grid;gap:6px}
.tb-col-mas input{font:inherit;font-size:16px;width:100%;min-height:42px;border:1px solid var(--tc);border-radius:10px;background:var(--card);color:var(--fg);padding:8px 10px}
.tb-col-mas .fila{display:flex;gap:6px;justify-content:flex-end}
.tb-vacia{margin:4px 0 0;font-size:13px;color:var(--muted);text-align:center;padding:10px 6px;border:1px dashed var(--line);border-radius:10px}
.tb-vacia button{margin-top:8px}
/* Diálogos */
dialog.tb-d{border:0;border-radius:18px;padding:0;width:min(560px,calc(100vw - 20px));max-height:calc(100dvh - 24px);background:var(--card);color:var(--fg);box-shadow:0 24px 70px rgba(0,0,0,.32)}
dialog.tb-d::backdrop{background:rgba(10,12,20,.5)}
.tb-d-in{display:grid;gap:16px;padding:20px 22px 18px}
.tb-d-cab{display:flex;gap:10px;align-items:flex-start}
.tb-d-cab h3{margin:0;font-family:var(--f-display);font-weight:800;font-stretch:110%;font-size:21px;flex:1}
.tb-d-cab textarea{flex:1;font:800 20px var(--f-display);font-stretch:105%;color:var(--fg);background:var(--field);border:1px solid var(--line);border-radius:10px;padding:8px 10px;resize:none;min-height:46px;line-height:1.25}
.tb-x{font:inherit;font-size:22px;line-height:1;width:40px;height:40px;flex:none;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--fg);cursor:pointer}
.tb-g{display:grid;gap:7px}
.tb-g>span,.tb-g>label{font:700 12px var(--f-num);color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
.tb-sellos{display:flex;flex-wrap:wrap;gap:6px}
.tb-sello{font:inherit;font-size:14px;display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 12px;border-radius:8px;border:1px dashed var(--line);background:transparent;color:var(--fg);cursor:pointer}
.tb-sello:disabled{cursor:default}
.tb-sello[aria-checked="true"],.tb-sello[aria-pressed="true"]{border:1px solid var(--tc);background:color-mix(in srgb,var(--tc) 14%,var(--card));font-weight:700}
.tb-via{display:flex;gap:0;flex-wrap:wrap}
.tb-via .tb-sello{border-radius:0;margin-left:-1px}
.tb-via .tb-sello:first-child{border-radius:8px 0 0 8px;margin-left:0}
.tb-via .tb-sello:last-child{border-radius:0 8px 8px 0}
.tb-via .tb-sello[aria-checked="true"]{position:relative;z-index:1}
.tb-d input[type=text],.tb-d input[type=date],.tb-d input[type=number],.tb-d textarea.nota{font:inherit;font-size:16px;color:var(--fg);background:var(--field);border:1px solid var(--line);border-radius:10px;padding:9px 12px;min-height:44px;width:100%}
.tb-d textarea.nota{min-height:84px;resize:vertical;line-height:1.45}
.tb-fila{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.tb-fila>input{flex:1 1 140px;width:auto}
.tb-d-pie{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:14px}
.tb-d-pie .hint{font-size:13px;color:var(--muted)}
.tb-col-ed{display:grid;gap:8px}
.tb-col-ed .r{display:flex;gap:6px;align-items:center}
.tb-col-ed .r input{flex:1;width:auto}
.tb-col-ed .r small{font:700 11px var(--f-num);color:var(--muted);min-width:40px;text-align:right}
.tb-col-ed .r button{font:inherit;width:38px;height:40px;border-radius:9px;border:1px solid var(--line);background:var(--card);color:var(--fg);cursor:pointer;flex:none}
.tb-col-ed .r button:disabled{opacity:.35;cursor:default}
.tb-col-ed .r.fin input{border-color:var(--tc)}
.tb-prev{margin:0;font-size:14px;color:var(--muted)}
@media (max-width:640px){
  .tb-cols{grid-auto-columns:82%;gap:10px}
  .tb-cab h2{font-size:21px}
  .tb-plant{padding:12px}
  dialog.tb-d{width:100vw;max-width:100vw;margin:auto 0 0;border-radius:18px 18px 0 0;max-height:92dvh}
  .tb-d-in{padding:18px 16px 16px}
}
@media (prefers-reduced-motion:reduce){.tb-pl{transition:none}}
`;

// Cada pieza en orden dentro de su columna.
const enOrden = (a, b) => a.orden - b.orden || String(a.creado_en).localeCompare(String(b.creado_en));
const CAMPOS = "id,tablero_id,titulo,estado,clase,oficio,responsable,fecha,enlace,nota,orden,hecho_en,creado_en";

// ctx: { panel, P, ESP, PL, sb, esc, toast, limite, tc, ed, tope, u, marcarHecho(id), alCambiar({tableros, piezas}) }
export async function vista(ctx) {
  const { panel, P, sb, esc, toast } = ctx;
  panel.innerHTML = '<div class="fx-empty">Abriendo el Tablero…</div>';
  const [rt, rz, rp] = await Promise.all([
    sb.from("tableros").select("id,nombre,plantilla,columnas,creado_en").eq("proyecto_id", P.id).order("creado_en").order("id"),
    sb.from("piezas").select(CAMPOS).eq("proyecto_id", P.id),
    sb.rpc("tablero_personas", { p: P.id }),
  ]);
  if (rt.error || rz.error) { panel.innerHTML = '<div class="fx-empty">No se pudo abrir el Tablero. Revisa tu conexión y recarga la página.</div>'; return; }
  let T = rt.data || [], Z = rz.data || [];
  const PERS = rp.data || [], YO = (PERS.find((x) => x.yo) || {}).id || null;
  const persona = (id) => PERS.find((x) => x.id === id) || null;
  const tope = ctx.tope("tableros");
  let sel = null; try { sel = localStorage.getItem("forja-tablero-" + P.id); } catch (e) {}
  const F = { oficio: null, persona: null, atr: false };
  const avisar = () => ctx.alCambiar({ tableros: T, piezas: Z });

  const tablero = () => T.find((t) => t.id === sel) || null;
  const editableT = (t) => ctx.ed && (tope == null || T.indexOf(t) < tope);
  const cols = (t) => (Array.isArray(t.columnas) && t.columnas.length >= 2 ? t.columnas : columnasDe(t.plantilla));
  const ultima = (t) => cols(t)[cols(t).length - 1].k;
  const plDe = (t) => PLANTILLAS[t.plantilla] || PLANTILLAS.libre;
  const deT = (t) => Z.filter((z) => z.tablero_id === t.id);
  const atrasada = (z, t) => z.fecha && z.estado !== ultima(t) && dias(z.fecha) < 0;

  function pintar() {
    if (!T.some((t) => t.id === sel)) sel = T.length ? T[0].id : null;
    const t = tablero();
    panel.innerHTML = '<section class="tb" style="--tc:' + ctx.tc + '">' +
      '<div class="tb-cab"><div><h2>Tablero de producción</h2><p class="hint">Cada pieza de tu proyecto pasa por sus etapas, con quién la hace y para cuándo.</p></div>' +
      (T.length ? '<div class="tb-chips" role="tablist" aria-label="Tableros del proyecto">' + T.map((x) => '<button type="button" role="tab" class="tb-chip" data-t="' + x.id + '" aria-selected="' + (x.id === sel) + '">' +
        (editableT(x) || !ctx.ed ? "" : svg(I.candado, 14)) + esc(x.nombre) + " <small>" + deT(x).filter((z) => z.hecho_en).length + "/" + deT(x).length + "</small></button>").join("") +
        (ctx.ed ? '<button type="button" class="tb-chip" id="tb-nuevo" aria-expanded="false">' + svg(I.mas, 14) + "Nuevo tablero</button>" : "") + "</div>" : "") + "</div>" +
      '<div id="tb-elegir"></div><div id="tb-cuerpo"></div></section>';
    const q = (s) => panel.querySelector(s);
    panel.querySelectorAll("[data-t]").forEach((b) => b.onclick = () => { sel = b.dataset.t; try { localStorage.setItem("forja-tablero-" + P.id, sel); } catch (e) {} pintar(); });
    if (q("#tb-nuevo")) q("#tb-nuevo").onclick = () => { const ab = q("#tb-nuevo").getAttribute("aria-expanded") === "true"; q("#tb-nuevo").setAttribute("aria-expanded", String(!ab)); if (ab) q("#tb-elegir").innerHTML = ""; else elegir(q("#tb-elegir")); };
    if (!t) { if (ctx.ed) elegir(q("#tb-elegir"), true); else q("#tb-cuerpo").innerHTML = '<p class="hint">Este proyecto todavía no tiene tablero.</p>'; return; }
    cuerpo(t, q("#tb-cuerpo"));
  }

  // --- Elegir plantilla (primer tablero o uno nuevo) ---
  function elegir(w, primero) {
    if (!primero && tope != null && T.length >= tope) {
      w.innerHTML = '<div class="tb-lock">' + svg(I.candado, 18) + '<span>El plan gratis incluye un tablero por proyecto. Con Forja Más puedes tener los que quieras, por ejemplo uno para el arte y otro para el código. <a href="' + ctx.u("planes/") + '">Ver Forja Más</a></span></div>';
      return;
    }
    const ks = plantillasDe(P.tipo);
    w.innerHTML = (primero ? '<p class="hint" style="margin:0 0 10px">Elige cómo parte. Después puedes renombrar las columnas, sumar o quitar.</p>' : "") +
      '<div class="tb-plant">' + ks.map((k, i) => { const pl = PLANTILLAS[k];
        return '<button type="button" class="tb-pl" data-pl="' + k + '">' + (i === 0 && ks.length > 1 && P.tipo in DE_TIPO ? '<span class="sug">Para ' + esc(P.tipo === "juegomesa" ? "juego de mesa" : P.tipo === "contenido" ? "redes" : P.tipo) + "</span>" : "") +
          "<b>" + pl.n + "</b><small>" + pl.d + '</small><span class="tb-tira" aria-label="Columnas: ' + pl.col.map((c) => c[1]).join(", ") + '">' + pl.col.map((c) => "<i>" + c[1] + "</i>").join("") + "</span></button>"; }).join("") + "</div>";
    w.querySelectorAll("[data-pl]").forEach((b) => b.onclick = async () => {
      b.disabled = true;
      const pl = PLANTILLAS[b.dataset.pl];
      const nombre = T.some((x) => x.nombre === pl.n) ? pl.n + " " + (T.length + 1) : pl.n;
      const { data, error } = await sb.from("tableros").insert({ espacio_id: ctx.ESP, proyecto_id: P.id, nombre, plantilla: b.dataset.pl, columnas: columnasDe(b.dataset.pl) }).select("id,nombre,plantilla,columnas,creado_en").single();
      if (error) { b.disabled = false; toast(ctx.limite(error) || "No se pudo crear el tablero."); return; }
      T.push(data); sel = data.id; try { localStorage.setItem("forja-tablero-" + P.id, sel); } catch (e) {}
      pintar(); avisar(); toast("Tablero «" + data.nombre + "» listo.");
    });
  }

  // --- El tablero: la regla de producción arriba y las columnas ---
  function cuerpo(t, w) {
    const ed = editableT(t), C = cols(t), zs = deT(t), fin = ultima(t), pl = plDe(t);
    const filtrar = (z) => (!F.oficio || z.oficio === F.oficio) && (!F.persona || (F.persona === "nadie" ? !z.responsable : z.responsable === F.persona)) && (!F.atr || atrasada(z, t));
    const listas = zs.filter((z) => z.estado === fin).length, atr = zs.filter((z) => atrasada(z, t)).length;
    const prox = zs.filter((z) => z.fecha && z.estado !== fin && dias(z.fecha) >= 0 && dias(z.fecha) <= 7).length;
    const pct = (i) => Math.round(10 + (i / Math.max(1, C.length - 1)) * 70) + "%";
    const dice = !zs.length ? "Agrega la primera pieza en «" + esc(C[0].n) + "». Cada vez que avance, muévela a la columna que sigue."
      : "<strong>" + listas + " de " + zs.length + "</strong> " + (zs.length === 1 ? "pieza" : "piezas") + " en «" + esc(C[C.length - 1].n) + "»" +
        (atr ? ", <strong>" + atr + (atr === 1 ? " atrasada" : " atrasadas") + "</strong>" : "") + (prox ? ", " + prox + " para esta semana" : "") + ".";
    const ofs = OFICIOS.map((o) => ({ ...o, c: zs.filter((z) => z.oficio === o.k).length })).filter((o) => o.c || F.oficio === o.k);
    const prs = PERS.map((p) => ({ ...p, c: zs.filter((z) => z.responsable === p.id).length })).filter((p) => p.c || F.persona === p.id);
    const sinR = zs.filter((z) => !z.responsable).length;
    w.innerHTML = (!ed && ctx.ed ? '<div class="tb-lock">' + svg(I.candado, 18) + '<span>El plan gratis incluye un tablero por proyecto: este queda para ver o borrar. Sigue trabajando en «' + esc(T[0].nombre) + '». <a href="' + ctx.u("planes/") + '">Ver Forja Más</a></span></div>' : "") +
      '<div class="tb-regla"><div class="tb-regla-top"><label class="fx-sr" for="tb-nombre">Nombre del tablero</label><input id="tb-nombre" maxlength="80" value="' + esc(t.nombre) + '"' + (ed ? "" : " disabled") + ">" +
        (ctx.ed ? '<span class="acc">' + (ed ? '<button type="button" class="tb-btn" id="tb-varias">' + svg(I.mas, 15) + "Agregar varias</button>" +
          '<button type="button" class="tb-btn" id="tb-colsed">' + svg(I.lapiz, 15) + "Columnas</button>" : "") + '<span id="tb-borrar-w"><button type="button" class="tb-btn peligro" id="tb-borrar">Borrar tablero</button></span></span>' : "") + "</div>" +
        '<div class="tb-tramos" role="group" aria-label="Cuántas piezas hay en cada columna">' + C.map((c, i) => { const n = zs.filter((z) => z.estado === c.k).length;
          return '<button type="button" class="tb-tramo' + (c.k === fin ? " fin" : "") + (n ? "" : " vacio") + '" style="flex:' + n + " 1 0;--p:" + pct(i) + '" data-ir="' + c.k + '" title="' + esc(c.n) + ": " + n + '" aria-label="' + esc(c.n) + ": " + n + '">' + (n || "") + "</button>"; }).join("") + "</div>" +
        '<p class="tb-dice">' + dice + "</p>" +
        ((ofs.length > 1 || prs.length > 1 || (prs.length && sinR) || atr || F.oficio || F.persona || F.atr) ? '<div class="tb-filtros">' +
          (atr || F.atr ? '<button type="button" class="tb-f atr" data-fa aria-pressed="' + F.atr + '">Atrasadas <small>' + atr + "</small></button>" : "") +
          (ofs.length > 1 || F.oficio ? ofs.map((o) => '<button type="button" class="tb-f" data-fo="' + o.k + '" aria-pressed="' + (F.oficio === o.k) + '">' + o.n + " <small>" + o.c + "</small></button>").join("") : "") +
          (prs.length > 1 || (prs.length && sinR) || F.persona ? prs.map((p) => '<button type="button" class="tb-f" data-fp="' + p.id + '" aria-pressed="' + (F.persona === p.id) + '">' + (p.yo ? "Lo mío" : esc(p.nombre)) + " <small>" + p.c + "</small></button>").join("") +
            (sinR ? '<button type="button" class="tb-f" data-fp="nadie" aria-pressed="' + (F.persona === "nadie") + '">Sin responsable <small>' + sinR + "</small></button>" : "") : "") +
        "</div>" : "") + "</div>" +
      '<div class="tb-cols" id="tb-cols">' + C.map((c, i) => { const xs = zs.filter((z) => z.estado === c.k).sort(enOrden), vis = xs.filter(filtrar);
        return '<section class="tb-col' + (c.k === fin ? " fin" : "") + '" data-col="' + c.k + '" style="--p:' + pct(i) + '" aria-label="' + esc(c.n) + '"><div class="tb-col-cab"><i></i><b>' + esc(c.n) + '</b><span class="n">' + (vis.length !== xs.length ? vis.length + " de " + xs.length : xs.length) + "</span></div>" +
          '<div class="tb-col-z">' + vis.map((z) => tarjeta(z, t, i < C.length - 1 ? C[i + 1] : null, ed)).join("") +
          (!zs.length && i === 0 && ed ? '<div class="tb-vacia">Por ejemplo: «' + esc(pl.ej) + "»." + (pl.serie ? '<br><button type="button" class="tb-btn" data-serie>' + svg(I.mas, 15) + "Agregar varias " + (pl.serie === "Página" ? "páginas" : "de una vez") + "</button>" : "") + "</div>" : "") + "</div>" +
          (ed ? '<div class="tb-col-mas" data-mas="' + c.k + '"><button type="button">' + svg(I.mas, 15) + "Pieza</button></div>" : "") + "</section>"; }).join("") + "</div>";

    const q = (s) => w.querySelector(s);
    if (q("#tb-nombre")) q("#tb-nombre").onchange = async (e) => {
      const v = e.target.value.trim(); if (!v) { e.target.value = t.nombre; return; }
      const { error } = await sb.from("tableros").update({ nombre: v }).eq("id", t.id);
      if (error) { toast(ctx.limite(error) || "No se pudo guardar."); e.target.value = t.nombre; return; }
      t.nombre = v; pintar();
    };
    if (q("#tb-varias")) q("#tb-varias").onclick = () => varias(t);
    if (q("[data-serie]")) q("[data-serie]").onclick = () => varias(t);
    if (q("#tb-colsed")) q("#tb-colsed").onclick = () => columnas(t);
    if (q("#tb-borrar")) q("#tb-borrar").onclick = () => {
      q("#tb-borrar-w").innerHTML = '<span class="hint" style="font-size:13px">' + (zs.length ? "Se borran sus " + zs.length + (zs.length === 1 ? " pieza." : " piezas.") : "Está vacío.") + '</span> <button type="button" class="tb-btn peligro" id="tb-si">Sí, borrar</button> <button type="button" class="tb-btn" id="tb-no">Cancelar</button>';
      q("#tb-no").onclick = pintar;
      q("#tb-si").onclick = async () => {
        const { error } = await sb.from("tableros").delete().eq("id", t.id);
        if (error) { toast("No se pudo borrar."); return; }
        T = T.filter((x) => x.id !== t.id); Z = Z.filter((z) => z.tablero_id !== t.id); sel = null; pintar(); avisar(); toast("Tablero borrado.");
      };
    };
    w.querySelectorAll("[data-ir]").forEach((b) => b.onclick = () => { const c = w.querySelector('[data-col="' + b.dataset.ir + '"]'), fila = q("#tb-cols"); if (c && fila) fila.scrollTo({ left: c.offsetLeft - fila.offsetLeft - 4, behavior: "smooth" }); });
    w.querySelectorAll("[data-fo]").forEach((b) => b.onclick = () => { F.oficio = F.oficio === b.dataset.fo ? null : b.dataset.fo; cuerpo(t, w); });
    w.querySelectorAll("[data-fp]").forEach((b) => b.onclick = () => { F.persona = F.persona === b.dataset.fp ? null : b.dataset.fp; cuerpo(t, w); });
    if (q("[data-fa]")) q("[data-fa]").onclick = () => { F.atr = !F.atr; cuerpo(t, w); };
    // Agregar una pieza al pie de una columna; el campo queda abierto para la siguiente.
    w.querySelectorAll("[data-mas]").forEach((m) => {
      m.querySelector("button").onclick = () => {
        m.innerHTML = '<form><label class="fx-sr" for="tb-in-' + m.dataset.mas + '">Nueva pieza</label><input id="tb-in-' + m.dataset.mas + '" maxlength="160" autocomplete="off" placeholder="' + esc(siguienteNombre(t) || pl.ej) + '"><div class="fila"><button type="button" class="tb-btn" data-cerrar>Listo</button><button type="submit" class="tb-btn prim">Agregar</button></div></form>';
        const inp = m.querySelector("input"); inp.focus();
        m.querySelector("[data-cerrar]").onclick = () => cuerpo(t, w);
        m.querySelector("form").onsubmit = async (e) => {
          e.preventDefault();
          const v = inp.value.trim() || siguienteNombre(t); if (!v) { inp.focus(); return; }
          inp.disabled = true;
          const ok = await crearPiezas(t, [v], m.dataset.mas);
          if (ok) { cuerpo(t, w); const de = w.querySelector('[data-mas="' + m.dataset.mas + '"] button'); if (de) de.click(); }
          else inp.disabled = false;
        };
      };
    });
    activarTarjetas(t, w);
  }

  function tarjeta(z, t, sig, ed) {
    const fin = z.estado === ultima(t), at = atrasada(z, t), p = persona(z.responsable), o = oficioDe(z.oficio);
    let fe = "";
    if (z.fecha) { const d = dias(z.fecha); fe = '<span class="fe' + (at ? " atr" : !fin && d <= 3 ? " pronto" : "") + '" title="' + (at ? "Atrasada: era para el " : "Para el ") + fechaCorta(z.fecha) + '">' + svg(I.cal, 12) + (fin ? fechaCorta(z.fecha) : d === 0 ? "hoy" : d === 1 ? "mañana" : at ? "hace " + -d + (d === -1 ? " día" : " días") : d <= 7 ? "en " + d + " días" : fechaCorta(z.fecha)) + "</span>"; }
    return '<article class="tb-z' + (fin ? " fin" : at ? " atr" : "") + '" data-z="' + z.id + '" tabindex="0" aria-label="' + esc(z.titulo) + '">' +
      '<div class="tb-z-top">' + (z.clase ? '<span class="cl">' + esc(z.clase) + "</span>" : "") + fe + "</div>" +
      "<b>" + esc(z.titulo) + "</b>" +
      '<div class="tb-z-pie">' + (o ? '<span class="of">' + o.n + "</span>" : "") + (z.enlace ? '<span class="ic" title="Tiene enlace">' + svg(I.enlace, 14) + "</span>" : "") + (z.nota ? '<span class="ic" title="Tiene nota">' + svg(I.nota, 14) + "</span>" : "") +
        '<span class="der">' + (p || z.responsable ? '<span class="quien' + (p && p.yo ? " yo" : "") + '" title="' + esc(p ? p.nombre : "Ya no está en el proyecto") + '">' + esc(p ? inicial(p.nombre) : "?") + "</span>" : "") +
        (ed && sig ? '<button type="button" class="sig" data-sig="' + z.id + '" aria-label="Pasar a ' + esc(sig.n) + '" title="Pasar a ' + esc(sig.n) + '"' + ">" + svg(I.flecha, 16) + "</button>" : "") + "</span></div></article>";
  }

  // Siguiente nombre de una serie («Página 13»).
  function siguienteNombre(t) {
    const s = plDe(t).serie; if (!s) return "";
    const re = new RegExp("^" + s + "\\s+(\\d+)$", "i");
    const n = deT(t).reduce((m, z) => { const x = re.exec(z.titulo); return x ? Math.max(m, +x[1]) : m; }, 0);
    return s + " " + (n + 1);
  }
  const claseBase = (t) => plDe(t).base;
  const oficioDeClase = (t, c) => { const x = plDe(t).clases.find((y) => y[0] === c); return x ? x[1] : null; };

  async function crearPiezas(t, titulos, col, extra = {}) {
    const ya = deT(t).filter((z) => z.estado === col);
    let o = ya.reduce((m, z) => Math.max(m, z.orden), 0);
    // Sin clase elegida: la que nombre la primera palabra («Nivel 2», «Música del jefe») o la de la serie («Página»).
    const adivina = (titulo) => { const w = titulo.split(/\s+/)[0].toLowerCase(), c = plDe(t).clases.find((x) => x[0].toLowerCase() === w); return c ? c[0] : plDe(t).serie || null; };
    const filas = titulos.map((titulo) => { const clase = extra.clase !== undefined ? extra.clase : adivina(titulo);
      return { espacio_id: ctx.ESP, proyecto_id: P.id, tablero_id: t.id, titulo: titulo.slice(0, 160), estado: col, clase: clase || null,
        oficio: extra.oficio !== undefined ? extra.oficio : oficioDeClase(t, clase), orden: ++o }; });
    const { data, error } = await sb.from("piezas").insert(filas).select(CAMPOS);
    if (error) { toast(ctx.limite(error) || "No se pudo agregar."); return false; }
    Z = Z.concat(data); avisar(); ctx.marcarHecho("tablero");
    return true;
  }
  async function guardarZ(z, cambios) {
    const antes = { ...z }; Object.assign(z, cambios);
    const { data, error } = await sb.from("piezas").update(cambios).eq("id", z.id).select("hecho_en").single();
    if (error) { Object.assign(z, antes); toast(ctx.limite(error) || "No se pudo guardar."); return false; }
    z.hecho_en = data.hecho_en; avisar();
    return true;
  }
  // Mover a una columna y una posición: el orden queda entre sus vecinas.
  async function mover(z, t, col, antesDe) {
    const xs = deT(t).filter((y) => y.estado === col && y.id !== z.id).sort(enOrden);
    const i = antesDe ? xs.findIndex((y) => y.id === antesDe) : -1;
    let orden;
    if (i < 0) orden = (xs.length ? xs[xs.length - 1].orden : 0) + 1;
    else orden = i === 0 ? xs[0].orden - 1 : (xs[i - 1].orden + xs[i].orden) / 2;
    if (z.estado === col && orden === z.orden) return;
    const llega = z.estado !== col && col === ultima(t);
    if (await guardarZ(z, { estado: col, orden }) && llega) toast("«" + z.titulo + "» quedó en " + cols(t).find((c) => c.k === col).n.toLowerCase() + ".");
  }

  // --- Tocar, pasar a la siguiente y arrastrar (con el mouse, o manteniendo el dedo en tablet y celular) ---
  function activarTarjetas(t, w) {
    const fila = w.querySelector("#tb-cols"); if (!fila) return;
    let trasArrastre = 0;
    fila.addEventListener("click", async (e) => {
      if (Date.now() - trasArrastre < 400) return;
      const s = e.target.closest("[data-sig]");
      if (s) { const z = Z.find((x) => x.id === s.dataset.sig), C = cols(t), i = C.findIndex((c) => c.k === z.estado); if (z && C[i + 1]) { s.disabled = true; await mover(z, t, C[i + 1].k); cuerpo(t, w); } return; }
      const a = e.target.closest("[data-z]"); if (a) abrir(Z.find((x) => x.id === a.dataset.z), t);
    });
    fila.addEventListener("keydown", (e) => { const a = e.target.closest("[data-z]"); if (a && (e.key === "Enter" || e.key === " ") && e.target === a) { e.preventDefault(); abrir(Z.find((x) => x.id === a.dataset.z), t); } });
    if (!editableT(t)) return;
    let D = null;
    const fin = () => { if (D && D.timer) clearTimeout(D.timer); D = null; };
    const empezar = () => {
      const r = D.card.getBoundingClientRect();
      D.activo = true; D.dx = D.x - r.left; D.dy = D.y - r.top;
      D.ghost = D.card.cloneNode(true); D.ghost.classList.add("fantasma"); D.ghost.style.width = r.width + "px"; D.ghost.removeAttribute("data-z");
      document.body.appendChild(D.ghost); D.card.classList.add("yendo");
      seguir(D.x, D.y);
      if (navigator.vibrate) try { navigator.vibrate(8); } catch (er) {}
    };
    const seguir = (x, y) => {
      D.ghost.style.left = x - D.dx + "px"; D.ghost.style.top = y - D.dy + "px";
      const bajo = document.elementFromPoint(x, y), col = bajo && bajo.closest(".tb-col");
      fila.querySelectorAll(".tb-col.encima").forEach((c) => { if (c !== col) c.classList.remove("encima"); });
      if (col && fila.contains(col)) {
        col.classList.add("encima");
        const caja = col.querySelector(".tb-col-z"), otras = [...caja.querySelectorAll(".tb-z:not(.yendo)")];
        const antes = otras.find((c) => { const r = c.getBoundingClientRect(); return y < r.top + r.height / 2; });
        if (antes) { if (D.card.nextElementSibling !== antes) caja.insertBefore(D.card, antes); }
        else if (caja.lastElementChild !== D.card) { const v = caja.querySelector(".tb-vacia"); caja.insertBefore(D.card, v || null); }
      }
      // Cerca de los bordes, el tablero y la página se desplazan solos.
      const r = fila.getBoundingClientRect();
      D.vx = x < r.left + 40 ? -14 : x > r.right - 40 ? 14 : 0;
      D.vy = y < 70 ? -12 : y > innerHeight - 70 ? 12 : 0;
      if ((D.vx || D.vy) && !D.raf) { const paso = () => { if (!D || !D.activo || (!D.vx && !D.vy)) { if (D) D.raf = null; return; } fila.scrollLeft += D.vx; scrollBy(0, D.vy); D.raf = requestAnimationFrame(paso); }; D.raf = requestAnimationFrame(paso); }
    };
    fila.addEventListener("pointerdown", (e) => {
      const card = e.target.closest(".tb-z"); if (!card || e.target.closest("button,a") || (e.pointerType === "mouse" && e.button !== 0)) return;
      D = { card, x: e.clientX, y: e.clientY, tipo: e.pointerType, activo: false };
      if (e.pointerType !== "mouse") D.timer = setTimeout(() => { if (D && !D.activo) empezar(); }, 380);
    });
    const alMover = (e) => {
      if (!D) return;
      const dist = Math.hypot(e.clientX - D.x, e.clientY - D.y);
      if (!D.activo) {
        if (D.tipo === "mouse" && dist > 6) empezar();
        else if (D.tipo !== "mouse" && dist > 10) { fin(); return; }
        else return;
      }
      e.preventDefault(); seguir(e.clientX, e.clientY);
    };
    const soltar = async () => {
      if (!D) return;
      if (!D.activo) { fin(); return; }
      const card = D.card, col = card.closest(".tb-col"), sig = card.nextElementSibling;
      D.ghost.remove(); card.classList.remove("yendo"); fila.querySelectorAll(".tb-col.encima").forEach((c) => c.classList.remove("encima"));
      trasArrastre = Date.now(); fin();
      const z = Z.find((x) => x.id === card.dataset.z);
      if (z && col) { await mover(z, t, col.dataset.col, sig && sig.dataset.z ? sig.dataset.z : null); }
      cuerpo(t, w);
    };
    // Los escuchas de la ventana se quitan solos cuando el tablero deja de estar en la página.
    const vivo = () => { if (!fila.isConnected) { removeEventListener("pointermove", alMoverV); removeEventListener("pointerup", alSoltar); removeEventListener("pointercancel", alCancelar); fila.removeEventListener("touchmove", alTocar); return false; } return true; };
    const alSoltar = () => { if (vivo()) soltar(); };
    const alCancelar = () => { if (!vivo() || !D) return; if (D.activo) soltar(); else fin(); };
    const alTocar = (e) => { if (D && D.activo) e.preventDefault(); };
    const alMoverV = (e) => { if (vivo()) alMover(e); };
    addEventListener("pointermove", alMoverV, { passive: false });
    addEventListener("pointerup", alSoltar);
    addEventListener("pointercancel", alCancelar);
    fila.addEventListener("touchmove", alTocar, { passive: false });
    fila.addEventListener("contextmenu", (e) => { if (e.target.closest(".tb-z")) e.preventDefault(); });
  }

  // --- La pieza abierta: se guarda al cerrar ---
  function abrir(z, t) {
    if (!z) return;
    const ed = editableT(t), C = cols(t), pl = plDe(t), B = { ...z };
    const clases = pl.clases.map((c) => c[0]); if (B.clase && !clases.includes(B.clase)) clases.push(B.clase);
    const d = document.createElement("dialog"); d.className = "tb-d"; d.style.setProperty("--tc", ctx.tc);
    const dis = ed ? "" : " disabled";
    let borrada = false;
    const pintarD = () => {
      d.innerHTML = '<form method="dialog" class="tb-d-in"><div class="tb-d-cab"><label class="fx-sr" for="tb-z-t">Nombre de la pieza</label><textarea id="tb-z-t" rows="1" maxlength="160"' + dis + ">" + esc(B.titulo) + '</textarea><button type="button" class="tb-x" data-x aria-label="Cerrar">×</button></div>' +
        '<div class="tb-g"><span id="tb-l-e">En qué va</span><div class="tb-sellos tb-via" role="radiogroup" aria-labelledby="tb-l-e">' + C.map((c) => '<button type="button" class="tb-sello" role="radio" data-e="' + c.k + '" aria-checked="' + (B.estado === c.k) + '"' + dis + ">" + esc(c.n) + "</button>").join("") + "</div></div>" +
        (clases.length ? '<div class="tb-g"><span id="tb-l-c">Qué es</span><div class="tb-sellos" role="radiogroup" aria-labelledby="tb-l-c">' + clases.map((c) => '<button type="button" class="tb-sello" role="radio" data-c="' + esc(c) + '" aria-checked="' + (B.clase === c) + '"' + dis + ">" + esc(c) + "</button>").join("") + "</div></div>" : "") +
        '<div class="tb-g"><span id="tb-l-o">Parte del trabajo</span><div class="tb-sellos" role="group" aria-labelledby="tb-l-o">' + OFICIOS.map((o) => '<button type="button" class="tb-sello" data-o="' + o.k + '" aria-pressed="' + (B.oficio === o.k) + '"' + dis + ">" + o.n + "</button>").join("") + "</div></div>" +
        (PERS.length > 1 || B.responsable ? '<div class="tb-g"><span id="tb-l-r">Quién la hace</span><div class="tb-sellos" role="radiogroup" aria-labelledby="tb-l-r">' + PERS.map((p) => '<button type="button" class="tb-sello" role="radio" data-r="' + p.id + '" aria-checked="' + (B.responsable === p.id) + '"' + dis + ">" + (p.yo ? "Yo" : esc(p.nombre)) + "</button>").join("") +
          (B.responsable && !persona(B.responsable) ? '<button type="button" class="tb-sello" role="radio" aria-checked="true" disabled>Ya no está en el proyecto</button>' : "") +
          '<button type="button" class="tb-sello" role="radio" data-r="" aria-checked="' + !B.responsable + '"' + dis + ">Nadie aún</button></div></div>"
          : (YO && ed ? '<div class="tb-g"><span>Quién la hace</span><div class="tb-sellos"><button type="button" class="tb-sello" data-r="' + (B.responsable ? "" : YO) + '" aria-pressed="' + !!B.responsable + '">Yo</button></div></div>' : "")) +
        '<div class="tb-g"><label for="tb-z-f">Para cuándo</label><div class="tb-fila"><input type="date" id="tb-z-f" value="' + (B.fecha || "") + '"' + dis + ">" + (B.fecha && ed ? '<button type="button" class="tb-btn" data-sinf>Sin fecha</button>' : "") + "</div></div>" +
        '<div class="tb-g"><label for="tb-z-l">Enlace <small style="text-transform:none;letter-spacing:0;font-weight:400">(opcional: el archivo, una imagen, la versión)</small></label><div class="tb-fila"><input type="text" id="tb-z-l" inputmode="url" spellcheck="false" maxlength="500" placeholder="https://…" value="' + esc(B.enlace || "") + '"' + dis + ">" +
          (B.enlace && limpio(B.enlace) ? '<a class="tb-btn" href="' + esc(B.enlace) + '" target="_blank" rel="noopener noreferrer">Abrir ↗</a>' : "") + "</div></div>" +
        '<div class="tb-g"><label for="tb-z-n">Nota</label><textarea class="nota" id="tb-z-n" maxlength="4000" placeholder="Lo que hay que recordar de esta pieza"' + dis + ">" + esc(B.nota || "") + "</textarea></div>" +
        '<div class="tb-d-pie">' + (ed ? '<span id="tb-z-del-w"><button type="button" class="tb-btn peligro" data-del>Borrar pieza</button></span><span class="hint">Se guarda al cerrar.</span><button type="button" class="tb-btn prim" data-x>Listo</button>' : '<span class="hint">Solo puedes mirar esta pieza.</span><button type="button" class="tb-btn" data-x>Cerrar</button>') + "</div></form>";
      const ta = d.querySelector("#tb-z-t"), ajustar = () => { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; };
      requestAnimationFrame(ajustar); ta.oninput = ajustar;
      ta.onkeydown = (e) => { if (e.key === "Enter") e.preventDefault(); };
    };
    const leer = () => {
      const v = d.querySelector("#tb-z-t").value.replace(/\s+/g, " ").trim(); if (v) B.titulo = v;
      B.fecha = d.querySelector("#tb-z-f").value || null;
      B.nota = d.querySelector("#tb-z-n").value.trim() || null;
      const crudo = d.querySelector("#tb-z-l").value.trim();
      B.enlace = crudo ? limpio(/^https?:\/\//i.test(crudo) ? crudo.replace(/^http:/i, "https:") : "https://" + crudo) : null;
      return !crudo || B.enlace;
    };
    d.addEventListener("click", async (e) => {
      if (e.target === d) { d.close(); return; }
      const b = e.target.closest("button"); if (!b || b.disabled) return;
      if (b.hasAttribute("data-x")) { d.close(); return; }
      if (!ed) return;
      if (b.dataset.e) { leer(); B.estado = b.dataset.e; pintarD(); return; }
      if (b.dataset.c !== undefined && b.hasAttribute("data-c")) { leer(); const antes = B.clase; B.clase = B.clase === b.dataset.c ? null : b.dataset.c; if (B.clase && (!B.oficio || B.oficio === oficioDeClase(t, antes))) B.oficio = oficioDeClase(t, B.clase) || B.oficio; pintarD(); return; }
      if (b.dataset.o) { leer(); B.oficio = B.oficio === b.dataset.o ? null : b.dataset.o; pintarD(); return; }
      if (b.hasAttribute("data-r")) { leer(); B.responsable = b.dataset.r || null; pintarD(); return; }
      if (b.hasAttribute("data-sinf")) { leer(); B.fecha = null; pintarD(); return; }
      if (b.hasAttribute("data-del")) {
        if (b.dataset.armed !== "1") { b.dataset.armed = "1"; b.textContent = "¿Seguro? Toca de nuevo"; return; }
        const { error } = await sb.from("piezas").delete().eq("id", z.id);
        if (error) { toast("No se pudo borrar."); return; }
        Z = Z.filter((x) => x.id !== z.id); borrada = true; avisar(); d.close();
      }
    });
    d.addEventListener("close", async () => {
      d.remove();
      if (!ed || borrada) { pintar(); return; }
      if (!leer()) toast("El enlace tiene que empezar con https://, no se guardó.");
      const campos = ["titulo", "estado", "clase", "oficio", "responsable", "fecha", "enlace", "nota"];
      const cambios = {}; campos.forEach((k) => { if ((B[k] ?? null) !== (z[k] ?? null)) cambios[k] = B[k] ?? null; });
      if (cambios.enlace === null && (d.querySelector("#tb-z-l") || {}).value) delete cambios.enlace;
      if (cambios.estado) { const xs = deT(t).filter((y) => y.estado === cambios.estado && y.id !== z.id); cambios.orden = (xs.length ? Math.max(...xs.map((y) => y.orden)) : 0) + 1; }
      if (Object.keys(cambios).length) { const llega = cambios.estado && cambios.estado === ultima(t); if (await guardarZ(z, cambios) && llega) toast("«" + z.titulo + "» quedó en " + cols(t)[cols(t).length - 1].n.toLowerCase() + "."); }
      pintar();
    });
    document.body.appendChild(d); pintarD(); d.showModal();
    if (ed && !z.titulo) d.querySelector("#tb-z-t").focus();
  }

  // --- Agregar varias de una vez («Página 1» a «Página 24») ---
  function varias(t) {
    const pl = plDe(t), C = cols(t), base = pl.serie || pl.base || "Pieza";
    const sig = siguienteNombre(t), desde = sig ? +sig.split(" ").pop() : 1;
    const d = document.createElement("dialog"); d.className = "tb-d"; d.style.setProperty("--tc", ctx.tc);
    let clase = claseBase(t), col = C[0].k;
    const pintarD = () => {
      const nom = d.querySelector("#tv-n") ? d.querySelector("#tv-n").value : base;
      const a = d.querySelector("#tv-a") ? +d.querySelector("#tv-a").value : desde, b = d.querySelector("#tv-b") ? +d.querySelector("#tv-b").value : desde + (pl.serie === "Página" ? 23 : 9);
      d.innerHTML = '<form class="tb-d-in"><div class="tb-d-cab"><h3>Agregar varias de una vez</h3><button type="button" class="tb-x" data-x aria-label="Cerrar">×</button></div>' +
        '<div class="tb-g"><label for="tv-n">Nombre</label><input type="text" id="tv-n" maxlength="140" value="' + esc(nom) + '"></div>' +
        '<div class="tb-g"><span>Numeradas</span><div class="tb-fila"><label class="fx-sr" for="tv-a">Desde</label><input type="number" id="tv-a" min="0" max="9999" inputmode="numeric" value="' + a + '"><span>a</span><label class="fx-sr" for="tv-b">Hasta</label><input type="number" id="tv-b" min="0" max="9999" inputmode="numeric" value="' + b + '"></div></div>' +
        (pl.clases.length ? '<div class="tb-g"><span>Qué son</span><div class="tb-sellos" role="radiogroup">' + pl.clases.map((c) => '<button type="button" class="tb-sello" role="radio" data-c="' + esc(c[0]) + '" aria-checked="' + (clase === c[0]) + '">' + esc(c[0]) + "</button>").join("") + "</div></div>" : "") +
        '<div class="tb-g"><span>Parten en</span><div class="tb-sellos tb-via" role="radiogroup">' + C.map((c) => '<button type="button" class="tb-sello" role="radio" data-e="' + c.k + '" aria-checked="' + (col === c.k) + '">' + esc(c.n) + "</button>").join("") + "</div></div>" +
        '<p class="tb-prev" id="tv-prev"></p><div class="tb-d-pie"><button type="button" class="tb-btn" data-x>Cancelar</button><button type="submit" class="tb-btn prim" id="tv-ok">Agregar</button></div></form>';
      prev();
      d.querySelectorAll("input").forEach((i) => (i.oninput = prev));
      d.querySelector("form").onsubmit = enviar;
    };
    const rango = () => { const a = Math.trunc(+d.querySelector("#tv-a").value), b = Math.trunc(+d.querySelector("#tv-b").value); return [a, b]; };
    const prev = () => {
      const [a, b] = rango(), n = b - a + 1, nom = d.querySelector("#tv-n").value.trim() || base, cabe = 500 - deT(t).length;
      const ok = Number.isFinite(n) && n >= 1 && n <= 100 && n <= cabe;
      d.querySelector("#tv-prev").innerHTML = !Number.isFinite(n) || n < 1 ? "Revisa los números." : n > 100 ? "Hasta 100 de una vez." : n > cabe ? "Un tablero llega hasta 500 piezas: caben " + cabe + " más." :
        "Se agregan <b>" + n + "</b>: «" + esc(nom + " " + a) + "»" + (n > 1 ? " a «" + esc(nom + " " + b) + "»" : "") + ".";
      d.querySelector("#tv-ok").disabled = !ok;
    };
    const enviar = async (e) => {
      e.preventDefault();
      const [a, b] = rango(), nom = d.querySelector("#tv-n").value.trim() || base;
      if (b - a + 1 < 1 || b - a + 1 > 100) return;
      d.querySelector("#tv-ok").disabled = true;
      const ok = await crearPiezas(t, Array.from({ length: b - a + 1 }, (_, i) => nom + " " + (a + i)), col, { clase: clase || null });
      if (ok) { toast((b - a + 1) + " piezas agregadas."); d.close(); } else d.querySelector("#tv-ok").disabled = false;
    };
    d.addEventListener("click", (e) => {
      if (e.target === d) { d.close(); return; }
      const x = e.target.closest("button"); if (!x) return;
      if (x.hasAttribute("data-x")) { d.close(); return; }
      if (x.hasAttribute("data-c")) { clase = x.dataset.c; pintarD(); }
      if (x.dataset.e) { col = x.dataset.e; pintarD(); }
    });
    d.addEventListener("close", () => { d.remove(); pintar(); });
    document.body.appendChild(d); pintarD(); d.showModal();
  }

  // --- Columnas: renombrar, ordenar, sumar o quitar. La última cuenta como lista. ---
  function columnas(t) {
    let C = cols(t).map((c) => ({ ...c }));
    const zs = deT(t);
    const d = document.createElement("dialog"); d.className = "tb-d"; d.style.setProperty("--tc", ctx.tc);
    const leer = () => d.querySelectorAll("[data-ci]").forEach((i) => { C[+i.dataset.ci].n = i.value; });
    const pintarD = () => {
      d.innerHTML = '<form class="tb-d-in"><div class="tb-d-cab"><h3>Columnas</h3><button type="button" class="tb-x" data-x aria-label="Cerrar">×</button></div>' +
        '<p class="tb-prev">Las piezas avanzan de la primera a la última. <b>La última cuenta como lista</b>: es la que mide cuánto llevas.</p>' +
        '<div class="tb-col-ed">' + C.map((c, i) => { const n = zs.filter((z) => z.estado === c.k).length;
          return '<div class="r' + (i === C.length - 1 ? " fin" : "") + '"><button type="button" data-sube="' + i + '" aria-label="Mover antes"' + (i ? "" : " disabled") + '>↑</button><button type="button" data-baja="' + i + '" aria-label="Mover después"' + (i < C.length - 1 ? "" : " disabled") + ">↓</button>" +
            '<label class="fx-sr" for="tc-' + i + '">Nombre de la columna ' + (i + 1) + '</label><input type="text" id="tc-' + i + '" data-ci="' + i + '" maxlength="40" value="' + esc(c.n) + '"><small>' + (n ? n + " pz" : "") + "</small>" +
            '<button type="button" data-quita="' + i + '" aria-label="Quitar columna"' + (C.length > 2 ? "" : " disabled") + ">×</button></div>"; }).join("") + "</div>" +
        '<div><button type="button" class="tb-btn" data-suma' + (C.length < 10 ? "" : " disabled") + ">" + svg(I.mas, 15) + "Columna</button></div>" +
        '<p class="tb-prev" id="tc-aviso"></p><div class="tb-d-pie"><button type="button" class="tb-btn" data-x>Cancelar</button><button type="submit" class="tb-btn prim">Guardar columnas</button></div></form>';
      const quitadas = cols(t).filter((c) => !C.some((x) => x.k === c.k)).map((c) => zs.filter((z) => z.estado === c.k).length).reduce((a, b) => a + b, 0);
      d.querySelector("#tc-aviso").textContent = quitadas ? quitadas + (quitadas === 1 ? " pieza pasa" : " piezas pasan") + " a «" + (C[0].n || "la primera columna") + "»." : "";
      d.querySelector("form").onsubmit = guardar;
    };
    const guardar = async (e) => {
      e.preventDefault(); leer();
      if (C.some((c) => !c.n.trim())) { toast("Cada columna necesita un nombre."); return; }
      const usadas = new Set(C.map((c) => c.k).filter(Boolean));
      const nuevas = C.map((c) => { let k = c.k; if (!k) { const b = clave(c.n); k = b; let i = 2; while (usadas.has(k)) k = b + "-" + i++; usadas.add(k); } return { k, n: c.n.trim().slice(0, 40) }; });
      const { error } = await sb.from("tableros").update({ columnas: nuevas }).eq("id", t.id);
      if (error) { toast(ctx.limite(error) || "No se pudieron guardar las columnas."); return; }
      const keys = new Set(nuevas.map((c) => c.k)), fin = nuevas[nuevas.length - 1].k;
      t.columnas = nuevas;
      // Lo mismo que hace la base: lo de una columna quitada pasa a la primera y «lista» sigue a la última.
      deT(t).forEach((z) => { if (!keys.has(z.estado)) z.estado = nuevas[0].k; z.hecho_en = z.estado === fin ? z.hecho_en || new Date().toISOString() : null; });
      avisar(); d.close(); toast("Columnas guardadas.");
    };
    d.addEventListener("click", (e) => {
      if (e.target === d) { d.close(); return; }
      const b = e.target.closest("button"); if (!b || b.disabled) return;
      if (b.hasAttribute("data-x")) { d.close(); return; }
      leer();
      if (b.dataset.sube) { const i = +b.dataset.sube; [C[i - 1], C[i]] = [C[i], C[i - 1]]; pintarD(); }
      else if (b.dataset.baja) { const i = +b.dataset.baja; [C[i + 1], C[i]] = [C[i], C[i + 1]]; pintarD(); }
      else if (b.dataset.quita) { C.splice(+b.dataset.quita, 1); pintarD(); }
      else if (b.hasAttribute("data-suma")) { C.splice(C.length - 1, 0, { k: "", n: "" }); pintarD(); const ins = d.querySelectorAll("[data-ci]"); ins[ins.length - 2].focus(); }
    });
    d.addEventListener("close", () => { d.remove(); pintar(); });
    document.body.appendChild(d); pintarD(); d.showModal();
  }

  pintar();
}
