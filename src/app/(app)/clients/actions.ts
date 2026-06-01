'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/get-trainer';
import { checkClientLimit } from '@/lib/plans/client-limit-guard';
import { clientFormSchema, type ClientFormValues } from '@/lib/validators/client';
import { ok, fail, type ActionResult, type ClientStatus } from '@/types';

const num = (s: string | undefined): number | null => {
  if (!s || s.trim() === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
const str = (s: string | undefined): string | null => (s && s.trim() !== '' ? s.trim() : null);

function toRow(values: ClientFormValues, trainerId: string) {
  return {
    trainer_id: trainerId,
    full_name: values.fullName.trim(),
    email: str(values.email),
    phone: str(values.phone),
    gender: str(values.gender),
    date_of_birth: str(values.dateOfBirth),
    height_cm: num(values.heightCm),
    goal: str(values.goal),
    package_name: str(values.packageName),
    package_sessions: num(values.packageSessions),
    package_price: num(values.packagePrice),
    medical_notes: str(values.medicalNotes),
    notes: str(values.notes),
    status: values.status,
    color: values.color || '#22C55E',
  };
}

export async function createClientAction(
  values: ClientFormValues,
): Promise<ActionResult<{ id: string }>> {
  const parsed = clientFormSchema.safeParse(values);
  if (!parsed.success) return fail('Please check the form for errors');

  const user = await getUser();
  if (!user) return fail('Not authenticated');

  const limit = await checkClientLimit();
  if (!limit.allowed) {
    return fail(
      `You've reached your plan limit of ${limit.limit} clients.`,
      'limit_reached',
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('clients')
    .insert(toRow(parsed.data, user.id))
    .select('id')
    .single();

  if (error) return fail(error.message);
  revalidatePath('/clients');
  return ok({ id: data.id });
}

export async function updateClientAction(
  id: string,
  values: ClientFormValues,
): Promise<ActionResult> {
  const parsed = clientFormSchema.safeParse(values);
  if (!parsed.success) return fail('Please check the form for errors');

  const user = await getUser();
  if (!user) return fail('Not authenticated');

  const supabase = createClient();
  const { trainer_id, ...row } = toRow(parsed.data, user.id);
  const { error } = await supabase.from('clients').update(row).eq('id', id);
  if (error) return fail(error.message);

  revalidatePath('/clients');
  revalidatePath(`/clients/${id}`);
  return ok();
}

export async function setClientStatusAction(
  id: string,
  status: ClientStatus,
): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from('clients').update({ status }).eq('id', id);
  if (error) return fail(error.message);
  revalidatePath('/clients');
  revalidatePath(`/clients/${id}`);
  return ok();
}

export async function deleteClientAction(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) return fail(error.message);
  revalidatePath('/clients');
  return ok();
}
