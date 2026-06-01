import { notFound } from 'next/navigation';
import { requireTrainer } from '@/lib/auth/require-trainer';
import { createClient } from '@/lib/supabase/server';
import { formatAED } from '@/lib/utils/money';
import { formatDate } from '@/lib/utils/dates';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { InvoiceActions } from '@/components/billing/invoice-actions';
import { Card, CardContent } from '@/components/ui/card';
import type { Invoice, InvoiceLineItem } from '@/types';
import type { InvoicePdfData } from '@/lib/pdf/invoice-pdf';

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const trainer = await requireTrainer();
  const supabase = createClient();
  const { data } = await supabase
    .from('invoices')
    .select('*,clients(full_name,email,phone)')
    .eq('id', params.id)
    .maybeSingle();
  if (!data) notFound();

  const invoice = data as unknown as Invoice & {
    clients: { full_name: string; email: string | null; phone: string | null } | null;
  };
  const client = Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients;
  const items = (invoice.line_items as unknown as InvoiceLineItem[]) ?? [];

  const pdfData: InvoicePdfData = {
    invoiceNumber: invoice.invoice_number,
    issueDate: formatDate(invoice.issue_date),
    dueDate: invoice.due_date ? formatDate(invoice.due_date) : null,
    business: {
      name: trainer.business_name || trainer.full_name || 'TrainerCore',
      vatNumber: trainer.vat_number,
      address: trainer.address,
    },
    client: {
      name: client?.full_name ?? '',
      email: client?.email ?? null,
      phone: client?.phone ?? null,
    },
    lineItems: items.map((li) => ({
      description: li.description,
      quantity: li.quantity,
      unitPrice: li.unit_price,
    })),
    subtotal: Number(invoice.subtotal),
    vatRate: Number(invoice.vat_rate),
    vatAmount: Number(invoice.vat_amount),
    total: Number(invoice.total),
    currency: invoice.currency,
    notes: invoice.notes,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={invoice.invoice_number}
        action={
          <InvoiceActions
            invoiceId={invoice.id}
            status={invoice.status}
            pdfData={pdfData}
            paymentLink={invoice.stripe_payment_link}
          />
        }
      />

      <Card>
        <CardContent className="space-y-8 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                Tax Invoice
              </p>
              <h2 className="mt-1 text-xl font-bold">{pdfData.business.name}</h2>
              {trainer.address && (
                <p className="text-sm text-muted-foreground">{trainer.address}</p>
              )}
              {trainer.vat_number && (
                <p className="text-sm text-muted-foreground">VAT Reg. No: {trainer.vat_number}</p>
              )}
            </div>
            <div className="text-right text-sm">
              <StatusBadge status={invoice.status} />
              <p className="mt-2">
                <span className="text-muted-foreground">Invoice </span>
                {invoice.invoice_number}
              </p>
              <p>
                <span className="text-muted-foreground">Issued </span>
                {formatDate(invoice.issue_date)}
              </p>
              {invoice.due_date && (
                <p>
                  <span className="text-muted-foreground">Due </span>
                  {formatDate(invoice.due_date)}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Bill to
            </p>
            <p className="font-medium">{client?.full_name}</p>
            {client?.email && <p className="text-sm text-muted-foreground">{client.email}</p>}
            {client?.phone && <p className="text-sm text-muted-foreground">{client.phone}</p>}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Unit price</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((li, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">{li.description}</td>
                    <td className="py-2 text-right">{li.quantity}</td>
                    <td className="py-2 text-right">{formatAED(li.unit_price)}</td>
                    <td className="py-2 text-right">{formatAED(li.quantity * li.unit_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatAED(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                VAT ({Math.round(Number(invoice.vat_rate) * 100)}%)
              </span>
              <span>{formatAED(invoice.vat_amount)}</span>
            </div>
            <div className="flex justify-between border-t pt-1 text-base font-bold">
              <span>Total</span>
              <span>{formatAED(invoice.total)}</span>
            </div>
          </div>

          {invoice.notes && (
            <div className="border-t pt-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Notes</p>
              <p className="whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
