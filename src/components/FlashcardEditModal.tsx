import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface FlashcardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (front: string, back: string) => void;
  initialFront: string;
  initialBack: string;
}

const MAX_FRONT_CHARS = 200;
const MAX_BACK_CHARS = 500;

export function FlashcardEditModal({
  isOpen,
  onClose,
  onSave,
  initialFront,
  initialBack,
}: FlashcardEditModalProps) {
  const [front, setFront] = useState(initialFront);
  const [back, setBack] = useState(initialBack);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFront(initialFront);
      setBack(initialBack);
      setError(null);
    }
  }, [isOpen, initialFront, initialBack]);

  const handleSave = () => {
    if (front.length > MAX_FRONT_CHARS) {
      setError(`Front side cannot exceed ${MAX_FRONT_CHARS} characters`);
      return;
    }
    if (back.length > MAX_BACK_CHARS) {
      setError(`Back side cannot exceed ${MAX_BACK_CHARS} characters`);
      return;
    }
    if (front.trim() === '' || back.trim() === '') {
      setError('Both sides must contain text');
      return;
    }

    onSave(front, back);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Flashcard</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="front">
              Front Side <span className="text-muted-foreground text-sm">({front.length}/{MAX_FRONT_CHARS})</span>
            </Label>
            <Textarea
              id="front"
              value={front}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFront(e.target.value)}
              placeholder="Question or prompt"
              className="resize-none max-h-[70px] min-h-[70px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="back">
              Back Side <span className="text-muted-foreground text-sm">({back.length}/{MAX_BACK_CHARS})</span>
            </Label>
            <Textarea
              id="back"
              value={back}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBack(e.target.value)}
              placeholder="Answer or explanation"
              className="resize-none max-h-[120px] min-h-[120px]"
            />
          </div>

          {error && (
            <div className="text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 