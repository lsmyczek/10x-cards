/_ Creating a new file that outlines the detailed implementation plan for the PATCH /api/flashcards/:id endpoint _/

# API Endpoint Implementation Plan: PATCH /api/flashcards/:id

## 1. Przegląd punktu końcowego

Ten endpoint umożliwia aktualizację istniejącej fiszki. Użytkownik przesyła żądanie do aktualizacji pól 'front' oraz/lub 'back' fiszki, a system sprawdza uprawnienia, waliduje dane wejściowe i wykonuje aktualizację w bazie danych. Endpoint korzysta z mechanizmów uwierzytelniania i autoryzacji, by umożliwić operację tylko właścicielowi danej fiszki.

## 2. Szczegóły żądania

- **Metoda HTTP**: PATCH
- **Struktura URL**: /api/flashcards/:id
- **Parametry URL**:
  - id (wymagany): identyfikator fiszki
- **Request Body** (JSON):
  ```json
  {
    "front": "string (max 200 chars, opcjonalne)",
    "back": "string (max 500 chars, opcjonalne)"
  }
  ```
- **Walidacja**:
  - 'front' nie przekracza 200 znaków, jeśli jest obecny
  - 'back' nie przekracza 500 znaków, jeśli jest obecny

## 3. Wykorzystywane typy

- **DTO**: FlashcardDto (opisany w src/types.ts) zawiera m.in. id, front, back, source, created_at, updated_at, generation_id
- **Command Model**: UpdateFlashcardCommand z opcjonalnymi polami 'front' i 'back' (opisany w src/types.ts)

## 4. Szczegóły odpowiedzi

- **Struktura odpowiedzi (JSON)**:
  ```json
  {
    "id": "number",
    "front": "string",
    "back": "string",
    "source": "string",
    "created_at": "string (ISO date)",
    "updated_at": "string (ISO date)",
    "generation_id": "number | null"
  }
  ```
- **Kody statusu**: 200 OK przy udanej aktualizacji

## 5. Przepływ danych

1. **Odbiór żądania**: Endpoint odbiera żądanie PATCH z id fiszki w URL i danymi w ciele żądania.
2. **Uwierzytelnianie**: Użycie middleware w celu weryfikacji, czy użytkownik jest zalogowany (zwrócenie 401 w razie braku uwierzytelnienia).
3. **Autoryzacja**: Sprawdzenie czy zalogowany użytkownik jest właścicielem fiszki (w przeciwnym razie 403 Forbidden).
4. **Walidacja danych**: Walidacja pól 'front' i 'back' zgodnie z ograniczeniami długości. W przypadku błędów walidacji, odpowiedź 400 Bad Request.
5. **Aktualizacja w DB**: Rozszerzenie serwisu `flashcards.service.ts` o metodę `updateFlashcard` - Wywołanie logiki warstwy serwisowej, która aktualizuje rekord w tabeli flashcards. Trigger bazy danych automatycznie aktualizuje pole updated_at.
6. **Odpowiedź**: Zwrócenie zaktualizowanej fiszki jako FlashcardDto.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: Endpoint powinien być dostępny tylko dla zalogowanych użytkowników. W razie braku uwierzytelnienia zwracany jest 401 Unauthorized.
- **Autoryzacja**: Sprawdzenie, czy użytkownik wykonujący żądanie jest właścicielem modyfikowanej fiszki, w przeciwnym razie zwracany jest 403 Forbidden.
- **Walidacja**: Ochrona przed nadużyciami i błędami przez dokładną walidację długości i formatu danych wejściowych.
- **SQL Injection**: Używanie zapytań z parametrami (prepared statements) w celu zabezpieczenia przed atakami SQL Injection.

## 7. Obsługa błędów

- **400 Bad Request**: Nieprawidłowe dane wejściowe (np. przekroczenie maksymalnej długości).
- **401 Unauthorized**: Użytkownik nie jest zalogowany.
- **403 Forbidden**: Użytkownik nie jest właścicielem zasobu, który próbuje zmodyfikować.
- **404 Not Found**: Fiszka o podanym identyfikatorze nie istnieje.
- **500 Internal Server Error**: Błędy wewnętrzne (np. problemy z bazą danych) – logowanie błędów zalecane dla dalszej analizy.

## 8. Rozważania dotyczące wydajności

- **Indeksowanie**: Upewnij się, że tabela flashcards posiada odpowiednie indeksy (np. na kolumnach id, user_id) aby przyspieszyć wyszukiwanie.
- **Trigger aktualizacji**: Korzystanie z triggera bazy danych do automatycznej aktualizacji pola updated_at minimalizuje obciążenie aplikacji.
- **Optymalizacja zapytań**: Aktualizacja pojedynczego rekordu nie powinna wprowadzać istotnych obciążeń, ale warto monitorować zapytania przy wysokim obciążeniu.

## 9. Etapy wdrożenia

1. **Definicja trasy**: Utworzenie lub modyfikacja pliku odpowiadającego za endpoint PATCH /api/flashcards/[id].ts w katalogu /src/pages/api/flashcards.
2. **Middleware**: Upewnienie się, że middleware uwierzytelniające jest zastosowane do tej trasy. Autoryzacja zostanie dodana na późniejszym etapie - W tej implementecji korzystamy z domyślnego uytkownika (DEFAULT_USER_ID), który jest już zdefiniowany w middleware.
3. **Walidacja danych**: Implementacja walidacji ciała żądania (np. przy użyciu Zod) dla pól 'front' i 'back'.
4. **Logika serwisowa**: utworzenie funkcji `updateFlashcard` w `flashcards.service.ts` odpowiedzialnej za wyszukiwanie, autoryzację i aktualizację rekordu w bazie danych.
5. **Obsługa błędów**: Implementacja mechanizmów wychwytywania i obsługi błędów wraz z odpowiednimi kodami statusu.
