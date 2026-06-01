-- ============================================================================
-- TrainerCore — 0002 functions & triggers
-- ============================================================================

-- updated_at maintenance ------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_trainers_updated on trainers;
create trigger trg_trainers_updated before update on trainers
  for each row execute function public.set_updated_at();

drop trigger if exists trg_clients_updated on clients;
create trigger trg_clients_updated before update on clients
  for each row execute function public.set_updated_at();

drop trigger if exists trg_measurements_updated on measurements;
create trigger trg_measurements_updated before update on measurements
  for each row execute function public.set_updated_at();

drop trigger if exists trg_workout_plans_updated on workout_plans;
create trigger trg_workout_plans_updated before update on workout_plans
  for each row execute function public.set_updated_at();

drop trigger if exists trg_sessions_updated on sessions;
create trigger trg_sessions_updated before update on sessions
  for each row execute function public.set_updated_at();

drop trigger if exists trg_checkins_updated on checkins;
create trigger trg_checkins_updated before update on checkins
  for each row execute function public.set_updated_at();

drop trigger if exists trg_invoices_updated on invoices;
create trigger trg_invoices_updated before update on invoices
  for each row execute function public.set_updated_at();

-- Auto-provision a trainer row when an auth user is created -------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.trainers (id, email, full_name, trial_ends_at)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    now() + interval '14 days'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Race-free invoice numbering: TC-YYYY-XXXX ----------------------------------
create or replace function public.assign_invoice_number()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_year int := extract(year from coalesce(new.issue_date, current_date))::int;
  v_seq int;
begin
  if new.invoice_number is not null and new.invoice_number <> '' then
    return new;
  end if;

  insert into public.invoice_counters (trainer_id, year, last_seq)
  values (new.trainer_id, v_year, 1)
  on conflict (trainer_id, year)
  do update set last_seq = public.invoice_counters.last_seq + 1
  returning last_seq into v_seq;

  new.invoice_number := 'TC-' || v_year::text || '-' || lpad(v_seq::text, 4, '0');
  return new;
end;
$$;

drop trigger if exists trg_invoices_number on invoices;
create trigger trg_invoices_number before insert on invoices
  for each row execute function public.assign_invoice_number();

-- When a check-in completes with a weight, log a measurement -----------------
create or replace function public.checkin_to_measurement()
returns trigger language plpgsql as $$
begin
  if new.status = 'completed'
     and (old.status is distinct from 'completed')
     and new.weight_kg is not null then
    insert into public.measurements (trainer_id, client_id, measured_on, weight_kg, source, notes)
    values (
      new.trainer_id,
      new.client_id,
      coalesce(new.completed_at::date, current_date),
      new.weight_kg,
      'checkin',
      'Recorded from weekly check-in'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_checkin_measurement on checkins;
create trigger trg_checkin_measurement after update on checkins
  for each row execute function public.checkin_to_measurement();
