# Plan wdrożenia usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter integruje nasz system z API OpenRouter w celu wzbogacenia czatów opartych na LLM. Umożliwia wysyłanie zapytań do modelu językowego, odbieranie odpowiedzi oraz ich walidację za pomocą predefiniowanego schematu JSON. Usługa ma zapewnić elastyczność, wysoką niezawodność i bezpieczeństwo przy korzystaniu z API.

## 2. Opis konstruktora

Konstruktor usługi będzie przyjmował następujące parametry konfiguracyjne:

1. Klucz API i endpoint OpenRouter
2. Domyślną nazwę modelu (np. `open_router_default_model`)
3. Parametry modelu (np. `{ temperature: 0.7, max_tokens: 150 }`)
4. Domyślne komunikaty systemowy i użytkownika, które mogą być rozszerzane przy każdym żądaniu
5. Konfigurację formatu odpowiedzi (response_format) z ustrukturyzowanym schematem JSON

## 3. Publiczne metody i pola

### Publiczne metody:

1. **sendChatMessage(userMessage: string): Promise<Response>**

   - Wysyła komunikat użytkownika wraz z domyślnym komunikatem systemowym do API OpenRouter.
   - Wywołuje wewnętrzne metody budujące payload oraz obsługę błędów.

2. **updateConfiguration(config: Configuration): void**

   - Aktualizuje konfigurację usługi (klucz API, endpoint, nazwa modelu, parametry, itd.).

3. **getLastResponse(): Response**
   - Zwraca ostatnio otrzymaną odpowiedź, przydatną do debugowania i monitoringu.

### Publiczne pola:

1. **apiEndpoint** – Adres URL endpointu API OpenRouter.
2. **modelName** – Nazwa wykorzystywanego modelu.
3. **modelParameters** – Parametry konfiguracyjne modelu (np. temperatura, maksymalna liczba tokenów).
4. **defaultSystemMessage** – Domyślny komunikat systemowy (np. "You are a helpful assistant specialized in enriching chat interactions.").

## 4. Prywatne metody i pola

### Prywatne metody:

1. **buildPayload(userMessage: string): object**

   - Konstrukuje payload do wysłania, uwzględniając:
     - Komunikat systemowy
     - Komunikat użytkownika
     - Ustrukturyzowany format odpowiedzi (response_format)
     - Nazwę modelu
     - Parametry modelu
   - **Przykład elementów payload:**
     1. Komunikat systemowy: "You are a highly capable AI assistant."
     2. Komunikat użytkownika: Treść przesłana przez użytkownika
     3. response_format: `{ type: 'json_schema', json_schema: { name: 'chat_response', strict: true, schema: { answer: { type: 'string' }, note: { type: 'string' } } } }`
     4. Nazwa modelu: `open_router_default_model`
     5. Parametry modelu: `{ temperature: 0.7, max_tokens: 150 }`

2. **parseResponse(apiResponse: object): object**

   - Waliduje i parsuje odpowiedź API według zdefiniowanego JSON Schema.
   - Wykorzystuje bibliotekę walidującą schemat lub własną implementację walidatora.

3. **handleErrors(error: Error): void**
   - Centralizuje obsługę błędów, logując i przekształcając błędy na czytelne komunikaty.

### Prywatne pola:

1. **configuration** – Obiekt przechowujący bieżącą konfigurację usługi.
2. **lastResponse** – Ostatnia otrzymana odpowiedź, wykorzystywana do debugowania.

## 5. Obsługa błędów

Potencjalne scenariusze błędów i ich obsługa:

1. **Błąd sieci (Network Error):**

   - Wyzwanie: Niestabilne połączenie, timeout lub brak dostępu do API.
   - Rozwiązanie: Implementacja mechanizmu ponawiania prób (retry) oraz timeoutów.

2. **Błędna konfiguracja (Invalid Configuration):**

   - Wyzwanie: Niepoprawny klucz API, błędne endpoint lub niedostateczne parametry modelu.
   - Rozwiązanie: Walidacja konfiguracji przy starcie usługi oraz przy każdej aktualizacji.

3. **Błąd parsowania odpowiedzi (Response Parsing Error):**

   - Wyzwanie: Odpowiedź nie odpowiada zdefiniowanemu schematowi JSON.
   - Rozwiązanie: Użycie walidatora schematu i mechanizmów fallback, jeżeli odpowiedź jest niezgodna.

4. **Błąd limitowania (Rate Limiting):**
   - Wyzwanie: Przekroczenie limitów API.
   - Rozwiązanie: Monitorowanie liczby zapytań i wdrożenie mechanizmów kolejkowania oraz exponential backoff.

## 6. Kwestie bezpieczeństwa

1. **Przechowywanie kluczy API:**

   - Używanie zmiennych środowiskowych do przechowywania kluczy API.

2. **Walidacja danych wejściowych:**

   - Sanityzacja komunikatów użytkownika, aby zapobiec atakom typu injection.

3. **Bezpieczna transmisja danych:**

   - Wymuszanie połączeń HTTPS dla wszystkich wywołań API.

4. **Monitorowanie i logowanie:**
   - Logowanie błędów oraz nietypowych zachowań w systemie, przy jednoczesnym zachowaniu poufności danych.

## 7. Plan wdrożenia krok po kroku

1. **Konfiguracja środowiska:**

   - Upewnić się, że wszystkie niezbędne zmienne środowiskowe (API_KEY, API_ENDPOINT) są poprawnie ustawione.
   - Skonfigurować pliki konfiguracyjne oraz system zarządzania konfiguracją w oparciu o obecny stack (Astro, TypeScript, Supabase itp.).

2. **Implementacja modułu OpenRouter API Client:**

   - Utworzyć nowy moduł w katalogu `./src/lib` odpowiedzialny za komunikację z OpenRouter API.
   - Zaimplementować metody wysyłania zapytań z obsługą retry, timeout oraz walidacją odpowiedzi.

3. **Implementacja Payload Builder i Response Parser:**

   - Utworzyć prywatne metody `buildPayload` oraz `parseResponse` w module klienta.
   - Zaimplementować logikę łączenia komunikatów systemowego i użytkownika oraz dodawania kluczowych elementów (response_format, model name, model parameters).

4. **Konfiguracja formatu odpowiedzi:**

   - Ustalić schemat JSON odpowiedzi, np.:
     ```json
     {
       "type": "json_schema",
       "json_schema": {
         "name": "chat_response",
         "strict": true,
         "schema": { "answer": { "type": "string" }, "note": { "type": "string" } }
       }
     }
     ```
   - Wdrożyć walidację opracowanego schematu wewnątrz metody `parseResponse`.

5. **Implementacja obsługi błędów:**
   - Zaimplementować centralną metodę `handleErrors` przechwytującą wszystkie typy błędów (sieciowe, konfiguracji, parsowania, limitowania) i logującą odpowiednie zdarzenia.
