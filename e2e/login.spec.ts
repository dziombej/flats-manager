import { test, expect } from './fixtures/test';
import { LoginPage } from './pages/login.page';

test.describe('Login Flow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test.skip('displays login form', async ({ page }) => {
    // Remove .skip when your login page is ready
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test.skip('shows error for invalid credentials', async ({ page }) => {
    // Remove .skip when your login page is ready
    await loginPage.login('invalid@example.com', 'wrongpassword');

    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorText();
    expect(errorText).toContain('Invalid');
  });

  test.skip('redirects to dashboard on successful login', async ({ page }) => {
    // Remove .skip when your login page is ready
    await loginPage.login('user@example.com', 'correctpassword');

    await expect(page).toHaveURL('/dashboard');
  });

  test.skip('validates email format', async ({ page }) => {
    // Remove .skip when your login page is ready
    await loginPage.emailInput.fill('invalid-email');
    await loginPage.passwordInput.fill('password123');
    await loginPage.submitButton.click();

    // Check for HTML5 validation or custom error
    const emailValidity = await loginPage.emailInput.evaluate((el: HTMLInputElement) =>
      el.validity.valid
    );
    expect(emailValidity).toBe(false);
  });
});

