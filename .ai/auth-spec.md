# Specyfikacja modułu autoryzacji dla 10x-cards

## 1. Architektura interfejsu użytkownika

### 1.1 Struktura stron i layoutów
- Rozdzielamy interfejs na obszary dostępne dla użytkowników uwierzytelnionych (auth) oraz nieautoryzowanych (non-auth).
- Strony autoryzacyjne, takie jak:
  - Rejestracja (/sign-up)
  - Logowanie (/sign-in)
  - Odzyskiwanie hasła (/forgot-password) i reset hasła (/reset-password)
  będą umieszczone w katalogu np. `/src/pages/auth/`.
- Dla stron nieautoryzowanych stosowany będzie uproszczony layout, skupiony na formularzach bez dodatkowych elementów nawigacyjnych.
- Dla stron uwierzytelnionych (np. dashboard) używany będzie pełny layout zawierający header, sidebar i menu nawigacyjne.

### 1.2 Komponenty i odpowiedzialności
- Komponenty React:
  - Formularze rejestracji, logowania i odzyskiwania hasła zostaną zaimplementowane jako dynamiczne komponenty React, umieszczone w katalogu `/src/components/auth/`.
  - Komponenty obsługujące walidację formularzy, prezentację błędów i loading state.
  - Dedykowane hooki lub context API do zarządzania stanem autoryzacji (sesja użytkownika np. useAuth lub AuthContext).
- Strony Astro:
  - Odpowiedzialne za routing, serwerowe renderowanie (SSR) oraz integrację z backendem.
  - Budowa stron wykorzystujących komponenty React, gdzie wymagane jest dynamiczne uaktualnianie UI na podstawie stanu autoryzacji.

### 1.3 Walidacja i obsługa błędów
- Formularze będą zawierać walidację po stronie klienta (sprawdzenie poprawności emaila, minimalnej długości hasła, zgodności haseł itp.).
- Po stronie serwera, API dodatkowo weryfikuje dane, przy użyciu bibliotek takich jak Zod lub Joi, aby zapewnić poprawność przekazywanych danych.
- Komunikaty o błędach będą prezentowane użytkownikowi w formie:
  - Inline alertów przy poszczególnych polach formularza (np. "Nieprawidłowy format email", "Hasło musi mieć minimum 8 znaków").
  - Ogólnych komunikatów informujących o błędzie autoryzacji lub problemach z siecią.

### 1.4 Scenariusze użytkowania
- Rejestracja:
  - Użytkownik wypełnia formularz rejestracji (email, hasło, potwierdzenie hasła).
  - Dane są walidowane lokalnie oraz przesyłane do endpointu `/api/auth/sign-up`.
  - W razie błędu (np. email już istnieje) użytkownik otrzymuje odpowiedni komunikat.
- Logowanie:
  - Formularz logowania zawiera pola email i hasło, po submit następuje weryfikacja.
  - Poprawne dane skutkują zalogowaniem i przekierowaniem do dashboardu (/dashboard).
  - Błędne dane wyświetlają komunikat o błędzie.
- Odzyskiwanie hasła:
  - Użytkownik wpisuje swój adres email w formularzu odzyskiwania hasła.
  - Po przesłaniu żądania, system wysyła email z linkiem do resetu hasła.
  - Aktualny stan operacji (sukces/błąd) jest informowany użytkownika.

## 2. Logika backendowa

### 2.1 Struktura endpointów API
- Endpointy umieszczone w katalogu `/src/pages/api/auth/`:
  - `POST /api/auth/register` – rejestracja nowego użytkownika.
  - `POST /api/auth/login` – logowanie i inicjalizacja sesji użytkownika.
  - `POST /api/auth/logout` – zakończenie sesji, wylogowywanie użytkownika.
  - `POST /api/auth/password-reset` – inicjacja procedury odzyskiwania hasła (wysłanie emaila z linkiem resetującym).

### 2.2 Modele danych i walidacja
- Modele danych odpowiadające użytkownikom będą zgodne z wymaganiami Supabase Auth, a dodatkowe informacje mogą być przechowywane w bazie danych (np. profil użytkownika) w `/src/db`.
- Walidacja danych wejściowych odbywa się dwustopniowo:
  - Po stronie klienta: wbudowana w formularze (np. React Hook Form) z natychmiastową informacją zwrotną.
  - Po stronie serwera: przy użyciu bibliotek takich jak Zod lub Joi, zapewniających integralność danych.
- DTO (Data Transfer Objects) i kontrakty danych definiowane są w `/src/types.ts`.

### 2.3 Obsługa wyjątków
- Każdy endpoint implementuje mechanizm try/catch w celu wychwytywania błędów.
- W przypadku wystąpienia błędu, odpowiedni status HTTP (np. 400, 401, 500) oraz komunikat są zwracane do klienta.
- Błędy są logowane na serwerze dla dalszej analizy.

### 2.4 Renderowanie server-side
- Zgodnie z konfiguracją w `astro.config.mjs`, niektóre strony są renderowane po stronie serwera. 
- Dane dotyczące sesji i autoryzacji są przekazywane z poziomu middleware (`/src/middleware/index.ts`) do layoutów, umożliwiając dynamiczną zmianę interfejsu w zależności od stanu użytkownika.

## 3. System autentykacji

### 3.1 Integracja z Supabase Auth
- Całość systemu autoryzacji opiera się na Supabase Auth, który obsługuje:
  - Rejestrację użytkowników
  - Logowanie za pomocą email i hasła
  - Zarządzanie sesjami (w tym automatyczne odnawianie sesji, jeżeli to konieczne)
  - Odzyskiwanie hasła poprzez wysyłanie maila z linkiem resetującym
- Supabase Client zostanie skonfigurowany w katalogu `/src/db`, co umożliwi łatwą integrację zarówno w warstwie Astro, jak i React.

### 3.2 Zarządzanie sesją i autoryzacją
- Frontend:
  - Użycie context API lub hooków (np. useAuth) do zarządzania stanem sesji użytkownika.
  - Middleware na stronach server-side, które weryfikują autentyczność użytkownika i przekierowują w przypadku braku sesji do stron logowania.
- Backend:
  - Weryfikacja tokenów sesyjnych przy każdym żądaniu do chronionych endpointów.
  - Opcjonalnie, implementacja mechanizmu automatycznego odnawiania sesji.

### 3.3 Bezpieczeństwo
- Wszystkie operacje przesyłane są przez bezpieczne połączenie (HTTPS).
- Hasła i wrażliwe dane są przesyłane oraz przechowywane w formie zaszyfrowanej, korzystając z domyślnych mechanizmów Supabase.
- System monitoruje i loguje nieautoryzowane próby dostępu, co pozwala na szybką reakcję w przypadku ataku.

## Podsumowanie

Niniejsza specyfikacja definiuje szczegółową architekturę modułu autoryzacji dla aplikacji 10x-cards, opartego na wymogach produktu i przyjętym stacku technologicznym. Propozycja ta zapewnia wyraźne rozdzielenie warstw frontendowych i backendowych, dokładne zasady walidacji i obsługi błędów oraz bezpieczną i skalowalną integrację z Supabase Auth. Dzięki temu system autentykacji stanie się integralną i niezawodną częścią aplikacji, spełniając wszystkie wymagania funkcjonalne i bezpieczeństwa. 