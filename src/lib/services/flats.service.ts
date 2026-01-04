import type { SupabaseClient } from "../../db/supabase.client";
import type {
  DashboardFlatDto,
  FlatDto,
  CreateFlatCommand,
  UpdateFlatCommand,
  PaymentTypeDto,
  CreatePaymentTypeCommand,
  UpdatePaymentTypeCommand,
  PaymentWithTypeNameDto,
  GeneratePaymentsCommand,
  PaymentDto,
} from "../../types";

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

  /**
   * Create a new flat
   * Used by POST /api/flats
   */
  async createFlat(userId: string, command: CreateFlatCommand): Promise<FlatDto> {
    // Validate UUID format
    if (!isValidUUID(userId)) {
      console.error("[FlatsService.createFlat] Invalid UUID format:", userId);
      throw new Error(`Invalid user ID format: ${userId}`);
    }

    const { data, error } = await this.supabase
      .from("flats")
      .insert({
        user_id: userId,
        name: command.name,
        address: command.address,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create flat: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a flat
   * Used by PUT /api/flats/:id
   * Returns null if flat not found or doesn't belong to user
   */
  async updateFlat(
    flatId: string,
    userId: string,
    command: UpdateFlatCommand
  ): Promise<FlatDto | null> {
    // Validate UUID formats
    if (!isValidUUID(flatId)) {
      console.error("[FlatsService.updateFlat] Invalid flat ID format:", flatId);
      throw new Error(`Invalid flat ID format: ${flatId}`);
    }
    if (!isValidUUID(userId)) {
      console.error("[FlatsService.updateFlat] Invalid user ID format:", userId);
      throw new Error(`Invalid user ID format: ${userId}`);
    }

    const { data, error } = await this.supabase
      .from("flats")
      .update({
        name: command.name,
        address: command.address,
      })
      .eq("id", flatId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      // PGRST116 = not found
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to update flat: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a flat
   * Used by DELETE /api/flats/:id
   * Returns true if deleted, false if not found or doesn't belong to user
   */
  async deleteFlat(flatId: string, userId: string): Promise<boolean> {
    // Validate UUID formats
    if (!isValidUUID(flatId)) {
      console.error("[FlatsService.deleteFlat] Invalid flat ID format:", flatId);
      throw new Error(`Invalid flat ID format: ${flatId}`);
    }
    if (!isValidUUID(userId)) {
      console.error("[FlatsService.deleteFlat] Invalid user ID format:", userId);
      throw new Error(`Invalid user ID format: ${userId}`);
    }

    const { error } = await this.supabase
      .from("flats")
      .delete()
      .eq("id", flatId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete flat: ${error.message}`);
    }

    // Check if actually deleted by trying to fetch it
    const flat = await this.getFlatById(flatId, userId);
    return flat === null;
  }

  /**
   * Get all payment types for a flat
   * Used by GET /api/flats/:flatId/payment-types
   * Returns empty array if flat doesn't belong to user
   */
  async getPaymentTypes(flatId: string, userId: string): Promise<PaymentTypeDto[]> {
    // Validate UUID formats
    if (!isValidUUID(flatId)) {
      console.error("[FlatsService.getPaymentTypes] Invalid flat ID format:", flatId);
      throw new Error(`Invalid flat ID format: ${flatId}`);
    }
    if (!isValidUUID(userId)) {
      console.error("[FlatsService.getPaymentTypes] Invalid user ID format:", userId);
      throw new Error(`Invalid user ID format: ${userId}`);
    }

    // First verify the flat belongs to the user
    const flat = await this.getFlatById(flatId, userId);
    if (!flat) {
      return [];
    }

    const { data, error } = await this.supabase
      .from("payment_types")
      .select("*")
      .eq("flat_id", flatId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch payment types: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create a payment type for a flat
   * Used by POST /api/flats/:flatId/payment-types
   * Returns null if flat doesn't belong to user
   */
  async createPaymentType(
    flatId: string,
    userId: string,
    command: CreatePaymentTypeCommand
  ): Promise<PaymentTypeDto | null> {
    // Validate UUID formats
    if (!isValidUUID(flatId)) {
      console.error("[FlatsService.createPaymentType] Invalid flat ID format:", flatId);
      throw new Error(`Invalid flat ID format: ${flatId}`);
    }
    if (!isValidUUID(userId)) {
      console.error("[FlatsService.createPaymentType] Invalid user ID format:", userId);
      throw new Error(`Invalid user ID format: ${userId}`);
    }

    // First verify the flat belongs to the user
    const flat = await this.getFlatById(flatId, userId);
    if (!flat) {
      return null;
    }

    const { data, error } = await this.supabase
      .from("payment_types")
      .insert({
        flat_id: flatId,
        name: command.name,
        base_amount: command.base_amount,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create payment type: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a payment type
   * Used by PUT /api/payment-types/:id
   * Returns null if payment type doesn't belong to user's flat
   */
  async updatePaymentType(
    paymentTypeId: string,
    userId: string,
    command: UpdatePaymentTypeCommand
  ): Promise<PaymentTypeDto | null> {
    // Validate UUID formats
    if (!isValidUUID(paymentTypeId)) {
      console.error("[FlatsService.updatePaymentType] Invalid payment type ID format:", paymentTypeId);
      throw new Error(`Invalid payment type ID format: ${paymentTypeId}`);
    }
    if (!isValidUUID(userId)) {
      console.error("[FlatsService.updatePaymentType] Invalid user ID format:", userId);
      throw new Error(`Invalid user ID format: ${userId}`);
    }

    // First get the payment type to verify ownership via flat
    const { data: paymentType, error: fetchError } = await this.supabase
      .from("payment_types")
      .select("*, flats!inner(user_id)")
      .eq("id", paymentTypeId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch payment type: ${fetchError.message}`);
    }

    // Check if the flat belongs to the user
    const flats = paymentType.flats as any;
    if (!flats || flats.user_id !== userId) {
      return null;
    }

    // Update the payment type
    const { data, error } = await this.supabase
      .from("payment_types")
      .update({
        name: command.name,
        base_amount: command.base_amount,
      })
      .eq("id", paymentTypeId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update payment type: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all payments for a flat
   * Used by GET /api/flats/:flatId/payments
   * Returns empty array if flat doesn't belong to user
   */
  async getPayments(
    flatId: string,
    userId: string,
    filters?: { month?: number; year?: number; is_paid?: boolean }
  ): Promise<PaymentWithTypeNameDto[]> {
    // Validate UUID formats
    if (!isValidUUID(flatId)) {
      console.error("[FlatsService.getPayments] Invalid flat ID format:", flatId);
      throw new Error(`Invalid flat ID format: ${flatId}`);
    }
    if (!isValidUUID(userId)) {
      console.error("[FlatsService.getPayments] Invalid user ID format:", userId);
      throw new Error(`Invalid user ID format: ${userId}`);
    }

    // First verify the flat belongs to the user
    const flat = await this.getFlatById(flatId, userId);
    if (!flat) {
      return [];
    }

    // Get payment types for this flat
    const { data: paymentTypes, error: typesError } = await this.supabase
      .from("payment_types")
      .select("id")
      .eq("flat_id", flatId);

    if (typesError) {
      throw new Error(`Failed to fetch payment types: ${typesError.message}`);
    }

    if (!paymentTypes || paymentTypes.length === 0) {
      return [];
    }

    const paymentTypeIds = paymentTypes.map((pt) => pt.id);

    // Build query with filters
    let query = this.supabase
      .from("payments")
      .select("*, payment_types!inner(name)")
      .in("payment_type_id", paymentTypeIds);

    if (filters?.month !== undefined) {
      query = query.eq("month", filters.month);
    }
    if (filters?.year !== undefined) {
      query = query.eq("year", filters.year);
    }
    if (filters?.is_paid !== undefined) {
      query = query.eq("is_paid", filters.is_paid);
    }

    query = query.order("year", { ascending: false })
      .order("month", { ascending: false })
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }

    // Transform data to include payment_type_name
    return (data || []).map((payment: any) => ({
      id: payment.id,
      payment_type_id: payment.payment_type_id,
      amount: payment.amount,
      month: payment.month,
      year: payment.year,
      is_paid: payment.is_paid,
      paid_at: payment.paid_at,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
      payment_type_name: payment.payment_types?.name || "",
    }));
  }

  /**
   * Generate payments for a flat
   * Used by POST /api/flats/:flatId/payments/generate
   * Returns null if flat doesn't belong to user
   */
  async generatePayments(
    flatId: string,
    userId: string,
    command: GeneratePaymentsCommand
  ): Promise<PaymentWithTypeNameDto[] | null> {
    // Validate UUID formats
    if (!isValidUUID(flatId)) {
      console.error("[FlatsService.generatePayments] Invalid flat ID format:", flatId);
      throw new Error(`Invalid flat ID format: ${flatId}`);
    }
    if (!isValidUUID(userId)) {
      console.error("[FlatsService.generatePayments] Invalid user ID format:", userId);
      throw new Error(`Invalid user ID format: ${userId}`);
    }

    // First verify the flat belongs to the user
    const flat = await this.getFlatById(flatId, userId);
    if (!flat) {
      return null;
    }

    // Get all payment types for this flat
    const paymentTypes = await this.getPaymentTypes(flatId, userId);
    if (paymentTypes.length === 0) {
      return [];
    }

    // Prepare payments to insert
    const paymentsToInsert = paymentTypes.map((pt) => ({
      payment_type_id: pt.id,
      amount: pt.base_amount,
      month: command.month,
      year: command.year,
      is_paid: false,
      paid_at: null,
    }));

    // Insert payments (ignore conflicts due to unique constraint)
    const { data, error } = await this.supabase
      .from("payments")
      .insert(paymentsToInsert)
      .select("*, payment_types!inner(name)");

    if (error) {
      throw new Error(`Failed to generate payments: ${error.message}`);
    }

    // Transform data to include payment_type_name
    return (data || []).map((payment: any) => ({
      id: payment.id,
      payment_type_id: payment.payment_type_id,
      amount: payment.amount,
      month: payment.month,
      year: payment.year,
      is_paid: payment.is_paid,
      paid_at: payment.paid_at,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
      payment_type_name: payment.payment_types?.name || "",
    }));
  }

  /**
   * Mark a payment as paid
   * Used by POST /api/payments/:id/mark-paid
   * Returns null if payment doesn't belong to user's flat
   */
  async markPaymentAsPaid(paymentId: string, userId: string): Promise<PaymentDto | null> {
    // Validate UUID formats
    if (!isValidUUID(paymentId)) {
      console.error("[FlatsService.markPaymentAsPaid] Invalid payment ID format:", paymentId);
      throw new Error(`Invalid payment ID format: ${paymentId}`);
    }
    if (!isValidUUID(userId)) {
      console.error("[FlatsService.markPaymentAsPaid] Invalid user ID format:", userId);
      throw new Error(`Invalid user ID format: ${userId}`);
    }

    // First get the payment to verify ownership via flat
    const { data: payment, error: fetchError } = await this.supabase
      .from("payments")
      .select("*, payment_types!inner(flat_id, flats!inner(user_id))")
      .eq("id", paymentId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch payment: ${fetchError.message}`);
    }

    // Check if the flat belongs to the user
    const paymentTypes = payment.payment_types as any;
    const flats = paymentTypes?.flats;
    if (!flats || flats.user_id !== userId) {
      return null;
    }

    // Update the payment
    const { data, error } = await this.supabase
      .from("payments")
      .update({
        is_paid: true,
        paid_at: new Date().toISOString(),
      })
      .eq("id", paymentId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to mark payment as paid: ${error.message}`);
    }

    return data;
  }
}

