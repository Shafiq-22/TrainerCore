import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';
import { env } from '@/lib/env';

/**
 * Supabase client for use in Client Components.
 * Falls back to a syntactically-valid placeholder URL so construction never
 * throws during a build with unconfigured env.
 */
export function createClient() {
  return createBrowserClient<Database>(
    env.supabaseUrl || 'https://placeholder.supabase.co',
    env.supabaseAnonKey || 'placeholder-anon-key',
  );
}
