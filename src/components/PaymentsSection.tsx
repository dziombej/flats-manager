import { useState } from "react";
import { Calendar, Check, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import type { PaymentViewModel } from "../types";
import { formatCurrency, formatMonthYear, formatDate } from "../lib/formatters";
import { getPaymentBadgeVariant, getPaymentBadgeLabel } from "../lib/payment-status";
import { usePaymentActions } from "./hooks/usePaymentActions";
import { useNavigation } from "./hooks/useNavigation";

interface PaymentsSectionProps {
  payments: PaymentViewModel[];
  flatId: string;
}

export default function PaymentsSection({
  payments,
  flatId,
}: PaymentsSectionProps) {
  const navigation = useNavigation();
  const [localPayments, setLocalPayments] = useState(payments);

  const { markAsPaid, markingPaymentId } = usePaymentActions({
    flatId,
    onSuccess: () => {
      // Reload the page to refresh stats
      navigation.reload();
    },
    onError: (error) => {
      // Rollback optimistic update
      setLocalPayments(payments);
      alert(error.message);
    },
  });

  const handleGeneratePayments = () => {
    window.location.href = `/flats/${flatId}/payments/generate`;
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    // Optimistic update
    setLocalPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? { ...p, isPaid: true, paidAt: new Date().toISOString() }
          : p
      )
    );

    await markAsPaid(paymentId);
  };

  const getStatusBadge = (payment: PaymentViewModel) => {
    return (
      <Badge variant={getPaymentBadgeVariant(payment)}>
        {getPaymentBadgeLabel(payment)}
      </Badge>
    );
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Payments</h2>
        <Button onClick={handleGeneratePayments}>
          <Calendar className="w-4 h-4 mr-2" />
          Generate Payments
        </Button>
      </div>

      {localPayments.length === 0 ? (
        <div className="bg-card text-card-foreground rounded-lg border p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No payments generated. Generate payments for a specific month.
          </p>
          <Button onClick={handleGeneratePayments}>Generate Payments</Button>
        </div>
      ) : (
        <div className="bg-card text-card-foreground rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Due Date</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localPayments.map((payment) => (
                <TableRow
                  key={payment.id}
                  className={payment.isPaid ? "opacity-60" : ""}
                >
                  <TableCell>
                    {formatMonthYear(payment.month, payment.year)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {payment.paymentTypeName}
                  </TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{getStatusBadge(payment)}</TableCell>
                  <TableCell className="text-right">
                    {!payment.isPaid && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsPaid(payment.id)}
                        disabled={markingPaymentId === payment.id}
                      >
                        {markingPaymentId === payment.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Marking...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Mark as Paid
                          </>
                        )}
                      </Button>
                    )}
                    {payment.isPaid && (
                      <span className="text-muted-foreground text-sm">
                        Paid on {formatDate(payment.paidAt!)}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

