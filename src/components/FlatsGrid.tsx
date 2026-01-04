import { useEffect, useState, useMemo } from "react";
import type { DashboardResponseDto, DashboardFlatDto } from "../types";
import FlatCard from "./FlatCard";
import FlatCardSkeleton from "./FlatCardSkeleton";
import FilterBar, { type FilterStatus, type SortOption } from "./FilterBar";
import DashboardStats from "./DashboardStats";

/**
 * FlatsGrid Component
 * Displays a grid of flat cards with loading and error states
 * Fetches data from /api/dashboard
 */
export default function FlatsGrid() {
  const [flats, setFlats] = useState<DashboardFlatDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter and sort flats based on user selections
  const filteredAndSortedFlats = useMemo(() => {
    let result = [...flats];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (flat) => flat.name.toLowerCase().includes(query) || flat.address.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus === "debt") {
      result = result.filter((flat) => flat.debt > 0);
    } else if (filterStatus === "paid") {
      result = result.filter((flat) => flat.debt === 0);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "debt-desc":
          return b.debt - a.debt;
        case "debt-asc":
          return a.debt - b.debt;
        case "date-desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "date-asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [flats, searchQuery, filterStatus, sortBy]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/dashboard");

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
      }

      const data: DashboardResponseDto = await response.json();
      setFlats(data.flats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <FlatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="mb-4 text-destructive">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Flats</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (flats.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="mb-4 text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No Flats Yet</h2>
          <p className="text-muted-foreground mb-4">Get started by adding your first flat to manage</p>
          <a
            href="/flats/new"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Add Your First Flat
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardStats flats={flats} />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {filteredAndSortedFlats.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center max-w-md">
            <div className="mb-4 text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">No Matching Flats</h2>
            <p className="text-muted-foreground">Try adjusting your filters or search query</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedFlats.map((flat) => (
            <FlatCard key={flat.id} flat={flat} />
          ))}
        </div>
      )}
    </div>
  );
}
