import type { APIRoute } from "astro";
import { z } from "zod";
import { FlatsService } from "../../../lib/services/flats.service";
import type { UpdateFlatCommand, ValidationErrorResponseDto, DeleteFlatResponseDto } from "../../../types";

/**
 * GET /api/flats/:id
 * Returns a single flat by ID
 * Auth Required: Yes
 *
 * PUT /api/flats/:id
 * Updates a flat
 * Auth Required: Yes
 *
 * DELETE /api/flats/:id
 * Deletes a flat
 * Auth Required: Yes
 */
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

  // Validate flat ID
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
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * PUT handler - Updates a flat
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

  // Validate flat ID
  if (!params.id) {
    return new Response(JSON.stringify({ error: "Flat ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
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

    // Update flat using service
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
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * DELETE handler - Deletes a flat
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
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

  // Validate flat ID
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
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
