import type { Tables } from '../../src/db/database.types';

/**
 * DTO and Command Model definitions for the API endpoints.
 * They are derived from the underlying database entities.
 */

/**
 * Core Entity Types
 */
export type Flashcard = Tables<'flashcards'>;
export type Generation = Tables<'generations'>;

/**
 * Common Types
 */
export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

/**
 * Flashcard DTOs
 */
export type FlashcardDto = {
  id: number;
  front: string;
  back: string;
  source: string;
  created_at: string;
  updated_at: string;
  generation_id: number | null;
};

export type FlashcardsListResponseDto = {
  data: FlashcardDto[];
  meta: PaginationMeta;
};

export type CreateFlashcardDto = {
  front: string;
  back: string;
  source: 'manual' | 'ai-full' | 'ai-edited';
  generation_id?: number;
};

export type CreateFlashcardsRequestDto = {
  flashcards: CreateFlashcardDto[];
};

export type CreateFlashcardsResponseDto = {
  data: FlashcardDto[];
  meta: {
    created_count: number;
  };
};

export type UpdateFlashcardDto = {
  front?: string;
  back?: string;
};

/**
 * Generation DTOs
 */
export type CreateGenerationDto = {
  source_text: string;
};

export type GenerationDto = {
  id: number;
  model: string;
  generated_count: number;
  accepted_unedited_count: number | null;
  accepted_edited_count: number | null;
  source_text_length: number;
  generation_duration: number;
  created_at: string;
  updated_at: string;
};

export type FlashcardProposalDto = {
  id: number;
  front: string;
  back: string;
  source: 'ai-full';
};

export type GenerationWithProposalsDto = GenerationDto & {
  status: 'processing' | 'completed' | 'error';
  flashcards_proposals: FlashcardProposalDto[];
};

export type GenerationsListResponseDto = {
  data: GenerationDto[];
  meta: PaginationMeta;
};

export type GenerationFlashcardsResponseDto = {
  data: FlashcardDto[];
};

/**
 * Approval DTOs
 */
export type ApproveFlashcardDto = {
  id: number;
  front?: string;
  back?: string;
};

export type ApproveFlashcardsRequestDto = {
  flashcards: ApproveFlashcardDto[];
};

export type ApproveFlashcardsResponseDto = {
  approved_count: number;
  generation: {
    id: number;
    accepted_unedited_count: number;
    accepted_edited_count: number;
    updated_at: string;
  };
};

/**
 * API Query Parameters
 */
export type FlashcardsQueryParams = {
  page?: number;
  limit?: number;
  sort?: 'created_at' | 'updated_at';
  order?: 'asc' | 'desc';
  source?: string;
};

export type GenerationsQueryParams = {
  page?: number;
  limit?: number;
}; 