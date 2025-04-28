# API Endpoint Implementation Plan: DELETE /api/flashcards/:id

## 1. Przegląd punktu końcowego
Cel: Usunięcie fiszki z bazy danych. Endpoint umożliwia autoryzowanemu użytkownikowi usunięcie fiszki, o ile jest jej właścicielem, zgodnie z zasadami RLS w bazie danych.

## 2. Szczegóły żądania
- Metoda HTTP: DELETE
- Struktura URL: /api/flashcards/:id
- Parametry:
  - Wymagany:
    - id: Identyfikator (liczbowy) fiszki do usunięcia
- Request Body: Brak

## 3. Wykorzystywane typy
- FlashcardDto (zdefiniowany w src/types.ts) – reprezentuje fiszkę w bazie danych
- Nie wymaga dodatkowych Command Model, ponieważ operacja polega wyłącznie na usunięciu zasobu

## 4. Szczegóły odpowiedzi
- Sukces: 204 No Content – fiszka została pomyślnie usunięta
- Kody błędów:
  - 401 Unauthorized: Użytkownik nie jest uwierzytelniony
  - 403 Forbidden: Fiszka nie należy do użytkownika
  - 404 Not Found: Fiszka o podanym identyfikatorze nie istnieje
  - 500 Internal Server Error: Błąd po stronie serwera

## 5. Przepływ danych
1. Odbiór żądania DELETE z parametrem id w URL
2. Weryfikacja uwierzytelnienia użytkownika za pomocą JWT (np. Supabase Auth)
3. Pobranie fiszki z bazy danych, sprawdzenie czy istnieje oraz czy flashcard.user_id odpowiada aktualnie zalogowanemu użytkownikowi (auth.uid)
4. Jeśli autoryzacja się powiedzie, wykonanie operacji usunięcia rekordu w bazie danych
5. Zwrot statusu 204 No Content

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: Weryfikacja tokena JWT w nagłówku Authorization
- Autoryzacja: Sprawdzenie, czy fiszka należy do zalogowanego użytkownika (porównanie user_id z auth.uid())
- Wdrożenie polityk RLS na poziomie bazy danych, które zapewniają, że użytkownicy mogą modyfikować tylko swoje dane

## 7. Obsługa błędów
- 401 Unauthorized: Zwracany, gdy użytkownik nie przekazał ważnego tokena uwierzytelniającego
- 403 Forbidden: Zwracany, gdy użytkownik próbuje usunąć fiszkę, której nie jest właścicielem
- 404 Not Found: Zwracany, gdy fiszka o podanym identyfikatorze nie istnieje
- 500 Internal Server Error: Zwracany w przypadku nieprzewidzianych błędów lub problemów z bazą danych

## 8. Rozważania dotyczące wydajności
- Operacja usunięcia jest prosta i szybka dzięki indeksom na kolumnach (np. id, user_id)
- Użycie polityk RLS w bazie danych pozwala na delegowanie sprawdzania autoryzacji do poziomu bazy, co poprawia wydajność i bezpieczeństwo

## 9. Etapy wdrożenia
1. Utworzenie pliku handlera endpointu w katalogu: /src/pages/api/flashcards/[id].ts (lub zgodnie z konwencjami projektu Astro).
2. Implementacja middleware do weryfikacji JWT i autoryzacji użytkownika (wykorzystanie Supabase Auth i kontekstu locals).
3. Wydobycie parametru id z URL i walidacja jego formatu.
4. Implementacja logiki usuwania fiszki:
   - Pobranie fiszki z bazy danych
   - Weryfikacja, czy flashcard.user_id odpowiada auth.uid()
   - Wykonanie operacji usunięcia w bazie danych
5. Obsługa kodów błędów: 401, 403, 404, 500
6. Dodanie testów jednostkowych i integracyjnych, aby upewnić się, że endpoint działa zgodnie z oczekiwaniami
7. Monitorowanie logów i weryfikacja poprawności działania polityk RLS w środowisku produkcyjnym 