import { NextResponse } from 'next/server';
import { isAuthorizedCron } from '@/lib/cron';
import { createServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';

/** Flip sent invoices past their due date to "overdue". Runs daily. */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ skipped: 'service role key not configured' });

  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('invoices')
    .update({ status: 'overdue' })
    .eq('status', 'sent')
    .lt('due_date', today)
    .select('id');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ updated: data?.length ?? 0 });
}
