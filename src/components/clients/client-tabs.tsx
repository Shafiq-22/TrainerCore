'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const TABS = [
  { label: 'Overview', seg: '' },
  { label: 'Progress', seg: '/progress' },
  { label: 'Plan', seg: '/plan' },
  { label: 'Sessions', seg: '/sessions' },
  { label: 'Invoices', seg: '/invoices' },
];

export function ClientTabs({ id }: { id: string }) {
  const pathname = usePathname();
  const base = `/clients/${id}`;

  return (
    <div className="border-b">
      <nav className="-mb-px flex gap-1 overflow-x-auto">
        {TABS.map((t) => {
          const href = `${base}${t.seg}`;
          const active = t.seg === '' ? pathname === base : pathname === href;
          return (
            <Link
              key={t.label}
              href={href}
              className={cn(
                'whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'border-accent text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
