import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';

/** Twilio status callback — updates the matching notification's delivery status. */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ received: true });

  const sid = String(form.get('MessageSid') || form.get('SmsSid') || '');
  const status = String(form.get('MessageStatus') || form.get('SmsStatus') || '');

  const supabase = createServiceClient();
  if (supabase && sid) {
    const mapped =
      status === 'delivered' || status === 'read'
        ? 'delivered'
        : status === 'failed' || status === 'undelivered'
          ? 'failed'
          : 'sent';
    await supabase.from('notifications').update({ status: mapped }).eq('provider_sid', sid);
  }

  return NextResponse.json({ received: true });
}
