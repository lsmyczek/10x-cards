import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

if (!import.meta.env.PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.PUBLIC_SUPABASE_URL');
}

if (!import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export type SupabaseClient = typeof supabase; 