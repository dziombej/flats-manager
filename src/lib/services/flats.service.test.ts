import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FlatsService } from './flats.service';
import type { SupabaseClient } from '../../db/supabase.client';

/**
 * Helper function to create a mock Supabase client
 */
function createMockSupabaseClient(): SupabaseClient {
  return {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
  } as any;
}

/**
 * Helper function to create a mock query builder with proper chaining
 */
function createMockQueryBuilder(finalResult: any) {
  const builder: any = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
    single: vi.fn().mockResolvedValue(finalResult),
  };

  // Make all chainable methods return the builder for chaining
  builder.select.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.delete.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.in.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);

  return builder;
}

describe('FlatsService - UUID Validation', () => {
  let mockSupabase: SupabaseClient;
  let flatsService: FlatsService;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    flatsService = new FlatsService(mockSupabase);
  });

  describe('getFlatsWithDebt', () => {
    it('should throw error for invalid UUID format', async () => {
      await expect(
        flatsService.getFlatsWithDebt('invalid-uuid')
      ).rejects.toThrow('Invalid user ID format: invalid-uuid');
    });

    it('should throw error for empty string', async () => {
      await expect(
        flatsService.getFlatsWithDebt('')
      ).rejects.toThrow('Invalid user ID format: ');
    });

    it('should throw error for UUID with wrong format (missing dashes)', async () => {
      await expect(
        flatsService.getFlatsWithDebt('12345678123412341234123456789012')
      ).rejects.toThrow('Invalid user ID format');
    });

    it('should throw error for UUID with invalid characters', async () => {
      await expect(
        flatsService.getFlatsWithDebt('12345678-1234-1234-1234-12345678901g')
      ).rejects.toThrow('Invalid user ID format');
    });

    it('should accept valid UUID format', async () => {
      const validUUID = '12345678-1234-1234-1234-123456789012';
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      });
      mockSupabase.from = mockFrom;

      await flatsService.getFlatsWithDebt(validUUID);

      expect(mockFrom).toHaveBeenCalledWith('flats');
    });
  });

  describe('getAllFlats', () => {
    it('should throw error for invalid UUID', async () => {
      await expect(
        flatsService.getAllFlats('not-a-uuid')
      ).rejects.toThrow('Invalid user ID format');
    });

    it('should accept valid UUID (lowercase)', async () => {
      const validUUID = 'abcdef12-3456-7890-abcd-ef1234567890';
      mockSupabase.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      });
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      });
      mockSupabase.from = mockFrom;

      await flatsService.getAllFlats(validUUID);

      expect(mockFrom).toHaveBeenCalledWith('flats');
    });

    it('should accept valid UUID (uppercase)', async () => {
      const validUUID = 'ABCDEF12-3456-7890-ABCD-EF1234567890';
      mockSupabase.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      });
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      });
      mockSupabase.from = mockFrom;

      await flatsService.getAllFlats(validUUID);

      expect(mockFrom).toHaveBeenCalledWith('flats');
    });
  });

  describe('getFlatById', () => {
    it('should throw error for invalid flat ID', async () => {
      const validUserUUID = '12345678-1234-1234-1234-123456789012';

      await expect(
        flatsService.getFlatById('invalid', validUserUUID)
      ).rejects.toThrow('Invalid flat ID format');
    });

    it('should throw error for invalid user ID', async () => {
      const validFlatUUID = '12345678-1234-1234-1234-123456789012';

      await expect(
        flatsService.getFlatById(validFlatUUID, 'invalid')
      ).rejects.toThrow('Invalid user ID format');
    });

    it('should accept valid UUIDs for both parameters', async () => {
      const validFlatUUID = '12345678-1234-1234-1234-123456789012';
      const validUserUUID = '87654321-4321-4321-4321-210987654321';
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      });
      mockSupabase.from = mockFrom;

      await flatsService.getFlatById(validFlatUUID, validUserUUID);

      expect(mockFrom).toHaveBeenCalledWith('flats');
    });
  });

  describe('createFlat', () => {
    it('should throw error for invalid user UUID', async () => {
      const command = { name: 'Test', address: 'Test Address' };

      await expect(
        flatsService.createFlat('invalid-uuid', command)
      ).rejects.toThrow('Invalid user ID format');
    });
  });

  describe('getPaymentTypeById', () => {
    it('should throw error for invalid payment type ID', async () => {
      const validUserUUID = '12345678-1234-1234-1234-123456789012';

      await expect(
        flatsService.getPaymentTypeById('invalid', validUserUUID)
      ).rejects.toThrow('Invalid payment type ID format');
    });

    it('should throw error for invalid user ID', async () => {
      const validPaymentTypeUUID = '12345678-1234-1234-1234-123456789012';

      await expect(
        flatsService.getPaymentTypeById(validPaymentTypeUUID, 'invalid')
      ).rejects.toThrow('Invalid user ID format');
    });
  });

  describe('createPaymentType', () => {
    it('should throw error for invalid flat ID', async () => {
      const validUserUUID = '12345678-1234-1234-1234-123456789012';
      const command = { name: 'Rent', base_amount: 1000 };

      await expect(
        flatsService.createPaymentType('invalid', validUserUUID, command)
      ).rejects.toThrow('Invalid flat ID format');
    });

    it('should throw error for invalid user ID', async () => {
      const validFlatUUID = '12345678-1234-1234-1234-123456789012';
      const command = { name: 'Rent', base_amount: 1000 };

      await expect(
        flatsService.createPaymentType(validFlatUUID, 'invalid', command)
      ).rejects.toThrow('Invalid user ID format');
    });
  });

  describe('getPayments', () => {
    it('should throw error for invalid flat ID', async () => {
      const validUserUUID = '12345678-1234-1234-1234-123456789012';

      await expect(
        flatsService.getPayments('invalid', validUserUUID)
      ).rejects.toThrow('Invalid flat ID format');
    });

    it('should throw error for invalid user ID', async () => {
      const validFlatUUID = '12345678-1234-1234-1234-123456789012';

      await expect(
        flatsService.getPayments(validFlatUUID, 'invalid')
      ).rejects.toThrow('Invalid user ID format');
    });
  });

  describe('generatePayments', () => {
    it('should throw error for invalid flat ID', async () => {
      const validUserUUID = '12345678-1234-1234-1234-123456789012';
      const command = { month: 1, year: 2026 };

      await expect(
        flatsService.generatePayments('invalid', validUserUUID, command)
      ).rejects.toThrow('Invalid flat ID format');
    });

    it('should throw error for invalid user ID', async () => {
      const validFlatUUID = '12345678-1234-1234-1234-123456789012';
      const command = { month: 1, year: 2026 };

      await expect(
        flatsService.generatePayments(validFlatUUID, 'invalid', command)
      ).rejects.toThrow('Invalid user ID format');
    });
  });

  describe('markPaymentAsPaid', () => {
    it('should throw error for invalid payment ID', async () => {
      const validUserUUID = '12345678-1234-1234-1234-123456789012';

      await expect(
        flatsService.markPaymentAsPaid('invalid', validUserUUID)
      ).rejects.toThrow('Invalid payment ID format');
    });

    it('should throw error for invalid user ID', async () => {
      const validPaymentUUID = '12345678-1234-1234-1234-123456789012';

      await expect(
        flatsService.markPaymentAsPaid(validPaymentUUID, 'invalid')
      ).rejects.toThrow('Invalid user ID format');
    });
  });
});

describe('FlatsService - Debt Calculation', () => {
  let mockSupabase: SupabaseClient;
  let flatsService: FlatsService;
  const validUserUUID = '12345678-1234-1234-1234-123456789012';

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    flatsService = new FlatsService(mockSupabase);
  });

  it('should calculate debt correctly for single flat with unpaid payments', async () => {
    const flatId = '11111111-1111-1111-1111-111111111111';
    const paymentTypeId = '22222222-2222-2222-2222-222222222222';

    // Mock flats query
    const flatsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: flatId, name: 'Flat 1', address: 'Address 1', created_at: '2026-01-01', updated_at: '2026-01-01' },
        ],
        error: null,
      }),
    };

    // Mock payment types query
    const paymentTypesQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [{ id: paymentTypeId, flat_id: flatId }],
        error: null,
      }),
    };

    // Mock payments query
    const paymentsQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [
          { payment_type_id: paymentTypeId, amount: 1000 },
          { payment_type_id: paymentTypeId, amount: 500 },
        ],
        error: null,
      }),
    };

    mockSupabase.from = vi.fn()
      .mockReturnValueOnce(flatsQuery)
      .mockReturnValueOnce(paymentTypesQuery)
      .mockReturnValueOnce(paymentsQuery);

    const result = await flatsService.getFlatsWithDebt(validUserUUID);

    expect(result).toHaveLength(1);
    expect(result[0].debt).toBe(1500);
  });

  it('should return zero debt when no payment types exist', async () => {
    const flatId = '11111111-1111-1111-1111-111111111111';

    const flatsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: flatId, name: 'Flat 1', address: 'Address 1', created_at: '2026-01-01', updated_at: '2026-01-01' },
        ],
        error: null,
      }),
    };

    const paymentTypesQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    mockSupabase.from = vi.fn()
      .mockReturnValueOnce(flatsQuery)
      .mockReturnValueOnce(paymentTypesQuery);

    const result = await flatsService.getFlatsWithDebt(validUserUUID);

    expect(result).toHaveLength(1);
    expect(result[0].debt).toBe(0);
  });

  it('should return zero debt when no unpaid payments exist', async () => {
    const flatId = '11111111-1111-1111-1111-111111111111';
    const paymentTypeId = '22222222-2222-2222-2222-222222222222';

    const flatsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: flatId, name: 'Flat 1', address: 'Address 1', created_at: '2026-01-01', updated_at: '2026-01-01' },
        ],
        error: null,
      }),
    };

    const paymentTypesQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [{ id: paymentTypeId, flat_id: flatId }],
        error: null,
      }),
    };

    const paymentsQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    mockSupabase.from = vi.fn()
      .mockReturnValueOnce(flatsQuery)
      .mockReturnValueOnce(paymentTypesQuery)
      .mockReturnValueOnce(paymentsQuery);

    const result = await flatsService.getFlatsWithDebt(validUserUUID);

    expect(result).toHaveLength(1);
    expect(result[0].debt).toBe(0);
  });

  it('should calculate debt correctly for multiple flats', async () => {
    const flat1Id = '11111111-1111-1111-1111-111111111111';
    const flat2Id = '22222222-2222-2222-2222-222222222222';
    const paymentType1Id = '33333333-3333-3333-3333-333333333333';
    const paymentType2Id = '44444444-4444-4444-4444-444444444444';

    const flatsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: flat1Id, name: 'Flat 1', address: 'Address 1', created_at: '2026-01-01', updated_at: '2026-01-01' },
          { id: flat2Id, name: 'Flat 2', address: 'Address 2', created_at: '2026-01-02', updated_at: '2026-01-02' },
        ],
        error: null,
      }),
    };

    const paymentTypesQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [
          { id: paymentType1Id, flat_id: flat1Id },
          { id: paymentType2Id, flat_id: flat2Id },
        ],
        error: null,
      }),
    };

    const paymentsQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [
          { payment_type_id: paymentType1Id, amount: 1000 },
          { payment_type_id: paymentType2Id, amount: 2000 },
          { payment_type_id: paymentType2Id, amount: 500 },
        ],
        error: null,
      }),
    };

    mockSupabase.from = vi.fn()
      .mockReturnValueOnce(flatsQuery)
      .mockReturnValueOnce(paymentTypesQuery)
      .mockReturnValueOnce(paymentsQuery);

    const result = await flatsService.getFlatsWithDebt(validUserUUID);

    expect(result).toHaveLength(2);
    expect(result[0].debt).toBe(1000); // Flat 1
    expect(result[1].debt).toBe(2500); // Flat 2
  });

  it('should handle decimal amounts correctly', async () => {
    const flatId = '11111111-1111-1111-1111-111111111111';
    const paymentTypeId = '22222222-2222-2222-2222-222222222222';

    const flatsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: flatId, name: 'Flat 1', address: 'Address 1', created_at: '2026-01-01', updated_at: '2026-01-01' },
        ],
        error: null,
      }),
    };

    const paymentTypesQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [{ id: paymentTypeId, flat_id: flatId }],
        error: null,
      }),
    };

    const paymentsQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [
          { payment_type_id: paymentTypeId, amount: 1500.50 },
          { payment_type_id: paymentTypeId, amount: 250.25 },
        ],
        error: null,
      }),
    };

    mockSupabase.from = vi.fn()
      .mockReturnValueOnce(flatsQuery)
      .mockReturnValueOnce(paymentTypesQuery)
      .mockReturnValueOnce(paymentsQuery);

    const result = await flatsService.getFlatsWithDebt(validUserUUID);

    expect(result).toHaveLength(1);
    expect(result[0].debt).toBe(1750.75);
  });

  it('should return empty array when user has no flats', async () => {
    const flatsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    mockSupabase.from = vi.fn().mockReturnValueOnce(flatsQuery);

    const result = await flatsService.getFlatsWithDebt(validUserUUID);

    expect(result).toEqual([]);
  });
});

describe('FlatsService - Payment Generation', () => {
  let mockSupabase: SupabaseClient;
  let flatsService: FlatsService;
  const validUserUUID = '12345678-1234-1234-1234-123456789012';
  const validFlatUUID = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    flatsService = new FlatsService(mockSupabase);
  });

  it('should generate payments for all payment types with correct data', async () => {
    const paymentType1Id = '22222222-2222-2222-2222-222222222222';
    const paymentType2Id = '33333333-3333-3333-3333-333333333333';
    const command = { month: 6, year: 2026 };

    // Mock getFlatById query (called directly from generatePayments)
    const flatQuery1 = createMockQueryBuilder({
      data: { id: validFlatUUID, name: 'Flat 1', user_id: validUserUUID },
      error: null,
    });

    // Mock getFlatById query (called from getPaymentTypes)
    const flatQuery2 = createMockQueryBuilder({
      data: { id: validFlatUUID, name: 'Flat 1', user_id: validUserUUID },
      error: null,
    });

    // Mock payment_types query with full chain
    const paymentTypesQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: paymentType1Id, flat_id: validFlatUUID, name: 'Rent', base_amount: 1500 },
          { id: paymentType2Id, flat_id: validFlatUUID, name: 'Utilities', base_amount: 300 },
        ],
        error: null,
      }),
    };

    // Mock insert payments query
    const insertQuery = createMockQueryBuilder({
      data: [
        {
          id: 'payment-1',
          payment_type_id: paymentType1Id,
          amount: 1500,
          month: 6,
          year: 2026,
          is_paid: false,
          paid_at: null,
          created_at: '2026-01-05',
          updated_at: '2026-01-05',
          payment_types: { name: 'Rent' },
        },
        {
          id: 'payment-2',
          payment_type_id: paymentType2Id,
          amount: 300,
          month: 6,
          year: 2026,
          is_paid: false,
          paid_at: null,
          created_at: '2026-01-05',
          updated_at: '2026-01-05',
          payment_types: { name: 'Utilities' },
        },
      ],
      error: null,
    });
    insertQuery.select = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'payment-1',
          payment_type_id: paymentType1Id,
          amount: 1500,
          month: 6,
          year: 2026,
          is_paid: false,
          paid_at: null,
          created_at: '2026-01-05',
          updated_at: '2026-01-05',
          payment_types: { name: 'Rent' },
        },
        {
          id: 'payment-2',
          payment_type_id: paymentType2Id,
          amount: 300,
          month: 6,
          year: 2026,
          is_paid: false,
          paid_at: null,
          created_at: '2026-01-05',
          updated_at: '2026-01-05',
          payment_types: { name: 'Utilities' },
        },
      ],
      error: null,
    });

    // 4 from() calls: getFlatById (direct) -> getFlatById (in getPaymentTypes) -> payment_types query -> insert payments
    mockSupabase.from = vi.fn()
      .mockReturnValueOnce(flatQuery1)         // from('flats') in getFlatById (direct call)
      .mockReturnValueOnce(flatQuery2)         // from('flats') in getFlatById (from getPaymentTypes)
      .mockReturnValueOnce(paymentTypesQuery)  // from('payment_types') in getPaymentTypes
      .mockReturnValueOnce(insertQuery);       // from('payments') for insert

    const result = await flatsService.generatePayments(validFlatUUID, validUserUUID, command);

    expect(result).toHaveLength(2);
    expect(result![0].amount).toBe(1500);
    expect(result![0].month).toBe(6);
    expect(result![0].year).toBe(2026);
    expect(result![0].is_paid).toBe(false);
    expect(result![0].payment_type_name).toBe('Rent');
    expect(result![1].amount).toBe(300);
    expect(result![1].payment_type_name).toBe('Utilities');

    // Verify insert was called with correct data
    expect(insertQuery.insert).toHaveBeenCalledWith([
      {
        payment_type_id: paymentType1Id,
        amount: 1500,
        month: 6,
        year: 2026,
        is_paid: false,
        paid_at: null,
      },
      {
        payment_type_id: paymentType2Id,
        amount: 300,
        month: 6,
        year: 2026,
        is_paid: false,
        paid_at: null,
      },
    ]);
  });

  it('should return empty array when flat has no payment types', async () => {
    const command = { month: 6, year: 2026 };

    // Mock getFlatById query (called directly from generatePayments)
    const flatQuery1 = createMockQueryBuilder({
      data: { id: validFlatUUID, name: 'Flat 1', user_id: validUserUUID },
      error: null,
    });

    // Mock getFlatById query (called from getPaymentTypes)
    const flatQuery2 = createMockQueryBuilder({
      data: { id: validFlatUUID, name: 'Flat 1', user_id: validUserUUID },
      error: null,
    });

    // Mock payment_types query with full chain
    const paymentTypesQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    // 3 from() calls: getFlatById (direct) -> getFlatById (in getPaymentTypes) -> payment_types query (no insert because empty)
    mockSupabase.from = vi.fn()
      .mockReturnValueOnce(flatQuery1)         // from('flats') in getFlatById (direct call)
      .mockReturnValueOnce(flatQuery2)         // from('flats') in getFlatById (from getPaymentTypes)
      .mockReturnValueOnce(paymentTypesQuery); // from('payment_types') in getPaymentTypes

    const result = await flatsService.generatePayments(validFlatUUID, validUserUUID, command);

    expect(result).toEqual([]);
  });

  it('should return null when flat does not belong to user', async () => {
    const command = { month: 6, year: 2026 };

    const flatQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      }),
    };

    mockSupabase.from = vi.fn().mockReturnValueOnce(flatQuery);

    const result = await flatsService.generatePayments(validFlatUUID, validUserUUID, command);

    expect(result).toBeNull();
  });
});

describe('FlatsService - Error Handling', () => {
  let mockSupabase: SupabaseClient;
  let flatsService: FlatsService;
  const validUserUUID = '12345678-1234-1234-1234-123456789012';

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    flatsService = new FlatsService(mockSupabase);
  });

  it('should throw error when flats query fails', async () => {
    const flatsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      }),
    };

    mockSupabase.from = vi.fn().mockReturnValueOnce(flatsQuery);

    await expect(
      flatsService.getFlatsWithDebt(validUserUUID)
    ).rejects.toThrow('Failed to fetch flats: Database connection failed');
  });

  it('should throw error when payment types query fails', async () => {
    const flatId = '11111111-1111-1111-1111-111111111111';

    const flatsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: flatId, name: 'Flat 1', address: 'Address 1', created_at: '2026-01-01', updated_at: '2026-01-01' },
        ],
        error: null,
      }),
    };

    const paymentTypesQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Payment types fetch failed' },
      }),
    };

    mockSupabase.from = vi.fn()
      .mockReturnValueOnce(flatsQuery)
      .mockReturnValueOnce(paymentTypesQuery);

    await expect(
      flatsService.getFlatsWithDebt(validUserUUID)
    ).rejects.toThrow('Failed to fetch payment types: Payment types fetch failed');
  });

  it('should throw error when payments query fails', async () => {
    const flatId = '11111111-1111-1111-1111-111111111111';
    const paymentTypeId = '22222222-2222-2222-2222-222222222222';

    const flatsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: flatId, name: 'Flat 1', address: 'Address 1', created_at: '2026-01-01', updated_at: '2026-01-01' },
        ],
        error: null,
      }),
    };

    const paymentTypesQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [{ id: paymentTypeId, flat_id: flatId }],
        error: null,
      }),
    };

    const paymentsQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Payments fetch failed' },
      }),
    };

    mockSupabase.from = vi.fn()
      .mockReturnValueOnce(flatsQuery)
      .mockReturnValueOnce(paymentTypesQuery)
      .mockReturnValueOnce(paymentsQuery);

    await expect(
      flatsService.getFlatsWithDebt(validUserUUID)
    ).rejects.toThrow('Failed to fetch payments: Payments fetch failed');
  });
});

