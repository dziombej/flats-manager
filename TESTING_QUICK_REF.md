# Testing Quick Reference

## 🚀 Quick Commands

```bash
# Unit Tests
npm test                    # Watch mode (recommended for development)
npm run test:run           # Run once
npm run test:ui            # Visual UI
npm run test:coverage      # With coverage

# E2E Tests  
npm run test:e2e           # Run all e2e tests
npm run test:e2e:ui        # Playwright UI mode
npm run test:e2e:debug     # Debug mode
npm run test:e2e:codegen   # Record new tests

# Run specific test
npm test -- src/lib/utils.test.ts
npm run test:e2e -- e2e/login.spec.ts

# Filter by name
npm test -- -t "should calculate"
```

## 📝 Unit Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('does something', async () => {
    // Arrange
    const user = userEvent.setup();
    
    // Act
    render(<Component />);
    await user.click(screen.getByRole('button'));
    
    // Assert
    expect(screen.getByText('Result')).toBeInTheDocument();
  });
});
```

## 🎭 E2E Test Template

```typescript
import { test, expect } from './fixtures/test';
import { PageObject } from './pages/page.page';

test.describe('Feature Name', () => {
  test('does something', async ({ page }) => {
    const pageObject = new PageObject(page);
    
    await pageObject.goto();
    await pageObject.doAction();
    
    await expect(page).toHaveURL('/expected');
  });
});
```

## 🔍 Common Test Queries

```typescript
// By role (preferred)
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox', { name: /email/i })
screen.getByRole('heading', { level: 1 })

// By label
screen.getByLabelText(/email/i)

// By text
screen.getByText(/hello world/i)

// By test ID (last resort)
screen.getByTestId('custom-element')

// Async queries (for elements that appear later)
await screen.findByText(/loaded/i)

// Query variants
getBy...    // Throws if not found
queryBy...  // Returns null if not found
findBy...   // Async, waits for element
```

## 🎯 Common Assertions

```typescript
// Vitest
expect(value).toBe(expected)
expect(value).toEqual(expected)
expect(array).toHaveLength(3)
expect(fn).toHaveBeenCalledWith('arg')
expect(fn).toHaveBeenCalledOnce()

// Testing Library
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
expect(element).toHaveClass('btn')
expect(element).toHaveAttribute('href', '/path')
expect(element).toHaveTextContent('text')

// Playwright
await expect(page).toHaveURL('/path')
await expect(locator).toBeVisible()
await expect(locator).toHaveText('text')
await expect(locator).toHaveAttribute('href', '/path')
```

## 🎨 Mocking Examples

```typescript
// Mock function
const mockFn = vi.fn()
mockFn.mockReturnValue('value')
mockFn.mockResolvedValue('async value')

// Mock module
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: [] })
}))

// Mock Supabase
import { createMockSupabaseClient } from '@/test/mocks';
const mockSupabase = createMockSupabaseClient();
```

## 🐛 Debug Tips

```typescript
// Debug in tests
screen.debug()                    // Print DOM
screen.logTestingPlaygroundURL()  // Get testing playground URL

// Playwright debug
await page.pause()                // Pause execution
await page.screenshot({ path: 'debug.png' })

// Run with debugging
npm test -- --reporter=verbose
npm run test:e2e:debug
```

## 📊 Coverage

```bash
# Generate coverage
npm run test:coverage

# View in browser
open coverage/index.html
```

## 🔗 Quick Links

- Unit tests: `src/**/*.test.{ts,tsx}`
- E2E tests: `e2e/**/*.spec.ts`
- Test utilities: `src/test/`
- Page objects: `e2e/pages/`
- Full guide: `TESTING_GUIDE.md`
- Setup summary: `TESTING_SETUP_SUMMARY.md`

