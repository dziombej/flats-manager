# View Implementation Plan: Generate Payments

## 1. Overview

The Generate Payments View provides a streamlined interface for landlords to create multiple monthly payment instances in one action. This view allows users to select a target month and year, previews the payments that will be generated based on the flat's payment types, and executes the generation with clear feedback.

This is a critical feature that automates the monthly payment creation process, saving landlords significant time compared to manual entry. The view emphasizes clarity and preview functionality to prevent errors.

## 2. View Routing

**Path:** `/flats/:flatId/payments/generate`

**Authentication:** Required - protected route. Unauthenticated users are redirected to `/login`.

**Authorization:** User must own the flat (validated via RLS in API)

**Navigation Access:**
- "Generate Payments" button from Flat Detail View (Payments section)
- Direct URL navigation (with valid flatId)

**Return Navigation:**
- Cancel button returns to Flat Detail View
- Success redirects to Flat Detail View with filter set to generated month/year

## 3. Component Structure

```
GeneratePaymentsPage (Astro)
├── AppLayout (Astro)
│   ├── Header (Astro)
│   └── Breadcrumb (Astro) - "Dashboard > Flats > [Flat Name] > Generate Payments"
├── GeneratePaymentsHeader (Astro)
│   ├── PageTitle (Astro)
│   └── FlatNameBreadcrumb (Astro)
├── GeneratePaymentsForm (React)
│   ├── FormHeader (Astro)
│   ├── DateSelectionSection (React)
│   │   ├── MonthSelect (React)
│   │   └── YearInput (React)
│   ├── PaymentTypesSelectionSection (React)
│   │   └── PaymentTypeCheckbox (React) - Multiple instances
│   ├── PreviewSection (React)
│   │   ├── PreviewHeader (Astro)
│   │   ├── PreviewList (React)
│   │   │   └── PreviewItem (React)
│   │   └── PreviewSummary (React)
│   ├── WarningSection (React) - Conditional
│   │   └── ConflictWarning (React)
│   └── FormActions (React)
│       ├── CancelButton (React)
│       └── GenerateButton (React)
└── SuccessState (React) - Shown after generation
    ├── SuccessIcon (Astro)
    ├── SuccessMessage (Astro)
    └── ViewPaymentsButton (React)
```

**Component Hierarchy:**
- Astro for static structure and breadcrumbs
- React for interactive form with real-time preview
- Form validation with Zod
- Optimistic UI with error handling

## 4. Component Details

### GeneratePaymentsPage (Astro)
**Description:** Main page component that fetches flat and payment types data, then renders the generation form.

**Main Elements:**
- Page wrapper with `AppLayout`
- Server-side data fetching for flat details and payment types
- Error handling for missing flat or payment types
- Conditional rendering for empty payment types state

**Handled Events:** None (static orchestration)

**Validation Conditions:**
- Flat ID must be valid UUID
- Flat must exist and belong to user
- Flat must have at least one payment type

**Types:**
- `FlatDto` - Flat entity
- `PaymentTypeDto[]` - Available payment types
- `GeneratePaymentsViewModel` - Complete view model

**Props:** None (page component)

**Server-Side Logic:**
```typescript
const { flatId } = Astro.params;

// Fetch flat details
const flatResponse = await fetch(`/api/flats/${flatId}`);
const flat: FlatDto = await flatResponse.json();

// Fetch payment types
const paymentTypesResponse = await fetch(`/api/flats/${flatId}/payment-types`);
const paymentTypesData: PaymentTypesResponseDto = await paymentTypesResponse.json();

// Check if flat has payment types
if (paymentTypesData.payment_types.length === 0) {
  // Show error: Cannot generate payments without payment types
}

const viewModel = transformGeneratePaymentsData(flat, paymentTypesData);
```

---

### GeneratePaymentsHeader (Astro)
**Description:** Page header with title and context.

**Main Elements:**
- `<h1>` with "Generate Payments" title
- Subtitle showing flat name
- Breadcrumb showing navigation path

**Handled Events:** None

**Validation Conditions:** None

**Types:** None

**Props:**
```typescript
interface GeneratePaymentsHeaderProps {
  flatName: string;
}
```

---

### GeneratePaymentsForm (React)
**Description:** Main interactive form component managing the payment generation flow.

**Main Elements:**
- Date selection inputs (month, year)
- Payment types multi-select (checkboxes)
- Real-time preview of payments to be generated
- Warning for duplicate/conflict scenarios
- Form action buttons (cancel, generate)

**Handled Events:**
- Month selection change
- Year input change
- Payment type checkbox toggle
- Cancel button click
- Generate button click (form submit)

**Validation Conditions:**
- Month must be selected (1-12)
- Year must be valid (1900-2100)
- At least one payment type must be selected
- Duplicate payments warning (informational, doesn't block)

**Types:**
- `GeneratePaymentsFormState`
- `GeneratePaymentsCommand`
- `PaymentPreviewItem`

**Props:**
```typescript
interface GeneratePaymentsFormProps {
  flatId: string;
  flatName: string;
  paymentTypes: PaymentTypeViewModel[];
  onSuccess: (result: GeneratePaymentsResult) => void;
  onCancel: () => void;
}
```

**State Management:**
- Local form state for month, year, selected payment types
- Preview computed from state
- Validation errors
- Submission loading state

---

### DateSelectionSection (React)
**Description:** Section for selecting target month and year.

**Main Elements:**
- Label: "Select Month and Year"
- Month dropdown (select)
- Year number input
- Inline validation messages

**Handled Events:**
- Month change
- Year change

**Validation Conditions:**
- Month: required, 1-12
- Year: required, 1900-2100, integer

**Types:**
- `DateSelection` - month and year values

**Props:**
```typescript
interface DateSelectionSectionProps {
  month: number | undefined;
  year: number | undefined;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  errors: {
    month?: string;
    year?: string;
  };
}
```

---

### MonthSelect (React)
**Description:** Dropdown for selecting month.

**Main Elements:**
- Select element with options
- Options: 1-12 with month names (January, February, ...)
- Placeholder: "Select month"

**Handled Events:**
- Change event

**Validation Conditions:**
- Required field

**Types:** Standard select props

**Props:**
```typescript
interface MonthSelectProps {
  value: number | undefined;
  onChange: (month: number) => void;
  error?: string;
}
```

**Options:**
- Placeholder: "Select month..." (disabled, value: undefined)
- 1: "January"
- 2: "February"
- ...
- 12: "December"

---

### YearInput (React)
**Description:** Number input for entering year.

**Main Elements:**
- Number input field
- Label: "Year"
- Placeholder: "YYYY" or current year suggestion

**Handled Events:**
- Change event
- Blur event (validation trigger)

**Validation Conditions:**
- Required
- Integer
- Range: 1900-2100

**Types:** Standard input props

**Props:**
```typescript
interface YearInputProps {
  value: number | undefined;
  onChange: (year: number) => void;
  error?: string;
}
```

**Default Value:** Current year (pre-filled for convenience)

---

### PaymentTypesSelectionSection (React)
**Description:** Section displaying all payment types with checkboxes for selection.

**Main Elements:**
- Label: "Payment Types to Generate"
- Checkbox group
- "Select All" / "Deselect All" buttons (optional)
- List of payment type checkboxes with name and amount

**Handled Events:**
- Individual checkbox toggle
- Select all click
- Deselect all click

**Validation Conditions:**
- At least one payment type must be selected

**Types:**
- `PaymentTypeViewModel[]`
- `selectedPaymentTypeIds: string[]`

**Props:**
```typescript
interface PaymentTypesSelectionSectionProps {
  paymentTypes: PaymentTypeViewModel[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  error?: string;
}
```

**Default State:** All payment types selected by default

---

### PaymentTypeCheckbox (React)
**Description:** Individual checkbox for a payment type.

**Main Elements:**
- Checkbox input
- Payment type name label
- Base amount display (e.g., "Rent - 1,000.00 PLN")

**Handled Events:**
- Checkbox change

**Validation Conditions:** None (handled by parent)

**Types:**
- `PaymentTypeViewModel`

**Props:**
```typescript
interface PaymentTypeCheckboxProps {
  paymentType: PaymentTypeViewModel;
  isSelected: boolean;
  onChange: (paymentTypeId: string, isSelected: boolean) => void;
}
```

**Accessibility:**
- Proper label association
- Keyboard accessible

---

### PreviewSection (React)
**Description:** Real-time preview of payments that will be generated based on current form selections.

**Main Elements:**
- Section header: "Preview"
- List of payment preview items
- Summary statistics (count, total amount)
- Updates automatically as user changes selections

**Handled Events:** None (read-only display)

**Validation Conditions:** None

**Types:**
- `PaymentPreviewItem[]`
- `PreviewSummary`

**Props:**
```typescript
interface PreviewSectionProps {
  previews: PaymentPreviewItem[];
  summary: PreviewSummary;
  isValid: boolean; // Show preview only if form is valid
}
```

**Behavior:**
- Shows placeholder if month/year not selected
- Updates in real-time as selections change
- Clearly shows count and total amount

---

### PreviewList (React)
**Description:** List of individual payment previews.

**Main Elements:**
- Unordered list
- Map of `PreviewItem` components
- Empty state if no payment types selected

**Handled Events:** None

**Validation Conditions:** None

**Types:**
- `PaymentPreviewItem[]`

**Props:**
```typescript
interface PreviewListProps {
  items: PaymentPreviewItem[];
}
```

---

### PreviewItem (React)
**Description:** Individual preview item showing payment type and amount.

**Main Elements:**
- Payment type name
- Amount (formatted currency)
- Month/year context (e.g., "January 2024")

**Handled Events:** None

**Validation Conditions:** None

**Types:**
- `PaymentPreviewItem`

**Props:**
```typescript
interface PreviewItemProps {
  item: PaymentPreviewItem;
}
```

**Visual Style:**
- List item with payment type name and amount
- Formatted as: "Rent: 1,000.00 PLN"

---

### PreviewSummary (React)
**Description:** Summary section showing total count and amount of payments to be generated.

**Main Elements:**
- Total count (e.g., "3 payments")
- Total amount (e.g., "Total: 2,500.00 PLN")
- Visual emphasis (border, background)

**Handled Events:** None

**Validation Conditions:** None

**Types:**
- `PreviewSummary`

**Props:**
```typescript
interface PreviewSummaryProps {
  count: number;
  totalAmount: number;
  formattedTotalAmount: string;
}
```

**Visual Style:**
- Prominent display (larger text, bold)
- Distinct background or border
- Clear visual hierarchy

---

### WarningSection (React)
**Description:** Conditional warning displayed if generating payments may create duplicates or conflicts.

**Main Elements:**
- Warning icon
- Warning message
- Explanation of potential duplicates
- Note: "Duplicate payments will be skipped"

**Handled Events:** None

**Validation Conditions:**
- Show only if API indicates potential duplicates (optional, can check before submit)

**Types:**
- `ConflictWarning` data

**Props:**
```typescript
interface WarningSectionProps {
  warnings: string[];
}
```

**Visual Style:**
- Yellow/orange warning color
- Icon indicating caution
- Non-blocking (informational only)

**Note for MVP:** Can be simplified or omitted. Duplicate handling is done server-side with `ON CONFLICT DO NOTHING`.

---

### FormActions (React)
**Description:** Action buttons for form submission and cancellation.

**Main Elements:**
- Cancel button (secondary)
- Generate button (primary)
- Buttons aligned right

**Handled Events:**
- Cancel click
- Generate click (form submit)

**Validation Conditions:**
- Generate button disabled if form invalid or submitting

**Types:** Standard button props

**Props:**
```typescript
interface FormActionsProps {
  onCancel: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isFormValid: boolean;
}
```

**Button States:**
- Generate button: Disabled when form invalid or during submission
- Generate button: Shows loading spinner when `isGenerating === true`

---

### CancelButton (React)
**Description:** Button to cancel payment generation and return to flat details.

**Main Elements:**
- Secondary button
- "Cancel" label

**Handled Events:**
- Click → navigate back to flat details

**Validation Conditions:** None

**Types:** Standard button

**Props:**
```typescript
interface CancelButtonProps {
  onClick: () => void;
}
```

**Navigation:** Returns to `/flats/:flatId`

---

### GenerateButton (React)
**Description:** Primary action button to submit payment generation.

**Main Elements:**
- Primary button
- "Generate Payments" label
- Loading spinner when active

**Handled Events:**
- Click → trigger form validation and submission

**Validation Conditions:**
- Disabled if form invalid
- Disabled during submission

**Types:** Standard button

**Props:**
```typescript
interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}
```

**States:**
- Default: Enabled, "Generate Payments"
- Loading: Spinner, "Generating..."
- Disabled: Grayed out (invalid form)

---

### SuccessState (React)
**Description:** Success screen shown after successful payment generation.

**Main Elements:**
- Success icon (checkmark)
- Success message (e.g., "3 payments generated successfully for January 2024")
- Summary of generated payments
- "View Payments" button to navigate to payments list

**Handled Events:**
- View Payments button click

**Validation Conditions:** None

**Types:**
- `GeneratePaymentsResult`

**Props:**
```typescript
interface SuccessStateProps {
  result: GeneratePaymentsResult;
  flatId: string;
  month: number;
  year: number;
}
```

**Behavior:**
- Replaces form after successful generation
- Auto-redirect after 3 seconds (optional)
- Clear action to view generated payments

## 5. Types

### View Models

```typescript
/**
 * Generate payments view model
 */
interface GeneratePaymentsViewModel {
  flat: FlatDto;
  paymentTypes: PaymentTypeViewModel[];
  currentMonth: number; // Current month for default
  currentYear: number; // Current year for default
}

/**
 * Payment type view model for selection
 */
interface PaymentTypeViewModel extends PaymentTypeDto {
  formattedBaseAmount: string;
  isSelected: boolean; // Selection state
}

/**
 * Form state
 */
interface GeneratePaymentsFormState {
  month: number | undefined;
  year: number | undefined;
  selectedPaymentTypeIds: string[];
  errors: {
    month?: string;
    year?: string;
    paymentTypes?: string;
  };
  isSubmitting: boolean;
}

/**
 * Payment preview item
 */
interface PaymentPreviewItem {
  paymentTypeId: string;
  paymentTypeName: string;
  amount: number;
  formattedAmount: string;
  monthYear: string; // e.g., "January 2024"
}

/**
 * Preview summary
 */
interface PreviewSummary {
  count: number;
  totalAmount: number;
  formattedTotalAmount: string;
}

/**
 * Generation result
 */
interface GeneratePaymentsResult {
  generatedCount: number;
  skippedCount: number;
  month: number;
  year: number;
  payments: PaymentWithTypeNameDto[];
}
```

### API Types (from types.ts)

- `GeneratePaymentsCommand` - Request body for POST
- `GeneratePaymentsResponseDto` - Response from API
- `PaymentTypesResponseDto` - Payment types for flat
- `PaymentTypeDto` - Individual payment type

## 6. State Management

### Component-Level State

**GeneratePaymentsForm Component:**

State managed with `useState`:

```typescript
const [formState, setFormState] = useState<GeneratePaymentsFormState>({
  month: currentMonth, // Default to current month
  year: currentYear, // Default to current year
  selectedPaymentTypeIds: paymentTypes.map(pt => pt.id), // Default: all selected
  errors: {},
  isSubmitting: false,
});
```

**Derived State (useMemo):**

```typescript
const preview = useMemo(() => {
  if (!formState.month || !formState.year) return null;
  
  const items: PaymentPreviewItem[] = formState.selectedPaymentTypeIds.map(id => {
    const pt = paymentTypes.find(p => p.id === id);
    return {
      paymentTypeId: id,
      paymentTypeName: pt.name,
      amount: pt.base_amount,
      formattedAmount: formatCurrency(pt.base_amount),
      monthYear: formatMonthYear(formState.month, formState.year),
    };
  });
  
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  
  return {
    items,
    summary: {
      count: items.length,
      totalAmount,
      formattedTotalAmount: formatCurrency(totalAmount),
    },
  };
}, [formState.month, formState.year, formState.selectedPaymentTypeIds, paymentTypes]);

const isFormValid = useMemo(() => {
  return (
    formState.month !== undefined &&
    formState.year !== undefined &&
    formState.selectedPaymentTypeIds.length > 0 &&
    Object.keys(formState.errors).length === 0
  );
}, [formState]);
```

### No Custom Hook Required

For this view, component-level state with `useState` and `useMemo` is sufficient. No need for a complex custom hook.

### State Updates

**Month/Year Change:**
```typescript
const handleMonthChange = (month: number) => {
  setFormState(prev => ({
    ...prev,
    month,
    errors: { ...prev.errors, month: undefined },
  }));
};
```

**Payment Type Selection:**
```typescript
const handlePaymentTypeToggle = (paymentTypeId: string, isSelected: boolean) => {
  setFormState(prev => {
    const selectedIds = isSelected
      ? [...prev.selectedPaymentTypeIds, paymentTypeId]
      : prev.selectedPaymentTypeIds.filter(id => id !== paymentTypeId);
    
    return {
      ...prev,
      selectedPaymentTypeIds: selectedIds,
      errors: {
        ...prev.errors,
        paymentTypes: selectedIds.length === 0 ? 'Select at least one payment type' : undefined,
      },
    };
  });
};
```

## 7. API Integration

### Endpoints Used

#### GET /api/flats/:id
**Purpose:** Fetch flat details for context

**Request Type:** `void`

**Response Type:** `FlatDto`

**When Called:** Server-side on page load

**Error Handling:**
- 404: Show "Flat not found" error page
- 401: Redirect to login

---

#### GET /api/flats/:flatId/payment-types
**Purpose:** Fetch payment types to generate payments from

**Request Type:** `void`

**Response Type:** `PaymentTypesResponseDto`

**When Called:** Server-side on page load

**Error Handling:**
- 404: Cascade from flat not found
- 500: Show error message, prevent form display

**Validation:**
- If `payment_types.length === 0`: Show error "Cannot generate payments. This flat has no payment types. Please add payment types first."

---

#### POST /api/flats/:flatId/payments/generate
**Purpose:** Generate payments for selected month/year

**Request Type:** `GeneratePaymentsCommand`

```typescript
interface GeneratePaymentsCommand {
  month: number; // 1-12
  year: number; // YYYY
}
```

**Response Type:** `GeneratePaymentsResponseDto`

```typescript
interface GeneratePaymentsResponseDto {
  message: string;
  generated_count: number;
  month: number;
  year: number;
  payments: PaymentWithTypeNameDto[];
}
```

**When Called:** User clicks "Generate" button after form validation

**Error Handling:**
- 400: Validation error (invalid month/year) → Show inline errors
- 404: Flat not found → Show error toast
- 409: Conflict (some payments already exist) → Partial success, show message with counts
- 500: Server error → Show error toast, allow retry

**Success Handling:**
- Show success state with generated count
- Navigate to flat detail with filter set to generated month/year
- Show toast: "X payments generated successfully for [Month Year]"

### Request Flow

**Form Submission:**

```typescript
const handleGenerate = async () => {
  // Validate
  const validationResult = validateGeneratePaymentsForm(formState);
  if (!validationResult.success) {
    setFormState(prev => ({ ...prev, errors: validationResult.errors }));
    return;
  }
  
  // Prepare command
  const command: GeneratePaymentsCommand = {
    month: formState.month!,
    year: formState.year!,
  };
  
  // Submit
  setFormState(prev => ({ ...prev, isSubmitting: true }));
  
  try {
    const response = await fetch(`/api/flats/${flatId}/payments/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    });
    
    if (!response.ok) {
      // Handle error
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate payments');
    }
    
    const result: GeneratePaymentsResponseDto = await response.json();
    
    // Success
    onSuccess({
      generatedCount: result.generated_count,
      skippedCount: 0, // Calculate if API provides
      month: result.month,
      year: result.year,
      payments: result.payments,
    });
  } catch (error) {
    // Show error
    toast.error(error.message);
  } finally {
    setFormState(prev => ({ ...prev, isSubmitting: false }));
  }
};
```

**Note on Payment Type Selection:**

The current API endpoint generates payments for **all** payment types of the flat. The UI's payment type selection feature would require an enhanced API endpoint that accepts `payment_type_ids` in the request body.

**For MVP:** Generate for all payment types (simplify UI to just month/year selection).

**For Post-MVP:** Enhance API to accept optional payment type IDs array.

## 8. User Interactions

### Primary Interactions

#### 1. Select Month
**Trigger:** User clicks month dropdown and selects a month

**Flow:**
1. User opens month dropdown
2. User selects month (e.g., "January")
3. Month state updates
4. Preview updates in real-time
5. Validation error clears if was present

**Validation:**
- Month required
- Must be 1-12

**Feedback:**
- Dropdown selection highlighted
- Preview updates immediately
- Error cleared if present

---

#### 2. Enter Year
**Trigger:** User types in year input field

**Flow:**
1. User focuses on year input
2. User types year (e.g., "2024")
3. On blur or change, year state updates
4. Preview updates in real-time
5. Validation runs

**Validation:**
- Year required
- Must be integer
- Must be in range 1900-2100

**Feedback:**
- Input value updates
- Preview updates immediately
- Inline error if invalid

---

#### 3. Toggle Payment Type Selection (Optional for MVP)
**Trigger:** User clicks checkbox next to payment type

**Flow:**
1. User clicks checkbox
2. Selection state toggles
3. Preview updates (payment type added/removed)
4. Summary recalculates

**Validation:**
- At least one payment type must be selected

**Feedback:**
- Checkbox state changes
- Preview list updates
- Summary count/amount updates
- Error if none selected

---

#### 4. Generate Payments
**Trigger:** User clicks "Generate Payments" button

**Flow:**
1. User clicks button
2. Final validation runs
3. If invalid: Show validation errors, prevent submission
4. If valid:
   - Button shows loading state
   - API call to generate payments
   - On success: Show success state with result
   - On error: Show error toast, re-enable button

**Validation:**
- All form fields valid
- At least one payment type selected

**Feedback:**
- Button loading state ("Generating...")
- Form disabled during submission
- Success: Success screen with count and message
- Error: Toast notification with error message

---

#### 5. Cancel
**Trigger:** User clicks "Cancel" button

**Flow:**
1. User clicks cancel
2. Navigate back to flat detail view
3. No data saved

**Validation:** None

**Feedback:**
- Immediate navigation
- No confirmation (form is simple, no significant data loss)

---

#### 6. View Generated Payments
**Trigger:** User clicks "View Payments" button on success screen

**Flow:**
1. User clicks button
2. Navigate to flat detail view
3. Payments list filtered to show generated month/year
4. User sees newly generated payments

**Validation:** None

**Feedback:**
- Navigation to flat details
- Payments list filtered appropriately

### Real-Time Preview Interactions

**Preview Updates:**
- Updates whenever month, year, or selected payment types change
- Shows list of payments that will be created
- Displays total count and amount
- Provides clear visual feedback before submission

## 9. Conditions and Validation

### Form Validation Rules

#### Month Field
- **Required:** Yes
- **Type:** Integer (1-12)
- **Error Messages:**
  - Empty: "Please select a month"
  - Invalid: "Month must be between 1 and 12"

#### Year Field
- **Required:** Yes
- **Type:** Integer
- **Range:** 1900-2100
- **Error Messages:**
  - Empty: "Please enter a year"
  - Invalid format: "Year must be a number"
  - Out of range: "Year must be between 1900 and 2100"

#### Payment Types Selection (Optional for MVP)
- **Required:** At least one selected
- **Error Messages:**
  - None selected: "Please select at least one payment type"

### Display Conditions

#### Preview Section
- **Show when:** Month and year are both selected and valid
- **Hide when:** Month or year missing
- **Placeholder:** "Select month and year to preview payments"

#### Warning Section
- **Show when:** Potential duplicate payments detected (optional, server-side check)
- **Hide when:** No conflicts expected

#### Generate Button
- **Enabled when:** Form is valid (month, year, at least one payment type)
- **Disabled when:** Form invalid OR submitting
- **Loading state when:** `isSubmitting === true`

#### Success State
- **Show when:** Generation completed successfully
- **Replace entire form:** Yes

### Server-Side Validation

The API validates:
- Month: 1-12
- Year: valid integer in range
- Flat exists and user owns it
- Flat has payment types

API returns 400 for validation errors with details.

### Duplicate Handling

**API Behavior:**
- Uses `ON CONFLICT (payment_type_id, month, year) DO NOTHING`
- Skips duplicate payments silently
- Returns count of successfully generated payments

**UI Handling:**
- If `generated_count < expected_count`: Show message "X payments generated, Y already existed and were skipped"
- Informational, not an error

### Business Rules

1. **Payment types required:** Cannot generate payments if flat has no payment types
2. **Date validity:** Month/year must be valid date components (no validation for past/future)
3. **Duplicate prevention:** Handled server-side, not blocking in UI
4. **All payment types:** MVP generates for all payment types (no selection)

## 10. Error Handling

### Client-Side Validation Errors

#### Invalid Month
**Scenario:** User enters or selects invalid month

**Handling:**
- Inline error message below month field
- "Month must be between 1 and 12"
- Prevent form submission
- Highlight field in red

---

#### Invalid Year
**Scenario:** User enters year outside valid range

**Handling:**
- Inline error message below year field
- "Year must be between 1900 and 2100"
- Prevent form submission
- Highlight field in red

---

#### No Payment Types Selected (if applicable)
**Scenario:** User deselects all payment types

**Handling:**
- Error message: "Please select at least one payment type"
- Disable generate button
- Highlight validation error

### API Errors

#### Validation Error (400)
**Scenario:** Server rejects request due to validation

**Handling:**
- Parse error response
- Map errors to form fields
- Show inline errors
- Re-enable form for correction

**Example:**
```json
{
  "error": "Validation failed",
  "details": {
    "month": "Month must be between 1 and 12"
  }
}
```

---

#### Flat Not Found (404)
**Scenario:** Flat doesn't exist or user doesn't own it

**Handling:**
- Show error toast: "Flat not found"
- Redirect to dashboard or flats list
- Log error

---

#### Conflict (409)
**Scenario:** Some or all payments already exist

**Handling:**
- Parse response to get generated and skipped counts
- Show success state with message: "X payments generated, Y already existed"
- Navigate to payments list as success
- Toast message with details

**Example Response:**
```json
{
  "error": "Some payments already exist for this period",
  "generated_count": 1,
  "skipped_count": 2
}
```

---

#### Server Error (500)
**Scenario:** Server-side error during generation

**Handling:**
- Show error toast: "Failed to generate payments. Please try again."
- Re-enable form
- Allow user to retry
- Log error for debugging

### Edge Cases

#### No Payment Types
**Scenario:** Flat has no payment types

**Handling:**
- Don't render form
- Show error message: "Cannot generate payments. This flat has no payment types."
- Provide action: "Add Payment Type" button → navigate to create payment type form
- Clear guidance on next steps

---

#### Large Number of Payment Types
**Scenario:** Flat has 20+ payment types

**Handling:**
- MVP: Display all in list (scrollable)
- Future: Consider pagination or search within list
- Preview scrolls if needed

---

#### Partial Success (Conflict)
**Scenario:** Some payments generated, some skipped due to duplicates

**Handling:**
- Treat as success
- Show counts: "2 payments generated, 1 already existed"
- Navigate to payments list
- Toast with details

---

#### Network Error
**Scenario:** Network failure during submission

**Handling:**
- Show error toast: "Network error. Please check your connection and try again."
- Re-enable form
- Preserve form state (user doesn't lose selections)

---

#### Slow Response
**Scenario:** API takes long time to respond

**Handling:**
- Show loading state with spinner
- Keep button disabled
- Timeout after 30 seconds
- Show error: "Request timed out. Please try again."

## 11. Implementation Steps

### Step 1: Setup Page Structure
1. Create `/src/pages/flats/[flatId]/payments/generate.astro`
2. Implement authentication check
3. Extract `flatId` from URL params
4. Set up `AppLayout` with breadcrumbs
5. Configure page metadata and title

### Step 2: Implement Server-Side Data Fetching
1. Fetch flat details (`GET /api/flats/:id`)
2. Fetch payment types (`GET /api/flats/:flatId/payment-types`)
3. Handle 404 errors (flat not found)
4. Handle error: no payment types (show error state)
5. Transform data to view model

### Step 3: Create View Models and Utilities
1. Define all view model types
2. Implement `transformGeneratePaymentsData()` helper
3. Implement `calculatePreview()` helper
4. Implement validation schema with Zod
5. Test with sample data

### Step 4: Build Form Container (React)
1. Create `GeneratePaymentsForm` component
2. Set up component state with `useState`
3. Implement derived state with `useMemo` (preview, validation)
4. Create form layout structure
5. Add basic styling

### Step 5: Build Date Selection Components
1. Implement `DateSelectionSection` component
2. Implement `MonthSelect` component with options
3. Implement `YearInput` component
4. Wire up onChange handlers
5. Implement inline validation
6. Test date selection and state updates

### Step 6: Build Payment Types Selection (Optional)
1. Implement `PaymentTypesSelectionSection` component
2. Implement `PaymentTypeCheckbox` component
3. Wire up selection state
4. Implement select all / deselect all
5. Test selection logic

**For MVP Simplification:** Skip this step, generate for all payment types automatically.

### Step 7: Build Preview Section
1. Implement `PreviewSection` component
2. Implement `PreviewList` component
3. Implement `PreviewItem` component
4. Implement `PreviewSummary` component
5. Wire up to derived state
6. Test real-time updates
7. Style with proper emphasis

### Step 8: Build Form Actions
1. Implement `FormActions` component
2. Implement `CancelButton` component
3. Implement `GenerateButton` component
4. Wire up cancel navigation
5. Wire up generate submission
6. Implement button states (disabled, loading)

### Step 9: Implement Form Validation
1. Create Zod validation schema
2. Implement validation function
3. Wire up validation to form state
4. Implement inline error display
5. Prevent submission if invalid
6. Test validation scenarios

### Step 10: Implement API Integration
1. Create or extend `src/lib/services/paymentsService.ts`
2. Implement `generatePayments(flatId, command)` function
3. Add error handling and response validation
4. Implement success callback
5. Test with API endpoint

### Step 11: Implement Form Submission Logic
1. Wire generate button to submission handler
2. Implement validation check before submit
3. Call API service function
4. Handle loading state
5. Handle success response
6. Handle error responses
7. Test submission flow

### Step 12: Build Success State
1. Implement `SuccessState` component
2. Display generation result
3. Implement "View Payments" button
4. Wire up navigation with filters
5. Test success flow

### Step 13: Build Warning Section (Optional)
1. Implement `WarningSection` component
2. Display duplicate warnings
3. Style as informational (not blocking)
4. Test with conflict scenarios

**For MVP:** Can skip if not essential, as duplicates are handled server-side.

### Step 14: Handle No Payment Types State
1. Implement error state component
2. Display error message
3. Add "Add Payment Type" action button
4. Test with flat that has no payment types

### Step 15: Styling and Responsiveness
1. Apply Tailwind classes for layout
2. Style form sections with clear separation
3. Style preview with emphasis
4. Ensure mobile responsiveness
5. Test on different screen sizes

### Step 16: Accessibility
1. Add proper labels to all inputs
2. Implement keyboard navigation
3. Add ARIA labels where needed
4. Test with screen reader
5. Ensure focus management
6. Verify color contrast

### Step 17: Error Handling Implementation
1. Implement client-side error display
2. Implement API error handling
3. Implement network error handling
4. Add retry functionality where appropriate
5. Test all error scenarios

### Step 18: Integration and Testing
1. Integrate all components in page
2. Test complete user flow (happy path)
3. Test validation edge cases
4. Test API error scenarios
5. Test success and navigation
6. Cross-browser testing

### Step 19: Polish and Refinement
1. Add loading states
2. Add smooth transitions
3. Optimize preview recalculation
4. Add helpful placeholder text
5. Review and improve error messages

### Step 20: Documentation
1. Document component props
2. Add JSDoc comments
3. Document form validation rules
4. Document API integration
5. Update README if needed

---

**Implementation Priority:** High - core feature for automating payment creation, essential for MVP value proposition.

**Estimated Complexity:** Medium - interactive form with real-time preview, validation, and API integration, but simpler than complex CRUD views.

**Dependencies:**
- API endpoint `POST /api/flats/:flatId/payments/generate` must be implemented
- API endpoint `GET /api/flats/:id` must be implemented
- API endpoint `GET /api/flats/:flatId/payment-types` must be implemented
- shadcn/ui components (Button, Select, Input, Label) must be installed
- `AppLayout` component must exist
- Form validation library (Zod) must be configured
- Toast notification system for success/error feedback
- Currency and date formatting utilities

**MVP Simplifications:**
- Generate for all payment types (no multi-select)
- No duplicate checking before submission (handled server-side)
- No advanced date pickers (simple dropdowns/inputs)

