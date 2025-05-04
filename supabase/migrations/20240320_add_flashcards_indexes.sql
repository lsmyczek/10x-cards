-- Add index for faster generation ownership checks
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations (user_id);

-- Add index for faster flashcard queries by user
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards (user_id);

-- Add index for faster flashcard queries by generation
CREATE INDEX IF NOT EXISTS idx_flashcards_generation_id ON flashcards (generation_id);

-- Add composite index for user_id and generation_id combination
CREATE INDEX IF NOT EXISTS idx_flashcards_user_generation ON flashcards (user_id, generation_id);

-- Add index for created_at to optimize sorting by creation date
CREATE INDEX IF NOT EXISTS idx_flashcards_created_at ON flashcards (created_at DESC);

COMMENT ON INDEX idx_generations_user_id IS 'Optimizes generation ownership verification queries';
COMMENT ON INDEX idx_flashcards_user_id IS 'Optimizes flashcard queries filtered by user';
COMMENT ON INDEX idx_flashcards_generation_id IS 'Optimizes flashcard queries filtered by generation';
COMMENT ON INDEX idx_flashcards_user_generation IS 'Optimizes combined user and generation filtering';
COMMENT ON INDEX idx_flashcards_created_at IS 'Optimizes sorting by creation date'; 