import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';
import { env } from '@/lib/env';

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Bound to the request cookies so RLS sees `auth.uid()`.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    env.supabaseUrl || 'https://placeholder.supabase.co',
    env.supabaseAnonKey || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` was called from a Server Component. This can be ignored
            // because the middleware refreshes the session on every request.
          }
        },
      },
    },
  );
}
