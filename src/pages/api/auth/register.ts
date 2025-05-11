import type { APIRoute } from "astro";
import { createSupabaseServer } from "../../../db/supabase.server";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: result.error.issues[0]?.message || "Invalid input",
        }),
        { status: 400 }
      );
    }

    // Get the site URL from environment variables, fallback to request origin for development
    const siteUrl = import.meta.env.SITE_URL || new URL(request.url).origin;
    
    // Ensure the URL doesn't have a trailing slash
    const baseUrl = siteUrl.replace(/\/$/, '');

    const supabase = createSupabaseServer({
      cookies,
      headers: request.headers,
    });

    const { data, error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        emailRedirectTo: `${baseUrl}/auth/callback?type=signup`,
      },
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ user: data.user }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}; 