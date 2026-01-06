# API Endpoints Implementation - Documentation

## Overview

Zaimplementowano 3 endpointy API z integracją Supabase:

- `GET /api/dashboard` - pobieranie mieszkań z wyliczonym długiem
- `GET /api/flats` - pobieranie wszystkich mieszkań użytkownika
- `GET /api/flats/:id` - pobieranie szczegółów pojedynczego mieszkania

## Struktura

### 1. Serwis: FlatsService

**Plik:** `src/lib/services/flats.service.ts`

Klasa odpowiedzialna za logikę biznesową związaną z mieszkaniami:

#### Metody:

- **`getFlatsWithDebt(userId: string): Promise<DashboardFlatDto[]>`**
  - Pobiera wszystkie mieszkania użytkownika z wyliczonym długiem
  - Dług = suma nieopłaconych płatności (is_paid = false)
  - Używana przez `GET /api/dashboard`

- **`getAllFlats(userId: string): Promise<FlatDto[]>`**
  - Pobiera wszystkie mieszkania użytkownika
  - Sortowane po dacie utworzenia (najnowsze pierwsze)
  - Używana przez `GET /api/flats`

- **`getFlatById(flatId: string, userId: string): Promise<FlatDto | null>`**
  - Pobiera pojedyncze mieszkanie po ID
  - Zwraca null jeśli nie znaleziono lub mieszkanie nie należy do użytkownika
  - Używana przez `GET /api/flats/:id`

### 2. Endpointy API

#### GET /api/dashboard

**Plik:** `src/pages/api/dashboard.ts`

**Opis:** Zwraca wszystkie mieszkania użytkownika z wyliczonym długiem

**Autoryzacja:** Wymagana (Supabase Auth)

**Response (200 OK):**

```json
{
  "flats": [
    {
      "id": "uuid",
      "name": "Żoliborz 1",
      "address": "ul. Słowackiego 1",
      "debt": 1200.0,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Response (401 Unauthorized):**

```json
{
  "error": "Unauthorized"
}
```

---

#### GET /api/flats

**Plik:** `src/pages/api/flats/index.ts`

**Opis:** Zwraca wszystkie mieszkania użytkownika

**Autoryzacja:** Wymagana (Supabase Auth)

**Response (200 OK):**

```json
{
  "flats": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Żoliborz 1",
      "address": "ul. Słowackiego 1",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Response (401 Unauthorized):**

```json
{
  "error": "Unauthorized"
}
```

---

#### GET /api/flats/:id

**Plik:** `src/pages/api/flats/[id].ts`

**Opis:** Zwraca szczegóły pojedynczego mieszkania

**Autoryzacja:** Wymagana (Supabase Auth)

**Parametry:**

- `id` (path) - UUID mieszkania

**Response (200 OK):**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Żoliborz 1",
  "address": "ul. Słowackiego 1",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Response (404 Not Found):**

```json
{
  "error": "Flat not found"
}
```

**Response (401 Unauthorized):**

```json
{
  "error": "Unauthorized"
}
```

**Response (400 Bad Request):**

```json
{
  "error": "Flat ID is required"
}
```

## Bezpieczeństwo

### Autoryzacja

- Wszystkie endpointy wymagają autoryzacji przez Supabase Auth
- Używamy `locals.supabase` z middleware (zgodnie z best practices)
- User ID pobierany z `supabase.auth.getUser()`

### Row Level Security (RLS)

- Zapytania do bazy danych automatycznie filtrowane przez `user_id`
- Użytkownik może dostać tylko swoje mieszkania
- Dodatkowo weryfikowane w serwisie przez `.eq("user_id", userId)`

### Error Handling

- Early returns dla błędów autoryzacji
- Try-catch dla błędów bazy danych
- Logowanie błędów do konsoli
- User-friendly komunikaty błędów

## Algorytm wyliczania długu

W `getFlatsWithDebt()`:

1. Pobierz wszystkie mieszkania użytkownika
2. Pobierz wszystkie typy płatności dla tych mieszkań
3. Pobierz wszystkie nieopłacone płatności dla tych typów
4. Pogrupuj płatności po mieszkaniach
5. Zsumuj kwoty dla każdego mieszkania
6. Zwróć mieszkania z polem `debt`

## Testowanie

### Uruchomienie testów

```bash
# Uruchom serwer deweloperski
npm run dev

# W osobnym terminalu, uruchom testy
./test-api-endpoints.sh
```

### Testy manualne z curl

```bash
# GET /api/dashboard
curl http://localhost:4321/api/dashboard

# GET /api/flats
curl http://localhost:4321/api/flats

# GET /api/flats/:id
curl http://localhost:4321/api/flats/550e8400-e29b-41d4-a716-446655440000
```

## Uwagi implementacyjne

### Zgodność z coding guidelines

✅ Use feedback from linters  
✅ Prioritize error handling and edge cases  
✅ Handle errors at the beginning of functions  
✅ Use early returns for error conditions  
✅ Place the happy path last  
✅ Avoid unnecessary else statements  
✅ Use guard clauses  
✅ Implement proper error logging

### Zgodność z Supabase guidelines

✅ Use supabase from `context.locals`  
✅ Use `SupabaseClient` type from `src/db/supabase.client.ts`  
✅ Extract logic into services in `src/lib/services`  
✅ Use `export const prerender = false` for API routes

## Zależności

- `@supabase/supabase-js` - klient Supabase
- Typy z `src/types.ts` i `src/db/database.types.ts`
- Middleware w `src/middleware/index.ts` dostarczający `locals.supabase`

## Następne kroki

Pozostałe endpointy do zaimplementowania (z view-implementation-plan.md):

- POST /api/flats
- PUT /api/flats/:id
- DELETE /api/flats/:id
- GET /api/flats/:flatId/payment-types
- POST /api/flats/:flatId/payment-types
- PUT /api/payment-types/:id
- GET /api/flats/:flatId/payments
- POST /api/flats/:flatId/payments/generate
- POST /api/payments/:id/mark-paid
