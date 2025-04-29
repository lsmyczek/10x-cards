import type { FlashcardDto } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash, WandSparkles } from 'lucide-react';

interface FlashcardItemProps {
  flashcard: FlashcardDto;
  onEdit: (flashcard: FlashcardDto) => void;
  onDelete: (id: number) => void;
}

export function FlashcardItem({ flashcard, onEdit, onDelete }: FlashcardItemProps) {
  const isAI = flashcard.source === 'ai-full' || flashcard.source === 'ai-edited';
  const isEdited = flashcard.source === 'ai-edited';

  return (
    <Card className="w-full py-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex gap-2">
          {isAI && (
            <Badge className="h-fit">
              <WandSparkles className="h-4 w-4 mr-1" />
              AI Generated
            </Badge>
          )}
          {!isAI && (
            <Badge variant="secondary" className="h-fit">
              Manual
            </Badge>
          )}
          {isEdited && (
            <Badge variant="outline" className="h-fit">
              Edited
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="h-full">
        <div className="flex flex-col space-y-4 h-full">
          <div>
            <h3 className="text-lg font-bold mb-2">Front:</h3>
            <p className="text-muted-foreground">{flashcard.front}</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Back:</h3>
            <p className="text-muted-foreground">{flashcard.back}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => onEdit(flashcard)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="reject">
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your flashcard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(flashcard.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
