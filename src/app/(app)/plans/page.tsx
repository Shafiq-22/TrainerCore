import type { Metadata } from 'next';
import Link from 'next/link';
import { Dumbbell, Plus, LayoutTemplate } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireTrainer } from '@/lib/auth/require-trainer';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { WorkoutPlan } from '@/types';

export const metadata: Metadata = { title: 'Workout Plans' };

function PlanCard({ plan }: { plan: WorkoutPlan }) {
  return (
    <Link href={`/plans/${plan.id}`}>
      <Card className="h-full transition-colors hover:border-accent">
        <CardContent className="space-y-2 p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Dumbbell className="h-5 w-5 text-accent" />
            </div>
            {plan.is_template && <Badge variant="secondary">Template</Badge>}
          </div>
          <h3 className="font-semibold">{plan.name}</h3>
          {plan.goal && <p className="text-sm text-muted-foreground">{plan.goal}</p>}
          <p className="text-xs text-muted-foreground">{plan.weeks_count} weeks</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function PlansPage() {
  await requireTrainer();
  const supabase = createClient();
  const { data } = await supabase
    .from('workout_plans')
    .select('*')
    .order('created_at', { ascending: false });
  const plans = (data ?? []) as WorkoutPlan[];
  const templates = plans.filter((p) => p.is_template);
  const regular = plans.filter((p) => !p.is_template);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workout Plans"
        description="Build and reuse training programmes."
        action={
          <Button asChild>
            <Link href="/plans/new">
              <Plus className="mr-2 h-4 w-4" />
              New plan
            </Link>
          </Button>
        }
      />

      {plans.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No workout plans yet"
          description="Build your first training programme with the plan builder."
          action={
            <Button asChild>
              <Link href="/plans/new">Build a plan</Link>
            </Button>
          }
        />
      ) : (
        <>
          {regular.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">Plans</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {regular.map((p) => (
                  <PlanCard key={p.id} plan={p} />
                ))}
              </div>
            </section>
          )}

          {templates.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <LayoutTemplate className="h-4 w-4" /> Templates
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((p) => (
                  <PlanCard key={p.id} plan={p} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
