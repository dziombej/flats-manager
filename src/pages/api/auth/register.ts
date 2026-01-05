import type { APIRoute } from "astro";
import { authService } from "../../../lib/services/auth.service";

export const prerender = false;

/**
 * Error message mapping for user-friendly display
 */
const ERROR_MESSAGES: Record<string, string> = {
  "User already registered": "This email address is already registered.",
  "Email already exists": "This email address is already registered.",
  "Invalid email": "Please enter a valid email address.",
  "Password should be at least 8 characters": "Password must be at least 8 characters.",
  default: "An error occurred during registration. Please try again.",
};

/**
 * Maps Supabase error messages to user-friendly messages
 */
function getUserFriendlyError(errorMessage: string): string {
  // Check for duplicate email error
  if (errorMessage.toLowerCase().includes("already") || errorMessage.toLowerCase().includes("duplicate")) {
    return ERROR_MESSAGES["User already registered"];
  }
  return ERROR_MESSAGES[errorMessage] || ERROR_MESSAGES.default;
}

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          error: "Email and password are required."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          error: "Please enter a valid email address."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return new Response(
        JSON.stringify({
          error: "Password must be at least 8 characters."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Attempt registration
    const { data, error } = await authService.register(locals.supabase, email, password);

    if (error) {
      console.error("Registration error:", error.message, error);

      // Check if it's a duplicate email error
      const statusCode = error.message.toLowerCase().includes("already") ||
                        error.message.toLowerCase().includes("duplicate") ? 409 : 400;

      return new Response(
        JSON.stringify({
          error: getUserFriendlyError(error.message)
        }),
        {
          status: statusCode,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!data.user) {
      console.error("Registration succeeded but no user returned", data);
      return new Response(
        JSON.stringify({
          error: "Registration failed. Please try again."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("User registered successfully:", data.user.id, data.user.email);

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: "Account created successfully!",
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
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred. Please try again."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

