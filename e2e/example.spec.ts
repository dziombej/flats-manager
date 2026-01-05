import { test, expect } from './fixtures/test';

test.describe('Example Test Suite', () => {
  test.skip('homepage loads successfully', async ({ page }) => {
    // This test is skipped by default. Remove .skip when your app is ready
    await page.goto('/');

    // Check if the page loaded
    await expect(page).toHaveTitle(/Flats Manager/i);
  });

  test('example passing test', async () => {
    // This is a simple passing test to verify Playwright is working
    expect(1 + 1).toBe(2);
  });
});

