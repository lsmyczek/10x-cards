# API Endpoint Implementation Plan: POST /api/flashcards

## 1. Przegląd punktu końcowego
Endpoint POST /api/flashcards umożliwia tworzenie jednej lub wielu fiszek. Fiszki mogą być wprowadzane ręcznie lub pochodzić z automatycznie wygenerowanych propozycji AI. Endpoint zbiera dane wejściowe, waliduje je, wykonuje odpowiednie sprawdzenia autoryzacyjne oraz komunikację z bazą danych. Po poprawnym przetworzeniu zwraca utworzone rekordy wraz z liczbą utworzonych wpisów.

## 2. Szczegóły żądania
- **Metoda HTTP**: POST
- **Struktura URL**: /api/flashcards
- **Parametry**:
  - **Wymagane**:
    - Klucz główny: `flashcards` (tablica obiektów)
    - Każdy obiekt musi zawierać:
      - `front`: string (maksymalnie 200 znaków)
      - `back`: string (maksymalnie 500 znaków)
      - `source`: string (dozwolone wartości: 'manual', 'ai-full', 'ai-edited')
  - **Opcjonalne**:
    - `generation_id`: number (wymagany jeżeli `source` ma wartość `ai-full` lub `ai-edited`)
- **Request Body Example**:
```json
{
  "flashcards": [
    {
      "front": "Pytanie przykładowe",
      "back": "Odpowiedź przykładowa",
      "source": "manual"
    },
    {
      "front": "Pytanie AI",
      "back": "Odpowiedź AI",
      "source": "ai-full",
      "generation_id": 123
    }
  ]
}
```

## 3. Wykorzystywane typy
- **Command Models**:
  - `CreateFlashcardInput` – reprezentuje pojedynczą fiszkę, zawiera `front`, `back`, `source` oraz opcjonalnie `generation_id`.
  - `CreateFlashcardsCommand` – zawiera tablicę `flashcards` typu `CreateFlashcardInput[]`.
- **DTOs**:
  - `FlashcardDto` – typ reprezentujący dane fiszki zwracane przez API, zawiera `id`, `front`, `back`, `source`, `created_at`, `updated_at` oraz `generation_id`.

## 4. Szczegóły odpowiedzi
- **Sukces**: 201 Created
- **Struktura odpowiedzi**:
```json
{
  "data": [
    {
      "id": 1,
      "front": "Pytanie przykładowe",
      "back": "Odpowiedź przykładowa",
      "source": "manual",
      "created_at": "2023-10-01T12:00:00Z",
      "updated_at": "2023-10-01T12:00:00Z",
      "generation_id": null
    }
  ],
  "meta": {
    "created_count": 1
  }
}
```

- **Kody błędów**:
  - 400 Bad Request: Nieprawidłowe dane wejściowe
  - 401 Unauthorized: Użytkownik nie jest uwierzytelniony
  - 403 Forbidden: Podane generation_id nie należy do użytkownika
  - 404 Not Found: Podane generation_id nie istnieje
  - 500 Internal Server Error: Błąd serwera

## 5. Przepływ danych
1. Klient wysyła żądanie POST /api/flashcards z danymi w formacie JSON.
2. Warstwa API weryfikuje uwierzytelnienie użytkownika (np. za pomocą Supabase Auth, korzystając z tokenu JWT).
3. Dane wejściowe są walidowane przy użyciu schematów (z wykorzystaniem Zod). Sprawdzane są:
   - Wymagane pola: `front`, `back`, `source`
   - Długość pól: `front` ≤ 200 znaków, `back` ≤ 500 znaków
   - Jeśli `source` to `ai-full` lub `ai-edited`, `generation_id` musi być dostarczone
4. Jeżeli `generation_id` jest podane, wykonywane jest dodatkowe sprawdzenie:
   - Czy podana generacja istnieje
   - Czy dana generacja należy do uwierzytelnionego użytkownika
5. Po zatwierdzeniu walidacji, odpowiednia logika biznesowa (np. w nowym lub istniejącym serwisie FlashcardsService) tworzy fiszki w bazie danych w ramach transakcji.
6. Po zapisaniu rekordów, zostają zwrócone dane utworzonych fiszek oraz meta-informacja z liczbą utworzonych wpisów.

## 6. Względy bezpieczeństwa
- Walidacja danych wejściowych (użycie Zod) zabezpiecza przed nieprawidłowymi danymi.
- Weryfikacja tożsamości użytkownika na podstawie JWT (401 Unauthorized, jeżeli brak tokenu lub niewłaściwy token).
- Sprawdzenie, czy `generation_id` należy do uwierzytelnionego użytkownika, aby zapobiec atakom typu "podmiana danych" (403 Forbidden w przypadku naruszenia).
- Zapewnienie, że dane do bazy są wstawiane przy użyciu bezpiecznych mechanizmów (np. zapobieganie SQL Injection przez używanie parametrów w zapytaniach).
- Zastosowanie RLS (Row-Level Security) w bazie danych, aby ograniczyć dostęp do danych tylko do właściciela rekordu.

## 7. Obsługa błędów
- **400 Bad Request**: Zwracany, kiedy walidacja danych wejściowych zawiedzie (np. brak wymaganych pól, niepoprawna długość tekstu).
- **401 Unauthorized**: Zwracany, gdy użytkownik nie przejdzie weryfikacji tokenu JWT lub nie jest zalogowany.
- **403 Forbidden**: Zwracany, gdy `generation_id` nie należy do użytkownika.
- **404 Not Found**: Zwracany, gdy podane `generation_id` nie istnieje.
- **500 Internal Server Error**: Zwracany w przypadku niespodziewanych błędów serwera lub problemów przy zapisie do bazy danych.
- Logowanie błędów: W przypadku napotkania błędów serwera lub walidacyjnych, należy rejestrować logi, aby umożliwić diagnostykę i poprawę jakości usługi.

## 8. Rozważania dotyczące wydajności
- Implementacja wsadowa: Umożliwienie tworzenia wielu fiszek w jednym żądaniu zmniejsza liczbę operacji w bazie danych.
- Użycie transakcji: Wszystkie operacje zapisu powinny być wykonywane w transakcji, aby zagwarantować spójność danych.
- Indeksy: Baza danych posiada indeksy na kolumnach `user_id` i `generation_id`, co zapewnia szybkie wyszukiwanie oraz weryfikację danych.
- Skalowanie: Rozważenie limitów liczby fiszek w jednym żądaniu, aby uniknąć potencjalnych problemów z pamięcią lub czasem odpowiedzi.

## 9. Etapy wdrożenia
1. **Przygotowanie schematów walidacji**:
   - Zdefiniowanie schematu Zod dla obiektu `CreateFlashcardInput`.
   - Zdefiniowanie schematu dla `CreateFlashcardsCommand` uwzględniającego warunki dotyczące `generation_id`.

2. **Implementacja logiki biznesowej**:
   - Utworzenie lub rozszerzenie serwisu FlashcardsService z metodą `createFlashcards` przyjmującą command typu `CreateFlashcardsCommand`.
   - Dodanie logiki weryfikującej istnienie oraz przynależność `generation_id` do użytkownika.
   - Implementacja operacji zapisu danych do bazy danych w obrębie transakcji.

3. **Implementacja endpointu API**:
   - Stworzenie pliku lub modułu dla endpointu POST /api/flashcards (np. w katalogu `src/pages/api`).
   - Integracja ze środkami uwierzytelniania (Supabase Auth i middleware w Astro).
   - Wywołanie metody serwisowej i obsługa odpowiedzi oraz błędów zgodnie z powyższymi specyfikacjami.

4. **Dokumentacja**:
   - Kod powinien być opatrzony krótkimi lecz zrozumiałymi komantarzami. 