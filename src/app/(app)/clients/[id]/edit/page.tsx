import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireTrainer } from '@/lib/auth/require-trainer';
import { PageHeader } from '@/components/shared/page-header';
import { ClientForm } from '@/components/clients/client-form';
import type { Client } from '@/types';

export const metadata: Metadata = { title: 'Edit client' };

export default async function EditClientPage({ params }: { params: { id: string } }) {
  await requireTrainer();
  const supabase = createClient();
  const { data } = await supabase.from('clients').select('*').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  const client = data as Client;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title={`Edit ${client.full_name}`} />
      <ClientForm client={client} />
    </div>
  );
}
