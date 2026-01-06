# Unit Testing Recommendations for Flats Manager

This document identifies which elements of the project are worth testing with unit tests and explains the rationale behind each recommendation.

## Executive Summary

Based on the project structure and coding guidelines, the following areas should be prioritized for unit testing:

1. **Pure Transformation Functions** (HIGH PRIORITY) ✅
2. **Utility Functions** (HIGH PRIORITY) ✅
3. **Business Logic in Services** (MEDIUM-HIGH PRIORITY)
4. **UI Components** (MEDIUM PRIORITY)
5. **Validation Schemas** (MEDIUM PRIORITY)

---

## 1. Pure Transformation Functions (HIGH PRIORITY)

### Files to Test:

- `src/lib/flat-detail-transformers.ts`
- `src/lib/flats-list-transformers.ts`

### Why Test These:

#### **Benefits:**

- ✅ **Pure functions** - No side effects, easy to test
- ✅ **Critical business logic** - Transforms raw data into view models
- ✅ **High ROI** - Simple to test, high confidence gain
- ✅ **Complex calculations** - `calculateFlatStats`, date comparisons, overdue detection
- ✅ **Edge case handling** - Empty arrays, null values, date edge cases

#### **What to Test:**

##### `flat-detail-transformers.ts`:

```typescript
describe("transformPaymentTypeToViewModel", () => {
  it("should transform payment type DTO correctly");
  it("should handle numeric base_amount conversion");
});

describe("transformPaymentToViewModel", () => {
  it("should transform payment DTO with type name");
  it("should calculate isOverdue correctly for unpaid past due payments");
  it("should not mark paid payments as overdue");
  it("should not mark future payments as overdue");
  it("should set canEdit to false for paid payments");
  it("should set canEdit to true for unpaid payments");
});

describe("calculateFlatStats", () => {
  it("should calculate total debt from unpaid payments");
  it("should ignore paid payments in debt calculation");
  it("should handle empty payments array");
  it("should count payment types correctly");
  it("should count pending payments correctly");
  it("should handle decimal amounts correctly");
});

describe("transformFlatDetailData", () => {
  it("should combine all data into view model");
  it("should handle empty payment types and payments");
});
```

##### `flats-list-transformers.ts`:

```typescript
describe("transformFlatToCardViewModel", () => {
  it("should transform flat DTO to card view model");
  it("should format currency correctly");
  it("should generate correct details URL");
  it('should set status to "ok" when debt is 0');
  it('should set status to "overdue" when debt > 0');
  it("should handle undefined optional fields");
});

describe("transformFlatsListData", () => {
  it("should transform array of flats");
  it("should set isEmpty to true for empty array");
  it("should set isEmpty to false for non-empty array");
  it("should calculate totalCount correctly");
});
```

---

## 2. Utility Functions (HIGH PRIORITY)

### Files to Test:

- `src/lib/utils.ts` ✅ (already has tests)

### Why Test These:

#### **Benefits:**

- ✅ **Widely used** - Used across entire application
- ✅ **Pure functions** - Deterministic, no side effects
- ✅ **Formatting logic** - Currency and date formatting are critical for UX
- ✅ **Locale-specific** - Polish locale needs verification

#### **What to Test (expand existing tests):**

```typescript
describe("formatCurrency", () => {
  it("should format positive numbers in PLN");
  it("should format negative numbers in PLN");
  it("should format zero correctly");
  it("should handle decimal places correctly");
  it("should handle large numbers");
});

describe("formatDate", () => {
  it("should format Date object in Polish locale");
  it("should format string date in Polish locale");
  it("should handle different months correctly");
});

describe("formatDateShort", () => {
  it("should format in DD.MM.YYYY format");
  it("should handle Date object");
  it("should handle string date");
  it("should pad single digits correctly");
});
```

---

## 3. Business Logic in Services (MEDIUM-HIGH PRIORITY)

### Files to Test:

- `src/lib/services/flats.service.ts` (partial testing recommended)

### Why Test These:

#### **Benefits:**

- ✅ **Core business logic** - Critical functionality
- ✅ **Complex calculations** - Debt calculation, payment generation
- ⚠️ **Database interactions** - Requires mocking

#### **What to Test:**

##### **Test Pure Logic, Mock Supabase:**

```typescript
describe("FlatsService", () => {
  // Test validation logic
  describe("UUID validation", () => {
    it("should throw error for invalid user ID format");
    it("should throw error for invalid flat ID format");
    it("should accept valid UUID format");
  });

  // Test business logic with mocked Supabase
  describe("getFlatsWithDebt", () => {
    it("should calculate debt correctly from unpaid payments");
    it("should handle flats with no payment types");
    it("should handle flats with no unpaid payments");
    it("should sum multiple unpaid payments correctly");
    it("should map debt to correct flat");
  });

  describe("generatePayments", () => {
    it("should create payment for each payment type");
    it("should use base_amount from payment type");
    it("should set correct month and year");
    it("should set is_paid to false by default");
  });
});
```

##### **Focus Areas:**

1. **UUID Validation Function** - Pure function, easy to extract and test
2. **Data Transformation Logic** - Mapping payments to flats
3. **Business Rules** - Payment generation logic, debt calculation
4. **Error Handling** - Invalid UUID handling, null checks

##### **Testing Strategy:**

```typescript
// Mock Supabase client
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  // ... mock other methods
};
```

---

## 4. UI Components (MEDIUM PRIORITY)

### Files to Test:

- `src/components/ui/button.tsx` ✅ (already has tests)
- `src/components/FlatCard.tsx`
- `src/components/FilterBar.tsx`
- `src/components/FlatsGrid.tsx`

### Why Test These:

#### **Benefits:**

- ✅ **User interaction** - Ensures UI works as expected
- ✅ **Accessibility** - Verify ARIA attributes
- ✅ **Event handlers** - Click, submit, change events
- ⚠️ **Requires jsdom** - More complex setup

#### **What to Test:**

##### `FlatCard.tsx`:

```typescript
describe("FlatCard", () => {
  it("should render flat name and address");
  it("should display formatted debt");
  it('should show "overdue" badge when status is overdue');
  it('should show "ok" badge when status is ok');
  it("should link to flat details page");
  it("should handle missing optional fields gracefully");
});
```

##### `FilterBar.tsx`:

```typescript
describe("FilterBar", () => {
  it("should render filter inputs");
  it("should call onChange when filter values change");
  it("should reset filters when reset button clicked");
  it("should display current filter values");
});
```

---

## 5. Validation Schemas (MEDIUM PRIORITY)

### Files to Test:

- Zod schemas in API route files (extract to separate file first)

### Why Test These:

#### **Benefits:**

- ✅ **Input validation** - Critical for security
- ✅ **Error messages** - User-facing error messages
- ✅ **Type safety** - Ensures DTOs match expectations

#### **Recommendation:**

Extract Zod schemas to `src/lib/validation/` directory, then test:

```typescript
describe("FlatValidationSchema", () => {
  it("should accept valid flat data");
  it("should reject empty name");
  it("should reject empty address");
  it("should reject name longer than max length");
  it("should provide helpful error messages");
});

describe("PaymentTypeValidationSchema", () => {
  it("should accept valid payment type");
  it("should reject negative base_amount");
  it("should reject zero base_amount");
  it("should accept decimal base_amount");
});

describe("GeneratePaymentsSchema", () => {
  it("should accept valid month (1-12)");
  it("should reject month < 1");
  it("should reject month > 12");
  it("should accept valid year");
  it("should reject year < 1900");
  it("should reject year > 2100");
});
```

---

## What NOT to Test with Unit Tests

### ❌ Astro Pages and API Routes

**Why:** These are better suited for E2E tests

- Require full Astro runtime
- Test integration, not isolated logic
- E2E tests provide better coverage

**Alternative:** Use Playwright for E2E testing

### ❌ Supabase Client Integration

**Why:** Integration tests, not unit tests

- Requires database connection
- State management complexity
- Better tested with integration tests

**Alternative:** Mock Supabase in service tests, use real DB for E2E

### ❌ Middleware

**Why:** Requires Astro context

- Better tested in integration/E2E
- Depends on request/response lifecycle

**Alternative:** E2E tests for auth flow

---

## Testing Priority Matrix

| Component                      | Priority  | Effort | ROI        | Status        |
| ------------------------------ | --------- | ------ | ---------- | ------------- |
| `flat-detail-transformers.ts`  | 🔴 HIGH   | Low    | ⭐⭐⭐⭐⭐ | ❌ Not tested |
| `flats-list-transformers.ts`   | 🔴 HIGH   | Low    | ⭐⭐⭐⭐⭐ | ❌ Not tested |
| `utils.ts` formatCurrency/Date | 🔴 HIGH   | Low    | ⭐⭐⭐⭐⭐ | ✅ Partial    |
| UUID validation (FlatsService) | 🟡 MEDIUM | Low    | ⭐⭐⭐⭐   | ❌ Not tested |
| Debt calculation logic         | 🟡 MEDIUM | Medium | ⭐⭐⭐⭐   | ❌ Not tested |
| Zod validation schemas         | 🟡 MEDIUM | Medium | ⭐⭐⭐     | ❌ Not tested |
| UI Components                  | 🟢 LOW    | Medium | ⭐⭐⭐     | ✅ Partial    |

---

## Recommended Testing Workflow

### Step 1: Extract Pure Functions (Refactoring)

```typescript
// Extract from FlatsService to utils
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
```

### Step 2: Test Pure Functions First

- Start with `flat-detail-transformers.ts`
- Then `flats-list-transformers.ts`
- Expand `utils.ts` tests

### Step 3: Extract and Test Validation

- Move Zod schemas to `src/lib/validation/`
- Create schema tests

### Step 4: Test Service Business Logic

- Mock Supabase client
- Test debt calculation
- Test payment generation logic

### Step 5: Component Testing (Optional)

- Test critical UI components
- Focus on user interactions

---

## Code Coverage Goals

Based on Vitest guidelines, focus on **meaningful coverage** over percentage:

- **Transformers:** Aim for 100% (pure functions)
- **Utils:** Aim for 100% (pure functions)
- **Services:** Aim for 70-80% (focus on business logic, not DB calls)
- **Components:** Aim for 60-70% (critical paths only)

**Don't test:**

- Type definitions
- Simple getters/setters
- Third-party library wrappers (unless adding logic)

---

## Example Test Structure

```typescript
// src/lib/flat-detail-transformers.test.ts
import { describe, it, expect } from "vitest";
import { transformPaymentToViewModel, calculateFlatStats } from "./flat-detail-transformers";
import type { PaymentWithTypeNameDto, PaymentTypeDto } from "@/types";

describe("flat-detail-transformers", () => {
  describe("transformPaymentToViewModel", () => {
    it("should mark unpaid past due payment as overdue", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const payment: PaymentWithTypeNameDto = {
        id: "1",
        payment_type_id: "1",
        payment_type_name: "Rent",
        amount: 1000,
        due_date: pastDate.toISOString(),
        is_paid: false,
        paid_at: null,
        month: 1,
        year: 2026,
        created_at: "",
        updated_at: "",
      };

      const result = transformPaymentToViewModel(payment);

      expect(result.isOverdue).toBe(true);
      expect(result.canEdit).toBe(true);
    });

    it("should not mark paid payment as overdue even if past due", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const payment: PaymentWithTypeNameDto = {
        id: "1",
        payment_type_id: "1",
        payment_type_name: "Rent",
        amount: 1000,
        due_date: pastDate.toISOString(),
        is_paid: true,
        paid_at: new Date().toISOString(),
        month: 1,
        year: 2026,
        created_at: "",
        updated_at: "",
      };

      const result = transformPaymentToViewModel(payment);

      expect(result.isOverdue).toBe(false);
      expect(result.canEdit).toBe(false);
    });
  });

  describe("calculateFlatStats", () => {
    it("should calculate total debt from unpaid payments only", () => {
      const payments: PaymentWithTypeNameDto[] = [
        { amount: 1000, is_paid: false /* ...other fields */ } as any,
        { amount: 500, is_paid: false /* ...other fields */ } as any,
        { amount: 2000, is_paid: true /* ...other fields */ } as any,
      ];

      const paymentTypes: PaymentTypeDto[] = [
        { id: "1" /* ...other fields */ } as any,
        { id: "2" /* ...other fields */ } as any,
      ];

      const stats = calculateFlatStats(payments, paymentTypes);

      expect(stats.totalDebt).toBe(1500); // Only unpaid
      expect(stats.paymentTypesCount).toBe(2);
      expect(stats.pendingPaymentsCount).toBe(2);
    });
  });
});
```

---

## Conclusion

**Focus on high-value, low-effort tests first:**

1. ✅ **Test pure transformation functions** - Highest ROI
2. ✅ **Test utility functions** - Critical for UX
3. ✅ **Extract and test business logic** - Medium effort, high value
4. ⚠️ **Test components selectively** - Focus on critical interactions
5. ❌ **Avoid testing integration points** - Use E2E tests instead

**Remember the coding guidelines:**

> "Focus on meaningful tests rather than arbitrary coverage percentages."

The goal is **confidence in critical paths**, not 100% coverage.
