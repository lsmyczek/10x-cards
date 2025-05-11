import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2 } from "lucide-react";
import { z } from "zod";

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
      // First try to get the code from query parameters
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get("code");

      // If no code in query params, try hash params (legacy format)
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");

      // Determine which format we're dealing with
      let requestBody;
      let headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (code) {
        requestBody = {
          password: formData.password,
          code,
        };
      } else if (accessToken && refreshToken && type === "recovery") {
        requestBody = {
          password: formData.password,
          refreshToken,
        };
        headers = {
          ...headers,
          Authorization: `Bearer ${accessToken}`,
        };
      } else {
        throw new Error("No valid reset token found in URL");
      }

      const response = await fetch("/api/auth/confirm-reset-password", {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      const contentType = response.headers.get("content-type");
      
      // Always try to parse the response as JSON first
      try {
        const data = await response.json();
        
        if (!response.ok) {
          console.error("Password reset error:", data);
          throw new Error(data.error || data.details || "Failed to reset password");
        }

        // Handle successful response
        setFormState({
          status: "success",
          message: data.message || "Password reset successfully. Redirecting to login...",
        });

        // Clear form
        setFormData({ password: "", confirmPassword: "" });

        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = data.redirect || "/auth/sign-in";
        }, 2000);
        
      } catch (e) {
        console.error("Error processing response:", e);
        throw new Error("Failed to process server response");
      }
    } catch (error) {
      setFormState({
        status: "error",
        message: error instanceof Error ? error.message : "An error occurred",
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
