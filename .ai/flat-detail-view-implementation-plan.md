# View Implementation Plan: Flat Detail

## 1. Overview

The Flat Detail View is the central hub for managing a specific flat. It provides comprehensive information about the flat, including basic details, payment types, and payment history. This view serves as the primary interface for landlords to view and manage all aspects of a single property, including generating payments, managing payment types, and tracking payment status.

The view consolidates multiple data sources (flat details, payment types, payments) into a single, well-organized interface with clear sections and action areas. It acts as a gateway to deeper functionality like payment type management and payment generation.

## 2. View Routing

**Path:** `/flats/:id`

**Authentication:** Required - protected route. Unauthenticated users are redirected to `/login`.

**Authorization:** User must own the flat (validated via RLS in API)

**Navigation Access:**

- Click on flat card from Dashboard or Flats List
- Direct URL navigation
- Breadcrumb navigation

**Error Handling:**

- 404 if flat not found or doesn't belong to user
- 401 if user not authenticated

## 3. Component Structure

```
FlatDetailPage (Astro)
├── AppLayout (Astro)
│   ├── Header (Astro)
│   └── Breadcrumb (Astro) - "Dashboard > Flats > [Flat Name]"
├── FlatDetailHeader (React)
│   ├── FlatName (Astro)
│   ├── FlatAddress (Astro)
│   └── FlatActions (React)
│       ├── EditFlatButton (React)
│       └── DeleteFlatButton (React)
├── FlatOverview (Astro)
│   ├── FlatInfo (Astro)
│   └── FlatStats (React)
│       └── StatCard (React) x multiple
├── PaymentTypesSection (React)
│   ├── SectionHeader (Astro)
│   │   ├── SectionTitle (Astro)
│   │   └── AddPaymentTypeButton (React)
│   └── PaymentTypesTable (React)
│       └── PaymentTypeRow (React)
│           ├── PaymentTypeInfo (React)
│           └── PaymentTypeActions (React)
│               ├── EditPaymentTypeButton (React)
│               └── DeletePaymentTypeButton (React)
├── PaymentsSection (React)
│   ├── SectionHeader (Astro)
│   │   ├── SectionTitle (Astro)
│   │   ├── GeneratePaymentsButton (React)
│   │   └── AddPaymentButton (React) - Optional for MVP
│   ├── PaymentFilters (React) - Optional for MVP
│   │   ├── MonthFilter (React)
│   │   ├── YearFilter (React)
│   │   └── StatusFilter (React)
│   └── PaymentsTable (React)
│       └── PaymentRow (React)
│           ├── PaymentInfo (React)
│           ├── StatusBadge (React)
│           └── PaymentActions (React)
│               ├── MarkAsPaidButton (React)
│               ├── EditPaymentButton (React) - Disabled if paid
│               └── DeletePaymentButton (React) - Optional for MVP
└── ConfirmDialog (React) - Shared
```

**Component Hierarchy:**

- Astro for static structure and server-side rendering
- React for interactive tables and actions
- Shared UI components from shadcn/ui

## 4. Component Details

### FlatDetailPage (Astro)

**Description:** Main page component that fetches all flat-related data server-side and orchestrates the detail view.

**Main Elements:**

- Page wrapper with `AppLayout`
- Multiple server-side API calls for comprehensive data
- Error boundaries for various failure modes
- Coordinated data loading

**Handled Events:** None (static orchestration)

**Validation Conditions:**

- Flat ID from URL parameter must be valid UUID
- User must own the flat (enforced by RLS)

**Types:**

- `FlatDto` - Flat entity
- `PaymentTypeDto[]` - Payment types for flat
- `PaymentWithTypeNameDto[]` - Payments for flat
- `FlatDetailViewModel` - Complete view model

**Props:** None (page component)

**Server-Side Logic:**

```typescript
const { id } = Astro.params;

// Fetch flat details
const flatResponse = await fetch(`/api/flats/${id}`);
const flat: FlatDto = await flatResponse.json();

// Fetch payment types
const paymentTypesResponse = await fetch(`/api/flats/${id}/payment-types`);
const paymentTypesData: PaymentTypesResponseDto = await paymentTypesResponse.json();

// Fetch payments (default: unpaid only)
const paymentsResponse = await fetch(`/api/flats/${id}/payments`);
const paymentsData: PaymentsResponseDto = await paymentsResponse.json();

const viewModel = transformFlatDetailData(flat, paymentTypesData, paymentsData);
```

---

### FlatDetailHeader (React)

**Description:** Header section displaying flat name, address, and primary actions (edit, delete).

**Main Elements:**

- Flat name as `<h1>`
- Flat address with location icon
- Edit button
- Delete button with confirmation

**Handled Events:**

- Edit button click (navigate to edit form)
- Delete button click (show confirmation dialog)

**Validation Conditions:** None for display

**Types:**

- `FlatDto` (partial)

**Props:**

```typescript
interface FlatDetailHeaderProps {
  flat: {
    id: string;
    name: string;
    address: string;
  };
  onDelete: (flatId: string) => Promise<void>;
}
```

---

### FlatActions (React)

**Description:** Action buttons for editing and deleting the flat.

**Main Elements:**

- Edit button (secondary variant)
- Delete button (destructive variant)

**Handled Events:**

- Edit click → navigate to `/flats/:id/edit`
- Delete click → show confirmation dialog

**Validation Conditions:**

- Delete requires confirmation

**Types:** Standard button types

**Props:**

```typescript
interface FlatActionsProps {
  flatId: string;
  onDelete: (flatId: string) => Promise<void>;
}
```

**Delete Flow:**

1. User clicks delete button
2. Confirmation dialog appears
3. User confirms
4. API call to `DELETE /api/flats/:id`
5. On success: redirect to dashboard with success toast
6. On error: show error toast, stay on page

---

### EditFlatButton (React)

**Description:** Button to navigate to edit flat form.

**Main Elements:**

- Button with "Edit" label
- Edit icon

**Handled Events:**

- Click → navigate to `/flats/:id/edit`

**Validation Conditions:** None

**Types:** Standard button

**Props:**

```typescript
interface EditFlatButtonProps {
  flatId: string;
}
```

---

### DeleteFlatButton (React)

**Description:** Button to delete flat with confirmation.

**Main Elements:**

- Button with "Delete" label
- Destructive styling
- Trash icon

**Handled Events:**

- Click → show confirmation dialog

**Validation Conditions:**

- Requires confirmation via dialog

**Types:** Standard button

**Props:**

```typescript
interface DeleteFlatButtonProps {
  flatId: string;
  onConfirmDelete: (flatId: string) => Promise<void>;
}
```

---

### FlatOverview (Astro)

**Description:** Section showing basic flat information and statistics.

**Main Elements:**

- Flat information card
- Statistics cards (debt, payment types count, pending payments)

**Handled Events:** None

**Validation Conditions:** None

**Types:**

- `FlatOverviewViewModel`

**Props:**

```typescript
interface FlatOverviewProps {
  flat: FlatDto;
  stats: FlatStatsViewModel;
}
```

---

### FlatStats (React)

**Description:** Row of statistics cards showing flat metrics.

**Main Elements:**

- Grid of `StatCard` components
- Metrics: total debt, payment types count, pending payments count

**Handled Events:** None

**Validation Conditions:** None

**Types:**

- `FlatStatsViewModel`

**Props:**

```typescript
interface FlatStatsProps {
  stats: FlatStatsViewModel;
}
```

---

### PaymentTypesSection (React)

**Description:** Section displaying all payment types for the flat with management actions.

**Main Elements:**

- Section header with "Payment Types" title
- Add payment type button
- Payment types table
- Empty state if no payment types

**Handled Events:**

- Add payment type click
- Edit payment type click
- Delete payment type click (disabled in MVP)

**Validation Conditions:**

- At least 1 payment type must exist (business rule, enforced on delete)

**Types:**

- `PaymentTypeDto[]`
- `PaymentTypeViewModel[]`

**Props:**

```typescript
interface PaymentTypesSectionProps {
  paymentTypes: PaymentTypeViewModel[];
  flatId: string;
  onPaymentTypeUpdated: () => Promise<void>;
}
```

---

### PaymentTypesTable (React)

**Description:** Table displaying all payment types with columns for name, amount, and actions.

**Main Elements:**

- Table with semantic HTML (`<table>`, `<thead>`, `<tbody>`)
- Column headers: Name, Base Amount, Actions
- Rows for each payment type
- Empty state if no payment types

**Handled Events:**

- Delegates edit/delete to row components

**Validation Conditions:** None

**Types:**

- `PaymentTypeViewModel[]`

**Props:**

```typescript
interface PaymentTypesTableProps {
  paymentTypes: PaymentTypeViewModel[];
  onEdit: (paymentTypeId: string) => void;
  onDelete: (paymentTypeId: string) => Promise<void>;
}
```

**Accessibility:**

- Proper table structure with `<th>` headers
- Row scope for screen readers
- Keyboard navigation support

---

### PaymentTypeRow (React)

**Description:** Individual row in payment types table.

**Main Elements:**

- Payment type name cell
- Base amount cell (formatted currency)
- Actions cell (edit button, delete button)

**Handled Events:**

- Edit button click
- Delete button click (disabled in MVP)

**Validation Conditions:**

- Delete disabled if last payment type (business rule)

**Types:**

- `PaymentTypeViewModel`

**Props:**

```typescript
interface PaymentTypeRowProps {
  paymentType: PaymentTypeViewModel;
  onEdit: (paymentTypeId: string) => void;
  onDelete: (paymentTypeId: string) => Promise<void>;
  isOnlyPaymentType: boolean; // Disable delete if true
}
```

---

### AddPaymentTypeButton (React)

**Description:** Button to navigate to create payment type form.

**Main Elements:**

- Primary button
- "Add Payment Type" label
- Plus icon

**Handled Events:**

- Click → navigate to `/flats/:flatId/payment-types/new`

**Validation Conditions:** None

**Types:** Standard button

**Props:**

```typescript
interface AddPaymentTypeButtonProps {
  flatId: string;
}
```

---

### PaymentsSection (React)

**Description:** Section displaying all payments for the flat with filtering and management actions.

**Main Elements:**

- Section header with "Payments" title
- Generate payments button
- Optional: Add manual payment button
- Optional: Filter controls
- Payments table
- Empty state if no payments

**Handled Events:**

- Generate payments click
- Filter changes (month, year, status)
- Mark as paid click
- Edit payment click

**Validation Conditions:**

- Filters must be valid (month 1-12, year valid range)

**Types:**

- `PaymentWithTypeNameDto[]`
- `PaymentViewModel[]`
- `PaymentFiltersState`

**Props:**

```typescript
interface PaymentsSectionProps {
  payments: PaymentViewModel[];
  flatId: string;
  filters: PaymentFiltersState;
  onFiltersChange: (filters: PaymentFiltersState) => void;
  onPaymentMarkedPaid: (paymentId: string) => Promise<void>;
}
```

---

### PaymentFilters (React) - Optional for MVP

**Description:** Filter controls for payments list.

**Main Elements:**

- Month dropdown (1-12)
- Year input
- Status radio buttons (All, Pending, Paid)
- Clear filters button

**Handled Events:**

- Filter value changes
- Clear filters click

**Validation Conditions:**

- Month: 1-12
- Year: 1900-2100

**Types:**

- `PaymentFiltersState`

**Props:**

```typescript
interface PaymentFiltersProps {
  filters: PaymentFiltersState;
  onChange: (filters: PaymentFiltersState) => void;
  onClear: () => void;
}
```

**Note:** Can be deferred to post-MVP if not essential.

---

### PaymentsTable (React)

**Description:** Table displaying all payments with columns for due date, type, amount, status, and actions.

**Main Elements:**

- Table with semantic HTML
- Column headers: Due Date, Payment Type, Amount, Status, Actions
- Rows for each payment
- Sorting (optional)
- Empty state if no payments

**Handled Events:**

- Delegates actions to row components
- Optional: Column header click for sorting

**Validation Conditions:** None

**Types:**

- `PaymentViewModel[]`

**Props:**

```typescript
interface PaymentsTableProps {
  payments: PaymentViewModel[];
  onMarkAsPaid: (paymentId: string) => Promise<void>;
  onEdit: (paymentId: string) => void;
  onDelete: (paymentId: string) => Promise<void>;
}
```

**Accessibility:**

- Proper table structure
- Sortable headers with `aria-sort`
- Row scope for screen readers

---

### PaymentRow (React)

**Description:** Individual row in payments table.

**Main Elements:**

- Due date cell (formatted: "January 2024" or "01/2024")
- Payment type name cell
- Amount cell (formatted currency)
- Status badge cell
- Actions cell (mark as paid, edit, delete)

**Handled Events:**

- Mark as paid click
- Edit click (disabled if paid)
- Delete click

**Validation Conditions:**

- Edit disabled if `is_paid === true`
- Mark as paid hidden if `is_paid === true`

**Types:**

- `PaymentViewModel`

**Props:**

```typescript
interface PaymentRowProps {
  payment: PaymentViewModel;
  onMarkAsPaid: (paymentId: string) => Promise<void>;
  onEdit: (paymentId: string) => void;
  onDelete: (paymentId: string) => Promise<void>;
}
```

**Visual Features:**

- Paid payments visually distinct (muted, strikethrough optional)
- Overdue payments highlighted (red text or badge)

---

### MarkAsPaidButton (React)

**Description:** Quick action button to mark payment as paid.

**Main Elements:**

- Button or checkbox
- Loading state during API call
- Success animation

**Handled Events:**

- Click → mark payment as paid

**Validation Conditions:**

- Only shown for unpaid payments (`is_paid === false`)

**Types:** Standard button

**Props:**

```typescript
interface MarkAsPaidButtonProps {
  paymentId: string;
  onMarkAsPaid: (paymentId: string) => Promise<void>;
  disabled?: boolean;
}
```

**Features:**

- Optimistic UI update
- Rollback on error
- Success feedback

---

### GeneratePaymentsButton (React)

**Description:** Button to navigate to payment generation form.

**Main Elements:**

- Primary button
- "Generate Payments" label
- Calendar or plus icon

**Handled Events:**

- Click → navigate to `/flats/:flatId/payments/generate`

**Validation Conditions:** None

**Types:** Standard button

**Props:**

```typescript
interface GeneratePaymentsButtonProps {
  flatId: string;
}
```

---

### ConfirmDialog (React)

**Description:** Reusable modal dialog for confirming destructive actions.

**Main Elements:**

- Modal overlay
- Dialog box
- Title
- Message/description
- Confirm button (destructive)
- Cancel button
- Close X button

**Handled Events:**

- Confirm click
- Cancel click
- Escape key press
- Overlay click

**Validation Conditions:** None

**Types:**

- Generic dialog props

**Props:**

```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string; // Default: "Confirm"
  cancelLabel?: string; // Default: "Cancel"
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isDestructive?: boolean; // Styles confirm button as destructive
}
```

**Accessibility:**

- Focus trap when open
- Focus on confirm button when opened
- Escape to close
- ARIA dialog role

## 5. Types

### View Models

```typescript
/**
 * Complete flat detail view model
 */
interface FlatDetailViewModel {
  flat: FlatDto;
  paymentTypes: PaymentTypeViewModel[];
  payments: PaymentViewModel[];
  stats: FlatStatsViewModel;
  filters: PaymentFiltersState;
}

/**
 * Payment type view model with actions
 */
interface PaymentTypeViewModel extends PaymentTypeDto {
  formattedBaseAmount: string;
  editUrl: string;
  canDelete: boolean; // False if last payment type
}

/**
 * Payment view model with enhanced data
 */
interface PaymentViewModel extends PaymentWithTypeNameDto {
  formattedAmount: string;
  formattedDate: string; // "January 2024"
  dueDate: Date; // Computed from month/year
  isOverdue: boolean;
  isPaid: boolean; // Alias for is_paid
  canEdit: boolean; // False if is_paid === true
  editUrl: string;
}

/**
 * Flat statistics view model
 */
interface FlatStatsViewModel {
  totalDebt: number;
  formattedDebt: string;
  paymentTypesCount: number;
  pendingPaymentsCount: number;
  overduePaymentsCount: number;
}

/**
 * Payment filters state
 */
interface PaymentFiltersState {
  month?: number; // 1-12, undefined for all
  year?: number; // YYYY, undefined for all
  isPaid?: boolean; // true, false, undefined for all
}
```

### API Response Types (from types.ts)

- `FlatDto` - Flat entity from `GET /api/flats/:id`
- `PaymentTypesResponseDto` - Response from `GET /api/flats/:flatId/payment-types`
- `PaymentTypeDto` - Individual payment type entity
- `PaymentsResponseDto` - Response from `GET /api/flats/:flatId/payments`
- `PaymentWithTypeNameDto` - Payment with joined type name
- `MarkPaidResponseDto` - Response from `POST /api/payments/:id/mark-paid`
- `DeleteFlatResponseDto` - Response from `DELETE /api/flats/:id`

## 6. State Management

### Server-Side State

- Initial data for flat, payment types, and payments fetched server-side
- Multiple API calls coordinated in Astro component
- Data transformed to view models and passed to React components

### Client-Side State

**Custom Hook: `useFlatDetail`**

Location: `src/components/hooks/useFlatDetail.ts`

Purpose: Manage flat detail data, payments, filters, and actions

```typescript
interface UseFlatDetailReturn {
  payments: PaymentViewModel[];
  paymentTypes: PaymentTypeViewModel[];
  stats: FlatStatsViewModel;
  filters: PaymentFiltersState;
  isLoading: boolean;
  error: Error | null;

  // Actions
  setFilters: (filters: PaymentFiltersState) => void;
  markPaymentAsPaid: (paymentId: string) => Promise<void>;
  deleteFlat: (flatId: string) => Promise<void>;
  refreshPayments: () => Promise<void>;
}

function useFlatDetail(
  initialPayments: PaymentViewModel[],
  initialPaymentTypes: PaymentTypeViewModel[],
  initialStats: FlatStatsViewModel,
  flatId: string
): UseFlatDetailReturn;
```

**State Variables:**

- `payments` - Current list of payments (filtered)
- `paymentTypes` - Current list of payment types
- `stats` - Current statistics
- `filters` - Current filter state
- `isLoading` - Loading state for async operations
- `error` - Error state
- `optimisticUpdates` - Map of pending optimistic updates

**State Updates:**

- Filter changes re-fetch payments with new query params
- Mark as paid optimistically updates payment in list
- Refresh re-fetches all data

### Local Component State

**PaymentFilters Component:**

- `localFilters` - Local state before applying (optional, for "Apply" button pattern)

**ConfirmDialog Component:**

- `isOpen` - Dialog visibility state
- `isConfirming` - Loading state during confirm action

### No Global State Required

- View is self-contained
- Data specific to this flat
- Navigation to other views doesn't share state

## 7. API Integration

### Endpoints Used

#### GET /api/flats/:id

**Purpose:** Fetch flat details

**Request Type:** `void` (ID in URL)

**Response Type:** `FlatDto`

**When Called:**

- Server-side on page load

**Error Handling:**

- 404: Show "Flat not found" error page
- 401: Redirect to login
- 500: Show error message with retry

---

#### GET /api/flats/:flatId/payment-types

**Purpose:** Fetch all payment types for flat

**Request Type:** `void`

**Response Type:** `PaymentTypesResponseDto`

**When Called:**

- Server-side on page load
- After adding/editing/deleting payment type (refresh)

**Error Handling:**

- 404: Cascade from flat not found
- 500: Show error in payment types section, allow rest of page to function

---

#### GET /api/flats/:flatId/payments

**Purpose:** Fetch payments for flat with optional filtering

**Request Type:** `PaymentsQueryParams`

```typescript
interface PaymentsQueryParams {
  month?: number;
  year?: number;
  is_paid?: boolean;
}
```

**Response Type:** `PaymentsResponseDto`

**When Called:**

- Server-side on page load (default: unpaid only)
- Client-side when filters change
- After marking payment as paid (refresh)
- After generating payments (refresh)

**Error Handling:**

- 400: Show validation error for invalid query params
- 404: Cascade from flat not found
- 500: Show error in payments section

---

#### POST /api/payments/:id/mark-paid

**Purpose:** Mark payment as paid

**Request Type:** `void` (no body)

**Response Type:** `MarkPaidResponseDto`

**When Called:**

- User clicks "Mark as Paid" button

**Error Handling:**

- 400: Show error toast "Payment already paid" or other business error
- 404: Show error toast "Payment not found"
- 500: Rollback optimistic update, show error toast

---

#### DELETE /api/flats/:id

**Purpose:** Delete flat and all associated data

**Request Type:** `void`

**Response Type:** `DeleteFlatResponseDto`

**When Called:**

- User confirms delete in confirmation dialog

**Error Handling:**

- 404: Show error toast "Flat not found" (rare, should exist if on page)
- 500: Show error toast "Failed to delete flat"

**Success:**

- Redirect to dashboard (`/`)
- Show success toast "Flat deleted successfully"

### Data Transformation

**API to ViewModel:**

```typescript
function transformFlatDetailData(
  flat: FlatDto,
  paymentTypesData: PaymentTypesResponseDto,
  paymentsData: PaymentsResponseDto
): FlatDetailViewModel {
  const paymentTypes = paymentTypesData.payment_types.map((pt) =>
    transformPaymentType(pt, paymentTypesData.payment_types.length)
  );

  const payments = paymentsData.payments.map(transformPayment);

  const stats = calculateFlatStats(paymentTypes, payments);

  return {
    flat,
    paymentTypes,
    payments,
    stats,
    filters: { is_paid: false }, // Default filter
  };
}

function transformPaymentType(pt: PaymentTypeDto, totalCount: number): PaymentTypeViewModel {
  return {
    ...pt,
    formattedBaseAmount: formatCurrency(pt.base_amount),
    editUrl: `/payment-types/${pt.id}/edit`,
    canDelete: totalCount > 1, // Can't delete if it's the last one
  };
}

function transformPayment(p: PaymentWithTypeNameDto): PaymentViewModel {
  const dueDate = new Date(p.year, p.month - 1, 1);
  const now = new Date();
  const isOverdue = dueDate < now && !p.is_paid;

  return {
    ...p,
    formattedAmount: formatCurrency(p.amount),
    formattedDate: formatMonthYear(p.month, p.year),
    dueDate,
    isOverdue,
    isPaid: p.is_paid,
    canEdit: !p.is_paid,
    editUrl: `/payments/${p.id}/edit`,
  };
}

function calculateFlatStats(paymentTypes: PaymentTypeViewModel[], payments: PaymentViewModel[]): FlatStatsViewModel {
  const unpaidPayments = payments.filter((p) => !p.isPaid);
  const totalDebt = unpaidPayments.reduce((sum, p) => sum + p.amount, 0);
  const overdueCount = payments.filter((p) => p.isOverdue).length;

  return {
    totalDebt,
    formattedDebt: formatCurrency(totalDebt),
    paymentTypesCount: paymentTypes.length,
    pendingPaymentsCount: unpaidPayments.length,
    overduePaymentsCount: overdueCount,
  };
}
```

## 8. User Interactions

### Primary Interactions

#### 1. Mark Payment as Paid

**Trigger:** User clicks "Mark as Paid" button or checkbox on payment row

**Flow:**

1. User clicks button
2. Button shows loading spinner
3. Optimistic update: payment's `isPaid` set to true, row styled as paid
4. API call to `POST /api/payments/:id/mark-paid`
5. On success: Payment remains updated, stats recalculate, toast notification
6. On error: Rollback payment state, show error toast

**Validation:**

- Payment must be unpaid (`is_paid === false`)

**Feedback:**

- Button loading state
- Optimistic UI update (immediate visual feedback)
- Success toast: "Payment marked as paid"
- Error toast: "Failed to mark payment. Please try again."
- Stats update (debt decreases, pending count decreases)

---

#### 2. Delete Flat

**Trigger:** User clicks "Delete" button in header

**Flow:**

1. User clicks delete button
2. Confirmation dialog opens
3. Dialog explains consequences: "This will delete the flat and all payment types and payments. This cannot be undone."
4. User clicks "Delete" to confirm or "Cancel" to abort
5. If confirmed:
   - Dialog shows loading state
   - API call to `DELETE /api/flats/:id`
   - On success: Redirect to `/` with toast "Flat deleted successfully"
   - On error: Close dialog, show error toast

**Validation:**

- Requires explicit confirmation

**Feedback:**

- Confirmation dialog with clear warning
- Loading state in dialog
- Success: Redirect with toast
- Error: Toast message, stay on page

---

#### 3. Edit Flat

**Trigger:** User clicks "Edit" button in header

**Flow:**

1. User clicks edit button
2. Client-side navigation to `/flats/:id/edit`
3. Edit form loads with current flat data

**Validation:** None (navigation only)

**Feedback:**

- Button hover state
- Immediate navigation

---

#### 4. Add Payment Type

**Trigger:** User clicks "Add Payment Type" button

**Flow:**

1. User clicks button
2. Client-side navigation to `/flats/:flatId/payment-types/new`
3. Create payment type form loads

**Validation:** None (navigation only)

**Feedback:**

- Button hover state
- Immediate navigation

---

#### 5. Edit Payment Type

**Trigger:** User clicks "Edit" button on payment type row

**Flow:**

1. User clicks edit button
2. Client-side navigation to `/payment-types/:id/edit`
3. Edit form loads with current payment type data

**Validation:** None (navigation only)

**Feedback:**

- Button hover state
- Immediate navigation

---

#### 6. Generate Payments

**Trigger:** User clicks "Generate Payments" button

**Flow:**

1. User clicks button
2. Client-side navigation to `/flats/:flatId/payments/generate`
3. Payment generation form loads

**Validation:** None (navigation only)

**Feedback:**

- Button hover state
- Immediate navigation

---

#### 7. Filter Payments

**Trigger:** User changes filter values (month, year, status)

**Flow:**

1. User selects filter value (e.g., month = January, year = 2024)
2. Filter state updates
3. API call to `GET /api/flats/:flatId/payments?month=1&year=2024`
4. Payments table updates with filtered results
5. If no results: Show empty state "No payments found for selected filters"

**Validation:**

- Month: 1-12
- Year: valid number
- Status: true/false/undefined

**Feedback:**

- Loading state during fetch
- Table updates with new data
- Empty state if no matches
- Filter pills or badges showing active filters

---

#### 8. Clear Filters

**Trigger:** User clicks "Clear Filters" button

**Flow:**

1. User clicks button
2. Filters reset to default (unpaid only)
3. API call with default filters
4. Table updates with default view

**Validation:** None

**Feedback:**

- Immediate filter reset
- Table updates

### Secondary Interactions

- **Breadcrumb Navigation:** Click breadcrumb links to navigate back
- **Return to Dashboard:** Click "Dashboard" in navigation or breadcrumb
- **Keyboard Navigation:** Tab through interactive elements
- **Table Sorting:** Click column headers to sort (optional enhancement)

## 9. Conditions and Validation

### Display Conditions

#### Payment Types Section

- **Always visible:** Show section even if empty
- **Empty state:** "No payment types defined. Add your first payment type to start."
- **Add button:** Always enabled

#### Payments Section

- **Always visible:** Show section even if empty
- **Empty state (no payments):** "No payments generated. Generate payments for a specific month."
- **Empty state (filtered, no results):** "No payments found for selected filters. Try adjusting your filters."
- **Generate button:** Always enabled

#### Flat Actions

- **Edit button:** Always enabled
- **Delete button:** Always enabled (with confirmation)

### Component-Level Conditions

#### PaymentTypeRow Actions

- **Edit button:** Always enabled
- **Delete button:** Disabled if `isOnlyPaymentType === true` (business rule: minimum 1 payment type)
- **Delete button tooltip:** "Cannot delete the last payment type"

#### PaymentRow Actions

- **Mark as Paid button:**
  - Visible when `isPaid === false`
  - Hidden when `isPaid === true`
- **Edit button:**
  - Enabled when `canEdit === true` (i.e., `isPaid === false`)
  - Disabled when `isPaid === true`
  - Disabled state tooltip: "Cannot edit paid payment"
- **Delete button:**
  - Always enabled (or hidden in MVP if no delete functionality)

#### Payment Visual States

- **Paid payments:** Muted text color, optional strikethrough, green badge
- **Overdue payments:** Red text or red badge, highlighted row background
- **Pending payments:** Default styling, yellow badge

#### Filters

- **Month dropdown:**
  - Options: "All", "January" (1), "February" (2), ..., "December" (12)
  - Default: "All" (undefined)
- **Year input:**
  - Number input
  - Min: 1900, Max: 2100
  - Default: current year or "All"
- **Status filter:**
  - Options: "All", "Pending", "Paid"
  - Default: "Pending" (`is_paid: false`)

### Validation Rules

#### Payment Filters

- **Month:** If provided, must be 1-12
- **Year:** If provided, must be valid number in range 1900-2100
- **Status:** true, false, or undefined (all)

**Client-Side Validation:**

- Validate before making API call
- Show inline error for invalid values

**Server-Side Validation:**

- API validates query parameters
- Returns 400 if invalid

### Business Rules Enforced

1. **Minimum Payment Types:** Cannot delete last payment type (button disabled)
2. **Paid Payment Immutability:** Cannot edit paid payments (button disabled)
3. **User Ownership:** Can only view/edit own flats (RLS enforced)

## 10. Error Handling

### API Errors

#### Flat Not Found (404)

**Scenario:** `GET /api/flats/:id` returns 404

**Handling:**

- Display full-page error: "Flat not found"
- Message: "The flat you're looking for doesn't exist or you don't have access to it."
- Action: "Return to Dashboard" button
- No other content rendered

---

#### Payment Types Fetch Error

**Scenario:** `GET /api/flats/:flatId/payment-types` fails

**Handling:**

- Show error in payment types section only
- Rest of page functions normally
- Error message: "Failed to load payment types"
- Retry button in section
- Don't crash entire page

---

#### Payments Fetch Error

**Scenario:** `GET /api/flats/:flatId/payments` fails

**Handling:**

- Show error in payments section only
- Rest of page functions normally
- Error message: "Failed to load payments"
- Retry button in section

---

#### Mark as Paid Error

**Scenario:** `POST /api/payments/:id/mark-paid` fails

**Handling:**

- Rollback optimistic update
- Payment returns to unpaid state
- Show error toast: "Failed to mark payment as paid. Please try again."
- Button returns to enabled state
- User can retry

---

#### Delete Flat Error

**Scenario:** `DELETE /api/flats/:id` fails

**Handling:**

- Close confirmation dialog
- Show error toast: "Failed to delete flat. Please try again."
- User remains on flat detail page
- Can retry delete

---

#### Invalid Filters

**Scenario:** User enters invalid filter values

**Handling:**

- Client-side validation prevents submission
- Inline error message: "Month must be between 1 and 12"
- Disable apply button until valid
- Don't make API call with invalid data

### Authentication Errors

#### Unauthorized (401)

**Scenario:** User session expired

**Handling:**

- Redirect to `/login?returnTo=/flats/:id`
- Show message: "Your session has expired. Please log in."

### Network Errors

#### Network Unavailable

**Scenario:** Network error during any API call

**Handling:**

- Show error message: "Network error. Please check your connection."
- Retry button
- Disable actions requiring network

### Edge Cases

#### No Payment Types

**Scenario:** Flat has no payment types

**Handling:**

- Display empty state with message
- Prominent "Add Payment Type" CTA
- Explain: "You need at least one payment type to generate payments"
- Disable "Generate Payments" button (optional) or allow navigation anyway

---

#### No Payments

**Scenario:** Flat has no generated payments

**Handling:**

- Display empty state with message
- "Generate Payments" CTA
- Explain: "No payments have been generated yet"

---

#### All Payments Paid

**Scenario:** All payments are paid, default filter shows empty

**Handling:**

- Empty state: "All payments are paid!"
- Success icon (checkmark)
- Suggestion: "Change filter to see paid payments" or "Generate payments for next month"

---

#### Filtered Results Empty

**Scenario:** Filter yields no results

**Handling:**

- Empty state: "No payments found for selected filters"
- Suggestion: "Try adjusting your filters"
- "Clear Filters" button

---

#### Very Large Number of Payments

**Scenario:** Flat has 100+ payments

**Handling:**

- MVP: Display all (scrollable table)
- Performance: Consider pagination (post-MVP)
- Encourage use of filters to narrow results

---

#### Delete Last Payment Type Attempt

**Scenario:** User tries to delete the only payment type

**Handling:**

- Delete button disabled
- Tooltip: "Cannot delete the last payment type. A flat must have at least one payment type."

---

#### Concurrent Modification

**Scenario:** Payment marked as paid in another session/tab

**Handling:**

- If user tries to edit: API returns 400 "Payment is already paid"
- Show error toast
- Refresh payments to sync state

## 10. Implementation Steps

### Step 1: Setup Page Structure

1. Create `/src/pages/flats/[id].astro` file
2. Implement authentication check
3. Extract `id` parameter from URL
4. Set up `AppLayout` with breadcrumbs
5. Configure page metadata and title

### Step 2: Implement API Integration Service

1. Create or extend `src/lib/services/flatsService.ts`
2. Implement `fetchFlatById(id)` function
3. Implement `fetchPaymentTypes(flatId)` function
4. Implement `fetchPayments(flatId, filters)` function
5. Implement `deleteFlat(flatId)` function
6. Add error handling and Zod validation

### Step 3: Implement Server-Side Data Fetching

1. Fetch flat details in Astro component
2. Fetch payment types
3. Fetch payments (default filter: unpaid)
4. Handle 404 errors (flat not found)
5. Handle other errors gracefully
6. Transform data to view models

### Step 4: Create View Models and Utilities

1. Define all view model types
2. Implement `transformFlatDetailData()` helper
3. Implement `transformPaymentType()` helper
4. Implement `transformPayment()` helper
5. Implement `calculateFlatStats()` helper
6. Implement `formatMonthYear()` utility
7. Test transformations with sample data

### Step 5: Build Static Layout Components (Astro)

1. Implement page layout with sections
2. Implement `FlatOverview` component
3. Implement `FlatInfo` display
4. Implement section headers
5. Implement empty states
6. Add Tailwind styling

### Step 6: Build Header and Actions (React)

1. Implement `FlatDetailHeader` component
2. Implement `FlatActions` component
3. Implement `EditFlatButton` component
4. Implement `DeleteFlatButton` component
5. Wire up navigation for edit
6. Wire up delete confirmation (basic)

### Step 7: Build Stats Display (React)

1. Implement `FlatStats` component
2. Implement `StatCard` component (or reuse from dashboard)
3. Display total debt, payment types count, pending count
4. Format numbers and currency
5. Test with various data scenarios

### Step 8: Build Payment Types Section (React)

1. Implement `PaymentTypesSection` component
2. Implement `PaymentTypesTable` component
3. Implement `PaymentTypeRow` component
4. Implement `AddPaymentTypeButton` component
5. Implement edit/delete action buttons
6. Wire up navigation for add/edit
7. Handle empty state
8. Disable delete for last payment type

### Step 9: Build Payments Section (React)

1. Implement `PaymentsSection` component
2. Implement `PaymentsTable` component
3. Implement `PaymentRow` component
4. Implement `MarkAsPaidButton` component
5. Implement `GeneratePaymentsButton` component
6. Implement status badges
7. Handle empty states (no payments, filtered empty)

### Step 10: Implement Payment Filters (Optional)

1. Implement `PaymentFilters` component
2. Add month dropdown
3. Add year input
4. Add status radio/select
5. Implement filter change handlers
6. Wire up to API calls
7. Add clear filters functionality
8. Show active filters visually

### Step 11: Implement State Management Hook

1. Create `useFlatDetail` custom hook
2. Implement filter state management
3. Implement mark as paid with optimistic update
4. Implement delete flat action
5. Implement refresh payments
6. Add error handling and rollback logic
7. Test state transitions

### Step 12: Build Confirm Dialog

1. Implement `ConfirmDialog` component (or use shadcn dialog)
2. Implement focus trap
3. Implement keyboard handling (Escape, Enter)
4. Style as destructive for delete actions
5. Add loading state for async confirms
6. Test accessibility

### Step 13: Integrate All Components

1. Wire up all components in main page
2. Pass data from server to React components
3. Add `client:load` directives for interactive parts
4. Connect event handlers
5. Test data flow end-to-end

### Step 14: Implement Delete Flat Flow

1. Wire delete button to open confirm dialog
2. Implement confirm handler calling API
3. Handle success (redirect to dashboard with toast)
4. Handle error (show toast, stay on page)
5. Test delete flow

### Step 15: Implement Mark as Paid Flow

1. Wire mark as paid button to handler
2. Implement optimistic update logic
3. Call API endpoint
4. Handle success (keep update, show toast, update stats)
5. Handle error (rollback, show toast)
6. Test with various scenarios

### Step 16: Styling and Responsiveness

1. Apply Tailwind classes for layout
2. Style tables with proper spacing
3. Style action buttons
4. Ensure responsive design (mobile: stacked, desktop: side-by-side)
5. Add hover states and transitions
6. Test on different screen sizes

### Step 17: Accessibility

1. Add ARIA labels to tables
2. Implement keyboard navigation
3. Add focus indicators
4. Test with screen reader
5. Ensure color contrast (WCAG AA)
6. Add skip links if needed
7. Test dialog focus management

### Step 18: Error States

1. Implement 404 flat not found page
2. Implement section-level error displays
3. Implement retry functionality
4. Test all error scenarios (API failures, network errors, 401)
5. Verify error messages are clear

### Step 19: Testing

1. Test with various data states (empty, populated, large datasets)
2. Test all user interactions
3. Test filter functionality
4. Test optimistic updates and rollbacks
5. Test delete flow
6. Test navigation flows
7. Cross-browser testing
8. Accessibility testing

### Step 20: Documentation

1. Document component props and usage
2. Add JSDoc comments
3. Document state management patterns
4. Document view model transformations
5. Add README for flat detail implementation

---

**Implementation Priority:** High - essential view for flat management, required for MVP.

**Estimated Complexity:** High - most complex view with multiple data sources, tables, filters, and interactive elements.

**Dependencies:**

- API endpoints for flats, payment types, payments must be implemented
- Mark as paid endpoint must be implemented
- Delete flat endpoint must be implemented
- shadcn/ui components (Button, Table, Dialog, Badge) must be installed
- `AppLayout` component must exist
- Toast notification system must be implemented
- Currency and date formatting utilities
