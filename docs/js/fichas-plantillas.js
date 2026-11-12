// Forja · Fichas: plantillas de colección por categoría. Solo configuración; la herramienta está en fichas.js.
// `solo`: categorías donde se puede crear (la base lo revisa en privado.plantilla_ok: cambiar ambos juntos).
// «libre» sirve en todas y «otro» puede usar cualquiera.
// Tipos de campo: t (texto corto), l (texto largo), n (número), o (opción, con `op`), img (enlace a una imagen), c (color).
// `vista`: los campos que se ven en la tarjeta; `total`: campo numérico que se suma («54 cartas en el mazo»).

export const PLANTILLAS = {
  mecanicas: { n: "Mecánicas", uno: "mecánica", solo: ["videojuego"], d: "Una ficha por verbo de quien juega: qué hace, con qué control y qué cambia en el mundo.",
    campos: [
      { k: "hace", n: "Qué hace quien juega", t: "t", ph: "Saltar, construir, negociar…" },
      { k: "control", n: "Con qué control", t: "t", ph: "Botón A, deslizar, clic derecho…" },
      { k: "cambia", n: "Qué cambia en el mundo", t: "l" },
      { k: "combina", n: "Con qué se combina", t: "l", ph: "Otras mecánicas que la potencian o la frenan." },
    ],
    estados: ["Idea", "Prototipo", "Probada", "Lista"], vista: ["hace", "control"] },
  contenido: { n: "Contenido del juego", uno: "elemento", solo: ["videojuego"], d: "Enemigos, objetos, niveles y habilidades con sus valores.",
    campos: [
      { k: "clase", n: "Clase", t: "o", op: ["Enemigo", "Objeto", "Nivel", "Habilidad", "Personaje", "Otro"] },
      { k: "vida", n: "Vida", t: "n" }, { k: "dano", n: "Daño", t: "n" }, { k: "costo", n: "Costo", t: "n" },
      { k: "desc", n: "Descripción", t: "l" },
      { k: "img", n: "Imagen (enlace)", t: "img" },
    ],
    estados: ["Idea", "En arte", "En el juego", "Listo"], vista: ["clase", "vida", "dano", "costo"] },
  cartas: { n: "Cartas", uno: "carta", solo: ["juegomesa"], d: "Cada carta con su costo, efecto y copias. Arriba ves cuántas cartas suma el mazo.",
    campos: [
      { k: "palo", n: "Tipo o palo", t: "t", ph: "Acción, recurso, evento…" },
      { k: "costo", n: "Costo", t: "t" },
      { k: "efecto", n: "Efecto", t: "l", ph: "Lo que dice la carta, tal cual." },
      { k: "copias", n: "Copias", t: "n" },
      { k: "color", n: "Color", t: "c" },
      { k: "img", n: "Ilustración (enlace)", t: "img" },
    ],
    estados: ["Idea", "Probada", "Con arte", "Lista"], vista: ["palo", "costo", "efecto"], total: "copias" },
  componentes: { n: "Componentes", uno: "componente", solo: ["juegomesa"], d: "Lo que lleva la caja: cartas, dados, fichas, tableros, con cantidad y medida.",
    campos: [
      { k: "clase", n: "Qué es", t: "o", op: ["Cartas", "Dados", "Fichas", "Tablero", "Figuras", "Reglamento", "Caja", "Otro"] },
      { k: "cantidad", n: "Cantidad", t: "n" },
      { k: "medida", n: "Medida", t: "t", ph: "Ej.: 63 × 88 mm" },
      { k: "material", n: "Material", t: "t", ph: "Cartón, madera, acrílico…" },
      { k: "notas", n: "Notas", t: "l" },
    ],
    estados: ["Por definir", "Definido", "Cotizado"], vista: ["clase", "cantidad", "medida"], total: "cantidad" },
  personajes: { n: "Hoja de personaje", uno: "personaje", solo: ["historia", "comic"], d: "Quién es cada personaje, qué quiere y los rasgos que no pueden cambiar de una página a otra.",
    campos: [
      { k: "rol", n: "Rol", t: "o", op: ["Protagonista", "Antagonista", "Secundario", "De paso"] },
      { k: "quiere", n: "Qué quiere", t: "l" },
      { k: "rasgos", n: "Rasgos que no cambian", t: "l", ph: "Cicatriz en la mano izquierda, siempre lleva bufanda…" },
      { k: "habla", n: "Cómo habla", t: "t" },
      { k: "color", n: "Color principal", t: "c" },
      { k: "img", n: "Imagen de referencia (enlace)", t: "img" },
    ],
    estados: ["Esbozo", "Definido", "Diseñado"], vista: ["rol", "quiere"] },
  lugares: { n: "Lugares y objetos", uno: "lugar u objeto", solo: ["historia", "comic"], d: "Dónde pasa la historia y las cosas que importan, con lo que hay que recordar de cada uno.",
    campos: [
      { k: "clase", n: "Qué es", t: "o", op: ["Lugar", "Objeto", "Grupo", "Otro"] },
      { k: "como", n: "Cómo es", t: "l" },
      { k: "importa", n: "Por qué importa", t: "l" },
      { k: "img", n: "Imagen de referencia (enlace)", t: "img" },
    ],
    estados: ["Esbozo", "Definido"], vista: ["clase", "importa"] },
  pilares: { n: "Pilares", uno: "pilar", solo: ["contenido"], d: "Los temas fijos de tu canal: de qué hablas siempre y por qué le importa a tu público.",
    campos: [
      { k: "que", n: "De qué se trata", t: "l" },
      { k: "porque", n: "Por qué le importa a tu público", t: "l" },
      { k: "ideas", n: "Ideas de publicaciones", t: "l", ph: "Una por línea." },
      { k: "color", n: "Color", t: "c" },
    ],
    estados: ["Probando", "Funciona", "En pausa"], vista: ["que"] },
  series: { n: "Series", uno: "serie", solo: ["contenido"], d: "Publicaciones que se repiten con el mismo formato y ritmo.",
    campos: [
      { k: "formato", n: "Formato", t: "t", ph: "Reel de 30 s, carrusel de 6…" },
      { k: "ritmo", n: "Cada cuánto", t: "o", op: ["Diaria", "Semanal", "Quincenal", "Mensual", "Cuando se pueda"] },
      { k: "plataforma", n: "Dónde", t: "t" },
      { k: "partes", n: "Partes publicadas", t: "n" },
      { k: "idea", n: "La idea de la serie", t: "l" },
    ],
    estados: ["Idea", "Activa", "Terminada"], vista: ["formato", "ritmo", "plataforma"] },
  producto: { n: "Ficha de producto", uno: "producto", solo: ["producto"], d: "Lo que va en la etiqueta o en la tienda: descripción, medidas, materiales y cuidados.",
    campos: [
      { k: "corta", n: "Descripción corta", t: "t" },
      { k: "larga", n: "Descripción larga", t: "l" },
      { k: "medidas", n: "Medidas", t: "t" },
      { k: "materiales", n: "Materiales", t: "t" },
      { k: "cuidados", n: "Cuidados", t: "l" },
      { k: "precio", n: "Precio", t: "n" },
      { k: "img", n: "Foto (enlace)", t: "img" },
    ],
    estados: ["Prototipo", "En venta", "Descontinuado"], vista: ["corta", "precio"] },
  variantes: { n: "Variantes", uno: "variante", solo: ["producto"], d: "Colores, tamaños o aromas de un producto, cada uno con su código y precio.",
    campos: [
      { k: "atributo", n: "Color, tamaño o aroma", t: "t" },
      { k: "codigo", n: "Código", t: "t", ph: "Ej.: VEL-LAV-200" },
      { k: "precio", n: "Precio", t: "n" },
      { k: "color", n: "Color", t: "c" },
    ],
    estados: ["Prototipo", "En venta", "Agotada"], vista: ["atributo", "codigo", "precio"] },
  libre: { n: "Fichas libres", uno: "ficha", solo: null, d: "Un título y notas. Con Forja Más le agregas los campos que tu proyecto necesite.",
    campos: [{ k: "notas", n: "Notas", t: "l" }],
    estados: ["Pendiente", "Lista"], vista: ["notas"] },
};

// Qué ofrece cada categoría al crear una colección (la primera es la sugerida).
export const DE_TIPO = {
  videojuego: ["mecanicas", "contenido", "libre"],
  juegomesa: ["cartas", "componentes", "libre"],
  comic: ["personajes", "lugares", "libre"],
  historia: ["personajes", "lugares", "libre"],
  contenido: ["pilares", "series", "libre"],
  producto: ["producto", "variantes", "libre"],
  otro: ["libre", "personajes", "cartas", "mecanicas", "producto", "pilares", "lugares", "componentes", "contenido", "series", "variantes"],
};
export const sirve = (pl, tipo) => !!PLANTILLAS[pl] && (tipo === "otro" || !PLANTILLAS[pl].solo || PLANTILLAS[pl].solo.includes(tipo));
export const plantillasDe = (tipo) => (DE_TIPO[tipo] || DE_TIPO.otro).filter((k) => sirve(k, tipo));

// Campos propios (Forja Más): hasta 12 por colección, con la clave «p_…».
export const TIPOS_CAMPO = { t: "Texto corto", l: "Texto largo", n: "Número", o: "Opción" };
export const MAX_CAMPOS = 12;
// Campos de una colección: los de su plantilla más los propios.
export const camposDe = (c) => [...((PLANTILLAS[c.plantilla] || PLANTILLAS.libre).campos), ...((c.campos || []).filter((x) => x && /^p_[a-z0-9_]+$/.test(x.k)))];

// Enlaces entre fichas. Cada uno se guarda en la ficha de origen: { a: id de la otra ficha, t: tipo, n: nota corta opcional }.
// [cómo se lee desde la ficha que sale, cómo se lee desde la que llega, grupo]. La base acepta los mismos tipos
// (privado.t_elementos: cambiar ambos juntos). Los lazos vienen del mapa de relaciones y las rutas del mapa del mundo.
export const ENLACES = {
  abre: ["abre", "La abre", "orden"], necesita: ["necesita", "La necesita", "orden"], lleva: ["lleva a", "Viene de", "orden"],
  familia: ["Familia", "Familia", "lazo"], amor: ["Amor", "Amor", "lazo"], amistad: ["Amistad", "Amistad", "lazo"], alianza: ["Alianza", "Alianza", "lazo"],
  mentor: ["Mentor de", "Su mentor", "lazo"], rivalidad: ["Rivalidad", "Rivalidad", "lazo"], secreto: ["Secreto", "Secreto", "lazo"], lazo: ["Lazo", "Lazo", "lazo"],
  ruta: ["Ruta a", "Ruta desde", "ruta"],
};
// Cómo se lee un enlace en la ficha: «Esta abre → X», «Familia · X», «Ruta a X».
export const textoEnlace = (t, sale) => { const e = ENLACES[t] || ENLACES.lazo; return e[2] === "orden" ? (sale ? "Esta " + e[0] + " →" : e[1]) : e[2] === "lazo" ? (sale ? e[0] : e[1]) + " ·" : sale ? e[0] : e[1]; };
// Para elegir en Fichas: los de orden primero, después lazos y rutas.
export const GRUPOS_ENLACE = [["orden", "Orden"], ["lazo", "Lazos"], ["ruta", "Lugares"]];
