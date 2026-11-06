// Forja · lo que trae Forja Más. Todo está "próximamente": se muestra para que se entienda qué viene
// y para medir con "Avísame" qué conviene construir primero (tabla public.interes_funciones).

export const PRECIO = { mes: 2990, anio: 29900 };

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
  { k: "capitulos", a: "escritura", t: "Capítulos y conteo", d: "Divide una sección en capítulos o escenas y cuenta palabras, páginas y tiempo de lectura de cada uno." },
  { k: "metas", a: "escritura", t: "Metas y constancia", d: "Meta de palabras por día o semana y un calendario de los días que escribiste." },
  { k: "manuscrito", a: "escritura", t: "Modo manuscrito", d: "El formato estándar para enviar a editoriales y concursos." },
  { k: "notas-margen", a: "escritura", t: "Notas al margen", d: "Comentarios sobre frases del texto, tuyos o de tu equipo, sin ensuciarlo." },
  { k: "historial", a: "escritura", t: "Historial de versiones", d: "Volver a cualquier versión de los últimos 90 días y ver qué cambió." },
  { k: "vista-impresion", a: "impresion", t: "Vista de impresión", d: "Tu texto en el tamaño de página elegido (A5, 14 × 21 cm, carta, cómic) y cuántas páginas sale." },
  { k: "paginas-costos", a: "impresion", t: "De páginas a costos", d: "Lleva las páginas, el tamaño y el papel a la cotización del libro sin escribirlos dos veces." },
  { k: "guion-comic", a: "impresion", t: "Guion de cómic por páginas", d: "Página, viñeta, imagen y diálogo, con aviso si el total no calza con los pliegos de imprenta." },
  { k: "pizarra", a: "pizarras", t: "Pizarra libre", d: "Tarjetas, referentes, colores y flechas en un tablero para ordenar ideas." },
  { k: "relaciones", a: "pizarras", t: "Mapa de relaciones", d: "Personajes o facciones unidos por líneas que dicen qué los une." },
  { k: "escaleta", a: "pizarras", t: "Escaleta en tarjetas", d: "Escenas como tarjetas que se reordenan arrastrando, y el orden vuelve al Taller." },
  { k: "mapa-mundo", a: "pizarras", t: "Mapa del mundo", d: "Pines sobre la imagen de tu mapa, cada uno con su ficha." },
  { k: "fichas", a: "organizacion", t: "Fichas y línea de tiempo", d: "Personajes, lugares y objetos con sus campos, y la cronología de la historia." },
  { k: "tareas", a: "organizacion", t: "Tareas con recordatorios", d: "Qué falta para la feria o la postulación, con aviso por correo." },
  { k: "versiones-precio", a: "venta", t: "Versiones de precio", d: "Comparar edición normal, deluxe y preventa en la misma cotización." },
  { k: "campanas", a: "venta", t: "Planificador de campañas", d: "La meta de un Kickstarter, una preventa o un fondo, con comisiones, impuestos, margen y recompensas." },
  { k: "presupuesto-fondos", a: "venta", t: "Presupuesto para fondos", d: "Tus costos ordenados como los piden los formularios de postulación." },
  { k: "biblia-diseno", a: "presentacion", t: "Biblia con diseño", d: "Plantillas de portada y página, sin la marca de Forja, en PDF, Word o EPUB." },
  { k: "pagina-publica", a: "presentacion", t: "Página pública y kit de prensa", d: "Una página del proyecto para ferias, fondos o editoriales, con lo que elijas mostrar." },
  { k: "colaboradores", a: "equipo", t: "Colaboradores", d: "Invita a otras personas a un proyecto; ellas no necesitan pagar." },
  { k: "alertas", a: "equipo", t: "Alertas de oportunidades", d: "Un correo cuando abre o está por cerrar una convocatoria que calza con tus proyectos." },
];
export const funcion = (k) => FUNCIONES.find((f) => f.k === k);
