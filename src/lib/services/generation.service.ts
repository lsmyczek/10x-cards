import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreateGenerationCommand, GenerationDto, FlashcardProposalDto } from '../../types';
import { createHash } from '../utils/hash';

// Rate limiting configuration
const RATE_LIMIT = {
  MAX_REQUESTS: 200,
  WINDOW_HOURS: 24
};

export class GenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'GENERATION_ERROR',
    public readonly status: number = 500
  ) {
    super(message);
    this.name = 'GenerationError';
  }
}

export class GenerationService {
  constructor(private readonly supabase: SupabaseClient) {}

  async createGeneration(command: CreateGenerationCommand, userId: string): Promise<GenerationDto> {
    const startTime = Date.now();
    
    try {
      // Check rate limit
      await this.checkRateLimit(userId);
      
      // TODO: Replace with actual AI service call
      const mockProposals = this.generateMockProposals();
      const generationDuration = Date.now() - startTime;
      
      // Create generation record in database
      const sourceTextHash = await createHash(command.source_text);
      
      const { data: generation, error: insertError } = await this.supabase
        .from('generations')
        .insert({
          user_id: userId,
          model: 'gpt-4-dev-mock',
          generated_count: mockProposals.length,
          source_text_hash: sourceTextHash,
          source_text_length: command.source_text.length,
          generation_duration: generationDuration
        })
        .select()
        .single();

      if (insertError) {
        throw new GenerationError(
          'Failed to create generation record',
          'DB_INSERT_ERROR',
          500
        );
      }

      return {
        id: generation.id,
        model: generation.model,
        generated_count: generation.generated_count,
        source_text_length: generation.source_text_length,
        generation_duration: generation.generation_duration,
        created_at: generation.created_at,
        status: 'completed',
        flashcards_proposals: mockProposals
      };
    } catch (error) {
      // Log error and create error log record
      console.error('Generation service error:', error);
      await this.createErrorLog(error, command, userId);
      
      if (error instanceof GenerationError) {
        throw error;
      }
      
      throw new GenerationError(
        'Failed to process generation request',
        'UNKNOWN_ERROR',
        500
      );
    }
  }

  private async checkRateLimit(userId: string): Promise<void> {
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - RATE_LIMIT.WINDOW_HOURS);

    const { count, error: countError } = await this.supabase
      .from('generations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', windowStart.toISOString());

    if (countError) {
      throw new GenerationError(
        'Failed to check rate limit',
        'RATE_LIMIT_CHECK_ERROR',
        500
      );
    }

    if ((count ?? 0) >= RATE_LIMIT.MAX_REQUESTS) {
      throw new GenerationError(
        `Rate limit exceeded. Maximum ${RATE_LIMIT.MAX_REQUESTS} requests allowed per ${RATE_LIMIT.WINDOW_HOURS} hours.`,
        'RATE_LIMIT_EXCEEDED',
        429
      );
    }
  }

  private async createErrorLog(error: any, command: CreateGenerationCommand, userId: string) {
    try {
      const sourceTextHash = await createHash(command.source_text);
      
      await this.supabase
        .from('generations_error_logs')
        .insert({
          user_id: userId,
          error_code: error instanceof GenerationError ? error.code : 'UNKNOWN_ERROR',
          error_message: error.message || 'Unknown error',
          model: 'gpt-4-dev-mock',
          source_text_hash: sourceTextHash,
          source_text_length: command.source_text.length
        });
    } catch (logError) {
      console.error('Failed to create error log:', logError);
    }
  }

  private generateMockProposals(): FlashcardProposalDto[] {
    // Mock data for development
    return [
      {
        id: 1,
        front: 'What is TypeScript?',
        back: 'TypeScript is a strongly typed programming language that builds on JavaScript.',
        source: 'ai-full'
      },
      {
        id: 2,
        front: 'What are the benefits of using TypeScript?',
        back: 'Better IDE support, early error detection, and improved maintainability through static typing.',
        source: 'ai-full'
      },
      {
        id: 3,
        front: 'What is the difference between TypeScript and JavaScript?',
        back: 'TypeScript is a statically typed superset of JavaScript that adds type safety and tooling to the language.',
        source: 'ai-full'
      },
      {
        id: 4,
        front: 'What is the difference between TypeScript and JavaScript?',
        back: 'TypeScript is a statically typed superset of JavaScript that adds type safety and tooling to the language.',
        source: 'ai-full'
      },
      {
        id: 5,
        front: 'What is the difference between TypeScript and JavaScript?',
        back: 'TypeScript is a statically typed superset of JavaScript that adds type safety and tooling to the language.',
        source: 'ai-full'
      },
      {
        id: 6,
        front: 'What is the difference between TypeScript and JavaScript?',
        back: 'TypeScript is a statically typed superset of JavaScript that adds type safety and tooling to the language.',
        source: 'ai-full'
      }
    ];
  }
} 