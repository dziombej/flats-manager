# View Implementation Plan: Create/Edit Flat View

## 1. Overview

The Create/Edit Flat View is a form-based interface that allows landlords to add new apartments or edit existing apartment information. This view serves two modes: creation mode (adding a new flat) and edit mode (updating an existing flat). The form captures essential apartment details including name and address, with proper validation and error handling. After successful creation, users are redirected to the flat details page, while successful edits keep users on the same page with updated information.

## 2. View Routing

The view should be accessible via two routes:

- **Create Mode**: `/flats/new` - For adding a new flat
- **Edit Mode**: `/flats/[id]/edit` - For editing an existing flat (where `[id]` is the flat UUID)

## 3. Component Structure

The view consists of an Astro page component with embedded React components for interactivity:

```
FlatFormPage.astro (Main page container)
└── FlatForm (React component - interactive form)
    ├── Input (Shadcn UI component - name field)
    ├── Input (Shadcn UI component - address field)
    ├── Button (Shadcn UI component - submit)
    └── Button (Shadcn UI component - cancel)
```

### Component Hierarchy:
1. **FlatFormPage.astro** - Server-rendered page wrapper that handles initial data loading for edit mode
2. **FlatForm** - Client-side React component handling form state, validation, and submission

## 4. Component Details

### 4.1. FlatFormPage.astro

**Description**: Server-rendered Astro page that acts as a container for the flat form. In edit mode, it fetches the existing flat data from the API and passes it to the FlatForm component. In create mode, it renders an empty form.

**Main elements**:
- Layout wrapper with proper title
- Breadcrumb navigation
- Page header with dynamic title ("Add New Flat" or "Edit Flat")
- FlatForm React component (client:load)
- Error state display if flat fetch fails in edit mode
- Loading skeleton during server-side rendering

**Handled events**: None (server-rendered)

**Handled validation**: 
- URL parameter validation (checking if `id` is a valid UUID in edit mode)
- 404 handling if flat doesn't exist or doesn't belong to the user

**Types**:
- `FlatDto` - For fetched flat data in edit mode
- `FlatFormViewModel` - View model passed to FlatForm component

**Props**: None (Astro page component)

### 4.2. FlatForm (React Component)

**Description**: Interactive form component that handles user input for creating or editing a flat. Manages form state, performs client-side validation, submits data to the API, and handles success/error states.

**Main elements**:
- Form container with proper semantic HTML (`<form>` element)
- Name input field (Input component from Shadcn/ui)
- Address input field (Input component from Shadcn/ui)
- Form error messages display area
- Submit button (Button component from Shadcn/ui)
- Cancel button (Button component from Shadcn/ui)
- Success message display (optional, for edit mode)
- Loading state indicator during submission

**Handled events**:
- `onSubmit` - Form submission, prevents default, validates, and calls API
- `onChange` for name field - Updates form state, clears field-specific errors
- `onChange` for address field - Updates form state, clears field-specific errors
- `onClick` on Cancel button - Navigates back to previous page

**Handled validation**:
- **Name field**:
  - Required: Must not be empty
  - Max length: 100 characters
  - Validation message: "Name is required" (if empty), "Name must be at most 100 characters" (if too long)
- **Address field**:
  - Required: Must not be empty
  - Max length: 200 characters
  - Validation message: "Address is required" (if empty), "Address must be at most 200 characters" (if too long)
- **Form-level validation**:
  - All fields must pass validation before submission is allowed
  - Submit button is enabled only when form is valid and not submitting

**Types**:
- `FlatFormProps` - Component props interface
- `FlatFormState` - Form state interface
- `CreateFlatCommand` - Request body for POST /api/flats
- `UpdateFlatCommand` - Request body for PUT /api/flats/:id
- `FlatDto` - Response type from API
- `ValidationErrorResponseDto` - Error response with field-level validation errors

**Props**:
```typescript
interface FlatFormProps {
  mode: 'create' | 'edit';
  flatId?: string; // Required for edit mode
  initialData?: {
    name: string;
    address: string;
  }; // Required for edit mode
}
```

## 5. Types

### 5.1. Existing Types (from types.ts)

The following types are already defined and will be used:

```typescript
// Request/Response DTOs
type CreateFlatCommand = Pick<FlatDto, "name" | "address">;
type UpdateFlatCommand = Pick<FlatDto, "name" | "address">;
type FlatDto = Tables<"flats">;
interface ValidationErrorResponseDto {
  error: string;
  details: Record<string, string>;
}
```

### 5.2. New Types Required

The following new types need to be defined for this view:

#### FlatFormViewModel
```typescript
/**
 * Flat Form View Model
 * View model for flat form component
 */
export interface FlatFormViewModel {
  mode: 'create' | 'edit';
  flatId?: string;
  initialName: string;
  initialAddress: string;
}
```

#### FlatFormProps (Component-specific, in FlatForm.tsx)
```typescript
interface FlatFormProps {
  mode: 'create' | 'edit';
  flatId?: string;
  initialData?: {
    name: string;
    address: string;
  };
}
```

#### FlatFormState (Component-specific, in FlatForm.tsx)
```typescript
interface FlatFormState {
  name: string;
  address: string;
  errors: {
    name?: string;
    address?: string;
    form?: string; // General form error
  };
  isSubmitting: boolean;
  isSuccess: boolean;
}
```

## 6. State Management

State is managed locally within the `FlatForm` React component using the `useState` hook. No custom hook is required for this simple form.

### State Variables:

1. **formState** (FlatFormState)
   - Purpose: Manages all form-related state including field values, validation errors, submission status, and success state
   - Initial value: 
     - Create mode: `{ name: '', address: '', errors: {}, isSubmitting: false, isSuccess: false }`
     - Edit mode: `{ name: initialData.name, address: initialData.address, errors: {}, isSubmitting: false, isSuccess: false }`
   - Updates: On field changes, validation, submission, API response

### State Update Patterns:

- **Field updates**: When user types, update the specific field and clear its error
- **Validation errors**: Set `errors` object with field-specific messages
- **Submission start**: Set `isSubmitting: true`, clear previous errors
- **Submission success**: Set `isSuccess: true`, `isSubmitting: false`
- **Submission error**: Set form or field errors, `isSubmitting: false`

## 7. API Integration

### 7.1. Create Mode - POST /api/flats

**Endpoint**: `POST /api/flats`

**Request Type**: `CreateFlatCommand`
```typescript
{
  name: string;
  address: string;
}
```

**Success Response Type**: `FlatDto` (Status: 201 Created)
```typescript
{
  id: string;
  user_id: string;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
}
```

**Error Response Type**: `ValidationErrorResponseDto` (Status: 400 Bad Request)
```typescript
{
  error: "Validation failed";
  details: {
    name?: string;
    address?: string;
  };
}
```

**Integration Steps**:
1. Validate form client-side before submission
2. Construct `CreateFlatCommand` from form state
3. Send POST request with JSON body
4. On 201 success: Redirect to `/flats/[id]` (flat details page)
5. On 400 error: Display field-specific validation errors
6. On 401 error: Redirect to login (should not happen if auth is working)
7. On 500 error: Display general error message

### 7.2. Edit Mode - PUT /api/flats/:id

**Endpoint**: `PUT /api/flats/:id`

**Request Type**: `UpdateFlatCommand`
```typescript
{
  name: string;
  address: string;
}
```

**Success Response Type**: `FlatDto` (Status: 200 OK)
```typescript
{
  id: string;
  user_id: string;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
}
```

**Error Response Type**: `ValidationErrorResponseDto` (Status: 400 Bad Request)
```typescript
{
  error: "Validation failed";
  details: {
    name?: string;
    address?: string;
  };
}
```

**Integration Steps**:
1. Validate form client-side before submission
2. Construct `UpdateFlatCommand` from form state
3. Send PUT request to `/api/flats/${flatId}` with JSON body
4. On 200 success: Show success message, update form with new data (or redirect to flat details)
5. On 400 error: Display field-specific validation errors
6. On 404 error: Display "Flat not found" error, potentially redirect to flats list
7. On 401 error: Redirect to login
8. On 500 error: Display general error message

## 8. User Interactions

### 8.1. Typing in Name Field
- **Trigger**: User types in the name input field
- **Action**: Update `formState.name` with new value
- **Validation**: Clear any existing error for the name field
- **Visual Feedback**: Remove error styling from the field

### 8.2. Typing in Address Field
- **Trigger**: User types in the address input field
- **Action**: Update `formState.address` with new value
- **Validation**: Clear any existing error for the address field
- **Visual Feedback**: Remove error styling from the field

### 8.3. Clicking Cancel Button
- **Trigger**: User clicks the Cancel button
- **Action**: 
  - Create mode: Navigate to `/flats` (flats list)
  - Edit mode: Navigate to `/flats/[id]` (flat details page)
- **Confirmation**: No confirmation dialog in MVP

### 8.4. Submitting Form
- **Trigger**: User clicks Submit button or presses Enter in form
- **Pre-validation**: Check all fields meet validation requirements
- **Action if invalid**: Display field-specific error messages, focus first invalid field
- **Action if valid**:
  1. Disable submit button, show loading state
  2. Send API request (POST for create, PUT for edit)
  3. Wait for response
  4. Handle success or error
- **Success behavior**:
  - Create mode: Redirect to `/flats/[newFlatId]` with success message in URL params or session storage
  - Edit mode: Show success message on page, keep form editable with updated data
- **Error behavior**: Display errors inline, re-enable submit button

### 8.5. Viewing Validation Errors
- **Trigger**: Form submission with invalid data or API validation error
- **Display**: 
  - Field-level errors appear below respective input fields in red text
  - Input fields with errors have red border (aria-invalid attribute)
  - General form errors appear at the top of the form
- **Accessibility**: Error messages are associated with fields via aria-describedby

## 9. Conditions and Validation

### 9.1. Client-Side Validation (Pre-submission)

#### Name Field Validation
- **Required check**: 
  - Condition: `name.trim().length === 0`
  - Error message: "Name is required"
  - When checked: On form submission, optionally on blur
- **Max length check**:
  - Condition: `name.length > 100`
  - Error message: "Name must be at most 100 characters"
  - When checked: On form submission, optionally on input (character counter)

#### Address Field Validation
- **Required check**:
  - Condition: `address.trim().length === 0`
  - Error message: "Address is required"
  - When checked: On form submission, optionally on blur
- **Max length check**:
  - Condition: `address.length > 200`
  - Error message: "Address must be at most 200 characters"
  - When checked: On form submission, optionally on input (character counter)

### 9.2. Form-Level Validation

#### Submit Button State
- **Enabled when**:
  - All required fields are filled
  - No validation errors present
  - Not currently submitting (`isSubmitting === false`)
- **Disabled when**:
  - Any required field is empty
  - Any validation error exists
  - Form is submitting (`isSubmitting === true`)

### 9.3. Server-Side Validation (API Response)

The API performs the same validation and may return additional errors:
- Field-specific errors are displayed next to the respective fields
- Unknown errors are displayed as general form errors
- Validation error response structure is handled via `ValidationErrorResponseDto`

### 9.4. Edit Mode Specific Conditions

#### Flat Existence Check (Server-side in Astro page)
- **Condition**: Flat with given ID exists and belongs to current user
- **Check location**: In Astro page component, before rendering form
- **Failure behavior**: Display 404 page or redirect to flats list with error message

#### Flat ID Validation
- **Condition**: `id` parameter is a valid UUID format
- **Check location**: In Astro page component
- **Failure behavior**: Display 400 error or redirect to flats list

## 10. Error Handling

### 10.1. Client-Side Errors

#### Validation Errors
- **Scenario**: User submits form with invalid data
- **Handling**: 
  - Display field-specific errors below inputs
  - Set `aria-invalid` on invalid fields
  - Focus first invalid field
  - Keep submit button disabled until errors are resolved

#### Network Errors
- **Scenario**: API request fails due to network issues
- **Handling**:
  - Catch fetch errors
  - Display user-friendly message: "Network error. Please check your connection and try again."
  - Re-enable submit button
  - Log error to console for debugging

### 10.2. Server-Side Errors

#### 400 Bad Request (Validation Error)
- **Scenario**: Server-side validation fails
- **Handling**:
  - Parse `ValidationErrorResponseDto`
  - Map `details` object to form field errors
  - Display errors next to respective fields
  - Re-enable submit button

#### 401 Unauthorized
- **Scenario**: User is not authenticated
- **Handling**:
  - Redirect to login page with return URL: `/login?returnTo=/flats/new` or `/login?returnTo=/flats/[id]/edit`
  - Display message: "Your session has expired. Please log in again."

#### 404 Not Found (Edit Mode Only)
- **Scenario**: Flat doesn't exist or doesn't belong to user
- **Handling**:
  - Display error message: "Flat not found or you don't have permission to edit it."
  - Provide link to return to flats list
  - Optionally redirect to `/flats` after 3 seconds

#### 500 Internal Server Error
- **Scenario**: Server error during processing
- **Handling**:
  - Display general error message: "An error occurred while saving. Please try again."
  - Log error details to console
  - Re-enable submit button for retry
  - Optionally provide "Report Issue" link

### 10.3. Edge Cases

#### Concurrent Edit Protection
- **Scenario**: In edit mode, another user edits the same flat simultaneously (unlikely but possible)
- **MVP Handling**: No special handling - last write wins
- **Future**: Implement optimistic locking with `updated_at` timestamp check

#### Empty Spaces in Fields
- **Scenario**: User enters only spaces in name or address
- **Handling**: Trim values before validation, treat as empty if only whitespace

#### Special Characters
- **Scenario**: User enters special characters, emojis, or non-Latin characters
- **Handling**: Allow all characters (no restriction in MVP), database handles UTF-8

#### Browser Back Button
- **Scenario**: User clicks back after successful creation/edit
- **Handling**: Standard browser behavior, no special handling in MVP

## 11. Implementation Steps

### Step 1: Create Type Definitions
1. Add `FlatFormViewModel` to `src/types.ts`
2. Create `src/components/FlatForm.tsx` with local type definitions (`FlatFormProps`, `FlatFormState`)

### Step 2: Create FlatForm React Component
1. Create `src/components/FlatForm.tsx`
2. Import required dependencies:
   - React hooks: `useState`, `useEffect`
   - Shadcn components: `Button`, `Input`
   - Types: `CreateFlatCommand`, `UpdateFlatCommand`, `FlatDto`, `ValidationErrorResponseDto`
3. Define component props interface (`FlatFormProps`)
4. Define form state interface (`FlatFormState`)
5. Implement form state management with `useState`
6. Create validation function for client-side validation
7. Implement form change handlers (name, address)
8. Implement form submission handler:
   - Validate form
   - Construct command object
   - Send API request (POST or PUT based on mode)
   - Handle response (success/error)
9. Implement cancel handler
10. Render form UI:
    - Form container with semantic HTML
    - Name input with label, error display
    - Address input with label, error display
    - Error summary (if any general errors)
    - Cancel and Submit buttons
    - Loading state during submission
    - Success state (for edit mode)

### Step 3: Create Astro Page for Create Mode
1. Create `src/pages/flats/new.astro`
2. Import `Layout` component
3. Import `FlatForm` component
4. Set `prerender = false` for server-side rendering
5. Add authentication check (when auth is implemented)
6. Render page structure:
   - Breadcrumb navigation: Dashboard > Flats > New Flat
   - Page header: "Add New Flat"
   - Description text
   - FlatForm component with `client:load` directive, mode="create"

### Step 4: Create Astro Page for Edit Mode
1. Create `src/pages/flats/[id]/edit.astro`
2. Import `Layout` component
3. Import `FlatForm` component
4. Import types: `FlatDto`
5. Set `prerender = false`
6. Add authentication check
7. Extract and validate `id` parameter from URL
8. Fetch flat data from API (GET /api/flats/:id):
   - Handle 404 (flat not found)
   - Handle 401 (unauthorized)
   - Handle 500 (server error)
9. Transform flat data to initial form values
10. Render page structure:
    - Breadcrumb navigation: Dashboard > Flats > [Flat Name] > Edit
    - Page header: "Edit Flat"
    - FlatForm component with `client:load`, mode="edit", flatId, initialData
11. Add error state rendering (if flat fetch failed)
12. Add loading skeleton (optional, for better UX)

### Step 5: Update Navigation Links
1. Update "Add New Flat" button in `src/pages/flats/index.astro`:
   - Change href to `/flats/new`
2. Add "Edit" button/link in flat details page (`src/pages/flats/[id].astro`):
   - Add link to `/flats/[id]/edit`
3. Update dashboard to include "Add Flat" action if not present

### Step 6: Add Styling
1. Ensure consistent styling with existing pages
2. Use Tailwind classes for layout and spacing
3. Apply Shadcn/ui component styles
4. Add focus states for accessibility
5. Add error states styling (red borders, error text)
6. Add loading states (disabled buttons, spinners)
7. Ensure responsive design (desktop only in MVP, min-width: 1024px)

### Step 7: Testing
1. **Create Mode Tests**:
   - Empty form submission (should show validation errors)
   - Valid form submission (should create flat and redirect)
   - Name too long (should show error)
   - Address too long (should show error)
   - Cancel button (should navigate to flats list)
   - Network error handling
2. **Edit Mode Tests**:
   - Load existing flat (should pre-fill form)
   - Update name only (should save and show success)
   - Update address only (should save and show success)
   - Update both fields (should save)
   - Invalid flat ID (should show 404)
   - Flat belongs to another user (should show 404)
   - Cancel button (should navigate to flat details)
3. **Accessibility Tests**:
   - Keyboard navigation (Tab, Enter, Escape)
   - Screen reader compatibility (labels, ARIA attributes)
   - Focus management (first field on load, first error on validation)
4. **Edge Cases**:
   - Only whitespace in fields (should treat as empty)
   - Special characters in fields (should accept)
   - Very long strings (should enforce max length)
   - Rapid form submissions (should prevent with disabled state)

### Step 8: Error Handling Enhancement
1. Implement proper error message display
2. Add error boundary for React component (optional)
3. Add console logging for debugging
4. Test all error scenarios (400, 401, 404, 500)

### Step 9: Documentation
1. Update README with new routes
2. Document component props and usage
3. Add JSDoc comments to functions
4. Update API documentation if needed

### Step 10: Final Review
1. Code review for best practices
2. Lint and format code (ESLint, Prettier)
3. Check TypeScript errors
4. Verify all acceptance criteria from user stories US-005 and US-007
5. Test integration with existing features (dashboard, flats list, flat details)
6. Performance check (component should be lightweight)
7. Security review (ensure no XSS vulnerabilities, proper input sanitization)

