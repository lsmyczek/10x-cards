import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  return (
    <form className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="Enter your email"
          required
        />
      </div>
      <div className="flex justify-end items-center text-sm">
        <a href="/auth/sign-in" className="text-primary hover:underline">
          Back to Sign In
        </a>
      </div>
      <Button type="submit" className="w-full">
        Reset Password
      </Button>
    </form>
  );
} 