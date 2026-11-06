# Forja · reglas para Claude

Proyecto de Teoc (TeocHub) y Skynook, empresa Digital Monster (Chile; no tiene relación con Digimon). Responder y escribir en español.

## Cómo trabajar en este repo
- Commits directo a `main`, sin ramas ni pull requests (decisión del dueño). Mensajes de commit en español, cortos.
- Sitio estático en `docs/` publicado por GitHub Pages. Sin build ni dependencias: HTML, CSS y JS planos.
- El repositorio es público: nunca guardar datos privados, claves, cotizaciones reales ni datos personales. Lo privado va a Supabase.
- Mantener la app instalable (manifest + `sw.js`). Si cambia el shell, subir la versión de `CACHE` en `docs/sw.js`.

## Datos de oportunidades
Fuente principal: Supabase, proyecto `forja` (id `gfkiwldxxvffnkjcesws`), tablas `public.oportunidades` y `public.meta` (fila `clave='estado'`). Lectura pública con la clave publicable; escritura solo con el conector Supabase (la revisión diaria escribe ahí, no en el repo). `docs/data/oportunidades.json` y `docs/data/meta.json` son una copia de respaldo que la web usa si Supabase no responde.

Campos:
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
- Al terminar una revisión, actualizar `public.meta` (`ultima_revision`, `resumen` en una frase).

## Cuentas y datos privados
- Base común en `docs/js/forja.js` (cliente Supabase, sesión, navegación) y `docs/css/forja.css` (colores y piezas compartidas). Todo módulo nuevo usa `nav()` y `conSesion()`.
- Entrada sin contraseña: enlace al correo (Supabase Auth, magic link; plantilla por defecto en inglés porque editarla exige SMTP propio). El campo de código queda como opción secundaria. Al registrarse, un trigger crea el espacio personal del usuario.
- Tabla compartida: `precios_comunidad` (ver Cotizador).
- Tablas privadas: `espacios`, `miembros`, `proyectos`, `secciones`, `referentes`, `notas`, `cotizaciones`, `proyecto_oportunidades`. Todas con RLS por `privado.es_miembro(espacio_id)`: cada persona ve solo su espacio. Esquema completo en `supabase/esquema.sql`; todo cambio de esquema se aplica como migración y se refleja ahí.
- Los espacios están pensados para compartirse más adelante (equipo), pero hoy cada usuario tiene solo el suyo.

## Páginas
- `index.html`: portada pública que explica Forja, con una brújula de prueba (no guarda nada) y las oportunidades en vivo.
- `oportunidades.html`: calendario público de ferias, fondos y convocatorias.
- `proyectos.html` (Mi forja): inventario de proyectos (mosaico) y pestaña con todas las cotizaciones. Al plantar un proyecto se crean sus secciones según `PLANTILLA` del tipo.
- `proyecto.html?p=<id>`: cada proyecto en su página, con pestañas (`#taller`, `#referentes`, `#brujula`, `#costos`, `#oportunidades`, `#bitacora`).
  - Taller: secciones de texto (`public.secciones`) con preguntas guía de `docs/js/guias.js`; se pueden agregar, renombrar, ordenar y borrar; autoguardado y pantalla completa.
  - Referentes (`public.referentes`): solo enlaces y códigos, nunca archivos. Tipos: imagen, video (YouTube/Vimeo, se carga al tocar), audio (Spotify/SoundCloud), enlace, color (#hex) y cita.
  - Oportunidades: sugeridas según `areaDe(tipo, formato)`, más las generales y el resto; el proyecto sigue las que marque con estado.
- `biblia.html?p=<id>`: la "biblia" del proyecto, un documento imprimible (portada, índice, escritura, referentes, brújula, costos, oportunidades, bitácora) que se guarda como PDF con la impresión del navegador. Se eligen las partes a incluir. No hay exportación pensada para IA: la herramienta no asume que el usuario use IA.
- Brújula (`docs/js/brujula.js`): 6 ejes de 0 a 4 comparados con 11 formatos (novela, cuento, podcast, video para redes, cortometraje, largometraje, serie, animación, cómic, videojuego, juego de mesa). Encaje = 1 − suma de diferencias / 24. Siempre se presenta como referencia: el formato lo elige la persona, cualquiera de la lista.

## Cotizador (`docs/cotizador.html`)
- Una cotización por proyecto (índice único en `public.cotizaciones.proyecto_id`), con el estado completo en `datos` (JSON). Se crea desde la pestaña Costos del proyecto y se abre con `?c=<id>`; sin `?c` se va al listado. Arranca con los componentes de `INICIO` según el tipo de proyecto (catálogo `TIPOS` agrupado: juego de mesa, libro y cómic, producto, merch, servicios). Sin ejemplos precargados. Una cotización antigua guardada en localStorage (`forja-cotizador-v1`) se sube una vez a la cuenta. Nunca subir cotizaciones reales al repo.
- Dos pestañas: **Producción** (componentes y cotizaciones de proveedores → costo por unidad) y **Precio de venta** (`#venta`, estado en `datos.venta`): versiones con cantidades, descuento por cantidad sobre el total o por versión, costo fijo por versión, traslado y otros del lote, merma, empaque, materiales, minutos × valor hora, reinversión % y ganancia % sobre costo, comisión de venta, redondeo (exacto, $100, $500, terminado en 990) y precio de prueba. Muestra boleta, tabla por versión y mapa de calor versiones × cantidad. Fórmula del sugerido: costo real × (1 + (reinv + ganancia)/100) / (1 − comisión), redondeado.
- Componentes aún sin cotizar no cuentan en el precio (se avisa); los que tienen cotizaciones pero no alcanzan para la cantidad se cuentan como $0 con advertencia.
- Precios de la comunidad (`public.precios_comunidad`): cada cotización puede compartirse (opcional, desmarcado por defecto) sin nombre ni proyecto; se guarda el `id` compartido en la cotización (`compartido`) para poder retirarlo. Todos los usuarios con cuenta leen; solo el autor inserta y borra; la columna `autor` no es legible. Se muestran como referencia en cada componente del mismo tipo, con "Usar proveedor" para precargar el formulario.
- Cálculo: proveedor en Chile = precio + envío (+19% IVA si no lo incluye). Extranjero = (precio + envío) en USD × dólar; hasta USD 500 +19% IVA; sobre USD 500 +6% arancel y +19% IVA sobre ese total. Opción para mostrar costos sin IVA.
- Estimación de otras cantidades: ajuste lineal total = fijo + variable × cantidad por proveedor (mínimo 2 cotizaciones), solo dentro de 1/3 a 3 veces el rango cotizado. Fuera de ese rango (o con una sola cotización) se usa como tramo el precio por unidad de la cotización más grande que no supere la cantidad. Recargo opcional de tarjeta/banco (%) sobre todo lo que está en USD.
