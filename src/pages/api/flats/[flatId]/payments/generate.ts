import type { APIRoute } from "astro";
import { z } from "zod";
import type {
  GeneratePaymentsCommand,
  GeneratePaymentsResponseDto,
  ValidationErrorResponseDto,
} from "../../../../../types";
import { FlatsService } from "../../../../../lib/services/flats.service";

/**
 * POST /api/flats/:flatId/payments/generate
 * Generates monthly payments for all payment types in a flat
 * Auth Required: Yes
 */
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

/**
 * POST handler - Generates monthly payments for all payment types
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
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate request body
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
