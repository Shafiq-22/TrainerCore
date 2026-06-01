import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { sendWhatsApp } from '@/lib/twilio/send';
import type { NotificationChannel, NotificationType } from '@/types';

interface DispatchParams {
  trainerId: string;
  clientId?: string | null;
  type: NotificationType;
  channel?: NotificationChannel;
  title?: string;
  body: string;
  toPhone?: string | null;
  relatedId?: string | null;
}

/**
 * Record a notification and (for the WhatsApp channel) attempt delivery via
 * Twilio. The notification row is always written so the activity feed reflects
 * the attempt even when Twilio is disabled.
 */
export async function dispatchNotification(
  supabase: SupabaseClient<Database>,
  params: DispatchParams,
): Promise<string | undefined> {
  const channel = params.channel ?? 'whatsapp';

  const { data: row } = await supabase
    .from('notifications')
    .insert({
      trainer_id: params.trainerId,
      client_id: params.clientId ?? null,
      type: params.type,
      channel,
      title: params.title ?? null,
      body: params.body,
      related_id: params.relatedId ?? null,
      status: 'queued',
    })
    .select('id')
    .single();

  const id = row?.id;
  const now = new Date().toISOString();

  if (channel !== 'whatsapp' || !params.toPhone) {
    if (id) {
      await supabase
        .from('notifications')
        .update({ status: channel === 'in_app' ? 'sent' : 'skipped', sent_at: now })
        .eq('id', id);
    }
    return id;
  }

  const result = await sendWhatsApp(params.toPhone, params.body);
  if (id) {
    await supabase
      .from('notifications')
      .update({
        status: result.ok ? 'sent' : result.skipped ? 'skipped' : 'failed',
        provider_sid: result.sid ?? null,
        error: result.error ?? null,
        sent_at: now,
      })
      .eq('id', id);
  }
  return id;
}
