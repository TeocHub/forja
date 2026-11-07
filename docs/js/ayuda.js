// Forja · ayuda. Un solo contenido para tres lugares:
//   guia/           la guía completa para explorar (con demos reales)
//   abrirAyuda(id)  el cajón "?" que explica la página donde estás, con buscador
//   pista(el, id)   una nota corta la primera vez que se abre cada herramienta (se recuerda en localStorage)
// Al cambiar una herramienta, actualizar aquí su tema.

const ICO = {
  plantar: '<path d="M12 21v-8"/><path d="M12 13c0-4 3-7 7-7 0 4-3 7-7 7Z"/><path d="M12 15c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5Z"/>',
  ruta: '<circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M7 18h6a4 4 0 0 0 0-8h-2a4 4 0 0 1 0-8"/>',
  taller: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="M13.5 6.5l4 4"/>',
  referentes: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  brujula: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  pizarra: '<rect x="3" y="4" width="7" height="6" rx="1.5"/><rect x="14" y="14" width="7" height="6" rx="1.5"/><path d="M10 7h3a3 3 0 0 1 3 3v4"/>',
  costos: '<path d="M4 7h16v12H4z"/><path d="M8 7V5h8v2"/><path d="M9 13h6M12 10v6"/>',
  oportunidades: '<path d="M4 21V4"/><path d="M4 4h12l-2 4 2 4H4"/>',
  vitrina: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 14h5"/>',
  biblia: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
  bitacora: '<path d="M7 3v4M17 3v4"/><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 12h8M8 16h5"/>',
  eventos: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/><circle cx="12" cy="15" r="1.6"/>',
  cuenta: '<path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.4 6.8 19.2l1-5.9L3.5 9.2l5.9-.8L12 3Z"/>',
  comunidad: '<path d="M4 20V5"/><path d="M4 5h11l-2 4 2 4H4"/>',
  invitar: '<path d="M4 7h16v11H4z"/><path d="m4 7 8 6 8-6"/><path d="M18 3v4M16 5h4"/>',
  equipo: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><path d="M15 14.4c2.6-.4 4.8 1.2 5.5 4.6"/>',
  privacidad: '<path d="M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
  app: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
};
export const icono = (k, tam = 22) => '<svg viewBox="0 0 24 24" width="' + tam + '" height="' + tam + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICO[k] || ICO.plantar) + "</svg>";

// ctx = { p: id del último proyecto abierto (o null) }
// Direcciones absolutas desde la raíz del sitio (la ayuda se abre desde páginas en distintas carpetas).
const RAIZ = new URL("../", import.meta.url).href, u = (r = "") => RAIZ + r;
const enProyecto = (pest) => (ctx) => (ctx && ctx.p ? u("proyecto/?p=" + ctx.p + "#" + pest) : u("proyectos/"));

export const TEMAS = [
  { id: "plantar", linea: true, n: "Plantar un proyecto", donde: "Proyectos",
    corto: "Todo parte aquí: le das nombre a tu idea, eliges qué es y Forja te arma el Taller con las secciones que suelen hacer falta.",
    para: "Un proyecto es la carpeta de una idea: un videojuego, un juego de mesa, una historia, contenido para redes o un producto. Al plantarlo, Forja prepara sus secciones según la categoría, y desde ahí lo vas haciendo crecer.",
    pasos: ["En Proyectos, escribe el nombre de tu idea y elige su categoría.", "Toca «Plantar»: se abre el proyecto con su Taller listo para escribir.", "Arriba cambias el estado (semilla, en desarrollo, en pausa, listo) y el formato cuando lo tengas claro.", "Cuando un proyecto quede atrás, archívalo: no se borra y libera un cupo."],
    consejo: "No esperes a tener la idea completa. Una semilla con nombre y una frase ya sirve: Forja te va haciendo las preguntas.",
    plan: ["3 proyectos en curso (los archivados no cuentan)", "Proyectos sin límite"],
    ir: () => u("proyectos/#semilla"), claves: "crear nuevo proyecto empezar categoría formato estado archivar semilla cupo" },
  { id: "ruta", n: "La ruta del proyecto", donde: "Pestaña Ruta de cada proyecto",
    corto: "Las etapas de cualquier proyecto, de la inspiración a la vitrina, con técnicas para cada una. Te orienta, no te obliga.",
    para: "Todo proyecto pasa por etapas parecidas: inspirarse, sembrar ideas, dibujar el mapa de la idea, darle estructura, hacer una primera versión, revisarla y mostrarla. La ruta te dice en qué etapa vas y qué podrías hacer ahora, con técnicas que te llevan a la herramienta indicada. Tú decides el ritmo: puedes saltar etapas, volver atrás o cerrar las sugerencias.",
    pasos: ["Al plantar, elige cómo trabajas: «Lo planifico todo», «Sé a dónde voy» o «Lo descubro haciendo». Cambia cuánta guía ves.", "En la pestaña Ruta toca una etapa para ver sus técnicas y marca «Estoy aquí» en la que vas.", "Cada técnica trae pasos cortos y un botón que abre la herramienta. Márcala como hecha cuando quieras.", "Bajo la cabecera, «Lo que sigue» te sugiere un paso. Ciérrala si no la quieres; vuelve desde la Ruta."],
    consejo: "Forja nota cuando hay señales de avance (por ejemplo, el resumen escrito o varias secciones en revisión) y te pregunta si pasas a la siguiente etapa, pero nunca la cambia sola.",
    plan: ["Toda la ruta y las técnicas esenciales", "Todas las técnicas de cada etapa"],
    ir: enProyecto("ruta"), claves: "ruta etapas camino qué sigue lo que sigue guía método planificar inspirarse sembrar estructura borrador prototipo revisar pulir tipo de creador" },
  { id: "taller", linea: true, n: "El Taller", donde: "Pestaña Taller de cada proyecto",
    corto: "Escribes tu proyecto por secciones, con preguntas que te guían. Cada sección tiene su avance y el proyecto suma todo.",
    para: "El Taller ordena la escritura en secciones (premisa, personajes, mecánicas, reglas…) según lo que estés creando. Cada una trae preguntas guía para no partir de la hoja en blanco, y tu avance se calcula solo.",
    pasos: ["Elige una sección en el índice de la izquierda y abre sus preguntas guía.", "Escribe: se guarda solo mientras escribes. Usa pantalla completa para concentrarte.", "Marca su etapa (ideas sueltas, borrador, en revisión, listo); el peso dice cuánto aporta al avance total.", "Agrega, renombra u ordena secciones. Si cambias de categoría, Forja te sugiere las que faltan."],
    consejo: "El avance es tuyo: si una sección pesa más para tu proyecto, súbele el peso. El número de arriba se ajusta.",
    plan: ["20.000 palabras por proyecto", "Palabras sin límite"],
    ir: enProyecto("taller"), claves: "escribir texto secciones preguntas guía avance peso etapa palabras pantalla completa premisa personajes" },
  { id: "referentes", linea: true, n: "Referentes", donde: "Pestaña Referentes",
    corto: "Tu muro de inspiración: imágenes, videos, música, colores, citas y enlaces. Solo enlaces y códigos, nunca archivos.",
    para: "Junta lo que inspira tu proyecto sin llenar tu teléfono: pegas un enlace o un color y Forja reconoce qué es. Los videos y la música se cargan solo cuando los tocas.",
    pasos: ["Pega un enlace (imagen, YouTube, Vimeo, Spotify, SoundCloud, una página) o un color como #2a9d8f.", "Ponle un título y una nota sobre por qué te sirve.", "Fíltralos por tipo cuando el muro crezca.", "Úsalos después en la Pizarra o en la Vitrina."],
    consejo: "Para que una imagen funcione, el enlace tiene que llevar directo a la imagen (al abrirlo se ve solo la imagen).",
    plan: ["30 referentes por proyecto", "Referentes sin límite"],
    ir: enProyecto("referentes"), claves: "inspiración imagen video música color paleta cita enlace youtube spotify moodboard" },
  { id: "brujula", linea: true, n: "La Brújula", donde: "Pestaña Brújula",
    corto: "Mueve seis ejes y mira con qué formatos calza tu idea: novela, corto, serie, cómic, videojuego, juego de mesa…",
    para: "Una idea puede ser muchas cosas. La Brújula compara cómo es la tuya (cuánto decide el público, cuánto pesan las reglas, la imagen, la voz interna, el ritmo y la escala) con once formatos. Es una referencia para pensar, no un veredicto.",
    pasos: ["Parte de la configuración inicial de tu categoría o formato.", "Mueve cada eje según tu idea; la pregunta de cada eje te ayuda a decidir.", "Mira el dial: los formatos más cercanos se iluminan con su porcentaje de encaje.", "Si te convence otro formato, elígelo: la categoría y el Taller se ajustan."],
    consejo: "Prueba moverla pensando en la versión más ambiciosa de tu idea, y luego en la más pequeña. A veces el formato cambia.",
    plan: ["Incluida", "Incluida"],
    ir: enProyecto("brujula"), claves: "formato elegir novela corto largometraje serie cómic animación podcast ejes encaje" },
  { id: "pizarra", linea: true, n: "La Pizarra", donde: "Pestaña Pizarra",
    corto: "Un tablero para ordenar con las manos: tarjetas, colores y flechas. Con Forja Más: relaciones, escaleta y mapa del mundo.",
    para: "Lo que no se entiende en texto, se entiende en un tablero. Pones ideas en tarjetas, las unes con flechas y traes tus secciones y referentes para abrirlos desde ahí.",
    pasos: ["Toca dos veces el fondo para crear una tarjeta y escríbele título y notas a la derecha.", "Arrastra el punto del borde de una tarjeta hasta otra para unirlas.", "Muévete arrastrando el fondo; acerca con la rueda o pellizcando.", "Con «Traer del proyecto» sumas secciones del Taller o referentes."],
    consejo: "Supr borra lo elegido y Ctrl + Z deshace. En el celular, «Pantalla completa» hace todo más cómodo.",
    plan: ["1 pizarra libre por proyecto, 20 tarjetas", "Sin límite, más relaciones, escaleta y mapa del mundo"],
    ir: enProyecto("pizarra"), claves: "tablero tarjetas flechas mapa relaciones personajes escaleta escenas actos mundo lugares diagrama" },
  { id: "costos", linea: true, n: "Costos y precio", donde: "Pestaña Costos y Cotizaciones",
    corto: "Calcula cuánto cuesta producir una unidad, pieza por pieza, y a cuánto venderla sin perder plata.",
    para: "La cotización de un proyecto reúne sus piezas (tablero, cartas, impresión, figuras…) y los precios que te dan los proveedores. Con eso calcula el costo real de una unidad, con IVA, envío y dólar, y te sugiere un precio de venta.",
    pasos: ["Crea la cotización desde la pestaña Costos: parte con las piezas típicas de tu tipo de proyecto.", "Agrega los precios que te den los proveedores para distintas cantidades.", "Mira el costo de una unidad según cuántas mandes a hacer.", "En «A cuánto venderlo» ajusta ganancia, comisión y redondeo hasta que te cuadre.", "En «Campaña y recompensas» agrupa las piezas en productos (el juego, un llavero, un peluche), arma recompensas con ellos y anota cuántos apoyos esperas: verás el precio sugerido de cada una, cuánto mandar a hacer y la meta."],
    consejo: "Pide precio para al menos dos cantidades al mismo proveedor: así Forja estima las cantidades intermedias.",
    plan: ["Una cotización por proyecto", "Lo mismo, y pronto versiones de precio y presupuesto para fondos"],
    ir: (ctx) => (ctx && ctx.p ? u("proyecto/?p=" + ctx.p + "#costos") : u("cotizaciones/")), claves: "precio cotizar proveedor imprenta costo unidad iva dólar envío ganancia vender lote tiraje crowdfunding kickstarter campaña recompensas tiers meta preventa llavero peluche merch" },
  { id: "oportunidades", linea: true, n: "Oportunidades", donde: "Calendario y pestaña Oportunidades",
    corto: "Fondos, ferias y convocatorias en Chile, con sus fechas. Cada proyecto sigue las que le sirven.",
    para: "Forja revisa fondos, ferias y convocatorias para creadores en Chile y los pone en un calendario. En cada proyecto ves las que calzan con lo que haces y marcas las que vas a seguir.",
    pasos: ["Mira el calendario general cuando quieras, incluso sin cuenta.", "En el proyecto, abre Oportunidades: arriba salen las que calzan con su categoría.", "Marca su estado: me interesa, postulando, postulé, aceptado.", "Las fechas de lo que sigues aparecen en Eventos."],
    consejo: "Si una fecha dice «estimada», se calculó con ediciones anteriores: confírmala en la fuente antes de planificar.",
    plan: ["Incluido", "Incluido, y pronto alertas antes de cada cierre"],
    ir: enProyecto("oportunidades"), claves: "fondos concursos ferias postular convocatoria fondart financiamiento calendario fechas cierre" },
  { id: "vitrina", linea: true, n: "La Vitrina", donde: "Pestaña Vitrina",
    corto: "La página pública de tu proyecto, con enlace propio y QR. Tú eliges qué mostrar; nada se publica solo.",
    para: "Para compartir tu proyecto en redes, ferias, fondos o con una editorial. La vitrina se arma con copias que tú traes del proyecto y revisas: tu Taller, tu bitácora y tus pizarras siguen privados.",
    pasos: ["Abre el editor desde la pestaña Vitrina: portada, historia, galería, novedades y enlaces.", "Trae textos del Taller y referentes como copias, y edítalos sin tocar los originales.", "Mira la vista previa al lado: es exactamente lo que se publicará.", "Publica, copia el enlace o descarga el QR para tu stand.", "En «Seguidores», activa el botón para que la gente siga tu proyecto, y escríbeles cuando tengas algo importante (una vez por semana como mucho).", "Con la campaña armada en Costos, en «Recompensas» tráelas a la vitrina: la gente puede tocar «Me interesa» en cada una (sin pagar) y tú ves cuántas personas hay.", "En «Campaña y recompensas» arma la página de la campaña con bloques de título, texto, imagen, video y cita, agrega metas desbloqueables y anota cuánto llevas recaudado. Si vendes tú mismo, pon en cada recompensa su enlace de pago de Mercado Pago o PayPal.", "En «Diseño» elige una columna o paneles: cada sección como tarjeta, de tamaño completo, 2/3, mitad o 1/3.", "Las imágenes van por enlace: súbelas gratis a ImgBB, Postimages o Imgur y copia el enlace directo. Forja te avisa si el enlace no funciona."],
    consejo: "Las novedades son un diario de avance para el público. Escribir una cada tanto genera más confianza que una portada perfecta.",
    plan: ["Portada, historia, galería, novedades y enlaces", "Todo eso, más tus pizarras para explorar"],
    ir: enProyecto("vitrina"), claves: "página pública compartir mostrar publicar enlace qr feria editorial portfolio redes seguir seguidores wishlist lista de deseos avisar correo pagos preventa apoyo" },
  { id: "biblia", linea: true, n: "La biblia del proyecto", donde: "Botón «Exportar la biblia»",
    corto: "Un documento imprimible con todo tu proyecto, para guardarlo como PDF o llevarlo a una reunión.",
    para: "La biblia junta en un solo documento la portada, la escritura, los referentes, la brújula, las pizarras, los costos, las oportunidades y la bitácora. Eliges qué partes incluir y la guardas como PDF desde la impresión del navegador.",
    pasos: ["En el proyecto, toca «Exportar la biblia del proyecto (PDF)».", "Marca las partes que quieres incluir.", "Toca «Imprimir o guardar PDF» y elige «Guardar como PDF»."],
    consejo: "Es ideal para enviarla a un fondo, a una editorial o para tener un respaldo de tu proyecto fuera de Forja.",
    plan: ["Incluida", "Incluida"],
    ir: (ctx) => (ctx && ctx.p ? u("biblia/?p=" + ctx.p) : u("proyectos/")), claves: "pdf imprimir exportar documento respaldo descargar" },
  { id: "bitacora", n: "Bitácora", donde: "Pestaña Bitácora",
    corto: "Tu diario privado del proyecto: notas con fecha de lo que hiciste, decidiste o se te ocurrió.",
    para: "La bitácora guarda notas fechadas que solo ves tú. Sirve para recordar por qué tomaste una decisión o qué quedó pendiente.",
    pasos: ["Escribe una nota y guárdala: queda con fecha y hora.", "Búscala después cuando no recuerdes qué pasó.", "Si quieres contar un avance en público, conviértela en novedad desde el editor de la Vitrina."],
    consejo: "Anota también lo que descartaste y por qué. En unos meses lo vas a agradecer.",
    plan: ["Incluida", "Incluida"], ir: enProyecto("bitacora"), claves: "notas diario apuntes registro privado" },
  { id: "eventos", n: "Eventos", donde: "Menú Eventos",
    corto: "Las fechas de las oportunidades que siguen tus proyectos, de la más cercana a la más lejana.",
    para: "Eventos junta en una línea de tiempo cuándo abren y cierran las postulaciones y cuándo son los eventos que sigues, con cuenta regresiva. También te sugiere oportunidades para cada proyecto.",
    pasos: ["Sigue oportunidades desde cada proyecto o desde las sugerencias de Eventos.", "Mira lo que viene: lo que vence en dos semanas se destaca."],
    consejo: "Revisa Eventos una vez por semana: es lo que más ayuda a no perderse un cierre.",
    plan: ["Incluido", "Incluido, y pronto alertas"], ir: () => u("eventos/"), claves: "fechas plazos calendario cierres recordatorio" },
  { id: "cuenta", n: "Planes y límites", donde: "Mejorar plan",
    corto: "El plan gratis sirve de verdad; Forja Más quita los límites y suma herramientas. Si dejas de pagar, nada se borra.",
    para: "Con el plan gratis puedes tener 3 proyectos en curso con 20.000 palabras y 30 referentes cada uno, una pizarra libre y tu vitrina. Forja Más (próximamente) quita esos límites y suma herramientas.",
    pasos: ["Mira tu cupo en Proyectos y los contadores en el Taller y Referentes.", "Si llegas a un límite, archiva o recorta: lo anterior queda guardado.", "Si un proyecto queda en solo lectura, igual puedes verlo, exportarlo, archivarlo o borrarlo."],
    consejo: "En «Mejorar plan», el botón «Avísame» en cada herramienta nos dice qué construir primero.",
    plan: ["Gratis para siempre", "$2.990 al mes (próximamente)"], ir: () => u("planes/"), claves: "precio pagar suscripción gratis límite forja más plan cupo solo lectura" },
  { id: "privacidad", n: "Quién ve qué", donde: "Tu cuenta",
    corto: "Tus proyectos son solo tuyos. Lo único público es lo que publicas en una vitrina.",
    para: "Entras con un enlace a tu correo, sin contraseña. Todo lo que creas queda en tu espacio privado: nadie más lo ve, ni otras cuentas. Lo único que se puede ver sin cuenta es la versión publicada de una vitrina, y los precios que decides compartir en el cotizador van sin tu nombre.",
    pasos: ["Para entrar, pide el enlace en «Entrar» y ábrelo en el mismo dispositivo.", "Tu correo nunca se muestra a otras personas.", "Puedes despublicar una vitrina o dejar de compartir un precio cuando quieras."],
    consejo: "Si entras desde otro dispositivo, pide un enlace nuevo ahí: tus proyectos te esperan iguales.",
    plan: ["Igual en todos los planes", "Igual en todos los planes"], ir: () => u("privacidad/"), publico: true, claves: "descargar borrar cuenta eliminar seguridad datos correo privado público contraseña enlace magic link entrar" },
  { id: "comunidad", n: "Normas, reportes y Explorar", donde: "Cada vitrina y Mi cuenta",
    corto: "Qué se puede publicar, cómo reportar algo dañino y cómo aparecer en Explorar.",
    para: "Lo que publicas en una vitrina debe respetar las Normas de la comunidad. Cualquier persona con cuenta puede reportar una vitrina, y cada reporte lo revisa una persona: nada se oculta solo por recibir reportes. Si tomamos una medida, te decimos el porqué en Mi cuenta y puedes apelar. Explorar es el directorio público: tu vitrina aparece ahí solo si lo eliges al publicar.",
    pasos: ["Para mostrar tu proyecto en Explorar, marca «Mostrar en Explorar» al publicar la vitrina (necesita título y una historia de al menos 40 palabras).", "Si ves algo que rompe las normas, toca «Reportar esta vitrina» al final de la página y elige el motivo.", "Revisa tus avisos y escríbenos desde Mi cuenta; para apelar una suspensión usa «Apelar» en el editor de la vitrina.", "En Mi cuenta → Correos de Forja eliges qué te escribimos: boletín, herramientas que pediste y proyectos que sigues."],
    consejo: "Si tu historia trata temas fuertes, avísalo en la portada: la ficción puede tratar cualquier tema, lo que se modera es el daño a personas reales.",
    plan: ["Incluido", "Incluido"], ir: () => u("normas/"), publico: true, claves: "boletín correos baja suscribir seguir proyectos normas reglas reportar denunciar sanción suspendida apelar moderación explorar directorio publicar términos privacidad" },
  { id: "equipo", n: "Trabajar en equipo", donde: "Menú de tu cuenta → Trabajando en",
    corto: "Proyectos compartidos con tu equipo, cada persona con su rol.",
    para: "Un equipo tiene sus propios proyectos, aparte de tu forja personal. Cada persona administra, edita o solo lee; los proyectos delicados se reservan para quienes elijas. Hoy los equipos son para Digital Monster: toda cuenta con correo del equipo entra sola, como lectora.",
    pasos: ["Cambia entre «Mi forja» y el equipo desde el menú de tu cuenta: la etiqueta junto al logo te dice dónde estás.", "Para llevar una idea tuya al equipo, abre el proyecto y toca «Mover a…» bajo la cabecera.", "Quien administra decide los roles en «Personas del equipo» y reserva un proyecto con «Quién lo ve».", "Si alguien más está en el proyecto, lo verás bajo la cabecera; en el Taller, escriban en secciones distintas para no pisarse."],
    consejo: "Las vitrinas del equipo las publica quien administra: quien edita prepara el borrador y avisa.",
    plan: ["Solo Digital Monster", "Pronto: invitar personas a un proyecto"], ir: () => u("equipo/"), claves: "equipo compartir colaborar colaborativo roles miembros digital monster invitar permisos reservado mover" },
  { id: "invitar", n: "Invitar personas a un proyecto", donde: "Bajo la cabecera del proyecto → Personas",
    corto: "Trabaja con otras personas en un proyecto, cada una con lo que le toca.",
    para: "Puedes invitar a alguien por correo a un proyecto tuyo. Para cada parte (Taller y ficha, Referentes, Pizarra, Costos, Oportunidades, Bitácora y Vitrina) eliges si edita, solo ve o no ve. Así un grupo puede repartirse el trabajo: unos en lo creativo, otros en costos o en la vitrina.",
    pasos: ["Abre el proyecto y toca «Invitar personas» (o «Personas») bajo la cabecera.", "Escribe su correo, elige desde dónde partir (Todo, Lo creativo, Costos, La vitrina o Solo mirar) y toca cada área para ajustarla.", "Le llega un correo con un enlace que solo funciona con esa dirección y vence en 14 días. Si no tiene cuenta, la crea gratis.", "Puedes cambiar lo que hace cada persona o quitarle el acceso cuando quieras; ella también puede salirse."],
    consejo: "Publicar la vitrina, borrar, mover e invitar siempre queda en tus manos. Si dos personas escriben en la misma sección a la vez, se guarda lo último: repártanse las secciones.",
    plan: ["1 persona por proyecto", "Hasta 5 por proyecto"], ir: null, claves: "invitar colaborar colaboradores compartir compañero grupo correo permisos acceso areas costos vitrina salir compartidos" },
  { id: "app", n: "Forja en tu teléfono", donde: "Tu navegador",
    corto: "Instálala como una app desde el navegador, sin tienda de aplicaciones.",
    para: "Forja se puede instalar en el teléfono o el computador y abre como una app, con su ícono.",
    pasos: ["En Android con Chrome: menú ⋮ → «Instalar app» o «Agregar a la pantalla principal».", "En iPhone con Safari: botón compartir → «Agregar a inicio».", "En el computador: el ícono de instalar en la barra de direcciones."],
    consejo: "En el celular, la Pizarra y el Taller tienen modo pantalla completa.",
    plan: ["Incluido", "Incluido"], ir: null, claves: "instalar celular teléfono android iphone app pantalla de inicio" },
];
export const tema = (id) => TEMAS.find((t) => t.id === id);

// Qué tema explica la página donde está la persona.
export function temaDe(href = location.href, hash = location.hash) {
  const rel = href.split(/[?#]/)[0].slice(RAIZ.length).replace(/index\.html$/, ""), h = (hash || "").slice(1);
  if (rel === "proyecto/") return tema(h) ? h : "taller";
  return ({ "proyectos/": "plantar", "cotizador/": "costos", "cotizaciones/": "costos", "eventos/": "eventos", "planes/": "cuenta", "vitrina/editar/": "vitrina", "biblia/": "biblia", "oportunidades/": "oportunidades", "entrar/": "privacidad", "cuenta/": "comunidad", "normas/": "comunidad", "terminos/": "privacidad", "privacidad/": "privacidad", "explorar/": "comunidad", "equipo/": "equipo", "boletin/": "comunidad", "invitacion/": "invitar" })[rel] || "plantar";
}
export const contexto = () => { let p = null; try { p = localStorage.getItem("forja-ultimo-proyecto"); } catch (e) {} return { p }; };

// Búsqueda simple por palabras (sin tildes): nombre y frase pesan más que las claves.
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export function buscar(q) {
  const ps = norm(q).split(/[^a-z0-9ñ]+/).filter((w) => w.length > 2);
  if (!ps.length) return [];
  return TEMAS.map((t) => {
    const fuerte = norm(t.n + " " + t.corto), suave = norm(t.claves + " " + t.para + " " + t.pasos.join(" "));
    const s = ps.reduce((a, w) => a + (fuerte.includes(w) ? 3 : 0) + (suave.includes(w) ? 1 : 0) + (norm(t.claves).split(" ").some((c) => c.startsWith(w.slice(0, 5))) ? 1 : 0), 0);
    return { t, s };
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).filter((x, i, l) => x.s >= l[0].s * 0.5).map((x) => x.t); // solo lo que se acerca al mejor resultado
}

const estilos = () => { if (!document.getElementById("ay-css")) document.head.insertAdjacentHTML("beforeend", '<style id="ay-css">' + CSS_AYUDA + "</style>"); };
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// El cuerpo de un tema (lo usan la guía y el cajón).
export function temaHTML(t, ctx = contexto(), { conIr = true } = {}) {
  const href = t.ir ? t.ir(ctx) : null;
  return '<div class="ay-tema"><span class="ay-donde">' + icono(t.id, 18) + esc(t.donde) + "</span><h2>" + esc(t.n) + '</h2><p class="ay-para">' + esc(t.para) + "</p>" +
    '<div class="ay-pasos" role="list">' + t.pasos.map((p, i) => '<div class="ay-paso" role="listitem"><b>' + (i + 1) + "</b><span>" + esc(p) + "</span></div>").join("") + "</div>" +
    '<p class="ay-consejo"><b>Consejo</b> ' + esc(t.consejo) + "</p>" +
    '<div class="ay-plan"><span><small>Plan gratis</small>' + esc(t.plan[0]) + '</span><span class="mas"><small>Forja Más</small>' + esc(t.plan[1]) + "</span></div>" +
    (conIr && href ? '<a class="ay-ir" href="' + esc(href) + '">Ir a ' + esc(t.n.replace(/^(El|La|Los|Las) /, "").toLowerCase()) + " →</a>" : "") + "</div>";
}

/* ---------- cajón de ayuda ("?") ---------- */
let cajon;
export function abrirAyuda(id = temaDe()) {
  if (!cajon) {
    estilos();
    cajon = document.createElement("dialog"); cajon.className = "ay-cajon"; cajon.setAttribute("aria-label", "Ayuda de Forja");
    document.body.appendChild(cajon);
    cajon.addEventListener("click", (e) => { if (e.target === cajon) cajon.close(); });
  }
  const pintar = (tid, q = "") => {
    const t = tema(tid) || TEMAS[0], res = q ? buscar(q) : null;
    cajon.innerHTML = '<div class="ay-c"><div class="ay-c-cab"><b>Ayuda</b><button type="button" class="ay-x" aria-label="Cerrar ayuda">×</button></div>' +
      '<label class="ay-buscar"><span class="ay-sr">Buscar en la ayuda</span><input type="search" placeholder="¿Qué quieres hacer? Ej.: calcular el precio" value="' + esc(q) + '"></label>' +
      (res ? '<div class="ay-res">' + (res.length ? res.slice(0, 5).map((r) => '<button type="button" data-t="' + r.id + '">' + icono(r.id, 18) + "<span><b>" + esc(r.n) + "</b><small>" + esc(r.corto) + "</small></span></button>").join("") : '<p class="ay-nada">No encontré eso. Prueba con otras palabras o abre la guía completa.</p>') + "</div>" : temaHTML(t)) +
      '<div class="ay-otros"><span>Otros temas</span><div>' + TEMAS.filter((x) => x.id !== t.id || res).map((x) => '<button type="button" data-t="' + x.id + '" title="' + esc(x.n) + '">' + icono(x.id, 16) + "<span>" + esc(x.n) + "</span></button>").join("") + "</div></div>" +
      '<a class="ay-guia" href="' + u("guia/#" + t.id) + '">Abrir la guía completa, con ejemplos para probar →</a></div>';
    cajon.querySelector(".ay-x").onclick = () => cajon.close();
    cajon.querySelectorAll("[data-t]").forEach((b) => b.onclick = () => { pintar(b.dataset.t); cajon.querySelector(".ay-c").scrollTop = 0; });
    const inp = cajon.querySelector("input");
    let tq; inp.oninput = () => { clearTimeout(tq); tq = setTimeout(() => { const v = inp.value; pintar(tid, v); const i2 = cajon.querySelector("input"); i2.focus(); i2.setSelectionRange(v.length, v.length); }, 220); };
    inp.onkeydown = (e) => { if (e.key === "Enter") { const r = buscar(inp.value)[0]; if (r) pintar(r.id); } };
  };
  pintar(id);
  if (!cajon.open) cajon.showModal();
}

/* ---------- pistas: la primera vez que se abre cada herramienta ---------- */
const vistas = () => { try { return new Set(JSON.parse(localStorage.getItem("forja-pistas") || "[]")); } catch (e) { return new Set(); } };
export function pista(contenedor, id) {
  const t = tema(id); if (!t || !contenedor) return;
  const v = vistas(); if (v.has(id)) return;
  estilos();
  const el = document.createElement("div"); el.className = "ay-pista"; el.setAttribute("role", "note");
  el.innerHTML = '<span class="ay-pista-ico">' + icono(id, 20) + "</span><p><b>" + esc(t.n) + ".</b> " + esc(t.corto) + '</p><span class="ay-pista-b"><button type="button" data-a="ver">Cómo funciona</button><button type="button" data-a="ok">Entendido</button></span>';
  const cerrar = () => { const s = vistas(); s.add(id); try { localStorage.setItem("forja-pistas", JSON.stringify([...s])); } catch (e) {} el.remove(); };
  el.querySelector('[data-a="ver"]').onclick = () => { cerrar(); abrirAyuda(id); };
  el.querySelector('[data-a="ok"]').onclick = cerrar;
  contenedor.prepend(el);
}
export const reiniciarPistas = () => { try { localStorage.removeItem("forja-pistas"); localStorage.removeItem("forja-sendero-oculto"); } catch (e) {} };

/* ---------- primeros pasos (en Proyectos) ---------- */
// hecho = { plantar, taller, referentes, pizarra, vitrina } (booleans), p = proyecto más reciente
export const PASOS = [
  ["plantar", "Planta tu primera idea", "Ponle nombre y elige qué es."],
  ["taller", "Escribe en el Taller", "Responde una pregunta guía, aunque sea con dos frases."],
  ["referentes", "Guarda un referente", "Una imagen, una canción o un color que te inspire."],
  ["pizarra", "Arma tu pizarra", "Ordena tus ideas en tarjetas y únelas."],
  ["vitrina", "Publica su vitrina", "Muestra tu proyecto con un enlace propio."],
];
export function sendero(contenedor, hecho, p) {
  if (!contenedor) return;
  let oculto = false; try { oculto = localStorage.getItem("forja-sendero-oculto") === "1"; } catch (e) {}
  const listos = PASOS.filter(([k]) => hecho[k]).length;
  if (oculto) { contenedor.innerHTML = ""; return; }
  estilos();
  const sig = PASOS.findIndex(([k]) => !hecho[k]);
  const ctx = { p };
  contenedor.innerHTML = '<section class="ay-sendero" aria-labelledby="ay-s-t"><div class="ay-s-cab"><div><h2 id="ay-s-t">' + (listos === PASOS.length ? "¡Recorriste lo esencial de Forja!" : "Tus primeros pasos en Forja") + "</h2><p>" +
    (listos === PASOS.length ? "Ya conoces el camino de una idea a su vitrina. Lo demás lo descubres a tu ritmo en la guía." : "Cinco pasos para conocer lo esencial. Se marcan solos a medida que avanzas.") + '</p></div><span class="ay-s-n">' + listos + " de " + PASOS.length + '</span></div><div class="ay-ruta">' +
    PASOS.map(([k, n, d], i) => { const t = tema(k), est = hecho[k] ? "hecho" : i === sig ? "siguiente" : "";
      return '<a class="ay-hito ' + est + '" href="' + esc(k === "plantar" ? "#semilla" : t.ir(ctx)) + '"' + (!hecho.plantar && k !== "plantar" ? ' aria-disabled="true" tabindex="-1"' : "") + '><span class="ay-punto">' + (hecho[k] ? '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' : icono(k, 18)) + "</span><span class=\"ay-hito-t\"><b>" + n + "</b><small>" + (hecho[k] ? "Listo" : d) + "</small></span></a>"; }).join("") +
    '</div><div class="ay-s-pie"><a href="' + u("guia/") + '">Explorar la guía completa</a><button type="button" id="ay-ocultar">' + (listos === PASOS.length ? "Cerrar" : "Ocultar por ahora") + "</button></div></section>";
  contenedor.querySelector("#ay-ocultar").onclick = () => { try { localStorage.setItem("forja-sendero-oculto", "1"); } catch (e) {} contenedor.innerHTML = ""; };
  const pl = contenedor.querySelector('.ay-hito[href="#semilla"]');
  if (pl) pl.onclick = (e) => { e.preventDefault(); const s = document.getElementById("semilla"); if (s) { s.scrollIntoView({ behavior: "smooth", block: "center" }); const i = s.querySelector("input"); if (i) setTimeout(() => i.focus(), 350); } };
}

export const CSS_AYUDA = `
.ay-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.ay-cajon{margin:0 0 0 auto;height:100%;max-height:100%;width:min(460px,100vw);border:0;border-left:1px solid var(--line);border-radius:0;padding:0;background:var(--card);color:var(--fg)}
.ay-cajon[open]{animation:ay-entra .18s ease-out}
.ay-cajon::backdrop{background:rgba(10,12,20,.35)}
@keyframes ay-entra{from{transform:translateX(24px);opacity:.6}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.ay-cajon[open]{animation:none}}
.ay-c{height:100%;overflow:auto;padding:16px 20px 28px;display:flex;flex-direction:column;gap:16px;font-family:var(--f-body);font-size:15px;line-height:1.5}
.ay-c-cab{display:flex;justify-content:space-between;align-items:center}
.ay-c-cab b{font-family:var(--f-num);font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.ay-x{border:0;background:none;color:var(--muted);font-size:26px;line-height:1;cursor:pointer;padding:0 4px}
.ay-buscar input{width:100%;font:inherit;font-size:15px;border:1px solid var(--line);background:var(--field);color:var(--fg);border-radius:10px;padding:9px 12px}
.ay-tema{display:flex;flex-direction:column;gap:12px}
.ay-donde{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:700;letter-spacing:.03em}
.ay-tema h2{font-family:var(--f-display);font-size:26px;line-height:1.1;margin:0}
.ay-para{margin:0}
.ay-pasos{display:flex;flex-direction:column;gap:0;border-left:2px solid var(--line);margin-left:11px}
.ay-paso{display:grid;grid-template-columns:24px minmax(0,1fr);gap:10px;align-items:start;padding:0 0 12px;margin-left:-13px}
.ay-paso b{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:var(--fg);color:var(--bg);font-family:var(--f-num);font-size:12px}
.ay-paso span{padding-top:1px}
.ay-consejo{margin:0;background:var(--accent-soft);border-radius:12px;padding:10px 12px;font-size:14px}
.ay-consejo b{color:var(--accent);margin-right:4px}
.ay-plan{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--line);border-radius:12px;overflow:hidden;font-size:13.5px}
.ay-plan span{padding:9px 12px;display:flex;flex-direction:column;gap:2px}
.ay-plan span+span{border-left:1px solid var(--line)}
.ay-plan small{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:700}
.ay-plan .mas small{color:var(--ember)}
.ay-ir{align-self:flex-start;font-weight:700;text-decoration:none;color:var(--accent)}
.ay-res{display:flex;flex-direction:column;gap:8px}
.ay-res button{font:inherit;text-align:left;display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:12px;padding:10px 12px;cursor:pointer}
.ay-res button:hover{border-color:var(--accent)}
.ay-res button svg{flex:none;color:var(--accent);margin-top:2px}
.ay-res span{display:flex;flex-direction:column}
.ay-res small{color:var(--muted);font-size:13px}
.ay-nada{margin:0;color:var(--muted)}
.ay-otros>span{display:block;font-size:12px;color:var(--muted);font-weight:700;margin-bottom:6px}
.ay-otros>div{display:flex;flex-wrap:wrap;gap:6px}
.ay-otros button{font:inherit;font-size:13px;display:inline-flex;gap:6px;align-items:center;border:1px solid var(--line);background:var(--field);color:var(--fg);border-radius:999px;padding:4px 10px 4px 8px;cursor:pointer}
.ay-otros button:hover{border-color:var(--accent)}
.ay-otros svg{color:var(--muted)}
.ay-guia{font-size:14px;text-decoration:none;color:var(--accent);font-weight:700;border-top:1px solid var(--line);padding-top:14px}
.ay-pista{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px 12px;align-items:center;border:1px solid color-mix(in srgb,var(--accent) 35%,var(--line));background:var(--accent-soft);border-radius:14px;padding:10px 12px;margin:12px 0 0;font-size:14px}
.ay-pista p{margin:0}
.ay-pista-ico{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--card);color:var(--accent)}
.ay-pista-b{display:flex;gap:6px}
.ay-pista button{font:inherit;font-size:13px;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:8px;padding:5px 10px;cursor:pointer;white-space:nowrap}
.ay-pista button[data-a=ver]{border-color:var(--accent);color:var(--accent);font-weight:700}
@media (max-width:640px){.ay-pista{grid-template-columns:auto minmax(0,1fr)}.ay-pista-b{grid-column:1/-1;justify-content:flex-end}}
.ay-sendero{border:1px solid var(--line);background:var(--card);border-radius:18px;padding:16px 18px;margin:0 0 18px}
.ay-s-cab{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
.ay-s-cab h2{font-family:var(--f-display);font-size:20px;margin:0}
.ay-s-cab p{margin:2px 0 0;color:var(--muted);font-size:14px}
.ay-s-n{font-family:var(--f-num);font-size:13px;color:var(--muted);white-space:nowrap}
.ay-ruta{position:relative;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:16px 0 6px}
.ay-ruta::before{content:"";position:absolute;left:10%;right:10%;top:21px;height:2px;background:var(--line)}
.ay-hito{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px;text-decoration:none;color:var(--fg);padding:0 4px;border-radius:12px}
.ay-hito[aria-disabled=true]{opacity:.5;pointer-events:none}
.ay-punto{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--card);border:2px solid var(--line);color:var(--muted);transition:transform .15s}
.ay-hito:hover .ay-punto{transform:translateY(-2px)}
.ay-hito-t{display:flex;flex-direction:column;gap:2px;margin-top:4px}
.ay-hito b{font-size:13.5px;line-height:1.25}
.ay-hito small{font-size:12px;color:var(--muted);line-height:1.3}
.ay-hito.hecho .ay-punto{background:var(--good);border-color:var(--good);color:#fff}
.ay-hito.siguiente .ay-punto{border-color:var(--accent);color:var(--accent);box-shadow:0 0 0 5px var(--accent-soft)}
.ay-hito.siguiente b{color:var(--accent)}
.ay-s-pie{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:10px;font-size:14px}
.ay-s-pie a{color:var(--accent);font-weight:700;text-decoration:none}
.ay-s-pie button{font:inherit;font-size:13px;border:0;background:none;color:var(--muted);cursor:pointer;text-decoration:underline;text-underline-offset:3px}
@media (max-width:640px){
  .ay-ruta{grid-template-columns:1fr;gap:0}
  .ay-ruta::before{left:21px;right:auto;top:22px;bottom:22px;width:2px;height:auto}
  .ay-hito{flex-direction:row;text-align:left;align-items:center;gap:12px;padding:6px 0}
  .ay-hito-t{margin:0}
  .ay-hito small{display:none}
  .ay-hito.siguiente small{display:block}
  .ay-hito span.ay-punto{flex:none}
}
@media (prefers-reduced-motion:reduce){.ay-punto{transition:none}}
`;
