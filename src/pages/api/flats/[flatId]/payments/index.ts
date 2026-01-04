import type { APIRoute } from "astro";
import { z } from "zod";
import type { PaymentsResponseDto, PaymentWithTypeNameDto, ValidationErrorResponseDto } from "../../../../../types";

/**
 * GET /api/flats/:flatId/payments
 * Returns all payments for a specific flat with optional filters
 * Auth Required: Yes (mocked)
 */
export const prerender = false;

// Validation schema for query parameters
const paymentsQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  is_paid: z.enum(["true", "false"]).optional(),
});

// Mock data store
const mockPayments: PaymentWithTypeNameDto[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    payment_type_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    payment_type_name: "Czynsz",
    amount: 1000.0,
    month: 3,
    year: 2024,
    is_paid: false,
    paid_at: null,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "b2c3d4e5-f6g7-8901-bcde-f12345678901",
    payment_type_id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    payment_type_name: "Administracja",
    amount: 200.0,
    month: 3,
    year: 2024,
    is_paid: false,
    paid_at: null,
    created_at: "2024-01-15T10:35:00Z",
    updated_at: "2024-01-15T10:35:00Z",
  },
  {
    id: "c3d4e5f6-g7h8-9012-cdef-123456789012",
    payment_type_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    payment_type_name: "Czynsz",
    amount: 1000.0,
    month: 4,
    year: 2024,
    is_paid: true,
    paid_at: "2024-04-05T14:30:00Z",
    created_at: "2024-02-15T10:30:00Z",
    updated_at: "2024-04-05T14:30:00Z",
  },
];

/**
 * GET handler - Returns all payments for a specific flat with filters
 */
export const GET: APIRoute = async ({ params, url }) => {
  try {
    const { flatId } = params;

    // Validate flatId parameter
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

    // Filter payments based on query parameters
    let filteredPayments = mockPayments;

    if (validation.data.month !== undefined) {
      filteredPayments = filteredPayments.filter((p) => p.month === validation.data.month);
    }

    if (validation.data.year !== undefined) {
      filteredPayments = filteredPayments.filter((p) => p.year === validation.data.year);
    }

    if (validation.data.is_paid !== undefined) {
      const isPaidBool = validation.data.is_paid === "true";
      filteredPayments = filteredPayments.filter((p) => p.is_paid === isPaidBool);
    } else {
      // Default: unpaid only
      filteredPayments = filteredPayments.filter((p) => !p.is_paid);
    }

    const response: PaymentsResponseDto = {
      payments: filteredPayments,
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
