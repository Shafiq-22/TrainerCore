import 'server-only';
import type Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/service';
import { planForPriceId } from '@/lib/plans/limits';
import type { SubscriptionStatus } from '@/types';

function mapStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'trialing':
      return 'trialing';
    case 'active':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
      return 'canceled';
    default:
      return 'incomplete';
  }
}

/**
 * Reconcile a Stripe subscription into the trainer row. Uses the service-role
 * client (RLS bypass); no-ops cleanly if the service key isn't configured.
 */
export async function syncSubscriptionToTrainer(
  subscription: Stripe.Subscription,
  customerId: string,
): Promise<void> {
  const supabase = createServiceClient();
  if (!supabase) {
    console.warn('[stripe sync] service role key not configured — skipping DB sync');
    return;
  }

  const priceId = subscription.items.data[0]?.price.id ?? null;
  const plan = planForPriceId(priceId);
  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000).toISOString()
    : null;

  await supabase
    .from('trainers')
    .update({
      ...(plan ? { plan } : {}),
      subscription_status: mapStatus(subscription.status),
      stripe_subscription_id: subscription.id,
      trial_ends_at: trialEnd,
    })
    .eq('stripe_customer_id', customerId);
}

/**
 * Mark a one-off invoice as paid when its Stripe Payment Link checkout
 * completes. Uses the service-role client (RLS bypass); no-ops if unconfigured.
 */
export async function markInvoicePaid(
  invoiceId: string,
  paymentIntentId: string | null,
): Promise<void> {
  const supabase = createServiceClient();
  if (!supabase) {
    console.warn('[stripe sync] service role key not configured — skipping invoice paid sync');
    return;
  }
  await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      ...(paymentIntentId ? { stripe_payment_intent_id: paymentIntentId } : {}),
    })
    .eq('id', invoiceId);
}
