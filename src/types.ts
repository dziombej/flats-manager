import type { Tables } from "./db/database.types";

// ============================================================================
// Entity DTOs (directly mapped from database tables)
// ============================================================================

/**
 * Flat entity DTO
 * Represents a flat/apartment managed by a landlord
 */
export type FlatDto = Tables<"flats">;

/**
 * Payment Type entity DTO
 * Represents a recurring payment template for a flat
 */
export type PaymentTypeDto = Tables<"payment_types">;

/**
 * Payment entity DTO
 * Represents a monthly payment instance generated from a payment type
 */
export type PaymentDto = Tables<"payments">;

/**
 * Profile entity DTO
 * Represents a user profile
 */
export type ProfileDto = Tables<"profiles">;

// ============================================================================
// Dashboard DTOs
// ============================================================================

/**
 * Dashboard Flat DTO
 * Extends FlatDto with calculated debt field
 * Used in GET /api/dashboard response
 */
export type DashboardFlatDto = Pick<FlatDto, "id" | "name" | "address" | "created_at" | "updated_at"> & {
  /** Total debt calculated as sum of unpaid payments */
  debt: number;
};

/**
 * Dashboard Response DTO
 * Response structure for GET /api/dashboard
 */
export interface DashboardResponseDto {
  flats: DashboardFlatDto[];
}

// ============================================================================
// Flats DTOs
// ============================================================================

/**
 * Flats Response DTO
 * Response structure for GET /api/flats
 */
export interface FlatsResponseDto {
  flats: FlatDto[];
}

/**
 * Create Flat Command
 * Request body for POST /api/flats
 * Excludes server-managed fields (id, user_id, created_at, updated_at)
 */
export type CreateFlatCommand = Pick<FlatDto, "name" | "address">;

/**
 * Update Flat Command
 * Request body for PUT /api/flats/:id
 * Only includes editable fields
 */
export type UpdateFlatCommand = Pick<FlatDto, "name" | "address">;

/**
 * Delete Flat Response DTO
 * Response structure for DELETE /api/flats/:id
 */
export interface DeleteFlatResponseDto {
  message: string;
}

// ============================================================================
// Payment Types DTOs
// ============================================================================

/**
 * Payment Types Response DTO
 * Response structure for GET /api/flats/:flatId/payment-types
 */
export interface PaymentTypesResponseDto {
  payment_types: PaymentTypeDto[];
}

/**
 * Create Payment Type Command
 * Request body for POST /api/flats/:flatId/payment-types
 * Excludes server-managed fields and flat_id (from path parameter)
 */
export type CreatePaymentTypeCommand = Pick<PaymentTypeDto, "name" | "base_amount">;

/**
 * Update Payment Type Command
 * Request body for PUT /api/payment-types/:id
 * Only includes editable fields
 */
export type UpdatePaymentTypeCommand = Pick<PaymentTypeDto, "name" | "base_amount">;

// ============================================================================
// Payments DTOs
// ============================================================================

/**
 * Payment With Type Name DTO
 * Extends PaymentDto with payment_type_name from joined query
 * Used in GET /api/flats/:flatId/payments response
 */
export type PaymentWithTypeNameDto = PaymentDto & {
  /** Payment type name from joined payment_types table */
  payment_type_name: string;
};

/**
 * Payments Response DTO
 * Response structure for GET /api/flats/:flatId/payments
 */
export interface PaymentsResponseDto {
  payments: PaymentWithTypeNameDto[];
}

/**
 * Payments Query Parameters
 * Query parameters for GET /api/flats/:flatId/payments
 */
export interface PaymentsQueryParams {
  /** Filter by month (1-12) */
  month?: number;
  /** Filter by year (1900-2100) */
  year?: number;
  /** Filter by payment status (default: false for unpaid only) */
  is_paid?: boolean;
}

/**
 * Generate Payments Command
 * Request body for POST /api/flats/:flatId/payments/generate
 */
export interface GeneratePaymentsCommand {
  /** Month (1-12) */
  month: number;
  /** Year (1900-2100) */
  year: number;
}

/**
 * Generate Payments Response DTO
 * Response structure for POST /api/flats/:flatId/payments/generate
 */
export interface GeneratePaymentsResponseDto {
  message: string;
  generated_count: number;
  month: number;
  year: number;
  payments: PaymentWithTypeNameDto[];
}

/**
 * Mark Paid Response DTO
 * Response structure for POST /api/payments/:id/mark-paid
 * Returns the updated payment
 */
export type MarkPaidResponseDto = PaymentDto;

// ============================================================================
// Error Response DTOs
// ============================================================================

/**
 * Error Response DTO
 * Standard error response structure
 */
export interface ErrorResponseDto {
  error: string;
}

/**
 * Validation Error Response DTO
 * Error response with validation details
 * Used for 400 Bad Request with field-level errors
 */
export interface ValidationErrorResponseDto {
  error: string;
  details: Record<string, string>;
}

/**
 * Conflict Error Response DTO
 * Error response for 409 Conflict
 * Used when payments already exist for a period
 */
export interface ConflictErrorResponseDto {
  error: string;
  generated_count?: number;
  skipped_count?: number;
  details?: Record<string, unknown>;
}

// ============================================================================
// Flat Detail View Models
// ============================================================================

/**
 * Flat Stats View Model
 * Statistics for flat detail view
 */
export interface FlatStatsViewModel {
  /** Total debt (sum of unpaid payments) */
  totalDebt: number;
  /** Number of payment types defined */
  paymentTypesCount: number;
  /** Number of pending (unpaid) payments */
  pendingPaymentsCount: number;
}

/**
 * Payment Type View Model
 * View model for payment type in flat detail view
 */
export interface PaymentTypeViewModel {
  id: string;
  name: string;
  baseAmount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payment View Model
 * View model for payment in flat detail view
 */
export interface PaymentViewModel {
  id: string;
  paymentTypeId: string;
  paymentTypeName: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidAt: string | null;
  month: number;
  year: number;
  /** True if payment can be edited (i.e., not paid) */
  canEdit: boolean;
  /** True if payment is overdue (due date passed and not paid) */
  isOverdue: boolean;
}

/**
 * Payment Filters State
 * Filter state for payments section
 */
export interface PaymentFiltersState {
  /** Filter by month (1-12), undefined for all */
  month?: number;
  /** Filter by year (YYYY), undefined for all */
  year?: number;
  /** Filter by payment status, undefined for all */
  isPaid?: boolean;
}

/**
 * Flat Detail View Model
 * Complete view model for flat detail page
 */
export interface FlatDetailViewModel {
  flat: FlatDto;
  stats: FlatStatsViewModel;
  paymentTypes: PaymentTypeViewModel[];
  payments: PaymentViewModel[];
}

// ============================================================================
// Flat Form View Models
// ============================================================================

/**
 * Flat Form View Model
 * View model for flat form component
 */
export interface FlatFormViewModel {
  mode: "create" | "edit";
  flatId?: string;
  initialName: string;
  initialAddress: string;
}
