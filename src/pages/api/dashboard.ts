import type { APIRoute } from 'astro';
import type { DashboardResponseDto, DashboardFlatDto } from '../../types';

/**
 * GET /api/dashboard
 * Returns all flats with calculated debt for the current user
 * Auth Required: Yes (mocked)
 */
export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    // Mock data - simulates flats with debt calculation
    const mockFlats: DashboardFlatDto[] = [
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Mokotów 2",
        address: "ul. Puławska 2",
        debt: 0.00,
        created_at: "2024-01-16T11:00:00Z",
        updated_at: "2024-01-16T11:00:00Z"
      },
      {
        id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        name: "Żoliborz 1",
        address: "ul. Słowackiego 1",
        debt: 1200.00,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    ];

    const response: DashboardResponseDto = {
      flats: mockFlats
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // Handle unexpected errors
    console.error('Error in GET /api/dashboard:', error);

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

