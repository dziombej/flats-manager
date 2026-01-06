/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from "@playwright/test";
import type { Page } from "@playwright/test";
import { LoginPage } from "../pages/login.page";

/**
 * Extend base test with custom fixtures
 * Example: authenticated user, database setup, etc.
 */
interface CustomFixtures {
  authenticatedPage: Page;
}

/**
 * Helper function to authenticate a user
 * Modify this based on your actual authentication mechanism
 */
async function authenticate(page: Page) {
  // Check if already authenticated by trying to access dashboard
  await page.goto("/dashboard");

  // If redirected to login, perform login
  if (page.url().includes("/auth/login")) {
    const email = process.env.E2E_USERNAME || "test@example.com";
    const password = process.env.E2E_PASSWORD || "testpassword";

    const loginPage = new LoginPage(page);

    // Wait for all form elements to be ready
    await loginPage.emailInput.waitFor({ state: "attached" });
    await loginPage.passwordInput.waitFor({ state: "attached" });

    // Wait a bit for React hydration
    await page.waitForTimeout(1000);

    // Perform login and wait for navigation
    await loginPage.login(email, password);

    // Wait for successful navigation to dashboard
    await page.waitForURL("/dashboard", { timeout: 15000 });
  }
}

export const test = base.extend<CustomFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: Authenticate the user
    await authenticate(page);

    // Provide the authenticated page to the test
    await use(page);

    // Teardown: Optional cleanup
  },
});

export { expect } from "@playwright/test";
