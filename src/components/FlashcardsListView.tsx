import { useEffect, useState } from 'react';
import type { FlashcardDto, FlashcardsListResponseDto } from '../types';
import { FlashcardItem } from './FlashcardItem';
import { FlashcardEditModal } from './FlashcardEditModal';
import { toast } from 'sonner';
import { LoadingSkeleton } from './LoadingSkeleton';

export function FlashcardsListView() {
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardDto | null>(null);

  useEffect(() => {
    // Add event listener for flashcard creation
    const handleFlashcardCreated = () => {
      fetchFlashcards();
    };

    window.addEventListener('flashcard-created', handleFlashcardCreated);

    // Initial fetch
    fetchFlashcards();

    // Cleanup
    return () => {
      window.removeEventListener('flashcard-created', handleFlashcardCreated);
    };
  }, []);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/flashcards');
      if (!response.ok) {
        throw new Error('Failed to fetch flashcards');
      }
      const data: FlashcardsListResponseDto = await response.json();
      setFlashcards(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load flashcards. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (flashcard: FlashcardDto) => {
    setSelectedFlashcard(flashcard);
    setEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete flashcard');
      }

      setFlashcards((prev) => prev.filter((f) => f.id !== id));
      toast.success('Flashcard deleted successfully');
    } catch (err) {
      toast.error('Failed to delete flashcard. Please try again.');
    }
  };

  const handleSave = async (front: string, back: string) => {
    if (!selectedFlashcard) return;

    try {
      const response = await fetch(`/api/flashcards/${selectedFlashcard.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ front, back }),
      });

      if (!response.ok) {
        throw new Error('Failed to update flashcard');
      }

      const updated = await response.json();
      setFlashcards((prev) =>
        prev.map((f) => (f.id === selectedFlashcard.id ? updated : f))
      );
      setEditModalOpen(false);
      toast.success('Flashcard updated successfully');
    } catch (err) {
      toast.error('Failed to update flashcard. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flashcards.map((flashcard) => (
          <FlashcardItem
            key={flashcard.id}
            flashcard={flashcard}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <FlashcardEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSave}
        initialFront={selectedFlashcard?.front ?? ''}
        initialBack={selectedFlashcard?.back ?? ''}
      />
    </div>
  );
} 