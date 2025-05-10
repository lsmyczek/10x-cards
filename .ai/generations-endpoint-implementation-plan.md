/\*
API Endpoint Implementation Plan: POST /api/generations

## 1. Przegląd punktu końcowego

Ten endpoint umożliwia generowanie propozycji fiszek przez AI na podstawie dostarczonego przez użytkownika tekstu źródłowego. Endpoint wyzwala zewnętrzny serwis AI (np. Openrouter.ai), zapisuje metadane operacji generowania w bazie danych oraz zwraca wygenerowane propozycje fiszek.

Jego zadaniem jest:

- Walidacja danych wejsciowych (szczególnie `source_text`)
- Wywołanie zewnętrznego serwisu AI generującego propozycje fiszek
- Zapisywanie metadanych generacji w bazie danych (tabela `generations`)
- Zwrot wygenerowanych propozycji fiszek oraz liczby wygenerowanych propozycji

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Struktura URL: /api/generations
- Parametry:
  - Wymagane:
    - source_text: string (tekst o długości 1000-10000 znaków)
  - Opcjonalne: brak
- Request Body (JSON):
  ```json
  {
    "source_text": "string (1000-10000 chars)"
  }
  ```

## 3. Wykorzystywane typy

- DTO i Command Modele:
  - CreateGenerationCommand (definiowany w src/types.ts) do przyjmowania inputu dla operacji generowania.
  - GenerationDto (definiowany w src/types.ts) jako struktura odpowiedzi zawierająca szczegóły operacji generowania.
  - FlashcardProposalDto (definiowany w src/types.ts) jako struktura pojedynczej propozycji fiszki z source ustawionym na 'ai-full'.

## 4. Szczegóły odpowiedzi

- Status: 201 Created przy pomyślnym utworzeniu
- Response Body (JSON):
  ```json
  {
    "id": "number",
    "model": "string",
    "generated_count": "number",
    "source_text_length": "number",
    "generation_duration": "number",
    "created_at": "string (ISO date)",
    "status": "string (processing, completed, error)",
    "flashcards_proposals": [
      {
        "id": "number",
        "front": "string",
        "back": "string",
        "source": "ai-full"
      }
    ]
  }
  ```

## 5. Przepływ danych

1. Odbiór żądania POST z ciałem zawierającym `source_text`
1. Walidacja wejścia:
   - Sprawdzenie obecności i poprawności "source_text".
   - Walidacja długości tekstu (1000-10000 znaków) przy użyciu biblioteki Zod.
1. Przekazanie danych do warstwy serwisowej:
   - Wywołanie serwisu (np. GenerationService) odpowiedzialnego za komunikację z usługą AI (np. Openrouter.ai) w celu wygenerowania propozycji fiszek. Na czas developmentu korzystamy z mockowych danych.
1. Zapis metadanych operacji:
   - Utworzenie rekordu w tabeli generations z odpowiednimi informacjami (user_id, model, generated_count, source_text_length, generation_duration, itd.).
1. Przetwarzanie odpowiedzi z serwisu AI:
   - Jeśli AI zwróci propozycje, utworzenie obiektu GenerationDto wraz z właściwą listą FlashcardProposalDto.
   - W przypadku błędów serwisu AI, zapis błędu w tabeli generations_error_logs.
1. Zwrócenie odpowiedzi JSON.

## 6. Względy bezpieczeństwa

- Autoryzacja: Użycie Supabase Auth do weryfikacji tokenu JWT.
- RLS: W bazie danych stosowane są polityki RLS ograniczające dostęp do rekordów na podstawie user_id.
- Walidacja wejścia: Szczegółowa walidacja danych wejściowych (użycie Zod lub podobnej biblioteki) w celu zapobiegania nieprawidłowym lub złośliwym danym.
- Ochrona przed atakami typu injection: Użycie mechanizmów zabezpieczających przy operacjach na bazie danych.

## 7. Obsługa błędów

- 400 Bad Request: W przypadku nieprawidłowych danych wejściowych (np. zła długość source_text).
- 401 Unauthorized: Gdy użytkownik nie jest uwierzytelniony.
- 500 Internal Server Error: W przypadku nieoczekiwanych błędów serwera.
- 503 Service Unavailable: Jeśli serwis AI jest niedostępny (błąd usługi AI, wpis do generations_error_logs).

## 8. Rozważenia dotyczące wydajności

- Wstępna walidacja długości tekstu przed przetwarzaniem:
  - Minimalizuje koszty operacji przez wczesne odrzucenie błędnych żądań.
- Timeout dla wywołań AI: 60 sekund
- Asynchroniczne wywołanie usługi AI:
- Użycie operacji asynchronicznych w celu nieblokowania głównego wątku serwera.
- Optymalizacja zapytań do bazy danych poprzez indeksację kolumn (np. user_id, generation_id) zgodnie z dokumentacją schematu.

## 9. Etapy wdrożenia

1. Utworzenie pliku endpointu: `/src/pages/api/generations.ts` (Astro API endpoint), ustawienie `export const prerender = false`.
2. Implementacja walidacji wejścia przy użyciu biblioteki Zod (sprawdzanie długości `source_text`).
3. Implementacja warstwy serwisowej (`generation.service`) odpowiedzialnej za komunikację z serwisem AI:
   - Abstrakcja logiki wywołania usługi AI - na etapie developmentu skorzystamy z mocków zamiast wywołania serwisu AI.
   - Obsługa odpowiedzi:
     – w przypadku powodzenia zwrócenie GenerationDto oraz zapis danych w bazie danych - utworzenie rekordu w tabeli generations z odpowiednimi informacjami.;
   - w przypadku błędu zapis do generations_error_logs.
4. Dodanie mechanizmu uwierzytelniania Supabase Auth.
5. Implementacja logiki endpointu z wykorzystaniem utworzonego swrwisu.
6. Dodanie szczegółowego logowania akcji i błędów.
   \*/
