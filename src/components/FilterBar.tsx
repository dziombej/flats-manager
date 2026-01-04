import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export type FilterStatus = "all" | "debt" | "paid";
export type SortOption = "name" | "debt-desc" | "debt-asc" | "date-desc" | "date-asc";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: FilterStatus;
  onFilterStatusChange: (status: FilterStatus) => void;
  sortBy: SortOption;
  onSortByChange: (sort: SortOption) => void;
}

/**
 * FilterBar Component
 * Provides search, filter, and sort controls for the flats grid
 */
export default function FilterBar({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  sortBy,
  onSortByChange,
}: FilterBarProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
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
            <Input
              type="text"
              placeholder="Search by name or address..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              aria-label="Search flats"
            />
          </div>
        </div>

        {/* Filter by Status */}
        <Select value={filterStatus} onValueChange={(value) => onFilterStatusChange(value as FilterStatus)}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Flats</SelectItem>
            <SelectItem value="debt">With Debt</SelectItem>
            <SelectItem value="paid">Paid Up</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select value={sortBy} onValueChange={(value) => onSortByChange(value as SortOption)}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Sort by">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="debt-desc">Debt (High to Low)</SelectItem>
            <SelectItem value="debt-asc">Debt (Low to High)</SelectItem>
            <SelectItem value="date-desc">Date (Newest)</SelectItem>
            <SelectItem value="date-asc">Date (Oldest)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
