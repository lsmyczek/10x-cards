import { createClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const DEFAULT_USER_ID = '422de366-8621-4e72-a65c-5c8bcb63248f';

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey); 