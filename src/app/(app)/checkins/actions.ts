'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUser, getTrainer } from '@/lib/auth/get-trainer';
import { generateCheckinToken } from '@/lib/utils/tokens';
import { dispatchNotification } from '@/lib/notifications/dispatch';
import { getTemplate, renderTemplate } from '@/lib/notifications/templates';
import { getAppUrl } from '@/lib/env';
import { ok, fail, type ActionResult } from '@/types';

export async function updateCheckinConfigAction(input: {
  dayOfWeek: number;
  enabled: boolean;
}): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return fail('Not authenticated');
  const supabase = createClient();
  const { error } = await supabase
    .from('trainers')
    .update({ checkin_day_of_week: input.dayOfWeek, checkin_enabled: input.enabled })
    .eq('id', user.id);
  if (error) return fail(error.message);
  revalidatePath('/checkins');
  revalidatePath('/settings');
  return ok();
}

/** Create a pending check-in for a client and return its public link. */
export async function createCheckinAction(
  clientId: string,
): Promise<ActionResult<{ token: string; link: string }>> {
  const user = await getUser();
  if (!user) return fail('Not authenticated');
  const supabase = createClient();
  const token = generateCheckinToken();
  const { error } = await supabase.from('checkins').insert({
    trainer_id: user.id,
    client_id: clientId,
    token,
    requested_for: new Date().toISOString().slice(0, 10),
  });
  if (error) return fail(error.message);
  revalidatePath('/checkins');
  return ok({ token, link: `${getAppUrl()}/checkin/${token}` });
}

/** Create a check-in and deliver the link over WhatsApp. */
export async function sendCheckinAction(clientId: string): Promise<ActionResult> {
  const user = await getUser();
  const trainer = await getTrainer();
  if (!user || !trainer) return fail('Not authenticated');
  const supabase = createClient();

  const { data: client } = await supabase
    .from('clients')
    .select('full_name,phone')
    .eq('id', clientId)
    .maybeSingle();
  if (!client) return fail('Client not found');

  const token = generateCheckinToken();
  const { error } = await supabase.from('checkins').insert({
    trainer_id: user.id,
    client_id: clientId,
    token,
    requested_for: new Date().toISOString().slice(0, 10),
    sent_at: new Date().toISOString(),
  });
  if (error) return fail(error.message);

  const link = `${getAppUrl()}/checkin/${token}`;
  const body = renderTemplate(getTemplate(trainer.message_templates, 'checkin'), {
    client_name: client.full_name,
    trainer_name: trainer.business_name || trainer.full_name || 'Your trainer',
    link,
  });

  await dispatchNotification(supabase, {
    trainerId: user.id,
    clientId,
    type: 'checkin',
    channel: 'whatsapp',
    title: `Check-in sent to ${client.full_name}`,
    body,
    toPhone: client.phone,
  });

  revalidatePath('/checkins');
  return ok();
}
