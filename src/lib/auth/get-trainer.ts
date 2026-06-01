import { cache } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import type { Trainer } from '@/types';

/** Current auth user (request-cached). */
export const getUser = cache(async (): Promise<User | null> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Current trainer row (request-cached). Returns null if not signed in. */
export const getTrainer = cache(async (): Promise<Trainer | null> => {
  const user = await getUser();
  if (!user) return null;

  const supabase = createClient();
  const { data } = await supabase
    .from('trainers')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return data ?? null;
});
