# Testing Guide

This project uses **Vitest** for unit/integration tests and **Playwright** for end-to-end tests.

## Quick Start

### Unit Tests (Vitest)

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run e2e tests
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e:ui

# Debug e2e tests
npm run test:e2e:debug

# Generate new tests with codegen
npm run test:e2e:codegen
```

## Project Structure

```
src/
├── test/                      # Test utilities and setup
│   ├── setup.ts              # Vitest global setup
│   ├── mocks.ts              # Reusable mocks (Supabase, etc.)
│   └── test-utils.tsx        # Custom render functions
├── lib/
│   └── utils.test.ts         # Example unit test
└── components/
    └── *.test.tsx            # Component tests

e2e/
├── fixtures/                  # Playwright fixtures
│   └── test.ts               # Custom test fixtures
└── *.spec.ts                 # E2E test files
```

## Writing Unit Tests

### Testing React Components

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Testing Services

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient } from '@/test/mocks';

describe('FlatsService', () => {
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
  });

  it('fetches flats', async () => {
    const mockFlats = [{ id: '1', name: 'Flat 1' }];
    mockSupabase.from().select().mockResolvedValue({ 
      data: mockFlats, 
      error: null 
    });

    const result = await getFlats(mockSupabase);
    expect(result).toEqual(mockFlats);
  });
});
```

### Mocking Modules

```typescript
import { vi } from 'vitest';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => createMockSupabaseClient()),
}));
```

## Writing E2E Tests

### Page Object Model Pattern

```typescript
// e2e/pages/login.page.ts
import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/auth/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }
}
```

### Using Page Objects in Tests

```typescript
import { test, expect } from './fixtures/test';
import { LoginPage } from './pages/login.page';

test.describe('Login Flow', () => {
  test('user can login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.login('user@example.com', 'password');
    
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Visual Testing

```typescript
test('homepage visual test', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

## Best Practices

### Unit Tests

1. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should do something', () => {
     // Arrange - setup test data
     const input = 'test';
     
     // Act - execute the code
     const result = transform(input);
     
     // Assert - verify the result
     expect(result).toBe('TEST');
   });
   ```

2. **Test Edge Cases First**
   ```typescript
   describe('divide', () => {
     it('handles division by zero', () => {
       expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
     });

     it('divides positive numbers', () => {
       expect(divide(10, 2)).toBe(5);
     });
   });
   ```

3. **Use Descriptive Test Names**
   ```typescript
   // ❌ Bad
   it('works', () => { ... });
   
   // ✅ Good
   it('calculates total price with tax included', () => { ... });
   ```

### E2E Tests

1. **Use Locators Wisely**
   ```typescript
   // ✅ Good - resilient to changes
   await page.getByRole('button', { name: 'Submit' });
   await page.getByLabel('Email');
   
   // ❌ Bad - fragile
   await page.locator('.btn-primary');
   ```

2. **Wait for Elements**
   ```typescript
   // Wait for element to be visible
   await expect(page.getByText('Success')).toBeVisible();
   
   // Wait for navigation
   await page.waitForURL('/dashboard');
   ```

3. **Isolate Tests**
   ```typescript
   test.beforeEach(async ({ page }) => {
     // Reset state before each test
     await page.goto('/');
   });
   ```

## Debugging

### Vitest

```bash
# Run a specific test file
npm test -- src/lib/utils.test.ts

# Run tests matching a pattern
npm test -- -t "should calculate"

# Watch mode with filtering
npm test -- --watch --testNamePattern="Button"
```

### Playwright

```bash
# Run with browser visible
npm run test:e2e -- --headed

# Run specific test file
npm run test:e2e -- e2e/login.spec.ts

# Run with trace
npm run test:e2e -- --trace on
```

View trace file:
```bash
npx playwright show-trace trace.zip
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:run

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Coverage Reports

After running `npm run test:coverage`, open `coverage/index.html` in your browser to view the detailed coverage report.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)

