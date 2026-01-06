# Authentication Flow - Flats Manager

## Analiza Wymagań Autentykacji

<authentication_analysis>

### 1. Przepływy autentykacji

Na podstawie analizy specyfikacji i kodu zidentyfikowano następujące przepływy:

1. **Rejestracja użytkownika** - nowy użytkownik tworzy konto
2. **Logowanie** - użytkownik uwierzytelnia się w systemie
3. **Wylogowanie** - użytkownik kończy sesję
4. **Dostęp do chronionej strony** - weryfikacja sesji przy nawigacji
5. **Wywołanie chronionego API** - weryfikacja tokenu w zapytaniu API
6. **Auto-login w trybie developerskim** - automatyczne logowanie dla środowiska deweloperskiego
7. **Odświeżanie tokenu** - proces odnawiania wygasłej sesji

### 2. Główni aktorzy i ich interakcje

- **Użytkownik** - osoba korzystająca z aplikacji
- **Przeglądarka** - środowisko wykonawcze klienta (React + Astro)
- **Middleware Astro** - warstwa pośrednicząca sprawdzająca sesję
- **Layout Component** - przekazuje stan autentykacji do klienta
- **Astro API Endpoint** - endpointy backendu (/api/auth/_, /api/flats/_, etc.)
- **Supabase Auth** - usługa autentykacji zarządzająca sesjami
- **Auth Store (Zustand)** - kliencki stan autentykacji
- **Baza Danych** - Supabase DB z politykami RLS

### 3. Procesy weryfikacji i odświeżania tokenów

- **Weryfikacja w Middleware**: `supabase.auth.getUser()` przy każdym żądaniu
- **Weryfikacja w API**: `supabase.auth.getUser()` w każdym endpoincie
- **Token Storage**: Supabase automatycznie zarządza tokenami w cookies
- **Auto-refresh**: Supabase SDK automatycznie odświeża tokeny przed wygaśnięciem
- **RLS Policies**: Zabezpieczenie na poziomie bazy danych

### 4. Opis kroków autentykacji

#### Rejestracja:

1. Użytkownik wypełnia formularz (email, hasło, potwierdzenie hasła)
2. React waliduje dane (Zod schema)
3. POST do /api/auth/register
4. Endpoint waliduje i wywołuje supabase.auth.signUp()
5. Supabase tworzy użytkownika i profil
6. Przekierowanie do strony logowania

#### Logowanie:

1. Użytkownik wprowadza dane logowania
2. POST do /api/auth/login
3. Endpoint wywołuje supabase.auth.signInWithPassword()
4. Supabase zwraca sesję i ustawia cookies
5. Layout pobiera user z getUser() i przekazuje do window.**AUTH_USER**
6. Auth Store inicjalizuje się danymi użytkownika
7. Przekierowanie do /dashboard

#### Dostęp do chronionej strony:

1. Middleware sprawdza sesję (getUser)
2. Jeśli brak sesji → redirect /auth/login
3. Jeśli sesja OK → Layout przekazuje user do klienta
4. Strona renderuje się z danymi użytkownika

#### Wywołanie API:

1. React wysyła request (np. GET /api/flats)
2. Endpoint sprawdza auth (getUser)
3. Jeśli brak auth → 401 Unauthorized
4. Jeśli OK → wykonuje query z RLS policies
5. Zwraca dane tylko tego użytkownika

</authentication_analysis>

## Diagram Sekwencyjny - Kompletny Przepływ Autentykacji

```mermaid
sequenceDiagram
    autonumber

    participant U as Użytkownik
    participant B as Przeglądarka
    participant M as Middleware
    participant L as Layout
    participant AS as Auth Store
    participant API as Astro API
    participant SA as Supabase Auth
    participant DB as Baza Danych

    Note over U,DB: INICJALIZACJA APLIKACJI

    U->>B: Otwiera aplikację
    activate B
    B->>M: Request do strony
    activate M
    M->>SA: getUser() - sprawdź sesję
    activate SA

    alt Tryb DEV i brak użytkownika
        M->>SA: signInWithPassword(dev credentials)
        SA-->>M: Auto-login sukces
        Note over M,SA: DEV_AUTO_LOGIN = true
    end

    SA-->>M: Sesja lub null
    deactivate SA
    M-->>L: Kontynuuj z context.locals.supabase
    deactivate M

    activate L
    L->>SA: getUser() - pobierz dane użytkownika
    activate SA
    SA-->>L: User data lub null
    deactivate SA

    L->>B: Renderuj HTML z window.__AUTH_USER__
    deactivate L

    B->>AS: Inicjalizuj store z __AUTH_USER__
    activate AS
    AS-->>B: Stan autentykacji gotowy
    B-->>U: Wyświetl stronę
    deactivate B
    deactivate AS

    Note over U,DB: PRZEPŁYW REJESTRACJI

    U->>B: Wypełnia formularz rejestracji
    activate B
    B->>B: Walidacja Zod (email, hasło min 8 znaków)

    alt Walidacja nieudana
        B-->>U: Pokaż błędy walidacji
    else Walidacja OK
        B->>API: POST /api/auth/register
        activate API
        API->>API: Waliduj dane (registerSchema)
        API->>SA: signUp(email, password)
        activate SA

        SA->>DB: Utwórz użytkownika w auth.users
        activate DB
        DB->>DB: Trigger tworzy rekord w profiles
        DB-->>SA: Użytkownik utworzony
        deactivate DB

        SA-->>API: Success response
        deactivate SA
        API-->>B: 200 OK
        deactivate API

        B->>B: Przekieruj do /auth/login
        B-->>U: Pokaż stronę logowania
    end
    deactivate B

    Note over U,DB: PRZEPŁYW LOGOWANIA

    U->>B: Wprowadza dane logowania
    activate B
    B->>B: Walidacja Zod (loginSchema)
    B->>API: POST /api/auth/login
    activate API

    API->>API: Waliduj dane
    API->>SA: signInWithPassword(email, password)
    activate SA

    SA->>DB: Weryfikuj credentials
    activate DB
    DB-->>SA: Dane użytkownika
    deactivate DB

    alt Nieprawidłowe dane
        SA-->>API: Error: Invalid credentials
        API-->>B: 401 Unauthorized
        B-->>U: Pokaż błąd logowania
    else Dane poprawne
        SA->>SA: Generuj access/refresh tokens
        SA-->>API: Session + User data
        Note over SA,API: Cookies ustawione automatycznie
        deactivate SA

        API-->>B: 200 OK + user data
        deactivate API

        B->>AS: setUser(userData)
        activate AS
        AS-->>B: Stan zaktualizowany
        deactivate AS

        B->>B: Przekieruj do /dashboard
        B-->>U: Wyświetl dashboard
    end
    deactivate B

    Note over U,DB: DOSTĘP DO CHRONIONEJ STRONY

    U->>B: Klika link do /flats
    activate B
    B->>M: Request GET /flats
    activate M

    M->>SA: getUser() - sprawdź sesję
    activate SA

    alt Brak sesji lub token wygasł
        SA-->>M: null
        M-->>B: Redirect 302 /auth/login
        B-->>U: Przekieruj do logowania
    else Sesja ważna
        SA->>SA: Auto-refresh token jeśli potrzeba
        SA-->>M: User data
        deactivate SA

        M->>L: Przekaż request
        deactivate M
        activate L

        L->>SA: getUser() dla Layout
        activate SA
        SA-->>L: User data
        deactivate SA

        L->>B: Renderuj z user w window.__AUTH_USER__
        deactivate L
        B-->>U: Wyświetl stronę /flats
    end
    deactivate B

    Note over U,DB: WYWOŁANIE CHRONIONEGO API

    U->>B: Akcja (np. "Dodaj mieszkanie")
    activate B
    B->>API: POST /api/flats + dane
    activate API

    API->>SA: getUser() - weryfikuj autoryzację
    activate SA

    alt Brak sesji
        SA-->>API: null
        API-->>B: 401 Unauthorized
        B->>AS: logout() - wyczyść stan
        activate AS
        AS-->>B: Stan wyczyszczony
        deactivate AS
        B->>B: Przekieruj do /auth/login
        B-->>U: Redirect do logowania
    else Sesja ważna
        SA-->>API: User data
        deactivate SA

        API->>DB: INSERT flats (user_id = auth.uid())
        activate DB

        Note over DB: RLS Policy sprawdza auth.uid()

        alt RLS Policy zezwala
            DB-->>API: Dane zapisane
            deactivate DB
            API-->>B: 201 Created + dane
            deactivate API

            B->>AS: Zaktualizuj stan (opcjonalnie)
            activate AS
            AS-->>B: OK
            deactivate AS

            B-->>U: Pokaż sukces
        else RLS Policy odmawia
            DB-->>API: Permission denied
            deactivate DB
            API-->>B: 403 Forbidden
            deactivate API
            B-->>U: Pokaż błąd
        end
    end
    deactivate B

    Note over U,DB: PRZEPŁYW WYLOGOWANIA

    U->>B: Klika "Wyloguj"
    activate B
    B->>AS: logout() - wywołaj akcję store
    activate AS

    AS->>API: POST /api/auth/logout
    activate API
    API->>SA: signOut()
    activate SA

    SA->>SA: Usuń tokeny z cookies
    SA-->>API: Success
    deactivate SA

    API-->>AS: 200 OK
    deactivate API

    AS->>AS: setUser(null)
    AS-->>B: Stan wyczyszczony
    deactivate AS

    B->>B: Przekieruj do /
    B-->>U: Wyświetl landing page
    deactivate B

    Note over U,DB: ODŚWIEŻANIE TOKENU (AUTOMATYCZNE)

    Note over B,SA: Token zbliża się do wygaśnięcia

    B->>SA: Automatyczne sprawdzenie przez SDK
    activate SA

    SA->>SA: Wykryj wygasający access token
    SA->>DB: Użyj refresh token
    activate DB
    DB-->>SA: Nowy access token
    deactivate DB

    SA->>SA: Zaktualizuj cookies
    SA-->>B: Token odświeżony transparentnie
    deactivate SA

    Note over B,SA: Użytkownik nie wie o odświeżeniu

```

## Kluczowe Punkty Architektury

### 1. Zarządzanie Stanem

- **Server-side**: Middleware + API endpoints używają `supabase.auth.getUser()`
- **Client-side**: Zustand store inicjalizowany z `window.__AUTH_USER__`
- **Bridge**: Layout component przekazuje dane z serwera do klienta

### 2. Bezpieczeństwo

- **Middleware**: Sprawdza sesję przed renderowaniem stron
- **API Endpoints**: Weryfikują użytkownika w każdym żądaniu
- **RLS Policies**: Zabezpieczenie na poziomie bazy danych
- **Auto-refresh**: Supabase SDK automatycznie odświeża tokeny

### 3. Przepływ Danych

```
Request → Middleware (getUser) → Layout (pass to client) →
→ Auth Store (client state) → React Components
```

### 4. Obsługa Błędów

- **401 Unauthorized**: Redirect do `/auth/login`
- **403 Forbidden**: Brak uprawnień (RLS)
- **Walidacja**: Zod schemas po stronie klienta i serwera

### 5. Tryb Deweloperski

- Auto-login z testowymi credentials
- Włączany przez `DEV_AUTO_LOGIN=true`
- Używa użytkownika: `admin@flatmanager.local`

## Zastosowane Polityki RLS

```sql
-- flats table
CREATE POLICY "Users can only see their own flats"
ON flats FOR SELECT
USING (auth.uid() = user_id);

-- payment_types table
CREATE POLICY "Users can only see payment types for their flats"
ON payment_types FOR SELECT
USING (
  flat_id IN (
    SELECT id FROM flats WHERE user_id = auth.uid()
  )
);

-- payments table
CREATE POLICY "Users can only see payments for their flats"
ON payments FOR SELECT
USING (
  flat_id IN (
    SELECT id FROM flats WHERE user_id = auth.uid()
  )
);
```

## Komponenty Do Zaimplementowania

### Nowe pliki (z auth-spec.md):

1. `/src/lib/stores/auth.store.ts` - Zustand store
2. `/src/components/auth/LoginForm.tsx` - Formularz logowania
3. `/src/components/auth/RegisterForm.tsx` - Formularz rejestracji
4. `/src/components/auth/UserMenu.tsx` - Menu użytkownika
5. `/src/pages/auth/login.astro` - Strona logowania
6. `/src/pages/auth/register.astro` - Strona rejestracji
7. `/src/pages/api/auth/register.ts` - Endpoint rejestracji
8. `/src/pages/api/auth/login.ts` - Endpoint logowania
9. `/src/pages/api/auth/logout.ts` - Endpoint wylogowania
10. `/src/lib/services/auth.service.ts` - Serwis autentykacji
11. `/src/lib/validation/auth.schemas.ts` - Schematy Zod

### Modyfikacje istniejących plików:

1. `/src/layouts/Layout.astro` - Przekazywanie user do klienta
2. `/src/components/Header.astro` - Dodanie UserMenu
3. `/src/pages/index.astro` - Landing page vs redirect
4. `/src/env.d.ts` - Typy dla window.**AUTH_USER**
5. `/src/types.ts` - Typy AuthUser, LoginDTO, RegisterDTO

## Testowanie

### Użytkownicy testowi:

- `admin@flatmanager.local` / `password123` (3 mieszkania)
- `test@flatmanager.local` / `password123` (0 mieszkań)

### Scenariusze testowe:

1. Rejestracja nowego użytkownika
2. Logowanie z poprawnymi danymi
3. Logowanie z błędnymi danymi
4. Dostęp do chronionej strony bez logowania
5. Wywołanie API bez autoryzacji
6. Wylogowanie
7. Auto-refresh tokenu
8. RLS - próba dostępu do cudzych danych
9. Auto-login w trybie DEV
