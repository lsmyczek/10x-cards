import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types";

export const cookieOptions: CookieOptionsWithName = {
  name: "sb",
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

export const createSupabaseServer = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookieOptions,
    cookies: {
      setAll(cookieList) {
        cookieList.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
      getAll() {
        const cookieHeader = context.headers.get("cookie") ?? "";
        return cookieHeader
          .split(";")
          .map((cookie) => cookie.trim())
          .filter(Boolean)
          .map((cookie) => {
            const [name, ...rest] = cookie.split("=");
            return {
              name,
              value: rest.join("="),
            };
          });
      },
    },
  });

  return supabase;
};

export type SupabaseServerClient = ReturnType<typeof createSupabaseServer>;
