import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import FlatCard from './FlatCard';
import type { DashboardFlatDto } from '../types';

describe('FlatCard Component', () => {
  // Store original window.location
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' };
  });

  afterEach(() => {
    // Restore original window.location
    window.location = originalLocation;
  });

  describe('Rendering', () => {
    it('should render flat name and address', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: 'Apartment 101',
        address: '123 Main St, Warsaw',
        debt: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      expect(screen.getByText('Apartment 101')).toBeInTheDocument();
      expect(screen.getByText('123 Main St, Warsaw')).toBeInTheDocument();
    });

    it('should render both action buttons', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: 'Test Flat',
        address: 'Test Address',
        debt: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /payments/i })).toBeInTheDocument();
    });
  });

  describe('Debt Status Display', () => {
    it('should show "Paid" status when debt is zero', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: 'Test Flat',
        address: 'Test Address',
        debt: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      expect(screen.getByText('Paid')).toBeInTheDocument();
      expect(screen.getByText('Paid')).toHaveClass('text-green-600');
    });

    it('should show "Outstanding" status when debt is greater than zero', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: 'Test Flat',
        address: 'Test Address',
        debt: 500,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      expect(screen.getByText('Outstanding')).toBeInTheDocument();
      expect(screen.getByText('Outstanding')).toHaveClass('text-destructive');
    });

    it('should show "Outstanding" status for small debt amounts (edge case)', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: 'Test Flat',
        address: 'Test Address',
        debt: 0.01, // 1 grosz
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      expect(screen.getByText('Outstanding')).toBeInTheDocument();
    });

    it('should handle very large debt amounts', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: 'Test Flat',
        address: 'Test Address',
        debt: 999999.99,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      expect(screen.getByText('Outstanding')).toBeInTheDocument();
      expect(screen.getByText(/999 999,99\s*zł/)).toBeInTheDocument();
    });
  });

  describe('Currency Formatting', () => {
    it('should format zero debt in Polish currency format', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: 'Test Flat',
        address: 'Test Address',
        debt: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      // Polish format: "0,00\s*zł"
      expect(screen.getByText(/0,00\s*zł/)).toBeInTheDocument();
    });

    it('should format positive debt with thousands separator', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: 'Test Flat',
        address: 'Test Address',
        debt: 1234.56,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      // Polish format: may have nbsp in thousands and before zł
      expect(screen.getByText(/1\s?234,56\s*zł/)).toBeInTheDocument();
    });

    it('should format debt with two decimal places', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: 'Test Flat',
        address: 'Test Address',
        debt: 100.5,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      // Should show 100,50\s*zł (not 100,5 zł)
      expect(screen.getByText(/100,50\s*zł/)).toBeInTheDocument();
    });

    it('should format small decimal amounts correctly', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: 'Test Flat',
        address: 'Test Address',
        debt: 0.99,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      expect(screen.getByText(/0,99\s*zł/)).toBeInTheDocument();
    });
  });

  describe('CSS Classes for Debt Amount', () => {
    it('should apply green color class when debt is zero', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: 'Test Flat',
        address: 'Test Address',
        debt: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      const { container } = render(<FlatCard flat={flat} />);
      const debtAmount = container.querySelector('.text-lg.font-bold');

      expect(debtAmount).toHaveClass('text-green-600');
      expect(debtAmount).not.toHaveClass('text-destructive');
    });

    it('should apply destructive color class when debt is positive', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: 'Test Flat',
        address: 'Test Address',
        debt: 100,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      const { container } = render(<FlatCard flat={flat} />);
      const debtAmount = container.querySelector('.text-lg.font-bold');

      expect(debtAmount).toHaveClass('text-destructive');
      expect(debtAmount).not.toHaveClass('text-green-600');
    });
  });

  describe('Navigation', () => {
    it('should navigate to flat details when "View Details" is clicked', async () => {
      const user = userEvent.setup();
      const flat: DashboardFlatDto = {
        id: 'flat-123',
        name: 'Test Flat',
        address: 'Test Address',
        debt: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      const viewDetailsButton = screen.getByRole('button', { name: /view details/i });
      await user.click(viewDetailsButton);

      expect(window.location.href).toBe('/flats/flat-123');
    });

    it('should navigate to payments page when "Payments" is clicked', async () => {
      const user = userEvent.setup();
      const flat: DashboardFlatDto = {
        id: 'flat-456',
        name: 'Test Flat',
        address: 'Test Address',
        debt: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      const paymentsButton = screen.getByRole('button', { name: /payments/i });
      await user.click(paymentsButton);

      expect(window.location.href).toBe('/flats/flat-456/payments');
    });

    it('should handle special characters in flat ID', async () => {
      const user = userEvent.setup();
      const flat: DashboardFlatDto = {
        id: 'uuid-with-dashes-123-456',
        name: 'Test Flat',
        address: 'Test Address',
        debt: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      const viewDetailsButton = screen.getByRole('button', { name: /view details/i });
      await user.click(viewDetailsButton);

      expect(window.location.href).toBe('/flats/uuid-with-dashes-123-456');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty flat name gracefully', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: '',
        address: 'Test Address',
        debt: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      // Should still render the card
      expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
    });

    it('should handle empty address gracefully', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: 'Test Flat',
        address: '',
        debt: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      expect(screen.getByText('Test Flat')).toBeInTheDocument();
    });

    it('should handle very long flat name', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: 'A'.repeat(100),
        address: 'Test Address',
        debt: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('should handle very long address', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: 'Test Flat',
        address: 'Very Long Address That Contains Many Words And Numbers 123456789'.repeat(3),
        debt: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
    });

    it('should handle negative debt (edge case that shouldn\'t happen)', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: 'Test Flat',
        address: 'Test Address',
        debt: -100, // Shouldn't happen in production
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      // Should show "Paid" because debt <= 0
      expect(screen.getByText('Paid')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: 'Test Flat',
        address: 'Test Address',
        debt: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });

    it('should have descriptive button text', () => {
      const flat: DashboardFlatDto = {
        id: '1',
        name: 'Test Flat',
        address: 'Test Address',
        debt: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      render(<FlatCard flat={flat} />);

      expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /payments/i })).toBeInTheDocument();
    });
  });
});

