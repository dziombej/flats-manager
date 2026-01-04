import type { APIRoute } from "astro";
import type { DashboardResponseDto } from "../../types";
import { FlatsService } from "../../lib/services/flats.service";

/**
 * GET /api/dashboard
 * Returns all flats with calculated debt for the current user
 * Auth Required: Yes
 */
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
    // Handle unexpected errors
    console.error("Error in GET /api/dashboard:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
