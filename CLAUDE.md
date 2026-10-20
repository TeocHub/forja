# Forja · reglas para Claude

Proyecto de Teoc (TeocHub) y Skynook, empresa Digital Monster (Chile; no tiene relación con Digimon). Responder y escribir en español.

## Cómo trabajar en este repo
- Commits directo a `main`, sin ramas ni pull requests (decisión del dueño). Mensajes de commit en español, cortos.
- Sitio estático en `docs/` publicado por GitHub Pages. Sin build ni dependencias: HTML, CSS y JS planos.
- El repositorio es público: nunca guardar datos privados, claves, cotizaciones reales ni datos personales. Lo privado va a Supabase.
- Mantener la app instalable (manifest + `sw.js`). Si cambia el shell, subir la versión de `CACHE` en `docs/sw.js`.

## Datos de oportunidades (`docs/data/oportunidades.json`)
Arreglo de objetos. Campos:
- `id` (minúsculas con guiones, único), `nombre`, `tipo` ("fondo" | "feria" | "convocatoria"), `areas` (array de "videojuego" | "comic" | "juegomesa" | "general")
- `organiza`, `lugar`
- `postul_inicio`, `postul_fin`, `evento_inicio`, `evento_fin`: fechas `YYYY-MM-DD`
- `fechas_estimadas` (bool): true si las fechas se calcularon por ediciones anteriores; `postul_texto` / `evento_texto` cuando no hay fechas
- `premio`, `costo`, `requisitos`, `que_llevar`, `notas`, `fuente` (URL), `revisado` (`YYYY-MM-DD`)

Reglas de datos:
- Solo oportunidades en Chile. No inventar: si un dato no se encuentra, se omite.
- Una fecha estimada lleva `fechas_estimadas: true` y en `notas` se explica en qué se basa.
- Si una postulación solo tiene cierre conocido, estimar también la apertura para que no aparezca abierta por error.
- No borrar convocatorias cerradas ni eventos del último año (sirven de referencia); sí duplicados.
- Al terminar una revisión, actualizar `docs/data/meta.json` (`ultima_revision` en `YYYY-MM-DD`, `resumen` en una frase).
- Validar que el JSON parsea antes de hacer commit.
