import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

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
});

