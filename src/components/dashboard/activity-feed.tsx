import { formatDistanceToNow } from 'date-fns';
import {
  ClipboardCheck,
  CalendarClock,
  Receipt,
  Bell,
  type LucideIcon,
} from 'lucide-react';
import type { NotificationRow, NotificationType } from '@/types';

const ICONS: Record<NotificationType, LucideIcon> = {
  checkin: ClipboardCheck,
  session_reminder: CalendarClock,
  invoice_sent: Receipt,
  invoice_reminder: Receipt,
  system: Bell,
};

export function ActivityFeed({ items }: { items: NotificationRow[] }) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No activity yet. Actions like sent invoices and check-ins will appear here.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((n) => {
        const Icon = ICONS[n.type] ?? Bell;
        return (
          <li key={n.id} className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug">
                {n.title ?? n.body ?? 'Activity'}
              </p>
              {n.title && n.body && (
                <p className="truncate text-xs text-muted-foreground">{n.body}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
