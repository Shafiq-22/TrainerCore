'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { SessionDialog, type EditableSession } from './session-dialog';
import { SCHEDULE_START_HOUR, SCHEDULE_END_HOUR, WEEKDAY_SHORT } from '@/lib/utils/dates';

export interface CalendarSession {
  id: string;
  client_id: string;
  clientName: string;
  clientColor: string;
  starts_at: string;
  ends_at: string;
  title: string | null;
  location: string | null;
  notes: string | null;
  status: string;
}

const HOUR_PX = 56;
const HOURS = Array.from(
  { length: SCHEDULE_END_HOUR - SCHEDULE_START_HOUR },
  (_, i) => SCHEDULE_START_HOUR + i,
);

function formatHour(h: number) {
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour} ${period}`;
}
function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

export function WeekCalendar({
  weekStart,
  sessions,
  clients,
  defaultClientId,
}: {
  weekStart: string; // YYYY-MM-DD (Sunday)
  sessions: CalendarSession[];
  clients: { id: string; full_name: string }[];
  defaultClientId?: string;
}) {
  const router = useRouter();
  const start = parseISO(weekStart);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const todayStr = new Date().toISOString().slice(0, 10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EditableSession | null>(null);
  const [createDefaults, setCreateDefaults] = useState<{ date: string; time: string }>();

  function go(deltaDays: number) {
    router.push(`/schedule?week=${format(addDays(start, deltaDays), 'yyyy-MM-dd')}`);
  }

  function openCreate(dayDate: Date, e: React.MouseEvent<HTMLDivElement>) {
    const offsetY = e.nativeEvent.offsetY;
    const rawHour = SCHEDULE_START_HOUR + offsetY / HOUR_PX;
    const hour = Math.floor(rawHour);
    const minute = rawHour - hour >= 0.5 ? 30 : 0;
    setEditing(null);
    setCreateDefaults({
      date: format(dayDate, 'yyyy-MM-dd'),
      time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    });
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => go(-7)} aria-label="Previous week">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => go(7)} aria-label="Next week">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/schedule')}>
            Today
          </Button>
          <span className="ml-2 text-sm font-medium">
            {format(days[0], 'd MMM')} – {format(days[6], 'd MMM yyyy')}
          </span>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setCreateDefaults({ date: todayStr, time: '09:00' });
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New session
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <div className="min-w-[720px]">
          {/* Header */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b">
            <div />
            {days.map((d) => {
              const isToday = format(d, 'yyyy-MM-dd') === todayStr;
              return (
                <div
                  key={d.toISOString()}
                  className={cn('py-2 text-center', isToday && 'bg-accent/5')}
                >
                  <p className="text-xs text-muted-foreground">{WEEKDAY_SHORT[d.getDay()]}</p>
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      isToday && 'text-accent',
                    )}
                  >
                    {format(d, 'd')}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Body */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)]">
            {/* Hour gutter */}
            <div>
              {HOURS.map((h) => (
                <div
                  key={h}
                  style={{ height: HOUR_PX }}
                  className="relative -top-2 pr-2 text-right text-[11px] text-muted-foreground"
                >
                  {formatHour(h)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((d) => {
              const dayStr = format(d, 'yyyy-MM-dd');
              const isToday = dayStr === todayStr;
              const daySessions = sessions.filter(
                (s) => s.starts_at.slice(0, 10) === dayStr,
              );
              return (
                <div
                  key={dayStr}
                  className={cn('relative border-l', isToday && 'bg-accent/5')}
                  style={{ height: HOURS.length * HOUR_PX }}
                  onClick={(e) => openCreate(d, e)}
                >
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      style={{ height: HOUR_PX }}
                      className="border-b border-dashed border-border/60"
                    />
                  ))}

                  {daySessions.map((s) => {
                    const startDate = new Date(s.starts_at);
                    const endDate = new Date(s.ends_at);
                    const startH = startDate.getUTCHours() + startDate.getUTCMinutes() / 60;
                    const durH = (endDate.getTime() - startDate.getTime()) / 3600000;
                    const top = (startH - SCHEDULE_START_HOUR) * HOUR_PX;
                    const height = Math.max(durH * HOUR_PX - 2, 22);
                    const cancelled = s.status === 'canceled';
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(s);
                        }}
                        style={{
                          top,
                          height,
                          borderColor: s.clientColor,
                          backgroundColor: `${s.clientColor}1A`,
                        }}
                        className={cn(
                          'absolute inset-x-1 overflow-hidden rounded-md border-l-4 px-2 py-1 text-left text-xs',
                          cancelled && 'opacity-50 line-through',
                        )}
                      >
                        <p className="truncate font-semibold">{s.clientName}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {formatClock(s.starts_at)}
                          {s.title ? ` · ${s.title}` : ''}
                        </p>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
