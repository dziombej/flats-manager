import { test as base } from '@playwright/test';

/**
 * Extend base test with custom fixtures
 * Example: authenticated user, database setup, etc.
 */
type CustomFixtures = {
  // Add custom fixtures here as needed
};

export const test = base.extend<CustomFixtures>({
  // Define custom fixtures here
});

export { expect } from '@playwright/test';

