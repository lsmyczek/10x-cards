import type { APIRoute } from 'astro';
import { createSupabaseServer } from '../../../db/supabase.server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const supabase = createSupabaseServer({ 
      headers: request.headers,
      cookies: {
        get: (name: string) => cookies.get(name)?.value ?? '',
        set: (name: string, value: string, options?: any) => {
          cookies.set(name, value, options);
        },
      }
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid email or password'
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ 
        user: {
          id: data.user.id,
          email: data.user.email,
        }
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Login error:', err);
    if (err instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: err.errors[0].message 
        }),
        { status: 400 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred during login' 
      }),
      { status: 500 }
    );
  }
}; 