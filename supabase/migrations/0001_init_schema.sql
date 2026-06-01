-- ============================================================================
-- TrainerCore — 0001 init schema
-- Extensions, enums, and all core tables with indexes / constraints.
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
do $$ begin
  create type plan_tier as enum ('starter', 'pro', 'studio');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');
exception when duplicate_object then null; end $$;

do $$ begin
  create type client_status as enum ('active', 'inactive', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue');
exception when duplicate_object then null; end $$;

do $$ begin
  create type session_status as enum ('scheduled', 'completed', 'canceled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum ('checkin', 'session_reminder', 'invoice_sent', 'invoice_reminder', 'system');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_channel as enum ('whatsapp', 'email', 'in_app');
exception when duplicate_object then null; end $$;

do $$ begin
  create type muscle_group as enum ('chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- trainers (tenant root; PK == auth.users.id)
-- ----------------------------------------------------------------------------
create table if not exists trainers (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  bio text,
  business_name text,
  vat_number text,
  vat_registered boolean not null default false,
  address text,
  plan plan_tier not null default 'starter',
  subscription_status subscription_status not null default 'trialing',
  trial_ends_at timestamptz,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  onboarding_completed boolean not null default false,
  onboarding_step int not null default 0,
  checkin_enabled boolean not null default true,
  checkin_day_of_week int not null default 0 check (checkin_day_of_week between 0 and 6),
  whatsapp_enabled boolean not null default false,
  locale text not null default 'en' check (locale in ('en', 'ar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists trainers_email_uidx on trainers (lower(email));

-- ----------------------------------------------------------------------------
-- clients
-- ----------------------------------------------------------------------------
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainers(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  status client_status not null default 'active',
  gender text check (gender is null or gender in ('male', 'female', 'other')),
  date_of_birth date,
  height_cm numeric(5,1),
  goal text,
  package_name text,
  package_sessions int,
  package_price numeric(12,2),
  medical_notes text,
  notes text,
  avatar_url text,
  color text not null default '#22C55E',
  start_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists clients_trainer_status_idx on clients (trainer_id, status);
create index if not exists clients_trainer_name_idx on clients (trainer_id, full_name);
create unique index if not exists clients_trainer_email_uidx
  on clients (trainer_id, lower(email)) where email is not null;

-- ----------------------------------------------------------------------------
-- measurements
-- ----------------------------------------------------------------------------
create table if not exists measurements (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainers(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  measured_on date not null default current_date,
  weight_kg numeric(5,2) check (weight_kg is null or weight_kg >= 0),
  body_fat_pct numeric(4,1) check (body_fat_pct is null or (body_fat_pct >= 0 and body_fat_pct <= 100)),
  chest_cm numeric(5,1),
  waist_cm numeric(5,1),
  hips_cm numeric(5,1),
  arm_cm numeric(5,1),
  thigh_cm numeric(5,1),
  source text not null default 'manual',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists measurements_client_date_idx on measurements (client_id, measured_on desc);

-- ----------------------------------------------------------------------------
-- progress_photos
-- ----------------------------------------------------------------------------
create table if not exists progress_photos (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainers(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  storage_path text not null,
  taken_on date not null default current_date,
  pose text,
  caption text,
  created_at timestamptz not null default now()
);
create index if not exists progress_photos_client_date_idx on progress_photos (client_id, taken_on desc);

-- ----------------------------------------------------------------------------
-- exercises (global library + optional per-trainer custom)
-- ----------------------------------------------------------------------------
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid references trainers(id) on delete cascade,
  name text not null,
  muscle_group muscle_group not null,
  equipment text,
  instructions text,
  is_global boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists exercises_muscle_idx on exercises (muscle_group);
create unique index if not exists exercises_name_uidx
  on exercises (coalesce(trainer_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name));

-- ----------------------------------------------------------------------------
-- workout_plans / weeks / days / day_exercises
-- ----------------------------------------------------------------------------
create table if not exists workout_plans (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainers(id) on delete cascade,
  name text not null,
  description text,
  goal text,
  weeks_count int not null default 4 check (weeks_count between 1 and 52),
  is_template boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists workout_plans_trainer_idx on workout_plans (trainer_id, is_template);

create table if not exists workout_weeks (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainers(id) on delete cascade,
  plan_id uuid not null references workout_plans(id) on delete cascade,
  week_number int not null check (week_number >= 1),
  unique (plan_id, week_number)
);
create index if not exists workout_weeks_plan_idx on workout_weeks (plan_id);

create table if not exists workout_days (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainers(id) on delete cascade,
  week_id uuid not null references workout_weeks(id) on delete cascade,
  day_of_week int not null check (day_of_week between 1 and 7),
  label text,
  is_rest boolean not null default false,
  unique (week_id, day_of_week)
);
create index if not exists workout_days_week_idx on workout_days (week_id);

create table if not exists day_exercises (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainers(id) on delete cascade,
  day_id uuid not null references workout_days(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete restrict,
  position int not null default 0,
  sets int,
  reps text,
  rest_seconds int,
  tempo text,
  notes text,
  constraint day_exercises_pos_uniq unique (day_id, position) deferrable initially deferred
);
create index if not exists day_exercises_day_idx on day_exercises (day_id, position);

-- ----------------------------------------------------------------------------
-- client_plans (assignment)
-- ----------------------------------------------------------------------------
create table if not exists client_plans (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainers(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  plan_id uuid not null references workout_plans(id) on delete cascade,
  assigned_on date not null default current_date,
  start_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists client_plans_active_uidx on client_plans (client_id) where is_active;
create index if not exists client_plans_client_idx on client_plans (client_id, is_active);

-- ----------------------------------------------------------------------------
-- sessions
-- ----------------------------------------------------------------------------
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainers(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status session_status not null default 'scheduled',
  title text,
  notes text,
  location text,
  color text,
  reminder_sent_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists sessions_trainer_start_idx on sessions (trainer_id, starts_at);
create index if not exists sessions_client_start_idx on sessions (client_id, starts_at);
create index if not exists sessions_scheduled_idx on sessions (trainer_id, starts_at) where status = 'scheduled';

-- ----------------------------------------------------------------------------
-- checkins (request + response in one row; token is the public capability)
-- ----------------------------------------------------------------------------
create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainers(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  token text not null unique default translate(encode(extensions.gen_random_bytes(24), 'base64'), '+/=', '-_'),
  status text not null default 'pending' check (status in ('pending', 'completed', 'expired')),
  requested_for date not null default current_date,
  sent_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  energy int check (energy between 1 and 5),
  sleep int check (sleep between 1 and 5),
  nutrition int check (nutrition between 1 and 5),
  stress int check (stress between 1 and 5),
  weight_kg numeric(5,2) check (weight_kg is null or weight_kg >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists checkins_trainer_idx on checkins (trainer_id, requested_for desc);
create index if not exists checkins_client_completed_idx on checkins (client_id, completed_at desc);

-- ----------------------------------------------------------------------------
-- invoices (+ per-trainer/year counter for race-free numbering)
-- ----------------------------------------------------------------------------
create table if not exists invoice_counters (
  trainer_id uuid not null references trainers(id) on delete cascade,
  year int not null,
  last_seq int not null default 0,
  primary key (trainer_id, year)
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainers(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  invoice_number text not null unique,
  status invoice_status not null default 'draft',
  issue_date date not null default current_date,
  due_date date,
  line_items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  vat_rate numeric(5,4) not null default 0.05,
  vat_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'AED',
  notes text,
  stripe_payment_link text,
  stripe_payment_intent_id text,
  sent_at timestamptz,
  paid_at timestamptz,
  pdf_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_total_chk check (abs(total - (subtotal + vat_amount)) < 0.01)
);
create index if not exists invoices_trainer_status_idx on invoices (trainer_id, status);
create index if not exists invoices_client_idx on invoices (client_id);
create index if not exists invoices_due_idx on invoices (trainer_id, due_date) where status in ('sent', 'overdue');

-- ----------------------------------------------------------------------------
-- notifications (activity feed + delivery log)
-- ----------------------------------------------------------------------------
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainers(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  type notification_type not null,
  channel notification_channel not null default 'whatsapp',
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'delivered', 'skipped')),
  title text,
  body text,
  payload jsonb,
  provider_sid text,
  related_id uuid,
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_trainer_created_idx on notifications (trainer_id, created_at desc);
create index if not exists notifications_sid_idx on notifications (provider_sid) where provider_sid is not null;
