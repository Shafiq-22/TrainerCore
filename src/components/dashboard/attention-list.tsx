import Link from 'next/link';
import { AlertTriangle, Clock, Receipt, ClipboardX, type LucideIcon } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

export interface AttentionItem {
  id: string;
  kind: 'checkin' | 'invoice' | 'session';
  title: string;
  detail: string;
  href: string;
}

const ICONS: Record<AttentionItem['kind'], LucideIcon> = {
  checkin: ClipboardX,
  invoice: Receipt,
  session: Clock,
};

export function AttentionList({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="All clear"
        description="No clients need your attention right now."
        className="border-0 bg-transparent py-8"
      />
    );
  }

  return (
    <ul className="divide-y">
      {items.map((item) => {
        const Icon = ICONS[item.kind];
        return (
          <li key={item.id}>
            <Link
              href={item.href}
              className="flex items-center gap-3 py-3 transition-colors hover:bg-muted/40"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/10">
                <Icon className="h-4 w-4 text-warning" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
