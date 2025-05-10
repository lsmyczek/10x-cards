/\*
Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Interfejs użytkownika aplikacji 10x-cards składa się z kilku kluczowych widoków i komponentów, które wspólnie zapewniają płynne zarządzanie fiszkami oraz integrację z API generującym propozycje fiszek. Główne elementy to widoki autoryzacji, dashboard, generowanie fiszek, lista fiszek oraz modal do edycji, uzupełnione o spójny top bar nawigacyjny i system powiadomień. Całość korzysta z responsywnego designu opartego na Tailwind, gotowych komponentów Shadcn/ui oraz React.

## 2. Lista widoków

- **Widok logowania**

  - Ścieżka: `/sign-in`
  - Główny cel: Umożliwienie logowania użytkownikom.
  - Kluczowe informacje: Formularz logowania (e-mail, hasło), link do rejestracji, opcja resetowania hasła.
  - Kluczowe komponenty: Formularz logowania, walidacja pól, komunikaty błędów, przyciski (logowanie, reset hasła).
  - UX/Dostępność: Czytelne etykiety, wsparcie dla klawiatury oraz przyjazne komunikaty błędów.
  - Bezpieczeństwo: Integracja z Supabase Auth oraz bezpieczne przesyłanie danych.

- **Widok rejestracji**

  - Ścieżka: `/sign-up`
  - Główny cel: Umożliwienie nowym użytkownikom zakładania konta.
  - Kluczowe informacje: Formularz rejestracyjny (e-mail, hasło, potwierdzenie hasła).
  - Kluczowe komponenty: Formularz rejestracji, walidacja pól, komunikaty błędów, link do logowania.
  - UX/Dostępność: Intuicyjny interfejs oraz czytelne komunikaty o powodzeniu rejestracji.
  - Bezpieczeństwo: Weryfikacja danych, szyfrowanie haseł i integracja z Supabase Auth.

- **Dashboard**

  - Ścieżka: `/dashboard` (dostępny po zalogowaniu)
  - Główny cel: Centralny punkt nawigacyjny, prezentujący powitanie użytkownika, statystyki oraz linki do głównych funkcjonalności.
  - Kluczowe informacje: Powitanie, liczba wygenerowanych fiszek, statystyki, linki do widoków: /generate, /flashcards oraz panelu użytkownika.
  - Kluczowe komponenty: Top bar nawigacyjny, karty statystyk, przyciski akcji.
  - UX/Dostępność: Intuicyjne rozmieszczenie informacji, responsywność i zgodność z zasadami dostępności.
  - Bezpieczeństwo: Ograniczony dostęp tylko dla uwierzytelnionych użytkowników.

- **Widok generowania fiszek**

  - Ścieżka: `/generate` (dostępny po zalogowaniu)
  - Główny cel: Umożliwienie użytkownikowi generowania propozycji fiszek przez AI poprzez wprowadzenie tekstu i ich rewizję (zaakceptuj, odrzuć, edytuj).
  - Kluczowe informacje: Formularz wprowadzania tekstu (1000-10000 znaków), licznik znaków, komunikaty walidacyjne, lista propozycji fiszek.
  - Kluczowe komponenty: Pole tekstowe, licznik znaków, przycisk "Wygeneruj fiszki", lista propozycji z przyciskami akceptacji, odrzucenia i edycji, przyciski akcji ("Zapisz wszystkie" i "Zapisz zaakceptowane"), wskaźnik ładowania (skeleton), komunikaty o błędach.
  - UX/Dostępność: Natychmiastowa walidacja, intuicyjne komunikaty błędów (inline) i responsywność.
  - Bezpieczeństwo: Weryfikacja danych przed wysłaniem do API i obsługa błędów.

- **Widok listy fiszek**

  - Ścieżka: `/flashcards` (dostępny po zalogowaniu)
  - Główny cel: Prezentacja zatwierdzonych fiszek użytkownika w trójkolumnowym gridzie z możliwością edycji i usuwania fiszek.
  - Kluczowe informacje: Wyświetlenie "front" i "back" fiszki, badge określający źródło (AI - wygenerowane AI, lub Manual - dodane ręcznie).
  - Kluczowe komponenty: Karta fiszki, grid layout, badge komponent.
  - UX/Dostępność: Przejrzysta prezentacja danych, responsywność, możliwość sortowania i filtrowania.
  - Bezpieczeństwo: Dostęp tylko dla zalogowanych użytkowników.

- **Modal edycji fiszek**

  - Ścieżka: Wywoływany z widoku `/generate` lub `/flashcards`
  - Główny cel: Umożliwienie edycji pól "front" i "back" wybranej fiszki.
  - Kluczowe informacje: Formularz edycji z walidowanymi polami ("front" max 200 znaków, "back" max 500 znaków) oraz przyciski zatwierdzające zmiany.
  - Kluczowe komponenty: Modal dialog, formularz edycji, przyciski "Zapisz zmiany" i "Zaakceptuj".
  - UX/Dostępność: Intuicyjny interfejs modalu, możliwość łatwego zamknięcia oraz czytelne komunikaty walidacyjne.
  - Bezpieczeństwo: Walidacja danych oraz obsługa błędów podczas zapisu.

- **Panel użytkownika (dostępny po zalogowaniu)**

  - Ścieżka: `/profile` (lub w ramach dashboardu)
  - Główny cel: Zarządzanie profilem użytkownika, ustawienia oraz opcje konta.
  - Kluczowe informacje: Informacje o profilu, opcje zmiany hasła, ustawienia konta.
  - Kluczowe komponenty: Formularze edycji profilu, przyciski zapisu, elementy nawigacyjne.
  - UX/Dostępność: Intuicyjna nawigacja, czytelne formularze i zgodność z zasadami dostępności.
  - Bezpieczeństwo: Autoryzacja, szyfrowanie danych i ochrona informacji użytkownika.

- **Widok sesji powtórek (dostępny po zalogowaniu)**
  - Ścieżka: `/session`
  - Główny cel: Umoliwienie przeprowadzenia sesji nauki z fiszkami zgodnie z algorytmem powtórek.
  - Kluczowe informacje: Pokazywanie przodu fiszki, przycisk do odłonięcia tyłu fiszki, mechanizm oceny.
  - Kluczowe komponenty: Komponent wyświetlania fiszki, przyciski interakcji (np. "Poka odpowiedź", "Ocena"), licznik sesji.
  - UX/Dostępność i Bezpieczeństwo: Minimalistyczny interfejs skupiony na nauce, resposnyswność, intuicyjny sustem przechodzenia między fiszkami.
    \*/

## 3. Mapa podróży użytkownika

1. Użytkownik odwiedza stronę główną i widzi top bar z opcjami logowania/rejestracji.
2. Nowy użytkownik wybiera widok rejestracji (`/sign-up`), wypełnia formularz, a po potwierdzeniu jest przekierowany do dashboardu.
3. Istniejący użytkownik wybiera widok logowania (`/sign-in`), loguje się, a następnie trafia do dashboardu.
4. Na dashboardzie użytkownik widzi powitalny komunikat, statystyki oraz linki do głównych widoków.
5. Użytkownik przechodzi do widoku generowania fiszek (`/generate`), gdzie wprowadza tekst i uruchamia generowanie fiszek.
6. Po otrzymaniu propozycji, użytkownik może:
   - Akceptować poszczególne fiszki (przycisk akceptacji),
   - Edytować fiszki (przycisk edycji otwierający modal),
   - Odrzucać niepotrzebne propozycje (przycisk odrzucenia).
7. Zatwierdzone fiszki są zapisywane i prezentowane w widoku listy fiszek (`/flashcards`).
8. Użytkownik może, w razie potrzeby, przejść do panelu użytkownika (`/profile`) celem zarządzania profilem i ustawieniami konta.
9. Użytkownik może opcjonalnie rozpocząć sesję nauki przechodząc do ekranu `/session`

## 4. Układ i struktura nawigacji

- **Top bar nawigacyjny**: Obecny na wszystkich widokach, zawiera:
  - Logo i nazwę aplikacji (link do dashboardu),
  - Linki do widoków: `/generate`, `/flashcards`,`session`, `/profile` (lub ustawienia konta w ramach dashboardu),
  - Opcję logowania/wylogowania.
- Nawigacja jest responsywna (użycie klas Tailwind CSS) i wspiera interakcje dotykowe oraz skróty klawiaturowe.
- Toast notifications służą do wyświetlania komunikatów o sukcesie. Wyświetlamy komunikaty inline w przypadku ostrzeżeń oraz błędów (walidacja, api).

## 5. Kluczowe komponenty

- **Formularz uwierzytelniania**: Komponent logowania dla widoku `/sign-in` i rejestracji dla widoku `/sign-up`, odpowiedzialny za walidację i przesyłanie danych użytkownika.
- **Top bar nawigacyjny**: Komponent zawierający logo, linki nawigacyjne ("Generowanie fiszek", "Moje fiszki", "Sesje nauki", "Profil" ) oraz opcje logowania/wylogowania.
- **Formularz generowania fiszek**: Składa się z pola tekstowego (z licznikiem znaków, walidacją) oraz przycisku wywołania API.
- **Lista Fiszek**: Interaktywny komponent wyświetlający listę fiszek z opcjami edycji i usuwania.
- **Flashcard**: Powtarzalny komponent w gridzie, prezentujący informacje o fiszce (front, back, badge ze źródłem, buttony: akceptacji, odrzucenia, edycji ).
- **Modal edycji**: Overlay umożliwiający edycję treści fiszki z walidowanymi polami i przyciskami zatwierdzającymi zmiany.
- **Toast Notification**: Globalny komponent informujący o sukcesach, błędach i ostrzeżeniach.
- **Dashboard stat card**: Komponent wyświetlający kluczowe statystyki, np. liczbę wygenerowanych fiszek.
- **Komponent sesji powtórek**: Interaktywny układ wyświetlania fiszek podczas sesji nauki z mechanizmem oceny.
