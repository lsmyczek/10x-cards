import { useState, useCallback } from 'react';
import type { FlashcardProposalDto, GenerationDto, CreateFlashcardInput } from '@/types';
import { GenerationForm } from './GenerationForm';
import { LoadingGenerationsSkeleton } from './LoadingGenerationsSkeleton';
import { FlashcardProposals } from './FlashcardProposals';
import { SaveButtons } from './SaveButtons';
import { toast } from 'sonner';

export interface FlashcardProposalViewModel extends FlashcardProposalDto {
  accepted: boolean;
  rejected: boolean;
  edited: boolean;
}

export function FlashcardGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [flashcardProposals, setFlashcardProposals] = useState<FlashcardProposalViewModel[]>([]);
  const [formReset, setFormReset] = useState<() => void>(() => {});

  const handleGenerateFlashcards = async (sourceText: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setFlashcardProposals([]);
      setGenerationId(null);
      
      const response = await fetch('/api/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source_text: sourceText }),
      });

      if (!response.ok) {
        if (response.status === 429) {
            console.log(response)
          throw new Error('Generations limit exceeded');
        }
        throw new Error('Failed to generate flashcards. Please try again.');
      }

      const data: GenerationDto = await response.json();
      setGenerationId(data.id);
      
      // Transform proposals to view model with acceptance/edit state
      const proposals: FlashcardProposalViewModel[] = data.flashcards_proposals.map(proposal => ({
        ...proposal,
        accepted: false,
        rejected: false,
        edited: false,
      }));

      setFlashcardProposals(proposals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = (id: number) => {
    setFlashcardProposals(cards =>
      cards.map(card =>
        card.id === id
          ? { ...card, accepted: !card.accepted, rejected: false }
          : card
      )
    );
  };

  const handleReject = (id: number) => {
    setFlashcardProposals(cards =>
      cards.map(card =>
        card.id === id
          ? { ...card, rejected: !card.rejected, accepted: false }
          : card
      )
    );
  };

  const handleEdit = (id: number, front: string, back: string) => {
    setFlashcardProposals(cards =>
      cards.map(card =>
        card.id === id ? { ...card, front, back, edited: true } : card
      )
    );
  };

  const handleSave = async (cardsToSave: FlashcardProposalViewModel[]) => {
    if (!generationId) {
      setError('Generation ID is missing. Please try generating flashcards again.');
      return;
    }

    // Filter out any rejected cards from saving
    const acceptedCards = cardsToSave.filter(card => card.accepted);

    if (acceptedCards.length === 0) {
      setError('No accepted flashcards to save.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const flashcardsToCreate: CreateFlashcardInput[] = acceptedCards.map(card => ({
        front: card.front,
        back: card.back,
        source: card.edited ? 'ai-edited' : 'ai-full',
        generation_id: generationId,
      }));

      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flashcards: flashcardsToCreate }),
      });

      if (!response.ok) {
        throw new Error('Failed to save flashcards. Please try again.');
      }

      const result = await response.json();
      
      // Remove saved and rejected cards from the list
      setFlashcardProposals(cards =>
        cards.filter(card => 
          !acceptedCards.some(saved => saved.id === card.id) && 
          !card.rejected
        )
      );

      // Reset form if no cards left
      if (flashcardProposals.length === acceptedCards.length) {
        formReset();
        setGenerationId(null);
      }

      // Show success toast
      toast.success('Flashcards saved successfully', {
        description: `${result.meta.created_count} flashcard${result.meta.created_count !== 1 ? 's' : ''} have been saved to your collection.`
      });
      formReset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while saving');
      toast.error('Failed to save flashcards', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred while saving'
      });
    } finally {
      setIsSaving(false);
    }
  };

const handleFormReset = useCallback((resetFn: () => void) => {
    setFormReset(() => resetFn);
  }, []);

  return (
    <div className="container mx-auto max-w-[1400px]space-y-8 pb-16">
      <GenerationForm 
        onSubmit={handleGenerateFlashcards} 
        isLoading={isLoading}
        onReset={handleFormReset}
      />
      
      {error && (
        <div className="p-4 border border-destructive rounded-lg bg-destructive/10 text-destructive">
          {error}
        </div>
      )}
      
      {isLoading && <LoadingGenerationsSkeleton />}
      
      {!isLoading && flashcardProposals.length > 0 && (
        <>
          <div className="flex items-center justify-between border-t pt-6 mt-12">
            <h2 className="text-xl font-semibold">Generated Flashcards</h2>
            <p className="text-sm text-muted-foreground">
              {flashcardProposals.length} proposal{flashcardProposals.length !== 1 ? 's' : ''}
            </p>
          </div>
          <SaveButtons
            flashcards={flashcardProposals}
            onSave={handleSave}
            isSaving={isSaving}
          />
          <FlashcardProposals
            flashcards={flashcardProposals}
            onAccept={handleAccept}
            onReject={handleReject}
            onEdit={handleEdit}
          />
        </>
      )}
    </div>
  );
} 