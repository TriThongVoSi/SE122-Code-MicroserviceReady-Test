import { createContext, useContext, type ReactNode } from "react";
import { type CartState, INITIAL_CART_STATE } from "../store/cartStore";

/**
 * CartProvider
 *
 * Scoped context provider for buyer cart state.
 * Wrap this around public/marketplace routes only so dashboard routes
 * never subscribe to cart state and avoid unnecessary re-renders.
 *
 * Currently a pass-through skeleton — actual cart mutations are managed by
 * useMarketplaceCart in @/features/marketplace/hooks.
 * When full state isolation is implemented, this provider will own the
 * cart state lifecycle.
 */

interface CartContextValue {
  cart: CartState;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Skeleton: provide initial empty state
  // Replace with actual cart state management when migrating from marketplace hooks
  const value: CartContextValue = {
    cart: INITIAL_CART_STATE,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * useCart hook — access buyer cart context.
 * Throws if used outside CartProvider (i.e. in dashboard routes).
 */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider (public routes only)");
  }
  return context;
}
