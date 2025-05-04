import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from './database.types';

export const createSupabaseServer = (context: {
  headers: Headers;
  cookies: {
    get: (name: string) => string | undefined;
    set: (name: string, value: string, options?: CookieOptions) => void;
  };
}) => {
  return createServerClient<Database>(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_KEY,
    {
      cookies: {
        get: (name: string) => context.cookies.get(name),
        set: (name: string, value: string, options: CookieOptions) => {
          context.cookies.set(name, value, options);
        },
        remove: (name: string, options: CookieOptions) => {
          context.cookies.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
};

export type SupabaseServerClient = ReturnType<typeof createSupabaseServer>; 