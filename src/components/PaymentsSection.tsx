import { useState } from "react";
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

interface PaymentsSectionProps {
  payments: PaymentViewModel[];
  flatId: string;
}

export default function PaymentsSection({
  payments,
  flatId,
}: PaymentsSectionProps) {
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [localPayments, setLocalPayments] = useState(payments);

  const handleGeneratePayments = () => {
    window.location.href = `/flats/${flatId}/payments/generate`;
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    setMarkingPaid(paymentId);

    // Optimistic update
    setLocalPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? { ...p, isPaid: true, paidAt: new Date().toISOString() }
          : p
      )
    );

    try {
      const response = await fetch(`/api/payments/${paymentId}/mark-paid`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to mark payment as paid");
      }

      // Reload the page to refresh stats
      window.location.reload();
    } catch (error) {
      console.error("Error marking payment as paid:", error);

      // Rollback optimistic update
      setLocalPayments(payments);

      alert("Failed to mark payment as paid. Please try again.");
      setMarkingPaid(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  };

  const formatMonthYear = (month: number, year: number) => {
    const date = new Date(year, month - 1);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const getStatusBadge = (payment: PaymentViewModel) => {
    if (payment.isPaid) {
      return <Badge variant="success">Paid</Badge>;
    }
    if (payment.isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    return <Badge variant="warning">Pending</Badge>;
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Payments</h2>
        <Button onClick={handleGeneratePayments}>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
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
                        disabled={markingPaid === payment.id}
                      >
                        {markingPaid === payment.id ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 mr-2"
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
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Marking...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="ml-2">Mark as Paid</span>
                          </>
                        )}
                      </Button>
                    )}
                    {payment.isPaid && (
                      <span className="text-muted-foreground text-sm">
                        Paid on {new Date(payment.paidAt!).toLocaleDateString()}
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

