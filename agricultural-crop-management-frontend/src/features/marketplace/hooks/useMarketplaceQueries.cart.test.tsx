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

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

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

  it('optimistically updates quantity and subtotal before API resolution', async () => {
    const deferred = createDeferred<Awaited<ReturnType<typeof marketplaceApi.updateCartItem>>>();
    vi.mocked(marketplaceApi.updateCartItem).mockReturnValue(deferred.promise);
    const { result } = renderHook(() => useMarketplaceUpdateCartItemMutation(), { wrapper: wrapperFor(queryClient) });

    result.current.mutate({ productId: 1, request: { quantity: 4 } });

    await waitFor(() => expect(marketplaceApi.updateCartItem).toHaveBeenCalledWith(1, { quantity: 4 }));
    expect(result.current.isPending).toBe(true);
    const optimisticCart = queryClient.getQueryData<MarketplaceCart>(marketplaceQueryKeys.cart());
    expect(optimisticCart?.items.find((item) => item.productId === 1)?.quantity).toBe(4);
    expect(optimisticCart?.itemCount).toBe(5);
    expect(optimisticCart?.subtotal).toBe(150_000);

    deferred.resolve({} as Awaited<ReturnType<typeof marketplaceApi.updateCartItem>>);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
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

  it('optimistically removes an item before API resolution', async () => {
    const deferred = createDeferred<Awaited<ReturnType<typeof marketplaceApi.removeCartItem>>>();
    vi.mocked(marketplaceApi.removeCartItem).mockReturnValue(deferred.promise);
    const { result } = renderHook(() => useMarketplaceRemoveCartItemMutation(), { wrapper: wrapperFor(queryClient) });

    result.current.mutate(2);

    await waitFor(() => expect(marketplaceApi.removeCartItem).toHaveBeenCalledWith(2));
    expect(result.current.isPending).toBe(true);
    const optimisticCart = queryClient.getQueryData<MarketplaceCart>(marketplaceQueryKeys.cart());
    expect(optimisticCart?.items.map((item) => item.productId)).toEqual([1]);
    expect(optimisticCart?.itemCount).toBe(2);
    expect(optimisticCart?.subtotal).toBe(60_000);

    deferred.resolve({} as Awaited<ReturnType<typeof marketplaceApi.removeCartItem>>);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
