// Forja · brújula de formatos: radar de 6 ejes + dial con los formatos alrededor.
// Es una referencia para pensar la idea, no un veredicto: el formato lo elige la persona.

export const EJES = [
  { k: "agencia", n: "Decidir", q: "¿Importa que el público decida, explore o pueda perder?" },
  { k: "reglas", n: "Reglas", q: "¿Hay mecánicas o sistemas que se puedan jugar?" },
  { k: "interior", n: "Voz interna", q: "¿Pesan los pensamientos, la memoria y lo que no se dice?" },
  { k: "imagen", n: "Imagen", q: "¿El mundo, los diseños o la acción se lucen al verse?" },
  { k: "movimiento", n: "Ritmo y sonido", q: "¿Depende de música, voces, timing o movimiento?" },
  { k: "escala", n: "Escala", q: "¿Qué tan grande es? De una escena suelta a una saga." },
];

// Perfil ideal de cada formato en los mismos ejes (0 a 4). El orden es el del dial: vecinos parecidos.
export const FORMATOS = [
  { k: "novela", n: "Novela", c: "Novela", p: [0, 0, 4, 1, 0, 4] },
  { k: "cuento", n: "Cuento", c: "Cuento", p: [0, 0, 4, 1, 0, 1] },
  { k: "podcast", n: "Podcast o audio", c: "Audio", p: [0, 0, 3, 0, 4, 2] },
  { k: "video", n: "Video para redes", c: "Redes", p: [0, 0, 1, 3, 3, 0] },
  { k: "corto", n: "Cortometraje", c: "Corto", p: [0, 0, 2, 3, 3, 1] },
  { k: "largo", n: "Largometraje", c: "Largo", p: [0, 0, 2, 4, 3, 3] },
  { k: "serie", n: "Serie", c: "Serie", p: [0, 0, 2, 3, 3, 4] },
  { k: "animacion", n: "Animación", c: "Animación", p: [0, 0, 1, 4, 4, 2] },
  { k: "comic", n: "Cómic", c: "Cómic", p: [0, 0, 2, 4, 1, 3] },
  { k: "videojuego", n: "Videojuego", c: "Videojuego", p: [4, 3, 1, 3, 3, 3] },
  { k: "mesa", n: "Juego de mesa", c: "Mesa", p: [3, 4, 0, 2, 0, 1] },
];

export const tocado = (ejes) => !!ejes && EJES.some((e) => e.k in ejes);
// Configuración inicial: cómo suele ser cada formato, o la categoría si aún no hay formato. Es el punto de partida que la persona ajusta.
export const BASE_TIPO = { historia: [0, 0, 3, 2, 1, 3], videojuego: [4, 3, 1, 3, 3, 3], juegomesa: [3, 4, 0, 2, 0, 1], contenido: [0, 0, 1, 3, 3, 0], producto: [1, 0, 1, 3, 0, 1], otro: [2, 2, 2, 2, 2, 2] };
export function base(tipo, formato) {
  const f = FORMATOS.find((x) => x.k === formato);
  return f ? f.p.slice() : (BASE_TIPO[tipo] || BASE_TIPO.otro).slice();
}
export const vals = (ejes, b) => EJES.map((e, i) => (ejes && e.k in ejes ? +ejes[e.k] : b ? b[i] : 2));
export function lectura(ejes, b) {
  const v = vals(ejes, b);
  return FORMATOS.map((f) => ({ ...f, s: 1 - f.p.reduce((a, p, i) => a + Math.abs(p - v[i]), 0) / 24 })).sort((a, b) => b.s - a.s);
}
export const pct = (s) => Math.round(s * 100) + "%";
const ang = (i, n) => (-90 + (360 / n) * i) * Math.PI / 180;
const pt = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
const f1 = (n) => n.toFixed(1);
const W = 440, C = [220, 168], R = 112;

/* Radar interactivo. `get()` devuelve los ejes actuales; `set(ejes)` recibe los nuevos. */
export function radar(svg, get, set, pregunta, getBase) {
  svg.setAttribute("viewBox", "0 0 " + W + " 336");
  svg.setAttribute("role", "group");
  svg.setAttribute("aria-label", "Radar de la idea: seis ejes de 0 a 4");
  const n = EJES.length, r0 = 10, rad = (v) => r0 + (v / 4) * (R - r0);
  const pintar = () => {
    const ej = get(), b = getBase ? getBase() : null, v = vals(ej, b), sin = !tocado(ej);
    svg.classList.toggle("sin", sin);
    let s = "";
    for (let k = 1; k <= 4; k++) s += '<polygon class="anillo" points="' + EJES.map((_, i) => pt(...C, rad(k), ang(i, n)).map(f1).join(",")).join(" ") + '"/>';
    EJES.forEach((_, i) => { const [x, y] = pt(...C, R, ang(i, n)); s += '<line class="eje" x1="' + C[0] + '" y1="' + C[1] + '" x2="' + f1(x) + '" y2="' + f1(y) + '"/>'; });
    if (b) s += '<polygon class="base" points="' + b.map((x, i) => pt(...C, rad(x), ang(i, n)).map(f1).join(",")).join(" ") + '"/>';
    s += '<polygon class="forma" points="' + v.map((x, i) => pt(...C, rad(x), ang(i, n)).map(f1).join(",")).join(" ") + '"/>';
    EJES.forEach((e, i) => {
      const a = ang(i, n), [lx, ly] = pt(...C, R + 22, a), anchor = Math.abs(Math.cos(a)) < .2 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
      const dy = Math.sin(a) < -.5 ? -4 : Math.sin(a) > .5 ? 13 : 4;
      s += '<text x="' + f1(lx) + '" y="' + f1(ly + dy) + '" text-anchor="' + anchor + '">' + e.n + (sin && !b ? "" : ' <tspan class="v">' + v[i] + "</tspan>") + "</text>";
    });
    v.forEach((x, i) => {
      const [hx, hy] = pt(...C, rad(x), ang(i, n));
      s += '<circle class="h' + (sin ? "" : " on") + '" data-i="' + i + '" cx="' + f1(hx) + '" cy="' + f1(hy) + '" r="10" tabindex="0" role="slider" aria-label="' + EJES[i].n + ". " + EJES[i].q + '" aria-valuemin="0" aria-valuemax="4" aria-valuenow="' + x + '"/>';
    });
    svg.innerHTML = s;
  };
  const fijar = (i, v) => {
    v = Math.max(0, Math.min(4, v));
    let ej = get();
    if (!tocado(ej)) { const b0 = vals(null, getBase ? getBase() : null); ej = Object.fromEntries(EJES.map((e, k) => [e.k, b0[k]])); }
    if (ej[EJES[i].k] === v && tocado(get())) return;
    set({ ...ej, [EJES[i].k]: v });
    pintar();
  };
  const local = (ev) => { const b = svg.getBoundingClientRect(), k = W / b.width; return [(ev.clientX - b.left) * k - C[0], (ev.clientY - b.top) * k - C[1]]; };
  let eje = null;
  const decir = (i) => { if (pregunta) pregunta.textContent = EJES[i].n + ": " + EJES[i].q; };
  svg.onpointerdown = (ev) => {
    const [dx, dy] = local(ev);
    if (Math.hypot(dx, dy) > R + 40) return;
    const a = Math.atan2(dy, dx);
    let best = 0, bd = 9;
    EJES.forEach((_, i) => { const d = Math.abs(Math.atan2(Math.sin(a - ang(i, n)), Math.cos(a - ang(i, n)))); if (d < bd) { bd = d; best = i; } });
    eje = best; svg.setPointerCapture(ev.pointerId); decir(best); mover(ev); ev.preventDefault();
  };
  const mover = (ev) => {
    if (eje == null) return;
    const [dx, dy] = local(ev), proy = dx * Math.cos(ang(eje, n)) + dy * Math.sin(ang(eje, n));
    fijar(eje, Math.round(((proy - r0) / (R - r0)) * 4));
  };
  svg.onpointermove = mover;
  svg.onpointerup = svg.onpointercancel = () => { eje = null; };
  svg.onkeydown = (ev) => {
    const h = ev.target.closest(".h"); if (!h) return;
    const i = +h.dataset.i, m = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[ev.key];
    if (m == null) return; ev.preventDefault();
    fijar(i, vals(get(), getBase ? getBase() : null)[i] + m); svg.querySelector('[data-i="' + i + '"]').focus();
  };
  svg.addEventListener("focusin", (ev) => { const h = ev.target.closest(".h"); if (h) decir(+h.dataset.i); });
  pintar();
  return pintar;
}

/* Dial: los formatos alrededor, un pétalo por formato según cuánto encaja y la aguja al que más encaja. */
export function dial(svg, ejes, elegido, b) {
  svg.setAttribute("viewBox", "0 0 " + W + " 336");
  svg.setAttribute("aria-hidden", "true");
  const n = FORMATOS.length, sin = !tocado(ejes) && !b, l = lectura(ejes, b), max = l[0].s, min = l[l.length - 1].s;
  const by = Object.fromEntries(l.map((f) => [f.k, f]));
  let s = '<circle class="borde" cx="' + C[0] + '" cy="' + C[1] + '" r="' + R + '"/>';
  FORMATOS.forEach((f, i) => {
    const a = ang(i, n), sc = by[f.k].s, k = sin ? .14 : .16 + .84 * ((sc - min) / ((max - min) || 1)), len = R * .92 * k, w = .2;
    const [x1, y1] = pt(...C, len, a), [xa, ya] = pt(...C, len * .55, a - w), [xb, yb] = pt(...C, len * .55, a + w);
    const top = !sin && f.k === l[0].k, mio = f.k === elegido;
    s += '<path class="petalo' + (top ? " top" : "") + (mio ? " mio" : "") + '" d="M' + C[0] + " " + C[1] + " Q" + f1(xa) + " " + f1(ya) + " " + f1(x1) + " " + f1(y1) + " Q" + f1(xb) + " " + f1(yb) + " " + C[0] + " " + C[1] + 'Z"/>';
    const [lx, ly] = pt(...C, R + 14, a), anchor = Math.abs(Math.cos(a)) < .25 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
    const dy = Math.sin(a) < -.6 ? -10 : Math.sin(a) > .6 ? 8 : -2;
    s += '<text x="' + f1(lx) + '" y="' + f1(ly + dy) + '" text-anchor="' + anchor + '" class="' + (top ? "top" : "") + (mio ? " mio" : "") + '">' + f.c + "</text>";
    if (!sin) s += '<text class="pct' + (top ? " top" : "") + '" x="' + f1(lx) + '" y="' + f1(ly + dy + 13) + '" text-anchor="' + anchor + '">' + pct(sc) + "</text>";
  });
  const gi = FORMATOS.findIndex((f) => f.k === l[0].k), giro = sin ? 20 : (360 / n) * gi;
  s += '<g class="aguja" style="transform-origin:' + C[0] + "px " + C[1] + "px;transform:rotate(" + giro + 'deg)">' +
    '<path d="M' + C[0] + " " + (C[1] - R + 14) + " L" + (C[0] + 7) + " " + C[1] + " L" + (C[0] - 7) + " " + C[1] + 'Z"/>' +
    '<path class="cola" d="M' + C[0] + " " + (C[1] + 34) + " L" + (C[0] + 7) + " " + C[1] + " L" + (C[0] - 7) + " " + C[1] + 'Z"/></g>' +
    '<circle class="eje-c" cx="' + C[0] + '" cy="' + C[1] + '" r="6"/>';
  const prev = svg.querySelector(".aguja");
  const prevT = prev ? prev.style.transform : null;
  svg.innerHTML = s;
  if (prevT) { const g = svg.querySelector(".aguja"), fin = g.style.transform; g.style.transform = prevT; requestAnimationFrame(() => requestAnimationFrame(() => { g.style.transform = fin; })); }
  return { sin, l };
}

export function veredicto(ejes, base0, etiqueta) {
  if (!tocado(ejes)) return base0 && etiqueta
    ? "Esta es la <b>configuración inicial</b> de " + etiqueta + ": así suele verse en estos seis ejes. Ajusta los puntos para que se parezca a tu idea; la línea punteada queda como referencia."
    : "Mueve los puntos del radar y la aguja apuntará al formato donde, según tus respuestas, la idea podría lucirse más.";
  const [a, b, c] = lectura(ejes, base0);
  const cerca = a.s - b.s < .05;
  return "Por cómo la describes, se acerca a <b>" + a.n.toLowerCase() + "</b> (" + pct(a.s) + ")" +
    (cerca ? ", casi a la par con <b>" + b.n.toLowerCase() + "</b> (" + pct(b.s) + ")." : ". Después vienen " + b.n.toLowerCase() + " (" + pct(b.s) + ") y " + c.n.toLowerCase() + " (" + pct(c.s) + ").") +
    " Es una pista para pensar, no una regla: tú decides qué hacer con ella.";
}

/* Brújula miniatura para las fichas del inventario. */
export function mini(ejes, elegido) {
  const c = 28, r = 22, n = FORMATOS.length;
  let s = '<svg class="mini" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="' + r + '" fill="none" stroke="var(--line)" stroke-width="1.5"' + (tocado(ejes) || elegido ? "" : ' stroke-dasharray="2 3"') + "/>";
  FORMATOS.forEach((f, i) => { const [x, y] = pt(c, c, r, ang(i, n)); s += '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="1.6" fill="var(--muted)"/>'; });
  if (tocado(ejes) || elegido) {
    const k = elegido || lectura(ejes)[0].k, i = Math.max(0, FORMATOS.findIndex((f) => f.k === k)), a = ang(i, n);
    const [x, y] = pt(c, c, r - 4, a), [bx, by] = pt(c, c, 4, a + Math.PI / 2), [cx2, cy2] = pt(c, c, 4, a - Math.PI / 2);
    s += '<path d="M' + f1(x) + " " + f1(y) + "L" + f1(bx) + " " + f1(by) + "L" + f1(cx2) + " " + f1(cy2) + 'Z" fill="var(--ember)"/>';
  }
  return s + '<circle cx="28" cy="28" r="2.5" fill="var(--fg)"/></svg>';
}

/* Estilos de la brújula (se comparten entre la portada y la página de proyecto). */
export const CSS_BRUJULA = `
.radar .anillo{fill:none;stroke:var(--line)}
.radar .eje{stroke:var(--line)}
.radar .forma{fill:color-mix(in srgb,var(--accent) 18%,transparent);stroke:var(--accent);stroke-width:2;stroke-linejoin:round}
.radar.sin .forma{fill:color-mix(in srgb,var(--accent) 8%,transparent);stroke-dasharray:4 5}
.radar .base{fill:none;stroke:var(--ember);stroke-width:1.5;stroke-dasharray:3 4;opacity:.8}
.radar.sin .base{display:none}
.radar .h{fill:var(--card);stroke:var(--accent);stroke-width:2.5;cursor:grab}
.radar .h.on{fill:var(--accent)}
.radar .h:focus-visible{outline:none;stroke:var(--ember);stroke-width:4}
.radar text{font-size:13px;fill:var(--fg);font-family:var(--f-body)}
.radar text .v,.radar tspan.v{font-family:var(--f-num);font-size:11px;fill:var(--muted)}
.dial .borde{fill:var(--field);stroke:var(--line)}
.dial .petalo{fill:var(--accent-soft);transition:d .35s ease}
.dial .petalo.top{fill:color-mix(in srgb,var(--ember) 32%,transparent)}
.dial .petalo.mio{stroke:var(--fg);stroke-width:1.5;stroke-dasharray:3 3}
.dial text{font-size:12px;fill:var(--muted);font-family:var(--f-body)}
.dial text.top{fill:var(--fg);font-weight:700}
.dial text.mio{text-decoration:underline}
.dial text.pct{font-family:var(--f-num);font-size:10.5px}
.dial .aguja{transition:transform .6s cubic-bezier(.3,1.4,.5,1)}
.dial .aguja path{fill:var(--ember)}
.dial .aguja path.cola{fill:var(--muted)}
.dial .eje-c{fill:var(--card);stroke:var(--fg);stroke-width:2}
.radar,.dial{width:100%;max-width:460px;height:auto;display:block;margin:0 auto;touch-action:none;user-select:none;-webkit-user-select:none}
@media (prefers-reduced-motion:reduce){.dial .aguja,.dial .petalo{transition:none}}
`;
