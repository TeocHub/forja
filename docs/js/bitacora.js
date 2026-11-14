// Forja · Bitácora de avance (desde el 2026-11-14).
// Un diario del proyecto para cualquier oficio: cada entrada dice qué es (avance, versión, decisión, problema, prueba, idea),
// de qué parte del trabajo (escritura, arte, código, diseño, sonido, producción) y puede llevar un enlace
// (una versión jugable, un video, una imagen). Arriba, «Tu semana»: los días trabajados como una regla, se toca para filtrar.
// Tabla public.notas (tipo, oficio, enlace, resuelta_en). La biblia y la vitrina siguen leyendo `texto`.
// Una versión con enlace marca la técnica «prototipo» de la Ruta.

// Los tipos de entrada. `d` es la pista del campo de texto.
export const TIPOS = [
  { k: "avance", n: "Avance", ico: "M4 12h15 M13 6l6 6-6 6", d: "¿Qué avanzaste hoy?" },
  { k: "version", n: "Versión", ico: "M9 4h9v5H9z M9 6.5H5.5 M13.5 9v11", d: "Versión 0.3: qué trae de nuevo" },
  { k: "decision", n: "Decisión", ico: "M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16z M15 9l-1.8 4.2L9 15l1.8-4.2z", d: "Qué decidiste y por qué" },
  { k: "problema", n: "Problema", ico: "M12 4l9 16H3z M12 10v4 M12 17v.01", d: "Qué se trabó o falló" },
  { k: "prueba", n: "Prueba", ico: "M10.5 4.5a6 6 0 1 0 0 12a6 6 0 1 0 0-12z M15 15l5 5", d: "Qué probaste y qué aprendiste" },
  { k: "idea", n: "Idea", ico: "M12 3 Q13.2 10.8 21 12 Q13.2 13.2 12 21 Q10.8 13.2 3 12 Q10.8 10.8 12 3 Z", d: "Una idea para más adelante" },
];
// La parte del trabajo. Es opcional: un proyecto de una sola persona puede no usarla nunca.
export const OFICIOS = [
  { k: "escritura", n: "Escritura" }, { k: "arte", n: "Arte" }, { k: "codigo", n: "Código" },
  { k: "diseno", n: "Diseño" }, { k: "sonido", n: "Sonido" }, { k: "produccion", n: "Producción" },
];
// Qué oficios van primero según la categoría (el resto sigue disponible).
const PRIMERO = {
  historia: ["escritura", "arte", "diseno"], comic: ["escritura", "arte", "diseno"], videojuego: ["codigo", "arte", "diseno", "sonido"],
  juegomesa: ["diseno", "arte", "produccion"], contenido: ["escritura", "produccion", "arte", "sonido"], producto: ["diseno", "produccion", "arte"],
};
export const tipoDe = (k) => TIPOS.find((t) => t.k === k) || TIPOS[0];
export const oficioDe = (k) => OFICIOS.find((o) => o.k === k) || null;
const oficiosPara = (tipo) => { const p = PRIMERO[tipo] || []; return [...OFICIOS].sort((a, b) => (p.includes(a.k) ? p.indexOf(a.k) : 9) - (p.includes(b.k) ? p.indexOf(b.k) : 9)); };
const svg = (d, t = 16) => '<svg viewBox="0 0 24 24" width="' + t + '" height="' + t + '" aria-hidden="true"><path d="' + d + '"/></svg>';
// Para la biblia y otros lugares: «Versión · Código».
export const etiqueta = (n) => tipoDe(n.tipo).n + (oficioDe(n.oficio) ? " · " + oficioDe(n.oficio).n : "");

// Días en hora local (Chile, o la del navegador).
const dia = (iso) => { const d = new Date(iso); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const lunes = (offset) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7); return d; };
const DIAS = ["L", "M", "M", "J", "V", "S", "D"], DIAS_N = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];
// Días seguidos con alguna entrada, contando desde hoy (o desde ayer si hoy aún no hay nada).
export function racha(notas) {
  const dias = new Set(notas.map((n) => dia(n.creado_en)));
  const d = new Date(); d.setHours(12, 0, 0, 0);
  if (!dias.has(dia(d))) d.setDate(d.getDate() - 1);
  let r = 0; while (dias.has(dia(d))) { r++; d.setDate(d.getDate() - 1); }
  return r;
}
const limpio = (u) => { try { const x = new URL(u); return x.protocol === "https:" ? x.href : null; } catch (e) { return null; } };
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };
const esImagen = (u) => /\.(png|jpe?g|gif|webp|avif)(\?|#|$)/i.test(u) || /^https:\/\/(i\.ibb\.co|i\.imgur\.com|i\.postimg\.cc)\//.test(u);

export const CSS_BITACORA = `
.bt{display:grid;gap:18px}
.bt-sem{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px;display:grid;gap:14px}
.bt-sem-top{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.bt-sem-top h3{margin:0;font-family:var(--f-display);font-weight:800;font-stretch:110%;font-size:19px}
.bt-sem-top .rango{display:flex;align-items:center;gap:4px;font:600 13px var(--f-num);color:var(--muted)}
.bt-sem-top .rango button{font:inherit;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:8px;width:36px;height:36px;cursor:pointer}
.bt-sem-top .rango button:disabled{opacity:.35;cursor:default}
.bt-regla{display:grid;grid-template-columns:repeat(7,1fr);border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--mesa)}
.bt-dia{font:inherit;color:var(--fg);background:transparent;border:0;border-left:1px solid var(--line);padding:10px 4px 8px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;min-height:96px}
.bt-dia:first-child{border-left:0}
.bt-dia:disabled{cursor:default}
.bt-dia .marcas{flex:1;display:flex;flex-direction:column-reverse;align-items:center;gap:3px;width:100%}
.bt-dia .marcas{gap:4px;justify-content:flex-start}
.bt-dia .marcas i{display:block;height:7px;width:62%;border-radius:2px;background:var(--tc)}
.bt-dia .marcas i.media{width:40%}
.bt-dia .marcas i.vacia{background:var(--line);width:26%;height:3px}
.bt-dia .mas{font:700 11px var(--f-num);color:var(--muted)}
.bt-dia b{font:700 12px var(--f-num);color:var(--muted);display:flex;flex-direction:column;align-items:center;gap:1px}
.bt-dia b small{font:500 11px var(--f-num)}
.bt-dia.hoy b{color:var(--fg)}
.bt-dia.hoy b small{color:var(--card);background:var(--tc);border-radius:999px;padding:0 6px}
.bt-dia[aria-pressed="true"]{background:color-mix(in srgb,var(--tc) 14%,var(--card))}
.bt-dice{margin:0;color:var(--muted);font-size:14.5px;line-height:1.45}
.bt-dice strong{color:var(--fg)}
.bt-filtros{display:flex;flex-wrap:wrap;gap:8px}
.bt-f{font:inherit;font-size:13.5px;display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--fg);cursor:pointer}
.bt-f small{font:700 12px var(--f-num);color:var(--muted)}
.bt-f[aria-pressed="true"]{border-color:var(--fg);background:var(--fg);color:var(--bg)}
.bt-f[aria-pressed="true"] small{color:inherit}
.bt-f svg{fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
a.bt-f{text-decoration:none}
.bt-nueva{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px;display:grid;gap:12px}
.bt-nueva textarea{width:100%;min-height:84px;resize:vertical;font:inherit;font-size:16px;color:var(--fg);border:1px solid var(--line);background:var(--field);border-radius:10px;padding:10px 12px}
.bt-grupo{display:grid;gap:6px}
.bt-grupo>span{font:700 12px var(--f-num);color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
.bt-sellos{display:flex;flex-wrap:wrap;gap:6px}
.bt-sello{font:inherit;font-size:14px;display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 13px;border-radius:8px;border:1px dashed var(--line);background:transparent;color:var(--fg);cursor:pointer}
.bt-sello svg{fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.bt-sello[aria-checked="true"],.bt-sello[aria-pressed="true"]{border:1px solid var(--tc);background:color-mix(in srgb,var(--tc) 14%,var(--card));font-weight:700}
.bt-enlace{display:flex;gap:8px;align-items:center}
.bt-enlace input{flex:1;min-width:0;font:inherit;font-size:16px;color:var(--fg);background:var(--field);border:1px solid var(--line);border-radius:10px;padding:9px 12px;min-height:44px}
.bt-pie{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.bt-pie .hint{font-size:13px;color:var(--muted)}
.bt-hilo{position:relative;display:flex;flex-direction:column;gap:16px;padding-left:22px}
.bt-hilo::before{content:"";position:absolute;left:5px;top:8px;bottom:8px;width:2px;background:var(--line);border-radius:2px}
.bt-dia-t{position:relative;font:700 12px var(--f-num);color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin:6px 0 -6px}
.bt-n{position:relative;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px;display:grid;gap:6px}
.bt-n::before{content:"";position:absolute;left:-22px;top:15px;width:12px;height:12px;border-radius:50%;background:var(--card);border:2px solid var(--tc)}
.bt-n.t-version::before{background:var(--tc)}
.bt-n.t-problema:not(.resuelta){border-left:3px solid var(--warn,#B4561B)}
.bt-n.t-problema:not(.resuelta)::before{border-color:var(--warn,#B4561B)}
.bt-cab{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13px;color:var(--muted)}
.bt-cab .tp{display:inline-flex;align-items:center;gap:5px;font-weight:700;color:var(--fg)}
.bt-cab .tp svg{fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.bt-cab .of{border:1px solid var(--line);border-radius:4px;padding:1px 7px;font-size:12px}
.bt-cab time{font:600 12px var(--f-num);margin-left:auto}
.bt-n p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.5}
.bt-link{display:flex;align-items:center;gap:10px;justify-content:space-between;border:1px solid var(--line);border-radius:10px;padding:8px 12px;background:var(--mesa);color:var(--fg);text-decoration:none;font-size:14px}
.bt-link span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-family:var(--f-num);font-size:12.5px}
.bt-link b{flex:none}
.bt-img{max-width:100%;max-height:260px;border-radius:10px;border:1px solid var(--line);display:block;object-fit:cover}
.bt-acc{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap}
.bt-acc button{font:inherit;font-size:13px;border:1px solid transparent;background:none;color:var(--muted);border-radius:8px;min-height:34px;padding:0 10px;cursor:pointer}
.bt-acc button:hover{border-color:var(--line);color:var(--fg)}
.bt-acc .res{border-color:var(--line);color:var(--fg)}
.bt-vacio{margin:0;color:var(--muted)}
@media (max-width:640px){
  .bt-sem,.bt-nueva{padding:14px}
  .bt-dia{min-height:84px;padding:8px 2px 6px}
}
`;

// ctx: { panel, P, ESP, sb, tc, toast, limite, esc, ed (puede escribir), notas() / setNotas(arr), alCambiar(), marcarHecho(id), tipoInicial }
export function vista(ctx) {
  const { panel, P, sb, esc, toast } = ctx;
  const F = { semana: 0, dia: null, oficio: null, tipo: null };
  let tipo = TIPOS.some((t) => t.k === ctx.tipoInicial) ? ctx.tipoInicial : "avance";
  let oficio = null; try { oficio = localStorage.getItem("forja-oficio-" + P.id) || null; } catch (e) {}
  if (!oficioDe(oficio)) oficio = null;

  panel.innerHTML = '<section class="bloque bt" style="margin-top:14px;--tc:' + ctx.tc + '">' +
    '<div class="cab"><h2>Bitácora de avance</h2><span class="hint">Lo que avanzas, decides y pruebas, con fecha. Para cualquier parte del trabajo.</span></div>' +
    '<div class="bt-sem" id="bt-sem"></div>' +
    (ctx.ed ? '<form class="bt-nueva" id="bt-f">' +
      '<div class="bt-grupo"><span id="bt-l-tipo">Qué es</span><div class="bt-sellos" role="radiogroup" aria-labelledby="bt-l-tipo" id="bt-tipos"></div></div>' +
      '<label class="fx-sr" for="bt-texto">Nueva entrada</label><textarea id="bt-texto" maxlength="20000"></textarea>' +
      '<div class="bt-grupo"><span id="bt-l-of">De qué parte del trabajo <small style="text-transform:none;letter-spacing:0;font-weight:400">(opcional)</small></span><div class="bt-sellos" role="group" aria-labelledby="bt-l-of" id="bt-oficios"></div></div>' +
      '<div class="bt-grupo"><label for="bt-enlace" id="bt-l-enl">Enlace <small style="text-transform:none;letter-spacing:0;font-weight:400">(opcional)</small></label><div class="bt-enlace"><input id="bt-enlace" type="text" inputmode="url" spellcheck="false" maxlength="500" autocomplete="off"></div></div>' +
      '<div class="bt-pie"><span class="hint">Ctrl + Enter para anotar</span><button class="btn prim" type="submit">Anotar</button></div></form>' : "") +
    '<div class="bt-hilo" id="bt-hilo"></div></section>';
  const $ = (id) => panel.querySelector("#" + id);
  const notas = () => ctx.notas();

  // --- Tu semana: siete días como una regla; cada entrada es una marca. ---
  function semana() {
    const L = lunes(F.semana), hoy = dia(new Date());
    const dias = [...Array(7)].map((_, i) => { const d = new Date(L); d.setDate(L.getDate() + i); return d; });
    const enSemana = notas().filter((n) => { const k = dia(n.creado_en); return k >= dia(dias[0]) && k <= dia(dias[6]); });
    const porDia = (d) => enSemana.filter((n) => dia(n.creado_en) === dia(d));
    const fin = dias[6], rango = dias[0].getDate() + (dias[0].getMonth() !== fin.getMonth() ? " " + MES[dias[0].getMonth()] : "") + "–" + fin.getDate() + " " + MES[fin.getMonth()];
    const trabajados = dias.filter((d) => porDia(d).length).length;
    const abiertos = notas().filter((n) => n.tipo === "problema" && !n.resuelta_en).length;
    const r = racha(notas());
    const ver = notas().find((n) => n.tipo === "version" && n.enlace);
    const titulo = F.semana === 0 ? "Tu semana" : F.semana === -1 ? "La semana pasada" : "Semana del " + rango;
    const dice = !notas().length ? "Todavía no hay entradas. Anota lo primero que hagas, aunque sea chico: así se ve cómo avanza el proyecto."
      : !enSemana.length ? (F.semana === 0 ? "Esta semana aún no hay nada anotado." : "Esa semana no hay nada anotado.") + (r ? " Llevas <strong>" + r + (r === 1 ? " día" : " días") + " seguidos</strong>." : "")
      : "<strong>" + trabajados + (trabajados === 1 ? " día" : " días") + "</strong> con trabajo y <strong>" + enSemana.length + (enSemana.length === 1 ? " entrada" : " entradas") + "</strong>" +
        (F.semana === 0 && r > 1 ? ", " + r + " días seguidos" : "") + "." + (abiertos ? " Hay " + abiertos + (abiertos === 1 ? " problema abierto." : " problemas abiertos.") : "");
    const of = OFICIOS.map((o) => ({ ...o, c: enSemana.filter((n) => n.oficio === o.k).length })).filter((o) => o.c || F.oficio === o.k);
    $("bt-sem").innerHTML = '<div class="bt-sem-top"><h3>' + titulo + '</h3><span class="rango"><button type="button" class="bt-nav" data-sem="-1" aria-label="Semana anterior">‹</button><span>' + rango + '</span><button type="button" class="bt-nav" data-sem="1" aria-label="Semana siguiente"' + (F.semana >= 0 ? " disabled" : "") + ">›</button></span></div>" +
      '<div class="bt-regla" role="group" aria-label="Días de la semana">' + dias.map((d, i) => {
        const n = porDia(d).length, k = dia(d), fut = k > hoy;
        const marcas = n ? [...Array(Math.min(n, 6))].map((_, j) => "<i" + (j % 3 === 1 ? ' class="media"' : "") + "></i>").join("") + (n > 6 ? '<span class="mas">+' + (n - 6) + "</span>" : "") : '<i class="vacia"></i>';
        return '<button type="button" class="bt-dia' + (k === hoy ? " hoy" : "") + '" data-dia="' + k + '" aria-pressed="' + (F.dia === k) + '"' + (fut || !n ? " disabled" : "") +
          ' aria-label="' + DIAS_N[i] + " " + d.getDate() + ": " + (n ? n + (n === 1 ? " entrada" : " entradas") : "sin entradas") + '"><span class="marcas">' + marcas + "</span><b>" + DIAS[i] + "<small>" + d.getDate() + "</small></b></button>";
      }).join("") + "</div>" +
      '<p class="bt-dice">' + dice + "</p>" +
      ((of.length || abiertos || ver || F.tipo) ? '<div class="bt-filtros">' +
        of.map((o) => '<button type="button" class="bt-f" data-of="' + o.k + '" aria-pressed="' + (F.oficio === o.k) + '">' + o.n + " <small>" + o.c + "</small></button>").join("") +
        (abiertos || F.tipo === "problema" ? '<button type="button" class="bt-f" data-tp="problema" aria-pressed="' + (F.tipo === "problema") + '">' + svg(tipoDe("problema").ico, 14) + " Problemas abiertos <small>" + abiertos + "</small></button>" : "") +
        (notas().some((n) => n.tipo === "version") ? '<button type="button" class="bt-f" data-tp="version" aria-pressed="' + (F.tipo === "version") + '">' + svg(tipoDe("version").ico, 14) + " Versiones</button>" : "") +
        (ver ? '<a class="bt-f" href="' + esc(ver.enlace) + '" target="_blank" rel="noopener noreferrer">Probar la última versión ↗</a>' : "") +
      "</div>" : "");
  }

  // --- El hilo: entradas por día, filtradas por lo que se tocó arriba. ---
  function hilo() {
    let xs = notas();
    if (F.dia) xs = xs.filter((n) => dia(n.creado_en) === F.dia);
    if (F.oficio) xs = xs.filter((n) => n.oficio === F.oficio);
    if (F.tipo === "problema") xs = xs.filter((n) => n.tipo === "problema" && !n.resuelta_en);
    else if (F.tipo) xs = xs.filter((n) => n.tipo === F.tipo);
    const filtro = F.dia || F.oficio || F.tipo;
    if (!xs.length) { $("bt-hilo").innerHTML = '<p class="bt-vacio">' + (filtro ? 'Nada con ese filtro. <button type="button" class="btn chico" data-limpiar>Ver todo</button>' : "La primera entrada puede ser por qué te gusta esta idea.") + "</p>"; return; }
    let ult = "";
    $("bt-hilo").innerHTML = (filtro ? '<p class="bt-vacio" style="font-size:14px">' + xs.length + (xs.length === 1 ? " entrada" : " entradas") + ' con este filtro. <button type="button" class="btn chico" data-limpiar>Ver todo</button></p>' : "") + xs.map((n) => {
      const k = dia(n.creado_en), d = new Date(n.creado_en);
      const sep = k !== ult ? '<div class="bt-dia-t">' + (k === dia(new Date()) ? "Hoy" : DIAS_N[(d.getDay() + 6) % 7] + " " + d.getDate() + " " + MES[d.getMonth()] + (d.getFullYear() !== new Date().getFullYear() ? " " + d.getFullYear() : "")) + "</div>" : "";
      ult = k;
      const t = tipoDe(n.tipo), o = oficioDe(n.oficio), url = n.enlace && limpio(n.enlace);
      const hora = d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
      const prob = n.tipo === "problema";
      return sep + '<article class="bt-n t-' + t.k + (n.resuelta_en ? " resuelta" : "") + '"><div class="bt-cab"><span class="tp">' + svg(t.ico, 15) + t.n + (prob ? (n.resuelta_en ? " resuelto" : " abierto") : "") + "</span>" +
        (o ? '<span class="of">' + o.n + "</span>" : "") + '<time datetime="' + n.creado_en + '">' + hora + "</time></div>" +
        "<p>" + esc(n.texto) + "</p>" +
        (url ? (esImagen(url) ? '<img class="bt-img" src="' + esc(url) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">' : "") +
          '<a class="bt-link" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer"><span>' + esc(host(url)) + "</span><b>" + (n.tipo === "version" ? "Probar esta versión ↗" : "Abrir ↗") + "</b></a>" : "") +
        (ctx.ed ? '<div class="bt-acc">' + (prob ? '<button type="button" class="res" data-res="' + n.id + '">' + (n.resuelta_en ? "Reabrir" : "Marcar resuelto") + "</button>" : "") +
          '<button type="button" data-del="' + n.id + '" aria-label="Borrar entrada">Borrar</button></div>' : "") + "</article>";
    }).join("");
  }
  const pintar = () => { semana(); hilo(); };

  // --- El formulario ---
  function formulario() {
    if (!ctx.ed) return;
    $("bt-tipos").innerHTML = TIPOS.map((t) => '<button type="button" class="bt-sello" role="radio" data-tipo="' + t.k + '" aria-checked="' + (t.k === tipo) + '">' + svg(t.ico) + t.n + "</button>").join("");
    $("bt-oficios").innerHTML = oficiosPara(P.tipo).map((o) => '<button type="button" class="bt-sello" data-oficio="' + o.k + '" aria-pressed="' + (o.k === oficio) + '">' + o.n + "</button>").join("");
    $("bt-texto").placeholder = tipoDe(tipo).d;
    $("bt-l-enl").firstChild.textContent = tipo === "version" ? "Enlace de la versión " : "Enlace ";
    $("bt-enlace").placeholder = tipo === "version" ? "https://… (itch.io, un video, una carpeta)" : "https://… (una imagen, un video, una página)";
  }
  pintar(); formulario();

  panel.querySelector(".bt").addEventListener("click", async (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.sem) { F.semana = Math.min(0, F.semana + Number(b.dataset.sem)); F.dia = null; pintar(); return; }
    if (b.dataset.dia) { F.dia = F.dia === b.dataset.dia ? null : b.dataset.dia; pintar(); return; }
    if (b.dataset.of) { F.oficio = F.oficio === b.dataset.of ? null : b.dataset.of; pintar(); return; }
    if (b.dataset.tp) { F.tipo = F.tipo === b.dataset.tp ? null : b.dataset.tp; pintar(); return; }
    if (b.hasAttribute("data-limpiar")) { F.dia = F.oficio = F.tipo = null; pintar(); return; }
    if (b.dataset.tipo) { tipo = b.dataset.tipo; formulario(); $("bt-texto").focus(); return; }
    if (b.dataset.oficio) { oficio = oficio === b.dataset.oficio ? null : b.dataset.oficio; try { if (oficio) localStorage.setItem("forja-oficio-" + P.id, oficio); else localStorage.removeItem("forja-oficio-" + P.id); } catch (er) {} formulario(); return; }
    if (b.dataset.res) {
      const n = notas().find((x) => x.id === b.dataset.res); if (!n) return;
      const v = n.resuelta_en ? null : new Date().toISOString();
      const { error } = await sb.from("notas").update({ resuelta_en: v }).eq("id", n.id);
      if (error) { toast(ctx.limite(error) || "No se pudo guardar."); return; }
      n.resuelta_en = v; if (v) toast("Problema resuelto."); pintar(); ctx.alCambiar(); return;
    }
    if (b.dataset.del) {
      if (b.dataset.armed !== "1") { b.dataset.armed = "1"; b.textContent = "¿Seguro?"; setTimeout(() => { if (b.isConnected) { b.dataset.armed = ""; b.textContent = "Borrar"; } }, 3500); return; }
      const { error } = await sb.from("notas").delete().eq("id", b.dataset.del);
      if (error) { toast("No se pudo borrar."); return; }
      ctx.setNotas(notas().filter((n) => n.id !== b.dataset.del)); pintar(); ctx.alCambiar();
    }
  });
  if (!ctx.ed) return;
  $("bt-texto").onkeydown = (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) $("bt-f").requestSubmit(); };
  $("bt-f").onsubmit = async (e) => {
    e.preventDefault();
    const texto = $("bt-texto").value.trim();
    const crudo = $("bt-enlace").value.trim(), enlace = crudo ? limpio(/^https?:\/\//i.test(crudo) ? crudo.replace(/^http:/i, "https:") : "https://" + crudo) : null;
    if (crudo && !enlace) { toast("El enlace tiene que empezar con https://"); $("bt-enlace").focus(); return; }
    if (!texto) { toast(enlace ? "Escribe una línea sobre el enlace." : "Escribe qué hiciste."); $("bt-texto").focus(); return; }
    const { data, error } = await sb.from("notas").insert({ espacio_id: ctx.ESP, proyecto_id: P.id, texto, tipo, oficio, enlace })
      .select("id,texto,creado_en,tipo,oficio,enlace,resuelta_en").single();
    if (error) { toast(ctx.limite(error) || "No se pudo anotar."); return; }
    ctx.setNotas([data, ...notas()]);
    if (tipo === "version" && enlace) ctx.marcarHecho("prototipo");
    ctx.marcarHecho("avance-bitacora");
    $("bt-texto").value = ""; $("bt-enlace").value = "";
    if (tipo !== "avance") { tipo = "avance"; formulario(); }
    F.semana = 0; F.dia = null; pintar(); ctx.alCambiar();
    toast(data.tipo === "version" ? "Versión anotada." : "Anotado.");
  };
}
