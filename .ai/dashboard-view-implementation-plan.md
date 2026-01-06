# View Implementation Plan: Dashboard

## 1. Overview

The Dashboard View serves as the central hub and landing page of the Flats Manager application. It provides landlords with an immediate overview of their property portfolio, highlighting overdue payments and displaying key metrics. The dashboard emphasizes urgent items requiring attention while offering quick access to detailed flat management.

This view is the first screen users see after authentication and serves as the primary navigation point to all other application features.

## 2. View Routing

**Path:** `/` (root)

**Authentication:** Required - protected route. Unauthenticated users are redirected to `/login`.

**Default Behavior:** Users are automatically redirected to the dashboard after successful login.

## 3. Component Structure

```
DashboardPage (Astro)
├── DashboardLayout (Astro)
│   ├── Header (Astro)
│   └── Breadcrumb (Astro)
├── DashboardHeader (Astro)
│   └── UserGreeting (Astro)
├── OverduePaymentsSection (React)
│   ├── SectionTitle (Astro)
│   └── OverduePaymentsList (React)
│       └── OverduePaymentCard (React)
│           ├── StatusBadge (React)
│           └── QuickActionButton (React)
├── SummaryStatistics (React)
│   └── DashboardStatCard (React) x3
├── FlatsListSection (Astro)
│   ├── SectionTitle (Astro)
│   └── FlatsList (React)
│       └── FlatCard (React)
│           └── StatusBadge (React)
└── QuickActions (Astro)
    └── Button (React)
```

**Component Hierarchy:**

- Static layout and structure use Astro components
- Interactive sections (overdue payments, flats list) use React for dynamic updates
- UI primitives (Button, Badge, Card) from shadcn/ui

## 4. Component Details

### DashboardPage (Astro)

**Description:** Main page component that orchestrates the dashboard view, fetches data server-side, and passes it to child components.

**Main Elements:**

- Page wrapper with `DashboardLayout`
- Data fetching logic (server-side)
- Error boundary for fetch failures
- Child sections arranged in semantic order

**Handled Events:** None (static layout)

**Validation Conditions:** None

**Types:**

- `DashboardResponseDto` - API response type
- `DashboardFlatDto` - Individual flat with debt
- `DashboardViewModel` - Extended view model with computed properties

**Props:** None (page component)

**Data Fetching:**

- Server-side fetch to `GET /api/dashboard`
- Error handling with retry option
- Loading state with skeleton

---

### DashboardHeader (Astro)

**Description:** Displays page title and user greeting.

**Main Elements:**

- `<h1>` with "Dashboard" title
- User greeting text (e.g., "Welcome back, Admin")
- Date display (current date)

**Handled Events:** None

**Validation Conditions:** None

**Types:**

- `UserInfo` - Contains user name from authentication context

**Props:**

```typescript
interface DashboardHeaderProps {
  userName?: string;
}
```

---

### OverduePaymentsSection (React)

**Description:** Section displaying urgent overdue payments that require immediate attention. This is a priority section with visual emphasis.

**Main Elements:**

- Section header with title "Overdue Payments"
- `OverduePaymentsList` component
- Empty state when no overdue payments exist
- ARIA live region for screen reader announcements

**Handled Events:**

- Payment marked as paid (via QuickActionButton)

**Validation Conditions:** None for display

**Types:**

- `OverduePaymentViewModel[]` - Array of overdue payment view models

**Props:**

```typescript
interface OverduePaymentsSectionProps {
  overduePayments: OverduePaymentViewModel[];
  onPaymentMarkedPaid: (paymentId: string) => Promise<void>;
}
```

---

### OverduePaymentsList (React)

**Description:** List component rendering individual overdue payment cards.

**Main Elements:**

- Unordered list (`<ul>`) with semantic HTML
- Map of `OverduePaymentCard` components
- Conditional rendering for empty state

**Handled Events:**

- Delegates payment marking to parent via callback

**Validation Conditions:** None

**Types:**

- `OverduePaymentViewModel` - View model for overdue payment

**Props:**

```typescript
interface OverduePaymentsListProps {
  payments: OverduePaymentViewModel[];
  onMarkAsPaid: (paymentId: string) => Promise<void>;
}
```

---

### OverduePaymentCard (React)

**Description:** Individual card displaying an overdue payment with flat name, amount, days overdue, and quick action button.

**Main Elements:**

- Card container from shadcn/ui
- Flat name (linked to flat details)
- Payment type name
- Amount with currency formatting
- Days overdue indicator
- "Mark as Paid" quick action button
- Visual urgency indicator (red accent)

**Handled Events:**

- Click on "Mark as Paid" button
- Click on flat name (navigation)

**Validation Conditions:**

- Payment must not already be paid (button disabled otherwise)

**Types:**

- `OverduePaymentViewModel` - Single overdue payment data

**Props:**

```typescript
interface OverduePaymentCardProps {
  payment: OverduePaymentViewModel;
  onMarkAsPaid: (paymentId: string) => Promise<void>;
}
```

**Interactions:**

- Optimistic UI update when marking as paid
- Loading state during API call
- Error state with rollback on failure

---

### SummaryStatistics (React)

**Description:** Displays key metrics in a row of stat cards.

**Main Elements:**

- Container div with grid layout
- Three `DashboardStatCard` components
- Responsive grid (1 column mobile, 3 columns desktop)

**Handled Events:** None (display only)

**Validation Conditions:** None

**Types:**

- `DashboardStatsViewModel` - Aggregated statistics

**Props:**

```typescript
interface SummaryStatisticsProps {
  stats: DashboardStatsViewModel;
}
```

---

### DashboardStatCard (React)

**Description:** Individual metric card displaying an icon, label, and value.

**Main Elements:**

- Card container from shadcn/ui
- Icon (from lucide-react or similar)
- Metric label (e.g., "Total Flats")
- Metric value (large, emphasized)
- Optional trend indicator

**Handled Events:** None

**Validation Conditions:** None

**Types:**

- `StatCardData` - Single statistic data

**Props:**

```typescript
interface DashboardStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    direction: "up" | "down";
    value: number;
  };
}
```

---

### FlatsListSection (Astro)

**Description:** Section displaying all user's flats in a grid layout.

**Main Elements:**

- Section header with "Your Flats" title
- `FlatsList` React component
- "Add New Flat" button (primary action)
- Empty state with CTA when no flats exist

**Handled Events:** None (delegates to children)

**Validation Conditions:** None

**Types:**

- `DashboardFlatDto[]` - Array of flats with debt

**Props:**

```typescript
interface FlatsListSectionProps {
  flats: DashboardFlatDto[];
}
```

---

### FlatsList (React)

**Description:** Grid of flat cards with responsive layout.

**Main Elements:**

- Grid container
- Map of `FlatCard` components
- Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)

**Handled Events:** None (delegates to cards)

**Validation Conditions:** None

**Types:**

- `DashboardFlatDto[]`

**Props:**

```typescript
interface FlatsListProps {
  flats: DashboardFlatDto[];
}
```

---

### FlatCard (React)

**Description:** Clickable card displaying flat summary with name, address, and debt.

**Main Elements:**

- Card container from shadcn/ui (interactive)
- Flat name (`<h3>`)
- Flat address
- Debt amount with formatting
- Visual indicator if debt > 0 (warning badge or color)
- Entire card is clickable link to flat details

**Handled Events:**

- Click to navigate to `/flats/:id`

**Validation Conditions:** None

**Types:**

- `DashboardFlatDto` - Single flat data

**Props:**

```typescript
interface FlatCardProps {
  flat: DashboardFlatDto;
}
```

**Accessibility:**

- Card wrapped in link with descriptive label
- Debt announced with aria-label if overdue
- Keyboard navigable

---

### QuickActionButton (React)

**Description:** Specialized button for quick actions with loading and success states.

**Main Elements:**

- Button from shadcn/ui
- Icon + label
- Loading spinner (when action in progress)
- Success checkmark animation

**Handled Events:**

- onClick with async handler

**Validation Conditions:**

- Disabled state when loading
- Disabled if action not available

**Types:**

- Generic button props

**Props:**

```typescript
interface QuickActionButtonProps {
  label: string;
  onClick: () => Promise<void>;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline";
}
```

**Features:**

- Optimistic UI updates
- Error handling with toast notification
- Loading state during async operation

---

### StatusBadge (React)

**Description:** Badge component displaying payment or flat status.

**Main Elements:**

- Badge primitive from shadcn/ui
- Text label
- Color coding (red for overdue, yellow for pending, green for paid)
- Optional icon

**Handled Events:** None

**Validation Conditions:** None

**Types:**

- `StatusType` enum

**Props:**

```typescript
type StatusType = "overdue" | "pending" | "paid" | "ok";

interface StatusBadgeProps {
  status: StatusType;
  label: string;
}
```

**Accessibility:**

- Status conveyed with text, not just color
- ARIA label for screen readers

## 5. Types

### View Models

```typescript
/**
 * Extended flat view model for dashboard
 * Includes formatted debt and status
 */
interface DashboardFlatViewModel extends DashboardFlatDto {
  /** Formatted debt string (e.g., "1,200.00 PLN") */
  formattedDebt: string;
  /** Status indicator based on debt */
  status: "ok" | "overdue";
  /** Link to flat details page */
  detailsUrl: string;
}

/**
 * Overdue payment view model
 * Combines payment data with flat context
 */
interface OverduePaymentViewModel {
  id: string;
  flatId: string;
  flatName: string;
  paymentTypeName: string;
  amount: number;
  formattedAmount: string;
  dueDate: string; // ISO string
  daysOverdue: number;
  detailsUrl: string;
}

/**
 * Dashboard statistics view model
 * Aggregated metrics for display
 */
interface DashboardStatsViewModel {
  totalFlats: number;
  pendingPaymentsCount: number;
  totalOverdueAmount: number;
  formattedOverdueAmount: string;
}

/**
 * Dashboard data view model
 * Complete data structure for the dashboard
 */
interface DashboardViewModel {
  flats: DashboardFlatViewModel[];
  overduePayments: OverduePaymentViewModel[];
  stats: DashboardStatsViewModel;
}
```

### API Response Types (from types.ts)

- `DashboardResponseDto` - Response from `GET /api/dashboard`
- `DashboardFlatDto` - Individual flat with debt
- `MarkPaidResponseDto` - Response from marking payment as paid

## 6. State Management

### Server-Side State

- Initial data fetched server-side in Astro component
- Dashboard data passed as props to React components
- No client-side data fetching on initial load

### Client-Side State

**Custom Hook: `useDashboard`**

Location: `src/components/hooks/useDashboard.ts`

Purpose: Manage dashboard data, overdue payments, and quick actions

```typescript
interface UseDashboardReturn {
  flats: DashboardFlatViewModel[];
  overduePayments: OverduePaymentViewModel[];
  stats: DashboardStatsViewModel;
  isLoading: boolean;
  error: Error | null;
  markPaymentAsPaid: (paymentId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

function useDashboard(initialData: DashboardResponseDto): UseDashboardReturn;
```

**State Variables:**

- `dashboardData` - Current dashboard data (flats, overdue payments)
- `isLoading` - Loading state for async operations
- `error` - Error state for failed operations
- `optimisticUpdates` - Map of pending optimistic updates

**State Updates:**

- Optimistic update when marking payment as paid
- Rollback on error
- Refresh on success to sync with server

### No Global State Required

- Dashboard is independent view
- No shared state with other pages
- Each visit fetches fresh data

## 7. API Integration

### Endpoints Used

#### GET /api/dashboard

**Purpose:** Fetch all flats with debt calculation

**Request Type:** `void` (no parameters)

**Response Type:** `DashboardResponseDto`

```typescript
interface DashboardResponseDto {
  flats: DashboardFlatDto[];
}
```

**When Called:**

- Server-side on page load (Astro)
- Client-side on manual refresh

**Error Handling:**

- 401: Redirect to login
- 500: Display error message with retry option

#### POST /api/payments/:id/mark-paid

**Purpose:** Mark an overdue payment as paid

**Request Type:** `void` (no body)

**Response Type:** `MarkPaidResponseDto`

```typescript
type MarkPaidResponseDto = PaymentDto;
```

**When Called:**

- User clicks "Mark as Paid" on overdue payment card

**Error Handling:**

- 400: Display error toast
- 404: Display error toast and refresh data
- 500: Display error toast and rollback optimistic update

### Data Transformation

**API to ViewModel:**

```typescript
function transformDashboardData(apiResponse: DashboardResponseDto): DashboardViewModel {
  const flats = apiResponse.flats.map(transformFlatToViewModel);
  const overduePayments = extractOverduePayments(apiResponse);
  const stats = calculateStats(flats, overduePayments);

  return { flats, overduePayments, stats };
}

function transformFlatToViewModel(flat: DashboardFlatDto): DashboardFlatViewModel {
  return {
    ...flat,
    formattedDebt: formatCurrency(flat.debt),
    status: flat.debt > 0 ? "overdue" : "ok",
    detailsUrl: `/flats/${flat.id}`,
  };
}
```

## 8. User Interactions

### Primary Interactions

#### 1. Mark Overdue Payment as Paid

**Trigger:** User clicks "Mark as Paid" button on overdue payment card

**Flow:**

1. User clicks button
2. Button shows loading spinner
3. Optimistic update: payment removed from overdue list
4. API call to `POST /api/payments/:id/mark-paid`
5. On success: Toast notification, data remains updated
6. On error: Rollback, show error toast, restore payment to list

**Validation:** None (action always valid for overdue payments)

**Feedback:**

- Loading state on button
- Success toast: "Payment marked as paid"
- Error toast: "Failed to mark payment. Please try again."

#### 2. Navigate to Flat Details

**Trigger:** User clicks on flat card or flat name

**Flow:**

1. User clicks card/name
2. Client-side navigation to `/flats/:id`
3. Flat details page loads

**Validation:** None

**Feedback:**

- Hover state on card
- Focus indicator for keyboard navigation

#### 3. Add New Flat

**Trigger:** User clicks "Add New Flat" button

**Flow:**

1. User clicks button
2. Client-side navigation to `/flats/new`
3. Create flat form loads

**Validation:** None

**Feedback:**

- Button hover state
- Clear call-to-action

#### 4. Refresh Dashboard

**Trigger:** User clicks refresh button (optional) or returns to dashboard

**Flow:**

1. User triggers refresh
2. Loading state displayed (spinner or skeleton)
3. Fetch `GET /api/dashboard`
4. Update all sections with fresh data

**Validation:** None

**Feedback:**

- Loading spinner or skeleton
- Updated data displayed
- Error message if fetch fails

### Secondary Interactions

- **Empty State:** Display message and "Create your first flat" button when no flats exist
- **Error State:** Display error message with "Retry" button when API fails
- **Keyboard Navigation:** Support tab navigation through all interactive elements

## 9. Conditions and Validation

### Display Conditions

#### Overdue Payments Section

- **Show when:** At least one payment is overdue (dueDate < current date AND is_paid = false)
- **Hide when:** No overdue payments exist
- **Empty state:** Display "No overdue payments" message with green checkmark icon

#### Flats List Section

- **Show when:** User has at least one flat
- **Hide when:** User has no flats
- **Empty state:** Display "No flats yet" message with "Add your first flat" button

#### Summary Statistics

- **Always visible:** Show even with zero values
- **Total Flats:** Count of all flats
- **Pending Payments:** Count of all unpaid payments (not just overdue)
- **Total Overdue Amount:** Sum of amounts for overdue payments only

### Component-Level Conditions

#### QuickActionButton (Mark as Paid)

- **Enabled when:** Payment is unpaid (is_paid = false)
- **Disabled when:** API call in progress OR payment already paid
- **Hidden when:** Payment is not overdue (not shown on dashboard)

#### FlatCard Status Indicator

- **Show warning:** When debt > 0
- **Show success:** When debt = 0
- **Color coding:** Red for debt > 0, green for debt = 0

### No Validation Required

Dashboard is read-only view with action buttons. No form validation needed.

## 10. Error Handling

### API Errors

#### Fetch Dashboard Error

**Scenario:** `GET /api/dashboard` fails

**Handling:**

- Display error message: "Failed to load dashboard data"
- Provide "Retry" button
- Log error to console
- Do not crash the page

**User Experience:**

- Error message in place of dashboard content
- Clear visual indication of error state
- Action to resolve (retry)

#### Mark as Paid Error

**Scenario:** `POST /api/payments/:id/mark-paid` fails

**Handling:**

- Rollback optimistic update (restore payment to list)
- Display error toast: "Failed to mark payment as paid. Please try again."
- Log error to console
- Button returns to enabled state

**User Experience:**

- Payment remains in overdue list
- Clear error message
- User can retry action

### Authentication Errors

#### Unauthorized (401)

**Scenario:** User's session expired or not authenticated

**Handling:**

- Redirect to `/login` with return URL
- Clear any cached data
- Display message: "Your session has expired. Please log in."

### Network Errors

#### Network Unavailable

**Scenario:** User is offline or network error occurs

**Handling:**

- Display error message: "Network error. Please check your connection."
- Provide "Retry" button
- Disable actions that require network

### Edge Cases

#### No Flats

**Scenario:** User has no flats in database

**Handling:**

- Display empty state with illustration
- Show "Add your first flat" call-to-action button
- Hide overdue payments section

#### No Overdue Payments

**Scenario:** All payments are paid or no payments exist

**Handling:**

- Display success message: "All payments are up to date!"
- Show green checkmark icon
- Provide link to generate new payments (optional)

#### Large Debt Values

**Scenario:** Debt amount is very large (> 999,999)

**Handling:**

- Format with proper thousand separators (1,234,567.00)
- Consider abbreviated format for very large values (1.2M)
- Ensure card layout doesn't break

#### Stale Data

**Scenario:** User marks payment as paid, then navigates back

**Handling:**

- Refresh dashboard data on page focus
- Use cache invalidation strategy
- Display up-to-date information

## 11. Implementation Steps

### Step 1: Setup Base Structure

1. Create `/src/pages/index.astro` for dashboard page
2. Set up page authentication check (middleware)
3. Create `DashboardLayout` component extending `AppLayout`
4. Implement server-side data fetching for dashboard

### Step 2: Implement API Integration

1. Create `src/lib/services/dashboardService.ts` for API calls
2. Implement `fetchDashboard()` function
3. Implement `markPaymentAsPaid(paymentId)` function
4. Add error handling and response validation with Zod

### Step 3: Create View Models and Transformations

1. Define view model types in component files or shared types
2. Implement `transformDashboardData()` helper
3. Implement `transformFlatToViewModel()` helper
4. Implement `calculateStats()` helper
5. Implement currency formatting utility

### Step 4: Build Static Components (Astro)

1. Implement `DashboardHeader` component
2. Implement `SectionTitle` component (reusable)
3. Implement `FlatsListSection` wrapper
4. Implement `QuickActions` section
5. Add styling with Tailwind

### Step 5: Build React Components - Display

1. Implement `DashboardStatCard` component
2. Implement `SummaryStatistics` container
3. Implement `StatusBadge` component
4. Implement `FlatCard` component
5. Implement `FlatsList` component
6. Test with mock data

### Step 6: Build React Components - Interactive

1. Implement `QuickActionButton` component with loading states
2. Implement `OverduePaymentCard` component
3. Implement `OverduePaymentsList` component
4. Implement `OverduePaymentsSection` container
5. Add event handlers and optimistic updates

### Step 7: Implement State Management

1. Create `useDashboard` custom hook
2. Implement optimistic update logic
3. Implement error handling and rollback
4. Implement refresh functionality
5. Add loading states

### Step 8: Integrate Components in Page

1. Wire up server-side data fetching in `index.astro`
2. Pass data to React components via props
3. Implement client:load directives for interactive components
4. Add error boundary for client-side errors
5. Test data flow from API to UI

### Step 9: Styling and Responsiveness

1. Apply Tailwind classes for responsive grid layouts
2. Style overdue payments section with urgency indicators
3. Style stat cards with icons and formatting
4. Ensure mobile responsiveness (1 column on mobile)
5. Test on different screen sizes

### Step 10: Accessibility and Polish

1. Add ARIA labels and live regions
2. Implement keyboard navigation
3. Test with screen reader
4. Add focus indicators
5. Ensure color contrast meets WCAG standards
6. Add skip links if needed

### Step 11: Empty and Error States

1. Implement empty state for no flats
2. Implement empty state for no overdue payments
3. Implement error state for failed API calls
4. Add retry functionality
5. Test all edge cases

### Step 12: Testing and Refinement

1. Test with real API endpoints
2. Test optimistic updates and rollbacks
3. Test error scenarios (network errors, 500s, 401s)
4. Test navigation flows
5. Verify loading states
6. Performance testing (ensure fast initial load)
7. Cross-browser testing

### Step 13: Documentation

1. Document component props and usage
2. Add JSDoc comments to functions
3. Document state management patterns
4. Add README for dashboard implementation

---

**Implementation Priority:** This is the highest priority view as it's the landing page and provides the most value to users immediately after login.

**Estimated Complexity:** Medium - requires coordination between server-side rendering and client-side interactivity, but no complex forms or multi-step workflows.

**Dependencies:**

- API endpoint `/api/dashboard` must be implemented
- API endpoint `/api/payments/:id/mark-paid` must be implemented
- Authentication middleware must be configured
- shadcn/ui components (Button, Card, Badge) must be installed
