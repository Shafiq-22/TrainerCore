'use client';

import { useTransition } from 'react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { PLAN_ORDER, PLANS, PLAN_LIMITS } from '@/lib/plans/limits';
import { formatAED } from '@/lib/utils/money';
import {
  createCheckoutSessionAction,
  createPortalSessionAction,
} from '@/app/(app)/subscription/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import type { PlanTier } from '@/types';

export function SubscriptionPlans({ currentPlan }: { currentPlan: PlanTier }) {
  const [pending, start] = useTransition();

  function choose(plan: PlanTier) {
    start(async () => {
      const res = await createCheckoutSessionAction(plan);
      if (res.ok && res.data) window.location.href = res.data.url;
      else if (!res.ok) toast.error(res.error);
    });
  }

  function portal() {
    start(async () => {
      const res = await createPortalSessionAction();
      if (res.ok && res.data) window.location.href = res.data.url;
      else if (!res.ok) toast.error(res.error);
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {PLAN_ORDER.map((tier) => {
          const p = PLANS[tier];
          const current = currentPlan === tier;
          const popular = tier === 'pro';
          return (
            <Card key={tier} className={cn('relative', popular && 'border-accent shadow-sm')}>
              {popular && (
                <Badge className="absolute -top-2 left-4" variant="success">
                  Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-baseline justify-between">
                  <span>{p.name}</span>
                  <span className="text-2xl font-bold">{formatAED(p.priceAed)}</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {PLAN_LIMITS[tier] === Infinity
                    ? 'Unlimited clients'
                    : `Up to ${PLAN_LIMITS[tier]} clients`}{' '}
                  · per month
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={current ? 'outline' : popular ? 'default' : 'secondary'}
                  disabled={current || pending}
                  onClick={() => choose(tier)}
                >
                  {current ? 'Current plan' : `Choose ${p.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="flex justify-center">
        <Button variant="outline" onClick={portal} disabled={pending}>
          Manage billing & payment method
        </Button>
      </div>
    </div>
  );
}
