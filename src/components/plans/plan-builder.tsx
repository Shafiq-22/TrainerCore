'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';
import { usePlanBuilderStore, type PlanDraftInput } from '@/stores/plan-builder-store';
import { savePlanAction } from '@/app/(app)/plans/actions';
import { DayCard } from './day-card';
import { cn } from '@/lib/utils/cn';
import { WEEKDAY_LABELS } from '@/lib/utils/dates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { Exercise } from '@/types';

const STEPS = ['Details', 'Build', 'Review'];

export function PlanBuilder({
  exercises,
  initial,
  planId,
}: {
  exercises: Exercise[];
  initial?: PlanDraftInput;
  planId?: string;
}) {
  const router = useRouter();
  const store = usePlanBuilderStore();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const inited = useRef(false);

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    if (initial) store.initFrom(initial);
    else store.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeWeek = store.weeks.find((w) => w.weekNumber === store.activeWeek);

  async function save() {
    setSaving(true);
    const res = await savePlanAction({
      name: store.name,
      description: store.description,
      goal: store.goal,
      weeksCount: store.weeksCount,
      isTemplate: store.isTemplate,
      weeks: store.weeks,
      planId,
    });
    setSaving(false);
    if (res.ok) {
      toast.success('Plan saved');
      store.reset();
      router.push(`/plans/${res.data?.id}`);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                step >= i + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}
            >
              {i + 1}
            </div>
            <span className={cn('text-sm', step === i + 1 ? 'font-medium' : 'text-muted-foreground')}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Plan details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan name</Label>
              <Input
                id="name"
                value={store.name}
                onChange={(e) => store.setMeta({ name: e.target.value })}
                placeholder="e.g. 8-Week Hypertrophy"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal">Goal</Label>
              <Input
                id="goal"
                value={store.goal}
                onChange={(e) => store.setMeta({ goal: e.target.value })}
                placeholder="e.g. Build muscle, increase strength"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={store.description}
                onChange={(e) => store.setMeta({ description: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weeks">Number of weeks</Label>
                <Input
                  id="weeks"
                  type="number"
                  min={1}
                  max={52}
                  value={store.weeksCount}
                  onChange={(e) => store.setWeeksCount(Number(e.target.value) || 1)}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 rounded-lg border p-3">
                  <Switch
                    checked={store.isTemplate}
                    onCheckedChange={(v) => store.setMeta({ isTemplate: v })}
                  />
                  <div>
                    <p className="text-sm font-medium">Save as template</p>
                    <p className="text-xs text-muted-foreground">Reuse for other clients</p>
                  </div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {store.weeks.map((w) => (
              <button
                key={w.weekNumber}
                type="button"
                onClick={() => store.setActiveWeek(w.weekNumber)}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                  store.activeWeek === w.weekNumber
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'hover:bg-muted',
                )}
              >
                Week {w.weekNumber}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {activeWeek?.days.map((day) => (
              <DayCard
                key={day.dayOfWeek}
                week={store.activeWeek}
                day={day}
                exercises={exercises}
              />
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{store.name || 'Untitled plan'}</h3>
              {store.goal && <p className="text-sm text-muted-foreground">{store.goal}</p>}
              <p className="mt-1 text-sm text-muted-foreground">
                {store.weeksCount} weeks{store.isTemplate ? ' · Template' : ''}
              </p>
            </div>
            <div className="space-y-3">
              {store.weeks.map((w) => {
                const trainingDays = w.days.filter((d) => !d.isRest && d.exercises.length > 0);
                return (
                  <div key={w.weekNumber} className="rounded-lg border p-3">
                    <p className="mb-2 text-sm font-semibold">Week {w.weekNumber}</p>
                    {trainingDays.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No training days configured.</p>
                    ) : (
                      <ul className="space-y-1 text-sm">
                        {trainingDays.map((d) => (
                          <li key={d.dayOfWeek} className="flex items-center gap-2">
                            <Dumbbell className="h-3.5 w-3.5 text-accent" />
                            <span className="font-medium">{WEEKDAY_LABELS[d.dayOfWeek - 1]}</span>
                            <span className="text-muted-foreground">
                              · {d.exercises.length} exercise{d.exercises.length === 1 ? '' : 's'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => (step === 1 ? router.push('/plans') : setStep((s) => s - 1))}
          disabled={saving}
        >
          Back
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={step === 1 && !store.name.trim()}>
            Continue
          </Button>
        ) : (
          <Button onClick={save} disabled={saving}>
            <Check className="mr-2 h-4 w-4" />
            {saving ? 'Saving…' : 'Save plan'}
          </Button>
        )}
      </div>
    </div>
  );
}
