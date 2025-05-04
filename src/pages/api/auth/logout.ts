import type { APIRoute } from 'astro';
import { createSupabaseServer } from '../../../db/supabase.server';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createSupabaseServer({ 
    headers: request.headers,
    cookies: {
      get: (name: string) => cookies.get(name)?.value ?? '',
      set: (name: string, value: string, options?: any) => {
        cookies.set(name, value, options);
      },
    }
  });

  const { error } = await supabase.auth.signOut();

  if (error) {
    // Log the error with relevant context but without sensitive data
    console.error('Logout failed:', {
      error: error.message,
      timestamp: new Date().toISOString(),
      path: '/api/auth/logout',
      statusCode: 400
    });

    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return redirect('/', 302);
}; 