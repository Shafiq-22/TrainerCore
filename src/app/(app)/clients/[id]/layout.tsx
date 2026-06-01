import { notFound } from 'next/navigation';
import { requireTrainer } from '@/lib/auth/require-trainer';
import { getClientById } from '@/lib/data/clients';
import { ClientHeader } from '@/components/clients/client-header';
import { ClientTabs } from '@/components/clients/client-tabs';

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  await requireTrainer();
  const client = await getClientById(params.id);
  if (!client) notFound();

  return (
    <div className="space-y-6">
      <ClientHeader client={client} />
      <ClientTabs id={client.id} />
      <div>{children}</div>
    </div>
  );
}
