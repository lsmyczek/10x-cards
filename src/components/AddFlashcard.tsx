import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FlashcardAddModal } from "./FlashcardAddModal";

export function AddFlashcard() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="navigation"
        // size="sm"
        className="gap-2 group"
      >
        <Plus className="h-4 w-4 text-white opacity-60 group-hover:opacity-100 transition-opacity" />
        Add Flashcard
      </Button>

      <FlashcardAddModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
