import type { APIRoute } from "astro";
import { authService } from "../../../lib/services/auth.service";

export const prerender = false;

/**
 * Error message mapping for user-friendly display
 */
const ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "The email or password you entered is incorrect.",
  "Email not confirmed": "Please verify your email address before logging in.",
  "User not found": "The email or password you entered is incorrect.",
  default: "An error occurred during login. Please try again.",
};

/**
 * Maps Supabase error messages to user-friendly messages
 */
function getUserFriendlyError(errorMessage: string): string {
  return ERROR_MESSAGES[errorMessage] || ERROR_MESSAGES.default;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          error: "Email and password are required.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Attempt login
    const { data, error } = await authService.login(locals.supabase, email, password);

    if (error) {
      return new Response(
        JSON.stringify({
          error: getUserFriendlyError(error.message),
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!data.user) {
      return new Response(
        JSON.stringify({
          error: "Login failed. Please try again.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return success with user data
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
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
