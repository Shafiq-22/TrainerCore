'use server';

import { createClient } from '@/lib/supabase/server';
import { ok, fail, type ActionResult } from '@/types';

export async function submitPublicCheckin(
  token: string,
  input: {
    energy: number;
    sleep: number;
    nutrition: number;
    stress: number;
    weight: string;
    notes: string;
  },
): Promise<ActionResult> {
  const supabase = createClient();
  // The DB function accepts null; the generated RPC type is overly strict.
  const weight = (input.weight.trim() === '' ? null : Number(input.weight)) as unknown as number;

  const { data, error } = await supabase.rpc('submit_checkin', {
    p_token: token,
    p_energy: input.energy,
    p_sleep: input.sleep,
    p_nutrition: input.nutrition,
    p_stress: input.stress,
    p_weight: weight,
    p_notes: input.notes,
  });

  if (error) return fail(error.message);
  const result = data as { ok?: boolean; error?: string } | null;
  if (!result?.ok) {
    return fail(
      result?.error === 'invalid_or_used'
        ? 'This check-in link is invalid or has already been used.'
        : 'Could not submit your check-in.',
    );
  }
  return ok();
}
