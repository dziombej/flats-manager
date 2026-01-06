import type { FlatCardViewModel } from "../lib/flats-list-transformers";

interface FlatsListGridProps {
  flats: FlatCardViewModel[];
}

/**
 * FlatsListGrid Component
 * Responsive grid container displaying flat cards
 * Uses Tailwind responsive breakpoints for adaptive layout
 */
export default function FlatsListGrid({ flats }: FlatsListGridProps) {
  return (
    <section aria-label="Flats list" role="list">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {flats.map((flat) => (
          <FlatListCard key={flat.id} flat={flat} />
        ))}
      </div>
    </section>
  );
}

interface FlatListCardProps {
  flat: FlatCardViewModel;
}

/**
 * FlatListCard Component
 * Individual flat card displaying flat information with clickable link to details
 * Implements hover and focus states for better UX
 */
function FlatListCard({ flat }: FlatListCardProps) {
  return (
    <article role="listitem">
      <a
        href={flat.detailsUrl}
        className="block group"
        aria-label={`View details for ${flat.name} at ${flat.address}${
          flat.hasOverduePayments ? " - Has overdue payments" : ""
        }`}
      >
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 h-full flex flex-col">
          {/* Card Header */}
          <div className="p-6 pb-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-xl font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {flat.name}
              </h3>
              {flat.hasOverduePayments && (
                <span
                  className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive whitespace-nowrap"
                  aria-label="Has overdue payments"
                >
                  Overdue
                </span>
              )}
            </div>
          </div>

          {/* Card Body */}
          <div className="px-6 pb-4 flex-1">
            <div className="space-y-3">
              {/* Address */}
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="line-clamp-2">{flat.address}</span>
              </div>

              {/* Tenant (if available) */}
              {flat.tenantName && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="truncate">{flat.tenantName}</span>
                </div>
              )}

              {/* Quick Stats */}
              {(flat.paymentTypesCount !== undefined || flat.pendingPaymentsCount !== undefined) && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {flat.paymentTypesCount !== undefined && (
                    <div className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <span>{flat.paymentTypesCount} types</span>
                    </div>
                  )}
                  {flat.pendingPaymentsCount !== undefined && (
                    <div className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{flat.pendingPaymentsCount} pending</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-6 py-4 border-t bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Total Debt</div>
              <div
                className={`text-lg font-semibold ${
                  flat.debt > 0 ? "text-destructive" : "text-green-600 dark:text-green-500"
                }`}
              >
                {flat.formattedDebt}
              </div>
            </div>
            {flat.status === "ok" && flat.debt === 0 && (
              <div className="mt-2 text-xs text-green-600 dark:text-green-500 text-right">Up to date</div>
            )}
          </div>
        </div>
      </a>
    </article>
  );
}
