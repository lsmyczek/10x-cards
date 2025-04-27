import { z } from 'zod';
import type { APIRoute } from 'astro';
import type { CreateFlashcardsCommand, FlashcardsListResponseDto } from '../../types';
import { FlashcardsService } from '../../lib/services/flashcards.service';
import { DEFAULT_USER_ID } from '../../db/supabase.client';

// Schema for query parameters validation
const getFlashcardsQuerySchema = z.object({
  page: z.coerce
    .number()
    .int('Page must be an integer')
    .positive('Page must be positive')
    .optional()
    .default(1),
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(100, 'Maximum limit is 100')
    .optional()
    .default(20),
  sort: z.enum(['created_at', 'updated_at'])
    .optional()
    .default('created_at'),
  order: z.enum(['asc', 'desc'])
    .optional()
    .default('desc'),
  source: z.enum(['manual', 'ai-full', 'ai-edited'])
    .optional()
});

// Schema for single flashcard input validation
const createFlashcardInputSchema = z.object({
  front: z.string()
    .min(1, 'Front text is required')
    .max(200, 'Front text cannot exceed 200 characters')
    .transform(val => val.trim())
    .refine(val => val.length > 0, 'Front text cannot be empty after trimming'),
  back: z.string()
    .min(1, 'Back text is required')
    .max(500, 'Back text cannot exceed 500 characters')
    .transform(val => val.trim())
    .refine(val => val.length > 0, 'Back text cannot be empty after trimming'),
  source: z.enum(['manual', 'ai-full', 'ai-edited'], {
    errorMap: () => ({ message: 'Source must be one of: manual, ai-full, ai-edited' })
  }),
  generation_id: z.number().optional()
}).refine(data => {
  if ((data.source === 'ai-full' || data.source === 'ai-edited') && !data.generation_id) {
    return false;
  }
  return true;
}, {
  message: 'generation_id is required when source is ai-full or ai-edited'
});

// Schema for the entire request body
const createFlashcardsCommandSchema = z.object({
  flashcards: z.array(createFlashcardInputSchema)
    .min(1, 'At least one flashcard is required')
    .max(100, 'Maximum 100 flashcards can be created at once')
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const requestStartTime = performance.now();
  const userId = DEFAULT_USER_ID;

  try {
    const { supabase } = locals;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createFlashcardsCommandSchema.safeParse(body);

    if (!validationResult.success) {
      const requestDuration = performance.now() - requestStartTime;
      console.log(`Request validation failed after ${requestDuration.toFixed(2)}ms`);
      
      return new Response(JSON.stringify({
        error: 'Invalid request data',
        details: validationResult.error.errors
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'X-Request-Duration': requestDuration.toString()
        }
      });
    }

    const command = validationResult.data as CreateFlashcardsCommand;
    const flashcardsService = new FlashcardsService(supabase);

    try {
      const result = await flashcardsService.createFlashcards(command, userId);
      const requestDuration = performance.now() - requestStartTime;
      console.log(`Request completed successfully in ${requestDuration.toFixed(2)}ms`);
      
      return new Response(JSON.stringify(result), {
        status: 201,
        headers: { 
          'Content-Type': 'application/json',
          'X-Request-Duration': requestDuration.toString()
        }
      });
    } catch (error) {
      const requestDuration = performance.now() - requestStartTime;
      console.log(`Request failed after ${requestDuration.toFixed(2)}ms:`, error);

      if (error instanceof Error) {
        if (error.message.includes('Generation not found')) {
          return new Response(JSON.stringify({
            error: 'Generation not found'
          }), {
            status: 404,
            headers: { 
              'Content-Type': 'application/json',
              'X-Request-Duration': requestDuration.toString()
            }
          });
        }
        if (error.message.includes('Generation does not belong to the user')) {
          return new Response(JSON.stringify({
            error: 'Forbidden - Generation does not belong to the user'
          }), {
            status: 403,
            headers: { 
              'Content-Type': 'application/json',
              'X-Request-Duration': requestDuration.toString()
            }
          });
        }
      }
      throw error;
    }
  } catch (error) {
    const requestDuration = performance.now() - requestStartTime;
    console.error(`Request failed with internal error after ${requestDuration.toFixed(2)}ms:`, error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'X-Request-Duration': requestDuration.toString()
      }
    });
  }
};

export const GET: APIRoute = async ({ url, locals }) => {
  const requestStartTime = performance.now();
  const userId = DEFAULT_USER_ID;

  try {
    const { supabase } = locals;

    // Parse and validate query parameters
    const searchParams = Object.fromEntries(url.searchParams);
    const validationResult = getFlashcardsQuerySchema.safeParse(searchParams);

    if (!validationResult.success) {
      const requestDuration = performance.now() - requestStartTime;
      console.log(`Request validation failed after ${requestDuration.toFixed(2)}ms`);
      
      return new Response(JSON.stringify({
        error: 'Invalid query parameters',
        details: validationResult.error.errors
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'X-Request-Duration': requestDuration.toString()
        }
      });
    }

    const params = validationResult.data;
    const flashcardsService = new FlashcardsService(supabase);

    try {
      const result = await flashcardsService.getFlashcards(userId, params);
      const requestDuration = performance.now() - requestStartTime;
      console.log(`Request completed successfully in ${requestDuration.toFixed(2)}ms`);
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'X-Request-Duration': requestDuration.toString()
        }
      });
    } catch (error) {
      const requestDuration = performance.now() - requestStartTime;
      console.error(`Request failed after ${requestDuration.toFixed(2)}ms:`, error);
      throw error;
    }
  } catch (error) {
    const requestDuration = performance.now() - requestStartTime;
    console.error(`Request failed with internal error after ${requestDuration.toFixed(2)}ms:`, error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'X-Request-Duration': requestDuration.toString()
      }
    });
  }
}; 