import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface GenerationFormProps {
  onSubmit: (sourceText: string) => void;
  isLoading: boolean;
  onReset?: (resetFn: () => void) => void;
}

const MIN_CHARS = 1000;
const MAX_CHARS = 10000;

export function GenerationForm({ onSubmit, isLoading, onReset }: GenerationFormProps) {
  const [sourceText, setSourceText] = useState('');
  const charCount = sourceText.length;
  
  const isValidLength = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  const showError = charCount > 0 && !isValidLength;
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (isValidLength) {
      onSubmit(sourceText);
    }
  }, [sourceText, isValidLength, onSubmit]);

  const reset = useCallback(() => {
    setSourceText('');
  }, []);

  // Expose reset method to parent
  useEffect(() => {
    if (onReset) {
      onReset(reset);
    }
  }, [onReset, reset]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-2xl mx-auto flex flex-col gap-4 pt-4">
        
          <div className="space-y-4">
            <Textarea
              placeholder="Paste your text here (1,000 - 10,000 characters)..."
              className="min-h-[340px] max-h-[340px] text-base bg-white/40 focus:bg-white transition-all rounded-2xl p-6 resize-none shadow-[0_30px_80px_rgba(0,0,0,0.1)]"
              value={sourceText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSourceText(e.target.value)}
              disabled={isLoading}
            />
            
            <div className="flex justify-between text-sm">
              <div className="text-muted-foreground">
                {charCount.toLocaleString()} characters (min. 1000, max. 10000)
              </div>
              
              {showError && (
                <div className="text-destructive">
                  {charCount < MIN_CHARS
                    ? `At least ${MIN_CHARS.toLocaleString()} characters required`
                    : `Maximum ${MAX_CHARS.toLocaleString()} characters allowed`}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-4 mx-auto mt-4">
            <Button
                disabled={sourceText.length === 0 || isLoading}
                variant="outline"
                size="lg"
                onClick={reset}
            >
                Reset form
            </Button>
            <Button
                type="submit"
                disabled={!isValidLength || isLoading}
                size="lg"
            >
                {isLoading ? 'Generating...' : 'Generate Flashcards'}
            </Button>
          </div>
      </div>
    </form>
  );
} 