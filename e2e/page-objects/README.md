# Page Object Model (POM) - Documentation

## Overview

The `e2e/page-objects` directory contains Page Object Model classes that encapsulate interactions with key elements of the Flats Manager application. Each class represents a specific view or component of the application.

## Structure

```
e2e/page-objects/
├── index.ts                        # Barrel export
├── header-navigation.page.ts       # Header navigation
├── flat-form.page.ts              # Flat form
├── flat-detail.page.ts            # Flat details
└── dashboard.page.ts              # Dashboard
```

## POM Classes

### 1. HeaderNavigationPage

**File:** `header-navigation.page.ts`

Encapsulates interactions with the main navigation header.

**Locators:**

- `addFlatButton` - Button "+ Add Flat"
- `dashboardLink` - Link to dashboard
- `allFlatsLink` - Link to all flats list

**Methods:**

- `goToAddFlat()` - Go to flat creation form
- `goToDashboard()` - Go to dashboard
- `goToAllFlats()` - Go to flats list
- `isAddFlatButtonVisible()` - Check Add Flat button visibility

**Usage Example:**

```typescript
const headerNav = new HeaderNavigationPage(page);
await headerNav.goToAddFlat();
```

### 2. FlatFormPage

**File:** `flat-form.page.ts`

Encapsulates interactions with the flat creation/edit form.

**Locators:**

- `form` - Form element
- `nameInput` - Name field
- `addressInput` - Address field
- `submitButton` - Submit button
- `cancelButton` - Cancel button
- `nameError`, `addressError`, `formError` - Error messages
- `successMessage` - Success message

**Methods:**

- `gotoCreate()` - Go to creation page
- `gotoEdit(flatId)` - Go to edit page
- `fillForm(name, address)` - Fill form
- `submit()` - Submit form
- `createFlat(name, address)` - Create flat (fill + submit)
- `updateFlat(name, address)` - Update flat (fill + submit)
- `cancel()` - Cancel form
- `isFormVisible()` - Check form visibility
- `isSubmitDisabled()` - Check if submit button is disabled
- `hasNameError()`, `hasAddressError()`, `hasFormError()` - Check errors
- `hasSuccessMessage()` - Check success message
- `getFormErrorText()` - Get form error text
- `waitForRedirect(url)` - Wait for redirect

**Usage Example:**

```typescript
const flatForm = new FlatFormPage(page);
await flatForm.gotoCreate();
await flatForm.createFlat("Flat 1", "ul. Testowa 1");
```

### 3. FlatDetailPage

**File:** `flat-detail.page.ts`

Encapsulates interactions with the flat details page.

**Locators:**

- `header` - Page header
- `name` - Flat name
- `address` - Flat address
- `editButton` - Edit button
- `deleteButton` - Delete button
- `totalDebtCard` - Total Debt card
- `paymentTypesCountCard` - Payment Types Count card
- `pendingPaymentsCountCard` - Pending Payments Count card
- `deleteDialog` - Delete confirmation dialog
- `deleteConfirmButton`, `deleteCancelButton` - Dialog buttons

**Methods:**

- `goto(flatId)` - Go to details page
- `getName()`, `getAddress()` - Get name/address
- `getTotalDebt()` - Get total debt
- `getPaymentTypesCount()` - Get payment types count
- `getPendingPaymentsCount()` - Get pending payments count
- `clickEdit()` - Click Edit
- `clickDelete()` - Click Delete
- `confirmDelete()` - Confirm deletion
- `cancelDelete()` - Cancel deletion
- `isHeaderVisible()` - Check header visibility
- `isDeleteDialogVisible()` - Check delete dialog visibility
- `verifyFlatDetails(name, address)` - Verify flat details

**Usage Example:**

```typescript
const flatDetail = new FlatDetailPage(page);
await flatDetail.goto(flatId);
await expect(flatDetail.name).toHaveText("Flat 1");
await flatDetail.clickEdit();
```

### 4. DashboardPage

**File:** `dashboard.page.ts`

Encapsulates interactions with the dashboard.

**Locators (dynamic):**

- `getFlatCard(flatId)` - Flat card
- `getFlatCardName(flatId)` - Name on card
- `getFlatCardAddress(flatId)` - Address on card
- `getFlatCardStatus(flatId)` - Status on card
- `getFlatCardTotalDebt(flatId)` - Debt on card
- `getAllFlatCards()` - All cards

**Methods:**

- `goto()` - Go to dashboard
- `getFlatCard(flatId)` - Get flat card locator
- `hasFlatCard(flatId)` - Check if card exists
- `getFlatCardNameText(flatId)` - Get name text
- `getFlatCardAddressText(flatId)` - Get address text
- `getFlatCardStatusText(flatId)` - Get status text
- `getFlatCardTotalDebtText(flatId)` - Get debt text
- `clickFlatCard(flatId)` - Click flat card
- `getFlatCardsCount()` - Get cards count
- `waitForLoad()` - Wait for loading
- `verifyFlatCard(flatId, name, status, debt)` - Verify card
- `findFlatCardIdByName(name)` - Find card ID by name

**Usage Example:**

```typescript
const dashboard = new DashboardPage(page);
await dashboard.goto();
const flatId = await dashboard.findFlatCardIdByName("Flat 1");
await expect(dashboard.getFlatCardStatus(flatId!)).toHaveText("Paid");
```

## Usage Patterns

### Arrange-Act-Assert (AAA)

All tests should follow the AAA pattern:

```typescript
test("should create flat", async ({ page }) => {
  // Arrange - Prepare POM objects and test data
  const flatForm = new FlatFormPage(page);
  const testName = "Test Flat";
  const testAddress = "Test Address";

  // Act - Execute actions
  await flatForm.gotoCreate();
  await flatForm.createFlat(testName, testAddress);

  // Assert - Verify results
  await expect(page).toHaveURL(/\/flats\/[a-f0-9-]+$/);
});
```

### POM Composition

Combine different POM objects in one test:

```typescript
test("complete flow", async ({ page }) => {
  const headerNav = new HeaderNavigationPage(page);
  const flatForm = new FlatFormPage(page);
  const flatDetail = new FlatDetailPage(page);
  const dashboard = new DashboardPage(page);

  await dashboard.goto();
  await headerNav.goToAddFlat();
  await flatForm.createFlat("Name", "Address");
  await headerNav.goToDashboard();

  const flatId = await dashboard.findFlatCardIdByName("Name");
  await dashboard.clickFlatCard(flatId!);
});
```

### Helper Methods

POMs contain helper methods for verification:

```typescript
// Instead of:
const name = await page.getByTestId("flat-detail-name").textContent();
const address = await page.getByTestId("flat-detail-address").textContent();
expect(name).toBe("Expected Name");
expect(address).toBe("Expected Address");

// Use:
await flatDetail.verifyFlatDetails("Expected Name", "Expected Address");
```

## Conventions

### Naming

1. **Classes:** `{Component}Page` (e.g., `FlatFormPage`, `DashboardPage`)
2. **Files:** `{component}.page.ts` (kebab-case)
3. **Locators:** camelCase, descriptive (e.g., `addFlatButton`, `nameInput`)
4. **Methods:**
   - Actions: verbs (e.g., `goto()`, `fillForm()`, `clickEdit()`)
   - Getters: `get{Property}()` (e.g., `getName()`, `getTotalDebt()`)
   - Checkers: `is{State}()` or `has{Property}()` (e.g., `isVisible()`, `hasError()`)

### Locators

Prefer `data-testid` for stability:

```typescript
// ✅ Good - stable
this.nameInput = page.getByTestId("flat-name-input");

// ❌ Avoid - unstable
this.nameInput = page.locator('input[name="name"]');
this.nameInput = page.locator(".form-input:nth-child(1)");
```

### Methods

Encapsulate repeatable action sequences:

```typescript
// Instead of repeating in each test:
await nameInput.fill('Name');
await addressInput.fill('Address');
await submitButton.click();

// Create a method:
async createFlat(name: string, address: string) {
  await this.fillForm(name, address);
  await this.submit();
}
```

## Import and Usage

### Importing from barrel export

```typescript
import { HeaderNavigationPage, FlatFormPage, FlatDetailPage, DashboardPage } from "./page-objects";
```

### Initialization in tests

```typescript
test("my test", async ({ page }) => {
  const dashboard = new DashboardPage(page);
  const flatForm = new FlatFormPage(page);

  // Use POM objects
  await dashboard.goto();
  await flatForm.gotoCreate();
});
```

## Testing

Run tests:

```bash
# All E2E tests
npx playwright test

# Specific file
npx playwright test e2e/create-flat.spec.ts

# With UI
npx playwright test --ui

# With debugger
npx playwright test --debug
```

## Extending POM

When adding new components:

1. Create new file `{component}.page.ts` in `e2e/page-objects/`
2. Implement class following existing POM pattern
3. Add export to `index.ts`
4. Use `data-testid` in components
5. Create tests using the new POM
