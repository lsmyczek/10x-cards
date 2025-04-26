import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Pencil, Trash } from 'lucide-react';
import type { FlashcardProposalViewModel } from './FlashcardGenerator';
import { FlashcardEditModal } from './FlashcardEditModal';
import { cn } from '@/lib/utils';

interface FlashcardProposalsItemProps {
  flashcard: FlashcardProposalViewModel;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onEdit: (id: number, front: string, back: string) => void;
}

export function FlashcardProposalsItem({ flashcard, onAccept, onReject, onEdit }: FlashcardProposalsItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const cardClassName = cn(
    'transition-colors duration-200',
    {
      'border-green-200 bg-gradient-to-b from-green-50/50 to-transparent': flashcard.accepted,
      'border-red-200 bg-gradient-to-b from-red-50/50 to-transparent': !flashcard.accepted && flashcard.rejected,
    }
  );

  return (
    <>
      <Card className={cardClassName}>
        <CardContent className="p-6 h-full">
          <div className="flex flex-col space-y-4 h-full">
            <div>
              <h3 className="font-medium mb-2">Front</h3>
              <p className="text-muted-foreground">{flashcard.front}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Back</h3>
              <p className="text-muted-foreground">{flashcard.back}</p>
            </div>

            <div className="flex justify-end space-x-2 mt-auto mb-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                disabled={flashcard.accepted || flashcard.rejected}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              <Button
                variant={flashcard.rejected ? "reject" : "outline-reject"}
                size="sm"
                onClick={() => onReject(flashcard.id)}
                disabled={flashcard.accepted}
              >
                <Trash className="h-4 w-4 mr-2" />
                {flashcard.rejected ? 'Rejected' : 'Reject'}
              </Button>
              
              <Button
                variant={flashcard.accepted ? "accept" : "outline-accept"}
                size="sm"
                onClick={() => onAccept(flashcard.id)}
                disabled={flashcard.rejected}
              >
                <Check className="h-4 w-4 mr-2" />
                {flashcard.accepted ? 'Accepted' : 'Accept'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <FlashcardEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(front, back) => {
          onEdit(flashcard.id, front, back);
          setIsEditModalOpen(false);
        }}
        initialFront={flashcard.front}
        initialBack={flashcard.back}
      />
    </>
  );
} 