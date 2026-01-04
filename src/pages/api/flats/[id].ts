import type { APIRoute } from "astro";
import { z } from "zod";
import type { FlatDto, UpdateFlatCommand, DeleteFlatResponseDto, ValidationErrorResponseDto } from "../../../types";

/**
 * GET /api/flats/:id
 * Returns a specific flat by ID
 * Auth Required: Yes (mocked)
 *
 * PUT /api/flats/:id
 * Updates a specific flat
 * Auth Required: Yes (mocked)
 *
 * DELETE /api/flats/:id
 * Deletes a specific flat
 * Auth Required: Yes (mocked)
 */
export const prerender = false;

// Validation schema for updating a flat
const updateFlatSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  address: z.string().min(1, "Address is required").max(200, "Address must be at most 200 characters"),
});

// Mock data store - shared with index.ts in real implementation
const mockFlats = new Map<string, FlatDto>([
  [
    "550e8400-e29b-41d4-a716-446655440000",
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      name: "Żoliborz 1",
      address: "ul. Słowackiego 1",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    },
  ],
  [
    "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    {
      id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      name: "Mokotów 2",
      address: "ul. Puławska 2",
      created_at: "2024-01-16T11:00:00Z",
      updated_at: "2024-01-16T11:00:00Z",
    },
  ],
]);

/**
 * GET handler - Returns a specific flat by ID
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    // Validate ID parameter
    if (!id) {
      return new Response(JSON.stringify({ error: "Flat ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const flat = mockFlats.get(id);

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
  } catch (error) {
    console.error("Error in GET /api/flats/:id:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * PUT handler - Updates a specific flat
 */
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;

    // Validate ID parameter
    if (!id) {
      return new Response(JSON.stringify({ error: "Flat ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if flat exists
    const existingFlat = mockFlats.get(id);
    if (!existingFlat) {
      return new Response(JSON.stringify({ error: "Flat not found" }), {
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

    // Update flat
    const updatedFlat: FlatDto = {
      ...existingFlat,
      name: command.name,
      address: command.address,
      updated_at: new Date().toISOString(),
    };

    // Update in mock store
    mockFlats.set(id, updatedFlat);

    return new Response(JSON.stringify(updatedFlat), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in PUT /api/flats/:id:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * DELETE handler - Deletes a specific flat
 */
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    // Validate ID parameter
    if (!id) {
      return new Response(JSON.stringify({ error: "Flat ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if flat exists
    const flat = mockFlats.get(id);
    if (!flat) {
      return new Response(JSON.stringify({ error: "Flat not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete from mock store
    mockFlats.delete(id);

    const response: DeleteFlatResponseDto = {
      message: "Flat deleted successfully",
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in DELETE /api/flats/:id:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
