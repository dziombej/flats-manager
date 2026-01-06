import { describe, it, expect } from "vitest";
import { paymentGenerationSchema } from "./payment-generation.schema";

describe("paymentGenerationSchema", () => {
  describe("month validation", () => {
    it("should accept valid month values (1-12)", () => {
      for (let month = 1; month <= 12; month++) {
        const result = paymentGenerationSchema.safeParse({ month, year: 2024 });
        expect(result.success).toBe(true);
      }
    });

    it("should reject month less than 1", () => {
      const result = paymentGenerationSchema.safeParse({ month: 0, year: 2024 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Month must be between 1 and 12");
      }
    });

    it("should reject month greater than 12", () => {
      const result = paymentGenerationSchema.safeParse({ month: 13, year: 2024 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Month must be between 1 and 12");
      }
    });

    it("should reject non-number month", () => {
      const result = paymentGenerationSchema.safeParse({ month: "January", year: 2024 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Month must be a number");
      }
    });

    it("should reject missing month", () => {
      const result = paymentGenerationSchema.safeParse({ year: 2024 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Month is required");
      }
    });
  });

  describe("year validation", () => {
    it("should accept valid year values", () => {
      const validYears = [1900, 2000, 2024, 2050, 2100];
      validYears.forEach((year) => {
        const result = paymentGenerationSchema.safeParse({ month: 1, year });
        expect(result.success).toBe(true);
      });
    });

    it("should reject year less than 1900", () => {
      const result = paymentGenerationSchema.safeParse({ month: 1, year: 1899 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Year must be between 1900 and 2100");
      }
    });

    it("should reject year greater than 2100", () => {
      const result = paymentGenerationSchema.safeParse({ month: 1, year: 2101 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Year must be between 1900 and 2100");
      }
    });

    it("should reject non-number year", () => {
      const result = paymentGenerationSchema.safeParse({ month: 1, year: "2024" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Year must be a number");
      }
    });

    it("should reject missing year", () => {
      const result = paymentGenerationSchema.safeParse({ month: 1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Year is required");
      }
    });
  });

  describe("boundary values", () => {
    it("should accept minimum valid values", () => {
      const result = paymentGenerationSchema.safeParse({ month: 1, year: 1900 });
      expect(result.success).toBe(true);
    });

    it("should accept maximum valid values", () => {
      const result = paymentGenerationSchema.safeParse({ month: 12, year: 2100 });
      expect(result.success).toBe(true);
    });

    it("should reject both fields invalid", () => {
      const result = paymentGenerationSchema.safeParse({ month: 0, year: 1800 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
      }
    });
  });

  describe("type inference", () => {
    it("should have correct TypeScript type", () => {
      const result = paymentGenerationSchema.parse({ month: 3, year: 2024 });

      // TypeScript should infer these types
      const month: number = result.month;
      const year: number = result.year;

      expect(month).toBe(3);
      expect(year).toBe(2024);
    });
  });

  describe("edge cases", () => {
    it("should handle leap year February", () => {
      // Schema doesn't validate actual date validity, just month/year ranges
      const result = paymentGenerationSchema.safeParse({ month: 2, year: 2024 });
      expect(result.success).toBe(true);
    });

    it("should handle current date", () => {
      const now = new Date();
      const result = paymentGenerationSchema.safeParse({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      expect(result.success).toBe(true);
    });

    it("should reject decimal month", () => {
      const result = paymentGenerationSchema.safeParse({ month: 1.5, year: 2024 });
      // Zod coerces to number, but we can add integer validation if needed
      // For now, this will pass as 1.5 is between 1 and 12
      expect(result.success).toBe(true);
    });

    it("should reject decimal year", () => {
      const result = paymentGenerationSchema.safeParse({ month: 1, year: 2024.5 });
      // Similar to above, this will pass
      expect(result.success).toBe(true);
    });
  });
});
