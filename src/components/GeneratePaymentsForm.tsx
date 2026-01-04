import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { PaymentTypeDto, GeneratePaymentsCommand, GeneratePaymentsResponseDto } from "../types";

interface GeneratePaymentsFormProps {
  flatId: string;
  flatName: string;
  paymentTypes: PaymentTypeDto[];
  currentMonth: number;
  currentYear: number;
}

interface FormState {
  month: number;
  year: number;
  errors: {
    month?: string;
    year?: string;
  };
  isSubmitting: boolean;
}

interface PaymentPreviewItem {
  paymentTypeId: string;
  paymentTypeName: string;
  amount: number;
  formattedAmount: string;
}

interface PreviewSummary {
  count: number;
  totalAmount: number;
  formattedTotalAmount: string;
}

// Helper: Format currency (PLN)
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount);
};

// Helper: Format month name
const getMonthName = (month: number): string => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[month - 1] || "";
};

// Helper: Validate form
const validateForm = (month: number, year: number): { month?: string; year?: string } => {
  const errors: { month?: string; year?: string } = {};

  if (month < 1 || month > 12) {
    errors.month = "Month must be between 1 and 12";
  }

  if (year < 1900 || year > 2100) {
    errors.year = "Year must be between 1900 and 2100";
  }

  return errors;
};

export default function GeneratePaymentsForm({
  flatId,
  flatName,
  paymentTypes,
  currentMonth,
  currentYear,
}: GeneratePaymentsFormProps) {
  const [formState, setFormState] = useState<FormState>({
    month: currentMonth,
    year: currentYear,
    errors: {},
    isSubmitting: false,
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [generationResult, setGenerationResult] = useState<GeneratePaymentsResponseDto | null>(null);

  // Calculate preview based on current selections
  const preview = useMemo(() => {
    const items: PaymentPreviewItem[] = paymentTypes.map((pt) => ({
      paymentTypeId: pt.id,
      paymentTypeName: pt.name,
      amount: pt.base_amount,
      formattedAmount: formatCurrency(pt.base_amount),
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    const summary: PreviewSummary = {
      count: items.length,
      totalAmount,
      formattedTotalAmount: formatCurrency(totalAmount),
    };

    return { items, summary };
  }, [paymentTypes]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    const errors = validateForm(formState.month, formState.year);
    return Object.keys(errors).length === 0;
  }, [formState.month, formState.year]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value, 10);
    setFormState((prev) => ({
      ...prev,
      month,
      errors: { ...prev.errors, month: undefined },
    }));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value, 10);
    setFormState((prev) => ({
      ...prev,
      year,
      errors: { ...prev.errors, year: undefined },
    }));
  };

  const handleCancel = () => {
    window.location.href = `/flats/${flatId}`;
  };

  const handleGenerate = async () => {
    // Validate form
    const errors = validateForm(formState.month, formState.year);
    if (Object.keys(errors).length > 0) {
      setFormState((prev) => ({ ...prev, errors }));
      return;
    }

    // Prepare command
    const command: GeneratePaymentsCommand = {
      month: formState.month,
      year: formState.year,
    };

    // Submit
    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const response = await fetch(`/api/flats/${flatId}/payments/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        // Handle error
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate payments");
      }

      const result: GeneratePaymentsResponseDto = await response.json();

      // Success
      setGenerationResult(result);
      setIsSuccess(true);
    } catch (error) {
      // Show error (for now, alert - should use toast)
      alert(error instanceof Error ? error.message : "Failed to generate payments");
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleViewPayments = () => {
    window.location.href = `/flats/${flatId}?month=${formState.month}&year=${formState.year}`;
  };

  // If success, show success state
  if (isSuccess && generationResult) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 p-3">
            <svg
              className="h-12 w-12 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-green-900 mb-2">
          Payments Generated Successfully
        </h2>
        <p className="text-green-700 mb-6">
          {generationResult.generated_count} payment{generationResult.generated_count !== 1 ? "s" : ""}{" "}
          generated for {getMonthName(generationResult.month)} {generationResult.year}
        </p>
        <div className="space-y-3">
          <Button onClick={handleViewPayments} className="w-full sm:w-auto">
            View Payments
          </Button>
          <div>
            <button
              onClick={() => setIsSuccess(false)}
              className="text-green-700 hover:text-green-900 text-sm font-medium"
            >
              Generate More Payments
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="space-y-6">
      {/* Date Selection Section */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Select Month and Year</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Month Select */}
          <div>
            <label htmlFor="month" className="mb-2 block text-sm font-medium text-gray-700">
              Month
            </label>
            <select
              id="month"
              value={formState.month}
              onChange={handleMonthChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={1}>January</option>
              <option value={2}>February</option>
              <option value={3}>March</option>
              <option value={4}>April</option>
              <option value={5}>May</option>
              <option value={6}>June</option>
              <option value={7}>July</option>
              <option value={8}>August</option>
              <option value={9}>September</option>
              <option value={10}>October</option>
              <option value={11}>November</option>
              <option value={12}>December</option>
            </select>
            {formState.errors.month && (
              <p className="mt-1 text-sm text-red-600">{formState.errors.month}</p>
            )}
          </div>

          {/* Year Input */}
          <div>
            <label htmlFor="year" className="mb-2 block text-sm font-medium text-gray-700">
              Year
            </label>
            <Input
              id="year"
              type="number"
              value={formState.year}
              onChange={handleYearChange}
              min={1900}
              max={2100}
              placeholder="YYYY"
              className="w-full"
            />
            {formState.errors.year && (
              <p className="mt-1 text-sm text-red-600">{formState.errors.year}</p>
            )}
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Preview</h2>
        <p className="mb-4 text-sm text-gray-600">
          The following payments will be generated for {getMonthName(formState.month)}{" "}
          {formState.year}
        </p>

        {/* Preview List */}
        <div className="space-y-2 mb-4">
          {preview.items.map((item) => (
            <div
              key={item.paymentTypeId}
              className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-3"
            >
              <span className="font-medium text-gray-900">{item.paymentTypeName}</span>
              <span className="text-gray-700">{item.formattedAmount}</span>
            </div>
          ))}
        </div>

        {/* Preview Summary */}
        <div className="rounded-md border-2 border-blue-200 bg-blue-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-blue-900">
              Total ({preview.summary.count} payment{preview.summary.count !== 1 ? "s" : ""})
            </span>
            <span className="text-xl font-bold text-blue-900">
              {preview.summary.formattedTotalAmount}
            </span>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={handleCancel} disabled={formState.isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={!isFormValid || formState.isSubmitting}
          className="relative"
        >
          {formState.isSubmitting ? (
            <>
              <span className="opacity-0">Generate Payments</span>
              <span className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </span>
            </>
          ) : (
            "Generate Payments"
          )}
        </Button>
      </div>
    </div>
  );
}

