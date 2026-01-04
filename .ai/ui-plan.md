# UI Architecture for Flats Manager

## 1. UI Structure Overview

Flats Manager is a multi-page web application designed for property owners and managers to efficiently manage rental properties, payment types, and payment tracking. The UI architecture follows a hierarchical structure with the Dashboard as the central hub, branching into Flats management, and further into Payment Types and Payments management for each flat.

The application uses server-side rendering with Astro for optimal performance and SEO, with React components for interactive elements. The architecture emphasizes:

- **Clear Information Hierarchy**: Dashboard → Flats → Flat Details → Payment Types/Payments
- **Consistent Navigation**: Top navigation bar with breadcrumbs for deep navigation
- **Responsive Design**: Mobile-first approach ensuring usability across devices
- **Accessibility**: WCAG 2.1 AA compliance with semantic HTML, ARIA labels, and keyboard navigation
- **User Feedback**: Loading states, error handling, and success confirmations throughout

## 2. View List

### 2.1 Login View
- **Path**: `/login`
- **Main Purpose**: Authenticate users to access the application
- **Key Information**:
  - Login form with email and password fields
  - Error messages for failed authentication
  - Optional "Remember me" checkbox
- **Key Components**:
  - Form with email and password inputs
  - Submit button
  - Error message display area
- **UX Considerations**:
  - Auto-focus on email field
  - Clear error messages for invalid credentials
  - Loading state during authentication
  - Password visibility toggle
- **Accessibility**:
  - Proper form labels and ARIA attributes
  - Error announcements via aria-live regions
  - Focus management on validation errors
- **Security**:
  - CSRF protection
  - Input sanitization
  - Secure password handling
  - Rate limiting for login attempts

### 2.2 Dashboard View
- **Path**: `/` (root)
- **Main Purpose**: Provide an overview of all properties and highlight urgent items requiring attention
- **Key Information**:
  - Overdue payments list with flat name, amount, and days overdue
  - Summary statistics (total flats, pending payments count, total overdue amount)
  - Quick action buttons
- **Key Components**:
  - Header with user greeting
  - Overdue payments section (highlighted/urgent)
  - Summary statistics cards
  - "View All Flats" and "Add New Flat" action buttons
  - Quick "Mark as Paid" actions for overdue payments
- **UX Considerations**:
  - Visual hierarchy emphasizing overdue payments
  - Color-coded urgency indicators (red for overdue)
  - Empty state with encouraging message if no flats exist
  - Skeleton loading for async data
- **Accessibility**:
  - ARIA live region for overdue payments updates
  - Semantic heading structure (h1 for dashboard, h2 for sections)
  - Clear button labels with action descriptions
  - Status indicators with text, not just color
- **Security**:
  - Display only user's own data
  - Protected route requiring authentication

### 2.3 Flats List View
- **Path**: `/flats`
- **Main Purpose**: Display all flats owned by the authenticated user
- **Key Information**:
  - Grid/list of flat cards
  - Each card shows: flat name, address, tenant name, payment statistics
  - Search/filter functionality (optional)
- **Key Components**:
  - Grid layout of flat cards
  - Each flat card with:
    - Flat name and address
    - Tenant information
    - Quick stats (pending payments, overdue count)
    - Link to flat details
  - "Add New Flat" floating action button or header button
  - Empty state component if no flats
- **UX Considerations**:
  - Responsive grid (1 column mobile, 2-3 columns tablet/desktop)
  - Hover states on cards
  - Visual distinction for flats with overdue payments
  - Loading skeleton during data fetch
  - Empty state with "Create your first flat" call-to-action
- **Accessibility**:
  - Cards implemented as clickable links or buttons
  - Descriptive labels including flat name and key info
  - Grid navigation with keyboard
  - Screen reader announces number of flats
- **Security**:
  - Filter flats by authenticated user
  - Protected route

### 2.4 Flat Detail View
- **Path**: `/flats/:id`
- **Main Purpose**: Show comprehensive information about a specific flat including basic details, payment types, and recent payments
- **Key Information**:
  - Flat details (name, address, tenant information)
  - Payment types summary with count
  - Recent payments list (last 5-10)
  - Edit and delete flat actions
- **Key Components**:
  - Flat information card (name, address, tenant details)
  - Action buttons (Edit Flat, Delete Flat)
  - Tabbed or sectioned layout:
    - **Overview Tab**: Basic flat and tenant information
    - **Payment Types Section**: Summary with "Manage Payment Types" button
    - **Payments Section**: Recent payments table with "View All Payments" button
  - Breadcrumb navigation (Dashboard > Flats > [Flat Name])
- **UX Considerations**:
  - Clear visual separation between sections
  - Confirmation dialog for delete action
  - Back button to return to flats list
  - Loading states for each section
  - Error handling if flat not found (404 state)
- **Accessibility**:
  - Tab navigation for sectioned content
  - Proper heading hierarchy
  - Delete confirmation with keyboard support
  - Clear focus indicators
- **Security**:
  - Verify user owns the flat
  - Protected route
  - Confirm destructive actions

### 2.5 Create/Edit Flat View
- **Path**: `/flats/new` (create), `/flats/:id/edit` (edit)
- **Main Purpose**: Allow users to add new flats or modify existing flat information
- **Key Information**:
  - Form fields for flat data
  - Validation messages
  - Save and cancel actions
- **Key Components**:
  - Form with inputs:
    - Flat name (required)
    - Address (required)
    - Tenant name (optional)
    - Tenant email (optional)
    - Tenant phone (optional)
  - Inline validation messages
  - Submit button (label: "Create Flat" or "Save Changes")
  - Cancel button (returns to previous view)
  - Error summary section at top of form
- **UX Considerations**:
  - Real-time validation on blur
  - Clear required field indicators
  - Loading state on submit button
  - Success message/redirect after save
  - Unsaved changes warning if navigating away
  - Auto-save draft (optional enhancement)
- **Accessibility**:
  - Error summary with links to fields
  - Field-level error messages with aria-describedby
  - Focus management (first error on submit)
  - Clear labels and required indicators
  - Grouped related fields (tenant info)
- **Security**:
  - Input validation and sanitization
  - CSRF protection
  - Verify user ownership on edit
  - Protected route

### 2.6 Payment Types Management View
- **Path**: `/flats/:flatId/payment-types`
- **Main Purpose**: Manage recurring payment configurations for a specific flat
- **Key Information**:
  - List of all payment types for the flat
  - Payment type details (name, amount, recurrence pattern, active status)
  - Create, edit, and delete actions
- **Key Components**:
  - Page header with flat name and breadcrumb
  - Table/list of payment types with columns:
    - Name (e.g., "Monthly Rent", "Water Bill")
    - Amount
    - Recurrence pattern (Monthly on day X, Quarterly, etc.)
    - Active status (toggle or badge)
    - Actions (Edit, Delete buttons)
  - "Add Payment Type" primary action button
  - Empty state if no payment types
  - Delete confirmation dialog
- **UX Considerations**:
  - Sortable table columns
  - Visual distinction for inactive payment types
  - Confirmation before delete with impact warning
  - Quick toggle for active/inactive status
  - Empty state with guidance to create first payment type
- **Accessibility**:
  - Table with proper th/td structure
  - Row headers for screen readers
  - Action buttons with descriptive labels
  - Confirmation dialog keyboard navigation
  - Status announced for toggles
- **Security**:
  - Verify user owns the flat
  - Confirm destructive actions
  - Protected route
  - Validate permissions on all actions

### 2.7 Create/Edit Payment Type View
- **Path**: `/flats/:flatId/payment-types/new` (create), `/flats/:flatId/payment-types/:id/edit` (edit)
- **Main Purpose**: Configure a recurring payment type with amount and recurrence settings
- **Key Information**:
  - Payment type configuration form
  - Recurrence pattern options
  - Validation and preview
- **Key Components**:
  - Form with inputs:
    - Name (required, e.g., "Monthly Rent")
    - Amount (required, decimal)
    - Recurrence type (dropdown: Monthly, Quarterly, Yearly)
    - Day of month (1-31 for monthly/quarterly, or specific date for yearly)
    - Active status (checkbox)
  - Recurrence pattern preview/description
  - Submit and Cancel buttons
  - Validation messages
- **UX Considerations**:
  - Contextual help for recurrence settings
  - Preview of when next payment would be due
  - Amount formatting with currency symbol
  - Conditional fields based on recurrence type
  - Loading state during submission
- **Accessibility**:
  - Grouped fields with fieldset/legend
  - Clear labels and help text
  - Error handling with focus management
  - Dropdown with keyboard navigation
- **Security**:
  - Input validation (positive amounts, valid dates)
  - Verify user owns the flat
  - CSRF protection
  - Protected route

### 2.8 Payments List View
- **Path**: `/flats/:flatId/payments`
- **Main Purpose**: View and manage all payments for a specific flat with filtering and sorting capabilities
- **Key Information**:
  - Comprehensive payments table
  - Payment status indicators
  - Filtering and sorting options
  - Quick actions for each payment
- **Key Components**:
  - Page header with flat name and breadcrumb
  - Filter controls:
    - Status filter (All, Pending, Paid, Overdue)
    - Date range filter
    - Payment type filter (multi-select)
  - Payments table with columns:
    - Due date (sortable)
    - Payment type
    - Amount
    - Status (badge: Pending/Paid/Overdue)
    - Actions (Mark as Paid, Edit, Delete)
  - "Generate Payments" button
  - "Add Payment" button
  - Pagination (if many payments)
  - Summary statistics (total pending, total overdue)
- **UX Considerations**:
  - Color-coded status badges (red=overdue, yellow=pending, green=paid)
  - Default sort by due date (earliest first)
  - Persistent filters in URL query params
  - Bulk actions checkbox (optional)
  - Empty state with suggestion to generate or create payments
  - Optimistic UI for "Mark as Paid" action
- **Accessibility**:
  - Sortable table headers with aria-sort
  - Filter controls with clear labels
  - Status conveyed with text, not just color
  - Action buttons with descriptive labels
  - Table caption describing content
- **Security**:
  - Verify user owns the flat
  - Protected route
  - Validate all filter inputs
  - Rate limit bulk actions

### 2.9 Create/Edit Payment View
- **Path**: `/flats/:flatId/payments/new` (create), `/flats/:flatId/payments/:id/edit` (edit)
- **Main Purpose**: Manually add or modify individual payment records
- **Key Information**:
  - Payment details form
  - Payment type selection with auto-fill
  - Due date and amount
- **Key Components**:
  - Form with inputs:
    - Payment type (dropdown, populated from flat's payment types)
    - Due date (date picker)
    - Amount (auto-filled from payment type, editable)
    - Notes (optional textarea)
    - Status (for edit only: Pending/Paid)
  - Submit and Cancel buttons
  - Validation messages
- **UX Considerations**:
  - Auto-fill amount when payment type selected
  - Date picker with calendar interface
  - Amount formatting with currency
  - Optional notes for special circumstances
  - Success message and redirect after save
- **Accessibility**:
  - Date picker with keyboard support
  - Dropdown with type-ahead
  - Clear labels and help text
  - Error handling with focus management
- **Security**:
  - Input validation (valid dates, positive amounts)
  - Verify user owns the flat
  - CSRF protection
  - Protected route

### 2.10 Generate Payments View
- **Path**: `/flats/:flatId/payments/generate`
- **Main Purpose**: Generate multiple recurring payments for a specified time period
- **Key Information**:
  - Date range selection
  - Payment types to generate
  - Preview of payments to be created
  - Generate action
- **Key Components**:
  - Form with inputs:
    - Start date (date picker)
    - End date (date picker)
    - Payment types selector (multi-select checkboxes, default all active)
  - Preview section:
    - List of payments that will be generated
    - Total count and amount summary
  - Generate button (primary action)
  - Cancel button
  - Warning if payments already exist for period
- **UX Considerations**:
  - Real-time preview updates as dates/types change
  - Clear summary of what will be created
  - Warning dialog if overlapping payments detected
  - Success message with count of generated payments
  - Loading state during generation
  - Validation for valid date range
- **Accessibility**:
  - Date pickers with keyboard support
  - Preview as aria-live region
  - Clear instructions at top
  - Confirmation dialog keyboard navigation
- **Security**:
  - Verify user owns the flat
  - Validate date ranges
  - Check for duplicate payments
  - Rate limit generation requests
  - Protected route

## 3. User Journey Map

### Primary User Journey: Managing Flat Payments

1. **Entry Point**: User logs in via Login View
   - Authentication validates credentials
   - Redirect to Dashboard

2. **Dashboard View** (Landing)
   - User sees overview of all properties
   - Overdue payments are prominently displayed
   - User can take quick actions (mark as paid) or navigate deeper

3. **Navigation Options from Dashboard**:
   
   **Path A: Quick Action on Overdue Payment**
   - User clicks "Mark as Paid" on an overdue payment
   - Confirmation dialog appears
   - Payment status updates optimistically
   - Toast notification confirms success
   - Dashboard updates to reflect change

   **Path B: Manage Specific Flat**
   - User clicks "View All Flats" → Flats List View
   - User selects a flat card → Flat Detail View
   - User sees overview, payment types, and recent payments

4. **Flat Detail View** (Hub for flat-specific actions)
   
   **Sub-journey 1: Manage Payment Types**
   - User clicks "Manage Payment Types"
   - Payment Types Management View loads
   - User can:
     - Add new payment type → Create Payment Type Form
     - Edit existing → Edit Payment Type Form
     - Delete payment type (with confirmation)
   - Return to Flat Detail
   
   **Sub-journey 2: Manage Payments**
   - User clicks "View All Payments"
   - Payments List View loads with all payments for flat
   - User can:
     - Filter by status, date, or type
     - Sort by columns
     - Mark individual payments as paid
     - Edit payment → Edit Payment Form
     - Delete payment (with confirmation)
     - Generate new payments → Generate Payments View
     - Create manual payment → Create Payment Form
   
   **Sub-journey 3: Generate Recurring Payments**
   - From Payments List, user clicks "Generate Payments"
   - Generate Payments View loads
   - User selects date range and payment types
   - Preview shows what will be created
   - User confirms generation
   - Success message shows count of created payments
   - Return to Payments List with new payments visible

5. **Return Navigation**
   - Breadcrumbs allow quick return to parent levels
   - Top navigation always available for Dashboard/Flats
   - Back buttons on forms return to previous view

### Secondary User Journeys

**Journey: Adding a New Flat**
1. Dashboard → Click "Add New Flat"
2. Create Flat View → Fill form and submit
3. Success → Redirect to new Flat Detail View
4. User sets up Payment Types → Create Payment Type Forms
5. User generates initial payments → Generate Payments View
6. Return to Dashboard to see new flat

**Journey: Monitoring Overdue Payments**
1. Dashboard → View overdue payments section
2. Click on specific flat with overdue payments
3. Flat Detail View → Click "View All Payments"
4. Payments List View → Filter by "Overdue" status
5. Review and mark payments as paid
6. Return to Dashboard to verify all cleared

**Journey: Monthly Payment Cycle**
1. Beginning of month → Login → Dashboard
2. Generate payments for all flats (if using generate feature)
3. As tenants pay → Mark payments as paid from Dashboard or Payments List
4. Monitor pending/overdue status throughout month
5. Review summary statistics

## 4. Layout and Navigation Structure

### Global Layout Components

**Header (Present on all authenticated pages)**
- Logo/App name (links to Dashboard)
- Primary navigation menu:
  - Dashboard (link to `/`)
  - Flats (link to `/flats`)
- User menu (right-aligned):
  - User name/avatar
  - Logout button

**Breadcrumb Navigation (Context-dependent)**
- Dashboard
- Dashboard > Flats
- Dashboard > Flats > [Flat Name]
- Dashboard > Flats > [Flat Name] > Payment Types
- Dashboard > Flats > [Flat Name] > Payments
- Dashboard > Flats > [Flat Name] > Payments > Generate

**Main Content Area**
- Page title (h1)
- Primary actions (top-right of content area)
- Content sections
- Footer (optional: copyright, links)

### Navigation Patterns

**Primary Navigation**
- Top navigation bar always visible
- Two main sections: Dashboard and Flats
- Persistent across all views
- Mobile: Hamburger menu for compact display

**Breadcrumb Navigation**
- Shows current location in hierarchy
- Each level is clickable (except current page)
- Helps users understand context
- Provides quick return to parent levels

**Contextual Navigation**
- Within Flat Detail: Tabs or sections for Overview/Payment Types/Payments
- Action buttons contextual to current view
- "Back" buttons on forms
- Cancel buttons return to previous context

**Card/List Navigation**
- Flat cards in Flats List → Click to Flat Detail
- Payment rows in tables → Click to edit or view details
- Interactive elements clearly indicated with hover states

### Mobile Navigation Considerations

- Hamburger menu for primary navigation
- Bottom navigation bar (optional) for key actions
- Swipe gestures for tabs within Flat Detail
- Simplified breadcrumbs (show only current and parent)
- Floating action button for primary actions (Add Flat, Add Payment)

## 5. Key Components

### 5.1 Layout Components

**AppLayout**
- Purpose: Wrapper for all authenticated pages
- Features: Header, navigation, breadcrumbs, main content area, footer
- Responsive behavior: Collapsible navigation on mobile
- Accessibility: Skip to main content link, semantic HTML5 structure

**Header**
- Purpose: Global navigation and branding
- Features: Logo, primary nav links, user menu
- Responsive behavior: Hamburger menu on mobile
- Accessibility: Navigation landmark, clear focus indicators

**Breadcrumb**
- Purpose: Show current location in hierarchy
- Features: Dynamic breadcrumb trail, clickable links
- Props: Current path, flat name (if applicable)
- Accessibility: Navigation landmark with aria-label="Breadcrumb"

### 5.2 Data Display Components

**FlatCard**
- Purpose: Display flat summary in grid/list views
- Features: Flat name, address, tenant info, payment stats, clickable link
- Visual indicators: Badge for overdue payments count
- Responsive behavior: Full-width on mobile, grid on desktop
- Accessibility: Card as link with comprehensive label

**PaymentTable**
- Purpose: Display list of payments with sorting and filtering
- Features: Sortable columns, status badges, action buttons per row, pagination
- Columns: Due date, payment type, amount, status, actions
- Responsive behavior: Horizontal scroll on mobile, stacked on very small screens
- Accessibility: Proper table structure, sortable headers with aria-sort

**PaymentTypeTable**
- Purpose: Display list of payment types for a flat
- Features: Name, amount, recurrence, active status, edit/delete actions
- Responsive behavior: Horizontal scroll on mobile
- Accessibility: Table structure, action buttons with labels

**DashboardStatCard**
- Purpose: Display summary statistics on dashboard
- Features: Icon, metric label, metric value, optional trend indicator
- Examples: Total flats, pending payments count, overdue amount
- Accessibility: Semantic structure, metric clearly labeled

**OverduePaymentsList**
- Purpose: Highlight overdue payments on dashboard
- Features: List of overdue payments, flat name, amount, days overdue, quick actions
- Visual indicators: Red/urgent styling
- Accessibility: ARIA live region for updates, clear urgency indicators

### 5.3 Form Components

**FlatForm**
- Purpose: Create or edit flat information
- Fields: Name, address, tenant name, tenant email, tenant phone
- Features: Inline validation, error messages, submit/cancel actions
- Accessibility: Error summary, field-level errors, focus management

**PaymentTypeForm**
- Purpose: Create or edit payment type configuration
- Fields: Name, amount, recurrence type, day of month, active status
- Features: Conditional fields, recurrence preview, validation
- Accessibility: Grouped fields with fieldset, clear labels

**PaymentForm**
- Purpose: Create or edit individual payment
- Fields: Payment type (dropdown), due date, amount, notes
- Features: Auto-fill amount from payment type, date picker
- Accessibility: Date picker with keyboard support, clear labels

**GeneratePaymentsForm**
- Purpose: Generate multiple payments for a date range
- Fields: Start date, end date, payment types selector
- Features: Real-time preview, summary statistics, confirmation
- Accessibility: Preview as aria-live region, clear instructions

### 5.4 UI Elements

**Button**
- Variants: Primary, secondary, destructive, ghost
- States: Default, hover, active, disabled, loading
- Sizes: Small, medium, large
- Accessibility: Clear labels, disabled state announced, loading state indicated

**StatusBadge**
- Purpose: Display payment status with color coding
- Variants: Pending (yellow), Paid (green), Overdue (red)
- Features: Text label (not just color), icon (optional)
- Accessibility: Status conveyed with text and aria-label

**ConfirmDialog**
- Purpose: Confirm destructive actions (delete flat, payment, etc.)
- Features: Title, message, confirm button (destructive style), cancel button
- Accessibility: Focus trap, keyboard navigation, clear action labels
- UX: Explains impact of action

**Toast/Notification**
- Purpose: Provide feedback for actions (success, error, info)
- Variants: Success, error, warning, info
- Features: Auto-dismiss (for success), manual dismiss for errors, action buttons (optional)
- Accessibility: ARIA live region (polite for success, assertive for errors)

**LoadingSpinner**
- Purpose: Indicate loading state
- Variants: Full-page overlay, inline, button spinner
- Accessibility: aria-live region with "Loading" message, aria-busy attribute

**SkeletonLoader**
- Purpose: Show loading placeholder with content structure
- Use cases: Flat cards loading, table rows loading, dashboard stats loading
- Accessibility: aria-busy and aria-label indicating loading state

**DatePicker**
- Purpose: Select dates for payments, filters, date ranges
- Features: Calendar interface, keyboard input, min/max date constraints
- Accessibility: Keyboard navigation, clear instructions, aria-labels

**EmptyState**
- Purpose: Display when no data exists with guidance
- Variants: No flats, no payment types, no payments, filtered results empty
- Features: Illustration (optional), message, call-to-action button
- Accessibility: Clear message, actionable next step

**FilterControls**
- Purpose: Filter and sort data in lists/tables
- Features: Status dropdown, date range picker, search input, sort dropdown
- Features: Clear filters button, filter count indicator
- Accessibility: Labeled controls, clear filters announced

### 5.5 Specialized Components

**RecurrencePatternDisplay**
- Purpose: Show human-readable recurrence pattern for payment types
- Examples: "Monthly on the 1st", "Quarterly on the 15th", "Yearly on Jan 1st"
- Features: Format recurrence data into readable text
- Accessibility: Clear, plain language description

**PaymentPreviewList**
- Purpose: Show preview of payments to be generated
- Features: List of payments with due date, type, amount
- Summary: Total count, total amount
- Accessibility: Structured list, summary clearly labeled

**QuickActionButton**
- Purpose: Provide one-click actions (Mark as Paid, etc.)
- Features: Icon + label, loading state, success feedback
- UX: Optimistic UI update, confirmation for critical actions
- Accessibility: Clear action label, state changes announced

**TenantInfoDisplay**
- Purpose: Show tenant details in flat views
- Features: Name, email, phone with icons
- Features: Click-to-call, click-to-email (optional)
- Accessibility: Semantic structure, links clearly labeled

## 6. Error Handling and Edge Cases

### Error States

**Authentication Errors**
- Invalid credentials → Clear error message, focus on email field
- Session expired → Redirect to login with message
- Network error during login → Retry button, error message

**Data Loading Errors**
- API failure → Error message with retry button
- Not found (404) → Friendly message, link to relevant page
- Unauthorized (403) → Redirect to dashboard or login

**Form Validation Errors**
- Client-side validation → Inline errors, error summary
- Server-side validation → Display returned errors, focus on first error
- Network error on submit → Toast notification, data preserved, retry option

### Edge Cases

**Empty States**
- No flats → Dashboard and Flats List show empty state with "Create First Flat" CTA
- No payment types for flat → Payment Types view shows guidance to create first one
- No payments for flat → Payments List shows empty state with "Generate" or "Create" options
- Filtered results empty → Show "No results found" with clear filters option

**Data Conflicts**
- Generating payments for period that already has payments → Warning dialog with option to continue or cancel
- Editing payment that was modified by another session → Show conflict, allow user to choose version
- Deleting flat with payments → Confirmation with impact warning (will delete all associated data)

**Boundary Conditions**
- Invalid date ranges (end before start) → Validation error
- Amounts with more than 2 decimal places → Round or validate
- Day of month > actual days (e.g., 31st in February) → Handle gracefully with last day of month logic
- Very large amounts → Format with proper number formatting

**Network Issues**
- Slow connection → Show loading state, timeout with retry
- Offline → Inform user, queue actions (if offline support added)
- Request timeout → Error message with retry option

### Accessibility Edge Cases

**Screen Reader Considerations**
- Empty tables → Announce "No data available"
- Loading states → Announce "Loading" and completion
- Dynamic updates → Use aria-live regions appropriately
- Form errors → Announce error count and provide navigation

**Keyboard Navigation**
- Modal dialogs → Focus trap, escape to close
- Dropdowns → Arrow key navigation, type-ahead
- Tables → Arrow keys for navigation, enter to activate
- Skip links → Skip to main content, skip to navigation

## 7. Performance and UX Optimizations

### Loading Strategies

**Progressive Loading**
- Dashboard: Load summary stats first, then overdue payments
- Flat Detail: Load flat info immediately, lazy load payment sections
- Payments List: Initial page load, pagination/infinite scroll for more

**Optimistic UI**
- Mark as Paid: Update UI immediately, rollback on error
- Delete payment: Remove from list immediately, restore on error
- Toggle active status: Update immediately, sync with server

**Skeleton Screens**
- Use during initial load for better perceived performance
- Match skeleton to actual content structure
- Replace with real content smoothly

### Caching and State Management

**Client-side Caching**
- Cache flat list to avoid refetch on navigation
- Invalidate cache on mutations
- Store filter/sort preferences in URL or localStorage

**Prefetching**
- Prefetch flat details when hovering over flat card
- Prefetch next page of payments on scroll approach
- Preload common forms (Create Flat, Create Payment)

### User Feedback

**Success Feedback**
- Toast notifications for successful actions
- Success state on buttons (checkmark animation)
- Updated data reflected immediately in lists

**Error Feedback**
- Toast notifications for errors with retry option
- Inline validation errors on forms
- Clear error messages with actionable guidance

**Loading Feedback**
- Button loading spinners for form submissions
- Skeleton screens for page loads
- Progress indicators for bulk operations (payment generation)

## 8. Responsive Design Breakpoints

### Breakpoint Strategy

**Mobile**: < 640px
- Single column layout
- Stacked forms
- Hamburger navigation
- Full-width cards
- Simplified tables (stacked or horizontal scroll)

**Tablet**: 640px - 1024px
- 2-column grid for flat cards
- Side-by-side form fields where appropriate
- Visible navigation with some items collapsed
- Full tables with horizontal scroll if needed

**Desktop**: > 1024px
- 3+ column grid for flat cards
- Multi-column forms
- Full navigation always visible
- Tables with all columns visible
- Sidebar navigation (optional enhancement)

### Mobile-Specific Optimizations

- Touch-friendly button sizes (min 44x44px)
- Larger input fields for easier interaction
- Bottom sheets for modals/dialogs
- Swipe gestures for navigation (optional)
- Pull-to-refresh on lists (optional)

## 9. Security Considerations in UI

### Input Validation
- Client-side validation for immediate feedback
- Server-side validation as source of truth
- Sanitize all inputs to prevent XSS
- Validate amounts, dates, and text length

### Authentication Flow
- Redirect unauthenticated users to login
- Session timeout with warning before expiration
- Secure logout with session cleanup
- CSRF tokens on all forms

### Data Privacy
- Display only user's own data
- Mask sensitive information where appropriate
- Secure handling of tenant personal information
- No sensitive data in URLs

### Action Confirmation
- Confirm destructive actions (delete flat, delete payment type)
- Clear explanation of impact
- Require explicit user action (no accidental clicks)
- Undo option where feasible

### Rate Limiting
- Limit rapid-fire form submissions
- Throttle bulk operations (payment generation)
- Prevent abuse of mark-as-paid action
- User-friendly messaging for rate limits

---

This UI architecture provides a comprehensive foundation for implementing the Flats Manager application. It ensures consistency, accessibility, and user-centered design while aligning with the API capabilities and product requirements. Each view and component is designed to support the user's goals while maintaining security and providing clear feedback throughout the user journey.
