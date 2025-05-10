/// <reference types="astro/client" />

import type { SupabaseServerClient } from './db/supabase.server';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseServerClient;
      user?: {
        id: string;
        email: string | null;
      };
    }
  }
}

interface ImportMetaEnv {
  // readonly PUBLIC_SUPABASE_URL: string;
  // readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
