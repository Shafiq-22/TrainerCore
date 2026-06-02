'use client';

import { startOfMonth, startOfWeek, addDays, format, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { formatClock, type CalendarSession } from './time-grid';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthCalendar({
  focus,
  sessions,
  onDayClick,
  onSessionClick,
}: {
  focus: Date;
  sessions: CalendarSession[];
  onDayClick: (d: Date) => void;
  onSessionClick: (s: CalendarSession) => void;
}) {
  const gridStart = startOfWeek(startOfMonth(focus), { weekStartsOn: 0 });
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="grid grid-cols-7 border-b text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d) => {
          const ds = format(d, 'yyyy-MM-dd');
          const inMonth = isSameMonth(d, focus);
          const isToday = ds === todayStr;
          const items = sessions
            .filter((s) => s.starts_at.slice(0, 10) === ds)
            .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
          return (
            <div
              key={ds}
              className={cn(
                'min-h-[96px] border-b border-l p-1 align-top',
                !inMonth && 'bg-muted/30 text-muted-foreground',
              )}
            >
              <button
                type="button"
                onClick={() => onDayClick(d)}
                className={cn(
                  'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs',
                  isToday && 'bg-accent font-semibold text-accent-foreground',
                )}
              >
                {format(d, 'd')}
              </button>
              <div className="space-y-0.5">
                {items.slice(0, 3).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSessionClick(s)}
                    style={{ backgroundColor: `${s.clientColor}1A`, borderColor: s.clientColor }}
                    className={cn(
                      'block w-full truncate rounded border-l-2 px-1 py-0.5 text-left text-[11px]',
                      s.status === 'canceled' && 'line-through opacity-50',
                    )}
                  >
                    {formatClock(s.starts_at)} {s.clientName}
                  </button>
                ))}
                {items.length > 3 && (
                  <button
                    type="button"
                    onClick={() => onDayClick(d)}
                    className="px-1 text-[11px] text-muted-foreground hover:underline"
                  >
                    +{items.length - 3} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
