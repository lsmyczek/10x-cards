import type { APIRoute } from "astro";
import { createSupabaseServer } from "../../db/supabase.server";

export const GET: APIRoute = async ({ url, cookies, request, redirect }) => {
  const code = url.searchParams.get("code");
  const type = url.searchParams.get("type");

  if (!code) {
    return redirect("/auth/sign-in?error=missing-code");
  }

  try {
    const supabase = createSupabaseServer({
      cookies,
      headers: request.headers,
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw error;
    }

    // If this was an email confirmation (signup), redirect to the confirmation page
    if (type === "signup") {
      return redirect("/auth/signup-confirmed");
    }

    // For other auth actions (password reset, magic link, etc), redirect to dashboard
    return redirect("/dashboard");
  } catch (error) {
    console.error("Auth callback error:", error);
    return redirect("/auth/sign-in?error=auth-failed");
  }
};

// Required for Astro SSR
export const prerender = false;
