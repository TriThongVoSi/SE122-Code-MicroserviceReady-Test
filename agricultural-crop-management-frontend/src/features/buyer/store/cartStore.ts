/**
 * Buyer Cart Store
 *
 * Buyer-only cart state skeleton.
 * This store is scoped to public marketplace routes via CartProvider
 * so that admin and farmer dashboards never subscribe to cart state
 * or re-render from cart updates.
 *
 * Currently a skeleton — actual cart logic lives in
 * @/features/marketplace/hooks (useMarketplaceCart).
 * Migrate here when full state isolation is needed.
 */

export interface CartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CartState {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
}

export const INITIAL_CART_STATE: CartState = {
  items: [],
  itemCount: 0,
  totalPrice: 0,
};
