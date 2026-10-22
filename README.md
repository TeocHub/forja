# Forja

Plataforma de Digital Monster para organizar proyectos creativos: oportunidades, proyectos, proveedores y campañas.

Web: https://teochub.github.io/forja/ (GitHub Pages, carpeta `docs/`)

## Módulos

| Módulo | Estado | Qué hace |
| --- | --- | --- |
| Oportunidades | Activo | Ferias, fondos y convocatorias en Chile con cuenta regresiva de postulación y evento |
| Proyectos y entregas | Próximamente | Tareas, fechas y checklist por proyecto y feria |
| Cotizador | Activo (v1) | Cotizaciones por componente, costo real puesto en Chile (IVA, arancel, dólar) y comparación por tirada; datos solo en el navegador |
| Financiamiento | Próximamente | Apoyo para fondos, Kickstarter y Patreon |
| Mercado y publicidad | Próximamente | Validación y canales de difusión |

## Estructura

```
docs/                     sitio publicado en GitHub Pages (app instalable en el celular)
  index.html              módulo Oportunidades
  cotizador.html          módulo Cotizador (datos en localStorage, con respaldo JSON)
  data/                   copia de respaldo de los datos (la fuente principal es Supabase)
  manifest.webmanifest    datos para instalar la app
  sw.js                   caché para abrir sin conexión
CLAUDE.md                 reglas para Claude al trabajar en este repo
```

## Actualización automática

Una tarea programada de Claude revisa cada mañana (hora de Chile) fuentes oficiales y prensa y actualiza la base de datos de Supabase (proyecto `forja`). La web lee los datos desde ahí, así que los cambios se ven al instante sin commits. `docs/data/` guarda una copia de respaldo.

## Datos privados

Este repositorio es público. Nada privado (cotizaciones reales, datos de clientes, cuentas) se guarda aquí; eso irá en Supabase cuando se construyan los módulos que lo necesiten.
