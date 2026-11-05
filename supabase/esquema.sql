-- Forja · esquema de datos privados (Supabase, proyecto "forja").
-- Solo estructura y reglas de acceso; ningún dato. Aplicado como migraciones:
-- espacios_privados_proyectos y es_miembro_fuera_de_api (2026-11-05).

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

-- RLS en todas: solo los miembros del espacio ven y modifican sus filas.
--   espacios: ver y renombrar si privado.es_miembro(id)
--   miembros: ver si privado.es_miembro(espacio_id) (altas solo desde el servidor)
--   proyectos, notas, cotizaciones, proyecto_oportunidades:
--     select / insert / update / delete si privado.es_miembro(espacio_id)
-- Triggers: actualizado_en automático; notas, cotizaciones y seguimientos no pueden
-- apuntar a un proyecto de otro espacio (public.mismo_espacio).
-- El rol anon no tiene acceso a ninguna de estas tablas.
