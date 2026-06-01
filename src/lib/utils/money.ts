import type { InvoiceLineItem } from '@/types';

/** UAE standard VAT rate. */
export const VAT_RATE = 0.05;

const aedFormatter = new Intl.NumberFormat('en-AE', {
  style: 'currency',
  currency: 'AED',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a number as AED currency, e.g. "AED 1,250.00". */
export function formatAED(amount: number | null | undefined): string {
  return aedFormatter.format(Number(amount) || 0);
}

/** Round to 2 decimal places using a stable half-up rule. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface InvoiceTotals {
  subtotal: number;
  vatAmount: number;
  total: number;
}

/**
 * Compute invoice totals from line items. VAT is applied per-invoice (on the
 * rounded subtotal), the conventional approach for UAE tax invoices.
 */
export function computeInvoiceTotals(
  lineItems: InvoiceLineItem[],
  vatRate: number = VAT_RATE,
): InvoiceTotals {
  const subtotal = round2(
    lineItems.reduce(
      (sum, li) => sum + (Number(li.quantity) || 0) * (Number(li.unit_price) || 0),
      0,
    ),
  );
  const vatAmount = round2(subtotal * vatRate);
  const total = round2(subtotal + vatAmount);
  return { subtotal, vatAmount, total };
}
