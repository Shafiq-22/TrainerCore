import type { PlanTier } from '@/types';
import { env } from '@/lib/env';

/** Active-client limits per plan. Studio is effectively unlimited. */
export const PLAN_LIMITS: Record<PlanTier, number> = {
  starter: 10,
  pro: 30,
  studio: Number.POSITIVE_INFINITY,
};

export interface PlanMeta {
  tier: PlanTier;
  name: string;
  priceAed: number;
  clientLimit: number;
  seats: number;
  features: string[];
}

export const PLANS: Record<PlanTier, PlanMeta> = {
  starter: {
    tier: 'starter',
    name: 'Starter',
    priceAed: 99,
    clientLimit: 10,
    seats: 1,
    features: [
      'Up to 10 clients',
      'Workout plan builder',
      'Scheduling & sessions',
      'Invoicing with UAE VAT',
      'Weekly check-ins',
    ],
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    priceAed: 199,
    clientLimit: 30,
    seats: 1,
    features: [
      'Up to 30 clients',
      'Everything in Starter',
      'WhatsApp automations',
      'PDF exports & branding',
      'Priority support',
    ],
  },
  studio: {
    tier: 'studio',
    name: 'Studio',
    priceAed: 499,
    clientLimit: Number.POSITIVE_INFINITY,
    seats: 5,
    features: [
      'Unlimited clients',
      'Everything in Pro',
      'Up to 5 trainer seats',
      'Advanced reporting',
    ],
  },
};

export const PLAN_ORDER: PlanTier[] = ['starter', 'pro', 'studio'];

export function clientLimitFor(plan: PlanTier): number {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.starter;
}

/** Map a Stripe Price ID (from env) back to a plan tier. */
export function planForPriceId(priceId: string | null | undefined): PlanTier | null {
  if (!priceId) return null;
  if (priceId === env.stripePrices.starter) return 'starter';
  if (priceId === env.stripePrices.pro) return 'pro';
  if (priceId === env.stripePrices.studio) return 'studio';
  return null;
}

export function priceIdForPlan(plan: PlanTier): string {
  return env.stripePrices[plan];
}
