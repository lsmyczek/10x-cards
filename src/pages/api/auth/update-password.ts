import type { APIRoute } from "astro";
import { z } from "zod";

/**
 * Schema for password reset confirmation request validation
 */
const confirmResetSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password must be less than 72 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    code: z.string().optional(),
    refreshToken: z.string().optional(),
  })
  .refine((data) => data.code || data.refreshToken, {
    message: "Either code or refreshToken must be provided",
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
 * Supports both new code-based format and legacy refresh token format.
 *
 * @route POST /api/auth/confirm-reset-password
 * @param {Object} request - The request object
 * @param {Object} request.body - The request body
 * @param {string} request.body.password - New password
 * @param {string} [request.body.code] - Reset code from the URL
 * @param {string} [request.body.refreshToken] - Legacy refresh token
 * @returns {Response} JSON response indicating success or failure
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = confirmResetSchema.safeParse(body);
    console.log("result", result);

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

    const { password, code, refreshToken } = result.data;
    console.log("code", code, "refreshToken", refreshToken, "password", password);

    // Initialize Supabase client
    const supabase = locals.supabase;

    let error;

    if (code) {
      // For new format, use resetPasswordForEmail with the recovery token
      const { data, error: updateError } = await supabase.auth.updateUser(
        {
          password,
        },
        {
          emailRedirectTo: new URL(request.url).origin + "/auth/sign-in",
        }
      );
      error = updateError;

      if (!error && data?.user) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Password updated successfully",
            redirect: "/auth/sign-in",
          }),
          {
            status: 200,
            headers: securityHeaders,
          }
        );
      }
    } else if (refreshToken) {
      // Legacy format: First verify the refresh token
      const { data: sessionData, error: verifyError } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });
      error = verifyError;

      if (!error && sessionData?.session) {
        // If refresh token is valid, update the password
        const { error: updateError } = await supabase.auth.updateUser({ password });
        error = updateError;

        if (!error) {
          return new Response(
            JSON.stringify({
              success: true,
              message: "Password updated successfully",
              redirect: "/auth/sign-in",
            }),
            {
              status: 200,
              headers: securityHeaders,
            }
          );
        }
      }
    } else {
      error = new Error("No valid reset token provided");
    }

    if (error) {
      console.error("Password reset confirmation failed:", {
        error: error.message,
        userAgent: request.headers.get("user-agent"),
        timestamp: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          error: error.message || "Failed to reset password",
          details: error.message,
          code: error.name || "RESET_ERROR",
        }),
        {
          status: 400,
          headers: securityHeaders,
        }
      );
    }

    // If we get here, something unexpected happened
    return new Response(
      JSON.stringify({
        error: "Unexpected error during password reset",
        success: false,
      }),
      {
        status: 500,
        headers: securityHeaders,
      }
    );
  } catch (error) {
    console.error("Unexpected error during password reset confirmation:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        success: false,
      }),
      {
        status: 500,
        headers: securityHeaders,
      }
    );
  }
};
