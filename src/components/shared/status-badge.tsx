import { Badge } from '@/components/ui/badge';

type Variant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

const STATUS_MAP: Record<string, { variant: Variant; label: string }> = {
  // Client status
  active: { variant: 'success', label: 'Active' },
  inactive: { variant: 'secondary', label: 'Inactive' },
  archived: { variant: 'outline', label: 'Archived' },
  // Invoice status
  draft: { variant: 'secondary', label: 'Draft' },
  sent: { variant: 'default', label: 'Sent' },
  paid: { variant: 'success', label: 'Paid' },
  overdue: { variant: 'destructive', label: 'Overdue' },
  // Session status
  scheduled: { variant: 'default', label: 'Scheduled' },
  completed: { variant: 'success', label: 'Completed' },
  canceled: { variant: 'outline', label: 'Canceled' },
  // Subscription status
  trialing: { variant: 'warning', label: 'Trial' },
  past_due: { variant: 'destructive', label: 'Past due' },
  incomplete: { variant: 'warning', label: 'Incomplete' },
  // Check-in status
  pending: { variant: 'warning', label: 'Pending' },
  expired: { variant: 'outline', label: 'Expired' },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_MAP[status] ?? { variant: 'secondary' as Variant, label: status };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
