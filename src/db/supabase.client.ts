import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

if (!import.meta.env.SUPABASE_URL) {
  throw new Error("Missing env.SUPABASE_URL");
}

if (!import.meta.env.SUPABASE_KEY) {
  throw new Error("Missing env.SUPABASE_KEY");
}

export const supabase = createClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY);

export type SupabaseClient = typeof supabase;
