import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { requireTrainer } from '@/lib/auth/require-trainer';
import { PageHeader } from '@/components/shared/page-header';
import { PlanBuilder } from '@/components/plans/plan-builder';
import type { Exercise } from '@/types';

export const metadata: Metadata = { title: 'New plan' };

export default async function NewPlanPage() {
  await requireTrainer();
  const supabase = createClient();
  const { data } = await supabase
    .from('exercises')
    .select('*')
    .order('muscle_group')
    .order('name');

  return (
    <div className="space-y-6">
      <PageHeader title="New plan" description="Design a multi-week training programme." />
      <PlanBuilder exercises={(data ?? []) as Exercise[]} />
    </div>
  );
}
