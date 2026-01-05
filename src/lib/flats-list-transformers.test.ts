import { describe, it, expect } from 'vitest';
import {
  transformFlatsListData,
  transformFlatToCardViewModel,
} from './flats-list-transformers';
import { formatCurrency } from './utils';
import type { FlatsResponseDto, FlatDto } from '../types';

describe('transformFlatToCardViewModel', () => {
  it('should transform flat DTO to card view model', () => {
    // Arrange
    const flat: FlatDto = {
      id: 'flat-123',
      user_id: 'user-456',
      name: 'Apartment 1A',
      address: '123 Main St, Warsaw',
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-06-15T14:30:00Z',
    };

    // Act
    const result = transformFlatToCardViewModel(flat);

    // Assert
    expect(result).toEqual({
      id: 'flat-123',
      name: 'Apartment 1A',
      address: '123 Main St, Warsaw',
      tenantName: undefined,
      debt: 0,
      formattedDebt: formatCurrency(0),
      paymentTypesCount: undefined,
      pendingPaymentsCount: undefined,
      hasOverduePayments: false,
      status: 'ok',
      detailsUrl: '/flats/flat-123',
      createdAt: '2025-01-01T10:00:00Z',
      updatedAt: '2025-06-15T14:30:00Z',
    });
  });

  it('should generate correct details URL', () => {
    // Arrange
    const flat: FlatDto = {
      id: 'different-id-789',
      user_id: 'user-456',
      name: 'Apartment 2B',
      address: 'Test Address',
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z',
    };

    // Act
    const result = transformFlatToCardViewModel(flat);

    // Assert
    expect(result.detailsUrl).toBe('/flats/different-id-789');
  });

  it('should handle flat with empty name', () => {
    // Arrange
    const flat: FlatDto = {
      id: 'flat-123',
      user_id: 'user-456',
      name: '',
      address: '123 Main St',
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z',
    };

    // Act
    const result = transformFlatToCardViewModel(flat);

    // Assert
    expect(result.name).toBe('');
  });

  it('should handle flat with empty address', () => {
    // Arrange
    const flat: FlatDto = {
      id: 'flat-123',
      user_id: 'user-456',
      name: 'Apartment 1A',
      address: '',
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z',
    };

    // Act
    const result = transformFlatToCardViewModel(flat);

    // Assert
    expect(result.address).toBe('');
  });

  it('should always set debt to 0 in MVP', () => {
    // Arrange
    const flat: FlatDto = {
      id: 'flat-123',
      user_id: 'user-456',
      name: 'Test Flat',
      address: 'Test Address',
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z',
    };

    // Act
    const result = transformFlatToCardViewModel(flat);

    // Assert
    expect(result.debt).toBe(0);
    expect(result.hasOverduePayments).toBe(false);
    expect(result.status).toBe('ok');
  });

  it('should format debt as Polish currency', () => {
    // Arrange
    const flat: FlatDto = {
      id: 'flat-123',
      user_id: 'user-456',
      name: 'Test Flat',
      address: 'Test Address',
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z',
    };

    // Act
    const result = transformFlatToCardViewModel(flat);

    // Assert - Polish currency format (uses non-breaking space)
    expect(result.formattedDebt).toBe(formatCurrency(0));
  });

  it('should handle long flat names', () => {
    // Arrange
    const flat: FlatDto = {
      id: 'flat-123',
      user_id: 'user-456',
      name: 'Very Long Apartment Name That Could Potentially Break UI Layout',
      address: 'Test Address',
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z',
    };

    // Act
    const result = transformFlatToCardViewModel(flat);

    // Assert
    expect(result.name).toBe('Very Long Apartment Name That Could Potentially Break UI Layout');
  });

  it('should handle long addresses', () => {
    // Arrange
    const flat: FlatDto = {
      id: 'flat-123',
      user_id: 'user-456',
      name: 'Test Flat',
      address: 'Very Long Street Name 123, Apartment 45, Building C, District X, 00-123 Warsaw, Poland',
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z',
    };

    // Act
    const result = transformFlatToCardViewModel(flat);

    // Assert
    expect(result.address).toBe('Very Long Street Name 123, Apartment 45, Building C, District X, 00-123 Warsaw, Poland');
  });

  it('should set undefined for MVP-unavailable fields', () => {
    // Arrange
    const flat: FlatDto = {
      id: 'flat-123',
      user_id: 'user-456',
      name: 'Test Flat',
      address: 'Test Address',
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z',
    };

    // Act
    const result = transformFlatToCardViewModel(flat);

    // Assert
    expect(result.tenantName).toBeUndefined();
    expect(result.paymentTypesCount).toBeUndefined();
    expect(result.pendingPaymentsCount).toBeUndefined();
  });

  it('should preserve created_at and updated_at timestamps', () => {
    // Arrange
    const flat: FlatDto = {
      id: 'flat-123',
      user_id: 'user-456',
      name: 'Test Flat',
      address: 'Test Address',
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-12-31T23:59:59Z',
    };

    // Act
    const result = transformFlatToCardViewModel(flat);

    // Assert
    expect(result.createdAt).toBe('2025-01-01T10:00:00Z');
    expect(result.updatedAt).toBe('2025-12-31T23:59:59Z');
  });
});

describe('transformFlatsListData', () => {
  it('should transform API response with multiple flats', () => {
    // Arrange
    const apiResponse: FlatsResponseDto = {
      flats: [
        {
          id: 'flat-1',
          user_id: 'user-456',
          name: 'Apartment 1A',
          address: '123 Main St',
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z',
        },
        {
          id: 'flat-2',
          user_id: 'user-456',
          name: 'Apartment 2B',
          address: '456 Oak Ave',
          created_at: '2025-02-01T10:00:00Z',
          updated_at: '2025-02-01T10:00:00Z',
        },
        {
          id: 'flat-3',
          user_id: 'user-456',
          name: 'Studio 3C',
          address: '789 Pine Rd',
          created_at: '2025-03-01T10:00:00Z',
          updated_at: '2025-03-01T10:00:00Z',
        },
      ],
    };

    // Act
    const result = transformFlatsListData(apiResponse);

    // Assert
    expect(result.flats).toHaveLength(3);
    expect(result.totalCount).toBe(3);
    expect(result.isEmpty).toBe(false);
    expect(result.flats[0].name).toBe('Apartment 1A');
    expect(result.flats[1].name).toBe('Apartment 2B');
    expect(result.flats[2].name).toBe('Studio 3C');
  });

  it('should handle empty flats array', () => {
    // Arrange
    const apiResponse: FlatsResponseDto = {
      flats: [],
    };

    // Act
    const result = transformFlatsListData(apiResponse);

    // Assert
    expect(result.flats).toHaveLength(0);
    expect(result.totalCount).toBe(0);
    expect(result.isEmpty).toBe(true);
  });

  it('should handle single flat', () => {
    // Arrange
    const apiResponse: FlatsResponseDto = {
      flats: [
        {
          id: 'flat-1',
          user_id: 'user-456',
          name: 'Only Apartment',
          address: 'Lonely Street',
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z',
        },
      ],
    };

    // Act
    const result = transformFlatsListData(apiResponse);

    // Assert
    expect(result.flats).toHaveLength(1);
    expect(result.totalCount).toBe(1);
    expect(result.isEmpty).toBe(false);
    expect(result.flats[0].name).toBe('Only Apartment');
  });

  it('should transform all flats with correct structure', () => {
    // Arrange
    const apiResponse: FlatsResponseDto = {
      flats: [
        {
          id: 'flat-1',
          user_id: 'user-456',
          name: 'Apartment 1A',
          address: '123 Main St',
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z',
        },
        {
          id: 'flat-2',
          user_id: 'user-456',
          name: 'Apartment 2B',
          address: '456 Oak Ave',
          created_at: '2025-02-01T10:00:00Z',
          updated_at: '2025-02-01T10:00:00Z',
        },
      ],
    };

    // Act
    const result = transformFlatsListData(apiResponse);

    // Assert
    result.flats.forEach((flat) => {
      expect(flat).toHaveProperty('id');
      expect(flat).toHaveProperty('name');
      expect(flat).toHaveProperty('address');
      expect(flat).toHaveProperty('debt');
      expect(flat).toHaveProperty('formattedDebt');
      expect(flat).toHaveProperty('status');
      expect(flat).toHaveProperty('detailsUrl');
      expect(flat).toHaveProperty('createdAt');
      expect(flat).toHaveProperty('updatedAt');
    });
  });

  it('should generate correct details URLs for all flats', () => {
    // Arrange
    const apiResponse: FlatsResponseDto = {
      flats: [
        {
          id: 'flat-abc',
          user_id: 'user-456',
          name: 'Flat A',
          address: 'Address A',
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z',
        },
        {
          id: 'flat-xyz',
          user_id: 'user-456',
          name: 'Flat B',
          address: 'Address B',
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z',
        },
      ],
    };

    // Act
    const result = transformFlatsListData(apiResponse);

    // Assert
    expect(result.flats[0].detailsUrl).toBe('/flats/flat-abc');
    expect(result.flats[1].detailsUrl).toBe('/flats/flat-xyz');
  });

  it('should set all flats to ok status with zero debt in MVP', () => {
    // Arrange
    const apiResponse: FlatsResponseDto = {
      flats: [
        {
          id: 'flat-1',
          user_id: 'user-456',
          name: 'Flat 1',
          address: 'Address 1',
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z',
        },
        {
          id: 'flat-2',
          user_id: 'user-456',
          name: 'Flat 2',
          address: 'Address 2',
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z',
        },
      ],
    };

    // Act
    const result = transformFlatsListData(apiResponse);

    // Assert
    result.flats.forEach((flat) => {
      expect(flat.debt).toBe(0);
      expect(flat.status).toBe('ok');
      expect(flat.hasOverduePayments).toBe(false);
      expect(flat.formattedDebt).toBe(formatCurrency(0));
    });
  });

  it('should maintain order of flats from API', () => {
    // Arrange
    const apiResponse: FlatsResponseDto = {
      flats: [
        {
          id: 'flat-3',
          user_id: 'user-456',
          name: 'Third',
          address: 'Third Address',
          created_at: '2025-03-01T10:00:00Z',
          updated_at: '2025-03-01T10:00:00Z',
        },
        {
          id: 'flat-1',
          user_id: 'user-456',
          name: 'First',
          address: 'First Address',
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z',
        },
        {
          id: 'flat-2',
          user_id: 'user-456',
          name: 'Second',
          address: 'Second Address',
          created_at: '2025-02-01T10:00:00Z',
          updated_at: '2025-02-01T10:00:00Z',
        },
      ],
    };

    // Act
    const result = transformFlatsListData(apiResponse);

    // Assert
    expect(result.flats[0].name).toBe('Third');
    expect(result.flats[1].name).toBe('First');
    expect(result.flats[2].name).toBe('Second');
  });

  it('should handle large number of flats', () => {
    // Arrange
    const flats: FlatDto[] = Array.from({ length: 100 }, (_, i) => ({
      id: `flat-${i}`,
      user_id: 'user-456',
      name: `Apartment ${i}`,
      address: `${i} Test Street`,
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z',
    }));

    const apiResponse: FlatsResponseDto = { flats };

    // Act
    const result = transformFlatsListData(apiResponse);

    // Assert
    expect(result.flats).toHaveLength(100);
    expect(result.totalCount).toBe(100);
    expect(result.isEmpty).toBe(false);
  });
});

