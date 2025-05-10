<authentication_analysis>

- Przepływy autentykacji z dokumentów:
  • Rejestracja: Użytkownik wysyła dane rejestracyjne; API komunikuje się z Supabase Auth,
  który tworzy konto i zwraca token.
  • Logowanie: Użytkownik podaje email i hasło; API weryfikuje dane przez Supabase Auth
  i wydaje token sesji.
  • Reset hasła: Użytkownik wysyła email; API inicjuje wysłanie linku do resetu hasła.
  • Wylogowanie: Użytkownik wysyła żądanie wylogowania; API inwaliduje token.
- Główni aktorzy:
  • Browser – klient użytkownika.
  • Middleware – warstwa weryfikująca tokeny przy żądaniach.
  • Astro API – backend obsługujący endpointy autentykacji.
  • Supabase Auth – dostawca autentykacji i zarządzania sesjami.
- Procesy:
  • Weryfikacja tokenu: Każde żądanie do chronionego zasobu weryfikowane jest przez API.
  • Odświeżanie tokenu: W przypadku wygaśnięcia tokenu, API odświeża go przez Supabase Auth.
  </authentication_analysis>

<mermaid_diagram>

```mermaid
sequenceDiagram
  autonumber
  participant Browser
  participant Middleware
  participant "Astro API"
  participant "Supabase Auth"

  %% Rejestracja
  Browser->> "Astro API": Żądanie rejestracji z danymi
  activate "Astro API"
  "Astro API"->> "Supabase Auth": Utwórz konto i zweryfikuj dane
  activate "Supabase Auth"
  "Supabase Auth"-->> "Astro API": Token sesji lub błąd
  deactivate "Supabase Auth"
  "Astro API"-->> Browser: Odpowiedź rejestracji (sukces/błąd)
  deactivate "Astro API"

  %% Logowanie
  Browser->> "Astro API": Żądanie logowania (email, hasło)
  activate "Astro API"
  "Astro API"->> "Supabase Auth": Sprawdź dane logowania
  activate "Supabase Auth"
  "Supabase Auth"-->> "Astro API": Token sesji lub błąd
  deactivate "Supabase Auth"
  "Astro API"-->> Browser: Potwierdzenie logowania
  deactivate "Astro API"

  %% Weryfikacja tokenu dla zasobów
  Browser->> Middleware: Żądanie zasobu chronionego
  activate Middleware
  Middleware->> "Astro API": Weryfikacja tokenu sesji
  activate "Astro API"
  "Astro API"->> "Supabase Auth": Sprawdź ważność tokenu
  activate "Supabase Auth"
  "Supabase Auth"-->> "Astro API": Status tokenu
  deactivate "Supabase Auth"
  "Astro API"-->> Middleware: Wynik weryfikacji
  deactivate "Astro API"
  Middleware-->> Browser: Dostęp do zasobu lub błąd
  deactivate Middleware

  %% Odświeżanie tokenu
  alt Token ważny
    Browser-->> "Astro API": Żądanie operacji
  else Token wygasł
    Browser->> "Astro API": Żądanie odświeżenia tokenu
    activate "Astro API"
    "Astro API"->> "Supabase Auth": Odśwież token
    activate "Supabase Auth"
    "Supabase Auth"-->> "Astro API": Nowy token
    deactivate "Supabase Auth"
    "Astro API"-->> Browser: Ustaw nowy token
    deactivate "Astro API"
  end

  %% Reset hasła
  Browser->> "Astro API": Żądanie resetu hasła (email)
  activate "Astro API"
  "Astro API"->> "Supabase Auth": Wyślij email resetujący
  activate "Supabase Auth"
  "Supabase Auth"-->> "Astro API": Potwierdzenie wysyłki
  deactivate "Supabase Auth"
  "Astro API"-->> Browser: Powiadomienie o wysłaniu linku
  deactivate "Astro API"

  %% Wylogowanie
  Browser->> "Astro API": Żądanie wylogowania
  activate "Astro API"
  "Astro API"->> "Supabase Auth": Inwalidacja tokenu
  activate "Supabase Auth"
  "Supabase Auth"-->> "Astro API": Potwierdzenie wylogowania
  deactivate "Supabase Auth"
  "Astro API"-->> Browser: Przekierowanie do logowania
  deactivate "Astro API"
```

</mermaid_diagram>
