-- ============================================================================
-- TrainerCore — 0003 Row Level Security
--
-- Tenant isolation model: every tenant table carries a denormalized
-- `trainer_id`, so the policy on EVERY owned table is the identical template
-- `trainer_id = auth.uid()`. No joins, fully auditable. Public flows (check-in)
-- never touch these tables directly — they go through SECURITY DEFINER RPCs.
-- ============================================================================

-- Canonical 4-policy owner template, applied to every tenant-owned table.
do $$
declare
  t text;
  owned text[] := array[
    'clients', 'measurements', 'progress_photos', 'workout_plans',
    'workout_weeks', 'workout_days', 'day_exercises', 'client_plans',
    'sessions', 'checkins', 'invoices', 'notifications'
  ];
begin
  foreach t in array owned loop
    execute format('alter table %I enable row level security', t);

    execute format('drop policy if exists %I on %I', t || '_select', t);
    execute format(
      'create policy %I on %I for select to authenticated using (trainer_id = auth.uid())',
      t || '_select', t);

    execute format('drop policy if exists %I on %I', t || '_insert', t);
    execute format(
      'create policy %I on %I for insert to authenticated with check (trainer_id = auth.uid())',
      t || '_insert', t);

    execute format('drop policy if exists %I on %I', t || '_update', t);
    execute format(
      'create policy %I on %I for update to authenticated using (trainer_id = auth.uid()) with check (trainer_id = auth.uid())',
      t || '_update', t);

    execute format('drop policy if exists %I on %I', t || '_delete', t);
    execute format(
      'create policy %I on %I for delete to authenticated using (trainer_id = auth.uid())',
      t || '_delete', t);
  end loop;
end $$;

-- trainers: a trainer can only see/edit their own row (id == auth.uid()).
alter table trainers enable row level security;
drop policy if exists trainers_select on trainers;
create policy trainers_select on trainers for select to authenticated using (id = auth.uid());
drop policy if exists trainers_insert on trainers;
create policy trainers_insert on trainers for insert to authenticated with check (id = auth.uid());
drop policy if exists trainers_update on trainers;
create policy trainers_update on trainers for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- exercises: global library is readable by all authenticated users; a trainer
-- may only write their own custom exercises.
alter table exercises enable row level security;
drop policy if exists exercises_select on exercises;
create policy exercises_select on exercises for select to authenticated using (is_global or trainer_id = auth.uid());
drop policy if exists exercises_insert on exercises;
create policy exercises_insert on exercises for insert to authenticated with check (trainer_id = auth.uid());
drop policy if exists exercises_update on exercises;
create policy exercises_update on exercises for update to authenticated using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());
drop policy if exists exercises_delete on exercises;
create policy exercises_delete on exercises for delete to authenticated using (trainer_id = auth.uid());

-- invoice_counters: locked. No policies — only the SECURITY DEFINER invoice
-- numbering trigger ever touches it.
alter table invoice_counters enable row level security;
