import { z } from 'zod';
import type { APIRoute } from 'astro';
import type { UpdateFlashcardCommand } from '../../../types';
import { FlashcardsService } from '../../../lib/services/flashcards.service';
import { DEFAULT_USER_ID } from '../../../db/supabase.client';

// Schema for request body validation
const updateFlashcardSchema = z.object({
  front: z.string()
    .min(1, 'Front text is required')
    .max(200, 'Front text cannot exceed 200 characters')
    .transform(val => val.trim())
    .refine(val => val.length > 0, 'Front text cannot be empty after trimming')
    .optional(),
  back: z.string()
    .min(1, 'Back text is required')
    .max(500, 'Back text cannot exceed 500 characters')
    .transform(val => val.trim())
    .refine(val => val.length > 0, 'Back text cannot be empty after trimming')
    .optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field (front or back) must be provided'
});

export const prerender = false;

export const PATCH: APIRoute = async ({ request, params, locals }) => {
  const requestStartTime = performance.now();
  const userId = DEFAULT_USER_ID;

  try {
    const { supabase } = locals;
    const id = parseInt(params.id || '', 10);

    if (isNaN(id) || id <= 0) {
      const requestDuration = performance.now() - requestStartTime;
      return new Response(JSON.stringify({
        error: 'Invalid flashcard ID',
        details: 'ID must be a positive integer'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'X-Request-Duration': requestDuration.toString()
        }
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateFlashcardSchema.safeParse(body);

    if (!validationResult.success) {
      const requestDuration = performance.now() - requestStartTime;
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

    const command = validationResult.data as UpdateFlashcardCommand;
    const flashcardsService = new FlashcardsService(supabase);

    try {
      const result = await flashcardsService.updateFlashcard(id, userId, command);
      const requestDuration = performance.now() - requestStartTime;
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'X-Request-Duration': requestDuration.toString()
        }
      });
    } catch (error) {
      const requestDuration = performance.now() - requestStartTime;
      
      if (error instanceof Error) {
        if (error.message === 'Flashcard not found') {
          return new Response(JSON.stringify({
            error: 'Flashcard not found'
          }), {
            status: 404,
            headers: { 
              'Content-Type': 'application/json',
              'X-Request-Duration': requestDuration.toString()
            }
          });
        }
        if (error.message === 'Flashcard does not belong to the user') {
          return new Response(JSON.stringify({
            error: 'Forbidden - Flashcard does not belong to the user'
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

export const DELETE: APIRoute = async ({ params, locals }) => {
  const requestStartTime = performance.now();
  const userId = DEFAULT_USER_ID;

  try {
    const { supabase } = locals;
    const id = parseInt(params.id || '', 10);

    if (isNaN(id) || id <= 0) {
      const requestDuration = performance.now() - requestStartTime;
      return new Response(JSON.stringify({
        error: 'Invalid flashcard ID',
        details: 'ID must be a positive integer'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'X-Request-Duration': requestDuration.toString()
        }
      });
    }

    const flashcardsService = new FlashcardsService(supabase);

    try {
      await flashcardsService.deleteFlashcard(id, userId);
      const requestDuration = performance.now() - requestStartTime;
      
      return new Response(null, {
        status: 204,
        headers: { 
          'X-Request-Duration': requestDuration.toString()
        }
      });
    } catch (error) {
      const requestDuration = performance.now() - requestStartTime;
      
      if (error instanceof Error) {
        if (error.message === 'Flashcard not found') {
          return new Response(JSON.stringify({
            error: 'Flashcard not found'
          }), {
            status: 404,
            headers: { 
              'Content-Type': 'application/json',
              'X-Request-Duration': requestDuration.toString()
            }
          });
        }
        if (error.message === 'Flashcard does not belong to the user') {
          return new Response(JSON.stringify({
            error: 'Forbidden - Flashcard does not belong to the user'
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