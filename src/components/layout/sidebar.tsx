import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { NavLinks } from './nav-links';
import { PLANS } from '@/lib/plans/limits';
import type { PlanTier } from '@/types';

export function Sidebar({ plan }: { plan: PlanTier }) {
  const planMeta = PLANS[plan];
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-card lg:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <NavLinks />
      </div>
      <div className="border-t p-4">
        <Link
          href="/subscription"
          className="block rounded-lg border bg-muted/40 p-3 transition-colors hover:bg-muted"
        >
          <p className="text-xs text-muted-foreground">Current plan</p>
          <p className="text-sm font-semibold">{planMeta.name}</p>
          <p className="mt-1 text-xs font-medium text-accent">Manage subscription →</p>
        </Link>
      </div>
    </aside>
  );
}
