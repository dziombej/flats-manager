# Dashboard Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Layout.astro                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Header.astro                           │  │
│  │  [Logo] Dashboard | All Flats    [Add Flat] [User (•)]   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  dashboard.astro                          │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              FlatsGrid.tsx                          │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │         DashboardStats.tsx                    │  │  │  │
│  │  │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │  │  │  │
│  │  │  │  │Total │ │Total │ │With  │ │Paid  │         │  │  │  │
│  │  │  │  │Flats │ │Debt  │ │Debt  │ │Up    │         │  │  │  │
│  │  │  │  └──────┘ └──────┘ └──────┘ └──────┘         │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  │                                                      │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │           FilterBar.tsx                       │  │  │  │
│  │  │  │  [Search...] [Filter ▼] [Sort ▼]             │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  │                                                      │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │         Flats Grid (Responsive)               │  │  │  │
│  │  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐      │  │  │  │
│  │  │  │  │FlatCard  │ │FlatCard  │ │FlatCard  │      │  │  │  │
│  │  │  │  │          │ │          │ │          │      │  │  │  │
│  │  │  │  │Mokotów 2 │ │Żoliborz 1│ │Śródmieście│     │  │  │  │
│  │  │  │  │Puławska  │ │Słowackiego│ │Marszałk. │     │  │  │  │
│  │  │  │  │Paid: ✓   │ │Debt: 1.2k│ │Debt: 800 │     │  │  │  │
│  │  │  │  │[Details] │ │[Details] │ │[Details] │     │  │  │  │
│  │  │  │  │[Payments]│ │[Payments]│ │[Payments]│     │  │  │  │
│  │  │  │  └──────────┘ └──────────┘ └──────────┘      │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
Layout.astro
├── Header.astro
└── dashboard.astro
    └── FlatsGrid.tsx (client:load)
        ├── DashboardStats.tsx
        │   └── Card.tsx (×4)
        ├── FilterBar.tsx
        │   ├── Input.tsx (search)
        │   ├── Select.tsx (filter)
        │   └── Select.tsx (sort)
        └── Grid of FlatCard.tsx or FlatCardSkeleton.tsx
            └── FlatCard.tsx (×N)
                ├── Card.tsx
                │   ├── CardHeader.tsx
                │   ├── CardContent.tsx
                │   └── CardFooter.tsx
                └── Button.tsx (×2)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Action                              │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              FlatsGrid.tsx (State)                          │
│  - flats: DashboardFlatDto[]                                │
│  - loading: boolean                                         │
│  - error: string | null                                     │
│  - searchQuery: string                                      │
│  - filterStatus: FilterStatus                               │
│  - sortBy: SortOption                                       │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│           useMemo: filteredAndSortedFlats                   │
│  1. Filter by search query                                  │
│  2. Filter by debt status                                   │
│  3. Sort by selected option                                 │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────┬──────────────┬──────────────────┐
             ▼              ▼              ▼                  ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
    │DashboardStats│ │FilterBar  │  │FlatCard #1│  │FlatCard #N│
    │(all flats) │  │(controls) │  │(filtered) │  │(filtered) │
    └────────────┘  └────────────┘  └────────────┘  └────────────┘
```

## State Management

### Initial Load
```
1. Component mounts
2. useEffect triggers fetchDashboardData()
3. setLoading(true)
4. Render: FlatCardSkeleton × 6
5. API call to /api/dashboard
6. Success: setFlats(data.flats), setLoading(false)
7. Render: DashboardStats + FilterBar + FlatCard × N
```

### User Interactions

#### Search
```
User types → onSearchChange(query) → setSearchQuery(query)
  → useMemo recalculates → filtered list updates → re-render
```

#### Filter by Status
```
User selects → onFilterStatusChange(status) → setFilterStatus(status)
  → useMemo recalculates → filtered list updates → re-render
```

#### Sort
```
User selects → onSortByChange(sort) → setSortBy(sort)
  → useMemo recalculates → sorted list updates → re-render
```

#### Navigate to Details
```
User clicks "View Details" → handleViewDetails()
  → window.location.href = `/flats/${flat.id}`
```

## API Integration

```
┌──────────────┐
│ FlatsGrid.tsx│
└──────┬───────┘
       │ fetchDashboardData()
       ▼
┌──────────────────────┐
│  GET /api/dashboard  │
│  ┌────────────────┐  │
│  │ No Auth (Mock) │  │
│  └────────────────┘  │
└──────┬───────────────┘
       │ Response
       ▼
┌──────────────────────────────────┐
│ DashboardResponseDto             │
│ {                                │
│   flats: [                       │
│     {                            │
│       id: string,                │
│       name: string,              │
│       address: string,           │
│       debt: number,              │
│       created_at: string,        │
│       updated_at: string         │
│     }                            │
│   ]                              │
│ }                                │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────┐
│ setFlats(data)   │
└──────────────────┘
```

## Responsive Breakpoints

```
Mobile (< 640px)
┌────────────┐
│  Card 1    │
├────────────┤
│  Card 2    │
├────────────┤
│  Card 3    │
└────────────┘

Tablet (640px - 1024px)
┌──────────┬──────────┐
│  Card 1  │  Card 2  │
├──────────┼──────────┤
│  Card 3  │  Card 4  │
└──────────┴──────────┘

Desktop (> 1024px)
┌────────┬────────┬────────┐
│ Card 1 │ Card 2 │ Card 3 │
├────────┼────────┼────────┤
│ Card 4 │ Card 5 │ Card 6 │
└────────┴────────┴────────┘
```

## Color Coding

```
Debt Status:
- Has Debt (> 0)   → Red (text-destructive)
- Paid Up (= 0)    → Green (text-green-600)
- Neutral          → Gray (text-muted-foreground)

Interactive Elements:
- Primary Actions  → Primary color (bg-primary)
- Secondary        → Outline (variant="outline")
- Hover States     → Opacity/color transition
```

