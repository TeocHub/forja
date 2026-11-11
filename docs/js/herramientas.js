// Forja · registro común de herramientas.
// Un solo lugar dice qué herramientas existen, para qué categorías de proyecto sirven, en qué etapa de la Ruta
// aparecen, dónde viven y si ya funcionan. De aquí salen:
//   · el catálogo de planes.js (FUNCIONES: «Ya disponible» o «Próximamente» con «Avísame»),
//   · las técnicas de la Ruta que aún dicen «Llega pronto» (PRONTO en ruta.js),
//   · las vistas del proyecto que se abren desde la Ruta (#mapa, #estructura, #lectores… en proyecto/).
//
// Agregar una herramienta nueva:
//   1. Una entrada aquí con estado "pronto" (se ve en Planes y en la Ruta como próxima, con «Avísame»).
//   2. Si vive dentro del proyecto, un módulo en js/ que exporte vista(ctx) (ver CTX abajo) y `modulo` + `vista` aquí.
//      proyecto/ la carga sola al abrir #<vista>; no hay que tocar la página.
//   3. Su tema en ayuda.js (TEMAS) y, si tiene límites por plan, privado.tope / LIMITES.
//   4. Al terminarla: estado "listo". Planes, la Ruta y las tarjetas dejan de decir «Próximamente» solas.
//
// Campos:
//   id      clave única. Si la herramienta está en el catálogo de planes, es la misma clave de «Avísame»
//           (public.interes_funciones): no cambiarla nunca.
//   t, d    nombre y para qué sirve, en una frase.
//   estado  "listo" | "pronto".
//   area    área del catálogo de planes (AREAS en planes.js). Sin area no sale en el catálogo.
//   libre   qué trae el plan gratis (solo si ya funciona).
//   etapa   etapa de la Ruta donde vive (ETAPAS en ruta.js).
//   ruta    el `ir` de la técnica de ruta.js que la abre.
//   solo    categorías de proyecto (TIPOS en guias.js) donde aplica; sin `solo`, sirve para todas.
//   donde   dónde está: "pagina:semillero/", "pestana:referentes", "vista:mapa" (dentro del proyecto) o null.
//   vista   nombre de la vista dentro de proyecto/ (#vista); su área de permisos es `areaPermiso` (por defecto "taller").
//   modulo  módulo que pinta la vista (relativo a js/), con export vista(ctx). Las vistas antiguas (mapa,
//           estructura, lectores) se pintan desde proyecto/ y no lo necesitan.
//   ayuda   tema de ayuda.js.
//
// CTX que recibe vista(ctx): { P, SECS, REFS, PIZ, PL, panel, tc, ed, volver, conVolver, marcarHecho, alTaller,
//   guardar, toast, sb, u } — P es el proyecto, ed dice si la persona puede editar, volver/conVolver ponen «← Ruta».

export const HERRAMIENTAS = [
  // --- Ya funcionan ---
  { id: "semillero", t: "Semillero", estado: "listo", area: "organizacion", etapa: "sembrar", ruta: "semillero", donde: "pagina:semillero/", ayuda: "semillero",
    d: "Ideas de una frase que no gastan proyectos, con detonantes para encontrarlas y un semillero compartido para tu equipo. Con Forja Más, hasta 500 ideas; con Forja Estudio, sin límite.",
    libre: "Gratis: 50 ideas en el Semillero." },
  { id: "analizar-obras", t: "Analizar obras", estado: "listo", area: "escritura", etapa: "inspirar", ruta: "analizar", donde: "pestana:referentes", ayuda: "obras",
    d: "La ficha de cada libro, juego o película con su cita armada, tres miradas para entender cómo está hecha y lo que aprendiste. Con Forja Más, también MLA, Chicago y la bibliografía en la biblia.",
    libre: "Gratis: 3 obras analizadas por proyecto y cita APA." },
  { id: "estructuras", t: "Mapa de la idea y estructuras", estado: "listo", area: "escritura", etapa: "estructura", ayuda: "estructura",
    d: "La idea completa en una vista y tus momentos probados en modelos dibujados. Con Forja Más: todos los modelos, comparar dos lado a lado, llevar el mapa al Taller y pasar la estructura a la Escaleta.",
    libre: "Gratis: el mapa completo y dos modelos de estructura por categoría." },
  { id: "mapa", t: "Mapa de la idea", estado: "listo", etapa: "mapa", ruta: "mapa", donde: "vista:mapa", vista: "mapa", ayuda: "mapa",
    d: "La idea en el centro y sus ramas alrededor, en una sola vista." },
  { id: "estructura", t: "Estructura", estado: "listo", etapa: "estructura", ruta: "estructura", donde: "vista:estructura", vista: "estructura", ayuda: "estructura",
    d: "Seis momentos de tu proyecto probados en modelos dibujados." },
  { id: "lectores", t: "Lectores beta", estado: "listo", area: "equipo", etapa: "revisar", ruta: "lectores", donde: "vista:lectores", vista: "lectores", ayuda: "lectores",
    d: "Rondas de prueba sobre una copia de tu proyecto: un enlace por persona, preguntas según tu categoría, comentarios por párrafo y las respuestas juntas, con lo que varias personas señalan destacado. Con Forja Más, varias rondas abiertas, preguntas propias y hasta 15 personas por ronda (40 con Forja Estudio).",
    libre: "Gratis: una ronda abierta a la vez, con 3 personas." },
  { id: "pizarra", t: "Pizarras sin límite", estado: "listo", area: "pizarras", donde: "pestana:pizarra", ayuda: "pizarra",
    d: "Tarjetas, referentes, colores y flechas en tableros para ordenar ideas, todos los que quieras.",
    libre: "Gratis: una pizarra por proyecto, con 20 tarjetas." },
  { id: "relaciones", t: "Mapa de relaciones", estado: "listo", area: "pizarras", etapa: "mapa", solo: ["historia", "comic", "videojuego", "contenido"], donde: "pestana:pizarra", ayuda: "pizarra",
    d: "Personajes o facciones unidos por lazos con nombre: familia, amor, rivalidad, secreto…" },
  { id: "escaleta", t: "Escaleta en tarjetas", estado: "listo", area: "pizarras", etapa: "estructura", donde: "pestana:pizarra", ayuda: "pizarra",
    d: "Escenas por actos que se reordenan arrastrando, con duración, y el orden vuelve al Taller." },
  { id: "mapa-mundo", t: "Mapa del mundo", estado: "listo", area: "pizarras", donde: "pestana:pizarra", ayuda: "pizarra",
    d: "Lugares, regiones y rutas sobre la imagen de tu mapa, cada uno con su ficha." },
  { id: "campanas", t: "Planificador de campañas", estado: "listo", area: "venta", etapa: "pulir", donde: "pestana:costos", ayuda: "costos",
    d: "Recompensas armadas con los productos que cotizas, precio sugerido, cuánto mandar a hacer, envíos por zona y la meta de tu Kickstarter o preventa; se muestran en la vitrina.",
    libre: "Gratis: hasta 3 recompensas." },
  { id: "pagina-publica", t: "Vitrina del proyecto", estado: "listo", area: "presentacion", etapa: "pulir", ruta: "vitrina", donde: "pestana:vitrina", ayuda: "vitrina",
    d: "Una página pública para ferias, fondos o editoriales, con lo que elijas mostrar, enlace propio y QR. Con Forja Más, tus pizarras se publican para explorarlas.",
    libre: "Gratis: vitrina con portada, historia, galería, novedades y enlaces." },
  { id: "colaboradores", t: "Colaboradores", estado: "listo", area: "equipo", donde: null, ayuda: "equipo",
    d: "Invita personas a un proyecto (5 con Forja Más, 15 con Forja Estudio) y decide qué puede hacer cada una en cada parte; ellas no necesitan pagar.",
    libre: "Gratis: 1 persona por proyecto." },

  // --- Próximamente: catálogo de Forja Más («Avísame») ---
  { id: "capitulos", t: "Capítulos y conteo", estado: "pronto", area: "escritura", solo: ["historia", "comic", "contenido", "otro"], d: "Divide una sección en capítulos o escenas y cuenta palabras, páginas y tiempo de lectura de cada uno." },
  { id: "metas", t: "Metas y constancia", estado: "pronto", area: "escritura", d: "Meta de palabras por día o semana y un calendario de los días que escribiste." },
  { id: "manuscrito", t: "Modo manuscrito", estado: "pronto", area: "escritura", solo: ["historia"], d: "El formato estándar para enviar a editoriales y concursos." },
  { id: "notas-margen", t: "Notas al margen", estado: "pronto", area: "escritura", d: "Comentarios sobre frases del Taller, tuyos o de tu equipo, sin ensuciar el texto." },
  { id: "historial", t: "Historial de versiones", estado: "pronto", area: "escritura", d: "Volver a cualquier versión de los últimos 90 días y ver qué cambió." },
  { id: "vista-impresion", t: "Vista de impresión", estado: "pronto", area: "impresion", solo: ["historia", "comic", "juegomesa", "producto"], d: "Tu texto en el tamaño de página elegido (A5, 14 × 21 cm, carta, cómic) y cuántas páginas sale." },
  { id: "paginas-costos", t: "De páginas a costos", estado: "pronto", area: "impresion", solo: ["historia", "comic", "juegomesa", "producto"], d: "Lleva las páginas, el tamaño y el papel a la cotización del libro sin escribirlos dos veces." },
  { id: "guion-comic", t: "Guion de cómic por páginas", estado: "pronto", area: "impresion", solo: ["comic"], d: "Página, viñeta, imagen y diálogo, con aviso si el total no calza con los pliegos de imprenta." },
  { id: "fichas", t: "Fichas y línea de tiempo", estado: "pronto", area: "organizacion", d: "Personajes, lugares y objetos con sus campos, y la cronología de la historia." },
  { id: "tareas", t: "Tareas con recordatorios", estado: "pronto", area: "organizacion", d: "Qué falta para la feria o la postulación, con aviso por correo." },
  { id: "versiones-precio", t: "Precio por edición", estado: "pronto", area: "venta",
    d: "Un precio de venta distinto para cada edición (normal, deluxe, coleccionista) en la tienda o la feria, no solo en una campaña." },
  { id: "presupuesto-fondos", t: "Presupuesto para fondos", estado: "pronto", area: "venta", d: "Tus costos ordenados como los piden los formularios de postulación." },
  { id: "biblia-diseno", t: "Biblia con diseño", estado: "pronto", area: "presentacion", d: "Plantillas de portada y página, sin la marca de Forja, en PDF, Word o EPUB." },
  { id: "apoyo-pagos", t: "Cobrar dentro de Forja", estado: "pronto", area: "presentacion",
    d: "Hoy tus recompensas pueden llevar un enlace de Mercado Pago, Flow o PayPal. Esto será recibir apoyo, reservas o preventas en la misma vitrina, con cada pago anotado." },
  { id: "kit-prensa", t: "Kit de prensa", estado: "pronto", area: "presentacion", d: "Un paquete descargable con logo, capturas, ficha y contacto para medios y festivales." },
  { id: "alertas", t: "Alertas de oportunidades", estado: "pronto", area: "equipo", d: "Un correo cuando abre o está por cerrar una convocatoria que calza con tus proyectos." },

  // --- Próximamente: herramientas de la Ruta (la técnica se ve con «Llega pronto») ---
  { id: "sesion", t: "Sesión de trabajo", estado: "pronto", etapa: "hacer", ruta: "sesion", d: "Un temporizador con una meta chica y una línea para anotar dónde quedaste." },
  { id: "prototipo", t: "Enlace del prototipo", estado: "pronto", etapa: "hacer", ruta: "prototipo", solo: ["videojuego", "juegomesa", "producto"], d: "El enlace a tu prototipo guardado en el proyecto, para que la etapa cuente." },
  { id: "metrabe", t: "Me trabé", estado: "pronto", etapa: "hacer", ruta: "metrabe", d: "Ejercicios rápidos para cuando la página o el prototipo no avanzan." },
  { id: "revision", t: "Revisión con lista", estado: "pronto", etapa: "revisar", ruta: "revision", d: "Preguntas por categoría para encontrar lo que falla, de lo grande a lo chico." },
  { id: "pulido", t: "Lista de pulido", estado: "pronto", etapa: "pulir", ruta: "pulido", d: "Los últimos detalles antes de mostrarlo: ortografía, continuidad, piezas que faltan." },
];

const POR_ID = new Map(HERRAMIENTAS.map((h) => [h.id, h]));
export const herramienta = (id) => POR_ID.get(id) || null;
export const lista = (h) => !!h && h.estado === "listo";
// ¿Sirve para esta categoría de proyecto? (sin `solo`, para todas)
export const sirvePara = (h, tipo) => !h.solo || !tipo || h.solo.includes(tipo);
// Herramientas de una categoría de proyecto, opcionalmente solo las de un área del catálogo o de una etapa.
export const para = (tipo, { area, etapa, estado } = {}) =>
  HERRAMIENTAS.filter((h) => sirvePara(h, tipo) && (!area || h.area === area) && (!etapa || h.etapa === etapa) && (!estado || h.estado === estado));
// Agrupadas por área del catálogo: { escritura: [...], pizarras: [...] }.
export function porArea(tipo) {
  const g = {};
  para(tipo).filter((h) => h.area).forEach((h) => { (g[h.area] = g[h.area] || []).push(h); });
  return g;
}
// Las técnicas de la Ruta cuya herramienta todavía no existe (ruta.js las muestra con «Llega pronto»).
export const rutaPronto = () => new Set(HERRAMIENTAS.filter((h) => h.ruta && !lista(h)).map((h) => h.ruta));
// Vistas que se abren dentro del proyecto (#vista), con su título y módulo.
export const vistas = () => HERRAMIENTAS.filter((h) => h.vista && lista(h));
export const vistaDe = (k) => vistas().find((h) => h.vista === k) || null;
