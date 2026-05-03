# Buyer Marketplace E2E Test Setup

## Current State

**No E2E test framework is currently installed in this project.**

Verification command:
```bash
node -e "const p=require('./package.json'); const d={...p.dependencies,...p.devDependencies}; console.log(Boolean(d['@playwright/test']||d.cypress))"
# Output: false
```

## Recommended Framework: Playwright

We recommend **Playwright** for the following reasons:

1. **Modern architecture**: Built for modern web apps with native async/await support
2. **Multi-browser support**: Chromium, Firefox, and WebKit out of the box
3. **Auto-wait**: Automatically waits for elements to be actionable, reducing flaky tests
4. **Network interception**: Built-in request/response mocking and monitoring
5. **Parallel execution**: Fast test runs with worker-based parallelization
6. **TypeScript-first**: Excellent TypeScript support matching our codebase
7. **Developer experience**: Great debugging tools, trace viewer, and codegen
8. **Active maintenance**: Backed by Microsoft with frequent updates

## Installation Instructions

### Step 1: Install Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### Step 2: Add Scripts to package.json

Add the following scripts to your `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

### Step 3: Create Playwright Configuration

Create `playwright.config.ts` in the project root:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Buyer Marketplace Happy Path

The complete E2E test should cover the following 13-step flow:

### Test: Buyer Marketplace Happy Path

```typescript
// e2e/buyer-marketplace-happy-path.spec.ts

test('buyer can complete full purchase flow with bank transfer', async ({ page }) => {
  // 1. Sign in as buyer
  await page.goto('/auth/sign-in');
  await page.fill('input[name="email"]', 'buyer@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/marketplace');

  // 2. Navigate to Products page
  await page.click('a[href="/marketplace/products"]');
  await expect(page).toHaveURL('/marketplace/products');

  // 3. Search for "tomato"
  await page.fill('input[placeholder*="Search"]', 'tomato');
  await page.press('input[placeholder*="Search"]', 'Enter');
  await expect(page.locator('text=tomato').first()).toBeVisible();

  // 4. Click on first product
  await page.click('.product-card:first-child a');
  await expect(page).toHaveURL(/\/marketplace\/products\/.+/);

  // 5. Add to cart
  await page.click('button:has-text("Add to Cart")');
  await expect(page.locator('text=Added to cart')).toBeVisible();

  // 6. Navigate to cart
  await page.click('a[href="/marketplace/cart"]');
  await expect(page).toHaveURL('/marketplace/cart');

  // 7. Verify cart contains product
  await expect(page.locator('.cart-item')).toHaveCount(1);
  await expect(page.locator('text=tomato')).toBeVisible();

  // 8. Proceed to checkout
  await page.click('button:has-text("Proceed to Checkout")');
  await expect(page).toHaveURL('/marketplace/checkout');

  // 9. Select saved address (or create new)
  await page.click('select[name="addressId"]');
  await page.selectOption('select[name="addressId"]', { index: 1 });

  // 10. Select Bank Transfer payment method
  await page.click('input[value="BANK_TRANSFER"]');
  await expect(page.locator('input[value="BANK_TRANSFER"]')).toBeChecked();

  // 11. Place order
  await page.click('button:has-text("Place Order")');
  await expect(page).toHaveURL(/\/marketplace\/orders\/.+/);
  await expect(page.locator('text=Order placed successfully')).toBeVisible();

  // 12. Extract order ID from URL
  const orderUrl = page.url();
  const orderId = orderUrl.split('/').pop();

  // 13. Upload payment proof
  await page.setInputFiles('input[type="file"]', 'e2e/fixtures/payment-proof.jpg');
  await page.click('button:has-text("Upload Proof")');
  await expect(page.locator('text=Payment proof uploaded')).toBeVisible();
  await expect(page.locator('text=payment-proof.jpg')).toBeVisible();
});
```

## Backend Seed Requirements

For the E2E test to run successfully, the backend must be seeded with:

### 1. Test User Account
```json
{
  "email": "buyer@example.com",
  "password": "password123",
  "role": "BUYER",
  "status": "ACTIVE"
}
```

### 2. Test Farm
```json
{
  "name": "Green Valley Farm",
  "owner": "farmer@example.com",
  "status": "ACTIVE"
}
```

### 3. Test Product
```json
{
  "name": "Fresh Organic Tomato",
  "slug": "fresh-organic-tomato",
  "category": "VEGETABLES",
  "price": 25000,
  "unit": "kg",
  "stock": 100,
  "availableStock": 100,
  "status": "PUBLISHED",
  "farmId": "<farm-id-from-step-2>"
}
```

### 4. Test Address
```json
{
  "userId": "<buyer-user-id>",
  "recipientName": "John Doe",
  "recipientPhone": "0901234567",
  "province": "Ho Chi Minh City",
  "district": "District 1",
  "ward": "Ward 1",
  "street": "Nguyen Hue",
  "addressDetail": "123 Nguyen Hue Street",
  "label": "Home",
  "isDefault": true
}
```

### 5. Payment Proof Fixture
Create a test image file at `e2e/fixtures/payment-proof.jpg` (any valid JPEG image, minimum 1KB).

## Running the Tests

Once installed and configured:

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (recommended for development)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug a specific test
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

## Next Steps

1. Get approval for adding Playwright as a dev dependency
2. Install Playwright and create configuration
3. Set up backend seed script for test data
4. Implement the happy path test
5. Add additional test scenarios (error cases, edge cases)
6. Integrate E2E tests into CI/CD pipeline

## Notes

- This documentation was created as part of Task 6 in the buyer marketplace implementation plan
- No E2E framework has been installed yet - awaiting explicit approval for dependency changes
- The happy path test covers the complete buyer journey from sign-in to payment proof upload
- Backend seeding is critical for test reliability and should be automated
