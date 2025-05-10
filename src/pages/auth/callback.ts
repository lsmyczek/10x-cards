import type { APIRoute } from "astro";
import { supabase } from "../../db/supabase.client";

export const GET: APIRoute = async ({ url, redirect }) => {
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/auth/sign-in?error=missing-code");
  }

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw error;
    }

    return redirect("/dashboard");
  } catch (error) {
    console.error("Auth callback error:", error);
    return redirect("/auth/sign-in?error=auth-failed");
  }
};

// Required for Astro SSR
export const prerender = false;
