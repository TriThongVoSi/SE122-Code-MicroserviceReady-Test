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
