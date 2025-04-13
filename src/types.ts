// DTO and Command Models for API

// Common type for flashcard source based on database definition
export type FlashcardSource = 'manual' | 'ai-full' | 'ai-edited';

// Pagination metadata type used in list responses
export interface PaginationMetaDto {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Flashcard DTO representing flashcard data from the database (omitting sensitive user_id)
export interface FlashcardDto {
  id: number;
  front: string;
  back: string;
  source: FlashcardSource;
  created_at: string;
  updated_at: string;
  generation_id: number | null;
}

// Command Model for creating a flashcard (used in POST /api/flashcards)
export interface CreateFlashcardInput {
  front: string;
  back: string;
  source: FlashcardSource; // must be 'manual', 'ai-full', or 'ai-edited'
  generation_id?: number; // required for ai-full and ai-edited flashcards
}

// Command Model for bulk creation of flashcards
export interface CreateFlashcardsCommand {
  flashcards: CreateFlashcardInput[];
}

// Command Model for updating an existing flashcard (used in PATCH /api/flashcards/:id)
export interface UpdateFlashcardCommand {
  front?: string;
  back?: string;
}

// DTO for flashcards list response
export interface FlashcardsListResponseDto {
  data: FlashcardDto[];
  meta: PaginationMetaDto;
}

// Flashcard Proposal DTO for AI generated flashcard proposals (always with source 'ai-full')
export interface FlashcardProposalDto {
  id: number;
  front: string;
  back: string;
  source: 'ai-full';
}

// Command Model for creating a generation request (used in POST /api/generations)
export interface CreateGenerationCommand {
  source_text: string; // expected length between 1000 and 10000 characters
}

// DTO for generation creation response, including flashcard proposals
export interface GenerationDto {
  id: number;
  model: string;
  generated_count: number;
  source_text_length: number;
  generation_duration: number;
  created_at: string;
  status: 'processing' | 'completed' | 'error';
  flashcards_proposals: FlashcardProposalDto[];
}

// DTO for generation list item and detail (used in GET /api/generations and GET /api/generations/:id)
export interface GenerationListItemDto {
  id: number;
  model: string;
  generated_count: number;
  accepted_unedited_count: number | null;
  accepted_edited_count: number | null;
  source_text_length: number;
  generation_duration: number;
  created_at: string;
  updated_at: string;
}

// DTO for generations list response
export interface GenerationsListResponseDto {
  data: GenerationListItemDto[];
  meta: PaginationMetaDto;
}

// DTO for generation error log (from generations_error_logs table)
export interface GenerationErrorLogDto {
  id: number;
  created_at: string;
  error_code: string;
  error_message: string;
  model: string;
  source_text_hash: string;
  source_text_length: number;
  user_id: string;
}

// DTO for generations error logs list response
export interface GenerationErrorLogsListResponseDto {
  data: GenerationErrorLogDto[];
  meta: PaginationMetaDto;
}
