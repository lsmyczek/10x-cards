import type { APIRoute } from "astro";
import { z } from "zod";

const verifyTokenSchema = z
  .object({
    code: z.string().optional(),
    refreshToken: z.string().optional(),
    type: z.string().optional(),
  })
  .refine((data) => data.code || (data.refreshToken && data.type === "recovery"), {
    message: "Either code or refresh token with type must be provided",
  });

/**
 * Security headers for the verify reset token endpoint
 */
const securityHeaders = {
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: securityHeaders,
    });
  }

  try {
    const body = await request.json();
    console.log("Received request body:", body);
    const result = verifyTokenSchema.safeParse(body);
    console.log("Validation result:", result);

    if (!result.success) {
      console.log("Validation failed:", result.error.issues);
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: result.error.issues[0]?.message,
        }),
        {
          status: 400,
          headers: securityHeaders,
        }
      );
    }

    const { code, refreshToken, type } = result.data;

    // For code-based reset (new format)
    if (code) {
      // We don't need to verify OTP for password reset as the code in URL is already verified
      // Just check if the code exists and is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(code)) {
        return new Response(
          JSON.stringify({
            error: "Invalid reset code format",
            details: "The reset code is not in the correct format",
          }),
          {
            status: 400,
            headers: securityHeaders,
          }
        );
      }
    }
    // For token-based reset (legacy format)
    else if (refreshToken && type === "recovery") {
      const { error } = await locals.supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        return new Response(
          JSON.stringify({
            error: "Invalid or expired reset token",
            details: error.message,
          }),
          {
            status: 400,
            headers: securityHeaders,
          }
        );
      }
    }

    return new Response(JSON.stringify({ message: "Token verified successfully" }), {
      status: 200,
      headers: securityHeaders,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to verify token",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: securityHeaders,
      }
    );
  }
};
