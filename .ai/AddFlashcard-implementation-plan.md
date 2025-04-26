# AddFlashcard Component Implementation Plan

## Overview
This document outlines the implementation plan for the `AddFlashcard` React component. The component enables users to manually add a flashcard via a modal dialog. It uses shadcn/ui for UI components, follows Tailwind CSS styling and adheres to our project's tech stack and coding practices.

## Key Requirements
- **Component Location**: `/src/components/AddFlashcard.tsx`
- **Functionality**:
  - A button that triggers a modal dialog.
  - A modal `FlashcardAddModal` that contains two textareas for flashcard content ("front" and "back") - example modal: `/src/components/FlashcardEditModal.tsx`.
  - A Save button to submit the flashcard and a Cancel button to close the modal.
  - On save, the component should use method `createFlashcards` in `/src/services/flashcrads.service.ts` (ommiting the generation process - generation process, and field `generation_id` is not required when adding flashcard manually)
  - The flashcard should be saved with the `source` field set to `manual`.
- **Tech Stack & Guidelines**:
  - React with TypeScript and Astro integration (Astro hybrid rendering as needed).
  - Use shadcn/ui components for consistency and accessibility.
  - Tailwind CSS for styling.
  - Follow API calling practices and error handling as seen in the endpoint implementations.
  - Adhere to the coding practices with early returns, proper error logging, and clear state management.

## Implementation Steps

### 1. Setup and Imports
- Create the `AddFlashcard.tsx` file in `/src/components` if it doesn't exist.
- Import any relevant types from `/src/types.ts`.

### 2. UI Implementation
- **Main Button**: Render a button that, opens modal.
- **Modal Structure**:
  - Include a header or title (e.g., "Add Flashcard").
  - Render two textareas for the "front" and "back" fields.
  - Include a "Save Flashcard" button to submit the form.
  - Include a "Cancel" button to close the modal without saving.
  - Provide a character counters like in: `/src/components/FlashcardEditModal.tsx`
- Use shadcn/ui components for the modal to ensure consistent style and behavior.

### 3. Service integration - Form Handling & Validation
  - Integrate component with `createFlashcards` in `/src/services/flashcrads.service.ts
  - Validation Rules:

    ```json
  {
    "flashcards": [
      {
        "front": "string (max 200 chars)",
        "back": "string (max 500 chars)",
        "source": "manual",
      }
    ]
  }
  ```

### 6. Error Handling and Loading States
- Provide visual feedback for loading states nad success message (inside modal).
- Provide an inline error messages

### 7. Accessibility and Styling
- Ensure the modal and form elements meet accessibility standards (aria attributes, focus management, etc.).
- Use Tailwind CSS classes and shadcn/ui recommended patterns to style the component.


## Additional Considerations
- Optionally integrate additional UI feedback components from shadcn/ui (e.g., notifications/toasts) to enhance user experience.
- Consider edge cases where users might submit multiple times or navigate away during API calls.

---

This implementation plan provides a clear roadmap for building the `AddFlashcard` component, ensuring consistency with our codebase practices and technologies. 