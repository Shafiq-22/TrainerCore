'use server';

import { createClient } from '@/lib/supabase/server';
import { ok, fail, type ActionResult } from '@/types';

// The DB function accepts null for the numeric params; the generated RPC types
// are overly strict, so we cast at the boundary.
const numOrNull = (s: string): number =>
  (s.trim() === '' || !Number.isFinite(Number(s)) ? null : Number(s)) as unknown as number;

export async function submitPublicCheckin(
  token: string,
  input: {
    energy: number;
    sleep: number;
    nutrition: number;
    stress: number;
    weight: string;
    bodyFat: string;
    chest: string;
    waist: string;
    hips: string;
    arm: string;
    notes: string;
  },
): Promise<ActionResult> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('submit_checkin', {
    p_token: token,
    p_energy: input.energy,
    p_sleep: input.sleep,
    p_nutrition: input.nutrition,
    p_stress: input.stress,
    p_weight: numOrNull(input.weight),
    p_notes: input.notes,
    p_body_fat: numOrNull(input.bodyFat),
    p_chest: numOrNull(input.chest),
    p_waist: numOrNull(input.waist),
    p_hips: numOrNull(input.hips),
    p_arm: numOrNull(input.arm),
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
