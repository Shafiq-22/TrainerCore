/**
 * Centralised, non-throwing environment access.
 *
 * Importing this module never throws — that is essential so `next build` works
 * with placeholder values. Integrations expose `*Configured` booleans so call
 * sites can degrade gracefully instead of crashing.
 */

function val(key: string): string {
  return process.env[key]?.trim() ?? '';
}

/** A value is "real" if it's present and not an obvious placeholder. */
function isReal(value: string): boolean {
  if (!value) return false;
  const lowered = value.toLowerCase();
  return !(
    lowered.includes('placeholder') ||
    lowered.includes('your-') ||
    lowered.includes('change-me') ||
    lowered === 'xxx'
  );
}

export const env = {
  supabaseUrl: val('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: val('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: val('SUPABASE_SERVICE_ROLE_KEY'),

  stripeSecretKey: val('STRIPE_SECRET_KEY'),
  stripePublishableKey: val('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  stripeWebhookSecret: val('STRIPE_WEBHOOK_SECRET'),
  stripePrices: {
    starter: val('STRIPE_PRICE_STARTER'),
    pro: val('STRIPE_PRICE_PRO'),
    studio: val('STRIPE_PRICE_STUDIO'),
  },

  twilioAccountSid: val('TWILIO_ACCOUNT_SID'),
  twilioAuthToken: val('TWILIO_AUTH_TOKEN'),
  twilioWhatsappNumber: val('TWILIO_WHATSAPP_NUMBER'),

  appUrl: val('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000',
  cronSecret: val('CRON_SECRET'),
} as const;

export const isSupabaseConfigured =
  isReal(env.supabaseUrl) && isReal(env.supabaseAnonKey);

export const isSupabaseServiceConfigured = isReal(env.supabaseServiceRoleKey);

export const isStripeConfigured =
  isReal(env.stripeSecretKey) && env.stripeSecretKey.startsWith('sk_');

export const isTwilioConfigured =
  isReal(env.twilioAccountSid) &&
  env.twilioAccountSid.startsWith('AC') &&
  isReal(env.twilioAuthToken);

export function getAppUrl(): string {
  // Prefer the explicit public URL; fall back to Vercel's auto URL.
  if (isReal(env.appUrl) && env.appUrl !== 'http://localhost:3000') {
    return env.appUrl.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return env.appUrl.replace(/\/$/, '');
}
