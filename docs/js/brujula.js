// Forja · brújula de formatos: radar de seis ejes + dial con los formatos alrededor.
// Sirve para orientarse cuando aún no se sabe en qué convertir una idea. Es una referencia, no un veredicto:
// el formato lo elige la persona. Nadie ve números: solo la forma, la aguja y palabras.

// Cada eje pregunta cuánto pesa algo para una persona que disfruta la obra ya terminada.
// El centro es «nada» y el borde «todo». Se guarda de 0 a 4, con un decimal.
// a = qué significa el centro, b = qué significa el borde, l = cómo se dice cada nivel, d = la duda más común.
export const EJES = [
  { k: "decide", n: "Decide", q: "¿Quien la vive decide lo que pasa?",
    a: "Solo mira, lee o escucha. Como una novela o una película.", b: "Sin sus decisiones no avanza. Como un videojuego o un juego de mesa.",
    l: ["Solo mira, lee o escucha", "Elige cosas pequeñas", "Decide a ratos", "Decide casi todo", "Sin sus decisiones no avanza"],
    d: "Pasar páginas o elegir qué capítulo leer casi no cuenta. Cuenta cuando lo que hace cambia lo que pasa." },
  { k: "juntos", n: "En grupo", q: "¿La vive con otras personas al mismo tiempo?",
    a: "A solas. Como leer una novela o escuchar un podcast con audífonos.", b: "Solo tiene sentido en grupo. Como un juego de mesa o un juego en línea con amigos.",
    l: ["A solas", "Se puede compartir", "Mejor acompañado", "Casi siempre en grupo", "Solo tiene sentido en grupo"],
    d: "Comentarla después con amigos no cuenta. Piensa en el momento en que se vive." },
  { k: "ve", n: "Se ve", q: "¿Hay que verla para disfrutarla?",
    a: "No, basta con imaginarla. Como una novela o un podcast.", b: "Todo entra por los ojos, quieto o en movimiento. Como un cómic o una animación.",
    l: ["Basta con imaginarla", "Alguna imagen ayuda", "Lo visual pesa", "Casi todo entra por los ojos", "Sin imagen no existe"],
    d: "Una novela puede describir paisajes increíbles, pero se imaginan. Cuenta cuando hay que mostrarlo: dibujado, filmado o animado." },
  { k: "oye", n: "Se oye", q: "¿Hay que oírla para disfrutarla?",
    a: "Es silenciosa. Como un cómic, una novela o un juego de mesa.", b: "Sin sonido se cae: música, voces, efectos. Como un podcast, una animación o un videojuego.",
    l: ["Es silenciosa", "Algún sonido", "El sonido ayuda bastante", "El sonido pesa mucho", "Sin sonido se cae"],
    d: "La música que pones mientras lees no cuenta. Cuenta si la obra misma suena." },
  { k: "dentro", n: "Por dentro", q: "¿Entramos en lo que piensan o sienten los personajes?",
    a: "Todo se ve desde afuera. Como un juego de mesa o una película de acción.", b: "Casi todo pasa en su cabeza. Como una novela o un cuento.",
    l: ["Todo se ve desde afuera", "Algún pensamiento", "A ratos entramos en su cabeza", "Mucho mundo interior", "Casi todo pasa en su cabeza"],
    d: "Lo que los jugadores se dicen entre ellos no cuenta. Cuenta lo que narra o piensa un personaje, también una voz en off." },
  { k: "dura", n: "Dura", q: "¿Cuánto tiempo la acompaña quien la vive?",
    a: "Una vez, de una sentada. Como un cuento o un cortometraje.", b: "Semanas o meses: capítulos, temporadas o partidas que se repiten. Como una serie o un videojuego.",
    l: ["De una sentada", "Un par de sentadas", "Varios días", "Semanas", "Meses, una y otra vez"],
    d: "Suma todo el tiempo: si la gente la rejuega o la sigue por capítulos, dura más aunque cada vez sea corta." },
];

// Cómo suele ser cada formato en los mismos ejes (0 a 4). El orden es el del dial: vecinos parecidos.
export const FORMATOS = [
  { k: "novela", n: "Novela", c: "Novela", p: [0, 0, 1, 0, 4, 2] },
  { k: "cuento", n: "Cuento", c: "Cuento", p: [0, 0, 1, 0, 4, 0] },
  { k: "podcast", n: "Podcast o audio", c: "Audio", p: [0, 1, 0, 4, 2, 3] },
  { k: "video", n: "Serie web", c: "Serie web", p: [0, 1, 3, 3, 1, 3] },
  { k: "corto", n: "Cortometraje", c: "Corto", p: [0, 1, 3, 3, 2, 0] },
  { k: "largo", n: "Largometraje", c: "Largo", p: [0, 2, 4, 3, 2, 1] },
  { k: "serie", n: "Serie", c: "Serie", p: [0, 1, 3, 3, 2, 4] },
  { k: "animacion", n: "Animación", c: "Animación", p: [0, 1, 4, 4, 1, 2] },
  { k: "comic", n: "Cómic", c: "Cómic", p: [0, 0, 4, 0, 2, 3] },
  { k: "videojuego", n: "Videojuego", c: "Videojuego", p: [4, 2, 3, 3, 1, 3] },
  { k: "mesa", n: "Juego de mesa", c: "Mesa", p: [4, 4, 2, 0, 0, 3] },
];

const C04 = (x) => Math.max(0, Math.min(4, +x || 0));
const VIEJOS = { decide: "agencia", ve: "imagen", oye: "movimiento", dentro: "interior", dura: "escala" };
// Proyectos guardados con la primera brújula (agencia, reglas, interior, imagen, movimiento, escala): se traducen.
const viejo = (e) => !EJES.some((x) => x.k in e) && Object.values(VIEJOS).some((k) => k in e);
export const tocado = (ejes) => !!ejes && (EJES.some((e) => e.k in ejes) || viejo(ejes));
export function vals(ejes) {
  if (!ejes) return EJES.map(() => 0);
  if (viejo(ejes)) return EJES.map((e) => (VIEJOS[e.k] ? C04(ejes[VIEJOS[e.k]]) : 0));
  return EJES.map((e) => C04(ejes[e.k]));
}
const DURA = EJES.findIndex((e) => e.k === "dura");
// Cuántas pistas dio la persona: la suma de lo que movió.
export const pistas = (ejes) => vals(ejes).reduce((a, x) => a + x, 0);
export const sinRumbo = (ejes) => pistas(ejes) < 1.5;
// Encaje: en cada eje, lo que comparten la idea y el formato (el menor) sobre lo que suman (el mayor).
// Un eje en 0 no regala parecido. «Dura» cuenta desde 1 porque una sola sentada también es un tiempo.
export function encaje(v, p) {
  let comun = 0, total = 0;
  v.forEach((x, i) => { const o = i === DURA ? 1 : 0; comun += Math.min(x + o, p[i] + o); total += Math.max(x + o, p[i] + o); });
  return total ? comun / total : 0;
}
export function lectura(ejes) {
  const v = vals(ejes);
  return FORMATOS.map((f) => ({ ...f, s: encaje(v, f.p) })).sort((a, b) => b.s - a.s);
}
// En palabras, nunca en números.
export const cercania = (s) => (s >= .8 ? "muy cerca" : s >= .65 ? "cerca" : s >= .5 ? "a medias" : "lejos");
export const perfil = (formato) => { const f = FORMATOS.find((x) => x.k === formato); return f ? f.p.slice() : null; };

const ang = (i, n) => (-90 + (360 / n) * i) * Math.PI / 180;
const pt = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
const f1 = (n) => n.toFixed(1);
const W = 440, C = [220, 168], R = 112;
const n = EJES.length, r0 = 26, rad = (v) => r0 + (v / 4) * (R - r0);
const etiqueta = (i, sel) => {
  const a = ang(i, n), [lx, ly] = pt(...C, R + 22, a), anchor = Math.abs(Math.cos(a)) < .2 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
  const dy = Math.sin(a) < -.5 ? -4 : Math.sin(a) > .5 ? 14 : 5;
  return '<text class="et' + (sel ? " sel" : "") + '" data-e="' + i + '" x="' + f1(lx) + '" y="' + f1(ly + dy) + '" text-anchor="' + anchor + '">' + EJES[i].n + "</text>";
};
const fondo = (sel) => {
  let s = "";
  for (let k = 1; k <= 4; k++) s += '<polygon class="anillo" points="' + EJES.map((_, i) => pt(...C, rad(k), ang(i, n)).map(f1).join(",")).join(" ") + '"/>';
  EJES.forEach((_, i) => { const [x, y] = pt(...C, R, ang(i, n)); s += '<line class="eje' + (i === sel ? " sel" : "") + '" x1="' + C[0] + '" y1="' + C[1] + '" x2="' + f1(x) + '" y2="' + f1(y) + '"/>'; });
  return s;
};
const forma = (v, cls) => '<polygon class="' + cls + '" points="' + v.map((x, i) => pt(...C, rad(x), ang(i, n)).map(f1).join(",")).join(" ") + '"/>';

/* Radar con su panel. `cont` recibe el radar y, debajo, el panel con la pregunta del eje elegido.
   get() da los ejes guardados; set(ejes) recibe los nuevos; ref() (opcional) da el perfil del formato elegido. */
export function brujula(cont, get, set, ref, { soloVer = false } = {}) {
  cont.classList.add("bj");
  cont.innerHTML = '<svg class="radar" role="group" aria-label="Radar de la idea: seis ejes"></svg><div class="bj-pn" aria-live="polite"></div>';
  const svg = cont.querySelector("svg"), pn = cont.querySelector(".bj-pn");
  svg.setAttribute("viewBox", "0 0 " + W + " 336");
  let sel = 0, eje = null, abierta = false;
  const panel = () => {
    const e = EJES[sel], x = vals(get())[sel];
    pn.innerHTML = '<p class="bj-q">' + e.q + '</p><p class="bj-n">' + (x > 0 ? "Ahora: " + e.l[Math.round(x)] : "Arrastra el punto de «" + e.n + "» hacia afuera si pesa en tu idea.") + "</p>" +
      '<div class="bj-ext"><p><b>Al centro</b>' + e.a + "</p><p><b>En el borde</b>" + e.b + "</p></div>" +
      '<details class="bj-d"' + (abierta ? " open" : "") + "><summary>¿Dudas?</summary><p>" + e.d + "</p></details>";
    pn.querySelector("details").ontoggle = (ev) => { abierta = ev.target.open; };
  };
  const pintar = () => {
    const v = vals(get()), r = ref ? ref() : null;
    let s = fondo(sel) + (r ? forma(r, "ref") : "") + forma(v, "forma");
    EJES.forEach((_, i) => { s += etiqueta(i, i === sel); });
    v.forEach((x, i) => {
      const [hx, hy] = pt(...C, rad(x), ang(i, n));
      s += '<circle class="h' + (i === sel ? " sel" : "") + '" data-i="' + i + '" cx="' + f1(hx) + '" cy="' + f1(hy) + '" r="' + (i === sel ? 11 : 9) + '"' + (soloVer ? "" : ' tabindex="0" role="slider" aria-label="' + EJES[i].q + '" aria-valuemin="0" aria-valuemax="4" aria-valuenow="' + f1(x) + '" aria-valuetext="' + EJES[i].l[Math.round(x)] + '"') + "/>";
    });
    svg.innerHTML = s;
    panel();
  };
  const elegir = (i) => { if (sel !== i) { sel = i; pintar(); } };
  const fijar = (i, x) => {
    x = Math.round(C04(x) * 10) / 10;
    const v = vals(get());
    if (v[i] === x && tocado(get())) return;
    v[i] = x;
    set(Object.fromEntries(EJES.map((e, k) => [e.k, v[k]])));
    pintar();
  };
  if (soloVer) {
    svg.onpointerdown = (ev) => { const t = ev.target.closest("[data-e],[data-i]"); if (t) elegir(+(t.dataset.e ?? t.dataset.i)); };
    pintar(); return pintar;
  }
  const local = (ev) => { const b = svg.getBoundingClientRect(), k = W / b.width; return [(ev.clientX - b.left) * k - C[0], (ev.clientY - b.top) * k - C[1]]; };
  // Con el dedo solo se agarra cerca de un punto (así el resto del radar deja desplazar la página); con mouse, desde cualquier parte.
  const HIT = 28;
  const cerca = (cx, cy) => {
    const b = svg.getBoundingClientRect(), k = b.width / W, v = vals(get());
    let best = -1, bd = HIT;
    v.forEach((x, i) => { const [hx, hy] = pt(...C, rad(x), ang(i, n)); const d = Math.hypot(b.left + hx * k - cx, b.top + hy * k - cy); if (d < bd) { bd = d; best = i; } });
    return best;
  };
  const porAngulo = (dx, dy) => {
    const a = Math.atan2(dy, dx); let best = 0, bd = 9;
    EJES.forEach((_, i) => { const d = Math.abs(Math.atan2(Math.sin(a - ang(i, n)), Math.cos(a - ang(i, n)))); if (d < bd) { bd = d; best = i; } });
    return best;
  };
  const mover = (ev) => {
    if (eje == null) return;
    const [dx, dy] = local(ev), proy = dx * Math.cos(ang(eje, n)) + dy * Math.sin(ang(eje, n));
    fijar(eje, ((proy - r0) / (R - r0)) * 4);
  };
  svg.onpointerdown = (ev) => {
    const et = ev.target.closest(".et"); if (et) { elegir(+et.dataset.e); return; }
    let best;
    if (ev.pointerType === "touch") { best = cerca(ev.clientX, ev.clientY); if (best < 0) return; }
    else { const [dx, dy] = local(ev); if (Math.hypot(dx, dy) > R + 30) return; best = porAngulo(dx, dy); }
    eje = best; elegir(best); svg.setPointerCapture(ev.pointerId); mover(ev); ev.preventDefault();
  };
  svg.addEventListener("touchstart", (ev) => {
    const t = ev.touches[0];
    if (ev.cancelable && ev.touches.length === 1 && t && cerca(t.clientX, t.clientY) >= 0) ev.preventDefault();
  }, { passive: false });
  svg.onpointermove = mover;
  svg.onpointerup = svg.onpointercancel = () => { eje = null; };
  svg.onkeydown = (ev) => {
    const h = ev.target.closest(".h"); if (!h) return;
    const i = +h.dataset.i, m = { ArrowUp: .5, ArrowRight: .5, ArrowDown: -.5, ArrowLeft: -.5 }[ev.key];
    if (m == null) return; ev.preventDefault();
    fijar(i, vals(get())[i] + m); svg.querySelector('[data-i="' + i + '"]').focus();
  };
  svg.addEventListener("focusin", (ev) => { const h = ev.target.closest(".h"); if (h && sel !== +h.dataset.i) { sel = +h.dataset.i; pintar(); svg.querySelector('[data-i="' + sel + '"]').focus(); } });
  pintar();
  return pintar;
}

/* Radar sin panel ni controles, para imprimir (la biblia). */
export function radarFijo(ejes, ref) {
  let s = '<svg class="radar fijo" viewBox="0 0 ' + W + ' 336" aria-hidden="true">' + fondo(-1) + (ref ? forma(ref, "ref") : "") + forma(vals(ejes), "forma");
  EJES.forEach((_, i) => { s += etiqueta(i, false); });
  return s + "</svg>";
}

/* Dial: los formatos alrededor, un pétalo por formato según cuánto encaja y la aguja al que más encaja. */
export function dial(svg, ejes, elegido) {
  svg.setAttribute("viewBox", "0 0 " + W + " 336");
  svg.setAttribute("aria-hidden", "true");
  const nf = FORMATOS.length, sin = sinRumbo(ejes), l = lectura(ejes), max = l[0].s, min = l[l.length - 1].s;
  const by = Object.fromEntries(l.map((f) => [f.k, f]));
  let s = '<circle class="borde" cx="' + C[0] + '" cy="' + C[1] + '" r="' + R + '"/>';
  FORMATOS.forEach((f, i) => {
    const a = ang(i, nf), sc = by[f.k].s, k = sin ? .14 : .16 + .84 * ((sc - min) / ((max - min) || 1)), len = R * .92 * k, w = .2;
    const [x1, y1] = pt(...C, len, a), [xa, ya] = pt(...C, len * .55, a - w), [xb, yb] = pt(...C, len * .55, a + w);
    const top = !sin && f.k === l[0].k, mio = f.k === elegido;
    s += '<path class="petalo' + (top ? " top" : "") + (mio ? " mio" : "") + '" d="M' + C[0] + " " + C[1] + " Q" + f1(xa) + " " + f1(ya) + " " + f1(x1) + " " + f1(y1) + " Q" + f1(xb) + " " + f1(yb) + " " + C[0] + " " + C[1] + 'Z"/>';
    const [lx, ly] = pt(...C, R + 14, a), anchor = Math.abs(Math.cos(a)) < .25 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
    const dy = Math.sin(a) < -.6 ? -4 : Math.sin(a) > .6 ? 12 : 4;
    s += '<text x="' + f1(lx) + '" y="' + f1(ly + dy) + '" text-anchor="' + anchor + '" class="' + (top ? "top" : "") + (mio ? " mio" : "") + '">' + f.c + "</text>";
  });
  // Sin rumbo, la aguja queda quieta hacia arriba, en gris; con pistas, gira al formato que más encaja.
  const gi = FORMATOS.findIndex((f) => f.k === l[0].k), giro = sin ? 0 : (360 / nf) * gi;
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
  if (sinRumbo(ejes)) return "Piensa en una persona disfrutando tu obra ya terminada y lleva hacia afuera los ejes que pesen. Mientras más muevas, más firme apunta la aguja.";
  const [a, b, c] = lectura(ejes), empate = a.s - b.s < .04;
  return "Por cómo la imaginas, tu idea está <b>" + cercania(a.s) + "</b> de <b>" + minus(a) + "</b>" +
    (empate ? ", casi a la par con <b>" + minus(b) + "</b>." : ". Le siguen " + minus(b) + " y " + minus(c) + ".") +
    " Es una pista para pensar, no una regla: tú decides qué hacer con ella.";
}

/* Brújula miniatura para las fichas del inventario. */
export function mini(ejes, elegido) {
  const c = 28, r = 22, nf = FORMATOS.length, hay = elegido || (tocado(ejes) && !sinRumbo(ejes));
  let s = '<svg class="mini" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="' + r + '" fill="none" stroke="var(--line)" stroke-width="1.5"' + (hay ? "" : ' stroke-dasharray="2 3"') + "/>";
  FORMATOS.forEach((f, i) => { const [x, y] = pt(c, c, r, ang(i, nf)); s += '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="1.6" fill="var(--muted)"/>'; });
  if (hay) {
    const k = elegido || lectura(ejes)[0].k, i = Math.max(0, FORMATOS.findIndex((f) => f.k === k)), a = ang(i, nf);
    const [x, y] = pt(c, c, r - 4, a), [bx, by] = pt(c, c, 4, a + Math.PI / 2), [cx2, cy2] = pt(c, c, 4, a - Math.PI / 2);
    s += '<path d="M' + f1(x) + " " + f1(y) + "L" + f1(bx) + " " + f1(by) + "L" + f1(cx2) + " " + f1(cy2) + 'Z" fill="var(--ember)"/>';
  }
  return s + '<circle cx="28" cy="28" r="2.5" fill="var(--fg)"/></svg>';
}

/* Estilos de la brújula (se comparten entre la portada, la guía, la biblia y la página de proyecto). */
export const CSS_BRUJULA = `
.bj{display:flex;flex-direction:column;gap:6px;width:100%;max-width:460px;margin:0 auto}
.radar .anillo{fill:none;stroke:var(--line)}
.radar .eje{stroke:var(--line)}
.radar .eje.sel{stroke:var(--cat);stroke-width:1.5}
.radar .ref{fill:none;stroke:var(--muted);stroke-width:1.5;stroke-linejoin:round;opacity:.75}
.radar .forma{fill:color-mix(in srgb,var(--cat) 18%,transparent);stroke:var(--cat);stroke-width:2;stroke-linejoin:round}
.radar .h{fill:var(--card);stroke:var(--cat);stroke-width:2.5;cursor:grab}
.radar .h.sel{fill:var(--cat)}
.radar .h:focus-visible{outline:none;stroke:var(--fg);stroke-width:4}
.radar text{font-size:15px;fill:var(--muted);font-family:var(--f-body);cursor:pointer}
.radar text.sel{fill:var(--fg);font-weight:700}
.radar.fijo text{cursor:default}
.bj-pn{border-top:1px solid var(--line);padding-top:10px}
.bj-pn p{margin:0}
.bj .bj-q{font-family:var(--f-display);font-weight:800;font-stretch:110%;font-size:17px;color:var(--fg);line-height:1.25}
.bj .bj-n{font-size:15px;color:var(--fg);margin-top:2px;font-weight:700}
.bj-ext{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;margin-top:8px}
.bj .bj-ext p{font-size:13px;line-height:1.4;color:var(--muted)}
.bj-ext b{display:block;color:var(--fg);font-size:13px}
.bj-d{margin-top:4px;font-size:13px;color:var(--muted)}
.bj-d summary{cursor:pointer;color:var(--fg);font-weight:700;padding:12px 0;display:list-item}
.bj .bj-d p{line-height:1.45;font-size:13px;color:var(--muted)}
.dial .borde{fill:var(--field);stroke:var(--line)}
.dial .petalo{fill:var(--accent-soft);transition:d .35s ease}
.dial .petalo.top{fill:color-mix(in srgb,var(--ember) 32%,transparent)}
.dial .petalo.mio{stroke:var(--fg);stroke-width:1.5}
.dial text{font-size:15px;fill:var(--muted);font-family:var(--f-body)}
.dial text.top{fill:var(--fg);font-weight:700}
.dial text.mio{text-decoration:underline}
.dial .aguja{transition:transform .6s cubic-bezier(.3,1.4,.5,1)}
.dial .aguja path{fill:var(--ember)}
.dial .aguja.quieta path{fill:var(--muted)}
.dial .aguja path.cola{fill:var(--muted)}
.dial .eje-c{fill:var(--card);stroke:var(--fg);stroke-width:2}
.radar,.dial{width:100%;height:auto;display:block;margin:0 auto;user-select:none;-webkit-user-select:none}
.dial{max-width:440px}
@media (prefers-reduced-motion:reduce){.dial .aguja,.dial .petalo{transition:none}}
`;
