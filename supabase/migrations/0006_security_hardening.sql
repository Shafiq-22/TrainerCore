-- ============================================================================
-- TrainerCore — 0006 security hardening (addresses Supabase advisor findings)
-- ============================================================================

-- Pin search_path on the remaining SECURITY INVOKER trigger functions.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.checkin_to_measurement()
returns trigger language plpgsql set search_path = public as $$
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

-- Trigger-only functions must NOT be exposed as RPC endpoints. Triggers fire
-- regardless of EXECUTE grants, so revoking is safe.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.assign_invoice_number() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.checkin_to_measurement() from public, anon, authenticated;

-- A public bucket serves objects via their public URL without a SELECT policy.
-- Dropping this avoids letting clients LIST every avatar filename.
drop policy if exists "avatars_read" on storage.objects;

-- Lock invoice_counters out of the data API entirely (defence in depth; the
-- SECURITY DEFINER numbering trigger is the only legitimate writer).
revoke all on table public.invoice_counters from anon, authenticated;
