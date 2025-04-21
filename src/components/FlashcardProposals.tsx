import type { FlashcardProposalViewModel } from './FlashcardGenerator';
import { FlashcardProposalsItem } from './FlashcardProposalsItem';

interface FlashcardProposalsProps {
  flashcards: FlashcardProposalViewModel[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onEdit: (id: number, front: string, back: string) => void;
}

export function FlashcardProposals({ flashcards, onAccept, onReject, onEdit }: FlashcardProposalsProps) {
  if (flashcards.length === 0) {
    return null;
  }

  return (
      <div className="grid grid-cols-3 gap-6">
        {flashcards.map((flashcard) => (
          <FlashcardProposalsItem
            key={flashcard.id}
            flashcard={flashcard}
            onAccept={onAccept}
            onReject={onReject}
            onEdit={onEdit}
          />
        ))}
      </div>
  );
} 