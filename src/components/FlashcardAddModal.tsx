import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { FlashcardProposalDto, GenerationDto, CreateFlashcardInput } from "@/types";

const MAX_FRONT_CHARS = 200;
const MAX_BACK_CHARS = 500;

interface FlashcardAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FlashcardAddModal({ isOpen, onClose }: FlashcardAddModalProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setFront("");
    setBack("");
    setError(null);
    onClose();
  };

  const validateForm = (): boolean => {
    if (front.trim() === "" || back.trim() === "") {
      setError("Both sides must contain text");
      return false;
    }
    if (front.length > MAX_FRONT_CHARS) {
      setError(`Front side cannot exceed ${MAX_FRONT_CHARS} characters`);
      return false;
    }
    if (back.length > MAX_BACK_CHARS) {
      setError(`Back side cannot exceed ${MAX_BACK_CHARS} characters`);
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    try {
      if (!validateForm()) return;

      setIsLoading(true);
      setError(null);

      const flashcardToCreate: CreateFlashcardInput[] = [
        {
          front: front.trim(),
          back: back.trim(),
          source: "manual",
        },
      ];

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flashcards: flashcardToCreate }),
      });

      if (!response.ok) {
        throw new Error("Failed to save flashcards. Please try again.");
      }
      window.dispatchEvent(new Event("flashcard-created"));
      toast.success("Flashcard created successfully");
      handleClose();
    } catch (err) {
      console.error("Failed to create flashcard:", err);
      setError(err instanceof Error ? err.message : "Failed to create flashcard");
      toast.error("Error", {
        description: "Failed to create flashcard. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Flashcard</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="front">
              Front Side{" "}
              <span className="text-muted-foreground text-sm">
                ({front.length}/{MAX_FRONT_CHARS})
              </span>
            </Label>
            <Textarea
              id="front"
              value={front}
              onChange={(e) => {
                setFront(e.target.value);
                setError(null);
              }}
              placeholder="Question or prompt"
              className="resize-none max-h-[70px] min-h-[70px] max-w-full"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="back">
              Back Side{" "}
              <span className="text-muted-foreground text-sm">
                ({back.length}/{MAX_BACK_CHARS})
              </span>
            </Label>
            <Textarea
              id="back"
              value={back}
              onChange={(e) => {
                setBack(e.target.value);
                setError(null);
              }}
              placeholder="Answer or explanation"
              className="resize-none max-h-[120px] min-h-[120px]"
              disabled={isLoading}
            />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Flashcard"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
