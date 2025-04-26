# OpenRouter Service Implementation Plan

## 1. Opis usługi

Usługa OpenRouter integruje się z API OpenRouter w celu uzupełnienia czatów opartych na Large Language Model (LLM). Jej zadaniem jest przyjmowanie zapytań od użytkowników, przetwarzanie ich oraz wysyłanie odpowiednio sformatowanych zapytań do API. Otrzymana odpowiedź jest walidowana, parsowana i przekazywana z powrotem do aplikacji, co pozwala na dynamiczne i inteligentne uzupełnianie konwersacji.

### Kluczowe komponenty:

1. **OpenRouter API Client**
   - Funkcjonalność: Komunikacja z API OpenRouter; wykonywanie zapytań z poprawnie sformatowanym payload.
   - Potencjalne wyzwania:
     1. Niezawodność połączenia sieciowego i timeouty.
     2. Bezpieczne przechowywanie i przekazywanie klucza API.
     3. Walidacja i parsowanie odpowiedzi.
   - Propozycje rozwiązań:
     1. Implementacja mechanizmu retry oraz timeout.
     2. Przechowywanie kluczy API w zmiennych środowiskowych.
     3. Użycie walidacji JSON schema do weryfikacji response_format.

2. **Chat Context Manager**
   - Funkcjonalność: Zarządzanie historią czatu, budowanie kontekstu oraz tworzenie payload dla zapytań.
   - Potencjalne wyzwania:
     1. Utrzymanie spójności danych i poprawne łączenie historii rozmów.
     2. Optymalizacja zarządzania dużą historią czatu.
   - Propozycje rozwiązań:
     1. Ograniczenie wielkości historii i stosowanie buforowania.
     2. Regularna walidacja i czyszczenie danych kontekstowych.

3. **Response Processor**
   - Funkcjonalność: Analiza odpowiedzi z API, walidacja schematu (response_format) oraz ekstrakcja użytecznych danych.
   - Potencjalne wyzwania:
     1. Niezgodność formatu odpowiedzi względem oczekiwanej struktury.
     2. Problemy z parsowaniem złożonych struktur JSON.
   - Propozycje rozwiązań:
     1. Wdrożenie walidacji JSON schema z przykładowym wzorcem:
        { type: 'json_schema', json_schema: { name: 'chatCompletion', strict: true, schema: { result: 'string', details: 'object' } } }
     2. Stosowanie bibliotek do walidacji schematów JSON.

4. **Error Handling Module**
   - Funkcjonalność: Centralna obsługa błędów i wyjątków napotkanych podczas komunikacji z API oraz przetwarzania danych.
   - Potencjalne wyzwania:
     1. Różnorodność potencjalnych błędów (np. problemy sieciowe, błędy autoryzacji, błędne dane wejściowe).
     2. Utrzymanie spójności komunikatów błędów i ich logowania.
   - Propozycje rozwiązań:
     1. Implementacja dedykowanych mechanizmów retry i fallback.
     2. Szczegółowe logowanie błędów oraz ujednolicona struktura obsługi wyjątków.

## 2. Opis konstruktora

Constructor usługi (np. OpenRouterService) będzie odpowiedzialny za inicjalizację podstawowych ustawień, takich jak:
- apiKey oraz apiEndpoint
- Domyślny system prompt (np. "You are a helpful assistant.")
- Nazwa modelu do użycia (np. "gpt-4")
- Domyślne parametry modelu (np. { temperature: 0.7, max_tokens: 150 })
- Inicjalizacja mechanizmów zarządzania historią czatu oraz obsługi błędów

## 3. Publiczne metody i pola

**Metody:**

1. sendMessage(userMessage: string, modelParams?: object): Promise<any>
   - Przyjmuje wiadomość użytkownika, łączy ją z system prompt i historią czatu, wysyła zapytanie do API i zwraca odpowiedź.
2. getChatHistory(): Array<string>
   - Zwraca aktualną historię czatu.
3. updateModelParameters(newParams: object): void
   - Umożliwia aktualizację domyślnych parametrów modelu.

**Pola:**
- apiKey: string
- apiEndpoint: string
- systemPrompt: string
- modelName: string
- modelParameters: object
- chatHistory: Array<string>

## 4. Prywatne metody i pola

**Metody:**

1. _buildRequestPayload(userMessage: string): object
   - Buduje strukturę zapytania zawierającą:
     a. Komunikat systemowy (np. "You are a helpful assistant.")
     b. Komunikat użytkownika (otrzymany jako argument)
     c. Response format, np.:
        { type: 'json_schema', json_schema: { name: 'chatCompletion', strict: true, schema: { result: 'string', details: 'object' } } }
     d. Nazwa modelu (np. "gpt-4")
     e. Parametry modelu (np. { temperature: 0.7, max_tokens: 150 })
2. _parseResponse(response: any): any
   - Analizuje odpowiedź API, waliduje ją przy pomocy JSON schema oraz wyodrębnia niezbędne dane.
3. _handleError(error: Error): void
   - Centralny mechanizm obsługi błędów, który loguje błąd i wykonuje odpowiednie akcje naprawcze.

**Pola:**
- _timeoutDuration: number – czas oczekiwania na odpowiedź API
- _internalErrorQueue: Array<Error> – kolejka błędów do dalszej analizy i logowania

## 5. Obsługa błędów

W potencjalnych scenariuszach błędów należy uwzględnić:

1. Błąd połączenia (np. timeout, brak dostępu do API).
2. Niezgodność formatu odpowiedzi – błędy walidacji response_format.
3. Błędy autoryzacji (np. niepoprawny apiKey).
4. Błędy wewnętrzne podczas budowania zapytań lub przetwarzania danych.

Dla powyższych scenariuszy proponujemy:

1. Implementację mechanizmu retry z eksponencjalnym backoff.
2. Walidację odpowiedzi przy użyciu JSON schema.
3. Szczegółowe logowanie błędów oraz informowanie użytkownika o problemie w przyjazny sposób.
4. Upewnienie się, że każda metoda publiczna posiada zabezpieczenia i natychmiastowe powiadomienia w przypadku krytycznych błędów.

## 6. Kwestie bezpieczeństwa

- Przechowywanie klucza API w bezpieczny sposób (zmienne środowiskowe, szyfrowanie).
- Walidacja oraz sanitizacja danych wejściowych, aby zapobiec wstrzyknięciom i atakom.
- Ograniczenie dostępu do usług (np. poprzez rate limiting) oraz kontrola dostępu do API.
- Regularne monitorowanie logów oraz alertów w celu wykrywania podejrzanych zdarzeń.

## 7. Plan wdrożenia krok po kroku

1. **Konfiguracja środowiska:**
   - Ustawienie zmiennych środowiskowych (np. API_KEY, API_ENDPOINT).
   - Instalacja wymaganych zależności zgodnie z technologią: Astro 5, TypeScript 5, React 19, Tailwind 4, Shadcn/ui.

2. **Implementacja modułu OpenRouterService:**
   - Zdefiniowanie konstruktora i inicjalizacja kluczowych pól (apiKey, apiEndpoint, systemPrompt, modelName, modelParameters).

3. **Implementacja metod publicznych:**
   - Utworzenie metody sendMessage, która buduje payload, wysyła zapytanie i obsługuje odpowiedź.
   - Implementacja metody getChatHistory oraz updateModelParameters.

4. **Implementacja metod prywatnych:**
   - Budowa metody _buildRequestPayload, uwzględniającej:
     a. Komunikat systemowy: "You are a helpful assistant."
     b. Komunikat użytkownika: dynamicznie przekazywany na podstawie inputu.
     c. Response format: { type: 'json_schema', json_schema: { name: 'chatCompletion', strict: true, schema: { result: 'string', details: 'object' } } }
     d. Nazwa modelu: np. "gpt-4"
     e. Parametry modelu: np. { temperature: 0.7, max_tokens: 150 }
   - Utworzenie metody _parseResponse z walidacją struktury odpowiedzi.

5. **Wdrożenie systemu obsługi błędów:**
   - Implementacja _handleError z mechanizmami retry i loggingiem.
   - Testowanie scenariuszy błędów (timeout, błędna autoryzacja, niezgodna struktura odpowiedzi).

6. **Integracja z komponentami frontendowymi:**
   - Połączenie z interfejsem czatu opartego na React 19 i Shadcn/ui.
   - Upewnienie się, że zachowanie usługi jest zgodne z oczekiwaniami UX.
 