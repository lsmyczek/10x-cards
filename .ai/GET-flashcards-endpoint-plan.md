# API Endpoint Implementation Plan: GET /api/flashcards

## 1. Przegląd punktu końcowego

Endpoint służy do pobierania listy fiszek powiązanych z aktualnie zalogowanym użytkownikiem. Umożliwia filtrowanie, sortowanie oraz paginację wyników, co pozwala na efektywne zarządzanie danymi przy dużej liczbie rekordów.

## 2. Szczegóły żądania

- **Metoda HTTP**: GET
- **Struktura URL**: `/api/flashcards`
- **Parametry zapytania**:
  - **page** (integer, opcjonalny): Numer strony (domyślnie 1).
  - **limit** (integer, opcjonalny): Liczba elementów na stronę (domyślnie 20, maksymalnie 100).
  - **sort** (string, opcjonalny): Pole, według którego należy sortować wyniki; dozwolone wartości to `created_at` oraz `updated_at`.
  - **order** (string, opcjonalny): Kolejność sortowania; dozwolone wartości to `asc` (rosnąco) oraz `desc` (malejąco).
  - **source** (string, opcjonalny): Filtrowanie wyników po źródle fiszki; dozwolone wartości to `ai-full`, `ai-edited` oraz `manual`.
- **Request Body**: Brak

## 3. Wykorzystywane typy

- **FlashcardDto** – DTO reprezentujący pojedynczą fiszkę.
- **PaginationMetaDto** – DTO przechowujący informacje o paginacji (total, page, limit, pages).
- **FlashcardsListResponseDto** – Struktura odpowiedzi zawierająca listę fiszek oraz metadane paginacji.
- **Schemat walidacji Zod** – Do walidacji parametrów zapytania (page, limit, sort, order, source).

## 4. Szczegóły odpowiedzi

- **Status 200 OK**
  - **Treść odpowiedzi (JSON)**:
    ```json
    {
      "data": [
        {
          "id": 1,
          "front": "Przykładowy front",
          "back": "Przykładowa odpowiedź",
          "source": "manual",
          "created_at": "2023-10-10T12:34:56Z",
          "updated_at": "2023-10-10T12:34:56Z",
          "generation_id": null
        }
      ],
      "meta": {
        "total": 100,
        "page": 1,
        "limit": 20,
        "pages": 5
      }
    }
    ```
- **Możliwe kody błędów**:
  - **401 Unauthorized** – Użytkownik nie jest uwierzytelniony.
  - **400 Bad Request** – Parametry zapytania nie spełniają wymagań (np. nieprawidłowa wartość `limit` lub `sort`).
  - **500 Internal Server Error** – Błąd wewnętrzny serwera, np. związany z zapytaniem do bazy danych.

## 5. Przepływ danych

1. **Autoryzacja**:
   - Middleware autoryzacyjne sprawdza token użytkownika i wyodrębnia `userId`. Autoryzacja zostanie dodana na późniejszym etapie - W tej implementecji korzystamy z domyślnego uytkownika (DEFAULT_USER_ID), który jest ju zdefiniowany w middleware.
2. **Walidacja parametrów**:
   - Przy użyciu Zod sprawdzamy, czy parametry zapytania (page, limit, sort, order, source) są poprawne. Na przykład, parametr `limit` musi być liczbą nieprzekraczającą 100.
3. **Pobieranie danych**:
   - FlashcardsService (rozszerzony o metodę `getFlashcards`) wykonuje zapytanie do tabeli `flashcards` w Supabase:
     - Filtrowanie według `user_id = <userId>`.
     - Dodatkowe filtrowanie po parametrze `source` (jeśli jest podany).
     - Sortowanie wyników wg. wybranego pola (`created_at` lub `updated_at`) i kolejność (`asc`/`desc`).
     - Zastosowanie paginacji (offset = (page - 1) \* limit, limit).
4. **Odpowiedź**:
   - Wyniki zapytania są formatowane zgodnie z `FlashcardsListResponseDto` i zwracane do klienta w formacie JSON.

## 6. Względy bezpieczeństwa

- **Autoryzacja**:
  - Endpoint dostępny tylko dla zalogowanych użytkowników; middleware sprawdza tożsamość użytkownika.
- **Row-Level Security (RLS)**:
  - Polityki RLS w Supabase gwarantują, że użytkownik widzi jedynie swoje fiszki.
- **Walidacja wejścia**:
  - Użycie biblioteki Zod do walidacji parametrów zapytania zmniejsza ryzyko błędów i ataków (np. SQL Injection).
- **Bezpieczne zapytania**:
  - Korzystanie z query buildera Supabase, który prawidłowo escape’uje wprowadzone wartości.

## 7. Obsługa błędów

- **401 Unauthorized**:
  - Zwracane, jeśli użytkownik nie jest uwierzytelniony.
- **400 Bad Request**:
  - Zwracane, gdy parametry zapytania są nieprawidłowe lub nie spełniają wymagań walidacyjnych.
- **500 Internal Server Error**:
  - Zwracane przy błędach podczas operacji na bazie danych lub innych nieoczekiwanych problemach serwera.
- **Logowanie błędów**:
  - Każdy błąd powinien być logowany (np. do konsoli lub systemu logowania) w celu ułatwienia debugowania oraz monitorowania.

## 8. Rozważenia dotyczące wydajności

- **Pagination**:
  - Używanie paginacji zapobiega pobieraniu nadmiernie dużej liczby rekordów jednocześnie.
- **Indeksy bazy danych**:
  - Zapytania korzystają z indeksu na kolumnie `user_id`, co przyspiesza wyszukiwanie.
- **Optymalizacja zapytań**:
  - Filtrowanie, sortowanie i paginacja zostaną wykonane na poziomie bazy danych, minimalizując obciążenie aplikacji.
- **Cache’owanie (opcjonalnie)**:
  - Ewentualna implementacja cache’owania odpowiedzi dla zmniejszenia liczby zapytań do bazy, w przypadku dużej liczby żądań.

## 9. Etapy wdrożenia

1. **Konfiguracja środowiska i autoryzacji**:
   - Na tym etapie korzystamy z domyślnego usera `DEFAULT_USER_ID`, który jest zdefiniowany w middleware. Autoryzacją zajmiemy się na późniejszym etapie.
2. **Implementacja walidacji parametrów**:
   - Zdefiniować schemat walidacji w Zod dla parametrów zapytania (`page`, `limit`, `sort`, `order`, `source`).
3. **Rozszerzenie FlashcardsService**:
   - Dodać metodę `getFlashcards` do obecnego pliku `src/lib/services/flashcards.service.ts`, która:
     - Pobiera i filtruje dane z tabeli `flashcards` na podstawie `userId` i opcjonalnych parametrów.
     - Aplikuje sortowanie oraz paginację.
4. **Implementacja endpointu API**:
   - Zaktualizować plik endpointu (`src/pages/api/flashcards.ts`) o metodę GET.
   - Zaimportować FlashcardsService, typy DTO oraz schemat walidacyjny.
   - Pobierać parametry zapytania z URL, walidować je i wywołać metodę `getFlashcards`.
   - Zwracać odpowiedź w formacie `FlashcardsListResponseDto` z odpowiednim kodem stanu (200 OK).
