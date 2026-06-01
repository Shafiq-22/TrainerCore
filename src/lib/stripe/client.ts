import 'server-only';
import Stripe from 'stripe';
import { env, isStripeConfigured } from '@/lib/env';

let _stripe: Stripe | null = null;

/** Returns a Stripe client, or null when Stripe is not configured. */
export function getStripe(): Stripe | null {
  if (!isStripeConfigured) return null;
  if (!_stripe) {
    _stripe = new Stripe(env.stripeSecretKey, {
      appInfo: { name: 'TrainerCore' },
      typescript: true,
    });
  }
  return _stripe;
}
