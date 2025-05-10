# API Endpoint Implementation Plan: DELETE /api/flashcards/:id

## 1. Przegląd punktu końcowego

Endpoint DELETE /api/flashcards/:id służy do usunięcia flashcardu, który należy do zalogowanego użytkownika. Endpoint wymaga uwierzytelnienia użytkownika i weryfikuje, czy flashcard, który ma zostać usunięty, faktycznie należy do żądającego użytkownika.

## 2. Szczegóły żądania

- **Metoda HTTP:** DELETE
- **Struktura URL:** /api/flashcards/:id
- **Parametry:**
  - Wymagany parametr URL: `id` (identyfikator flashcardu, typu liczbowego)
- **Request Body:** Brak

## 3. Wykorzystywane typy

- **FlashcardDto:** Typ reprezentujący flashcard, używany przy operacjach na flashcardach (choć przy DELETE nie zwracamy danych flashcardu).
- **Parametr `id`:** Liczba, identyfikująca flashcard.

## 4. Szczegóły odpowiedzi

- **Sukces:**
  - Kod: 204 No Content
  - Treść: Brak
- **Błędy:**
  - 401 Unauthorized: Gdy użytkownik nie jest uwierzytelniony
  - 403 Forbidden: Gdy flashcard nie należy do żądającego użytkownika
  - 404 Not Found: Gdy flashcard o podanym `id` nie istnieje
  - 500 Internal Server Error: W przypadku nieoczekiwanych błędów serwera

## 5. Przepływ danych

1. Odbiór żądania z parametrem `id` z URL.
2. Walidacja sesji użytkownika przy użyciu Supabase Auth (sprawdzenie tokenu JWT i przypisanie użytkownika z context.locals).
3. Wyszukanie flashcardu w bazie danych na podstawie przekazanego `id` oraz `user_id` (uzyskanego z sesji).
4. Jeśli flashcard istnieje i należy do użytkownika, wykonanie operacji DELETE w bazie danych.
5. Zwrócenie odpowiedzi 204 No Content, jeśli operacja się powiedzie.

## 6. Względy bezpieczeństwa

- **Uwierzytelnienie:** Weryfikacja tokenu JWT i autentykacji użytkownika przy użyciu Supabase Auth.
- **Autoryzacja:** Sprawdzenie, czy flashcard należy do żądającego użytkownika (porównanie `user_id` flashcardu z id użytkownika z context.locals).
- **Walidacja:** Sprawdzenie, czy parametr `id` jest liczbą. Możliwe użycie biblioteki Zod do walidacji wejścia.

## 7. Obsługa błędów

- **401 Unauthorized:** Brak tokenu lub nieważny token JWT.
- **403 Forbidden:** Flashcard istnieje, ale nie należy do zalogowanego użytkownika.
- **404 Not Found:** Flashcard o podanym `id` nie został odnaleziony w bazie danych.
- **500 Internal Server Error:** W przypadku wystąpienia nieoczekiwanych błędów (np. problemy z bazą danych lub logika serwera).

## 8. Rozważania dotyczące wydajności

- **Indeksy bazy danych:** Kolumny `user_id` i `id` w tabeli flashcards powinny być odpowiednio indeksowane, co zapewni szybkie wyszukiwanie i operacje DELETE.
- **Optymalizacja zapytań:** Upewnienie się, że zapytanie do bazy danych jest zoptymalizowane i wykonuje minimalną liczbę operacji.
- **Skalowalność:** Endpoint powinien być w stanie obsłużyć dużą liczbę zapytań przy jednoczesnym zachowaniu wysokiej wydajności.

## 9. Etapy wdrożenia

1. **Utworzenie/aktualizacja kontrolera:** Aktualizacja endpointu /api/flashcards/[id].ts w katalogu /src/pages/api/flashcards o metodę DELETE
2. **Weryfikacja uwierzytelnienia:** Zapewnienie, że tylko uwierzytelnieni użytkownicy mogą wykonywać operację DELETE - Autoryzacja zostanie dodana na późniejszym etapie - W tej implementecji korzystamy z domyślnego uytkownika (DEFAULT_USER_ID), który jest już zdefiniowany w middleware.
3. **Walidacja parametru:** Implementacja walidacji, aby sprawdzić, że parametr `id` jest poprawny (np. przy użyciu Zod).
4. **Wyszukiwanie flashcardu:** .
5. **Wyszukiwanie flashcardu i Operacja DELETE:** Rozszerzenie serwisu `flashcards.service.ts` o metodę `deleteFlashcard`:
   - Pobranie flashcardu z bazy danych na podstawie `id` oraz weryfikacja, czy należy do bieżącego użytkownika
   - Wywołanie logiki warstwy serwisowej, która wykona operację usunięcia flashcardu z bazy danych.
6. **Obsługa błędów:** Implementacja mechanizmów wychwytywania błędów i odpowiedniego zwracania kodów statusu (401, 403, 404, 500).
