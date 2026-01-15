import { z } from "zod";

/**
 * Validation schema for payment generation form
 * Used in GeneratePaymentsForm component
 */
export const paymentGenerationSchema = z.object({
  month: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      if (typeof val === "number" && isNaN(val)) return undefined;
      if (typeof val === "string" && /^\d+$/.test(val)) return Number(val);
      return val;
    },
    z
      .number({
        required_error: "Month is required",
        invalid_type_error: "Month must be a number",
      })
      .min(1, "Month must be between 1 and 12")
      .max(12, "Month must be between 1 and 12")
  ),
  year: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      if (typeof val === "number" && isNaN(val)) return undefined;
      if (typeof val === "string" && /^\d+$/.test(val)) return Number(val);
      return val;
    },
    z
      .number({
        required_error: "Year is required",
        invalid_type_error: "Year must be a number",
      })
      .min(1900, "Year must be between 1900 and 2100")
      .max(2100, "Year must be between 1900 and 2100")
  ),
});

/**
 * Type inferred from the validation schema
 */
export type PaymentGenerationFormData = z.infer<typeof paymentGenerationSchema>;
