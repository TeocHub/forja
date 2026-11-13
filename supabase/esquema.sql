-- Forja · esquema de la base (Supabase, proyecto "forja", id gfkiwldxxvffnkjcesws).
-- Sacado de la base en vivo el 2026-11-11 (y al día con las migraciones taller_fichas_enlazados y pizarra_fichas_enlazadas del 2026-11-12): es la foto completa de la estructura y las reglas de acceso, sin ningún dato
-- (ni oportunidades, ni cuentas, ni privado.config, que guarda la clave de la cola de correos y se genera dentro de la base).
-- La fuente sigue siendo la base: todo cambio se aplica como migración y después se vuelve a sacar este archivo.
-- Orden: extensiones y esquemas, tablas, funciones, restricciones, índices, triggers, reglas (RLS) y permisos.
-- Lo propio de Supabase (auth, storage, realtime) no está aquí; los triggers sobre auth.users sí.

set check_function_bodies = off;  -- las funciones se pueden crear en cualquier orden entre ellas

-- Extensiones que usa el proyecto: pg_cron 1.6.4, pg_net 0.20.4, pg_stat_statements 1.11, pgcrypto 1.3, plpgsql 1.0, supabase_vault 0.3.1, unaccent 1.1, uuid-ossp 1.1
create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists unaccent with schema extensions;

create schema if not exists privado;
revoke all on schema privado from public;
grant usage on schema privado to authenticated;  -- solo para que las reglas puedan llamar a sus funciones; nada en privado es legible directo


-- ===================== FUNCIÓN QUE USA UNA TABLA (búsqueda de vitrinas_publicadas) =====================

CREATE OR REPLACE FUNCTION privado.sin_tildes(t text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
 SET search_path TO ''
AS $function$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(t, '')));
$function$
;

-- ===================== TABLAS =====================

create sequence if not exists public.espacio_registro_id_seq;
create table public.aceptaciones(
  user_id uuid default auth.uid() not null,
  documento text not null,
  version text not null,
  aceptado_en timestamp with time zone default now() not null
);

create table public.avisos(
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  tipo text default 'info'::text not null,
  titulo text not null,
  texto text not null,
  enlace text,
  leido boolean default false not null,
  creado_en timestamp with time zone default now() not null
);

create table public.colecciones(
  id uuid default gen_random_uuid() not null,
  espacio_id uuid not null,
  proyecto_id uuid not null,
  plantilla text not null,
  nombre text not null,
  campos jsonb default '[]'::jsonb not null,
  orden integer default 0 not null,
  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null
);

create table public.correo_prefs(
  user_id uuid default auth.uid() not null,
  boletin boolean default false not null,
  funciones boolean default true not null,
  vitrinas boolean default true not null,
  boletin_desde timestamp with time zone,
  token uuid default gen_random_uuid() not null,
  actualizado_en timestamp with time zone default now() not null
);

create table public.cotizaciones(
  id uuid default gen_random_uuid() not null,
  espacio_id uuid not null,
  proyecto_id uuid,
  nombre text default 'Sin nombre'::text not null,
  datos jsonb default '{}'::jsonb not null,
  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null
);

create table public.elementos(
  id uuid default gen_random_uuid() not null,
  espacio_id uuid not null,
  proyecto_id uuid not null,
  coleccion_id uuid not null,
  plantilla text not null,
  titulo text not null,
  datos jsonb default '{}'::jsonb not null,
  estado text,
  fecha date,
  orden integer default 0 not null,
  enlaces jsonb default '[]'::jsonb not null,
  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null,
  texto text default ''::text not null
);

create table public.espacio_registro(
  id bigint default nextval('espacio_registro_id_seq'::regclass) not null,
  espacio_id uuid not null,
  quien uuid,
  accion text not null,
  detalle jsonb default '{}'::jsonb not null,
  creado_en timestamp with time zone default now() not null
);

create table public.espacios(
  id uuid default gen_random_uuid() not null,
  nombre text default 'Mi espacio'::text not null,
  creado_por uuid,
  creado_en timestamp with time zone default now() not null,
  plan text default 'libre'::text not null,
  plan_hasta timestamp with time zone,
  tipo text default 'personal'::text not null,
  dominio text
);

create table public.ideas(
  id uuid default gen_random_uuid() not null,
  espacio_id uuid not null,
  texto text not null,
  creado_por uuid default auth.uid(),
  proyecto_id uuid,
  creado_en timestamp with time zone default now() not null,
  vueltas smallint default 0 not null,
  vuelta_en timestamp with time zone
);

create table public.interes_funciones(
  user_id uuid default auth.uid() not null,
  funcion text not null,
  creado_en timestamp with time zone default now() not null,
  avisado_en timestamp with time zone
);

create table public.invitaciones(
  id uuid default gen_random_uuid() not null,
  proyecto_id uuid not null,
  correo text not null,
  rol text default 'editor'::text not null,
  areas jsonb,
  token uuid default gen_random_uuid() not null,
  invitado_por uuid,
  creado_en timestamp with time zone default now() not null,
  expira_en timestamp with time zone default (now() + '14 days'::interval) not null,
  aceptada_en timestamp with time zone,
  aceptada_por uuid,
  anulada_en timestamp with time zone
);

create table public.mensajes(
  id uuid default gen_random_uuid() not null,
  autor uuid default auth.uid() not null,
  tipo text not null,
  vitrina_id uuid,
  texto text not null,
  estado text default 'abierto'::text not null,
  respuesta text,
  creado_en timestamp with time zone default now() not null,
  respondido_en timestamp with time zone
);

create table public.meta(
  clave text not null,
  ultima_revision date,
  resumen text,
  actualizado_en timestamp with time zone default now() not null
);

create table public.miembros(
  espacio_id uuid not null,
  user_id uuid not null,
  rol text default 'lector'::text not null,
  creado_en timestamp with time zone default now() not null
);

create table public.notas(
  id uuid default gen_random_uuid() not null,
  espacio_id uuid not null,
  proyecto_id uuid not null,
  texto text not null,
  autor uuid default auth.uid(),
  creado_en timestamp with time zone default now() not null
);

create table public.oportunidades(
  id text not null,
  nombre text not null,
  tipo text not null,
  areas text[] default '{}'::text[] not null,
  organiza text,
  lugar text,
  postul_inicio date,
  postul_fin date,
  evento_inicio date,
  evento_fin date,
  fechas_estimadas boolean default false not null,
  postul_texto text,
  evento_texto text,
  premio text,
  costo text,
  requisitos text,
  que_llevar text,
  notas text,
  fuente text,
  revisado date,
  actualizado_en timestamp with time zone default now() not null
);

create table public.pizarras(
  id uuid default gen_random_uuid() not null,
  espacio_id uuid not null,
  proyecto_id uuid not null,
  nombre text default 'Pizarra'::text not null,
  modo text default 'libre'::text not null,
  datos jsonb default '{}'::jsonb not null,
  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null,
  coleccion_id uuid
);

create table public.precios_comunidad(
  id uuid default gen_random_uuid() not null,
  autor uuid default auth.uid() not null,
  componente text not null,
  proveedor text not null,
  enlace text,
  origen text not null,
  moneda text not null,
  cantidad numeric not null,
  precio numeric not null,
  envio numeric default 0 not null,
  incluye_iva boolean default false not null,
  especificaciones text,
  plazo text,
  creado_en timestamp with time zone default now() not null
);

create table public.proyecto_accesos(
  proyecto_id uuid not null,
  user_id uuid not null,
  rol text default 'editor'::text not null,
  creado_en timestamp with time zone default now() not null,
  areas jsonb,
  invitado_por uuid
);

create table public.proyecto_oportunidades(
  proyecto_id uuid not null,
  oportunidad_id text not null,
  espacio_id uuid not null,
  estado text default 'interesa'::text not null,
  creado_en timestamp with time zone default now() not null
);

create table public.proyectos(
  id uuid default gen_random_uuid() not null,
  espacio_id uuid not null,
  nombre text not null,
  tipo text default 'historia'::text not null,
  estado text default 'semilla'::text not null,
  resumen text,
  ejes jsonb default '{}'::jsonb not null,
  formato text,
  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null,
  acceso text default 'equipo'::text not null,
  ruta jsonb default '{}'::jsonb not null,
  esquema jsonb default '{}'::jsonb not null,
  estructura jsonb default '{}'::jsonb not null
);

create table public.recompensa_interes(
  vitrina_id uuid not null,
  tier text not null,
  user_id uuid not null,
  creado_en timestamp with time zone default now() not null
);

create table public.referentes(
  id uuid default gen_random_uuid() not null,
  espacio_id uuid not null,
  proyecto_id uuid not null,
  tipo text not null,
  valor text not null,
  titulo text,
  nota text,
  creado_en timestamp with time zone default now() not null,
  ficha jsonb default '{}'::jsonb not null,
  analisis jsonb default '{}'::jsonb not null
);

create table public.reportes(
  id uuid default gen_random_uuid() not null,
  vitrina_id uuid not null,
  autor uuid not null,
  motivo text not null,
  detalle text,
  estado text default 'pendiente'::text not null,
  creado_en timestamp with time zone default now() not null,
  revisado_en timestamp with time zone
);

create table public.ronda_comentarios(
  id uuid default gen_random_uuid() not null,
  ronda_id uuid not null,
  lector_id uuid not null,
  parte integer not null,
  parrafo integer not null,
  cita text,
  texto text not null,
  marca text,
  creado_en timestamp with time zone default now() not null
);

create table public.ronda_lectores(
  id uuid default gen_random_uuid() not null,
  ronda_id uuid not null,
  token uuid default gen_random_uuid() not null,
  nombre text not null,
  user_id uuid,
  reclamado_en timestamp with time zone,
  quitado_en timestamp with time zone,
  creado_en timestamp with time zone default now() not null
);

create table public.ronda_respuestas(
  id uuid default gen_random_uuid() not null,
  ronda_id uuid not null,
  lector_id uuid not null,
  pregunta text not null,
  texto text not null,
  marca text,
  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null
);

create table public.rondas(
  id uuid default gen_random_uuid() not null,
  espacio_id uuid not null,
  proyecto_id uuid not null,
  numero integer not null,
  titulo text not null,
  estado text default 'abierta'::text not null,
  cierra date,
  contenido jsonb default '{}'::jsonb not null,
  preguntas jsonb default '[]'::jsonb not null,
  resumen text,
  creado_por uuid default auth.uid(),
  creado_en timestamp with time zone default now() not null,
  cerrada_en timestamp with time zone
);

create table public.secciones(
  id uuid default gen_random_uuid() not null,
  espacio_id uuid not null,
  proyecto_id uuid not null,
  titulo text not null,
  guia text,
  texto text default ''::text not null,
  orden integer default 0 not null,
  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null,
  avance integer default 0 not null,
  peso integer default 10 not null,
  coleccion_id uuid
);

create table public.seguidores(
  vitrina_id uuid not null,
  user_id uuid not null,
  creado_en timestamp with time zone default now() not null
);

create table public.sugerencias(
  id uuid default gen_random_uuid() not null,
  autor uuid default auth.uid() not null,
  area text default 'otra'::text not null,
  texto text not null,
  estado text default 'nueva'::text not null,
  respuesta text,
  creado_en timestamp with time zone default now() not null,
  revisado_en timestamp with time zone
);

create table public.vitrinas(
  id uuid default gen_random_uuid() not null,
  espacio_id uuid not null,
  proyecto_id uuid not null,
  slug text not null,
  borrador jsonb default '{}'::jsonb not null,
  anterior jsonb,
  publicada boolean default false not null,
  publicado_en timestamp with time zone,
  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null,
  suspendida boolean default false not null,
  suspension jsonb,
  fuera_de_explorar boolean default false not null,
  listar boolean default false not null
);

create table public.vitrinas_publicadas(
  slug text not null,
  vitrina_id uuid not null,
  datos jsonb not null,
  publicado_en timestamp with time zone default now() not null,
  visible boolean default true not null,
  en_explorar boolean default false not null,
  titulo text,
  lema text,
  firma text,
  tipo text,
  formato text,
  estado text,
  portada text,
  acento text,
  busqueda tsvector generated always as (to_tsvector('spanish'::regconfig, privado.sin_tildes(((((COALESCE(titulo, ''::text) || ' '::text) || COALESCE(lema, ''::text)) || ' '::text) || COALESCE(firma, ''::text))))) stored
);

create table privado.admin_correos(
  email text not null
);

create table privado.config(
  clave text not null,
  valor text not null
);

create table privado.correos(
  id bigint generated always as identity not null,
  user_id uuid,
  tipo text not null,
  datos jsonb not null,
  creado_en timestamp with time zone default now() not null,
  tomado_en timestamp with time zone,
  enviado_en timestamp with time zone,
  intentos integer default 0 not null,
  error text,
  email text
);

create table privado.envios_vitrina(
  id bigint generated always as identity not null,
  vitrina_id uuid not null,
  autor uuid,
  titulo text,
  texto text,
  destinatarios integer,
  en timestamp with time zone default now() not null
);

create table privado.referidos(
  user_id uuid not null,
  invitado_por uuid,
  proyecto_id uuid,
  cuenta_nueva boolean not null,
  en timestamp with time zone default now() not null
);

create table privado.registro(
  id bigint generated always as identity not null,
  admin uuid,
  accion text not null,
  vitrina_id uuid,
  detalle jsonb,
  en timestamp with time zone default now() not null
);

alter sequence public.espacio_registro_id_seq owned by public.espacio_registro.id;

-- ===================== FUNCIONES (después de las tablas: algunas reciben una fila como parámetro) =====================

CREATE OR REPLACE FUNCTION public.abrir_ronda(p uuid, titulo text, contenido jsonb, preguntas jsonb, cierra date DEFAULT NULL::date)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare pr public.proyectos; n int; nueva uuid; q jsonb; t text := btrim(coalesce(titulo, ''));
begin
  select * into pr from public.proyectos where id = p;
  if not found or not privado.maneja_rondas(p) then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if not privado.es_mas(pr.espacio_id) and exists(select 1 from public.rondas r where r.proyecto_id = p and r.estado = 'abierta') then
    raise exception 'FORJA_RONDA_ABIERTA' using hint = 'El plan gratis permite una ronda abierta a la vez.';
  end if;
  if jsonb_typeof(contenido) <> 'object' or jsonb_typeof(coalesce(contenido->'partes', '[]'::jsonb)) <> 'array'
     or jsonb_array_length(coalesce(contenido->'partes', '[]'::jsonb)) = 0 then raise exception 'FORJA_RONDA_VACIA'; end if;
  if jsonb_array_length(contenido->'partes') > 200 or octet_length(contenido::text) > 1500000 then raise exception 'FORJA_RONDA_GRANDE'; end if;
  if jsonb_typeof(preguntas) <> 'array' or jsonb_array_length(preguntas) = 0 or jsonb_array_length(preguntas) > 12 then raise exception 'FORJA_RONDA_PREGUNTAS'; end if;
  for q in select * from jsonb_array_elements(preguntas) loop
    if coalesce(q->>'k', '') !~ '^[a-z0-9_-]{1,40}$' or char_length(coalesce(q->>'t', '')) not between 3 and 300 then raise exception 'FORJA_RONDA_PREGUNTAS'; end if;
    if (q->>'propia')::boolean is true and not privado.es_mas(pr.espacio_id) then raise exception 'FORJA_SOLO_MAS'; end if;
  end loop;
  if cierra is not null and cierra < current_date then raise exception 'FORJA_RONDA_FECHA'; end if;
  select coalesce(max(r.numero), 0) + 1 into n from public.rondas r where r.proyecto_id = p;
  insert into public.rondas(espacio_id, proyecto_id, numero, titulo, contenido, preguntas, cierra)
    values (pr.espacio_id, p, n, coalesce(nullif(t, ''), 'Ronda ' || n), contenido, preguntas, cierra) returning id into nueva;
  return nueva;
end $function$
;

CREATE OR REPLACE FUNCTION public.acceso_proyecto(p uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select jsonb_build_object('acceso', privado.acceso_area(p, 'taller'), 'publica', privado.publica(p), 'rol', privado.rol_en(x.espacio_id), 'espacio', x.espacio_id,
    'tipo', e.tipo, 'nombre', e.nombre, 'mas', privado.es_mas(x.espacio_id), 'plan', privado.plan_de(x.espacio_id), 'acceso_proyecto', x.acceso,
    'invitado', privado.rol_en(x.espacio_id) is null,
    'areas', jsonb_build_object('taller', privado.acceso_area(p, 'taller'), 'referentes', privado.acceso_area(p, 'referentes'), 'pizarra', privado.acceso_area(p, 'pizarra'),
      'costos', privado.acceso_area(p, 'costos'), 'oportunidades', privado.acceso_area(p, 'oportunidades'), 'bitacora', privado.acceso_area(p, 'bitacora'), 'vitrina', privado.acceso_area(p, 'vitrina')))
  from public.proyectos x join public.espacios e on e.id = x.espacio_id where x.id = p and privado.ve(p)
$function$
;

CREATE OR REPLACE FUNCTION public.aceptar_invitacion(t uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare i public.invitaciones; u auth.users; pr public.proyectos;
begin
  select * into u from auth.users where id = auth.uid();
  if u.id is null then raise exception 'FORJA_NO_PERMITIDO'; end if;
  select * into i from public.invitaciones where token = t for update;
  if not found or i.anulada_en is not null then raise exception 'FORJA_INVITACION_NO'; end if;
  if i.aceptada_en is not null then
    if i.aceptada_por = u.id and exists(select 1 from public.proyecto_accesos a where a.proyecto_id = i.proyecto_id and a.user_id = u.id) then return i.proyecto_id; end if;
    raise exception 'FORJA_INVITACION_NO';
  end if;
  if i.expira_en < now() then raise exception 'FORJA_INVITACION_VENCIDA'; end if;
  if lower(u.email) <> i.correo or u.email_confirmed_at is null then raise exception 'FORJA_INVITACION_OTRO'; end if;
  select * into pr from public.proyectos where id = i.proyecto_id;
  insert into public.proyecto_accesos(proyecto_id, user_id, rol, areas, invitado_por) values (i.proyecto_id, u.id, i.rol, i.areas, i.invitado_por)
    on conflict (proyecto_id, user_id) do update set rol = excluded.rol, areas = excluded.areas;
  update public.invitaciones set aceptada_en = now(), aceptada_por = u.id where id = i.id;
  insert into privado.referidos(user_id, invitado_por, proyecto_id, cuenta_nueva) values (u.id, i.invitado_por, i.proyecto_id, u.created_at >= i.creado_en) on conflict (user_id) do nothing;
  if i.invitado_por is not null then
    insert into public.avisos(user_id, tipo, titulo, texto, enlace) values (i.invitado_por, 'invitacion', 'Aceptaron tu invitación', u.email || ' ya puede trabajar en «' || pr.nombre || '».', 'proyecto/?p=' || pr.id);
  end if;
  return i.proyecto_id;
end $function$
;

CREATE OR REPLACE FUNCTION public.anotar_recompensa(slug text, tier text, si boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare p public.vitrinas_publicadas; uid uuid := auth.uid(); siguio boolean := false;
begin
  if uid is null then raise exception 'FORJA_ANOTAR_SIN_CUENTA'; end if;
  select * into p from public.vitrinas_publicadas x where x.slug = anotar_recompensa.slug and x.visible;
  if not found then raise exception 'FORJA_NO_ENCONTRADA'; end if;
  if not si then
    delete from public.recompensa_interes i where i.vitrina_id = p.vitrina_id and i.tier = anotar_recompensa.tier and i.user_id = uid;
    return public.estado_recompensas(slug);
  end if;
  if coalesce(p.datos #>> '{recompensas,interes}', 'true') = 'false' or coalesce(p.datos #>> '{recompensas,estado}', 'pronto') = 'cerrada'
     or not exists(select 1 from jsonb_array_elements(coalesce(p.datos #> '{recompensas,tiers}', '[]'::jsonb)) t where t->>'id' = anotar_recompensa.tier) then raise exception 'FORJA_ANOTAR_CERRADO'; end if;
  if exists(select 1 from public.vitrinas v where v.id = p.vitrina_id and privado.ve(v.proyecto_id)) then raise exception 'FORJA_ANOTAR_PROPIA'; end if;
  if (select count(*) from public.recompensa_interes i where i.user_id = uid and i.creado_en > now() - interval '1 day') >= 40 then raise exception 'FORJA_ANOTAR_LIMITE'; end if;
  insert into public.recompensa_interes(vitrina_id, tier, user_id) values (p.vitrina_id, anotar_recompensa.tier, uid) on conflict do nothing;
  -- si la vitrina deja seguirla, quien se anota también la sigue (así le llega el aviso cuando abra la campaña)
  if coalesce(p.datos #>> '{seguir,activo}', 'false') = 'true' then
    insert into public.seguidores(vitrina_id, user_id) values (p.vitrina_id, uid) on conflict do nothing;
    siguio := true;
  end if;
  return public.estado_recompensas(slug) || jsonb_build_object('sigue', siguio);
end $function$
;

CREATE OR REPLACE FUNCTION public.anular_invitacion(i uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not exists(select 1 from public.invitaciones x join public.proyectos p on p.id = x.proyecto_id where x.id = i and privado.es_dueno(p.espacio_id)) then raise exception 'FORJA_NO_PERMITIDO'; end if;
  update public.invitaciones set anulada_en = now() where id = i and aceptada_en is null;
end $function$
;

CREATE OR REPLACE FUNCTION public.avisar_seguidores(v uuid, titulo text, texto text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare x public.vitrinas; p public.vitrinas_publicadas; n int; creado timestamptz;
begin
  select * into x from public.vitrinas y where y.id = v;
  if not found or not privado.publica(x.proyecto_id) then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if x.suspendida then raise exception 'FORJA_VITRINA_SUSPENDIDA'; end if;
  select * into p from public.vitrinas_publicadas y where y.vitrina_id = v and y.visible;
  if not found then raise exception 'FORJA_AVISO_SIN_PUBLICAR'; end if;
  select u.created_at into creado from auth.users u where u.id = auth.uid();
  if creado > now() - interval '3 days' then raise exception 'FORJA_AVISO_CUENTA_NUEVA'; end if;
  titulo := btrim(coalesce(titulo, '')); texto := btrim(coalesce(texto, ''));
  if char_length(titulo) < 3 or char_length(titulo) > 120 or char_length(texto) < 10 or char_length(texto) > 2000 then raise exception 'FORJA_AVISO_TEXTO'; end if;
  if exists(select 1 from privado.envios_vitrina e where e.vitrina_id = v and e.en > now() - interval '7 days') then raise exception 'FORJA_AVISO_ESPERA'; end if;
  insert into privado.correos(user_id, tipo, datos)
    select s.user_id, 'vitrina', jsonb_build_object('vitrina_id', v, 'slug', p.slug, 'vitrina', coalesce(p.titulo, 'un proyecto'), 'titulo', titulo, 'texto', texto)
    from public.seguidores s left join public.correo_prefs c on c.user_id = s.user_id
    where s.vitrina_id = v and coalesce(c.vitrinas, true);
  get diagnostics n = row_count;
  insert into privado.envios_vitrina(vitrina_id, autor, titulo, texto, destinatarios) values (v, auth.uid(), titulo, texto, n);
  return jsonb_build_object('destinatarios', n);
end $function$
;

CREATE OR REPLACE FUNCTION public.baja_correo(t uuid, que text, slug text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare r public.correo_prefs; tit text;
begin
  select * into r from public.correo_prefs c where c.token = t;
  if not found then raise exception 'FORJA_NO_ENCONTRADA'; end if;
  if que = 'boletin' then update public.correo_prefs set boletin = false where user_id = r.user_id;
  elsif que = 'funciones' then update public.correo_prefs set funciones = false where user_id = r.user_id;
  elsif que = 'vitrinas' then update public.correo_prefs set vitrinas = false where user_id = r.user_id;
  elsif que = 'todo' then update public.correo_prefs set boletin = false, funciones = false, vitrinas = false where user_id = r.user_id;
  elsif que = 'seguir' then
    select coalesce(p.titulo, v.borrador->>'titulo') into tit from public.vitrinas v left join public.vitrinas_publicadas p on p.vitrina_id = v.id where v.slug = baja_correo.slug;
    delete from public.seguidores s using public.vitrinas v where v.id = s.vitrina_id and v.slug = baja_correo.slug and s.user_id = r.user_id;
  else raise exception 'FORJA_NO_ENCONTRADA'; end if;
  return jsonb_build_object('ok', true, 'que', que, 'titulo', tit);
end $function$
;

CREATE OR REPLACE FUNCTION public.borrar_comentario_ronda(t uuid, c uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare l public.ronda_lectores;
begin
  l := privado.mi_lectura(t);
  delete from public.ronda_comentarios where id = c and lector_id = l.id;
end $function$
;

CREATE OR REPLACE FUNCTION public.borrar_mi_cuenta(confirmacion text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if confirmacion is distinct from 'BORRAR' then raise exception 'FORJA_CONFIRMAR'; end if;
  if exists(select 1 from public.miembros m join public.espacios e on e.id = m.espacio_id where m.user_id = uid and m.rol = 'dueno' and e.tipo = 'equipo'
            and (select count(*) from public.miembros d where d.espacio_id = e.id and d.rol = 'dueno') <= 1) then raise exception 'FORJA_ULTIMO_DUENO'; end if;
  delete from public.espacios e where e.creado_por = uid and e.tipo = 'personal';
  delete from auth.users u where u.id = uid;
end $function$
;

CREATE OR REPLACE FUNCTION public.borrar_mis_respuestas(t uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare l public.ronda_lectores;
begin
  l := privado.mi_lectura(t);
  delete from public.ronda_respuestas where lector_id = l.id;
  delete from public.ronda_comentarios where lector_id = l.id;
end $function$
;

CREATE OR REPLACE FUNCTION public.borrar_ronda(r uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare rp uuid;
begin
  select proyecto_id into rp from public.rondas where id = r;
  if rp is null or not privado.publica(rp) then raise exception 'FORJA_NO_PERMITIDO'; end if;
  delete from public.rondas where id = r;
end $function$
;

CREATE OR REPLACE FUNCTION public.cerrar_ronda(r uuid, palabra text DEFAULT 'lectores'::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare ro public.rondas; nl int; nm int; res text;
  w text := case when palabra in ('lectores', 'testers', 'probadores') then palabra else 'lectores' end;
  uno text := case w when 'testers' then 'tester' when 'probadores' then 'probador' else 'lector' end;
begin
  select * into ro from public.rondas where id = r;
  if not found or privado.acceso_area(ro.proyecto_id, 'taller') is distinct from 'editar' then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if ro.estado = 'cerrada' then return ro.resumen; end if;
  select count(*) into nl from public.ronda_lectores l where l.ronda_id = r
    and (exists(select 1 from public.ronda_respuestas x where x.lector_id = l.id) or exists(select 1 from public.ronda_comentarios c where c.lector_id = l.id));
  select (select count(*) from public.ronda_respuestas x where x.ronda_id = r and x.marca = 'mejora')
       + (select count(*) from public.ronda_comentarios c where c.ronda_id = r and c.marca = 'mejora') into nm;
  res := ro.titulo || ': ' || nl || ' ' || case when nl = 1 then uno else w end || ', ' || nm || case when nm = 1 then ' mejora' else ' mejoras' end || '.';
  update public.rondas set estado = 'cerrada', cerrada_en = now(), resumen = res where id = r;
  if privado.editable(ro.proyecto_id) then
    insert into public.notas(espacio_id, proyecto_id, texto) values (ro.espacio_id, ro.proyecto_id, res);
  end if;
  return res;
end $function$
;

CREATE OR REPLACE FUNCTION public.cola_clave()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$ select valor from privado.config where clave = 'cola_clave' $function$
;

CREATE OR REPLACE FUNCTION public.cola_marcar(id bigint, ok boolean, error text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  update privado.correos c set enviado_en = case when ok then now() else c.enviado_en end, error = case when ok then null else left(cola_marcar.error, 500) end where c.id = cola_marcar.id
$function$
;

CREATE OR REPLACE FUNCTION public.cola_tomar(limite integer DEFAULT 15)
 RETURNS TABLE(id bigint, email text, token uuid, tipo text, datos jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare hora int; dia int; cupo int;
begin
  select count(*) filter (where c.enviado_en > now() - interval '1 hour' and c.error is null), count(*) filter (where c.error is null) into hora, dia
    from privado.correos c where c.enviado_en > now() - interval '24 hours';
  cupo := least(limite, 40 - hora, 90 - dia);
  if cupo <= 0 then return; end if;
  update privado.correos c set enviado_en = now(), error = 'baja' from public.correo_prefs p
    where c.enviado_en is null and p.user_id = c.user_id and ((c.tipo = 'boletin' and not p.boletin) or (c.tipo = 'funcion' and not p.funciones) or (c.tipo = 'vitrina' and not p.vitrinas));
  update privado.correos c set enviado_en = now(), error = 'anulada' from public.invitaciones i
    where c.enviado_en is null and c.tipo = 'invitacion' and i.id = (c.datos->>'invitacion')::uuid and (i.anulada_en is not null or i.aceptada_en is not null);
  return query
    with t as (
      select c.id from privado.correos c
      where c.enviado_en is null and c.intentos < 3 and (c.tomado_en is null or c.tomado_en < now() - interval '10 minutes')
      order by case c.tipo when 'prueba' then 0 when 'legal' then 1 when 'inactiva' then 1 when 'invitacion' then 2 when 'funcion' then 3 when 'vitrina' then 4 else 5 end, c.id
      limit cupo for update skip locked)
    update privado.correos c set tomado_en = now(), intentos = c.intentos + 1 from t
      where c.id = t.id
      returning c.id, coalesce(c.email, (select u.email::text from auth.users u where u.id = c.user_id)),
        case when c.user_id is null then null else (privado.prefs(c.user_id)).token end, c.tipo, c.datos;
end $function$
;

CREATE OR REPLACE FUNCTION public.comentar_ronda(t uuid, parte integer, parrafo integer, cita text, texto text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare l public.ronda_lectores; nuevo uuid; tx text := btrim(coalesce(texto, ''));
begin
  l := privado.lector_de(t); perform privado.ronda_abierta(l);
  if char_length(tx) not between 1 and 2000 then raise exception 'FORJA_COMENTARIO_TEXTO'; end if;
  if (select count(*) from public.ronda_comentarios c where c.lector_id = l.id) >= 300 then raise exception 'FORJA_COMENTARIO_LIMITE'; end if;
  insert into public.ronda_comentarios(ronda_id, lector_id, parte, parrafo, cita, texto)
    values (l.ronda_id, l.id, parte, parrafo, left(btrim(coalesce(cita, '')), 200), tx) returning id into nuevo;
  return nuevo;
end $function$
;

CREATE OR REPLACE FUNCTION public.crear_espacio_personal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare eid uuid;
begin
  -- Forja Más por correo del equipo solo con el correo ya confirmado (si no, llega al confirmarlo: privado.t_confirmado).
  insert into public.espacios(nombre, creado_por, tipo, plan)
  values ('Mi espacio', new.id, 'personal', case when new.email_confirmed_at is not null and privado.es_equipo(new.email) then 'mas' else 'libre' end)
  returning id into eid;
  insert into public.miembros(espacio_id, user_id, rol) values (eid, new.id, 'dueno');
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION public.despublicar_vitrina(v uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare r public.vitrinas;
begin
  select * into r from public.vitrinas x where x.id = v;
  if not found or not coalesce(privado.acceso_area(r.proyecto_id, 'vitrina') = 'editar', false) then raise exception 'FORJA_NO_PERMITIDO'; end if;
  update public.vitrinas set anterior = coalesce((select p.datos from public.vitrinas_publicadas p where p.vitrina_id = v), anterior), publicada = false where id = v;
  delete from public.vitrinas_publicadas where vitrina_id = v;
end $function$
;

CREATE OR REPLACE FUNCTION public.equipo_panel(e uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare dueno boolean := privado.es_dueno(e);
begin
  if not privado.es_miembro(e) or (select tipo from public.espacios where id = e) <> 'equipo' then raise exception 'FORJA_NO_PERMITIDO'; end if;
  return jsonb_build_object(
    'espacio', (select jsonb_build_object('id', x.id, 'nombre', x.nombre, 'dominio', x.dominio) from public.espacios x where x.id = e),
    'yo', auth.uid(), 'dueno', dueno,
    'miembros', (select coalesce(jsonb_agg(jsonb_build_object('user_id', m.user_id, 'correo', u.email, 'rol', m.rol, 'desde', m.creado_en) order by case m.rol when 'dueno' then 0 when 'editor' then 1 else 2 end, u.email), '[]'::jsonb)
                 from public.miembros m join auth.users u on u.id = m.user_id where m.espacio_id = e),
    'reservados', case when dueno then (select coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'nombre', p.nombre, 'personas',
                     (select coalesce(jsonb_agg(jsonb_build_object('user_id', a.user_id, 'rol', a.rol)), '[]'::jsonb) from public.proyecto_accesos a where a.proyecto_id = p.id)) order by p.nombre), '[]'::jsonb)
                   from public.proyectos p where p.espacio_id = e and p.acceso = 'reservado') end,
    'registro', case when dueno then (select coalesce(jsonb_agg(r order by r.creado_en desc), '[]'::jsonb) from (
                   select g.accion, g.detalle, g.creado_en, u.email as quien from public.espacio_registro g left join auth.users u on u.id = g.quien
                   where g.espacio_id = e order by g.creado_en desc limit 60) r) end);
end $function$
;

CREATE OR REPLACE FUNCTION public.equipo_quitar(e uuid, u uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare correo text; x public.espacios;
begin
  select * into x from public.espacios where id = e;
  if not privado.es_dueno(e) or x.tipo <> 'equipo' then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if u = auth.uid() then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if (select rol from public.miembros where espacio_id = e and user_id = u) = 'dueno' and (select count(*) from public.miembros where espacio_id = e and rol = 'dueno') <= 1 then raise exception 'FORJA_ULTIMO_DUENO'; end if;
  select email into correo from auth.users where id = u;
  delete from public.miembros m where m.espacio_id = e and m.user_id = u;
  delete from public.proyecto_accesos a using public.proyectos p where p.id = a.proyecto_id and p.espacio_id = e and a.user_id = u;
  if x.dominio is not null and lower(correo) like '%@' || lower(x.dominio) then
    update public.espacios set plan = 'libre', plan_hasta = null where creado_por = u and tipo = 'personal';
  end if;
  perform privado.registrar(e, 'quitado', jsonb_build_object('correo', correo));
end $function$
;

CREATE OR REPLACE FUNCTION public.equipo_rol(e uuid, u uuid, rol text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare antes text;
begin
  if not privado.es_dueno(e) or (select tipo from public.espacios where id = e) <> 'equipo' then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if rol not in ('dueno','editor','lector') then raise exception 'FORJA_NO_PERMITIDO'; end if;
  select m.rol into antes from public.miembros m where m.espacio_id = e and m.user_id = u;
  if antes is null then raise exception 'FORJA_NO_ENCONTRADA'; end if;
  if antes = 'dueno' and rol <> 'dueno' and (select count(*) from public.miembros m where m.espacio_id = e and m.rol = 'dueno') <= 1 then raise exception 'FORJA_ULTIMO_DUENO'; end if;
  update public.miembros m set rol = equipo_rol.rol where m.espacio_id = e and m.user_id = u;
  perform privado.registrar(e, 'rol', jsonb_build_object('correo', (select email from auth.users where id = u), 'antes', antes, 'ahora', rol));
  insert into public.avisos(user_id, tipo, titulo, texto, enlace) values (u, 'equipo', 'Cambió tu rol en ' || (select nombre from public.espacios where id = e),
    case rol when 'dueno' then 'Ahora administras el equipo: miembros, proyectos reservados y publicación.' when 'editor' then 'Ahora puedes editar los proyectos abiertos al equipo.' else 'Ahora puedes ver los proyectos abiertos al equipo, sin editarlos.' end, 'equipo/');
end $function$
;

CREATE OR REPLACE FUNCTION public.estado_recompensas(slug text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare p public.vitrinas_publicadas; uid uuid := auth.uid(); r jsonb;
begin
  select * into p from public.vitrinas_publicadas x where x.slug = estado_recompensas.slug and x.visible;
  if not found then return null; end if;
  r := p.datos->'recompensas';
  return jsonb_build_object(
    'conteo', case when coalesce(r->>'contador', 'false') = 'true' then (select coalesce(jsonb_object_agg(tier, n), '{}'::jsonb) from (select i.tier, count(*) n from public.recompensa_interes i where i.vitrina_id = p.vitrina_id group by 1) z) end,
    'mias', case when uid is null then '[]'::jsonb else (select coalesce(jsonb_agg(i.tier), '[]'::jsonb) from public.recompensa_interes i where i.vitrina_id = p.vitrina_id and i.user_id = uid) end,
    'propia', uid is not null and exists(select 1 from public.vitrinas v where v.id = p.vitrina_id and privado.ve(v.proyecto_id)));
end $function$
;

CREATE OR REPLACE FUNCTION public.estado_seguir(slug text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare p public.vitrinas_publicadas; uid uuid := auth.uid(); total int;
begin
  select * into p from public.vitrinas_publicadas x where x.slug = estado_seguir.slug and x.visible;
  if not found then return null; end if;
  if coalesce(p.datos #>> '{seguir,contador}', 'false') = 'true' then select count(*) into total from public.seguidores s where s.vitrina_id = p.vitrina_id; end if;
  return jsonb_build_object('sigo', uid is not null and exists(select 1 from public.seguidores s where s.vitrina_id = p.vitrina_id and s.user_id = uid),
    'total', total, 'propia', uid is not null and exists(select 1 from public.vitrinas v join public.miembros m on m.espacio_id = v.espacio_id where v.id = p.vitrina_id and m.user_id = uid));
end $function$
;

CREATE OR REPLACE FUNCTION public.invitar(p uuid, correo text, rol text DEFAULT 'editor'::text, areas jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare pr public.proyectos; c text := lower(btrim(coalesce(correo, ''))); usados int; i public.invitaciones; de text; existe uuid;
begin
  select * into pr from public.proyectos where id = p;
  if not found or not privado.es_dueno(pr.espacio_id) then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if c !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(c) > 254 then raise exception 'FORJA_INVITAR_CORREO'; end if;
  if rol not in ('editor','lector') then rol := 'editor'; end if;
  select u.email into de from auth.users u where u.id = auth.uid();
  if lower(de) = c then raise exception 'FORJA_INVITAR_PROPIO'; end if;
  select u.id into existe from auth.users u where lower(u.email) = c;
  if existe is not null and (exists(select 1 from public.miembros m where m.espacio_id = pr.espacio_id and m.user_id = existe) or exists(select 1 from public.proyecto_accesos a where a.proyecto_id = p and a.user_id = existe)) then raise exception 'FORJA_INVITAR_YA_ESTA'; end if;
  if exists(select 1 from public.invitaciones x where x.proyecto_id = p and x.correo = c and x.aceptada_en is null and x.anulada_en is null and x.expira_en > now()) then raise exception 'FORJA_INVITAR_PENDIENTE'; end if;
  select (select count(*) from public.proyecto_accesos a where a.proyecto_id = p and not exists(select 1 from public.miembros m where m.espacio_id = pr.espacio_id and m.user_id = a.user_id))
       + (select count(*) from public.invitaciones x where x.proyecto_id = p and x.aceptada_en is null and x.anulada_en is null and x.expira_en > now()) into usados;
  if usados >= privado.max_invitados(p) then raise exception 'FORJA_INVITAR_LIMITE'; end if;
  if (select count(*) from public.invitaciones x where x.invitado_por = auth.uid() and x.creado_en > now() - interval '1 day') >= 20 then raise exception 'FORJA_INVITAR_MUCHAS'; end if;
  delete from public.invitaciones x where x.proyecto_id = p and x.correo = c and x.aceptada_en is null;
  insert into public.invitaciones(proyecto_id, correo, rol, areas, invitado_por) values (p, c, rol, nullif(privado.limpiar_areas(areas), '{}'::jsonb), auth.uid()) returning * into i;
  insert into privado.correos(user_id, email, tipo, datos) values (existe, c, 'invitacion',
    jsonb_build_object('invitacion', i.id, 'token', i.token, 'proyecto', pr.nombre, 'de', de, 'rol', rol, 'expira', i.expira_en));
  if existe is not null then
    insert into public.avisos(user_id, tipo, titulo, texto, enlace) values (existe, 'invitacion', 'Te invitaron a un proyecto', de || ' te invitó a trabajar en «' || pr.nombre || '». Ábrelo para aceptar o rechazar.', 'invitacion/?t=' || i.token);
  end if;
  return jsonb_build_object('id', i.id, 'expira_en', i.expira_en);
end $function$
;

CREATE OR REPLACE FUNCTION public.invitar_lector(r uuid, nombre text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare ro public.rondas; t int; tk uuid; nom text := btrim(coalesce(nombre, ''));
begin
  select * into ro from public.rondas where id = r;
  if not found or not privado.maneja_rondas(ro.proyecto_id) then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if ro.estado <> 'abierta' then raise exception 'FORJA_RONDA_CERRADA'; end if;
  if char_length(nom) not between 1 and 60 then raise exception 'FORJA_LECTOR_NOMBRE'; end if;
  t := privado.tope(ro.espacio_id, 'lectores');
  if t is not null and (select count(*) from public.ronda_lectores l where l.ronda_id = r and l.quitado_en is null) >= t then
    raise exception 'FORJA_LIMITE_LECTORES' using hint = 'Tu plan permite ' || t || ' personas por ronda.';
  end if;
  insert into public.ronda_lectores(ronda_id, nombre) values (r, nom) returning token into tk;
  return tk;
end $function$
;

CREATE OR REPLACE FUNCTION public.marcar_opinion(tipo text, id uuid, marca text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare rp uuid;
begin
  if marca is not null and marca not in ('opinion', 'mejora', 'resuelta') then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if tipo = 'respuesta' then
    select ro.proyecto_id into rp from public.ronda_respuestas x join public.rondas ro on ro.id = x.ronda_id where x.id = marcar_opinion.id;
  elsif tipo = 'comentario' then
    select ro.proyecto_id into rp from public.ronda_comentarios x join public.rondas ro on ro.id = x.ronda_id where x.id = marcar_opinion.id;
  end if;
  if rp is null or privado.acceso_area(rp, 'taller') is distinct from 'editar' then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if tipo = 'respuesta' then update public.ronda_respuestas set marca = marcar_opinion.marca where ronda_respuestas.id = marcar_opinion.id;
  else update public.ronda_comentarios set marca = marcar_opinion.marca where ronda_comentarios.id = marcar_opinion.id; end if;
end $function$
;

CREATE OR REPLACE FUNCTION public.mis_anotadas()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select coalesce(jsonb_agg(jsonb_build_object('slug', p.slug, 'titulo', p.titulo, 'tier', i.tier,
    'recompensa', (select t->>'nombre' from jsonb_array_elements(coalesce(p.datos #> '{recompensas,tiers}', '[]'::jsonb)) t where t->>'id' = i.tier limit 1), 'desde', i.creado_en) order by i.creado_en desc), '[]'::jsonb)
  from public.recompensa_interes i join public.vitrinas_publicadas p on p.vitrina_id = i.vitrina_id where i.user_id = auth.uid()
$function$
;

CREATE OR REPLACE FUNCTION public.mis_compartidos()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'nombre', p.nombre, 'tipo', p.tipo, 'estado', p.estado, 'formato', p.formato, 'resumen', p.resumen,
    'actualizado_en', p.actualizado_en, 'de', (select string_agg(split_part(u.email, '@', 1), ', ') from public.miembros m join auth.users u on u.id = m.user_id where m.espacio_id = p.espacio_id and m.rol = 'dueno'),
    'edita', privado.acceso_area(p.id, 'taller') = 'editar') order by p.actualizado_en desc), '[]'::jsonb)
  from public.proyecto_accesos a join public.proyectos p on p.id = a.proyecto_id
  where a.user_id = auth.uid() and not exists(select 1 from public.miembros m where m.espacio_id = p.espacio_id and m.user_id = auth.uid())
$function$
;

CREATE OR REPLACE FUNCTION public.mis_espacios()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select coalesce(jsonb_agg(jsonb_build_object('id', e.id, 'nombre', e.nombre, 'tipo', e.tipo, 'rol', m.rol, 'mas', privado.es_mas(e.id),
    'plan', privado.plan_de(e.id), 'hasta', case when privado.es_mas(e.id) then e.plan_hasta end) order by e.tipo desc, m.creado_en), '[]'::jsonb)
  from public.miembros m join public.espacios e on e.id = m.espacio_id where m.user_id = auth.uid()
$function$
;

CREATE OR REPLACE FUNCTION public.mis_lecturas()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select coalesce(jsonb_agg(jsonb_build_object('token', l.token, 'proyecto', p.nombre, 'tipo', p.tipo, 'titulo', r.titulo, 'estado', r.estado, 'cierra', r.cierra,
      'abierta', r.estado = 'abierta' and (r.cierra is null or r.cierra >= current_date) and l.quitado_en is null, 'quitado', l.quitado_en is not null, 'desde', l.reclamado_en,
      'respuestas', (select coalesce(jsonb_object_agg(x.pregunta, x.texto), '{}'::jsonb) from public.ronda_respuestas x where x.lector_id = l.id),
      'comentarios', (select coalesce(jsonb_agg(jsonb_build_object('cita', c.cita, 'texto', c.texto, 'en', c.creado_en)), '[]'::jsonb) from public.ronda_comentarios c where c.lector_id = l.id))
    order by l.reclamado_en desc), '[]'::jsonb)
  from public.ronda_lectores l join public.rondas r on r.id = l.ronda_id join public.proyectos p on p.id = r.proyecto_id
  where l.user_id = auth.uid()
$function$
;

CREATE OR REPLACE FUNCTION public.mis_seguidas()
 RETURNS TABLE(slug text, titulo text, visible boolean, desde timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select v.slug, coalesce(p.titulo, v.borrador->>'titulo'), coalesce(p.visible, false), s.creado_en
  from public.seguidores s join public.vitrinas v on v.id = s.vitrina_id left join public.vitrinas_publicadas p on p.vitrina_id = v.id
  where s.user_id = auth.uid() order by s.creado_en desc
$function$
;

CREATE OR REPLACE FUNCTION public.mismo_espacio()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  -- mover_proyecto cambia primero las filas hijas y después el proyecto: durante el traslado no se revisa.
  if coalesce(current_setting('forja.mover', true), '') = '1' then return new; end if;
  if new.proyecto_id is not null and not exists(select 1 from public.proyectos p where p.id=new.proyecto_id and p.espacio_id=new.espacio_id) then
    raise exception 'El proyecto no pertenece a este espacio';
  end if;
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION public.mod_anunciar_funcion(funcion text, titulo text, texto text, enlace text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare n int;
begin
  if not privado.es_admin() then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if coalesce(btrim(mod_anunciar_funcion.titulo), '') = '' or coalesce(btrim(mod_anunciar_funcion.texto), '') = '' then raise exception 'FORJA_FALTA_MENSAJE'; end if;
  insert into privado.correos(user_id, tipo, datos)
    select i.user_id, 'funcion', jsonb_build_object('funcion', mod_anunciar_funcion.funcion, 'titulo', mod_anunciar_funcion.titulo, 'texto', mod_anunciar_funcion.texto, 'enlace', mod_anunciar_funcion.enlace)
    from public.interes_funciones i left join public.correo_prefs c on c.user_id = i.user_id
    where i.funcion = mod_anunciar_funcion.funcion and i.avisado_en is null and coalesce(c.funciones, true);
  get diagnostics n = row_count;
  update public.interes_funciones i set avisado_en = now() where i.funcion = mod_anunciar_funcion.funcion and i.avisado_en is null;
  insert into privado.registro(admin, accion, detalle) values (auth.uid(), 'anunciar_funcion', jsonb_build_object('funcion', mod_anunciar_funcion.funcion, 'titulo', mod_anunciar_funcion.titulo, 'destinatarios', n));
  return n;
end $function$
;

CREATE OR REPLACE FUNCTION public.mod_boletin(datos jsonb, prueba boolean DEFAULT true)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare n int;
begin
  if not privado.es_admin() then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if coalesce(btrim(datos->>'asunto'), '') = '' then raise exception 'FORJA_FALTA_MENSAJE'; end if;
  if prueba then
    insert into privado.correos(user_id, tipo, datos) values (auth.uid(), 'prueba', datos || jsonb_build_object('de', 'boletin'));
    return 1;
  end if;
  insert into privado.correos(user_id, tipo, datos) select c.user_id, 'boletin', datos from public.correo_prefs c where c.boletin;
  get diagnostics n = row_count;
  insert into privado.registro(admin, accion, detalle) values (auth.uid(), 'boletin', jsonb_build_object('asunto', datos->>'asunto', 'destinatarios', n));
  return n;
end $function$
;

CREATE OR REPLACE FUNCTION public.mod_correos()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not privado.es_admin() then raise exception 'FORJA_NO_PERMITIDO'; end if;
  return jsonb_build_object(
    'pendientes', (select count(*) from privado.correos where enviado_en is null and intentos < 3),
    'fallidos', (select count(*) from privado.correos where enviado_en is null and intentos >= 3),
    'hoy', (select count(*) from privado.correos where enviado_en > now() - interval '24 hours' and error is null),
    'boletin', (select count(*) from public.correo_prefs where boletin),
    'errores', coalesce((select jsonb_agg(jsonb_build_object('tipo', tipo, 'error', error, 'en', coalesce(tomado_en, creado_en)) order by id desc) from (select * from privado.correos where error is not null and error <> 'baja' order by id desc limit 5) e), '[]'::jsonb),
    'vitrinas', coalesce((select jsonb_agg(jsonb_build_object('titulo', e.titulo, 'texto', left(e.texto, 200), 'destinatarios', e.destinatarios, 'en', e.en, 'slug', v.slug) order by e.id desc) from (select * from privado.envios_vitrina order by id desc limit 10) e join public.vitrinas v on v.id = e.vitrina_id), '[]'::jsonb));
end $function$
;

CREATE OR REPLACE FUNCTION public.mod_explorar(v uuid, mostrar boolean, mensaje text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare t text;
begin
  if not privado.es_admin() then raise exception 'FORJA_NO_PERMITIDO'; end if;
  update public.vitrinas set fuera_de_explorar = not mostrar where id = v returning coalesce(borrador->>'titulo', slug) into t;
  if not found then raise exception 'FORJA_NO_ENCONTRADA'; end if;
  if not mostrar then update public.vitrinas_publicadas set en_explorar = false where vitrina_id = v; end if;
  perform privado.avisar_duenos(v, 'explorar', case when mostrar then 'Tu vitrina «' || t || '» puede volver a Explorar' else 'Tu vitrina «' || t || '» salió de Explorar' end,
    coalesce(nullif(btrim(mensaje), ''), case when mostrar then 'Vuelve a publicarla con la opción de Explorar marcada para aparecer.' else 'Sigue visible para quien tenga su enlace.' end), 'vitrina/editar/?p=' || (select proyecto_id from public.vitrinas where id = v));
  insert into privado.registro(admin, accion, vitrina_id, detalle) values (auth.uid(), case when mostrar then 'explorar_permitir' else 'explorar_quitar' end, v, jsonb_build_object('mensaje', mensaje));
end $function$
;

CREATE OR REPLACE FUNCTION public.mod_intereses()
 RETURNS TABLE(funcion text, total bigint, pendientes bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not privado.es_admin() then raise exception 'FORJA_NO_PERMITIDO'; end if;
  return query select i.funcion, count(*), count(*) filter (where i.avisado_en is null) from public.interes_funciones i group by 1 order by 2 desc;
end $function$
;

CREATE OR REPLACE FUNCTION public.mod_panel()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not privado.es_admin() then raise exception 'FORJA_NO_PERMITIDO'; end if;
  return jsonb_build_object(
    'reportes', coalesce((select jsonb_agg(g order by g->>'ultimo' desc) from (
      select jsonb_build_object('vitrina_id', x.id, 'slug', x.slug, 'titulo', coalesce(p.titulo, x.borrador->>'titulo'), 'suspendida', x.suspendida, 'en_explorar', coalesce(p.en_explorar, false),
        'ultimo', max(r.creado_en), 'reportes', jsonb_agg(jsonb_build_object('id', r.id, 'motivo', r.motivo, 'detalle', r.detalle, 'creado_en', r.creado_en,
          'autor', left(r.autor::text, 8),
          'historial', (select jsonb_build_object('aceptados', count(*) filter (where q.estado = 'aceptado'), 'desestimados', count(*) filter (where q.estado = 'desestimado'), 'mala_fe', count(*) filter (where q.estado = 'mala_fe'))
                        from public.reportes q where q.autor = r.autor and q.id <> r.id),
          'cuenta_dias', (select extract(day from now() - u.created_at)::int from auth.users u where u.id = r.autor)) order by r.creado_en)) g
      from public.reportes r join public.vitrinas x on x.id = r.vitrina_id left join public.vitrinas_publicadas p on p.vitrina_id = x.id
      where r.estado = 'pendiente' group by x.id, x.slug, p.titulo, x.borrador, x.suspendida, p.en_explorar) t), '[]'::jsonb),
    'mensajes', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'tipo', m.tipo, 'texto', m.texto, 'creado_en', m.creado_en, 'autor', left(m.autor::text, 8),
        'vitrina', (select jsonb_build_object('id', x.id, 'slug', x.slug, 'suspendida', x.suspendida, 'suspension', x.suspension) from public.vitrinas x where x.id = m.vitrina_id)) order by m.creado_en)
      from public.mensajes m where m.estado = 'abierto'), '[]'::jsonb),
    'sugerencias', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'area', s.area, 'texto', s.texto, 'creado_en', s.creado_en, 'autor', left(s.autor::text, 8),
        'cuenta_dias', (select extract(day from now() - u.created_at)::int from auth.users u where u.id = s.autor),
        'del_autor', (select count(*) from public.sugerencias q where q.autor = s.autor)) order by s.creado_en)
      from public.sugerencias s where s.estado = 'nueva'), '[]'::jsonb),
    'sugerencias_vistas', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'area', s.area, 'texto', s.texto, 'estado', s.estado, 'respuesta', s.respuesta, 'revisado_en', s.revisado_en) order by s.revisado_en desc)
      from (select * from public.sugerencias where estado <> 'nueva' order by revisado_en desc nulls last limit 30) s), '[]'::jsonb),
    'sugerencias_areas', coalesce((select jsonb_object_agg(area, n) from (select area, count(*) n from public.sugerencias where estado <> 'descartada' group by area) a), '{}'::jsonb),
    'suspendidas', coalesce((select jsonb_agg(jsonb_build_object('vitrina_id', x.id, 'slug', x.slug, 'titulo', x.borrador->>'titulo', 'suspension', x.suspension) order by x.suspension->>'en' desc)
      from public.vitrinas x where x.suspendida), '[]'::jsonb),
    'explorar', coalesce((select jsonb_agg(jsonb_build_object('vitrina_id', p.vitrina_id, 'slug', p.slug, 'titulo', p.titulo, 'tipo', p.tipo, 'publicado_en', p.publicado_en) order by p.publicado_en desc)
      from public.vitrinas_publicadas p where p.en_explorar and p.visible), '[]'::jsonb),
    'registro', coalesce((select jsonb_agg(jsonb_build_object('accion', g.accion, 'vitrina_id', g.vitrina_id, 'detalle', g.detalle, 'en', g.en) order by g.en desc)
      from (select * from privado.registro order by en desc limit 30) g), '[]'::jsonb));
end $function$
;

CREATE OR REPLACE FUNCTION public.mod_probar(tipo text, datos jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not privado.es_admin() then raise exception 'FORJA_NO_PERMITIDO'; end if;
  insert into privado.correos(user_id, tipo, datos) values (auth.uid(), 'prueba', datos || jsonb_build_object('de', tipo));
end $function$
;

CREATE OR REPLACE FUNCTION public.mod_resolver(v uuid, decision text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare n int;
begin
  if not privado.es_admin() then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if decision not in ('desestimado','mala_fe') then raise exception 'FORJA_DECISION'; end if;
  insert into public.avisos(user_id, tipo, titulo, texto)
    select r.autor, 'reporte', 'Revisamos tu reporte', 'Una persona del equipo revisó la vitrina que reportaste y no encontró que infrinja las normas de Forja. Gracias por ayudar a cuidar la comunidad.'
    from public.reportes r where r.vitrina_id = v and r.estado = 'pendiente' and decision = 'desestimado';
  update public.reportes set estado = decision, revisado_en = now() where vitrina_id = v and estado = 'pendiente';
  get diagnostics n = row_count;
  insert into privado.registro(admin, accion, vitrina_id, detalle) values (auth.uid(), 'reportes_' || decision, v, jsonb_build_object('cantidad', n));
  return n;
end $function$
;

CREATE OR REPLACE FUNCTION public.mod_responder(m uuid, respuesta text, avisar boolean DEFAULT true)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare a uuid; tp text;
begin
  if not privado.es_admin() then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if coalesce(btrim(respuesta), '') = '' then raise exception 'FORJA_FALTA_MENSAJE'; end if;
  update public.mensajes set estado = 'respondido', respuesta = mod_responder.respuesta, respondido_en = now() where id = m returning autor, tipo into a, tp;
  if not found then raise exception 'FORJA_NO_ENCONTRADA'; end if;
  -- al aceptar una apelación, mod_restaurar ya avisa con el mismo texto: no se repite
  if avisar then
    insert into public.avisos(user_id, tipo, titulo, texto, enlace) values (a, 'respuesta', case tp when 'apelacion' then 'Respuesta a tu apelación' when 'privacidad' then 'Respuesta a tu solicitud de datos' else 'Respuesta a tu mensaje' end, respuesta, 'cuenta/');
  end if;
  insert into privado.registro(admin, accion, detalle) values (auth.uid(), 'responder', jsonb_build_object('mensaje', m));
end $function$
;

CREATE OR REPLACE FUNCTION public.mod_restaurar(v uuid, mensaje text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare t text;
begin
  if not privado.es_admin() then raise exception 'FORJA_NO_PERMITIDO'; end if;
  update public.vitrinas set suspendida = false where id = v returning coalesce(borrador->>'titulo', slug) into t;
  if not found then raise exception 'FORJA_NO_ENCONTRADA'; end if;
  update public.vitrinas_publicadas set visible = true where vitrina_id = v;
  perform privado.avisar_duenos(v, 'restaurada', 'Tu vitrina «' || t || '» está visible otra vez', coalesce(nullif(btrim(mensaje), ''), 'Revisamos tu caso y levantamos la suspensión.'), 'vitrina/editar/?p=' || (select proyecto_id from public.vitrinas where id = v));
  insert into privado.registro(admin, accion, vitrina_id, detalle) values (auth.uid(), 'restaurar', v, jsonb_build_object('mensaje', mensaje));
end $function$
;

CREATE OR REPLACE FUNCTION public.mod_sugerencia(s uuid, estado text, respuesta text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare a uuid; r text := nullif(btrim(coalesce(respuesta, '')), '');
begin
  if not privado.es_admin() then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if mod_sugerencia.estado not in ('leida', 'anotada', 'descartada') then raise exception 'FORJA_NO_PERMITIDO'; end if;
  update public.sugerencias x set estado = mod_sugerencia.estado, respuesta = coalesce(r, x.respuesta), revisado_en = now() where x.id = s returning x.autor into a;
  if not found then raise exception 'FORJA_NO_ENCONTRADA'; end if;
  if r is not null then
    insert into public.avisos(user_id, tipo, titulo, texto, enlace) values (a, 'respuesta', 'Sobre tu sugerencia para Forja', r, 'planes/#sugerir');
  end if;
  insert into privado.registro(admin, accion, detalle) values (auth.uid(), 'sugerencia', jsonb_build_object('sugerencia', s, 'estado', mod_sugerencia.estado, 'respondida', r is not null));
end $function$
;

CREATE OR REPLACE FUNCTION public.mod_suspender(v uuid, motivo text, mensaje text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare t text;
begin
  if not privado.es_admin() then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if coalesce(btrim(mensaje), '') = '' then raise exception 'FORJA_FALTA_MENSAJE'; end if;
  update public.vitrinas set suspendida = true, suspension = jsonb_build_object('motivo', motivo, 'mensaje', mensaje, 'en', now()) where id = v returning coalesce(borrador->>'titulo', slug) into t;
  if not found then raise exception 'FORJA_NO_ENCONTRADA'; end if;
  update public.vitrinas_publicadas set visible = false, en_explorar = false where vitrina_id = v;
  insert into public.avisos(user_id, tipo, titulo, texto)
    select distinct r.autor, 'reporte', 'Tomamos medidas', 'Revisamos la vitrina que reportaste y la suspendimos. Gracias por ayudar a cuidar la comunidad.' from public.reportes r where r.vitrina_id = v and r.estado = 'pendiente';
  update public.reportes set estado = 'aceptado', revisado_en = now() where vitrina_id = v and estado = 'pendiente';
  perform privado.avisar_duenos(v, 'suspension', 'Tu vitrina «' || t || '» fue suspendida',
    'Motivo: ' || privado.motivo_txt(motivo) || E'.\n\n' || mensaje || E'\n\nTu proyecto y el borrador de la vitrina siguen intactos; solo dejó de verse en público. Si crees que es un error, puedes apelar desde el editor de la vitrina.', 'vitrina/editar/?p=' || (select proyecto_id from public.vitrinas where id = v));
  insert into privado.registro(admin, accion, vitrina_id, detalle) values (auth.uid(), 'suspender', v, jsonb_build_object('motivo', motivo, 'mensaje', mensaje));
end $function$
;

CREATE OR REPLACE FUNCTION public.mod_vitrina(v uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not privado.es_admin() then raise exception 'FORJA_NO_PERMITIDO'; end if;
  return (select jsonb_build_object('slug', x.slug, 'datos', coalesce(p.datos, x.anterior, x.borrador), 'publicado_en', p.publicado_en, 'suspendida', x.suspendida, 'suspension', x.suspension, 'fuera_de_explorar', x.fuera_de_explorar, 'en_explorar', coalesce(p.en_explorar, false))
          from public.vitrinas x left join public.vitrinas_publicadas p on p.vitrina_id = x.id where x.id = v);
end $function$
;

CREATE OR REPLACE FUNCTION public.mover_proyecto(p uuid, destino uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare pr public.proyectos; t text; tp int := privado.tope(destino, 'proyectos');
begin
  select * into pr from public.proyectos where id = p;
  if not found or pr.espacio_id = destino then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if not privado.es_dueno(pr.espacio_id) or not privado.escribe_en(destino) then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if exists(select 1 from public.vitrinas v where v.proyecto_id = p and v.publicada) and not privado.es_dueno(destino) then raise exception 'FORJA_MOVER_PUBLICADA'; end if;
  if tp is not null and pr.estado <> 'archivado' and privado.activos(destino) >= tp then raise exception 'FORJA_LIMITE_PROYECTOS'; end if;
  perform set_config('forja.mover', '1', true);
  foreach t in array array['secciones','referentes','pizarras','vitrinas','notas','proyecto_oportunidades','cotizaciones','rondas','colecciones','elementos'] loop
    execute format('update public.%I set espacio_id = $1 where proyecto_id = $2', t) using destino, p;
  end loop;
  update public.proyectos set espacio_id = destino, acceso = 'equipo' where id = p;
  delete from public.proyecto_accesos where proyecto_id = p;
  perform set_config('forja.mover', '', true);
  if (select tipo from public.espacios where id = destino) = 'equipo' then perform privado.registrar(destino, 'llego', jsonb_build_object('proyecto', pr.nombre)); end if;
  if (select tipo from public.espacios where id = pr.espacio_id) = 'equipo' then perform privado.registrar(pr.espacio_id, 'salio', jsonb_build_object('proyecto', pr.nombre)); end if;
end $function$
;

CREATE OR REPLACE FUNCTION public.persona_cambiar(p uuid, u uuid, rol text, areas jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not privado.publica(p) then raise exception 'FORJA_NO_PERMITIDO'; end if;
  update public.proyecto_accesos a set rol = case when persona_cambiar.rol in ('editor','lector') then persona_cambiar.rol else a.rol end,
    areas = nullif(privado.limpiar_areas(persona_cambiar.areas), '{}'::jsonb) where a.proyecto_id = p and a.user_id = u;
end $function$
;

CREATE OR REPLACE FUNCTION public.persona_quitar(p uuid, u uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_nombre text; v_correo text;
begin
  if u <> auth.uid() and not privado.publica(p) then raise exception 'FORJA_NO_PERMITIDO'; end if;
  select x.nombre into v_nombre from public.proyectos x where x.id = p;
  select au.email into v_correo from auth.users au where au.id = u;
  delete from public.proyecto_accesos a where a.proyecto_id = p and a.user_id = u;
  if u = auth.uid() then
    insert into public.avisos(user_id, tipo, titulo, texto, enlace)
      select m.user_id, 'invitacion', 'Alguien salió de tu proyecto', v_correo || ' dejó «' || v_nombre || '».', 'proyecto/?p=' || p
      from public.proyectos x join public.miembros m on m.espacio_id = x.espacio_id and m.rol = 'dueno' where x.id = p;
  else
    insert into public.avisos(user_id, tipo, titulo, texto, enlace) values (u, 'invitacion', 'Ya no tienes acceso a un proyecto', 'Quien creó «' || v_nombre || '» te quitó el acceso. Lo que escribiste ahí queda en el proyecto.', null);
  end if;
end $function$
;

CREATE OR REPLACE FUNCTION public.proyecto_acceso(p uuid, acceso text, personas jsonb DEFAULT '[]'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare pr public.proyectos; it jsonb;
begin
  select * into pr from public.proyectos where id = p;
  if not found or not privado.es_dueno(pr.espacio_id) or (select tipo from public.espacios where id = pr.espacio_id) <> 'equipo' then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if acceso not in ('equipo','reservado') then raise exception 'FORJA_NO_PERMITIDO'; end if;
  update public.proyectos set acceso = proyecto_acceso.acceso where id = p;
  delete from public.proyecto_accesos a where a.proyecto_id = p and exists(select 1 from public.miembros m where m.espacio_id = pr.espacio_id and m.user_id = a.user_id);
  if acceso = 'reservado' then
    for it in select * from jsonb_array_elements(coalesce(personas, '[]'::jsonb)) loop
      if exists(select 1 from public.miembros m where m.espacio_id = pr.espacio_id and m.user_id = (it->>'user_id')::uuid and m.rol <> 'dueno') then
        insert into public.proyecto_accesos(proyecto_id, user_id, rol) values (p, (it->>'user_id')::uuid, case when it->>'rol' = 'lector' then 'lector' else 'editor' end) on conflict do nothing;
      end if;
    end loop;
  end if;
  perform privado.registrar(pr.espacio_id, 'acceso', jsonb_build_object('proyecto', pr.nombre, 'acceso', acceso, 'personas', (select count(*) from public.proyecto_accesos where proyecto_id = p)));
end $function$
;

CREATE OR REPLACE FUNCTION public.proyecto_personas(p uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare pr public.proyectos; dueno boolean; esp public.espacios;
begin
  select * into pr from public.proyectos where id = p;
  if not found or not privado.ve(p) then raise exception 'FORJA_NO_PERMITIDO'; end if;
  select * into esp from public.espacios where id = pr.espacio_id;
  dueno := privado.es_dueno(pr.espacio_id);
  return jsonb_build_object(
    'yo', auth.uid(), 'dueno', dueno, 'mas', privado.es_mas(pr.espacio_id), 'max', privado.max_invitados(p), 'tipo', esp.tipo,
    'duenos', (select coalesce(jsonb_agg(u.email order by u.email), '[]'::jsonb) from public.miembros m join auth.users u on u.id = m.user_id where m.espacio_id = pr.espacio_id and m.rol = 'dueno'),
    'personas', (select coalesce(jsonb_agg(jsonb_build_object('user_id', a.user_id, 'correo', u.email, 'rol', a.rol, 'areas', coalesce(a.areas, '{}'::jsonb), 'desde', a.creado_en,
                   'extra', not privado.es_mas(pr.espacio_id) and (select count(*) from public.proyecto_accesos b where b.proyecto_id = p and not exists(select 1 from public.miembros mb where mb.espacio_id = pr.espacio_id and mb.user_id = b.user_id) and (b.creado_en, b.user_id) < (a.creado_en, a.user_id)) >= 1)
                 order by a.creado_en), '[]'::jsonb)
                 from public.proyecto_accesos a join auth.users u on u.id = a.user_id
                 where a.proyecto_id = p and not exists(select 1 from public.miembros m where m.espacio_id = pr.espacio_id and m.user_id = a.user_id)),
    'pendientes', case when dueno then (select coalesce(jsonb_agg(jsonb_build_object('id', i.id, 'correo', i.correo, 'rol', i.rol, 'areas', coalesce(i.areas, '{}'::jsonb), 'creado_en', i.creado_en, 'expira_en', i.expira_en) order by i.creado_en), '[]'::jsonb)
                 from public.invitaciones i where i.proyecto_id = p and i.aceptada_en is null and i.anulada_en is null and i.expira_en > now()) end);
end $function$
;

CREATE OR REPLACE FUNCTION public.publicar_vitrina(v uuid, datos jsonb, listar boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare r public.vitrinas; ahora timestamptz := now(); pr public.proyectos; explorar boolean := false; falta text := null; palabras int;
begin
  select * into r from public.vitrinas x where x.id = v;
  if not found or not privado.publica(r.proyecto_id) then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if r.suspendida then raise exception 'FORJA_VITRINA_SUSPENDIDA'; end if;
  if jsonb_typeof(datos) <> 'object' or octet_length(datos::text) > 1500000 then raise exception 'FORJA_VITRINA_GRANDE'; end if;
  -- enlaces: hasta 10 en "Dónde seguirlo"; de pago o apoyo, hasta 2 en toda la vitrina
  if jsonb_typeof(datos->'enlaces') = 'array' and jsonb_array_length(datos->'enlaces') > 10 then raise exception 'FORJA_VITRINA_ENLACES'; end if;
  if (select count(*) from (
        select e->>'url' u from jsonb_array_elements(case when jsonb_typeof(datos->'enlaces') = 'array' then datos->'enlaces' else '[]'::jsonb end) e
        union all select g->>'valor' from jsonb_array_elements(case when jsonb_typeof(datos->'galeria') = 'array' then datos->'galeria' else '[]'::jsonb end) g
      ) x where privado.es_pago(x.u)) > 2 then raise exception 'FORJA_VITRINA_PAGOS'; end if;
  -- cada recompensa puede tener su propio enlace de pago, pero solo de servicios de pago conocidos (no cuenta en el límite de 2)
  if exists(select 1 from jsonb_array_elements(case when jsonb_typeof(datos #> '{recompensas,tiers}') = 'array' then datos #> '{recompensas,tiers}' else '[]'::jsonb end) t
            where coalesce(t->>'pago', '') <> '' and not privado.es_pago(t->>'pago')) then raise exception 'FORJA_VITRINA_PAGO_TIER'; end if;
  if not privado.es_mas(r.espacio_id) then
    if not privado.editable(r.proyecto_id) then raise exception 'FORJA_SOLO_LECTURA'; end if;
    if jsonb_typeof(datos->'pizarras') = 'array' and jsonb_array_length(datos->'pizarras') > 0 then raise exception 'FORJA_SOLO_MAS'; end if;
  end if;
  select * into pr from public.proyectos p where p.id = r.proyecto_id;
  if listar then
    select coalesce(sum(privado.palabras(h->>'texto')), 0) into palabras from jsonb_array_elements(case when jsonb_typeof(datos->'historia') = 'array' then datos->'historia' else '[]'::jsonb end) h;
    if r.fuera_de_explorar then falta := 'moderacion';
    elsif (select u.created_at from auth.users u where u.id = auth.uid()) > now() - interval '3 days' then falta := 'cuenta_nueva';
    elsif not exists(select 1 from public.aceptaciones a where a.user_id = auth.uid() and a.documento = 'normas') then falta := 'normas';
    elsif coalesce(btrim(datos->>'titulo'), '') = '' or palabras < 40 then falta := 'contenido';
    else explorar := true; end if;
  end if;
  update public.vitrinas set anterior = (select p.datos from public.vitrinas_publicadas p where p.vitrina_id = v), publicada = true, publicado_en = ahora, listar = publicar_vitrina.listar where id = v;
  insert into public.vitrinas_publicadas(slug, vitrina_id, datos, publicado_en, visible, en_explorar, titulo, lema, firma, tipo, formato, estado, portada, acento)
    values (r.slug, v, datos, ahora, true, explorar, left(datos->>'titulo', 160), left(datos->>'lema', 240), left(datos->>'firma', 80), pr.tipo, pr.formato, pr.estado, datos#>>'{portada,url}', datos->>'acento')
    on conflict (vitrina_id) do update set slug = excluded.slug, datos = excluded.datos, publicado_en = excluded.publicado_en, visible = true, en_explorar = excluded.en_explorar,
      titulo = excluded.titulo, lema = excluded.lema, firma = excluded.firma, tipo = excluded.tipo, formato = excluded.formato, estado = excluded.estado, portada = excluded.portada, acento = excluded.acento;
  return jsonb_build_object('publicado_en', ahora, 'en_explorar', explorar, 'falta', falta);
end $function$
;

CREATE OR REPLACE FUNCTION public.quitar_lector(l uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare rp uuid;
begin
  select ro.proyecto_id into rp from public.ronda_lectores x join public.rondas ro on ro.id = x.ronda_id where x.id = l;
  if rp is null or privado.acceso_area(rp, 'taller') is distinct from 'editar' then raise exception 'FORJA_NO_PERMITIDO'; end if;
  update public.ronda_lectores set quitado_en = now() where id = l and quitado_en is null;
end $function$
;

CREATE OR REPLACE FUNCTION public.rechazar_invitacion(t uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  update public.invitaciones i set anulada_en = now() from auth.users u
    where i.token = t and i.aceptada_en is null and u.id = auth.uid() and lower(u.email) = i.correo;
end $function$
;

CREATE OR REPLACE FUNCTION public.recompensas_de(v uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare pid uuid;
begin
  select x.proyecto_id into pid from public.vitrinas x where x.id = v;
  if pid is null or not privado.ve(pid) then raise exception 'FORJA_NO_PERMITIDO'; end if;
  return jsonb_build_object('conteo', (select coalesce(jsonb_object_agg(tier, n), '{}'::jsonb) from (select i.tier, count(*) n from public.recompensa_interes i where i.vitrina_id = v group by 1) z),
    'personas', (select count(distinct i.user_id) from public.recompensa_interes i where i.vitrina_id = v));
end $function$
;

CREATE OR REPLACE FUNCTION public.reportar_vitrina(slug text, motivo text, detalle text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid := auth.uid(); v public.vitrinas; creado timestamptz;
begin
  if uid is null then raise exception 'FORJA_REPORTE_SIN_CUENTA'; end if;
  select x.* into v from public.vitrinas x join public.vitrinas_publicadas p on p.vitrina_id = x.id where p.slug = reportar_vitrina.slug and p.visible;
  if not found then raise exception 'FORJA_NO_ENCONTRADA'; end if;
  if privado.es_miembro(v.espacio_id) then raise exception 'FORJA_REPORTE_PROPIO'; end if;
  select u.created_at into creado from auth.users u where u.id = uid;
  if creado > now() - interval '1 day' then raise exception 'FORJA_REPORTE_CUENTA_NUEVA'; end if;
  if (select count(*) from public.reportes r where r.autor = uid and r.estado = 'mala_fe') >= 2 then raise exception 'FORJA_REPORTE_BLOQUEADO'; end if;
  if (select count(*) from public.reportes r where r.autor = uid and r.creado_en > now() - interval '1 day') >= 5 then raise exception 'FORJA_REPORTE_LIMITE'; end if;
  if exists(select 1 from public.reportes r where r.autor = uid and r.vitrina_id = v.id) then raise exception 'FORJA_REPORTE_REPETIDO'; end if;
  insert into public.reportes(vitrina_id, autor, motivo, detalle) values (v.id, uid, reportar_vitrina.motivo, nullif(btrim(coalesce(reportar_vitrina.detalle, '')), ''));
end $function$
;

CREATE OR REPLACE FUNCTION public.responder_ronda(t uuid, respuestas jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare l public.ronda_lectores; k text; v text; validas jsonb;
begin
  l := privado.lector_de(t); perform privado.ronda_abierta(l);
  if jsonb_typeof(respuestas) <> 'object' then raise exception 'FORJA_NO_PERMITIDO'; end if;
  select coalesce(jsonb_agg(q->'k'), '[]'::jsonb) into validas from public.rondas r, jsonb_array_elements(r.preguntas) q where r.id = l.ronda_id;
  for k, v in select key, btrim(value #>> '{}') from jsonb_each(respuestas) loop
    if not validas ? k then continue; end if;
    if coalesce(v, '') = '' then delete from public.ronda_respuestas where lector_id = l.id and pregunta = k;
    else
      insert into public.ronda_respuestas(ronda_id, lector_id, pregunta, texto) values (l.ronda_id, l.id, k, left(v, 4000))
        on conflict (lector_id, pregunta) do update set texto = excluded.texto, actualizado_en = now();
    end if;
  end loop;
end $function$
;

CREATE OR REPLACE FUNCTION public.ronda_panel(r uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare ro public.rondas; maneja boolean;
begin
  select * into ro from public.rondas where id = r;
  if not found or privado.acceso_area(ro.proyecto_id, 'taller') is null then raise exception 'FORJA_NO_PERMITIDO'; end if;
  maneja := privado.acceso_area(ro.proyecto_id, 'taller') = 'editar';
  return jsonb_build_object(
    'maneja', maneja, 'tope', privado.tope(ro.espacio_id, 'lectores'), 'mas', privado.es_mas(ro.espacio_id),
    'lectores', coalesce((select jsonb_agg(jsonb_build_object('id', l.id, 'nombre', l.nombre, 'token', case when maneja and l.quitado_en is null then l.token end,
        'entro', l.user_id is not null, 'quitado', l.quitado_en is not null, 'creado_en', l.creado_en,
        'respuestas', (select count(*) from public.ronda_respuestas x where x.lector_id = l.id),
        'comentarios', (select count(*) from public.ronda_comentarios x where x.lector_id = l.id)) order by l.creado_en)
      from public.ronda_lectores l where l.ronda_id = r), '[]'::jsonb),
    'respuestas', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'lector', x.lector_id, 'pregunta', x.pregunta, 'texto', x.texto, 'marca', x.marca, 'en', x.actualizado_en) order by x.creado_en)
      from public.ronda_respuestas x where x.ronda_id = r), '[]'::jsonb),
    'comentarios', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'lector', c.lector_id, 'parte', c.parte, 'parrafo', c.parrafo, 'cita', c.cita, 'texto', c.texto, 'marca', c.marca, 'en', c.creado_en) order by c.parte, c.parrafo, c.creado_en)
      from public.ronda_comentarios c where c.ronda_id = r), '[]'::jsonb));
end $function$
;

CREATE OR REPLACE FUNCTION public.seguidores_de(v uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare e uuid; ult timestamptz;
begin
  select x.proyecto_id into e from public.vitrinas x where x.id = v;
  if e is null or not privado.ve(e) then raise exception 'FORJA_NO_PERMITIDO'; end if;
  select max(en) into ult from privado.envios_vitrina where vitrina_id = v;
  return jsonb_build_object('total', (select count(*) from public.seguidores s where s.vitrina_id = v),
    'ultimo_envio', ult, 'proximo', case when ult is null then null else ult + interval '7 days' end,
    'en_cola', (select count(*) from privado.correos c where c.tipo = 'vitrina' and c.enviado_en is null and c.datos->>'vitrina_id' = v::text));
end $function$
;

CREATE OR REPLACE FUNCTION public.seguir_vitrina(slug text, seguir boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid := auth.uid(); vid uuid; p public.vitrinas_publicadas;
begin
  if uid is null then raise exception 'FORJA_SEGUIR_SIN_CUENTA'; end if;
  if not seguir then
    select v.id into vid from public.vitrinas v where v.slug = seguir_vitrina.slug;
    delete from public.seguidores s where s.vitrina_id = vid and s.user_id = uid;
    return public.estado_seguir(slug);
  end if;
  select * into p from public.vitrinas_publicadas x where x.slug = seguir_vitrina.slug and x.visible;
  if not found then raise exception 'FORJA_NO_ENCONTRADA'; end if;
  if coalesce(p.datos #>> '{seguir,activo}', 'false') <> 'true' then raise exception 'FORJA_SEGUIR_CERRADO'; end if;
  if exists(select 1 from public.vitrinas v join public.miembros m on m.espacio_id = v.espacio_id where v.id = p.vitrina_id and m.user_id = uid) then raise exception 'FORJA_SEGUIR_PROPIA'; end if;
  if (select count(*) from public.seguidores s where s.user_id = uid and s.creado_en > now() - interval '1 day') >= 30 then raise exception 'FORJA_SEGUIR_LIMITE'; end if;
  insert into public.seguidores(vitrina_id, user_id) values (p.vitrina_id, uid) on conflict do nothing;
  return public.estado_seguir(slug);
end $function$
;

CREATE OR REPLACE FUNCTION public.soy_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$ select privado.es_admin(); $function$
;

CREATE OR REPLACE FUNCTION public.sugerir(texto text, area text DEFAULT 'otra'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid := auth.uid(); t text := btrim(regexp_replace(coalesce(texto, ''), '\s+', ' ', 'g')); nuevo uuid;
begin
  if uid is null then raise exception 'FORJA_SUGERIR_SIN_CUENTA'; end if;
  if not exists(select 1 from auth.users u where u.id = uid and u.email_confirmed_at is not null) then raise exception 'FORJA_SUGERIR_SIN_CUENTA'; end if;
  if char_length(t) < 10 or char_length(t) > 800 then raise exception 'FORJA_SUGERIR_TEXTO'; end if;
  if (select count(*) from public.sugerencias s where s.autor = uid and s.creado_en > now() - interval '1 day') >= 5 then raise exception 'FORJA_SUGERIR_LIMITE'; end if;
  if exists(select 1 from public.sugerencias s where s.autor = uid and lower(s.texto) = lower(t)) then raise exception 'FORJA_SUGERIR_REPETIDA'; end if;
  insert into public.sugerencias(autor, area, texto)
    values (uid, case when sugerir.area in ('escritura','impresion','pizarras','organizacion','venta','presentacion','equipo','planes') then sugerir.area else 'otra' end, t)
    returning id into nuevo;
  return nuevo;
end $function$
;

CREATE OR REPLACE FUNCTION public.tocar_actualizado()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ begin new.actualizado_en=now(); return new; end $function$
;

CREATE OR REPLACE FUNCTION public.ver_invitacion(t uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select jsonb_build_object('proyecto', p.nombre, 'tipo', p.tipo, 'de', split_part(u.email, '@', 1),
    'para', left(i.correo, 2) || repeat('•', greatest(char_length(split_part(i.correo, '@', 1)) - 2, 1)) || '@' || split_part(i.correo, '@', 2),
    'estado', case when i.anulada_en is not null then 'anulada' when i.aceptada_en is not null then 'aceptada' when i.expira_en < now() then 'vencida' else 'vigente' end,
    'proyecto_id', case when i.aceptada_en is not null and i.aceptada_por = auth.uid() then p.id end,
    'mia', coalesce((select lower(x.email) = i.correo from auth.users x where x.id = auth.uid()), false))
  from public.invitaciones i join public.proyectos p on p.id = i.proyecto_id left join auth.users u on u.id = i.invitado_por where i.token = t
$function$
;

CREATE OR REPLACE FUNCTION public.ver_ronda(t uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare l public.ronda_lectores; ro public.rondas; pr public.proyectos;
begin
  if auth.uid() is null then
    select ro2.* into ro from public.ronda_lectores x join public.rondas ro2 on ro2.id = x.ronda_id where x.token = t and x.quitado_en is null;
    if not found then raise exception 'FORJA_RONDA_NO'; end if;
    return jsonb_build_object('sin_cuenta', true, 'proyecto', (select nombre from public.proyectos where id = ro.proyecto_id), 'tipo', (select tipo from public.proyectos where id = ro.proyecto_id));
  end if;
  l := privado.lector_de(t);
  select * into ro from public.rondas where id = l.ronda_id;
  select * into pr from public.proyectos where id = ro.proyecto_id;
  return jsonb_build_object('proyecto', pr.nombre, 'tipo', pr.tipo, 'titulo', ro.titulo, 'numero', ro.numero, 'estado', ro.estado, 'cierra', ro.cierra,
    'abierta', ro.estado = 'abierta' and (ro.cierra is null or ro.cierra >= current_date),
    'contenido', ro.contenido, 'preguntas', ro.preguntas, 'nombre', l.nombre,
    'copia_para', (select email from auth.users where id = l.user_id),
    'respuestas', coalesce((select jsonb_object_agg(x.pregunta, x.texto) from public.ronda_respuestas x where x.lector_id = l.id), '{}'::jsonb),
    'comentarios', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'parte', c.parte, 'parrafo', c.parrafo, 'cita', c.cita, 'texto', c.texto) order by c.creado_en) from public.ronda_comentarios c where c.lector_id = l.id), '[]'::jsonb));
end $function$
;

CREATE OR REPLACE FUNCTION privado.acceso(p uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select privado.acceso_area(p, 'taller')
$function$
;

CREATE OR REPLACE FUNCTION privado.acceso_area(p uuid, area text)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select case
    when m.rol = 'dueno' then 'editar'
    when a.user_id is not null then
      case coalesce(a.areas->>area, case a.rol when 'editor' then 'editar' else 'ver' end)
        when 'no' then null
        when 'editar' then case when not privado.es_mas(pr.espacio_id)
            and (select count(*) from public.proyecto_accesos b where b.proyecto_id = pr.id
                 and not exists(select 1 from public.miembros mb where mb.espacio_id = pr.espacio_id and mb.user_id = b.user_id)
                 and (b.creado_en, b.user_id) < (a.creado_en, a.user_id)) >= 1 then 'ver' else 'editar' end
        else 'ver' end
    when pr.acceso = 'equipo' and m.rol = 'editor' then 'editar'
    when pr.acceso = 'equipo' and m.rol = 'lector' then 'ver'
  end
  from public.proyectos pr
  left join public.miembros m on m.espacio_id = pr.espacio_id and m.user_id = (select auth.uid())
  left join public.proyecto_accesos a on a.proyecto_id = pr.id and a.user_id = (select auth.uid())
  where pr.id = p
$function$
;

CREATE OR REPLACE FUNCTION privado.activos(e uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select count(*)::int from public.proyectos p where p.espacio_id=e and p.estado<>'archivado';
$function$
;

CREATE OR REPLACE FUNCTION privado.avisar_duenos(v uuid, tipo text, titulo text, texto text, enlace text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  insert into public.avisos(user_id, tipo, titulo, texto, enlace)
  select m.user_id, tipo, titulo, texto, enlace from public.miembros m join public.vitrinas x on x.espacio_id = m.espacio_id where x.id = v and m.rol = 'dueno';
$function$
;

CREATE OR REPLACE FUNCTION privado.despachar()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if exists(select 1 from privado.correos where enviado_en is null and intentos < 3) then
    perform net.http_post(
      url := 'https://gfkiwldxxvffnkjcesws.supabase.co/functions/v1/enviar-correos',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-forja-clave', (select valor from privado.config where clave = 'cola_clave')),
      body := '{}'::jsonb, timeout_milliseconds := 60000);
  end if;
end $function$
;

CREATE OR REPLACE FUNCTION privado.edita(p uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select coalesce(privado.acceso(p) = 'editar', false)
$function$
;

CREATE OR REPLACE FUNCTION privado.edita_area_en(p uuid, area text, e uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select coalesce(privado.acceso_area(p, area) = 'editar', false) and exists(select 1 from public.proyectos x where x.id = p and x.espacio_id = e)
$function$
;

CREATE OR REPLACE FUNCTION privado.editable(proy uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select coalesce((select case
      when t is null then true
      when privado.es_mas(p.espacio_id) then privado.activos(p.espacio_id) <= t
      else p.estado <> 'archivado' and privado.activos(p.espacio_id) <= t end
    from public.proyectos p, lateral (select privado.tope(p.espacio_id, 'proyectos') as t) l where p.id = proy), true);
$function$
;

CREATE OR REPLACE FUNCTION privado.es_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists(select 1 from privado.admin_correos c join auth.users u on lower(u.email) = lower(c.email) where u.id = (select auth.uid()));
$function$
;

CREATE OR REPLACE FUNCTION privado.es_dueno(e uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select coalesce(privado.rol_en(e) = 'dueno', false)
$function$
;

CREATE OR REPLACE FUNCTION privado.es_equipo(correo text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
  select lower(coalesce(correo, '')) like '%@digitalmonster.cl'
$function$
;

CREATE OR REPLACE FUNCTION privado.es_mas(e uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select privado.plan_de(e) in ('mas', 'estudio');
$function$
;

CREATE OR REPLACE FUNCTION privado.es_miembro(e uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists(select 1 from public.miembros m where m.espacio_id=e and m.user_id=(select auth.uid()));
$function$
;

CREATE OR REPLACE FUNCTION privado.es_pago(u text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
  select coalesce(lower(u), '') ~ '^https?://([a-z0-9-]+\.)*(mpago\.la|mercadopago\.[a-z.]+|paypal\.(me|com)|ko-fi\.com|buymeacoffee\.com|patreon\.com|flow\.cl|khipu\.com|webpay\.cl|transbank\.cl|sumup\.[a-z.]+|stripe\.com|gofundme\.com|kickstarter\.com|gamefound\.com|indiegogo\.com|verkami\.com|idea\.me|crowdfundchile\.cl|gumroad\.com|hotmart\.com|cafecito\.app|apoia\.se)([/?#:]|$)'
$function$
;

CREATE OR REPLACE FUNCTION privado.escribe_en(e uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select coalesce(privado.rol_en(e) in ('dueno','editor'), false)
$function$
;

CREATE OR REPLACE FUNCTION privado.lector_de(t uuid)
 RETURNS ronda_lectores
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare l public.ronda_lectores; uid uuid := auth.uid();
begin
  select * into l from public.ronda_lectores where token = t;
  if not found or l.quitado_en is not null then raise exception 'FORJA_RONDA_NO'; end if;
  if uid is null then raise exception 'FORJA_RONDA_SIN_CUENTA'; end if;
  if l.user_id is null then
    if not exists(select 1 from auth.users u where u.id = uid and u.email_confirmed_at is not null) then raise exception 'FORJA_RONDA_SIN_CUENTA'; end if;
    update public.ronda_lectores set user_id = uid, reclamado_en = now() where id = l.id and user_id is null returning * into l;
    if l.user_id is null then select * into l from public.ronda_lectores where token = t; end if;
  end if;
  if l.user_id <> uid then raise exception 'FORJA_RONDA_OTRA'; end if;
  return l;
end $function$
;

CREATE OR REPLACE FUNCTION privado.limite(clave text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
  select case clave when 'proyectos' then 3 when 'palabras' then 20000 when 'referentes' then 30 when 'pizarras' then 1 when 'tarjetas' then 20
    when 'ideas' then 50 when 'analisis' then 3 when 'colecciones' then 2 when 'fichas' then 60 end;
$function$
;

CREATE OR REPLACE FUNCTION privado.limpiar_areas(areas jsonb)
 RETURNS jsonb
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
  select coalesce((select jsonb_object_agg(k, v) from jsonb_each_text(coalesce(areas, '{}'::jsonb)) as x(k, v)
    where k in ('taller','referentes','pizarra','costos','oportunidades','bitacora','vitrina') and v in ('editar','ver','no')), '{}'::jsonb)
$function$
;

CREATE OR REPLACE FUNCTION privado.maneja_rondas(p uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select privado.acceso_area(p, 'taller') = 'editar' and privado.editable(p)
$function$
;

CREATE OR REPLACE FUNCTION privado.max_invitados(p uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select privado.tope((select espacio_id from public.proyectos where id = p), 'invitados')
$function$
;

CREATE OR REPLACE FUNCTION privado.mi_lectura(t uuid)
 RETURNS ronda_lectores
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare l public.ronda_lectores;
begin
  select * into l from public.ronda_lectores where token = t and user_id = auth.uid();
  if not found then raise exception 'FORJA_RONDA_NO'; end if;
  return l;
end $function$
;

CREATE OR REPLACE FUNCTION privado.motivo_txt(m text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
  select case m when 'estafa' then 'posible estafa o engaño' when 'ofensivo' then 'contenido ofensivo, de odio o violento' when 'derechos' then 'uso de obras o marcas ajenas sin permiso'
    when 'datos' then 'datos personales de otras personas' when 'menores' then 'contenido que pone en riesgo a menores de edad' when 'spam' then 'spam o publicidad engañosa' else 'incumplimiento de las normas de la comunidad' end;
$function$
;

CREATE OR REPLACE FUNCTION privado.palabras_proyecto(p uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select (coalesce((select sum(privado.palabras(s.texto)) from public.secciones s where s.proyecto_id = p), 0)
        + coalesce((select sum(privado.palabras(e.texto)) from public.elementos e where e.proyecto_id = p), 0))::integer
$function$
;

CREATE OR REPLACE FUNCTION privado.palabras(t text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
  select coalesce(array_length(regexp_split_to_array(nullif(btrim(coalesce(t,'')),''),'\s+'),1),0);
$function$
;

CREATE OR REPLACE FUNCTION privado.plan_de(e uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select coalesce((select case when x.plan in ('mas', 'estudio') and (x.plan_hasta is null or x.plan_hasta > now()) then x.plan else 'libre' end
                   from public.espacios x where x.id = e), 'libre');
$function$
;

CREATE OR REPLACE FUNCTION privado.prefs(u uuid)
 RETURNS correo_prefs
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare r public.correo_prefs;
begin
  select * into r from public.correo_prefs where user_id = u;
  if not found then insert into public.correo_prefs(user_id) values (u) returning * into r; end if;
  return r;
end $function$
;

CREATE OR REPLACE FUNCTION privado.publica(p uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select coalesce((select privado.es_dueno(x.espacio_id) from public.proyectos x where x.id = p), false)
$function$
;

CREATE OR REPLACE FUNCTION privado.registrar(e uuid, accion text, detalle jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  insert into public.espacio_registro(espacio_id, quien, accion, detalle) values (e, auth.uid(), accion, coalesce(detalle, '{}'::jsonb))
$function$
;

CREATE OR REPLACE FUNCTION privado.rol_en(e uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select m.rol from public.miembros m where m.espacio_id = e and m.user_id = (select auth.uid())
$function$
;

CREATE OR REPLACE FUNCTION privado.ronda_abierta(l ronda_lectores)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not exists(select 1 from public.rondas r where r.id = l.ronda_id and r.estado = 'abierta' and (r.cierra is null or r.cierra >= current_date)) then
    raise exception 'FORJA_RONDA_CERRADA';
  end if;
end $function$
;



CREATE OR REPLACE FUNCTION privado.t_borrar_personal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin delete from public.espacios e where e.creado_por = old.id and e.tipo = 'personal'; return old; end $function$
;

CREATE OR REPLACE FUNCTION privado.t_confirmado()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if new.email_confirmed_at is not null and (tg_op = 'INSERT' or old.email_confirmed_at is null or new.email is distinct from old.email) then
    if privado.es_equipo(new.email) then update public.espacios set plan = 'mas', plan_hasta = null where creado_por = new.id and tipo = 'personal'; end if;
    perform privado.unir_equipos(new.id, new.email);
  end if;
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION privado.t_correo_prefs()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  new.actualizado_en := now();
  if new.boletin and (tg_op = 'INSERT' or not old.boletin) then new.boletin_desde := now(); end if;
  if not new.boletin then new.boletin_desde := null; end if;
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION privado.t_espacio_fijo()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  if new.espacio_id is distinct from old.espacio_id and coalesce(current_setting('forja.mover', true), '') <> '1' then raise exception 'FORJA_NO_PERMITIDO'; end if;
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION privado.t_ideas()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare t int;
begin
  if tg_op = 'UPDATE' then
    if new.espacio_id <> old.espacio_id then raise exception 'FORJA_ESPACIO_FIJO'; end if;
    new.creado_por := old.creado_por;   -- quién la anotó no cambia
    new.creado_en := old.creado_en;
  else
    new.creado_por := coalesce(auth.uid(), new.creado_por);
    new.creado_en := now();
    -- El tope cuenta solo las ideas que siguen en el Semillero: las que ya brotaron no castigan.
    t := privado.tope(new.espacio_id, 'ideas');
    if t is not null and (select count(*) from public.ideas i where i.espacio_id = new.espacio_id and i.proyecto_id is null) >= t then
      raise exception 'FORJA_LIMITE_IDEAS' using hint = 'Tu plan permite ' || t || ' ideas en el Semillero.';
    end if;
  end if;
  if new.proyecto_id is not null and (tg_op = 'INSERT' or new.proyecto_id is distinct from old.proyecto_id)
     and not privado.ve(new.proyecto_id) then
    raise exception 'FORJA_NO_PERMITIDO';
  end if;
  new.texto := btrim(new.texto);
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION privado.t_lectura()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if new.proyecto_id is null then return new; end if;
  if not privado.editable(new.proyecto_id) then raise exception 'FORJA_SOLO_LECTURA'; end if;
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION privado.t_mensajes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if (select count(*) from public.mensajes m where m.autor = new.autor and m.creado_en > now() - interval '1 day') >= 5 then
    raise exception 'FORJA_MENSAJES_LIMITE';
  end if;
  if new.vitrina_id is not null and not exists(select 1 from public.vitrinas v where v.id = new.vitrina_id and privado.edita(v.proyecto_id)) then
    raise exception 'FORJA_NO_PERMITIDO';
  end if;
  new.estado := 'abierto'; new.respuesta := null; new.respondido_en := null; new.creado_en := now();
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION privado.t_pizarras()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare antes int; despues int; primera uuid;
begin
  -- Desconectar de Fichas (o que se borre la colección) siempre se puede.
  if tg_op = 'UPDATE' and new.coleccion_id is null and old.coleccion_id is not null and new.datos = old.datos and new.modo = old.modo and new.nombre = old.nombre then
    return new;
  end if;
  -- Conectar una pizarra con una colección de Fichas: solo el equipo (mientras Fichas esté en prueba) y del mismo proyecto.
  if new.coleccion_id is not null and (tg_op = 'INSERT' or new.coleccion_id is distinct from old.coleccion_id)
     and coalesce(current_setting('forja.mover', true), '') <> '1' then
    if not privado.herramientas_equipo() then raise exception 'FORJA_SOLO_EQUIPO'; end if;
    if new.modo = 'escaleta' or not exists(select 1 from public.colecciones c where c.id = new.coleccion_id and c.proyecto_id = new.proyecto_id) then raise exception 'FORJA_NO_PERMITIDO'; end if;
  end if;
  if octet_length(new.datos::text) > 1500000 or privado.tarjetas(new.datos) > 1000 then
    raise exception 'FORJA_PIZARRA_GRANDE';
  end if;
  despues := privado.tarjetas(new.datos);
  antes := case when tg_op='UPDATE' then privado.tarjetas(old.datos) else 0 end;
  if privado.es_mas(new.espacio_id) then
    if not privado.editable(new.proyecto_id) and not (tg_op='UPDATE' and despues < antes and new.modo = old.modo) then
      raise exception 'FORJA_SOLO_LECTURA';
    end if;
    return new;
  end if;
  if tg_op='INSERT' then
    if not privado.editable(new.proyecto_id) then raise exception 'FORJA_SOLO_LECTURA'; end if;
    if new.modo<>'libre' then raise exception 'FORJA_SOLO_MAS'; end if;
    if exists(select 1 from public.pizarras z where z.proyecto_id=new.proyecto_id) then
      raise exception 'FORJA_LIMITE_PIZARRAS' using hint='El plan gratis permite una pizarra por proyecto.';
    end if;
    if despues > privado.limite('tarjetas') then raise exception 'FORJA_LIMITE_TARJETAS'; end if;
    return new;
  end if;
  select z.id into primera from public.pizarras z where z.proyecto_id=new.proyecto_id and z.modo='libre' order by z.creado_en, z.id limit 1;
  if new.modo<>old.modo or old.modo<>'libre' or primera is distinct from new.id or not privado.editable(new.proyecto_id) then
    if despues < antes and new.modo=old.modo then return new; end if; -- quitar tarjetas siempre se puede
    if old.modo<>'libre' or new.modo<>'libre' then raise exception 'FORJA_SOLO_MAS'; end if;
    raise exception 'FORJA_SOLO_LECTURA';
  end if;
  if despues > antes and despues > privado.limite('tarjetas') then
    raise exception 'FORJA_LIMITE_TARJETAS' using hint='El plan gratis permite 20 tarjetas por pizarra.';
  end if;
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION privado.t_tipo_comic()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  if new.formato = 'comic' and new.tipo = 'historia' then new.tipo := 'comic'; end if;
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION privado.t_proyectos()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare t int := privado.tope(new.espacio_id, 'proyectos'); mas boolean := privado.es_mas(new.espacio_id);
begin
  if t is null then return new; end if;
  if tg_op = 'INSERT' then
    if new.estado <> 'archivado' and privado.activos(new.espacio_id) >= t then
      raise exception 'FORJA_LIMITE_PROYECTOS' using hint = 'Tu plan permite ' || t || ' proyectos en curso.';
    end if;
    return new;
  end if;
  if new.estado = 'archivado' and old.estado <> 'archivado' then return new; end if; -- archivar siempre se puede
  if old.estado = 'archivado' and new.estado <> 'archivado' then
    if privado.activos(new.espacio_id) >= t then
      raise exception 'FORJA_LIMITE_PROYECTOS' using hint = 'Archiva otro proyecto para reactivar este.';
    end if;
    return new;
  end if;
  if (old.estado = 'archivado' and not mas) or privado.activos(new.espacio_id) > t then
    raise exception 'FORJA_SOLO_LECTURA';
  end if;
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION privado.t_referentes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not privado.editable(new.proyecto_id) then raise exception 'FORJA_SOLO_LECTURA'; end if;
  if privado.es_mas(new.espacio_id) then return new; end if;
  if tg_op='INSERT' and (select count(*) from public.referentes r where r.proyecto_id=new.proyecto_id) >= privado.limite('referentes') then
    raise exception 'FORJA_LIMITE_REFERENTES' using hint='El plan gratis permite 30 referentes por proyecto.';
  end if;
  if new.analisis <> '{}'::jsonb and (tg_op='INSERT' or old.analisis = '{}'::jsonb)
     and (select count(*) from public.referentes r where r.proyecto_id=new.proyecto_id and r.analisis <> '{}'::jsonb and r.id <> new.id) >= privado.limite('analisis') then
    raise exception 'FORJA_LIMITE_ANALISIS' using hint='El plan gratis permite analizar 3 obras por proyecto.';
  end if;
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION privado.t_secciones()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare otras int; antes int; despues int;
begin
  -- Enlazar una sección con una colección de Fichas: solo el equipo (mientras Fichas esté en prueba) y del mismo proyecto.
  if new.coleccion_id is not null and (tg_op = 'INSERT' or new.coleccion_id is distinct from old.coleccion_id)
     and coalesce(current_setting('forja.mover', true), '') <> '1' then
    if not privado.herramientas_equipo() then raise exception 'FORJA_SOLO_EQUIPO'; end if;
    if not exists(select 1 from public.colecciones c where c.id = new.coleccion_id and c.proyecto_id = new.proyecto_id) then raise exception 'FORJA_NO_PERMITIDO'; end if;
  end if;
  despues := privado.palabras(new.texto);
  antes := case when tg_op='UPDATE' then privado.palabras(old.texto) else 0 end;
  if not privado.editable(new.proyecto_id) and despues >= antes and not (tg_op='UPDATE' and new.texto = old.texto and new.titulo = old.titulo and new.orden = old.orden and new.avance = old.avance and new.peso = old.peso
      and (new.coleccion_id is not distinct from old.coleccion_id or new.coleccion_id is null)) then
    raise exception 'FORJA_SOLO_LECTURA';
  end if;
  if privado.es_mas(new.espacio_id) then return new; end if;
  if despues > antes then
    otras := privado.palabras_proyecto(new.proyecto_id) - antes;
    if otras + despues > privado.limite('palabras') then
      raise exception 'FORJA_LIMITE_PALABRAS' using hint='El plan gratis permite 20.000 palabras por proyecto.';
    end if;
  end if;
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION privado.t_vitrina_slug()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if new.slug is distinct from old.slug then
    update public.vitrinas_publicadas set slug = new.slug where vitrina_id = new.id;
  end if;
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION privado.tarjetas(d jsonb)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
  select case when jsonb_typeof(d->'tarjetas')='array' then jsonb_array_length(d->'tarjetas') else 0 end;
$function$
;

CREATE OR REPLACE FUNCTION privado.tope(e uuid, clave text)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select case privado.plan_de(e)
    when 'estudio' then case clave when 'invitados' then 15 when 'lectores' then 40 end
    when 'mas' then case clave when 'proyectos' then 15 when 'invitados' then 5 when 'ideas' then 500 when 'lectores' then 15 end
    else case clave when 'invitados' then 1 when 'lectores' then 3 else privado.limite(clave) end
  end;
$function$
;

CREATE OR REPLACE FUNCTION privado.unir_equipos(uid uuid, correo text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare e record;
begin
  for e in select x.id, x.nombre from public.espacios x where x.tipo = 'equipo' and x.dominio is not null and lower(correo) like '%@' || lower(x.dominio) loop
    if not exists(select 1 from public.miembros m where m.espacio_id = e.id and m.user_id = uid) then
      insert into public.miembros(espacio_id, user_id, rol) values (e.id, uid, 'lector');
      insert into public.espacio_registro(espacio_id, quien, accion, detalle) values (e.id, uid, 'entro', jsonb_build_object('correo', correo, 'rol', 'lector'));
      insert into public.avisos(user_id, tipo, titulo, texto, enlace)
        select m.user_id, 'equipo', 'Alguien entró a ' || e.nombre, correo || ' entró al equipo como lector: puede ver los proyectos abiertos al equipo, pero no editarlos. Cambia su rol en Equipo si corresponde.', 'equipo/'
        from public.miembros m where m.espacio_id = e.id and m.rol = 'dueno';
    end if;
  end loop;
end $function$
;

CREATE OR REPLACE FUNCTION privado.ve(p uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select coalesce((select privado.ve_fila(x.espacio_id, x.acceso, x.id) from public.proyectos x where x.id = p), false)
$function$
;

CREATE OR REPLACE FUNCTION privado.ve_fila(e uuid, acceso text, p uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select case privado.rol_en(e) when 'dueno' then true when 'editor' then acceso = 'equipo' when 'lector' then acceso = 'equipo' else false end
    or exists(select 1 from public.proyecto_accesos a where a.proyecto_id = p and a.user_id = (select auth.uid()))
$function$
;


CREATE OR REPLACE FUNCTION privado.herramientas_equipo()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists(select 1 from auth.users u where u.id = (select auth.uid()) and u.email_confirmed_at is not null and privado.es_equipo(u.email));
$function$
;

CREATE OR REPLACE FUNCTION public.herramientas_equipo()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$ select privado.herramientas_equipo(); $function$
;

CREATE OR REPLACE FUNCTION privado.plantilla_ok(pl text, tipo text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
  select case pl
    when 'libre' then true
    when 'mecanicas' then tipo in ('videojuego', 'otro')
    when 'contenido' then tipo in ('videojuego', 'otro')
    when 'cartas' then tipo in ('juegomesa', 'otro')
    when 'componentes' then tipo in ('juegomesa', 'otro')
    when 'personajes' then tipo in ('historia', 'comic', 'otro')
    when 'lugares' then tipo in ('historia', 'comic', 'otro')
    when 'pilares' then tipo in ('contenido', 'otro')
    when 'series' then tipo in ('contenido', 'otro')
    when 'producto' then tipo in ('producto', 'otro')
    when 'variantes' then tipo in ('producto', 'otro')
    else false end;
$function$
;

CREATE OR REPLACE FUNCTION privado.t_colecciones()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare tipo text; n int; t int;
begin
  if coalesce(current_setting('forja.mover', true), '') = '1' then return new; end if;
  if not privado.herramientas_equipo() then raise exception 'FORJA_SOLO_EQUIPO'; end if;
  if tg_op = 'UPDATE' and new.plantilla <> old.plantilla then raise exception 'FORJA_NO_PERMITIDO'; end if;
  select p.tipo into tipo from public.proyectos p where p.id = new.proyecto_id;
  if not privado.plantilla_ok(new.plantilla, tipo) then raise exception 'FORJA_OTRA_CATEGORIA'; end if;
  if not privado.editable(new.proyecto_id) then raise exception 'FORJA_SOLO_LECTURA'; end if;
  if tg_op = 'INSERT' then
    t := privado.tope(new.espacio_id, 'colecciones');
    select count(*) into n from public.colecciones c where c.proyecto_id = new.proyecto_id;
    if t is not null and n >= t then raise exception 'FORJA_LIMITE_COLECCIONES'; end if;
  end if;
  if jsonb_array_length(new.campos) > 0 and (tg_op = 'INSERT' or new.campos is distinct from old.campos) and not privado.es_mas(new.espacio_id) then
    raise exception 'FORJA_SOLO_MAS';
  end if;
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION privado.t_elementos()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare c public.colecciones; tipo text; n int; t int; limpio jsonb; antes int; despues int;
begin
  if coalesce(current_setting('forja.mover', true), '') = '1' then return new; end if;
  if not privado.herramientas_equipo() then raise exception 'FORJA_SOLO_EQUIPO'; end if;
  select * into c from public.colecciones x where x.id = new.coleccion_id;
  if not found or c.proyecto_id <> new.proyecto_id then raise exception 'FORJA_NO_PERMITIDO'; end if;
  new.plantilla := c.plantilla;
  despues := privado.palabras(new.texto);
  antes := case when tg_op = 'UPDATE' then privado.palabras(old.texto) else 0 end;
  -- En solo lectura (o de otra categoría) se puede recortar la hoja del Taller, nada más.
  if tg_op = 'UPDATE' and despues <= antes and new.texto <> old.texto and new.titulo = old.titulo and new.datos = old.datos
     and new.estado is not distinct from old.estado and new.fecha is not distinct from old.fecha and new.orden = old.orden
     and new.enlaces = old.enlaces and new.coleccion_id = old.coleccion_id then
    return new;
  end if;
  select p.tipo into tipo from public.proyectos p where p.id = new.proyecto_id;
  if not privado.plantilla_ok(c.plantilla, tipo) then raise exception 'FORJA_OTRA_CATEGORIA'; end if;
  if not privado.editable(new.proyecto_id) then raise exception 'FORJA_SOLO_LECTURA'; end if;
  if tg_op = 'INSERT' then
    t := privado.tope(new.espacio_id, 'fichas');
    select count(*) into n from public.elementos e where e.proyecto_id = new.proyecto_id;
    if t is not null and n >= t then raise exception 'FORJA_LIMITE_FICHAS'; end if;
  end if;
  -- Las hojas del Taller cuentan en el límite de palabras del plan gratis, igual que las secciones.
  if despues > antes and not privado.es_mas(new.espacio_id) then
    if privado.palabras_proyecto(new.proyecto_id) - antes + despues > privado.limite('palabras') then
      raise exception 'FORJA_LIMITE_PALABRAS' using hint='El plan gratis permite 20.000 palabras por proyecto.';
    end if;
  end if;
  if tg_op = 'INSERT' or new.enlaces is distinct from old.enlaces then
    select coalesce(jsonb_agg(case when x.nota is null then jsonb_build_object('a', x.a, 't', x.t) else jsonb_build_object('a', x.a, 't', x.t, 'n', x.nota) end), '[]'::jsonb) into limpio
    from (select distinct on (j->>'a', j->>'t') (j->>'a')::uuid as a, j->>'t' as t,
                 nullif(left(btrim(coalesce(j->>'n', '')), 120), '') as nota
          from jsonb_array_elements(new.enlaces) j
          where jsonb_typeof(j) = 'object'
            and j->>'t' in ('abre', 'necesita', 'lleva', 'ruta', 'familia', 'amor', 'amistad', 'alianza', 'mentor', 'rivalidad', 'secreto', 'lazo')
            and (j->>'a') ~ '^[0-9a-f-]{36}$' and (j->>'a')::uuid <> new.id
            and exists(select 1 from public.elementos e where e.id = (j->>'a')::uuid and e.proyecto_id = new.proyecto_id)) x;
    new.enlaces := limpio;
  end if;
  return new;
end $function$
;

-- ===================== LLAVES, ÚNICOS Y CHEQUEOS =====================

alter table public.aceptaciones add constraint aceptaciones_pkey PRIMARY KEY (user_id, documento, version);
alter table public.aceptaciones add constraint aceptaciones_documento_check CHECK ((documento = ANY (ARRAY['terminos'::text, 'privacidad'::text, 'normas'::text, 'cookies'::text, 'pagos'::text])));
alter table public.aceptaciones add constraint aceptaciones_version_check CHECK ((char_length(version) <= 20));
alter table public.avisos add constraint avisos_pkey PRIMARY KEY (id);
alter table public.correo_prefs add constraint correo_prefs_token_key UNIQUE (token);
alter table public.correo_prefs add constraint correo_prefs_pkey PRIMARY KEY (user_id);
alter table public.colecciones add constraint colecciones_campos_check CHECK (((jsonb_typeof(campos) = 'array'::text) AND (jsonb_array_length(campos) <= 12) AND (char_length((campos)::text) <= 4000)));
alter table public.colecciones add constraint colecciones_nombre_check CHECK (((char_length(nombre) >= 1) AND (char_length(nombre) <= 80)));
alter table public.colecciones add constraint colecciones_pkey PRIMARY KEY (id);
alter table public.colecciones add constraint colecciones_plantilla_check CHECK ((plantilla = ANY (ARRAY['libre'::text, 'mecanicas'::text, 'contenido'::text, 'cartas'::text, 'componentes'::text, 'personajes'::text, 'lugares'::text, 'pilares'::text, 'series'::text, 'producto'::text, 'variantes'::text])));
alter table public.elementos add constraint elementos_datos_check CHECK (((jsonb_typeof(datos) = 'object'::text) AND (char_length((datos)::text) <= 20000)));
alter table public.elementos add constraint elementos_enlaces_check CHECK (((jsonb_typeof(enlaces) = 'array'::text) AND (jsonb_array_length(enlaces) <= 30)));
alter table public.elementos add constraint elementos_estado_check CHECK (((estado IS NULL) OR (char_length(estado) <= 40)));
alter table public.elementos add constraint elementos_pkey PRIMARY KEY (id);
alter table public.elementos add constraint elementos_texto_check CHECK ((char_length(texto) <= 200000));
alter table public.elementos add constraint elementos_titulo_check CHECK (((char_length(titulo) >= 1) AND (char_length(titulo) <= 160)));
alter table public.cotizaciones add constraint cotizaciones_pkey PRIMARY KEY (id);
alter table public.espacio_registro add constraint espacio_registro_pkey PRIMARY KEY (id);
alter table public.espacios add constraint espacios_pkey PRIMARY KEY (id);
alter table public.espacios add constraint espacios_plan_check CHECK ((plan = ANY (ARRAY['libre'::text, 'mas'::text, 'estudio'::text])));
alter table public.espacios add constraint espacios_tipo_check CHECK ((tipo = ANY (ARRAY['personal'::text, 'equipo'::text])));
alter table public.ideas add constraint ideas_pkey PRIMARY KEY (id);
alter table public.ideas add constraint ideas_texto_check CHECK (((char_length(btrim(texto)) >= 1) AND (char_length(btrim(texto)) <= 80)));
alter table public.ideas add constraint ideas_vueltas_check CHECK (((vueltas >= 0) AND (vueltas <= 99)));
alter table public.interes_funciones add constraint interes_funciones_pkey PRIMARY KEY (user_id, funcion);
alter table public.interes_funciones add constraint interes_funciones_funcion_check CHECK ((funcion ~ '^[a-z0-9-]{2,40}$'::text));
alter table public.invitaciones add constraint invitaciones_token_key UNIQUE (token);
alter table public.invitaciones add constraint invitaciones_pkey PRIMARY KEY (id);
alter table public.invitaciones add constraint invitaciones_correo_check CHECK (((correo = lower(correo)) AND (correo ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text)));
alter table public.invitaciones add constraint invitaciones_rol_check CHECK ((rol = ANY (ARRAY['editor'::text, 'lector'::text])));
alter table public.mensajes add constraint mensajes_pkey PRIMARY KEY (id);
alter table public.mensajes add constraint mensajes_estado_check CHECK ((estado = ANY (ARRAY['abierto'::text, 'respondido'::text, 'cerrado'::text])));
alter table public.mensajes add constraint mensajes_texto_check CHECK (((char_length(texto) >= 5) AND (char_length(texto) <= 3000)));
alter table public.mensajes add constraint mensajes_tipo_check CHECK ((tipo = ANY (ARRAY['apelacion'::text, 'privacidad'::text, 'contacto'::text])));
alter table public.meta add constraint meta_pkey PRIMARY KEY (clave);
alter table public.miembros add constraint miembros_pkey PRIMARY KEY (espacio_id, user_id);
alter table public.miembros add constraint miembros_rol_check CHECK ((rol = ANY (ARRAY['dueno'::text, 'editor'::text, 'lector'::text])));
alter table public.notas add constraint notas_pkey PRIMARY KEY (id);
alter table public.notas add constraint notas_texto_check CHECK (((char_length(texto) >= 1) AND (char_length(texto) <= 20000)));
alter table public.oportunidades add constraint oportunidades_pkey PRIMARY KEY (id);
alter table public.oportunidades add constraint oportunidades_id_check CHECK ((id ~ '^[a-z0-9-]+$'::text));
alter table public.oportunidades add constraint oportunidades_tipo_check CHECK ((tipo = ANY (ARRAY['fondo'::text, 'feria'::text, 'convocatoria'::text])));
alter table public.pizarras add constraint pizarras_pkey PRIMARY KEY (id);
alter table public.pizarras add constraint pizarras_modo_check CHECK ((modo = ANY (ARRAY['libre'::text, 'relaciones'::text, 'escaleta'::text, 'mapa'::text])));
alter table public.pizarras add constraint pizarras_nombre_check CHECK (((char_length(nombre) >= 1) AND (char_length(nombre) <= 120)));
alter table public.precios_comunidad add constraint precios_comunidad_pkey PRIMARY KEY (id);
alter table public.precios_comunidad add constraint precios_comunidad_cantidad_check CHECK (((cantidad > (0)::numeric) AND (cantidad <= (10000000)::numeric)));
alter table public.precios_comunidad add constraint precios_comunidad_componente_check CHECK ((componente ~ '^[a-z]{2,20}$'::text));
alter table public.precios_comunidad add constraint precios_comunidad_enlace_check CHECK (((enlace IS NULL) OR ((enlace ~ '^https://'::text) AND (char_length(enlace) <= 500))));
alter table public.precios_comunidad add constraint precios_comunidad_envio_check CHECK (((envio >= (0)::numeric) AND (envio <= (1000000000)::numeric)));
alter table public.precios_comunidad add constraint precios_comunidad_especificaciones_check CHECK ((char_length(especificaciones) <= 600));
alter table public.precios_comunidad add constraint precios_comunidad_moneda_check CHECK ((moneda = ANY (ARRAY['CLP'::text, 'USD'::text])));
alter table public.precios_comunidad add constraint precios_comunidad_origen_check CHECK ((origen = ANY (ARRAY['chile'::text, 'extranjero'::text])));
alter table public.precios_comunidad add constraint precios_comunidad_plazo_check CHECK ((char_length(plazo) <= 80));
alter table public.precios_comunidad add constraint precios_comunidad_precio_check CHECK (((precio >= (0)::numeric) AND (precio <= (1000000000)::numeric)));
alter table public.precios_comunidad add constraint precios_comunidad_proveedor_check CHECK (((char_length(proveedor) >= 1) AND (char_length(proveedor) <= 120)));
alter table public.proyecto_accesos add constraint proyecto_accesos_pkey PRIMARY KEY (proyecto_id, user_id);
alter table public.proyecto_accesos add constraint proyecto_accesos_rol_check CHECK ((rol = ANY (ARRAY['editor'::text, 'lector'::text])));
alter table public.proyecto_oportunidades add constraint proyecto_oportunidades_pkey PRIMARY KEY (proyecto_id, oportunidad_id);
alter table public.proyecto_oportunidades add constraint proyecto_oportunidades_estado_check CHECK ((estado = ANY (ARRAY['interesa'::text, 'postulando'::text, 'postulado'::text, 'aceptado'::text, 'descartado'::text])));
alter table public.proyectos add constraint proyectos_pkey PRIMARY KEY (id);
alter table public.proyectos add constraint proyectos_acceso_check CHECK ((acceso = ANY (ARRAY['equipo'::text, 'reservado'::text])));
alter table public.proyectos add constraint proyectos_esquema_tam CHECK ((pg_column_size(esquema) < 40000));
alter table public.proyectos add constraint proyectos_estado_check CHECK ((estado = ANY (ARRAY['semilla'::text, 'desarrollo'::text, 'pausa'::text, 'listo'::text, 'archivado'::text])));
alter table public.proyectos add constraint proyectos_estructura_tam CHECK ((pg_column_size(estructura) < 60000));
alter table public.proyectos add constraint proyectos_nombre_check CHECK (((char_length(nombre) >= 1) AND (char_length(nombre) <= 160)));
alter table public.proyectos add constraint proyectos_ruta_tam CHECK ((pg_column_size(ruta) < 20000));
alter table public.proyectos add constraint proyectos_tipo_check CHECK ((tipo = ANY (ARRAY['historia'::text, 'comic'::text, 'videojuego'::text, 'juegomesa'::text, 'contenido'::text, 'producto'::text, 'otro'::text])));
alter table public.recompensa_interes add constraint recompensa_interes_pkey PRIMARY KEY (vitrina_id, tier, user_id);
alter table public.recompensa_interes add constraint recompensa_interes_tier_check CHECK (((char_length(tier) >= 1) AND (char_length(tier) <= 20)));
alter table public.referentes add constraint referentes_pkey PRIMARY KEY (id);
alter table public.referentes add constraint referentes_analisis_tam CHECK ((pg_column_size(analisis) < 30000));
alter table public.referentes add constraint referentes_ficha_tam CHECK ((pg_column_size(ficha) < 8000));
alter table public.referentes add constraint referentes_nota_check CHECK ((char_length(nota) <= 4000));
alter table public.referentes add constraint referentes_tipo_check CHECK ((tipo = ANY (ARRAY['imagen'::text, 'video'::text, 'audio'::text, 'enlace'::text, 'color'::text, 'cita'::text, 'obra'::text])));
alter table public.referentes add constraint referentes_titulo_check CHECK ((char_length(titulo) <= 200));
alter table public.referentes add constraint referentes_valor_check CHECK (((char_length(valor) >= 1) AND (char_length(valor) <= 4000)));
alter table public.reportes add constraint reportes_vitrina_id_autor_key UNIQUE (vitrina_id, autor);
alter table public.reportes add constraint reportes_pkey PRIMARY KEY (id);
alter table public.reportes add constraint reportes_detalle_check CHECK ((char_length(detalle) <= 1000));
alter table public.reportes add constraint reportes_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'aceptado'::text, 'desestimado'::text, 'mala_fe'::text])));
alter table public.reportes add constraint reportes_motivo_check CHECK ((motivo = ANY (ARRAY['estafa'::text, 'ofensivo'::text, 'derechos'::text, 'datos'::text, 'menores'::text, 'spam'::text, 'otro'::text])));
alter table public.ronda_comentarios add constraint ronda_comentarios_pkey PRIMARY KEY (id);
alter table public.ronda_comentarios add constraint ronda_comentarios_cita_check CHECK ((char_length(cita) <= 200));
alter table public.ronda_comentarios add constraint ronda_comentarios_marca_check CHECK ((marca = ANY (ARRAY['opinion'::text, 'mejora'::text, 'resuelta'::text])));
alter table public.ronda_comentarios add constraint ronda_comentarios_parrafo_check CHECK (((parrafo >= 0) AND (parrafo <= 4999)));
alter table public.ronda_comentarios add constraint ronda_comentarios_parte_check CHECK (((parte >= 0) AND (parte <= 199)));
alter table public.ronda_comentarios add constraint ronda_comentarios_texto_check CHECK (((char_length(texto) >= 1) AND (char_length(texto) <= 2000)));
alter table public.ronda_lectores add constraint ronda_lectores_token_key UNIQUE (token);
alter table public.ronda_lectores add constraint ronda_lectores_pkey PRIMARY KEY (id);
alter table public.ronda_lectores add constraint ronda_lectores_nombre_check CHECK (((char_length(nombre) >= 1) AND (char_length(nombre) <= 60)));
alter table public.ronda_respuestas add constraint ronda_respuestas_lector_id_pregunta_key UNIQUE (lector_id, pregunta);
alter table public.ronda_respuestas add constraint ronda_respuestas_pkey PRIMARY KEY (id);
alter table public.ronda_respuestas add constraint ronda_respuestas_marca_check CHECK ((marca = ANY (ARRAY['opinion'::text, 'mejora'::text, 'resuelta'::text])));
alter table public.ronda_respuestas add constraint ronda_respuestas_pregunta_check CHECK ((pregunta ~ '^[a-z0-9_-]{1,40}$'::text));
alter table public.ronda_respuestas add constraint ronda_respuestas_texto_check CHECK (((char_length(texto) >= 1) AND (char_length(texto) <= 4000)));
alter table public.rondas add constraint rondas_proyecto_id_numero_key UNIQUE (proyecto_id, numero);
alter table public.rondas add constraint rondas_pkey PRIMARY KEY (id);
alter table public.rondas add constraint rondas_estado_check CHECK ((estado = ANY (ARRAY['abierta'::text, 'cerrada'::text])));
alter table public.rondas add constraint rondas_titulo_check CHECK (((char_length(titulo) >= 1) AND (char_length(titulo) <= 120)));
alter table public.secciones add constraint secciones_pkey PRIMARY KEY (id);
alter table public.secciones add constraint secciones_avance_check CHECK (((avance >= 0) AND (avance <= 100)));
alter table public.secciones add constraint secciones_peso_check CHECK (((peso >= 0) AND (peso <= 100)));
alter table public.secciones add constraint secciones_texto_check CHECK ((char_length(texto) <= 200000));
alter table public.secciones add constraint secciones_titulo_check CHECK (((char_length(titulo) >= 1) AND (char_length(titulo) <= 120)));
alter table public.seguidores add constraint seguidores_pkey PRIMARY KEY (vitrina_id, user_id);
alter table public.sugerencias add constraint sugerencias_pkey PRIMARY KEY (id);
alter table public.sugerencias add constraint sugerencias_area_check CHECK ((area = ANY (ARRAY['escritura'::text, 'impresion'::text, 'pizarras'::text, 'organizacion'::text, 'venta'::text, 'presentacion'::text, 'equipo'::text, 'planes'::text, 'otra'::text])));
alter table public.sugerencias add constraint sugerencias_estado_check CHECK ((estado = ANY (ARRAY['nueva'::text, 'leida'::text, 'anotada'::text, 'descartada'::text])));
alter table public.sugerencias add constraint sugerencias_respuesta_check CHECK (((respuesta IS NULL) OR (char_length(respuesta) <= 1500)));
alter table public.sugerencias add constraint sugerencias_texto_check CHECK (((char_length(texto) >= 10) AND (char_length(texto) <= 800)));
alter table public.vitrinas add constraint vitrinas_proyecto_id_key UNIQUE (proyecto_id);
alter table public.vitrinas add constraint vitrinas_slug_key UNIQUE (slug);
alter table public.vitrinas add constraint vitrinas_pkey PRIMARY KEY (id);
alter table public.vitrinas add constraint vitrinas_borrador_check CHECK ((octet_length((borrador)::text) < 2000000));
alter table public.vitrinas add constraint vitrinas_slug_check CHECK ((slug ~ '^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$'::text));
alter table public.vitrinas_publicadas add constraint vitrinas_publicadas_vitrina_id_key UNIQUE (vitrina_id);
alter table public.vitrinas_publicadas add constraint vitrinas_publicadas_pkey PRIMARY KEY (slug);
alter table privado.admin_correos add constraint admin_correos_pkey PRIMARY KEY (email);
alter table privado.config add constraint config_pkey PRIMARY KEY (clave);
alter table privado.correos add constraint correos_pkey PRIMARY KEY (id);
alter table privado.correos add constraint correos_destino_check CHECK (((user_id IS NOT NULL) OR (email IS NOT NULL)));
alter table privado.correos add constraint correos_tipo_check CHECK ((tipo = ANY (ARRAY['funcion'::text, 'vitrina'::text, 'boletin'::text, 'prueba'::text, 'invitacion'::text, 'legal'::text, 'inactiva'::text])));
alter table privado.envios_vitrina add constraint envios_vitrina_pkey PRIMARY KEY (id);
alter table privado.referidos add constraint referidos_pkey PRIMARY KEY (user_id);
alter table privado.registro add constraint registro_pkey PRIMARY KEY (id);

-- ===================== LLAVES FORÁNEAS =====================

alter table public.aceptaciones add constraint aceptaciones_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.avisos add constraint avisos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.correo_prefs add constraint correo_prefs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.colecciones add constraint colecciones_espacio_id_fkey FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE;
alter table public.colecciones add constraint colecciones_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE;
alter table public.secciones add constraint secciones_coleccion_id_fkey FOREIGN KEY (coleccion_id) REFERENCES colecciones(id) ON DELETE SET NULL;
alter table public.pizarras add constraint pizarras_coleccion_id_fkey FOREIGN KEY (coleccion_id) REFERENCES colecciones(id) ON DELETE SET NULL;
alter table public.elementos add constraint elementos_coleccion_id_fkey FOREIGN KEY (coleccion_id) REFERENCES colecciones(id) ON DELETE CASCADE;
alter table public.elementos add constraint elementos_espacio_id_fkey FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE;
alter table public.elementos add constraint elementos_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE;
alter table public.cotizaciones add constraint cotizaciones_espacio_id_fkey FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE;
alter table public.cotizaciones add constraint cotizaciones_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE SET NULL;
alter table public.espacio_registro add constraint espacio_registro_espacio_id_fkey FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE;
alter table public.espacio_registro add constraint espacio_registro_quien_fkey FOREIGN KEY (quien) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public.espacios add constraint espacios_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public.ideas add constraint ideas_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public.ideas add constraint ideas_espacio_id_fkey FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE;
alter table public.ideas add constraint ideas_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE SET NULL;
alter table public.interes_funciones add constraint interes_funciones_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.invitaciones add constraint invitaciones_aceptada_por_fkey FOREIGN KEY (aceptada_por) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public.invitaciones add constraint invitaciones_invitado_por_fkey FOREIGN KEY (invitado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public.invitaciones add constraint invitaciones_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE;
alter table public.mensajes add constraint mensajes_autor_fkey FOREIGN KEY (autor) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.mensajes add constraint mensajes_vitrina_id_fkey FOREIGN KEY (vitrina_id) REFERENCES vitrinas(id) ON DELETE SET NULL;
alter table public.miembros add constraint miembros_espacio_id_fkey FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE;
alter table public.miembros add constraint miembros_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.notas add constraint notas_autor_fkey FOREIGN KEY (autor) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public.notas add constraint notas_espacio_id_fkey FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE;
alter table public.notas add constraint notas_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE;
alter table public.pizarras add constraint pizarras_espacio_id_fkey FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE;
alter table public.pizarras add constraint pizarras_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE;
alter table public.precios_comunidad add constraint precios_comunidad_autor_fkey FOREIGN KEY (autor) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.proyecto_accesos add constraint proyecto_accesos_invitado_por_fkey FOREIGN KEY (invitado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public.proyecto_accesos add constraint proyecto_accesos_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE;
alter table public.proyecto_accesos add constraint proyecto_accesos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.proyecto_oportunidades add constraint proyecto_oportunidades_espacio_id_fkey FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE;
alter table public.proyecto_oportunidades add constraint proyecto_oportunidades_oportunidad_id_fkey FOREIGN KEY (oportunidad_id) REFERENCES oportunidades(id) ON DELETE CASCADE;
alter table public.proyecto_oportunidades add constraint proyecto_oportunidades_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE;
alter table public.proyectos add constraint proyectos_espacio_id_fkey FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE;
alter table public.recompensa_interes add constraint recompensa_interes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.recompensa_interes add constraint recompensa_interes_vitrina_id_fkey FOREIGN KEY (vitrina_id) REFERENCES vitrinas(id) ON DELETE CASCADE;
alter table public.referentes add constraint referentes_espacio_id_fkey FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE;
alter table public.referentes add constraint referentes_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE;
alter table public.reportes add constraint reportes_autor_fkey FOREIGN KEY (autor) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.reportes add constraint reportes_vitrina_id_fkey FOREIGN KEY (vitrina_id) REFERENCES vitrinas(id) ON DELETE CASCADE;
alter table public.ronda_comentarios add constraint ronda_comentarios_lector_id_fkey FOREIGN KEY (lector_id) REFERENCES ronda_lectores(id) ON DELETE CASCADE;
alter table public.ronda_comentarios add constraint ronda_comentarios_ronda_id_fkey FOREIGN KEY (ronda_id) REFERENCES rondas(id) ON DELETE CASCADE;
alter table public.ronda_lectores add constraint ronda_lectores_ronda_id_fkey FOREIGN KEY (ronda_id) REFERENCES rondas(id) ON DELETE CASCADE;
alter table public.ronda_lectores add constraint ronda_lectores_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.ronda_respuestas add constraint ronda_respuestas_lector_id_fkey FOREIGN KEY (lector_id) REFERENCES ronda_lectores(id) ON DELETE CASCADE;
alter table public.ronda_respuestas add constraint ronda_respuestas_ronda_id_fkey FOREIGN KEY (ronda_id) REFERENCES rondas(id) ON DELETE CASCADE;
alter table public.rondas add constraint rondas_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public.rondas add constraint rondas_espacio_id_fkey FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE;
alter table public.rondas add constraint rondas_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE;
alter table public.secciones add constraint secciones_espacio_id_fkey FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE;
alter table public.secciones add constraint secciones_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE;
alter table public.seguidores add constraint seguidores_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.seguidores add constraint seguidores_vitrina_id_fkey FOREIGN KEY (vitrina_id) REFERENCES vitrinas(id) ON DELETE CASCADE;
alter table public.sugerencias add constraint sugerencias_autor_fkey FOREIGN KEY (autor) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.vitrinas add constraint vitrinas_espacio_id_fkey FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE;
alter table public.vitrinas add constraint vitrinas_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE;
alter table public.vitrinas_publicadas add constraint vitrinas_publicadas_vitrina_id_fkey FOREIGN KEY (vitrina_id) REFERENCES vitrinas(id) ON DELETE CASCADE;
alter table privado.correos add constraint correos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table privado.envios_vitrina add constraint envios_vitrina_vitrina_id_fkey FOREIGN KEY (vitrina_id) REFERENCES vitrinas(id) ON DELETE CASCADE;
alter table privado.referidos add constraint referidos_invitado_por_fkey FOREIGN KEY (invitado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table privado.referidos add constraint referidos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ===================== ÍNDICES =====================

CREATE INDEX avisos_user ON public.avisos USING btree (user_id, creado_en DESC);
CREATE INDEX colecciones_espacio_idx ON public.colecciones USING btree (espacio_id);
CREATE INDEX colecciones_proyecto_idx ON public.colecciones USING btree (proyecto_id, orden);
CREATE UNIQUE INDEX secciones_coleccion_uni ON public.secciones USING btree (coleccion_id) WHERE (coleccion_id IS NOT NULL);
CREATE INDEX pizarras_coleccion_idx ON public.pizarras USING btree (coleccion_id) WHERE (coleccion_id IS NOT NULL);
CREATE INDEX elementos_coleccion_idx ON public.elementos USING btree (coleccion_id, orden);
CREATE INDEX elementos_espacio_idx ON public.elementos USING btree (espacio_id);
CREATE INDEX elementos_proyecto_idx ON public.elementos USING btree (proyecto_id);
CREATE INDEX cotizaciones_espacio_idx ON public.cotizaciones USING btree (espacio_id);
CREATE INDEX cotizaciones_proyecto_idx ON public.cotizaciones USING btree (proyecto_id);
CREATE UNIQUE INDEX cotizaciones_un_proyecto ON public.cotizaciones USING btree (proyecto_id) WHERE (proyecto_id IS NOT NULL);
CREATE INDEX espacio_registro_espacio_idx ON public.espacio_registro USING btree (espacio_id);
CREATE INDEX espacio_registro_quien_idx ON public.espacio_registro USING btree (quien);
CREATE INDEX espacios_creado_por_idx ON public.espacios USING btree (creado_por);
CREATE INDEX ideas_creado_por_idx ON public.ideas USING btree (creado_por);
CREATE INDEX ideas_espacio ON public.ideas USING btree (espacio_id, creado_en DESC);
CREATE INDEX ideas_proyecto_idx ON public.ideas USING btree (proyecto_id) WHERE (proyecto_id IS NOT NULL);
CREATE INDEX invitaciones_aceptada_por_idx ON public.invitaciones USING btree (aceptada_por);
CREATE INDEX invitaciones_invitado_por_idx ON public.invitaciones USING btree (invitado_por);
CREATE UNIQUE INDEX invitaciones_pendiente ON public.invitaciones USING btree (proyecto_id, correo) WHERE ((aceptada_en IS NULL) AND (anulada_en IS NULL));
CREATE INDEX mensajes_autor_idx ON public.mensajes USING btree (autor);
CREATE INDEX mensajes_vitrina_idx ON public.mensajes USING btree (vitrina_id);
CREATE INDEX miembros_user_idx ON public.miembros USING btree (user_id);
CREATE INDEX notas_autor_idx ON public.notas USING btree (autor);
CREATE INDEX notas_espacio_idx ON public.notas USING btree (espacio_id);
CREATE INDEX notas_proyecto_idx ON public.notas USING btree (proyecto_id);
CREATE INDEX pizarras_espacio ON public.pizarras USING btree (espacio_id);
CREATE INDEX pizarras_proyecto ON public.pizarras USING btree (proyecto_id);
CREATE INDEX precios_comunidad_autor_idx ON public.precios_comunidad USING btree (autor);
CREATE INDEX precios_comunidad_componente_idx ON public.precios_comunidad USING btree (componente, creado_en DESC);
CREATE INDEX proyecto_accesos_invitado_por_idx ON public.proyecto_accesos USING btree (invitado_por);
CREATE INDEX proyecto_accesos_user_idx ON public.proyecto_accesos USING btree (user_id);
CREATE INDEX po_espacio_idx ON public.proyecto_oportunidades USING btree (espacio_id);
CREATE INDEX po_oportunidad_idx ON public.proyecto_oportunidades USING btree (oportunidad_id);
CREATE INDEX proyectos_espacio_idx ON public.proyectos USING btree (espacio_id);
CREATE INDEX recompensa_interes_user_idx ON public.recompensa_interes USING btree (user_id);
CREATE INDEX referentes_espacio_idx ON public.referentes USING btree (espacio_id);
CREATE INDEX referentes_proyecto_idx ON public.referentes USING btree (proyecto_id);
CREATE INDEX reportes_autor_idx ON public.reportes USING btree (autor);
CREATE INDEX reportes_pendientes ON public.reportes USING btree (estado, creado_en) WHERE (estado = 'pendiente'::text);
CREATE INDEX ronda_comentarios_lector_idx ON public.ronda_comentarios USING btree (lector_id);
CREATE INDEX ronda_comentarios_ronda ON public.ronda_comentarios USING btree (ronda_id, parte, parrafo);
CREATE INDEX ronda_lectores_ronda ON public.ronda_lectores USING btree (ronda_id);
CREATE INDEX ronda_lectores_user ON public.ronda_lectores USING btree (user_id) WHERE (user_id IS NOT NULL);
CREATE INDEX ronda_respuestas_ronda_idx ON public.ronda_respuestas USING btree (ronda_id);
CREATE INDEX rondas_creado_por_idx ON public.rondas USING btree (creado_por);
CREATE INDEX rondas_espacio_idx ON public.rondas USING btree (espacio_id);
CREATE INDEX rondas_proyecto ON public.rondas USING btree (proyecto_id, numero DESC);
CREATE INDEX secciones_espacio_idx ON public.secciones USING btree (espacio_id);
CREATE INDEX secciones_proyecto_idx ON public.secciones USING btree (proyecto_id, orden);
CREATE INDEX seguidores_user_id_idx ON public.seguidores USING btree (user_id);
CREATE INDEX sugerencias_autor ON public.sugerencias USING btree (autor, creado_en DESC);
CREATE INDEX sugerencias_nuevas ON public.sugerencias USING btree (creado_en) WHERE (estado = 'nueva'::text);
CREATE INDEX vitrinas_espacio ON public.vitrinas USING btree (espacio_id);
CREATE INDEX vitrinas_publicadas_busqueda ON public.vitrinas_publicadas USING gin (busqueda);
CREATE INDEX vitrinas_publicadas_explorar ON public.vitrinas_publicadas USING btree (en_explorar, publicado_en DESC) WHERE (en_explorar AND visible);
CREATE INDEX correos_enviado_en_idx ON privado.correos USING btree (enviado_en);
CREATE INDEX correos_id_idx ON privado.correos USING btree (id) WHERE (enviado_en IS NULL);
CREATE INDEX correos_user_idx ON privado.correos USING btree (user_id);
CREATE INDEX envios_vitrina_vitrina_idx ON privado.envios_vitrina USING btree (vitrina_id);
CREATE INDEX referidos_invitado_por_idx ON privado.referidos USING btree (invitado_por);

-- ===================== TRIGGERS (incluye los de auth.users) =====================

CREATE TRIGGER t_correo_prefs BEFORE INSERT OR UPDATE ON public.correo_prefs FOR EACH ROW EXECUTE FUNCTION privado.t_correo_prefs();
CREATE TRIGGER colecciones_mismo BEFORE INSERT OR UPDATE ON public.colecciones FOR EACH ROW EXECUTE FUNCTION mismo_espacio();
CREATE TRIGGER colecciones_reglas BEFORE INSERT OR UPDATE ON public.colecciones FOR EACH ROW EXECUTE FUNCTION privado.t_colecciones();
CREATE TRIGGER colecciones_tocar BEFORE UPDATE ON public.colecciones FOR EACH ROW EXECUTE FUNCTION tocar_actualizado();
CREATE TRIGGER espacio_fijo BEFORE UPDATE OF espacio_id ON public.colecciones FOR EACH ROW EXECUTE FUNCTION privado.t_espacio_fijo();
CREATE TRIGGER elementos_mismo BEFORE INSERT OR UPDATE ON public.elementos FOR EACH ROW EXECUTE FUNCTION mismo_espacio();
CREATE TRIGGER elementos_reglas BEFORE INSERT OR UPDATE ON public.elementos FOR EACH ROW EXECUTE FUNCTION privado.t_elementos();
CREATE TRIGGER elementos_tocar BEFORE UPDATE ON public.elementos FOR EACH ROW EXECUTE FUNCTION tocar_actualizado();
CREATE TRIGGER espacio_fijo BEFORE UPDATE OF espacio_id ON public.elementos FOR EACH ROW EXECUTE FUNCTION privado.t_espacio_fijo();
CREATE TRIGGER cot_mismo BEFORE INSERT OR UPDATE ON public.cotizaciones FOR EACH ROW EXECUTE FUNCTION mismo_espacio();
CREATE TRIGGER cotizaciones_lectura BEFORE INSERT OR UPDATE ON public.cotizaciones FOR EACH ROW EXECUTE FUNCTION privado.t_lectura();
CREATE TRIGGER cotizaciones_tocar BEFORE UPDATE ON public.cotizaciones FOR EACH ROW EXECUTE FUNCTION tocar_actualizado();
CREATE TRIGGER espacio_fijo BEFORE UPDATE OF espacio_id ON public.cotizaciones FOR EACH ROW EXECUTE FUNCTION privado.t_espacio_fijo();
CREATE TRIGGER ideas_limites BEFORE INSERT OR UPDATE ON public.ideas FOR EACH ROW EXECUTE FUNCTION privado.t_ideas();
CREATE TRIGGER mensajes_limite BEFORE INSERT ON public.mensajes FOR EACH ROW EXECUTE FUNCTION privado.t_mensajes();
CREATE TRIGGER t_meta BEFORE UPDATE ON public.meta FOR EACH ROW EXECUTE FUNCTION tocar_actualizado();
CREATE TRIGGER espacio_fijo BEFORE UPDATE OF espacio_id ON public.notas FOR EACH ROW EXECUTE FUNCTION privado.t_espacio_fijo();
CREATE TRIGGER notas_lectura BEFORE INSERT OR UPDATE ON public.notas FOR EACH ROW EXECUTE FUNCTION privado.t_lectura();
CREATE TRIGGER notas_mismo BEFORE INSERT OR UPDATE ON public.notas FOR EACH ROW EXECUTE FUNCTION mismo_espacio();
CREATE TRIGGER t_oport BEFORE UPDATE ON public.oportunidades FOR EACH ROW EXECUTE FUNCTION tocar_actualizado();
CREATE TRIGGER espacio_fijo BEFORE UPDATE OF espacio_id ON public.pizarras FOR EACH ROW EXECUTE FUNCTION privado.t_espacio_fijo();
CREATE TRIGGER pizarras_limites BEFORE INSERT OR UPDATE ON public.pizarras FOR EACH ROW EXECUTE FUNCTION privado.t_pizarras();
CREATE TRIGGER pizarras_mismo BEFORE INSERT OR UPDATE ON public.pizarras FOR EACH ROW EXECUTE FUNCTION mismo_espacio();
CREATE TRIGGER pizarras_tocar BEFORE UPDATE ON public.pizarras FOR EACH ROW EXECUTE FUNCTION tocar_actualizado();
CREATE TRIGGER espacio_fijo BEFORE UPDATE OF espacio_id ON public.proyecto_oportunidades FOR EACH ROW EXECUTE FUNCTION privado.t_espacio_fijo();
CREATE TRIGGER po_mismo BEFORE INSERT OR UPDATE ON public.proyecto_oportunidades FOR EACH ROW EXECUTE FUNCTION mismo_espacio();
CREATE TRIGGER espacio_fijo BEFORE UPDATE OF espacio_id ON public.proyectos FOR EACH ROW EXECUTE FUNCTION privado.t_espacio_fijo();
CREATE TRIGGER proyectos_limites BEFORE INSERT OR UPDATE ON public.proyectos FOR EACH ROW EXECUTE FUNCTION privado.t_proyectos();
CREATE TRIGGER tipo_comic BEFORE INSERT OR UPDATE OF tipo, formato ON public.proyectos FOR EACH ROW EXECUTE FUNCTION privado.t_tipo_comic();
CREATE TRIGGER proyectos_tocar BEFORE UPDATE ON public.proyectos FOR EACH ROW EXECUTE FUNCTION tocar_actualizado();
CREATE TRIGGER espacio_fijo BEFORE UPDATE OF espacio_id ON public.referentes FOR EACH ROW EXECUTE FUNCTION privado.t_espacio_fijo();
CREATE TRIGGER referentes_limites BEFORE INSERT OR UPDATE ON public.referentes FOR EACH ROW EXECUTE FUNCTION privado.t_referentes();
CREATE TRIGGER referentes_mismo BEFORE INSERT OR UPDATE ON public.referentes FOR EACH ROW EXECUTE FUNCTION mismo_espacio();
CREATE TRIGGER espacio_fijo BEFORE UPDATE OF espacio_id ON public.secciones FOR EACH ROW EXECUTE FUNCTION privado.t_espacio_fijo();
CREATE TRIGGER secciones_limites BEFORE INSERT OR UPDATE ON public.secciones FOR EACH ROW EXECUTE FUNCTION privado.t_secciones();
CREATE TRIGGER secciones_mismo BEFORE INSERT OR UPDATE ON public.secciones FOR EACH ROW EXECUTE FUNCTION mismo_espacio();
CREATE TRIGGER secciones_tocar BEFORE UPDATE ON public.secciones FOR EACH ROW EXECUTE FUNCTION tocar_actualizado();
CREATE TRIGGER espacio_fijo BEFORE UPDATE OF espacio_id ON public.vitrinas FOR EACH ROW EXECUTE FUNCTION privado.t_espacio_fijo();
CREATE TRIGGER vitrinas_mismo BEFORE INSERT OR UPDATE ON public.vitrinas FOR EACH ROW EXECUTE FUNCTION mismo_espacio();
CREATE TRIGGER vitrinas_slug AFTER UPDATE OF slug ON public.vitrinas FOR EACH ROW EXECUTE FUNCTION privado.t_vitrina_slug();
CREATE TRIGGER vitrinas_tocar BEFORE UPDATE ON public.vitrinas FOR EACH ROW EXECUTE FUNCTION tocar_actualizado();
CREATE TRIGGER al_borrar_usuario BEFORE DELETE ON auth.users FOR EACH ROW EXECUTE FUNCTION privado.t_borrar_personal();
CREATE TRIGGER al_confirmar_correo AFTER INSERT OR UPDATE OF email_confirmed_at, email ON auth.users FOR EACH ROW EXECUTE FUNCTION privado.t_confirmado();
CREATE TRIGGER al_crear_usuario AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION crear_espacio_personal();

-- ===================== REGLAS POR FILA (RLS) =====================

alter table public.aceptaciones enable row level security;
alter table public.avisos enable row level security;
alter table public.colecciones enable row level security;
alter table public.correo_prefs enable row level security;
alter table public.cotizaciones enable row level security;
alter table public.elementos enable row level security;
alter table public.espacio_registro enable row level security;
alter table public.espacios enable row level security;
alter table public.ideas enable row level security;
alter table public.interes_funciones enable row level security;
alter table public.invitaciones enable row level security;
alter table public.mensajes enable row level security;
alter table public.meta enable row level security;
alter table public.miembros enable row level security;
alter table public.notas enable row level security;
alter table public.oportunidades enable row level security;
alter table public.pizarras enable row level security;
alter table public.precios_comunidad enable row level security;
alter table public.proyecto_accesos enable row level security;
alter table public.proyecto_oportunidades enable row level security;
alter table public.proyectos enable row level security;
alter table public.recompensa_interes enable row level security;
alter table public.referentes enable row level security;
alter table public.reportes enable row level security;
alter table public.ronda_comentarios enable row level security;
alter table public.ronda_lectores enable row level security;
alter table public.ronda_respuestas enable row level security;
alter table public.rondas enable row level security;
alter table public.secciones enable row level security;
alter table public.seguidores enable row level security;
alter table public.sugerencias enable row level security;
alter table public.vitrinas enable row level security;
alter table public.vitrinas_publicadas enable row level security;

create policy aceptaciones_crear on public.aceptaciones as PERMISSIVE for INSERT to authenticated
  with check ((user_id = ( SELECT auth.uid() AS uid)));
create policy aceptaciones_ver on public.aceptaciones as PERMISSIVE for SELECT to authenticated
  using ((user_id = ( SELECT auth.uid() AS uid)));
create policy avisos_leer on public.avisos as PERMISSIVE for UPDATE to authenticated
  using ((user_id = ( SELECT auth.uid() AS uid)))
  with check ((user_id = ( SELECT auth.uid() AS uid)));
create policy avisos_ver on public.avisos as PERMISSIVE for SELECT to authenticated
  using ((user_id = ( SELECT auth.uid() AS uid)));
create policy correo_prefs_cambiar on public.correo_prefs as PERMISSIVE for UPDATE to authenticated
  using ((user_id = ( SELECT auth.uid() AS uid)))
  with check ((user_id = ( SELECT auth.uid() AS uid)));
create policy correo_prefs_crear on public.correo_prefs as PERMISSIVE for INSERT to authenticated
  with check ((user_id = ( SELECT auth.uid() AS uid)));
create policy correo_prefs_ver on public.correo_prefs as PERMISSIVE for SELECT to authenticated
  using ((user_id = ( SELECT auth.uid() AS uid)));
create policy colecciones_borrar on public.colecciones as PERMISSIVE for DELETE to authenticated
  using (((privado.acceso_area(proyecto_id, 'taller'::text) = 'editar'::text) AND privado.herramientas_equipo()));
create policy colecciones_crear on public.colecciones as PERMISSIVE for INSERT to authenticated
  with check ((privado.edita_area_en(proyecto_id, 'taller'::text, espacio_id) AND privado.herramientas_equipo()));
create policy colecciones_editar on public.colecciones as PERMISSIVE for UPDATE to authenticated
  using (((privado.acceso_area(proyecto_id, 'taller'::text) = 'editar'::text) AND privado.herramientas_equipo()))
  with check (privado.edita_area_en(proyecto_id, 'taller'::text, espacio_id));
create policy colecciones_ver on public.colecciones as PERMISSIVE for SELECT to authenticated
  using (((privado.acceso_area(proyecto_id, 'taller'::text) IS NOT NULL) AND privado.herramientas_equipo()));
create policy elementos_borrar on public.elementos as PERMISSIVE for DELETE to authenticated
  using (((privado.acceso_area(proyecto_id, 'taller'::text) = 'editar'::text) AND privado.herramientas_equipo()));
create policy elementos_crear on public.elementos as PERMISSIVE for INSERT to authenticated
  with check ((privado.edita_area_en(proyecto_id, 'taller'::text, espacio_id) AND privado.herramientas_equipo()));
create policy elementos_editar on public.elementos as PERMISSIVE for UPDATE to authenticated
  using (((privado.acceso_area(proyecto_id, 'taller'::text) = 'editar'::text) AND privado.herramientas_equipo()))
  with check (privado.edita_area_en(proyecto_id, 'taller'::text, espacio_id));
create policy elementos_ver on public.elementos as PERMISSIVE for SELECT to authenticated
  using (((privado.acceso_area(proyecto_id, 'taller'::text) IS NOT NULL) AND privado.herramientas_equipo()));
create policy cotizaciones_borrar on public.cotizaciones as PERMISSIVE for DELETE to public
  using (
CASE
    WHEN (proyecto_id IS NULL) THEN privado.escribe_en(espacio_id)
    ELSE (privado.acceso_area(proyecto_id, 'costos'::text) = 'editar'::text)
END);
create policy cotizaciones_crear on public.cotizaciones as PERMISSIVE for INSERT to public
  with check (
CASE
    WHEN (proyecto_id IS NULL) THEN privado.escribe_en(espacio_id)
    ELSE privado.edita_area_en(proyecto_id, 'costos'::text, espacio_id)
END);
create policy cotizaciones_editar on public.cotizaciones as PERMISSIVE for UPDATE to public
  using (
CASE
    WHEN (proyecto_id IS NULL) THEN privado.escribe_en(espacio_id)
    ELSE (privado.acceso_area(proyecto_id, 'costos'::text) = 'editar'::text)
END)
  with check (
CASE
    WHEN (proyecto_id IS NULL) THEN privado.escribe_en(espacio_id)
    ELSE privado.edita_area_en(proyecto_id, 'costos'::text, espacio_id)
END);
create policy cotizaciones_ver on public.cotizaciones as PERMISSIVE for SELECT to public
  using (
CASE
    WHEN (proyecto_id IS NULL) THEN privado.es_miembro(espacio_id)
    ELSE (privado.acceso_area(proyecto_id, 'costos'::text) IS NOT NULL)
END);
create policy espacios_renombrar on public.espacios as PERMISSIVE for UPDATE to public
  using (privado.es_dueno(id))
  with check (privado.es_dueno(id));
create policy espacios_ver on public.espacios as PERMISSIVE for SELECT to authenticated
  using (privado.es_miembro(id));
create policy ideas_borrar on public.ideas as PERMISSIVE for DELETE to public
  using (privado.escribe_en(espacio_id));
create policy ideas_crear on public.ideas as PERMISSIVE for INSERT to public
  with check (privado.escribe_en(espacio_id));
create policy ideas_editar on public.ideas as PERMISSIVE for UPDATE to public
  using (privado.escribe_en(espacio_id))
  with check (privado.escribe_en(espacio_id));
create policy ideas_ver on public.ideas as PERMISSIVE for SELECT to public
  using ((privado.rol_en(espacio_id) IS NOT NULL));
create policy interes_borrar on public.interes_funciones as PERMISSIVE for DELETE to authenticated
  using ((user_id = ( SELECT auth.uid() AS uid)));
create policy interes_crear on public.interes_funciones as PERMISSIVE for INSERT to authenticated
  with check ((user_id = ( SELECT auth.uid() AS uid)));
create policy interes_ver on public.interes_funciones as PERMISSIVE for SELECT to authenticated
  using ((user_id = ( SELECT auth.uid() AS uid)));
create policy mensajes_crear on public.mensajes as PERMISSIVE for INSERT to authenticated
  with check ((autor = ( SELECT auth.uid() AS uid)));
create policy mensajes_ver on public.mensajes as PERMISSIVE for SELECT to authenticated
  using ((autor = ( SELECT auth.uid() AS uid)));
create policy "lectura publica" on public.meta as PERMISSIVE for SELECT to anon, authenticated
  using (true);
create policy miembros_ver on public.miembros as PERMISSIVE for SELECT to authenticated
  using (privado.es_miembro(espacio_id));
create policy notas_borrar on public.notas as PERMISSIVE for DELETE to public
  using ((privado.acceso_area(proyecto_id, 'bitacora'::text) = 'editar'::text));
create policy notas_crear on public.notas as PERMISSIVE for INSERT to public
  with check (privado.edita_area_en(proyecto_id, 'bitacora'::text, espacio_id));
create policy notas_editar on public.notas as PERMISSIVE for UPDATE to public
  using ((privado.acceso_area(proyecto_id, 'bitacora'::text) = 'editar'::text))
  with check (privado.edita_area_en(proyecto_id, 'bitacora'::text, espacio_id));
create policy notas_ver on public.notas as PERMISSIVE for SELECT to public
  using ((privado.acceso_area(proyecto_id, 'bitacora'::text) IS NOT NULL));
create policy "lectura publica" on public.oportunidades as PERMISSIVE for SELECT to anon, authenticated
  using (true);
create policy pizarras_borrar on public.pizarras as PERMISSIVE for DELETE to public
  using ((privado.acceso_area(proyecto_id, 'pizarra'::text) = 'editar'::text));
create policy pizarras_crear on public.pizarras as PERMISSIVE for INSERT to public
  with check (privado.edita_area_en(proyecto_id, 'pizarra'::text, espacio_id));
create policy pizarras_editar on public.pizarras as PERMISSIVE for UPDATE to public
  using ((privado.acceso_area(proyecto_id, 'pizarra'::text) = 'editar'::text))
  with check (privado.edita_area_en(proyecto_id, 'pizarra'::text, espacio_id));
create policy pizarras_ver on public.pizarras as PERMISSIVE for SELECT to public
  using ((privado.acceso_area(proyecto_id, 'pizarra'::text) IS NOT NULL));
create policy precios_borrar on public.precios_comunidad as PERMISSIVE for DELETE to authenticated
  using ((autor = ( SELECT auth.uid() AS uid)));
create policy precios_crear on public.precios_comunidad as PERMISSIVE for INSERT to authenticated
  with check ((autor = ( SELECT auth.uid() AS uid)));
create policy precios_ver on public.precios_comunidad as PERMISSIVE for SELECT to authenticated
  using (true);
create policy proyecto_accesos_ver on public.proyecto_accesos as PERMISSIVE for SELECT to public
  using (((user_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM proyectos x
  WHERE ((x.id = proyecto_accesos.proyecto_id) AND privado.es_dueno(x.espacio_id))))));
create policy proyecto_oportunidades_borrar on public.proyecto_oportunidades as PERMISSIVE for DELETE to public
  using ((privado.acceso_area(proyecto_id, 'oportunidades'::text) = 'editar'::text));
create policy proyecto_oportunidades_crear on public.proyecto_oportunidades as PERMISSIVE for INSERT to public
  with check (privado.edita_area_en(proyecto_id, 'oportunidades'::text, espacio_id));
create policy proyecto_oportunidades_editar on public.proyecto_oportunidades as PERMISSIVE for UPDATE to public
  using ((privado.acceso_area(proyecto_id, 'oportunidades'::text) = 'editar'::text))
  with check (privado.edita_area_en(proyecto_id, 'oportunidades'::text, espacio_id));
create policy proyecto_oportunidades_ver on public.proyecto_oportunidades as PERMISSIVE for SELECT to public
  using ((privado.acceso_area(proyecto_id, 'oportunidades'::text) IS NOT NULL));
create policy proyectos_borrar on public.proyectos as PERMISSIVE for DELETE to public
  using (privado.es_dueno(espacio_id));
create policy proyectos_crear on public.proyectos as PERMISSIVE for INSERT to public
  with check (privado.escribe_en(espacio_id));
create policy proyectos_editar on public.proyectos as PERMISSIVE for UPDATE to public
  using (privado.edita(id))
  with check ((privado.escribe_en(espacio_id) OR privado.edita(id)));
create policy proyectos_ver on public.proyectos as PERMISSIVE for SELECT to public
  using (privado.ve_fila(espacio_id, acceso, id));
create policy referentes_borrar on public.referentes as PERMISSIVE for DELETE to public
  using ((privado.acceso_area(proyecto_id, 'referentes'::text) = 'editar'::text));
create policy referentes_crear on public.referentes as PERMISSIVE for INSERT to public
  with check (privado.edita_area_en(proyecto_id, 'referentes'::text, espacio_id));
create policy referentes_editar on public.referentes as PERMISSIVE for UPDATE to public
  using ((privado.acceso_area(proyecto_id, 'referentes'::text) = 'editar'::text))
  with check (privado.edita_area_en(proyecto_id, 'referentes'::text, espacio_id));
create policy referentes_ver on public.referentes as PERMISSIVE for SELECT to public
  using ((privado.acceso_area(proyecto_id, 'referentes'::text) IS NOT NULL));
create policy reportes_ver on public.reportes as PERMISSIVE for SELECT to authenticated
  using ((autor = ( SELECT auth.uid() AS uid)));
create policy rondas_ver on public.rondas as PERMISSIVE for SELECT to authenticated
  using ((privado.acceso_area(proyecto_id, 'taller'::text) IS NOT NULL));
create policy secciones_borrar on public.secciones as PERMISSIVE for DELETE to public
  using ((privado.acceso_area(proyecto_id, 'taller'::text) = 'editar'::text));
create policy secciones_crear on public.secciones as PERMISSIVE for INSERT to public
  with check (privado.edita_area_en(proyecto_id, 'taller'::text, espacio_id));
create policy secciones_editar on public.secciones as PERMISSIVE for UPDATE to public
  using ((privado.acceso_area(proyecto_id, 'taller'::text) = 'editar'::text))
  with check (privado.edita_area_en(proyecto_id, 'taller'::text, espacio_id));
create policy secciones_ver on public.secciones as PERMISSIVE for SELECT to public
  using ((privado.acceso_area(proyecto_id, 'taller'::text) IS NOT NULL));
create policy sugerencias_ver on public.sugerencias as PERMISSIVE for SELECT to authenticated
  using ((autor = ( SELECT auth.uid() AS uid)));
create policy vitrinas_borrar on public.vitrinas as PERMISSIVE for DELETE to public
  using ((privado.acceso_area(proyecto_id, 'vitrina'::text) = 'editar'::text));
create policy vitrinas_crear on public.vitrinas as PERMISSIVE for INSERT to public
  with check (privado.edita_area_en(proyecto_id, 'vitrina'::text, espacio_id));
create policy vitrinas_editar on public.vitrinas as PERMISSIVE for UPDATE to public
  using ((privado.acceso_area(proyecto_id, 'vitrina'::text) = 'editar'::text))
  with check (privado.edita_area_en(proyecto_id, 'vitrina'::text, espacio_id));
create policy vitrinas_ver on public.vitrinas as PERMISSIVE for SELECT to public
  using ((privado.acceso_area(proyecto_id, 'vitrina'::text) IS NOT NULL));
create policy vitrinas_publicadas_ver on public.vitrinas_publicadas as PERMISSIVE for SELECT to anon, authenticated
  using (visible);

-- ===================== PERMISOS DE TABLAS =====================
-- Supabase da todo a anon y authenticated por defecto; aquí se parte de cero y se deja solo lo que hay en la base.
revoke all on all tables in schema public, privado from anon, authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE on public.espacios to authenticated;
grant DELETE, INSERT, SELECT, UPDATE on public.colecciones to authenticated;
grant DELETE, INSERT, SELECT, UPDATE on public.elementos to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.cotizaciones to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.ideas to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.ideas to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.interes_funciones to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.miembros to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.notas to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.pizarras to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.pizarras to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.proyecto_oportunidades to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.proyectos to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.referentes to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.ronda_comentarios to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.ronda_comentarios to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.ronda_lectores to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.ronda_lectores to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.ronda_respuestas to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.ronda_respuestas to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.rondas to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.rondas to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.secciones to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.sugerencias to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.sugerencias to authenticated;
grant DELETE, INSERT, REFERENCES, TRIGGER, TRUNCATE, UPDATE on public.precios_comunidad to authenticated;
grant DELETE, SELECT on public.vitrinas to authenticated;
grant REFERENCES, SELECT, TRIGGER on public.meta to anon;
grant REFERENCES, SELECT, TRIGGER on public.meta to authenticated;
grant REFERENCES, SELECT, TRIGGER on public.oportunidades to anon;
grant REFERENCES, SELECT, TRIGGER on public.oportunidades to authenticated;
grant SELECT on public.proyecto_accesos to authenticated;
-- Permisos por columna (lo que una persona puede escribir o leer de esas tablas):
grant INSERT (boletin, funciones, vitrinas) on public.correo_prefs to authenticated;
grant INSERT (borrador, espacio_id, proyecto_id, slug) on public.vitrinas to authenticated;
grant INSERT (documento, version) on public.aceptaciones to authenticated;
grant INSERT (texto, tipo, vitrina_id) on public.mensajes to authenticated;
grant SELECT (acento, busqueda, datos, en_explorar, estado, firma, formato, lema, portada, publicado_en, slug, tipo, titulo) on public.vitrinas_publicadas to anon;
grant SELECT (acento, busqueda, datos, en_explorar, estado, firma, formato, lema, portada, publicado_en, slug, tipo, titulo) on public.vitrinas_publicadas to authenticated;
grant SELECT (aceptado_en, documento, version) on public.aceptaciones to authenticated;
grant SELECT (actualizado_en, boletin, boletin_desde, funciones, vitrinas) on public.correo_prefs to authenticated;
grant SELECT (cantidad, componente, creado_en, enlace, envio, especificaciones, id, incluye_iva, moneda, origen, plazo, precio, proveedor) on public.precios_comunidad to authenticated;
grant SELECT (creado_en, detalle, estado, id, motivo, revisado_en, vitrina_id) on public.reportes to authenticated;
grant SELECT (creado_en, enlace, id, leido, texto, tipo, titulo) on public.avisos to authenticated;
grant SELECT (creado_en, estado, id, respondido_en, respuesta, texto, tipo, vitrina_id) on public.mensajes to authenticated;
grant UPDATE (boletin, funciones, vitrinas) on public.correo_prefs to authenticated;
grant UPDATE (borrador, slug) on public.vitrinas to authenticated;
grant UPDATE (leido) on public.avisos to authenticated;
grant UPDATE (nombre) on public.espacios to authenticated;

-- ===================== PERMISOS DE FUNCIONES =====================
-- Las de privado no se exponen en la API; las de public que no se nombran aquí quedan solo para el servidor.
revoke all on function public.abrir_ronda(p uuid, titulo text, contenido jsonb, preguntas jsonb, cierra date) from public, anon, authenticated, service_role;
grant execute on function public.abrir_ronda(p uuid, titulo text, contenido jsonb, preguntas jsonb, cierra date) to authenticated, service_role;
revoke all on function public.acceso_proyecto(p uuid) from public, anon, authenticated, service_role;
grant execute on function public.acceso_proyecto(p uuid) to authenticated, service_role;
revoke all on function public.aceptar_invitacion(t uuid) from public, anon, authenticated, service_role;
grant execute on function public.aceptar_invitacion(t uuid) to authenticated, service_role;
revoke all on function public.anotar_recompensa(slug text, tier text, si boolean) from public, anon, authenticated, service_role;
grant execute on function public.anotar_recompensa(slug text, tier text, si boolean) to authenticated, service_role;
revoke all on function public.anular_invitacion(i uuid) from public, anon, authenticated, service_role;
grant execute on function public.anular_invitacion(i uuid) to authenticated, service_role;
revoke all on function public.avisar_seguidores(v uuid, titulo text, texto text) from public, anon, authenticated, service_role;
grant execute on function public.avisar_seguidores(v uuid, titulo text, texto text) to authenticated, service_role;
revoke all on function public.baja_correo(t uuid, que text, slug text) from public, anon, authenticated, service_role;
grant execute on function public.baja_correo(t uuid, que text, slug text) to anon, authenticated, service_role;
revoke all on function public.borrar_comentario_ronda(t uuid, c uuid) from public, anon, authenticated, service_role;
grant execute on function public.borrar_comentario_ronda(t uuid, c uuid) to authenticated, service_role;
revoke all on function public.borrar_mi_cuenta(confirmacion text) from public, anon, authenticated, service_role;
grant execute on function public.borrar_mi_cuenta(confirmacion text) to authenticated, service_role;
revoke all on function public.borrar_mis_respuestas(t uuid) from public, anon, authenticated, service_role;
grant execute on function public.borrar_mis_respuestas(t uuid) to authenticated, service_role;
revoke all on function public.borrar_ronda(r uuid) from public, anon, authenticated, service_role;
grant execute on function public.borrar_ronda(r uuid) to authenticated, service_role;
revoke all on function public.cerrar_ronda(r uuid, palabra text) from public, anon, authenticated, service_role;
grant execute on function public.cerrar_ronda(r uuid, palabra text) to authenticated, service_role;
revoke all on function public.cola_clave() from public, anon, authenticated, service_role;
grant execute on function public.cola_clave() to service_role;
revoke all on function public.cola_marcar(id bigint, ok boolean, error text) from public, anon, authenticated, service_role;
grant execute on function public.cola_marcar(id bigint, ok boolean, error text) to service_role;
revoke all on function public.cola_tomar(limite integer) from public, anon, authenticated, service_role;
grant execute on function public.cola_tomar(limite integer) to service_role;
revoke all on function public.comentar_ronda(t uuid, parte integer, parrafo integer, cita text, texto text) from public, anon, authenticated, service_role;
grant execute on function public.comentar_ronda(t uuid, parte integer, parrafo integer, cita text, texto text) to authenticated, service_role;
revoke all on function public.crear_espacio_personal() from public, anon, authenticated, service_role;
grant execute on function public.crear_espacio_personal() to service_role;
revoke all on function public.despublicar_vitrina(v uuid) from public, anon, authenticated, service_role;
grant execute on function public.despublicar_vitrina(v uuid) to authenticated, service_role;
revoke all on function public.equipo_panel(e uuid) from public, anon, authenticated, service_role;
grant execute on function public.equipo_panel(e uuid) to authenticated, service_role;
revoke all on function public.equipo_quitar(e uuid, u uuid) from public, anon, authenticated, service_role;
grant execute on function public.equipo_quitar(e uuid, u uuid) to authenticated, service_role;
revoke all on function public.equipo_rol(e uuid, u uuid, rol text) from public, anon, authenticated, service_role;
grant execute on function public.equipo_rol(e uuid, u uuid, rol text) to authenticated, service_role;
revoke all on function public.estado_recompensas(slug text) from public, anon, authenticated, service_role;
grant execute on function public.estado_recompensas(slug text) to public, anon, authenticated, service_role;
revoke all on function public.estado_seguir(slug text) from public, anon, authenticated, service_role;
grant execute on function public.estado_seguir(slug text) to anon, authenticated, service_role;
revoke all on function public.invitar(p uuid, correo text, rol text, areas jsonb) from public, anon, authenticated, service_role;
grant execute on function public.invitar(p uuid, correo text, rol text, areas jsonb) to authenticated, service_role;
revoke all on function public.invitar_lector(r uuid, nombre text) from public, anon, authenticated, service_role;
grant execute on function public.invitar_lector(r uuid, nombre text) to authenticated, service_role;
revoke all on function public.marcar_opinion(tipo text, id uuid, marca text) from public, anon, authenticated, service_role;
grant execute on function public.marcar_opinion(tipo text, id uuid, marca text) to authenticated, service_role;
revoke all on function public.mis_anotadas() from public, anon, authenticated, service_role;
grant execute on function public.mis_anotadas() to authenticated, service_role;
revoke all on function public.mis_compartidos() from public, anon, authenticated, service_role;
grant execute on function public.mis_compartidos() to authenticated, service_role;
revoke all on function public.herramientas_equipo() from public, anon, authenticated, service_role;
grant execute on function public.herramientas_equipo() to authenticated, service_role;
revoke all on function privado.herramientas_equipo() from public, anon, authenticated, service_role;
grant execute on function privado.herramientas_equipo() to authenticated;
revoke all on function privado.plantilla_ok(pl text, tipo text) from public, anon, authenticated, service_role;
revoke all on function privado.t_colecciones() from public, anon, authenticated, service_role;
revoke all on function privado.t_elementos() from public, anon, authenticated, service_role;
revoke all on function public.mis_espacios() from public, anon, authenticated, service_role;
grant execute on function public.mis_espacios() to authenticated, service_role;
revoke all on function public.mis_lecturas() from public, anon, authenticated, service_role;
grant execute on function public.mis_lecturas() to authenticated, service_role;
revoke all on function public.mis_seguidas() from public, anon, authenticated, service_role;
grant execute on function public.mis_seguidas() to authenticated, service_role;
revoke all on function public.mismo_espacio() from public, anon, authenticated, service_role;
grant execute on function public.mismo_espacio() to public, anon, authenticated, service_role;
revoke all on function public.mod_anunciar_funcion(funcion text, titulo text, texto text, enlace text) from public, anon, authenticated, service_role;
grant execute on function public.mod_anunciar_funcion(funcion text, titulo text, texto text, enlace text) to authenticated, service_role;
revoke all on function public.mod_boletin(datos jsonb, prueba boolean) from public, anon, authenticated, service_role;
grant execute on function public.mod_boletin(datos jsonb, prueba boolean) to authenticated, service_role;
revoke all on function public.mod_correos() from public, anon, authenticated, service_role;
grant execute on function public.mod_correos() to authenticated, service_role;
revoke all on function public.mod_explorar(v uuid, mostrar boolean, mensaje text) from public, anon, authenticated, service_role;
grant execute on function public.mod_explorar(v uuid, mostrar boolean, mensaje text) to authenticated, service_role;
revoke all on function public.mod_intereses() from public, anon, authenticated, service_role;
grant execute on function public.mod_intereses() to authenticated, service_role;
revoke all on function public.mod_panel() from public, anon, authenticated, service_role;
grant execute on function public.mod_panel() to authenticated, service_role;
revoke all on function public.mod_probar(tipo text, datos jsonb) from public, anon, authenticated, service_role;
grant execute on function public.mod_probar(tipo text, datos jsonb) to authenticated, service_role;
revoke all on function public.mod_resolver(v uuid, decision text) from public, anon, authenticated, service_role;
grant execute on function public.mod_resolver(v uuid, decision text) to authenticated, service_role;
revoke all on function public.mod_responder(m uuid, respuesta text, avisar boolean) from public, anon, authenticated, service_role;
grant execute on function public.mod_responder(m uuid, respuesta text, avisar boolean) to authenticated, service_role;
revoke all on function public.mod_restaurar(v uuid, mensaje text) from public, anon, authenticated, service_role;
grant execute on function public.mod_restaurar(v uuid, mensaje text) to authenticated, service_role;
revoke all on function public.mod_sugerencia(s uuid, estado text, respuesta text) from public, anon, authenticated, service_role;
grant execute on function public.mod_sugerencia(s uuid, estado text, respuesta text) to authenticated, service_role;
revoke all on function public.mod_suspender(v uuid, motivo text, mensaje text) from public, anon, authenticated, service_role;
grant execute on function public.mod_suspender(v uuid, motivo text, mensaje text) to authenticated, service_role;
revoke all on function public.mod_vitrina(v uuid) from public, anon, authenticated, service_role;
grant execute on function public.mod_vitrina(v uuid) to authenticated, service_role;
revoke all on function public.mover_proyecto(p uuid, destino uuid) from public, anon, authenticated, service_role;
grant execute on function public.mover_proyecto(p uuid, destino uuid) to authenticated, service_role;
revoke all on function public.persona_cambiar(p uuid, u uuid, rol text, areas jsonb) from public, anon, authenticated, service_role;
grant execute on function public.persona_cambiar(p uuid, u uuid, rol text, areas jsonb) to authenticated, service_role;
revoke all on function public.persona_quitar(p uuid, u uuid) from public, anon, authenticated, service_role;
grant execute on function public.persona_quitar(p uuid, u uuid) to authenticated, service_role;
revoke all on function public.proyecto_acceso(p uuid, acceso text, personas jsonb) from public, anon, authenticated, service_role;
grant execute on function public.proyecto_acceso(p uuid, acceso text, personas jsonb) to authenticated, service_role;
revoke all on function public.proyecto_personas(p uuid) from public, anon, authenticated, service_role;
grant execute on function public.proyecto_personas(p uuid) to authenticated, service_role;
revoke all on function public.publicar_vitrina(v uuid, datos jsonb, listar boolean) from public, anon, authenticated, service_role;
grant execute on function public.publicar_vitrina(v uuid, datos jsonb, listar boolean) to authenticated, service_role;
revoke all on function public.quitar_lector(l uuid) from public, anon, authenticated, service_role;
grant execute on function public.quitar_lector(l uuid) to authenticated, service_role;
revoke all on function public.rechazar_invitacion(t uuid) from public, anon, authenticated, service_role;
grant execute on function public.rechazar_invitacion(t uuid) to authenticated, service_role;
revoke all on function public.recompensas_de(v uuid) from public, anon, authenticated, service_role;
grant execute on function public.recompensas_de(v uuid) to authenticated, service_role;
revoke all on function public.reportar_vitrina(slug text, motivo text, detalle text) from public, anon, authenticated, service_role;
grant execute on function public.reportar_vitrina(slug text, motivo text, detalle text) to authenticated, service_role;
revoke all on function public.responder_ronda(t uuid, respuestas jsonb) from public, anon, authenticated, service_role;
grant execute on function public.responder_ronda(t uuid, respuestas jsonb) to authenticated, service_role;
revoke all on function public.ronda_panel(r uuid) from public, anon, authenticated, service_role;
grant execute on function public.ronda_panel(r uuid) to authenticated, service_role;
revoke all on function public.seguidores_de(v uuid) from public, anon, authenticated, service_role;
grant execute on function public.seguidores_de(v uuid) to authenticated, service_role;
revoke all on function public.seguir_vitrina(slug text, seguir boolean) from public, anon, authenticated, service_role;
grant execute on function public.seguir_vitrina(slug text, seguir boolean) to authenticated, service_role;
revoke all on function public.soy_admin() from public, anon, authenticated, service_role;
grant execute on function public.soy_admin() to authenticated, service_role;
revoke all on function public.sugerir(texto text, area text) from public, anon, authenticated, service_role;
grant execute on function public.sugerir(texto text, area text) to authenticated, service_role;
revoke all on function public.tocar_actualizado() from public, anon, authenticated, service_role;
grant execute on function public.tocar_actualizado() to public, anon, authenticated, service_role;
revoke all on function public.ver_invitacion(t uuid) from public, anon, authenticated, service_role;
grant execute on function public.ver_invitacion(t uuid) to public, anon, authenticated, service_role;
revoke all on function public.ver_ronda(t uuid) from public, anon, authenticated, service_role;
grant execute on function public.ver_ronda(t uuid) to anon, authenticated, service_role;
-- privado.acceso(p uuid): permisos por defecto (cualquiera puede ejecutarla)
-- privado.acceso_area(p uuid, area text): permisos por defecto (cualquiera puede ejecutarla)
revoke all on function privado.activos(e uuid) from public, anon, authenticated, service_role;
grant execute on function privado.activos(e uuid) to authenticated;
-- privado.avisar_duenos(v uuid, tipo text, titulo text, texto text, enlace text): permisos por defecto (cualquiera puede ejecutarla)
revoke all on function privado.despachar() from public, anon, authenticated, service_role;
-- privado.edita(p uuid): permisos por defecto (cualquiera puede ejecutarla)
-- privado.edita_area_en(p uuid, area text, e uuid): permisos por defecto (cualquiera puede ejecutarla)
revoke all on function privado.editable(proy uuid) from public, anon, authenticated, service_role;
grant execute on function privado.editable(proy uuid) to authenticated;
-- privado.es_admin(): permisos por defecto (cualquiera puede ejecutarla)
-- privado.es_dueno(e uuid): permisos por defecto (cualquiera puede ejecutarla)
-- privado.es_equipo(correo text): permisos por defecto (cualquiera puede ejecutarla)
revoke all on function privado.es_mas(e uuid) from public, anon, authenticated, service_role;
grant execute on function privado.es_mas(e uuid) to authenticated;
revoke all on function privado.es_miembro(e uuid) from public, anon, authenticated, service_role;
grant execute on function privado.es_miembro(e uuid) to authenticated, service_role;
revoke all on function privado.es_pago(u text) from public, anon, authenticated, service_role;
-- privado.escribe_en(e uuid): permisos por defecto (cualquiera puede ejecutarla)
revoke all on function privado.lector_de(t uuid) from public, anon, authenticated, service_role;
revoke all on function privado.limite(clave text) from public, anon, authenticated, service_role;
grant execute on function privado.limite(clave text) to authenticated;
-- privado.limpiar_areas(areas jsonb): permisos por defecto (cualquiera puede ejecutarla)
revoke all on function privado.maneja_rondas(p uuid) from public, anon, authenticated, service_role;
-- privado.max_invitados(p uuid): permisos por defecto (cualquiera puede ejecutarla)
revoke all on function privado.mi_lectura(t uuid) from public, anon, authenticated, service_role;
-- privado.motivo_txt(m text): permisos por defecto (cualquiera puede ejecutarla)
revoke all on function privado.palabras(t text) from public, anon, authenticated, service_role;
revoke all on function privado.palabras_proyecto(p uuid) from public, anon, authenticated, service_role;
grant execute on function privado.palabras(t text) to authenticated;
revoke all on function privado.plan_de(e uuid) from public, anon, authenticated, service_role;
revoke all on function privado.prefs(u uuid) from public, anon, authenticated, service_role;
-- privado.publica(p uuid): permisos por defecto (cualquiera puede ejecutarla)
-- privado.registrar(e uuid, accion text, detalle jsonb): permisos por defecto (cualquiera puede ejecutarla)
-- privado.rol_en(e uuid): permisos por defecto (cualquiera puede ejecutarla)
revoke all on function privado.ronda_abierta(l ronda_lectores) from public, anon, authenticated, service_role;
-- privado.sin_tildes(t text): permisos por defecto (cualquiera puede ejecutarla)
-- privado.t_borrar_personal(): permisos por defecto (cualquiera puede ejecutarla)
-- privado.t_confirmado(): permisos por defecto (cualquiera puede ejecutarla)
-- privado.t_correo_prefs(): permisos por defecto (cualquiera puede ejecutarla)
-- privado.t_espacio_fijo(): permisos por defecto (cualquiera puede ejecutarla)
-- privado.t_ideas(): permisos por defecto (cualquiera puede ejecutarla)
-- privado.t_lectura(): permisos por defecto (cualquiera puede ejecutarla)
-- privado.t_mensajes(): permisos por defecto (cualquiera puede ejecutarla)
-- privado.t_pizarras(): permisos por defecto (cualquiera puede ejecutarla)
-- privado.t_proyectos(): permisos por defecto (cualquiera puede ejecutarla)
-- privado.t_referentes(): permisos por defecto (cualquiera puede ejecutarla)
-- privado.t_secciones(): permisos por defecto (cualquiera puede ejecutarla)
revoke all on function privado.t_tipo_comic() from public, anon, authenticated, service_role;
-- privado.t_vitrina_slug(): permisos por defecto (cualquiera puede ejecutarla)
-- privado.tarjetas(d jsonb): permisos por defecto (cualquiera puede ejecutarla)
revoke all on function privado.tope(e uuid, clave text) from public, anon, authenticated, service_role;
-- privado.unir_equipos(uid uuid, correo text): permisos por defecto (cualquiera puede ejecutarla)
-- privado.ve(p uuid): permisos por defecto (cualquiera puede ejecutarla)
-- privado.ve_fila(e uuid, acceso text, p uuid): permisos por defecto (cualquiera puede ejecutarla)

-- ===================== TAREAS PROGRAMADAS (pg_cron) =====================
select cron.schedule('forja-correos', '*/10 * * * *', $$select privado.despachar()$$);
select cron.schedule('forja-limpieza', '17 4 * * 0', $$delete from cron.job_run_details where end_time < now() - interval '14 days'$$);

-- Clave de la cola de correos (la Edge Function enviar-correos la compara con el encabezado x-forja-clave):
-- insert into privado.config(clave, valor) values ('cola_clave', encode(gen_random_bytes(24), 'hex'));

-- ===================== DOCUMENTOS LEGALES Y CUENTAS INACTIVAS (2026-11-12) =====================
-- Una versión de los documentos existe para el público solo si se avisó por correo a todas las cuentas (mod_legal_avisar)
-- y rige 15 días después del aviso; aceptaciones solo admite la vigente. El texto vive en docs/legal/ del repositorio.
create table public.legal_versiones(
  version text primary key check (char_length(version) between 1 and 20),
  base text,
  resumen text not null default '' check (char_length(resumen) <= 1200),
  documentos text[] not null default '{}',
  inactivas boolean not null default false,
  huella text check (char_length(huella) <= 80),
  probada_en timestamptz,
  avisada_en timestamptz,
  avisada_por uuid,
  rige date,
  destinatarios int,
  reemplazada_por text,
  correo jsonb check (correo is null or (jsonb_typeof(correo) = 'object' and pg_column_size(correo) <= 12000)),
  creada_en timestamptz not null default now()
);
alter table public.legal_versiones enable row level security;
revoke all on public.legal_versiones from anon, authenticated;

create table privado.accesos(
  user_id uuid primary key references auth.users(id) on delete cascade,
  ultimo timestamptz not null default now(),
  aviso1 timestamptz, correo1 bigint,
  aviso2 timestamptz, correo2 bigint
);
create index if not exists correos_legal_idx on privado.correos ((datos->>'version')) where tipo = 'legal';

create or replace function privado.hoy_chile() returns date language sql stable set search_path to '' as $$
  select (now() at time zone 'America/Santiago')::date $$;
create or replace function privado.legal_pendientes(v text) returns bigint language sql stable security definer set search_path to '' as $$
  select count(*) from privado.correos c where c.tipo = 'legal' and c.datos->>'version' = v and c.enviado_en is null and c.intentos < 3 $$;
create or replace function privado.legal_vigente() returns text language sql stable security definer set search_path to '' as $$
  select l.version from public.legal_versiones l
  where l.avisada_en is not null and l.reemplazada_por is null and l.rige <= privado.hoy_chile() and privado.legal_pendientes(l.version) = 0
  order by l.rige desc, l.avisada_en desc limit 1 $$;
create or replace function privado.legal_rige_para(n int) returns date language sql stable set search_path to '' as $$
  select privado.hoy_chile() + 15 + greatest(ceil(coalesce(n, 0) / 80.0)::int - 1, 0) $$;
create or replace function privado.legal_datos(l public.legal_versiones, rige date) returns jsonb language sql stable set search_path to '' as $$
  select jsonb_build_object('version', l.version, 'resumen', l.resumen, 'documentos', to_jsonb(l.documentos), 'rige', rige, 'enlace', 'documentos/?v=' || l.version)
    || case when l.correo is not null then jsonb_build_object('correo', l.correo) else '{}'::jsonb end $$;

create or replace function public.legal_estado() returns jsonb language plpgsql stable security definer set search_path to '' as $$
declare vig text := privado.legal_vigente();
begin
  return jsonb_build_object('hoy', privado.hoy_chile(), 'vigente', vig, 'versiones', coalesce((
    select jsonb_agg(jsonb_build_object('version', l.version, 'base', l.base, 'resumen', l.resumen, 'documentos', l.documentos,
      'avisada', (l.avisada_en at time zone 'America/Santiago')::date, 'rige', l.rige, 'reemplazada_por', l.reemplazada_por,
      'estado', case when l.version = vig then 'vigente' when l.reemplazada_por is not null then 'reemplazada'
                     when vig is null or l.rige > (select x.rige from public.legal_versiones x where x.version = vig) or (l.rige = (select x.rige from public.legal_versiones x where x.version = vig) and l.avisada_en > (select x.avisada_en from public.legal_versiones x where x.version = vig)) then 'proxima'
                     else 'anterior' end) order by l.rige, l.avisada_en)
    from public.legal_versiones l where l.avisada_en is not null), '[]'::jsonb));
end $$;

create or replace function privado.t_aceptaciones() returns trigger language plpgsql security definer set search_path to '' as $$
begin
  if new.version is distinct from privado.legal_vigente() then raise exception 'FORJA_VERSION_NO_VIGENTE'; end if;
  return new;
end $$;
create trigger aceptar_solo_vigente before insert on public.aceptaciones for each row execute function privado.t_aceptaciones();

create or replace function public.mod_legal_probar(version text, resumen text, documentos text[], inactivas boolean, huella text, correo jsonb default null) returns date
language plpgsql security definer set search_path to '' as $$
#variable_conflict use_column
declare l public.legal_versiones; n int; p_v text := mod_legal_probar.version; p_r text := btrim(coalesce(mod_legal_probar.resumen, ''));
  p_d text[] := mod_legal_probar.documentos; p_i boolean := coalesce(mod_legal_probar.inactivas, false); p_h text := btrim(coalesce(mod_legal_probar.huella, ''));
  p_c jsonb := mod_legal_probar.correo;
begin
  if not privado.es_admin() then raise exception 'FORJA_NO_PERMITIDO'; end if;
  if p_r = '' or p_h = '' or coalesce(array_length(p_d, 1), 0) = 0 then raise exception 'FORJA_FALTA_MENSAJE'; end if;
  select * into l from public.legal_versiones x where x.version = p_v;
  if found and l.avisada_en is not null then raise exception 'FORJA_YA_AVISADA'; end if;
  insert into public.legal_versiones as x(version, resumen, documentos, inactivas, huella, correo, probada_en)
    values (p_v, p_r, p_d, p_i, p_h, p_c, now())
    on conflict (version) do update set resumen = excluded.resumen, documentos = excluded.documentos, inactivas = excluded.inactivas, huella = excluded.huella, correo = excluded.correo, probada_en = now()
    returning * into l;
  select count(*) into n from auth.users u where u.email is not null and u.deleted_at is null;
  insert into privado.correos(user_id, tipo, datos) values (auth.uid(), 'prueba', privado.legal_datos(l, privado.legal_rige_para(n)) || jsonb_build_object('de', 'legal'));
  return privado.legal_rige_para(n);
end $$;

create or replace function public.mod_legal_avisar(version text, huella text) returns jsonb
language plpgsql security definer set search_path to '' as $$
declare l public.legal_versiones; n int; r date; vig text := privado.legal_vigente();
begin
  if not privado.es_admin() then raise exception 'FORJA_NO_PERMITIDO'; end if;
  select * into l from public.legal_versiones x where x.version = mod_legal_avisar.version for update;
  if not found then raise exception 'FORJA_NO_ENCONTRADA'; end if;
  if l.avisada_en is not null then raise exception 'FORJA_YA_AVISADA'; end if;
  if l.probada_en is null or l.huella is distinct from mod_legal_avisar.huella then raise exception 'FORJA_PROBAR_DE_NUEVO'; end if;
  select count(*) into n from auth.users u where u.email is not null and u.deleted_at is null;
  r := privado.legal_rige_para(n);
  update public.legal_versiones x set reemplazada_por = l.version
    where x.avisada_en is not null and x.reemplazada_por is null and x.version <> l.version and (vig is null or x.version <> vig) and x.rige > privado.hoy_chile();
  update public.legal_versiones x set avisada_en = now(), avisada_por = auth.uid(), rige = r, base = vig, destinatarios = n where x.version = l.version returning * into l;
  insert into privado.correos(user_id, tipo, datos)
    select u.id, 'legal', privado.legal_datos(l, r) from auth.users u where u.email is not null and u.deleted_at is null;
  insert into public.avisos(user_id, tipo, titulo, texto, enlace)
    select u.id, 'info', 'Los documentos de Forja cambian el ' || to_char(r, 'DD/MM/YYYY'), left(l.resumen, 600), 'documentos/?v=' || l.version
    from auth.users u where u.deleted_at is null;
  insert into privado.registro(admin, accion, detalle) values (auth.uid(), 'documentos_aviso', jsonb_build_object('version', l.version, 'rige', r, 'destinatarios', n, 'base', vig));
  return jsonb_build_object('rige', r, 'destinatarios', n);
end $$;

create or replace function privado.inactivas_desde() returns date language sql stable security definer set search_path to '' as $$
  select case when (select l.inactivas from public.legal_versiones l where l.version = privado.legal_vigente()) then
    (select min(l.rige) from public.legal_versiones l where l.inactivas and l.avisada_en is not null and l.reemplazada_por is null and l.rige <= privado.hoy_chile()) end $$;

create or replace function public.mod_legal_panel() returns jsonb language plpgsql stable security definer set search_path to '' as $$
begin
  if not privado.es_admin() then raise exception 'FORJA_NO_PERMITIDO'; end if;
  return jsonb_build_object(
    'hoy', privado.hoy_chile(), 'vigente', privado.legal_vigente(),
    'cuentas', (select count(*) from auth.users u where u.email is not null and u.deleted_at is null),
    'versiones', coalesce((select jsonb_agg(jsonb_build_object('version', l.version, 'base', l.base, 'resumen', l.resumen, 'documentos', l.documentos, 'inactivas', l.inactivas,
        'huella', l.huella, 'probada_en', l.probada_en, 'avisada_en', l.avisada_en, 'rige', l.rige, 'destinatarios', l.destinatarios, 'reemplazada_por', l.reemplazada_por,
        'enviados', (select count(*) from privado.correos c where c.tipo = 'legal' and c.datos->>'version' = l.version and c.enviado_en is not null and c.error is null),
        'pendientes', privado.legal_pendientes(l.version),
        'fallidos', (select count(*) from privado.correos c where c.tipo = 'legal' and c.datos->>'version' = l.version and c.enviado_en is null and c.intentos >= 3)) order by l.creada_en)
      from public.legal_versiones l), '[]'::jsonb),
    'inactivas', jsonb_build_object(
      'desde', privado.inactivas_desde(),
      'parte', (select min(l.rige) from public.legal_versiones l where l.inactivas and l.avisada_en is not null and l.reemplazada_por is null),
      'aviso1', (select count(*) from privado.accesos a where a.aviso1 is not null and a.aviso2 is null),
      'aviso2', (select count(*) from privado.accesos a where a.aviso2 is not null),
      'borradas', (select count(*) from privado.registro r where r.accion = 'cuenta_inactiva'),
      'volvieron', (select count(*) from privado.registro r where r.accion = 'inactiva_vuelve'),
      'errores', (select count(*) from privado.registro r where r.accion = 'inactiva_error' and r.en > now() - interval '7 days')));
end $$;

-- Limpia lo pendiente del aviso por inactividad cuando la cuenta vuelve a contar como activa.
create or replace function privado.limpiar_inactiva(u uuid) returns void language sql security definer set search_path to '' as $$
  delete from privado.correos c where c.user_id = u and c.tipo = 'inactiva' and c.enviado_en is null and c.tomado_en is null;
  update public.avisos a set leido = true where a.user_id = u and not a.leido and a.enlace = 'cuenta/#datos' and a.titulo like '%se borrará el%';
$$;
create or replace function public.marcar_acceso() returns void language plpgsql security definer set search_path to '' as $$
declare etapa int;
begin
  if auth.uid() is null then return; end if;
  select case when a.aviso2 is not null then 2 when a.aviso1 is not null then 1 end into etapa from privado.accesos a where a.user_id = auth.uid();
  insert into privado.accesos(user_id, ultimo) values (auth.uid(), now())
    on conflict (user_id) do update set ultimo = now(), aviso1 = null, correo1 = null, aviso2 = null, correo2 = null
    where privado.accesos.ultimo < now() - interval '1 hour' or privado.accesos.aviso1 is not null;
  if etapa is not null then
    perform privado.limpiar_inactiva(auth.uid());
    insert into privado.registro(admin, accion, detalle) values (null, 'inactiva_vuelve', jsonb_build_object('fecha', privado.hoy_chile(), 'etapa', etapa));
  end if;
end $$;
create or replace function public.mi_ultimo_acceso() returns timestamptz language sql stable security definer set search_path to '' as $$
  select ultimo from privado.accesos where user_id = auth.uid() $$;

create or replace function privado.exenta_inactividad(u uuid) returns boolean language sql stable security definer set search_path to '' as $$
  select exists(select 1 from public.espacios e where e.creado_por = u and e.tipo = 'personal' and privado.plan_de(e.id) <> 'libre')
      or exists(select 1 from public.miembros m join public.espacios e on e.id = m.espacio_id where m.user_id = u and e.tipo = 'equipo')
      or exists(select 1 from auth.users x where x.id = u and x.email_confirmed_at is not null and privado.es_equipo(x.email))
      or exists(select 1 from public.vitrinas_publicadas vp join public.vitrinas v on v.id = vp.vitrina_id join public.espacios e on e.id = v.espacio_id
                where vp.visible and (e.creado_por = u or exists(select 1 from public.miembros m where m.espacio_id = e.id and m.user_id = u and m.rol = 'dueno'))) $$;

create or replace function privado.revisar_inactivas() returns jsonb language plpgsql security definer set search_path to '' as $$
declare desde date := privado.inactivas_desde(); r record; ult timestamptz; borra date; cid bigint; a1 int := 0; a2 int := 0; b int := 0; f int := 0;
begin
  if desde is null then return jsonb_build_object('activa', false); end if;
  for r in select u.id, u.created_at, u.last_sign_in_at, a.ultimo, a.aviso1, a.correo1, a.aviso2, a.correo2
           from auth.users u left join privado.accesos a on a.user_id = u.id where u.deleted_at is null loop
    begin
      if privado.exenta_inactividad(r.id) then
        -- Mientras está exenta cuenta como activa: si deja de estarlo, el conteo parte desde ahí.
        if r.aviso1 is not null then perform privado.limpiar_inactiva(r.id); end if;
        insert into privado.accesos(user_id, ultimo) values (r.id, now())
          on conflict (user_id) do update set ultimo = now(), aviso1 = null, correo1 = null, aviso2 = null, correo2 = null;
        continue;
      end if;
      ult := greatest(r.created_at, r.last_sign_in_at, r.ultimo, (desde::timestamp at time zone 'America/Santiago'));
      if r.aviso2 is not null and now() >= ult + interval '150 days' and now() >= r.aviso2 + interval '25 days'
         and privado.hoy_chile() >= coalesce((select (c.datos->>'borra')::date from privado.correos c where c.id = r.correo2), 'infinity'::date)
         and exists(select 1 from privado.correos c where c.id = r.correo1 and c.enviado_en is not null and c.error is null)
         and exists(select 1 from privado.correos c where c.id = r.correo2 and c.enviado_en is not null and c.error is null) then
        delete from public.espacios e where e.creado_por = r.id and e.tipo = 'personal';
        delete from auth.users u where u.id = r.id;
        -- Solo la fecha: la cuenta ya no existe y no se guarda quién era.
        insert into privado.registro(admin, accion, detalle) values (null, 'cuenta_inactiva', jsonb_build_object('fecha', privado.hoy_chile()));
        b := b + 1;
      elsif r.aviso1 is not null and r.aviso2 is null and now() >= ult + interval '120 days' and now() >= r.aviso1 + interval '25 days' then
        borra := greatest((ult + interval '150 days'), now() + interval '25 days')::date + 1;
        insert into privado.correos(user_id, tipo, datos) values (r.id, 'inactiva', jsonb_build_object('etapa', 2, 'borra', borra)) returning id into cid;
        insert into public.avisos(user_id, tipo, titulo, texto, enlace) values (r.id, 'info', 'Segundo aviso: tu cuenta se borrará el ' || to_char(borra, 'DD/MM/YYYY'),
          'No has entrado a Forja en 120 días. Entrar ahora basta para conservarla. Si prefieres irte, descarga antes tus datos.', 'cuenta/#datos');
        update privado.accesos set aviso2 = now(), correo2 = cid where user_id = r.id;
        insert into privado.registro(admin, accion, detalle) values (null, 'inactiva_aviso', jsonb_build_object('fecha', privado.hoy_chile(), 'etapa', 2, 'borra', borra));
        a2 := a2 + 1;
      elsif r.aviso1 is null and now() >= ult + interval '90 days' then
        borra := greatest((ult + interval '150 days'), now() + interval '55 days')::date + 1;
        insert into privado.correos(user_id, tipo, datos) values (r.id, 'inactiva', jsonb_build_object('etapa', 1, 'borra', borra)) returning id into cid;
        insert into public.avisos(user_id, tipo, titulo, texto, enlace) values (r.id, 'info', 'Tu cuenta se borrará el ' || to_char(borra, 'DD/MM/YYYY') || ' si no entras',
          'No has entrado a Forja en 90 días. Entrar ahora basta para conservarla. Si prefieres irte, descarga antes tus datos.', 'cuenta/#datos');
        insert into privado.accesos(user_id, ultimo, aviso1, correo1) values (r.id, ult, now(), cid)
          on conflict (user_id) do update set aviso1 = now(), correo1 = cid;
        insert into privado.registro(admin, accion, detalle) values (null, 'inactiva_aviso', jsonb_build_object('fecha', privado.hoy_chile(), 'etapa', 1, 'borra', borra));
        a1 := a1 + 1;
      end if;
    exception when others then
      -- Una cuenta con problemas no detiene la revisión de las demás.
      insert into privado.registro(admin, accion, detalle) values (null, 'inactiva_error', jsonb_build_object('fecha', privado.hoy_chile(), 'error', sqlstate));
      f := f + 1;
    end;
  end loop;
  return jsonb_build_object('activa', true, 'aviso1', a1, 'aviso2', a2, 'borradas', b, 'errores', f);
end $$;

revoke all on function public.legal_estado() from public;
grant execute on function public.legal_estado() to anon, authenticated, service_role;
revoke all on function public.mod_legal_probar(text, text, text[], boolean, text, jsonb) from public, anon;
grant execute on function public.mod_legal_probar(text, text, text[], boolean, text, jsonb) to authenticated, service_role;
revoke all on function public.mod_legal_avisar(text, text) from public, anon;
grant execute on function public.mod_legal_avisar(text, text) to authenticated, service_role;
revoke all on function public.mod_legal_panel() from public, anon;
grant execute on function public.mod_legal_panel() to authenticated, service_role;
revoke all on function public.marcar_acceso() from public, anon;
grant execute on function public.marcar_acceso() to authenticated;
revoke all on function public.mi_ultimo_acceso() from public, anon;
grant execute on function public.mi_ultimo_acceso() to authenticated;
revoke all on function privado.revisar_inactivas() from public, anon, authenticated;
revoke all on function privado.limpiar_inactiva(uuid) from public, anon, authenticated;
revoke all on function privado.exenta_inactividad(uuid) from public, anon, authenticated;
revoke all on function privado.inactivas_desde() from public, anon, authenticated;
revoke all on function privado.legal_vigente() from public, anon, authenticated;
revoke all on function privado.legal_pendientes(text) from public, anon, authenticated;
revoke all on function privado.t_aceptaciones() from public, anon, authenticated;
select cron.schedule('forja-inactivas', '23 9 * * *', $$select privado.revisar_inactivas()$$);
