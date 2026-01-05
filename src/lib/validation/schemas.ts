import { z } from "zod";

/**
 * Validation schema for creating a flat
 */
export const createFlatSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  address: z.string().min(1, "Address is required").max(200, "Address must be at most 200 characters"),
});

/**
 * Validation schema for updating a flat
 */
export const updateFlatSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters").optional(),
  address: z.string().min(1, "Address is required").max(200, "Address must be at most 200 characters").optional(),
});

/**
 * Validation schema for creating a payment type
 */
export const createPaymentTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  base_amount: z
    .number()
    .min(0, "Base amount must be non-negative")
    .max(999999.99, "Base amount must be less than 1,000,000"),
});

/**
 * Validation schema for updating a payment type
 */
export const updatePaymentTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters").optional(),
  base_amount: z
    .number()
    .min(0, "Base amount must be non-negative")
    .max(999999.99, "Base amount must be less than 1,000,000")
    .optional(),
});

/**
 * Validation schema for generating payments
 */
export const generatePaymentsSchema = z.object({
  month: z.number().int().min(1, "Month must be between 1 and 12").max(12, "Month must be between 1 and 12"),
  year: z
    .number()
    .int()
    .min(1900, "Year must be between 1900 and 2100")
    .max(2100, "Year must be between 1900 and 2100"),
});

/**
 * Validation schema for filtering payments
 */
export const paymentFiltersSchema = z.object({
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  is_paid: z.boolean().optional(),
});

