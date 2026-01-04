import type { APIRoute } from "astro";
import { z } from "zod";
import type { PaymentTypeDto, UpdatePaymentTypeCommand, ValidationErrorResponseDto } from "../../../types";

/**
 * PUT /api/payment-types/:id
 * Updates a specific payment type
 * Auth Required: Yes (mocked)
 */
export const prerender = false;

// Validation schema for updating a payment type
const updatePaymentTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  base_amount: z
    .number()
    .min(0, "Base amount must be non-negative")
    .max(999999.99, "Base amount must be less than 1,000,000"),
});

// Mock data store - shared with payment-types/index.ts in real implementation
const mockPaymentTypes = new Map<string, PaymentTypeDto>([
  [
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    {
      id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      flat_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Czynsz",
      base_amount: 1000.0,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    },
  ],
  [
    "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    {
      id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      flat_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Administracja",
      base_amount: 200.0,
      created_at: "2024-01-15T10:35:00Z",
      updated_at: "2024-01-15T10:35:00Z",
    },
  ],
  [
    "8d9e6679-7425-40de-944b-e07fc1f90ae8",
    {
      id: "8d9e6679-7425-40de-944b-e07fc1f90ae8",
      flat_id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      name: "Czynsz",
      base_amount: 1200.0,
      created_at: "2024-01-16T11:00:00Z",
      updated_at: "2024-01-16T11:00:00Z",
    },
  ],
]);

/**
 * PUT handler - Updates a specific payment type
 */
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;

    // Validate ID parameter
    if (!id) {
      return new Response(JSON.stringify({ error: "Payment type ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if payment type exists
    const existingPaymentType = mockPaymentTypes.get(id);
    if (!existingPaymentType) {
      return new Response(JSON.stringify({ error: "Payment type not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse request body
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

    // Update payment type
    const updatedPaymentType: PaymentTypeDto = {
      ...existingPaymentType,
      name: command.name,
      base_amount: command.base_amount,
      updated_at: new Date().toISOString(),
    };

    // Update in mock store
    mockPaymentTypes.set(id, updatedPaymentType);

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
