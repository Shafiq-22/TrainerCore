import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/client';
import { env, isStripeConfigured } from '@/lib/env';
import { syncSubscriptionToTrainer, markInvoicePaid } from '@/lib/stripe/sync';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = env.stripeWebhookSecret;

  // Gracefully no-op when Stripe / webhook secret isn't configured.
  if (!stripe || !isStripeConfigured || !secret || secret.includes('placeholder')) {
    return NextResponse.json({ received: true, skipped: true });
  }

  const signature = req.headers.get('stripe-signature');
  const body = await req.text(); // raw body required for signature verification

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? '', secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription && session.customer) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await syncSubscriptionToTrainer(sub, session.customer as string);
        } else if (session.payment_status === 'paid') {
          // One-off invoice paid via a Stripe Payment Link.
          let invoiceId = session.metadata?.invoice_id ?? null;
          if (!invoiceId && session.payment_link) {
            try {
              const link = await stripe.paymentLinks.retrieve(session.payment_link as string);
              invoiceId = link.metadata?.invoice_id ?? null;
            } catch {
              /* ignore */
            }
          }
          if (invoiceId) {
            await markInvoicePaid(invoiceId, (session.payment_intent as string | null) ?? null);
          }
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscriptionToTrainer(sub, sub.customer as string);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('[stripe webhook] handler error:', err);
    // Still return 200 so Stripe doesn't endlessly retry a non-signature error.
  }

  return NextResponse.json({ received: true });
}
