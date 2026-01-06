import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Calendar, Loader2, AlertCircle } from "lucide-react";
import type { PaymentTypeDto } from "../types";
import { getMonthName } from "../lib/formatters";
import { usePaymentGeneration } from "./hooks/usePaymentGeneration";
import { usePaymentPreview } from "./hooks/usePaymentPreview";
import { useNavigation } from "./hooks/useNavigation";
import PaymentGenerationSuccess from "./PaymentGenerationSuccess";
import { paymentGenerationSchema, type PaymentGenerationFormData } from "../lib/validation/payment-generation.schema";

interface GeneratePaymentsFormProps {
  flatId: string;
  flatName: string;
  paymentTypes: PaymentTypeDto[];
  currentMonth: number;
  currentYear: number;
}

export default function GeneratePaymentsForm({
  flatId,
  paymentTypes,
  currentMonth,
  currentYear,
}: GeneratePaymentsFormProps) {
  const navigation = useNavigation();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<PaymentGenerationFormData>({
    resolver: zodResolver(paymentGenerationSchema),
    mode: "onChange",
    defaultValues: {
      month: currentMonth,
      year: currentYear,
    },
  });

  // Watch form values for preview
  const formValues = watch();

  // Payment generation hook
  const {
    generate,
    isGenerating,
    result,
    error: apiError,
  } = usePaymentGeneration({
    flatId,
  });

  // Calculate preview based on current form values
  const preview = usePaymentPreview(paymentTypes);

  // Form submit handler
  const onSubmit = handleSubmit(async (data) => {
    await generate(data);
  });

  const handleCancel = () => {
    navigation.goToFlat(flatId);
  };

  const handleViewPayments = () => {
    navigation.goToFlatWithParams(flatId, {
      month: formValues.month,
      year: formValues.year,
    });
  };

  const handleReset = () => {
    reset({
      month: currentMonth,
      year: currentYear,
    });
  };

  // If success, show success state
  if (result) {
    return <PaymentGenerationSuccess result={result} onViewPayments={handleViewPayments} onReset={handleReset} />;
  }

  // Main form
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* API Error Display */}
      {apiError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900">Error Generating Payments</h3>
              <p className="mt-1 text-sm text-red-700">{apiError.message}</p>
            </div>
          </div>
        </div>
      )}

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
              {...register("month", { valueAsNumber: true })}
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
            {errors.month && <p className="mt-1 text-sm text-red-600">{errors.month.message}</p>}
          </div>

          {/* Year Input */}
          <div>
            <label htmlFor="year" className="mb-2 block text-sm font-medium text-gray-700">
              Year
            </label>
            <Input
              id="year"
              type="number"
              {...register("year", { valueAsNumber: true })}
              min={1900}
              max={2100}
              placeholder="YYYY"
              className="w-full"
            />
            {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>}
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Preview</h2>
        <p className="mb-4 text-sm text-gray-600">
          The following payments will be generated for {getMonthName(formValues.month)} {formValues.year}
        </p>

        {/* Preview List */}
        <div className="space-y-2 mb-4">
          {preview.items.map((item) => (
            <div key={item.paymentTypeId} className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-3">
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
            <span className="text-xl font-bold text-blue-900">{preview.summary.formattedTotalAmount}</span>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isGenerating}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid || isGenerating}>
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
    </form>
  );
}
