// Forja · brújula de formatos: seis balanzas entre dos polos + dial con los formatos alrededor.
// Sirve para orientarse cuando aún no se sabe qué hacer con una idea. Es una referencia, no un veredicto:
// el formato lo elige la persona. Nadie ve números: solo las balanzas y la aguja.

// Cada eje es una balanza entre dos polos igual de válidos. El centro es «me da lo mismo» o «no sé».
// Se guarda de 0 (polo a) a 1 (polo b), con decimales.
export const EJES = [
  { k: "publico", q: "¿Cómo la vive el público?", a: "Mirando", b: "Jugando y decidiendo" },
  { k: "fuerza", q: "¿Dónde está su fuerza?", a: "En lo que se dice", b: "En lo que se ve" },
  { k: "duracion", q: "¿Cuánto dura?", a: "Un rato, de una sentada", b: "Mucho tiempo, por entregas" },
  { k: "grupo", q: "¿Solo o en grupo?", a: "Una persona a solas", b: "Varias juntas" },
  { k: "ritmo", q: "¿Qué ritmo tiene?", a: "A tu ritmo", b: "Marcado por música o timing" },
  { k: "soporte", q: "¿Cómo llega a la gente?", a: "Algo que se tiene en las manos", b: "Algo que se reproduce" },
];

// Cómo suele ser cada formato en las mismas balanzas. El orden es el del dial: vecinos parecidos.
export const FORMATOS = [
  { k: "novela", n: "Novela", c: "Novela", p: [0, .1, .85, .05, .1, .1] },
  { k: "cuento", n: "Cuento", c: "Cuento", p: [0, .15, .1, .1, .2, .1] },
  { k: "podcast", n: "Podcast o audio", c: "Audio", p: [.05, .05, .6, .2, .75, .95] },
  { k: "video", n: "Serie web", c: "Serie web", p: [.1, .7, .55, .3, .7, .95] },
  { k: "corto", n: "Cortometraje", c: "Corto", p: [.05, .8, .15, .6, .75, .95] },
  { k: "largo", n: "Largometraje", c: "Largo", p: [.05, .85, .45, .75, .8, .95] },
  { k: "serie", n: "Serie", c: "Serie", p: [.05, .75, .9, .5, .7, .95] },
  { k: "animacion", n: "Animación", c: "Animación", p: [.05, .95, .45, .55, .9, .95] },
  { k: "comic", n: "Cómic", c: "Cómic", p: [.1, .85, .65, .1, .35, .1] },
  { k: "videojuego", n: "Videojuego", c: "Videojuego", p: [.95, .75, .7, .35, .7, .95] },
  { k: "mesa", n: "Juego de mesa", c: "Mesa", p: [.95, .4, .3, .95, .25, 0] },
];

const C01 = (x) => Math.max(0, Math.min(1, +x || 0));
const VIEJOS = ["agencia", "reglas", "interior", "imagen", "movimiento", "escala"];
// Proyectos guardados con la brújula anterior (seis ejes de 0 a 4): se traducen a las balanzas.
function desdeViejo(e) {
  const g = (k) => (k in e ? +e[k] : 2) / 4;
  return [C01(g("agencia") * .7 + g("reglas") * .3), C01(.5 + (g("imagen") - g("interior")) / 2), C01(g("escala")), .5, C01(g("movimiento")), .5];
}
export const tocado = (ejes) => !!ejes && (EJES.some((e) => e.k in ejes) || VIEJOS.some((k) => k in ejes));
// Los seis valores de 0 a 1 (0,5 si no se ha movido).
export function vals(ejes) {
  if (!ejes) return EJES.map(() => .5);
  if (!EJES.some((e) => e.k in ejes) && VIEJOS.some((k) => k in ejes)) return desdeViejo(ejes);
  return EJES.map((e) => (e.k in ejes ? C01(ejes[e.k]) : .5));
}
// Cuánto dice la persona: cada balanza pesa según cuánto se aleja del centro.
const pesos = (v) => v.map((x) => Math.abs(x - .5) * 2);
export const pistas = (ejes) => pesos(vals(ejes)).reduce((a, w) => a + w, 0);
// Con todo casi al medio, la aguja aún no se inclina.
export const sinRumbo = (ejes) => pistas(ejes) < .35;

// Encaje: en cada balanza, qué tan cerca está el formato de tu idea, contando más las balanzas que moviste.
// Parte de un «no sé» (la mitad) y se afirma a medida que hay más pistas: con poco movido nada encaja del todo.
const DUDA = 1.5;
export function lectura(ejes) {
  const v = vals(ejes), w = pesos(v), tw = w.reduce((a, x) => a + x, 0);
  return FORMATOS.map((f) => ({ ...f, s: (w.reduce((a, x, i) => a + x * (1 - Math.abs(v[i] - f.p[i])), 0) + DUDA * .5) / (tw + DUDA) }))
    .sort((a, b) => b.s - a.s);
}
// En palabras, nunca en números.
export const cercania = (s) => (s >= .8 ? "muy cerca" : s >= .65 ? "cerca" : s >= .5 ? "a medias" : "lejos");
export const perfil = (formato) => { const f = FORMATOS.find((x) => x.k === formato); return f ? f.p.slice() : null; };

const ang = (i, n) => (-90 + (360 / n) * i) * Math.PI / 180;
const pt = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
const f1 = (n) => n.toFixed(1);
const W = 440, C = [220, 168], R = 112;

/* Balanzas. `get()` devuelve los ejes guardados; `set(ejes)` recibe los nuevos.
   `ref()` (opcional) da el perfil del formato elegido, que se marca en cada balanza como referencia. */
export function balanzas(cont, get, set, ref, { soloVer = false } = {}) {
  cont.classList.add("bz");
  cont.innerHTML = EJES.map((e, i) =>
    '<div class="bz-f" data-i="' + i + '"><p class="bz-q" id="bz-q-' + i + '">' + e.q + "</p>" +
    '<div class="bz-l" aria-hidden="true"><span class="bz-a">' + e.a + '</span><span class="bz-b">' + e.b + "</span></div>" +
    '<div class="bz-t"><input type="range" min="0" max="1" step="0.01" aria-labelledby="bz-q-' + i + '"' + (soloVer ? " disabled" : "") + '><i class="bz-ref" hidden></i></div></div>').join("");
  const filas = [...cont.querySelectorAll(".bz-f")];
  const decir = (e, x) => { const d = x - .5, m = Math.abs(d); return m < .06 ? "Al medio: da lo mismo" : (m < .25 ? "Un poco hacia " : m < .42 ? "Hacia " : "Del todo: ") + (d < 0 ? e.a : e.b).toLowerCase(); };
  const pintarFila = (fila, x) => {
    const e = EJES[+fila.dataset.i], inp = fila.querySelector("input");
    inp.value = x;
    fila.style.setProperty("--p", (x * 100).toFixed(1) + "%");
    fila.style.setProperty("--la", f1(Math.max(0, .5 - x) * 2));
    fila.style.setProperty("--lb", f1(Math.max(0, x - .5) * 2));
    inp.setAttribute("aria-valuetext", decir(e, x));
  };
  const pintar = () => {
    const v = vals(get()), r = ref ? ref() : null;
    filas.forEach((fila, i) => {
      pintarFila(fila, v[i]);
      const m = fila.querySelector(".bz-ref");
      m.hidden = !r; if (r) m.style.setProperty("--rr", r[i]);
    });
  };
  if (!soloVer) filas.forEach((fila, i) => {
    const inp = fila.querySelector("input");
    inp.oninput = () => {
      const x = Math.round(+inp.value * 100) / 100, v = vals(get());
      v[i] = x; pintarFila(fila, x);
      set(Object.fromEntries(EJES.map((e, k) => [e.k, v[k]])));
    };
  });
  pintar();
  return pintar;
}

/* Balanzas dibujadas, para imprimir (la biblia): SVG, porque el navegador no imprime el fondo de los controles. */
export function balanzasFijas(ejes, ref) {
  const v = vals(ejes);
  return '<div class="bz bz-fija">' + EJES.map((e, i) => {
    const x = 6 + v[i] * 288, c = 150, d0 = Math.min(x, c), d1 = Math.max(x, c);
    return '<div class="bz-f" style="--la:' + f1(Math.max(0, .5 - v[i]) * 2) + ";--lb:" + f1(Math.max(0, v[i] - .5) * 2) + '"><p class="bz-q">' + e.q + '</p><div class="bz-l"><span class="bz-a">' + e.a + '</span><span class="bz-b">' + e.b + "</span></div>" +
      '<svg viewBox="0 0 300 30" aria-hidden="true"><line x1="6" y1="14" x2="294" y2="14" stroke="var(--line)" stroke-width="3"/><line x1="' + f1(d0) + '" y1="14" x2="' + f1(d1) + '" y2="14" stroke="var(--cat)" stroke-width="3"/>' +
      '<line x1="150" y1="7" x2="150" y2="21" stroke="var(--muted)" stroke-width="1"/>' +
      (ref ? '<path d="M' + f1(6 + ref[i] * 288) + ' 22l5 6h-10z" fill="var(--muted)"/>' : "") +
      '<rect x="' + f1(x - 4) + '" y="2" width="8" height="24" rx="3" fill="var(--cat)"/></svg></div>';
  }).join("") + "</div>";
}

/* Dial: los formatos alrededor, un pétalo por formato según cuánto encaja y la aguja al que más encaja. */
export function dial(svg, ejes, elegido) {
  svg.setAttribute("viewBox", "0 0 " + W + " 336");
  svg.setAttribute("aria-hidden", "true");
  const n = FORMATOS.length, sin = sinRumbo(ejes), l = lectura(ejes), max = l[0].s, min = l[l.length - 1].s;
  const by = Object.fromEntries(l.map((f) => [f.k, f]));
  let s = '<circle class="borde" cx="' + C[0] + '" cy="' + C[1] + '" r="' + R + '"/>';
  FORMATOS.forEach((f, i) => {
    const a = ang(i, n), sc = by[f.k].s, k = sin ? .14 : .16 + .84 * ((sc - min) / ((max - min) || 1)) * Math.min(1, (max - .5) * 4), len = R * .92 * Math.max(.14, k), w = .2;
    const [x1, y1] = pt(...C, len, a), [xa, ya] = pt(...C, len * .55, a - w), [xb, yb] = pt(...C, len * .55, a + w);
    const top = !sin && f.k === l[0].k, mio = f.k === elegido;
    s += '<path class="petalo' + (top ? " top" : "") + (mio ? " mio" : "") + '" d="M' + C[0] + " " + C[1] + " Q" + f1(xa) + " " + f1(ya) + " " + f1(x1) + " " + f1(y1) + " Q" + f1(xb) + " " + f1(yb) + " " + C[0] + " " + C[1] + 'Z"/>';
    const [lx, ly] = pt(...C, R + 14, a), anchor = Math.abs(Math.cos(a)) < .25 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
    const dy = Math.sin(a) < -.6 ? -4 : Math.sin(a) > .6 ? 12 : 4;
    s += '<text x="' + f1(lx) + '" y="' + f1(ly + dy) + '" text-anchor="' + anchor + '" class="' + (top ? "top" : "") + (mio ? " mio" : "") + '">' + f.c + "</text>";
  });
  // Sin rumbo, la aguja queda quieta hacia arriba, en gris; con pistas, gira al formato que más encaja.
  const gi = FORMATOS.findIndex((f) => f.k === l[0].k), giro = sin ? 0 : (360 / n) * gi;
  s += '<g class="aguja' + (sin ? " quieta" : "") + '" style="transform-origin:' + C[0] + "px " + C[1] + "px;transform:rotate(" + f1(giro) + 'deg)">' +
    '<path d="M' + C[0] + " " + (C[1] - R + 14) + " L" + (C[0] + 7) + " " + C[1] + " L" + (C[0] - 7) + " " + C[1] + 'Z"/>' +
    '<path class="cola" d="M' + C[0] + " " + (C[1] + 34) + " L" + (C[0] + 7) + " " + C[1] + " L" + (C[0] - 7) + " " + C[1] + 'Z"/></g>' +
    '<circle class="eje-c" cx="' + C[0] + '" cy="' + C[1] + '" r="6"/>';
  const prev = svg.querySelector(".aguja");
  const prevT = prev ? prev.style.transform : null;
  svg.innerHTML = s;
  if (prevT) { const g = svg.querySelector(".aguja"), fin = g.style.transform; g.style.transform = prevT; requestAnimationFrame(() => requestAnimationFrame(() => { g.style.transform = fin; })); }
  return { sin, l };
}

const minus = (f) => f.n.toLowerCase();
export function veredicto(ejes) {
  if (sinRumbo(ejes)) return tocado(ejes)
    ? "Con todo cerca del medio, la aguja <b>aún no se inclina</b>. Mueve las balanzas que más digan de tu idea."
    : "Piensa en tu idea y mueve cada balanza hacia donde se incline. Si una te da lo mismo, déjala al medio.";
  const [a, b, c] = lectura(ejes), poco = pistas(ejes) < 1.2;
  if (poco) return "Con estas pocas pistas se asoma <b>" + minus(a) + "</b>, pero todavía es temprano. Mientras más balanzas muevas, más firme apunta la aguja.";
  const empate = a.s - b.s < .04;
  return "Por cómo la imaginas, tu idea está <b>" + cercania(a.s) + "</b> de <b>" + minus(a) + "</b>" +
    (empate ? ", casi a la par con <b>" + minus(b) + "</b>." : ". Le siguen " + minus(b) + " y " + minus(c) + ".") +
    " Es una pista para pensar, no una regla: tú decides qué hacer con ella.";
}

/* Brújula miniatura para las fichas del inventario. */
export function mini(ejes, elegido) {
  const c = 28, r = 22, n = FORMATOS.length, hay = elegido || (tocado(ejes) && !sinRumbo(ejes));
  let s = '<svg class="mini" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="' + r + '" fill="none" stroke="var(--line)" stroke-width="1.5"' + (hay ? "" : ' stroke-dasharray="2 3"') + "/>";
  FORMATOS.forEach((f, i) => { const [x, y] = pt(c, c, r, ang(i, n)); s += '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="1.6" fill="var(--muted)"/>'; });
  if (hay) {
    const k = elegido || lectura(ejes)[0].k, i = Math.max(0, FORMATOS.findIndex((f) => f.k === k)), a = ang(i, n);
    const [x, y] = pt(c, c, r - 4, a), [bx, by] = pt(c, c, 4, a + Math.PI / 2), [cx2, cy2] = pt(c, c, 4, a - Math.PI / 2);
    s += '<path d="M' + f1(x) + " " + f1(y) + "L" + f1(bx) + " " + f1(by) + "L" + f1(cx2) + " " + f1(cy2) + 'Z" fill="var(--ember)"/>';
  }
  return s + '<circle cx="28" cy="28" r="2.5" fill="var(--fg)"/></svg>';
}

/* Estilos de la brújula (se comparten entre la portada, la guía, la biblia y la página de proyecto). */
export const CSS_BRUJULA = `
.bz{display:flex;flex-direction:column;gap:14px;max-width:460px;margin:0 auto;width:100%}
.bz .bz-q{margin:0;font-family:var(--f-display);font-weight:800;font-stretch:110%;font-size:15px;color:var(--fg)}
.bz-l{display:flex;justify-content:space-between;gap:12px;font-size:13px;line-height:1.25;margin-top:2px}
.bz-l span{color:color-mix(in srgb,var(--fg) calc(45% + 55% * var(--la,0)),var(--bg));max-width:48%;transition:color .2s}
.bz-l .bz-b{text-align:right;color:color-mix(in srgb,var(--fg) calc(45% + 55% * var(--lb,0)),var(--bg))}
.bz-t{position:relative;height:44px}
.bz-fija{gap:8px}
.bz-fija svg{display:block;width:100%;height:auto}
.bz-t::before{content:"";position:absolute;left:50%;top:15px;width:1px;height:14px;background:var(--muted);opacity:.6}
.bz-t input{-webkit-appearance:none;appearance:none;position:absolute;inset:0;width:100%;height:44px;margin:0;background:none;cursor:pointer;touch-action:pan-y}
.bz-t input:disabled{cursor:default}
.bz-t input::-webkit-slider-runnable-track{height:3px;border-radius:var(--r-s);background:linear-gradient(90deg,var(--line) 0 min(50%,var(--p,50%)),var(--cat) min(50%,var(--p,50%)) max(50%,var(--p,50%)),var(--line) max(50%,var(--p,50%)))}
.bz-t input::-moz-range-track{height:3px;border-radius:var(--r-s);background:linear-gradient(90deg,var(--line) 0 min(50%,var(--p,50%)),var(--cat) min(50%,var(--p,50%)) max(50%,var(--p,50%)),var(--line) max(50%,var(--p,50%)))}
.bz-t input::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:28px;margin-top:-12.5px;border-radius:var(--r-s);background:var(--cat);border:2px solid var(--card);box-shadow:0 0 0 1px var(--cat)}
.bz-t input::-moz-range-thumb{width:8px;height:26px;border-radius:var(--r-s);background:var(--cat);border:2px solid var(--card);box-shadow:0 0 0 1px var(--cat)}
.bz-t input:focus-visible{outline:none}
.bz-t input:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 3px var(--fg)}
.bz-t input:focus-visible::-moz-range-thumb{box-shadow:0 0 0 3px var(--fg)}
.bz-ref{position:absolute;top:30px;width:0;height:0;margin-left:-5px;border:5px solid transparent;border-bottom:6px solid var(--muted);border-top:0;pointer-events:none}
.bz-ref{left:calc(5px + (100% - 10px) * var(--rr,.5))}
.dial .borde{fill:var(--field);stroke:var(--line)}
.dial .petalo{fill:var(--accent-soft);transition:d .35s ease}
.dial .petalo.top{fill:color-mix(in srgb,var(--ember) 32%,transparent)}
.dial .petalo.mio{stroke:var(--fg);stroke-width:1.5}
.dial text{font-size:13px;fill:var(--muted);font-family:var(--f-body)}
.dial text.top{fill:var(--fg);font-weight:700}
.dial text.mio{text-decoration:underline}
.dial .aguja{transition:transform .6s cubic-bezier(.3,1.4,.5,1)}
.dial .aguja path{fill:var(--ember)}
.dial .aguja.quieta path{fill:var(--muted)}
.dial .aguja path.cola{fill:var(--muted)}
.dial .eje-c{fill:var(--card);stroke:var(--fg);stroke-width:2}
.dial{width:100%;max-width:460px;height:auto;display:block;margin:0 auto;user-select:none;-webkit-user-select:none}
@media (prefers-reduced-motion:reduce){.dial .aguja,.dial .petalo,.bz-l span{transition:none}}
`;
