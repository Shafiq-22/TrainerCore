import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { env, isSupabaseServiceConfigured } from '@/lib/env';

/**
 * Service-role client — bypasses RLS. Server-only. Returns `null` when the
 * service-role key is not configured so callers (webhooks) degrade gracefully
 * instead of crashing. Most privileged public flows use SECURITY DEFINER RPCs
 * and do not need this.
 */
export function createServiceClient() {
  if (!isSupabaseServiceConfigured) return null;
  return createSupabaseClient<Database>(
    env.supabaseUrl || 'https://placeholder.supabase.co',
    env.supabaseServiceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
