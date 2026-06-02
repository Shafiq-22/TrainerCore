-- ============================================================================
-- TrainerCore — 0008 body measurements in weekly check-ins
-- Adds optional body-measurement fields to checkins, extends the public
-- submit_checkin RPC, and copies them into the measurements table on completion.
-- ============================================================================

alter table checkins
  add column if not exists body_fat_pct numeric(4,1) check (body_fat_pct is null or (body_fat_pct >= 0 and body_fat_pct <= 100)),
  add column if not exists chest_cm numeric(5,1),
  add column if not exists waist_cm numeric(5,1),
  add column if not exists hips_cm numeric(5,1),
  add column if not exists arm_cm numeric(5,1);

-- Recreate submit_checkin with the new optional measurement params.
drop function if exists public.submit_checkin(text, int, int, int, int, numeric, text);

create or replace function public.submit_checkin(
  p_token text,
  p_energy int,
  p_sleep int,
  p_nutrition int,
  p_stress int,
  p_weight numeric,
  p_notes text,
  p_body_fat numeric default null,
  p_chest numeric default null,
  p_waist numeric default null,
  p_hips numeric default null,
  p_arm numeric default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_count int;
begin
  update public.checkins
  set status = 'completed',
      completed_at = now(),
      energy = p_energy,
      sleep = p_sleep,
      nutrition = p_nutrition,
      stress = p_stress,
      weight_kg = p_weight,
      body_fat_pct = p_body_fat,
      chest_cm = p_chest,
      waist_cm = p_waist,
      hips_cm = p_hips,
      arm_cm = p_arm,
      notes = nullif(p_notes, '')
  where token = p_token
    and status = 'pending'
    and expires_at > now();

  get diagnostics v_count = row_count;
  if v_count = 1 then
    return jsonb_build_object('ok', true);
  end if;
  return jsonb_build_object('ok', false, 'error', 'invalid_or_used');
end;
$$;

revoke all on function public.submit_checkin(text, int, int, int, int, numeric, text, numeric, numeric, numeric, numeric, numeric) from public;
grant execute on function public.submit_checkin(text, int, int, int, int, numeric, text, numeric, numeric, numeric, numeric, numeric) to anon, authenticated;

-- Carry the full measurement set into the measurements table on completion.
create or replace function public.checkin_to_measurement()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.status = 'completed'
     and (old.status is distinct from 'completed')
     and (new.weight_kg is not null or new.body_fat_pct is not null
          or new.chest_cm is not null or new.waist_cm is not null
          or new.hips_cm is not null or new.arm_cm is not null) then
    insert into public.measurements (
      trainer_id, client_id, measured_on, weight_kg, body_fat_pct,
      chest_cm, waist_cm, hips_cm, arm_cm, source, notes
    )
    values (
      new.trainer_id, new.client_id, coalesce(new.completed_at::date, current_date),
      new.weight_kg, new.body_fat_pct, new.chest_cm, new.waist_cm, new.hips_cm, new.arm_cm,
      'checkin', 'Recorded from weekly check-in'
    );
  end if;
  return new;
end;
$$;

revoke all on function public.checkin_to_measurement() from public, anon, authenticated;
