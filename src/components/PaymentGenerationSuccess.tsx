import { Check } from "lucide-react";
import { Button } from "./ui/button";
import type { GeneratePaymentsResponseDto } from "../types";
import { getMonthName } from "../lib/formatters";

interface PaymentGenerationSuccessProps {
  result: GeneratePaymentsResponseDto;
  onViewPayments: () => void;
  onReset: () => void;
}

export default function PaymentGenerationSuccess({ result, onViewPayments, onReset }: PaymentGenerationSuccessProps) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-green-100 p-3">
          <Check className="h-12 w-12 text-green-600" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-green-900 mb-2">Payments Generated Successfully</h2>
      <p className="text-green-700 mb-6">
        {result.generated_count} payment{result.generated_count !== 1 ? "s" : ""} generated for{" "}
        {getMonthName(result.month)} {result.year}
      </p>
      <div className="space-y-3">
        <Button onClick={onViewPayments} className="w-full sm:w-auto">
          View Payments
        </Button>
        <div>
          <button onClick={onReset} className="text-green-700 hover:text-green-900 text-sm font-medium">
            Generate More Payments
          </button>
        </div>
      </div>
    </div>
  );
}
