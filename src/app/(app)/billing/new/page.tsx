import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { requireTrainer } from '@/lib/auth/require-trainer';
import { PageHeader } from '@/components/shared/page-header';
import { InvoiceForm } from '@/components/billing/invoice-form';

export const metadata: Metadata = { title: 'New invoice' };

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: { client?: string };
}) {
  const trainer = await requireTrainer();
  const supabase = createClient();
  const { data: clients } = await supabase
    .from('clients')
    .select('id,full_name')
    .neq('status', 'archived')
    .order('full_name');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="New invoice" description="Bill a client with line items and VAT." />
      <InvoiceForm
        clients={clients ?? []}
        defaultClientId={searchParams.client}
        defaultVat={trainer.vat_registered}
      />
    </div>
  );
}
