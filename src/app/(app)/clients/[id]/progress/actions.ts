'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/get-trainer';
import { measurementFormSchema, type MeasurementFormValues } from '@/lib/validators/client';
import { ok, fail, type ActionResult } from '@/types';

const num = (s: string | undefined): number | null => {
  if (!s || s.trim() === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

export async function addMeasurementAction(
  clientId: string,
  values: MeasurementFormValues,
): Promise<ActionResult> {
  const parsed = measurementFormSchema.safeParse(values);
  if (!parsed.success) return fail('Please check the form');
  const user = await getUser();
  if (!user) return fail('Not authenticated');

  const supabase = createClient();
  const { error } = await supabase.from('measurements').insert({
    trainer_id: user.id,
    client_id: clientId,
    measured_on: parsed.data.measuredOn,
    weight_kg: num(parsed.data.weightKg),
    body_fat_pct: num(parsed.data.bodyFatPct),
    chest_cm: num(parsed.data.chestCm),
    waist_cm: num(parsed.data.waistCm),
    hips_cm: num(parsed.data.hipsCm),
    arm_cm: num(parsed.data.armCm),
    thigh_cm: num(parsed.data.thighCm),
    notes: parsed.data.notes?.trim() || null,
  });
  if (error) return fail(error.message);
  revalidatePath(`/clients/${clientId}/progress`);
  return ok();
}

export async function deleteMeasurementAction(
  id: string,
  clientId: string,
): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from('measurements').delete().eq('id', id);
  if (error) return fail(error.message);
  revalidatePath(`/clients/${clientId}/progress`);
  return ok();
}

export async function addProgressPhotoAction(input: {
  clientId: string;
  storagePath: string;
  takenOn: string;
  pose?: string;
  caption?: string;
}): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return fail('Not authenticated');
  const supabase = createClient();
  const { error } = await supabase.from('progress_photos').insert({
    trainer_id: user.id,
    client_id: input.clientId,
    storage_path: input.storagePath,
    taken_on: input.takenOn,
    pose: input.pose || null,
    caption: input.caption || null,
  });
  if (error) return fail(error.message);
  revalidatePath(`/clients/${input.clientId}/progress`);
  return ok();
}

export async function deleteProgressPhotoAction(
  id: string,
  storagePath: string,
  clientId: string,
): Promise<ActionResult> {
  const supabase = createClient();
  await supabase.storage.from('progress-photos').remove([storagePath]);
  const { error } = await supabase.from('progress_photos').delete().eq('id', id);
  if (error) return fail(error.message);
  revalidatePath(`/clients/${clientId}/progress`);
  return ok();
}
