# API Endpoints Implementation Plan (Mocked)

This document contains implementation plans for all API endpoints using mocked data responses. Use this for frontend development before backend is ready.

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
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  // Mock data
  const mockFlats = [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      name: "Mokotów 2",
      address: "ul. Puławska 2",
      debt: 0.00,
      created_at: "2024-01-16T11:00:00Z",
      updated_at: "2024-01-16T11:00:00Z"
    },
    {
      id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      name: "Żoliborz 1",
      address: "ul. Słowackiego 1",
      debt: 1200.00,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    }
  ];

  return new Response(JSON.stringify({ flats: mockFlats }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

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
import type { APIRoute } from 'astro';

export const prerender = false;

const mockFlats = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    name: "Żoliborz 1",
    address: "ul. Słowackiego 1",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  }
];

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ flats: mockFlats }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  
  const newFlat = {
    id: crypto.randomUUID(),
    user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    name: body.name,
    address: body.address,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return new Response(JSON.stringify(newFlat), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

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
import type { APIRoute } from 'astro';

export const prerender = false;

const mockFlat = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  name: "Żoliborz 1",
  address: "ul. Słowackiego 1",
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-15T10:30:00Z"
};

export const GET: APIRoute = async ({ params }) => {
  if (params.id === mockFlat.id) {
    return new Response(JSON.stringify(mockFlat), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: "Flat not found" }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const body = await request.json();
  
  if (params.id === mockFlat.id) {
    const updatedFlat = {
      ...mockFlat,
      name: body.name,
      address: body.address,
      updated_at: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(updatedFlat), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: "Flat not found" }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const DELETE: APIRoute = async ({ params }) => {
  if (params.id === mockFlat.id) {
    return new Response(JSON.stringify({ message: "Flat deleted successfully" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: "Flat not found" }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

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
import type { APIRoute } from 'astro';

export const prerender = false;

const mockPaymentTypes = [
  {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    flat_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Czynsz",
    base_amount: 1000.00,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  },
  {
    id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    flat_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Administracja",
    base_amount: 200.00,
    created_at: "2024-01-15T10:35:00Z",
    updated_at: "2024-01-15T10:35:00Z"
  }
];

export const GET: APIRoute = async ({ params }) => {
  const filteredTypes = mockPaymentTypes.filter(pt => pt.flat_id === params.flatId);
  
  return new Response(JSON.stringify({ payment_types: filteredTypes }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ params, request }) => {
  const body = await request.json();
  
  const newPaymentType = {
    id: crypto.randomUUID(),
    flat_id: params.flatId as string,
    name: body.name,
    base_amount: body.base_amount,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return new Response(JSON.stringify(newPaymentType), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

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
import type { APIRoute } from 'astro';

export const prerender = false;

const mockPaymentType = {
  id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  flat_id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Czynsz",
  base_amount: 1000.00,
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-15T10:30:00Z"
};

export const PUT: APIRoute = async ({ params, request }) => {
  const body = await request.json();
  
  if (params.id === mockPaymentType.id) {
    const updatedPaymentType = {
      ...mockPaymentType,
      name: body.name,
      base_amount: body.base_amount,
      updated_at: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(updatedPaymentType), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: "Payment type not found" }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

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
import type { APIRoute } from 'astro';

export const prerender = false;

const mockPayments = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    payment_type_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    payment_type_name: "Czynsz",
    amount: 1000.00,
    month: 3,
    year: 2024,
    is_paid: false,
    paid_at: null,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  },
  {
    id: "b2c3d4e5-f6g7-8901-bcde-f12345678901",
    payment_type_id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    payment_type_name: "Administracja",
    amount: 200.00,
    month: 3,
    year: 2024,
    is_paid: false,
    paid_at: null,
    created_at: "2024-01-15T10:35:00Z",
    updated_at: "2024-01-15T10:35:00Z"
  },
  {
    id: "c3d4e5f6-g7h8-9012-cdef-123456789012",
    payment_type_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    payment_type_name: "Czynsz",
    amount: 1000.00,
    month: 4,
    year: 2024,
    is_paid: true,
    paid_at: "2024-04-05T14:30:00Z",
    created_at: "2024-02-15T10:30:00Z",
    updated_at: "2024-04-05T14:30:00Z"
  }
];

export const GET: APIRoute = async ({ params, url }) => {
  const month = url.searchParams.get('month');
  const year = url.searchParams.get('year');
  const isPaid = url.searchParams.get('is_paid');

  let filteredPayments = mockPayments;

  if (month) {
    filteredPayments = filteredPayments.filter(p => p.month === parseInt(month));
  }

  if (year) {
    filteredPayments = filteredPayments.filter(p => p.year === parseInt(year));
  }

  if (isPaid !== null) {
    const isPaidBool = isPaid === 'true';
    filteredPayments = filteredPayments.filter(p => p.is_paid === isPaidBool);
  } else {
    // Default: unpaid only
    filteredPayments = filteredPayments.filter(p => !p.is_paid);
  }

  return new Response(JSON.stringify({ payments: filteredPayments }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

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

## Response (409 Conflict)
```json
{
  "error": "Some payments already exist for this period",
  "generated_count": 1,
  "skipped_count": 1
}
```

## Implementation

**File:** `src/pages/api/flats/[flatId]/payments/generate.ts`

```typescript
import type { APIRoute } from 'astro';

export const prerender = false;

const mockPaymentTypes = [
  {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    name: "Czynsz",
    base_amount: 1000.00
  },
  {
    id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    name: "Administracja",
    base_amount: 200.00
  }
];

export const POST: APIRoute = async ({ params, request }) => {
  const body = await request.json();
  const { month, year } = body;

  const generatedPayments = mockPaymentTypes.map(pt => ({
    id: crypto.randomUUID(),
    payment_type_id: pt.id,
    payment_type_name: pt.name,
    amount: pt.base_amount,
    month,
    year,
    is_paid: false,
    paid_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  return new Response(JSON.stringify({
    message: "Payments generated successfully",
    generated_count: generatedPayments.length,
    skipped_count: 0,
    month,
    year,
    payments: generatedPayments
  }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

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
import type { APIRoute } from 'astro';

export const prerender = false;

const mockPayment = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  payment_type_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  amount: 1000.00,
  month: 1,
  year: 2024,
  is_paid: false,
  paid_at: null,
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-15T10:30:00Z"
};

export const POST: APIRoute = async ({ params }) => {
  if (params.id !== mockPayment.id) {
    return new Response(JSON.stringify({ error: "Payment not found" }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (mockPayment.is_paid) {
    return new Response(JSON.stringify({ error: "Payment is already marked as paid" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const updatedPayment = {
    ...mockPayment,
    is_paid: true,
    paid_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return new Response(JSON.stringify(updatedPayment), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

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

## Notes

- All endpoints use mocked data for frontend development
- Replace with real Supabase integration when backend is ready
- Authentication is simulated - add real JWT validation in production
- UUIDs are hardcoded in mocks - use actual IDs from your data
- Timestamps are static in responses - adjust as needed for testing

