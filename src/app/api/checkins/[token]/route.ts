import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/** Public: fetch check-in info for prefilling the form. */
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_checkin', { p_token: params.token });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** Public: submit a check-in (single-use, token-gated by the RPC). */
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const body = await req.json().catch(() => ({}));
  const supabase = createClient();
  const num = (v: unknown): number =>
    (v != null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null) as unknown as number;
  const { data, error } = await supabase.rpc('submit_checkin', {
    p_token: params.token,
    p_energy: Number(body.energy),
    p_sleep: Number(body.sleep),
    p_nutrition: Number(body.nutrition),
    p_stress: Number(body.stress),
    p_weight: num(body.weight),
    p_notes: body.notes ?? '',
    p_body_fat: num(body.bodyFat),
    p_chest: num(body.chest),
    p_waist: num(body.waist),
    p_hips: num(body.hips),
    p_arm: num(body.arm),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
