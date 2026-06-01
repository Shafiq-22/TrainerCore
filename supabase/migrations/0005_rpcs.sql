-- ============================================================================
-- TrainerCore — 0005 public RPCs
--
-- The public check-in page is unauthenticated. Instead of opening an anon RLS
-- hole on the checkins table, we expose two SECURITY DEFINER functions that are
-- gated by the secret token (the capability). The token alone authorises the
-- read/submit; everything else stays locked.
-- ============================================================================

create or replace function public.get_checkin(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v jsonb;
begin
  select jsonb_build_object(
    'found', true,
    'token', c.token,
    'status', c.status,
    'expired', (c.expires_at < now()),
    'requested_for', c.requested_for,
    'client_name', cl.full_name,
    'trainer_name', coalesce(nullif(t.business_name, ''), t.full_name, 'Your trainer'),
    'trainer_locale', t.locale
  )
  into v
  from public.checkins c
  join public.clients cl on cl.id = c.client_id
  join public.trainers t on t.id = c.trainer_id
  where c.token = p_token;

  return coalesce(v, jsonb_build_object('found', false));
end;
$$;

revoke all on function public.get_checkin(text) from public;
grant execute on function public.get_checkin(text) to anon, authenticated;

create or replace function public.submit_checkin(
  p_token text,
  p_energy int,
  p_sleep int,
  p_nutrition int,
  p_stress int,
  p_weight numeric,
  p_notes text
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

revoke all on function public.submit_checkin(text, int, int, int, int, numeric, text) from public;
grant execute on function public.submit_checkin(text, int, int, int, int, numeric, text) to anon, authenticated;
