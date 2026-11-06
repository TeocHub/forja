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

  libre: { t: "Notas", p: ["Escribe lo que quieras: esta sección no tiene preguntas."] },
  pasos: { t: "Próximos pasos", p: ["¿Qué es lo siguiente concreto que hay que hacer?", "¿Qué te tiene trabado?"] },
  financiamiento: { t: "Financiamiento", p: ["¿Cuánto se necesita para terminarlo?", "¿Fondo concursable, preventa, Kickstarter, Patreon, ahorro propio?"] },
  difusion: { t: "Difusión", p: ["¿Cómo se va a enterar la gente?", "¿Qué se puede mostrar antes de que esté terminado?"] },
};

// Secciones con las que nace un proyecto de cada tipo.
export const PLANTILLA = {
  historia: ["premisa", "personajes", "mundo", "conflicto", "estructura", "escenas", "tono"],
  videojuego: ["pitch", "bucle", "mecanicas", "narrativa", "estetica", "publico", "alcance"],
  juegomesa: ["pitch", "objetivo", "turno", "componentes", "reglas", "jugadores", "pruebas"],
  contenido: ["idea", "plataforma", "gancho", "guion", "calendario"],
  producto: ["queEs", "paraQuien", "proceso", "precio", "presentacion", "venta"],
  otro: ["idea", "libre", "pasos"],
};
