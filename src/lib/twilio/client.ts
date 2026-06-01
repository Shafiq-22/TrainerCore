import 'server-only';
import twilio from 'twilio';
import { env, isTwilioConfigured } from '@/lib/env';

let _client: ReturnType<typeof twilio> | null = null;

/** Returns a Twilio client, or null when Twilio is not configured. */
export function getTwilio() {
  if (!isTwilioConfigured) return null;
  if (!_client) {
    _client = twilio(env.twilioAccountSid, env.twilioAuthToken);
  }
  return _client;
}
