import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { marketplaceApi } from "@/shared/api";
import {
  buildGuestCartMergeRequest,
  clearGuestCartItems,
  hasGuestCartItems,
} from "../state/guestCart";
import { marketplaceQueryKeys } from "./useMarketplaceQueries";

/**
 * Merge guest cart -> server cart after successful login.
 * After merge success, server cart becomes source of truth.
 */
export function useMarketplaceCartMergeBridge() {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !hasGuestCartItems()) {
      return;
    }

    let cancelled = false;

    const merge = async () => {
      try {
        const request = buildGuestCartMergeRequest();
        if (request.items.length === 0) {
          return;
        }

        await marketplaceApi.mergeCart(request);
        if (cancelled) {
          return;
        }

        clearGuestCartItems();
        await queryClient.invalidateQueries({
          queryKey: marketplaceQueryKeys.cart(),
        });
      } catch (error) {
        console.error("Failed to merge guest marketplace cart after login", error);
      }
    };

    void merge();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id, queryClient]);
}
