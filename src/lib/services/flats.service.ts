import type { SupabaseClient } from "../../db/supabase.client";
import type { DashboardFlatDto, FlatDto } from "../../types";

/**
 * Validates if a string is a valid UUID
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * FlatsService
 * Handles all business logic related to flats
 */
export class FlatsService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get all flats with calculated debt for a user
   * Used by GET /api/dashboard
   */
  async getFlatsWithDebt(userId: string): Promise<DashboardFlatDto[]> {
    // Validate UUID format
    if (!isValidUUID(userId)) {
      console.error("[FlatsService.getFlatsWithDebt] Invalid UUID format:", userId);
      throw new Error(`Invalid user ID format: ${userId}`);
    }

    // Fetch all flats for the user
    console.log("[FlatsService.getFlatsWithDebt] userId:", userId);
    const { data: flats, error: flatsError } = await this.supabase
      .from("flats")
      .select("id, name, address, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    console.log("[FlatsService.getFlatsWithDebt] Query result - data:", flats, "error:", flatsError);
    if (flatsError) {
      throw new Error(`Failed to fetch flats: ${flatsError.message}`);
    }

    if (!flats || flats.length === 0) {
      return [];
    }

    const flatIds = flats.map((f) => f.id);

    // Fetch all payment types for these flats
    const { data: paymentTypes, error: typesError } = await this.supabase
      .from("payment_types")
      .select("id, flat_id")
      .in("flat_id", flatIds);

    if (typesError) {
      throw new Error(`Failed to fetch payment types: ${typesError.message}`);
    }

    if (!paymentTypes || paymentTypes.length === 0) {
      // No payment types = no debt
      return flats.map((flat) => ({
        ...flat,
        debt: 0,
      }));
    }

    const paymentTypeIds = paymentTypes.map((pt) => pt.id);

    // Fetch unpaid payments for these payment types
    const { data: payments, error: paymentsError } = await this.supabase
      .from("payments")
      .select("payment_type_id, amount")
      .in("payment_type_id", paymentTypeIds)
      .eq("is_paid", false);

    if (paymentsError) {
      throw new Error(`Failed to fetch payments: ${paymentsError.message}`);
    }

    // Calculate debt per flat
    const debtByFlat = new Map<string, number>();

    if (payments && payments.length > 0) {
      payments.forEach((payment) => {
        const paymentType = paymentTypes.find((pt) => pt.id === payment.payment_type_id);
        if (paymentType) {
          const currentDebt = debtByFlat.get(paymentType.flat_id) || 0;
          debtByFlat.set(paymentType.flat_id, currentDebt + Number(payment.amount));
        }
      });
    }

    // Map flats with debt
    return flats.map((flat) => ({
      ...flat,
      debt: debtByFlat.get(flat.id) || 0,
    }));
  }

  /**
   * Get all flats for a user
   * Used by GET /api/flats
   */
  async getAllFlats(userId: string): Promise<FlatDto[]> {
    // Validate UUID format
    if (!isValidUUID(userId)) {
      console.error("[FlatsService.getAllFlats] Invalid UUID format:", userId);
      throw new Error(`Invalid user ID format: ${userId}`);
    }

    console.log("[FlatsService.getAllFlats] userId:", userId);

    // Check if we have a session
    const { data: sessionData } = await this.supabase.auth.getSession();
    console.log("[FlatsService.getAllFlats] Session exists:", !!sessionData.session);
    console.log("[FlatsService.getAllFlats] Session user:", sessionData.session?.user?.id);

    const { data, error } = await this.supabase
      .from("flats")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    console.log("[FlatsService.getAllFlats] Query result:");
    console.log("  - data:", JSON.stringify(data, null, 2));
    console.log("  - error:", JSON.stringify(error, null, 2));
    console.log("  - data length:", data?.length ?? 0);

    if (error) {
      console.error("[FlatsService.getAllFlats] Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw new Error(`Failed to fetch flats: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a single flat by ID
   * Used by GET /api/flats/:id
   * Returns null if flat not found or doesn't belong to user
   */
  async getFlatById(flatId: string, userId: string): Promise<FlatDto | null> {
    // Validate UUID formats
    if (!isValidUUID(flatId)) {
      console.error("[FlatsService.getFlatById] Invalid flat ID format:", flatId);
      throw new Error(`Invalid flat ID format: ${flatId}`);
    }
    if (!isValidUUID(userId)) {
      console.error("[FlatsService.getFlatById] Invalid user ID format:", userId);
      throw new Error(`Invalid user ID format: ${userId}`);
    }

    const { data, error } = await this.supabase
      .from("flats")
      .select("*")
      .eq("id", flatId)
      .eq("user_id", userId)
      .single();

    if (error) {
      // PGRST116 = not found
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch flat: ${error.message}`);
    }

    return data;
  }
}

