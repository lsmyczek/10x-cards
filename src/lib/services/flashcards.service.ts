import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreateFlashcardsCommand, FlashcardDto } from '../../types';

export class FlashcardsService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Verifies if the given generation belongs to the specified user
   * @throws {Error} if generation doesn't exist or doesn't belong to the user
   */
  private async verifyGenerationOwnership(generationId: number, userId: string): Promise<void> {
    console.log(`Verifying ownership of generation ${generationId} for user ${userId}`);
    
    const { data: generation, error } = await this.supabase
      .from('generations')
      .select('user_id')
      .eq('id', generationId)
      .single();

    if (error || !generation) {
      console.error(`Generation ${generationId} not found:`, error);
      throw new Error('Generation not found');
    }

    if (generation.user_id !== userId) {
      console.warn(`User ${userId} attempted to access generation ${generationId} belonging to user ${generation.user_id}`);
      throw new Error('Generation does not belong to the user');
    }

    console.log(`Generation ${generationId} ownership verified for user ${userId}`);
  }

  /**
   * Creates multiple flashcards in a single transaction
   * @returns Created flashcards and count
   */
  async createFlashcards(command: CreateFlashcardsCommand, userId: string): Promise<{
    data: FlashcardDto[];
    meta: { created_count: number };
  }> {
    console.log(`Creating ${command.flashcards.length} flashcards for user ${userId}`);
    
    // Verify all generations belong to the user
    const generationIds = [...new Set(
      command.flashcards
        .filter(f => f.generation_id)
        .map(f => f.generation_id!)
    )];

    console.log(`Verifying ownership of ${generationIds.length} generations`);
    for (const generationId of generationIds) {
      await this.verifyGenerationOwnership(generationId, userId);
    }

    // Create flashcards in a transaction
    console.log('Starting flashcard creation transaction');
    const { data, error } = await this.supabase
      .from('flashcards')
      .insert(
        command.flashcards.map(flashcard => ({
          ...flashcard,
          user_id: userId
        }))
      )
      .select('id, front, back, source, created_at, updated_at, generation_id');

    if (error) {
      console.error('Failed to create flashcards:', error);
      throw new Error('Failed to create flashcards: ' + error.message);
    }

    console.log(`Successfully created ${data.length} flashcards`);
    return {
      data: data as FlashcardDto[],
      meta: {
        created_count: data.length
      }
    };
  }
} 