import { WandSparkles, PenLine, Sparkles } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { FlashcardSource } from '@/types';

interface FlashcardsListFiltersProps {
  onFilterChange: (source: FlashcardSource | null) => void;
  currentSource: FlashcardSource | null;
}

export function FlashcardsListFilters({ onFilterChange, currentSource }: FlashcardsListFiltersProps) {
  const handleValueChange = (value: string) => {
    // If the same value is clicked again, clear the filter
    if (value === currentSource) {
      onFilterChange(null);
      return;
    }
    
    // Convert the value to FlashcardSource type
    onFilterChange(value as FlashcardSource);
  };

  return (
    <ToggleGroup
      type="single"
      value={currentSource ?? ''}
      variant="outline"
      onValueChange={handleValueChange}
      className="justify-start w-full md:w-auto"
    >
      <ToggleGroupItem value="ai-full" aria-label="AI generated">
        <Sparkles className="h-4 w-4" />
        AI Full
      </ToggleGroupItem>
      <ToggleGroupItem value="ai-edited" aria-label="AI generated and edited">
        <WandSparkles className="h-4 w-4" />
        AI Edited
      </ToggleGroupItem>
      <ToggleGroupItem value="manual" aria-label="Manually created">
        <PenLine className="h-4 w-4" />
        Manual
      </ToggleGroupItem>
    </ToggleGroup>
  );
} 