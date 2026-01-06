import type { APIRoute } from "astro";
import { authService } from "../../../lib/services/auth.service";

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
  try {
    // Attempt logout
    const { error } = await authService.logout(locals.supabase);

    if (error) {
      return new Response(
        JSON.stringify({
          error: "Failed to log out. Please try again.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: "Logged out successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
