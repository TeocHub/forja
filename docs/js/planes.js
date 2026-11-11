// Forja · lo que trae Forja Más. Lo que aún no existe se muestra como "próximamente", para que se entienda qué viene
// y para medir con "Avísame" qué conviene construir primero (tabla public.interes_funciones).
// Las herramientas se declaran en herramientas.js; aquí van los precios, las áreas y las tarjetas.

import { esc, proximamente } from "./forja.js";
import { HERRAMIENTAS } from "./herramientas.js";

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
  { k: "equipo", n: "Equipo y opiniones", d: "Trabajar con otros, pedir opiniones y no perder fechas." },
];

// El catálogo sale del registro común de herramientas (herramientas.js): ahí se agrega una herramienta y se marca lista.
export const FUNCIONES = HERRAMIENTAS.filter((h) => h.area).map((h) => ({ k: h.id, a: h.area, t: h.t, d: h.d, listo: h.estado === "listo", libre: h.libre, solo: h.solo }));
export const funcion = (k) => FUNCIONES.find((f) => f.k === k);

// Tarjeta de una herramienta del catálogo: «Ya disponible» (con enlace si se da) o «Próximamente» con «Avísame».
export function tarjetaFuncion(k, href, chico = true) {
  const f = funcion(k); if (!f) return "";
  if (!f.listo) return proximamente(f.k, f.t, f.d, chico);
  return '<' + (href ? 'a href="' + esc(href) + '"' : "div") + ' class="fx-pronto listo' + (chico ? " chico" : "") + '" data-funcion="' + f.k + '"><span class="fx-pronto-tag">Ya disponible</span><b>' + esc(f.t) + "</b><span>" + esc(f.d) + "</span>" + (f.libre ? '<span class="libre">' + esc(f.libre) + "</span>" : "") + "</" + (href ? "a" : "div") + ">";
}
export const pendientes = (claves) => claves.filter((k) => { const f = funcion(k); return f && !f.listo; });
