'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, addMonths, format, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { weekDays } from '@/lib/utils/dates';
import { TimeGrid, type CalendarSession } from './time-grid';
import { MonthCalendar } from './month-calendar';
import { SessionDialog, type EditableSession } from './session-dialog';

export type ScheduleView = 'day' | 'week' | 'month';

export function ScheduleViews({
  view,
  focus,
  sessions,
  clients,
  defaultClientId,
}: {
  view: ScheduleView;
  focus: string;
  sessions: CalendarSession[];
  clients: { id: string; full_name: string }[];
  defaultClientId?: string;
}) {
  const router = useRouter();
  const focusDate = parseISO(focus);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EditableSession | null>(null);
  const [createDefaults, setCreateDefaults] = useState<{ date: string; time: string }>();

  function navTo(v: ScheduleView, d: Date) {
    router.push(`/schedule?view=${v}&date=${format(d, 'yyyy-MM-dd')}`);
  }
  function shift(dir: number) {
    const next =
      view === 'day'
        ? addDays(focusDate, dir)
        : view === 'week'
          ? addDays(focusDate, dir * 7)
          : addMonths(focusDate, dir);
    navTo(view, next);
  }
  function openCreate(date: Date, time: string) {
    setEditing(null);
    setCreateDefaults({ date: format(date, 'yyyy-MM-dd'), time });
    setDialogOpen(true);
  }
  function openEdit(s: CalendarSession) {
    setCreateDefaults(undefined);
    setEditing({
      id: s.id,
      client_id: s.client_id,
      starts_at: s.starts_at,
      ends_at: s.ends_at,
      title: s.title,
      location: s.location,
      notes: s.notes,
      status: s.status,
    });
    setDialogOpen(true);
  }

  const days = view === 'day' ? [focusDate] : weekDays(focusDate);
  const label =
    view === 'day'
      ? format(focusDate, 'EEEE, d MMM yyyy')
      : view === 'week'
        ? `${format(days[0], 'd MMM')} – ${format(days[6], 'd MMM yyyy')}`
        : format(focusDate, 'MMMM yyyy');

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => shift(-1)} aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => shift(1)} aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navTo(view, new Date())}>
            Today
          </Button>
          <span className="ml-1 text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border p-0.5">
            {(['day', 'week', 'month'] as ScheduleView[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => navTo(v, focusDate)}
                className={cn(
                  'rounded px-2.5 py-1 text-sm font-medium capitalize transition-colors',
                  view === v
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => openCreate(focusDate, '09:00')}>
            <Plus className="mr-2 h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      {view === 'month' ? (
        <MonthCalendar
          focus={focusDate}
          sessions={sessions}
          onDayClick={(d) => navTo('day', d)}
          onSessionClick={openEdit}
        />
      ) : (
        <TimeGrid
          days={days}
          sessions={sessions}
          onSlotClick={(d, t) => openCreate(d, t)}
          onSessionClick={openEdit}
        />
      )}

      <SessionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clients={clients}
        session={editing}
        defaultDate={createDefaults?.date}
        defaultTime={createDefaults?.time}
        defaultClientId={defaultClientId}
      />
    </div>
  );
}
