import { test, expect } from "./fixtures/test";
import { HeaderNavigationPage, FlatFormPage, FlatDetailPage, DashboardPage } from "./page-objects";

/**
 * E2E Test: Create Flat - Complete User Scenario
 *
 * Scenario:
 * 1. Login if needed
 * 2. Click "+ Add flat" button
 * 3. Enter name "NazwaTest"
 * 4. Enter address "TestowyAdres 54"
 * 5. Click "Create Flat"
 * 6. Verify on flat detail page: name, address, Edit and Delete buttons
 * 7. Click dashboard
 * 8. Verify flat card exists with status "Paid" and total debt "0.00 zł"
 */
test.describe("Create Flat - Complete Scenario", () => {
  test("should complete full flat creation flow from dashboard to verification", async ({
    authenticatedPage: page,
  }) => {
    // Test data
    const testFlatName = "NazwaTest";
    const testFlatAddress = "TestowyAdres 54";

    // Initialize Page Objects
    const headerNav = new HeaderNavigationPage(page);
    const flatForm = new FlatFormPage(page);
    const flatDetail = new FlatDetailPage(page);
    const dashboard = new DashboardPage(page);

    // Step 1: User is already logged in (via authenticatedPage fixture)
    // Verify we're on dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Step 2: Click "+ Add flat" button
    await test.step('Click "+ Add flat" button', async () => {
      await expect(headerNav.addFlatButton).toBeVisible();
      await headerNav.goToAddFlat();
      await expect(page).toHaveURL(/\/flats\/new/);
    });

    // Step 3 & 4: Fill in the form
    await test.step("Fill flat creation form", async () => {
      await expect(flatForm.form).toBeVisible();

      // Enter name
      await flatForm.nameInput.fill(testFlatName);
      await expect(flatForm.nameInput).toHaveValue(testFlatName);

      // Enter address
      await flatForm.addressInput.fill(testFlatAddress);
      await expect(flatForm.addressInput).toHaveValue(testFlatAddress);
    });

    // Step 5: Click "Create Flat"
    await test.step("Submit the form", async () => {
      await expect(flatForm.submitButton).toBeEnabled();
      await flatForm.submit();

      // Wait for redirect to flat detail page
      await page.waitForURL(/\/flats\/[a-f0-9-]+$/, { timeout: 10000 });
    });

    // Step 6: Verify on flat detail page
    await test.step("Verify flat detail page", async () => {
      // Check URL is flat detail page
      expect(page.url()).toMatch(/\/flats\/[a-f0-9-]+$/);

      // Verify header is visible
      await expect(flatDetail.header).toBeVisible();

      // Verify flat name
      await expect(flatDetail.name).toBeVisible();
      await expect(flatDetail.name).toHaveText(testFlatName);

      // Verify flat address
      await expect(flatDetail.address).toBeVisible();
      await expect(flatDetail.address).toHaveText(testFlatAddress);

      // Verify Edit button is visible
      await expect(flatDetail.editButton).toBeVisible();

      // Verify Delete button is visible
      await expect(flatDetail.deleteButton).toBeVisible();

      // Verify Total Debt is 0.00 zł
      const totalDebtText = await flatDetail.totalDebtCard.textContent();
      expect(totalDebtText).toMatch(/0[,.]00\s*zł/i);
    });

    // Step 7: Click dashboard
    await test.step("Navigate back to dashboard", async () => {
      await headerNav.goToDashboard();
      await expect(page).toHaveURL(/\/dashboard/);

      // Wait for dashboard to load
      await dashboard.waitForLoad();
    });

    // Step 8: Verify flat card on dashboard
    await test.step("Verify flat card on dashboard", async () => {
      // Find the flat card by name
      const flatId = await dashboard.findFlatCardIdByName(testFlatName);

      // Verify flat card was found
      expect(flatId).not.toBeNull();
      expect(flatId).toBeTruthy();

      if (flatId) {
        // Verify flat card is visible
        const flatCard = dashboard.getFlatCard(flatId);
        await expect(flatCard).toBeVisible();

        // Verify flat name on card
        const cardName = dashboard.getFlatCardName(flatId);
        await expect(cardName).toBeVisible();
        await expect(cardName).toHaveText(testFlatName);

        // Verify flat address on card
        const cardAddress = dashboard.getFlatCardAddress(flatId);
        await expect(cardAddress).toBeVisible();
        await expect(cardAddress).toHaveText(testFlatAddress);

        // Verify status is "Paid"
        const cardStatus = dashboard.getFlatCardStatus(flatId);
        await expect(cardStatus).toBeVisible();
        await expect(cardStatus).toHaveText("Paid");

        // Verify total debt is "0,00 zł" or "0.00 zł"
        const cardDebt = dashboard.getFlatCardTotalDebt(flatId);
        await expect(cardDebt).toBeVisible();
        const debtText = await cardDebt.textContent();
        expect(debtText).toMatch(/0[,.]00\s*zł/i);
      }
    });
  });
});
