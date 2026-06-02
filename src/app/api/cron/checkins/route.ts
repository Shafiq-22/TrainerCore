import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { isAuthorizedCron } from '@/lib/cron';
import { createServiceClient } from '@/lib/supabase/service';
import { dispatchNotification } from '@/lib/notifications/dispatch';
import { getTemplate, renderTemplate } from '@/lib/notifications/templates';
import { getAppUrl } from '@/lib/env';

export const runtime = 'nodejs';

/** Create + send weekly check-ins for trainers whose configured day is today. */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ skipped: 'service role key not configured' });

  const dow = new Date().getUTCDay(); // 0 = Sunday
  const today = new Date().toISOString().slice(0, 10);

  const { data: trainers } = await supabase
    .from('trainers')
    .select('id,full_name,business_name,locale,message_templates')
    .eq('checkin_enabled', true)
    .eq('checkin_day_of_week', dow);

  let created = 0;
  for (const trainer of trainers ?? []) {
    const { data: clients } = await supabase
      .from('clients')
      .select('id,full_name,phone')
      .eq('trainer_id', trainer.id)
      .eq('status', 'active');

    for (const client of clients ?? []) {
      const token = randomBytes(24).toString('base64url');
      const { error } = await supabase.from('checkins').insert({
        trainer_id: trainer.id,
        client_id: client.id,
        token,
        requested_for: today,
        sent_at: new Date().toISOString(),
      });
      if (error) continue;

      const body = renderTemplate(getTemplate(trainer.message_templates, 'checkin'), {
        client_name: client.full_name,
        trainer_name: trainer.business_name || trainer.full_name || 'Your trainer',
        link: `${getAppUrl()}/checkin/${token}`,
      });
      await dispatchNotification(supabase, {
        trainerId: trainer.id,
        clientId: client.id,
        type: 'checkin',
        channel: 'whatsapp',
        title: `Weekly check-in for ${client.full_name}`,
        body,
        toPhone: client.phone,
      });
      created += 1;
    }
  }

  return NextResponse.json({ created });
}
