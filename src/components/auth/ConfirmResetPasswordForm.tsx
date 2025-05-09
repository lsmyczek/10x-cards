import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

const confirmResetSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be less than 72 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormState = {
  status: 'idle' | 'submitting' | 'success' | 'error';
  message?: string;
};

export function ConfirmResetPasswordForm() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [formState, setFormState] = useState<FormState>({ status: 'idle' });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form data
    const result = confirmResetSchema.safeParse(formData);
    if (!result.success) {
      setFormState({
        status: 'error',
        message: result.error.issues[0]?.message || 'Invalid password',
      });
      return;
    }

    setFormState({ status: 'submitting' });

    try {
      // Get the token from the URL
      const params = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');

      if (!accessToken || !type || type !== 'recovery') {
        throw new Error('Invalid or missing reset token');
      }

      const response = await fetch('/auth/confirm-reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          password: formData.password,
          refreshToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setFormState({
        status: 'success',
        message: 'Password reset successfully. Redirecting to login...',
      });

      // Clear form
      setFormData({ password: '', confirmPassword: '' });

      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/auth/sign-in';
      }, 2000);
    } catch (error) {
      setFormState({
        status: 'error',
        message: error instanceof Error ? error.message : 'An error occurred',
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
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            disabled={formState.status === 'submitting'}
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
            }
            disabled={formState.status === 'submitting'}
            required
            className="w-full"
          />
        </div>
      </div>

      {formState.message && (
        <Alert variant={formState.status === 'success' ? 'default' : 'destructive'}>
          <AlertDescription>{formState.message}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={formState.status === 'submitting'}
        className="w-full"
      >
        {formState.status === 'submitting' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Resetting Password
          </>
        ) : (
          'Set New Password'
        )}
      </Button>
    </form>
  );
} 