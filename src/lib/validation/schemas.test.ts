import { describe, it, expect } from 'vitest';
import {
  createFlatSchema,
  updateFlatSchema,
  createPaymentTypeSchema,
  updatePaymentTypeSchema,
  generatePaymentsSchema,
  paymentFiltersSchema,
} from './schemas';

describe('createFlatSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid flat data', () => {
      const validData = {
        name: 'Apartment 101',
        address: '123 Main St, Warsaw',
      };

      const result = createFlatSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should accept name with maximum length (100 characters)', () => {
      const validData = {
        name: 'a'.repeat(100),
        address: '123 Main St',
      };

      const result = createFlatSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept address with maximum length (200 characters)', () => {
      const validData = {
        name: 'Apartment 101',
        address: 'a'.repeat(200),
      };

      const result = createFlatSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept name and address with special characters', () => {
      const validData = {
        name: 'Mieszkanie #1 - Centrum',
        address: 'ul. Świętokrzyska 20/5, 00-002 Warszawa',
      };

      const result = createFlatSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty name', () => {
      const invalidData = {
        name: '',
        address: '123 Main St',
      };

      const result = createFlatSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name is required');
      }
    });

    it('should reject empty address', () => {
      const invalidData = {
        name: 'Apartment 101',
        address: '',
      };

      const result = createFlatSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Address is required');
      }
    });

    it('should reject name exceeding 100 characters', () => {
      const invalidData = {
        name: 'a'.repeat(101),
        address: '123 Main St',
      };

      const result = createFlatSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name must be at most 100 characters');
      }
    });

    it('should reject address exceeding 200 characters', () => {
      const invalidData = {
        name: 'Apartment 101',
        address: 'a'.repeat(201),
      };

      const result = createFlatSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Address must be at most 200 characters');
      }
    });

    it('should reject missing name field', () => {
      const invalidData = {
        address: '123 Main St',
      };

      const result = createFlatSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject missing address field', () => {
      const invalidData = {
        name: 'Apartment 101',
      };

      const result = createFlatSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject null values', () => {
      const invalidData = {
        name: null,
        address: null,
      };

      const result = createFlatSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject non-string values', () => {
      const invalidData = {
        name: 123,
        address: true,
      };

      const result = createFlatSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });
});

describe('updateFlatSchema', () => {
  it('should accept valid partial updates', () => {
    const validData = {
      name: 'Updated Name',
    };

    const result = updateFlatSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('should accept both fields', () => {
    const validData = {
      name: 'Updated Name',
      address: 'Updated Address',
    };

    const result = updateFlatSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('should accept empty object (no updates)', () => {
    const validData = {};

    const result = updateFlatSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('should reject empty strings when provided', () => {
    const invalidData = {
      name: '',
    };

    const result = updateFlatSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
  });
});

describe('createPaymentTypeSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid payment type data', () => {
      const validData = {
        name: 'Rent',
        base_amount: 1500.50,
      };

      const result = createPaymentTypeSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should accept zero base amount', () => {
      const validData = {
        name: 'Free Service',
        base_amount: 0,
      };

      const result = createPaymentTypeSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept maximum base amount (999999.99)', () => {
      const validData = {
        name: 'Expensive',
        base_amount: 999999.99,
      };

      const result = createPaymentTypeSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept integer amounts', () => {
      const validData = {
        name: 'Rent',
        base_amount: 1500,
      };

      const result = createPaymentTypeSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept amounts with decimal places', () => {
      const validData = {
        name: 'Utilities',
        base_amount: 123.45,
      };

      const result = createPaymentTypeSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty name', () => {
      const invalidData = {
        name: '',
        base_amount: 100,
      };

      const result = createPaymentTypeSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name is required');
      }
    });

    it('should reject negative base amount', () => {
      const invalidData = {
        name: 'Rent',
        base_amount: -100,
      };

      const result = createPaymentTypeSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Base amount must be non-negative');
      }
    });

    it('should reject base amount exceeding maximum (1000000)', () => {
      const invalidData = {
        name: 'Rent',
        base_amount: 1000000,
      };

      const result = createPaymentTypeSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Base amount must be less than 1,000,000');
      }
    });

    it('should reject name exceeding 100 characters', () => {
      const invalidData = {
        name: 'a'.repeat(101),
        base_amount: 100,
      };

      const result = createPaymentTypeSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject non-number base amount', () => {
      const invalidData = {
        name: 'Rent',
        base_amount: '1500',
      };

      const result = createPaymentTypeSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject missing fields', () => {
      const invalidData = {
        name: 'Rent',
      };

      const result = createPaymentTypeSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });
});

describe('updatePaymentTypeSchema', () => {
  it('should accept partial updates', () => {
    const validData = {
      name: 'Updated Name',
    };

    const result = updatePaymentTypeSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('should accept empty object', () => {
    const validData = {};

    const result = updatePaymentTypeSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('should reject negative amounts when provided', () => {
    const invalidData = {
      base_amount: -100,
    };

    const result = updatePaymentTypeSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
  });
});

describe('generatePaymentsSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid month and year', () => {
      const validData = {
        month: 6,
        year: 2026,
      };

      const result = generatePaymentsSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should accept minimum month (1)', () => {
      const validData = {
        month: 1,
        year: 2026,
      };

      const result = generatePaymentsSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept maximum month (12)', () => {
      const validData = {
        month: 12,
        year: 2026,
      };

      const result = generatePaymentsSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept minimum year (1900)', () => {
      const validData = {
        month: 6,
        year: 1900,
      };

      const result = generatePaymentsSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept maximum year (2100)', () => {
      const validData = {
        month: 6,
        year: 2100,
      };

      const result = generatePaymentsSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject month less than 1', () => {
      const invalidData = {
        month: 0,
        year: 2026,
      };

      const result = generatePaymentsSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Month must be between 1 and 12');
      }
    });

    it('should reject month greater than 12', () => {
      const invalidData = {
        month: 13,
        year: 2026,
      };

      const result = generatePaymentsSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Month must be between 1 and 12');
      }
    });

    it('should reject year less than 1900', () => {
      const invalidData = {
        month: 6,
        year: 1899,
      };

      const result = generatePaymentsSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Year must be between 1900 and 2100');
      }
    });

    it('should reject year greater than 2100', () => {
      const invalidData = {
        month: 6,
        year: 2101,
      };

      const result = generatePaymentsSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Year must be between 1900 and 2100');
      }
    });

    it('should reject decimal month', () => {
      const invalidData = {
        month: 6.5,
        year: 2026,
      };

      const result = generatePaymentsSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject decimal year', () => {
      const invalidData = {
        month: 6,
        year: 2026.5,
      };

      const result = generatePaymentsSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject string values', () => {
      const invalidData = {
        month: '6',
        year: '2026',
      };

      const result = generatePaymentsSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject missing fields', () => {
      const invalidData = {
        month: 6,
      };

      const result = generatePaymentsSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject negative month', () => {
      const invalidData = {
        month: -1,
        year: 2026,
      };

      const result = generatePaymentsSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject negative year', () => {
      const invalidData = {
        month: 6,
        year: -2026,
      };

      const result = generatePaymentsSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });
});

describe('paymentFiltersSchema', () => {
  it('should accept all filter fields', () => {
    const validData = {
      month: 6,
      year: 2026,
      is_paid: true,
    };

    const result = paymentFiltersSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('should accept partial filters', () => {
    const validData = {
      month: 6,
    };

    const result = paymentFiltersSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('should accept empty object (no filters)', () => {
    const validData = {};

    const result = paymentFiltersSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('should accept is_paid as false', () => {
    const validData = {
      is_paid: false,
    };

    const result = paymentFiltersSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('should reject invalid month values', () => {
    const invalidData = {
      month: 0,
    };

    const result = paymentFiltersSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
  });

  it('should reject invalid year values', () => {
    const invalidData = {
      year: 1899,
    };

    const result = paymentFiltersSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
  });

  it('should reject non-boolean is_paid', () => {
    const invalidData = {
      is_paid: 'true',
    };

    const result = paymentFiltersSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
  });
});

