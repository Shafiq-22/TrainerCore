import {
  LayoutDashboard,
  Users,
  Dumbbell,
  CalendarDays,
  Receipt,
  ClipboardCheck,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { PlanTier } from '@/types';

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/clients', labelKey: 'nav.clients', icon: Users },
  { href: '/plans', labelKey: 'nav.plans', icon: Dumbbell },
  { href: '/schedule', labelKey: 'nav.schedule', icon: CalendarDays },
  { href: '/billing', labelKey: 'nav.billing', icon: Receipt },
  { href: '/checkins', labelKey: 'nav.checkins', icon: ClipboardCheck },
  { href: '/settings', labelKey: 'nav.settings', icon: Settings },
];

/** Primary destinations shown in the mobile bottom navigation. */
export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/clients', labelKey: 'nav.clients', icon: Users },
  { href: '/schedule', labelKey: 'nav.schedule', icon: CalendarDays },
  { href: '/billing', labelKey: 'nav.billing', icon: Receipt },
];

export interface NavTrainer {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  plan: PlanTier;
  businessName: string | null;
}

export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(`${href}/`);
}
