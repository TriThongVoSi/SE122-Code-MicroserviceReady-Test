import { test, expect, type Page } from "@playwright/test";

const ADMIN_EMAIL = "admin@acm.local";
const ADMIN_PASSWORD = "12345678";
const FARMER_EMAIL = "farmer@acm.local";
const FARMER_PASSWORD = "12345678";

/**
 * Helper function to login as a user
 */
async function loginAs(page: Page, email: string, password: string, expectedRedirectPattern: RegExp) {
  await page.goto("/sign-in");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait for redirect after login
  await page.waitForURL(expectedRedirectPattern, { timeout: 30000 });
}

/**
 * Helper function to verify a route is accessible with expected heading
 */
async function verifyRouteAccess(page: Page, url: string, expectedHeading: string) {
  await page.goto(url);
  await expect(page).toHaveURL(url);
  await expect(page.getByRole("heading", { level: 1, name: new RegExp(expectedHeading, "i") })).toBeVisible();
}

test.describe("Admin Marketplace Role Guards", () => {
  test("admin user can access marketplace admin routes", async ({ page }) => {
    // Login as admin
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD, /\/admin/);

    // Verify access to all admin marketplace routes
    await verifyRouteAccess(page, "/admin/marketplace-dashboard", "Marketplace dashboard");
    await verifyRouteAccess(page, "/admin/marketplace-products", "Moderate marketplace products");
    await verifyRouteAccess(page, "/admin/marketplace-orders", "Manage marketplace orders");
  });

  test("non-admin user cannot access marketplace admin routes", async ({ page }) => {
    // Login as farmer
    await loginAs(page, FARMER_EMAIL, FARMER_PASSWORD, /\/farmer/);

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
