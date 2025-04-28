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

  /**
   * Gets paginated flashcards for a user with optional filtering and sorting
   */
  async getFlashcards(userId: string, {
    page = 1,
    limit = 20,
    sort = 'created_at',
    order = 'desc',
    source
  }: {
    page?: number;
    limit?: number;
    sort?: 'created_at' | 'updated_at';
    order?: 'asc' | 'desc';
    source?: 'manual' | 'ai-full' | 'ai-edited';
  }) {
    console.log(`Fetching flashcards for user ${userId} with params:`, { page, limit, sort, order, source });

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Start building the query
    let query = this.supabase
      .from('flashcards')
      .select('id, front, back, source, created_at, updated_at, generation_id', { count: 'exact' })
      .eq('user_id', userId);

    // Apply source filter if provided
    if (source) {
      query = query.eq('source', source);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Failed to fetch flashcards:', error);
      throw new Error('Failed to fetch flashcards: ' + error.message);
    }

    // Calculate total pages
    const totalPages = count ? Math.ceil(count / limit) : 0;

    console.log(`Found ${count} flashcards, returning page ${page} of ${totalPages}`);

    return {
      data: data as FlashcardDto[],
      meta: {
        total: count || 0,
        page,
        limit,
        pages: totalPages
      }
    };
  }

  /**
   * Updates a flashcard with new front and/or back text
   * @throws {Error} if flashcard doesn't exist or doesn't belong to the user
   */
  async updateFlashcard(id: number, userId: string, updates: { front?: string; back?: string }): Promise<FlashcardDto> {
    console.log(`Updating flashcard ${id} for user ${userId} with:`, updates);

    // First check if flashcard exists and belongs to the user
    const { data: flashcard, error: findError } = await this.supabase
      .from('flashcards')
      .select('user_id, source')
      .eq('id', id)
      .single();

    if (findError || !flashcard) {
      console.error(`Flashcard ${id} not found:`, findError);
      throw new Error('Flashcard not found');
    }

    if (flashcard.user_id !== userId) {
      console.warn(`User ${userId} attempted to update flashcard ${id} belonging to user ${flashcard.user_id}`);
      throw new Error('Flashcard does not belong to the user');
    }

    // If the source is 'ai-full', update it to 'ai-edited'
    const updateData = {
      ...updates,
      ...(flashcard.source === 'ai-full' ? { source: 'ai-edited' as const } : {})
    };

    // Update the flashcard
    const { data: updatedFlashcard, error: updateError } = await this.supabase
      .from('flashcards')
      .update(updateData)
      .eq('id', id)
      .select('id, front, back, source, created_at, updated_at, generation_id')
      .single();

    if (updateError || !updatedFlashcard) {
      console.error(`Failed to update flashcard ${id}:`, updateError);
      throw new Error('Failed to update flashcard');
    }

    console.log(`Successfully updated flashcard ${id}`);
    return updatedFlashcard as FlashcardDto;
  }

  /**
   * Deletes a flashcard if it belongs to the specified user
   * @throws {Error} if flashcard doesn't exist or doesn't belong to the user
   */
  async deleteFlashcard(id: number, userId: string): Promise<void> {
    console.log(`Deleting flashcard ${id} for user ${userId}`);

    // First check if flashcard exists and belongs to the user
    const { data: flashcard, error: findError } = await this.supabase
      .from('flashcards')
      .select('user_id')
      .eq('id', id)
      .single();

    if (findError || !flashcard) {
      console.error(`Flashcard ${id} not found:`, findError);
      throw new Error('Flashcard not found');
    }

    if (flashcard.user_id !== userId) {
      console.warn(`User ${userId} attempted to delete flashcard ${id} belonging to user ${flashcard.user_id}`);
      throw new Error('Flashcard does not belong to the user');
    }

    // Delete the flashcard
    const { error: deleteError } = await this.supabase
      .from('flashcards')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error(`Failed to delete flashcard ${id}:`, deleteError);
      throw new Error('Failed to delete flashcard');
    }

    console.log(`Successfully deleted flashcard ${id}`);
  }
} 