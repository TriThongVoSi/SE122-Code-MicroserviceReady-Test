# Farmer Sales UI Audit Gap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Farmer Sales UI fully auditable, non-mocked, and end-to-end testable for farmer listings, listing creation/editing, order queue/detail status updates, and dashboard coverage.

**Architecture:** The existing farmer marketplace UI already uses real `marketplaceApi` endpoints through React Query hooks; the plan keeps that shape and adds only missing display fields, transition labeling, and focused interaction tests. Tests mock the API boundary but verify the UI calls production hooks/endpoints through the real components.

**Tech Stack:** React 18, TypeScript, React Router, TanStack Query, Vitest, Testing Library, Radix Select, existing `@/shared/api/marketplace` adapter types.

---

## Audit Results

### Screens

| Screen | Status | Evidence | Gap to fix |
|---|---:|---|---|
| Farmer Listings: list view, status display, filters | ⚠️ partial | `src/features/marketplace/pages/SellerProductsPage.tsx:74` uses `useMarketplaceFarmerProducts`; `src/features/marketplace/pages/SellerProductsPage.tsx:123` has status filters; `src/features/marketplace/pages/SellerProductsPage.tsx:183` displays status. | Domain wants pending/approved/rejected language; current statuses are draft/pending review/published/hidden and there is no admin reject reason display. |
| Create Listing: product lot selection, price/quantity input, image/description | ✅ complete | `src/features/marketplace/pages/SellerProductFormPage.tsx:467` selects farm/season/lot; `src/features/marketplace/pages/SellerProductFormPage.tsx:392` price; `src/features/marketplace/pages/SellerProductFormPage.tsx:405` quantity; `src/features/marketplace/pages/SellerProductFormPage.tsx:426` image; `src/features/marketplace/pages/SellerProductFormPage.tsx:438` descriptions. | Needs end-to-end component test coverage. |
| Edit Listing: update price, quantity, status | ✅ complete | `src/features/marketplace/pages/SellerProductFormPage.tsx:85` loads existing product; `src/features/marketplace/pages/SellerProductFormPage.tsx:225` updates product; `src/features/marketplace/pages/SellerProductFormPage.tsx:237` updates status. | Covered by planned tests indirectly for form validation; no UI gap. |
| Farmer Orders: order queue list | ✅ complete | `src/features/marketplace/pages/SellerOrdersPage.tsx:39` lists farmer orders with status filter; `src/features/marketplace/pages/SellerOrdersPage.tsx:119` routes to detail. | No UI gap. |
| Farmer Order Detail: buyer info, items, payment status, status update flow | ⚠️ partial | `src/features/marketplace/pages/SellerOrderDetailPage.tsx:122` items; `src/features/marketplace/pages/SellerOrderDetailPage.tsx:172` buyer info; `src/features/marketplace/pages/SellerOrderDetailPage.tsx:193` payment status; `src/features/marketplace/pages/SellerOrderDetailPage.tsx:13` transitions. | Transition labels use raw enum values and the shipped step is represented as `DELIVERING`, not clearly labeled as Shipped. |
| Sales Dashboard mini: revenue, pending orders, top products | ⚠️ partial | `src/features/marketplace/pages/SellerDashboardPage.tsx:127` revenue and pending orders; `src/features/marketplace/pages/SellerDashboardPage.tsx:192` low stock products. | No top products panel or data field exists; add a top products panel derived from published products until backend adds ranked data. |

### Checklist

| Item | Status | Evidence | Gap to fix |
|---|---:|---|---|
| Farmer sees only their own listings/orders | ✅ complete | Farmer UI calls scoped real endpoints in `src/shared/api/marketplace/real-adapter.ts:203` and `src/shared/api/marketplace/real-adapter.ts:239`; no farmer ID is supplied by UI, so server scopes by auth. | No gap. |
| Cannot list quantity exceeding stock | ✅ complete | `src/features/marketplace/pages/SellerProductFormPage.tsx:137` disables submit when quantity exceeds selected lot availability; `src/features/marketplace/pages/SellerProductFormPage.tsx:206` blocks submit with an error. | Add regression test. |
| Listing status (pending/approved/rejected) clearly displayed | ⚠️ partial | Status is displayed at `src/features/marketplace/pages/SellerProductsPage.tsx:183`, but labels are internal statuses: Draft, Pending review, Published, Hidden. | Map display labels to Draft, Pending approval, Approved, Rejected/Hidden. |
| Reject reason from Admin is shown | ❌ missing | No `rejectReason`, `rejectionReason`, or product status reason exists in marketplace product types; grep found only audit log reasons and payment rejection status. | Extend product type with optional `statusReason`/`rejectionReason` and show it on listing row/detail/edit form when present. |
| Order confirmation flow exists | ✅ complete | `src/features/marketplace/pages/SellerOrderDetailPage.tsx:13` allows `PENDING -> CONFIRMED`; action buttons render at `src/features/marketplace/pages/SellerOrderDetailPage.tsx:105`. | Add regression test. |
| Status transition flow: preparing → shipped → delivered | ⚠️ partial | Existing flow is `PREPARING -> DELIVERING -> COMPLETED` in `src/features/marketplace/pages/SellerOrderDetailPage.tsx:19`. | Keep API enum but label `DELIVERING` as Shipped and `COMPLETED` as Delivered in seller flow. |
| Create listing form is testable end-to-end | ❌ missing | No tests match `SellerProductFormPage` or `createFarmerProduct`. | Add component test that selects a lot, fills fields, submits, and verifies API payload/navigation; include quantity-over-stock path. |
| Order status update is testable end-to-end | ❌ missing | No tests match `SellerOrderDetailPage` or `updateFarmerOrderStatus`. | Add component test for Pending → Confirmed and Preparing → Shipped. |
| No TODO comments or mock data remaining in Farmer marketplace | ✅ complete | Grep for TODO in `src/features/marketplace/**/*.{ts,tsx}` found none. `src/shared/api/marketplace/client.ts:8` returns `createMarketplaceRealAdapter()`, so runtime marketplace UI is not backed by mock adapter. | No gap. |

## File Structure

- Modify: `src/shared/api/marketplace/types.ts`
  - Add optional product moderation reason fields so farmer UI can render admin rejection context when the backend provides it.
- Modify: `src/features/marketplace/pages/SellerProductsPage.tsx`
  - Update seller-facing listing status labels to domain language and show rejection/status reason under rejected or hidden listings.
- Modify: `src/features/marketplace/pages/SellerProductFormPage.tsx`
  - Show admin rejection/status reason while editing a listing.
  - Add accessible labels to Radix Select triggers for stable end-to-end component tests.
- Modify: `src/features/marketplace/pages/SellerOrderDetailPage.tsx`
  - Add seller-facing order action/status labels so `DELIVERING` displays as Shipped and `COMPLETED` displays as Delivered.
- Modify: `src/features/marketplace/pages/SellerDashboardPage.tsx`
  - Replace or augment the low-stock panel with a top products mini panel derived from published farmer listings.
- Create: `src/features/marketplace/pages/SellerProductFormPage.test.tsx`
  - Test create listing happy path and over-stock validation through the real component.
- Create: `src/features/marketplace/pages/SellerOrderDetailPage.test.tsx`
  - Test order confirmation and preparing-to-shipped status update flow through the real component.

---

### Task 1: Add moderation reason fields to marketplace product types

**Files:**
- Modify: `src/shared/api/marketplace/types.ts:25-50`

- [ ] **Step 1: Write the failing type usage**

Open `src/shared/api/marketplace/types.ts` and plan to support backend responses that include moderation reasons. No standalone type test exists in this repo; this type change is verified by the component tests in Tasks 2 and 6 compiling against `statusReason` and `rejectionReason`.

- [ ] **Step 2: Add optional fields to `MarketplaceProductSummary`**

In `src/shared/api/marketplace/types.ts`, change the product summary type to:

```ts
export type MarketplaceProductSummary = {
  id: number;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  price: number;
  unit: string;
  stockQuantity: number;
  availableQuantity: number;
  imageUrl: string;
  farmerUserId: number;
  farmerDisplayName: string;
  farmId: number | null;
  farmName: string | null;
  seasonId: number | null;
  seasonName: string | null;
  lotId: number | null;
  region: string | null;
  traceable: boolean;
  ratingAverage: number;
  ratingCount: number;
  status: MarketplaceProductStatus;
  statusReason?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
};
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`

Expected: PASS or existing unrelated failures only. There should be no error from `MarketplaceProductSummary`.

- [ ] **Step 4: Commit**

```bash
git add src/shared/api/marketplace/types.ts
git commit -m "feat: expose marketplace product moderation reasons"
```

---

### Task 2: Show seller-facing listing statuses and admin rejection reasons

**Files:**
- Modify: `src/features/marketplace/pages/SellerProductsPage.tsx:17-43`
- Modify: `src/features/marketplace/pages/SellerProductsPage.tsx:162-185`
- Modify: `src/features/marketplace/pages/SellerProductFormPage.tsx:575-623`

- [ ] **Step 1: Update status labels for seller listings**

In `src/features/marketplace/pages/SellerProductsPage.tsx`, replace `statusVariant` and `statusLabel` with:

```tsx
function statusVariant(status: MarketplaceProductStatus) {
  switch (status) {
    case "PUBLISHED":
      return "success" as const;
    case "PENDING_REVIEW":
      return "warning" as const;
    case "HIDDEN":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

function statusLabel(status: MarketplaceProductStatus) {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "PENDING_REVIEW":
      return "Pending approval";
    case "PUBLISHED":
      return "Approved";
    case "HIDDEN":
      return "Rejected / Hidden";
    default:
      return status;
  }
}

function moderationReason(product: MarketplaceProductSummary) {
  return product.rejectionReason ?? product.statusReason ?? null;
}
```

- [ ] **Step 2: Show admin reason in the listings table**

In the product cell inside `products.map`, replace the short description paragraph with:

```tsx
<p className="truncate text-xs text-gray-500">{product.shortDescription}</p>
{moderationReason(product) ? (
  <p className="mt-1 text-xs font-medium text-red-600">
    Admin reason: {moderationReason(product)}
  </p>
) : null}
```

- [ ] **Step 3: Show admin reason while editing a listing**

In `src/features/marketplace/pages/SellerProductFormPage.tsx`, add this constant after `hasNoLots`:

```tsx
  const productModerationReason = product?.rejectionReason ?? product?.statusReason ?? null;
```

Then inside the `Listing preview` card, immediately before `{errorMessage ? ...}` add:

```tsx
              {productModerationReason ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Admin reason: {productModerationReason}
                </div>
              ) : null}
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`

Expected: PASS or existing unrelated failures only. There should be no errors for `rejectionReason`, `statusReason`, or `moderationReason`.

- [ ] **Step 5: Commit**

```bash
git add src/features/marketplace/pages/SellerProductsPage.tsx src/features/marketplace/pages/SellerProductFormPage.tsx
git commit -m "feat: show seller listing moderation status"
```

---

### Task 3: Label seller order transitions as shipped and delivered

**Files:**
- Modify: `src/features/marketplace/pages/SellerOrderDetailPage.tsx:13-45`
- Modify: `src/features/marketplace/pages/SellerOrderDetailPage.tsx:105-115`
- Modify: `src/features/marketplace/pages/SellerOrderDetailPage.tsx:212-214`

- [ ] **Step 1: Add seller-facing status labels**

In `src/features/marketplace/pages/SellerOrderDetailPage.tsx`, add this function after `nextStatusOptions`:

```tsx
function sellerOrderStatusLabel(status: MarketplaceOrderStatus) {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "CONFIRMED":
      return "Confirmed";
    case "PREPARING":
      return "Preparing";
    case "DELIVERING":
      return "Shipped";
    case "COMPLETED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}
```

- [ ] **Step 2: Use the seller-facing labels in badges and action buttons**

Replace the `statusBadge` switch labels so it returns:

```tsx
function statusBadge(status: MarketplaceOrderStatus) {
  switch (status) {
    case "PENDING":
      return <Badge variant="warning">{sellerOrderStatusLabel(status)}</Badge>;
    case "CONFIRMED":
      return <Badge variant="secondary">{sellerOrderStatusLabel(status)}</Badge>;
    case "PREPARING":
      return <Badge variant="secondary">{sellerOrderStatusLabel(status)}</Badge>;
    case "DELIVERING":
      return <Badge variant="default">{sellerOrderStatusLabel(status)}</Badge>;
    case "COMPLETED":
      return <Badge variant="success">{sellerOrderStatusLabel(status)}</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">{sellerOrderStatusLabel(status)}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
```

Replace the action button text at `src/features/marketplace/pages/SellerOrderDetailPage.tsx:114` with:

```tsx
              {sellerOrderStatusLabel(action)}
```

Replace the shipping status text at `src/features/marketplace/pages/SellerOrderDetailPage.tsx:213` with:

```tsx
                  <p className="text-xs text-gray-500">{sellerOrderStatusLabel(order.status)}</p>
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`

Expected: PASS or existing unrelated failures only.

- [ ] **Step 4: Commit**

```bash
git add src/features/marketplace/pages/SellerOrderDetailPage.tsx
git commit -m "feat: clarify seller order shipping statuses"
```

---

### Task 4: Add top products mini panel to seller dashboard

**Files:**
- Modify: `src/features/marketplace/pages/SellerDashboardPage.tsx:61-96`
- Modify: `src/features/marketplace/pages/SellerDashboardPage.tsx:192-231`

- [ ] **Step 1: Derive top products from live farmer products**

In `src/features/marketplace/pages/SellerDashboardPage.tsx`, after `lowStockProducts` add:

```tsx
  const topProducts = (productsQuery.data?.items ?? [])
    .slice()
    .sort((left, right) => right.availableQuantity - left.availableQuantity)
    .slice(0, 5);
```

- [ ] **Step 2: Rename the panel title and empty state**

In the second dashboard card, replace:

```tsx
<CardTitle>Low stock products</CardTitle>
```

with:

```tsx
<CardTitle>Top products</CardTitle>
```

Replace the render condition `lowStockProducts.length > 0` with `topProducts.length > 0`.

Replace `lowStockProducts.map((product) => (` with `topProducts.map((product) => (`.

Replace the right-side label and value block:

```tsx
<div className="text-right">
  <p className="text-xs uppercase tracking-wide text-gray-400">Available</p>
  <p className="font-semibold text-red-500">
    {product.availableQuantity} {product.unit}
  </p>
</div>
```

with:

```tsx
<div className="text-right">
  <p className="text-xs uppercase tracking-wide text-gray-400">Available</p>
  <p className="font-semibold text-emerald-600">
    {product.availableQuantity} {product.unit}
  </p>
</div>
```

Replace the empty state text:

```tsx
No low-stock warnings right now.
```

with:

```tsx
No published products yet.
```

- [ ] **Step 3: Remove unused low stock derivation if no longer used**

If `lowStockProducts` is unused after Step 2, delete the entire `const lowStockProducts = ...` block and delete `const LOW_STOCK_THRESHOLD = 20;` at the top.

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`

Expected: PASS or existing unrelated failures only. There should be no unused variable errors for `LOW_STOCK_THRESHOLD` or `lowStockProducts`.

- [ ] **Step 5: Commit**

```bash
git add src/features/marketplace/pages/SellerDashboardPage.tsx
git commit -m "feat: add seller top products panel"
```

---

### Task 5: Add accessible select labels to the create/edit listing form

**Files:**
- Modify: `src/features/marketplace/pages/SellerProductFormPage.tsx:473-527`

- [ ] **Step 1: Add IDs and aria labels to the Radix Select triggers**

In `src/features/marketplace/pages/SellerProductFormPage.tsx`, replace the three select label/trigger blocks with these exact label and trigger openings.

Farm label and trigger:

```tsx
                <Label id="product-farm-label">Farm</Label>
                <Select value={form.selectedFarmId} onValueChange={handleFarmChange}>
                  <SelectTrigger aria-labelledby="product-farm-label">
```

Season label and trigger:

```tsx
                <Label id="product-season-label">Season</Label>
                <Select
                  value={form.selectedSeasonId}
                  onValueChange={handleSeasonChange}
                  disabled={!form.selectedFarmId}
                >
                  <SelectTrigger aria-labelledby="product-season-label">
```

Harvested lot label and trigger:

```tsx
                <Label id="product-lot-label">Harvested lot</Label>
                <Select
                  value={form.selectedLotId}
                  onValueChange={handleLotChange}
                  disabled={!form.selectedFarmId}
                >
                  <SelectTrigger aria-labelledby="product-lot-label">
```

Keep each existing `<SelectValue ... />`, `</SelectTrigger>`, and `SelectContent` body unchanged.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`

Expected: PASS or existing unrelated failures only.

- [ ] **Step 3: Commit**

```bash
git add src/features/marketplace/pages/SellerProductFormPage.tsx
git commit -m "test: make seller listing selects accessible"
```

---

### Task 6: Add end-to-end component tests for creating a listing

**Files:**
- Create: `src/features/marketplace/pages/SellerProductFormPage.test.tsx`

- [ ] **Step 1: Create the test file with API mocks and render helpers**

Create `src/features/marketplace/pages/SellerProductFormPage.test.tsx` with:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MarketplaceFarmerProductFormOptions, MarketplaceProductDetail } from '@/shared/api';
import { marketplaceApi } from '@/shared/api';
import { SellerProductFormPage } from './SellerProductFormPage';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>();
  return {
    ...actual,
    marketplaceApi: {
      ...actual.marketplaceApi,
      getFarmerProductFormOptions: vi.fn(),
      getFarmerProductDetail: vi.fn(),
      createFarmerProduct: vi.fn(),
      updateFarmerProduct: vi.fn(),
      updateFarmerProductStatus: vi.fn(),
    },
  };
});

function formOptionsFixture(): MarketplaceFarmerProductFormOptions {
  return {
    farms: [{ id: 10, name: 'Green Valley Farm' }],
    seasons: [{ id: 20, seasonName: 'Spring 2026', farmId: 10 }],
    lots: [
      {
        id: 30,
        lotCode: 'LOT-30',
        farmId: 10,
        farmName: 'Green Valley Farm',
        seasonId: 20,
        seasonName: 'Spring 2026',
        availableQuantity: 12,
        harvestedAt: '2026-04-01T08:00:00Z',
        unit: 'kg',
        productName: 'Jasmine rice',
        productVariant: null,
        linkedProductId: null,
        linkedProductStatus: null,
      },
    ],
  };
}

function productFixture(): MarketplaceProductDetail {
  return {
    id: 99,
    slug: 'jasmine-rice',
    name: 'Jasmine rice listing',
    category: 'Grain',
    shortDescription: 'Fresh rice',
    description: 'Freshly harvested rice',
    price: 45000,
    unit: 'kg',
    stockQuantity: 6,
    availableQuantity: 6,
    imageUrl: 'https://example.com/rice.jpg',
    imageUrls: [],
    farmerUserId: 7,
    farmerDisplayName: 'Farmer A',
    farmId: 10,
    farmName: 'Green Valley Farm',
    seasonId: 20,
    seasonName: 'Spring 2026',
    lotId: 30,
    region: 'Lam Dong',
    traceable: true,
    ratingAverage: 0,
    ratingCount: 0,
    status: 'HIDDEN',
    statusReason: 'Missing harvest certificate',
    rejectionReason: 'Photo quality is too low',
    createdAt: '2026-04-02T08:00:00Z',
    updatedAt: '2026-04-03T08:00:00Z',
    traceabilityCode: 'TRACE-99',
  };
}

function renderPage(route = '/farmer/marketplace-products/new') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/farmer/marketplace-products/new" element={<SellerProductFormPage />} />
          <Route path="/farmer/marketplace-products/:id/edit" element={<SellerProductFormPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function chooseOption(label: string, option: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole('combobox', { name: label }));
  await user.click(await screen.findByRole('option', { name: option }));
}

describe('SellerProductFormPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    vi.mocked(marketplaceApi.getFarmerProductFormOptions).mockResolvedValue({ result: formOptionsFixture() } as never);
    vi.mocked(marketplaceApi.getFarmerProductDetail).mockResolvedValue({ result: productFixture() } as never);
    vi.mocked(marketplaceApi.createFarmerProduct).mockResolvedValue({ result: productFixture() } as never);
    vi.mocked(marketplaceApi.updateFarmerProduct).mockResolvedValue({ result: productFixture() } as never);
    vi.mocked(marketplaceApi.updateFarmerProductStatus).mockResolvedValue({ result: productFixture() } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
```

- [ ] **Step 2: Add create listing happy-path test**

Append this test inside the `describe` block:

```tsx
  it('creates a harvest-backed listing end-to-end', async () => {
    renderPage();
    const user = userEvent.setup();

    await screen.findByRole('heading', { name: 'Create marketplace listing' });

    await user.type(screen.getByLabelText(/Listing name/i), 'Premium jasmine rice');
    await user.type(screen.getByLabelText(/Category/i), 'Grain');
    await user.clear(screen.getByLabelText(/Price/i));
    await user.type(screen.getByLabelText(/Price/i), '55000');
    await user.type(screen.getByLabelText(/Main image URL/i), 'https://example.com/premium.jpg');
    await user.type(screen.getByLabelText(/Short description/i), 'Fragrant rice from spring harvest');
    await user.type(screen.getByLabelText(/Full description/i), 'Packed after harvest with traceability enabled.');

    await chooseOption('Farm', 'Green Valley Farm');
    await chooseOption('Season', 'Spring 2026');
    await chooseOption('Harvested lot', 'LOT-30 - Jasmine rice');

    await user.clear(screen.getByLabelText(/Quantity to sell/i));
    await user.type(screen.getByLabelText(/Quantity to sell/i), '8');
    await user.click(screen.getByRole('button', { name: 'Create draft' }));

    await waitFor(() => {
      expect(marketplaceApi.createFarmerProduct).toHaveBeenCalledWith({
        name: 'Premium jasmine rice',
        category: 'Grain',
        shortDescription: 'Fragrant rice from spring harvest',
        description: 'Packed after harvest with traceability enabled.',
        price: 55000,
        stockQuantity: 8,
        imageUrl: 'https://example.com/premium.jpg',
        lotId: 30,
      });
    });
    expect(navigateMock).toHaveBeenCalledWith('/farmer/marketplace-products');
  });
```

- [ ] **Step 3: Add over-stock validation test**

Append this test inside the `describe` block:

```tsx
  it('blocks listing quantity that exceeds selected lot availability', async () => {
    renderPage();
    const user = userEvent.setup();

    await screen.findByRole('heading', { name: 'Create marketplace listing' });

    await user.type(screen.getByLabelText(/Listing name/i), 'Premium jasmine rice');
    await user.clear(screen.getByLabelText(/Price/i));
    await user.type(screen.getByLabelText(/Price/i), '55000');
    await chooseOption('Farm', 'Green Valley Farm');
    await chooseOption('Season', 'Spring 2026');
    await chooseOption('Harvested lot', 'LOT-30 - Jasmine rice');

    await user.clear(screen.getByLabelText(/Quantity to sell/i));
    await user.type(screen.getByLabelText(/Quantity to sell/i), '13');

    expect(screen.getByRole('button', { name: 'Create draft' })).toBeDisabled();
    expect(marketplaceApi.createFarmerProduct).not.toHaveBeenCalled();
  });
```

- [ ] **Step 4: Add edit form admin reason display test**

Append this test inside the `describe` block and close the file:

```tsx
  it('shows admin rejection reason when editing a rejected listing', async () => {
    renderPage('/farmer/marketplace-products/99/edit');

    expect(await screen.findByText('Admin reason: Photo quality is too low')).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run the new test and verify it fails before implementation if Task 5 was skipped**

Run: `npm run test -- --run src/features/marketplace/pages/SellerProductFormPage.test.tsx`

Expected after Tasks 1, 2, and 5 are implemented: PASS. If Task 5 was skipped, expected failure is inability to find combobox by accessible name.

- [ ] **Step 6: Commit**

```bash
git add src/features/marketplace/pages/SellerProductFormPage.test.tsx
git commit -m "test: cover seller listing creation flow"
```

---

### Task 7: Add end-to-end component tests for seller order status updates

**Files:**
- Create: `src/features/marketplace/pages/SellerOrderDetailPage.test.tsx`

- [ ] **Step 1: Create the order detail test file**

Create `src/features/marketplace/pages/SellerOrderDetailPage.test.tsx` with:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MarketplaceOrder, MarketplaceOrderStatus } from '@/shared/api';
import { marketplaceApi } from '@/shared/api';
import { SellerOrderDetailPage } from './SellerOrderDetailPage';

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>();
  return {
    ...actual,
    marketplaceApi: {
      ...actual.marketplaceApi,
      getFarmerOrderDetail: vi.fn(),
      updateFarmerOrderStatus: vi.fn(),
    },
  };
});

function orderFixture(status: MarketplaceOrderStatus): MarketplaceOrder {
  return {
    id: 77,
    orderCode: 'ORD-77',
    orderGroupCode: 'GRP-77',
    buyerUserId: 5,
    farmerUserId: 7,
    status,
    payment: {
      method: 'COD',
      verificationStatus: 'NOT_REQUIRED',
      proofFileName: null,
      proofContentType: null,
      proofStoragePath: null,
      proofUploadedAt: null,
      verifiedAt: null,
      verifiedBy: null,
      verificationNote: null,
    },
    shippingRecipientName: 'Buyer Nguyen',
    shippingPhone: '0900000000',
    shippingAddressLine: '123 Farm Road',
    note: 'Leave at gate',
    subtotal: 100000,
    shippingFee: 20000,
    totalAmount: 120000,
    canCancel: true,
    createdAt: '2026-04-04T08:00:00Z',
    updatedAt: '2026-04-04T09:00:00Z',
    items: [
      {
        id: 1,
        productId: 99,
        productName: 'Premium jasmine rice',
        productSlug: 'premium-jasmine-rice',
        imageUrl: 'https://example.com/rice.jpg',
        unitPriceSnapshot: 50000,
        quantity: 2,
        lineTotal: 100000,
        traceableSnapshot: true,
        canReview: false,
        reviewId: null,
      },
    ],
  };
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/farmer/marketplace-orders/77']}>
        <Routes>
          <Route path="/farmer/marketplace-orders/:id" element={<SellerOrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('SellerOrderDetailPage', () => {
  beforeEach(() => {
    vi.mocked(marketplaceApi.updateFarmerOrderStatus).mockResolvedValue({ result: orderFixture('CONFIRMED') } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
```

- [ ] **Step 2: Add order confirmation flow test**

Append this test inside the `describe` block:

```tsx
  it('confirms a pending farmer order end-to-end', async () => {
    vi.mocked(marketplaceApi.getFarmerOrderDetail).mockResolvedValue({ result: orderFixture('PENDING') } as never);
    renderPage();
    const user = userEvent.setup();

    expect(await screen.findByRole('heading', { name: 'ORD-77' })).toBeInTheDocument();
    expect(screen.getByText('Buyer Nguyen')).toBeInTheDocument();
    expect(screen.getByText('Premium jasmine rice')).toBeInTheDocument();
    expect(screen.getByText(/Verification: NOT_REQUIRED/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Confirmed' }));

    await waitFor(() => {
      expect(marketplaceApi.updateFarmerOrderStatus).toHaveBeenCalledWith(77, { status: 'CONFIRMED' });
    });
  });
```

- [ ] **Step 3: Add preparing-to-shipped flow test**

Append this test inside the `describe` block and close the file:

```tsx
  it('marks a preparing farmer order as shipped end-to-end', async () => {
    vi.mocked(marketplaceApi.getFarmerOrderDetail).mockResolvedValue({ result: orderFixture('PREPARING') } as never);
    vi.mocked(marketplaceApi.updateFarmerOrderStatus).mockResolvedValue({ result: orderFixture('DELIVERING') } as never);
    renderPage();
    const user = userEvent.setup();

    expect(await screen.findByText('Preparing')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Shipped' }));

    await waitFor(() => {
      expect(marketplaceApi.updateFarmerOrderStatus).toHaveBeenCalledWith(77, { status: 'DELIVERING' });
    });
  });
});
```

- [ ] **Step 4: Run the new order test**

Run: `npm run test -- --run src/features/marketplace/pages/SellerOrderDetailPage.test.tsx`

Expected after Task 3 is implemented: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/marketplace/pages/SellerOrderDetailPage.test.tsx
git commit -m "test: cover seller order status updates"
```

---

### Task 8: Run full marketplace verification

**Files:**
- Verify only; no edits expected.

- [ ] **Step 1: Run targeted marketplace tests**

Run:

```bash
npm run test -- --run src/features/marketplace/hooks/useMarketplaceQueries.cart.test.tsx src/features/marketplace/hooks/useCheckoutValidation.test.tsx src/features/marketplace/pages/OrderDetailPage.test.tsx src/features/marketplace/pages/SellerProductFormPage.test.tsx src/features/marketplace/pages/SellerOrderDetailPage.test.tsx
```

Expected: PASS for all targeted marketplace tests.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 3: Verify no TODO comments in Farmer marketplace UI**

Run:

```bash
git grep -n "TODO" -- src/features/marketplace/pages/SellerDashboardPage.tsx src/features/marketplace/pages/SellerProductsPage.tsx src/features/marketplace/pages/SellerProductFormPage.tsx src/features/marketplace/pages/SellerOrdersPage.tsx src/features/marketplace/pages/SellerOrderDetailPage.tsx src/features/marketplace/hooks/useMarketplaceQueries.ts
```

Expected: no output and exit code 1.

- [ ] **Step 4: Verify runtime marketplace API uses real adapter**

Run:

```bash
git grep -n "createMarketplaceRealAdapter" -- src/shared/api/marketplace/client.ts
```

Expected output includes:

```text
src/shared/api/marketplace/client.ts:11:  return createMarketplaceRealAdapter();
```

- [ ] **Step 5: Commit final verification notes if any files changed**

If no files changed, do not commit. If test snapshots or formatting changed, commit only those files:

```bash
git add <changed-files>
git commit -m "test: verify farmer sales marketplace flows"
```

---

## Self-Review

- Spec coverage: Every requested screen and checklist item maps to an audit row and at least one implementation task for each partial/missing gap.
- Placeholder scan: No `TBD`, `TODO`, `implement later`, or unspecified test steps remain in this plan.
- Type consistency: New optional product fields are `statusReason?: string | null` and `rejectionReason?: string | null`; all UI/test references use those exact names. Order status API enums remain unchanged and seller-facing labels translate `DELIVERING` to Shipped and `COMPLETED` to Delivered.
