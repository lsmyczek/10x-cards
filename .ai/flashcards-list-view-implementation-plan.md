# Plan implementacji widoku listy fiszek

## 1. Przegląd

Widok listy fiszek ma na celu prezentację zatwierdzonych fiszek użytkownika w sposób przejrzysty i responsywny. Użytkownik widzi fiszki ułożone w trójkolumnowym gridzie, z informacjami o treści "front" i "back" oraz oznaczeniem źródła (AI - wygenerowane lub Manual - dodane ręcznie). Ponadto, widok umożliwia edycję fiszek poprzez modal edycji oraz usuwanie fiszek z systemu.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką `/flashcards` i będzie widoczny wyłącznie dla zalogowanych użytkowników.

## 3. Struktura komponentów

- **FlashcardsListView** (główny komponent widoku):
  - Odpowiada za pobranie danych z API, zarządzanie stanem listy fiszek oraz wyświetlenie siatki fiszek.
- **FlashcardItem** (pojedyncza karta fiszki) - układ taki jak w przpadku komponentu `FlaschcardProposalsItem.tsx`:
  - Prezentacja danych fiszki: front, back.
  - Dodatkowa informacja o źródle (w formie badge) - ai lub manual
  - Obsługuje akcje: Dwa buttony - edycja (otwarcie modal) oraz usunięcie fiszki (modal z potwierdzeniem operacji).
- **FlashcardEditModal** (re-używalny komponent modalny ju stworzony `src/components/FlashcardEditModal.tsx`):
  - Umożliwia edycję wybranej fiszki.
- **DeleteConfirmationModal**:
  - Modal do potwierdzenia usunięcia fiszki (po potwierdzeniu następuje usunięcie fiszki).

## 4. Szczegóły komponentów

### FlashcardsListView

- **Opis:**
  - Główny komponent pobierający listę fiszek poprzez API GET `/api/flashcards`.
  - Zarządza stanami: lista fiszek, stan ładowania, błędy, widoczność modalu edycji oraz dane fiszki do edycji.
- **Główne elementy:**
  - Nagłówek lub tytuł strony.
  - Kontener gridowy (używając Tailwind: np. `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`).
  - Mapowanie danych na komponenty `FlashcardCard`.
- **Obsługiwane interakcje:**
  - Inicjalne pobranie danych po załadowaniu widoku.
  - Odświeżenie listy po edycji lub usunięciu fiszki.
- **Warunki walidacji:**
  - Sprawdzenie poprawności danych pobranych z API.
- **Typy:**
  - Wykorzystuje typ `FlashcardsListResponseDto` z `types.ts` oraz lokalny model `FlashcardViewModel` odpowiadający `FlashcardDto`.
- **Propsy:**
  - Brak bezpośrednich propsów, zarządzanie stanem wewnętrznym.

### FlashcardCard

- **Opis:**
  - Komponent odpowiedzialny za prezentację pojedynczej fiszki.
- **Główne elementy:**
  - Wyświetlanie tekstu `front` i `back`.
  - Badge: jeśli `source` jest `ai-full` lub `ai-edited` wyświetla "AI", w przeciwnym razie "Manual".
  - Badge: jeśli `source` jest `ai-edited` wyświetla "Edited".
  - Przycisk Edytuj – wywołuje funkcję otwierającą `FlashcardEditModal`.
  - Przycisk Usuń – wywołuje funkcję otwierającą `DeleteConfirmationModal`, po zatwierdzeniu następuje usunięcie fiszki (z potwierdzeniem).
- **Obsługiwane interakcje:**
  - Kliknięcie przycisku Edytuj: przekazuje dane fiszki do rodzica.
  - Kliknięcie przycisku Usuń: wywołuje modal potwierdzenie i po zatwierdzeniu akcję usunięcia.
- **Warunki walidacji:**
  - Walidacja poprawności danych przed przesłaniem edycji (np. niepuste pola, ograniczenia długości).
- **Typy:**
  - Opart na typie `FlashcardDto` / `FlashcardViewModel`.
- **Propsy:**
  - `flashcard`: obiekt zawierający dane fiszki.
  - `onEdit(flashcard: FlashcardViewModel)`: funkcja wywoływana przy edycji.
  - `onDelete(flashcardId: number)`: funkcja wywoływana przy usuwaniu.

### FlashcardEditModal

- **Opis:**
  - Modal umożliwiający edycję fiszki, wykorzystuje istniejący komponent `FlashcardEditModal.tsx`.
- **Główne elementy:**
  - Formularz z polami do edycji `front` (max 200 znaków) oraz `back` (max 500 znaków).
  - Przyciski: Zapisz zmiany, Anuluj.
- **Obsługiwane interakcje:**
  - Zmiana wartości w polach formularza.
  - Zatwierdzenie zmian, wysyłające żądanie PATCH do `/api/flashcards/:id`.
- **Warunki walidacji:**
  - Front: 1-200 znaków, niepusty po trimowaniu.
  - Back: 1-500 znaków, niepusty po trimowaniu.
- **Typy:**
  - Typy zgodne z `UpdateFlashcardCommand` z `types.ts`.
- **Propsy:**
  - `flashcard`: dane fiszki do edycji.
  - `onSave(updatedFlashcard: UpdateFlashcardCommand)`: funkcja zapisująca zmiany.
  - `onClose()`: funkcja zamykająca modal.

## 5. Typy

- **FlashcardViewModel:**
  ```typescript
  interface FlashcardViewModel {
    id: number;
    front: string;
    back: string;
    source: "manual" | "ai-full" | "ai-edited";
    created_at: string;
    updated_at: string;
    generation_id: number | null;
  }
  ```
- **Inne typy:**
  - `FlashcardsListResponseDto`, `UpdateFlashcardCommand` – zgodne z definicjami w `types.ts`.

## 6. Zarządzanie stanem

- W głównym komponencie `FlashcardsListView` wykorzystamy hooki React (`useState`, `useEffect`) do:
  - Przechowywania stanu listy fiszek.
  - Monitorowania stanu ładowania (loading) i błędów (error).
  - Zarządzania widocznością modalu edycji oraz danymi wybranej fiszki.
- Opcjonalnie stworzymy custom hook `useFlashcards` do enkapsulacji logiki pobierania, aktualizacji i usuwania fiszek.

## 7. Integracja API

- **Pobieranie fiszek:**
  - Endpoint: GET `/api/flashcards`
  - Typ odpowiedzi: `FlashcardsListResponseDto`
  - Akcja: Po załadowaniu widoku wywołać zapytanie, wyświetlić loader, a następnie zaktualizować stan.
- **Edycja fiszki:**
  - Endpoint: PATCH `/api/flashcards/:id`
  - Typ żądania: `UpdateFlashcardCommand`
  - Akcja: Z modal edycji przesłać zmienione dane, po sukcesie zaktualizować listę fiszek.
- **Usuwanie fiszki:**
  - Endpoint: DELETE `/api/flashcards/:id`
  - Akcja: Po potwierdzeniu usunięcia wysłać żądanie, a następnie usunąć fiszkę ze stanu.

## 8. Interakcje użytkownika

- Po wejściu na stronę widoku, użytkownik widzi siatkę fiszek.
- Kliknięcie przycisku Edytuj na pojedynczej fiszce otwiera modal z danymi wybranej fiszki, gdzie użytkownik może wprowadzić zmiany.
- Kliknięcie przycisku Usuń na pojedynczej fiszce powoduje pojawienie się potwierdzenia modalu umoliwijącym akceptację lub zrezygnowanie z operacji.
  Po potwierdzeniu wysyłane jest żądanie usunięcia i w przypadku sukcesu wyswietlenie powteirdzenia usunięcią za pomocą toast.
- Po edycji lub usunięciu widok automatycznie odświeża listę.

## 9. Warunki i walidacja

- Przed wysłaniem żądania edycji walidujemy:
  - Pole `front`: 1-200 znaków, niepuste po trimowaniu.
  - Pole `back`: 1-500 znaków, niepuste po trimowaniu.
- Przed usunięciem użytkownik musi potwierdzić akcję.
- Walidacja odpowiedzi z API – w przypadku błędów wyświetlamy komunikaty (toast notifications lub alerty).

## 10. Obsługa błędów

- W przypadku niepowodzenia zapytań do API (GET, PATCH, DELETE):
  - Wyświetlamy odpowiednie komunikaty błędów użytkownikowi (toast, alert).
  - Utrzymujemy stan aplikacji, nie aktualizując listy fiszek, jeśli żądanie zakończy się błędem.
  - Logujemy szczegóły błędu w konsoli (dla celów debugowania).

## 11. Kroki implementacji

1. Utworzyć komponent `FlashcardsListView` w odpowiednim folderze (np. `src/components`).
2. W `FlashcardsListView`:
   - Zaimportować i wywołać custom hook lub użyć `useEffect` do pobrania listy fiszek z API (wywołanie API GET).
   - Zaimplementować stany: lista fiszek, loading, error, stan modalu edycji.
3. Utworzyć komponent `FlashcardItem`:
   - Zaimplementować strukturę wizualną (tekst, badge, przyciski) używając Tailwind CSS.
   - Układ taki sam jak w przypadku ju istniejącego komponentu `FlaschcardProposalsItem.tsx`
   - Dodać obsługę zdarzeń: wywołanie edit i delete (przekazane jako propsy).
4. Zintegrować istniejący komponent `FlashcardEditModal`:
   - Zapewnić otwieranie modalu z danymi wybranej fiszki oraz obsługę zatwierdzania zmian (wywołanie API PATCH).
5. Dla przycisku usuwania:
   - Dodać akcję potwierdzenia usunięcia (modal).
   - Po potwierdzeniu wysłać żądanie DELETE, zaktualizować stan listy fiszek i wyświetlić toast potwierdzenia.
6. Uzupełnić obsługę błędów oraz stanów ładowania, wyświetlając odpowiednie komunikaty.
