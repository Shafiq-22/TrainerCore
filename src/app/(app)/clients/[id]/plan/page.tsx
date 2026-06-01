import Link from 'next/link';
import { Dumbbell } from 'lucide-react';
import { requireTrainer } from '@/lib/auth/require-trainer';
import { getClientById } from '@/lib/data/clients';
import { getPlanWithStructure } from '@/lib/data/plans';
import { createClient } from '@/lib/supabase/server';
import { WEEKDAY_LABELS } from '@/lib/utils/dates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { AssignPlanToClient } from '@/components/plans/assign-plan-to-client';
import { PlanDownloadButton } from '@/components/plans/plan-download-button';
import type { PlanPdfData } from '@/lib/pdf/plan-pdf';

export default async function ClientPlanPage({ params }: { params: { id: string } }) {
  const trainer = await requireTrainer();
  const client = await getClientById(params.id);
  if (!client) return null;

  const supabase = createClient();
  const [activeRes, plansRes] = await Promise.all([
    supabase
      .from('client_plans')
      .select('plan_id')
      .eq('client_id', params.id)
      .eq('is_active', true)
      .maybeSingle(),
    supabase.from('workout_plans').select('id,name').order('created_at', { ascending: false }),
  ]);

  const full = activeRes.data?.plan_id
    ? await getPlanWithStructure(activeRes.data.plan_id)
    : null;

  const pdfData: PlanPdfData | null = full
    ? {
        planName: full.plan.name,
        description: full.plan.description,
        goal: full.plan.goal,
        trainerName: trainer.business_name || trainer.full_name || 'TrainerCore',
        clientName: client.full_name,
        weeks: full.weeks.map((w) => ({
          weekNumber: w.weekNumber,
          days: w.days.map((d) => ({
            label: d.label || `Day ${d.dayOfWeek}`,
            dayOfWeek: d.dayOfWeek,
            isRest: d.isRest,
            exercises: d.exercises.map((e) => ({
              name: e.name,
              sets: e.sets,
              reps: e.reps,
              restSeconds: e.restSeconds,
              notes: e.notes,
            })),
          })),
        })),
      }
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Assigned plan</CardTitle>
          {full && pdfData && (
            <div className="flex gap-2">
              <PlanDownloadButton data={pdfData} />
              <Button variant="outline" size="sm" asChild>
                <Link href={`/plans/${full.plan.id}`}>Open</Link>
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {full ? (
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold">{full.plan.name}</h3>
                {full.plan.goal && (
                  <p className="text-sm text-muted-foreground">{full.plan.goal}</p>
                )}
              </div>
              <div className="space-y-2">
                {full.weeks.map((w) => {
                  const days = w.days.filter((d) => !d.isRest && d.exercises.length > 0);
                  if (days.length === 0) return null;
                  return (
                    <div key={w.weekNumber} className="rounded-lg border p-3 text-sm">
                      <p className="mb-1 font-medium">Week {w.weekNumber}</p>
                      <ul className="space-y-0.5 text-muted-foreground">
                        {days.map((d) => (
                          <li key={d.dayOfWeek}>
                            {d.label || WEEKDAY_LABELS[d.dayOfWeek - 1]} — {d.exercises.length}{' '}
                            exercises
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Dumbbell}
              title="No plan assigned"
              description="Assign a workout plan to this client below."
              className="border-0 bg-transparent py-8"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{full ? 'Change plan' : 'Assign a plan'}</CardTitle>
        </CardHeader>
        <CardContent>
          <AssignPlanToClient
            clientId={params.id}
            plans={plansRes.data ?? []}
            hasActive={Boolean(full)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
