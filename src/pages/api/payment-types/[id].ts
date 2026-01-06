import type { APIRoute } from "astro";
import { z } from "zod";
import type { UpdatePaymentTypeCommand, ValidationErrorResponseDto } from "../../../types";
import { FlatsService } from "../../../lib/services/flats.service";

/**
 * PUT /api/payment-types/:id
 * Updates a specific payment type
 * Auth Required: Yes
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

/**
 * GET handler - Returns a single payment type
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

  // Validate ID parameter
  if (!params.id) {
    return new Response(JSON.stringify({ error: "Payment type ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const flatsService = new FlatsService(supabase);
    const paymentType = await flatsService.getPaymentTypeById(params.id, user.id);

    if (!paymentType) {
      return new Response(JSON.stringify({ error: "Payment type not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(paymentType), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * PUT handler - Updates a specific payment type
 */
export const PUT: APIRoute = async ({ params, request, locals }) => {
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
    const { id } = params;

    // Validate ID parameter
    if (!id) {
      return new Response(JSON.stringify({ error: "Payment type ID is required" }), {
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
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
