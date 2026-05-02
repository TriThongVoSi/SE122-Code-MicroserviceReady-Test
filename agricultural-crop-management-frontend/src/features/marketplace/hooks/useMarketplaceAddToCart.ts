import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/features/auth";
import { marketplaceApi } from "@/shared/api";
import { marketplaceQueryKeys } from "./useMarketplaceQueries";

type AddToCartOptions = {
  redirectToSignIn?: boolean;
  redirectToSignUp?: boolean;
};

export function useMarketplaceAddToCart() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const addToServerCart = useMutation({
    mutationFn: (payload: { productId: number; quantity: number }) =>
      marketplaceApi.addCartItem(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: marketplaceQueryKeys.cart(),
      });
      toast.success("Đã thêm sản phẩm vào giỏ hàng.");
    },
    onError: (error) => {
      console.error("Failed to add marketplace cart item", error);
      toast.error("Không thể thêm vào giỏ hàng lúc này.");
    },
  });

  async function addToCart(
    productId: number,
    quantity: number,
    options: AddToCartOptions = {},
  ): Promise<"server" | "blocked"> {
    if (isAuthenticated) {
      await addToServerCart.mutateAsync({ productId, quantity });
      return "server";
    }

    toast.info("Khach chi duoc xem san pham.", {
      description: "Vui long tao tai khoan hoac dang nhap de mua hang.",
    });

    if (options.redirectToSignUp ?? options.redirectToSignIn) {
      navigate("/sign-up", {
        state: {
          from: location,
        },
      });
    }

    return "blocked";
  }

  return {
    addToCart,
    isAdding: addToServerCart.isPending,
  };
}
