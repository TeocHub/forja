// Forja · Fichas (#fichas en proyecto/): colecciones de fichas con campos según la categoría del proyecto.
// Tablas public.colecciones y public.elementos. La base revisa categoría, plan, topes y enlaces (privado.t_colecciones, t_elementos);
// esta página solo lo muestra. Mientras se prueba, solo la ve el equipo Digital Monster (privado.herramientas_equipo).
import { esc, debounce, limite, tope, LIMITES, MAS_LINK } from "./forja.js";
import { PLANTILLAS, plantillasDe, sirve, camposDe, TIPOS_CAMPO, MAX_CAMPOS, ENLACES } from "./fichas-plantillas.js";
import { pista } from "./ayuda.js";

const okUrl = (v) => /^https:\/\/[^\s"'<>]+$/i.test(String(v || "").trim());
const okColor = (v) => (/^#[0-9a-f]{6}$/i.test(String(v || "")) ? v : "");
const corta = (t, n) => { t = String(t ?? ""); return t.length > n ? t.slice(0, n - 1) + "…" : t; };
const num = (v) => (v === "" || v == null || isNaN(+v) ? 0 : +v);
const sinTildes = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const plural = (n, uno, varios) => n + " " + (n === 1 ? uno : varios);
const nombreUno = (c) => (PLANTILLAS[c.plantilla] || PLANTILLAS.libre).uno;
const plantilla = (c) => PLANTILLAS[c.plantilla] || PLANTILLAS.libre;

let cssPuesto = false;
// Estado de la vista, vive mientras el proyecto esté abierto.
let S = null;

export async function vista(ctx) {
  if (!cssPuesto) { document.head.insertAdjacentHTML("beforeend", "<style>" + CSS_FICHAS + "</style>"); cssPuesto = true; }
  const { P, PL, panel, sb } = ctx;
  if (!S || S.p !== P.id) S = { p: P.id, col: null, sel: null, modo: "tarjetas", q: "", estado: "", nueva: false, ajustes: false };
  try { const m = localStorage.getItem("forja-fichas-modo"); if (m === "tabla" || m === "tarjetas") S.modo = m; } catch (e) {}
  // Una ficha pedida desde la pizarra.
  try { const f = sessionStorage.getItem("forja-ficha-abrir"); if (f) { S.sel = f; sessionStorage.removeItem("forja-ficha-abrir"); } } catch (e) {}

  panel.innerHTML = '<div class="fx-empty">Abriendo tus fichas…</div>';
  const [c, e] = await Promise.all([
    sb.from("colecciones").select("*").eq("proyecto_id", P.id).order("orden").order("creado_en"),
    sb.from("elementos").select("*").eq("proyecto_id", P.id).order("orden").order("creado_en"),
  ]);
  if (c.error || e.error) { panel.innerHTML = '<div class="fx-empty">No se pudieron abrir las fichas. Revisa tu conexión y recarga la página.</div>'; return; }
  const D = { cols: c.data || [], fichas: e.data || [] };
  if (S.sel) { const f = D.fichas.find((x) => x.id === S.sel); if (f) S.col = f.coleccion_id; else S.sel = null; }
  if (!D.cols.some((x) => x.id === S.col)) S.col = (D.cols.find((x) => sirve(x.plantilla, P.tipo)) || D.cols[0] || {}).id || null;

  const topeCol = tope(PL, "colecciones"), topeFichas = tope(PL, "fichas");
  const avisar = (error, otro) => ctx.toast(limite(error) || otro);
  const cambio = () => ctx.alCambiar && ctx.alCambiar(D);
  const colActual = () => D.cols.find((x) => x.id === S.col) || null;
  const fichasDe = (id) => D.fichas.filter((f) => f.coleccion_id === id);
  const editaCol = (col) => ctx.ed && !!col && sirve(col.plantilla, P.tipo);

  function pintar() {
    const col = colActual();
    panel.innerHTML = '<div class="fi" style="--tc:' + ctx.tc + '">' +
      '<div class="fi-cab">' + ctx.volver + '<div><h2>Fichas</h2><p class="hint">' + esc(subtitulo()) + "</p></div>" +
      (topeFichas != null ? '<span class="fi-cupo" title="Plan gratis">' + D.fichas.length + " de " + topeFichas + " fichas</span>" : "") + "</div>" +
      cajones() +
      (S.nueva ? nuevaHTML() : "") +
      (!D.cols.length && !S.nueva ? vacioHTML() : col ? coleccionHTML(col) : "") +
      "</div>";
    ctx.conVolver();
    enlazar();
  }
  const subtitulo = () => {
    const ps = plantillasDe(P.tipo).filter((k) => k !== "libre").map((k) => PLANTILLAS[k].n.toLowerCase());
    return ps.length ? "Para ordenar " + ps.slice(0, 2).join(" y ") + ", cada cosa con sus datos." : "Cada cosa de tu proyecto con sus datos.";
  };

  // Las colecciones como cajones de un fichero.
  function cajones() {
    if (!D.cols.length) return "";
    const lleno = topeCol != null && D.cols.length >= topeCol;
    return '<div class="fi-cajones" role="tablist" aria-label="Colecciones">' +
      D.cols.map((x) => {
        const n = fichasDe(x.id).length, pl = plantilla(x), tot = pl.total ? fichasDe(x.id).reduce((a, f) => a + num((f.datos || {})[pl.total]), 0) : 0;
        return '<button type="button" role="tab" class="fi-cajon' + (sirve(x.plantilla, P.tipo) ? "" : " fuera") + '" data-col="' + x.id + '" aria-selected="' + (x.id === S.col && !S.nueva) + '">' +
          "<b>" + esc(x.nombre) + "</b><small>" + esc(pl.n) + " · " + plural(n, "ficha", "fichas") + (tot ? " · " + tot + " en total" : "") + "</small></button>";
      }).join("") +
      (ctx.ed ? '<button type="button" class="fi-cajon nuevo" id="fi-nueva" aria-expanded="' + S.nueva + '"' + (lleno ? ' data-lleno="1"' : "") + "><b>+ Nueva colección</b><small>" + (lleno ? "Plan gratis: " + topeCol + " por proyecto" : "Cartas, personajes, productos…") + "</small></button>" : "") +
      "</div>";
  }

  function vacioHTML() {
    const ops = plantillasDe(P.tipo).filter((k) => k !== "libre").slice(0, 2);
    return '<div class="fi-vacio"><div class="fi-mazo" aria-hidden="true"><i></i><i></i><i></i></div><div><h3>Junta todo en fichas</h3>' +
      "<p>" + (ops.length ? "Una ficha por cada " + esc(ops.map((k) => PLANTILLAS[k].uno).join(" o ")) + " de tu proyecto, con los datos que pide y en qué estado está. Las ves como tarjetas o como tabla." : esc(PLANTILLAS.libre.d)) + "</p>" +
      "<p class=\"hint\">Cada ficha puede abrir o necesitar a otra, y en la Pizarra puedes traerlas para ver cómo se conectan.</p>" +
      (ctx.ed ? '<button type="button" class="btn prim" id="fi-empezar">Crear la primera colección</button>' : '<p class="hint">Este proyecto aún no tiene fichas.</p>') + "</div></div>";
  }

  function nuevaHTML() {
    const lleno = topeCol != null && D.cols.length >= topeCol;
    if (lleno) return '<div class="fi-aviso">' + "El plan gratis permite " + topeCol + " colecciones por proyecto. Borra una para crear otra, o usa Forja Más." + MAS_LINK + "</div>";
    const ops = plantillasDe(P.tipo);
    return '<div class="fi-nueva"><h3>Nueva colección</h3><div class="fi-pls" role="radiogroup" aria-label="Plantilla">' +
      ops.map((k, i) => '<label class="fi-pl"><input type="radio" name="fi-pl" value="' + k + '"' + (i === 0 ? " checked" : "") + "><span><b>" + esc(PLANTILLAS[k].n) + "</b><small>" + esc(PLANTILLAS[k].d) + "</small></span></label>").join("") +
      '</div><div class="fi-fila"><label class="fi-c"><span>Nombre</span><input id="fi-nombre" maxlength="80" value="' + esc(PLANTILLAS[ops[0]].n) + '"></label>' +
      '<button type="button" class="btn prim" id="fi-crear">Crear</button><button type="button" class="btn" id="fi-cancelar">Cancelar</button></div></div>';
  }

  function coleccionHTML(col) {
    const pl = plantilla(col), fs = fichasDe(col.id), ed = editaCol(col);
    const q = sinTildes(S.q), vis = fs.filter((f) => (!S.estado || f.estado === S.estado) && (!q || sinTildes(f.titulo + " " + Object.values(f.datos || {}).join(" ")).includes(q)));
    const tot = pl.total ? fs.reduce((a, f) => a + num((f.datos || {})[pl.total]), 0) : 0;
    const motivo = !sirve(col.plantilla, P.tipo)
      ? "<b>Esta colección es de otra categoría.</b> Queda guardada para ver o borrar; para editarla, vuelve a la categoría en que la creaste."
      : !ctx.ed ? "Puedes ver estas fichas, pero no editarlas." : "";
    const estados = [...new Set([...pl.estados, ...fs.map((f) => f.estado).filter(Boolean)])];
    return (motivo ? '<div class="fi-aviso" role="status">' + motivo + "</div>" : "") +
      '<div class="fi-barra">' +
      (fs.length > 5 ? '<label class="fx-sr" for="fi-q">Buscar</label><input id="fi-q" type="search" placeholder="Buscar en ' + esc(col.nombre) + '" value="' + esc(S.q) + '">' : "") +
      (fs.length ? '<div class="fi-estados" role="group" aria-label="Filtrar por estado"><button type="button" data-est="" aria-pressed="' + !S.estado + '">Todas</button>' +
        estados.map((x) => '<button type="button" data-est="' + esc(x) + '" aria-pressed="' + (S.estado === x) + '">' + esc(x) + " <small>" + fs.filter((f) => f.estado === x).length + "</small></button>").join("") + "</div>" : "") +
      '<div class="fi-modo" role="group" aria-label="Vista"><button type="button" data-modo="tarjetas" aria-pressed="' + (S.modo === "tarjetas") + '">Tarjetas</button><button type="button" data-modo="tabla" aria-pressed="' + (S.modo === "tabla") + '">Tabla</button></div>' +
      (ctx.ed ? '<button type="button" class="btn chico" id="fi-ajustes" aria-expanded="' + S.ajustes + '">Ajustes</button>' : "") +
      (ed ? '<button type="button" class="btn chico prim" id="fi-mas">+ ' + esc(cap(pl.uno)) + "</button>" : "") +
      "</div>" +
      (tot ? '<p class="fi-total">' + plural(tot, "unidad", "unidades") + " en total, sumando «" + esc(camposDe(col).find((x) => x.k === pl.total).n.toLowerCase()) + "».</p>" : "") +
      (S.ajustes ? ajustesHTML(col) : "") +
      '<div class="fi-cuerpo' + (S.sel && fs.some((f) => f.id === S.sel) ? " con-editor" : "") + '">' +
      '<div class="fi-lista">' + (!fs.length ? '<p class="fi-nada">' + (ed ? "Aún no hay " + esc(pl.n.toLowerCase()) + ". Toca «+ " + esc(cap(pl.uno)) + "» para agregar la primera." : "Aún no hay fichas en esta colección.") + "</p>"
        : !vis.length ? '<p class="fi-nada">Nada coincide con la búsqueda.</p>'
        : S.modo === "tabla" ? tablaHTML(col, vis, ed) : '<div class="fi-tarjetas">' + vis.map((f) => tarjetaHTML(col, f)).join("") + "</div>") + "</div>" +
      (S.sel && fs.some((f) => f.id === S.sel) ? '<aside class="fi-editor" aria-label="Ficha">' + editorHTML(col, fs.find((f) => f.id === S.sel), ed) + "</aside>" : "") +
      "</div>";
  }
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  function valorTxt(campo, v) {
    if (v == null || v === "") return "";
    if (campo.t === "c") return okColor(v);
    if (campo.t === "img") return okUrl(v) ? "imagen" : "";
    return String(v);
  }
  function tarjetaHTML(col, f) {
    const pl = plantilla(col), cs = camposDe(col), d = f.datos || {};
    const color = okColor(d.color), img = cs.some((x) => x.t === "img" && okUrl(d[x.k])) ? d[cs.find((x) => x.t === "img" && okUrl(d[x.k])).k] : "";
    const ver = (pl.vista || []).map((k) => cs.find((x) => x.k === k)).filter(Boolean).filter((x) => valorTxt(x, d[x.k]));
    const enl = (f.enlaces || []).map((x) => [x, D.fichas.find((g) => g.id === x.a)]).filter(([, g]) => g);
    return '<button type="button" class="fi-t' + (f.id === S.sel ? " fi-sel" : "") + '" data-f="' + f.id + '"' + (color ? ' style="--fc:' + color + '"' : "") + ">" +
      (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : "") +
      '<span class="fi-t-tit">' + esc(f.titulo) + "</span>" +
      ver.map((x) => '<span class="fi-t-dato"><i>' + esc(x.n) + "</i>" + esc(corta(valorTxt(x, d[x.k]), x.t === "l" ? 110 : 40)) + "</span>").join("") +
      (enl.length ? '<span class="fi-t-enl">' + enl.slice(0, 3).map(([x, g]) => "<span>" + esc(ENLACES[x.t][0]) + " → " + esc(corta(g.titulo, 24)) + "</span>").join("") + (enl.length > 3 ? "<span>+" + (enl.length - 3) + "</span>" : "") + "</span>" : "") +
      (f.estado ? '<span class="fi-t-est">' + esc(f.estado) + "</span>" : "") + "</button>";
  }

  function tablaHTML(col, fs, ed) {
    const cs = camposDe(col).filter((x) => x.t !== "img"), pl = plantilla(col), dis = ed ? "" : " disabled";
    const celda = (f, x) => {
      const v = (f.datos || {})[x.k] ?? "", at = ' data-tf="' + f.id + '" data-tk="' + x.k + '" aria-label="' + esc(x.n) + " de " + esc(f.titulo) + '"' + dis;
      if (x.t === "o") return "<select" + at + '><option value=""></option>' + (x.op || []).map((o) => '<option' + (o === v ? " selected" : "") + ">" + esc(o) + "</option>").join("") + "</select>";
      if (x.t === "n") return '<input type="number" inputmode="decimal"' + at + ' value="' + esc(v) + '">';
      if (x.t === "c") return '<input type="color"' + at + ' value="' + (okColor(v) || "#888888") + '">';
      return '<input' + at + ' value="' + esc(v) + '">';
    };
    return '<div class="fi-tabla-w"><table class="fi-tabla"><thead><tr><th scope="col">Nombre</th>' + cs.map((x) => '<th scope="col">' + esc(x.n) + "</th>").join("") + '<th scope="col">Estado</th></tr></thead><tbody>' +
      fs.map((f) => '<tr class="' + (f.id === S.sel ? "fi-sel" : "") + '"><th scope="row"><button type="button" class="fi-abrir" data-f="' + f.id + '">' + esc(f.titulo) + "</button></th>" +
        cs.map((x) => "<td>" + celda(f, x) + "</td>").join("") +
        '<td><select data-tf="' + f.id + '" data-tk="__estado" aria-label="Estado de ' + esc(f.titulo) + '"' + dis + '><option value=""></option>' + [...new Set([...pl.estados, f.estado].filter(Boolean))].map((o) => "<option" + (o === f.estado ? " selected" : "") + ">" + esc(o) + "</option>").join("") + "</select></td></tr>").join("") +
      "</tbody></table></div>";
  }

  function campoHTML(x, v, ed) {
    const id = "fi-c-" + x.k, dis = ed ? "" : " disabled", at = ' id="' + id + '" data-k="' + x.k + '"' + dis;
    let w;
    if (x.t === "l") w = "<textarea" + at + ' rows="3"' + (x.ph ? ' placeholder="' + esc(x.ph) + '"' : "") + ">" + esc(v ?? "") + "</textarea>";
    else if (x.t === "n") w = '<input type="number" inputmode="decimal"' + at + ' value="' + esc(v ?? "") + '">';
    else if (x.t === "o") w = "<select" + at + '><option value="">—</option>' + (x.op || []).map((o) => "<option" + (o === v ? " selected" : "") + ">" + esc(o) + "</option>").join("") + "</select>";
    else if (x.t === "c") w = '<span class="fi-color"><input type="color"' + at + ' value="' + (okColor(v) || "#888888") + '">' + (okColor(v) ? '<button type="button" class="fi-x" data-sin-color="' + x.k + '"' + dis + ">Quitar color</button>" : "<small>Sin color</small>") + "</span>";
    else w = '<input type="' + (x.t === "img" ? "url" : "text") + '"' + (x.t === "img" ? ' inputmode="url" placeholder="https://…"' : x.ph ? ' placeholder="' + esc(x.ph) + '"' : "") + at + ' value="' + esc(v ?? "") + '">';
    return '<label class="fi-c' + (x.t === "l" ? " ancho" : "") + '" for="' + id + '"><span>' + esc(x.n) + (x.k.startsWith("p_") ? " <em>propio</em>" : "") + "</span>" + w +
      (x.t === "img" && okUrl(v) ? '<img class="fi-prev" src="' + esc(v) + '" alt="" referrerpolicy="no-referrer">' : "") + "</label>";
  }

  function editorHTML(col, f, ed) {
    const pl = plantilla(col), d = f.datos || {}, dis = ed ? "" : " disabled";
    const salen = (f.enlaces || []).map((x) => [x, D.fichas.find((g) => g.id === x.a)]).filter(([, g]) => g);
    const llegan = [];
    D.fichas.forEach((g) => (g.enlaces || []).forEach((x) => { if (x.a === f.id) llegan.push([x, g]); }));
    const otras = D.fichas.filter((g) => g.id !== f.id);
    const chip = (g, txt, quitar) => '<span class="fi-chip"><button type="button" data-ir="' + g.id + '">' + txt + "</button>" + (quitar && ed ? '<button type="button" class="fi-x" data-quitar="' + quitar + '" aria-label="Quitar enlace">×</button>' : "") + "</span>";
    return '<div class="fi-ed-cab"><label class="fx-sr" for="fi-titulo">Nombre</label><input id="fi-titulo" class="fi-titulo" maxlength="160" value="' + esc(f.titulo) + '"' + dis + '>' +
      '<button type="button" class="fi-x fi-cerrar" id="fi-cerrar" aria-label="Cerrar la ficha">×</button></div>' +
      '<div class="fi-campos">' + camposDe(col).map((x) => campoHTML(x, d[x.k], ed)).join("") + "</div>" +
      '<div class="fi-fila"><label class="fi-c"><span>Estado</span><select id="fi-estado"' + dis + '><option value="">—</option>' + [...new Set([...pl.estados, f.estado].filter(Boolean))].map((o) => "<option" + (o === f.estado ? " selected" : "") + ">" + esc(o) + "</option>").join("") + "</select></label>" +
      '<label class="fi-c"><span>Fecha</span><input type="date" id="fi-fecha" value="' + esc(f.fecha || "") + '"' + dis + "></label></div>" +
      '<div class="fi-enl"><span class="fi-enl-t">Enlaces con otras fichas</span>' +
      (salen.length || llegan.length ? '<div class="fi-chips">' + salen.map(([x, g]) => chip(g, "Esta " + esc(ENLACES[x.t][0]) + " → <b>" + esc(corta(g.titulo, 30)) + "</b>", x.t + ":" + x.a)).join("") +
        llegan.map(([x, g]) => chip(g, esc(ENLACES[x.t][1]) + " <b>" + esc(corta(g.titulo, 30)) + "</b>", "")).join("") + "</div>"
        : '<p class="hint">Une fichas para marcar qué abre qué (una pista abre un acertijo) o qué necesita qué (una carta necesita a otra para jugarse).</p>') +
      (ed && otras.length ? '<div class="fi-fila fi-unir"><label class="fx-sr" for="fi-ent">Tipo de enlace</label><select id="fi-ent">' + Object.entries(ENLACES).map(([k, [n]]) => '<option value="' + k + '">Esta ' + n + "</option>").join("") + "</select>" +
        '<label class="fx-sr" for="fi-ena">Ficha</label><select id="fi-ena"><option value="">Elige una ficha…</option>' +
        D.cols.map((c2) => { const g = otras.filter((x) => x.coleccion_id === c2.id); return g.length ? '<optgroup label="' + esc(c2.nombre) + '">' + g.map((x) => '<option value="' + x.id + '">' + esc(corta(x.titulo, 50)) + "</option>").join("") + "</optgroup>" : ""; }).join("") +
        '</select><button type="button" class="btn chico" id="fi-unir">Unir</button></div>' : "") + "</div>" +
      (ed ? '<div class="fi-fila fi-pie"><button type="button" class="btn chico" id="fi-dup">Duplicar</button><span id="fi-borrar-w"><button type="button" class="btn chico peligro" id="fi-borrar">Borrar</button></span><span class="hint" id="fi-guardado"></span></div>'
        : ctx.ed && !sirve(col.plantilla, P.tipo) ? '<div class="fi-fila fi-pie"><span id="fi-borrar-w"><button type="button" class="btn chico peligro" id="fi-borrar">Borrar</button></span></div>' : "");
  }

  function ajustesHTML(col) {
    const ed = editaCol(col), propios = col.campos || [];
    return '<div class="fi-ajustes"><div class="fi-fila"><label class="fi-c"><span>Nombre de la colección</span><input id="fi-cnombre" maxlength="80" value="' + esc(col.nombre) + '"' + (ed ? "" : " disabled") + "></label></div>" +
      '<div class="fi-propios"><b>Campos propios</b>' +
      (PL.mas ? '<p class="hint">Agrega los datos que tu proyecto necesita y que la plantilla no trae (hasta ' + MAX_CAMPOS + ").</p>" +
          (propios.length ? '<div class="fi-chips">' + propios.map((x) => '<span class="fi-chip"><span>' + esc(x.n) + " <small>" + esc(TIPOS_CAMPO[x.t] || "") + "</small></span>" + (ed ? '<button type="button" class="fi-x" data-campo="' + esc(x.k) + '" aria-label="Quitar el campo ' + esc(x.n) + '">×</button>' : "") + "</span>").join("") + "</div>" : "") +
          (ed && propios.length < MAX_CAMPOS ? '<div class="fi-fila"><label class="fi-c"><span>Nombre del campo</span><input id="fi-pn" maxlength="40" placeholder="Ej.: Pista que abre"></label><label class="fi-c"><span>Tipo</span><select id="fi-pt">' +
            Object.entries(TIPOS_CAMPO).map(([k, n]) => '<option value="' + k + '">' + n + "</option>").join("") + '</select></label><label class="fi-c" id="fi-po-w" hidden><span>Opciones (separadas por coma)</span><input id="fi-po" maxlength="300"></label><button type="button" class="btn chico" id="fi-pagregar">Agregar campo</button></div>' : "")
        : '<p class="hint">Con Forja Más agregas tus propios campos a cualquier colección: una pista, un costo de maná, una talla. Lo que ya tienes se puede ver y borrar.' + MAS_LINK + "</p>") +
      "</div>" +
      (ctx.ed ? '<div class="fi-fila"><span id="fi-cborrar-w"><button type="button" class="btn chico peligro" id="fi-cborrar">Borrar la colección</button></span></div>' : "") + "</div>";
  }

  /* ---------- acciones ---------- */
  const guardarFicha = (f) => { f._sucio = true; guardarLuego(); };
  const guardarYa = async () => {
    const sucias = D.fichas.filter((f) => f._sucio);
    for (const f of sucias) {
      f._sucio = false;
      const { data, error } = await sb.from("elementos").update({ titulo: f.titulo || "Sin nombre", datos: f.datos, estado: f.estado || null, fecha: f.fecha || null, enlaces: f.enlaces || [] }).eq("id", f.id).select("enlaces").maybeSingle();
      if (error) { avisar(error, "No se pudo guardar «" + f.titulo + "». Revisa tu conexión."); continue; }
      if (data) f.enlaces = data.enlaces; // la base limpia los enlaces que no sirven
    }
    const g = panel.querySelector("#fi-guardado"); if (g) { g.textContent = "Guardado"; setTimeout(() => { if (g.isConnected) g.textContent = ""; }, 1500); }
    cambio();
  };
  const guardarLuego = debounce(guardarYa, 700);
  // Si la persona cierra o cambia de pestaña antes de que pase el medio segundo, se guarda al tiro.
  if (S.alSalir) document.removeEventListener("visibilitychange", S.alSalir);
  S.alSalir = () => { if (document.visibilityState === "hidden" && D.fichas.some((f) => f._sucio)) guardarYa(); };
  document.addEventListener("visibilitychange", S.alSalir);

  async function crearColeccion() {
    const k = (panel.querySelector('input[name="fi-pl"]:checked') || {}).value, nombre = panel.querySelector("#fi-nombre").value.trim() || PLANTILLAS[k].n;
    const b = panel.querySelector("#fi-crear"); b.disabled = true;
    const { data, error } = await sb.from("colecciones").insert({ espacio_id: P.espacio_id, proyecto_id: P.id, plantilla: k, nombre, orden: D.cols.length }).select("*").single();
    if (error) { avisar(error, "No se pudo crear la colección."); b.disabled = false; return; }
    D.cols.push(data); S.col = data.id; S.nueva = false; S.sel = null; S.estado = ""; S.q = ""; pintar(); cambio();
  }
  async function crearFicha(base) {
    const col = colActual(); if (!col) return;
    if (topeFichas != null && D.fichas.length >= topeFichas) { ctx.toast("El plan gratis permite " + topeFichas + " fichas por proyecto. Borra alguna para agregar otra."); return; }
    const pl = plantilla(col), n = fichasDe(col.id).length;
    const fila = base
      ? { titulo: corta(base.titulo + " (copia)", 160), datos: base.datos || {}, estado: base.estado, fecha: base.fecha }
      : { titulo: cap(pl.uno) + " " + (n + 1), datos: {}, estado: pl.estados[0] || null };
    const { data, error } = await sb.from("elementos").insert({ ...fila, espacio_id: P.espacio_id, proyecto_id: P.id, coleccion_id: col.id, plantilla: col.plantilla, orden: Math.max(-1, ...fichasDe(col.id).map((f) => f.orden)) + 1 }).select("*").single();
    if (error) { avisar(error, "No se pudo crear la ficha."); return; }
    D.fichas.push(data); S.sel = data.id; S.estado = ""; S.q = "";
    ctx.marcarHecho("fichas"); pintar(); cambio();
    const t = panel.querySelector("#fi-titulo"); if (t && !base) { t.focus(); t.select(); }
  }
  async function borrarFicha(f) {
    const { error } = await sb.from("elementos").delete().eq("id", f.id);
    if (error) { avisar(error, "No se pudo borrar la ficha."); return; }
    D.fichas = D.fichas.filter((x) => x !== f);
    // Los enlaces que apuntaban a ella se limpian solos al guardar cada ficha; aquí se quitan de la vista.
    D.fichas.forEach((g) => { if ((g.enlaces || []).some((x) => x.a === f.id)) { g.enlaces = g.enlaces.filter((x) => x.a !== f.id); if (editaCol(D.cols.find((c2) => c2.id === g.coleccion_id))) guardarFicha(g); } });
    S.sel = null; ctx.toast("Ficha borrada"); pintar(); cambio();
  }
  async function guardarCampos(col, campos) {
    const { error } = await sb.from("colecciones").update({ campos }).eq("id", col.id);
    if (error) { avisar(error, "No se pudo guardar el campo."); return false; }
    col.campos = campos; return true;
  }

  function enlazar() {
    const $q = (s) => panel.querySelector(s), $$ = (s) => panel.querySelectorAll(s);
    $$("[data-col]").forEach((b) => b.onclick = () => { S.col = b.dataset.col; S.nueva = false; S.sel = null; S.estado = ""; S.q = ""; S.ajustes = false; pintar(); });
    const nueva = $q("#fi-nueva"); if (nueva) nueva.onclick = () => { S.nueva = !S.nueva; pintar(); };
    const emp = $q("#fi-empezar"); if (emp) emp.onclick = () => { S.nueva = true; pintar(); };
    if ($q("#fi-crear")) {
      $q("#fi-crear").onclick = crearColeccion;
      $q("#fi-cancelar").onclick = () => { S.nueva = false; pintar(); };
      const nom = $q("#fi-nombre"); let tocado = false; nom.oninput = () => { tocado = true; };
      $$('input[name="fi-pl"]').forEach((r) => r.onchange = () => { if (!tocado) nom.value = PLANTILLAS[r.value].n; });
      nom.onkeydown = (e) => { if (e.key === "Enter") crearColeccion(); };
    }
    const col = colActual(); if (!col) return;
    const ed = editaCol(col);
    $$("[data-modo]").forEach((b) => b.onclick = () => { S.modo = b.dataset.modo; try { localStorage.setItem("forja-fichas-modo", S.modo); } catch (e) {} pintar(); });
    $$("[data-est]").forEach((b) => b.onclick = () => { S.estado = b.dataset.est; pintar(); });
    const q = $q("#fi-q"); if (q) q.oninput = debounce(() => { S.q = q.value; const pos = q.selectionStart; pintar(); const q2 = $q("#fi-q"); if (q2) { q2.focus(); q2.setSelectionRange(pos, pos); } }, 250);
    if ($q("#fi-mas")) $q("#fi-mas").onclick = () => crearFicha();
    if ($q("#fi-ajustes")) $q("#fi-ajustes").onclick = () => { S.ajustes = !S.ajustes; pintar(); };
    $$("[data-f]").forEach((b) => b.onclick = () => { S.sel = S.sel === b.dataset.f && S.modo === "tarjetas" ? null : b.dataset.f; pintar(); if (S.sel && matchMedia("(max-width:900px)").matches) { const e = $q(".fi-editor"); if (e) e.scrollIntoView({ block: "start", behavior: "smooth" }); } });
    panel.querySelectorAll(".fi img").forEach((im) => im.addEventListener("error", () => im.remove(), { once: true }));

    // Tabla: cada celda guarda en su ficha.
    $$("[data-tf]").forEach((i) => i.addEventListener(i.tagName === "SELECT" || i.type === "color" ? "change" : "input", () => {
      const f = D.fichas.find((x) => x.id === i.dataset.tf); if (!f) return;
      if (i.dataset.tk === "__estado") f.estado = i.value || null; else f.datos = { ...(f.datos || {}), [i.dataset.tk]: i.type === "number" ? (i.value === "" ? "" : +i.value) : i.value };
      guardarFicha(f);
    }));

    // Ajustes de la colección.
    if (S.ajustes) {
      const cn = $q("#fi-cnombre");
      if (cn) cn.onchange = async () => { const v = cn.value.trim(); if (!v) { cn.value = col.nombre; return; } const { error } = await sb.from("colecciones").update({ nombre: v }).eq("id", col.id); if (error) { avisar(error, "No se pudo cambiar el nombre."); cn.value = col.nombre; return; } col.nombre = v; pintar(); cambio(); };
      const pt = $q("#fi-pt"); if (pt) pt.onchange = () => { $q("#fi-po-w").hidden = pt.value !== "o"; };
      const pa = $q("#fi-pagregar");
      if (pa) pa.onclick = async () => {
        const n = $q("#fi-pn").value.trim().slice(0, 40), t = pt.value; if (!n) { $q("#fi-pn").focus(); return; }
        const base = "p_" + (sinTildes(n).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 24) || "campo");
        let k = base, i = 2; while ((col.campos || []).some((x) => x.k === k)) k = base + "_" + i++;
        const campo = { k, n, t }; if (t === "o") campo.op = $q("#fi-po").value.split(",").map((x) => x.trim().slice(0, 40)).filter(Boolean).slice(0, 20);
        if (await guardarCampos(col, [...(col.campos || []), campo])) pintar();
      };
      $$("[data-campo]").forEach((b) => b.onclick = async () => { if (await guardarCampos(col, (col.campos || []).filter((x) => x.k !== b.dataset.campo))) pintar(); });
      const cb = $q("#fi-cborrar");
      if (cb) cb.onclick = () => {
        const n = fichasDe(col.id).length;
        $q("#fi-cborrar-w").innerHTML = '<span class="hint">¿Borrar «' + esc(col.nombre) + "» y " + plural(n, "ficha", "fichas") + '? No se puede deshacer.</span> <button type="button" class="btn chico peligro" id="fi-csi">Sí, borrar</button> <button type="button" class="btn chico" id="fi-cno">Cancelar</button>';
        $q("#fi-cno").onclick = pintar;
        $q("#fi-csi").onclick = async () => {
          const { error } = await sb.from("colecciones").delete().eq("id", col.id);
          if (error) { avisar(error, "No se pudo borrar la colección."); return; }
          D.cols = D.cols.filter((x) => x !== col); D.fichas = D.fichas.filter((f) => f.coleccion_id !== col.id);
          S.col = (D.cols[0] || {}).id || null; S.ajustes = false; S.sel = null; ctx.toast("Colección borrada"); pintar(); cambio();
        };
      };
    }

    // Editor de la ficha elegida.
    const f = D.fichas.find((x) => x.id === S.sel && x.coleccion_id === col.id); if (!f) return;
    const refrescarTarjeta = () => { const t = panel.querySelector('.fi-t[data-f="' + f.id + '"]'); if (t) { t.outerHTML = tarjetaHTML(col, f); const n = panel.querySelector('.fi-t[data-f="' + f.id + '"]'); n.onclick = () => { S.sel = null; pintar(); }; } const a = panel.querySelector('.fi-abrir[data-f="' + f.id + '"]'); if (a) a.textContent = f.titulo; };
    $q("#fi-cerrar").onclick = () => { S.sel = null; pintar(); };
    $$("[data-ir]").forEach((b) => b.onclick = () => { const g = D.fichas.find((x) => x.id === b.dataset.ir); if (!g) return; S.col = g.coleccion_id; S.sel = g.id; S.estado = ""; S.q = ""; pintar(); });
    if (!ed) { if ($q("#fi-borrar")) borrarConConfirmar(f); return; }
    const t = $q("#fi-titulo"); t.oninput = () => { f.titulo = t.value.trim() ? t.value : f.titulo; if (t.value.trim()) { guardarFicha(f); refrescarTarjeta(); } };
    t.onblur = () => { if (!t.value.trim()) t.value = f.titulo; };
    panel.querySelectorAll(".fi-editor [data-k]").forEach((i) => i.addEventListener(i.tagName === "SELECT" || i.type === "color" ? "change" : "input", () => {
      const campo = camposDe(col).find((x) => x.k === i.dataset.k);
      f.datos = { ...(f.datos || {}), [i.dataset.k]: i.type === "number" ? (i.value === "" ? "" : +i.value) : i.value };
      guardarFicha(f); refrescarTarjeta();
      if (campo && (campo.t === "c" || campo.t === "img")) { const sc = window.scrollY; pintar(); window.scrollTo(0, sc); }
    }));
    $$("[data-sin-color]").forEach((b) => b.onclick = () => { const d = { ...(f.datos || {}) }; delete d[b.dataset.sinColor]; f.datos = d; guardarFicha(f); pintar(); });
    $q("#fi-estado").onchange = (e) => { f.estado = e.target.value || null; guardarFicha(f); refrescarTarjeta(); };
    $q("#fi-fecha").onchange = (e) => { f.fecha = e.target.value || null; guardarFicha(f); };
    const unir = $q("#fi-unir");
    if (unir) unir.onclick = () => {
      const a = $q("#fi-ena").value, tt = $q("#fi-ent").value; if (!a) { $q("#fi-ena").focus(); return; }
      if ((f.enlaces || []).some((x) => x.a === a && x.t === tt)) { ctx.toast("Ese enlace ya existe."); return; }
      if ((f.enlaces || []).length >= 30) { ctx.toast("Una ficha puede tener hasta 30 enlaces."); return; }
      f.enlaces = [...(f.enlaces || []), { a, t: tt }]; guardarFicha(f); pintar();
    };
    $$("[data-quitar]").forEach((b) => b.onclick = () => { const [tt, a] = b.dataset.quitar.split(":"); f.enlaces = (f.enlaces || []).filter((x) => !(x.a === a && x.t === tt)); guardarFicha(f); pintar(); });
    $q("#fi-dup").onclick = () => crearFicha(f);
    borrarConConfirmar(f);
  }
  function borrarConConfirmar(f) {
    const b = panel.querySelector("#fi-borrar"); if (!b) return;
    b.onclick = () => {
      panel.querySelector("#fi-borrar-w").innerHTML = '<span class="hint">¿Borrar «' + esc(corta(f.titulo, 40)) + '»?</span> <button type="button" class="btn chico peligro" id="fi-si">Sí, borrar</button> <button type="button" class="btn chico" id="fi-no">No</button>';
      panel.querySelector("#fi-no").onclick = pintar;
      panel.querySelector("#fi-si").onclick = () => borrarFicha(f);
    };
  }

  pintar();
  pista(panel, "fichas");
}

export const CSS_FICHAS = `
.fi{display:flex;flex-direction:column;gap:14px;margin-top:14px}
.fi-cab{display:flex;align-items:flex-start;gap:14px;flex-wrap:wrap}
.fi-cab h2{font-family:var(--f-display);font-size:24px;margin:0}
.fi-cab .hint{margin:2px 0 0;max-width:60ch}
.fi-cupo{margin-left:auto;font-family:var(--f-num);font-size:12px;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:4px 10px;white-space:nowrap}
.fi-cajones{display:flex;gap:10px;overflow-x:auto;padding:4px 2px 10px;scrollbar-width:thin}
.fi-cajon{flex:0 0 auto;min-width:170px;max-width:240px;text-align:left;font:inherit;color:var(--fg);background:var(--card);border:1px solid var(--line);border-radius:4px 4px 14px 14px;padding:12px 14px 10px;cursor:pointer;display:flex;flex-direction:column;gap:2px;position:relative;box-shadow:0 1px 0 var(--line)}
.fi-cajon::before{content:"";position:absolute;left:50%;top:-1px;width:38px;height:6px;margin-left:-19px;border-radius:0 0 6px 6px;background:color-mix(in srgb,var(--tc) 35%,var(--line))}
.fi-cajon b{font-family:var(--f-display);font-size:15.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fi-cajon small{font-size:12.5px;color:var(--muted)}
.fi-cajon[aria-selected="true"]{border-color:var(--tc);box-shadow:0 0 0 1px var(--tc) inset,0 6px 16px -10px var(--tc)}
.fi-cajon[aria-selected="true"]::before{background:var(--tc)}
.fi-cajon.fuera{opacity:.72;border-style:dashed}
.fi-cajon.nuevo{border-style:dashed;background:transparent;color:var(--tc)}
.fi-cajon.nuevo b{color:var(--tc)}
.fi-vacio{display:grid;grid-template-columns:150px minmax(0,1fr);gap:26px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:24px}
.fi-vacio h3{font-family:var(--f-display);font-size:21px;margin:0 0 6px}
.fi-vacio p{margin:0 0 10px;max-width:58ch}
.fi-mazo{position:relative;height:130px}
.fi-mazo i{position:absolute;inset:8px 22px;border-radius:10px;border:1.5px solid color-mix(in srgb,var(--tc) 55%,var(--line));background:var(--card)}
.fi-mazo i:nth-child(1){transform:rotate(-9deg) translate(-8px,4px);background:color-mix(in srgb,var(--tc) 10%,var(--card))}
.fi-mazo i:nth-child(2){transform:rotate(5deg) translate(6px,2px);background:color-mix(in srgb,var(--tc) 5%,var(--card))}
.fi-mazo i:nth-child(3){background:repeating-linear-gradient(var(--card) 0 17px,color-mix(in srgb,var(--tc) 18%,transparent) 17px 18px);background-position:0 26px}
@media (max-width:620px){.fi-vacio{grid-template-columns:minmax(0,1fr)}.fi-mazo{height:100px;max-width:150px}}
.fi-nueva,.fi-ajustes{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:12px}
.fi-nueva h3{margin:0;font-family:var(--f-display);font-size:18px}
.fi-pls{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
.fi-pl{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:12px;padding:12px;cursor:pointer;background:var(--field)}
.fi-pl:has(input:checked){border-color:var(--tc);background:color-mix(in srgb,var(--tc) 7%,var(--card))}
.fi-pl input{margin-top:3px;accent-color:var(--tc)}
.fi-pl span{display:flex;flex-direction:column;gap:2px}
.fi-pl small{color:var(--muted);font-size:13px;line-height:1.4}
.fi-fila{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}
.fi-c{display:flex;flex-direction:column;gap:4px;flex:1 1 180px;min-width:0}
.fi-c>span{font-size:12.5px;color:var(--muted);font-weight:700}
.fi-c em{font-style:normal;font-weight:400;color:var(--tc)}
.fi-c input,.fi-c select,.fi-c textarea,.fi-barra input,.fi-unir select{font:inherit;color:var(--fg);background:var(--field);border:1px solid var(--line);border-radius:10px;padding:8px 10px;width:100%;min-width:0}
.fi-c textarea{resize:vertical;line-height:1.45}
.fi-c input[type=color]{padding:2px;height:38px;width:56px;flex:0 0 auto}
.fi-color{display:flex;gap:10px;align-items:center}
.fi-color small{color:var(--muted)}
.fi-aviso{background:var(--warn-soft);color:var(--fg);border-radius:12px;padding:10px 14px;font-size:14px}
.fi-barra{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.fi-barra input[type=search]{flex:1 1 200px;width:auto}
.fi-estados,.fi-modo{display:flex;gap:4px;flex-wrap:wrap}
.fi-estados button,.fi-modo button{font:inherit;font-size:13.5px;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:999px;padding:5px 11px;cursor:pointer}
.fi-estados button small{color:var(--muted);margin-left:2px}
.fi-estados button[aria-pressed="true"],.fi-modo button[aria-pressed="true"]{background:var(--fg);color:var(--bg);border-color:var(--fg)}
.fi-estados button[aria-pressed="true"] small{color:inherit;opacity:.7}
.fi-modo{margin-left:auto}
.fi-total{margin:-4px 0 0;font-size:13.5px;color:var(--muted)}
.fi-cuerpo{display:grid;grid-template-columns:minmax(0,1fr);gap:18px;align-items:start}
.fi-cuerpo.con-editor{grid-template-columns:minmax(0,1fr) minmax(300px,380px)}
@media (max-width:900px){.fi-cuerpo.con-editor{grid-template-columns:minmax(0,1fr)}.fi-cuerpo.con-editor .fi-editor{order:-1}}
.fi-nada{color:var(--muted);margin:8px 0}
.fi-tarjetas{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px}
.fi-t{--fc:color-mix(in srgb,var(--tc) 60%,var(--line));font:inherit;color:var(--fg);text-align:left;background:var(--card);border:1px solid var(--line);border-top:5px solid var(--fc);border-radius:10px;padding:12px 13px 11px;cursor:pointer;display:flex;flex-direction:column;gap:6px;min-height:118px;transition:transform .12s,box-shadow .12s}
.fi-t:hover{transform:translateY(-2px);box-shadow:0 8px 18px -12px rgba(0,0,0,.35)}
.fi-t.fi-sel{border-color:var(--tc);border-top-color:var(--fc);box-shadow:0 0 0 2px color-mix(in srgb,var(--tc) 40%,transparent)}
.fi-t img{width:calc(100% + 26px);margin:-12px -13px 2px;height:110px;object-fit:cover;border-radius:5px 5px 0 0;display:block}
.fi-t-tit{font-family:var(--f-display);font-weight:700;font-size:16px;line-height:1.25;overflow-wrap:anywhere}
.fi-t-dato{font-size:13.5px;line-height:1.35;overflow-wrap:anywhere}
.fi-t-dato i{font-style:normal;color:var(--muted);font-size:11.5px;display:block}
.fi-t-enl{display:flex;flex-wrap:wrap;gap:4px}
.fi-t-enl span{font-size:11.5px;border-radius:999px;padding:1px 7px;background:color-mix(in srgb,var(--tc) 11%,transparent);color:var(--fg)}
.fi-t-est{margin-top:auto;align-self:flex-start;font-size:11.5px;font-weight:700;letter-spacing:.02em;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:1px 8px}
.fi-tabla-w{overflow-x:auto;border:1px solid var(--line);border-radius:12px;background:var(--card)}
.fi-tabla{border-collapse:collapse;width:100%;font-size:14px}
.fi-tabla th,.fi-tabla td{border-bottom:1px solid var(--line);padding:4px 6px;text-align:left;vertical-align:middle}
.fi-tabla thead th{font-size:12px;color:var(--muted);font-weight:700;padding:8px 8px;white-space:nowrap;background:var(--field)}
.fi-tabla tbody tr:last-child th,.fi-tabla tbody tr:last-child td{border-bottom:0}
.fi-tabla tr.fi-sel{background:color-mix(in srgb,var(--tc) 7%,transparent)}
.fi-tabla input,.fi-tabla select{font:inherit;font-size:14px;color:var(--fg);background:transparent;border:1px solid transparent;border-radius:6px;padding:5px 6px;min-width:110px;width:100%}
.fi-tabla input[type=number]{min-width:70px;font-family:var(--f-num);font-size:13px}
.fi-tabla input[type=color]{min-width:40px;width:40px;height:30px;padding:1px}
.fi-tabla input:focus,.fi-tabla select:focus{border-color:var(--tc);background:var(--field);outline:none}
.fi-abrir{font:inherit;font-weight:700;color:var(--fg);background:none;border:0;padding:6px 4px;cursor:pointer;text-align:left;min-width:120px;text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px}
.fi-editor{background:var(--card);border:1px solid var(--line);border-top:5px solid var(--tc);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:12px;position:sticky;top:12px;max-height:calc(100vh - 24px);overflow:auto}
@media (max-width:900px){.fi-editor{position:static;max-height:none}}
.fi-ed-cab{display:flex;gap:8px;align-items:center}
.fi-titulo{flex:1;min-width:0;font:inherit;font-family:var(--f-display);font-size:20px;font-weight:700;color:var(--fg);background:transparent;border:0;border-bottom:1.5px dashed var(--line);padding:4px 2px}
.fi-titulo:focus{outline:none;border-bottom-color:var(--tc)}
.fi-campos{display:flex;flex-wrap:wrap;gap:10px}
.fi-campos .fi-c{flex:1 1 140px}
.fi-campos .fi-c.ancho{flex-basis:100%}
.fi-prev{max-width:100%;max-height:160px;object-fit:contain;border-radius:8px;margin-top:4px;align-self:flex-start}
.fi-x{font:inherit;font-size:13px;background:none;border:0;color:var(--muted);cursor:pointer;padding:2px 6px;border-radius:6px}
.fi-x:hover{color:var(--fg);background:var(--field)}
.fi-cerrar{font-size:22px;line-height:1}
.fi-enl{border-top:1px dashed var(--line);padding-top:10px;display:flex;flex-direction:column;gap:8px}
.fi-enl-t{font-size:12.5px;color:var(--muted);font-weight:700}
.fi-enl .hint{margin:0;font-size:13px}
.fi-chips{display:flex;flex-wrap:wrap;gap:6px}
.fi-chip{display:inline-flex;align-items:center;gap:2px;border:1px solid var(--line);border-radius:999px;padding:2px 4px 2px 10px;font-size:13px;background:var(--field)}
.fi-chip>button:first-child,.fi-chip>span{font:inherit;color:var(--fg);background:none;border:0;padding:2px 0;cursor:pointer}
.fi-chip>span{cursor:default}
.fi-chip small{color:var(--muted)}
.fi-unir select{flex:1 1 130px;width:auto}
.fi-pie{border-top:1px dashed var(--line);padding-top:10px;align-items:center}
.fi-propios{display:flex;flex-direction:column;gap:8px}
.fi-propios .hint{margin:0}
`;
