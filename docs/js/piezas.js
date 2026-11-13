// Catálogo de piezas que se cotizan (cotizador, Cotizaciones y precios de la comunidad).
// g: grupo en el selector; c: ejemplos para cada especificación; s: dónde cotizar; oculto: tipos viejos que ya no se ofrecen.
const BG=["BoardGamesMaker","https://boardgamesmaker.com/"],TGC=["The Game Crafter","https://www.thegamecrafter.com/"],PANDA=["Panda Game Manufacturing","https://pandagm.com/"],
    PN=["PrintNinja","https://printninja.com/"],QIN=["QinPrinting","https://www.qinprinting.com/"];
export const TIPOS={
  tablero:{g:"Juego de mesa",nombre:"Tablero",c:{medida:"Ej.: 50 × 50 cm, plegado en 4",cantidad:"Ej.: 1 por unidad",material:"Ej.: cartón gris 2 mm con papel impreso",impresion:"Ej.: 4/0",acabado:"Ej.: laminado mate, bordes envueltos"},s:[BG,TGC,PANDA]},
  cartas:{g:"Juego de mesa",nombre:"Cartas",c:{medida:"Ej.: 63 × 88 mm (póker)",cantidad:"Ej.: 90 cartas por unidad",material:"Ej.: cartulina 300 g con núcleo negro",impresion:"Ej.: 4/4",acabado:"Ej.: esquinas redondeadas, laminado lino"},s:[["MakePlayingCards","https://www.makeplayingcards.com/"],BG,TGC]},
  fichas:{g:"Juego de mesa",nombre:"Fichas y troquelados",c:{medida:"Ej.: círculos de 2,5 cm",cantidad:"Ej.: 60 fichas por unidad",material:"Ej.: cartón gris 2 mm",impresion:"Ej.: 4/4",acabado:"Ej.: troquelado en planchas"},s:[BG,TGC,PANDA]},
  figuras:{g:"Juego de mesa",nombre:"Figuras o miniaturas",c:{medida:"Ej.: 28 mm de alto",cantidad:"Ej.: 8 figuras por unidad",material:"Ej.: plástico PVC, resina o madera (meeples)",impresion:"Ej.: sin pintar / un color",acabado:"Ej.: molde propio o de catálogo"},s:[BG,PANDA]},
  dados:{g:"Juego de mesa",nombre:"Dados",c:{medida:"Ej.: 16 mm, 6 caras",cantidad:"Ej.: 5 por unidad",material:"Ej.: acrílico o madera",impresion:"Ej.: grabado con tinta",acabado:"Ej.: caras personalizadas"},s:[BG,TGC]},
  caja:{g:"Juego de mesa",nombre:"Caja",c:{medida:"Ej.: 15 × 22 × 4 cm",cantidad:"Ej.: 1 por unidad",material:"Ej.: cartón rígido 2 mm con papel impreso",impresion:"Ej.: 4/0",acabado:"Ej.: tapa y fondo, laminado mate, termoencogible"},s:[BG,TGC,["LongPack Games","https://www.longpackgames.com/"]]},
  libreto:{g:"Juego de mesa",nombre:"Reglamento o libreto",c:{medida:"Ej.: A5 (14,8 × 21 cm)",cantidad:"Ej.: 16 páginas",material:"Ej.: couché 150 g",impresion:"Ej.: 4/4",acabado:"Ej.: corchetes"},s:[PN,QIN,BG]},
  inserto:{g:"Juego de mesa",nombre:"Inserto o separador",c:{medida:"Ej.: a la medida de la caja",cantidad:"Ej.: 1 por unidad",material:"Ej.: cartón, plástico termoformado o EVA",impresion:"Ej.: sin impresión",acabado:"Ej.: compartimentos para cartas y fichas"},s:[BG,PANDA]},
  hojas:{g:"Juego de mesa",nombre:"Hojas o planillas",c:{medida:"Ej.: carta (21,6 × 27,9 cm)",cantidad:"Ej.: block de 50 hojas",material:"Ej.: bond 90 g",impresion:"Ej.: 1/0",acabado:"Ej.: encolado en block, prepicado"},s:[BG,TGC]},
  libro:{g:"Libro y cómic",nombre:"Impresión del libro",c:{medida:"Ej.: 14 × 21 cm",cantidad:"Ej.: 240 páginas",material:"Ej.: interior bond ahuesado 80 g, tapa 300 g",impresion:"Ej.: interior 1/1, tapa 4/0",acabado:"Ej.: tapa blanda, encuadernación hotmelt, solapas"},s:[PN,QIN]},
  comic:{g:"Libro y cómic",nombre:"Impresión del cómic o fanzine",c:{medida:"Ej.: 17 × 26 cm",cantidad:"Ej.: 48 páginas",material:"Ej.: couché 115 g, tapa 250 g",impresion:"Ej.: 4/4",acabado:"Ej.: corchetes o tapa dura"},s:[PN,QIN]},
  ilustracion:{g:"Libro y cómic",nombre:"Ilustración o arte",c:{medida:"Ej.: portada + 10 ilustraciones interiores",cantidad:"Ej.: por pieza o por paquete",material:"Ej.: digital, archivo en alta resolución",impresion:"Ej.: a color / blanco y negro",acabado:"Ej.: derechos de uso comercial"},s:[]},
  correccion:{g:"Libro y cómic",nombre:"Corrección o diagramación",c:{medida:"Ej.: 60.000 palabras",cantidad:"Ej.: una revisión completa",material:"Ej.: corrección de estilo y ortotipográfica",impresion:"Ej.: diagramación en InDesign",acabado:"Ej.: entrega en PDF para imprenta"},s:[]},
  marcapaginas:{g:"Libro y cómic",nombre:"Marcapáginas, láminas o postales",c:{medida:"Ej.: 5 × 15 cm",cantidad:"Ej.: 1 por libro",material:"Ej.: cartulina 300 g",impresion:"Ej.: 4/4",acabado:"Ej.: laminado mate"},s:[]},
  envase:{g:"Producto",nombre:"Envase",c:{medida:"Ej.: frasco de vidrio 200 ml",cantidad:"Ej.: 1 por producto",material:"Ej.: vidrio ámbar, lata, cartón",impresion:"Ej.: serigrafía o sin impresión",acabado:"Ej.: tapa metálica"},s:[]},
  etiqueta:{g:"Producto",nombre:"Etiqueta",c:{medida:"Ej.: 6 × 4 cm",cantidad:"Ej.: 1 por producto",material:"Ej.: papel adhesivo o vinilo",impresion:"Ej.: 4/0",acabado:"Ej.: troquelado, resistente al agua"},s:[]},
  empaque:{g:"Producto",nombre:"Empaque o caja",c:{medida:"Ej.: 10 × 10 × 12 cm",cantidad:"Ej.: 1 por producto",material:"Ej.: cartulina kraft",impresion:"Ej.: 1/0 o timbre",acabado:"Ej.: con ventana, cinta"},s:[]},
  materia:{g:"Producto",nombre:"Materia prima",c:{medida:"Ej.: cera de abeja",cantidad:"Ej.: 150 g por producto",material:"Ej.: calidad, origen",impresion:"",acabado:"Ej.: proveedor local o importado"},s:[]},
  sticker:{g:"Merch",nombre:"Stickers",c:{medida:"Ej.: 7 × 7 cm",cantidad:"Ej.: 1 hoja de 6",material:"Ej.: vinilo",impresion:"Ej.: 4/0",acabado:"Ej.: troquel al contorno, laminado"},s:[]},
  pin:{g:"Merch",nombre:"Pines o llaveros",c:{medida:"Ej.: 3 cm",cantidad:"Ej.: 1",material:"Ej.: metal esmaltado o acrílico",impresion:"Ej.: esmalte duro",acabado:"Ej.: cierre mariposa"},s:[]},
  peluche:{g:"Merch",nombre:"Peluches",c:{medida:"Ej.: 20 cm de alto",cantidad:"Ej.: 1",material:"Ej.: minky o felpa, relleno de poliéster",impresion:"Ej.: bordado, sin piezas pequeñas",acabado:"Ej.: etiqueta cosida, bolsa individual"},s:[]},
  mousepad:{g:"Merch",nombre:"Mousepads",c:{medida:"Ej.: 25 × 21 cm o 80 × 30 cm",cantidad:"Ej.: 1",material:"Ej.: tela con base de goma 3 mm",impresion:"Ej.: sublimación a todo color",acabado:"Ej.: bordes cosidos"},s:[]},
  taza:{g:"Merch",nombre:"Tazas o vasos",c:{medida:"Ej.: 11 oz",cantidad:"Ej.: 1",material:"Ej.: cerámica blanca o enlozada",impresion:"Ej.: sublimación",acabado:"Ej.: caja individual"},s:[]},
  lamina:{g:"Merch",nombre:"Láminas o prints",c:{medida:"Ej.: A4 o A3",cantidad:"Ej.: 1",material:"Ej.: papel fotográfico o hilado 250 g",impresion:"Ej.: inyección de tinta",acabado:"Ej.: firmada y numerada"},s:[]},
  polera:{g:"Merch",nombre:"Poleras o textiles",c:{medida:"Ej.: tallas S a XL",cantidad:"Ej.: 1",material:"Ej.: algodón 180 g",impresion:"Ej.: serigrafía 2 colores, DTF",acabado:"Ej.: etiqueta propia"},s:[]},
  servicio:{g:"Servicios",nombre:"Servicio",c:{medida:"Ej.: música original, doblaje, programación",cantidad:"Ej.: 5 temas de 2 minutos",material:"Ej.: qué se entrega",impresion:"Ej.: formato de entrega",acabado:"Ej.: derechos de uso"},s:[]},
  stand:{g:"Servicios",nombre:"Stand o exhibición",c:{medida:"Ej.: mesa de 2 × 1 m",cantidad:"Ej.: 1 por feria",material:"Ej.: pendón roller, mantel impreso",impresion:"Ej.: 4/0",acabado:"Ej.: estructura reutilizable"},s:[]},
  otro:{g:"Otros",nombre:"Componente",c:{medida:"Medidas o formato",cantidad:"Cuántos por unidad",material:"Material",impresion:"Impresión o técnica",acabado:"Acabado o detalle"},s:[]}
};
// Viejos tipos que ya no existen en el catálogo se muestran como el más parecido.
TIPOS.disco={g:"Juego de mesa",nombre:"Disco decodificador",c:TIPOS.fichas.c,s:[BG,TGC,PANDA],oculto:true};
// Nombre visible de una pieza (los tipos desconocidos se muestran como «Componente»).
export const nombrePieza = (k) => (TIPOS[k] || TIPOS.otro).nombre;
