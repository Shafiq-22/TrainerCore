import type { Metadata } from 'next';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireTrainer } from '@/lib/auth/require-trainer';
import { checkClientLimit } from '@/lib/plans/client-limit-guard';
import { formatAED } from '@/lib/utils/money';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ClientsToolbar } from '@/components/clients/clients-toolbar';
import { NewClientButton } from '@/components/clients/new-client-button';
import { ClientRowActions } from '@/components/clients/client-row-actions';
import type { Client, ClientStatus } from '@/types';

export const metadata: Metadata = { title: 'Clients' };

const PAGE_SIZE = 10;

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string };
}) {
  await requireTrainer();
  const supabase = createClient();

  const q = searchParams.q?.trim() ?? '';
  const status = searchParams.status ?? 'all';
  const page = Math.max(1, Number(searchParams.page) || 1);
  const from = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });
  if (q) query = query.ilike('full_name', `%${q}%`);
  if (status !== 'all') query = query.eq('status', status as ClientStatus);

  const [{ data, count }, limit] = await Promise.all([
    query.range(from, from + PAGE_SIZE - 1),
    checkClientLimit(),
  ]);

  const clients = (data ?? []) as Client[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageHref = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (status !== 'all') sp.set('status', status);
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return `/clients${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description={`${total} ${total === 1 ? 'client' : 'clients'}`}
        action={
          <NewClientButton
            allowed={limit.allowed}
            current={limit.current}
            limit={limit.limit === Infinity ? 9999 : limit.limit}
          />
        }
      />

      <ClientsToolbar />

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={q || status !== 'all' ? 'No clients match your filters' : 'No clients yet'}
          description={
            q || status !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Add your first client to start tracking their progress.'
          }
          action={
            limit.allowed && !q && status === 'all' ? (
              <Button asChild>
                <Link href="/clients/new">Add client</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Package</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id} className="group">
                  <TableCell>
                    <Link href={`/clients/${c.id}`} className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        {c.avatar_url && <AvatarImage src={c.avatar_url} alt={c.full_name} />}
                        <AvatarFallback style={{ backgroundColor: c.color, color: 'white' }}>
                          {c.full_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium group-hover:underline">{c.full_name}</p>
                        {c.email && (
                          <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {c.phone ?? '—'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {c.package_name
                      ? `${c.package_name}${c.package_price ? ` · ${formatAED(c.package_price)}` : ''}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <ClientRowActions id={c.id} status={c.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild disabled={page <= 1}>
              <Link href={pageHref(page - 1)} aria-disabled={page <= 1}>
                Previous
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild disabled={page >= totalPages}>
              <Link href={pageHref(page + 1)} aria-disabled={page >= totalPages}>
                Next
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
