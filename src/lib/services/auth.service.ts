import type { SupabaseClient } from "../../db/supabase.client";

/**
 * Authentication service for handling user login, registration, and logout
 */
export const authService = {
  /**
   * Login user with email and password
   */
  async login(supabase: SupabaseClient, email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  },

  /**
   * Register new user with email and password
   */
  async register(supabase: SupabaseClient, email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { data, error };
  },

  /**
   * Logout current user
   */
  async logout(supabase: SupabaseClient) {
    const { error } = await supabase.auth.signOut();
    return { error };
  },
};

