# Plan testów

## 1. Wprowadzenie i cele testowania
Celem testowania jest zapewnienie najwyższej jakości produktu poprzez weryfikację poprawności działania kluczowych funkcjonalności aplikacji. Testy mają na celu:
- Wykrycie błędów na wczesnym etapie cyklu rozwoju.
- Zapewnienie, że wszystkie komponenty front-end i back-end współdziałają poprawnie.
- Utrzymanie wysokiej wydajności oraz responsywności aplikacji.
- Weryfikację zgodności z wymaganiami funkcjonalnymi i niefunkcjonalnymi.

## 2. Zakres testów
Testy obejmą:
- **Testy jednostkowe** – weryfikacja poszczególnych funkcji, komponentów React oraz helperów.
- **Testy integracyjne** – sprawdzenie poprawnej współpracy między komponentami, API endpoints (w tym integracja z Supabase) oraz middleware.
- **Testy end-to-end** – symulacja pełnych scenariuszy użycia aplikacji, od strony UI po backend.
- **Testy wydajnościowe** – ocena szybkości ładowania stron, efektywności renderowania oraz responsywności aplikacji.
- **Testy bezpieczeństwa** – walidacja mechanizmów autentykacji i autoryzacji oraz zabezpieczenie endpointów API.
- **Testy wizualne i responsywności** – potwierdzenie zgodności interfejsu użytkownika z projektem (Tailwind, Shadcn/ui) oraz poprawności wyświetlania na różnych urządzeniach.

## 3. Typy testów
- **Testy jednostkowe:**  
  - Weryfikacja logiki komponentów React i funkcji pomocniczych.
  - Testowanie modułów napisanych w TypeScript.
- **Testy integracyjne:**  
  - Sprawdzenie poprawności komunikacji między warstwami front-end i back-end.
  - Testowanie middleware oraz współdziałania API endpoints.
- **Testy end-to-end (E2E):**  
  - Symulacja scenariuszy użytkownika na pełnej aplikacji.
  - Weryfikacja procesów logowania, rejestracji, interakcji z interfejsem i komunikacji z Supabase.
- **Testy wydajnościowe:**  
  - Pomiar czasu odpowiedzi, czasów ładowania i renderowania.
  - Ocena skalowalności aplikacji.
- **Testy bezpieczeństwa:**  
  - Testy autoryzacji dostępu do zasobów.
  - Ocena podatności na ataki takie jak SQL Injection, XSS itd.
- **Testy wizualne i responsywności:**  
  - Weryfikacja zgodności UI z zaprojektowanym stylem.
  - Testowanie aplikacji na różnych urządzeniach i przeglądarkach.

## 4. Scenariusze testowe dla kluczowych funkcjonalności
- **Logowanie/Rejestracja:**  
  - Testy poprawności walidacji formularzy.
  - Testy przepływu logowania z integracją z backendem (Supabase).
- **Nawigacja i routing:**  
  - Sprawdzenie poprawnej zmiany stron i renderowania layoutów (Astro, React).
- **Interaktywne komponenty UI:**  
  - Weryfikacja działania komponentów interaktywnych korzystających z Shadcn/ui.
  - Testy dynamicznej zmiany stanu komponentów.
- **Współdziałanie z API:**  
  - Testy pobierania i wysyłania danych do API.
  - Weryfikacja poprawności obsługi błędów i wyjątków.
- **Wydajność aplikacji:**  
  - Testy czasu ładowania stron i renderowania komponentów.
  - Analiza obciążeniowa i testy stresu.

## 5. Środowisko testowe
- **Lokalne środowisko developerskie:**  
  - Uruchomienie aplikacji na lokalnych maszynach programistycznych.
  - Wykorzystanie emulacji różnych urządzeń (desktop, mobile).
- **Środowisko CI/CD:**  
  - Automatyczne uruchamianie testów przy każdym commicie i w ramach pull requestów.
- **Przeglądarki testowe:**  
  - Testowanie na Chrome, Firefox oraz edge.
- **Baza danych testowa:**  
  - Wykorzystanie testowej instancji Supabase do izolacji danych.

## 6. Narzędzia do testowania
- **Vitest:** do testów jednostkowych i integracyjnych.
- **React Testing Library:** do testowania komponentów React.
- **Playwright:** do testów end-to-end.
- **Lighthouse:** do testów wydajnościowych i optymalizacyjnych.
- **ESLint/Prettier:** do utrzymania jakości kodu.
- **System do zarządzania błędami (np. Jira):** do raportowania i śledzenia błędów.

## 7. Harmonogram testów
- **Faza rozwojowa:**  
  - Testy jednostkowe i integracyjne: uruchamiane przy każdym commicie w ramach CI/CD.
  - Testy wizualne i responsywności: wykonywane przy większych zmianach w UI.
- **Faza przedwdrożeniowa:**  
  - Testy end-to-end: pełna walidacja funkcjonalności przed wydaniem nowej wersji.
  - Testy wydajnościowe: przeprowadzenie testów obciążeniowych.
- **Faza utrzymaniowa:**  
  - Regularne testy regresyjne przy implementacji nowych funkcji lub poprawek.
  - Monitorowanie kluczowych metryk w środowisku produkcyjnym.

## 8. Kryteria akceptacji testów
- Wszystkie testy jednostkowe i integracyjne muszą przechodzić bez błędów.
- W testach end-to-end nie mogą występować krytyczne błędy uniemożliwiające podstawową funkcjonalność aplikacji.
- Wszelkie wykryte błędy krytyczne muszą zostać rozwiązane przed wdrożeniem na środowisko produkcyjne.
- Czas reakcji aplikacji i stabilność renderowania muszą mieścić się w zaakceptowanych normach wydajnościowych.
- Zgłoszenia błędów muszą być zatwierdzone i zweryfikowane przez odpowiedzialną osobę (QA lead/Project Manager).

## 9. Role i odpowiedzialności
- **Inżynierowie QA:**  
  - Tworzenie scenariuszy testowych.
  - Przeprowadzanie testów jednostkowych, integracyjnych, E2E i wydajnościowych.
  - Dokumentowanie i raportowanie wykrytych błędów.
- **Deweloperzy:**  
  - Naprawa błędów zgłoszonych przez QA.
  - Wsparcie przy tworzeniu i utrzymaniu testów automatycznych.
- **Project Manager:**  
  - Koordynacja harmonogramu testów.
  - Monitorowanie postępu prac.
- **Product Owner:**  
  - Weryfikacja i zatwierdzanie wyników testów przed wydaniem wersji produkcyjnej.

## 10. Procedury raportowania błędów
- **Dokumentacja błędów:**  
  - Każdy błąd powinien być opisany w systemie zarządzania błędami (np. Jira) z informacjami: opis, kroki do reprodukcji, oczekiwany rezultat, środowisko, priorytet.
- **Priorytetyzacja i kategoryzacja:**  
  - Błędy krytyczne, wysokie, średnie oraz niskie.
  - Priorytet krytyczny – błędy blokujące działanie aplikacji.
- **Komunikacja:**  
  - Regularne spotkania zespołu QA i deweloperskiego w celu omówienia postępów i ustalenia terminów naprawy błędów.
- **Weryfikacja poprawek:**  
  - Po naprawie błędu, wykonanie regresyjnych testów w celu potwierdzenia poprawności rozwiązania.