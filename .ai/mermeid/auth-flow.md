# Authentication Flow - Flats Manager

## Authentication Requirements Analysis

<authentication_analysis>

### 1. Authentication Flows

Based on the analysis of specifications and code, the following flows have been identified:

1. **User Registration** - new user creates an account
2. **Login** - user authenticates in the system
3. **Logout** - user ends the session
4. **Protected Page Access** - session verification during navigation
5. **Protected API Call** - token verification in API request
6. **Auto-login in Developer Mode** - automatic login for development environment
7. **Token Refresh** - process of renewing expired session

### 2. Main Actors and Their Interactions

- **User** - person using the application
- **Browser** - client runtime environment (React + Astro)
- **Astro Middleware** - intermediary layer checking session
- **Layout Component** - passes authentication state to client
- **Astro API Endpoint** - backend endpoints (/api/auth/_, /api/flats/_, etc.)
- **Supabase Auth** - authentication service managing sessions
- **Auth Store (Zustand)** - client-side authentication state
- **Database** - Supabase DB with RLS policies

### 3. Token Verification and Refresh Processes

- **Verification in Middleware**: `supabase.auth.getUser()` on every request
- **Verification in API**: `supabase.auth.getUser()` in every endpoint
- **Token Storage**: Supabase automatically manages tokens in cookies
- **Auto-refresh**: Supabase SDK automatically refreshes tokens before expiration
- **RLS Policies**: Security at database level

### 4. Authentication Steps Description

#### Registration:

1. User fills out form (email, password, password confirmation)
2. React validates data (Zod schema)
3. POST to /api/auth/register
4. Endpoint validates and calls supabase.auth.signUp()
5. Supabase creates user and profile
6. Redirect to login page

#### Login:

1. User enters login credentials
2. POST to /api/auth/login
3. Endpoint calls supabase.auth.signInWithPassword()
4. Supabase returns session and sets cookies
5. Layout retrieves user from getUser() and passes to window.**AUTH_USER**
6. Auth Store initializes with user data
7. Redirect to /dashboard

#### Protected Page Access:

1. Middleware checks session (getUser)
2. If no session → redirect /auth/login
3. If session OK → Layout passes user to client
4. Page renders with user data

#### API Call:

1. React sends request (e.g., GET /api/flats)
2. Endpoint checks auth (getUser)
3. If no auth → 401 Unauthorized
4. If OK → executes query with RLS policies
5. Returns data only for this user

</authentication_analysis>

## Sequence Diagram - Complete Authentication Flow

```mermaid
sequenceDiagram
    autonumber

    participant U as User
    participant B as Browser
    participant M as Middleware
    participant L as Layout
    participant AS as Auth Store
    participant API as Astro API
    participant SA as Supabase Auth
    participant DB as Database

    Note over U,DB: APPLICATION INITIALIZATION

    U->>B: Opens application
    activate B
    B->>M: Request to page
    activate M
    M->>SA: getUser() - check session
    activate SA

    alt DEV mode and no user
        M->>SA: signInWithPassword(dev credentials)
        SA-->>M: Auto-login success
        Note over M,SA: DEV_AUTO_LOGIN = true
    end

    SA-->>M: Session or null
    deactivate SA
    M-->>L: Continue with context.locals.supabase
    deactivate M

    activate L
    L->>SA: getUser() - fetch user data
    activate SA
    SA-->>L: User data or null
    deactivate SA

    L->>B: Render HTML with window.__AUTH_USER__
    deactivate L

    B->>AS: Initialize store with __AUTH_USER__
    activate AS
    AS-->>B: Authentication state ready
    B-->>U: Display page
    deactivate B
    deactivate AS

    Note over U,DB: REGISTRATION FLOW

    U->>B: Fills registration form
    activate B
    B->>B: Zod validation (email, password min 8 chars)

    alt Validation failed
        B-->>U: Show validation errors
    else Validation OK
        B->>API: POST /api/auth/register
        activate API
        API->>API: Validate data (registerSchema)
        API->>SA: signUp(email, password)
        activate SA

        SA->>DB: Create user in auth.users
        activate DB
        DB->>DB: Trigger creates record in profiles
        DB-->>SA: User created
        deactivate DB

        SA-->>API: Success response
        deactivate SA
        API-->>B: 200 OK
        deactivate API

        B->>B: Redirect to /auth/login
        B-->>U: Show login page
    end
    deactivate B

    Note over U,DB: LOGIN FLOW

    U->>B: Enters login credentials
    activate B
    B->>B: Zod validation (loginSchema)
    B->>API: POST /api/auth/login
    activate API

    API->>API: Validate data
    API->>SA: signInWithPassword(email, password)
    activate SA

    SA->>DB: Verify credentials
    activate DB
    DB-->>SA: User data
    deactivate DB

    alt Invalid credentials
        SA-->>API: Error: Invalid credentials
        API-->>B: 401 Unauthorized
        B-->>U: Show login error
    else Valid credentials
        SA->>SA: Generate access/refresh tokens
        SA-->>API: Session + User data
        Note over SA,API: Cookies set automatically
        deactivate SA

        API-->>B: 200 OK + user data
        deactivate API

        B->>AS: setUser(userData)
        activate AS
        AS-->>B: State updated
        deactivate AS

        B->>B: Redirect to /dashboard
        B-->>U: Display dashboard
    end
    deactivate B

    Note over U,DB: PROTECTED PAGE ACCESS

    U->>B: Clicks link to /flats
    activate B
    B->>M: Request GET /flats
    activate M

    M->>SA: getUser() - check session
    activate SA

    alt No session or token expired
        SA-->>M: null
        M-->>B: Redirect 302 /auth/login
        B-->>U: Redirect to login
    else Valid session
        SA->>SA: Auto-refresh token if needed
        SA-->>M: User data
        deactivate SA

        M->>L: Pass request
        deactivate M
        activate L

        L->>SA: getUser() for Layout
        activate SA
        SA-->>L: User data
        deactivate SA

        L->>B: Render with user in window.__AUTH_USER__
        deactivate L
        B-->>U: Display /flats page
    end
    deactivate B

    Note over U,DB: PROTECTED API CALL

    U->>B: Action (e.g., "Add flat")
    activate B
    B->>API: POST /api/flats + data
    activate API

    API->>SA: getUser() - verify authorization
    activate SA

    alt No session
        SA-->>API: null
        API-->>B: 401 Unauthorized
        B->>AS: logout() - clear state
        activate AS
        AS-->>B: State cleared
        deactivate AS
        B->>B: Redirect to /auth/login
        B-->>U: Redirect to login
    else Valid session
        SA-->>API: User data
        deactivate SA

        API->>DB: INSERT flats (user_id = auth.uid())
        activate DB

        Note over DB: RLS Policy checks auth.uid()

        alt RLS Policy allows
            DB-->>API: Data saved
            deactivate DB
            API-->>B: 201 Created + data
            deactivate API

            B->>AS: Update state (optional)
            activate AS
            AS-->>B: OK
            deactivate AS

            B-->>U: Show success
        else RLS Policy denies
            DB-->>API: Permission denied
            deactivate DB
            API-->>B: 403 Forbidden
            deactivate API
            B-->>U: Show error
        end
    end
    deactivate B

    Note over U,DB: LOGOUT FLOW

    U->>B: Clicks "Logout"
    activate B
    B->>AS: logout() - call store action
    activate AS

    AS->>API: POST /api/auth/logout
    activate API
    API->>SA: signOut()
    activate SA

    SA->>SA: Remove tokens from cookies
    SA-->>API: Success
    deactivate SA

    API-->>AS: 200 OK
    deactivate API

    AS->>AS: setUser(null)
    AS-->>B: State cleared
    deactivate AS

    B->>B: Redirect to /
    B-->>U: Display landing page
    deactivate B

    Note over U,DB: TOKEN REFRESH (AUTOMATIC)

    Note over B,SA: Token approaching expiration

    B->>SA: Automatic check by SDK
    activate SA

    SA->>SA: Detect expiring access token
    SA->>DB: Use refresh token
    activate DB
    DB-->>SA: New access token
    deactivate DB

    SA->>SA: Update cookies
    SA-->>B: Token refreshed transparently
    deactivate SA

    Note over B,SA: User is unaware of refresh

```

## Key Architecture Points

### 1. State Management

- **Server-side**: Middleware + API endpoints use `supabase.auth.getUser()`
- **Client-side**: Zustand store initialized with `window.__AUTH_USER__`
- **Bridge**: Layout component passes data from server to client

### 2. Security

- **Middleware**: Checks session before rendering pages
- **API Endpoints**: Verify user in every request
- **RLS Policies**: Security at database level
- **Auto-refresh**: Supabase SDK automatically refreshes tokens

### 3. Data Flow

```
Request → Middleware (getUser) → Layout (pass to client) →
→ Auth Store (client state) → React Components
```

### 4. Error Handling

- **401 Unauthorized**: Redirect to `/auth/login`
- **403 Forbidden**: No permissions (RLS)
- **Validation**: Zod schemas on client and server side

### 5. Developer Mode

- Auto-login with test credentials
- Enabled by `DEV_AUTO_LOGIN=true`
- Uses user: `admin@flatmanager.local`

## Applied RLS Policies

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

## Components To Implement

### New files (from auth-spec.md):

1. `/src/lib/stores/auth.store.ts` - Zustand store
2. `/src/components/auth/LoginForm.tsx` - Login form
3. `/src/components/auth/RegisterForm.tsx` - Registration form
4. `/src/components/auth/UserMenu.tsx` - User menu
5. `/src/pages/auth/login.astro` - Login page
6. `/src/pages/auth/register.astro` - Registration page
7. `/src/pages/api/auth/register.ts` - Registration endpoint
8. `/src/pages/api/auth/login.ts` - Login endpoint
9. `/src/pages/api/auth/logout.ts` - Logout endpoint
10. `/src/lib/services/auth.service.ts` - Authentication service
11. `/src/lib/validation/auth.schemas.ts` - Zod schemas

### Modifications to existing files:

1. `/src/layouts/Layout.astro` - Passing user to client
2. `/src/components/Header.astro` - Adding UserMenu
3. `/src/pages/index.astro` - Landing page vs redirect
4. `/src/env.d.ts` - Types for window.**AUTH_USER**
5. `/src/types.ts` - Types AuthUser, LoginDTO, RegisterDTO

## Testing

### Test users:

- `admin@flatmanager.local` / `password123` (3 flats)
- `test@flatmanager.local` / `password123` (0 flats)

### Test scenarios:

1. New user registration
2. Login with correct credentials
3. Login with incorrect credentials
4. Access to protected page without login
5. API call without authorization
6. Logout
7. Token auto-refresh
8. RLS - attempt to access other user's data
9. Auto-login in DEV mode
