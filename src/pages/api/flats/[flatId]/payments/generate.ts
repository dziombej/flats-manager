import type { APIRoute } from 'astro';
import { z } from 'zod';
import type {
  GeneratePaymentsCommand,
  GeneratePaymentsResponseDto,
  PaymentWithTypeNameDto,
  ValidationErrorResponseDto
} from '../../../../../types';

/**
 * POST /api/flats/:flatId/payments/generate
 * Generates monthly payments for all payment types in a flat
 * Auth Required: Yes (mocked)
 */
export const prerender = false;

// Validation schema for generating payments
const generatePaymentsSchema = z.object({
  month: z.number().int().min(1, 'Month must be between 1 and 12').max(12, 'Month must be between 1 and 12'),
  year: z.number().int().min(1900, 'Year must be between 1900 and 2100').max(2100, 'Year must be between 1900 and 2100'),
});

// Mock payment types data
const mockPaymentTypes = [
  {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    flat_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Czynsz",
    base_amount: 1000.00
  },
  {
    id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    flat_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Administracja",
    base_amount: 200.00
  },
  {
    id: "8d9e6679-7425-40de-944b-e07fc1f90ae8",
    flat_id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    name: "Czynsz",
    base_amount: 1200.00
  }
];

// Mock existing payments to check for duplicates
const existingPayments: PaymentWithTypeNameDto[] = [];

/**
 * POST handler - Generates monthly payments for all payment types
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
    const validation = generatePaymentsSchema.safeParse(body);

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

    const command: GeneratePaymentsCommand = validation.data;

    // Get payment types for this flat
    const flatPaymentTypes = mockPaymentTypes.filter(pt => pt.flat_id === flatId);

    if (flatPaymentTypes.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No payment types found for this flat. Create payment types first.'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate payments
    const generatedPayments: PaymentWithTypeNameDto[] = [];
    let skippedCount = 0;

    for (const paymentType of flatPaymentTypes) {
      // Check if payment already exists for this type/month/year
      const exists = existingPayments.some(
        p => p.payment_type_id === paymentType.id &&
             p.month === command.month &&
             p.year === command.year
      );

      if (exists) {
        skippedCount++;
        continue;
      }

      const newPayment: PaymentWithTypeNameDto = {
        id: crypto.randomUUID(),
        payment_type_id: paymentType.id,
        payment_type_name: paymentType.name,
        amount: paymentType.base_amount,
        month: command.month,
        year: command.year,
        is_paid: false,
        paid_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      generatedPayments.push(newPayment);
      existingPayments.push(newPayment);
    }

    const response: GeneratePaymentsResponseDto = {
      message: skippedCount > 0
        ? 'Some payments already exist for this period'
        : 'Payments generated successfully',
      generated_count: generatedPayments.length,
      month: command.month,
      year: command.year,
      payments: generatedPayments
    };

    // Return 409 if some payments were skipped, otherwise 201
    const statusCode = skippedCount > 0 ? 409 : 201;

    return new Response(JSON.stringify(response), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in POST /api/flats/:flatId/payments/generate:', error);

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

