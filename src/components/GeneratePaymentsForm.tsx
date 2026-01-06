import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Calendar, Loader2 } from "lucide-react";
import type { PaymentTypeDto, GeneratePaymentsCommand } from "../types";
import { getMonthName } from "../lib/formatters";
import { usePaymentGeneration } from "./hooks/usePaymentGeneration";
import { usePaymentPreview } from "./hooks/usePaymentPreview";
import { useNavigation } from "./hooks/useNavigation";
import PaymentGenerationSuccess from "./PaymentGenerationSuccess";

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
}

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
  const navigation = useNavigation();
  const [formState, setFormState] = useState<FormState>({
    month: currentMonth,
    year: currentYear,
    errors: {},
  });

  const { generate, isGenerating, result } = usePaymentGeneration({
    flatId,
  });

  // Calculate preview based on current selections
  const preview = usePaymentPreview(paymentTypes);

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
    navigation.goToFlat(flatId);
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
    await generate(command);
  };

  const handleViewPayments = () => {
    navigation.goToFlatWithParams(flatId, {
      month: formState.month,
      year: formState.year,
    });
  };

  const handleReset = () => {
    setFormState({
      month: currentMonth,
      year: currentYear,
      errors: {},
    });
  };

  // If success, show success state
  if (result) {
    return (
      <PaymentGenerationSuccess
        result={result}
        onViewPayments={handleViewPayments}
        onReset={handleReset}
      />
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
        <Button variant="outline" onClick={handleCancel} disabled={isGenerating}>
          Cancel
        </Button>
        <Button onClick={handleGenerate} disabled={!isFormValid || isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              Generate Payments
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

