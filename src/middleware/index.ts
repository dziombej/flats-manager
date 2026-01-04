import { defineMiddleware } from "astro:middleware";

import { supabaseClient } from "../db/supabase.client";

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.supabase = supabaseClient;

  // Development only: Auto-login with test credentials if not authenticated
  if (import.meta.env.DEV && import.meta.env.DEV_AUTO_LOGIN === 'true') {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      const email = import.meta.env.DEV_USER_EMAIL || 'admin@flatmanager.local';
      const password = import.meta.env.DEV_USER_PASSWORD || 'password123';

      const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInError && signInData.user) {
        console.log(`[DEV] Auto-logged in as: ${email}`);
      }
    }
  }

  return next();
});
