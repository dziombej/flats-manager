import type {
  FlatDto,
  PaymentTypeDto,
  PaymentWithTypeNameDto,
  FlatStatsViewModel,
  PaymentTypeViewModel,
  PaymentViewModel,
  FlatDetailViewModel,
} from "../types";

/**
 * Transform payment type DTO to view model
 */
export function transformPaymentTypeToViewModel(paymentType: PaymentTypeDto): PaymentTypeViewModel {
  return {
    id: paymentType.id,
    name: paymentType.name,
    baseAmount: paymentType.base_amount,
    createdAt: paymentType.created_at,
    updatedAt: paymentType.updated_at,
  };
}

/**
 * Transform payment DTO to view model
 */
export function transformPaymentToViewModel(payment: PaymentWithTypeNameDto): PaymentViewModel {
  const dueDate = new Date(payment.due_date);
  const now = new Date();
  const isOverdue = !payment.is_paid && dueDate < now;

  return {
    id: payment.id,
    paymentTypeId: payment.payment_type_id,
    paymentTypeName: payment.payment_type_name,
    amount: payment.amount,
    dueDate: payment.due_date,
    isPaid: payment.is_paid,
    paidAt: payment.paid_at,
    month: payment.month,
    year: payment.year,
    canEdit: !payment.is_paid,
    isOverdue,
  };
}

/**
 * Calculate flat statistics from payments and payment types
 */
export function calculateFlatStats(
  payments: PaymentWithTypeNameDto[],
  paymentTypes: PaymentTypeDto[]
): FlatStatsViewModel {
  const unpaidPayments = payments.filter((p) => !p.is_paid);
  const totalDebt = unpaidPayments.reduce((sum, p) => sum + p.amount, 0);

  return {
    totalDebt,
    paymentTypesCount: paymentTypes.length,
    pendingPaymentsCount: unpaidPayments.length,
  };
}

/**
 * Transform complete flat detail data to view model
 */
export function transformFlatDetailData(
  flat: FlatDto,
  paymentTypes: PaymentTypeDto[],
  payments: PaymentWithTypeNameDto[]
): FlatDetailViewModel {
  return {
    flat,
    stats: calculateFlatStats(payments, paymentTypes),
    paymentTypes: paymentTypes.map(transformPaymentTypeToViewModel),
    payments: payments.map(transformPaymentToViewModel),
  };
}
