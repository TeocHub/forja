# Forja

Plataforma de Digital Monster para organizar proyectos creativos: oportunidades, proyectos, proveedores y campañas.

Web: https://teochub.github.io/forja/ (GitHub Pages, carpeta `docs/`)

## Módulos

| Módulo | Estado | Qué hace |
| --- | --- | --- |
| Oportunidades | Activo | Ferias, fondos y convocatorias en Chile con cuenta regresiva de postulación y evento |
| Proyectos | Activo | Ideas con bitácora, brújula de formatos, cotizaciones y oportunidades ligadas; privado por cuenta |
| Cotizador | Activo (v1) | Cotizaciones por componente, costo real puesto en Chile (IVA, arancel, dólar) y comparación por tirada; guardado en la cuenta |
| Financiamiento | Próximamente | Apoyo para fondos, Kickstarter y Patreon |
| Mercado y publicidad | Próximamente | Validación y canales de difusión |

## Estructura

```
docs/                     sitio publicado en GitHub Pages (app instalable en el celular)
  index.html              módulo Oportunidades (público)
  proyectos.html          módulo Proyectos (requiere cuenta)
  cotizador.html          módulo Cotizador (requiere cuenta)
  js/forja.js, css/forja.css  base común: sesión, navegación, estilos
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
