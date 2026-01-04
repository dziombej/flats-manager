import type { APIRoute } from "astro";
import { z } from "zod";
import type { PaymentsResponseDto, ValidationErrorResponseDto } from "../../../../../types";
import { FlatsService } from "../../../../../lib/services/flats.service";

/**
 * GET /api/flats/:flatId/payments
 * Returns all payments for a specific flat with optional filters
 * Auth Required: Yes
 */
export const prerender = false;

// Validation schema for query parameters
const paymentsQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  is_paid: z.enum(["true", "false"]).optional(),
});

/**
 * GET handler - Returns all payments for a specific flat with filters
 */
export const GET: APIRoute = async ({ params, url, locals }) => {
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

    // Parse query parameters - filter out null values
    const rawQueryParams = {
      month: url.searchParams.get("month"),
      year: url.searchParams.get("year"),
      is_paid: url.searchParams.get("is_paid"),
    };

    // Filter out null values to create clean query params object
    const queryParams: Record<string, string> = {};
    Object.entries(rawQueryParams).forEach(([key, value]) => {
      if (value !== null) {
        queryParams[key] = value;
      }
    });

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
