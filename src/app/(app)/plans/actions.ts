'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/get-trainer';
import { ok, fail, type ActionResult, type MuscleGroup } from '@/types';
import type { PlanDraftInput } from '@/stores/plan-builder-store';

export async function createCustomExerciseAction(input: {
  name: string;
  muscleGroup: string;
  equipment: string;
  instructions: string;
}): Promise<ActionResult<{ id: string; name: string; muscle_group: MuscleGroup; equipment: string | null }>> {
  const user = await getUser();
  if (!user) return fail('Not authenticated');
  if (!input.name.trim()) return fail('Exercise name is required');
  const supabase = createClient();
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      trainer_id: user.id,
      name: input.name.trim(),
      muscle_group: input.muscleGroup as MuscleGroup,
      equipment: input.equipment.trim() || null,
      instructions: input.instructions.trim() || null,
      is_global: false,
    })
    .select('id,name,muscle_group,equipment')
    .single();
  if (error || !data) return fail(error?.message ?? 'Could not create exercise');
  return ok(data);
}

const numOrNull = (s: string): number | null => {
  if (!s || s.trim() === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

export async function savePlanAction(
  input: PlanDraftInput & { planId?: string },
): Promise<ActionResult<{ id: string }>> {
  const user = await getUser();
  if (!user) return fail('Not authenticated');
  if (!input.name.trim()) return fail('Plan name is required');

  const supabase = createClient();
  let planId = input.planId;

  if (planId) {
    const { error } = await supabase
      .from('workout_plans')
      .update({
        name: input.name.trim(),
        description: input.description || null,
        goal: input.goal || null,
        weeks_count: input.weeksCount,
        is_template: input.isTemplate,
      })
      .eq('id', planId);
    if (error) return fail(error.message);
    // Replace the whole structure (cascade removes days + day_exercises).
    await supabase.from('workout_weeks').delete().eq('plan_id', planId);
  } else {
    const { data, error } = await supabase
      .from('workout_plans')
      .insert({
        trainer_id: user.id,
        name: input.name.trim(),
        description: input.description || null,
        goal: input.goal || null,
        weeks_count: input.weeksCount,
        is_template: input.isTemplate,
      })
      .select('id')
      .single();
    if (error || !data) return fail(error?.message ?? 'Failed to create plan');
    planId = data.id;
  }

  for (const w of input.weeks) {
    const { data: weekRow, error: we } = await supabase
      .from('workout_weeks')
      .insert({ trainer_id: user.id, plan_id: planId, week_number: w.weekNumber })
      .select('id')
      .single();
    if (we || !weekRow) return fail(we?.message ?? 'Failed to save week');

    for (const d of w.days) {
      const hasContent = d.isRest || d.exercises.length > 0 || d.label.trim() !== '';
      if (!hasContent) continue;

      const { data: dayRow, error: de } = await supabase
        .from('workout_days')
        .insert({
          trainer_id: user.id,
          week_id: weekRow.id,
          day_of_week: d.dayOfWeek,
          label: d.label || null,
          is_rest: d.isRest,
        })
        .select('id')
        .single();
      if (de || !dayRow) return fail(de?.message ?? 'Failed to save day');

      if (!d.isRest && d.exercises.length > 0) {
        const rows = d.exercises.map((e, idx) => ({
          trainer_id: user.id,
          day_id: dayRow.id,
          exercise_id: e.exerciseId,
          position: idx,
          sets: numOrNull(e.sets),
          reps: e.reps || null,
          rest_seconds: numOrNull(e.restSeconds),
          notes: e.notes || null,
        }));
        const { error: ee } = await supabase.from('day_exercises').insert(rows);
        if (ee) return fail(ee.message);
      }
    }
  }

  revalidatePath('/plans');
  revalidatePath(`/plans/${planId}`);
  return ok({ id: planId });
}

export async function deletePlanAction(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from('workout_plans').delete().eq('id', id);
  if (error) return fail(error.message);
  revalidatePath('/plans');
  return ok();
}

export async function assignPlanAction(
  clientId: string,
  planId: string,
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return fail('Not authenticated');
  const supabase = createClient();

  await supabase
    .from('client_plans')
    .update({ is_active: false })
    .eq('client_id', clientId)
    .eq('is_active', true);

  const { error } = await supabase.from('client_plans').insert({
    trainer_id: user.id,
    client_id: clientId,
    plan_id: planId,
    is_active: true,
    start_date: new Date().toISOString().slice(0, 10),
  });
  if (error) return fail(error.message);

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/plan`);
  return ok();
}

export async function unassignPlanAction(clientId: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from('client_plans')
    .update({ is_active: false })
    .eq('client_id', clientId)
    .eq('is_active', true);
  if (error) return fail(error.message);
  revalidatePath(`/clients/${clientId}/plan`);
  return ok();
}
