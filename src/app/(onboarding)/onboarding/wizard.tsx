'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { useOnboardingStore } from '@/stores/onboarding-store';
import {
  saveProfileStep,
  saveBusinessStep,
  selectPlanStep,
  completeOnboarding,
} from './actions';
import { PLANS, PLAN_ORDER } from '@/lib/plans/limits';
import { formatAED } from '@/lib/utils/money';
import { cn } from '@/lib/utils/cn';
import type { ActionResult, PlanTier } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { AvatarUpload } from '@/components/shared/avatar-upload';

const STEPS = ['Profile', 'Business', 'Plan', 'First client'];

interface InitialData {
  fullName: string;
  phone: string;
  avatarUrl: string;
  businessName: string;
  vatNumber: string;
  vatRegistered: boolean;
  plan: PlanTier;
}

export function OnboardingWizard({
  initial,
  userId,
}: {
  initial: InitialData;
  userId: string;
}) {
  const router = useRouter();
  const { step, data, setStep, next, prev, update } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    update(initial);
    setStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run(action: () => Promise<ActionResult>, onSuccess: () => void) {
    setLoading(true);
    const res = await action();
    setLoading(false);
    if (res.ok) onSuccess();
    else toast.error(res.error);
  }

  const initials = (data.fullName || 'TC').slice(0, 2).toUpperCase();

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">
            Step {step} of 4
          </span>
          <span className="text-muted-foreground">{STEPS[step - 1]}</span>
        </div>
        <Progress value={(step / 4) * 100} className="h-2" />
        <CardTitle className="pt-4">
          {step === 1 && 'Tell us about you'}
          {step === 2 && 'Your business'}
          {step === 3 && 'Choose your plan'}
          {step === 4 && 'Add your first client'}
        </CardTitle>
        <CardDescription>
          {step === 1 && 'This is how your clients will see you.'}
          {step === 2 && 'Used on your tax invoices. You can change this later.'}
          {step === 3 && 'Start with a 14-day free trial. Cancel anytime.'}
          {step === 4 && 'Optional — you can always add clients later.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {step === 1 && (
          <>
            <AvatarUpload
              userId={userId}
              value={data.avatarUrl}
              fallback={initials}
              onChange={(url) => update({ avatarUrl: url })}
            />
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={data.fullName}
                onChange={(e) => update({ fullName: e.target.value })}
                placeholder="e.g. Omar Haddad"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={data.phone}
                onChange={(e) => update({ phone: e.target.value })}
                placeholder="+971 50 123 4567"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                value={data.businessName}
                onChange={(e) => update({ businessName: e.target.value })}
                placeholder="e.g. Peak Performance Coaching"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vatNumber">VAT registration number</Label>
              <Input
                id="vatNumber"
                value={data.vatNumber}
                onChange={(e) => update({ vatNumber: e.target.value })}
                placeholder="e.g. 100123456700003"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">VAT registered</p>
                <p className="text-xs text-muted-foreground">
                  Adds 5% VAT to your invoices.
                </p>
              </div>
              <Switch
                checked={data.vatRegistered}
                onCheckedChange={(v) => update({ vatRegistered: v })}
              />
            </div>
          </>
        )}

        {step === 3 && (
          <div className="grid gap-3">
            {PLAN_ORDER.map((tier) => {
              const planMeta = PLANS[tier];
              const selected = data.plan === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => update({ plan: tier })}
                  className={cn(
                    'flex items-start justify-between rounded-xl border p-4 text-left transition-colors',
                    selected ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'hover:bg-muted/50',
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{planMeta.name}</span>
                      {tier === 'starter' && (
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                          14-day trial
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {planMeta.clientLimit === Infinity
                        ? 'Unlimited clients'
                        : `Up to ${planMeta.clientLimit} clients`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatAED(planMeta.priceAed)}</p>
                    <p className="text-xs text-muted-foreground">/ month</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === 4 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="clientName">Client name</Label>
              <Input
                id="clientName"
                value={data.clientName}
                onChange={(e) => update({ clientName: e.target.value })}
                placeholder="e.g. Fatima Al Mansoori"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={data.clientEmail}
                  onChange={(e) => update({ clientEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Phone</Label>
                <Input
                  id="clientPhone"
                  value={data.clientPhone}
                  onChange={(e) => update({ clientPhone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientGoal">Goal</Label>
              <Textarea
                id="clientGoal"
                value={data.clientGoal}
                onChange={(e) => update({ clientGoal: e.target.value })}
                placeholder="e.g. Lose 8kg before summer"
                rows={2}
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-between pt-2">
          {step > 1 ? (
            <Button variant="ghost" onClick={prev} disabled={loading}>
              Back
            </Button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            {step === 4 && (
              <Button
                variant="outline"
                disabled={loading}
                onClick={() =>
                  run(
                    () => completeOnboarding({}),
                    () => {
                      router.push('/dashboard');
                      router.refresh();
                    },
                  )
                }
              >
                Skip
              </Button>
            )}
            <Button
              disabled={loading || (step === 1 && !data.fullName.trim())}
              onClick={() => {
                if (step === 1)
                  run(
                    () =>
                      saveProfileStep({
                        fullName: data.fullName,
                        phone: data.phone,
                        avatarUrl: data.avatarUrl,
                      }),
                    next,
                  );
                else if (step === 2)
                  run(
                    () =>
                      saveBusinessStep({
                        businessName: data.businessName,
                        vatNumber: data.vatNumber,
                        vatRegistered: data.vatRegistered,
                      }),
                    next,
                  );
                else if (step === 3) run(() => selectPlanStep(data.plan), next);
                else
                  run(
                    () =>
                      completeOnboarding({
                        clientName: data.clientName,
                        clientEmail: data.clientEmail,
                        clientPhone: data.clientPhone,
                        clientGoal: data.clientGoal,
                      }),
                    () => {
                      router.push('/dashboard');
                      router.refresh();
                    },
                  );
              }}
            >
              {loading ? 'Saving…' : step === 4 ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Finish
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
