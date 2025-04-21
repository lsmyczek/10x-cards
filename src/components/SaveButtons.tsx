import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import type { FlashcardProposalViewModel } from './FlashcardGenerator';

interface SaveButtonsProps {
  flashcards: FlashcardProposalViewModel[];
  onSave: (flashcards: FlashcardProposalViewModel[]) => void;
  isSaving: boolean;
}

export function SaveButtons({ flashcards, onSave, isSaving }: SaveButtonsProps) {
  const acceptedCards = flashcards.filter(card => card.accepted);
  const unrejectedCards = flashcards.filter(card => !card.rejected);
  const hasAcceptedCards = acceptedCards.length > 0;
  const hasCards = flashcards.length > 0;

  if (!hasCards) {
    return null;
  }

  const handleSaveAll = () => {
    // Mark all cards as accepted
    const allCardsAccepted = unrejectedCards.map(card => ({
      ...card,
      accepted: true,
      rejected: false
    }));
    onSave(allCardsAccepted);
  };

  return (
    <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
      <div className="text-sm text-muted-foreground">
        <p>{acceptedCards.length} of {flashcards.length} flashcards accepted</p>
      </div>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={handleSaveAll}
          disabled={!hasCards || isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          Save All Unrejected ({unrejectedCards.length})
        </Button>

        <Button
          onClick={() => onSave(acceptedCards)}
          disabled={!hasAcceptedCards || isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Accepted'}
        </Button>
      </div>
    </div>
  );
} 