# REST API Plan

## 1. Resources

| Resource      | Database Table  | Description                                    |
| ------------- | --------------- | ---------------------------------------------- |
| Dashboard     | Multiple tables | Aggregated view of flats with debt calculation |
| Flats         | `flats`         | Apartments managed by the landlord             |
| Payment Types | `payment_types` | Recurring payment templates for each flat      |
| Payments      | `payments`      | Generated monthly payment instances            |

**Note:** Authentication is handled by Supabase Auth, not custom API endpoints.

## 2. Endpoints

### 2.1. Dashboard

#### GET /api/dashboard

Retrieve dashboard with all user's flats and their debt.

**Description:** Returns a list of all flats owned by the authenticated user with calculated debt (sum of unpaid payments).

**Query Parameters:** None

**Request Headers:**

- `Authorization: Bearer {jwt_token}` (automatically handled by Supabase client)

**Success Response (200 OK):**

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
    },
    {
      "id": "uuid",
      "name": "Mokotów 2",
      "address": "ul. Puławska 2",
      "debt": 0.0,
      "created_at": "2024-01-16T11:00:00Z",
      "updated_at": "2024-01-16T11:00:00Z"
    }
  ]
}
```

**Error Responses:**

- `401 Unauthorized` - User not authenticated
  ```json
  { "error": "Unauthorized" }
  ```

**Business Logic:**

- Debt is calculated as: `SUM(payments.amount) WHERE is_paid = false` grouped by flat
- Flats without unpaid payments have debt = 0.00
- Results are sorted alphabetically by flat name

---

### 2.2. Flats

#### GET /api/flats

Retrieve all flats owned by the authenticated user.

**Description:** Returns a list of all flats without debt calculation (lighter than dashboard endpoint).

**Query Parameters:** None

**Success Response (200 OK):**

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

**Error Responses:**

- `401 Unauthorized` - User not authenticated

---

#### GET /api/flats/:id

Retrieve a single flat by ID.

**Description:** Returns detailed information about a specific flat owned by the authenticated user.

**Path Parameters:**

- `id` (UUID, required) - Flat identifier

**Success Response (200 OK):**

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

**Error Responses:**

- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Flat not found or doesn't belong to user
  ```json
  { "error": "Flat not found" }
  ```

**Business Logic:**

- RLS ensures user can only access their own flats

---

#### POST /api/flats

Create a new flat.

**Description:** Creates a new flat for the authenticated user.

**Request Body:**

```json
{
  "name": "Żoliborz 1",
  "address": "ul. Słowackiego 1"
}
```

**Validation Rules:**

- `name` (string, required) - Flat name, min 1 character
- `address` (string, required) - Flat address, min 1 character

**Success Response (201 Created):**

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

**Error Responses:**

- `400 Bad Request` - Validation error
  ```json
  {
    "error": "Validation failed",
    "details": {
      "name": "Required field",
      "address": "Required field"
    }
  }
  ```
- `401 Unauthorized` - User not authenticated

**Business Logic:**

- `user_id` is automatically set from authenticated user (auth.uid())
- Flat names don't need to be unique

---

#### PUT /api/flats/:id

Update an existing flat.

**Description:** Updates name and/or address of an existing flat.

**Path Parameters:**

- `id` (UUID, required) - Flat identifier

**Request Body:**

```json
{
  "name": "Żoliborz 1 Updated",
  "address": "ul. Słowackiego 1A"
}
```

**Validation Rules:**

- `name` (string, required) - Flat name, min 1 character
- `address` (string, required) - Flat address, min 1 character

**Success Response (200 OK):**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Żoliborz 1 Updated",
  "address": "ul. Słowackiego 1A",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T12:00:00Z"
}
```

**Error Responses:**

- `400 Bad Request` - Validation error
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Flat not found or doesn't belong to user

**Business Logic:**

- Updating flat does not affect existing payment types or payments
- `updated_at` is automatically updated by database trigger

---

#### DELETE /api/flats/:id

Delete a flat.

**Description:** Deletes a flat and all associated payment types and payments (cascade delete).

**Path Parameters:**

- `id` (UUID, required) - Flat identifier

**Success Response (200 OK):**

```json
{
  "message": "Flat deleted successfully"
}
```

**Error Responses:**

- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Flat not found or doesn't belong to user

**Business Logic:**

- Cascade delete removes all payment_types and payments associated with the flat
- No confirmation required in MVP
- Cannot be undone

---

### 2.3. Payment Types

#### GET /api/flats/:flatId/payment-types

Retrieve all payment types for a specific flat.

**Description:** Returns a list of all payment types (recurring payment templates) for the specified flat.

**Path Parameters:**

- `flatId` (UUID, required) - Flat identifier

**Success Response (200 OK):**

```json
{
  "payment_types": [
    {
      "id": "uuid",
      "flat_id": "uuid",
      "name": "Czynsz",
      "base_amount": 1000.0,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "uuid",
      "flat_id": "uuid",
      "name": "Administracja",
      "base_amount": 200.0,
      "created_at": "2024-01-15T10:35:00Z",
      "updated_at": "2024-01-15T10:35:00Z"
    }
  ]
}
```

**Error Responses:**

- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Flat not found or doesn't belong to user

**Business Logic:**

- RLS ensures user can only access payment types of their own flats
- Results are ordered by created_at descending (newest first)

---

#### POST /api/flats/:flatId/payment-types

Create a new payment type for a flat.

**Description:** Creates a new recurring payment template for the specified flat.

**Path Parameters:**

- `flatId` (UUID, required) - Flat identifier

**Request Body:**

```json
{
  "name": "Czynsz",
  "base_amount": 1000.0
}
```

**Validation Rules:**

- `name` (string, required) - Payment type name, min 1 character
- `base_amount` (number, required) - Base amount in PLN, must be >= 0

**Success Response (201 Created):**

```json
{
  "id": "uuid",
  "flat_id": "uuid",
  "name": "Czynsz",
  "base_amount": 1000.0,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**

- `400 Bad Request` - Validation error
  ```json
  {
    "error": "Validation failed",
    "details": {
      "base_amount": "Amount must be non-negative"
    }
  }
  ```
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Flat not found or doesn't belong to user

**Business Logic:**

- Payment type names don't need to be unique within a flat
- Database check constraint prevents negative amounts
- `flat_id` is set from path parameter

---

#### PUT /api/payment-types/:id

Update an existing payment type.

**Description:** Updates name and/or base_amount of an existing payment type.

**Path Parameters:**

- `id` (UUID, required) - Payment type identifier

**Request Body:**

```json
{
  "name": "Czynsz Updated",
  "base_amount": 1100.0
}
```

**Validation Rules:**

- `name` (string, required) - Payment type name, min 1 character
- `base_amount` (number, required) - Base amount in PLN, must be >= 0

**Success Response (200 OK):**

```json
{
  "id": "uuid",
  "flat_id": "uuid",
  "name": "Czynsz Updated",
  "base_amount": 1100.0,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T12:00:00Z"
}
```

**Error Responses:**

- `400 Bad Request` - Validation error
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Payment type not found or doesn't belong to user's flat

**Business Logic:**

- Changing base_amount affects only future payment generations
- Already generated payments retain their original amount (historical data preservation)
- RLS ensures user can only update payment types of their own flats

---

### 2.4. Payments

#### GET /api/flats/:flatId/payments

Retrieve payments for a specific flat with optional filtering.

**Description:** Returns a list of payments for the specified flat, with optional filtering by month, year, and payment status.

**Path Parameters:**

- `flatId` (UUID, required) - Flat identifier

**Query Parameters:**

- `month` (integer, optional) - Filter by month (1-12)
- `year` (integer, optional) - Filter by year (1900-2100)
- `is_paid` (boolean, optional) - Filter by payment status (default: false for unpaid only)

**Success Response (200 OK):**

```json
{
  "payments": [
    {
      "id": "uuid",
      "payment_type_id": "uuid",
      "payment_type_name": "Czynsz",
      "amount": 1000.0,
      "month": 1,
      "year": 2024,
      "is_paid": false,
      "paid_at": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "uuid",
      "payment_type_id": "uuid",
      "payment_type_name": "Administracja",
      "amount": 200.0,
      "month": 1,
      "year": 2024,
      "is_paid": true,
      "paid_at": "2024-01-20T14:30:00Z",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T14:30:00Z"
    }
  ]
}
```

**Error Responses:**

- `400 Bad Request` - Invalid query parameters
  ```json
  {
    "error": "Validation failed",
    "details": {
      "month": "Month must be between 1 and 12"
    }
  }
  ```
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Flat not found or doesn't belong to user

**Business Logic:**

- Default behavior (no filters): returns all unpaid payments
- Results are sorted by year DESC, month DESC (newest first)
- Query joins with payment_types to include payment type name
- RLS ensures user can only access payments of their own flats

---

#### POST /api/flats/:flatId/payments/generate

Generate monthly payments for all payment types of a flat.

**Description:** Creates payment instances for all payment types of the specified flat for a given month and year.

**Path Parameters:**

- `flatId` (UUID, required) - Flat identifier

**Request Body:**

```json
{
  "month": 1,
  "year": 2024
}
```

**Validation Rules:**

- `month` (integer, required) - Month (1-12)
- `year` (integer, required) - Year (1900-2100)

**Success Response (201 Created):**

```json
{
  "message": "Payments generated successfully",
  "generated_count": 2,
  "month": 1,
  "year": 2024,
  "payments": [
    {
      "id": "uuid",
      "payment_type_id": "uuid",
      "payment_type_name": "Czynsz",
      "amount": 1000.0,
      "month": 1,
      "year": 2024,
      "is_paid": false,
      "paid_at": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Error Responses:**

- `400 Bad Request` - Validation error
  ```json
  {
    "error": "Validation failed",
    "details": {
      "month": "Month must be between 1 and 12"
    }
  }
  ```
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Flat not found or doesn't belong to user
- `409 Conflict` - Some or all payments already exist for this period
  ```json
  {
    "error": "Some payments already exist for this period",
    "generated_count": 1,
    "skipped_count": 1
  }
  ```

**Business Logic:**

- Copies `base_amount` from payment_type to payment's `amount` at generation time
- Uses `ON CONFLICT (payment_type_id, month, year) DO NOTHING` to prevent duplicates
- Returns number of successfully generated payments
- All generated payments have `is_paid = false` by default
- No future/past date restrictions (can generate for any month/year)

---

#### POST /api/payments/:id/mark-paid

Mark a payment as paid.

**Description:** Sets a payment status to paid and records the payment timestamp.

**Path Parameters:**

- `id` (UUID, required) - Payment identifier

**Request Body:** None (or empty object)

**Success Response (200 OK):**

```json
{
  "id": "uuid",
  "payment_type_id": "uuid",
  "amount": 1000.0,
  "month": 1,
  "year": 2024,
  "is_paid": true,
  "paid_at": "2024-01-20T14:30:00Z",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:30:00Z"
}
```

**Error Responses:**

- `400 Bad Request` - Payment is already paid
  ```json
  {
    "error": "Payment is already marked as paid"
  }
  ```
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Payment not found or doesn't belong to user's flat

**Business Logic:**

- Atomically sets `is_paid = true` and `paid_at = NOW()`
- Check constraint ensures `paid_at IS NOT NULL` when `is_paid = true`
- Once marked as paid, payment cannot be edited or unmarked
- Updates trigger automatically sets `updated_at`
- RLS ensures user can only mark payments of their own flats

---

## 3. Authentication and Authorization

### 3.1. Authentication Mechanism

**Technology:** Supabase Auth with JWT tokens

**Implementation:**

- Users authenticate via Supabase Auth client (client-side)
- JWT token is automatically included in requests via Supabase client
- Server validates token using Supabase middleware
- No custom authentication endpoints required

**Session Management:**

- Sessions are managed by Supabase Auth
- Token refresh is handled automatically by Supabase client
- Logout invalidates the session

### 3.2. Authorization with Row Level Security (RLS)

**Database-Level Security:**

- All tables (`profiles`, `flats`, `payment_types`, `payments`) have RLS enabled
- Policies use `auth.uid()` to identify the authenticated user
- Users can only access data that belongs to them

**RLS Policies:**

1. **Flats:** User can only access flats where `user_id = auth.uid()`
2. **Payment Types:** User can only access payment types of their own flats (via join)
3. **Payments:** User can only access payments of their own flats (via double join)

**API Implementation:**

- Use `context.locals.supabase` in Astro endpoints (from middleware)
- Never import `supabaseClient` directly in endpoints
- RLS is enforced automatically at database level
- No additional authorization logic needed in API code

### 3.3. Security Best Practices

**Input Validation:**

- All request bodies validated with Zod schemas
- Type safety ensured with TypeScript
- Validation errors return 400 Bad Request with details

**SQL Injection Prevention:**

- Use Supabase client parameterized queries
- Never concatenate user input into SQL strings

**Error Handling:**

- Don't expose internal errors to clients
- Return user-friendly error messages
- Log detailed errors server-side

---

## 4. Validation and Business Logic

### 4.1. Validation Rules by Resource

#### Flats

- `name` (string, required, min 1 character)
- `address` (string, required, min 1 character)
- No uniqueness constraints on names

#### Payment Types

- `name` (string, required, min 1 character)
- `base_amount` (number, required, >= 0, max 2 decimal places)
- No uniqueness constraints on names within flat
- Database check constraint: `base_amount >= 0`

#### Payments (Generation)

- `month` (integer, required, 1-12)
- `year` (integer, required, 1900-2100)
- Database check constraints enforce ranges
- Unique constraint: `(payment_type_id, month, year)`

#### Payments (Mark as Paid)

- No input validation (action endpoint)
- Business rule: can only mark unpaid payments
- Database check constraint: `is_paid = false OR paid_at IS NOT NULL`

### 4.2. Business Logic Implementation

#### Debt Calculation

**Location:** GET /api/dashboard

**Logic:**

```sql
SELECT
  f.id, f.name, f.address,
  COALESCE(SUM(CASE WHEN p.is_paid = false THEN p.amount ELSE 0 END), 0) as debt
FROM flats f
LEFT JOIN payment_types pt ON pt.flat_id = f.id
LEFT JOIN payments p ON p.payment_type_id = pt.id
WHERE f.user_id = auth.uid()
GROUP BY f.id
ORDER BY f.name
```

**Rules:**

- Debt = sum of unpaid payments only (`is_paid = false`)
- Flats without payments have debt = 0.00
- Independent of time filters (always shows total unpaid)

#### Payment Generation

**Location:** POST /api/flats/:flatId/payments/generate

**Logic:**

```sql
INSERT INTO payments (payment_type_id, amount, month, year)
SELECT pt.id, pt.base_amount, $month, $year
FROM payment_types pt
WHERE pt.flat_id = $flatId
ON CONFLICT (payment_type_id, month, year) DO NOTHING
```

**Rules:**

- Copy `base_amount` to `amount` at generation time (historical preservation)
- Graceful duplicate handling with ON CONFLICT
- Return count of generated vs. skipped payments
- All new payments have `is_paid = false`

#### Mark as Paid

**Location:** POST /api/payments/:id/mark-paid

**Logic:**

```sql
UPDATE payments
SET is_paid = true, paid_at = NOW()
WHERE id = $id AND is_paid = false
```

**Rules:**

- Atomic update of both `is_paid` and `paid_at`
- WHERE clause prevents re-marking already paid payments
- Once paid, payment is immutable (protected from edits)

#### Payment Filtering

**Location:** GET /api/flats/:flatId/payments

**Logic:**

- Default: `WHERE is_paid = false` (unpaid only)
- With month/year: `WHERE month = $month AND year = $year`
- With is_paid: `WHERE is_paid = $isPaid`
- Can combine filters

**Rules:**

- Default view shows unpaid payments (most common use case)
- Filters are optional and combinable
- Results sorted by year DESC, month DESC

#### Cascade Delete

**Location:** DELETE /api/flats/:id

**Logic:**

- Database handles cascade with `ON DELETE CASCADE`
- API only needs to delete the flat
- Automatically removes all payment_types and payments

**Rules:**

- Irreversible operation (no soft delete in MVP)
- No confirmation dialog in MVP
- RLS ensures user can only delete own flats

### 4.3. Immutability Rules

**Paid Payments:**

- Cannot edit amount, month, year of paid payment
- No API endpoint for editing payments in MVP
- Future: could add endpoint with is_paid check

**Historical Data:**

- Changing `base_amount` doesn't affect existing payments
- `amount` is copied at generation time (not referenced)
- Financial history remains accurate

**Minimum Payment Types:**

- Flat must have >= 1 payment type (business rule)
- No deletion endpoint in MVP (rule automatically satisfied)
- Future: validate count before allowing deletion

### 4.4. Error Response Format

**Validation Errors (400 Bad Request):**

```json
{
  "error": "Validation failed",
  "details": {
    "field_name": "Error message"
  }
}
```

**Business Logic Errors (400 Bad Request):**

```json
{
  "error": "Business rule violation message"
}
```

**Authentication Errors (401 Unauthorized):**

```json
{
  "error": "Unauthorized"
}
```

**Not Found Errors (404 Not Found):**

```json
{
  "error": "Resource not found"
}
```

**Conflict Errors (409 Conflict):**

```json
{
  "error": "Conflict message",
  "details": {}
}
```

**Server Errors (500 Internal Server Error):**

```json
{
  "error": "Internal server error"
}
```

---

## 5. Data Types and Formats

### 5.1. Field Types

**UUIDs:**

- Format: Standard UUID v4 (e.g., `"550e8400-e29b-41d4-a716-446655440000"`)
- Used for all `id` fields

**Monetary Values:**

- Type: Number with 2 decimal places (NUMERIC(10,2) in DB)
- Format: 1234.56 (no currency symbol in API)
- Range: 0.00 to 99,999,999.99
- Validation: Must be >= 0

**Dates and Timestamps:**

- Format: ISO 8601 UTC (e.g., `"2024-01-15T10:30:00Z"`)
- Timezone: Always UTC in API responses
- Frontend converts to user's local timezone

**Month:**

- Type: Integer
- Range: 1-12
- Validation: Database check constraint

**Year:**

- Type: Integer
- Range: 1900-2100
- Validation: Database check constraint

**Booleans:**

- Type: Boolean
- Values: `true` or `false` (JSON boolean, not string)

### 5.2. Null Handling

**Nullable Fields:**

- `paid_at` - NULL when payment is not paid, timestamp when paid
- All other fields are NOT NULL

**Empty Collections:**

- Empty arrays for lists (e.g., `"flats": []`)
- Never return null for collections

### 5.3. Currency

**MVP Assumption:**

- All amounts in PLN (Polish Złoty)
- No currency field in API
- Frontend displays with "PLN" suffix
- Future: Add currency field if multi-currency needed

---

## 6. Summary

This REST API plan provides a complete backend for the flat-manager MVP with:

✅ **7 main endpoints** covering all CRUD operations and business logic  
✅ **Strong authentication** with Supabase Auth and RLS  
✅ **Comprehensive validation** with Zod schemas and database constraints  
✅ **Clear business logic** for debt calculation, payment generation, and status management  
✅ **RESTful design** with predictable URL patterns and HTTP methods  
✅ **Detailed error handling** with user-friendly messages  
✅ **Type safety** with TypeScript and database types  
✅ **Performance optimization** through strategic indexes and efficient queries  
✅ **Scalability path** for future enhancements

The API is ready for implementation following the Astro 5 server endpoints pattern with Supabase integration.
