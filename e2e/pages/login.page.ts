import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Login page
 * Encapsulates all interactions with the login page
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole('button', { name: /log in|sign in/i });
    this.errorMessage = page.getByRole('alert');
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto('/auth/login');
  }

  /**
   * Fill in the login form and submit
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /**
   * Check if error message is visible
   */
  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Get the error message text
   */
  async getErrorText(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }
}

