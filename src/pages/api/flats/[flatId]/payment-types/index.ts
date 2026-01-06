import type { APIRoute } from "astro";
import { z } from "zod";
import type {
  PaymentTypesResponseDto,
  CreatePaymentTypeCommand,
  ValidationErrorResponseDto,
} from "../../../../../types";
import { FlatsService } from "../../../../../lib/services/flats.service";

/**
 * GET /api/flats/:flatId/payment-types
 * Returns all payment types for a specific flat
 * Auth Required: Yes
 *
 * POST /api/flats/:flatId/payment-types
 * Creates a new payment type for a specific flat
 * Auth Required: Yes
 */
export const prerender = false;

// Validation schema for creating a payment type
const createPaymentTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  base_amount: z
    .number()
    .min(0, "Base amount must be non-negative")
    .max(999999.99, "Base amount must be less than 1,000,000"),
});

/**
 * GET handler - Returns all payment types for a specific flat
 */
export const GET: APIRoute = async ({ params, locals }) => {
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
    const { flatId } = params;

    // Validate flatId parameter
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
  } catch {
    console.error("Error in GET /api/flats/:flatId/payment-types:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * POST handler - Creates a new payment type for a specific flat
 */
export const POST: APIRoute = async ({ params, request, locals }) => {
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
    const { flatId } = params;

    // Validate flatId parameter
    if (!flatId) {
      return new Response(JSON.stringify({ error: "Flat ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate request body
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
  } catch {
    console.error("Error in POST /api/flats/:flatId/payment-types:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
