import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {Alert, AlertDescription } from '../ui/alert';
import { Loader2, MailCheck } from 'lucide-react';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormState = {
  status: 'idle' | 'submitting' | 'success' | 'error';
  message?: string;
};

export function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<FormState>({ status: 'idle' });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate email
    const result = resetPasswordSchema.safeParse({ email });
    if (!result.success) {
      setFormState({
        status: 'error',
        message: result.error.issues[0]?.message || 'Invalid email',
      });
      return;
    }

    setFormState({ status: 'submitting' });

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setFormState({
        status: 'success',
        message: data.message || 'Reset email sent successfully',
      });
      setEmail('');
    } catch (error) {
      setFormState({
        status: 'error',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      {formState.message && (
        <Alert variant={formState.status === 'success' ? 'success' : 'destructive'}>
          <AlertDescription>
            <div className="flex items-center gap-3 text-xl font-bold mb-4">
              <MailCheck className="h-6 w-6 text-green-500" />
              Mail sent
            </div>
              <p>{formState.message}</p>
           
          </AlertDescription>
        </Alert>
      )}
      {formState.status !== 'success' && (
        <>
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={formState.status === 'submitting'}
            required
            className="w-full"
          />
        </div>

        <Button
          type="submit"
          disabled={formState.status === 'submitting'}
          className="w-full"
        >
          {formState.status === 'submitting' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Reset Link
            </>
          ) : (
            'Reset Password'
          )}
        </Button>
        </>
      )}
    </form>
  );
} 