// Forja · Mapa de la idea (proyectos.esquema): la idea completa en una sola vista.
// En el centro la idea en una frase; alrededor, el foco (tema, por qué y para quién) y seis ramas que cambian según la categoría.
// esquema = { centro: "frase", r: { <clave>: "respuesta" } }. Las respuestas de otra categoría se guardan, pero no se muestran.
// Preguntas escritas para Forja. `sec` es la sección del Taller a la que va la respuesta con «Llevar al Taller» (Forja Más).

export const FOCO = [
  { k: "f_tema", n: "Tema", q: "¿De qué habla en el fondo, más allá de lo que pasa? Una o dos palabras bastan." },
  { k: "f_porque", n: "Por qué tú", q: "¿Por qué quieres hacerlo tú, y por qué ahora?" },
  { k: "f_para", n: "Para quién", q: "¿Quién debería encontrarlo, y qué le pasa al terminar?" },
];

export const RAMAS = {
  historia: [
    { k: "h_quien", n: "Protagonista", q: "¿Quién es y qué quiere con todas sus fuerzas?", sec: "personajes" },
    { k: "h_contra", n: "Lo que se opone", q: "¿Qué o quién se lo impide, y por qué cree tener la razón?", sec: "conflicto" },
    { k: "h_donde", n: "Dónde y cuándo", q: "¿En qué lugar y en qué tiempo pasa? ¿Qué tiene de especial?", sec: "mundo" },
    { k: "h_juego", n: "Qué está en juego", q: "¿Qué se pierde si las cosas salen mal?", sec: "conflicto" },
    { k: "h_cambio", n: "El día que todo cambia", q: "¿Qué pasa al comienzo que rompe la rutina?", sec: "estructura" },
    { k: "h_final", n: "Un final posible", q: "Si tuvieras que terminarla hoy, ¿cómo terminaría?", sec: "estructura" },
  ],
  // Comparte claves con historia donde la pregunta es la misma: al pasar de una a otra no se pierde lo respondido.
  comic: [
    { k: "h_quien", n: "Protagonista", q: "¿Quién es, qué quiere y cómo se le reconoce a primera vista?", sec: "personajes" },
    { k: "h_contra", n: "Lo que se opone", q: "¿Qué o quién se lo impide, y por qué cree tener la razón?", sec: "premisa" },
    { k: "h_donde", n: "Dónde y cuándo", q: "¿En qué lugar y en qué tiempo pasa? ¿Qué se ve en el fondo de las viñetas?", sec: "mundo" },
    { k: "k_imagen", n: "La imagen", q: "¿Qué página o viñeta ya ves en tu cabeza y tiene que estar sí o sí?", sec: "escenas" },
    { k: "k_mira", n: "Cómo se ve", q: "¿Qué trazo y qué colores tiene? ¿Con qué obras comparte la sensación visual?", sec: "estilo" },
    { k: "k_largo", n: "Cuánto mide", q: "¿Es una historia corta, un tomo o una serie que sale por capítulos? ¿Impresa o en la web?", sec: "edicion" },
  ],
  videojuego: [
    { k: "v_rol", n: "Quién eres", q: "¿A quién controla quien juega y qué busca?", sec: "narrativa" },
    { k: "v_verbo", n: "Qué haces", q: "¿Cuál es la acción principal, la que se repite todo el rato?", sec: "mecanicas" },
    { k: "v_reto", n: "Qué te frena", q: "¿Qué hace difícil avanzar: enemigos, tiempo, recursos, un acertijo?", sec: "mecanicas" },
    { k: "v_mundo", n: "Dónde", q: "¿Cómo es el lugar donde se juega?", sec: "narrativa" },
    { k: "v_siente", n: "Qué se siente", q: "¿Tensión, calma, risa, asombro? ¿Qué debería sentir al soltar el control?", sec: "estetica" },
    { k: "v_vuelve", n: "Por qué vuelves", q: "¿Qué hace que alguien quiera una partida más?", sec: "bucle" },
  ],
  juegomesa: [
    { k: "m_mesa", n: "Quiénes juegan", q: "¿Cuántas personas, de qué edad y en qué ocasión?", sec: "jugadores" },
    { k: "m_turno", n: "Tu turno", q: "¿Qué haces en tu turno, en una frase?", sec: "turno" },
    { k: "m_gana", n: "Cómo se gana", q: "¿Qué hay que lograr para ganar, y cuándo termina?", sec: "objetivo" },
    { k: "m_tension", n: "La tensión", q: "¿De dónde sale la tensión: escasez, riesgo, secretos, tiempo?", sec: "objetivo" },
    { k: "m_caja", n: "Qué hay en la caja", q: "¿Qué piezas son imprescindibles?", sec: "componentes" },
    { k: "m_dura", n: "Cuánto dura", q: "¿Cuánto toma una partida y cuánto explicarla?", sec: "jugadores" },
  ],
  contenido: [
    { k: "c_mira", n: "Quién lo mira", q: "¿Quién es y dónde está cuando lo ve?", sec: "idea" },
    { k: "c_gancho", n: "El gancho", q: "¿Qué pasa en los primeros segundos para que no se vaya?", sec: "gancho" },
    { k: "c_vive", n: "Dónde vive", q: "¿En qué plataforma y en qué formato?", sec: "plataforma" },
    { k: "c_lleva", n: "Qué se lleva", q: "¿Qué aprende, siente o decide al terminar?", sec: "idea" },
    { k: "c_ritmo", n: "Cada cuánto", q: "¿Es una pieza suelta o una serie? ¿Cada cuánto sale?", sec: "calendario" },
    { k: "c_pide", n: "Qué pide al final", q: "¿Qué quieres que haga quien lo vio?", sec: "guion" },
  ],
  producto: [
    { k: "p_usa", n: "Quién lo usa", q: "¿Quién lo compra y quién lo usa? No siempre es la misma persona.", sec: "paraQuien" },
    { k: "p_resuelve", n: "Qué resuelve", q: "¿Qué problema o deseo atiende?", sec: "queEs" },
    { k: "p_distinto", n: "Qué lo hace distinto", q: "¿Por qué este y no otro parecido?", sec: "queEs" },
    { k: "p_hecho", n: "De qué está hecho", q: "¿Materiales, partes y quién lo fabrica?", sec: "proceso" },
    { k: "p_vale", n: "Cuánto vale", q: "¿Cuánto pagaría alguien por él, a primera vista?", sec: "precio" },
    { k: "p_vende", n: "Dónde se vende", q: "¿Dónde lo encuentra esa persona?", sec: "venta" },
  ],
  otro: [
    { k: "o_que", n: "Qué es", q: "¿Cómo lo explicarías a alguien que no sabe nada?", sec: "idea" },
    { k: "o_quien", n: "Para quién", q: "¿A quién le sirve o le gusta?", sec: "idea" },
    { k: "o_distinto", n: "Qué lo hace distinto", q: "¿Qué tiene que no tenga lo que ya existe?", sec: "idea" },
    { k: "o_necesita", n: "Qué necesita", q: "¿Qué hace falta para hacerlo: tiempo, dinero, personas?", sec: "pasos" },
    { k: "o_primero", n: "El primer paso", q: "¿Qué es lo primero concreto que vas a hacer?", sec: "pasos" },
    { k: "o_riesgo", n: "Qué podría fallar", q: "¿Qué te preocupa, y cómo lo probarías temprano?", sec: "pasos" },
  ],
};
// El foco va a la primera sección de la plantilla de la categoría.
const FOCO_SEC = { historia: "premisa", comic: "premisa", videojuego: "pitch", juegomesa: "pitch", contenido: "idea", producto: "queEs", otro: "idea" };

export const nodos = (tipo) => [...FOCO.map((x) => ({ ...x, foco: true, sec: FOCO_SEC[tipo] || "idea" })), ...(RAMAS[tipo] || RAMAS.otro)];

export function normalEsquema(e) {
  e = e && typeof e === "object" ? e : {};
  const r = {};
  for (const [k, v] of Object.entries(e.r && typeof e.r === "object" ? e.r : {})) { const t = String(v ?? "").slice(0, 1500); if (/^[a-z]_[a-z]+$/.test(k) && t.trim()) r[k] = t; }
  const out = { r };
  const c = String(e.centro ?? "").trim().slice(0, 200); if (c) out.centro = c;
  return out;
}
// Cuántas respuestas tiene el mapa para esta categoría (para la señal de avance de la ruta).
export const llenas = (e, tipo) => nodos(tipo).filter((n) => ((e && e.r) || {})[n.k] && String(e.r[n.k]).trim()).length;
