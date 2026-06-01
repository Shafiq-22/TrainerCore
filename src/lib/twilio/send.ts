import 'server-only';
import { getTwilio } from './client';
import { env, isTwilioConfigured } from '@/lib/env';

export interface SendResult {
  ok: boolean;
  sid?: string;
  skipped?: boolean;
  error?: string;
}

function toWhatsAppAddress(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith('whatsapp:')) return trimmed;
  const digits = trimmed.replace(/[^\d+]/g, '');
  const e164 = digits.startsWith('+') ? digits : `+${digits}`;
  return `whatsapp:${e164}`;
}

/**
 * Send a WhatsApp message. When Twilio is not configured this is a safe no-op
 * that returns `{ ok: false, skipped: true }` — callers should treat that as a
 * non-error (the notification row is recorded as "skipped").
 */
export async function sendWhatsApp(to: string, body: string): Promise<SendResult> {
  if (!isTwilioConfigured) {
    console.log(`[twilio disabled] Would send WhatsApp to ${to}: ${body.slice(0, 60)}…`);
    return { ok: false, skipped: true };
  }

  const client = getTwilio();
  if (!client) return { ok: false, skipped: true };

  try {
    const message = await client.messages.create({
      from: toWhatsAppAddress(env.twilioWhatsappNumber),
      to: toWhatsAppAddress(to),
      body,
    });
    return { ok: true, sid: message.sid };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to send WhatsApp message';
    console.error('[twilio] send error:', error);
    return { ok: false, error };
  }
}
