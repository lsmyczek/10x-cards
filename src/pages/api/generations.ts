import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { CreateGenerationCommand } from '../../types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { GenerationService, GenerationError } from '../../lib/services/generation.service';
import { DEFAULT_USER_ID } from '../../db/supabase.client';

// Disable static pre-rendering for this endpoint
export const prerender = false;

// Input validation schema
const createGenerationSchema = z.object({
  source_text: z.string()
    .min(1000, 'Source text must be at least 1000 characters long')
    .max(10000, 'Source text cannot exceed 10000 characters')
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get supabase client from context
    const supabase = locals.supabase as SupabaseClient;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createGenerationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(JSON.stringify({ 
        error: 'Invalid input',
        details: validationResult.error.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const command = validationResult.data as CreateGenerationCommand;
    const generationService = new GenerationService(supabase);
    
    const result = await generationService.createGeneration(
      command,
      DEFAULT_USER_ID
    );

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing generation request:', error);

    if (error instanceof GenerationError) {
      return new Response(JSON.stringify({ 
        error: error.code,
        message: error.message 
      }), {
        status: error.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 