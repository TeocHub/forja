// Forja · Ruta del proyecto: las etapas de cualquier proyecto, sus técnicas y lo que sigue.
// Un solo archivo para la pestaña Ruta, la franja «Lo que sigue», la ayuda y la guía.
// La ruta orienta y nunca bloquea: la persona marca en qué etapa está, salta o vuelve cuando quiere.

// Cómo trabaja cada persona en este proyecto (proyectos.ruta.creador). Decide cuánta guía se ve.
export const CREADORES = {
  plano: { n: "Lo planifico todo", d: "Quiero saber cada paso antes de empezar. Muéstrame todas las técnicas." },
  rumbo: { n: "Sé a dónde voy", d: "Tengo claro el destino y decido el camino en la marcha. Muéstrame lo esencial." },
  explora: { n: "Lo descubro haciendo", d: "Prefiero lanzarme y ver qué sale. Déjame la ruta a mano, sin sugerencias." },
};
export const CREADOR_INICIAL = "rumbo";

// Las 7 etapas. `n` es el nombre general; `por` cambia el nombre según la categoría (tipo) del proyecto.
export const ETAPAS = [
  { k: "inspirar", n: "Inspirarse", que: "Mira lo que otros ya hicieron, pero con ojos de quien crea: no para copiar, sino para entender por qué funciona.",
    por: {} },
  { k: "sembrar", n: "Sembrar", que: "Junta ideas sin juzgarlas y quédate con la que te sigue dando vueltas en la cabeza.",
    por: {} },
  { k: "mapa", n: "Mapa de la idea", que: "Pon la idea completa en una sola página antes de construirla: qué es, para quién y qué la hace distinta.",
    por: {} },
  { k: "estructura", n: "Estructura", que: "Decide la forma: en qué orden pasan las cosas y qué sostiene todo lo demás.",
    por: { videojuego: "Ciclo de juego", juegomesa: "Turno y partida", contenido: "Estructura del contenido", producto: "Cómo se usa" } },
  { k: "hacer", n: "Primera versión", que: "Haz una versión completa de principio a fin, aunque quede imperfecta. Pulir viene después.",
    por: { historia: "Primer borrador", videojuego: "Prototipo jugable", juegomesa: "Prototipo de papel", contenido: "Primer corte", producto: "Primera muestra" } },
  { k: "revisar", n: "Revisar", que: "Mírala con ojos frescos y deja que otras personas la prueben. Primero lo grande, después los detalles.",
    por: { videojuego: "Probar", juegomesa: "Probar", producto: "Probar" } },
  { k: "pulir", n: "Pulir y mostrar", que: "Deja todo en orden y sácalo al mundo: la vitrina, una feria, un fondo o una editorial.",
    por: {} },
];
export const etapaNombre = (k, tipo) => { const e = ETAPAS.find((x) => x.k === k); return e ? e.por[tipo] || e.n : ""; };
export const etapaIndice = (k) => Math.max(0, ETAPAS.findIndex((x) => x.k === k));

// Herramientas que todavía no existen: su tarjeta se ve, pero dice «Llega pronto».
export const PRONTO = new Set(["sesion", "metrabe", "revision", "lectores", "pulido", "prototipo"]);

// Técnicas por etapa. Campos:
// id, t (título), d (qué es y para qué), pasos (cómo, en 2 o 3 pasos), min (minutos aprox.),
// esencial (la ven todos los tipos de creador), mas (solo Forja Más), solo (categorías donde aplica),
// ir: dónde lleva — "pestaña" | "pestaña:dato" (taller:guia1,guia2 · pizarra:modo) | "resumen" | herramienta nueva (ver PRONTO) | null (la tarjeta basta).
export const TECNICAS = {
  inspirar: [
    { id: "analizar", t: "Analizar una obra", esencial: true, min: 30, ir: "analizar",
      d: "Elige dos obras parecidas a lo que quieres hacer y descubre cómo están hechas por dentro.",
      pasos: ["Anótala con su ficha: título, autor, año.", "Respóndete cómo se ve, cómo está armada y de qué trata de verdad.", "Escribe una cosa que aprendiste y quieres usar."] },
    { id: "referentes", t: "Juntar referentes", esencial: true, min: 15, ir: "referentes",
      d: "Imágenes, canciones, colores y frases con el tono que buscas. No tienen que parecerse a tu idea: tienen que sentirse como ella.",
      pasos: ["Guarda al menos cinco, de cosas distintas.", "Escribe en la nota por qué cada una te sirve."] },
    { id: "tablero", t: "Tablero de inspiración", min: 20, ir: "pizarra:libre",
      d: "Ordena tus referentes en una pizarra y mira qué se repite: un color, una época, un sentimiento.",
      pasos: ["Trae tus referentes a la pizarra.", "Agrúpalos por lo que tienen en común.", "Ponle nombre a cada grupo."] },
    { id: "brujula", t: "Probar formatos", min: 10, ir: "brujula",
      d: "Compara tu idea con once formatos. A veces una novela pide ser cómic, o un juego pide ser serie.",
      pasos: ["Mueve los ejes según tu idea.", "Mira los tres formatos que más calzan, aunque no fueran tu plan."] },
  ],
  sembrar: [
    { id: "semillero", t: "Anotar en el Semillero", esencial: true, min: 5, ir: "semillero",
      d: "Una frase por idea, sin juzgarla. Las ideas sueltas no gastan proyectos: se plantan cuando tú quieras.",
      pasos: ["Anota la idea en pocas palabras.", "Vuelve en unos días: la que todavía te entusiasma es la que tiene fuerza."] },
    { id: "resumen", t: "Escribir de qué se trata", esencial: true, min: 10, ir: "resumen",
      d: "Dos o tres líneas que expliquen el proyecto a alguien que no sabe nada. Si cuesta escribirlas, la idea aún está creciendo.",
      pasos: ["Escribe qué es, para quién y por qué te importa.", "Léelo en voz alta: si suena a otra cosa, ajústalo."] },
    { id: "chispas", t: "Buscar ideas donde no las buscas", mas: true, min: 15, ir: "semillero",
      d: "Ejercicios cortos para cuando la idea todavía no aparece o quieres darle una vuelta.",
      pasos: ["Toma algo que conoces bien y pregúntate «¿y si fuera al revés?».", "Junta dos cosas que no tienen nada que ver y busca qué historia o juego las une.", "Sal a mirar a la gente diez minutos e inventa qué le pasa a alguien."] },
    { id: "origen", t: "Anotar de dónde salió", min: 5, ir: "bitacora",
      d: "La primera entrada de la Bitácora: qué te hizo pensar en esta idea. Cuando dudes, te recordará por qué empezaste.",
      pasos: ["Escribe qué viste, escuchaste o recordaste.", "Agrega qué sentiste."] },
  ],
  mapa: [
    { id: "mapa", t: "Llenar el Mapa de la idea", esencial: true, min: 25, ir: "mapa",
      d: "Preguntas cortas alrededor de tu idea central, en una sola vista. Es el plano que vas a seguir después.",
      pasos: ["Responde primero lo que ya sabes.", "Deja en blanco lo que aún no: también es información."] },
    { id: "preguntas", t: "Responder las preguntas del Taller", esencial: true, min: 20, ir: "taller:premisa,pitch,idea,queEs",
      d: "La primera sección del Taller tiene preguntas que ordenan la idea. Respóndelas sin pensar en que quede bonito.",
      pasos: ["Abre la primera sección.", "Toca una pregunta para agregarla al texto y respóndela debajo."] },
    { id: "relaciones", t: "Dibujar quién es quién", mas: true, min: 20, ir: "pizarra:relaciones", solo: ["historia", "videojuego", "contenido"],
      d: "Personajes o facciones unidos por lazos con nombre: familia, rivalidad, secreto. Ver las relaciones muestra el conflicto.",
      pasos: ["Pon a cada personaje en una tarjeta.", "Une con un lazo a quienes se conocen y ponle nombre al lazo."] },
  ],
  estructura: [
    { id: "estructura", t: "Elegir una estructura", esencial: true, min: 30, ir: "estructura",
      d: "Modelos dibujados para tu categoría. Escribes qué pasa en cada momento y ves cómo calza en la forma.",
      pasos: ["Resume tu proyecto en seis momentos.", "Pruébalo en un modelo y quédate con el que lo ordene mejor."] },
    { id: "seccion-estructura", t: "Escribir la forma en el Taller", esencial: true, min: 25, ir: "taller:estructura,bucle,turno,guion,proceso",
      d: "La sección del Taller donde se ordena el proyecto: la estructura de la historia, el ciclo del juego, el turno o el guion.",
      pasos: ["Escribe el orden en una línea por momento.", "Marca dónde está el punto más intenso."] },
    { id: "escaleta", t: "Ordenar escenas en tarjetas", mas: true, min: 30, ir: "pizarra:escaleta", solo: ["historia", "contenido"],
      d: "Cada escena es una tarjeta que puedes arrastrar entre actos hasta que el orden te convenza.",
      pasos: ["Crea una tarjeta por escena.", "Muévelas hasta que cada acto termine con algo que cambie."] },
  ],
  hacer: [
    { id: "sesion", t: "Trabajar en sesiones cortas", esencial: true, min: 25, ir: "sesion",
      d: "Un temporizador y una meta chica. Avanzar un poco seguido rinde más que esperar la tarde perfecta.",
      pasos: ["Elige qué vas a hacer en esta sesión.", "Trabaja hasta que suene, sin corregir.", "Anota en una línea dónde quedaste."] },
    { id: "escribir", t: "Avanzar en el Taller", esencial: true, min: 25, ir: "taller", solo: ["historia", "contenido", "otro"],
      d: "Completa una sección de principio a fin antes de volver atrás. Lo incompleto se arregla; lo que no existe, no.",
      pasos: ["Abre la sección que tengas más clara.", "Escribe hasta el final aunque haya huecos: márcalos con [?]."] },
    { id: "prototipo", t: "Dejar el enlace del prototipo", esencial: true, min: 5, ir: "prototipo", solo: ["videojuego", "juegomesa", "producto"],
      d: "El prototipo vive fuera de Forja: en itch.io, en un video o en fotos. Déjalo enlazado para que la etapa cuente.",
      pasos: ["Sube el prototipo o una foto donde quieras.", "Pega aquí el enlace."] },
    { id: "avance-bitacora", t: "Anotar el avance", min: 5, ir: "bitacora",
      d: "Una línea en la Bitácora cada vez que avanzas. Cuando sientas que no avanzas, la Bitácora te mostrará lo contrario.",
      pasos: ["Anota qué hiciste y qué sigue."] },
    { id: "metrabe", t: "Me trabé", min: 10, ir: "metrabe",
      d: "Ejercicios rápidos para cuando la página o el prototipo no avanzan.",
      pasos: ["Toca el botón y haz el ejercicio que salga.", "Si no te sirve, toca de nuevo."] },
    { id: "sin-frenos", t: "Reglas para no frenarse", min: 2, ir: null,
      d: "Tres acuerdos contigo mismo para esta etapa.",
      pasos: ["Primero completo, después bonito.", "Si dudas, marca [?] y sigue: lo resuelves al revisar.", "Una idea nueva va a la Bitácora, no a reescribir lo anterior."] },
  ],
  revisar: [
    { id: "reposo", t: "Dejarlo reposar", esencial: true, min: 0, ir: null,
      d: "Antes de revisar, espera al menos un día sin mirarlo. Vas a ver cosas que hoy no ves.",
      pasos: ["Haz otra cosa por un día o dos.", "Vuelve y revisa como si lo hubiera hecho otra persona."] },
    { id: "revision", t: "Revisar con una lista", esencial: true, min: 30, ir: "revision",
      d: "Preguntas para encontrar lo que falla, según tu categoría. Primero lo grande (¿se entiende?, ¿funciona?) y después los detalles.",
      pasos: ["Recorre la lista sin corregir todavía.", "Marca lo que no pasa la prueba.", "Arregla de lo más grande a lo más chico."] },
    { id: "lectores", t: "Pedir opiniones", esencial: true, min: 15, ir: "lectores",
      d: "Comparte una copia con pocas personas y hazles preguntas concretas. Si varias dicen lo mismo, ahí hay algo.",
      pasos: ["Elige qué mostrar y a quién.", "Separa lo que es gusto personal de lo que de verdad hay que mejorar."] },
    { id: "pruebas", t: "Anotar cada partida de prueba", min: 10, ir: "taller:pruebas", solo: ["juegomesa", "videojuego"],
      d: "Con quién jugaste, qué funcionó, qué aburrió y qué vas a cambiar. Las notas de una partida valen más que la memoria.",
      pasos: ["Anota justo después de jugar.", "Escribe un cambio concreto para la próxima."] },
    { id: "avance-secciones", t: "Marcar qué está en revisión", min: 5, ir: "taller",
      d: "Cada sección del Taller tiene etapas. Marcar «En revisión» o «Listo» te muestra cuánto falta de verdad.",
      pasos: ["Recorre las secciones.", "Marca su etapa con honestidad."] },
  ],
  pulir: [
    { id: "pulido", t: "Lista de pulido", esencial: true, min: 30, ir: "pulido",
      d: "Los últimos detalles: ortografía, continuidad, nombres que cambiaron, piezas que faltan.",
      pasos: ["Revisa un punto de la lista a la vez.", "Cuando ya no estés mejorando sino dándole vueltas, está listo."] },
    { id: "vitrina", t: "Armar la vitrina", esencial: true, min: 40, ir: "vitrina",
      d: "La página pública del proyecto, para redes, ferias, fondos o una editorial. Tú eliges qué mostrar.",
      pasos: ["Trae lo mejor del Taller y tus referentes.", "Publica y comparte el enlace o el QR."] },
    { id: "biblia", t: "Exportar la biblia", min: 5, ir: "biblia",
      d: "Todo el proyecto en un documento para imprimir o guardar como PDF.",
      pasos: ["Elige las partes que quieres incluir.", "Guárdalo como PDF desde la impresión."] },
    { id: "oportunidades", t: "Buscar dónde presentarlo", min: 15, ir: "oportunidades",
      d: "Fondos, ferias y convocatorias en Chile que calzan con tu proyecto, con sus fechas.",
      pasos: ["Marca las que te interesan.", "Revisa en Eventos cuándo abren y cierran."] },
    { id: "costos", t: "Calcular cuánto cuesta producirlo", min: 30, ir: "costos", solo: ["juegomesa", "producto", "historia"],
      d: "Si va a imprimirse o fabricarse, cotiza antes de mostrarlo: sabrás a cuánto venderlo y cuánto pedir.",
      pasos: ["Agrega las piezas y los precios de proveedores.", "Mira el precio sugerido y la campaña."] },
  ],
};

// Técnicas visibles para un proyecto: según categoría y tipo de creador.
// «Sé a dónde voy» ve las esenciales; «Lo planifico todo», todas. Las de Forja Más se ven igual, con candado.
export function tecnicasDe(etapa, tipo, creador) {
  return (TECNICAS[etapa] || []).filter((x) => (!x.solo || x.solo.includes(tipo)) && (creador === "plano" || x.esencial));
}
export const todasDe = (etapa, tipo) => (TECNICAS[etapa] || []).filter((x) => !x.solo || x.solo.includes(tipo));
export const disponible = (x) => !PRONTO.has(x.ir);

// Estado guardado (proyectos.ruta), con valores por defecto.
export function estado(ruta) {
  const r = ruta && typeof ruta === "object" ? ruta : {};
  return {
    creador: CREADORES[r.creador] ? r.creador : CREADOR_INICIAL,
    etapa: ETAPAS.some((e) => e.k === r.etapa) ? r.etapa : null,
    hechos: r.hechos && typeof r.hechos === "object" ? r.hechos : {},
    abrir: ["ruta", "taller", "ultima"].includes(r.abrir) ? r.abrir : null,
    oculta: !!r.oculta,
  };
}

// Señales de avance sacadas de lo que ya existe en el proyecto. Solo sugieren: nunca cambian la etapa solas.
// ctx: { tipo, resumen, secs: [{guia, texto, avance}], refs: [{tipo, analisis}] (una obra cuenta si ya tiene análisis), notas: n, pizarras: [{modo}], vitrina: {publicada}, hechos }
const pal = (t) => ((t || "").trim().match(/\S+/g) || []).length;
const conTexto = (secs, guias, min) => secs.some((s) => guias.includes(s.guia) && pal(s.texto) >= min);
export function senales(c) {
  const secs = c.secs || [], h = c.hechos || {}, total = secs.reduce((a, s) => a + pal(s.texto), 0);
  const prom = secs.length ? secs.reduce((a, s) => a + (s.avance || 0), 0) / secs.length : 0;
  return {
    inspirar: (c.refs || []).length >= 3 || (c.refs || []).some((r) => r.tipo === "obra" && r.analisis && Object.keys(r.analisis).length),
    sembrar: pal(c.resumen) >= 15,
    mapa: conTexto(secs, ["premisa", "pitch", "idea", "queEs"], 40) || Object.values((c.esquema || {}).r || {}).filter((v) => String(v).trim()).length >= 4,
    estructura: conTexto(secs, ["estructura", "bucle", "turno", "guion", "proceso", "capitulos", "escaleta", "vinetas", "temporada"], 60) || (c.pizarras || []).some((p) => p.modo === "escaleta") || Object.values((c.estructura || {}).m || {}).filter((v) => String(v).trim()).length >= 4,
    hacer: total >= 3000 || prom >= 50 || !!h.prototipo,
    revisar: secs.some((s) => (s.avance || 0) >= 75) || !!h.revision,
    pulir: !!(c.vitrina && c.vitrina.publicada),
  };
}

// La etapa en que está el proyecto: la elegida, o la primera sin señales de avance.
export function etapaActual(ruta, sen) {
  const r = estado(ruta);
  if (r.etapa) return r.etapa;
  const e = ETAPAS.find((x) => !sen[x.k]);
  return (e || ETAPAS[ETAPAS.length - 1]).k;
}

// «Lo que sigue»: una sola sugerencia. Devuelve {tipo:"tecnica", etapa, tecnica} | {tipo:"avanzar", etapa, siguiente} | null.
// «Lo descubro haciendo» no recibe sugerencias. «Sé a dónde voy» solo recibe la de avanzar o la primera esencial pendiente.
export function loQueSigue(ruta, sen, tipo, mas) {
  const r = estado(ruta);
  if (r.creador === "explora") return null;
  const k = etapaActual(ruta, sen), i = etapaIndice(k);
  const pend = tecnicasDe(k, tipo, r.creador).filter((x) => !r.hechos[x.id] && (mas || !x.mas));
  const lista = pend.filter(disponible);
  if (sen[k] && i < ETAPAS.length - 1 && (r.creador === "rumbo" || !lista.length)) return { tipo: "avanzar", etapa: k, siguiente: ETAPAS[i + 1].k };
  if (lista.length) return { tipo: "tecnica", etapa: k, tecnica: lista[0] };
  if (i < ETAPAS.length - 1) return { tipo: "avanzar", etapa: k, siguiente: ETAPAS[i + 1].k };
  return null;
}
