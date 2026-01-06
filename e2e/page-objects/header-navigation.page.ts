import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model for Header Navigation
 * Encapsulates all interactions with the main header navigation
 */
export class HeaderNavigationPage {
  readonly page: Page;
  readonly addFlatButton: Locator;
  readonly dashboardLink: Locator;
  readonly allFlatsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addFlatButton = page.getByTestId("add-flat-button");
    this.dashboardLink = page.getByTestId("dashboard-link");
    this.allFlatsLink = page.getByRole("link", { name: /all flats/i });
  }

  /**
   * Navigate to the flat creation page by clicking Add Flat button
   */
  async goToAddFlat() {
    await this.addFlatButton.click();
    await this.page.waitForURL("**/flats/new");
  }

  /**
   * Navigate to the dashboard
   */
  async goToDashboard() {
    await this.dashboardLink.click();
    await this.page.waitForURL("**/dashboard");
  }

  /**
   * Navigate to all flats page
   */
  async goToAllFlats() {
    await this.allFlatsLink.click();
    await this.page.waitForURL("**/flats");
  }

  /**
   * Check if Add Flat button is visible
   */
  async isAddFlatButtonVisible(): Promise<boolean> {
    return await this.addFlatButton.isVisible();
  }
}
