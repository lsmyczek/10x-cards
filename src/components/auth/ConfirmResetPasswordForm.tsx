import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// Use PUBLIC_ prefixed env variables for client-side code
const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_KEY
);

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
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormState = {
  status: "idle" | "submitting" | "success" | "error";
  message?: string;
};

export function ConfirmResetPasswordForm() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [formState, setFormState] = useState<FormState>({ status: "idle" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form data
    const result = confirmResetSchema.safeParse(formData);
    if (!result.success) {
      setFormState({
        status: "error",
        message: result.error.issues[0]?.message || "Invalid password",
      });
      return;
    }

    setFormState({ status: "submitting" });

    try {
      // Get the code from query parameters
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get("code");

      if (!code) {
        throw new Error("No reset code found in URL");
      }

      console.log("Attempting password reset with code");

      // First exchange the code for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError);
        throw new Error(exchangeError.message);
      }

      console.log("Successfully exchanged code for session");

      // Now update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (updateError) {
        console.error("Error updating password:", updateError);
        throw new Error(updateError.message);
      }

      console.log("Successfully updated password");

      // Handle success
      setFormState({
        status: "success",
        message: "Password reset successfully. Redirecting to login...",
      });

      // Clear form
      setFormData({ password: "", confirmPassword: "" });

      // Redirect to sign-in after a short delay
      setTimeout(() => {
        window.location.href = "/auth/sign-in";
      }, 2000);

    } catch (error) {
      console.error("Password reset error:", error);
      setFormState({
        status: "error",
        message: error instanceof Error ? error.message : "Failed to reset password",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="New password"
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            disabled={formState.status === "submitting"}
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            disabled={formState.status === "submitting"}
            required
            className="w-full"
          />
        </div>
      </div>

      {formState.message && (
        <Alert variant={formState.status === "success" ? "default" : "destructive"}>
          <AlertDescription>{formState.message}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={formState.status === "submitting"} className="w-full">
        {formState.status === "submitting" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Resetting Password
          </>
        ) : (
          "Set New Password"
        )}
      </Button>
    </form>
  );
}
