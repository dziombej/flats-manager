import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Dashboard Page
 * Encapsulates all interactions with the dashboard view
 */
export class DashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the dashboard
   */
  async goto() {
    await this.page.goto('/dashboard');
  }

  /**
   * Get a flat card by ID
   */
  getFlatCard(flatId: string): Locator {
    return this.page.getByTestId(`flat-card-${flatId}`);
  }

  /**
   * Get flat card name by flat ID
   */
  getFlatCardName(flatId: string): Locator {
    return this.getFlatCard(flatId).getByTestId('flat-card-name');
  }

  /**
   * Get flat card address by flat ID
   */
  getFlatCardAddress(flatId: string): Locator {
    return this.getFlatCard(flatId).getByTestId('flat-card-address');
  }

  /**
   * Get flat card status by flat ID
   */
  getFlatCardStatus(flatId: string): Locator {
    return this.getFlatCard(flatId).getByTestId('flat-card-status');
  }

  /**
   * Get flat card total debt by flat ID
   */
  getFlatCardTotalDebt(flatId: string): Locator {
    return this.getFlatCard(flatId).getByTestId('flat-card-total-debt');
  }

  /**
   * Get all flat cards
   */
  getAllFlatCards(): Locator {
    return this.page.locator('[data-test-id^="flat-card-"]');
  }

  /**
   * Check if a flat card exists
   */
  async hasFlatCard(flatId: string): Promise<boolean> {
    return await this.getFlatCard(flatId).isVisible();
  }

  /**
   * Get flat card name text
   */
  async getFlatCardNameText(flatId: string): Promise<string> {
    return await this.getFlatCardName(flatId).textContent() || '';
  }

  /**
   * Get flat card address text
   */
  async getFlatCardAddressText(flatId: string): Promise<string> {
    return await this.getFlatCardAddress(flatId).textContent() || '';
  }

  /**
   * Get flat card status text
   */
  async getFlatCardStatusText(flatId: string): Promise<string> {
    return await this.getFlatCardStatus(flatId).textContent() || '';
  }

  /**
   * Get flat card total debt text
   */
  async getFlatCardTotalDebtText(flatId: string): Promise<string> {
    return await this.getFlatCardTotalDebt(flatId).textContent() || '';
  }

  /**
   * Click on a flat card to navigate to its detail page
   */
  async clickFlatCard(flatId: string) {
    const viewDetailsButton = this.getFlatCard(flatId).getByRole('button', { name: /view details/i });
    await viewDetailsButton.click();
    await this.page.waitForURL(`**/flats/${flatId}`);
  }

  /**
   * Get the count of all flat cards
   */
  async getFlatCardsCount(): Promise<number> {
    return await this.getAllFlatCards().count();
  }

  /**
   * Wait for dashboard to load
   */
  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify flat card details
   */
  async verifyFlatCard(
    flatId: string,
    expectedName: string,
    expectedStatus: string,
    expectedDebt: string
  ) {
    const actualName = await this.getFlatCardNameText(flatId);
    const actualStatus = await this.getFlatCardStatusText(flatId);
    const actualDebt = await this.getFlatCardTotalDebtText(flatId);

    if (actualName !== expectedName) {
      throw new Error(`Expected name "${expectedName}" but got "${actualName}"`);
    }

    if (actualStatus !== expectedStatus) {
      throw new Error(`Expected status "${expectedStatus}" but got "${actualStatus}"`);
    }

    if (actualDebt !== expectedDebt) {
      throw new Error(`Expected debt "${expectedDebt}" but got "${actualDebt}"`);
    }
  }

  /**
   * Find flat card ID by name (useful when ID is not known)
   */
  async findFlatCardIdByName(name: string): Promise<string | null> {
    const allCards = this.getAllFlatCards();
    const count = await allCards.count();

    for (let i = 0; i < count; i++) {
      const card = allCards.nth(i);
      const cardName = await card.getByTestId('flat-card-name').textContent();

      if (cardName?.trim() === name) {
        const testId = await card.getAttribute('data-test-id');
        return testId?.replace('flat-card-', '') || null;
      }
    }

    return null;
  }
}

