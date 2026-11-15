# Forja · reglas visuales

Cómo se ve Forja. Toda página, herramienta o pieza nueva sigue este archivo. Tono: **taller sobrio**. Grafito tranquilo; las piezas de taller (regla, boletos, timbres, etiquetas) hablan solas. Nada de movimiento extra ni adornos nuevos.

Todo lo de aquí vive en `docs/css/forja.css` (estilos) y `docs/js/forja.js` (piezas). Si algo no existe, se crea primero ahí como pieza común y después se usa. Una página solo agrega lo que es suyo.

## Colores

Forja es blanco, negro y grafito. El color lo pone el proyecto, según su categoría. Nunca se escribe un color a mano en una página: siempre una variable de `forja.css`. El modo oscuro se escribe una sola vez, en el `@media (prefers-color-scheme:dark)` de `forja.css`.

| Variable | Para qué | Claro | Oscuro |
| --- | --- | --- | --- |
| `--bg` | fondo de la página | #F4F4F2 | #121212 |
| `--card` | hoja (lo que va sobre la mesa) | #FFFFFF | #1C1C1C |
| `--fg` | tinta | #161616 | #F2F2F0 |
| `--muted` | lápiz (texto suave) | #575757 | #A8A8A4 |
| `--line` | línea fina | #DEDEDA | #2E2E2E |
| `--mesa` | fondo de grupo, vacíos, «próximamente» | #ECECE9 | #171717 |
| `--suave` | fondo de lo activo | #EAEAE6 | #262626 |
| `--field` | campos | #FAFAF8 | #171717 |
| `--btn` / `--btn-tx` | botón lleno | #161616 / #FFFFFF | #F2F2F0 / #121212 |

**Categorías** (`--t-historia`, `--t-comic`, `--t-videojuego`, `--t-juegomesa`, `--t-contenido`, `--t-producto`, `--t-otro`). `--cat` es la del proyecto abierto (`colorDe(tipo)`) o la del último que se abrió. `--cat-soft` es su tono pálido.

**Estados**, propios y de ninguna categoría: `--good` musgo (disponible, en curso, listo), `--warn` ocre (abre pronto, revisar), `--bad` ladrillo (cierra, error, quitar). Cada uno tiene su `-soft`. Un estado nunca se dice solo con color: va con su ícono o su palabra.

**Fijos** (no cambian con el modo oscuro): `--papel`, `--papel-tinta`, `--papel-suave`, `--papel-linea`, `--papel-sello` (biblia, carta del boletín, impresión), `--blanco` y `--negro` (texto sobre fotos o sobre un color de categoría, QR, marcos), `--velo` (fondo de diálogos y sobre imágenes), `--sombra` y `--sombra-alta`.

**Gráficos** (cotizador y demos de la guía): `--g-prod`, `--g-extra`, `--g-time`, `--g-fee`, `--g-reinv`, `--g-gain`.

Los únicos colores escritos a mano fuera de `forja.css` son **datos**: los que elige la persona (paletas de la pizarra, color de una ficha, referentes, acento de la vitrina) y los dibujos SVG para imprimir. Las vitrinas públicas (`.vt`, `vitrina.js`) y los correos (`correos.js`) conservan su propio estilo.

Detalles: lo seleccionado toma `--cat` al 25 % (`::selection`), el cursor de los campos es `--cat` (`caret-color`) y las barras de desplazamiento son finas y grafito. Ya están en `forja.css`; no se repiten.

## Radios

Tres y nada más:

- `--r-s` (4px): boletos, timbres, campos, etiquetas.
- `--r-m` (10px): botones y lo que se toca.
- `0`: superficies grandes (hojas, paneles, diálogos, avisos).

Se permite `50%` solo para círculos (avatar, botón «?», punto). Un radio con un número escrito (`12px`, `999px`) es un error.

## Letras

| Letra | Para qué |
| --- | --- |
| Mona Sans 800, `font-stretch:110%` (`--f-display`) | títulos; la palabra «forja» en minúscula al 115 % |
| Atkinson Hyperlegible (`--f-body`) | todo el texto |
| Geist Mono (`--f-num`) | **solo** números y datos: «Etapa 4 de 7», días, precios, N.º del boleto, fechas |

Ocho tamaños: **12 · 13 · 15 · 17 · 20 · 26 · 36 · 56** px (y un `clamp()` para el titular de la portada). Nada de medios píxeles. Nada bajo 12px; en la app (cuenta y proyecto), nada bajo 13px. Los campos van en 17px (el celular no se acerca solo).

## Piezas

Están en `forja.js` con su estilo en `forja.css`. Se usan, no se copian.

- **La F-regla** (`marca()`): el logo. Sus siete marcas son las siete etapas; la chispa al pie es la idea.
- **F de avance** (`fAvance(etapa)`) y **regla de avance** (`regla(etapa, nombres)`): dónde va un proyecto. Con `abierta: true` va sin caja: una línea de base que se llena del color del proyecto.
- **La chispa** (`chispa()`): dónde estás ahora. Siempre una sola.
- **Etiqueta colgante** (`etiqueta(tipo, nombre)`, `.fx-etq`): la categoría.
- **Boleto numerado** (`boleto(n, ico, nombre)`, `.fx-boleto`): una herramienta. Su corte punteado a la izquierda es el único punteado de Forja.
- **Timbre** (`.fx-estado.e-<estado>`, y los sellos de Moderación, Planes y documentos): un estado, con su dibujo. Va **derecho**. Solo el que acaba de cambiar cae girado: `timbrar(el)` después de pintarlo (250 ms).
- **Tira de boletos** (`tira([{cuerpo, pronto}])`, `.fx-tira`): boletos pegados, separados por su corte; un tramo `pronto` va en gris. Es una sola pieza, no una grilla de tarjetas. La usan los planes de la portada.
- **Regla de fechas** (`fechasDe(ops)`, `rangoFechas(f)`, `reglaFechas(f, rango, {ventana})`, `leyendaFechas(f)`; `.fx-fechas`): línea delgada desde hoy con un punto por fecha (en curso musgo, cierra ladrillo, abre ocre, evento grafito). Alto fijo con 4 o con 40 fechas. La usan la portada y Oportunidades.
- **Siete marcas** (`.fx-marcas`, `.fx-marcas.cat`): para marcar una sección nueva, en vez de una etiqueta en mayúsculas.
- **Íconos**: `ico(k)` con `ICONOS` (trazo, viewBox 24). Dentro de un texto o desde CSS: `<span class="fx-i" style="--i:var(--i-listo)"></span>` (`--i-listo`, `--i-cerrar`, `--i-chispa`, `--i-alerta`, `--i-nota`, `--i-play`, `--i-fichas`). Un ícono nuevo se suma a `ICONOS` y, si se usa desde CSS, también como `--i-…`.
- **Vacío** (`.fx-empty`): fondo `--mesa`, sin borde. **Próximamente** (`.fx-pronto`): un boleto sin cortar, en gris. **Aviso** (`.fx-aviso`): se distingue por su ícono y su texto.
- **Botones**: `.fx-btn` / `.fx-primary` (lleno, `--btn`), `.fx-btn.borde`. Mínimo **44px** de alto para el dedo. Un botón lleno usa `--btn`/`--btn-tx`, nunca `color:#fff` sobre un color.

## Cajas y espacio

Las secciones se separan con espacio (56–80px) y con el fondo `--mesa`, no con bordes. Una hoja (`--card`) sobre la mesa no necesita borde. Una caja con borde solo cuando es algo que se toca o se mueve (botón, campo, boleto, tarjeta que se arrastra).

Un dato que cambia (fechas, avance, cuántos) se muestra con una pieza (regla, talón, timbre) antes que con una frase larga. Una pieza con datos que cambian mide lo mismo con 4 o con 40 cosas: probarla con la cantidad real.

## Lo prohibido

- Etiquetas en mayúsculas sobre los títulos (`text-transform:uppercase` solo en timbres).
- Cajas con borde para separar secciones.
- Grillas de tarjetas iguales.
- `border-left` grueso (3px o más) en avisos y tarjetas.
- Punteados fuera del corte del boleto (salvo líneas de dibujo que significan algo, como un lazo secreto).
- Timbres girados quietos y elementos girados de adorno.
- Colores escritos a mano (fuera de los datos de arriba).
- Radios o tamaños de letra fuera de la escala.
- Emojis o letras como íconos (✓ ✕ ✦ ♪ ▶ ×): siempre un ícono SVG.
- Botones bajo 44px; letra bajo 12px.
- Contadores que puedan quedar en 0 en grande.
- Piezas que crecen sin tope con la cantidad de datos.
- La violeta, el fucsia, el amarillo o las letras de Digital Monster en la marca de Forja.

## Antes de publicar

1. Revisar la página nueva con `/anthropic-skills:impeccable critique` o, como mínimo, buscar en el código lo de «Lo prohibido» (`uppercase`, `dashed`, `rotate(`, `border-left:`, `#` de colores, `border-radius:` con números, `font-size:` fuera de la escala).
2. Probar en computador, tablet y celular, en claro y oscuro.
3. Si aparece algo de la lista de prohibidos, no se publica.
