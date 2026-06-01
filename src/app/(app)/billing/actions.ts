'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUser, getTrainer } from '@/lib/auth/get-trainer';
import { invoiceInputSchema, type InvoiceInput } from '@/lib/validators/invoice';
import { computeInvoiceTotals, VAT_RATE, formatAED } from '@/lib/utils/money';
import { dispatchNotification } from '@/lib/notifications/dispatch';
import { getTemplate, renderTemplate } from '@/lib/notifications/templates';
import { getStripe } from '@/lib/stripe/client';
import { getAppUrl } from '@/lib/env';
import { ok, fail, type ActionResult, type InvoiceLineItem, type InvoiceStatus } from '@/types';
import type { Json } from '@/lib/supabase/database.types';
import type { Locale } from '@/lib/i18n/config';

function buildTotals(input: InvoiceInput) {
  const items: InvoiceLineItem[] = input.lineItems.map((li) => ({
    description: li.description,
    quantity: li.quantity,
    unit_price: li.unitPrice,
  }));
  const rate = input.vatEnabled ? VAT_RATE : 0;
  const totals = computeInvoiceTotals(items, rate);
  return { items, rate, totals };
}

export async function createInvoiceAction(
  input: InvoiceInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = invoiceInputSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid invoice');
  const user = await getUser();
  if (!user) return fail('Not authenticated');

  const { items, rate, totals } = buildTotals(parsed.data);
  const supabase = createClient();
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      trainer_id: user.id,
      client_id: parsed.data.clientId,
      invoice_number: '', // assigned by trigger
      issue_date: parsed.data.issueDate,
      due_date: parsed.data.dueDate || null,
      line_items: items as unknown as Json,
      subtotal: totals.subtotal,
      vat_rate: rate,
      vat_amount: totals.vatAmount,
      total: totals.total,
      notes: parsed.data.notes || null,
    })
    .select('id')
    .single();
  if (error || !data) return fail(error?.message ?? 'Failed to create invoice');

  revalidatePath('/billing');
  return ok({ id: data.id });
}

export async function updateInvoiceAction(
  id: string,
  input: InvoiceInput,
): Promise<ActionResult> {
  const parsed = invoiceInputSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid invoice');
  const { items, rate, totals } = buildTotals(parsed.data);
  const supabase = createClient();
  const { error } = await supabase
    .from('invoices')
    .update({
      client_id: parsed.data.clientId,
      issue_date: parsed.data.issueDate,
      due_date: parsed.data.dueDate || null,
      line_items: items as unknown as Json,
      subtotal: totals.subtotal,
      vat_rate: rate,
      vat_amount: totals.vatAmount,
      total: totals.total,
      notes: parsed.data.notes || null,
    })
    .eq('id', id);
  if (error) return fail(error.message);
  revalidatePath('/billing');
  revalidatePath(`/billing/${id}`);
  return ok();
}

export async function setInvoiceStatusAction(
  id: string,
  status: InvoiceStatus,
): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from('invoices')
    .update({ status, paid_at: status === 'paid' ? new Date().toISOString() : null })
    .eq('id', id);
  if (error) return fail(error.message);
  revalidatePath('/billing');
  revalidatePath(`/billing/${id}`);
  return ok();
}

export async function deleteInvoiceAction(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from('invoices').delete().eq('id', id);
  if (error) return fail(error.message);
  revalidatePath('/billing');
  return ok();
}

/** Create a one-off Stripe Payment Link for the invoice total (if Stripe is configured). */
export async function createPaymentLinkAction(id: string): Promise<ActionResult<{ url: string }>> {
  const stripe = getStripe();
  if (!stripe) return fail('Stripe is not configured. Add your keys in settings.', 'stripe_disabled');

  const supabase = createClient();
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id,invoice_number,total,currency,stripe_payment_link')
    .eq('id', id)
    .maybeSingle();
  if (!invoice) return fail('Invoice not found');
  if (invoice.stripe_payment_link) return ok({ url: invoice.stripe_payment_link });

  try {
    const price = await stripe.prices.create({
      currency: (invoice.currency || 'AED').toLowerCase(),
      unit_amount: Math.round(Number(invoice.total) * 100),
      product_data: { name: `Invoice ${invoice.invoice_number}` },
    });
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: { invoice_id: invoice.id },
    });
    await supabase.from('invoices').update({ stripe_payment_link: link.url }).eq('id', id);
    revalidatePath(`/billing/${id}`);
    return ok({ url: link.url });
  } catch (err) {
    return fail(err instanceof Error ? err.message : 'Failed to create payment link');
  }
}

/** Mark an invoice as sent and deliver it over WhatsApp (best-effort). */
export async function sendInvoiceAction(id: string): Promise<ActionResult> {
  const user = await getUser();
  const trainer = await getTrainer();
  if (!user || !trainer) return fail('Not authenticated');
  const supabase = createClient();

  const { data: invoice } = await supabase
    .from('invoices')
    .select('id,invoice_number,total,stripe_payment_link,client_id,clients(full_name,phone)')
    .eq('id', id)
    .maybeSingle();
  if (!invoice) return fail('Invoice not found');

  await supabase
    .from('invoices')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', id);

  const client = (Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients) as
    | { full_name: string; phone: string | null }
    | null;
  const locale = (trainer.locale as Locale) || 'en';
  const template = getTemplate(trainer.message_templates, 'invoice_sent', locale);
  const body = renderTemplate(template, {
    client_name: client?.full_name ?? '',
    trainer_name: trainer.business_name || trainer.full_name || 'Your trainer',
    invoice_number: invoice.invoice_number,
    amount: formatAED(invoice.total),
    link: invoice.stripe_payment_link || `${getAppUrl()}/billing/${id}`,
  });

  await dispatchNotification(supabase, {
    trainerId: user.id,
    clientId: invoice.client_id,
    type: 'invoice_sent',
    channel: 'whatsapp',
    title: `Invoice ${invoice.invoice_number} sent`,
    body,
    toPhone: client?.phone ?? null,
    relatedId: id,
  });

  revalidatePath('/billing');
  revalidatePath(`/billing/${id}`);
  return ok();
}
