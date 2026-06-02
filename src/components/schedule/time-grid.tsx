'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
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
export function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

export function TimeGrid({
  days,
  sessions,
  onSlotClick,
  onSessionClick,
}: {
  days: Date[];
  sessions: CalendarSession[];
  onSlotClick: (day: Date, time: string) => void;
  onSessionClick: (s: CalendarSession) => void;
}) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const cols = `56px repeat(${days.length}, minmax(0, 1fr))`;

  function slotClick(dayDate: Date, e: React.MouseEvent<HTMLDivElement>) {
    const rawHour = SCHEDULE_START_HOUR + e.nativeEvent.offsetY / HOUR_PX;
    const hour = Math.floor(rawHour);
    const minute = rawHour - hour >= 0.5 ? 30 : 0;
    onSlotClick(dayDate, `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <div className={days.length > 1 ? 'min-w-[720px]' : ''}>
        <div className="grid border-b" style={{ gridTemplateColumns: cols }}>
          <div />
          {days.map((d) => {
            const isToday = format(d, 'yyyy-MM-dd') === todayStr;
            return (
              <div key={d.toISOString()} className={cn('py-2 text-center', isToday && 'bg-accent/5')}>
                <p className="text-xs text-muted-foreground">{WEEKDAY_SHORT[d.getDay()]}</p>
                <p className={cn('text-sm font-semibold', isToday && 'text-accent')}>
                  {format(d, 'd')}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid" style={{ gridTemplateColumns: cols }}>
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

          {days.map((d) => {
            const dayStr = format(d, 'yyyy-MM-dd');
            const isToday = dayStr === todayStr;
            const daySessions = sessions.filter((s) => s.starts_at.slice(0, 10) === dayStr);
            return (
              <div
                key={dayStr}
                className={cn('relative border-l', isToday && 'bg-accent/5')}
                style={{ height: HOURS.length * HOUR_PX }}
                onClick={(e) => slotClick(d, e)}
              >
                {HOURS.map((h) => (
                  <div key={h} style={{ height: HOUR_PX }} className="border-b border-dashed border-border/60" />
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
                        onSessionClick(s);
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
  );
}
