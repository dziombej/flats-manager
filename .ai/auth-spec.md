# Authentication System - MVP Specification

## Overview

Simple authentication using Supabase Auth with **user registration support**. User state passes from server (Astro) to client (React) via Layout component.

**Tech**: Astro 5, React 19, TypeScript, Supabase Auth, Zustand

**MVP Scope:**
- ✅ User Registration (email + password, min 8 chars)
- ✅ Login/Logout with session management
- ✅ Row Level Security (RLS) for data isolation
- ✅ Seeded test users for immediate testing
- ❌ Email verification
- ❌ Multi-factor authentication

## Architecture

```
Server (Astro) → Layout → window.__AUTH_USER__ → Client Auth Store
```

---

## Pages to Create

### `/src/pages/auth/login.astro`
- Contains `LoginForm` component
- Redirect if authenticated

### `/src/pages/auth/register.astro`
- Contains `RegisterForm` component  
- Redirect if authenticated

### `/src/pages/index.astro` (MODIFY)
- Show landing page if unauthenticated
  - App description
  - Login button → `/auth/login`
  - Register link → `/auth/register`
- Redirect to `/dashboard` if authenticated

---

## Components to Create

### `/src/lib/stores/auth.store.ts`
Zustand store for client-side auth state.

```typescript
interface AuthState {
  user: { id: string; email: string } | null;
  isAuthenticated: boolean;
  setUser: (user: { id: string; email: string } | null) => void;
  logout: () => Promise<void>;
}
```

Initialize from `window.__AUTH_USER__`

**Logout Behavior:**
- Call `/api/auth/logout`
- Clear user from store (setUser(null))
- Redirect to `/auth/login` (PRD REQ-AUTH-002, US-002)
- Clear all client state

### `/src/components/auth/LoginForm.tsx`
- Email + Password fields (password hidden with type="password")
- POST to `/api/auth/login`
- On success: 
  - Update auth store with user data
  - Redirect to `/dashboard` (PRD REQ-AUTH-001, US-001)
- On error: Display "Invalid email or password"

### `/src/components/auth/RegisterForm.tsx`
- Email + Password + Confirm Password
- Validation (PRD REQ-AUTH-006):
  - Email must be valid format and unique
  - Password minimum 8 characters
  - Passwords must match
- POST to `/api/auth/register`
- On success: Show success message, redirect to `/auth/login`
- On error: Display user-friendly message (e.g., "Email already exists")

### `/src/components/auth/UserMenu.tsx`
- Show user email
- Logout button (must be visible in all application views - PRD US-002)
- On logout click: Call auth store logout function
- Add to Header component

---

## API Endpoints to Create

### `/src/pages/api/auth/register.ts`
```typescript
POST /api/auth/register
Body: { email, password }
Response: { success: true, message: "Account created" }
Error: { error: string } (400 for validation, 409 for duplicate email)
```

Use `supabase.auth.signUp()`

**Validation:**
- Email must be valid format
- Password minimum 8 characters
- Return user-friendly error for duplicate email
- New users start with 0 apartments

### `/src/pages/api/auth/login.ts`
```typescript
POST /api/auth/login
Body: { email, password }
Response: { success: true, user: { id, email } }
Error: { error: string } (401 for invalid credentials)
```

Use `supabase.auth.signInWithPassword()`

**Error Handling:**
- Return 401 for incorrect email/password
- User-friendly message: "Invalid email or password"
- Hide password field (type="password") in forms

### `/src/pages/api/auth/logout.ts`
```typescript
POST /api/auth/logout
Response: { success: true }
```

Use `supabase.auth.signOut()`

**Behavior:**
- Clear session from Supabase
- Client should redirect to `/auth/login` after logout
- Clear auth store on client

---

## Service Layer

### `/src/lib/services/auth.service.ts`
```typescript
export const authService = {
  register: (supabase, email, password) => supabase.auth.signUp({ email, password }),
  login: (supabase, email, password) => supabase.auth.signInWithPassword({ email, password }),
  logout: (supabase) => supabase.auth.signOut()
}
```

**Note:** Supabase Auth automatically handles password hashing (PRD REQ-AUTH-001, REQ-AUTH-006). Passwords are never stored in plain text.

### `/src/lib/validation/auth.schemas.ts`
Zod schemas:
```typescript
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword);
```

---

## Files to Modify

### `/src/layouts/Layout.astro`
1. Get user: `const { data: { user } } = await supabase.auth.getUser()`
2. Pass to window: `window.__AUTH_USER__ = user`
3. Pass to Header: `<Header user={user} />`

### `/src/components/Header.astro`
Add UserMenu when authenticated

### `/src/env.d.ts`
```typescript
interface Window {
  __AUTH_USER__?: { id: string; email: string } | null;
}
```

### `/src/types.ts`
```typescript
export interface AuthUser {
  id: string;
  email: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO extends LoginDTO {
  confirmPassword: string;
}
```

---

## Protect Existing Routes

**All protected pages must redirect unauthenticated users to `/auth/login` (PRD US-002)**

Add to all protected pages:
```typescript
export const prerender = false;

const { data: { user } } = await context.locals.supabase.auth.getUser();
if (!user) return context.redirect('/auth/login');
```

**All protected API endpoints must return 401 Unauthorized**

Add to all API endpoints:
```typescript
const { data: { user } } = await context.locals.supabase.auth.getUser();
if (!user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

**Pages to protect:**
- `/src/pages/dashboard.astro`
- `/src/pages/flats/**/*.astro`
- `/src/pages/payment-types/**/*.astro`

**API to protect:**
- `/src/pages/api/dashboard.ts`
- `/src/pages/api/flats/**/*.ts`
- `/src/pages/api/payment-types/**/*.ts`
- `/src/pages/api/payments/**/*.ts`

---

## Implementation Order

1. Install Zustand: `npm install zustand`
2. Create auth store
3. Create auth service & schemas
4. Create API endpoints (register, login, logout)
5. Create forms (LoginForm, RegisterForm)
6. Create auth pages (login, register)
7. Create UserMenu
8. Update Layout.astro
9. Update Header.astro
10. Update index.astro
11. Protect all routes
12. Test with existing users

---

## Row Level Security (RLS)

**Requirement:** Users must only see their own data (PRD US-003, REQ-SEC-001)

**Implementation:**
- RLS policies should already be configured in `/supabase/migrations/20260104120000_add_rls_policies.sql`
- Verify policies exist for tables: `flats`, `payment_types`, `payments`
- Each policy should filter by `user_id = auth.uid()`

**Testing:**
- User 1 (admin@flatmanager.local) should see only their 3 flats
- User 2 (test@flatmanager.local) should see 0 flats
- Attempting to access another user's flat ID should return 403/404

---

## PRD Alignment & Clarifications

### ✅ Implemented in MVP
- **User Registration** (PRD REQ-AUTH-006, Section 1 contradiction resolved)
  - Despite Section 1 overview stating "No registration", detailed requirements in REQ-AUTH-006 and US-006 specify full registration flow
  - Decision: Implement registration as per detailed requirements
- **Row Level Security** (PRD REQ-AUTH-003 clarified)
  - REQ-AUTH-003 had confusing wording ("should be omitted in MVP")
  - US-003 and REQ-SEC-001 clearly require RLS
  - Decision: RLS policies must be implemented and verified
- **Seeded Test Users** (PRD REQ-AUTH-004, US-004, US-031)
  - Two test users available for immediate testing
  - Migration seed file: `/supabase/migrations/20260103120500_seed_test_data.sql`

### ❌ Explicitly Out of MVP Scope
- **Password Reset** (PRD Section 4.1, contradicts REQ-AUTH-005)
  - REQ-AUTH-005 mentions "possibility to reset password"
  - Section 4.1 lists "Password reset" as outside MVP scope
  - Decision: Password reset is NOT implemented (following Section 4.1)
- **Email Verification** (PRD Section 4.1)
- **Multi-factor Authentication** (PRD Section 4.1)
- **Password Strength Control** (PRD Section 4.2)
- **Login Attempt Limits** (PRD Section 4.2)

### Session Management
- Session maintained until explicit logout (PRD REQ-AUTH-001)
- Logout redirects to `/auth/login` (PRD REQ-AUTH-002, US-002)
- Access to protected resources redirects to `/auth/login` (PRD US-002)

### Security Requirements
- Passwords hashed by Supabase Auth (PRD REQ-AUTH-001, REQ-AUTH-006, REQ-SEC-001)
- RLS isolates user data (PRD US-003, REQ-SEC-001)
- No access to other users' data via API or UI (PRD REQ-SEC-001, US-003)

---

## Test Users

From seed data:
- `admin@flatmanager.local` / `password123` (3 flats)
- `test@flatmanager.local` / `password123` (0 flats)

---

## Implementation Checklist

### New Files
- [ ] `/src/lib/stores/auth.store.ts` - Client auth state with logout redirect
- [ ] `/src/components/auth/LoginForm.tsx` - Login with error handling
- [ ] `/src/components/auth/RegisterForm.tsx` - Registration with validation
- [ ] `/src/components/auth/UserMenu.tsx` - User menu with logout (visible everywhere)
- [ ] `/src/pages/auth/login.astro` - Login page (redirect if authenticated)
- [ ] `/src/pages/auth/register.astro` - Registration page (redirect if authenticated)
- [ ] `/src/pages/api/auth/register.ts` - Registration endpoint with validation
- [ ] `/src/pages/api/auth/login.ts` - Login endpoint with error handling
- [ ] `/src/pages/api/auth/logout.ts` - Logout endpoint (clear session)
- [ ] `/src/lib/services/auth.service.ts` - Auth business logic
- [ ] `/src/lib/validation/auth.schemas.ts` - Zod schemas for validation

### Modified Files
- [ ] `/src/env.d.ts` - Add window.__AUTH_USER__ interface
- [ ] `/src/types.ts` - Add AuthUser, LoginDTO, RegisterDTO types
- [ ] `/src/layouts/Layout.astro` - Get user, pass to window and Header
- [ ] `/src/components/Header.astro` - Add UserMenu when authenticated
- [ ] `/src/pages/index.astro` - Landing page with login/register links
- [ ] `/src/pages/dashboard.astro` - Add auth check
- [ ] `/src/pages/flats/**/*.astro` - Add auth check to all pages
- [ ] `/src/pages/payment-types/**/*.astro` - Add auth check to all pages
- [ ] `/src/pages/api/dashboard.ts` - Add auth check
- [ ] `/src/pages/api/flats/**/*.ts` - Add auth check to all endpoints
- [ ] `/src/pages/api/payment-types/**/*.ts` - Add auth check to all endpoints
- [ ] `/src/pages/api/payments/**/*.ts` - Add auth check to all endpoints

### Verification
- [ ] RLS policies exist in `/supabase/migrations/20260104120000_add_rls_policies.sql`
- [ ] Test users seeded in `/supabase/migrations/20260103120500_seed_test_data.sql`
- [ ] All forms show validation errors
- [ ] All API endpoints return proper status codes (401, 400, 409)
- [ ] Success messages displayed for registration
- [ ] Error messages user-friendly and in Polish (per PRD US-029)

### Testing
- [ ] Register new user (PRD REQ-AUTH-006, US-006)
  - [ ] Email format validation
  - [ ] Password min 8 chars validation
  - [ ] Password match validation
  - [ ] Duplicate email error handling
  - [ ] Success message displayed
  - [ ] Redirect to `/auth/login` after registration
- [ ] Login with test user (PRD US-001, US-004)
  - [ ] Correct credentials → redirect to `/dashboard`
  - [ ] Incorrect credentials → error message
  - [ ] Session maintained until logout
  - [ ] Password hidden in input field
- [ ] Logout (PRD US-002)
  - [ ] Logout button visible in all views
  - [ ] Session cleared
  - [ ] Redirect to `/auth/login`
- [ ] Access protected page (unauthorized) (PRD US-002)
  - [ ] Unauthenticated user redirected to `/auth/login`
- [ ] Access protected API (unauthorized)
  - [ ] Returns 401 Unauthorized
- [ ] Create flat after login
  - [ ] User sees only their own flats
- [ ] RLS verification (PRD US-003)
  - [ ] User 1 sees only their 3 flats
  - [ ] User 2 sees 0 flats
  - [ ] Cannot access other user's data via API or URL manipulation

