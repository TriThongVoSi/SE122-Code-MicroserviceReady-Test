import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
import { loadGuestCartItems, subscribeGuestCart } from "../state/guestCart";
import { useMarketplaceCart } from "./useMarketplaceQueries";

/**
 * Returns the number of distinct items in the cart.
 * - For authenticated users: fetches from server
 * - For guest users: reads from localStorage
 * - Automatically updates when cart changes
 */
export function useMarketplaceCartCount(): number {
  const { isAuthenticated } = useAuth();
  const serverCartQuery = useMarketplaceCart({ enabled: isAuthenticated });
  const [guestCartCount, setGuestCartCount] = useState(0);

  // Initialize and subscribe to guest cart updates
  useEffect(() => {
    if (!isAuthenticated) {
      // Initial load
      setGuestCartCount(loadGuestCartItems().length);

      // Subscribe to changes
      const unsubscribe = subscribeGuestCart(() => {
        setGuestCartCount(loadGuestCartItems().length);
      });

      return unsubscribe;
    }
  }, [isAuthenticated]);

  // Return server count for authenticated users, guest count otherwise
  if (isAuthenticated) {
    // Use items.length as the number of distinct items
    // The itemCount field from API may include calculated values
    const distinctItemCount = serverCartQuery.data?.items?.length ?? 0;
    return distinctItemCount;
  }

  return guestCartCount;
}

