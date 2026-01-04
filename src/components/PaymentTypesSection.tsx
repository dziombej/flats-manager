import { useState } from "react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import type { PaymentTypeViewModel } from "../types";

interface PaymentTypesSectionProps {
  paymentTypes: PaymentTypeViewModel[];
  flatId: string;
}

export default function PaymentTypesSection({
  paymentTypes,
  flatId,
}: PaymentTypesSectionProps) {
  const handleAddPaymentType = () => {
    window.location.href = `/flats/${flatId}/payment-types/new`;
  };

  const handleEditPaymentType = (paymentTypeId: string) => {
    window.location.href = `/payment-types/${paymentTypeId}/edit`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  };

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Payment Types</h2>
        <Button onClick={handleAddPaymentType}>
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Payment Type
        </Button>
      </div>

      {paymentTypes.length === 0 ? (
        <div className="bg-card text-card-foreground rounded-lg border p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No payment types defined. Add your first payment type to start.
          </p>
          <Button onClick={handleAddPaymentType}>Add Payment Type</Button>
        </div>
      ) : (
        <div className="bg-card text-card-foreground rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Base Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentTypes.map((paymentType) => (
                <TableRow key={paymentType.id}>
                  <TableCell className="font-medium">
                    {paymentType.name}
                  </TableCell>
                  <TableCell>{formatCurrency(paymentType.baseAmount)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPaymentType(paymentType.id)}
                    >
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span className="ml-2">Edit</span>
                    </Button>
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

