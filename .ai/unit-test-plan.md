# Unit Testing Recommendations Summary

## 🎯 High Priority - Test These First

### 1. Pure Transformation Functions ⭐⭐⭐⭐⭐
**Files:**
- `src/lib/flat-detail-transformers.ts` ❌ NOT TESTED
- `src/lib/flats-list-transformers.ts` ❌ NOT TESTED

**Why:**
- ✅ Pure functions (no side effects)
- ✅ Critical business logic (data → view models)
- ✅ Easy to test (low effort, high ROI)
- ✅ Complex calculations (debt, overdue detection)
- ✅ Many edge cases (nulls, empty arrays, dates)

**Key Functions:**
```typescript
// Test these extensively:
- transformPaymentToViewModel()     // Overdue calculation
- calculateFlatStats()              // Debt calculation
- transformFlatToCardViewModel()    // Card display logic
- transformFlatsListData()          // List transformation
```

---

### 2. Utility Functions ⭐⭐⭐⭐⭐
**File:** `src/lib/utils.ts` ✅ PARTIALLY TESTED

**Why:**
- ✅ Used across entire app
- ✅ Pure functions
- ✅ Locale-specific formatting (Polish)
- ✅ Critical for UX

**Expand Tests:**
```typescript
- formatCurrency()   // Add: negatives, large numbers, decimals
- formatDate()       // Add: edge cases, different months
- formatDateShort()  // Add: padding verification
```

---

## 🟡 Medium Priority - Test Selectively

### 3. Business Logic in Services
**File:** `src/lib/services/flats.service.ts` ❌ NOT TESTED

**What to Test:**
- ✅ UUID validation (extract to utils first)
- ✅ Debt calculation logic
- ✅ Payment generation rules
- ✅ Error handling

**What NOT to Test:**
- ❌ Direct Supabase calls (use E2E instead)
- ❌ Database interactions

**Strategy:**
```typescript
// Extract pure functions first:
export function isValidUUID(uuid: string): boolean { ... }

// Then mock Supabase for business logic tests:
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  // ... other methods
};
```

---

### 4. Validation Schemas
**Current:** Embedded in API routes ❌ NOT TESTED

**Recommendation:**
1. Extract to `src/lib/validation/` directory
2. Test edge cases:
    - Empty values
    - Invalid ranges (month: 1-12, year: 1900-2100)
    - Negative amounts
    - String lengths

---

### 5. UI Components
**File:** `src/components/ui/button.tsx` ✅ TESTED

**Test Selectively:**
- ✅ Critical user interactions
- ✅ Conditional rendering
- ✅ Accessibility (ARIA attributes)
- ❌ Don't over-test simple components

**Candidates:**
- `FlatCard.tsx` - Badge display, status logic
- `FilterBar.tsx` - Filter state management

---

## ❌ Don't Unit Test These

### Astro Pages & API Routes
**Why:** Better for E2E tests
- Require full Astro runtime
- Integration points, not isolated logic
- Playwright provides better coverage

### Supabase Integration
**Why:** Integration test territory
- Requires database
- State management complexity
- Mock for service tests, real for E2E

### Middleware
**Why:** Requires Astro context
- Request/response lifecycle
- Better in E2E tests

---

## 📊 Priority Matrix

| Component | Priority | Effort | ROI | Status |
|-----------|----------|--------|-----|--------|
| Transformers (flat-detail) | 🔴 HIGH | Low | ⭐⭐⭐⭐⭐ | ❌ |
| Transformers (flats-list) | 🔴 HIGH | Low | ⭐⭐⭐⭐⭐ | ❌ |
| Utils (expand tests) | 🔴 HIGH | Low | ⭐⭐⭐⭐⭐ | ⚠️ |
| UUID validation | 🟡 MEDIUM | Low | ⭐⭐⭐⭐ | ❌ |
| Debt calculation | 🟡 MEDIUM | Medium | ⭐⭐⭐⭐ | ❌ |
| Validation schemas | 🟡 MEDIUM | Medium | ⭐⭐⭐ | ❌ |
| UI Components | 🟢 LOW | Medium | ⭐⭐⭐ | ⚠️ |

---

## 🚀 Recommended Implementation Order

### Phase 1: Quick Wins (2-4 hours)
1. ✅ Test `flat-detail-transformers.ts`
2. ✅ Test `flats-list-transformers.ts`
3. ✅ Expand `utils.ts` tests

**Impact:** Covers core business logic with minimal effort

### Phase 2: Extract & Test (4-6 hours)
4. ✅ Extract UUID validation to utils
5. ✅ Extract Zod schemas to validation directory
6. ✅ Test extracted pure functions

**Impact:** Improves code organization + testability

### Phase 3: Service Logic (6-8 hours)
7. ✅ Mock Supabase client
8. ✅ Test debt calculation in service
9. ✅ Test payment generation logic

**Impact:** Verifies critical business rules

### Phase 4: Components (Optional, 4-6 hours)
10. ✅ Test critical UI components
11. ✅ Test user interaction flows

**Impact:** Ensures UI reliability

---

## 💡 Key Insights

### Why Focus on Transformers?
```typescript
// This function runs for EVERY payment displayed
transformPaymentToViewModel(payment: PaymentWithTypeNameDto): PaymentViewModel {
  const dueDate = new Date(payment.due_date);
  const now = new Date();
  const isOverdue = !payment.is_paid && dueDate < now; // ⚠️ Critical logic!
  // ...
}
```

**Impact:**
- Wrong overdue calculation → Wrong UI badges → User confusion
- Wrong debt calculation → Financial errors
- Wrong date formatting → UX issues

**Test Value:**
- Catches edge cases (timezone, DST, leap years)
- Verifies business rules
- Prevents regressions

---

### Coverage Goals
Don't chase arbitrary percentages. Focus on:

- **Transformers:** ~100% (pure, critical)
- **Utils:** ~100% (pure, shared)
- **Services:** ~70-80% (business logic only)
- **Components:** ~60-70% (critical paths)

---

## 📝 Example Test

```typescript
// src/lib/flat-detail-transformers.test.ts
import { describe, it, expect } from 'vitest';
import { transformPaymentToViewModel } from './flat-detail-transformers';

describe('transformPaymentToViewModel', () => {
  it('should mark unpaid past due payment as overdue', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const payment = {
      id: '1',
      payment_type_id: '1',
      payment_type_name: 'Rent',
      amount: 1000,
      due_date: yesterday.toISOString(),
      is_paid: false,
      paid_at: null,
      month: 1,
      year: 2026,
      created_at: '',
      updated_at: '',
    };

    const result = transformPaymentToViewModel(payment);

    expect(result.isOverdue).toBe(true);
    expect(result.canEdit).toBe(true);
  });
});
```

---

## 🎓 Alignment with Project Guidelines

From `.github/copilot-instructions.md`:

> ✅ "Focus on meaningful tests rather than arbitrary coverage percentages."

> ✅ "Structure tests for maintainability - Group related tests with descriptive describe blocks"

> ✅ "Leverage the vi object for test doubles - Use vi.fn() for function mocks"

> ✅ "Follow the Arrange-Act-Assert pattern"

This recommendation follows all guidelines while prioritizing high-impact tests.

---

## 📄 Full Details

See `UNIT_TESTING_RECOMMENDATIONS.md` for:
- Detailed test case lists
- Complete code examples
- Testing strategies
- Mocking patterns
