# API Endpoint Implementation Plan: GET /api/flats/:flatId/payments

## 1. Endpoint Overview

This endpoint retrieves all payments for a specific flat with optional filtering capabilities. It serves as the primary interface for viewing payment history and outstanding debts for a flat. The endpoint joins payment data with payment type information to provide meaningful context and supports filtering by month, year, and payment status.

**Key Features:**
- Retrieve all payments for a specific flat
- Optional filtering by month, year, and payment status
- Default behavior: show unpaid payments only
- Join with payment_types to include payment type names
- Results sorted by newest first (year DESC, month DESC)
- RLS-enforced authorization ensuring users only access their own data

## 2. Request Details

- **HTTP Method**: GET
- **URL Structure**: `/api/flats/:flatId/payments`
- **Authentication**: Required (Supabase Auth JWT via middleware)
- **Content Type**: N/A (GET request)

### Parameters

#### Path Parameters (Required):
- `flatId` (UUID) - Unique identifier of the flat
  - Must be valid UUID format
  - Must belong to authenticated user (enforced by RLS)

#### Query Parameters (Optional):
- `month` (integer) - Filter payments by month
  - Range: 1-12
  - Example: `?month=3` for March
  
- `year` (integer) - Filter payments by year
  - Range: 1900-2100
  - Example: `?year=2024`
  
- `is_paid` (boolean) - Filter by payment status
  - Values: `true` or `false`
  - Default: `false` (unpaid payments only)
  - Example: `?is_paid=true`

**Example Requests:**
```
GET /api/flats/550e8400-e29b-41d4-a716-446655440000/payments
GET /api/flats/550e8400-e29b-41d4-a716-446655440000/payments?month=3&year=2024
GET /api/flats/550e8400-e29b-41d4-a716-446655440000/payments?is_paid=true
GET /api/flats/550e8400-e29b-41d4-a716-446655440000/payments?month=3&year=2024&is_paid=false
```

### Request Headers:
- `Authorization: Bearer {jwt_token}` (automatically handled by Supabase client via middleware)

### Request Body:
- None (GET request)

## 3. Used Types

The following types from `src/types.ts` are required for implementation:

### Response DTOs:
```typescript
// Main response structure
PaymentsResponseDto = {
  payments: PaymentWithTypeNameDto[];
}

// Individual payment with joined payment type name
PaymentWithTypeNameDto = PaymentDto & {
  payment_type_name: string;
}

// Base payment entity (from database)
PaymentDto = Tables<'payments'>
```

### Request Validation:
```typescript
// Query parameters structure
PaymentsQueryParams = {
  month?: number;
  year?: number;
  is_paid?: boolean;
}
```

### Error Responses:
```typescript
// Standard error response
ErrorResponseDto = {
  error: string;
}

// Validation error with field details
ValidationErrorResponseDto = {
  error: string;
  details: Record<string, string>;
}
```

### Internal Service Types:
```typescript
// Supabase client type (from src/db/supabase.client.ts)
SupabaseClient

// Database tables type
Tables<'payments'>
Tables<'payment_types'>
```

## 4. Response Details

### Success Response (200 OK):

**With Results:**
```json
{
  "payments": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "payment_type_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "payment_type_name": "Czynsz",
      "amount": 1000.00,
      "month": 3,
      "year": 2024,
      "is_paid": false,
      "paid_at": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "payment_type_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "payment_type_name": "Administracja",
      "amount": 200.00,
      "month": 3,
      "year": 2024,
      "is_paid": false,
      "paid_at": null,
      "created_at": "2024-01-15T10:35:00Z",
      "updated_at": "2024-01-15T10:35:00Z"
    }
  ]
}
```

**Empty Results:**
```json
{
  "payments": []
}
```

### Error Responses:

**400 Bad Request - Invalid Query Parameters:**
```json
{
  "error": "Validation failed",
  "details": {
    "month": "Month must be between 1 and 12",
    "year": "Year must be between 1900 and 2100"
  }
}
```

**400 Bad Request - Invalid UUID Format:**
```json
{
  "error": "Validation failed",
  "details": {
    "flatId": "Invalid UUID format"
  }
}
```

**401 Unauthorized - User Not Authenticated:**
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found - Flat Not Found or Not Owned by User:**
```json
{
  "error": "Flat not found"
}
```

**500 Internal Server Error - Database or Server Error:**
```json
{
  "error": "Internal server error"
}
```

## 5. Data Flow

### Request Processing Flow:

1. **Request Reception**
   - Astro endpoint receives GET request at `/api/flats/:flatId/payments`
   - Extract `flatId` from path parameters
   - Extract query parameters (`month`, `year`, `is_paid`)

2. **Authentication Check**
   - Middleware validates JWT token from Supabase Auth
   - If invalid/missing: return 401 Unauthorized
   - Extract user ID from authenticated session

3. **Input Validation**
   - Validate `flatId` is valid UUID format using Zod
   - Validate query parameters using Zod schema:
     - `month`: optional integer, 1-12
     - `year`: optional integer, 1900-2100
     - `is_paid`: optional boolean (coerced from string)
   - If validation fails: return 400 Bad Request with field errors

4. **Flat Ownership Verification**
   - Call service to verify flat exists and belongs to user
   - Query: `SELECT id FROM flats WHERE id = $flatId AND user_id = auth.uid()`
   - RLS policy automatically enforces user_id check
   - If no result: return 404 Not Found

5. **Payment Retrieval**
   - Call `PaymentService.getPaymentsByFlatId()` with validated parameters
   - Service builds query with joins and filters:
     ```sql
     SELECT 
       p.*,
       pt.name as payment_type_name
     FROM payments p
     INNER JOIN payment_types pt ON pt.id = p.payment_type_id
     WHERE pt.flat_id = $flatId
       AND (p.month = $month OR $month IS NULL)
       AND (p.year = $year OR $year IS NULL)
       AND (p.is_paid = $isPaid OR ($isPaid IS NULL AND p.is_paid = false))
     ORDER BY p.year DESC, p.month DESC
     ```
   - RLS policies ensure only user's data is returned

6. **Response Formation**
   - Transform database results to `PaymentWithTypeNameDto[]`
   - Wrap in `PaymentsResponseDto` structure
   - Return 200 OK with JSON response

7. **Error Handling**
   - Catch database errors: return 500 Internal Server Error
   - Log error details server-side (console.error)
   - Return user-friendly error message

### Data Flow Diagram:

```
Client Request
     ↓
[Middleware: JWT Validation]
     ↓
[Endpoint: Extract & Validate Parameters]
     ↓
[Endpoint: Validate flatId UUID]
     ↓
[Service: Verify Flat Ownership via RLS]
     ↓
[Service: Query Payments with Filters & Join]
     ↓
[Database: Apply RLS Policies]
     ↓
[Database: Execute Query & Return Results]
     ↓
[Service: Transform to DTOs]
     ↓
[Endpoint: Format Response]
     ↓
Client Response (200 OK or Error)
```

### Database Interactions:

1. **Flat Verification Query** (implicit via RLS):
   - Table: `flats`
   - Purpose: Verify ownership before querying payments
   - RLS: Automatic WHERE user_id = auth.uid()

2. **Payment Retrieval Query**:
   - Tables: `payments` INNER JOIN `payment_types`
   - Purpose: Get payments with type names
   - RLS: Automatic filtering via payment_types → flats relationship
   - Filters: month, year, is_paid (applied dynamically)
   - Sorting: year DESC, month DESC

## 6. Security Considerations

### Authentication:
- **Mechanism**: Supabase Auth JWT tokens
- **Implementation**: Middleware validates token before request reaches endpoint
- **Session Management**: Handled by Supabase client
- **Token Refresh**: Automatic via Supabase client
- **Failure Handling**: Return 401 Unauthorized for invalid/missing tokens

### Authorization:
- **Row Level Security (RLS)**: Primary authorization mechanism
- **Flat Ownership**: RLS ensures user can only query flats where `user_id = auth.uid()`
- **Payment Access**: Cascading RLS via payment_types → flats relationship
- **No Additional Checks**: Database-level security eliminates need for application-level authorization code

### Input Validation:
- **Path Parameter**: Validate `flatId` is proper UUID format to prevent injection
- **Query Parameters**: Zod schema validates types and ranges
- **Type Coercion**: Use `z.coerce` for safe string-to-number/boolean conversion
- **Sanitization**: Zod validation ensures clean data before database queries

### SQL Injection Prevention:
- **Parameterized Queries**: Supabase client uses prepared statements
- **No String Concatenation**: Never build queries with string interpolation
- **ORM Safety**: Supabase query builder prevents injection vectors

### Data Exposure Prevention:
- **Generic Error Messages**: Don't expose database structure or internals
- **Error Logging**: Log detailed errors server-side only
- **Success Response**: Only return data user is authorized to see (RLS enforced)
- **Empty Results**: Return empty array, not 404, when no payments found (after flat verification)

### IDOR (Insecure Direct Object Reference) Prevention:
- **Threat**: User accessing payments of flats they don't own via manipulated flatId
- **Mitigation**: RLS policies automatically filter results by ownership
- **Verification**: Explicit flat ownership check before payment query
- **Response**: 404 if flat not found or not owned (same response for both cases - no information leakage)


## 7. Error Handling

### Error Categories and Responses:

| Error Type | Status Code | Cause | Response | User Impact |
|------------|-------------|-------|----------|-------------|
| **Validation Error** | 400 Bad Request | Invalid query parameters (month, year, is_paid) | `{ error: "Validation failed", details: {...} }` | User sees which parameter is invalid and constraints |
| **Invalid UUID** | 400 Bad Request | Malformed flatId parameter | `{ error: "Validation failed", details: { flatId: "Invalid UUID format" } }` | User knows the flat ID format is wrong |
| **Unauthorized** | 401 Unauthorized | Missing or invalid JWT token | `{ error: "Unauthorized" }` | User redirected to login |
| **Flat Not Found** | 404 Not Found | Flat doesn't exist or user doesn't own it | `{ error: "Flat not found" }` | User informed flat is inaccessible (no distinction between not exists vs. not owned) |
| **Database Error** | 500 Internal Server Error | Supabase connection failure, query error | `{ error: "Internal server error" }` | Generic error shown to user, details logged server-side |
| **Unexpected Error** | 500 Internal Server Error | Unhandled exception in code | `{ error: "Internal server error" }` | Generic error shown to user, details logged server-side |

### Error Handling Strategy:

1. **Validation Errors (400)**:
   ```typescript
   const validation = PaymentsQuerySchema.safeParse(queryParams);
   if (!validation.success) {
     return new Response(JSON.stringify({
       error: "Validation failed",
       details: validation.error.flatten().fieldErrors
     }), { status: 400 });
   }
   ```

2. **Authentication Errors (401)**:
   - Handled by middleware before endpoint execution
   - Middleware returns 401 if JWT is invalid/missing
   - Endpoint can assume user is authenticated

3. **Not Found Errors (404)**:
   ```typescript
   const flat = await verifyFlatOwnership(supabase, flatId);
   if (!flat) {
     return new Response(JSON.stringify({
       error: "Flat not found"
     }), { status: 404 });
   }
   ```

4. **Server Errors (500)**:
   ```typescript
   try {
     // Database operations
   } catch (error) {
     console.error('Error fetching payments:', error);
     return new Response(JSON.stringify({
       error: "Internal server error"
     }), { status: 500 });
   }
   ```

### Error Logging:

**Server-Side Logging:**
- Use `console.error()` for all caught exceptions
- Include context: endpoint, user ID, parameters
- Log full error stack for debugging
- Example: `console.error('GET /api/flats/:flatId/payments error:', { flatId, error })`

**Client-Side Errors:**
- Return sanitized error messages
- Don't expose: database structure, query details, stack traces
- Provide actionable feedback when possible

### Edge Cases:

1. **No Payments Exist**: Return `{ payments: [] }` with 200 OK (not an error)
2. **No Payment Types**: Return `{ payments: [] }` with 200 OK (valid state)
3. **Filters Match Nothing**: Return `{ payments: [] }` with 200 OK
4. **Invalid Filter Combination**: Still valid - just return empty results
5. **Flat Exists But No Access**: Return 404 (same as flat not existing - no information leakage)

### Potential Bottlenecks:

1. **Large Result Sets**:
   - **Current**: No pagination in MVP
   - **Impact**: Limited by RLS (only user's data) and typical use case
   - **Future**: Implement cursor-based pagination if needed

2. **Complex Joins**:
   - **Current**: Single INNER JOIN with indexed columns
   - **Impact**: Low - simple join with small tables
   - **Optimization**: Indexes handle this efficiently

3. **Multiple Filters**:
   - **Current**: Dynamic WHERE clause building
   - **Impact**: Minimal with proper indexes
   - **Optimization**: Composite indexes on commonly filtered columns

### Caching Strategy (Future):

**Not Implemented in MVP:**
- Consider caching for frequently accessed data
- Cache invalidation on payment updates
- Redis or similar for session-based caching

**Client-Side Caching:**
- Set appropriate Cache-Control headers
- Consider ETag for conditional requests
- Leverage browser caching for unchanged data


## 9. Implementation Steps

### Step 1: Create Validation Schemas
**File**: `src/lib/validation/payment.validation.ts`

```typescript
import { z } from 'zod';

export const PaymentsQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  is_paid: z.coerce.boolean().optional()
});

export const FlatIdSchema = z.string().uuid();
```

**Validation Rules:**
- Use `z.coerce` for automatic type conversion from string query params
- Define min/max constraints matching database check constraints
- Make all query params optional (filters are optional)

---

### Step 2: Create Flat Service
**File**: `src/lib/services/flat.service.ts`

```typescript
import type { SupabaseClient } from '@/db/supabase.client';

export async function verifyFlatOwnership(
  supabase: SupabaseClient,
  flatId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('flats')
    .select('id')
    .eq('id', flatId)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}
```

**Purpose**: 
- Verify flat exists and belongs to authenticated user
- RLS automatically enforces user_id check
- Returns boolean for simple ownership verification

---

### Step 3: Create Payment Service
**File**: `src/lib/services/payment.service.ts`

```typescript
import type { SupabaseClient } from '@/db/supabase.client';
import type { PaymentWithTypeNameDto, PaymentsQueryParams } from '@/types';

export async function getPaymentsByFlatId(
  supabase: SupabaseClient,
  flatId: string,
  filters: PaymentsQueryParams
): Promise<PaymentWithTypeNameDto[]> {
  let query = supabase
    .from('payments')
    .select(`
      *,
      payment_types!inner(
        name,
        flat_id
      )
    `)
    .eq('payment_types.flat_id', flatId)
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  // Apply optional filters
  if (filters.month !== undefined) {
    query = query.eq('month', filters.month);
  }

  if (filters.year !== undefined) {
    query = query.eq('year', filters.year);
  }

  // Default to unpaid if is_paid not specified
  const isPaidFilter = filters.is_paid !== undefined ? filters.is_paid : false;
  query = query.eq('is_paid', isPaidFilter);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch payments: ${error.message}`);
  }

  // Transform to include payment_type_name
  return (data || []).map(payment => ({
    ...payment,
    payment_type_name: payment.payment_types.name
  }));
}
```

**Key Features:**
- INNER JOIN with payment_types to get type name
- Filter by flat_id via joined table
- Dynamic filter application based on provided params
- Default is_paid filter to false (unpaid payments)
- Sort by newest first
- Transform result to include payment_type_name field

---

### Step 4: Implement API Endpoint
**File**: `src/pages/api/flats/[flatId]/payments.ts`

```typescript
import type { APIRoute } from 'astro';
import { FlatIdSchema, PaymentsQuerySchema } from '@/lib/validation/payment.validation';
import { verifyFlatOwnership } from '@/lib/services/flat.service';
import { getPaymentsByFlatId } from '@/lib/services/payment.service';
import type { PaymentsResponseDto, ErrorResponseDto, ValidationErrorResponseDto } from '@/types';

export const prerender = false;

export const GET: APIRoute = async ({ params, request, locals }) => {
  const supabase = locals.supabase;

  // Check authentication (should be handled by middleware, but verify)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    const response: ErrorResponseDto = { error: 'Unauthorized' };
    return new Response(JSON.stringify(response), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate flatId path parameter
  const flatIdValidation = FlatIdSchema.safeParse(params.flatId);
  if (!flatIdValidation.success) {
    const response: ValidationErrorResponseDto = {
      error: 'Validation failed',
      details: { flatId: 'Invalid UUID format' }
    };
    return new Response(JSON.stringify(response), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const flatId = flatIdValidation.data;

  // Parse and validate query parameters
  const url = new URL(request.url);
  const queryParams = {
    month: url.searchParams.get('month'),
    year: url.searchParams.get('year'),
    is_paid: url.searchParams.get('is_paid')
  };

  const queryValidation = PaymentsQuerySchema.safeParse(queryParams);
  if (!queryValidation.success) {
    const errors = queryValidation.error.flatten().fieldErrors;
    const details: Record<string, string> = {};
    
    for (const [field, messages] of Object.entries(errors)) {
      if (messages && messages.length > 0) {
        details[field] = messages[0];
      }
    }

    const response: ValidationErrorResponseDto = {
      error: 'Validation failed',
      details
    };
    return new Response(JSON.stringify(response), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Verify flat ownership
    const flatExists = await verifyFlatOwnership(supabase, flatId);
    if (!flatExists) {
      const response: ErrorResponseDto = { error: 'Flat not found' };
      return new Response(JSON.stringify(response), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch payments with filters
    const payments = await getPaymentsByFlatId(
      supabase,
      flatId,
      queryValidation.data
    );

    const response: PaymentsResponseDto = { payments };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in GET /api/flats/:flatId/payments:', {
      flatId,
      error,
      userId: user.id
    });

    const response: ErrorResponseDto = { error: 'Internal server error' };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

**Key Implementation Details:**
- Use `locals.supabase` from middleware (never import client directly)
- Validate all inputs before processing
- Verify flat ownership before querying payments
- Handle all error cases with appropriate status codes
- Log errors server-side with context
- Return consistent JSON responses

---

### Step 5: Add Database Indexes (if not exist)
**File**: `supabase/migrations/[timestamp]_add_payments_indexes.sql`

```sql
-- Index for filtering by month and year
CREATE INDEX IF NOT EXISTS idx_payments_month_year 
ON payments(year DESC, month DESC);

-- Index for filtering by payment status
CREATE INDEX IF NOT EXISTS idx_payments_is_paid 
ON payments(is_paid);

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_payments_type_status 
ON payments(payment_type_id, is_paid, year DESC, month DESC);
```

**Purpose**:
- Optimize filtering by month/year
- Speed up default unpaid filter
- Support combined filters with payment type

---

### Step 6: Testing Checklist

**Unit Tests** (if implementing tests):
- [ ] PaymentsQuerySchema validates correct inputs
- [ ] PaymentsQuerySchema rejects invalid months (0, 13, -1)
- [ ] PaymentsQuerySchema rejects invalid years (1899, 2101)
- [ ] PaymentsQuerySchema coerces string to number correctly
- [ ] FlatIdSchema validates UUID format
- [ ] verifyFlatOwnership returns true for owned flats
- [ ] verifyFlatOwnership returns false for non-existent flats
- [ ] getPaymentsByFlatId applies filters correctly
- [ ] getPaymentsByFlatId returns empty array when no results

**Integration Tests**:
- [ ] GET with no filters returns unpaid payments only
- [ ] GET with month filter returns correct payments
- [ ] GET with year filter returns correct payments
- [ ] GET with is_paid=true returns paid payments
- [ ] GET with combined filters works correctly
- [ ] GET returns payments sorted by year DESC, month DESC
- [ ] GET includes payment_type_name in response
- [ ] GET returns 400 for invalid query parameters
- [ ] GET returns 400 for invalid UUID
- [ ] GET returns 401 for unauthenticated requests
- [ ] GET returns 404 for non-existent flat
- [ ] GET returns 404 for flat owned by different user
- [ ] GET returns empty array when no payments exist
- [ ] GET respects RLS policies

**Manual Testing**:
- [ ] Test with Postman/Insomnia
- [ ] Verify response matches OpenAPI spec
- [ ] Test error messages are user-friendly
- [ ] Verify logging captures errors correctly
- [ ] Test with different user accounts (RLS verification)

---

### Step 7: Documentation

**Update API Documentation**:
- Document endpoint in README or API docs
- Include example requests and responses
- Document all query parameters
- Document all error responses

**Code Comments**:
- Add JSDoc comments to service functions
- Document complex query logic
- Explain business rules in comments

---



## Summary

This implementation plan provides a comprehensive guide for implementing the `GET /api/flats/:flatId/payments` endpoint. The plan ensures:

✅ **Security**: RLS-enforced authorization, input validation, SQL injection prevention  
✅ **Performance**: Optimized queries with proper indexes, efficient joins  
✅ **Error Handling**: Comprehensive error scenarios with user-friendly messages  
✅ **Type Safety**: Full TypeScript typing with Zod validation  
✅ **Maintainability**: Service layer separation, clear code structure  
✅ **Testability**: Unit and integration testing checkpoints  
✅ **Scalability**: Foundation for future enhancements (pagination, caching)  

The implementation follows all coding practices from the copilot-instructions.md and aligns with the tech stack requirements.

