import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/get-trainer';
import { sendInvoiceAction } from '@/app/(app)/billing/actions';

export const runtime = 'nodejs';

/** Authenticated endpoint to (re)send an invoice over WhatsApp. */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await sendInvoiceAction(params.id);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
