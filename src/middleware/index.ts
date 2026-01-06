import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerClient } from "../db/supabase.client";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
];

export const onRequest = defineMiddleware(async (context, next) => {
  // Create Supabase client with SSR support
  // Access Cloudflare runtime env if available (production), otherwise fallback to import.meta.env (local dev)
  const supabase = createSupabaseServerClient({
    cookies: context.cookies,
    headers: context.request.headers,
    env: context.locals.runtime?.env,
  });

  // Store supabase client in locals
  context.locals.supabase = supabase;

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Store user in locals if authenticated
  if (user) {
    context.locals.user = {
      id: user.id,
      email: user.email || "",
    };
  }

  // Check if path is public
  const isPublicPath = PUBLIC_PATHS.includes(context.url.pathname);

  // Redirect unauthenticated users to login for protected routes
  if (!user && !isPublicPath) {
    return context.redirect("/auth/login");
  }

  // Redirect authenticated users away from auth pages
  if (user && (context.url.pathname === "/auth/login" || context.url.pathname === "/auth/register")) {
    return context.redirect("/dashboard");
  }

  return next();
});
