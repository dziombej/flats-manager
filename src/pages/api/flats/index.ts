import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { FlatsResponseDto, CreateFlatCommand, FlatDto, ValidationErrorResponseDto } from '../../../types';

/**
 * GET /api/flats
 * Returns all flats for the current user
 * Auth Required: Yes (mocked)
 *
 * POST /api/flats
 * Creates a new flat
 * Auth Required: Yes (mocked)
 */
export const prerender = false;

// Validation schema for creating a flat
const createFlatSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  address: z.string().min(1, 'Address is required').max(200, 'Address must be at most 200 characters'),
});

// Mock data store
const mockFlats: FlatDto[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    name: "Żoliborz 1",
    address: "ul. Słowackiego 1",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  },
  {
    id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    name: "Mokotów 2",
    address: "ul. Puławska 2",
    created_at: "2024-01-16T11:00:00Z",
    updated_at: "2024-01-16T11:00:00Z"
  }
];

/**
 * GET handler - Returns all flats for the current user
 */
export const GET: APIRoute = async () => {
  try {
    const response: FlatsResponseDto = {
      flats: mockFlats
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in GET /api/flats:', error);

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
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
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
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
        error: 'Validation failed',
        details: errors
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
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
      updated_at: new Date().toISOString()
    };

    // Add to mock store
    mockFlats.push(newFlat);

    return new Response(JSON.stringify(newFlat), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in POST /api/flats:', error);

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

