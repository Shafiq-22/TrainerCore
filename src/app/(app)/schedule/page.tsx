import type { Metadata } from 'next';
import { startOfMonth, startOfWeek, startOfDay, addDays, parseISO, format } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import { requireTrainer } from '@/lib/auth/require-trainer';
import { weekStart } from '@/lib/utils/dates';
import { PageHeader } from '@/components/shared/page-header';
import { ScheduleViews, type ScheduleView } from '@/components/schedule/schedule-views';
import { MiniCalendar } from '@/components/schedule/mini-calendar';
import type { CalendarSession } from '@/components/schedule/time-grid';

export const metadata: Metadata = { title: 'Schedule' };

function parseView(v?: string): ScheduleView {
  return v === 'day' || v === 'month' ? v : 'week';
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: { view?: string; date?: string; client?: string };
}) {
  await requireTrainer();
  const supabase = createClient();

  const view = parseView(searchParams.view);
  const focus = searchParams.date ? parseISO(searchParams.date) : new Date();

  let rangeStart: Date;
  let rangeEnd: Date;
  if (view === 'day') {
    rangeStart = startOfDay(focus);
    rangeEnd = addDays(rangeStart, 1);
  } else if (view === 'week') {
    rangeStart = weekStart(focus);
    rangeEnd = addDays(rangeStart, 7);
  } else {
    rangeStart = startOfWeek(startOfMonth(focus), { weekStartsOn: 0 });
    rangeEnd = addDays(rangeStart, 42);
  }

  const startISO = `${format(rangeStart, 'yyyy-MM-dd')}T00:00:00.000Z`;
  const endISO = `${format(rangeEnd, 'yyyy-MM-dd')}T00:00:00.000Z`;

  const [sessionsRes, clientsRes] = await Promise.all([
    supabase
      .from('sessions')
      .select(
        'id,client_id,starts_at,ends_at,title,location,notes,status,clients(full_name,color)',
      )
      .gte('starts_at', startISO)
      .lt('starts_at', endISO)
      .order('starts_at'),
    supabase.from('clients').select('id,full_name,color').eq('status', 'active').order('full_name'),
  ]);

  const sessions: CalendarSession[] = (sessionsRes.data ?? []).map((s) => {
    const c = (Array.isArray(s.clients) ? s.clients[0] : s.clients) as
      | { full_name: string; color: string }
      | null;
    return {
      id: s.id,
      client_id: s.client_id,
      clientName: c?.full_name ?? 'Client',
      clientColor: c?.color ?? '#22C55E',
      starts_at: s.starts_at,
      ends_at: s.ends_at,
      title: s.title,
      location: s.location,
      notes: s.notes,
      status: s.status,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Schedule" description="Plan and track your training sessions." />
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <ScheduleViews
          view={view}
          focus={format(focus, 'yyyy-MM-dd')}
          sessions={sessions}
          clients={clientsRes.data ?? []}
          defaultClientId={searchParams.client}
        />
        <div className="hidden lg:block">
          <MiniCalendar selected={format(focus, 'yyyy-MM-dd')} view={view} />
        </div>
      </div>
    </div>
  );
}
