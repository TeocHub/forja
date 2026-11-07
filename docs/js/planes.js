// Forja · lo que trae Forja Más. Lo que aún no existe se muestra como "próximamente", para que se entienda qué viene
// y para medir con "Avísame" qué conviene construir primero (tabla public.interes_funciones).
// Las que tienen `listo` ya funcionan; `libre` dice qué parte trae el plan gratis.

// Precios de lanzamiento (pueden cambiar: lo dicen planes/ y terminos/#planes).
export const PRECIOS = { mas: { mes: 2990, anio: 29900 }, estudio: { mes: 5990, anio: 59900 } };
export const PRECIO = PRECIOS.mas;
// Áreas que se pueden elegir al dejar una sugerencia (las de AREAS más estas dos); igual que el check de public.sugerencias.
export const AREAS_SUGERENCIA = { planes: "Planes y precios", otra: "Otra cosa" };

export const AREAS = [
  { k: "escritura", n: "Escritura", d: "Para quien escribe mucho y quiere ver su obra como libro." },
  { k: "impresion", n: "Impresión", d: "Del texto a las páginas, y de las páginas a los costos." },
  { k: "pizarras", n: "Pizarras", d: "Ordenar ideas con tarjetas, flechas e imágenes." },
  { k: "organizacion", n: "Organización", d: "Fichas, cronologías y fechas sin límite." },
  { k: "venta", n: "Producción y venta", d: "Más números para decidir cómo y cuánto producir." },
  { k: "presentacion", n: "Presentación", d: "Mostrar el proyecto con buena cara." },
  { k: "equipo", n: "Equipo y avisos", d: "Trabajar con otros y no perder fechas." },
];

export const FUNCIONES = [
  { k: "analizar-obras", a: "escritura", t: "Analizar obras", d: "La ficha de cada libro, juego o película con su cita armada, tres miradas para entender cómo está hecha y lo que aprendiste. Con Forja Más, también MLA, Chicago y la bibliografía en la biblia.", listo: true, libre: "Gratis: 3 obras analizadas por proyecto y cita APA." },
  { k: "estructuras", a: "escritura", t: "Mapa de la idea y estructuras", d: "La idea completa en una vista y tus momentos probados en modelos dibujados. Con Forja Más: todos los modelos, comparar dos lado a lado, llevar el mapa al Taller y pasar la estructura a la Escaleta.", listo: true, libre: "Gratis: el mapa completo y dos modelos de estructura por categoría." },
  { k: "capitulos", a: "escritura", t: "Capítulos y conteo", d: "Divide una sección en capítulos o escenas y cuenta palabras, páginas y tiempo de lectura de cada uno." },
  { k: "metas", a: "escritura", t: "Metas y constancia", d: "Meta de palabras por día o semana y un calendario de los días que escribiste." },
  { k: "manuscrito", a: "escritura", t: "Modo manuscrito", d: "El formato estándar para enviar a editoriales y concursos." },
  { k: "notas-margen", a: "escritura", t: "Notas al margen", d: "Comentarios sobre frases del texto, tuyos o de tu equipo, sin ensuciarlo." },
  { k: "historial", a: "escritura", t: "Historial de versiones", d: "Volver a cualquier versión de los últimos 90 días y ver qué cambió." },
  { k: "vista-impresion", a: "impresion", t: "Vista de impresión", d: "Tu texto en el tamaño de página elegido (A5, 14 × 21 cm, carta, cómic) y cuántas páginas sale." },
  { k: "paginas-costos", a: "impresion", t: "De páginas a costos", d: "Lleva las páginas, el tamaño y el papel a la cotización del libro sin escribirlos dos veces." },
  { k: "guion-comic", a: "impresion", t: "Guion de cómic por páginas", d: "Página, viñeta, imagen y diálogo, con aviso si el total no calza con los pliegos de imprenta." },
  { k: "pizarra", a: "pizarras", t: "Pizarras sin límite", d: "Tarjetas, referentes, colores y flechas en tableros para ordenar ideas, todos los que quieras.", listo: true, libre: "Gratis: una pizarra por proyecto, con 20 tarjetas." },
  { k: "relaciones", a: "pizarras", t: "Mapa de relaciones", d: "Personajes o facciones unidos por lazos con nombre: familia, amor, rivalidad, secreto…", listo: true },
  { k: "escaleta", a: "pizarras", t: "Escaleta en tarjetas", d: "Escenas por actos que se reordenan arrastrando, con duración, y el orden vuelve al Taller.", listo: true },
  { k: "mapa-mundo", a: "pizarras", t: "Mapa del mundo", d: "Lugares, regiones y rutas sobre la imagen de tu mapa, cada uno con su ficha.", listo: true },
  { k: "semillero", a: "organizacion", t: "Semillero sin límite", d: "Ideas de una frase que no gastan proyectos, con detonantes para encontrarlas y un semillero compartido para tu equipo.", listo: true, libre: "Gratis: 50 ideas en el semillero." },
  { k: "fichas", a: "organizacion", t: "Fichas y línea de tiempo", d: "Personajes, lugares y objetos con sus campos, y la cronología de la historia." },
  { k: "tareas", a: "organizacion", t: "Tareas con recordatorios", d: "Qué falta para la feria o la postulación, con aviso por correo." },
  { k: "versiones-precio", a: "venta", t: "Versiones de precio", d: "Comparar edición normal, deluxe y preventa en la misma cotización." },
  { k: "campanas", a: "venta", t: "Planificador de campañas", d: "Recompensas armadas con los productos que cotizas, precio sugerido, cuánto mandar a hacer, envíos por zona y la meta de tu Kickstarter o preventa; se muestran en la vitrina.", listo: true, libre: "Gratis: hasta 3 recompensas." },
  { k: "presupuesto-fondos", a: "venta", t: "Presupuesto para fondos", d: "Tus costos ordenados como los piden los formularios de postulación." },
  { k: "biblia-diseno", a: "presentacion", t: "Biblia con diseño", d: "Plantillas de portada y página, sin la marca de Forja, en PDF, Word o EPUB." },
  { k: "pagina-publica", a: "presentacion", t: "Vitrina del proyecto", d: "Una página pública para ferias, fondos o editoriales, con lo que elijas mostrar, enlace propio y QR. Con Forja Más, tus pizarras se publican para explorarlas.", listo: true, libre: "Gratis: vitrina con portada, historia, galería, novedades y enlaces." },
  { k: "apoyo-pagos", a: "presentacion", t: "Apoyo y preventas en la vitrina", d: "Recibe apoyo, reservas o preventas desde tu vitrina con métodos de pago chilenos, con metas y recompensas visibles." },
  { k: "kit-prensa", a: "presentacion", t: "Kit de prensa", d: "Un paquete descargable con logo, capturas, ficha y contacto para medios y festivales." },
  { k: "colaboradores", a: "equipo", t: "Colaboradores", d: "Invita hasta 5 personas a un proyecto y decide qué puede hacer cada una en cada parte; ellas no necesitan pagar.", listo: true, libre: "Gratis: 1 persona por proyecto." },
  { k: "alertas", a: "equipo", t: "Alertas de oportunidades", d: "Un correo cuando abre o está por cerrar una convocatoria que calza con tus proyectos." },
];
export const funcion = (k) => FUNCIONES.find((f) => f.k === k);
