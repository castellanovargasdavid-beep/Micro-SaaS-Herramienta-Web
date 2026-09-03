-- ============================================================================
-- BriefQuick — Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecutar en el SQL Editor de Supabase (o vía `supabase db push`).
-- Idempotente: puede volver a ejecutarse sin duplicar objetos.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
do $$ begin
  create type plan_type as enum ('free', 'pro', 'lifetime');
exception when duplicate_object then null; end $$;

do $$ begin
  create type brief_niche as enum ('web_design', 'copywriting', 'branding', 'video');
exception when duplicate_object then null; end $$;

do $$ begin
  create type brief_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type submission_status as enum ('pending', 'processed', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum (
    'active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_plan as enum ('pro_monthly', 'lifetime');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- FUNCIÓN UTILITARIA: mantener updated_at al día
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- TABLA: profiles
-- Un perfil 1:1 con cada usuario de auth.users.
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  brand_name text,
  brand_color text default '#6d28d9',
  brand_logo_url text,
  plan plan_type not null default 'free',
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil público/privado de cada usuario autenticado. 1:1 con auth.users.';

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No hay policy de INSERT/DELETE para usuarios: el perfil se crea únicamente
-- vía el trigger handle_new_user (security definer) y se elimina en cascada
-- cuando se borra el usuario de auth.users.

-- ============================================================================
-- TRIGGER: crear perfil automáticamente al registrarse
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- TABLA: brief_templates
-- Plantillas de preguntas por nicho, reutilizables al crear un brief.
-- ============================================================================
create table if not exists public.brief_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  niche brief_niche not null,
  description text,
  icon text default 'Sparkles',
  questions jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.brief_templates is 'Plantillas globales (curadas por el equipo de BriefQuick) usadas como punto de partida al crear un brief.';

alter table public.brief_templates enable row level security;

drop policy if exists "brief_templates_public_read" on public.brief_templates;
create policy "brief_templates_public_read"
  on public.brief_templates for select
  using (is_active = true);

-- Sin policies de insert/update/delete: sólo se gestionan con la service_role key
-- (panel interno / seed), nunca desde el cliente.

-- ============================================================================
-- TABLA: briefs
-- Un formulario/brief creado por un usuario, enviado a su cliente vía /b/[id].
-- ============================================================================
create table if not exists public.briefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  template_id uuid references public.brief_templates (id) on delete set null,
  title text not null,
  niche brief_niche not null default 'web_design',
  status brief_status not null default 'draft',
  client_name text,
  intro_message text,
  questions jsonb not null default '[]'::jsonb,
  brand_color text,
  brand_logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ventana de horas tras enviar una respuesta durante la cual el mismo cliente
-- puede volver al enlace público y agregar información que se le haya
-- olvidado, sin tener que rellenar todo el formulario de nuevo. 0 desactiva
-- la función. El valor lo elige el dueño del brief en Configuración.
alter table public.briefs
  add column if not exists edit_window_hours integer not null default 24;

comment on table public.briefs is 'Formulario configurado por el freelancer/agencia. questions es un snapshot editable de brief_templates.questions.';

create index if not exists idx_briefs_user_id on public.briefs (user_id);
create index if not exists idx_briefs_status on public.briefs (status);

drop trigger if exists trg_briefs_updated_at on public.briefs;
create trigger trg_briefs_updated_at
  before update on public.briefs
  for each row execute function public.set_updated_at();

alter table public.briefs enable row level security;

drop policy if exists "briefs_owner_select" on public.briefs;
create policy "briefs_owner_select"
  on public.briefs for select
  using (auth.uid() = user_id);

drop policy if exists "briefs_owner_insert" on public.briefs;
create policy "briefs_owner_insert"
  on public.briefs for insert
  with check (auth.uid() = user_id);

drop policy if exists "briefs_owner_update" on public.briefs;
create policy "briefs_owner_update"
  on public.briefs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "briefs_owner_delete" on public.briefs;
create policy "briefs_owner_delete"
  on public.briefs for delete
  using (auth.uid() = user_id);

-- Vista pública de solo-lectura para el formulario /b/[id]: expone únicamente
-- las columnas necesarias para renderizar el formulario a un visitante anónimo,
-- nunca el user_id ni metadatos internos. La tabla base sigue bloqueada a anon.
create or replace view public.brief_public as
select
  id,
  title,
  niche,
  client_name,
  intro_message,
  questions,
  brand_color,
  brand_logo_url,
  status,
  edit_window_hours
from public.briefs
where status = 'published';

grant select on public.brief_public to anon, authenticated;

-- ============================================================================
-- TABLA: submissions
-- Respuesta enviada por el cliente final a través del formulario público.
-- ============================================================================
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references public.briefs (id) on delete cascade,
  client_name text,
  client_email text,
  answers jsonb not null default '{}'::jsonb,
  status submission_status not null default 'pending',
  ai_summary jsonb,
  ai_summary_markdown text,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.submissions is 'Respuestas de clientes finales a un brief. ai_summary es el JSON estructurado devuelto por Claude (objetivo, entregables, tono, deadline, assets).';

create index if not exists idx_submissions_brief_id on public.submissions (brief_id);
create index if not exists idx_submissions_status on public.submissions (status);

alter table public.submissions enable row level security;

drop policy if exists "submissions_public_insert" on public.submissions;
create policy "submissions_public_insert"
  on public.submissions for insert
  to anon, authenticated
  with check (
    -- Consulta brief_public (no la tabla base): anon no tiene ninguna
    -- política de SELECT sobre `briefs`, así que un EXISTS contra la tabla
    -- base siempre da 0 filas para un visitante anónimo real y esta
    -- inserción se rechazaría siempre. La vista corre con los permisos de
    -- quien la creó, no del rol que consulta, así que sí es visible aquí.
    exists (
      select 1 from public.brief_public b
      where b.id = brief_id
    )
  );

drop policy if exists "submissions_owner_select" on public.submissions;
create policy "submissions_owner_select"
  on public.submissions for select
  using (
    exists (
      select 1 from public.briefs b
      where b.id = submissions.brief_id and b.user_id = auth.uid()
    )
  );

drop policy if exists "submissions_owner_update" on public.submissions;
create policy "submissions_owner_update"
  on public.submissions for update
  using (
    exists (
      select 1 from public.briefs b
      where b.id = submissions.brief_id and b.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.briefs b
      where b.id = submissions.brief_id and b.user_id = auth.uid()
    )
  );

drop policy if exists "submissions_owner_delete" on public.submissions;
create policy "submissions_owner_delete"
  on public.submissions for delete
  using (
    exists (
      select 1 from public.briefs b
      where b.id = submissions.brief_id and b.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TABLA: subscriptions
-- Estado de suscripción/plan de pago, sincronizado desde los webhooks de Stripe.
-- ============================================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  plan subscription_plan not null,
  status subscription_status not null default 'active',
  stripe_customer_id text not null,
  stripe_subscription_id text unique,
  stripe_price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.subscriptions is 'Reflejo local del estado de Stripe. Sólo se escribe desde app/api/stripe/webhook con la service_role key (bypassa RLS).';

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_owner_select" on public.subscriptions;
create policy "subscriptions_owner_select"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Sin policies de insert/update/delete para el rol authenticated: los webhooks
-- de Stripe usan la service_role key, que ignora RLS por diseño.

-- ============================================================================
-- LÍMITE DEL PLAN FREE: máx. 2 briefs activos (draft/published) por mes natural.
-- ============================================================================
create or replace function public.enforce_free_plan_brief_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_plan plan_type;
  active_count int;
begin
  select plan into current_plan from public.profiles where id = new.user_id;

  if current_plan = 'free' then
    select count(*) into active_count
    from public.briefs
    where user_id = new.user_id
      and status in ('draft', 'published')
      and date_trunc('month', created_at) = date_trunc('month', now());

    if active_count >= 2 then
      raise exception 'free_plan_limit_reached'
        using detail = 'El plan Free permite hasta 2 briefs activos por mes. Actualiza a Pro para briefs ilimitados.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_free_plan_limit on public.briefs;
create trigger trg_enforce_free_plan_limit
  before insert on public.briefs
  for each row execute function public.enforce_free_plan_brief_limit();

-- ============================================================================
-- SEED: plantillas base por nicho
-- ============================================================================
insert into public.brief_templates (slug, name, niche, description, icon, sort_order, questions)
values
  (
    'diseno-web',
    'Diseño Web',
    'web_design',
    'Para sitios web, landing pages y tiendas online.',
    'LayoutTemplate',
    1,
    '[
      {"id":"objetivo","type":"textarea","label":"¿Cuál es el objetivo principal del sitio web?","placeholder":"Ej: vender productos, generar leads, mostrar portafolio...","required":true},
      {"id":"paginas","type":"text","label":"¿Qué páginas/secciones necesitas?","placeholder":"Ej: Inicio, Nosotros, Servicios, Contacto","required":true},
      {"id":"referencias","type":"textarea","label":"¿Tienes sitios web de referencia que te gusten?","placeholder":"Comparte enlaces o nombres de marcas","required":false},
      {"id":"estilo","type":"select","label":"¿Qué estilo visual prefieres?","required":true,"options":["Minimalista","Corporativo","Moderno/Bold","Elegante","Divertido/Colorido"]},
      {"id":"contenidos","type":"select","label":"¿Quién proveerá los textos e imágenes?","required":true,"options":["Yo los entrego","Necesito que me ayuden a crearlos"]},
      {"id":"deadline","type":"date","label":"¿Cuál es la fecha límite deseada?","required":false},
      {"id":"presupuesto","type":"text","label":"¿Cuál es tu rango de presupuesto?","placeholder":"Ej: $500 - $1000 USD","required":false}
    ]'::jsonb
  ),
  (
    'copywriting',
    'Copywriting',
    'copywriting',
    'Para textos publicitarios, web copy y email marketing.',
    'PenLine',
    2,
    '[
      {"id":"objetivo","type":"textarea","label":"¿Qué quieres lograr con este texto?","placeholder":"Ej: aumentar ventas, generar suscripciones...","required":true},
      {"id":"audiencia","type":"textarea","label":"Describe a tu audiencia objetivo","placeholder":"Edad, intereses, problemas que enfrentan","required":true},
      {"id":"tono","type":"select","label":"¿Qué tono de voz buscas?","required":true,"options":["Profesional","Cercano/Casual","Divertido","Inspirador","Urgente/Directo"]},
      {"id":"formato","type":"select","label":"¿Qué tipo de contenido necesitas?","required":true,"options":["Copy para landing page","Email marketing","Anuncios (Ads)","Posts para redes sociales","Descripciones de producto"]},
      {"id":"palabras_clave","type":"text","label":"Palabras clave o mensajes que deben incluirse","required":false},
      {"id":"extension","type":"text","label":"Extensión aproximada deseada","placeholder":"Ej: 300 palabras, 5 posts","required":false},
      {"id":"deadline","type":"date","label":"Fecha límite","required":false}
    ]'::jsonb
  ),
  (
    'branding',
    'Branding',
    'branding',
    'Para identidad de marca, logotipos y manuales visuales.',
    'Palette',
    3,
    '[
      {"id":"objetivo","type":"textarea","label":"¿Qué necesitas: marca nueva o rediseño?","required":true},
      {"id":"valores","type":"textarea","label":"¿Cuáles son los valores y personalidad de tu marca?","placeholder":"Ej: innovadora, confiable, cercana","required":true},
      {"id":"competencia","type":"textarea","label":"¿Quiénes son tus principales competidores?","required":false},
      {"id":"colores","type":"text","label":"¿Tienes colores o estilos que te gusten (o que evitar)?","required":false},
      {"id":"entregables","type":"select","label":"¿Qué entregables necesitas?","required":true,"options":["Solo logotipo","Logotipo + paleta de colores","Manual de marca completo","Logotipo + papelería"]},
      {"id":"deadline","type":"date","label":"Fecha límite","required":false},
      {"id":"presupuesto","type":"text","label":"Rango de presupuesto","required":false}
    ]'::jsonb
  ),
  (
    'video-reels',
    'Video / Reels',
    'video',
    'Para producción de video, reels y contenido audiovisual.',
    'Clapperboard',
    4,
    '[
      {"id":"objetivo","type":"textarea","label":"¿Cuál es el objetivo del video?","placeholder":"Ej: promocionar producto, educar, entretener","required":true},
      {"id":"plataforma","type":"select","label":"¿Dónde se publicará principalmente?","required":true,"options":["Instagram/TikTok Reels","YouTube","Facebook/Ads","Sitio web"]},
      {"id":"duracion","type":"text","label":"Duración aproximada deseada","placeholder":"Ej: 15-30 segundos","required":false},
      {"id":"guion","type":"select","label":"¿Ya tienes guion o idea definida?","required":true,"options":["Sí, tengo guion","Tengo una idea general","Necesito que me ayuden a crearlo"]},
      {"id":"referencias","type":"textarea","label":"Videos de referencia que te gusten","required":false},
      {"id":"musica","type":"text","label":"¿Preferencia de música o audio?","required":false},
      {"id":"deadline","type":"date","label":"Fecha límite","required":false}
    ]'::jsonb
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  questions = excluded.questions,
  is_active = true;

-- ============================================================================
-- ENTRADA MULTIMODAL: adjuntos de audio/PDF por respuesta + credenciales de
-- integraciones externas. Ejecuta este bloque también si ya corriste el
-- esquema anteriormente — es idempotente.
-- ============================================================================

do $$ begin
  create type attachment_kind as enum ('audio', 'pdf', 'image', 'file');
exception when duplicate_object then null; end $$;

alter table public.profiles
  add column if not exists notion_token text,
  add column if not exists notion_database_id text;

create table if not exists public.submission_attachments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  kind attachment_kind not null,
  storage_path text not null,
  original_filename text,
  transcript text,
  transcribed_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.submission_attachments is 'Notas de voz y archivos (PDF/imágenes) que el cliente adjunta al responder un brief. El audio se transcribe (Whisper) y el texto queda en transcript para que la IA lo use al generar el resumen.';

create index if not exists idx_submission_attachments_submission_id
  on public.submission_attachments (submission_id);

alter table public.submission_attachments enable row level security;

drop policy if exists "attachments_public_insert" on public.submission_attachments;
create policy "attachments_public_insert"
  on public.submission_attachments for insert
  to anon, authenticated
  -- No se valida vía EXISTS contra `submissions` por el mismo motivo que
  -- submissions_public_insert: anon no puede ver filas de esa tabla, así que
  -- el EXISTS siempre daría 0. La foreign key en submission_id ya garantiza
  -- que apunte a una submission real, sin necesidad de ese chequeo aquí.
  with check (true);

drop policy if exists "attachments_owner_select" on public.submission_attachments;
create policy "attachments_owner_select"
  on public.submission_attachments for select
  using (
    exists (
      select 1 from public.submissions s
      join public.briefs b on b.id = s.brief_id
      where s.id = submission_attachments.submission_id and b.user_id = auth.uid()
    )
  );

drop policy if exists "attachments_owner_delete" on public.submission_attachments;
create policy "attachments_owner_delete"
  on public.submission_attachments for delete
  using (
    exists (
      select 1 from public.submissions s
      join public.briefs b on b.id = s.brief_id
      where s.id = submission_attachments.submission_id and b.user_id = auth.uid()
    )
  );

-- Bucket privado para los adjuntos. El cliente final puede subir (anon insert)
-- pero nadie puede leer directo por URL pública: el dashboard genera signed
-- URLs de corta duración desde el servidor tras verificar que el usuario es
-- dueño del brief (ver lib/supabase/storage.ts).
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

drop policy if exists "attachments_bucket_public_upload" on storage.objects;
create policy "attachments_bucket_public_upload"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'attachments');

-- ============================================================================
-- TABLA: proposals
-- Propuesta comercial (alcance + precio) generada a partir de un brief, con
-- firma electrónica simple (nombre + trazo) capturada en la página pública.
-- ============================================================================

do $$ begin
  create type proposal_status as enum ('draft', 'sent', 'accepted', 'declined');
exception when duplicate_object then null; end $$;

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  brief_id uuid references public.briefs (id) on delete set null,
  submission_id uuid references public.submissions (id) on delete set null,
  title text not null,
  client_name text,
  client_email text,
  intro_message text,
  scope_items jsonb not null default '[]'::jsonb,
  price numeric(12, 2),
  currency text not null default 'USD',
  valid_until date,
  status proposal_status not null default 'draft',
  signer_name text,
  signature_data text,
  signed_at timestamptz,
  signer_ip text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.proposals is 'scope_items: [{"label": string, "description": string}]. signature_data es un PNG en base64 capturado en un <canvas> — firma electrónica simple, no una firma digital certificada.';

create index if not exists idx_proposals_user_id on public.proposals (user_id);

drop trigger if exists trg_proposals_updated_at on public.proposals;
create trigger trg_proposals_updated_at
  before update on public.proposals
  for each row execute function public.set_updated_at();

alter table public.proposals enable row level security;

drop policy if exists "proposals_owner_select" on public.proposals;
create policy "proposals_owner_select"
  on public.proposals for select
  using (auth.uid() = user_id);

drop policy if exists "proposals_owner_insert" on public.proposals;
create policy "proposals_owner_insert"
  on public.proposals for insert
  with check (auth.uid() = user_id);

drop policy if exists "proposals_owner_update" on public.proposals;
create policy "proposals_owner_update"
  on public.proposals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "proposals_owner_delete" on public.proposals;
create policy "proposals_owner_delete"
  on public.proposals for delete
  using (auth.uid() = user_id);

-- Desglose de presupuesto en la propuesta: `price` sigue siendo el total final
-- (compatibilidad con propuestas creadas antes de esta función); estas
-- columnas nuevas son opcionales y solo se completan cuando la propuesta se
-- arma desde el editor de presupuesto con el rate card. Va antes de
-- proposal_public porque esa vista selecciona estas columnas.
alter table public.proposals
  add column if not exists subtotal numeric(12, 2),
  add column if not exists discount_amount numeric(12, 2) not null default 0,
  add column if not exists tax_percentage numeric(5, 2) not null default 0;

-- Vista pública para la página de firma /p/[id]: solo visible cuando el
-- freelancer ya la envió (o ya fue firmada), nunca en estado 'draft'.
-- La firma en sí se escribe desde un server action con la service_role key
-- (ver app/p/[id]/actions.ts), no vía policy de UPDATE anónima.
create or replace view public.proposal_public as
select
  id,
  title,
  client_name,
  intro_message,
  scope_items,
  price,
  currency,
  valid_until,
  status,
  signer_name,
  signed_at,
  subtotal,
  discount_amount,
  tax_percentage
from public.proposals
where status in ('sent', 'accepted');

grant select on public.proposal_public to anon, authenticated;

-- ============================================================================
-- TARIFAS PERSONALIZADAS: catálogo de precios del usuario, usado por la IA
-- para armar el desglose de presupuesto de una propuesta automáticamente.
-- Ejecuta este bloque también si ya corriste el esquema antes — es idempotente.
-- ============================================================================

do $$ begin
  create type rate_pricing_type as enum ('fixed', 'hourly', 'monthly');
exception when duplicate_object then null; end $$;

alter table public.profiles
  add column if not exists default_currency text not null default 'USD',
  add column if not exists tax_percentage numeric(5, 2) not null default 0;

create table if not exists public.rate_card_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  pricing_type rate_pricing_type not null default 'fixed',
  amount numeric(12, 2) not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.rate_card_items is 'Catálogo de precios propio de cada usuario (ej. "Diseño landing page — 600 EUR fijo", "Desarrollo frontend — 45 EUR/hora"). La IA lo usa para sugerir el presupuesto de una propuesta a partir de los entregables del brief.';

create index if not exists idx_rate_card_items_user_id on public.rate_card_items (user_id);

drop trigger if exists trg_rate_card_items_updated_at on public.rate_card_items;
create trigger trg_rate_card_items_updated_at
  before update on public.rate_card_items
  for each row execute function public.set_updated_at();

alter table public.rate_card_items enable row level security;

drop policy if exists "rate_card_items_owner_select" on public.rate_card_items;
create policy "rate_card_items_owner_select"
  on public.rate_card_items for select
  using (auth.uid() = user_id);

drop policy if exists "rate_card_items_owner_insert" on public.rate_card_items;
create policy "rate_card_items_owner_insert"
  on public.rate_card_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "rate_card_items_owner_update" on public.rate_card_items;
create policy "rate_card_items_owner_update"
  on public.rate_card_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "rate_card_items_owner_delete" on public.rate_card_items;
create policy "rate_card_items_owner_delete"
  on public.rate_card_items for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- CHATBOT DE INCIDENCIAS: ingesta de mensajes de WhatsApp desordenados o notas
-- de voz, estructurados por la IA en un "Brief de Incidencia" accionable.
-- Ejecuta este bloque también si ya corriste el esquema antes — es idempotente.
-- ============================================================================

do $$ begin
  create type incident_priority as enum ('Baja', 'Media', 'Alta', 'Crítica');
exception when duplicate_object then null; end $$;

do $$ begin
  create type incident_type as enum ('Error', 'Bug', 'Petición', 'Soporte técnico');
exception when duplicate_object then null; end $$;

do $$ begin
  create type incident_status as enum ('draft', 'confirmed', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type incident_source as enum ('text', 'audio');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- PERMISOS BASE: en un proyecto nuevo de Supabase, `anon`/`authenticated`
-- reciben grants por defecto sobre las tablas de `public` automáticamente.
-- Si este proyecto se reutilizó de otra app y esos default privileges se
-- alteraron, las políticas RLS de arriba no alcanzan — Postgres exige el
-- GRANT de tabla ANTES de evaluar RLS ("permission denied for table X" es un
-- error distinto a "0 filas por RLS"). Estos GRANT son explícitos y no
-- dependen de la configuración del proyecto. Es idempotente: correrlo de
-- nuevo no hace nada distinto.
-- ============================================================================

grant select, update on public.profiles to authenticated;
grant select on public.brief_templates to anon, authenticated;
grant select, insert, update, delete on public.briefs to authenticated;
-- `anon` también necesita SELECT sobre briefs/submissions/submission_attachments
-- aunque solo pueda insertar: Postgres evalúa la política de SELECT de la
-- tabla al hacer INSERT ... RETURNING (lo que PostgREST siempre pide), y esas
-- políticas de "solo el dueño ve esto" consultan estas tablas directamente.
-- RLS igual las deja en 0 filas para anon (sigue siendo privado) — sin el
-- GRANT, en vez de 0 filas da "permission denied" y la petición completa falla.
grant select on public.briefs to anon;
grant insert on public.submissions to anon, authenticated;
grant select, update, delete on public.submissions to authenticated;
grant select on public.submissions to anon;
grant select on public.subscriptions to authenticated;
grant insert on public.submission_attachments to anon, authenticated;
grant select, delete on public.submission_attachments to authenticated;
grant select on public.submission_attachments to anon;
grant select, insert, update, delete on public.proposals to authenticated;
grant select, insert, update, delete on public.rate_card_items to authenticated;

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  priority incident_priority not null default 'Media',
  type incident_type not null default 'Soporte técnico',
  description text not null default '',
  repro_steps text[] not null default '{}',
  contact_name text,
  contact_email text,
  contact_phone text,
  suggested_actions text[] not null default '{}',
  raw_input text not null default '',
  source incident_source not null default 'text',
  status incident_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.incidents is 'Briefs de incidencia generados por el chatbot a partir de mensajes de WhatsApp pegados o notas de voz transcritas.';

create index if not exists idx_incidents_user_id on public.incidents (user_id);
create index if not exists idx_incidents_status on public.incidents (status);

drop trigger if exists trg_incidents_updated_at on public.incidents;
create trigger trg_incidents_updated_at
  before update on public.incidents
  for each row execute function public.set_updated_at();

alter table public.incidents enable row level security;

drop policy if exists "incidents_owner_select" on public.incidents;
create policy "incidents_owner_select"
  on public.incidents for select
  using (auth.uid() = user_id);

drop policy if exists "incidents_owner_insert" on public.incidents;
create policy "incidents_owner_insert"
  on public.incidents for insert
  with check (auth.uid() = user_id);

drop policy if exists "incidents_owner_update" on public.incidents;
create policy "incidents_owner_update"
  on public.incidents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "incidents_owner_delete" on public.incidents;
create policy "incidents_owner_delete"
  on public.incidents for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- Campana de notificaciones del dashboard: marca hasta cuándo el freelancer
-- ya revisó las respuestas nuevas de sus clientes. "No leídas" se calcula en
-- la app como submissions.created_at > profiles.notifications_read_at, sin
-- necesidad de una tabla aparte.
-- ============================================================================
alter table public.profiles
  add column if not exists notifications_read_at timestamptz not null default now();

grant select, insert, update, delete on public.incidents to authenticated;
