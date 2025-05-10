import { defineMiddleware } from "astro:middleware";
import { createSupabaseServer } from "../db/supabase.server";

// Public paths - Auth API endpoints & Server-Rendered Astro Pages
const PUBLIC_PATHS = [
  // Server-Rendered Astro Pages
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/reset-password",
  "/auth/confirm-registration",
  "/auth/confirm-reset-password",
  "/",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/auth/delete",
  // Auth callback
  "/auth/callback",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Create server-side Supabase client
  locals.supabase = createSupabaseServer({
    headers: request.headers,
    cookies,
  });

  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  // Get user session
  const {
    data: { user },
  } = await locals.supabase.auth.getUser();

  if (user) {
    locals.user = {
      email: user.email ?? null,
      id: user.id,
    };
    return next();
  }

  // Redirect to login for protected routes
  return redirect("/auth/sign-in");
});
