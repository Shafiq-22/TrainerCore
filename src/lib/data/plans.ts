import { createClient } from '@/lib/supabase/server';
import { makeWeeks, type PlanDraftInput } from '@/stores/plan-builder-store';
import type { WorkoutPlan } from '@/types';

export interface FullDayExercise {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  sets: number | null;
  reps: string | null;
  restSeconds: number | null;
  notes: string | null;
}
export interface FullDay {
  dayOfWeek: number;
  label: string | null;
  isRest: boolean;
  exercises: FullDayExercise[];
}
export interface FullWeek {
  weekNumber: number;
  days: FullDay[];
}
export interface FullPlan {
  plan: WorkoutPlan;
  weeks: FullWeek[];
}

export async function getPlanWithStructure(id: string): Promise<FullPlan | null> {
  const supabase = createClient();
  const { data: plan } = await supabase.from('workout_plans').select('*').eq('id', id).maybeSingle();
  if (!plan) return null;

  const { data: weeks } = await supabase
    .from('workout_weeks')
    .select('id,week_number')
    .eq('plan_id', id)
    .order('week_number');

  const weekIds = (weeks ?? []).map((w) => w.id);
  const { data: days } = weekIds.length
    ? await supabase
        .from('workout_days')
        .select('id,week_id,day_of_week,label,is_rest')
        .in('week_id', weekIds)
        .order('day_of_week')
    : { data: [] as { id: string; week_id: string; day_of_week: number; label: string | null; is_rest: boolean }[] };

  const dayIds = (days ?? []).map((d) => d.id);
  const { data: dayEx } = dayIds.length
    ? await supabase
        .from('day_exercises')
        .select('day_id,exercise_id,position,sets,reps,rest_seconds,notes,exercises(name,muscle_group)')
        .in('day_id', dayIds)
        .order('position')
    : { data: [] as never[] };

  const fullWeeks: FullWeek[] = (weeks ?? []).map((w) => ({
    weekNumber: w.week_number,
    days: (days ?? [])
      .filter((d) => d.week_id === w.id)
      .map((d) => ({
        dayOfWeek: d.day_of_week,
        label: d.label,
        isRest: d.is_rest,
        exercises: (dayEx ?? [])
          .filter((e) => e.day_id === d.id)
          .map((e) => {
            const ex = e.exercises as { name: string; muscle_group: string } | { name: string; muscle_group: string }[] | null;
            const exObj = Array.isArray(ex) ? ex[0] : ex;
            return {
              exerciseId: e.exercise_id,
              name: exObj?.name ?? 'Exercise',
              muscleGroup: exObj?.muscle_group ?? '',
              sets: e.sets,
              reps: e.reps,
              restSeconds: e.rest_seconds,
              notes: e.notes,
            };
          }),
      })),
  }));

  return { plan: plan as WorkoutPlan, weeks: fullWeeks };
}

/** Convert a stored plan into a builder draft with full 7-day weeks. */
export function toDraft(full: FullPlan): PlanDraftInput {
  const base = makeWeeks(full.plan.weeks_count);
  for (const w of full.weeks) {
    const week = base.find((b) => b.weekNumber === w.weekNumber);
    if (!week) continue;
    for (const d of w.days) {
      const day = week.days.find((bd) => bd.dayOfWeek === d.dayOfWeek);
      if (!day) continue;
      day.label = d.label ?? '';
      day.isRest = d.isRest;
      day.exercises = d.exercises.map((e, idx) => ({
        tempId: `${d.dayOfWeek}-${idx}-${e.exerciseId}`,
        exerciseId: e.exerciseId,
        name: e.name,
        muscleGroup: e.muscleGroup,
        sets: e.sets?.toString() ?? '',
        reps: e.reps ?? '',
        restSeconds: e.restSeconds?.toString() ?? '',
        notes: e.notes ?? '',
      }));
    }
  }
  return {
    name: full.plan.name,
    description: full.plan.description ?? '',
    goal: full.plan.goal ?? '',
    weeksCount: full.plan.weeks_count,
    isTemplate: full.plan.is_template,
    weeks: base,
  };
}
