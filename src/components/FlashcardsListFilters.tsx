import { WandSparkles, PenLine } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { FlashcardSource } from '@/types';

interface FlashcardsListFiltersProps {
  onFilterChange: (sources: FlashcardSource[]) => void;
  currentSources: FlashcardSource[];
}

export function FlashcardsListFilters({ onFilterChange, currentSources }: FlashcardsListFiltersProps) {
  const handleValueChange = (value: string[]) => {
    const sources: FlashcardSource[] = [];
    
    if (value.includes('ai')) {
      sources.push('ai-full', 'ai-edited');
    }
    if (value.includes('manual')) {
      sources.push('manual');
    }
    
    // If no filters selected, show all
    if (value.length === 0) {
      sources.push('manual', 'ai-full', 'ai-edited');
    }
    
    onFilterChange(sources);
  };

  // Convert current sources to toggle values
  const currentValues = Array.from(new Set(
    currentSources.map(source => source === 'ai-full' || source === 'ai-edited' ? 'ai' : 'manual')
  ));

  return (
    <ToggleGroup
      type="multiple"
      value={currentValues}
      onValueChange={handleValueChange}
      className="justify-start"
    >
      <ToggleGroupItem value="ai" aria-label="Toggle AI generated">
        <WandSparkles className="h-4 w-4 mr-2" />
        AI
      </ToggleGroupItem>
      <ToggleGroupItem value="manual" aria-label="Toggle manually created">
        <PenLine className="h-4 w-4 mr-2" />
        Manual
      </ToggleGroupItem>
    </ToggleGroup>
  );
} 