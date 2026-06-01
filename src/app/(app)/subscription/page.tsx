import type { Metadata } from 'next';
import { Info } from 'lucide-react';
import { requireTrainer } from '@/lib/auth/require-trainer';
import { checkClientLimit } from '@/lib/plans/client-limit-guard';
import { isStripeConfigured } from '@/lib/env';
import { PLANS } from '@/lib/plans/limits';
import { formatDate } from '@/lib/utils/dates';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { SubscriptionPlans } from '@/components/subscription/subscription-plans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const metadata: Metadata = { title: 'Subscription' };

export default async function SubscriptionPage() {
  const trainer = await requireTrainer();
  const limit = await checkClientLimit();
  const planMeta = PLANS[trainer.plan];
  const usagePct =
    limit.limit === Infinity ? 0 : Math.min(100, Math.round((limit.current / limit.limit) * 100));

  return (
    <div className="space-y-6">
      <PageHeader title="Subscription" description="Manage your plan, usage and billing." />

      {!isStripeConfigured && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p>
            Billing is in demo mode. Add your Stripe keys (see the README) to enable real
            checkout and subscription management. Your plan is currently set locally.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-2xl font-bold">{planMeta.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={trainer.subscription_status} />
                {trainer.subscription_status === 'trialing' && trainer.trial_ends_at && (
                  <span className="text-xs text-muted-foreground">
                    Trial ends {formatDate(trainer.trial_ends_at)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Client usage</span>
              <span className="font-medium">
                {limit.current} / {limit.limit === Infinity ? '∞' : limit.limit}
              </span>
            </div>
            <Progress value={usagePct} />
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Available plans</h2>
        <SubscriptionPlans currentPlan={trainer.plan} />
      </div>
    </div>
  );
}
