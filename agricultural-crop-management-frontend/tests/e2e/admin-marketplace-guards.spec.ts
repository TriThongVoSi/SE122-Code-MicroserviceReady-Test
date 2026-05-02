import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@acm.local";
const ADMIN_PASSWORD = "12345678";
const FARMER_EMAIL = "farmer@acm.local";
const FARMER_PASSWORD = "12345678";

test.describe("Admin Marketplace Role Guards", () => {
  test("admin user can access marketplace admin routes", async ({ page }) => {
    // Login as admin
    await page.goto("/sign-in");
    await page.fill("#email", ADMIN_EMAIL);
    await page.fill("#password", ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect after login
    await page.waitForURL(/\/admin/, { timeout: 30000 });

    // Navigate to marketplace dashboard
    await page.goto("/admin/marketplace-dashboard");
    await expect(page).toHaveURL("/admin/marketplace-dashboard");
    await expect(page.locator("h1")).toContainText("Marketplace dashboard");

    // Navigate to marketplace products
    await page.goto("/admin/marketplace-products");
    await expect(page).toHaveURL("/admin/marketplace-products");
    await expect(page.locator("h1")).toContainText("Moderate marketplace products");

    // Navigate to marketplace orders
    await page.goto("/admin/marketplace-orders");
    await expect(page).toHaveURL("/admin/marketplace-orders");
    await expect(page.locator("h1")).toContainText("Manage marketplace orders");
  });

  test("non-admin user cannot access marketplace admin routes", async ({ page }) => {
    // Login as farmer
    await page.goto("/sign-in");
    await page.fill("#email", FARMER_EMAIL);
    await page.fill("#password", FARMER_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect after login
    await page.waitForURL(/\/farmer/, { timeout: 30000 });

    // Attempt to navigate to admin marketplace routes
    await page.goto("/admin/marketplace-dashboard");

    // Should be redirected away from admin routes
    await expect(page).not.toHaveURL("/admin/marketplace-dashboard");

    // Should see unauthorized or redirect to appropriate page
    const url = page.url();
    expect(url).toMatch(/\/(sign-in|farmer|unauthorized)/);
  });

  test("unauthenticated user cannot access marketplace admin routes", async ({ page }) => {
    // Attempt to navigate to admin marketplace routes without login
    await page.goto("/admin/marketplace-products");

    // Should be redirected to signin
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
