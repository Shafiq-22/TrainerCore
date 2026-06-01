-- ============================================================================
-- TrainerCore — 0004 storage buckets & policies
-- Path convention for every object: "{trainer_id}/...".
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('progress-photos', 'progress-photos', false),
  ('invoice-assets', 'invoice-assets', false)
on conflict (id) do nothing;

-- avatars: world-readable (used in <img>), owner-writable -----------------
drop policy if exists "avatars_read" on storage.objects;
create policy "avatars_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_insert" on storage.objects;
create policy "avatars_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_update" on storage.objects;
create policy "avatars_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_delete" on storage.objects;
create policy "avatars_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- progress-photos: private, owner-only (served via signed URLs) ------------
drop policy if exists "progress_photos_all" on storage.objects;
create policy "progress_photos_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- invoice-assets: private, owner-only --------------------------------------
drop policy if exists "invoice_assets_all" on storage.objects;
create policy "invoice_assets_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'invoice-assets' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'invoice-assets' and (storage.foldername(name))[1] = auth.uid()::text);
