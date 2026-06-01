import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Receipt, Wallet, Clock, FileEdit } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireTrainer } from '@/lib/auth/require-trainer';
import { formatAED } from '@/lib/utils/money';
import { formatDate } from '@/lib/utils/dates';
import { startOfMonth, isSameMonth, parseISO } from 'date-fns';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const metadata: Metadata = { title: 'Billing' };

interface InvoiceRow {
  id: string;
  invoice_number: string;
  total: number;
  status: string;
  issue_date: string;
  due_date: string | null;
  paid_at: string | null;
  clients: { full_name: string } | { full_name: string }[] | null;
}

function effectiveStatus(status: string, dueDate: string | null): string {
  const today = new Date().toISOString().slice(0, 10);
  if (status === 'sent' && dueDate && dueDate < today) return 'overdue';
  return status;
}

export default async function BillingPage() {
  await requireTrainer();
  const supabase = createClient();
  const { data } = await supabase
    .from('invoices')
    .select('id,invoice_number,total,status,issue_date,due_date,paid_at,clients(full_name)')
    .order('issue_date', { ascending: false });
  const invoices = (data ?? []) as InvoiceRow[];

  const monthStart = startOfMonth(new Date());
  const outstanding = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((s, i) => s + Number(i.total), 0);
  const paidThisMonth = invoices
    .filter((i) => i.status === 'paid' && i.paid_at && isSameMonth(parseISO(i.paid_at), monthStart))
    .reduce((s, i) => s + Number(i.total), 0);
  const draftCount = invoices.filter((i) => i.status === 'draft').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Create and track invoices with UAE VAT."
        action={
          <Button asChild>
            <Link href="/billing/new">
              <Plus className="mr-2 h-4 w-4" />
              New invoice
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard title="Outstanding" value={formatAED(outstanding)} icon={Clock} accent />
        <KpiCard title="Paid this month" value={formatAED(paidThisMonth)} icon={Wallet} />
        <KpiCard title="Drafts" value={draftCount} icon={FileEdit} />
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No invoices yet"
          description="Create your first invoice to start getting paid."
          action={
            <Button asChild>
              <Link href="/billing/new">Create invoice</Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead className="hidden sm:table-cell">Client</TableHead>
                <TableHead className="hidden md:table-cell">Issued</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => {
                const client = Array.isArray(inv.clients) ? inv.clients[0] : inv.clients;
                return (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <Link href={`/billing/${inv.id}`} className="font-medium hover:underline">
                        {inv.invoice_number}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {client?.full_name ?? '—'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {formatDate(inv.issue_date)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={effectiveStatus(inv.status, inv.due_date)} />
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatAED(inv.total)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
