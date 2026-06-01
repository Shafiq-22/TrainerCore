import type { Metadata } from 'next';
import { startOfWeek, parseISO, format, addDays } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import { requireTrainer } from '@/lib/auth/require-trainer';
import { PageHeader } from '@/components/shared/page-header';
import { WeekCalendar, type CalendarSession } from '@/components/schedule/week-calendar';
import { MiniCalendar } from '@/components/schedule/mini-calendar';

export const metadata: Metadata = { title: 'Schedule' };

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: { week?: string; client?: string };
}) {
  await requireTrainer();
  const supabase = createClient();

  const baseDate = searchParams.week ? parseISO(searchParams.week) : new Date();
  const sundayDate = startOfWeek(baseDate, { weekStartsOn: 0 });
  const sunday = format(sundayDate, 'yyyy-MM-dd');
  const weekEnd = format(addDays(sundayDate, 7), 'yyyy-MM-dd');

  const [sessionsRes, clientsRes] = await Promise.all([
    supabase
      .from('sessions')
      .select(
        'id,client_id,starts_at,ends_at,title,location,notes,status,clients(full_name,color)',
      )
      .gte('starts_at', `${sunday}T00:00:00.000Z`)
      .lt('starts_at', `${weekEnd}T00:00:00.000Z`)
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
        <WeekCalendar
          weekStart={sunday}
          sessions={sessions}
          clients={clientsRes.data ?? []}
          defaultClientId={searchParams.client}
        />
        <div className="hidden lg:block">
          <MiniCalendar selected={sunday} />
        </div>
      </div>
    </div>
  );
}
