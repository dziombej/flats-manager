import type { APIRoute } from "astro";
import type { MarkPaidResponseDto } from "../../../../types";
import { FlatsService } from "../../../../lib/services/flats.service";

/**
 * POST /api/payments/:id/mark-paid
 * Marks a payment as paid
 * Auth Required: Yes
 */
export const prerender = false;

/**
 * POST handler - Marks a payment as paid
 */
export const POST: APIRoute = async ({ params, locals }) => {
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

