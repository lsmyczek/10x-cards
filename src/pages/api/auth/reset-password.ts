import type { APIRoute } from "astro";
import { createSupabaseServer } from "../../../db/supabase.server";
import { z } from "zod";

/**
 * Schema for password reset request validation
 * @property {string} email - User's email address
 * @property {string} [redirectTo] - Optional URL to redirect after password reset
 */
const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
  redirectTo: z.string().url("Invalid redirect URL").optional(),
});

/**
 * Security headers for the password reset endpoint
 */
const securityHeaders = {
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

export const prerender = false;

/**
 * Password Reset Endpoint
 *
 * Handles password reset requests by sending a reset link via email.
 * The link will redirect the user to the specified URL or default reset confirmation page.
 *
 * @route POST /api/auth/reset-password
 * @param {Object} request - The request object
 * @param {Object} request.body - The request body
 * @param {string} request.body.email - User's email address
 * @param {string} [request.body.redirectTo] - Optional URL to redirect after password reset
 * @returns {Response} JSON response indicating success or failure
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      console.warn("Invalid password reset request:", {
        issues: result.error.issues,
        userAgent: request.headers.get("user-agent"),
      });

      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: result.error.issues,
        }),
        {
          status: 400,
          headers: securityHeaders,
        }
      );
    }

    const { email, redirectTo } = result.data;
    const origin = request.headers.get("origin");

    // Initialize Supabase client
    const supabase = createSupabaseServer({
      cookies,
      headers: request.headers,
    });

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo ?? `${origin}/auth/reset-password/confirm`,
    });

    if (error) {
      console.error("Password reset failed:", {
        error: error.message,
        email,
        redirectTo,
        userAgent: request.headers.get("user-agent"),
        timestamp: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          error: "Failed to send password reset email",
          details: error.message,
        }),
        {
          status: 400,
          headers: securityHeaders,
        }
      );
    }

    console.info("Password reset email sent:", {
      email,
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        message: "Password reset email sent successfully. Please check your inbox.",
      }),
      {
        status: 200,
        headers: securityHeaders,
      }
    );
  } catch (error) {
    console.error("Unexpected error during password reset:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: securityHeaders,
    });
  }
};
