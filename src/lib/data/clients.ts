import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Client } from '@/types';

/** Request-cached single client fetch (deduped across layout + page). */
export const getClientById = cache(async (id: string): Promise<Client | null> => {
  const supabase = createClient();
  const { data } = await supabase.from('clients').select('*').eq('id', id).maybeSingle();
  return (data as Client) ?? null;
});
