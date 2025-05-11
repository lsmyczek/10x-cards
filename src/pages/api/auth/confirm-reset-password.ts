import type { APIRoute } from "astro";
import { createSupabaseServer } from "../../../db/supabase.server";
import { z } from "zod";

/**
 * Schema for password reset confirmation request validation
 * @property {string} password - New password
 * @property {string} refreshToken - Refresh token from the reset link
 */
const confirmResetSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be less than 72 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  refreshToken: z.string(),
});

/**
 * Security headers for the password reset confirmation endpoint
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
 * Password Reset Confirmation Endpoint
 *
 * Handles setting a new password after receiving a reset token.
 * Requires a valid access token in the Authorization header.
 *
 * @route POST /auth/confirm-reset-password
 * @param {Object} request - The request object
 * @param {Object} request.body - The request body
 * @param {string} request.body.password - New password
 * @param {string} request.body.refreshToken - Refresh token from the reset link
 * @returns {Response} JSON response indicating success or failure
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Get the access token from the Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid authorization token" }), {
        status: 401,
        headers: securityHeaders,
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const result = confirmResetSchema.safeParse(body);

    if (!result.success) {
      console.warn("Invalid password reset confirmation request:", {
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

    const { password, refreshToken } = result.data;

    // Initialize Supabase client
    const supabase = createSupabaseServer({
      cookies,
      headers: request.headers,
    });

    // Update the password
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error("Password reset confirmation failed:", {
        error: error.message,
        userAgent: request.headers.get("user-agent"),
        timestamp: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          error: "Failed to reset password",
          details: error.message,
        }),
        {
          status: 400,
          headers: securityHeaders,
        }
      );
    }

    console.info("Password reset completed successfully", {
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        message: "Password reset successfully",
      }),
      {
        status: 200,
        headers: securityHeaders,
      }
    );
  } catch (error) {
    console.error("Unexpected error during password reset confirmation:", {
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
