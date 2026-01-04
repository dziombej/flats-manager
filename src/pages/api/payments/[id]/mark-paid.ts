import type { APIRoute } from 'astro';
import type { MarkPaidResponseDto, PaymentDto } from '../../../../types';

/**
 * POST /api/payments/:id/mark-paid
 * Marks a payment as paid
 * Auth Required: Yes (mocked)
 */
export const prerender = false;

// Mock data store
const mockPayments: Map<string, PaymentDto> = new Map([
  [
    "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      payment_type_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      amount: 1000.00,
      month: 1,
      year: 2024,
      is_paid: false,
      paid_at: null,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    }
  ],
  [
    "b2c3d4e5-f6g7-8901-bcde-f12345678901",
    {
      id: "b2c3d4e5-f6g7-8901-bcde-f12345678901",
      payment_type_id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      amount: 200.00,
      month: 1,
      year: 2024,
      is_paid: false,
      paid_at: null,
      created_at: "2024-01-15T10:35:00Z",
      updated_at: "2024-01-15T10:35:00Z"
    }
  ],
  [
    "c3d4e5f6-g7h8-9012-cdef-123456789012",
    {
      id: "c3d4e5f6-g7h8-9012-cdef-123456789012",
      payment_type_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      amount: 1000.00,
      month: 2,
      year: 2024,
      is_paid: true,
      paid_at: "2024-02-05T14:30:00Z",
      created_at: "2024-02-01T10:30:00Z",
      updated_at: "2024-02-05T14:30:00Z"
    }
  ]
]);

/**
 * POST handler - Marks a payment as paid
 */
export const POST: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    // Validate ID parameter
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Payment ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if payment exists
    const payment = mockPayments.get(id);
    if (!payment) {
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if already paid
    if (payment.is_paid) {
      return new Response(
        JSON.stringify({ error: 'Payment is already marked as paid' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Mark as paid
    const updatedPayment: PaymentDto = {
      ...payment,
      is_paid: true,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Update in mock store
    mockPayments.set(id, updatedPayment);

    const response: MarkPaidResponseDto = updatedPayment;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in POST /api/payments/:id/mark-paid:', error);

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

