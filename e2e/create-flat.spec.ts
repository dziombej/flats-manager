import { test, expect } from "./fixtures/test";
import { HeaderNavigationPage, FlatFormPage, FlatDetailPage, DashboardPage } from "./page-objects";

/**
 * E2E Test: Create Flat Flow
 * Tests the complete flow of creating a new flat and verifying it on dashboard
 */
test.describe("Create Flat Flow", () => {
  test("should create a new flat and verify it appears on dashboard", async ({ authenticatedPage: page }) => {
    // Arrange
    const headerNav = new HeaderNavigationPage(page);
    const flatForm = new FlatFormPage(page);
    const flatDetail = new FlatDetailPage(page);
    const dashboard = new DashboardPage(page);

    const testFlatName = "NazwaTest";
    const testFlatAddress = "TestowyAdres 54";

    // Navigate to dashboard (assuming user is already logged in)
    await dashboard.goto();

    // Act - Step 1: Click "Add Flat" button
    await headerNav.goToAddFlat();

    // Verify form is visible
    await expect(flatForm.form).toBeVisible();

    // Act - Step 2: Fill in the form
    await flatForm.fillForm(testFlatName, testFlatAddress);

    // Act - Step 3: Submit the form
    await flatForm.submit();

    // Assert - Step 4: Verify redirect to flat detail page
    await page.waitForURL(/\/flats\/[a-f0-9-]+$/);

    // Assert - Step 5: Verify flat details
    await expect(flatDetail.name).toHaveText(testFlatName);
    await expect(flatDetail.address).toHaveText(testFlatAddress);
    await expect(flatDetail.editButton).toBeVisible();
    await expect(flatDetail.deleteButton).toBeVisible();

    // Verify statistics
    const totalDebt = await flatDetail.getTotalDebt();
    expect(totalDebt).toMatch(/0[,.]00\s*zł/);

    // Act - Step 6: Navigate back to dashboard
    await headerNav.goToDashboard();

    // Assert - Step 7: Verify flat card exists on dashboard
    await dashboard.waitForLoad();

    // Find the flat card by name
    const flatId = await dashboard.findFlatCardIdByName(testFlatName);
    expect(flatId).not.toBeNull();

    if (flatId) {
      await expect(dashboard.getFlatCardName(flatId)).toHaveText(testFlatName);
      await expect(dashboard.getFlatCardStatus(flatId)).toHaveText("Paid");

      const totalDebtText = await dashboard.getFlatCardTotalDebt(flatId).textContent();
      expect(totalDebtText).toMatch(/0[,.]00\s*zł/);
    }
  });

  test("should validate required fields", async ({ authenticatedPage: page }) => {
    // Arrange
    const flatForm = new FlatFormPage(page);

    // Navigate to create flat page
    await flatForm.gotoCreate();

    // Assert - Form should not submit (button disabled for empty fields)
    const isDisabled = await flatForm.isSubmitDisabled();
    expect(isDisabled).toBe(true);
  });

  test("should allow canceling flat creation", async ({ authenticatedPage: page }) => {
    // Arrange
    const headerNav = new HeaderNavigationPage(page);
    const flatForm = new FlatFormPage(page);

    // Navigate to create flat page
    await flatForm.gotoCreate();

    // Fill in some data
    await flatForm.fillForm("Test Cancel", "Cancel Address");

    // Act - Click cancel
    await flatForm.cancel();

    // Assert - Should redirect to flats list
    await page.waitForURL("**/flats");
  });
});

/**
 * E2E Test: Edit and Delete Flat Flow
 */
test.describe("Edit and Delete Flat Flow", () => {
  let createdFlatId: string;

  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Create a test flat before each test
    const flatForm = new FlatFormPage(page);

    await flatForm.gotoCreate();
    await flatForm.createFlat("Test Flat for Edit", "Edit Test Address 123");

    // Wait for redirect and capture flat ID
    await page.waitForURL(/\/flats\/([a-f0-9-]+)$/);
    const url = page.url();
    const match = url.match(/\/flats\/([a-f0-9-]+)$/);
    createdFlatId = match ? match[1] : "";
  });

  test("should edit a flat successfully", async ({ authenticatedPage: page }) => {
    // Arrange
    const headerNav = new HeaderNavigationPage(page);
    const flatDetail = new FlatDetailPage(page);
    const flatForm = new FlatFormPage(page);

    await flatDetail.goto(createdFlatId);

    // Act - Click edit button
    await flatDetail.clickEdit();

    // Update the flat details
    const updatedName = "Updated Flat Name";
    const updatedAddress = "Updated Address 456";

    // Fill the form
    await flatForm.fillForm(updatedName, updatedAddress);

    // Wait for form to be valid and button enabled
    await page.waitForTimeout(500);

    // Submit the form
    await flatForm.submit();

    // Assert - Wait for success message to appear (it disappears after 3s)
    await expect(flatForm.successMessage).toBeVisible({ timeout: 5000 });

    // Navigate back to detail page to verify changes
    await headerNav.goToDashboard();
    await page.goto(`/flats/${createdFlatId}`);

    // Assert - Verify the flat details were updated
    await expect(flatDetail.name).toHaveText(updatedName);
    await expect(flatDetail.address).toHaveText(updatedAddress);
  });

  test("should delete a flat successfully", async ({ authenticatedPage: page }) => {
    // Arrange
    const flatDetail = new FlatDetailPage(page);
    const dashboard = new DashboardPage(page);

    await flatDetail.goto(createdFlatId);

    // Act - Click delete button
    await flatDetail.clickDelete();

    // Verify dialog appears
    await expect(flatDetail.deleteDialog).toBeVisible();

    // Confirm deletion
    await flatDetail.confirmDelete();

    // Assert - Should redirect to dashboard
    await page.waitForURL("**/dashboard**");

    // Verify flat no longer exists on dashboard
    const hasCard = await dashboard.hasFlatCard(createdFlatId);
    expect(hasCard).toBe(false);
  });

  test("should cancel flat deletion", async ({ authenticatedPage: page }) => {
    // Arrange
    const flatDetail = new FlatDetailPage(page);

    await flatDetail.goto(createdFlatId);

    // Act - Click delete button
    await flatDetail.clickDelete();

    // Cancel deletion
    await flatDetail.cancelDelete();

    // Assert - Dialog should be hidden and still on same page
    const isDialogVisible = await flatDetail.isDeleteDialogVisible();
    expect(isDialogVisible).toBe(false);
    expect(page.url()).toContain(createdFlatId);
  });
});
