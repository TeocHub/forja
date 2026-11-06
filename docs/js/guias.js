// Forja · tipos de proyecto y guías de escritura.
// Cada guía es un punto de partida: preguntas para destrabar, no un formulario obligatorio.

export const TIPOS = {
  historia: "Historia",
  videojuego: "Videojuego",
  juegomesa: "Juego de mesa",
  contenido: "Contenido para redes",
  producto: "Producto",
  otro: "Otro",
};
export const ESTADOS = { semilla: "Semilla", desarrollo: "En desarrollo", pausa: "En pausa", listo: "Listo", archivado: "Archivado" };
export const tc = (t) => "var(--t-" + (TIPOS[t] ? t : "otro") + ")";

// Área de Oportunidades que más le sirve a cada tipo (o formato elegido).
export function areaDe(tipo, formato) {
  if (formato === "videojuego" || tipo === "videojuego") return "videojuego";
  if (formato === "mesa" || tipo === "juegomesa") return "juegomesa";
  if (["comic", "novela", "cuento"].includes(formato) || tipo === "historia") return "comic";
  return "general";
}

// Biblioteca de secciones. `p`: preguntas guía. `e`: un ejemplo de cómo podría empezar.
export const SECCIONES = {
  premisa: { t: "Premisa", p: ["¿Qué pasa si…? Escríbelo en una o dos frases.", "¿Quién quiere qué, y qué se lo impide?", "¿Qué la hace distinta de otras historias parecidas?"] },
  personajes: { t: "Personajes", p: ["¿Quién protagoniza y qué desea (lo que dice querer) frente a lo que necesita (lo que de verdad le falta)?", "¿Quién se le opone y por qué cree tener la razón?", "¿Qué relación cambia más de principio a fin?"] },
  mundo: { t: "Mundo", p: ["¿Qué regla de este mundo no existe en el nuestro?", "¿Quién tiene el poder y cómo lo mantiene?", "¿Qué se come, qué se celebra, qué se teme?", "Si la magia o la tecnología existen, ¿qué cuestan?"] },
  conflicto: { t: "Conflicto y temas", p: ["¿Cuál es el problema que empuja todo?", "¿Qué pregunta sobre la vida hace la historia, aunque no la responda?", "¿Qué pierde alguien si las cosas salen bien?"] },
  estructura: { t: "Estructura", p: ["¿Cómo empieza, qué la complica, cuál es el punto más bajo y cómo termina?", "Puedes probar tres actos, cuatro (inicio, desarrollo, giro, cierre) o la estructura que te acomode.", "¿Dónde está el giro que nadie ve venir?"] },
  escenas: { t: "Escenas sueltas", p: ["Anota escenas que ya imaginas aunque no sepas dónde van.", "¿Qué imagen te vino primero a la cabeza con esta idea?"] },
  tono: { t: "Tono y estilo", p: ["¿Se parece más a qué obras, en sensación y no en trama?", "¿Narrador en primera o tercera persona? ¿Presente o pasado?", "¿Humor, solemnidad, nostalgia, tensión?"] },

  pitch: { t: "Concepto", p: ["Descríbelo en una frase: género + giro + qué hace quien juega.", "¿Qué sentimiento debería quedar después de jugar?", "¿Con qué juegos lo compararías, y en qué se diferencia?"] },
  bucle: { t: "Bucle de juego", p: ["¿Qué hace quien juega cada 30 segundos? ¿Cada 5 minutos? ¿En una sesión completa?", "¿Qué gana al repetir ese ciclo?", "¿Qué decisión interesante toma una y otra vez?"] },
  mecanicas: { t: "Mecánicas", p: ["Verbos principales: saltar, construir, negociar, investigar…", "¿Qué mecánica es la que nadie más tiene?", "¿Cómo se pierde, y qué se aprende al perder?"] },
  narrativa: { t: "Mundo y narrativa", p: ["¿Cómo se cuenta la historia: diálogos, ambiente, objetos, decisiones?", "¿La historia cambia según lo que haga quien juega?"] },
  estetica: { t: "Estética y sonido", p: ["Pega aquí los colores y referentes clave (y agrégalos también en Referentes).", "¿Pixel art, 3D low poly, dibujado a mano?", "¿Qué suena cuando pasa algo importante?"] },
  publico: { t: "Público y plataforma", p: ["¿Para quién es? ¿Qué juega hoy esa persona?", "¿PC, celular, consola, navegador?", "¿Cuánto dura una partida típica?"] },
  alcance: { t: "Alcance y prototipo", p: ["¿Qué es lo mínimo que hay que construir para saber si es divertido?", "¿Qué se queda fuera de la primera versión?", "¿Con qué motor o herramienta se hará?"] },

  objetivo: { t: "Objetivo y cómo se gana", p: ["¿Qué intenta lograr cada jugador?", "¿Cómo termina la partida?", "¿Se compite, se coopera o un poco de ambas?"] },
  turno: { t: "Turno de juego", p: ["Paso a paso, ¿qué hace un jugador en su turno?", "¿Cuántas decisiones toma? ¿Son difíciles o automáticas?", "¿Qué hacen los demás mientras esperan?"] },
  componentes: { t: "Componentes", p: ["Tablero, cartas, fichas, dados, figuras, reglamento, caja…", "¿Cuántas unidades de cada uno?", "¿Qué componente se podría simplificar sin perder diversión? (después cotízalos en Costos)"] },
  reglas: { t: "Reglas", p: ["Escribe las reglas como si se las explicaras a alguien que nunca jugó.", "¿Qué excepción se te olvida siempre?", "¿Qué pregunta hacen siempre en las pruebas?"] },
  jugadores: { t: "Jugadores, edad y duración", p: ["¿Cuántos jugadores, desde qué edad y cuánto dura?", "¿Funciona igual de bien con 2 que con el máximo?"] },
  pruebas: { t: "Pruebas de juego", p: ["Anota cada prueba: con quién, qué funcionó, qué aburrió, qué cambiar.", "¿Hubo un momento en que todos se rieron o se quejaron?"] },
  uso: { t: "Uso pedagógico", p: ["¿Qué aprendizaje o habilidad trabaja?", "¿Para qué nivel o curso sirve y en qué asignatura cabe?", "¿Cómo lo usaría un profe en una clase de 45 minutos?"] },

  idea: { t: "Idea central", p: ["¿Qué quieres que la gente sienta, aprenda o haga después de verlo?", "Escríbelo como titular."] },
  plataforma: { t: "Plataforma y formato", p: ["¿Dónde se publica: TikTok, Instagram, YouTube, otra?", "¿Video vertical, carrusel, serie de partes?", "¿Cuánto dura?"] },
  gancho: { t: "Gancho", p: ["¿Qué se ve o se dice en los primeros 3 segundos?", "¿Qué pregunta deja abierta para que sigan mirando?"] },
  guion: { t: "Guion", p: ["Divide en momentos: gancho, desarrollo, remate y llamado a la acción.", "Escribe cómo se dice, no solo qué se dice."] },
  calendario: { t: "Calendario", p: ["¿Cada cuánto se publica?", "¿Qué fechas especiales calzan con esta idea?"] },

  queEs: { t: "Qué es", p: ["Descríbelo como en una etiqueta: qué es, de qué está hecho, para qué sirve.", "¿Qué lo hace distinto de lo que ya se vende?"] },
  paraQuien: { t: "Para quién", p: ["¿Quién lo compra y quién lo usa? (no siempre es la misma persona)", "¿Dónde lo encuentra hoy esa persona?"] },
  proceso: { t: "Materiales y proceso", p: ["¿Qué se necesita y en qué orden se hace?", "¿Qué parte se hace a mano y cuál se encarga?", "¿Cuánto tiempo toma una unidad?"] },
  precio: { t: "Precio", p: ["¿A cuánto se vende algo parecido?", "Usa Costos para saber cuánto cuesta realmente producirlo."] },
  presentacion: { t: "Presentación y empaque", p: ["¿Cómo se ve al recibirlo?", "¿Qué dice la etiqueta o el empaque?"] },
  venta: { t: "Dónde se vende", p: ["¿Tienda propia, ferias, redes, tiendas de otros?", "Revisa la pestaña Oportunidades para ferias cercanas."] },

  capitulos: { t: "Capítulos", p: ["Haz una línea por capítulo: qué pasa y qué cambia.", "¿Dónde termina cada capítulo para que den ganas de seguir?"] },
  escaleta: { t: "Escaleta", p: ["Escena por escena: lugar, momento del día, quién está y qué pasa.", "¿Cuánto dura cada escena, más o menos?", "¿Qué escena se podría cortar sin perder la historia?"] },
  temporada: { t: "Temporada y episodios", p: ["¿Cuántos episodios y cuánto dura cada uno?", "¿Qué pregunta abre la temporada y cuál la cierra?", "Una línea por episodio: qué pasa y en qué termina."] },
  vinetas: { t: "Guion por páginas", p: ["Página por página: cuántas viñetas, qué se ve en cada una y qué se dice.", "¿Qué página termina con un giro para dar vuelta la hoja?", "¿Qué momento merece una página completa?"] },
  episodio: { t: "Formato del episodio", p: ["¿Cuánto dura un episodio y cómo se divide (intro, bloques, cierre)?", "¿Quiénes hablan y con qué tono?", "¿Hay música, efectos o invitados?"] },
  libre: { t: "Notas", p: ["Escribe lo que quieras: esta sección no tiene preguntas."] },
  pasos: { t: "Próximos pasos", p: ["¿Qué es lo siguiente concreto que hay que hacer?", "¿Qué te tiene trabado?"] },
  financiamiento: { t: "Financiamiento", p: ["¿Cuánto se necesita para terminarlo?", "¿Fondo concursable, preventa, Kickstarter, Patreon, ahorro propio?"] },
  difusion: { t: "Difusión", p: ["¿Cómo se va a enterar la gente?", "¿Qué se puede mostrar antes de que esté terminado?"] },
};

// Peso de cada sección en el avance del proyecto (se puede cambiar en cada sección). Lo no listado pesa 10.
export const PESO = { premisa: 15, personajes: 15, mundo: 15, conflicto: 10, estructura: 20, escenas: 10, tono: 5,
  pitch: 10, bucle: 20, mecanicas: 20, narrativa: 10, estetica: 15, publico: 5, alcance: 15,
  objetivo: 10, turno: 15, componentes: 15, reglas: 25, jugadores: 5, pruebas: 20, uso: 10,
  idea: 15, plataforma: 10, gancho: 15, guion: 40, calendario: 10,
  queEs: 15, paraQuien: 15, proceso: 25, precio: 20, presentacion: 15, venta: 10,
  capitulos: 25, escaleta: 30, temporada: 30, vinetas: 30, episodio: 15, libre: 5, pasos: 5, financiamiento: 10, difusion: 10 };
export const pesoDe = (g) => (g in PESO ? PESO[g] : 10);

// Etapas de avance de una sección; el porcentaje se puede ajustar a mano.
export const ETAPAS = [[0, "Sin empezar"], [25, "Ideas sueltas"], [50, "Borrador"], [75, "En revisión"], [100, "Listo"]];
export const etapaDe = (n) => ETAPAS.reduce((a, e) => (n >= e[0] ? e : a), ETAPAS[0])[1];
export function avance(secs) {
  const w = secs.reduce((a, s) => a + (s.peso || 0), 0);
  return w ? Math.round(secs.reduce((a, s) => a + (s.peso || 0) * (s.avance || 0), 0) / w) : 0;
}

// Formatos que caben en cada categoría, y la categoría natural de cada formato.
export const FORMATOS_DE = {
  historia: ["novela", "cuento", "comic", "corto", "largo", "serie", "animacion", "podcast"],
  videojuego: ["videojuego"],
  juegomesa: ["mesa"],
  contenido: ["video", "podcast", "corto", "serie", "animacion"],
  producto: [],
  otro: null, // cualquiera
};
export const formatoCabe = (tipo, f) => !f || FORMATOS_DE[tipo] === null || (FORMATOS_DE[tipo] || []).includes(f);
export const tipoDe = (f) => ({ videojuego: "videojuego", mesa: "juegomesa", video: "contenido" })[f] || "historia";
// Secciones extra que sugiere cada formato.
export const PLANTILLA_FORMATO = { novela: ["capitulos"], cuento: [], comic: ["vinetas"], corto: ["escaleta"], largo: ["escaleta"], serie: ["temporada"], animacion: ["escaleta", "estetica"], podcast: ["episodio", "guion"], video: ["gancho", "guion"], videojuego: [], mesa: [] };
export const sugeridas = (tipo, f) => [...new Set([...(PLANTILLA[tipo] || []), ...((f && PLANTILLA_FORMATO[f]) || [])])];

// Secciones con las que nace un proyecto de cada tipo.
export const PLANTILLA = {
  historia: ["premisa", "personajes", "mundo", "conflicto", "estructura", "escenas", "tono"],
  videojuego: ["pitch", "bucle", "mecanicas", "narrativa", "estetica", "publico", "alcance"],
  juegomesa: ["pitch", "objetivo", "turno", "componentes", "reglas", "jugadores", "pruebas"],
  contenido: ["idea", "plataforma", "gancho", "guion", "calendario"],
  producto: ["queEs", "paraQuien", "proceso", "precio", "presentacion", "venta"],
  otro: ["idea", "libre", "pasos"],
};
