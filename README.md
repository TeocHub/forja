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
  data/oportunidades.json datos de oportunidades (se actualiza a diario)
  data/meta.json          fecha y resumen de la última revisión
  manifest.webmanifest    datos para instalar la app
  sw.js                   caché para abrir sin conexión
CLAUDE.md                 reglas para Claude al trabajar en este repo
```

## Actualización automática

Una tarea programada de Claude revisa cada mañana (hora de Chile) fuentes oficiales y prensa, actualiza `docs/data/oportunidades.json` y hace commit directo a `main`. GitHub Pages republica el sitio solo.

## Datos privados

Este repositorio es público. Nada privado (cotizaciones reales, datos de clientes, cuentas) se guarda aquí; eso irá en Supabase cuando se construyan los módulos que lo necesiten.
