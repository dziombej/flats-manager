/**
 * FlatsListSkeleton Component
 * Loading skeleton for flats grid
 * Displays animated placeholder cards while data is loading
 */
export default function FlatsListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <FlatCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * FlatCardSkeleton Component
 * Individual skeleton card matching the layout of FlatListCard
 */
function FlatCardSkeleton() {
  return (
    <div className="bg-card text-card-foreground rounded-lg border shadow-sm h-full flex flex-col animate-pulse">
      {/* Card Header */}
      <div className="p-6 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="h-7 bg-muted rounded w-3/4"></div>
          <div className="h-5 bg-muted rounded w-16"></div>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-6 pb-4 flex-1">
        <div className="space-y-3">
          {/* Address */}
          <div className="flex items-start gap-2">
            <div className="h-4 w-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded flex-1"></div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="h-4 bg-muted rounded w-20"></div>
            <div className="h-4 bg-muted rounded w-24"></div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 border-t bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-muted rounded w-20"></div>
          <div className="h-6 bg-muted rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}
