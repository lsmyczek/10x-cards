# FlashcardsListView Feature Implementation Plan

This document defines the steps required to enhance the `FlashcardsListView.tsx` React typescript component by integrating sorting, filtering, and pagination functionalities as per the enhancements outlined in `.ai/GET-edpoint-features-plan.md`.

## 1. Overview
- Enhance the `FlashcardsListView` component by adding separate sub-components for Sorting, Filtering, and Pagination.
- Integrate these components with the GET `/api/flashcards` endpoint to support dynamic querying based on user interactions.

## 2. Rules of implementation
- **Tech Stack Compliance:**
  - Follow the guidelines for Astro 5, TypeScript 5, React 19, Tailwind 4, and Shadcn/ui.
- **Coding Practices:**
  - Ensure code is clean, maintainable, and follows error handling best practices.
  - Use early returns and guard clauses as needed.

## 3. Implementation steps

### 1. Sorting
- **Component Name:** `FlashcardsListSorting`
- **UI:** Use the Shadcn/ui `select` component.
- **Logic:**
  - Allow selection of sorting fields (`created_at`, `updated_at`).
  - Default sort order should be `desc`.
  - On option change, update the parent state and re-fetch flashcards with the selected sort parameters.

### 2. Filtering
- **Component Name:** `FlashcardsListFilters`
- **UI:** Use the Shadcn/ui `toggle group` component with two toggles: "AI" and "Manual".
- **Logic:**
  - When the 'AI' toggle is active, show flashcards with `source` set to `ai-full` and `ai-edited`.
  - When the 'Manual' toggle is active, show flashcards with `source` set to `manual`.
  - When both toggles are active or neither is active, display all flashcards.
  - On toggle change, update the filter state in the parent component and trigger a re-fetch.

### 3. Pagination
- **Component Name:** `FlashcardsListPagination`
- **UI:** Use the Shadcn/ui `pagination` component.
- **Logic:**
  - Display controls for navigating pages using a fixed page size of 9 flashcards per page.
  - On page change, update the parent state and re-fetch flashcards with the correct `page` and `limit` parameters.

### 4. Integration in `FlashcardsListView`
- **State Management:**
  - Manage state for sorting, filtering, and pagination in the `FlashcardsListView` component.
  - Combine these state values to construct the query parameters for API calls to `/api/flashcards`.
- **API Call Update:**
  - Modify the existing `fetchFlashcards` function to append query parameters: `sort`, `order`, `page`, `limit`, and filtering criteria based on `source`.
- **UI Layout:**
  - Render the new sub-components (Sorting, Filtering, Pagination) in the UI, maintaining a clear and responsive layout using Tailwind CSS.
  - Ensure that loading states and potential error messages are handled gracefully.


