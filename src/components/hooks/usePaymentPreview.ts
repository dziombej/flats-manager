import { useMemo } from "react";
import type { PaymentTypeDto } from "../../types";
import { formatCurrency } from "../../lib/formatters";

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

interface PaymentPreview {
  items: PaymentPreviewItem[];
  summary: PreviewSummary;
}

/**
 * Custom hook for calculating payment preview
 * Memoizes calculations for performance
 */
export function usePaymentPreview(paymentTypes: PaymentTypeDto[]): PaymentPreview {
  return useMemo(() => {
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
}

