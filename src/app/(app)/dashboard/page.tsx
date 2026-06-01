import type { Metadata } from 'next';
import {
  Users,
  CalendarCheck,
  Wallet,
  ReceiptText,
  Activity,
} from 'lucide-react';
import {
  startOfMonth,
  subMonths,
  subDays,
  format,
  isSameMonth,
  parseISO,
} from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import { requireTrainer } from '@/lib/auth/require-trainer';
import { weekStart, weekEnd } from '@/lib/utils/dates';
import { formatAED } from '@/lib/utils/money';
import { PageHeader } from '@/components/shared/page-header';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueChart, type RevenuePoint } from '@/components/dashboard/revenue-chart';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { AttentionList, type AttentionItem } from '@/components/dashboard/attention-list';
import type { NotificationRow } from '@/types';

export const metadata: Metadata = { title: 'Dashboard' };

interface InvoiceLite {
  id: string;
  invoice_number: string;
  total: number;
  status: string;
  paid_at: string | null;
  due_date: string | null;
  client_id: string;
}
interface ClientLite {
  id: string;
  full_name: string;
  status: string;
  start_date: string;
}

async function getData() {
  const supabase = createClient();
  const now = new Date();
  const ws = weekStart(now).toISOString();
  const we = weekEnd(now).toISOString();
  const monthStart = startOfMonth(now);
  const sixStart = startOfMonth(subMonths(now, 5));
  const in24 = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
  const since14 = subDays(now, 14).toISOString();
  const today = now.toISOString().slice(0, 10);

  const [
    clientsRes,
    sessionsWeekRes,
    invoicesRes,
    checkinsRes,
    notificationsRes,
    recentCheckinRes,
    upcomingRes,
  ] = await Promise.all([
    supabase.from('clients').select('id,full_name,status,start_date'),
    supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .gte('starts_at', ws)
      .lte('starts_at', we),
    supabase.from('invoices').select('id,invoice_number,total,status,paid_at,due_date,client_id'),
    supabase.from('checkins').select('status').gte('requested_for', format(subDays(now, 56), 'yyyy-MM-dd')),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(8),
    supabase.from('checkins').select('client_id').eq('status', 'completed').gte('completed_at', since14),
    supabase
      .from('sessions')
      .select('id,title,starts_at,client_id')
      .eq('status', 'scheduled')
      .gte('starts_at', now.toISOString())
      .lte('starts_at', in24)
      .order('starts_at'),
  ]);

  const clients = (clientsRes.data ?? []) as ClientLite[];
  const invoices = (invoicesRes.data ?? []) as InvoiceLite[];
  const checkins = checkinsRes.data ?? [];
  const recentCheckinClientIds = new Set(
    (recentCheckinRes.data ?? []).map((c) => c.client_id),
  );
  const clientName = (id: string) =>
    clients.find((c) => c.id === id)?.full_name ?? 'Client';

  const activeClients = clients.filter((c) => c.status === 'active').length;

  const revenueThisMonth = invoices
    .filter((i) => i.status === 'paid' && i.paid_at && isSameMonth(parseISO(i.paid_at), monthStart))
    .reduce((sum, i) => sum + Number(i.total), 0);

  const pending = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue');
  const pendingTotal = pending.reduce((sum, i) => sum + Number(i.total), 0);

  const totalCheckins = checkins.length;
  const completedCheckins = checkins.filter((c) => c.status === 'completed').length;
  const responseRate = totalCheckins > 0 ? Math.round((completedCheckins / totalCheckins) * 100) : 0;

  // Revenue chart: last 6 months of paid invoices
  const buckets: RevenuePoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const m = subMonths(now, i);
    const revenue = invoices
      .filter((inv) => inv.status === 'paid' && inv.paid_at && isSameMonth(parseISO(inv.paid_at), m))
      .reduce((sum, inv) => sum + Number(inv.total), 0);
    buckets.push({ month: format(m, 'MMM'), revenue });
  }

  // Attention items
  const attention: AttentionItem[] = [];
  for (const c of clients) {
    if (
      c.status === 'active' &&
      !recentCheckinClientIds.has(c.id) &&
      c.start_date <= format(subDays(now, 14), 'yyyy-MM-dd')
    ) {
      attention.push({
        id: `checkin-${c.id}`,
        kind: 'checkin',
        title: c.full_name,
        detail: 'No check-in in the last 14 days',
        href: `/clients/${c.id}/progress`,
      });
    }
  }
  for (const inv of invoices) {
    if ((inv.status === 'sent' || inv.status === 'overdue') && inv.due_date && inv.due_date < today) {
      attention.push({
        id: `invoice-${inv.id}`,
        kind: 'invoice',
        title: `Invoice ${inv.invoice_number} overdue`,
        detail: `${clientName(inv.client_id)} · ${formatAED(inv.total)}`,
        href: `/billing/${inv.id}`,
      });
    }
  }
  for (const s of upcomingRes.data ?? []) {
    attention.push({
      id: `session-${s.id}`,
      kind: 'session',
      title: `Session with ${clientName(s.client_id)}`,
      detail: `${format(parseISO(s.starts_at), 'EEE d MMM, h:mm a')}`,
      href: '/schedule',
    });
  }

  return {
    activeClients,
    sessionsThisWeek: sessionsWeekRes.count ?? 0,
    revenueThisMonth,
    pendingCount: pending.length,
    pendingTotal,
    responseRate,
    revenue: buckets,
    notifications: (notificationsRes.data ?? []) as NotificationRow[],
    attention: attention.slice(0, 8),
  };
}

export default async function DashboardPage() {
  const trainer = await requireTrainer();
  const d = await getData();
  const firstName = (trainer.full_name ?? '').split(' ')[0] || 'there';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's how your business is doing this week."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard title="Active clients" value={d.activeClients} icon={Users} accent />
        <KpiCard title="Sessions this week" value={d.sessionsThisWeek} icon={CalendarCheck} />
        <KpiCard title="Revenue this month" value={formatAED(d.revenueThisMonth)} icon={Wallet} accent />
        <KpiCard
          title="Pending invoices"
          value={d.pendingCount}
          icon={ReceiptText}
          hint={d.pendingTotal > 0 ? formatAED(d.pendingTotal) : undefined}
        />
        <KpiCard title="Check-in response" value={`${d.responseRate}%`} icon={Activity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={d.revenue} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
          </CardHeader>
          <CardContent>
            <AttentionList items={d.attention} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed items={d.notifications} />
        </CardContent>
      </Card>
    </div>
  );
}
