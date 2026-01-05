import type { DashboardFlatDto } from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";

interface FlatCardProps {
  flat: DashboardFlatDto;
}

/**
 * FlatCard Component
 * Displays a single flat with its name, address, and debt status
 * Provides navigation to flat details
 */
export default function FlatCard({ flat }: FlatCardProps) {
  const hasDebt = flat.debt > 0;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleViewDetails = () => {
    window.location.href = `/flats/${flat.id}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow" data-test-id={`flat-card-${flat.id}`}>
      <CardHeader>
        <CardTitle className="text-xl" data-test-id="flat-card-name">{flat.name}</CardTitle>
        <CardDescription data-test-id="flat-card-address">{flat.address}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Debt Status:</span>
            <span className={`text-sm font-semibold ${hasDebt ? "text-destructive" : "text-green-600"}`} data-test-id="flat-card-status">
              {hasDebt ? "Outstanding" : "Paid"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Debt:</span>
            <span className={`text-lg font-bold ${hasDebt ? "text-destructive" : "text-green-600"}`} data-test-id="flat-card-total-debt">
              {formatCurrency(flat.debt)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="default" className="flex-1" onClick={handleViewDetails}>
          View Details
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = `/flats/${flat.id}/payments`)}>
          Payments
        </Button>
      </CardFooter>
    </Card>
  );
}
