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
- Tabla pública de solo lectura: `vitrinas_publicadas` (ver Vitrina).
- Tablas privadas: `espacios`, `miembros`, `proyectos`, `secciones`, `referentes`, `pizarras`, `vitrinas`, `notas`, `cotizaciones`, `proyecto_oportunidades`. Todas con RLS por `privado.es_miembro(espacio_id)`: cada persona ve solo su espacio. Esquema completo en `supabase/esquema.sql`; todo cambio de esquema se aplica como migración y se refleja ahí.
- Los espacios están pensados para compartirse más adelante (equipo), pero hoy cada usuario tiene solo el suyo.

## Planes y límites
- `espacios.plan` ('libre' | 'mas') y `plan_hasta`: solo los cambia el servidor o el conector (los usuarios solo pueden actualizar `nombre`). Para dar Forja Más a alguien: `update public.espacios set plan='mas', plan_hasta=<fecha o null> where creado_por=<user id>`.
- Límites del plan libre en `privado.limite()` y repetidos en `LIMITES` de `forja.js` (cambiar ambos juntos): 3 proyectos en curso (los archivados no cuentan), 20.000 palabras por proyecto (suma de sus secciones), 30 referentes por proyecto, 1 pizarra por proyecto (solo modo libre) con 20 tarjetas.
- Se aplican con triggers (`privado.t_proyectos`, `t_secciones`, `t_referentes`, `t_pizarras`, `t_lectura` en notas y cotizaciones), que lanzan `FORJA_LIMITE_PROYECTOS`, `FORJA_LIMITE_PALABRAS`, `FORJA_LIMITE_REFERENTES`, `FORJA_LIMITE_PIZARRAS`, `FORJA_LIMITE_TARJETAS`, `FORJA_SOLO_MAS`, `FORJA_PIZARRA_GRANDE` o `FORJA_SOLO_LECTURA`; la web traduce esos códigos con `limite(error)`.
- Solo lectura (plan libre): un proyecto archivado, o todos si hay más proyectos en curso que el límite (pasa al vencer Forja Más). Siempre se puede ver, exportar, archivar, borrar y recortar texto. Reactivar un archivado ocupa un cupo.
- La web muestra el cupo en Mi forja, el contador de palabras en el Taller y el de referentes, y bloquea los controles en solo lectura (`aplicarSoloLectura` en proyecto.html, `soloLectura` en cotizador.html).

## Páginas
Dos zonas con menú distinto (`forja.js`):
- **Sitio público** (`nav()`: Oportunidades, Planes, Guía y "Entrar", o "Ir a mi forja" si hay sesión): `index.html` (portada con brújula de prueba y oportunidades en vivo), `oportunidades.html` (calendario), `planes.html` (gratis vs. Forja Más), `entrar.html` (entrada por correo; vuelve a `?siguiente=`, solo a páginas `*.html` propias), `vitrina.html?v=<slug>` (vitrina pública de un proyecto, sin menú: solo la marca Forja y "Crea la vitrina de tu proyecto"), `guia.html` (guía; usa el menú de la cuenta si hay sesión).
- **Cuenta** (`navApp()`: Proyectos, Eventos, Cotizaciones, Mejorar plan, el botón de ayuda "?" y el menú de la cuenta con el plan, la guía, "Volver a ver las pistas" y cerrar sesión; en el celular el menú va abajo): toda página privada llama a `conSesion()`, que sin sesión redirige a `entrar.html?siguiente=<esta página>`. `planes.html` usa el menú de la cuenta si hay sesión.
- `proyectos.html`: inventario de proyectos (mosaico con estado y avance) con buscador, filtros por estado (los archivados se ocultan salvo que se elijan) y categoría, y orden; los filtros se recuerdan en localStorage. Al plantar un proyecto se crean sus secciones según `PLANTILLA` del tipo.
- `eventos.html`: línea de tiempo por mes con las fechas (abre, cierra, evento) de las oportunidades que siguen los proyectos, y sugerencias por proyecto según `areaDe`.
- `cotizaciones.html`: una tarjeta por cotización y, para los proyectos en curso sin cotización, un botón para crearla.

## Ayuda (`docs/js/ayuda.js`)
- Un solo contenido (`TEMAS`: qué es, para qué, pasos, consejo, gratis vs. Forja Más, a dónde ir, palabras clave) para tres lugares. Al cambiar o crear una herramienta, actualizar su tema aquí.
- `guia.html`: guía pública para explorar. El recorrido de una idea en 9 estaciones (plantar, Taller, referentes, Brújula, Pizarra, costos, oportunidades, Vitrina, biblia), cada una con su lámina y una demo hecha con las piezas reales (radar, pizarra, vitrina, plantillas, preguntas guía, calculadora de precio, fechas reales de oportunidades), sin guardar nada. Además: buscador "¿Qué quieres hacer?" (`buscar`), cuenta y datos (bitácora, eventos, planes, privacidad, app) y dudas comunes. Enlaces directos `guia.html#<tema>`.
- Botón "?" de `navApp()`: `abrirAyuda()` abre un cajón con el tema de la página actual (`temaDe(path, hash)`), buscador y otros temas. Se carga solo al pedirlo.
- Pistas: `pista(contenedor, tema)` muestra una nota corta la primera vez que se abre cada pestaña del proyecto, Eventos y el editor de la vitrina ("Cómo funciona" / "Entendido"; se recuerda en localStorage `forja-pistas`).
- Primeros pasos en `proyectos.html`: `sendero()` con 5 hitos (plantar, escribir en el Taller, un referente, una pizarra, publicar la vitrina) que se marcan solos con los datos; se puede ocultar (`forja-sendero-oculto`). "Volver a ver las pistas" (`reiniciarPistas`) muestra todo de nuevo. El último proyecto abierto se guarda en `forja-ultimo-proyecto` para que "Ir a…" lleve a él.

## Forja Más: próximamente
- El catálogo de herramientas de pago está en `docs/js/planes.js` (`FUNCIONES`, por áreas, y `PRECIO`). Todo se muestra como "Próximamente" con `proximamente(clave, título, texto)` y un botón "Avísame" (`activarAvisame`) que guarda el interés en `public.interes_funciones` (cada usuario ve y borra solo el suyo). Para saber qué construir primero: `select funcion, count(*) from public.interes_funciones group by 1 order by 2 desc`.
- Las funciones ya construidas llevan `listo: true` en `FUNCIONES` (y `libre` con lo que trae el plan gratis): `planes.html` las muestra como "Ya disponible". Hoy: las cuatro de Pizarras y la Vitrina (`pagina-publica`).
- Dónde aparecen las que faltan: `planes.html` (explorador por áreas, abre en Pizarras), debajo del Taller, en Costos, en Oportunidades, en Cotizaciones y en Eventos. Al construir una herramienta, se quita su tarjeta y se usa `plan().mas` para habilitarla.

- `proyecto.html?p=<id>`: cada proyecto en su página, con pestañas (`#taller`, `#referentes`, `#brujula`, `#pizarra`, `#costos`, `#oportunidades`, `#bitacora`, `#vitrina`).
  - Cabecera: categoría (`tipo`) y formato están ligados (`FORMATOS_DE`, `formatoCabe`, `tipoDe` en `guias.js`): elegir un formato de otra categoría (en la cabecera o en la Brújula) cambia la categoría; cambiar de categoría suelta el formato si no calza (y fija el único posible, como videojuego o juego de mesa). Estado con color propio (`--e-<estado>` en `forja.css`) y barra de avance.
  - Taller: secciones de texto (`public.secciones`) con preguntas guía de `docs/js/guias.js`; se pueden agregar, renombrar, ordenar y borrar; autoguardado y pantalla completa. Cada sección tiene `avance` (etapas prediseñadas 0/25/50/75/100, ajustable de a 5) y `peso` (prediseñado por guía en `PESO`, editable); el avance del proyecto es el promedio ponderado. Al cambiar categoría o formato, el Taller sugiere las secciones que faltan (`sugeridas(tipo, formato)` = plantilla del tipo + `PLANTILLA_FORMATO`), y además ofrece quitar las secciones que vinieron de la plantilla de otra categoría o formato y siguen vacías (sin texto ni avance), o que están repetidas y vacías; así cambiar de categoría varias veces no acumula secciones. Nunca borra una sección con texto o avance: si es de otra categoría queda en el índice bajo "Otras secciones". Siempre se confirma con un botón; "Ahora no" se recuerda por proyecto en localStorage.
  - Referentes (`public.referentes`): solo enlaces y códigos, nunca archivos. Tipos: imagen, video (YouTube/Vimeo, se carga al tocar), audio (Spotify/SoundCloud), enlace, color (#hex) y cita.
  - Oportunidades: sugeridas según `areaDe(tipo, formato)`, más las generales y el resto; el proyecto sigue las que marque con estado.
  - Pizarra (`docs/js/pizarra.js`, tabla `public.pizarras`, todo el estado en `datos`): modos `libre` (tarjetas, colores, flechas), `relaciones` (personajes y lazos con tipo: `LAZOS`), `mapa` (lugares, regiones redimensionables, rutas y una imagen de fondo por enlace, nunca archivo) y `escaleta` (escenas por actos, arrastrables, con minutos; "Ordenar el Taller así" reordena las secciones enlazadas). Las tarjetas pueden enlazar una sección o un referente ("Traer del proyecto") y abrirlo. Doble toque crea, el punto del borde une, rueda/pellizco acerca; deshacer/rehacer, teclado, pantalla completa, autoguardado. La vista (zoom y posición) se recuerda por pizarra en localStorage. Plan gratis: la primera pizarra libre es editable (hasta 20 tarjetas) y las demás quedan para ver o borrar; siempre se pueden quitar tarjetas. `estatica()` la dibuja para la biblia.
- Vitrina (pestaña `#vitrina` del proyecto, editor en `vitrina-editor.html?p=<id>`, página pública `vitrina.html?v=<slug>`, render compartido en `docs/js/vitrina.js`):
  - Regla de oro: nada del Taller, la bitácora ni las pizarras se publica solo. El editor guarda **copias** en `public.vitrinas.borrador` ("Traer desde el Taller", "Traer de tus referentes", "Partir desde la bitácora", pizarras copiadas con fecha y "Volver a copiar"). Lo que cambie después en el proyecto no aparece hasta traerlo de nuevo y publicar.
  - Secciones: portada (título, frase, firma, imagen por enlace con encuadre, tono `claro`/`noche`/`papel`, color de acento), la historia (capítulos), galería (imagen, video, audio, cita, enlace; los colores forman la paleta), el mundo (pizarras interactivas en solo lectura, Forja Más), novedades (diario público, aparte de la bitácora) y enlaces.
  - Publicar: `paraPublicar(borrador, plan)` quita tarjetas ocultas, notas si se eligió "solo títulos", enlaces internos de las tarjetas, bloques vacíos y, en el plan gratis, las pizarras. Luego `rpc publicar_vitrina(v, datos)` (security definer: miembro, tamaño, plan gratis sin pizarras y solo si el proyecto es editable) guarda en `vitrinas_publicadas` y deja la versión previa en `vitrinas.anterior`. `despublicar_vitrina(v)` siempre se puede. "Cargar la versión publicada anterior" la pone en el borrador para revisarla.
  - Sin cuenta solo se leen `slug`, `datos` y `publicado_en` de `vitrinas_publicadas`; los usuarios solo pueden escribir `slug` y `borrador` en `vitrinas` (permisos por columna). Cambiar la dirección actualiza la publicada (trigger) y el enlace anterior deja de funcionar.
  - Compartir: enlace y QR (qrcode-generator desde cdnjs) en PNG o SVG para ferias. La vista previa al compartir en redes es genérica porque GitHub Pages no arma páginas en el servidor.
  - `proyectos.html` marca "En vitrina" los proyectos publicados.
- `biblia.html?p=<id>`: la "biblia" del proyecto, un documento imprimible (portada, índice, escritura, referentes, brújula, pizarras, costos, oportunidades, bitácora) que se guarda como PDF con la impresión del navegador. Se eligen las partes a incluir. No hay exportación pensada para IA: la herramienta no asume que el usuario use IA.
- Brújula (`docs/js/brujula.js`): 6 ejes de 0 a 4 comparados con 11 formatos (novela, cuento, podcast, video para redes, cortometraje, largometraje, serie, animación, cómic, videojuego, juego de mesa). Encaje = 1 − suma de diferencias / 24. Mientras la persona no mueva los ejes, el radar muestra la configuración inicial (`base(tipo, formato)`: el perfil del formato elegido o, sin formato, `BASE_TIPO` de la categoría) y la lectura se calcula con ella; al ajustar, la base queda como línea punteada de referencia y hay un botón para volver a ella (`ejes = {}`). Siempre se presenta como referencia: el formato lo elige la persona, cualquiera de la lista.

## Cotizador (`docs/cotizador.html`)
- Una cotización por proyecto (índice único en `public.cotizaciones.proyecto_id`), con el estado completo en `datos` (JSON). Se crea desde la pestaña Costos del proyecto y se abre con `?c=<id>`; sin `?c` se va al listado. Arranca con los componentes de `INICIO` según el tipo de proyecto (catálogo `TIPOS` agrupado: juego de mesa, libro y cómic, producto, merch, servicios). Sin ejemplos precargados. Una cotización antigua guardada en localStorage (`forja-cotizador-v1`) se sube una vez a la cuenta. Nunca subir cotizaciones reales al repo.
- Arriba, una guía en vivo de 4 pasos (qué se fabrica → precios de proveedores → costo de una unidad → precio de venta). En la interfaz, los precios de proveedores se llaman "precios" y el documento completo "cotización", para no confundirlos.
- Dos pestañas: **Producción** (componentes y cotizaciones de proveedores → costo por unidad) y **Precio de venta** (`#venta`, estado en `datos.venta`): versiones con cantidades, descuento por cantidad sobre el total o por versión, costo fijo por versión, traslado y otros del lote, merma, empaque, materiales, minutos × valor hora, reinversión % y ganancia % sobre costo, comisión de venta, redondeo (exacto, $100, $500, terminado en 990) y precio de prueba. Muestra boleta, tabla por versión y mapa de calor versiones × cantidad. Fórmula del sugerido: costo real × (1 + (reinv + ganancia)/100) / (1 − comisión), redondeado.
- Componentes aún sin cotizar no cuentan en el precio (se avisa); los que tienen cotizaciones pero no alcanzan para la cantidad se cuentan como $0 con advertencia.
- Precios de la comunidad (`public.precios_comunidad`): cada cotización puede compartirse (opcional, desmarcado por defecto) sin nombre ni proyecto; se guarda el `id` compartido en la cotización (`compartido`) para poder retirarlo. Todos los usuarios con cuenta leen; solo el autor inserta y borra; la columna `autor` no es legible. Se muestran como referencia en cada componente del mismo tipo, con "Usar proveedor" para precargar el formulario.
- Cálculo: proveedor en Chile = precio + envío (+19% IVA si no lo incluye). Extranjero = (precio + envío) en USD × dólar; hasta USD 500 +19% IVA; sobre USD 500 +6% arancel y +19% IVA sobre ese total. Opción para mostrar costos sin IVA.
- Estimación de otras cantidades: ajuste lineal total = fijo + variable × cantidad por proveedor (mínimo 2 cotizaciones), solo dentro de 1/3 a 3 veces el rango cotizado. Fuera de ese rango (o con una sola cotización) se usa como tramo el precio por unidad de la cotización más grande que no supere la cantidad. Recargo opcional de tarjeta/banco (%) sobre todo lo que está en USD.
