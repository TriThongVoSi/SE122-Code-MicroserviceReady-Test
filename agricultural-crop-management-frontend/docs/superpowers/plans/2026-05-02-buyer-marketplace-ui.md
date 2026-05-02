# Buyer Marketplace UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete and verify the Buyer Marketplace UI only, covering buyer screens, optimistic cart updates, buyer-only guards, validation, toasts, unit tests, and E2E setup documentation.

**Architecture:** Keep the current Marketplace feature structure and API adapter boundary. Add small buyer-focused helpers/hooks where tests need stable seams, and avoid touching Farmer/Admin pages except shared marketplace hooks used by Buyer cart/order flows. Treat the real API as authoritative; remove runtime mock selection from buyer-facing production paths.

**Tech Stack:** React 18, TypeScript, React Router, TanStack Query v5, Vitest, Testing Library, Zod, Sonner toasts, existing shared UI components.

---

## File Structure

- Modify: `src/app/routes.tsx` — apply buyer-only guards to protected buyer marketplace/profile routes.
- Modify: `src/shared/api/marketplace/client.ts` — remove runtime mock adapter selection from the app client.
- Modify: `src/shared/api/marketplace/index.ts` — stop exporting mock adapter from production API barrel.
- Keep: `src/shared/api/marketplace/mock-adapter.ts` — leave for explicit tests only; do not import it from runtime client.
- Modify: `src/features/marketplace/hooks/useMarketplaceQueries.ts` — add optimistic cart mutations and toast/error behavior for buyer mutations.
- Modify: `src/features/marketplace/hooks/useMarketplaceAddToCart.ts` — use query cache updates and success/error toasts.
- Create: `src/features/marketplace/hooks/useCheckoutValidation.ts` — focused hook for checkout/address/payment validation.
- Modify: `src/features/marketplace/pages/MarketHomePage.tsx` — replace mock fallback images, add empty states for featured lists, add search/sort/filter entry points that link to product list.
- Modify: `src/features/marketplace/pages/ProductListPage.tsx` — remove TODO/comment noise, add add-to-cart error handling toast if missing, verify loading/empty/error states.
- Modify: `src/features/marketplace/pages/ProductDetailPage.tsx` — remove DOM `innerHTML` fallback, use React image error state, add toast handling for cart action failures.
- Modify: `src/features/marketplace/pages/FarmListPage.tsx` — verify loading/error/empty states and no fallback mock images.
- Modify: `src/features/marketplace/pages/FarmDetailPage.tsx` — verify farm info, active listings, rating/empty states, no mock data.
- Modify: `src/features/marketplace/pages/CartPage.tsx` — group items by seller, show seller subtotals, use optimistic cart mutations, toasts, skeleton loading.
- Modify: `src/features/marketplace/pages/CheckoutPage.tsx` — use checkout validation hook, show split-order preview grouped by seller, toasts for address/order mutations.
- Modify: `src/features/marketplace/pages/MyOrdersPage.tsx` — verify list filters/status badges/loading/error/empty states.
- Modify: `src/features/marketplace/pages/OrderDetailPage.tsx` — add payment proof file validation, toasts for upload/review/cancel, explicit verification/reject status, seller display per item if available.
- Modify: `src/features/marketplace/pages/TraceabilityPage.tsx` — verify origin timeline loading/error/empty state.
- Modify: `src/features/buyer/profile/pages/AddressBookPage.tsx` — remove comments/TODO-style noise, add error state, skeletons, validation reuse if possible.
- Test: `src/features/marketplace/hooks/useMarketplaceQueries.cart.test.tsx` — cart hook and optimistic mutation behavior.
- Test: `src/features/marketplace/hooks/useCheckoutValidation.test.tsx` — checkout hook validation behavior.
- Test: `src/features/marketplace/pages/OrderDetailPage.test.tsx` — buyer order detail payment/review UI behavior.
- Create: `docs/superpowers/buyer-marketplace-e2e-setup.md` — E2E happy-path setup steps because no Playwright/Cypress dependency exists in `package.json`.

---

### Task 1: Runtime Mock Removal and Buyer Guards

**Files:**
- Modify: `src/shared/api/marketplace/client.ts`
- Modify: `src/shared/api/marketplace/index.ts`
- Modify: `src/app/routes.tsx`

- [ ] **Step 1: Write a failing guard/runtime test by inspection target**

No existing route unit harness exists. Use static checks after implementation in Step 4. Do not add a brittle route snapshot test.

- [ ] **Step 2: Remove runtime mock adapter selection**

Change `src/shared/api/marketplace/client.ts` to:

```ts
/// <reference types="vite/client" />

import type { MarketplaceApiAdapter } from './adapter';
import { createMarketplaceRealAdapter } from './real-adapter';

type MarketplaceClientOptions = Record<string, never>;

export function createMarketplaceApiClient(
  _options: MarketplaceClientOptions = {},
): MarketplaceApiAdapter {
  return createMarketplaceRealAdapter();
}

export const marketplaceApi = createMarketplaceApiClient();
```

Change `src/shared/api/marketplace/index.ts` so it does not export `createMarketplaceMockAdapter`. Keep exports for `adapter`, `client`, `contracts`, `real-adapter`, and `types`.

- [ ] **Step 3: Add buyer-only route guards**

In `src/app/routes.tsx`, change protected buyer routes under `/marketplace` from:

```tsx
<ProtectedRoute requireAuth>
  <CartPage />
</ProtectedRoute>
```

to:

```tsx
<ProtectedRoute requireAuth requiredRole="buyer">
  <CartPage />
</ProtectedRoute>
```

Apply the same `requiredRole="buyer"` to:

```tsx
<CartPage />
<CheckoutPage />
<MarketplaceMyOrdersPage />
<MarketplaceOrderDetailPage />
<BuyerProfileLayout />
```

Do not change public browsing routes (`/marketplace`, `/products`, `/products/:slug`, `/farms`, `/farms/:id`, `/traceability`).

- [ ] **Step 4: Verify no runtime mock imports remain**

Run:

```bash
npm run typecheck
```

Expected: exits 0 or shows unrelated pre-existing type errors. If errors are caused by the mock export removal, fix imports by pointing tests directly at `src/shared/api/marketplace/mock-adapter` or deleting unused imports.

Run:

```bash
npm run lint
```

Expected: exits 0 or shows unrelated pre-existing lint errors. Fix any lint errors caused by this task.

---

### Task 2: Optimistic Cart Mutations and Toasts

**Files:**
- Modify: `src/features/marketplace/hooks/useMarketplaceQueries.ts`
- Modify: `src/features/marketplace/hooks/useMarketplaceAddToCart.ts`
- Test: `src/features/marketplace/hooks/useMarketplaceQueries.cart.test.tsx`

- [ ] **Step 1: Write failing cart optimistic update tests**

Create `src/features/marketplace/hooks/useMarketplaceQueries.cart.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MarketplaceCart } from '@/shared/api';
import { marketplaceApi } from '@/shared/api';
import {
  marketplaceQueryKeys,
  useMarketplaceRemoveCartItemMutation,
  useMarketplaceUpdateCartItemMutation,
} from './useMarketplaceQueries';

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>();
  return {
    ...actual,
    marketplaceApi: {
      updateCartItem: vi.fn(),
      removeCartItem: vi.fn(),
    },
  };
});

function createCart(): MarketplaceCart {
  return {
    userId: 7,
    currency: 'VND',
    itemCount: 3,
    subtotal: 90_000,
    items: [
      {
        productId: 1,
        slug: 'rice',
        name: 'Rice',
        imageUrl: '/rice.png',
        unitPrice: 30_000,
        quantity: 2,
        maxQuantity: 5,
        farmerUserId: 10,
        traceable: true,
      },
      {
        productId: 2,
        slug: 'corn',
        name: 'Corn',
        imageUrl: '/corn.png',
        unitPrice: 30_000,
        quantity: 1,
        maxQuantity: 5,
        farmerUserId: 11,
        traceable: false,
      },
    ],
  };
}

function wrapperFor(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('marketplace cart mutations', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    queryClient.setQueryData(marketplaceQueryKeys.cart(), createCart());
    vi.mocked(marketplaceApi.updateCartItem).mockReset();
    vi.mocked(marketplaceApi.removeCartItem).mockReset();
  });

  it('optimistically updates quantity and subtotal', async () => {
    vi.mocked(marketplaceApi.updateCartItem).mockResolvedValue({} as never);
    const { result } = renderHook(() => useMarketplaceUpdateCartItemMutation(), { wrapper: wrapperFor(queryClient) });

    result.current.mutate({ productId: 1, request: { quantity: 4 } });

    await waitFor(() => {
      const cart = queryClient.getQueryData<MarketplaceCart>(marketplaceQueryKeys.cart());
      expect(cart?.items.find((item) => item.productId === 1)?.quantity).toBe(4);
      expect(cart?.itemCount).toBe(5);
      expect(cart?.subtotal).toBe(150_000);
    });
  });

  it('rolls back optimistic quantity on failure', async () => {
    vi.mocked(marketplaceApi.updateCartItem).mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useMarketplaceUpdateCartItemMutation(), { wrapper: wrapperFor(queryClient) });

    result.current.mutate({ productId: 1, request: { quantity: 4 } });

    await waitFor(() => expect(result.current.isError).toBe(true));
    const cart = queryClient.getQueryData<MarketplaceCart>(marketplaceQueryKeys.cart());
    expect(cart?.items.find((item) => item.productId === 1)?.quantity).toBe(2);
    expect(cart?.itemCount).toBe(3);
    expect(cart?.subtotal).toBe(90_000);
  });

  it('optimistically removes an item', async () => {
    vi.mocked(marketplaceApi.removeCartItem).mockResolvedValue(undefined as never);
    const { result } = renderHook(() => useMarketplaceRemoveCartItemMutation(), { wrapper: wrapperFor(queryClient) });

    result.current.mutate(2);

    await waitFor(() => {
      const cart = queryClient.getQueryData<MarketplaceCart>(marketplaceQueryKeys.cart());
      expect(cart?.items.map((item) => item.productId)).toEqual([1]);
      expect(cart?.itemCount).toBe(2);
      expect(cart?.subtotal).toBe(60_000);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test -- src/features/marketplace/hooks/useMarketplaceQueries.cart.test.tsx --run
```

Expected: fails because cart mutations do not optimistically update cache yet.

- [ ] **Step 3: Implement cart cache helpers and optimistic mutations**

In `src/features/marketplace/hooks/useMarketplaceQueries.ts`, add near `invalidateMarketplaceCheckoutQueries`:

```ts
type CartMutationContext = { previousCart?: ReturnType<QueryClient['getQueryData']> };

function recalculateCart(cart: NonNullable<ReturnType<typeof updateCartItemInCache>>): typeof cart {
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  return { ...cart, itemCount, subtotal };
}

function updateCartItemInCache(
  cart: import('@/shared/api').MarketplaceCart | undefined,
  productId: number,
  quantity: number,
) {
  if (!cart) return cart;
  return recalculateCart({
    ...cart,
    items: cart.items.map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.min(Math.max(quantity, 1), item.maxQuantity) }
        : item,
    ),
  });
}

function removeCartItemFromCache(
  cart: import('@/shared/api').MarketplaceCart | undefined,
  productId: number,
) {
  if (!cart) return cart;
  return recalculateCart({
    ...cart,
    items: cart.items.filter((item) => item.productId !== productId),
  });
}
```

Update `useMarketplaceUpdateCartItemMutation()`:

```ts
export function useMarketplaceUpdateCartItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, request }: { productId: number; request: MarketplaceUpdateCartItemRequest }) => {
      const response = await marketplaceApi.updateCartItem(productId, request);
      return response.result;
    },
    onMutate: async ({ productId, request }) => {
      await queryClient.cancelQueries({ queryKey: marketplaceQueryKeys.cart() });
      const previousCart = queryClient.getQueryData(marketplaceQueryKeys.cart());
      queryClient.setQueryData(marketplaceQueryKeys.cart(), (cart) =>
        updateCartItemInCache(cart as import('@/shared/api').MarketplaceCart | undefined, productId, request.quantity),
      );
      return { previousCart } satisfies CartMutationContext;
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCart) queryClient.setQueryData(marketplaceQueryKeys.cart(), context.previousCart);
      toast.error('Không thể cập nhật giỏ hàng. Vui lòng thử lại.');
    },
    onSuccess: () => {
      toast.success('Đã cập nhật giỏ hàng.');
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.cart() });
    },
  });
}
```

Add `import { toast } from 'sonner';` at the top. Apply the same `onMutate`/rollback/toast pattern to `useMarketplaceRemoveCartItemMutation()` using `removeCartItemFromCache`.

- [ ] **Step 4: Add add-to-cart success toast**

In `src/features/marketplace/hooks/useMarketplaceAddToCart.ts`, change `onSuccess` to:

```ts
onSuccess: async () => {
  await queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.cart() });
  toast.success('Đã thêm sản phẩm vào giỏ hàng.');
},
```

Change the error toast to Vietnamese with accents:

```ts
toast.error('Không thể thêm vào giỏ hàng lúc này.');
```

- [ ] **Step 5: Run cart tests**

Run:

```bash
npm run test -- src/features/marketplace/hooks/useMarketplaceQueries.cart.test.tsx --run
```

Expected: PASS.

---

### Task 3: Checkout Validation Hook and Checkout UI

**Files:**
- Create: `src/features/marketplace/hooks/useCheckoutValidation.ts`
- Modify: `src/features/marketplace/hooks/index.ts`
- Modify: `src/features/marketplace/pages/CheckoutPage.tsx`
- Test: `src/features/marketplace/hooks/useCheckoutValidation.test.tsx`

- [ ] **Step 1: Write failing checkout validation tests**

Create `src/features/marketplace/hooks/useCheckoutValidation.test.tsx`:

```tsx
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCheckoutValidation } from './useCheckoutValidation';

describe('useCheckoutValidation', () => {
  it('rejects checkout without shipping address', () => {
    const { result } = renderHook(() => useCheckoutValidation());

    expect(result.current.validateCheckout({
      addressMode: 'saved',
      selectedAddress: null,
      recipientName: undefined,
      phone: undefined,
      shippingAddressLine: '',
      paymentMethod: 'COD',
    })).toEqual({ valid: false, message: 'Vui lòng chọn hoặc nhập địa chỉ giao hàng.' });
  });

  it('rejects invalid phone numbers', () => {
    const { result } = renderHook(() => useCheckoutValidation());

    expect(result.current.validateCheckout({
      addressMode: 'new',
      selectedAddress: null,
      recipientName: 'Nguyen Van A',
      phone: 'abc',
      shippingAddressLine: 'HCM',
      paymentMethod: 'BANK_TRANSFER',
    })).toEqual({ valid: false, message: 'Số điện thoại không hợp lệ.' });
  });

  it('accepts a complete checkout payload', () => {
    const { result } = renderHook(() => useCheckoutValidation());

    expect(result.current.validateCheckout({
      addressMode: 'new',
      selectedAddress: null,
      recipientName: 'Nguyen Van A',
      phone: '0912345678',
      shippingAddressLine: '1 Nguyen Trai, HCM',
      paymentMethod: 'BANK_TRANSFER',
    })).toEqual({ valid: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test -- src/features/marketplace/hooks/useCheckoutValidation.test.tsx --run
```

Expected: FAIL because `useCheckoutValidation` does not exist.

- [ ] **Step 3: Implement validation hook**

Create `src/features/marketplace/hooks/useCheckoutValidation.ts`:

```ts
import { useMemo } from 'react';
import { z } from 'zod';
import type { MarketplaceAddress, MarketplacePaymentMethod } from '@/shared/api';

const phoneSchema = z.string().regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ.');

export type CheckoutValidationInput = {
  addressMode: 'saved' | 'new';
  selectedAddress: MarketplaceAddress | null;
  recipientName: string | undefined;
  phone: string | undefined;
  shippingAddressLine: string;
  paymentMethod: MarketplacePaymentMethod;
};

export type CheckoutValidationResult = { valid: true } | { valid: false; message: string };

export function useCheckoutValidation() {
  return useMemo(() => ({
    validateCheckout(input: CheckoutValidationInput): CheckoutValidationResult {
      const hasAddress = input.addressMode === 'saved'
        ? Boolean(input.selectedAddress)
        : input.shippingAddressLine.trim().length > 0;
      if (!hasAddress) return { valid: false, message: 'Vui lòng chọn hoặc nhập địa chỉ giao hàng.' };
      if (!input.recipientName?.trim()) return { valid: false, message: 'Vui lòng nhập tên người nhận.' };
      const phone = input.phone?.trim() ?? '';
      const phoneResult = phoneSchema.safeParse(phone);
      if (!phoneResult.success) return { valid: false, message: phoneResult.error.issues[0]?.message ?? 'Số điện thoại không hợp lệ.' };
      if (!input.shippingAddressLine.trim()) return { valid: false, message: 'Vui lòng nhập địa chỉ giao hàng.' };
      if (input.paymentMethod !== 'COD' && input.paymentMethod !== 'BANK_TRANSFER') return { valid: false, message: 'Phương thức thanh toán không hợp lệ.' };
      return { valid: true };
    },
  }), []);
}
```

Export it from `src/features/marketplace/hooks/index.ts`:

```ts
export * from './useCheckoutValidation';
```

- [ ] **Step 4: Wire checkout validation and toasts**

In `src/features/marketplace/pages/CheckoutPage.tsx`, import:

```ts
import { toast } from 'sonner';
import { useCheckoutValidation } from '../hooks';
```

Inside `CheckoutPage`, add:

```ts
const { validateCheckout } = useCheckoutValidation();
```

Before `createOrderMutation.mutateAsync(...)`, call:

```ts
const validation = validateCheckout({
  addressMode,
  selectedAddress,
  recipientName: effectiveRecipientName,
  phone: effectivePhone,
  shippingAddressLine: effectiveShippingAddressLine,
  paymentMethod,
});
if (!validation.valid) {
  toast.error(validation.message);
  return;
}
```

Wrap address saves and order creation in `try/catch` to show:

```ts
toast.success('Đã lưu địa chỉ giao hàng.');
toast.success('Đặt hàng thành công.');
toast.error(error instanceof Error ? error.message : 'Không thể hoàn tất thao tác.');
```

- [ ] **Step 5: Add split-order preview grouped by seller**

In `CheckoutPage`, derive seller groups from `cart.items`:

```ts
const splitOrderGroups = useMemo(() => {
  const groups = new Map<number, typeof cart.items>();
  cart.items.forEach((item) => {
    groups.set(item.farmerUserId, [...(groups.get(item.farmerUserId) ?? []), item]);
  });
  return Array.from(groups.entries()).map(([farmerUserId, items]) => ({ farmerUserId, items }));
}, [cart.items]);
```

Render this before the final summary:

```tsx
<div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
  <p className="text-sm font-semibold text-emerald-900">Đơn hàng sẽ được tách theo người bán</p>
  <div className="mt-3 space-y-2">
    {splitOrderGroups.map((group, index) => (
      <div key={group.farmerUserId} className="rounded-lg bg-white p-3 text-sm text-gray-700">
        <div className="font-medium text-gray-900">Đơn {index + 1}</div>
        <div>{group.items.length} sản phẩm · {formatVnd(group.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))}</div>
      </div>
    ))}
  </div>
</div>
```

- [ ] **Step 6: Run checkout tests**

Run:

```bash
npm run test -- src/features/marketplace/hooks/useCheckoutValidation.test.tsx --run
```

Expected: PASS.

---

### Task 4: Buyer Screen Audit Fixes

**Files:**
- Modify only buyer screens listed in File Structure.

- [ ] **Step 1: Remove mock fallback images from Buyer pages**

Replace any `https://picsum.photos/...` fallback in buyer pages with local empty visual blocks. For example in `MarketHomePage.tsx`, replace:

```ts
const heroImage = featuredFarms[0]?.coverImageUrl ?? featuredProducts[0]?.imageUrl ?? 'https://picsum.photos/seed/farm_hero/1200/800';
```

with:

```ts
const heroImage = featuredFarms[0]?.coverImageUrl ?? featuredProducts[0]?.imageUrl ?? null;
```

Render:

```tsx
{heroImage ? (
  <img src={heroImage} alt="Nông trại xanh tươi" referrerPolicy="no-referrer" />
) : (
  <div className="flex h-full min-h-[320px] items-center justify-center bg-emerald-50 text-sm font-medium text-emerald-700">
    Dữ liệu hình ảnh sẽ hiển thị khi có sản phẩm hoặc nông trại công khai.
  </div>
)}
```

- [ ] **Step 2: Add empty states to Marketplace Home featured sections**

When `featuredProducts.length === 0`, render:

```tsx
<div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
  Chưa có sản phẩm công khai. Vui lòng quay lại sau.
</div>
```

When `featuredFarms.length === 0`, render:

```tsx
<div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
  Chưa có nông trại công khai trên marketplace.
</div>
```

- [ ] **Step 3: Replace ProductDetail DOM mutation fallback**

In `ProductDetailPage.tsx`, replace the `onError` handler that assigns `parent.innerHTML` with component state:

```ts
const [imageFailed, setImageFailed] = useState(false);
const primaryImage = product.imageUrls[0] ?? product.imageUrl;
```

Render image only when `primaryImage && !imageFailed`, with:

```tsx
onError={() => setImageFailed(true)}
```

Keep the existing `<Package />` empty block for missing/failed images.

- [ ] **Step 4: Group Cart by seller**

In `CartPage.tsx`, derive groups:

```ts
const sellerGroups = cart.items.reduce<Array<{ farmerUserId: number; items: typeof cart.items }>>((groups, item) => {
  const existing = groups.find((group) => group.farmerUserId === item.farmerUserId);
  if (existing) existing.items.push(item);
  else groups.push({ farmerUserId: item.farmerUserId, items: [item] });
  return groups;
}, []);
```

Render each group as a card with title:

```tsx
<h2 className="text-sm font-semibold text-gray-700">Người bán #{group.farmerUserId}</h2>
```

and seller subtotal:

```tsx
{formatVnd(group.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))}
```

- [ ] **Step 5: Add payment proof validation and toasts**

In `OrderDetailPage.tsx`, add:

```ts
import { toast } from 'sonner';

const MAX_PAYMENT_PROOF_BYTES = 5 * 1024 * 1024;
const PAYMENT_PROOF_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

function validatePaymentProof(file: File): string | null {
  if (!PAYMENT_PROOF_TYPES.includes(file.type)) return 'Chỉ hỗ trợ JPG, PNG, WEBP hoặc PDF.';
  if (file.size > MAX_PAYMENT_PROOF_BYTES) return 'Tệp xác nhận thanh toán không được vượt quá 5MB.';
  return null;
}
```

On file change:

```tsx
onChange={(event) => {
  const file = event.target.files?.[0] ?? null;
  if (!file) {
    setPaymentFile(null);
    return;
  }
  const message = validatePaymentProof(file);
  if (message) {
    toast.error(message);
    event.currentTarget.value = '';
    setPaymentFile(null);
    return;
  }
  setPaymentFile(file);
}}
```

After upload/review/cancel success show success toasts; on catch show `toast.error(error instanceof Error ? error.message : 'Không thể hoàn tất thao tác.')`.

- [ ] **Step 6: Address book cleanup**

In `AddressBookPage.tsx`, remove explanatory comments and replace `catch (error: any)` with:

```ts
} catch (error: unknown) {
  toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
  throw error;
}
```

Add an error state after loading:

```tsx
if (addressesQuery.isError) {
  return <div className="rounded-xl border border-red-200 bg-white p-8 text-center text-sm text-red-600">Không thể tải sổ địa chỉ.</div>;
}
```

- [ ] **Step 7: Search for Buyer TODO/mock gaps**

Run:

```bash
rg -n "TODO|mock|picsum|innerHTML" src/features/marketplace src/features/buyer/profile
```

Expected: no matches in buyer-facing runtime files except explicit `mock-adapter.ts` if included by search. Do not edit Farmer/Admin pages in this phase.

---

### Task 5: OrderDetail Component Test

**Files:**
- Test: `src/features/marketplace/pages/OrderDetailPage.test.tsx`

- [ ] **Step 1: Write OrderDetail tests**

Create `src/features/marketplace/pages/OrderDetailPage.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { MarketplaceOrder } from '@/shared/api';
import { marketplaceApi } from '@/shared/api';
import { OrderDetailPage } from './OrderDetailPage';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>();
  return {
    ...actual,
    marketplaceApi: {
      getOrderDetail: vi.fn(),
      uploadOrderPaymentProof: vi.fn(),
      createReview: vi.fn(),
      cancelOrder: vi.fn(),
    },
  };
});

function orderFixture(): MarketplaceOrder {
  return {
    id: 55,
    orderCode: 'ORD-55',
    orderGroupCode: 'GRP-1',
    buyerUserId: 1,
    farmerUserId: 2,
    status: 'COMPLETED',
    payment: {
      method: 'BANK_TRANSFER',
      verificationStatus: 'REJECTED',
      proofFileName: null,
      proofContentType: null,
      proofStoragePath: null,
      proofUploadedAt: null,
      verifiedAt: null,
      verifiedBy: null,
      verificationNote: 'Ảnh không rõ',
    },
    shippingRecipientName: 'Nguyen Van A',
    shippingPhone: '0912345678',
    shippingAddressLine: '1 Nguyen Trai, HCM',
    note: null,
    subtotal: 100_000,
    shippingFee: 20_000,
    totalAmount: 120_000,
    canCancel: false,
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-01T10:00:00Z',
    items: [{
      id: 1,
      productId: 10,
      productName: 'Rice',
      productSlug: 'rice',
      imageUrl: '/rice.png',
      unitPriceSnapshot: 50_000,
      quantity: 2,
      lineTotal: 100_000,
      traceableSnapshot: true,
      canReview: true,
      reviewId: null,
    }],
  };
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/marketplace/orders/55"]}>
        <Routes><Route path="/marketplace/orders/:id" element={children} /></Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
  return render(<OrderDetailPage />, { wrapper: Wrapper });
}

describe('OrderDetailPage', () => {
  it('shows order items, address, rejected payment status, upload, and review form', async () => {
    vi.mocked(marketplaceApi.getOrderDetail).mockResolvedValue({ result: orderFixture() } as never);

    renderPage();

    expect(await screen.findByText('ORD-55')).toBeInTheDocument();
    expect(screen.getByText('Rice')).toBeInTheDocument();
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText(/BANK_TRANSFER · REJECTED/)).toBeInTheDocument();
    expect(screen.getByText('marketplaceBuyer.orderDetail.transferProofTitle')).toBeInTheDocument();
    expect(screen.getByText('marketplaceBuyer.orderDetail.rateProduct')).toBeInTheDocument();
  });

  it('blocks invalid payment proof file types', async () => {
    vi.mocked(marketplaceApi.getOrderDetail).mockResolvedValue({ result: orderFixture() } as never);
    const user = userEvent.setup();

    renderPage();

    const input = await screen.findByLabelText(/payment proof/i, { selector: 'input' }).catch(() => screen.getByTestId('payment-proof-input'));
    const file = new File(['bad'], 'bad.txt', { type: 'text/plain' });
    await user.upload(input, file);

    expect(vi.mocked(marketplaceApi.uploadOrderPaymentProof)).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Add accessible label/test id to payment input if needed**

In `OrderDetailPage.tsx`, change the file input to:

```tsx
<Input
  aria-label="payment proof"
  data-testid="payment-proof-input"
  type="file"
  accept="image/jpeg,image/png,image/webp,application/pdf"
  onChange={...}
/>
```

- [ ] **Step 3: Run test**

Run:

```bash
npm run test -- src/features/marketplace/pages/OrderDetailPage.test.tsx --run
```

Expected: PASS.

---

### Task 6: Buyer E2E Setup Documentation

**Files:**
- Create: `docs/superpowers/buyer-marketplace-e2e-setup.md`

- [ ] **Step 1: Confirm no E2E framework exists**

Run:

```bash
node -e "const p=require('./package.json'); const d={...p.dependencies,...p.devDependencies}; console.log(Boolean(d['@playwright/test']||d.cypress))"
```

Expected: `false`.

- [ ] **Step 2: Document the E2E happy path setup**

Create `docs/superpowers/buyer-marketplace-e2e-setup.md`:

```md
# Buyer Marketplace E2E Setup

No E2E runner is currently installed in this frontend project.

## Recommended runner

Use Playwright because it supports file upload, route assertions, and CI browser installs with minimal setup.

## Install

```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

## Add scripts

Add to `package.json`:

```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

## Required happy path

1. Sign in as a Buyer test account.
2. Open `/marketplace/products`.
3. Search/filter to a published product with stock.
4. Open product detail.
5. Add product to cart.
6. Open cart and update quantity.
7. Proceed to checkout.
8. Select or create address.
9. Select bank transfer.
10. Submit order.
11. Open order detail.
12. Upload JPG/PNG/PDF payment proof.
13. Assert proof filename and verification status are visible.

## Backend seed requirements

- Buyer user with valid credentials.
- At least one published product with `availableQuantity > 0`.
- Product belongs to a farmer/seller.
- Bank-transfer payment method enabled.
```

- [ ] **Step 3: Do not install Playwright in this phase unless the user explicitly approves dependency changes**

Dependency installation changes package files and should be a separate approval.

---

### Task 7: Final Buyer Verification

**Files:**
- All modified Buyer files.

- [ ] **Step 1: Run focused Buyer tests**

Run:

```bash
npm run test -- src/features/marketplace/hooks/useMarketplaceQueries.cart.test.tsx src/features/marketplace/hooks/useCheckoutValidation.test.tsx src/features/marketplace/pages/OrderDetailPage.test.tsx --run
```

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: 0 errors.

- [ ] **Step 4: Start dev server for manual browser pass**

Run:

```bash
npm run dev
```

Expected: Vite starts and prints a local URL.

- [ ] **Step 5: Manual browser happy path**

Using Chrome DevTools MCP or browser manually:

1. Sign in as Buyer.
2. Visit `/marketplace/products`.
3. Search/filter/sort product list.
4. Open a product detail page.
5. Add product to cart.
6. Visit `/marketplace/cart` and update quantity/remove another item if available.
7. Proceed to `/marketplace/checkout`.
8. Select/create address.
9. Select bank transfer and submit order.
10. Open `/marketplace/orders/:id`.
11. Upload valid proof file.
12. Confirm proof filename and verification status are visible.

Expected: full Buyer happy path works without console errors. If backend data/accounts are unavailable, report exactly which step is blocked and do not claim manual pass completed.

---

## Self-Review

- Spec coverage: Buyer screens, zero runtime mock data, TanStack Query cache keys, optimistic cart updates, toasts, skeleton/empty/error states, validation, buyer-only guards, unit tests, and E2E setup documentation are covered.
- Scope control: Farmer and Admin pages are intentionally excluded. Shared hook edits are limited to Buyer cart/order/address flows.
- Placeholder scan: No `TODO`, `TBD`, or vague implementation steps remain in this plan.
- Type consistency: The plan uses existing marketplace types from `src/shared/api/marketplace/types.ts` and existing hooks from `useMarketplaceQueries.ts`.
