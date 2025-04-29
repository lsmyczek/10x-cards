import { useEffect, useState, useCallback } from 'react';
import type { FlashcardDto, FlashcardsListResponseDto, FlashcardSource, PaginationMetaDto } from '../types';
import { FlashcardItem } from './FlashcardItem';
import { FlashcardEditModal } from './FlashcardEditModal';
import { toast } from 'sonner';
import { LoadingSkeleton } from './LoadingSkeleton';
import { FlashcardsListSorting, type SortField, type SortOrder } from './FlashcardsListSorting';
import { FlashcardsListFilters } from './FlashcardsListFilters';
import { FlashcardsListPagination } from './FlashcardsListPagination';

export function FlashcardsListView() {
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardDto | null>(null);
  const [sort, setSort] = useState<{ field: SortField; order: SortOrder }>({
    field: 'created_at',
    order: 'desc',
  });
  const [sources, setSources] = useState<FlashcardSource[]>(['manual', 'ai-full', 'ai-edited']);
  const [pagination, setPagination] = useState<PaginationMetaDto>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  });

  // Memoize fetchFlashcards to prevent unnecessary recreations
  const fetchFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      // Add basic query parameters
      queryParams.set('sort', sort.field);
      queryParams.set('order', sort.order);
      queryParams.set('page', pagination.page.toString());
      queryParams.set('limit', pagination.limit.toString());
      
      // Combine sources into a single parameter with comma-separated values
      if (sources.length > 0) {
        queryParams.set('sources', sources.join(','));
      }

      const url = `/api/flashcards?${queryParams}`;
      console.log('Fetching flashcards with URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error('Failed to fetch flashcards');
      }
      
      const data: FlashcardsListResponseDto = await response.json();
      console.log('API Response:', {
        requestUrl: url,
        meta: data.meta,
        dataLength: data.data.length,
        sources,
        currentPage: pagination.page,
        limit: pagination.limit
      });

      setFlashcards(data.data);
      setPagination(prev => ({
        ...data.meta,
        limit: prev.limit // Preserve the limit from state
      }));
      setError(null);
    } catch (err) {
      console.error('Error fetching flashcards:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load flashcards. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sort, sources]);

  // Effect for handling filter and sort changes
  useEffect(() => {
    // Only reset page if we're not already on page 1 and either sort or sources changed
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    } else {
      fetchFlashcards();
    }
  }, [sort, sources]); // Remove pagination.page from dependencies

  // Separate effect for handling page changes
  useEffect(() => {
    fetchFlashcards();
  }, [pagination.page, fetchFlashcards]);

  // Effect for flashcard creation event
  useEffect(() => {
    const handleFlashcardCreated = () => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchFlashcards();
    };

    window.addEventListener('flashcard-created', handleFlashcardCreated);
    return () => {
      window.removeEventListener('flashcard-created', handleFlashcardCreated);
    };
  }, [fetchFlashcards]);

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSort({ field, order });
  };

  const handleFilterChange = (newSources: FlashcardSource[]) => {
    setSources(newSources);
  };

  const handlePageChange = (page: number) => {
    console.log('Changing to page:', page);
    setPagination(prev => ({ ...prev, page }));
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

  const noFlashcards = flashcards.length === 0;

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">My Flashcards</h2>
          <FlashcardsListSorting
            currentSort={sort}
            onSortChange={handleSortChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <FlashcardsListFilters
            currentSources={sources}
            onFilterChange={handleFilterChange}
          />
          <p className="text-sm text-muted-foreground">
            {pagination.total} flashcard{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      {noFlashcards ? (
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-muted-foreground">No flashcards found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
            {flashcards.map((flashcard) => (
              <FlashcardItem
                key={flashcard.id}
                flashcard={flashcard}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <FlashcardsListPagination
              meta={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}

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