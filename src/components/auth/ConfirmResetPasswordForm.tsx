import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
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

interface FormState {
  status: "idle" | "submitting" | "success" | "error";
  message?: string;
}

interface TokenState {
  status: "loading" | "valid" | "invalid";
  message?: string;
}

export function ConfirmResetPasswordForm() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [formState, setFormState] = useState<FormState>({ status: "idle" });
  const [tokenState, setTokenState] = useState<TokenState>({ status: "loading" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    try {
      // First try to get the code from query parameters
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get("code");

      // If no code in query params, try hash params (legacy format)
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");

      if (!code && (!accessToken || !refreshToken || type !== "recovery")) {
        setTokenState({
          status: "invalid",
          message: "Invalid or expired password reset link. Please request a new one.",
        });
        return;
      }

      // Log the data we're about to send
      console.log("Sending verification request with:", { code, refreshToken, type });

      const requestData = code ? { code } : { refreshToken, type };

      const response = await fetch("/api/auth/verify-reset-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log("Verification response:", data);

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to verify reset token");
      }

      setTokenState({
        status: "valid",
        message: "Token verified successfully",
      });
    } catch (error) {
      setTokenState({
        status: "invalid",
        message: error instanceof Error ? error.message : "Invalid or expired reset link",
      });
    }
  };

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

      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
        // Prevent automatic redirects
        redirect: "manual" as RequestRedirect,
      });

      // Check if we got a redirect or success
      if (response.status === 302 || response.status === 301 || response.status === 200) {
        // Try to get redirect URL from either location header or response body
        let redirectUrl = response.headers.get("location");

        // If no location header, try to parse response as JSON
        if (!redirectUrl && response.headers.get("content-type")?.includes("application/json")) {
          try {
            const data = await response.json();
            redirectUrl = data.redirect;
          } catch {
            console.log("Not a JSON response, using default redirect");
          }
        }

        // Default to sign-in page if no redirect URL found
        redirectUrl = redirectUrl || "/auth/sign-in";

        setFormState({
          status: "success",
          message: "Password reset successfully. Redirecting...",
        });
        // Clear form
        setFormData({ password: "", confirmPassword: "" });
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);
        return;
      }

      // Handle error responses
      if (!response.ok) {
        let errorMessage = "Failed to reset password";

        // Try to parse error message from JSON response
        if (response.headers.get("content-type")?.includes("application/json")) {
          try {
            const data = await response.json();
            errorMessage = data.error || data.details || errorMessage;
          } catch (e) {
            console.error("Error parsing error response:", e);
          }
        }
        throw new Error(errorMessage);
      }

      // If we get here without a redirect or error, something unexpected happened
      throw new Error("Unexpected server response");
    } catch (error) {
      setFormState({
        status: "error",
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  if (tokenState.status === "loading") {
    return (
      <div className="flex items-center justify-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Verifying reset link...</span>
      </div>
    );
  }

  if (tokenState.status === "invalid") {
    return (
      <div className="space-y-4 w-full max-w-sm">
        <Alert variant="destructive">
          <AlertDescription>{tokenState.message}</AlertDescription>
        </Alert>
        <Button onClick={() => (window.location.href = "/auth/reset-password")} className="w-full">
          Request New Reset Link
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              disabled={formState.status === "submitting"}
              required
              className="w-full pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              disabled={formState.status === "submitting"}
              required
              className="w-full pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
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
