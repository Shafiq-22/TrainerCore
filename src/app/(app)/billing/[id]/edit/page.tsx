import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { requireTrainer } from '@/lib/auth/require-trainer';
import { PageHeader } from '@/components/shared/page-header';
import { InvoiceForm } from '@/components/billing/invoice-form';
import type { Invoice } from '@/types';

export const metadata: Metadata = { title: 'Edit invoice' };

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const trainer = await requireTrainer();
  const supabase = createClient();
  const [{ data: invoice }, { data: clients }] = await Promise.all([
    supabase.from('invoices').select('*').eq('id', params.id).maybeSingle(),
    supabase.from('clients').select('id,full_name').neq('status', 'archived').order('full_name'),
  ]);
  if (!invoice) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={`Edit ${(invoice as Invoice).invoice_number}`} />
      <InvoiceForm
        clients={clients ?? []}
        defaultVat={trainer.vat_registered}
        invoice={invoice as Invoice}
      />
    </div>
  );
}
