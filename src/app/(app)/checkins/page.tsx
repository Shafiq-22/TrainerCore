import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { requireTrainer } from '@/lib/auth/require-trainer';
import { formatDate } from '@/lib/utils/dates';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckinConfigForm } from '@/components/checkins/checkin-config-form';
import { CheckinClients } from '@/components/checkins/checkin-clients';

export const metadata: Metadata = { title: 'Check-ins' };

interface CheckinRow {
  id: string;
  status: string;
  requested_for: string;
  energy: number | null;
  sleep: number | null;
  nutrition: number | null;
  stress: number | null;
  weight_kg: number | null;
  clients: { full_name: string } | { full_name: string }[] | null;
}

export default async function CheckinsPage() {
  const trainer = await requireTrainer();
  const supabase = createClient();

  const [clientsRes, responsesRes] = await Promise.all([
    supabase.from('clients').select('id,full_name,phone').eq('status', 'active').order('full_name'),
    supabase
      .from('checkins')
      .select('id,status,requested_for,energy,sleep,nutrition,stress,weight_kg,clients(full_name)')
      .order('requested_for', { ascending: false })
      .limit(30),
  ]);

  const responses = (responsesRes.data ?? []) as CheckinRow[];

  return (
    <div className="space-y-6">
      <PageHeader title="Check-ins" description="Weekly client check-ins and responses." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckinConfigForm
              dayOfWeek={trainer.checkin_day_of_week}
              enabled={trainer.checkin_enabled}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send a check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckinClients clients={clientsRes.data ?? []} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent responses</CardTitle>
        </CardHeader>
        <CardContent>
          {responses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No check-ins yet. Send one to a client to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Week</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">E / S / N / St</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((r) => {
                  const client = Array.isArray(r.clients) ? r.clients[0] : r.clients;
                  const scores =
                    r.status === 'completed'
                      ? `${r.energy ?? '–'} / ${r.sleep ?? '–'} / ${r.nutrition ?? '–'} / ${r.stress ?? '–'}`
                      : '—';
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{client?.full_name ?? 'Client'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(r.requested_for)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {scores}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {r.weight_kg ? `${r.weight_kg} kg` : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
