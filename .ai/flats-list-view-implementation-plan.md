# View Implementation Plan: Flats List

## 1. Overview

The Flats List View provides a comprehensive display of all flats owned by the authenticated user. Unlike the dashboard which focuses on overdue payments and quick metrics, this view presents a complete catalog of properties with search and filtering capabilities. Users can browse their entire property portfolio and quickly navigate to specific flat details or create new flats.

This view serves as a dedicated management interface for the flat collection, offering better organization and discovery compared to the dashboard's summary view.

## 2. View Routing

**Path:** `/flats`

**Authentication:** Required - protected route. Unauthenticated users are redirected to `/login`.

**Navigation Access:**
- Primary navigation menu (Header)
- "View All Flats" button from Dashboard
- Breadcrumb navigation

## 3. Component Structure

```
FlatsListPage (Astro)
├── AppLayout (Astro)
│   ├── Header (Astro)
│   └── Breadcrumb (Astro) - "Dashboard > Flats"
├── FlatsListHeader (Astro)
│   ├── PageTitle (Astro)
│   └── AddFlatButton (React)
├── FilterControls (React) - Optional for MVP
│   ├── SearchInput (React)
│   └── SortDropdown (React)
├── FlatsGrid (React)
│   └── FlatCard (React) - Multiple instances
│       ├── FlatCardHeader (React)
│       ├── FlatCardBody (React)
│       └── FlatCardFooter (React)
│           └── StatusBadge (React)
└── EmptyState (Astro)
    ├── EmptyStateIcon (Astro)
    ├── EmptyStateMessage (Astro)
    └── CreateFlatCTA (React)
```

**Component Hierarchy:**
- Page structure with Astro for SSR benefits
- Interactive grid with React for responsive behavior
- Individual cards can be React for hover states and future interactions
- Optional filter/search functionality

## 4. Component Details

### FlatsListPage (Astro)
**Description:** Main page component that fetches flats data server-side and orchestrates the list view.

**Main Elements:**
- Page wrapper with `AppLayout`
- Server-side data fetching from `GET /api/flats`
- Error boundary for API failures
- Conditional rendering for empty state vs. populated list

**Handled Events:** None (static orchestration)

**Validation Conditions:** None

**Types:**
- `FlatsResponseDto` - API response type
- `FlatsListViewModel` - View model with enhanced data

**Props:** None (page component)

**Server-Side Logic:**
```typescript
const response = await fetch('/api/flats');
const data: FlatsResponseDto = await response.json();
const viewModel = transformFlatsListData(data);
```

---

### FlatsListHeader (Astro)
**Description:** Header section with page title and primary action button.

**Main Elements:**
- `<h1>` with "Your Flats" or "Flats" title
- Subtitle showing count (e.g., "3 properties")
- `AddFlatButton` positioned on the right

**Handled Events:** None

**Validation Conditions:** None

**Types:** None

**Props:**
```typescript
interface FlatsListHeaderProps {
  flatsCount: number;
}
```

---

### AddFlatButton (React)
**Description:** Primary action button to create a new flat.

**Main Elements:**
- Button from shadcn/ui with "Add New Flat" label
- Plus icon
- Link to `/flats/new`

**Handled Events:**
- Click to navigate to create flat form

**Validation Conditions:** None

**Types:** Standard button props

**Props:**
```typescript
interface AddFlatButtonProps {
  // Inherits from Button component
}
```

---

### FilterControls (React) - Optional for MVP
**Description:** Search and sort controls for filtering the flats list. Can be omitted in initial MVP.

**Main Elements:**
- Search input field
- Sort dropdown (by name, by address, by debt)
- Clear filters button

**Handled Events:**
- Search input change (debounced)
- Sort option selection
- Clear filters click

**Validation Conditions:**
- Search input sanitization

**Types:**
- `FilterState` - Current filter values

**Props:**
```typescript
interface FilterControlsProps {
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: SortOption) => void;
  currentSearch: string;
  currentSort: SortOption;
}

type SortOption = 'name-asc' | 'name-desc' | 'address-asc' | 'created-desc';
```

**Note:** This component can be deferred to post-MVP if not essential for initial release.

---

### FlatsGrid (React)
**Description:** Responsive grid container displaying flat cards.

**Main Elements:**
- Grid container with responsive columns
- Map of `FlatCard` components
- Loading skeleton during data fetch
- Smooth transitions for grid changes

**Handled Events:** None (delegates to cards)

**Validation Conditions:** None

**Types:**
- `FlatCardViewModel[]` - Array of flat view models

**Props:**
```typescript
interface FlatsGridProps {
  flats: FlatCardViewModel[];
  isLoading?: boolean;
}
```

**Styling:**
- Mobile: 1 column
- Tablet: 2 columns (>= 640px)
- Desktop: 3 columns (>= 1024px)
- Large desktop: 4 columns (>= 1536px - optional)

---

### FlatCard (React)
**Description:** Individual flat card displaying flat information with clickable link to details.

**Main Elements:**
- Card container from shadcn/ui
- Flat name as heading
- Flat address
- Tenant information (optional, if available)
- Payment statistics preview
- Link to flat details page
- Hover and focus states

**Handled Events:**
- Click to navigate to `/flats/:id`
- Keyboard enter/space for accessibility

**Validation Conditions:** None

**Types:**
- `FlatCardViewModel` - Single flat data with computed properties

**Props:**
```typescript
interface FlatCardProps {
  flat: FlatCardViewModel;
}
```

**Accessibility:**
- Entire card wrapped in link or button
- Descriptive aria-label with flat name and key info
- Keyboard navigable
- Focus indicator visible

**Visual Features:**
- Subtle shadow on hover
- Border highlight on focus
- Status badge for overdue payments

---

### FlatCardHeader (React)
**Description:** Header section of flat card with name and optional status indicator.

**Main Elements:**
- Flat name (`<h3>`)
- Optional status badge (if overdue payments exist)

**Handled Events:** None

**Validation Conditions:** None

**Types:**
- `FlatCardViewModel` (partial)

**Props:**
```typescript
interface FlatCardHeaderProps {
  name: string;
  hasOverduePayments?: boolean;
}
```

---

### FlatCardBody (React)
**Description:** Main content area of flat card.

**Main Elements:**
- Address with location icon
- Tenant name (if available)
- Quick stats: number of payment types, pending payments count

**Handled Events:** None

**Validation Conditions:** None

**Types:**
- `FlatCardViewModel` (partial)

**Props:**
```typescript
interface FlatCardBodyProps {
  address: string;
  tenantName?: string;
  paymentTypesCount?: number;
  pendingPaymentsCount?: number;
}
```

---

### FlatCardFooter (React)
**Description:** Footer section showing debt or payment status.

**Main Elements:**
- Debt amount (if > 0)
- Status badge ("Up to date" or "Overdue")
- Visual indicator (color-coded)

**Handled Events:** None

**Validation Conditions:** None

**Types:**
- `FlatCardViewModel` (partial)

**Props:**
```typescript
interface FlatCardFooterProps {
  debt: number;
  formattedDebt: string;
  status: 'ok' | 'overdue';
}
```

---

### EmptyState (Astro)
**Description:** Displayed when user has no flats. Encourages user to create their first flat.

**Main Elements:**
- Illustration or icon (e.g., building icon)
- Heading: "No flats yet"
- Message: "Create your first flat to start managing payments"
- `CreateFlatCTA` button

**Handled Events:** None

**Validation Conditions:** None

**Types:** None

**Props:** None

---

### CreateFlatCTA (React)
**Description:** Call-to-action button in empty state.

**Main Elements:**
- Large primary button
- "Create Your First Flat" label
- Plus icon
- Link to `/flats/new`

**Handled Events:**
- Click to navigate to create form

**Validation Conditions:** None

**Types:** Standard button props

**Props:**
```typescript
interface CreateFlatCTAProps {
  // Inherits from Button component
}
```

---

### LoadingSkeleton (React)
**Description:** Skeleton loader for flats grid during data fetch.

**Main Elements:**
- Grid of skeleton cards matching actual card layout
- Pulsing animation
- Same responsive grid as actual cards

**Handled Events:** None

**Validation Conditions:** None

**Types:** None

**Props:**
```typescript
interface LoadingSkeletonProps {
  count?: number; // Number of skeleton cards to show
}
```

## 5. Types

### View Models

```typescript
/**
 * Enhanced flat view model for list view
 */
interface FlatCardViewModel {
  id: string;
  name: string;
  address: string;
  tenantName?: string;
  debt: number;
  formattedDebt: string;
  paymentTypesCount?: number; // Optional, requires additional query
  pendingPaymentsCount?: number; // Optional, requires additional query
  hasOverduePayments: boolean;
  status: 'ok' | 'overdue';
  detailsUrl: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Flats list view model
 */
interface FlatsListViewModel {
  flats: FlatCardViewModel[];
  totalCount: number;
  isEmpty: boolean;
}

/**
 * Filter state (optional for MVP)
 */
interface FilterState {
  searchQuery: string;
  sortBy: SortOption;
}

type SortOption = 'name-asc' | 'name-desc' | 'address-asc' | 'created-desc';
```

### API Response Types (from types.ts)

- `FlatsResponseDto` - Response from `GET /api/flats`
- `FlatDto` - Individual flat entity

## 6. State Management

### Server-Side State
- Flats data fetched server-side in Astro component
- Passed to React components via props
- No client-side data fetching on initial load

### Client-Side State (Minimal)

**For MVP:**
- No complex client state needed
- Flats list is read-only display
- Navigation handled by framework routing

**Optional for Future (Filter/Search):**

Custom Hook: `useFlatsFilter`

```typescript
interface UseFlatsFilterReturn {
  filteredFlats: FlatCardViewModel[];
  searchQuery: string;
  sortBy: SortOption;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortOption) => void;
  clearFilters: () => void;
}

function useFlatsFilter(flats: FlatCardViewModel[]): UseFlatsFilterReturn
```

**State Variables (if filtering implemented):**
- `searchQuery` - Current search text
- `sortBy` - Current sort option
- `filteredFlats` - Computed filtered and sorted results

### No Global State Required
- View is independent
- No shared state between views needed for MVP

## 7. API Integration

### Endpoints Used

#### GET /api/flats
**Purpose:** Fetch all flats for authenticated user

**Request Type:** `void` (no parameters)

**Response Type:** `FlatsResponseDto`

```typescript
interface FlatsResponseDto {
  flats: FlatDto[];
}
```

**When Called:**
- Server-side on page load (Astro component)
- Client-side on manual refresh (optional)

**Error Handling:**
- 401: Redirect to login
- 500: Display error message with retry option

### Data Transformation

**API to ViewModel:**
```typescript
function transformFlatsListData(
  apiResponse: FlatsResponseDto
): FlatsListViewModel {
  const flats = apiResponse.flats.map(transformFlatToCardViewModel);
  
  return {
    flats,
    totalCount: flats.length,
    isEmpty: flats.length === 0,
  };
}

function transformFlatToCardViewModel(flat: FlatDto): FlatCardViewModel {
  const debt = 0; // Would need to join with payments for accurate debt
  
  return {
    id: flat.id,
    name: flat.name,
    address: flat.address,
    tenantName: undefined, // Not in MVP database schema
    debt,
    formattedDebt: formatCurrency(debt),
    hasOverduePayments: debt > 0,
    status: debt > 0 ? 'overdue' : 'ok',
    detailsUrl: `/flats/${flat.id}`,
    createdAt: flat.created_at,
    updatedAt: flat.updated_at,
  };
}
```

**Note on Debt Calculation:**
For MVP, the flats list view uses simple flat data without debt calculation. For complete debt information, users navigate to the dashboard (which has the `GET /api/dashboard` endpoint with debt included) or individual flat details.

**Alternative Implementation:**
If debt on list view is essential, create a new endpoint `GET /api/flats/with-debt` or enhance the existing endpoint to include debt calculation via JOIN queries.

## 8. User Interactions

### Primary Interactions

#### 1. Navigate to Flat Details
**Trigger:** User clicks on a flat card

**Flow:**
1. User clicks anywhere on flat card
2. Client-side navigation to `/flats/:id`
3. Flat detail view loads

**Validation:** None

**Feedback:**
- Hover state on card (elevated shadow, border highlight)
- Focus indicator for keyboard navigation
- Cursor changes to pointer

#### 2. Create New Flat
**Trigger:** User clicks "Add New Flat" button

**Flow:**
1. User clicks button
2. Client-side navigation to `/flats/new`
3. Create flat form loads

**Validation:** None

**Feedback:**
- Button hover state
- Clear visual indication of primary action

#### 3. Search Flats (Optional for MVP)
**Trigger:** User types in search input

**Flow:**
1. User types search query
2. Input value updates (debounced)
3. Flats list filters in real-time
4. Grid re-renders with matching flats

**Validation:**
- Input sanitization (no special characters causing issues)

**Feedback:**
- Immediate visual feedback as user types
- Results count updates
- Empty state if no matches

#### 4. Sort Flats (Optional for MVP)
**Trigger:** User selects sort option from dropdown

**Flow:**
1. User opens sort dropdown
2. User selects option (e.g., "Name A-Z")
3. Flats list re-sorts
4. Grid re-renders in new order

**Validation:** None

**Feedback:**
- Dropdown selection highlighted
- List order changes visibly
- Sort option persisted (optional)

### Secondary Interactions

- **Breadcrumb Navigation:** Click "Dashboard" to return to home
- **Header Navigation:** Click "Flats" in primary nav (already on page, no action)
- **Keyboard Navigation:** Tab through cards, Enter to navigate to details

## 9. Conditions and Validation

### Display Conditions

#### Flats Grid
- **Show when:** User has at least one flat (`flats.length > 0`)
- **Hide when:** User has no flats (`flats.length === 0`)

#### Empty State
- **Show when:** User has no flats (`flats.length === 0`)
- **Hide when:** User has one or more flats

#### Filter Controls (Optional)
- **Show when:** User has at least 2 flats (filtering more useful)
- **Hide when:** User has 0 or 1 flat
- **Alternative:** Always show for consistency

#### Add Flat Button
- **Always visible:** Primary action available regardless of state

### Component-Level Conditions

#### FlatCard Status Badge
- **Show "Overdue" badge:** When `hasOverduePayments === true`
- **Show "Up to date" badge:** When `hasOverduePayments === false` (optional, can omit to reduce clutter)
- **Badge color:** Red for overdue, green for ok

#### FlatCardFooter
- **Show debt:** Always display formatted debt amount
- **Visual indicator:** Change text color based on status (red if > 0, green if 0)

### No Form Validation
This view has no forms (except optional search input which requires minimal validation).

## 10. Error Handling

### API Errors

#### Fetch Flats Error
**Scenario:** `GET /api/flats` fails

**Handling:**
- Display error message: "Failed to load flats"
- Provide "Retry" button
- Log error to console
- Do not crash the page

**User Experience:**
- Error message in place of flats grid
- Clear visual indication (error icon)
- Action to resolve (retry)

**Implementation:**
```typescript
if (error) {
  return (
    <ErrorState
      message="Failed to load flats"
      onRetry={() => window.location.reload()}
    />
  );
}
```

### Authentication Errors

#### Unauthorized (401)
**Scenario:** User's session expired

**Handling:**
- Redirect to `/login?returnTo=/flats`
- Clear any cached data
- Display message: "Your session has expired. Please log in."

### Network Errors

#### Network Unavailable
**Scenario:** User is offline or network error

**Handling:**
- Display error message: "Network error. Please check your connection."
- Provide "Retry" button
- Disable interactive elements

### Edge Cases

#### No Flats
**Scenario:** New user or user deleted all flats

**Handling:**
- Display empty state with welcoming message
- Show "Create Your First Flat" call-to-action
- Ensure empty state is not confused with error state

#### Single Flat
**Scenario:** User has only one flat

**Handling:**
- Display normally in grid
- Grid layout adapts (single card)
- Filter controls hidden or disabled (optional)

#### Large Number of Flats
**Scenario:** User has 50+ flats

**Handling:**
- Consider pagination (post-MVP enhancement)
- For MVP: Display all flats (scrollable)
- Performance: Lazy load images, virtualize list (advanced)

**Current MVP Assumption:** Users manage 2-10 flats, so no pagination needed.

#### Slow Network
**Scenario:** API takes long time to respond

**Handling:**
- Display loading skeleton immediately
- Show spinner if > 2 seconds
- Timeout after 30 seconds with error message

### Data Quality Issues

#### Missing Tenant Data
**Scenario:** Flat has no tenant information

**Handling:**
- Display without tenant section
- No error, gracefully omit optional data

#### Very Long Flat Names/Addresses
**Scenario:** Name or address exceeds card space

**Handling:**
- Truncate with ellipsis
- Show full text on hover (tooltip)
- Ensure card height remains consistent

## 11. Implementation Steps

### Step 1: Setup Page Structure
1. Create `/src/pages/flats/index.astro` file
2. Implement authentication check (middleware)
3. Set up `AppLayout` with breadcrumbs
4. Configure page metadata and title

### Step 2: Implement API Integration
1. Create `src/lib/services/flatsService.ts` (if not exists)
2. Implement `fetchFlats()` function
3. Add error handling and response validation
4. Test API call with mock data

### Step 3: Create View Models
1. Define view model types (`FlatCardViewModel`, `FlatsListViewModel`)
2. Implement `transformFlatsListData()` helper
3. Implement `transformFlatToCardViewModel()` helper
4. Add currency formatting utility (reuse from dashboard)
5. Test transformations with sample data

### Step 4: Build Static Components
1. Implement `FlatsListHeader` component (Astro)
2. Implement `EmptyState` component (Astro)
3. Add styling with Tailwind
4. Test with mock data (empty and populated states)

### Step 5: Build React Components - Layout
1. Implement `FlatsGrid` component
2. Implement responsive grid layout with Tailwind
3. Test responsiveness at different breakpoints
4. Implement `LoadingSkeleton` component
5. Test loading state

### Step 6: Build React Components - Cards
1. Implement `FlatCard` component
2. Implement `FlatCardHeader` component
3. Implement `FlatCardBody` component
4. Implement `FlatCardFooter` component
5. Implement hover and focus states
6. Test card interactions

### Step 7: Implement Action Buttons
1. Implement `AddFlatButton` component
2. Wire up navigation to `/flats/new`
3. Implement `CreateFlatCTA` component for empty state
4. Test navigation flows

### Step 8: Integrate Data Flow
1. Wire up server-side data fetching in `index.astro`
2. Transform API response to view models
3. Pass data to React components via props
4. Implement conditional rendering (empty vs. populated)
5. Add `client:load` directives for interactive components

### Step 9: Error Handling
1. Implement error state component
2. Add try-catch in server-side fetch
3. Implement retry functionality
4. Test error scenarios (API failure, network error, 401)

### Step 10: Styling and Polish
1. Apply Tailwind classes for responsive layout
2. Style cards with shadows, borders, hover effects
3. Ensure consistent spacing and alignment
4. Test on different screen sizes
5. Add smooth transitions for hover states

### Step 11: Accessibility
1. Add ARIA labels to cards
2. Ensure keyboard navigation works (tab, enter)
3. Add focus indicators
4. Test with screen reader
5. Verify color contrast (WCAG AA)
6. Add skip links if needed

### Step 12: Optional Enhancements (Post-MVP)
1. Implement `FilterControls` component
2. Implement `useFlatsFilter` hook
3. Add search functionality
4. Add sort functionality
5. Persist filter state in URL params
6. Test filtering and sorting

### Step 13: Testing
1. Test with zero flats (empty state)
2. Test with one flat
3. Test with multiple flats (3, 10, 20)
4. Test responsive behavior
5. Test navigation flows
6. Test error scenarios
7. Test loading states
8. Cross-browser testing

### Step 14: Documentation
1. Document component props and usage
2. Add JSDoc comments
3. Document view model transformations
4. Update README if needed

---

**Implementation Priority:** High - core view for flat management, required for MVP.

**Estimated Complexity:** Low to Medium - primarily display logic with minimal interactions, straightforward data transformation.

**Dependencies:**
- API endpoint `/api/flats` must be implemented (already exists)
- Authentication middleware must be configured
- shadcn/ui components (Button, Card) must be installed
- `AppLayout` component must exist
- Currency formatting utility from dashboard

**Notes:**
- Can be implemented in parallel with Dashboard view
- Filter/search functionality can be deferred to post-MVP
- Debt calculation on cards is optional; can link to dashboard for debt overview

