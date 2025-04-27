/*
Plan implementacji widoku Generowanie fiszek

## 1. Przegląd
Widok generowania propozycji fiszek umożliwia zalogowanym użytkownikom wklejenie obszernego tekstu (od 1000 do 10 000 znaków), wysłanie go do API AI, a następnie przegląd i ew. edycję wygenerowanych propozycji fiszek. Celem jest usprawnienie procesu tworzenia fiszek poprzez automatyczne generowanie przykładowych pytań i odpowiedzi.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką `/generate` i wymaga autoryzacji użytkownika (dostęp tylko dla zalogowanych).

## 3. Struktura komponentów
- **FlashcardGenerator** (główny kontener widoku)
  - **GenerationForm** – formularz wejściowy tekstu z licznikiem znaków i walidacją
  - **GenerateButton** – przycisk "Wygeneruj fiszki"
  - **LoadingSkeleton** – wskaźnik ładowania podczas wywołania API
  - **ErrorNotification** – komponent do wyświetlania komunikatów błędów
  - **FlashcardList** – lista wygenerowanych fiszek
    - **FlashcardItem** – pojedyncza fiszka z przyciskami: akceptacji, edycji, odrzucenia
      - **FlashcardEditModal** – modal do edycji treści fiszki
  - **SaveButtons** – przyciski "Zapisz wszystkie" i "Zapisz zaakceptowane"

## 4. Szczegóły komponentów
### FlashcardGenerator
- Opis: Główny komponent zarządzający stanem i logiką widoku.
- Główne elementy: formularz tekstowy, przycisk generowania, stany ładowania i błędów, lista fiszek.
- Obsługiwane interakcje: wprowadzenie tekstu, wysyłanie formularza, renderowanie wyników.
- Walidacja: Sprawdzenie, czy tekst mieści się w zakresie 1000-10 000 znaków.
- Typy: Wykorzystuje typy CreateGenerationCommand oraz GenerationDto.
- Propsy: Brak (komponent główny zarządza własnym stanem).

### GenerationForm
- Opis: Formularz umożliwiający wprowadzenie tekstu przez użytkownika.
- Główne elementy: pole textarea, licznik znaków, komunikat walidacji.
- Obsługiwane interakcje: onChange (aktualizacja tekstu i licznika), onBlur (walidacja).
- Walidacja: Minimalna długość 1000 znaków, maksymalna 10 000 znaków.
- Typy: Własny ViewModel z polami `sourceText` (string) i `charCount` (number).
- Propsy: Funkcja aktualizująca stan tekstu.

### GenerateButton
- Opis: Przycisk inicjujący wywołanie API generującego fiszki.
- Główne elementy: Button.
- Obsługiwane interakcje: onClick wywołujący funkcję generującą fiszki.
- Walidacja: Aktywny tylko, gdy tekst spełnia wymagania.
- Propsy: Callback do obsługi kliknięcia.

### LoadingSkeleton
- Opis: Komponent wyświetlający animację ładowania podczas oczekiwania na odpowiedź API.
- Propsy: Brak.

### ErrorNotification
- Opis: Wyświetla komunikaty błędów związane z walidacją lub wywołaniami API.
- Propsy: Wiadomość błędu (string).

### FlashcardList
- Opis: Wyświetla listę wygenerowanych fiszek.
- Główne elementy: Lista elementów FlashcardCard.
- Obsługiwane interakcje: Renderowanie każdej fiszki wraz z akcjami.
- Typy: rozszerzony typ FlashcardProposalDto - FlashcardProposalViewModel, lokalny typ stanu, np. z flagą accepted/edited.
- Propsy: Lista fiszek (dane propozycji), onAccept, onEdit, onReject.

### FlashcardItem
- Opis: Pojedyncza fiszka z opcjami: akceptacja, edycja, odrzucenie.
- Główne elementy: Wyświetlanie pól "front" i "back", przyciski akcji.
- Obsługiwane interakcje: onAccept (oznaczenie fiszki do zapisu), onEdit (otwarcie modala edycji), onReject (usunięcie fiszki z listy).
- Walidacja: Maksymalnie 200 znaków dla pola "front", 500 znaków dla pola "back" podczas edycji.
- Typy: FlashcardProposalDto oraz rozszerzony FlashcardProposalViewModel (np. dodatkowe pole isAccepted: boolean).
- Propsy: Dane fiszki oraz callbacki dla akcji.

### FlashcardEditModal
- Opis: Modal umożliwiający edycję zawartości fiszki.
- Główne elementy: Input dla "front", textarea dla "back", przyciski "Zapisz zmiany" i "Anuluj".
- Obsługiwane interakcje: onChange pól, onSave (zatwierdzenie zmian), onClose (zamknięcie modala).
- Walidacja: Pole "front" do 200 znaków, pole "back" do 500 znaków.
- Typy: EditFlashcardProposalViewModel (z polami front i back).
- Propsy: Aktualne dane fiszki, callbacki onSave i onClose.

### SaveButtons
- Opis: Komponent zawierający przyciski do zapisu wybranych fiszek.
- Główne elementy: Dwa przyciski – "Zapisz wszystkie" i "Zapisz zaakceptowane".
- Obsługiwane interakcje: onClick wywołujące odpowiednią akcję zapisu danych poprzez API /api/flashcards.
- Propsy: Callbacki do obsługi zapisu oraz stan wybranych fiszek.

## 5. Typy
- **CreateGenerationCommand**: { source_text: string } - wysyłany do endpointu `/generations`
- **GenerationDto**: { generation_id: number, flashcards_proposals: FlashcardProposalDto[], generated_count: number } - struktura odpowiedzi z API.
- **FlashcardProposalDto**: { id: number, front: string, back: string, source: 'ai-full' } - pojedyncza propozycja fiszki.
- **FlashcardProposalViewModel**: {id: number, front: string, back: string, source: 'ai-full' | 'ai-edited', accepted: boolean, edited: boolean} rozszerzony model FlashcardProposalDto reprezentujący stan propozycji fiszki, umoliżliwiający dynamiczne ustawienia pola `source` podczas wysyłania danych do endpointu `flashcards`
- **EditFlashcardProposalViewModel**: { front: string, back: string }

## 6. Zarządzanie stanem
- Użycie hooka useState do zarządzania:
  - Tekstem wejściowym (sourceText)
  - Licznikiem znaków
  - Stanem walidacji tekstu (komunikaty błędów)
  - Loading state (podczas oczekiwania na odpowiedź API)
  - Tablicą wygenerowanych fiszek
  - Statusami poszczególnych fiszek (akceptacja/edycja)
  - Stanem modala edycji (widoczność i dane edytowanej fiszki)
- Rozważenie utworzenia custom hooka (np. useFlashcardGenerator) do zarządzania logiką widoku.

## 7. Integracja API
- Wywołanie endpointu **POST /api/generations** po kliknięciu "Wygeneruj fiszki":
  - Żądanie: { source_text: string } (po walidacji długości tekstu)
  - Odpowiedź: GenerationDto zawierający listę flashcards_proposals.
- Wywołanie endpointu **POST /api/flashcards** przy zapisie fiszek:
  - Żądanie: { flashcards: [ { front, back, source, generation_id } ] } na podstawie zaakceptowanych/zmodyfikowanych danych.
- Użycie fetch lub axios z obsługą autoryzacji przy pomocy tokena JWT (Supabase Auth).
- Aktualizacja stanu na podstawie wyników wywołań API (sukces lub pokazanie błędu w ErrorNotification).

## 8. Interakcje użytkownika
- Wprowadzanie tekstu w polu formularza z dynamiczną aktualizacją licznika znaków.
- Kliknięcie przycisku "Wygeneruj fiszki":
  - Walidacja wprowadzonego tekstu
  - Wywołanie API i wyświetlenie LoadingSkeleton
  - Renderowanie listy propozycji fiszek po otrzymaniu odpowiedzi
- Dla każdej propozycji fiszki w liście:
  - Akceptacja propozycji fiszki (oznaczenie jej do zapisu)
  - Kliknięcie "Edytuj" otwiera FlashcardEditModal do zmiany treści
  - Kliknięcie "Odrzuć" usuwa fiszkę z listy
- Kliknięcie przycisków "Zapisz wszystkie" lub "Zapisz zaakceptowane" wysyła odpowiednie dane do API /api/flashcards.

## 9. Warunki i walidacja
- Formularz tekstowy:
  - Tekst musi mieć co najmniej 1000 i nie więcej niż 10 000 znaków.
  - Przycisk "Wygeneruj fiszki" aktywny tylko przy spełnieniu tych warunków.
- Fiszki:
  - Pole "front": maksymalnie 200 znaków.
  - Pole "back": maksymalnie 500 znaków.
- Walidacja na bieżąco, z wyświetlaniem komunikatów błędów inline w ErrorNotification oraz wewnątrz modala edycji.

## 10. Obsługa błędów
- Walidacja wprowadzanych danych (długość tekstu, długość pól fiszek).
- Obsługa błędów odpowiedzi API (np. statusy 400, 401, 500, 503) z wyświetleniem komunikatu w ErrorNotification.
- W przypadku błędów sieciowych, umożliwienie ponownego wysłania żądania.
- Obsługa sytuacji braku wyników generowanych fiszek.

## 11. Kroki implementacji
1. Utworzenie szablonu strony dla widoku `/generate` w folderze `/src/pages`.
2. Utworzenie głównego komponentu **FlashcardGenerator** w `/src/components/FlashcardGenerator.tsx`.
3. Implementacja komponentu **GenerationForm** z polem tekstowym, licznikiem znaków oraz walidacją.
4. Dodanie komponentu **GenerateButton** i integracja wywołania API **POST /api/generations**.
5. Implementacja stanu ładowania za pomocą **LoadingSkeleton**.
6. Opracowanie komponentu **FlashcardList** oraz **FlashcardCard** z obsługą akcji (akceptacja, edycja, odrzucenie).
7. Implementacja **FlashcardEditModal** z walidacją pól edycji.
8. Dodanie komponentu **SaveButtons** i integracja wywołania API **POST /api/flashcards** przy zapisie fiszek.
9. Testowanie interakcji, walidacji oraz obsługi błędów.
10. Implementacja responsywnych stylów z wykorzystaniem Tailwind CSS oraz komponentów Shadcn/ui.
11. Przeprowadzenie przeglądu kodu i dokumentacji wdrożenia.
*/ 