import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { clientLimitFor } from './limits';
import type { PlanTier } from '@/types';

export interface ClientLimitState {
  allowed: boolean;
  current: number;
  limit: number;
  plan: PlanTier;
}

/**
 * Authoritative client-limit check. Used by the create-client server action to
 * actually block, and by the UI to render the upgrade modal. Archived clients
 * do not count toward the limit.
 */
export async function checkClientLimit(): Promise<ClientLimitState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, current: 0, limit: 0, plan: 'starter' };
  }

  const { data: trainer } = await supabase
    .from('trainers')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle<{ plan: PlanTier }>();

  const plan: PlanTier = trainer?.plan ?? 'starter';
  const limit = clientLimitFor(plan);

  const { count } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .neq('status', 'archived');

  const current = count ?? 0;
  return { allowed: current < limit, current, limit, plan };
}
