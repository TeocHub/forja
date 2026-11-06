# Forja

Plataforma de Digital Monster para organizar proyectos creativos: oportunidades, proyectos, proveedores y campañas.

Web: https://teochub.github.io/forja/ (GitHub Pages, carpeta `docs/`)

## Qué tiene

Una portada pública que explica la herramienta, el calendario público de **Oportunidades**, y **Mi forja**, el espacio privado de cada persona: sus proyectos, cada uno en su propia página con escritura guiada según el tipo, referentes por enlace, brújula de formatos, cotización por componentes, oportunidades sugeridas, bitácora y una "biblia" exportable en PDF. La cotización de cada proyecto calcula el costo real de producción y el precio de venta, y quien quiera puede compartir sus precios (sin nombre) para que otros sepan dónde cotizar.

## Estructura

```
docs/                     sitio publicado en GitHub Pages (app instalable en el celular)
  index.html              portada pública
  oportunidades.html      ferias, fondos y convocatorias (público)
  proyectos.html          Mi forja: proyectos y cotizaciones (requiere cuenta)
  proyecto.html           página de cada proyecto (requiere cuenta)
  cotizador.html          cotización de un proyecto: producción y precio de venta (requiere cuenta)
  biblia.html             documento imprimible del proyecto (requiere cuenta)
  js/forja.js             sesión, navegación y utilidades
  js/brujula.js           brújula de formatos
  js/guias.js             tipos de proyecto y preguntas guía
  css/forja.css           estilos comunes
  data/                   copia de respaldo de los datos (la fuente principal es Supabase)
  manifest.webmanifest    datos para instalar la app
  sw.js                   caché para abrir sin conexión
supabase/esquema.sql      tablas y reglas de privacidad de la base de datos
CLAUDE.md                 reglas para Claude al trabajar en este repo
```

## Actualización automática

Una tarea programada de Claude revisa cada mañana (hora de Chile) fuentes oficiales y prensa y actualiza la base de datos de Supabase (proyecto `forja`). La web lee los datos desde ahí, así que los cambios se ven al instante sin commits. `docs/data/` guarda una copia de respaldo.

## Datos privados

Este repositorio es público y solo contiene código. Cada persona entra con su correo y sus proyectos y cotizaciones viven en Supabase, protegidos para que solo esa cuenta los vea. Por eso la misma web puede abrirse a otras personas sin mezclar datos.
