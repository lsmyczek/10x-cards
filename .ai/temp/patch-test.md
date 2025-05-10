/\*
API Endpoint Implementation Plan: PATCH /api/flashcards/:id

## 1. Przegląd punktu końcowego

Endpoint PATCH /api/flashcards/:id służy do aktualizacji istniejącej fiszki. Umożliwia modyfikację pola "front" oraz/lub "back" fiszki. Endpoint zwraca zaktualizowany obiekt fiszki.

## 2. Szczegóły żądania

- Metoda HTTP: PATCH
- Struktura URL: /api/flashcards/:id
- Parametry URL:
  - id (identyfikator fiszki do aktualizacji)
- Request Body (JSON):
  - front: string (opcjonalny, maksymalnie 200 znaków)
  - back: string (opcjonalny, maksymalnie 500 znaków)

## 3. Wykorzystywane typy

- DTO: FlashcardDto (zdefiniowany w src/types.ts)
- Command Model: UpdateFlashcardCommand (zdefiniowany w src/types.ts)

## 4. Szczegóły odpowiedzi

- Kod statusu: 200 OK
- Struktura odpowiedzi (JSON):
  {
  "id": number,
  "front": string,
  "back": string,
  "source": string,
  "created_at": string (ISO date),
  "updated_at": string (ISO date),
  "generation_id": number | null
  }

## 5. Przepływ danych

1. Odbiór żądania przez endpoint wraz z parametrem id i opcjonalnym ciałem zawierającym pola "front" oraz "back".
2. Weryfikacja tożsamości użytkownika (middleware sprawdzający uwierzytelnienie).
3. Walidacja danych wejściowych (sprawdzenie typów i ograniczeń długości pól "front" oraz "back").
4. Pobranie z bazy danych rekordu fiszki wg podanego id.
5. Sprawdzenie czy fiszka istnieje; jeśli nie, zwrócenie 404 Not Found.
6. Weryfikacja, czy użytkownik jest właścicielem fiszki; jeśli nie, zwrócenie 403 Forbidden.
7. Aktualizacja rekordu fiszki w bazie danych (używająć transakcji lub bezpośrednio z aktualizacją pól opcjonalnych).
8. Automatyczna aktualizacja pola updated_at poprzez trigger bazy danych.
9. Zwrócenie zaktualizowanego rekordu fiszki z kodem 200 OK.

## 6. Względy bezpieczeństwa

- Weryfikacja autoryzacji: endpoint powinien być dostępny tylko dla uwierzytelnionych użytkowników (401 Unauthorized w przypadku braku autoryzacji).
- Autoryzacja: sprawdzenie, czy użytkownik jest właścicielem modyfikowanej fiszki (403 Forbidden, jeśli nie jest).
- Walidacja i sanityzacja danych wejściowych, aby zapobiec błędom oraz potencjalnym atakom (np. SQL Injection przy użyciu zapytań parametryzowanych).

## 7. Obsługa błędów

- 400 Bad Request: gdy dane wejściowe są nieprawidłowe (np. przekroczenie limitu znaków lub brak przynajmniej jednego pola do aktualizacji).
- 401 Unauthorized: gdy użytkownik nie jest uwierzytelniony.
- 403 Forbidden: gdy użytkownik nie jest właścicielem fiszki.
- 404 Not Found: gdy fiszka o podanym id nie istnieje.
- 500 Internal Server Error: w przypadku nieoczekiwanych błędów serwera lub bazy danych.

## 8. Rozważania dotyczące wydajności

- Endpoint operuje na pojedynczym rekordzie, co gwarantuje niskie obciążenie.
- Zapewnienie indeksów na kolumnach id oraz user_id w tabeli flashcards poprawi wydajność wyszukiwania.
- Używanie transakcji tam, gdzie to konieczne, aby uniknąć niespójności danych.

## 9. Etapy wdrożenia

1. Utworzenie nowego pliku endpointu (np. w src/pages/api/flashcards/[id].ts) w oparciu o istniejący szablon dla innych endpointów.
2. Zaimportowanie niezbędnych typów (FlashcardDto, UpdateFlashcardCommand) oraz usług (np. service do aktualizacji fiszki).
3. Implementacja middleware'a uwierzytelniającego użytkownika oraz pobierającego user_id z kontekstu (context.locals).
4. Implementacja walidacji danych wejściowych z użyciem np. biblioteki zod, z uwzględnieniem maksymalnych długości pól.
5. Pobranie fiszki z bazy danych wg id i weryfikacja własności rekordu.
6. Aktualizacja rekordu w bazie danych oraz zwrócenie poprawnej odpowiedzi.
7. Dodanie odpowiedniej obsługi błędów (try/catch), logowanie błędów serwera oraz zwracanie odpowiednich kodów statusu.
8. Napisanie testów integracyjnych dla endpointu (np. przy użyciu narzędzi typu Jest lub innego frameworka testowego).
9. Przegląd kodu przez zespół oraz testy na środowisku developerskim przed wdrożeniem na produkcję.
   \*/
