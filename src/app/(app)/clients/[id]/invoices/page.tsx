import Link from 'next/link';
import { Plus, ReceiptText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatAED } from '@/lib/utils/money';
import { formatDate } from '@/lib/utils/dates';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Invoice } from '@/types';

export default async function ClientInvoicesPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', params.id)
    .order('issue_date', { ascending: false });
  const invoices = (data ?? []) as Invoice[];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild size="sm">
          <Link href={`/billing/new?client=${params.id}`}>
            <Plus className="mr-2 h-4 w-4" />
            New invoice
          </Link>
        </Button>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No invoices yet"
          description="Create an invoice for this client to get paid."
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead className="hidden sm:table-cell">Issued</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <Link href={`/billing/${inv.id}`} className="font-medium hover:underline">
                      {inv.invoice_number}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {formatDate(inv.issue_date)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatAED(inv.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
