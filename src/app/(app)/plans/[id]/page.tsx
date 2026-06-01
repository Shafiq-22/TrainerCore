import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireTrainer } from '@/lib/auth/require-trainer';
import { getPlanWithStructure, toDraft } from '@/lib/data/plans';
import { PageHeader } from '@/components/shared/page-header';
import { PlanBuilder } from '@/components/plans/plan-builder';
import { PlanActions } from '@/components/plans/plan-actions';
import type { Exercise } from '@/types';
import type { PlanPdfData } from '@/lib/pdf/plan-pdf';

export default async function EditPlanPage({ params }: { params: { id: string } }) {
  const trainer = await requireTrainer();
  const full = await getPlanWithStructure(params.id);
  if (!full) notFound();

  const supabase = createClient();
  const [{ data: exData }, { data: clientsData }] = await Promise.all([
    supabase.from('exercises').select('*').order('muscle_group').order('name'),
    supabase.from('clients').select('id,full_name').eq('status', 'active').order('full_name'),
  ]);

  const pdfData: PlanPdfData = {
    planName: full.plan.name,
    description: full.plan.description,
    goal: full.plan.goal,
    trainerName: trainer.business_name || trainer.full_name || 'TrainerCore',
    clientName: null,
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
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={full.plan.name}
        description="Edit the programme below, then save."
        action={
          <PlanActions
            planId={full.plan.id}
            pdfData={pdfData}
            clients={clientsData ?? []}
          />
        }
      />
      <PlanBuilder
        exercises={(exData ?? []) as Exercise[]}
        initial={toDraft(full)}
        planId={full.plan.id}
      />
    </div>
  );
}
