# API Endpoints Implementation Plan

This document contains implementation details for all API endpoints. All endpoints use Supabase for data persistence and authentication.

## Table of Contents

1. [GET /api/dashboard](#1-get-apidashboard)
2. [GET /api/flats](#2-get-apiflats)
3. [GET /api/flats/:id](#3-get-apiflatsid)
4. [POST /api/flats](#4-post-apiflats)
5. [PUT /api/flats/:id](#5-put-apiflatsid)
6. [DELETE /api/flats/:id](#6-delete-apiflatsid)
7. [GET /api/flats/:flatId/payment-types](#7-get-apiflatsflatidpayment-types)
8. [POST /api/flats/:flatId/payment-types](#8-post-apiflatsflatidpayment-types)
9. [PUT /api/payment-types/:id](#9-put-apipayment-typesid)
10. [GET /api/flats/:flatId/payments](#10-get-apiflatsflatidpayments)
11. [POST /api/flats/:flatId/payments/generate](#11-post-apiflatsflatidpaymentsgenerate)
12. [POST /api/payments/:id/mark-paid](#12-post-apipaymentsidmark-paid)

---

# 1. GET /api/dashboard

**Endpoint:** `GET /api/dashboard`  
**Auth Required:** Yes

## Request
```
GET /api/dashboard
```

## Response (200 OK)
```json
{
  "flats": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "name": "Mokotów 2",
      "address": "ul. Puławska 2",
      "debt": 0.00,
      "created_at": "2024-01-16T11:00:00Z",
      "updated_at": "2024-01-16T11:00:00Z"
    },
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "user_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "name": "Żoliborz 1",
      "address": "ul. Słowackiego 1",
      "debt": 1200.00,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Implementation

**File:** `src/pages/api/dashboard.ts`

```typescript
import type { APIRoute } from "astro";
import type { DashboardResponseDto } from "../../types";
import { FlatsService } from "../../lib/services/flats.service";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const supabase = locals.supabase;

  if (!supabase) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const flatsService = new FlatsService(supabase);
    const flats = await flatsService.getFlatsWithDebt(user.id);

    const response: DashboardResponseDto = {
      flats,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/dashboard:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

**Key Features:**
- Uses Supabase authentication via `locals.supabase`
- Retrieves flats with calculated debt using `FlatsService.getFlatsWithDebt()`
- Debt is calculated by summing unpaid payments across payment types
- Returns only flats owned by the authenticated user
- Note: Response does not include `user_id` field for security

---

# 2. GET /api/flats

**Endpoint:** `GET /api/flats`  
**Auth Required:** Yes

## Request
```
GET /api/flats
```

## Response (200 OK)
```json
{
  "flats": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "name": "Żoliborz 1",
      "address": "ul. Słowackiego 1",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Implementation

**File:** `src/pages/api/flats/index.ts`

```typescript
import type { APIRoute } from "astro";
import { z } from "zod";
import type { FlatsResponseDto, CreateFlatCommand, ValidationErrorResponseDto } from "../../../types";
import { FlatsService } from "../../../lib/services/flats.service";

export const prerender = false;

// Validation schema for creating a flat
const createFlatSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  address: z.string().min(1, "Address is required").max(200, "Address must be at most 200 characters"),
});

/**
 * GET handler - Returns all flats for the current user
 */
export const GET: APIRoute = async ({ locals }) => {
  const supabase = locals.supabase;

  if (!supabase) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const flatsService = new FlatsService(supabase);
    const flats = await flatsService.getAllFlats(user.id);
    const response: FlatsResponseDto = {
      flats,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/flats:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * POST handler - Creates a new flat
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;

  if (!supabase) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate request body
    const validation = createFlatSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message;
        }
      });

      const errorResponse: ValidationErrorResponseDto = {
        error: "Validation failed",
        details: errors,
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const command: CreateFlatCommand = validation.data;

    const flatsService = new FlatsService(supabase);
    const newFlat = await flatsService.createFlat(user.id, command);

    return new Response(JSON.stringify(newFlat), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/flats:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

**Key Features:**
- GET: Fetches all flats for authenticated user via `FlatsService.getAllFlats()`
- POST: Creates new flat with Zod validation
- Uses Supabase for data persistence
- Proper error handling and validation feedback

---

# 3. GET /api/flats/:id

**Endpoint:** `GET /api/flats/:id`  
**Auth Required:** Yes

## Request
```
GET /api/flats/550e8400-e29b-41d4-a716-446655440000
```

## Response (200 OK)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "name": "Żoliborz 1",
  "address": "ul. Słowackiego 1",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

## Response (404 Not Found)
```json
{
  "error": "Flat not found"
}
```

## Implementation

**File:** `src/pages/api/flats/[id].ts`

```typescript
import type { APIRoute } from "astro";
import { z } from "zod";
import { FlatsService } from "../../../lib/services/flats.service";
import type { UpdateFlatCommand, ValidationErrorResponseDto, DeleteFlatResponseDto } from "../../../types";

export const prerender = false;

// Validation schema for updating a flat
const updateFlatSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  address: z.string().min(1, "Address is required").max(200, "Address must be at most 200 characters"),
});

export const GET: APIRoute = async ({ params, locals }) => {
  const supabase = locals.supabase;

  if (!supabase) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!params.id) {
    return new Response(JSON.stringify({ error: "Flat ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const flatsService = new FlatsService(supabase);
    const flat = await flatsService.getFlatById(params.id, user.id);

    if (!flat) {
      return new Response(JSON.stringify({ error: "Flat not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(flat), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/flats/:id:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const supabase = locals.supabase;

  if (!supabase) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!params.id) {
    return new Response(JSON.stringify({ error: "Flat ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const validation = updateFlatSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message;
        }
      });

      const errorResponse: ValidationErrorResponseDto = {
        error: "Validation failed",
        details: errors,
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const command: UpdateFlatCommand = validation.data;

    const flatsService = new FlatsService(supabase);
    const updatedFlat = await flatsService.updateFlat(params.id, user.id, command);

    if (!updatedFlat) {
      return new Response(JSON.stringify({ error: "Flat not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(updatedFlat), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in PUT /api/flats/:id:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const supabase = locals.supabase;

  if (!supabase) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!params.id) {
    return new Response(JSON.stringify({ error: "Flat ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const flatsService = new FlatsService(supabase);
    const deleted = await flatsService.deleteFlat(params.id, user.id);

    if (!deleted) {
      return new Response(JSON.stringify({ error: "Flat not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response: DeleteFlatResponseDto = {
      message: "Flat deleted successfully",
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in DELETE /api/flats/:id:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

**Key Features:**
- GET: Retrieves single flat by ID via `FlatsService.getFlatById()`
- PUT: Updates flat with Zod validation
- DELETE: Deletes flat and returns success message
- All operations verify user ownership
- Comprehensive error handling

---

# 4. POST /api/flats

See implementation in [GET /api/flats](#2-get-apiflats)

---

# 5. PUT /api/flats/:id

See implementation in [GET /api/flats/:id](#3-get-apiflatsid)

---

# 6. DELETE /api/flats/:id

See implementation in [GET /api/flats/:id](#3-get-apiflatsid)

---

# 7. GET /api/flats/:flatId/payment-types

**Endpoint:** `GET /api/flats/:flatId/payment-types`  
**Auth Required:** Yes

## Request
```
GET /api/flats/550e8400-e29b-41d4-a716-446655440000/payment-types
```

## Response (200 OK)
```json
{
  "payment_types": [
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "flat_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Czynsz",
      "base_amount": 1000.00,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "flat_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Administracja",
      "base_amount": 200.00,
      "created_at": "2024-01-15T10:35:00Z",
      "updated_at": "2024-01-15T10:35:00Z"
    }
  ]
}
```

## Implementation

**File:** `src/pages/api/flats/[flatId]/payment-types/index.ts`

```typescript
import type { APIRoute } from "astro";
import { z } from "zod";
import type {
  PaymentTypesResponseDto,
  CreatePaymentTypeCommand,
  ValidationErrorResponseDto,
} from "../../../../../types";
import { FlatsService } from "../../../../../lib/services/flats.service";

export const prerender = false;

// Validation schema for creating a payment type
const createPaymentTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  base_amount: z
    .number()
    .min(0, "Base amount must be non-negative")
    .max(999999.99, "Base amount must be less than 1,000,000"),
});

export const GET: APIRoute = async ({ params, locals }) => {
  const supabase = locals.supabase;

  if (!supabase) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { flatId } = params;

    if (!flatId) {
      return new Response(JSON.stringify({ error: "Flat ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const flatsService = new FlatsService(supabase);
    const paymentTypes = await flatsService.getPaymentTypes(flatId, user.id);

    const response: PaymentTypesResponseDto = {
      payment_types: paymentTypes,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/flats/:flatId/payment-types:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  const supabase = locals.supabase;

  if (!supabase) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { flatId } = params;

    if (!flatId) {
      return new Response(JSON.stringify({ error: "Flat ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const validation = createPaymentTypeSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message;
        }
      });

      const errorResponse: ValidationErrorResponseDto = {
        error: "Validation failed",
        details: errors,
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const command: CreatePaymentTypeCommand = validation.data;

    const flatsService = new FlatsService(supabase);
    const newPaymentType = await flatsService.createPaymentType(flatId, user.id, command);

    if (!newPaymentType) {
      return new Response(JSON.stringify({ error: "Flat not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(newPaymentType), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/flats/:flatId/payment-types:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

**Key Features:**
- GET: Retrieves all payment types for a specific flat
- POST: Creates new payment type with Zod validation (name and base_amount)
- Verifies flat ownership before operations
- Returns 404 if flat not found

---

# 8. POST /api/flats/:flatId/payment-types

See implementation in [GET /api/flats/:flatId/payment-types](#7-get-apiflatsflatidpayment-types)

---

# 9. PUT /api/payment-types/:id

**Endpoint:** `PUT /api/payment-types/:id`  
**Auth Required:** Yes

## Request
```
PUT /api/payment-types/6ba7b810-9dad-11d1-80b4-00c04fd430c8
Content-Type: application/json

{
  "name": "Czynsz Updated",
  "base_amount": 1100.00
}
```

## Response (200 OK)
```json
{
  "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "flat_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Czynsz Updated",
  "base_amount": 1100.00,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T12:00:00Z"
}
```

## Implementation

**File:** `src/pages/api/payment-types/[id].ts`

```typescript
import type { APIRoute } from "astro";
import { z } from "zod";
import type { UpdatePaymentTypeCommand, ValidationErrorResponseDto } from "../../../types";
import { FlatsService } from "../../../lib/services/flats.service";

export const prerender = false;

// Validation schema for updating a payment type
const updatePaymentTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  base_amount: z
    .number()
    .min(0, "Base amount must be non-negative")
    .max(999999.99, "Base amount must be less than 1,000,000"),
});

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const supabase = locals.supabase;

  if (!supabase) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: "Payment type ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const validation = updatePaymentTypeSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message;
        }
      });

      const errorResponse: ValidationErrorResponseDto = {
        error: "Validation failed",
        details: errors,
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const command: UpdatePaymentTypeCommand = validation.data;

    const flatsService = new FlatsService(supabase);
    const updatedPaymentType = await flatsService.updatePaymentType(id, user.id, command);

    if (!updatedPaymentType) {
      return new Response(JSON.stringify({ error: "Payment type not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(updatedPaymentType), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in PUT /api/payment-types/:id:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

**Key Features:**
- Updates payment type with Zod validation
- Verifies user owns the flat associated with the payment type
- Returns 404 if payment type not found or not owned by user

---

# 10. GET /api/flats/:flatId/payments

**Endpoint:** `GET /api/flats/:flatId/payments`  
**Auth Required:** Yes

## Request
```
GET /api/flats/550e8400-e29b-41d4-a716-446655440000/payments
GET /api/flats/550e8400-e29b-41d4-a716-446655440000/payments?month=3&year=2024
GET /api/flats/550e8400-e29b-41d4-a716-446655440000/payments?is_paid=true
```

## Query Parameters
- `month` (optional): Filter by month (1-12)
- `year` (optional): Filter by year
- `is_paid` (optional): Filter by payment status (default: false)

## Response (200 OK)
```json
{
  "payments": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
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
      "id": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
      "payment_type_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
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

## Implementation

**File:** `src/pages/api/flats/[flatId]/payments/index.ts`

```typescript
import type { APIRoute } from "astro";
import { z } from "zod";
import type { PaymentsResponseDto, ValidationErrorResponseDto } from "../../../../../types";
import { FlatsService } from "../../../../../lib/services/flats.service";

export const prerender = false;

// Validation schema for query parameters
const paymentsQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  is_paid: z.enum(["true", "false"]).optional(),
});

export const GET: APIRoute = async ({ params, url, locals }) => {
  const supabase = locals.supabase;

  if (!supabase) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { flatId } = params;

    if (!flatId) {
      return new Response(JSON.stringify({ error: "Flat ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse query parameters
    const queryParams = {
      month: url.searchParams.get("month"),
      year: url.searchParams.get("year"),
      is_paid: url.searchParams.get("is_paid"),
    };

    // Validate query parameters
    const validation = paymentsQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message;
        }
      });

      const errorResponse: ValidationErrorResponseDto = {
        error: "Invalid query parameters",
        details: errors,
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build filters
    const filters: { month?: number; year?: number; is_paid?: boolean } = {};

    if (validation.data.month !== undefined) {
      filters.month = validation.data.month;
    }

    if (validation.data.year !== undefined) {
      filters.year = validation.data.year;
    }

    if (validation.data.is_paid !== undefined) {
      filters.is_paid = validation.data.is_paid === "true";
    } else {
      // Default: unpaid only
      filters.is_paid = false;
    }

    const flatsService = new FlatsService(supabase);
    const payments = await flatsService.getPayments(flatId, user.id, filters);

    const response: PaymentsResponseDto = {
      payments,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/flats/:flatId/payments:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

**Key Features:**
- Retrieves payments for a specific flat with optional filters
- Query parameters validated with Zod (month, year, is_paid)
- Default behavior: returns unpaid payments only
- Payments include payment_type_name from joined query
- Verifies flat ownership

---

# 11. POST /api/flats/:flatId/payments/generate

**Endpoint:** `POST /api/flats/:flatId/payments/generate`  
**Auth Required:** Yes

## Request
```
POST /api/flats/550e8400-e29b-41d4-a716-446655440000/payments/generate
Content-Type: application/json

{
  "month": 1,
  "year": 2024
}
```

## Response (201 Created)
```json
{
  "message": "Payments generated successfully",
  "generated_count": 2,
  "skipped_count": 0,
  "month": 1,
  "year": 2024,
  "payments": [
    {
      "id": "new-payment-id-1",
      "payment_type_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "payment_type_name": "Czynsz",
      "amount": 1000.00,
      "month": 1,
      "year": 2024,
      "is_paid": false,
      "paid_at": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "new-payment-id-2",
      "payment_type_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "payment_type_name": "Administracja",
      "amount": 200.00,
      "month": 1,
      "year": 2024,
      "is_paid": false,
      "paid_at": null,
      "created_at": "2024-01-15T10:35:00Z",
      "updated_at": "2024-01-15T10:35:00Z"
    }
  ]
}
```

## Response (400 Bad Request)
```json
{
  "error": "No payment types found for this flat. Create payment types first."
}
```

## Implementation

**File:** `src/pages/api/flats/[flatId]/payments/generate.ts`

```typescript
import type { APIRoute } from "astro";
import { z } from "zod";
import type {
  GeneratePaymentsCommand,
  GeneratePaymentsResponseDto,
  ValidationErrorResponseDto,
} from "../../../../../types";
import { FlatsService } from "../../../../../lib/services/flats.service";

export const prerender = false;

// Validation schema for generating payments
const generatePaymentsSchema = z.object({
  month: z.number().int().min(1, "Month must be between 1 and 12").max(12, "Month must be between 1 and 12"),
  year: z
    .number()
    .int()
    .min(1900, "Year must be between 1900 and 2100")
    .max(2100, "Year must be between 1900 and 2100"),
});

export const POST: APIRoute = async ({ params, request, locals }) => {
  const supabase = locals.supabase;

  if (!supabase) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { flatId } = params;

    if (!flatId) {
      return new Response(JSON.stringify({ error: "Flat ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const validation = generatePaymentsSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message;
        }
      });

      const errorResponse: ValidationErrorResponseDto = {
        error: "Validation failed",
        details: errors,
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const command: GeneratePaymentsCommand = validation.data;

    const flatsService = new FlatsService(supabase);
    const generatedPayments = await flatsService.generatePayments(flatId, user.id, command);

    if (generatedPayments === null) {
      return new Response(JSON.stringify({ error: "Flat not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (generatedPayments.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No payment types found for this flat. Create payment types first.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const response: GeneratePaymentsResponseDto = {
      message: "Payments generated successfully",
      generated_count: generatedPayments.length,
      month: command.month,
      year: command.year,
      payments: generatedPayments,
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/flats/:flatId/payments/generate:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

**Key Features:**
- Generates monthly payments for all payment types in a flat
- Validates month (1-12) and year (1900-2100) with Zod
- Creates one payment per payment type for the specified month/year
- Returns 400 if no payment types exist for the flat
- Returns 404 if flat not found
- Note: Response does not include skipped_count as duplicates are prevented at database level

---

# 12. POST /api/payments/:id/mark-paid

**Endpoint:** `POST /api/payments/:id/mark-paid`  
**Auth Required:** Yes

## Request
```
POST /api/payments/a1b2c3d4-e5f6-7890-abcd-ef1234567890/mark-paid
```

## Response (200 OK)
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "payment_type_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "amount": 1000.00,
  "month": 1,
  "year": 2024,
  "is_paid": true,
  "paid_at": "2024-01-20T14:30:00Z",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:30:00Z"
}
```

## Response (400 Bad Request)
```json
{
  "error": "Payment is already marked as paid"
}
```

## Response (404 Not Found)
```json
{
  "error": "Payment not found"
}
```

## Implementation

**File:** `src/pages/api/payments/[id]/mark-paid.ts`

```typescript
import type { APIRoute } from "astro";
import type { MarkPaidResponseDto } from "../../../../types";
import { FlatsService } from "../../../../lib/services/flats.service";

export const prerender = false;

export const POST: APIRoute = async ({ params, locals }) => {
  const supabase = locals.supabase;

  if (!supabase) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: "Payment ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const flatsService = new FlatsService(supabase);
    const updatedPayment = await flatsService.markPaymentAsPaid(id, user.id);

    if (!updatedPayment) {
      return new Response(JSON.stringify({ error: "Payment not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response: MarkPaidResponseDto = updatedPayment;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/payments/:id/mark-paid:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

**Key Features:**
- Marks a payment as paid by setting is_paid to true and paid_at to current timestamp
- Verifies user owns the flat associated with the payment
- Returns updated payment object
- Returns 404 if payment not found or not owned by user

---

## Quick Reference

### All Endpoints Summary

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | GET | `/api/dashboard` | Get all flats with debt |
| 2 | GET | `/api/flats` | List all flats |
| 3 | GET | `/api/flats/:id` | Get single flat |
| 4 | POST | `/api/flats` | Create flat |
| 5 | PUT | `/api/flats/:id` | Update flat |
| 6 | DELETE | `/api/flats/:id` | Delete flat |
| 7 | GET | `/api/flats/:flatId/payment-types` | List payment types |
| 8 | POST | `/api/flats/:flatId/payment-types` | Create payment type |
| 9 | PUT | `/api/payment-types/:id` | Update payment type |
| 10 | GET | `/api/flats/:flatId/payments` | List payments (with filters) |
| 11 | POST | `/api/flats/:flatId/payments/generate` | Generate monthly payments |
| 12 | POST | `/api/payments/:id/mark-paid` | Mark payment as paid |

### Common Error Responses

**401 Unauthorized**
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found**
```json
{
  "error": "Resource not found"
}
```

**400 Bad Request**
```json
{
  "error": "Validation failed",
  "details": {
    "field_name": "Error message"
  }
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error"
}
```

---

## Implementation Notes

### Architecture
- All endpoints use **Supabase** for data persistence and authentication
- Business logic is centralized in **FlatsService** (`src/lib/services/flats.service.ts`)
- All requests require authentication via Supabase session
- User ownership is verified on all operations

### Authentication
- Authentication handled via `locals.supabase` from Astro middleware
- User session validated using `supabase.auth.getUser()`
- Returns 401 Unauthorized if no valid session

### Validation
- Request body validation using **Zod** schemas
- Field-level error messages returned for validation failures
- Query parameter validation for GET requests with filters

### Error Handling
- Comprehensive error handling with try-catch blocks
- Consistent error response format
- Console logging for debugging (e.g., `console.error`)
- HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Internal Server Error)

### Security
- Row Level Security (RLS) enabled in Supabase
- User can only access their own flats and related data
- UUID validation to prevent injection attacks
- All mutations verify ownership before modification

### Service Layer
**FlatsService** methods:
- `getFlatsWithDebt(userId)` - Dashboard flats with calculated debt
- `getAllFlats(userId)` - All user's flats
- `getFlatById(flatId, userId)` - Single flat by ID
- `createFlat(userId, command)` - Create new flat
- `updateFlat(flatId, userId, command)` - Update flat
- `deleteFlat(flatId, userId)` - Delete flat
- `getPaymentTypes(flatId, userId)` - Payment types for flat
- `createPaymentType(flatId, userId, command)` - Create payment type
- `updatePaymentType(id, userId, command)` - Update payment type
- `getPayments(flatId, userId, filters)` - Payments with filters
- `generatePayments(flatId, userId, command)` - Generate monthly payments
- `markPaymentAsPaid(paymentId, userId)` - Mark payment as paid

### Data Flow
1. Request received by Astro API route
2. Authentication check via Supabase
3. Request validation with Zod
4. Business logic execution via FlatsService
5. Database operation via Supabase client
6. Response formatting and return

### TypeScript Types
- All DTOs defined in `src/types.ts`
- Database types auto-generated from Supabase schema
- Type safety enforced throughout the application


