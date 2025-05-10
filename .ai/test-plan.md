# Plan Testów dla Projektu 10x-cards

**Wersja:** 1.0
**Data:** 2024-08-01
**Autor:** [Twoje Imię/Nazwa], Doświadczony Inżynier QA

## 1. Wprowadzenie i Cele Testowania

### 1.1 Wprowadzenie

Projekt "10x-cards" to aplikacja webowa ułatwiająca tworzenie, zarządzanie i naukę fiszek edukacyjnych. Kluczową funkcjonalnością jest wykorzystanie modeli językowych (LLM) do automatycznego generowania propozycji fiszek na podstawie tekstu dostarczonego przez użytkownika. Aplikacja umożliwia również ręczne zarządzanie fiszkami oraz (w przyszłości) naukę z wykorzystaniem algorytmów powtórek interwałowych (spaced repetition). Projekt jest obecnie na etapie wczesnego MVP.

Niniejszy plan testów określa strategię, zakres, zasoby i harmonogram działań testowych mających na celu zapewnienie jakości, funkcjonalności, bezpieczeństwa i wydajności aplikacji 10x-cards.

### 1.2 Cele Testowania

Główne cele procesu testowania to:

- Weryfikacja zgodności zaimplementowanych funkcjonalności z wymaganiami (opisanymi m.in. w plikach `.ai/*.md`).
- Identyfikacja i raportowanie defektów w oprogramowaniu.
- Zapewnienie stabilności i niezawodności kluczowych funkcji (autentykacja, CRUD fiszek, generowanie AI).
- Ocena wydajności aplikacji pod kątem czasu odpowiedzi API i interfejsu użytkownika.
- Weryfikacja bezpieczeństwa aplikacji, szczególnie w obszarze autentykacji, autoryzacji i ochrony danych.
- Zapewnienie dobrej jakości doświadczenia użytkownika (UX) i dostępności (accessibility).
- Potwierdzenie gotowości aplikacji do wdrożenia na środowisko produkcyjne.

## 2. Zakres Testów

### 2.1 Funkcjonalności objęte testami

- **Moduł Autentykacji:**
  - Rejestracja użytkownika (`SignUpForm`, API `/api/auth/register` - _brak implementacji API wg kodu_, Supabase Auth SDK).
  - Logowanie użytkownika (`SignInForm`, API `/api/auth/login`).
  - Wylogowanie użytkownika (`DashboardNavbar`, API `/api/auth/logout`).
  - Resetowanie hasła (`ResetPasswordForm` - _implementacja UI, brak logiki API_).
  - Ochrona ścieżek (Middleware w `src/middleware/index.ts`).
  - Row-Level Security (RLS) w bazie danych Supabase.
- **Zarządzanie Fiszakami (CRUD):**
  - Dodawanie fiszek manualnie (`AddFlashcard`, `FlashcardAddModal`, API `POST /api/flashcards`).
  - Wyświetlanie listy fiszek (`FlashcardsListView`, API `GET /api/flashcards`).
  - Paginacja listy fiszek (`FlashcardsListPagination`).
  - Sortowanie listy fiszek (`FlashcardsListSorting`).
  - Filtrowanie listy fiszek (`FlashcardsListFilters`).
  - Edycja fiszek (`FlashcardItem`, `FlashcardEditModal`, API `PATCH /api/flashcards/:id`).
  - Usuwanie fiszek (`FlashcardItem`, `AlertDialog`, API `DELETE /api/flashcards/:id`).
- **Generowanie Fiszak AI:**
  - Wprowadzanie tekstu źródłowego (`GenerationForm`, walidacja długości).
  - Inicjowanie procesu generowania (API `POST /api/generations`).
  - Integracja z OpenRouter.ai (`OpenRouterService`).
  - Obsługa odpowiedzi AI (parowanie JSON, obsługa błędów).
  - Wyświetlanie propozycji fiszek (`FlashcardGenerator`, `FlashcardProposals`, `FlashcardProposalsItem`).
  - Akceptacja / Odrzucenie / Edycja propozycji fiszek.
  - Zapisywanie zaakceptowanych/edytowanych fiszek (wywołanie `POST /api/flashcards`).
  - Obsługa limitów zapytań (`RateLimiter`, `GenerationService`).
  - Logowanie błędów generacji (`generations_error_logs`).
- **Interfejs Użytkownika (UI):**
  - Layouty (`Layout`, `AuthLayout`, `DashboardLayout`).
  - Nawigacja (Navbar, Sidebar, `navItems`).
  - Komponenty UI (`src/components/ui/`).
  - Responsywność (RWD).
  - Komponenty ładowania (`LoadingSkeleton`, `LoadingGenerationsSkeleton`).
  - Powiadomienia (`sonner`).
- **API Backendowe:**
  - Walidacja danych wejściowych (Zod).
  - Poprawność odpowiedzi (statusy HTTP, struktura JSON).
  - Obsługa błędów.
  - Autoryzacja dostępu.
- **Baza Danych:**
  - Poprawność migracji (`supabase/migrations`).
  - Integralność danych i relacji.
  - Działanie triggerów (np. `updated_at`).

### 2.2 Funkcjonalności poza zakresem testów

- Testowanie wewnętrznej infrastruktury Supabase i OpenRouter.ai (traktowane jako zewnętrzne zależności).
- Testowanie dokładności i jakości merytorycznej treści generowanych przez AI (poza weryfikacją formatu).
- Szczegółowe testy wydajności pod dużym obciążeniem (w ramach MVP skupiamy się na funkcjonalności i podstawowej wydajności).
- Testowanie funkcjonalności "Learn Flashcards" (oznaczonej jako "soon").
- Testowanie procesu CI/CD i deploymentu na DigitalOcean (może być dodane w późniejszej fazie).

## 3. Typy Testów do Przeprowadzenia

- **Testy Jednostkowe (Unit Tests):**
  - **Cel:** Weryfikacja poprawności działania izolowanych fragmentów kodu (funkcje, komponenty React, metody serwisów).
  - **Zakres:** Funkcje pomocnicze (`lib/utils`), logika komponentów React (bez renderowania DOM, np. hooki, zarządzanie stanem), metody serwisów (`FlashcardsService`, `GenerationService`, `OpenRouterService` - z mockowaniem zależności), schematy walidacji Zod.
  - **Narzędzia:** Vitest, React Testing Library (dla hooków/logiki).
- **Testy Integracyjne (Integration Tests):**
  - **Cel:** Weryfikacja współpracy pomiędzy różnymi modułami systemu.
  - **Zakres:** Interakcja komponentów React z serwisami (mock API), interakcja serwisów z mockowaną/prawdziwą (testową) bazą Supabase, działanie API routes (endpointów) i middleware.
  - **Narzędzia:** Vitest, React Testing Library, Supertest (dla API), Mock Service Worker (MSW), testowa instancja Supabase.
- **Testy End-to-End (E2E Tests):**
  - **Cel:** Symulacja rzeczywistych scenariuszy użytkowania aplikacji przez użytkownika w przeglądarce.
  - **Zakres:** Kluczowe przepływy użytkownika: rejestracja, logowanie, generowanie fiszek AI (pełny cykl), dodawanie/edycja/usuwanie fiszek manualnie, nawigacja po aplikacji. Weryfikacja działania na różnych rozdzielczościach.
  - **Narzędzia:** Playwright.
- **Testy API:**
  - **Cel:** Weryfikacja kontraktów API (żądania, odpowiedzi, statusy HTTP, obsługa błędów) niezależnie od UI.
  - **Zakres:** Wszystkie endpointy w `src/pages/api/`. Testowanie walidacji, autoryzacji, logiki biznesowej.
  - **Narzędzia:** Postman, Newman, lub testy integracyjne z użyciem `fetch`/Supertest.
- **Testy Wydajnościowe (Performance Tests - Podstawowe):**
  - **Cel:** Ocena czasu odpowiedzi kluczowych endpointów API i czasu ładowania stron.
  - **Zakres:** Czas odpowiedzi API (CRUD fiszek, generowanie), czas ładowania strony głównej, dashboardu, listy fiszek. Czas trwania operacji generowania AI.
  - **Narzędzia:** Narzędzia deweloperskie przeglądarki (Network tab), Lighthouse, ewentualnie proste skrypty z k6.
- **Testy Bezpieczeństwa (Security Tests - Podstawowe):**
  - **Cel:** Identyfikacja podstawowych luk bezpieczeństwa.
  - **Zakres:** Weryfikacja działania middleware autoryzacyjnego, sprawdzanie RLS, testowanie walidacji danych wejściowych (zapobieganie XSS/Injection), sprawdzanie zależności (np. `npm audit`).
  - **Narzędzia:** Manualne przeglądy kodu, narzędzia deweloperskie przeglądarki, `npm audit`, OWASP ZAP (skan podstawowy).
- **Testy Użyteczności (Usability Tests):**
  - **Cel:** Ocena łatwości obsługi i intuicyjności interfejsu.
  - **Zakres:** Przepływy użytkownika, nawigacja, zrozumiałość komunikatów i etykiet.
  - **Narzędzia:** Testy manualne, ocena heurystyczna.
- **Testy Dostępności (Accessibility Tests):**
  - **Cel:** Zapewnienie zgodności z podstawowymi standardami dostępności (WCAG).
  - **Zakres:** Użycie semantycznego HTML, kontrast kolorów, nawigacja klawiaturą, atrybuty ARIA (wspierane przez Shadcn/ui).
  - **Narzędzia:** Axe DevTools, Lighthouse, manualna nawigacja klawiaturą, testy z czytnikiem ekranu (opcjonalnie).
- **Testy Wizualnej Regresji (Visual Regression Tests - Opcjonalnie):**
  - **Cel:** Wykrywanie niezamierzonych zmian w wyglądzie interfejsu.
  - **Zakres:** Kluczowe strony i komponenty.
  - **Narzędzia:** Playwright (z funkcją snapshotów), Percy.io.

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

(Przykładowe scenariusze wysokiego poziomu)

- **SCN-AUTH-001: Pomyślna rejestracja użytkownika:**
  1.  Przejdź do `/auth/sign-up`.
  2.  Wypełnij formularz poprawnymi danymi (unikalny email, zgodne hasła spełniające wymagania).
  3.  Kliknij "Sign Up".
  4.  Oczekiwany rezultat: Użytkownik zostaje przekierowany na stronę potwierdzenia rejestracji (`/auth/confirm-registration`), email potwierdzający zostaje wysłany (weryfikacja w Inbucket Supabase lokalnie).
- **SCN-AUTH-002: Pomyślne logowanie użytkownika:**
  1.  Przejdź do `/auth/sign-in`.
  2.  Wpisz email i hasło istniejącego, potwierdzonego użytkownika.
  3.  Kliknij "Sign In".
  4.  Oczekiwany rezultat: Użytkownik zostaje przekierowany do `/dashboard`.
- **SCN-AUTH-003: Odmowa dostępu do strony chronionej dla niezalogowanego użytkownika:**
  1.  Będąc niezalogowanym, spróbuj przejść bezpośrednio do `/dashboard` lub `/flashcards`.
  2.  Oczekiwany rezultat: Użytkownik zostaje przekierowany do `/auth/sign-in`.
- **SCN-FLASH-001: Pomyślne dodanie fiszki manualnie:**
  1.  Będąc zalogowanym, przejdź do `/flashcards` lub `/dashboard`.
  2.  Kliknij przycisk "Add Flashcard".
  3.  Wypełnij pola "Front" i "Back" w modalu `FlashcardAddModal`.
  4.  Kliknij "Save Flashcard".
  5.  Oczekiwany rezultat: Modal zostaje zamknięty, pojawia się powiadomienie o sukcesie, nowa fiszka jest widoczna na liście (może wymagać odświeżenia/przejścia na pierwszą stronę).
- **SCN-FLASH-002: Wyświetlanie, sortowanie i filtrowanie listy fiszek:**
  1.  Będąc zalogowanym, przejdź do `/flashcards`.
  2.  Sprawdź, czy wyświetla się domyślna liczba fiszek.
  3.  Zmień sortowanie na "Oldest first".
  4.  Sprawdź, czy kolejność fiszek się zmieniła.
  5.  Włącz filtr "Manual".
  6.  Sprawdź, czy wyświetlane są tylko fiszki manualne.
  7.  Przejdź na następną stronę (jeśli dostępna).
  8.  Sprawdź, czy załadowały się kolejne fiszki.
  9.  Oczekiwany rezultat: Lista fiszek poprawnie reaguje na akcje sortowania, filtrowania i paginacji.
- **SCN-FLASH-003: Pomyślna edycja fiszki:**
  1.  Będąc zalogowanym, przejdź do `/flashcards`.
  2.  Znajdź fiszkę i kliknij przycisk "Edit".
  3.  W modalu `FlashcardEditModal` zmień treść pola "Front" i/lub "Back".
  4.  Kliknij "Save Changes".
  5.  Oczekiwany rezultat: Modal zostaje zamknięty, pojawia się powiadomienie o sukcesie, zmiany są widoczne na liście fiszek. Jeśli była to fiszka `ai-full`, jej źródło zmienia się na `ai-edited`.
- **SCN-FLASH-004: Pomyślne usunięcie fiszki:**
  1.  Będąc zalogowanym, przejdź do `/flashcards`.
  2.  Znajdź fiszkę i kliknij przycisk "Delete".
  3.  W modalu potwierdzenia (`AlertDialog`) kliknij "Delete".
  4.  Oczekiwany rezultat: Modal zostaje zamknięty, pojawia się powiadomienie o sukcesie, fiszka znika z listy.
- **SCN-GEN-001: Pomyślne wygenerowanie propozycji fiszek AI:**
  1.  Będąc zalogowanym, przejdź do `/generate`.
  2.  Wklej tekst o długości między 1000 a 10000 znaków do `GenerationForm`.
  3.  Kliknij "Generate Flashcards".
  4.  Poczekaj na zakończenie procesu (obserwuj stan ładowania).
  5.  Oczekiwany rezultat: Wyświetla się sekcja "Generated Flashcards" z listą propozycji (`FlashcardProposalsItem`).
- **SCN-GEN-002: Walidacja długości tekstu w formularzu generowania:**
  1.  Przejdź do `/generate`.
  2.  Wpisz tekst krótszy niż 1000 znaków.
  3.  Oczekiwany rezultat: Przycisk "Generate Flashcards" jest nieaktywny, wyświetla się komunikat o minimalnej długości.
  4.  Wpisz tekst dłuższy niż 10000 znaków.
  5.  Oczekiwany rezultat: Wyświetla się komunikat o maksymalnej długości.
- **SCN-GEN-003: Akceptacja, edycja i zapis propozycji AI:**
  1.  Po wygenerowaniu propozycji (SCN-GEN-001).
  2.  Zaakceptuj kilka fiszek bez edycji.
  3.  Odrzuć jedną fiszkę.
  4.  Edytuj jedną fiszkę (zmień treść "Front" lub "Back").
  5.  Kliknij "Save Accepted".
  6.  Oczekiwany rezultat: Pojawia się powiadomienie o zapisaniu N fiszek. Zaakceptowane i edytowane fiszki znikają z listy propozycji. Przejdź do `/flashcards` i zweryfikuj, czy zapisane fiszki są widoczne z odpowiednim źródłem (`ai-full` lub `ai-edited`).
- **SCN-API-001: Test kontraktu API GET /api/flashcards:**
  1.  Wyślij żądanie GET do `/api/flashcards` z poprawnym tokenem autoryzacyjnym i parametrami (np. `?page=2&limit=10&sort=updated_at&order=asc&source=ai-edited`).
  2.  Oczekiwany rezultat: Odpowiedź 200 OK, struktura JSON zgodna z `FlashcardsListResponseDto`, dane należą do zalogowanego użytkownika, metadane paginacji są poprawne.
- **SCN-API-002: Test walidacji API POST /api/flashcards:**
  1.  Wyślij żądanie POST do `/api/flashcards` z nieprawidłowymi danymi (np. brak pola `front`, za długi `back`, `source=ai-full` bez `generation_id`).
  2.  Oczekiwany rezultat: Odpowiedź 400 Bad Request z opisem błędu walidacji.

## 5. Środowisko Testowe

- **Środowisko Lokalne:** Komputery deweloperów i testerów (`npm run dev`). Lokalna instancja Supabase (CLI). Używane do testów jednostkowych, integracyjnych i części E2E.
- **Środowisko CI (Continuous Integration):** GitHub Actions. Uruchamianie testów (lint, unit, integration) automatycznie po każdym pushu do repozytorium.
- **Środowisko Staging:** Dedykowana instancja aplikacji wdrożona na DigitalOcean (lub innym dostawcy) z osobną bazą danych Supabase (kopia produkcji lub dedykowana testowa). Używane do testów E2E, UAT, testów wydajnościowych i regresji przed wdrożeniem na produkcję.
- **Środowisko Produkcyjne:** Finalne środowisko aplikacji dostępne dla użytkowników. Testy ograniczone do smoke testów po wdrożeniu.

## 6. Narzędzia do Testowania

- **Frameworki Testowe:** Vitest (Unit/Integration), Playwright (E2E).
- **Biblioteki Pomocnicze:** React Testing Library (Testowanie komponentów React), Supertest (Testowanie API w Node.js), Mock Service Worker (MSW - Mockowanie API).
- **Testy API:** Postman / Newman.
- **Testy Wydajnościowe:** k6, Google Lighthouse.
- **Testy Bezpieczeństwa:** OWASP ZAP, `npm audit`.
- **Testy Dostępności:** Axe DevTools, Lighthouse.
- **Zarządzanie Testami / Bug Tracking:** GitHub Issues (lub dedykowane narzędzie np. Jira, TestRail - jeśli dostępne).
- **Inne:** Narzędzia deweloperskie przeglądarki, Supabase Studio, ESLint, Prettier.

## 7. Harmonogram Testów

- **Testy Jednostkowe i Integracyjne:** Pisane na bieżąco przez deweloperów wraz z rozwojem funkcjonalności. Uruchamiane automatycznie w CI.
- **Testy E2E i API:** Rozwijane równolegle z implementacją kluczowych przepływów. Uruchamiane regularnie (np. codziennie) na środowisku Staging w ramach CI/CD oraz manualnie przez QA.
- **Testy Manualne (Użyteczność, Eksploracyjne):** Przeprowadzane przez QA przed każdym planowanym wydaniem na środowisku Staging.
- **Testy Regresji:** Wykonywane przed każdym wydaniem na środowisku Staging (automatyczne E2E + wybrane scenariusze manualne).
- **Testy Wydajnościowe i Bezpieczeństwa:** Przeprowadzane okresowo (np. raz na sprint/miesiąc) lub przed większymi wydaniami na środowisku Staging.
- **User Acceptance Testing (UAT):** Przeprowadzane przez Product Ownera / interesariuszy na środowisku Staging przed zatwierdzeniem wydania.
- **Smoke Tests:** Wykonywane przez QA bezpośrednio po wdrożeniu na środowisko produkcyjne.

Ze względu na status MVP, początkowy nacisk zostanie położony na testy E2E kluczowych przepływów, testy API oraz testy integracyjne dla serwisów.

## 8. Kryteria Akceptacji Testów

### 8.1 Kryteria Wejścia (Rozpoczęcia Testów)

- Kod źródłowy funkcjonalności jest dostępny w repozytorium.
- Funkcjonalność została wdrożona na środowisku testowym (Staging lub lokalne).
- Podstawowa dokumentacja (jeśli wymagana) jest dostępna.
- Środowisko testowe jest stabilne.

### 8.2 Kryteria Wyjścia (Zakończenia Testów / Akceptacji Wydania)

- **Kryteria Ogólne:**
  - 100% zaplanowanych krytycznych scenariuszy testowych zakończonych powodzeniem.
  - Minimum 95% zaplanowanych wysokiego priorytetu scenariuszy testowych zakończonych powodzeniem.
  - Minimum 90% pokrycia kodu testami jednostkowymi dla kluczowych modułów (np. serwisy).
  - Brak otwartych błędów o priorytecie krytycznym (Blocker) lub wysokim (High).
  - Wszystkie zidentyfikowane problemy związane z bezpieczeństwem zostały rozwiązane lub zaakceptowano ryzyko.
  - Wyniki testów wydajnościowych mieszczą się w zdefiniowanych limitach (np. czas odpowiedzi API < 500ms dla 95 percentyla).
- **Kryteria Specyficzne dla MVP:**
  - Kluczowe przepływy (logowanie, generowanie AI, podstawowy CRUD fiszek) działają bez błędów krytycznych.
  - Aplikacja jest stabilna na obsługiwanych przeglądarkach (Chrome, Firefox - najnowsze wersje).

## 9. Role i Odpowiedzialności w Procesie Testowania

- **Deweloperzy:**
  - Pisanie testów jednostkowych i integracyjnych dla swojego kodu.
  - Naprawianie błędów zgłoszonych przez QA i PO.
  - Uczestnictwo w przeglądach kodu pod kątem jakości i testowalności.
  - Wsparcie QA w diagnozowaniu problemów.
- **Inżynier QA:**
  - Tworzenie i utrzymanie planu testów.
  - Projektowanie i implementacja testów automatycznych (Integration, E2E, API, Performance).
  - Wykonywanie testów manualnych (eksploracyjnych, użyteczności, dostępności).
  - Raportowanie i śledzenie błędów.
  - Analiza wyników testów i raportowanie stanu jakości.
  - Współpraca z deweloperami i PO w celu zapewnienia jakości.
  - Definiowanie i monitorowanie kryteriów akceptacji.
- **Product Owner (PO) / Interesariusze:**
  - Udział w definiowaniu wymagań i kryteriów akceptacji.
  - Przeprowadzanie User Acceptance Testing (UAT).
  - Ostateczna akceptacja wydania.

## 10. Procedury Raportowania Błędów

- **Narzędzie:** GitHub Issues (lub inne dedykowane narzędzie).
- **Proces Zgłaszania Błędu:**
  1.  Sprawdzenie, czy błąd nie został już zgłoszony.
  2.  Utworzenie nowego zgłoszenia (Issue).
  3.  Wypełnienie szablonu zgłoszenia, zawierającego:
      - **Tytuł:** Krótki, zwięzły opis problemu.
      - **Środowisko:** Wersja aplikacji, przeglądarka, system operacyjny, URL (jeśli dotyczy).
      - **Kroki do Reprodukcji:** Szczegółowa lista kroków pozwalająca odtworzyć błąd.
      - **Obserwowany Rezultat:** Co faktycznie się dzieje.
      - **Oczekiwany Rezultat:** Jakie zachowanie było oczekiwane.
      - **Priorytet:** (np. Krytyczny, Wysoki, Średni, Niski) - jak pilna jest naprawa.
      - **Waga/Severity:** (np. Blocker, Critical, Major, Minor, Trivial) - jak duży wpływ ma błąd na system.
      - **Załączniki:** Zrzuty ekranu, nagrania wideo, logi z konsoli (jeśli pomocne).
      - **Etykiety:** (np. `bug`, `ui`, `backend`, `auth`, `performance`).
- **Cykl Życia Błędu:**
  1.  `New`/`Open`: Zgłoszony błąd.
  2.  `In Progress`: Deweloper rozpoczął pracę nad naprawą.
  3.  `Ready for Testing`/`Resolved`: Błąd naprawiony, gotowy do weryfikacji przez QA.
  4.  `Verified`/`Closed`: QA potwierdził poprawkę, błąd zamknięty.
  5.  `Reopened`: Poprawka nie powiodła się lub spowodowała regresję, błąd ponownie otwarty.
  6.  `Won't Fix`/`Rejected`: Błąd nie zostanie naprawiony (np. duplikat, nie jest błędem, niski priorytet).
- **Komunikacja:** Dyskusje na temat błędów powinny odbywać się w komentarzach do zgłoszenia w systemie śledzenia błędów.
