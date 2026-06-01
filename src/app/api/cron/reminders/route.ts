import { NextResponse } from 'next/server';
import { isAuthorizedCron, pickOne } from '@/lib/cron';
import { createServiceClient } from '@/lib/supabase/service';
import { dispatchNotification } from '@/lib/notifications/dispatch';
import { getTemplate, renderTemplate } from '@/lib/notifications/templates';
import type { Locale } from '@/lib/i18n/config';

export const runtime = 'nodejs';

/** Send WhatsApp reminders for sessions starting in the next 24 hours. */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ skipped: 'service role key not configured' });

  const now = new Date();
  const in24 = new Date(now.getTime() + 24 * 3600 * 1000);

  const { data: sessions } = await supabase
    .from('sessions')
    .select(
      'id,starts_at,client_id,trainer_id,clients(full_name,phone),trainers(full_name,business_name,locale,message_templates,whatsapp_enabled)',
    )
    .eq('status', 'scheduled')
    .is('reminder_sent_at', null)
    .gte('starts_at', now.toISOString())
    .lte('starts_at', in24.toISOString())
    .limit(100);

  let sent = 0;
  for (const s of sessions ?? []) {
    const client = pickOne(s.clients) as { full_name: string; phone: string | null } | null;
    const trainer = pickOne(s.trainers) as
      | {
          full_name: string | null;
          business_name: string | null;
          locale: string;
          message_templates: unknown;
          whatsapp_enabled: boolean;
        }
      | null;

    if (trainer?.whatsapp_enabled && client?.phone) {
      const locale = (trainer.locale as Locale) || 'en';
      const d = new Date(s.starts_at);
      const dateStr = d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
      });
      const timeStr = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'UTC',
      });
      const body = renderTemplate(
        getTemplate(trainer.message_templates, 'session_reminder', locale),
        {
          client_name: client.full_name,
          trainer_name: trainer.business_name || trainer.full_name || 'Your trainer',
          date: dateStr,
          time: timeStr,
        },
      );
      await dispatchNotification(supabase, {
        trainerId: s.trainer_id,
        clientId: s.client_id,
        type: 'session_reminder',
        channel: 'whatsapp',
        title: 'Session reminder',
        body,
        toPhone: client.phone,
        relatedId: s.id,
      });
      sent += 1;
    }

    await supabase
      .from('sessions')
      .update({ reminder_sent_at: now.toISOString() })
      .eq('id', s.id);
  }

  return NextResponse.json({ processed: sessions?.length ?? 0, sent });
}
