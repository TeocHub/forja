// Forja · Semillero: ideas de una frase que todavía no son proyectos (tabla public.ideas, por espacio).
// Aquí viven los detonantes (ejercicios cortos para encontrar ideas) y la función que planta un proyecto,
// que usan semillero/ y proyectos/ para que plantar sea igual en los dos lugares.
import { sb } from "./forja.js";
import { PLANTILLA, SECCIONES, pesoDe } from "./guias.js";

export const MAX_IDEA = 80;

// Detonantes escritos para Forja. `para`: "todo" o una categoría (historia, comic, videojuego, juegomesa, contenido, producto).
export const DETONANTES = [
  { para: "todo", t: "Da vuelta algo que conoces bien", d: "Piensa en una regla de tu barrio, tu trabajo o tu casa. ¿Qué pasaría si de un día para otro fuera al revés?" },
  { para: "todo", t: "Dos cosas que no se conocen", d: "Elige un oficio y un lugar que no tengan nada que ver: un relojero y una isla, una panadera y una mina. ¿Qué los junta?" },
  { para: "todo", t: "El objeto del cajón", d: "Abre un cajón y saca lo primero que encuentres. Alguien lo perdió y daría mucho por recuperarlo. ¿Por qué?" },
  { para: "todo", t: "Lo que nadie dice", d: "Piensa en una frase que la gente repite sin pensar. ¿Qué historia, juego o producto saldría de tomarla al pie de la letra?" },
  { para: "todo", t: "Una tarde de otra época", d: "Elige un año al azar de la historia de Chile. ¿Qué hacía una persona común esa tarde que hoy nos parecería rarísimo?" },
  { para: "todo", t: "La versión pequeña", d: "Toma algo enorme (una guerra, una mudanza, una elección) y cuéntalo desde algo diminuto: una hormiga, un botón, un mensaje." },
  { para: "todo", t: "Lo que te molesta", d: "Anota algo que te dio rabia esta semana. Detrás de casi toda molestia hay una idea esperando." },
  { para: "todo", t: "El final primero", d: "Escribe una última escena, una última jugada o un último uso. Después pregúntate qué tuvo que pasar para llegar ahí." },
  { para: "historia", t: "La carta que no llegó", d: "Alguien escribió una carta hace años y nunca llegó a destino. Hoy aparece. ¿Quién la lee primero?" },
  { para: "historia", t: "Un personaje con una regla", d: "Inventa a alguien que jamás rompe una regla muy concreta. Ahora ponlo en el único lugar donde tiene que romperla." },
  { para: "historia", t: "El testigo equivocado", d: "Cuenta un hecho importante desde quien menos lo entendió: un niño, un perro, alguien que llegó tarde." },
  { para: "videojuego", t: "Un verbo nuevo", d: "Elige un verbo que casi ningún juego usa (regar, coser, olvidar, devolver) y piensa cómo sería hacerlo con un botón." },
  { para: "videojuego", t: "La limitación como regla", d: "¿Y si no pudieras saltar, ni ver, ni detenerte? Una restricción fuerte suele ser una mecánica entera." },
  { para: "videojuego", t: "Un lugar que cambia", d: "Piensa en un lugar que conoces y en cómo cambia de día a noche o de invierno a verano. ¿Y si jugar fuera notar esos cambios?" },
  { para: "comic", t: "Una sola viñeta", d: "Imagina una viñeta que cuente un mundo entero sin una palabra. ¿Qué pasó justo antes y qué pasa en la siguiente?" },
  { para: "comic", t: "Lo que no se dice", d: "Dos personajes hablan de algo sin importancia mientras en el fondo pasa lo importante. ¿Qué se ve detrás de ellos?" },
  { para: "comic", t: "Una calle que conoces", d: "Dibuja de memoria una esquina de tu barrio. ¿Qué historia necesitaría que la volvieras a dibujar cien veces?" },
  { para: "juegomesa", t: "Una decisión difícil por turno", d: "Busca una situación real con dos opciones buenas y poco tiempo para elegir. ¿Cómo se juega en una mesa?" },
  { para: "juegomesa", t: "Compartir lo escaso", d: "Algo que todos necesitan y no alcanza: agua, sombra, un solo bote. ¿Cooperan o compiten?" },
  { para: "juegomesa", t: "El componente primero", d: "Elige un objeto que te gustaría tocar en una mesa (fichas de madera, cartas transparentes, un mapa que se dobla) y busca el juego que lo necesita." },
  { para: "contenido", t: "La pregunta que te hacen", d: "¿Qué te preguntan siempre tus amigos o tu familia? Esa pregunta, bien respondida, es una serie." },
  { para: "contenido", t: "Antes y después", d: "Algo que aprendiste a hacer mejor con los años. Muestra el antes, el después y el error del medio." },
  { para: "contenido", t: "Un minuto de oficio", d: "Elige un oficio que se ve poco. ¿Qué mostrarías en sesenta segundos para que alguien lo mire con otros ojos?" },
  { para: "producto", t: "El atajo casero", d: "Piensa en un truco que alguien de tu casa inventó para resolver un problema chico. ¿Lo comprarías hecho?" },
  { para: "producto", t: "Un regalo difícil", d: "¿A quién te cuesta hacerle regalos? Diseña la cosa que por fin acertaría." },
  { para: "producto", t: "Lo que se rompe siempre", d: "Hay objetos que se rompen o se pierden una y otra vez. ¿Qué tendría que tener uno que no?" },
];
export const PARA = { todo: "Cualquier cosa", historia: "Historia", comic: "Cómic", videojuego: "Videojuego", juegomesa: "Juego de mesa", contenido: "Contenido", producto: "Producto" };
// Un detonante al azar, distinto del anterior.
export function detonante(para = "todo", antes = null) {
  const lista = DETONANTES.filter((x) => para === "todo" || x.para === para || x.para === "todo");
  const op = lista.length > 1 ? lista.filter((x) => x !== antes) : lista;
  return op[Math.floor(Math.random() * op.length)];
}

// Planta un proyecto con las secciones de su categoría. Devuelve { id } o { error }.
// extra: { resumen, hechos } (por ejemplo, la idea del Semillero y la técnica ya hecha en la ruta).
export async function plantarProyecto({ espacio, nombre, tipo, creador, resumen = null, hechos = null }) {
  const ruta = { creador, abrir: "ruta" };
  if (hechos) ruta.hechos = hechos;
  const fila = { espacio_id: espacio, nombre: nombre.slice(0, 160), tipo, ruta };
  if (resumen) fila.resumen = resumen.slice(0, 4000);
  const { data, error } = await sb.from("proyectos").insert(fila).select("id").single();
  if (error) return { error };
  await sb.from("secciones").insert((PLANTILLA[tipo] || []).map((g, i) => ({ espacio_id: espacio, proyecto_id: data.id, titulo: SECCIONES[g].t, guia: g, orden: i, peso: pesoDe(g) })));
  return { id: data.id };
}
