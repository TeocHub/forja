-- AVISO (2026-11-11): este archivo refleja el esquema hasta el 2026-11-06 y ya no está completo (equipos, planes Más y Estudio,
-- Semillero, obras, rondas de lectores beta, correos, sugerencias). La fuente es la base de Supabase y sus migraciones;
-- para regenerarlo: supabase db dump --schema public,privado (necesita la clave de la base).
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
-- Migración equipo_digital_monster_forja_mas: privado.es_equipo(correo) = correo @digitalmonster.cl; esas cuentas nacen con
-- plan 'mas' sin vencimiento, y el trigger al_cambiar_correo_equipo (privado.t_equipo_correo) lo da si alguien cambia a ese correo.

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

-- Planes: espacios.plan ('libre' | 'mas' | 'estudio') y espacios.plan_hasta; los usuarios solo pueden actualizar espacios.nombre.
-- (Topes por plan en privado.tope: ver «Forja Estudio» al final.)
-- Límites del plan libre (privado.limite): 3 proyectos en curso, 20.000 palabras por proyecto, 30 referentes por proyecto.
-- Triggers before insert/update: proyectos (privado.t_proyectos), secciones (t_secciones), referentes (t_referentes),
-- notas y cotizaciones (t_lectura). Errores: FORJA_LIMITE_PROYECTOS, FORJA_LIMITE_PALABRAS, FORJA_LIMITE_REFERENTES, FORJA_SOLO_LECTURA.
-- Un proyecto es editable si el espacio no supera el tope de proyectos en curso de su plan y, en el plan gratis, si no está archivado.

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

-- Vitrinas (2026-11-06): página pública de cada proyecto. Ver docs/js/vitrina.js.
create table public.vitrinas(              -- privada: el borrador (copias elegidas por la persona)
  id uuid primary key default gen_random_uuid(),
  espacio_id uuid not null references public.espacios(id) on delete cascade,
  proyecto_id uuid not null unique references public.proyectos(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$'),
  borrador jsonb not null default '{}'::jsonb check (octet_length(borrador::text) < 2000000),
  anterior jsonb,                          -- la versión publicada antes de la última
  publicada boolean not null default false,
  publicado_en timestamptz,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
-- RLS por privado.es_miembro(espacio_id). Permisos por columna: insert (espacio_id, proyecto_id, slug, borrador), update (slug, borrador).
create table public.vitrinas_publicadas(   -- pública: lo único que se lee sin cuenta
  slug text primary key,
  vitrina_id uuid not null unique references public.vitrinas(id) on delete cascade,
  datos jsonb not null,
  publicado_en timestamptz not null default now()
);
-- RLS: select para anon y authenticated; solo las columnas slug, datos y publicado_en. Nadie escribe directo:
-- public.publicar_vitrina(v uuid, datos jsonb, listar boolean) y public.despublicar_vitrina(v uuid) (security definer, solo authenticated).
-- Trigger privado.t_vitrina_slug: si cambia vitrinas.slug, cambia también en vitrinas_publicadas.


-- Moderación, documentos y Explorar (2026-11-06). Migraciones moderacion_y_cuenta, moderacion_panel,
-- moderacion_ver, moderacion_permisos y mod_responder_avisar.
create extension if not exists unaccent with schema extensions;
-- privado.sin_tildes(t) envuelve unaccent (immutable) para el índice de búsqueda.
alter table public.vitrinas
  add column suspendida boolean not null default false,
  add column suspension jsonb,                       -- {motivo, mensaje, en}: lo que se le explica al dueño
  add column fuera_de_explorar boolean not null default false,
  add column listar boolean not null default false;  -- el dueño pidió aparecer en Explorar
-- Los usuarios pueden leer estas columnas, no escribirlas.
alter table public.vitrinas_publicadas
  add column visible boolean not null default true,  -- false = suspendida: nadie la lee
  add column en_explorar boolean not null default false,
  add column titulo text, add column lema text, add column firma text, add column tipo text, add column formato text,
  add column estado text, add column portada text, add column acento text,
  add column busqueda tsvector generated always as (to_tsvector('spanish', privado.sin_tildes(
    coalesce(titulo, '') || ' ' || coalesce(lema, '') || ' ' || coalesce(firma, '')))) stored;
create index on public.vitrinas_publicadas using gin (busqueda);
-- Política de select: using (visible). Columnas legibles (anon y authenticated): slug, datos, publicado_en,
-- en_explorar, titulo, lema, firma, tipo, formato, estado, portada, acento, busqueda.
-- publicar_vitrina: FORJA_VITRINA_SUSPENDIDA si está suspendida. Con listar, aparece en Explorar solo si no está
-- fuera_de_explorar, la cuenta tiene 3 días, aceptó las normas, hay título y la historia suma 40 palabras; si no,
-- devuelve falta = moderacion | cuenta_nueva | normas | contenido. Devuelve {publicado_en, en_explorar, falta}.

create table public.aceptaciones(          -- versión de cada documento que aceptó cada persona
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  documento text not null check (documento in ('terminos','privacidad','normas')),
  version text not null check (char_length(version) <= 20),
  aceptado_en timestamptz not null default now(),
  primary key (user_id, documento, version)
);
-- RLS: ver y crear solo las propias. Permisos: select (documento, version, aceptado_en), insert (documento, version).

create table public.avisos(                -- lo que Forja le explica a cada persona (moderación, respuestas)
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null default 'info',       -- suspendida, restaurada, explorar, reporte, respuesta
  titulo text not null, texto text not null, enlace text,
  leido boolean not null default false,
  creado_en timestamptz not null default now()
);
-- RLS: ver y actualizar las propias. Permisos: select (sin user_id), update (leido). Solo las crean funciones del servidor.

create table public.reportes(
  id uuid primary key default gen_random_uuid(),
  vitrina_id uuid not null references public.vitrinas(id) on delete cascade,
  autor uuid not null references auth.users(id) on delete cascade,
  motivo text not null check (motivo in ('estafa','ofensivo','derechos','datos','menores','spam','otro')),
  detalle text check (char_length(detalle) <= 1000),
  estado text not null default 'pendiente' check (estado in ('pendiente','aceptado','desestimado','mala_fe')),
  creado_en timestamptz not null default now(),
  revisado_en timestamptz,
  unique (vitrina_id, autor)
);
-- RLS: el autor ve los suyos (sin la columna autor). Nadie inserta directo: public.reportar_vitrina(slug, motivo, detalle)
-- exige cuenta (FORJA_REPORTE_SIN_CUENTA), vitrina visible (FORJA_NO_ENCONTRADA), que no sea propia (FORJA_REPORTE_PROPIO),
-- cuenta de 1 día (FORJA_REPORTE_CUENTA_NUEVA), menos de 2 reportes de mala fe (FORJA_REPORTE_BLOQUEADO),
-- 5 por día (FORJA_REPORTE_LIMITE) y uno por vitrina (FORJA_REPORTE_REPETIDO). Un reporte nunca oculta nada solo.

create table public.mensajes(              -- Escríbenos, solicitudes de datos personales y apelaciones
  id uuid primary key default gen_random_uuid(),
  autor uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('apelacion','privacidad','contacto')),
  vitrina_id uuid references public.vitrinas(id) on delete set null,
  texto text not null check (char_length(texto) between 5 and 3000),
  estado text not null default 'abierto' check (estado in ('abierto','respondido','cerrado')),
  respuesta text,
  creado_en timestamptz not null default now(),
  respondido_en timestamptz
);
-- RLS: ver y crear los propios. Permisos: insert (tipo, vitrina_id, texto); select sin autor.
-- Trigger privado.t_mensajes: máximo 5 por día (FORJA_MENSAJES_LIMITE); una apelación debe ser de una vitrina propia.

-- Moderación: solo quien esté en privado.admin_correos (se agrega con el conector, el correo nunca va al repo).
create table privado.admin_correos(email text primary key);
create table privado.registro(             -- cada decisión de moderación, para responder apelaciones
  id bigint generated always as identity primary key,
  admin uuid, accion text not null, vitrina_id uuid, detalle jsonb,
  en timestamptz not null default now()
);
-- privado.es_admin() y public.soy_admin() (para mostrar el enlace "Moderación").
-- Funciones solo para admin (security definer, FORJA_NO_PERMITIDO si no): mod_panel() (reportes pendientes por vitrina con
-- el historial y la antigüedad de quien reporta, mensajes abiertos, suspendidas, en Explorar y registro), mod_vitrina(v)
-- (verla aunque esté oculta), mod_resolver(v, 'desestimado'|'mala_fe'), mod_suspender(v, motivo, mensaje) (mensaje
-- obligatorio: FORJA_FALTA_MENSAJE; oculta la publicada, acepta los reportes y avisa a dueños y a quienes reportaron),
-- mod_restaurar(v, mensaje), mod_explorar(v, mostrar, mensaje), mod_responder(m, respuesta, avisar default true).
-- public.borrar_mi_cuenta(confirmacion): con 'BORRAR' borra los espacios del usuario (cascada) y su cuenta (FORJA_CONFIRMAR).


-- Correos, boletín y seguidores (2026-11-07). Migraciones correos_y_seguidores, vitrina_limite_enlaces,
-- cola_despacho y mod_anunciar_funcion_fix. Función: supabase/functions/enviar-correos.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
-- privado.es_pago(url): enlaces de pago, apoyo o financiamiento (mismo criterio que PAGO en docs/js/vitrina.js).
-- publicar_vitrina: hasta 10 enlaces (FORJA_VITRINA_ENLACES) y hasta 2 de pago entre enlaces y galería (FORJA_VITRINA_PAGOS).
--   Además, el enlace de pago de cada recompensa (datos.recompensas.tiers[].pago) debe pasar privado.es_pago (FORJA_VITRINA_PAGO_TIER); no cuenta en el límite de 2 (migración vitrina_pago_por_recompensa).

create table public.correo_prefs(          -- qué correos acepta cada persona (sin fila = valores por defecto)
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  boletin boolean not null default false,   -- consentimiento explícito; boletin_desde guarda cuándo
  funciones boolean not null default true,  -- avisos de herramientas en que tocó "Avísame"
  vitrinas boolean not null default true,   -- avisos de proyectos que sigue
  boletin_desde timestamptz,
  token uuid not null default gen_random_uuid() unique,  -- para darse de baja sin entrar; no legible por el usuario
  actualizado_en timestamptz not null default now()
);
-- RLS: ver, crear y cambiar la propia. Permisos: select (sin token ni user_id), insert y update (boletin, funciones, vitrinas).
-- Trigger privado.t_correo_prefs (fechas). privado.prefs(u) crea la fila si falta.

alter table public.interes_funciones add column avisado_en timestamptz;   -- cuándo se le anunció que estaba lista

create table public.seguidores(            -- quién sigue qué vitrina; sin acceso directo (solo RPC)
  vitrina_id uuid not null references public.vitrinas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  creado_en timestamptz not null default now(),
  primary key (vitrina_id, user_id)
);

create table privado.correos(              -- la cola
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('funcion','boletin','vitrina','prueba')),
  datos jsonb not null,                     -- el contenido; la dirección se lee de auth.users al enviar
  creado_en timestamptz not null default now(),
  tomado_en timestamptz, enviado_en timestamptz,
  intentos int not null default 0,
  error text                                -- 'baja' si la persona se dio de baja antes del envío
);
create table privado.envios_vitrina(        -- registro de avisos de vitrinas a sus seguidores (moderación)
  id bigint generated always as identity primary key,
  vitrina_id uuid not null references public.vitrinas(id) on delete cascade,
  autor uuid, titulo text, texto text, destinatarios int,
  en timestamptz not null default now()
);
create table privado.config(clave text primary key, valor text not null);   -- 'cola_clave', aleatoria

-- Para todos: estado_seguir(slug) (también sin cuenta), baja_correo(token, que, slug).
-- Con cuenta: seguir_vitrina(slug, seguir), mis_seguidas(), seguidores_de(v) (dueño), avisar_seguidores(v, titulo, texto)
--   (cuenta de 3 días, vitrina publicada y visible, una vez cada 7 días: FORJA_AVISO_*).
-- Moderación: mod_correos(), mod_intereses(), mod_anunciar_funcion(funcion, titulo, texto, enlace), mod_boletin(datos, prueba), mod_probar(tipo, datos).
-- Solo service_role: cola_tomar(limite) (máx. 40/h y 90/24 h), cola_marcar(id, ok, error), cola_clave().
-- pg_cron 'forja-correos' */10 * * * * → privado.despachar() → net.http_post a /functions/v1/enviar-correos con x-forja-clave.


-- ===== Equipos (migraciones equipos_roles_y_acceso, equipos_vitrinas_permisos, equipos_ver_proyecto_por_fila,
-- equipos_mas_al_crear_confirmado, acceso_proyecto_con_plan) =====
-- espacios: + tipo ('personal'|'equipo'), + dominio (equipos: entran solas las cuentas confirmadas de ese dominio);
--   creado_por ahora es nullable con on delete set null; el espacio personal se borra con su cuenta (trigger al_borrar_usuario → privado.t_borrar_personal).
-- miembros.rol: 'dueno' | 'editor' | 'lector' (default 'lector'); los antiguos 'miembro' pasaron a 'editor'.
-- proyectos: + acceso ('equipo'|'reservado').
-- public.proyecto_accesos(proyecto_id, user_id, rol 'editor'|'lector', creado_en) pk (proyecto_id, user_id): solo lectura propia o del dueño; se escribe por RPC.
-- public.espacio_registro(id, espacio_id, quien, accion, detalle jsonb, creado_en): sin acceso directo; los dueños lo leen en equipo_panel.
-- Funciones: privado.rol_en(e), es_dueno(e), escribe_en(e), acceso(p) → 'editar'|'ver'|null, ve(p), edita(p), edita_en(p, e), publica(p), ve_fila(e, acceso, p),
--   registrar(e, accion, detalle), unir_equipos(uid, correo), t_confirmado() (trigger al_confirmar_correo after insert or update of email_confirmed_at, email on auth.users),
--   t_espacio_fijo() (trigger espacio_fijo en proyectos y sus tablas hijas; mover_proyecto pone forja.mover = '1').
-- Políticas: proyectos (ver ve_fila; crear escribe_en; editar edita; borrar es_dueno), hijas (ver ve(proyecto_id); crear/editar edita_en; borrar edita),
--   cotizaciones (sin proyecto: por espacio), espacios_renombrar solo dueño.
-- RPCs: mis_espacios, acceso_proyecto, equipo_panel, equipo_rol, equipo_quitar, proyecto_acceso, mover_proyecto.
-- publicar_vitrina y avisar_seguidores exigen privado.publica; despublicar_vitrina, privado.edita; seguidores_de, privado.ve; avisar_duenos avisa solo a dueños;
-- borrar_mi_cuenta no deja un equipo sin dueño (FORJA_ULTIMO_DUENO).
-- Equipo creado: 'Digital Monster' (tipo equipo, dominio digitalmonster.cl, plan mas).

-- ===== Personas invitadas a un proyecto (migraciones invitaciones_y_acceso_por_area, correos_tipo_invitacion, persona_quitar_nombres, aceptar_invitacion_usada) =====
-- proyecto_accesos: + areas jsonb {taller|referentes|pizarra|costos|oportunidades|bitacora|vitrina: editar|ver|no}, + invitado_por.
-- privado.acceso_area(p, area) decide el nivel (dueño del espacio: editar; invitado: sus áreas o su rol, y sin Forja Más solo la primera persona invitada edita;
--   miembros del equipo según rol si el proyecto está abierto). privado.acceso(p) = área taller; privado.ve(p) = ve_fila; privado.publica(p) = es_dueno del espacio;
--   privado.edita_area_en(p, area, e); privado.max_invitados(p) = 5 con Más, 1 sin; privado.limpiar_areas(jsonb).
-- Políticas hijas por área: secciones→taller, referentes, pizarras→pizarra, vitrinas→vitrina, notas→bitacora, proyecto_oportunidades→oportunidades, cotizaciones→costos (sin proyecto: por espacio).
-- public.invitaciones(id, proyecto_id, correo, rol, areas, token, invitado_por, creado_en, expira_en +14 días, aceptada_en, aceptada_por, anulada_en); índice único de pendientes por (proyecto, correo); RLS sin políticas (solo RPC).
-- privado.referidos(user_id pk, invitado_por, proyecto_id, cuenta_nueva, en).
-- privado.correos: user_id ahora nullable, + email; tipo admite 'invitacion'; check user_id o email. cola_tomar devuelve coalesce(email, correo de la cuenta), token solo si hay cuenta, salta invitaciones anuladas o aceptadas.
-- RPCs: proyecto_personas, invitar, anular_invitacion, ver_invitacion (anon y authenticated), aceptar_invitacion, rechazar_invitacion, persona_cambiar, persona_quitar, mis_compartidos.
-- despublicar_vitrina exige editar el área vitrina; proyecto_acceso (equipo) solo toca accesos de miembros del equipo.

-- ===== Recompensas de campaña en la vitrina (migración recompensas_interes) =====
-- public.recompensa_interes(vitrina_id, tier, user_id, creado_en) pk (vitrina_id, tier, user_id); RLS sin políticas (solo RPC).
-- RPCs: estado_recompensas(slug) (anon y authenticated: conteo si datos.recompensas.contador, mias, propia), anotar_recompensa(slug, tier, si)
--   (con cuenta; tier debe existir en lo publicado; no la propia; interés activo y campaña no cerrada; 40 por día; sigue la vitrina si seguir.activo),
--   recompensas_de(v) (privado.ve del proyecto: conteo por recompensa y personas), mis_anotadas().
-- La campaña en sí vive en cotizaciones.datos.campana (sin cambios de esquema).

-- Ruta del proyecto (2026-11-07, migración ruta_cimientos) -------------------------------
-- proyectos.ruta jsonb  {creador: 'plano'|'rumbo'|'explora', etapa: 1..7, hechos: {tecnica: fecha}, abrir: 'ruta'|'taller'|'ultima', oculta: bool}
-- proyectos.esquema jsonb (Mapa de la idea) y proyectos.estructura jsonb (Estructura): ver docs/js/ruta.js. Se editan con el permiso del área Taller.
-- Tamaños: ruta < 20.000 bytes, esquema < 40.000, estructura < 60.000.
-- referentes.tipo admite 'obra'; referentes.ficha jsonb (datos tipo APA: clase, autores, anio, titulo, edicion, editorial, paginas…)
-- y referentes.analisis jsonb (Analizar una obra). Plan gratis: 3 obras analizadas por proyecto (FORJA_LIMITE_ANALISIS, privado.limite('analisis')).
-- privado.limite: proyectos 3, palabras 20000, referentes 30, pizarras 1, tarjetas 20, ideas 50, analisis 3.
create table public.ideas(        -- Semillero: ideas de una frase, por espacio (personal o equipo); no gastan cupo de proyectos
  id uuid primary key default gen_random_uuid(),
  espacio_id uuid not null references public.espacios(id) on delete cascade,
  texto text not null check (char_length(btrim(texto)) between 1 and 80),
  creado_por uuid default auth.uid() references auth.users(id) on delete set null,
  proyecto_id uuid references public.proyectos(id) on delete set null,   -- el proyecto que nació de la idea
  creado_en timestamptz not null default now()
);
-- + vueltas smallint 0..99 default 0 y vuelta_en timestamptz («Me sigue dando vueltas», migración semillero_vueltas_y_resguardos).
-- Índices: ideas(espacio_id, creado_en desc) e ideas(proyecto_id) where proyecto_id is not null.
-- RLS: ver = miembro del espacio (privado.rol_en); crear, editar y borrar = privado.escribe_en.
-- Trigger privado.t_ideas: espacio fijo; creado_por = auth.uid() al crear y no cambia (tampoco creado_en);
--   plan gratis 50 ideas por espacio contando solo las que no brotaron (proyecto_id null) (FORJA_LIMITE_IDEAS);
--   proyecto_id solo puede apuntar a un proyecto que la persona ve (privado.ve, si no FORJA_NO_PERMITIDO); texto recortado.
-- Analizar una obra (web en docs/js/obras.js): ficha = {clase libro|capitulo|videojuego|juegomesa|pelicula|cancion|web, autores, anio, titulo,
--   edicion, editorial, editores, libro, paginas, album, sitio, fecha, url, formato}; valor = la cita APA en texto; titulo = ficha.titulo.
--   analisis = {ve, armada, trata, aprendi[], en}; una cita (tipo 'cita') puede apuntar a una obra con ficha = {obra: id, pagina}.

-- Limpieza (2026-11-07, migraciones limpieza_funcion_vieja_y_historial_cron y mis_espacios_con_vencimiento) -----------------
-- Se borró privado.edita_en(p, e): las políticas usan privado.edita_area_en desde los permisos por área.
-- pg_cron 'forja-limpieza' '17 4 * * 0': delete from cron.job_run_details where end_time < now() - interval '14 days'.
-- mis_espacios() devuelve también 'hasta' (plan_hasta si el espacio tiene Forja Más): la web ya no consulta espacios para saber el plan.

-- Forja Estudio (2026-11-07, migraciones plan_estudio y plan_estudio_mover_y_acceso) ----------------------------------------
-- espacios.plan admite 'estudio'. privado.plan_de(e) = 'libre' | 'mas' | 'estudio' (vencido = 'libre');
-- privado.es_mas(e) = plan_de in ('mas','estudio') (las herramientas de pago son las mismas en ambos).
-- privado.tope(e, clave) (null = sin límite; sin execute para authenticated, se usa dentro de funciones security definer):
--   proyectos 3 · 15 · null; invitados 1 · 5 · 15; ideas 50 · 500 · null; lectores (beta, herramienta aún no construida) 3 · 15 · 40;
--   el resto cae en privado.limite en el plan gratis. privado.max_invitados(p) = tope(espacio del proyecto, 'invitados').
-- privado.editable(p): tope null → sí; Más/Estudio → activos <= tope (un archivado sigue editable); gratis → no archivado y activos <= tope.
-- t_proyectos, t_ideas y mover_proyecto usan el tope del plan; t_secciones, t_referentes, t_pizarras y t_lectura revisan editable
--   también con Más/Estudio (al pasar de Estudio a Más con más de 15 en curso todo queda en solo lectura, salvo archivar y recortar).
-- mis_espacios() y acceso_proyecto(p) traen 'plan'.

-- Sugerencias de la comunidad (2026-11-07, migraciones sugerencias_comunidad y mod_panel_sugerencias) -----------------------
create table public.sugerencias (
  id uuid primary key default gen_random_uuid(),
  autor uuid not null default auth.uid() references auth.users(id) on delete cascade,
  area text not null default 'otra' check (area in ('escritura','impresion','pizarras','organizacion','venta','presentacion','equipo','planes','otra')),
  texto text not null check (char_length(texto) between 10 and 800),
  estado text not null default 'nueva' check (estado in ('nueva','leida','anotada','descartada')),
  respuesta text check (respuesta is null or char_length(respuesta) <= 1500),
  creado_en timestamptz not null default now(),
  revisado_en timestamptz
);
-- RLS: cada persona solo ve las suyas (select); no hay insert/update/delete directo.
-- sugerir(texto, area): correo confirmado, 10–800 caracteres, 5 por día, no la misma frase dos veces
--   (FORJA_SUGERIR_SIN_CUENTA, FORJA_SUGERIR_TEXTO, FORJA_SUGERIR_LIMITE, FORJA_SUGERIR_REPETIDA); un área desconocida queda 'otra'.
-- mod_sugerencia(s, estado leida|anotada|descartada, respuesta?) (admin): la respuesta llega en public.avisos con enlace planes/#sugerir; queda en privado.registro ('sugerencia').
-- mod_panel() trae 'sugerencias' (nuevas), 'sugerencias_vistas' (30 últimas revisadas) y 'sugerencias_areas' (cuántas por área, sin descartadas).

-- Lectores beta (2026-11-07, migraciones lectores_beta y lectores_beta_ajustes) -----------------------------------------------
-- public.rondas (id, espacio_id, proyecto_id, numero único por proyecto, titulo, estado abierta|cerrada, cierra date, contenido jsonb {intro, partes},
--   preguntas jsonb [{k, t, propia}], resumen, creado_por, creado_en, cerrada_en). RLS: ver = privado.acceso_area(proyecto, 'taller') no nulo; escribir solo por funciones.
-- public.ronda_lectores (id, ronda_id, token uuid único, nombre, user_id (amarrado a la primera cuenta que abre), reclamado_en, quitado_en, creado_en),
-- public.ronda_respuestas (ronda_id, lector_id, pregunta, texto ≤4000, marca opinion|mejora|resuelta, único por lector y pregunta),
-- public.ronda_comentarios (ronda_id, lector_id, parte, parrafo, cita ≤200, texto ≤2000, marca): RLS sin políticas (solo por funciones).
-- privado.maneja_rondas(p) = acceso_area(p,'taller') = 'editar' y editable(p). privado.lector_de(t) reclama o valida el enlace
--   (FORJA_RONDA_NO, FORJA_RONDA_SIN_CUENTA, FORJA_RONDA_OTRA); privado.ronda_abierta(l) (FORJA_RONDA_CERRADA).
-- Funciones: abrir_ronda, invitar_lector, quitar_lector, ronda_panel, marcar_opinion, cerrar_ronda (resumen a public.notas), borrar_ronda,
--   ver_ronda (también anon: solo proyecto y tipo), responder_ronda, comentar_ronda (máx. 300 por persona), borrar_comentario_ronda, borrar_mis_respuestas, mis_lecturas.
-- Topes: privado.tope(e,'lectores') 3 · 15 · 40 personas activas por ronda; plan gratis una ronda abierta a la vez; preguntas propias solo Más/Estudio.
-- mover_proyecto incluye 'rondas'.
