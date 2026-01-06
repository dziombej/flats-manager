import type { PaymentViewModel } from "../types";
import type { BadgeProps } from "../components/ui/badge";

export type PaymentStatus = "paid" | "overdue" | "pending";

/**
 * Get payment status based on payment state
 */
export function getPaymentStatus(payment: PaymentViewModel): PaymentStatus {
  if (payment.isPaid) return "paid";
  if (payment.isOverdue) return "overdue";
  return "pending";
}

/**
 * Get badge variant for payment status
 */
export function getPaymentBadgeVariant(payment: PaymentViewModel): BadgeProps["variant"] {
  if (payment.isPaid) return "success";
  if (payment.isOverdue) return "destructive";
  return "warning";
}

/**
 * Get badge label for payment status
 */
export function getPaymentBadgeLabel(payment: PaymentViewModel): string {
  if (payment.isPaid) return "Paid";
  if (payment.isOverdue) return "Overdue";
  return "Pending";
}
