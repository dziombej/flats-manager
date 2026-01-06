import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model for Flat Detail Page
 * Encapsulates all interactions with the flat detail view
 */
export class FlatDetailPage {
  readonly page: Page;
  readonly header: Locator;
  readonly name: Locator;
  readonly address: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly totalDebtCard: Locator;
  readonly paymentTypesCountCard: Locator;
  readonly pendingPaymentsCountCard: Locator;
  readonly deleteDialog: Locator;
  readonly deleteConfirmButton: Locator;
  readonly deleteCancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.getByTestId("flat-detail-header");
    this.name = page.getByTestId("flat-detail-name");
    this.address = page.getByTestId("flat-detail-address");
    this.editButton = page.getByTestId("edit-flat-button");
    this.deleteButton = page.getByTestId("delete-flat-button");
    this.totalDebtCard = page.getByTestId("flat-detail-total-debt");
    this.paymentTypesCountCard = page.getByTestId("flat-detail-payment-types-count");
    this.pendingPaymentsCountCard = page.getByTestId("flat-detail-pending-payments-count");
    this.deleteDialog = page.locator(".fixed.inset-0").filter({ hasText: /delete flat/i });
    this.deleteConfirmButton = page.getByRole("button", { name: /delete flat/i }).last();
    this.deleteCancelButton = page.getByRole("button", { name: /cancel/i });
  }

  /**
   * Navigate to the flat detail page
   */
  async goto(flatId: string) {
    await this.page.goto(`/flats/${flatId}`);
  }

  /**
   * Get the flat name
   */
  async getName(): Promise<string> {
    return (await this.name.textContent()) || "";
  }

  /**
   * Get the flat address
   */
  async getAddress(): Promise<string> {
    return (await this.address.textContent()) || "";
  }

  /**
   * Get the total debt value
   */
  async getTotalDebt(): Promise<string> {
    const text = (await this.totalDebtCard.textContent()) || "";
    // Extract just the currency value
    const match = text.match(/[\d\s,]+\s*zł/);
    return match ? match[0].trim() : "";
  }

  /**
   * Get payment types count
   */
  async getPaymentTypesCount(): Promise<number> {
    const text = (await this.paymentTypesCountCard.textContent()) || "";
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  /**
   * Get pending payments count
   */
  async getPendingPaymentsCount(): Promise<number> {
    const text = (await this.pendingPaymentsCountCard.textContent()) || "";
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  /**
   * Click the edit button
   */
  async clickEdit() {
    await this.editButton.click();
    await this.page.waitForURL(/\/flats\/[^/]+\/edit/);
  }

  /**
   * Click the delete button
   */
  async clickDelete() {
    await this.deleteButton.click();
    await this.deleteDialog.waitFor({ state: "visible" });
  }

  /**
   * Confirm deletion in the dialog
   */
  async confirmDelete() {
    await this.deleteConfirmButton.click();
    await this.page.waitForURL("**/dashboard**");
  }

  /**
   * Cancel deletion in the dialog
   */
  async cancelDelete() {
    await this.deleteCancelButton.click();
    await this.deleteDialog.waitFor({ state: "hidden" });
  }

  /**
   * Check if the header is visible
   */
  async isHeaderVisible(): Promise<boolean> {
    return await this.header.isVisible();
  }

  /**
   * Check if delete dialog is visible
   */
  async isDeleteDialogVisible(): Promise<boolean> {
    return await this.deleteDialog.isVisible();
  }

  /**
   * Verify flat details
   */
  async verifyFlatDetails(expectedName: string, expectedAddress: string) {
    const actualName = await this.getName();
    const actualAddress = await this.getAddress();

    if (actualName !== expectedName) {
      throw new Error(`Expected name "${expectedName}" but got "${actualName}"`);
    }

    if (actualAddress !== expectedAddress) {
      throw new Error(`Expected address "${expectedAddress}" but got "${actualAddress}"`);
    }
  }
}
