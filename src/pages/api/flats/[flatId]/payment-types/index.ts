import type { APIRoute } from 'astro';
import { z } from 'zod';
import type {
  PaymentTypesResponseDto,
  CreatePaymentTypeCommand,
  PaymentTypeDto,
  ValidationErrorResponseDto
} from '../../../../../types';

/**
 * GET /api/flats/:flatId/payment-types
 * Returns all payment types for a specific flat
 * Auth Required: Yes (mocked)
 *
 * POST /api/flats/:flatId/payment-types
 * Creates a new payment type for a specific flat
 * Auth Required: Yes (mocked)
 */
export const prerender = false;

// Validation schema for creating a payment type
const createPaymentTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  base_amount: z.number()
    .min(0, 'Base amount must be non-negative')
    .max(999999.99, 'Base amount must be less than 1,000,000'),
});

// Mock data store
const mockPaymentTypes: PaymentTypeDto[] = [
  {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    flat_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Czynsz",
    base_amount: 1000.00,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  },
  {
    id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    flat_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Administracja",
    base_amount: 200.00,
    created_at: "2024-01-15T10:35:00Z",
    updated_at: "2024-01-15T10:35:00Z"
  },
  {
    id: "8d9e6679-7425-40de-944b-e07fc1f90ae8",
    flat_id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    name: "Czynsz",
    base_amount: 1200.00,
    created_at: "2024-01-16T11:00:00Z",
    updated_at: "2024-01-16T11:00:00Z"
  }
];

/**
 * GET handler - Returns all payment types for a specific flat
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const { flatId } = params;

    // Validate flatId parameter
    if (!flatId) {
      return new Response(
        JSON.stringify({ error: 'Flat ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Filter payment types by flat_id
    const filteredTypes = mockPaymentTypes.filter(pt => pt.flat_id === flatId);

    const response: PaymentTypesResponseDto = {
      payment_types: filteredTypes
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in GET /api/flats/:flatId/payment-types:', error);

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
 * POST handler - Creates a new payment type for a specific flat
 */
export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { flatId } = params;

    // Validate flatId parameter
    if (!flatId) {
      return new Response(
        JSON.stringify({ error: 'Flat ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

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
    const validation = createPaymentTypeSchema.safeParse(body);

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

    const command: CreatePaymentTypeCommand = validation.data;

    // Create new payment type
    const newPaymentType: PaymentTypeDto = {
      id: crypto.randomUUID(),
      flat_id: flatId,
      name: command.name,
      base_amount: command.base_amount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add to mock store
    mockPaymentTypes.push(newPaymentType);

    return new Response(JSON.stringify(newPaymentType), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in POST /api/flats/:flatId/payment-types:', error);

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

