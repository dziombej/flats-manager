import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate, formatDateShort, isValidUUID } from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('btn', 'btn-primary');
      expect(result).toBe('btn btn-primary');
    });

    it('should handle conditional classes', () => {
      const result = cn('btn', false && 'hidden', 'visible');
      expect(result).toBe('btn visible');
    });

    it('should merge tailwind classes without conflicts', () => {
      const result = cn('p-4', 'p-8');
      expect(result).toBe('p-8');
    });
  });

  describe('formatCurrency', () => {
    it('should format positive integers correctly', () => {
      const result = formatCurrency(1000);
      expect(result).toBe('1000,00\u00A0zł');
    });

    it('should format zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toBe('0,00\u00A0zł');
    });

    it('should format negative amounts correctly', () => {
      const result = formatCurrency(-500);
      expect(result).toBe('-500,00\u00A0zł');
    });

    it('should format decimal amounts correctly', () => {
      const result = formatCurrency(1234.56);
      expect(result).toBe('1234,56\u00A0zł');
    });

    it('should handle large numbers with thousands separator', () => {
      const result = formatCurrency(1234567.89);
      // Polish locale uses non-breaking space (U+00A0) as thousands separator
      expect(result).toBe('1\u00A0234\u00A0567,89\u00A0zł');
    });

    it('should round to 2 decimal places', () => {
      const result = formatCurrency(1234.567);
      expect(result).toBe('1234,57\u00A0zł');
    });

    it('should handle very small decimal amounts', () => {
      const result = formatCurrency(0.01);
      expect(result).toBe('0,01\u00A0zł');
    });

    it('should handle very large amounts', () => {
      const result = formatCurrency(999999999.99);
      // Polish locale uses non-breaking space (U+00A0) as thousands separator
      expect(result).toBe('999\u00A0999\u00A0999,99\u00A0zł');
    });

    it('should format amounts with trailing zeros', () => {
      const result = formatCurrency(100);
      expect(result).toBe('100,00\u00A0zł');
    });

    it('should handle negative decimal amounts', () => {
      const result = formatCurrency(-1234.56);
      expect(result).toBe('-1234,56\u00A0zł');
    });
  });

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const result = formatDate('2026-01-05');
      expect(result).toBe('5 stycznia 2026');
    });

    it('should format Date object correctly', () => {
      const date = new Date('2026-01-05T12:00:00.000Z');
      const result = formatDate(date);
      expect(result).toContain('2026');
      expect(result).toContain('stycznia');
    });

    it('should format different months correctly', () => {
      const dates = [
        { input: '2026-01-15', month: 'stycznia' },
        { input: '2026-02-15', month: 'lutego' },
        { input: '2026-03-15', month: 'marca' },
        { input: '2026-04-15', month: 'kwietnia' },
        { input: '2026-05-15', month: 'maja' },
        { input: '2026-06-15', month: 'czerwca' },
        { input: '2026-07-15', month: 'lipca' },
        { input: '2026-08-15', month: 'sierpnia' },
        { input: '2026-09-15', month: 'września' },
        { input: '2026-10-15', month: 'października' },
        { input: '2026-11-15', month: 'listopada' },
        { input: '2026-12-15', month: 'grudnia' },
      ];

      dates.forEach(({ input, month }) => {
        const result = formatDate(input);
        expect(result).toContain(month);
      });
    });

    it('should handle first day of month', () => {
      const result = formatDate('2026-01-01');
      expect(result).toBe('1 stycznia 2026');
    });

    it('should handle last day of month', () => {
      const result = formatDate('2026-01-31');
      expect(result).toBe('31 stycznia 2026');
    });

    it('should handle leap year dates', () => {
      const result = formatDate('2024-02-29');
      expect(result).toBe('29 lutego 2024');
    });

    it('should format past dates correctly', () => {
      const result = formatDate('2020-12-31');
      expect(result).toBe('31 grudnia 2020');
    });

    it('should format future dates correctly', () => {
      const result = formatDate('2030-06-15');
      expect(result).toBe('15 czerwca 2030');
    });
  });

  describe('formatDateShort', () => {
    it('should format date string in DD.MM.YYYY format', () => {
      const result = formatDateShort('2026-01-05');
      expect(result).toBe('05.01.2026');
    });

    it('should format Date object in DD.MM.YYYY format', () => {
      const date = new Date('2026-01-05T12:00:00.000Z');
      const result = formatDateShort(date);
      expect(result).toMatch(/^\d{2}\.\d{2}\.2026$/);
    });

    it('should pad single-digit days with zero', () => {
      const result = formatDateShort('2026-01-05');
      expect(result).toBe('05.01.2026');
    });

    it('should pad single-digit months with zero', () => {
      const result = formatDateShort('2026-03-15');
      expect(result).toBe('15.03.2026');
    });

    it('should handle double-digit days without extra padding', () => {
      const result = formatDateShort('2026-12-25');
      expect(result).toBe('25.12.2026');
    });

    it('should handle double-digit months without extra padding', () => {
      const result = formatDateShort('2026-11-05');
      expect(result).toBe('05.11.2026');
    });

    it('should format first day of year', () => {
      const result = formatDateShort('2026-01-01');
      expect(result).toBe('01.01.2026');
    });

    it('should format last day of year', () => {
      const result = formatDateShort('2026-12-31');
      expect(result).toBe('31.12.2026');
    });

    it('should handle leap year dates', () => {
      const result = formatDateShort('2024-02-29');
      expect(result).toBe('29.02.2024');
    });

    it('should format past dates correctly', () => {
      const result = formatDateShort('2020-05-15');
      expect(result).toBe('15.05.2020');
    });

    it('should format future dates correctly', () => {
      const result = formatDateShort('2030-09-01');
      expect(result).toBe('01.09.2030');
    });

    it('should handle century boundaries', () => {
      const result = formatDateShort('1999-12-31');
      expect(result).toBe('31.12.1999');
    });

    it('should consistently format the same date', () => {
      const date = '2026-06-15';
      const result1 = formatDateShort(date);
      const result2 = formatDateShort(date);
      expect(result1).toBe(result2);
      expect(result1).toBe('15.06.2026');
    });
  });

  describe('isValidUUID', () => {
    describe('valid UUIDs', () => {
      it('should accept standard lowercase UUID', () => {
        const uuid = '12345678-1234-1234-1234-123456789012';
        expect(isValidUUID(uuid)).toBe(true);
      });

      it('should accept standard uppercase UUID', () => {
        const uuid = '12345678-1234-1234-1234-123456789012'.toUpperCase();
        expect(isValidUUID(uuid)).toBe(true);
      });

      it('should accept mixed case UUID', () => {
        const uuid = '12345678-ABCD-1234-abcd-123456789012';
        expect(isValidUUID(uuid)).toBe(true);
      });

      it('should accept UUID with all hex digits (0-9, a-f)', () => {
        const uuid = 'abcdef12-3456-7890-abcd-ef1234567890';
        expect(isValidUUID(uuid)).toBe(true);
      });

      it('should accept UUID v4 format', () => {
        const uuid = '550e8400-e29b-41d4-a716-446655440000';
        expect(isValidUUID(uuid)).toBe(true);
      });

      it('should accept UUID with all zeros', () => {
        const uuid = '00000000-0000-0000-0000-000000000000';
        expect(isValidUUID(uuid)).toBe(true);
      });

      it('should accept UUID with all fs', () => {
        const uuid = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
        expect(isValidUUID(uuid)).toBe(true);
      });
    });

    describe('invalid UUIDs', () => {
      it('should reject empty string', () => {
        expect(isValidUUID('')).toBe(false);
      });

      it('should reject UUID without dashes', () => {
        const uuid = '12345678123412341234123456789012';
        expect(isValidUUID(uuid)).toBe(false);
      });

      it('should reject UUID with wrong dash positions', () => {
        const uuid = '123456-78-1234-1234-1234-123456789012';
        expect(isValidUUID(uuid)).toBe(false);
      });

      it('should reject UUID that is too short', () => {
        const uuid = '12345678-1234-1234-1234-12345678901';
        expect(isValidUUID(uuid)).toBe(false);
      });

      it('should reject UUID that is too long', () => {
        const uuid = '12345678-1234-1234-1234-1234567890123';
        expect(isValidUUID(uuid)).toBe(false);
      });

      it('should reject UUID with invalid characters (g-z)', () => {
        const uuid = '12345678-1234-1234-1234-12345678901g';
        expect(isValidUUID(uuid)).toBe(false);
      });

      it('should reject UUID with special characters', () => {
        const uuid = '12345678-1234-1234-1234-12345678901!';
        expect(isValidUUID(uuid)).toBe(false);
      });

      it('should reject UUID with spaces', () => {
        const uuid = '12345678-1234-1234-1234-12345678 012';
        expect(isValidUUID(uuid)).toBe(false);
      });

      it('should reject non-string values', () => {
        expect(isValidUUID(null as any)).toBe(false);
        expect(isValidUUID(undefined as any)).toBe(false);
        expect(isValidUUID(123 as any)).toBe(false);
        expect(isValidUUID({} as any)).toBe(false);
        expect(isValidUUID([] as any)).toBe(false);
      });

      it('should reject random strings', () => {
        expect(isValidUUID('not-a-uuid')).toBe(false);
        expect(isValidUUID('random-string-here')).toBe(false);
      });

      it('should reject UUID with missing segment', () => {
        const uuid = '12345678-1234--1234-123456789012';
        expect(isValidUUID(uuid)).toBe(false);
      });

      it('should reject UUID with extra dashes', () => {
        const uuid = '12345678--1234-1234-1234-123456789012';
        expect(isValidUUID(uuid)).toBe(false);
      });

      it('should reject UUID v4 with incorrect version digit (but still hex)', () => {
        // This is still a valid UUID format even if not technically v4
        const uuid = '550e8400-e29b-11d4-a716-446655440000';
        expect(isValidUUID(uuid)).toBe(true);
      });

      it('should reject partial UUID', () => {
        const uuid = '12345678-1234-1234';
        expect(isValidUUID(uuid)).toBe(false);
      });

      it('should reject UUID with leading/trailing whitespace', () => {
        const uuid = ' 12345678-1234-1234-1234-123456789012 ';
        expect(isValidUUID(uuid)).toBe(false);
      });

      it('should reject URL with UUID', () => {
        const uuid = 'https://example.com/12345678-1234-1234-1234-123456789012';
        expect(isValidUUID(uuid)).toBe(false);
      });
    });
  });
});
