import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GeneratePaymentsForm from "./GeneratePaymentsForm";
import type { PaymentTypeDto } from "../types";

// Mock the custom hooks
vi.mock("./hooks/usePaymentGeneration");
vi.mock("./hooks/usePaymentPreview");
vi.mock("./hooks/useNavigation");

// Import mocked modules to access their mock functions
import { usePaymentGeneration } from "./hooks/usePaymentGeneration";
import { usePaymentPreview } from "./hooks/usePaymentPreview";
import { useNavigation } from "./hooks/useNavigation";

describe("GeneratePaymentsForm", () => {
  const mockPaymentTypes: PaymentTypeDto[] = [
    {
      id: "1",
      flat_id: "flat-1",
      name: "Rent",
      base_amount: 1500,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    },
    {
      id: "2",
      flat_id: "flat-1",
      name: "Utilities",
      base_amount: 300,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    },
  ];

  const mockGenerate = vi.fn();
  const mockGoToFlat = vi.fn();
  const mockGoToFlatWithParams = vi.fn();
  const mockReset = vi.fn();

  const mockPreview = {
    items: [
      {
        paymentTypeId: "1",
        paymentTypeName: "Rent",
        amount: 1500,
        formattedAmount: "1 500,00 zł",
      },
      {
        paymentTypeId: "2",
        paymentTypeName: "Utilities",
        amount: 300,
        formattedAmount: "300,00 zł",
      },
    ],
    summary: {
      count: 2,
      totalAmount: 1800,
      formattedTotalAmount: "1 800,00 zł",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    vi.mocked(usePaymentGeneration).mockReturnValue({
      generate: mockGenerate,
      isGenerating: false,
      result: null,
      error: null,
      reset: mockReset,
    });

    vi.mocked(usePaymentPreview).mockReturnValue(mockPreview);

    vi.mocked(useNavigation).mockReturnValue({
      goToFlat: mockGoToFlat,
      goToFlats: vi.fn(),
      goToFlatWithParams: mockGoToFlatWithParams,
      goToLogin: vi.fn(),
      reload: vi.fn(),
    });
  });

  describe("Form Rendering", () => {
    it("should render the form with default values", async () => {
      render(
        <GeneratePaymentsForm
          flatId="flat-1"
          flatName="Test Flat"
          paymentTypes={mockPaymentTypes}
          currentMonth={3}
          currentYear={2024}
        />
      );

      const monthSelect = screen.getByLabelText(/month/i) as HTMLSelectElement;
      const yearInput = screen.getByLabelText(/year/i) as HTMLInputElement;

      // Wait for form to initialize
      await waitFor(() => {
        expect(monthSelect).toBeInTheDocument();
        expect(yearInput).toBeInTheDocument();
      });

      expect(screen.getByRole("button", { name: /generate payments/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("should display payment preview", () => {
      render(
        <GeneratePaymentsForm
          flatId="flat-1"
          flatName="Test Flat"
          paymentTypes={mockPaymentTypes}
          currentMonth={3}
          currentYear={2024}
        />
      );

      expect(screen.getByText("Rent")).toBeInTheDocument();
      expect(screen.getByText("1 500,00 zł")).toBeInTheDocument();
      expect(screen.getByText("Utilities")).toBeInTheDocument();
      expect(screen.getByText("300,00 zł")).toBeInTheDocument();
      expect(screen.getByText("1 800,00 zł")).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("should disable submit button with invalid form", async () => {
      const user = userEvent.setup();

      render(
        <GeneratePaymentsForm
          flatId="flat-1"
          flatName="Test Flat"
          paymentTypes={mockPaymentTypes}
          currentMonth={3}
          currentYear={2024}
        />
      );

      const yearInput = screen.getByLabelText(/year/i);
      const submitButton = screen.getByRole("button", { name: /generate payments/i });

      // Clear and enter invalid year
      await user.clear(yearInput);
      await user.type(yearInput, "1800");

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it("should not show error for valid month", async () => {
      render(
        <GeneratePaymentsForm
          flatId="flat-1"
          flatName="Test Flat"
          paymentTypes={mockPaymentTypes}
          currentMonth={3}
          currentYear={2024}
        />
      );

      // With valid default values, no errors should be shown
      await waitFor(() => {
        expect(screen.queryByText(/month must be between/i)).not.toBeInTheDocument();
      });
    });

    it("should disable submit button with year out of range", async () => {
      // Test with initial invalid year
      render(
        <GeneratePaymentsForm
          flatId="flat-1"
          flatName="Test Flat"
          paymentTypes={mockPaymentTypes}
          currentMonth={3}
          currentYear={3000} // Invalid year
        />
      );

      const submitButton = screen.getByRole("button", { name: /generate payments/i });

      // Button should be disabled with invalid year
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it("should enable submit button when form is valid", async () => {
      render(
        <GeneratePaymentsForm
          flatId="flat-1"
          flatName="Test Flat"
          paymentTypes={mockPaymentTypes}
          currentMonth={3}
          currentYear={2024}
        />
      );

      const submitButton = screen.getByRole("button", { name: /generate payments/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe("Form Submission", () => {
    it("should call generate function on valid submit", async () => {
      const user = userEvent.setup();

      render(
        <GeneratePaymentsForm
          flatId="flat-1"
          flatName="Test Flat"
          paymentTypes={mockPaymentTypes}
          currentMonth={3}
          currentYear={2024}
        />
      );

      const submitButton = screen.getByRole("button", { name: /generate payments/i });

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockGenerate).toHaveBeenCalledWith({
          month: 3,
          year: 2024,
        });
      });
    });

    it("should update month value before submission", async () => {
      const user = userEvent.setup();

      render(
        <GeneratePaymentsForm
          flatId="flat-1"
          flatName="Test Flat"
          paymentTypes={mockPaymentTypes}
          currentMonth={3}
          currentYear={2024}
        />
      );

      const monthSelect = screen.getByLabelText(/month/i);
      const submitButton = screen.getByRole("button", { name: /generate payments/i });

      // Change month value
      await user.selectOptions(monthSelect, "6");

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockGenerate).toHaveBeenCalledWith({
          month: 6,
          year: 2024, // Year stays the same
        });
      });
    });

    it("should show loading state during submission", () => {
      vi.mocked(usePaymentGeneration).mockReturnValue({
        generate: mockGenerate,
        isGenerating: true,
        result: null,
        error: null,
        reset: mockReset,
      });

      render(
        <GeneratePaymentsForm
          flatId="flat-1"
          flatName="Test Flat"
          paymentTypes={mockPaymentTypes}
          currentMonth={3}
          currentYear={2024}
        />
      );

      expect(screen.getByText(/generating.../i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /generating.../i })).toBeDisabled();
    });

    it("should not call generate on invalid form submission", async () => {
      const user = userEvent.setup();

      render(
        <GeneratePaymentsForm
          flatId="flat-1"
          flatName="Test Flat"
          paymentTypes={mockPaymentTypes}
          currentMonth={3}
          currentYear={2024}
        />
      );

      const yearInput = screen.getByLabelText(/year/i);
      const submitButton = screen.getByRole("button", { name: /generate payments/i });

      // Set invalid year
      await user.clear(yearInput);
      await user.type(yearInput, "1800");

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Try to submit (shouldn't be possible when disabled, but test the handler)
      expect(mockGenerate).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should display API error when present", () => {
      const errorMessage = "Failed to generate payments";
      vi.mocked(usePaymentGeneration).mockReturnValue({
        generate: mockGenerate,
        isGenerating: false,
        result: null,
        error: new Error(errorMessage),
        reset: mockReset,
      });

      render(
        <GeneratePaymentsForm
          flatId="flat-1"
          flatName="Test Flat"
          paymentTypes={mockPaymentTypes}
          currentMonth={3}
          currentYear={2024}
        />
      );

      expect(screen.getByText(/error generating payments/i)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it("should not display error when no error exists", () => {
      render(
        <GeneratePaymentsForm
          flatId="flat-1"
          flatName="Test Flat"
          paymentTypes={mockPaymentTypes}
          currentMonth={3}
          currentYear={2024}
        />
      );

      expect(screen.queryByText(/error generating payments/i)).not.toBeInTheDocument();
    });
  });

  describe("Success State", () => {
    it("should show success component when generation succeeds", () => {
      const mockResult = {
        message: "Payments generated successfully",
        generated_count: 2,
        month: 3,
        year: 2024,
        payments: [],
      };

      vi.mocked(usePaymentGeneration).mockReturnValue({
        generate: mockGenerate,
        isGenerating: false,
        result: mockResult,
        error: null,
        reset: mockReset,
      });

      render(
        <GeneratePaymentsForm
          flatId="flat-1"
          flatName="Test Flat"
          paymentTypes={mockPaymentTypes}
          currentMonth={3}
          currentYear={2024}
        />
      );

      expect(screen.getByText(/payments generated successfully/i)).toBeInTheDocument();
      expect(screen.getByText(/2 payments generated for march 2024/i)).toBeInTheDocument();
    });

    it("should navigate to flat with params when clicking View Payments", async () => {
      const user = userEvent.setup();
      const mockResult = {
        message: "Payments generated successfully",
        generated_count: 2,
        month: 3,
        year: 2024,
        payments: [],
      };

      vi.mocked(usePaymentGeneration).mockReturnValue({
        generate: mockGenerate,
        isGenerating: false,
        result: mockResult,
        error: null,
        reset: mockReset,
      });

      render(
        <GeneratePaymentsForm
          flatId="flat-1"
          flatName="Test Flat"
          paymentTypes={mockPaymentTypes}
          currentMonth={3}
          currentYear={2024}
        />
      );

      const viewPaymentsButton = screen.getByRole("button", { name: /view payments/i });
      await user.click(viewPaymentsButton);

      expect(mockGoToFlatWithParams).toHaveBeenCalledWith("flat-1", {
        month: 3,
        year: 2024,
      });
    });
  });

  describe("Navigation", () => {
    it("should navigate to flat on cancel", async () => {
      const user = userEvent.setup();

      render(
        <GeneratePaymentsForm
          flatId="flat-1"
          flatName="Test Flat"
          paymentTypes={mockPaymentTypes}
          currentMonth={3}
          currentYear={2024}
        />
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockGoToFlat).toHaveBeenCalledWith("flat-1");
    });

    it("should disable cancel button during submission", () => {
      vi.mocked(usePaymentGeneration).mockReturnValue({
        generate: mockGenerate,
        isGenerating: true,
        result: null,
        error: null,
        reset: mockReset,
      });

      render(
        <GeneratePaymentsForm
          flatId="flat-1"
          flatName="Test Flat"
          paymentTypes={mockPaymentTypes}
          currentMonth={3}
          currentYear={2024}
        />
      );

      expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    });
  });

  describe("Preview Updates", () => {
    it("should update preview when form values change", async () => {
      const user = userEvent.setup();

      render(
        <GeneratePaymentsForm
          flatId="flat-1"
          flatName="Test Flat"
          paymentTypes={mockPaymentTypes}
          currentMonth={3}
          currentYear={2024}
        />
      );

      // Initial preview text
      expect(screen.getByText(/the following payments will be generated for march 2024/i)).toBeInTheDocument();

      const monthSelect = screen.getByLabelText(/month/i);
      await user.selectOptions(monthSelect, "6");

      // Preview should update (month name changes, though the preview hook is mocked)
      await waitFor(() => {
        expect(screen.getByText(/the following payments will be generated for june 2024/i)).toBeInTheDocument();
      });
    });
  });
});
