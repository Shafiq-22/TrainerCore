'use client';

import { useRouter } from 'next/navigation';
import { startOfWeek, format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

export function MiniCalendar({ selected }: { selected: string }) {
  const router = useRouter();
  return (
    <Calendar
      mode="single"
      selected={new Date(`${selected}T00:00:00`)}
      onSelect={(d) => {
        if (d) {
          const sunday = startOfWeek(d, { weekStartsOn: 0 });
          router.push(`/schedule?week=${format(sunday, 'yyyy-MM-dd')}`);
        }
      }}
      weekStartsOn={0}
      className="rounded-lg border bg-card p-3"
    />
  );
}
