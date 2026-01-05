import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Flat Form
 * Encapsulates all interactions with the flat creation/editing form
 */
export class FlatFormPage {
  readonly page: Page;
  readonly form: Locator;
  readonly nameInput: Locator;
  readonly addressInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly nameError: Locator;
  readonly addressError: Locator;
  readonly formError: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.getByTestId('flat-form');
    this.nameInput = page.getByTestId('flat-name-input');
    this.addressInput = page.getByTestId('flat-address-input');
    this.submitButton = page.getByTestId('flat-form-submit-button');
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.nameError = page.locator('#\\:r0\\:-error, [id$="-error"]').first();
    this.addressError = page.locator('#\\:r1\\:-error, [id$="-error"]').nth(1);
    this.formError = page.getByRole('alert');
    this.successMessage = page.getByRole('status');
  }

  /**
   * Navigate to the create flat page
   */
  async gotoCreate() {
    await this.page.goto('/flats/new');
  }

  /**
   * Navigate to the edit flat page
   */
  async gotoEdit(flatId: string) {
    await this.page.goto(`/flats/${flatId}/edit`);
  }

  /**
   * Fill in the flat form
   */
  async fillForm(name: string, address: string) {
    // Wait for form to be ready (React hydration)
    await this.nameInput.waitFor({ state: 'attached' });
    await this.addressInput.waitFor({ state: 'attached' });

    // Small delay for React hydration
    await this.page.waitForTimeout(500);

    // Clear and fill fields
    await this.nameInput.clear();
    await this.nameInput.fill(name);
    await this.addressInput.clear();
    await this.addressInput.fill(address);

    // Verify fields were filled
    await this.page.waitForTimeout(100);
  }

  /**
   * Submit the form
   */
  async submit() {
    // Wait for button to be enabled (form validation passes)
    await this.submitButton.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(200); // Allow validation to complete
    await this.submitButton.click({ force: false });
  }

  /**
   * Create a new flat with the given details
   */
  async createFlat(name: string, address: string) {
    await this.fillForm(name, address);
    await this.submit();
  }

  /**
   * Update a flat with the given details
   */
  async updateFlat(name: string, address: string) {
    await this.fillForm(name, address);
    await this.submit();
  }

  /**
   * Cancel the form
   */
  async cancel() {
    await this.cancelButton.click();
  }

  /**
   * Check if form is visible
   */
  async isFormVisible(): Promise<boolean> {
    return await this.form.isVisible();
  }

  /**
   * Check if submit button is disabled
   */
  async isSubmitDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  /**
   * Check if name field has error
   */
  async hasNameError(): Promise<boolean> {
    return await this.nameError.isVisible();
  }

  /**
   * Check if address field has error
   */
  async hasAddressError(): Promise<boolean> {
    return await this.addressError.isVisible();
  }

  /**
   * Check if form has general error
   */
  async hasFormError(): Promise<boolean> {
    return await this.formError.isVisible();
  }

  /**
   * Check if success message is visible
   */
  async hasSuccessMessage(): Promise<boolean> {
    return await this.successMessage.isVisible();
  }

  /**
   * Get form error text
   */
  async getFormErrorText(): Promise<string> {
    return await this.formError.textContent() || '';
  }

  /**
   * Wait for redirect after successful form submission
   */
  async waitForRedirect(expectedUrl: string) {
    await this.page.waitForURL(expectedUrl);
  }
}

