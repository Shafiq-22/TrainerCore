'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser, getTrainer } from '@/lib/auth/get-trainer';
import { getStripe } from '@/lib/stripe/client';
import { priceIdForPlan } from '@/lib/plans/limits';
import { getAppUrl } from '@/lib/env';
import { ok, fail, type ActionResult, type PlanTier } from '@/types';

export async function createCheckoutSessionAction(
  plan: PlanTier,
): Promise<ActionResult<{ url: string }>> {
  const stripe = getStripe();
  if (!stripe) return fail('Billing is not configured yet.', 'stripe_disabled');

  const user = await getUser();
  const trainer = await getTrainer();
  if (!user || !trainer) return fail('Not authenticated');

  const priceId = priceIdForPlan(plan);
  if (!priceId || priceId.includes('placeholder')) {
    return fail('No Stripe price configured for this plan.', 'no_price');
  }

  let customerId = trainer.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: trainer.email,
      name: trainer.business_name || trainer.full_name || undefined,
      metadata: { trainer_id: user.id },
    });
    customerId = customer.id;
    const supabase = createClient();
    await supabase.from('trainers').update({ stripe_customer_id: customerId }).eq('id', user.id);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: plan === 'starter' ? 14 : undefined,
        metadata: { trainer_id: user.id },
      },
      success_url: `${getAppUrl()}/subscription?status=success`,
      cancel_url: `${getAppUrl()}/subscription?status=cancelled`,
    });
    if (!session.url) return fail('Could not start checkout');
    return ok({ url: session.url });
  } catch (err) {
    return fail(err instanceof Error ? err.message : 'Checkout failed');
  }
}

export async function createPortalSessionAction(): Promise<ActionResult<{ url: string }>> {
  const stripe = getStripe();
  if (!stripe) return fail('Billing is not configured yet.', 'stripe_disabled');

  const trainer = await getTrainer();
  if (!trainer?.stripe_customer_id) {
    return fail('No billing account yet — choose a plan first.', 'no_customer');
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: trainer.stripe_customer_id,
      return_url: `${getAppUrl()}/subscription`,
    });
    return ok({ url: session.url });
  } catch (err) {
    return fail(err instanceof Error ? err.message : 'Could not open billing portal');
  }
}
