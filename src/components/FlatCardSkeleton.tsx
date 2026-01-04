import { Card, CardHeader, CardContent, CardFooter } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

/**
 * FlatCardSkeleton Component
 * Loading skeleton that matches the FlatCard layout
 * Displayed while dashboard data is being fetched
 */
export default function FlatCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
  );
}
