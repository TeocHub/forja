# Forja

Plataforma de Digital Monster para organizar proyectos creativos: oportunidades, proyectos, proveedores y campañas.

Web: https://forja.digitalmonster.cl/ (GitHub Pages, carpeta `docs/`; la dirección vieja teochub.github.io/forja/ redirige sola)

## Qué tiene

Una portada pública que explica la herramienta, el calendario público de **Oportunidades**, y **Mi forja**, el espacio privado de cada persona: un **Semillero** de ideas de una frase, sus proyectos, cada uno en su propia página con una ruta de etapas (mapa de la idea, estructuras, obras analizadas), escritura guiada según el tipo, referentes por enlace, brújula de formatos, cotización por componentes, oportunidades sugeridas, bitácora y una "biblia" exportable en PDF. La cotización de cada proyecto calcula el costo real de producción y el precio de venta, y quien quiera puede compartir sus precios (sin nombre) para que otros sepan dónde cotizar.

## Estructura

```
docs/                     sitio publicado en GitHub Pages (app instalable en el celular)
  index.html              portada pública
  vitrina/            vitrina pública de un proyecto (?v=direccion), con "Reportar esta vitrina"
  explorar/           directorio público de vitrinas (las que sus dueños eligen mostrar)
  terminos/ privacidad/ normas/   términos de uso, política de privacidad y normas de la comunidad
  cuenta/             mi cuenta: avisos, escríbenos, reportes, descargar datos y borrar cuenta
  admin/              moderación (solo el equipo de Forja)
  guia/               guía de Forja con demos para probar
  vitrina/editar/     editor de la vitrina (requiere cuenta)
  planes/             planes (gratis y Forja Más, próximamente)
  entrar/             entrada por correo
  eventos/            fechas de lo que siguen tus proyectos (requiere cuenta)
  cotizaciones/       todas las cotizaciones (requiere cuenta)
  oportunidades/      ferias, fondos y convocatorias (público)
  proyectos/          proyectos (requiere cuenta)
  semillero/          ideas sueltas de una frase, personales y del equipo (requiere cuenta)
  proyecto/           página de cada proyecto (requiere cuenta)
  cotizador/          cotización de un proyecto: producción y precio de venta (requiere cuenta)
  biblia/             documento imprimible del proyecto (requiere cuenta)
  js/forja.js             sesión, navegación y utilidades
  js/brujula.js           brújula de formatos
  js/guias.js             tipos de proyecto y preguntas guía
  js/planes.js            catálogo de Forja Más
  js/pizarra.js           pizarras: libre, relaciones, escaleta y mapa
  js/vitrina.js           vitrina pública: datos, filtro al publicar y diseño
  js/ayuda.js             ayuda: temas, cajón «?», pistas y primeros pasos
  js/ruta.js              ruta del proyecto: etapas, técnicas y lo que sigue
  js/semillero.js         semillero: detonantes y plantar un proyecto
  js/obras.js             analizar una obra: ficha, citas APA/MLA/Chicago y preguntas
  js/mapa.js              mapa de la idea: foco y ramas por categoría
  js/estructura.js        estructura: momentos, modelos y su dibujo
  js/legal.js             documentos legales: menú, versión e índice
  css/forja.css           estilos comunes
  css/legal.css           estilos de los documentos legales
  data/                   copia de respaldo de los datos (la fuente principal es Supabase)
  manifest.webmanifest    datos para instalar la app
  sw.js                   caché para abrir sin conexión (precarga solo lo esencial)
  *.html (raíz)           redirecciones de direcciones antiguas
supabase/esquema.sql      tablas y reglas de privacidad de la base de datos
CLAUDE.md                 reglas para Claude al trabajar en este repo
```

## Actualización automática

Una tarea programada de Claude revisa cada mañana (hora de Chile) fuentes oficiales y prensa y actualiza la base de datos de Supabase (proyecto `forja`). La web lee los datos desde ahí, así que los cambios se ven al instante sin commits. `docs/data/` guarda una copia de respaldo.

## Datos privados

Este repositorio es público y solo contiene código. Cada persona entra con su correo y sus proyectos y cotizaciones viven en Supabase, protegidos para que solo esa cuenta los vea. Por eso la misma web puede abrirse a otras personas sin mezclar datos.
