'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/get-trainer';
import { sessionFormSchema, type SessionFormValues } from '@/lib/validators/session';
import { ok, fail, type ActionResult } from '@/types';

/**
 * We store session times as UTC-labelled wall-clock (Asia/Dubai). This keeps the
 * calendar consistent regardless of the viewer's timezone.
 */
function computeRange(date: string, startTime: string, durationMin: number) {
  const startsAt = `${date}T${startTime}:00.000Z`;
  const endsAt = new Date(new Date(startsAt).getTime() + durationMin * 60000).toISOString();
  return { startsAt, endsAt };
}

export async function createSessionAction(values: SessionFormValues): Promise<ActionResult> {
  const parsed = sessionFormSchema.safeParse(values);
  if (!parsed.success) return fail('Please check the form');
  const user = await getUser();
  if (!user) return fail('Not authenticated');

  const duration = Number(parsed.data.durationMin) || 60;
  const { startsAt, endsAt } = computeRange(parsed.data.date, parsed.data.startTime, duration);

  const supabase = createClient();
  const { error } = await supabase.from('sessions').insert({
    trainer_id: user.id,
    client_id: parsed.data.clientId,
    starts_at: startsAt,
    ends_at: endsAt,
    title: parsed.data.title || null,
    location: parsed.data.location || null,
    notes: parsed.data.notes || null,
  });
  if (error) return fail(error.message);
  revalidatePath('/schedule');
  return ok();
}

export async function updateSessionAction(
  id: string,
  values: SessionFormValues,
): Promise<ActionResult> {
  const parsed = sessionFormSchema.safeParse(values);
  if (!parsed.success) return fail('Please check the form');
  const duration = Number(parsed.data.durationMin) || 60;
  const { startsAt, endsAt } = computeRange(parsed.data.date, parsed.data.startTime, duration);

  const supabase = createClient();
  const { error } = await supabase
    .from('sessions')
    .update({
      client_id: parsed.data.clientId,
      starts_at: startsAt,
      ends_at: endsAt,
      title: parsed.data.title || null,
      location: parsed.data.location || null,
      notes: parsed.data.notes || null,
    })
    .eq('id', id);
  if (error) return fail(error.message);
  revalidatePath('/schedule');
  return ok();
}

export async function setSessionStatusAction(
  id: string,
  status: 'scheduled' | 'completed' | 'canceled',
): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from('sessions')
    .update({
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    })
    .eq('id', id);
  if (error) return fail(error.message);
  revalidatePath('/schedule');
  return ok();
}

export async function deleteSessionAction(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from('sessions').delete().eq('id', id);
  if (error) return fail(error.message);
  revalidatePath('/schedule');
  return ok();
}
