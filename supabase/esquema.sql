-- Forja · esquema de datos privados (Supabase, proyecto "forja").
-- Solo estructura y reglas de acceso; ningún dato. Aplicado como migraciones:
-- espacios_privados_proyectos, es_miembro_fuera_de_api y
-- secciones_referentes_cotizacion_unica, precios_comunidad y
-- precios_comunidad_ocultar_autor, secciones_avance_peso limites_plan_libre e interes_funciones (2026-11-06).

-- Espacios: cada usuario tiene uno propio (pensados para compartirse más adelante).
create table public.espacios(
  id uuid primary key default gen_random_uuid(),
  nombre text not null default 'Mi espacio',
  creado_por uuid not null references auth.users(id) on delete cascade,
  creado_en timestamptz not null default now()
);
create table public.miembros(
  espacio_id uuid not null references public.espacios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rol text not null default 'miembro' check (rol in ('dueno','miembro')),
  creado_en timestamptz not null default now(),
  primary key(espacio_id,user_id)
);

-- Función fuera de la API pública: ¿el usuario actual pertenece a este espacio?
create schema privado;
create function privado.es_miembro(e uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.miembros m where m.espacio_id=e and m.user_id=(select auth.uid()));
$$;

-- Al registrarse, trigger en auth.users crea el espacio personal (función public.crear_espacio_personal).

create table public.proyectos(
  id uuid primary key default gen_random_uuid(),
  espacio_id uuid not null references public.espacios(id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 160),
  tipo text not null default 'historia' check (tipo in ('historia','videojuego','juegomesa','contenido','producto','otro')),
  estado text not null default 'semilla' check (estado in ('semilla','desarrollo','pausa','listo','archivado')),
  resumen text,
  ejes jsonb not null default '{}'::jsonb,   -- brújula: {agencia, reglas, interior, imagen, movimiento, escala} de 0 a 4
  formato text,                              -- formato elegido: novela | comic | animacion | video | videojuego | mesa
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create table public.notas(        -- bitácora de cada proyecto
  id uuid primary key default gen_random_uuid(),
  espacio_id uuid not null references public.espacios(id) on delete cascade,
  proyecto_id uuid not null references public.proyectos(id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 20000),
  autor uuid default auth.uid() references auth.users(id) on delete set null,
  creado_en timestamptz not null default now()
);
create table public.cotizaciones(
  id uuid primary key default gen_random_uuid(),
  espacio_id uuid not null references public.espacios(id) on delete cascade,
  proyecto_id uuid references public.proyectos(id) on delete set null,
  nombre text not null default 'Sin nombre',
  datos jsonb not null default '{}'::jsonb,  -- estado completo del cotizador
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create table public.proyecto_oportunidades(
  proyecto_id uuid not null references public.proyectos(id) on delete cascade,
  oportunidad_id text not null references public.oportunidades(id) on delete cascade,
  espacio_id uuid not null references public.espacios(id) on delete cascade,
  estado text not null default 'interesa' check (estado in ('interesa','postulando','postulado','aceptado','descartado')),
  creado_en timestamptz not null default now(),
  primary key(proyecto_id,oportunidad_id)
);

create table public.secciones(     -- escritura guiada del proyecto
  id uuid primary key default gen_random_uuid(),
  espacio_id uuid not null references public.espacios(id) on delete cascade,
  proyecto_id uuid not null references public.proyectos(id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 120),
  guia text,                       -- clave de la guía de preguntas (docs/js/guias.js)
  texto text not null default '' check (char_length(texto) <= 200000),
  orden int not null default 0,
  avance int not null default 0 check (avance between 0 and 100),  -- etapa de la sección
  peso int not null default 10 check (peso between 0 and 100),     -- cuánto pesa en el avance del proyecto
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create table public.referentes(    -- solo enlaces y códigos, nunca archivos
  id uuid primary key default gen_random_uuid(),
  espacio_id uuid not null references public.espacios(id) on delete cascade,
  proyecto_id uuid not null references public.proyectos(id) on delete cascade,
  tipo text not null check (tipo in ('imagen','video','audio','enlace','color','cita')),
  valor text not null check (char_length(valor) between 1 and 4000),
  titulo text check (char_length(titulo) <= 200),
  nota text check (char_length(nota) <= 4000),
  creado_en timestamptz not null default now()
);
create unique index cotizaciones_un_proyecto on public.cotizaciones(proyecto_id) where proyecto_id is not null;

-- RLS en todas: solo los miembros del espacio ven y modifican sus filas.
--   espacios: ver y renombrar si privado.es_miembro(id)
--   miembros: ver si privado.es_miembro(espacio_id) (altas solo desde el servidor)
--   proyectos, secciones, referentes, notas, cotizaciones, proyecto_oportunidades:
--     select / insert / update / delete si privado.es_miembro(espacio_id)
-- Triggers: actualizado_en automático; notas, cotizaciones y seguimientos no pueden
-- apuntar a un proyecto de otro espacio (public.mismo_espacio).
-- El rol anon no tiene acceso a ninguna de estas tablas.

-- Precios compartidos por la comunidad (opcional por cotización, sin nombre ni proyecto).
create table public.precios_comunidad(
  id uuid primary key default gen_random_uuid(),
  autor uuid not null default auth.uid() references auth.users(id) on delete cascade,
  componente text not null check (componente ~ '^[a-z]{2,20}$'),
  proveedor text not null check (char_length(proveedor) between 1 and 120),
  enlace text check (enlace is null or (enlace ~ '^https://' and char_length(enlace) <= 500)),
  origen text not null check (origen in ('chile','extranjero')),
  moneda text not null check (moneda in ('CLP','USD')),
  cantidad numeric not null check (cantidad > 0 and cantidad <= 10000000),
  precio numeric not null check (precio >= 0 and precio <= 1000000000),
  envio numeric not null default 0 check (envio >= 0 and envio <= 1000000000),
  incluye_iva boolean not null default false,
  especificaciones text check (char_length(especificaciones) <= 600),
  plazo text check (char_length(plazo) <= 80),
  creado_en timestamptz not null default now()
);
-- RLS: cualquier usuario con cuenta lee; insertar y borrar solo el autor.
-- La columna autor no se puede leer (permiso de select por columnas, sin autor).

-- Planes: espacios.plan ('libre' | 'mas') y espacios.plan_hasta; los usuarios solo pueden actualizar espacios.nombre.
-- Límites del plan libre (privado.limite): 3 proyectos en curso, 20.000 palabras por proyecto, 30 referentes por proyecto.
-- Triggers before insert/update: proyectos (privado.t_proyectos), secciones (t_secciones), referentes (t_referentes),
-- notas y cotizaciones (t_lectura). Errores: FORJA_LIMITE_PROYECTOS, FORJA_LIMITE_PALABRAS, FORJA_LIMITE_REFERENTES, FORJA_SOLO_LECTURA.
-- Un proyecto es editable si el espacio es Más, o si no está archivado y el espacio no supera los proyectos en curso.

-- "Avísame" de las funciones de Forja Más: interes_funciones(user_id, funcion, creado_en), PK (user_id, funcion).
-- RLS: cada usuario ve, crea y borra solo sus filas.

-- Pizarras (2026-11-06): tableros por proyecto; todo el contenido en datos (jsonb), ver docs/js/pizarra.js.
create table public.pizarras(
  id uuid primary key default gen_random_uuid(),
  espacio_id uuid not null references public.espacios(id) on delete cascade,
  proyecto_id uuid not null references public.proyectos(id) on delete cascade,
  nombre text not null default 'Pizarra' check (char_length(nombre) between 1 and 120),
  modo text not null default 'libre' check (modo in ('libre','relaciones','escaleta','mapa')),
  datos jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
-- RLS por privado.es_miembro(espacio_id) (ver, crear, editar, borrar). Triggers: mismo_espacio, tocar_actualizado
-- y privado.t_pizarras: plan libre = 1 pizarra por proyecto, solo modo libre, 20 tarjetas (privado.limite 'pizarras'
-- y 'tarjetas'); lo que sobra al vencer Forja Más queda en solo lectura, salvo quitar tarjetas o borrar.
-- Para todos: hasta 1000 tarjetas y 1,5 MB por pizarra (FORJA_PIZARRA_GRANDE).
