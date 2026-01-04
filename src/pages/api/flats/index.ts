import type { APIRoute } from "astro";
import { z } from "zod";
import type { FlatsResponseDto, CreateFlatCommand, FlatDto, ValidationErrorResponseDto } from "../../../types";
import { FlatsService } from "../../../lib/services/flats.service";

/**
 * GET /api/flats
 * Returns all flats for the current user
 * Auth Required: Yes
 *
 * POST /api/flats
 * Creates a new flat
 * Auth Required: Yes
 */
export const prerender = false;

// Validation schema for creating a flat
const createFlatSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  address: z.string().min(1, "Address is required").max(200, "Address must be at most 200 characters"),
});

/**
 * GET handler - Returns all flats for the current user
 */
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

    const flats = await flatsService.getAllFlats(user.id);
    const response: FlatsResponseDto = {
      flats,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/flats:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * POST handler - Creates a new flat
 */
export const POST: APIRoute = async ({ request }) => {
  try {
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
    const validation = createFlatSchema.safeParse(body);

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

    const command: CreateFlatCommand = validation.data;

    // Create new flat
    const newFlat: FlatDto = {
      id: crypto.randomUUID(),
      user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8", // Mocked user ID
      name: command.name,
      address: command.address,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to mock store
    mockFlats.push(newFlat);

    return new Response(JSON.stringify(newFlat), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/flats:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
