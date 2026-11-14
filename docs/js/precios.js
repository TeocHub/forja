// Precios de la comunidad: cómo se ven (talón), cómo se reportan y qué dice cada error.
// Lo usan cotizaciones/ (el explorador) y el cotizador (las referencias de cada pieza).
import { sb, esc, u, limite } from "./forja.js";
import { nombrePieza } from "./piezas.js";

// Campos que se leen de public.precios_comunidad (la columna autor no es legible).
export const CAMPOS_PRECIO = "id,componente,proveedor,enlace,origen,moneda,cantidad,precio,envio,envio_pendiente,incluye_iva,especificaciones,opciones,grupo,plazo,revisado,creado_en,producto,paginas,familia";

// Quita del enlace lo que solo sirve para seguir visitas (utm, _pos, _sid…) y deja lo que elige el producto (como variant).
const RASTREO = /^(utm_|_pos$|_sid$|_ss$|_psq$|_v$|fbclid$|gclid$|igshid$|mc_|ref$|ref_)/i;
export function limpiarEnlace(url) {
  try { const x = new URL(String(url || "").trim()); if (x.protocol !== "https:") return "";
    [...x.searchParams.keys()].forEach((k) => { if (RASTREO.test(k)) x.searchParams.delete(k); });
    return x.toString().slice(0, 500);
  } catch (e) { return ""; }
}

// Junta los precios compartidos juntos (mismo grupo) en uno solo con sus tramos por cantidad.
// Cada elemento queda como el tramo más chico, con tramos [{id, cantidad, precio}] ordenados y ids con todos sus ids.
export function agrupar(filas) {
  const vistos = new Map(), salida = [];
  (filas || []).forEach((r) => {
    const k = r.familia || r.grupo || r.id;
    if (!vistos.has(k)) { const g = { ...r, tramos: [], ids: [] }; vistos.set(k, g); salida.push(g); }
    const g = vistos.get(k); g.tramos.push({ id: r.id, cantidad: n0(r.cantidad), precio: n0(r.precio), paginas: r.paginas || null }); g.ids.push(r.id);
    if (String(r.creado_en) > String(g.creado_en)) g.creado_en = r.creado_en;
    if (r.revisado && String(r.revisado) > String(g.revisado || "")) g.revisado = r.revisado;
  });
  salida.forEach((g) => {
    g.tramos.sort((a, b) => (a.paginas || 0) - (b.paginas || 0) || a.cantidad - b.cantidad); const t = g.tramos[0]; g.id = t.id; g.cantidad = t.cantidad; g.precio = t.precio;
    g.paginasLista = [...new Set(g.tramos.map((x) => x.paginas).filter(Boolean))];
    if (g.paginasLista.length > 1 && g.opciones) g.opciones = sinPaginas(g.opciones);
  });
  return salida;
}
// Quita «100 páginas» de un texto de opciones (cuando las páginas ya están en la tabla).
export const sinPaginas = (t) => String(t || "").replace(/\b\d{1,4}\s*(p[aá]g(inas|s?\.?)?|pp\.?)(?![a-z])\s*[,·;]?\s*/i, "").replace(/^[\s,·;]+|[\s,·;]+$/g, "");
// Tabla páginas × cantidad: precio por pieza de cada combinación que se cotizó.
export function matriz(r) {
  const pags = r.paginasLista, cants = [...new Set(r.tramos.map((t) => t.cantidad))].sort((a, b) => a - b);
  const celda = (p, c) => { const t = r.tramos.find((x) => x.paginas === p && x.cantidad === c); return t ? porUnidad({ moneda: r.moneda, cantidad: t.cantidad, precio: t.precio }).replace("USD ", "") : "–"; };
  return '<div class="pr-matriz" role="region" aria-label="Precio por pieza según páginas y cantidad" tabindex="0"><table><thead><tr><th scope="col">Páginas</th>' +
    cants.map((c) => "<th scope=\"col\">" + c.toLocaleString("es-CL") + "+</th>").join("") + "</tr></thead><tbody>" +
    pags.map((p) => "<tr><th scope=\"row\">" + p + "</th>" + cants.map((c) => "<td>" + celda(p, c) + "</td>").join("") + "</tr>").join("") +
    "</tbody></table></div>";
}

export const MOTIVOS_PRECIO = [
  ["falso", "Precio falso o inventado", "No calza con lo que cobra ese proveedor o parece puesto para engañar."],
  ["estafa", "Proveedor o enlace engañoso", "El proveedor no existe, no entrega o el enlace lleva a otro lado."],
  ["spam", "Publicidad o spam", "Está para promocionar algo, repetido o sin datos reales."],
  ["datos", "Datos personales", "Muestra el teléfono, correo o nombre de una persona sin su permiso."],
  ["ofensivo", "Ofensivo", "Insulta o ataca a personas o grupos."],
  ["otro", "Otra cosa", "Algo que incumple las normas y no está en la lista."],
];
export const MOTIVO_PRECIO = Object.fromEntries(MOTIVOS_PRECIO.map(([k, n]) => [k, n]));

const n0 = (v) => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
export const dinero = (moneda, v) => moneda === "USD"
  ? "USD " + n0(v).toLocaleString("es-CL", { maximumFractionDigits: 2 })
  : "$" + Math.round(n0(v)).toLocaleString("es-CL");
// Por unidad, en la moneda del proveedor y sin envío ni impuestos (el cotizador hace la cuenta completa).
export const porUnidad = (r) => !n0(r.cantidad) ? "–" : r.moneda === "USD"
  ? "USD " + (n0(r.precio) / n0(r.cantidad)).toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  : dinero(r.moneda, n0(r.precio) / n0(r.cantidad));
const mes = (iso) => new Date(iso).toLocaleDateString("es-CL", { month: "short", year: "numeric" });
// Cuándo se revisó por última vez (los precios cambian: pasados 90 días se avisa que puede haber cambiado).
export const VIEJO_DIAS = 90;
export function revisadoTxt(r) {
  const f = r.revisado ? new Date(r.revisado + "T12:00:00") : new Date(r.creado_en), dias = Math.floor((Date.now() - f) / 864e5);
  return "revisado " + mes(f) + (dias > VIEJO_DIAS ? ' · <b class="pr-viejo">puede haber cambiado</b>' : "");
}

// Escalera de tramos: desde cuántas unidades, a cuánto sale cada una.
export function escalera(r, max = 12) {
  const ts = (r.tramos || []).slice(0, max);
  return '<ol class="pr-tramos" aria-label="Precio por pieza según cantidad">' + ts.map((t) =>
    "<li><span>" + t.cantidad.toLocaleString("es-CL") + "+</span><b>" + porUnidad({ moneda: r.moneda, cantidad: t.cantidad, precio: t.precio }) + "</b></li>").join("") + "</ol>";
}
const envioTxt = (r) => r.envio_pendiente ? " · envío según destino" : n0(r.envio) ? " · envío " + dinero(r.moneda, r.envio) : "";

// Talón de un precio compartido (o de un grupo con tramos, ver agrupar). mio: lo compartiste tú (no se reporta).
export function talon(r, { mio = false, pieza = true, reportado = false } = {}) {
  const enl = r.enlace && /^https:\/\//.test(r.enlace)
    ? '<a href="' + esc(r.enlace) + '" target="_blank" rel="noopener noreferrer nofollow">' + esc(r.proveedor) + "</a>" : esc(r.proveedor);
  const varios = (r.tramos || []).length > 1, conPags = (r.paginasLista || []).length > 1;
  return '<article class="pr-talon' + (conPags ? " ancho" : "") + '" data-precio="' + esc(r.id) + '">' +
    '<header>' + (pieza ? '<small class="pr-pieza">' + esc(nombrePieza(r.componente)) + "</small>" : "") +
      (r.producto ? "<b>" + esc(r.producto) + '</b><span class="pr-prov">de ' + enl + "</span>" : "<b>" + enl + "</b>") +
      (r.opciones ? '<span class="pr-opc">' + esc(r.opciones) + "</span>" : "") + "</header>" +
    (conPags
      ? '<div class="pr-cifra"><span class="pr-uni" style="flex-basis:auto">Precio por pieza' + (r.moneda === "USD" ? " (USD)" : "") + " según páginas y cuántas pidas" + envioTxt(r) + "</span>" + matriz(r) + "</div>"
      : varios
      ? '<div class="pr-cifra"><span class="pr-uni" style="flex-basis:auto">Precio por pieza según cuántas pidas' + envioTxt(r) + "</span>" + escalera(r) + "</div>"
      : '<div class="pr-cifra"><span class="pr-cant">' + n0(r.cantidad).toLocaleString("es-CL") + ' u.</span><span class="pr-total">' + dinero(r.moneda, r.precio) + "</span>" +
        '<span class="pr-uni">' + porUnidad(r) + " c/u" + envioTxt(r) + "</span></div>") +
    (r.paginasLista && r.paginasLista.length === 1 ? '<p class="pr-spec">' + r.paginasLista[0] + " páginas</p>" : "") +
    (r.especificaciones ? '<p class="pr-spec">' + esc(r.especificaciones) + "</p>" : "") +
    '<footer><span>' + (r.origen === "chile" ? "Chile" : "Extranjero") + (r.incluye_iva ? " · con IVA" : "") + (r.plazo ? " · " + esc(r.plazo) : "") + " · " + revisadoTxt(r) + "</span>" +
    (mio ? '<span class="pr-mio">Lo compartiste tú</span>' : reportado ? '<span class="pr-mio pr-ya">Reportado</span>' : '<button type="button" class="pr-rep-btn" data-reportar="' + esc(r.id) + '" data-prov="' + esc(r.proveedor) + '">Reportar</button>') +
    "</footer></article>";
}

// Precios que esta cuenta ya reportó (para no ofrecer reportarlos de nuevo).
export async function misReportados() {
  const { data } = await sb.from("reportes_precios").select("precio_ref");
  return new Set((data || []).map((x) => x.precio_ref));
}

// Mensaje de un error al reportar un precio.
export function errorReporte(error) {
  const m = (error && error.message) || "";
  if (m.includes("FORJA_REPORTE_PROPIO")) return "No puedes reportar un precio que compartiste tú.";
  if (m.includes("FORJA_REPORTE_REPETIDO")) return "Ya reportaste este precio. Una persona lo va a revisar.";
  if (m.includes("FORJA_NO_ENCONTRADA")) return "Ese precio ya no está: quien lo compartió lo quitó.";
  return limite(error) || "No se pudo enviar el reporte. Intenta de nuevo.";
}

// Diálogo para reportar un precio. Nada se oculta solo: lo revisa una persona.
export function reportarPrecio(id, proveedor) {
  let dl = document.getElementById("pr-rep"); if (dl) dl.remove();
  dl = document.createElement("dialog"); dl.id = "pr-rep"; dl.className = "pr-rep";
  dl.innerHTML = '<form class="pr-rep-c"><h2>Reportar este precio</h2><p>' + (proveedor ? "<b>" + esc(proveedor) + "</b>. " : "") +
    "Una persona del equipo lo revisará. Nada se oculta solo, y quien lo compartió no sabrá quién lo reportó.</p><fieldset><legend>¿Qué pasa?</legend>" +
    MOTIVOS_PRECIO.map(([k, n, d]) => '<label class="pr-rep-op"><input type="radio" name="m" value="' + k + '" required><span><b>' + n + "</b><small>" + d + "</small></span></label>").join("") +
    '</fieldset><label class="pr-rep-det"><span>Cuéntanos qué viste (opcional, ayuda mucho)</span><textarea name="d" maxlength="1000" rows="3"></textarea></label>' +
    '<p class="pr-rep-nota">Reportar de mala fe (para atacar a un proveedor o a la competencia) tiene consecuencias. Lee las <a href="' + u("normas/#reportar") + '" target="_blank" rel="noopener">normas</a>.</p>' +
    '<p class="pr-rep-msg" role="alert"></p><div class="pr-rep-pie"><button type="button" class="pr-no">Cancelar</button><button type="submit" class="pr-si">Enviar reporte</button></div></form>';
  document.body.appendChild(dl); dl.showModal();
  const f = dl.querySelector("form");
  dl.querySelector(".pr-no").onclick = () => dl.close();
  return new Promise((listo) => {
    dl.addEventListener("close", () => listo(false), { once: true });
    f.onsubmit = async (e) => {
      e.preventDefault();
      const m = f.querySelector("input[name=m]:checked"); if (!m) return;
      const si = f.querySelector(".pr-si"); si.disabled = true;
      const { error } = await sb.rpc("reportar_precio", { p: id, motivo: m.value, detalle: f.d.value });
      if (error) { f.querySelector(".pr-rep-msg").textContent = errorReporte(error); si.disabled = false; return; }
      dl.innerHTML = '<div class="pr-rep-c"><h2>Gracias por avisar</h2><p>Recibimos tu reporte. Una persona lo va a revisar y te contaremos el resultado en <a href="' + u("cuenta/") + '">Mi cuenta</a>.</p><div class="pr-rep-pie"><button type="button" class="pr-si">Listo</button></div></div>';
      dl.querySelector(".pr-si").onclick = () => { listo(true); dl.close(); };
    };
  });
}

// Estilos del talón y del diálogo (se agregan una vez a la página).
export const CSS_PRECIOS = `
.pr-talon{position:relative;background:var(--card);border:1px solid var(--line);border-left:3px dashed var(--line);border-radius:10px;padding:14px 16px 12px;display:flex;flex-direction:column;gap:8px;min-width:0}
.pr-talon header{display:flex;flex-direction:column;gap:2px;min-width:0}
.pr-talon header b{font-family:var(--f-display);font-weight:800;font-stretch:105%;font-size:17px;line-height:1.2;overflow-wrap:anywhere}
.pr-talon header a{color:var(--fg)}
.pr-prov{font-size:14px;color:var(--muted)}
.pr-prov a{color:var(--fg);font-weight:700}
.pr-opc{font-size:13px;color:var(--fg);background:var(--suave);border-radius:6px;padding:3px 8px;margin-top:4px;align-self:flex-start;overflow-wrap:anywhere}
.pr-talon.ancho{grid-column:span 2}
@media (max-width:620px){.pr-talon.ancho{grid-column:auto}}
.pr-matriz{flex-basis:100%;overflow-x:auto;margin-top:6px}
.pr-matriz table{border-collapse:collapse;font:600 12.5px var(--f-num);min-width:100%}
.pr-matriz th,.pr-matriz td{border:1px solid var(--line);padding:5px 7px;text-align:right;white-space:nowrap}
.pr-matriz thead th{color:var(--muted);font-weight:600;background:var(--bg)}
.pr-matriz tbody th{color:var(--muted);background:var(--bg)}
.pr-tramos{list-style:none;margin:6px 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:4px;flex-basis:100%}
.pr-tramos li{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:7px;padding:4px 7px;background:var(--bg)}
.pr-tramos span{font:600 11.5px var(--f-num);color:var(--muted)}
.pr-tramos b{font:700 13px var(--f-num)}
.pr-pieza{font:500 11.5px var(--f-num);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.pr-cifra{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 10px;border-top:1.5px dashed var(--line);padding-top:8px}
.pr-cant{font:600 13px var(--f-num);color:var(--muted)}
.pr-total{font:700 20px var(--f-num);letter-spacing:-.01em}
.pr-uni{flex-basis:100%;font:400 12.5px var(--f-num);color:var(--muted)}
.pr-spec{margin:0;font-size:13.5px;color:var(--muted);line-height:1.45;overflow-wrap:anywhere}
.pr-talon footer{margin-top:auto;display:flex;justify-content:space-between;align-items:center;gap:6px 10px;flex-wrap:wrap;font-size:12.5px;color:var(--muted)}
.pr-rep-btn{font:inherit;font-size:12.5px;background:none;border:0;padding:6px 2px;color:var(--muted);text-decoration:underline;text-underline-offset:3px;cursor:pointer;min-height:32px}
.pr-rep-btn:hover{color:var(--bad)}
.pr-mio{font:700 11px var(--f-num);letter-spacing:.08em;text-transform:uppercase;color:var(--good)}
.pr-mio.pr-ya{color:var(--muted)}
.pr-viejo{color:var(--warn,#9a6200)}
.pr-rep{border:0;border-radius:18px;padding:0;width:min(520px,94vw);max-height:92vh;background:var(--card);color:var(--fg);box-shadow:0 24px 60px rgba(0,0,0,.3);font-family:var(--f-body)}
.pr-rep::backdrop{background:rgba(10,12,20,.55)}
.pr-rep-c{padding:22px;display:flex;flex-direction:column;gap:12px;font-size:15px;line-height:1.5}
.pr-rep-c h2{font-family:var(--f-display);font-weight:800;font-size:23px;margin:0}
.pr-rep-c p{margin:0;color:var(--muted)}
.pr-rep-c p b{color:var(--fg)}
.pr-rep fieldset{border:0;padding:0;margin:0;display:flex;flex-direction:column;gap:6px}
.pr-rep legend{font-weight:700;margin-bottom:6px}
.pr-rep-op{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:10px;padding:8px 10px;cursor:pointer}
.pr-rep-op:has(input:checked){border-color:var(--fg);background:var(--suave)}
.pr-rep-op input{margin-top:4px;accent-color:var(--fg)}
.pr-rep-op span{display:flex;flex-direction:column}
.pr-rep-op small{color:var(--muted);font-size:13px}
.pr-rep-det{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--muted)}
.pr-rep-det textarea{font:inherit;font-size:16px;border:1px solid var(--line);background:var(--field);color:var(--fg);border-radius:8px;padding:8px}
.pr-rep-nota{font-size:13px}
.pr-rep-msg{color:var(--bad)!important;font-weight:700;font-size:14px}
.pr-rep-msg:empty{display:none}
.pr-rep-pie{display:flex;justify-content:flex-end;gap:8px}
.pr-no,.pr-si{font:inherit;font-size:15px;border-radius:10px;padding:0 16px;min-height:44px;cursor:pointer}
.pr-no{border:1px solid var(--line);background:var(--card);color:var(--fg)}
.pr-si{border:1px solid var(--btn);background:var(--btn);color:var(--btn-tx);font-weight:700}
.pr-si:disabled{opacity:.5}
`;
export function estilosPrecios() {
  if (document.getElementById("css-precios")) return;
  const s = document.createElement("style"); s.id = "css-precios"; s.textContent = CSS_PRECIOS; document.head.appendChild(s);
}
