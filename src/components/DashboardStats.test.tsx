import { describe, it, expect } from "vitest";
import { render, screen, within } from "@/test/test-utils";
import DashboardStats from "./DashboardStats";
import type { DashboardFlatDto } from "../types";

describe("DashboardStats Component", () => {
  describe("Rendering", () => {
    it("should render all four stat cards", () => {
      const flats: DashboardFlatDto[] = [];
      render(<DashboardStats flats={flats} />);

      expect(screen.getByText("Total Flats")).toBeInTheDocument();
      expect(screen.getByText("Total Debt")).toBeInTheDocument();
      expect(screen.getByText("With Debt")).toBeInTheDocument();
      expect(screen.getByText("Paid Up")).toBeInTheDocument();
    });

    it("should render stat descriptions", () => {
      const flats: DashboardFlatDto[] = [];
      render(<DashboardStats flats={flats} />);

      expect(screen.getByText("Properties managed")).toBeInTheDocument();
      expect(screen.getByText("Outstanding payments")).toBeInTheDocument();
      expect(screen.getByText("Need attention")).toBeInTheDocument();
      expect(screen.getByText("All settled")).toBeInTheDocument();
    });

    it("should render all stat icons", () => {
      const flats: DashboardFlatDto[] = [];
      const { container } = render(<DashboardStats flats={flats} />);

      const icons = container.querySelectorAll("svg");
      expect(icons).toHaveLength(4); // One icon per stat card
    });
  });

  describe("Total Flats Calculation", () => {
    it("should show 0 when no flats", () => {
      const flats: DashboardFlatDto[] = [];
      render(<DashboardStats flats={flats} />);

      // Find by getting the parent card element
      const totalFlatsCard = screen.getByText("Total Flats").closest('[data-slot="card"]');
      expect(within(totalFlatsCard!).getByText("0")).toBeInTheDocument();
    });

    it("should show correct count for single flat", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      const totalFlatsCard = screen.getByText("Total Flats").closest('[data-slot="card"]');
      expect(within(totalFlatsCard!).getByText("1")).toBeInTheDocument();
    });

    it("should show correct count for multiple flats", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 100,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Flat 2",
          address: "Address 2",
          debt: 200,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "3",
          name: "Flat 3",
          address: "Address 3",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      const totalFlatsCard = screen.getByText("Total Flats").closest('[data-slot="card"]');
      expect(within(totalFlatsCard!).getByText("3")).toBeInTheDocument();
    });

    it("should handle large number of flats", () => {
      const flats: DashboardFlatDto[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        name: `Flat ${i}`,
        address: `Address ${i}`,
        debt: 0,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      }));
      render(<DashboardStats flats={flats} />);

      const totalFlatsCard = screen.getByText("Total Flats").closest('[data-slot="card"]');
      expect(within(totalFlatsCard!).getByText("1000")).toBeInTheDocument();
    });
  });

  describe("Total Debt Calculation", () => {
    it("should show 0,00 zł when no flats", () => {
      const flats: DashboardFlatDto[] = [];
      render(<DashboardStats flats={flats} />);

      // Polish locale adds non-breaking space before zł
      expect(screen.getByText(/0,00\s*zł/)).toBeInTheDocument();
    });

    it("should show 0,00 zł when all flats have zero debt", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Flat 2",
          address: "Address 2",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      expect(screen.getByText(/0,00\s*zł/)).toBeInTheDocument();
    });

    it("should calculate total debt correctly for single flat", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 1234.56,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      // Polish format: 1234,56 zł (may have nbsp before zł)
      expect(screen.getByText(/1\s?234,56\s*zł/)).toBeInTheDocument();
    });

    it("should calculate total debt correctly for multiple flats", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 100,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Flat 2",
          address: "Address 2",
          debt: 200,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "3",
          name: "Flat 3",
          address: "Address 3",
          debt: 300.5,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      // Total: 600.50 zł -> Polish format: 600,50\s*zł
      expect(screen.getByText(/600,50\s*zł/)).toBeInTheDocument();
    });

    it("should handle very large total debt", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 999999.99,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      expect(screen.getByText(/999 999,99\s*zł/)).toBeInTheDocument();
    });

    it("should handle mixed debt and paid flats", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 500,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Flat 2",
          address: "Address 2",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "3",
          name: "Flat 3",
          address: "Address 3",
          debt: 250.75,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      // Total: 750.75 zł
      expect(screen.getByText(/750,75\s*zł/)).toBeInTheDocument();
    });

    it("should format decimal amounts with two decimal places", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 100.5,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      // Should show 100,50\s*zł (not 100,5 zł)
      expect(screen.getByText(/100,50\s*zł/)).toBeInTheDocument();
    });
  });

  describe("Flats With Debt Calculation", () => {
    it("should show 0 when no flats have debt", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Flat 2",
          address: "Address 2",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      const withDebtCard = screen.getByText("With Debt").closest('[data-slot="card"]');
      expect(within(withDebtCard!).getByText("0")).toBeInTheDocument();
    });

    it("should count flats with any positive debt", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 100,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Flat 2",
          address: "Address 2",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "3",
          name: "Flat 3",
          address: "Address 3",
          debt: 0.01,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      const withDebtCard = screen.getByText("With Debt").closest('[data-slot="card"]');
      expect(within(withDebtCard!).getByText("2")).toBeInTheDocument();
    });

    it("should not count flats with zero debt", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 100,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Flat 2",
          address: "Address 2",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      const withDebtCard = screen.getByText("With Debt").closest('[data-slot="card"]');
      expect(within(withDebtCard!).getByText("1")).toBeInTheDocument();
    });

    it("should handle edge case of very small debt (0.01)", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 0.01,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      const withDebtCard = screen.getByText("With Debt").closest('[data-slot="card"]');
      expect(within(withDebtCard!).getByText("1")).toBeInTheDocument();
    });
  });

  describe("Flats Paid Up Calculation", () => {
    it("should count flats with zero debt", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Flat 2",
          address: "Address 2",
          debt: 100,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "3",
          name: "Flat 3",
          address: "Address 3",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      const paidUpCard = screen.getByText("Paid Up").closest('[data-slot="card"]');
      expect(within(paidUpCard!).getByText("2")).toBeInTheDocument();
    });

    it("should show 0 when no flats are paid up", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 100,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Flat 2",
          address: "Address 2",
          debt: 200,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      const paidUpCard = screen.getByText("Paid Up").closest('[data-slot="card"]');
      expect(within(paidUpCard!).getByText("0")).toBeInTheDocument();
    });

    it("should show all flats when all are paid up", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Flat 2",
          address: "Address 2",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "3",
          name: "Flat 3",
          address: "Address 3",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      const paidUpCard = screen.getByText("Paid Up").closest('[data-slot="card"]');
      expect(within(paidUpCard!).getByText("3")).toBeInTheDocument();
    });

    it("should not count flats with small debt as paid up", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Flat 2",
          address: "Address 2",
          debt: 0.01,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      const paidUpCard = screen.getByText("Paid Up").closest('[data-slot="card"]');
      expect(within(paidUpCard!).getByText("1")).toBeInTheDocument();
    });
  });

  describe("Conditional Styling", () => {
    it("should apply destructive color when total debt is positive", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 100,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      const { container } = render(<DashboardStats flats={flats} />);

      // Check Total Debt card has destructive styling
      const totalDebtCard = screen.getByText("Total Debt").closest('[data-slot="card"]')?.parentElement;
      const icon = totalDebtCard?.querySelector(".text-destructive");
      expect(icon).toBeInTheDocument();
    });

    it("should not apply destructive color when total debt is zero", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      const totalDebtCard = screen.getByText("Total Debt").closest('[data-slot="card"]')?.parentElement;
      const icon = totalDebtCard?.querySelector(".text-muted-foreground");
      expect(icon).toBeInTheDocument();
    });

    it("should apply destructive color when flats have debt", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 100,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      const withDebtCard = screen.getByText("With Debt").closest('[data-slot="card"]')?.parentElement;
      const icon = withDebtCard?.querySelector(".text-destructive");
      expect(icon).toBeInTheDocument();
    });

    it("should apply green color to Paid Up card", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      const paidUpCard = screen.getByText("Paid Up").closest('[data-slot="card"]')?.parentElement;
      const icon = paidUpCard?.querySelector(".text-green-600");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty flats array", () => {
      const flats: DashboardFlatDto[] = [];
      render(<DashboardStats flats={flats} />);

      expect(screen.getByText("Total Flats")).toBeInTheDocument();
      expect(screen.getByText(/0,00\s*zł/)).toBeInTheDocument();
    });

    it("should handle negative debt (edge case that shouldn't happen)", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: -100,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      // Negative debt is not counted as "paid up" (only debt === 0)
      // With debt > 0: 0, Paid up (debt === 0): 0
      const paidUpCard = screen.getByText("Paid Up").closest('[data-slot="card"]');
      expect(within(paidUpCard!).getByText("0")).toBeInTheDocument();

      const withDebtCard = screen.getByText("With Debt").closest('[data-slot="card"]');
      expect(within(withDebtCard!).getByText("0")).toBeInTheDocument();
    });

    it("should verify with debt + paid up = total flats", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 100,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Flat 2",
          address: "Address 2",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "3",
          name: "Flat 3",
          address: "Address 3",
          debt: 200,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "4",
          name: "Flat 4",
          address: "Address 4",
          debt: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      const totalFlatsCard = screen.getByText("Total Flats").closest('[data-slot="card"]');
      const withDebtCard = screen.getByText("With Debt").closest('[data-slot="card"]');
      const paidUpCard = screen.getByText("Paid Up").closest('[data-slot="card"]');

      expect(within(totalFlatsCard!).getByText("4")).toBeInTheDocument();
      expect(within(withDebtCard!).getByText("2")).toBeInTheDocument();
      expect(within(paidUpCard!).getByText("2")).toBeInTheDocument();
    });

    it("should handle floating point precision issues", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 0.1,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Flat 2",
          address: "Address 2",
          debt: 0.2,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      // 0.1 + 0.2 should be displayed as 0,30 zł (not 0.30000000000000004)
      expect(screen.getByText(/0,30 zł/)).toBeInTheDocument();
    });
  });

  describe("Responsive Grid Layout", () => {
    it("should render with responsive grid classes", () => {
      const flats: DashboardFlatDto[] = [];
      const { container } = render(<DashboardStats flats={flats} />);

      const gridContainer = container.querySelector(".grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4");
      expect(gridContainer).toBeInTheDocument();
    });

    it("should render four cards in the grid", () => {
      const flats: DashboardFlatDto[] = [];
      const { container } = render(<DashboardStats flats={flats} />);

      const cards = container.querySelectorAll('[class*="grid"] > div');
      expect(cards.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("Polish Currency Format", () => {
    it("should use Polish locale with PLN currency", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 1000,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      // Polish format uses comma as decimal separator and space before zł
      expect(screen.getByText(/1\s?000,00\s*zł/)).toBeInTheDocument();
    });

    it("should always show two decimal places", () => {
      const flats: DashboardFlatDto[] = [
        {
          id: "1",
          name: "Flat 1",
          address: "Address 1",
          debt: 5,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      render(<DashboardStats flats={flats} />);

      // Should show 5,00\s*zł (not 5 zł)
      expect(screen.getByText(/5,00\s*zł/)).toBeInTheDocument();
    });
  });
});
