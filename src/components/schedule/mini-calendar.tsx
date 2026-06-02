'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import type { ScheduleView } from './schedule-views';

export function MiniCalendar({ selected, view }: { selected: string; view: ScheduleView }) {
  const router = useRouter();
  return (
    <Calendar
      mode="single"
      selected={new Date(`${selected}T00:00:00`)}
      onSelect={(d) => {
        if (d) router.push(`/schedule?view=${view}&date=${format(d, 'yyyy-MM-dd')}`);
      }}
      weekStartsOn={0}
      className="rounded-lg border bg-card p-3"
    />
  );
}
