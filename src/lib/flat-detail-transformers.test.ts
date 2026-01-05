import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  transformPaymentTypeToViewModel,
  transformPaymentToViewModel,
  calculateFlatStats,
  transformFlatDetailData,
} from './flat-detail-transformers';
import type {
  PaymentTypeDto,
  PaymentWithTypeNameDto,
  FlatDto,
} from '../types';

describe('transformPaymentTypeToViewModel', () => {
  it('should transform payment type DTO to view model', () => {
    // Arrange
    const paymentType: PaymentTypeDto = {
      id: 'pt-123',
      flat_id: 'flat-456',
      name: 'Rent',
      base_amount: 1500,
      user_id: 'user-789',
      created_at: '2026-01-01T10:00:00Z',
      updated_at: '2026-01-02T10:00:00Z',
    };

    // Act
    const result = transformPaymentTypeToViewModel(paymentType);

    // Assert
    expect(result).toEqual({
      id: 'pt-123',
      name: 'Rent',
      baseAmount: 1500,
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-02T10:00:00Z',
    });
  });

  it('should handle zero base amount', () => {
    // Arrange
    const paymentType: PaymentTypeDto = {
      id: 'pt-123',
      flat_id: 'flat-456',
      name: 'Free Parking',
      base_amount: 0,
      user_id: 'user-789',
      created_at: '2026-01-01T10:00:00Z',
      updated_at: '2026-01-02T10:00:00Z',
    };

    // Act
    const result = transformPaymentTypeToViewModel(paymentType);

    // Assert
    expect(result.baseAmount).toBe(0);
  });
});

describe('transformPaymentToViewModel', () => {
  beforeEach(() => {
    // Mock current date to ensure consistent tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-05T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should transform paid payment to view model', () => {
    // Arrange
    const payment: PaymentWithTypeNameDto = {
      id: 'pay-123',
      flat_id: 'flat-456',
      payment_type_id: 'pt-789',
      payment_type_name: 'Rent',
      amount: 1500,
      due_date: '2026-01-01T00:00:00Z',
      is_paid: true,
      paid_at: '2026-01-03T10:00:00Z',
      month: 1,
      year: 2026,
      user_id: 'user-123',
      created_at: '2025-12-25T10:00:00Z',
      updated_at: '2026-01-03T10:00:00Z',
    };

    // Act
    const result = transformPaymentToViewModel(payment);

    // Assert
    expect(result).toEqual({
      id: 'pay-123',
      paymentTypeId: 'pt-789',
      paymentTypeName: 'Rent',
      amount: 1500,
      dueDate: '2026-01-01T00:00:00Z',
      isPaid: true,
      paidAt: '2026-01-03T10:00:00Z',
      month: 1,
      year: 2026,
      canEdit: false,
      isOverdue: false,
    });
  });

  it('should mark unpaid past due payment as overdue', () => {
    // Arrange - due date is yesterday
    const payment: PaymentWithTypeNameDto = {
      id: 'pay-123',
      flat_id: 'flat-456',
      payment_type_id: 'pt-789',
      payment_type_name: 'Rent',
      amount: 1500,
      due_date: '2026-01-04T00:00:00Z', // Yesterday
      is_paid: false,
      paid_at: null,
      month: 1,
      year: 2026,
      user_id: 'user-123',
      created_at: '2025-12-25T10:00:00Z',
      updated_at: '2025-12-25T10:00:00Z',
    };

    // Act
    const result = transformPaymentToViewModel(payment);

    // Assert
    expect(result.isOverdue).toBe(true);
    expect(result.canEdit).toBe(true);
  });

  it('should not mark unpaid future payment as overdue', () => {
    // Arrange - due date is tomorrow
    const payment: PaymentWithTypeNameDto = {
      id: 'pay-123',
      flat_id: 'flat-456',
      payment_type_id: 'pt-789',
      payment_type_name: 'Rent',
      amount: 1500,
      due_date: '2026-01-06T00:00:00Z', // Tomorrow
      is_paid: false,
      paid_at: null,
      month: 1,
      year: 2026,
      user_id: 'user-123',
      created_at: '2025-12-25T10:00:00Z',
      updated_at: '2025-12-25T10:00:00Z',
    };

    // Act
    const result = transformPaymentToViewModel(payment);

    // Assert
    expect(result.isOverdue).toBe(false);
    expect(result.canEdit).toBe(true);
  });

  it('should not mark paid overdue payment as overdue', () => {
    // Arrange - paid but was past due
    const payment: PaymentWithTypeNameDto = {
      id: 'pay-123',
      flat_id: 'flat-456',
      payment_type_id: 'pt-789',
      payment_type_name: 'Rent',
      amount: 1500,
      due_date: '2026-01-01T00:00:00Z', // Past due
      is_paid: true,
      paid_at: '2026-01-04T10:00:00Z',
      month: 1,
      year: 2026,
      user_id: 'user-123',
      created_at: '2025-12-25T10:00:00Z',
      updated_at: '2026-01-04T10:00:00Z',
    };

    // Act
    const result = transformPaymentToViewModel(payment);

    // Assert
    expect(result.isOverdue).toBe(false);
    expect(result.canEdit).toBe(false);
  });

  it('should handle payment due today (edge case - considered overdue)', () => {
    // Arrange - due date is today but in the past (00:00:00)
    // Note: Current time is 12:00:00, so 00:00:00 today is already past
    const payment: PaymentWithTypeNameDto = {
      id: 'pay-123',
      flat_id: 'flat-456',
      payment_type_id: 'pt-789',
      payment_type_name: 'Rent',
      amount: 1500,
      due_date: '2026-01-05T00:00:00Z', // Today at midnight (in the past)
      is_paid: false,
      paid_at: null,
      month: 1,
      year: 2026,
      user_id: 'user-123',
      created_at: '2025-12-25T10:00:00Z',
      updated_at: '2025-12-25T10:00:00Z',
    };

    // Act
    const result = transformPaymentToViewModel(payment);

    // Assert - Due date at midnight today is technically in the past (< now)
    expect(result.isOverdue).toBe(true);
  });

  it('should handle zero amount payment', () => {
    // Arrange
    const payment: PaymentWithTypeNameDto = {
      id: 'pay-123',
      flat_id: 'flat-456',
      payment_type_id: 'pt-789',
      payment_type_name: 'Free Service',
      amount: 0,
      due_date: '2026-01-10T00:00:00Z',
      is_paid: false,
      paid_at: null,
      month: 1,
      year: 2026,
      user_id: 'user-123',
      created_at: '2025-12-25T10:00:00Z',
      updated_at: '2025-12-25T10:00:00Z',
    };

    // Act
    const result = transformPaymentToViewModel(payment);

    // Assert
    expect(result.amount).toBe(0);
  });

  it('should handle payment with null paid_at when unpaid', () => {
    // Arrange
    const payment: PaymentWithTypeNameDto = {
      id: 'pay-123',
      flat_id: 'flat-456',
      payment_type_id: 'pt-789',
      payment_type_name: 'Rent',
      amount: 1500,
      due_date: '2026-01-10T00:00:00Z',
      is_paid: false,
      paid_at: null,
      month: 1,
      year: 2026,
      user_id: 'user-123',
      created_at: '2025-12-25T10:00:00Z',
      updated_at: '2025-12-25T10:00:00Z',
    };

    // Act
    const result = transformPaymentToViewModel(payment);

    // Assert
    expect(result.paidAt).toBeNull();
  });
});

describe('calculateFlatStats', () => {
  it('should calculate stats for flat with unpaid payments', () => {
    // Arrange
    const payments: PaymentWithTypeNameDto[] = [
      {
        id: 'pay-1',
        flat_id: 'flat-123',
        payment_type_id: 'pt-1',
        payment_type_name: 'Rent',
        amount: 1500,
        due_date: '2026-01-01T00:00:00Z',
        is_paid: false,
        paid_at: null,
        month: 1,
        year: 2026,
        user_id: 'user-123',
        created_at: '2025-12-25T10:00:00Z',
        updated_at: '2025-12-25T10:00:00Z',
      },
      {
        id: 'pay-2',
        flat_id: 'flat-123',
        payment_type_id: 'pt-2',
        payment_type_name: 'Utilities',
        amount: 500,
        due_date: '2026-01-01T00:00:00Z',
        is_paid: false,
        paid_at: null,
        month: 1,
        year: 2026,
        user_id: 'user-123',
        created_at: '2025-12-25T10:00:00Z',
        updated_at: '2025-12-25T10:00:00Z',
      },
      {
        id: 'pay-3',
        flat_id: 'flat-123',
        payment_type_id: 'pt-1',
        payment_type_name: 'Rent',
        amount: 1500,
        due_date: '2025-12-01T00:00:00Z',
        is_paid: true,
        paid_at: '2025-12-03T10:00:00Z',
        month: 12,
        year: 2025,
        user_id: 'user-123',
        created_at: '2025-11-25T10:00:00Z',
        updated_at: '2025-12-03T10:00:00Z',
      },
    ];

    const paymentTypes: PaymentTypeDto[] = [
      {
        id: 'pt-1',
        flat_id: 'flat-123',
        name: 'Rent',
        base_amount: 1500,
        user_id: 'user-123',
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T10:00:00Z',
      },
      {
        id: 'pt-2',
        flat_id: 'flat-123',
        name: 'Utilities',
        base_amount: 500,
        user_id: 'user-123',
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T10:00:00Z',
      },
    ];

    // Act
    const result = calculateFlatStats(payments, paymentTypes);

    // Assert
    expect(result).toEqual({
      totalDebt: 2000, // 1500 + 500 (unpaid only)
      paymentTypesCount: 2,
      pendingPaymentsCount: 2,
    });
  });

  it('should return zero debt when all payments are paid', () => {
    // Arrange
    const payments: PaymentWithTypeNameDto[] = [
      {
        id: 'pay-1',
        flat_id: 'flat-123',
        payment_type_id: 'pt-1',
        payment_type_name: 'Rent',
        amount: 1500,
        due_date: '2026-01-01T00:00:00Z',
        is_paid: true,
        paid_at: '2026-01-03T10:00:00Z',
        month: 1,
        year: 2026,
        user_id: 'user-123',
        created_at: '2025-12-25T10:00:00Z',
        updated_at: '2026-01-03T10:00:00Z',
      },
    ];

    const paymentTypes: PaymentTypeDto[] = [
      {
        id: 'pt-1',
        flat_id: 'flat-123',
        name: 'Rent',
        base_amount: 1500,
        user_id: 'user-123',
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T10:00:00Z',
      },
    ];

    // Act
    const result = calculateFlatStats(payments, paymentTypes);

    // Assert
    expect(result.totalDebt).toBe(0);
    expect(result.pendingPaymentsCount).toBe(0);
  });

  it('should handle empty payments array', () => {
    // Arrange
    const payments: PaymentWithTypeNameDto[] = [];
    const paymentTypes: PaymentTypeDto[] = [
      {
        id: 'pt-1',
        flat_id: 'flat-123',
        name: 'Rent',
        base_amount: 1500,
        user_id: 'user-123',
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T10:00:00Z',
      },
    ];

    // Act
    const result = calculateFlatStats(payments, paymentTypes);

    // Assert
    expect(result).toEqual({
      totalDebt: 0,
      paymentTypesCount: 1,
      pendingPaymentsCount: 0,
    });
  });

  it('should handle empty payment types array', () => {
    // Arrange
    const payments: PaymentWithTypeNameDto[] = [];
    const paymentTypes: PaymentTypeDto[] = [];

    // Act
    const result = calculateFlatStats(payments, paymentTypes);

    // Assert
    expect(result).toEqual({
      totalDebt: 0,
      paymentTypesCount: 0,
      pendingPaymentsCount: 0,
    });
  });

  it('should correctly sum large debt amounts', () => {
    // Arrange
    const payments: PaymentWithTypeNameDto[] = [
      {
        id: 'pay-1',
        flat_id: 'flat-123',
        payment_type_id: 'pt-1',
        payment_type_name: 'Rent',
        amount: 5000.50,
        due_date: '2026-01-01T00:00:00Z',
        is_paid: false,
        paid_at: null,
        month: 1,
        year: 2026,
        user_id: 'user-123',
        created_at: '2025-12-25T10:00:00Z',
        updated_at: '2025-12-25T10:00:00Z',
      },
      {
        id: 'pay-2',
        flat_id: 'flat-123',
        payment_type_id: 'pt-1',
        payment_type_name: 'Rent',
        amount: 3000.75,
        due_date: '2025-12-01T00:00:00Z',
        is_paid: false,
        paid_at: null,
        month: 12,
        year: 2025,
        user_id: 'user-123',
        created_at: '2025-11-25T10:00:00Z',
        updated_at: '2025-11-25T10:00:00Z',
      },
    ];

    const paymentTypes: PaymentTypeDto[] = [
      {
        id: 'pt-1',
        flat_id: 'flat-123',
        name: 'Rent',
        base_amount: 5000,
        user_id: 'user-123',
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T10:00:00Z',
      },
    ];

    // Act
    const result = calculateFlatStats(payments, paymentTypes);

    // Assert
    expect(result.totalDebt).toBe(8001.25);
  });
});

describe('transformFlatDetailData', () => {
  const mockFlat: FlatDto = {
    id: 'flat-123',
    user_id: 'user-456',
    name: 'Apartment 1A',
    address: '123 Main St',
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',
  };

  const mockPaymentTypes: PaymentTypeDto[] = [
    {
      id: 'pt-1',
      flat_id: 'flat-123',
      name: 'Rent',
      base_amount: 1500,
      user_id: 'user-456',
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z',
    },
  ];

  const mockPayments: PaymentWithTypeNameDto[] = [
    {
      id: 'pay-1',
      flat_id: 'flat-123',
      payment_type_id: 'pt-1',
      payment_type_name: 'Rent',
      amount: 1500,
      due_date: '2026-01-01T00:00:00Z',
      is_paid: false,
      paid_at: null,
      month: 1,
      year: 2026,
      user_id: 'user-456',
      created_at: '2025-12-25T10:00:00Z',
      updated_at: '2025-12-25T10:00:00Z',
    },
  ];

  it('should transform complete flat detail data', () => {
    // Act
    const result = transformFlatDetailData(mockFlat, mockPaymentTypes, mockPayments);

    // Assert
    expect(result.flat).toEqual(mockFlat);
    expect(result.stats).toEqual({
      totalDebt: 1500,
      paymentTypesCount: 1,
      pendingPaymentsCount: 1,
    });
    expect(result.paymentTypes).toHaveLength(1);
    expect(result.payments).toHaveLength(1);
    expect(result.paymentTypes[0].name).toBe('Rent');
    expect(result.payments[0].paymentTypeName).toBe('Rent');
  });

  it('should handle flat with no payment types or payments', () => {
    // Act
    const result = transformFlatDetailData(mockFlat, [], []);

    // Assert
    expect(result.flat).toEqual(mockFlat);
    expect(result.stats).toEqual({
      totalDebt: 0,
      paymentTypesCount: 0,
      pendingPaymentsCount: 0,
    });
    expect(result.paymentTypes).toHaveLength(0);
    expect(result.payments).toHaveLength(0);
  });

  it('should transform multiple payment types and payments', () => {
    // Arrange
    const multiplePaymentTypes: PaymentTypeDto[] = [
      {
        id: 'pt-1',
        flat_id: 'flat-123',
        name: 'Rent',
        base_amount: 1500,
        user_id: 'user-456',
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T10:00:00Z',
      },
      {
        id: 'pt-2',
        flat_id: 'flat-123',
        name: 'Utilities',
        base_amount: 500,
        user_id: 'user-456',
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T10:00:00Z',
      },
    ];

    const multiplePayments: PaymentWithTypeNameDto[] = [
      {
        id: 'pay-1',
        flat_id: 'flat-123',
        payment_type_id: 'pt-1',
        payment_type_name: 'Rent',
        amount: 1500,
        due_date: '2026-01-01T00:00:00Z',
        is_paid: false,
        paid_at: null,
        month: 1,
        year: 2026,
        user_id: 'user-456',
        created_at: '2025-12-25T10:00:00Z',
        updated_at: '2025-12-25T10:00:00Z',
      },
      {
        id: 'pay-2',
        flat_id: 'flat-123',
        payment_type_id: 'pt-2',
        payment_type_name: 'Utilities',
        amount: 500,
        due_date: '2026-01-01T00:00:00Z',
        is_paid: true,
        paid_at: '2026-01-03T10:00:00Z',
        month: 1,
        year: 2026,
        user_id: 'user-456',
        created_at: '2025-12-25T10:00:00Z',
        updated_at: '2026-01-03T10:00:00Z',
      },
    ];

    // Act
    const result = transformFlatDetailData(mockFlat, multiplePaymentTypes, multiplePayments);

    // Assert
    expect(result.paymentTypes).toHaveLength(2);
    expect(result.payments).toHaveLength(2);
    expect(result.stats.totalDebt).toBe(1500); // Only unpaid
    expect(result.stats.paymentTypesCount).toBe(2);
    expect(result.stats.pendingPaymentsCount).toBe(1);
  });
});

