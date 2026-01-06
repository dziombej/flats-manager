import { useCallback, useState } from "react";

interface UsePaymentActionsOptions {
  flatId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UsePaymentActionsReturn {
  markAsPaid: (paymentId: string) => Promise<void>;
  markingPaymentId: string | null;
}

/**
 * Custom hook for payment actions
 * Handles marking payments as paid with optimistic updates
 */
export function usePaymentActions({
  flatId,
  onSuccess,
  onError,
}: UsePaymentActionsOptions): UsePaymentActionsReturn {
  const [markingPaymentId, setMarkingPaymentId] = useState<string | null>(null);

  const markAsPaid = useCallback(
    async (paymentId: string) => {
      setMarkingPaymentId(paymentId);

      try {
        const response = await fetch(`/api/payments/${paymentId}/mark-paid`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to mark payment as paid");
        }

        onSuccess?.();
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Failed to mark payment as paid");
        onError?.(err);
      } finally {
        setMarkingPaymentId(null);
      }
    },
    [onSuccess, onError]
  );

  return {
    markAsPaid,
    markingPaymentId,
  };
}

