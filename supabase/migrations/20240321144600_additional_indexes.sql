-- Add composite index for user_id and generation_id combination
CREATE INDEX IF NOT EXISTS idx_flashcards_user_generation ON flashcards (user_id, generation_id);

-- Add index for created_at to optimize sorting by creation date
CREATE INDEX IF NOT EXISTS idx_flashcards_created_at ON flashcards (created_at DESC);

COMMENT ON INDEX idx_flashcards_user_generation IS 'Optimizes combined user and generation filtering';
COMMENT ON INDEX idx_flashcards_created_at IS 'Optimizes sorting by creation date'; 