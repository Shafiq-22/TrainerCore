'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/get-trainer';
import { ok, fail, type ActionResult, type PlanTier } from '@/types';

export async function saveProfileStep(input: {
  fullName: string;
  phone: string;
  avatarUrl: string;
}): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return fail('Not authenticated');
  const supabase = createClient();
  const { error } = await supabase
    .from('trainers')
    .update({
      full_name: input.fullName,
      phone: input.phone || null,
      avatar_url: input.avatarUrl || null,
      onboarding_step: 1,
    })
    .eq('id', user.id);
  if (error) return fail(error.message);
  return ok();
}

export async function saveBusinessStep(input: {
  businessName: string;
  vatNumber: string;
  vatRegistered: boolean;
}): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return fail('Not authenticated');
  const supabase = createClient();
  const { error } = await supabase
    .from('trainers')
    .update({
      business_name: input.businessName || null,
      vat_number: input.vatNumber || null,
      vat_registered: input.vatRegistered,
      onboarding_step: 2,
    })
    .eq('id', user.id);
  if (error) return fail(error.message);
  return ok();
}

export async function selectPlanStep(plan: PlanTier): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return fail('Not authenticated');
  const supabase = createClient();
  const { error } = await supabase
    .from('trainers')
    .update({ plan, onboarding_step: 3 })
    .eq('id', user.id);
  if (error) return fail(error.message);
  return ok();
}

export async function completeOnboarding(input: {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientGoal?: string;
}): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return fail('Not authenticated');
  const supabase = createClient();

  if (input.clientName && input.clientName.trim()) {
    const { error: clientError } = await supabase.from('clients').insert({
      trainer_id: user.id,
      full_name: input.clientName.trim(),
      email: input.clientEmail?.trim() || null,
      phone: input.clientPhone?.trim() || null,
      goal: input.clientGoal?.trim() || null,
    });
    if (clientError) return fail(clientError.message);
  }

  const { error } = await supabase
    .from('trainers')
    .update({ onboarding_completed: true, onboarding_step: 4 })
    .eq('id', user.id);
  if (error) return fail(error.message);

  revalidatePath('/dashboard');
  return ok();
}
