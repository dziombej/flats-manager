import { useState, useCallback } from "react";
import type { GeneratePaymentsCommand, GeneratePaymentsResponseDto } from "../../types";

interface UsePaymentGenerationOptions {
  flatId: string;
  onSuccess?: (result: GeneratePaymentsResponseDto) => void;
  onError?: (error: Error) => void;
}

interface UsePaymentGenerationReturn {
  generate: (command: GeneratePaymentsCommand) => Promise<void>;
  isGenerating: boolean;
  result: GeneratePaymentsResponseDto | null;
  error: Error | null;
  reset: () => void;
}

/**
 * Custom hook for generating payments
 * Handles API calls, loading state, and error handling
 */
export function usePaymentGeneration({
  flatId,
  onSuccess,
  onError,
}: UsePaymentGenerationOptions): UsePaymentGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratePaymentsResponseDto | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(
    async (command: GeneratePaymentsCommand) => {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetch(`/api/flats/${flatId}/payments/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate payments");
        }

        const responseData: GeneratePaymentsResponseDto = await response.json();
        setResult(responseData);
        onSuccess?.(responseData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to generate payments");
        setError(error);
        onError?.(error);
      } finally {
        setIsGenerating(false);
      }
    },
    [flatId, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    generate,
    isGenerating,
    result,
    error,
    reset,
  };
}
