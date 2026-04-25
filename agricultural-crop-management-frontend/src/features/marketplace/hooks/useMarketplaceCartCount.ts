import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
import { loadGuestCartItems, subscribeGuestCart } from "../state/guestCart";
import { useMarketplaceCart } from "./useMarketplaceQueries";

export function useMarketplaceCartCount(): number {
  const { isAuthenticated } = useAuth();
  const serverCartQuery = useMarketplaceCart({ enabled: isAuthenticated });
  const [guestCartCount, setGuestCartCount] = useState(() =>
    isAuthenticated ? 0 : loadGuestCartItems().length,
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setGuestCartCount(loadGuestCartItems().length);
      return subscribeGuestCart(() => {
        setGuestCartCount(loadGuestCartItems().length);
      });
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    // items.length gives distinct product count; itemCount from API may aggregate quantities
    return serverCartQuery.data?.items?.length ?? 0;
  }

  return guestCartCount;
}
