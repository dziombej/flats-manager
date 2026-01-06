import { test, expect } from "./fixtures/test";
import { LoginPage } from "./pages/login.page";

test.describe("Login Flow", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    // Clear cookies before each test to ensure clean state
    await page.context().clearCookies();
    loginPage = new LoginPage(page);
    await loginPage.goto();

    // Wait for React hydration
    await page.waitForTimeout(1000);
  });

  test("displays login form", async () => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.submitButton).toHaveText("Log in");
  });

  test("shows error for invalid credentials", async () => {
    await loginPage.login("invalid@example.com", "wrongpassword");

    // Wait for error message to appear
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
    const errorText = await loginPage.getErrorText();
    expect(errorText).toMatch(/incorrect|invalid/i);
  });

  test("redirects to dashboard on successful login", async ({ page }) => {
    const email = process.env.E2E_USERNAME || "test@test.pl";
    const password = process.env.E2E_PASSWORD || "testtest";

    await loginPage.login(email, password);

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("validates email format", async ({ page }) => {
    await loginPage.emailInput.fill("invalid-email");
    await loginPage.passwordInput.fill("password123");

    // Try to submit - the client-side validation should show error
    await loginPage.submitButton.click();

    // Check for client-side validation error message
    await page.waitForTimeout(500);
    const emailError = page.locator("text=/valid email/i");
    await expect(emailError).toBeVisible();
  });

  test("shows validation errors for empty fields", async ({ page }) => {
    // Try to submit without filling anything
    await loginPage.submitButton.click();

    // Check for validation errors
    await page.waitForTimeout(500);
    const emailError = page.locator("text=/email is required/i");
    const passwordError = page.locator("text=/password is required/i");

    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
  });

  test("clears errors when user starts typing", async ({ page }) => {
    // Submit empty form to trigger errors
    await loginPage.submitButton.click();
    await page.waitForTimeout(500);

    const emailError = page.locator("text=/email is required/i");
    await expect(emailError).toBeVisible();

    // Start typing in email field
    await loginPage.emailInput.fill("test@example.com");

    // Error should disappear
    await expect(emailError).not.toBeVisible();
  });
});
