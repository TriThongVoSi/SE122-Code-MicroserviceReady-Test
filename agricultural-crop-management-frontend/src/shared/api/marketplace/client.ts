/// <reference types="vite/client" />

import type { MarketplaceApiAdapter } from './adapter';
import { createMarketplaceMockAdapter } from './mock-adapter';
import { createMarketplaceRealAdapter } from './real-adapter';

type MarketplaceClientOptions = {
  useMock?: boolean;
  mockFallbackUserId?: number;
};

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === '1' || normalized === 'true' || normalized === 'yes') {
    return true;
  }
  if (normalized === '0' || normalized === 'false' || normalized === 'no') {
    return false;
  }
  return undefined;
}

function resolveUseMock(explicit?: boolean): boolean {
  // Release safety: production runtime must always use real adapter path.
  if (import.meta.env.PROD) {
    return false;
  }

  if (typeof explicit === 'boolean') {
    return explicit;
  }
  const fromEnv = parseBoolean(import.meta.env.VITE_MARKETPLACE_USE_MOCK);
  if (typeof fromEnv === 'boolean') {
    return fromEnv;
  }
  return false;
}

export function createMarketplaceApiClient(
  options: MarketplaceClientOptions = {},
): MarketplaceApiAdapter {
  if (resolveUseMock(options.useMock)) {
    return createMarketplaceMockAdapter({
      fallbackUserId: options.mockFallbackUserId,
    });
  }

  return createMarketplaceRealAdapter();
}

export const marketplaceApi = createMarketplaceApiClient();
