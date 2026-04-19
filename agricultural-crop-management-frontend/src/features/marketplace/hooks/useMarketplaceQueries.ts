import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import {
  marketplaceApi,
  type MarketplaceAddCartItemRequest,
  type MarketplaceAdminOrderQuery,
  type MarketplaceAdminProductQuery,
  type MarketplaceAddressUpsertRequest,
  type MarketplaceCreateOrderRequest,
  type MarketplaceCreateReviewRequest,
  type MarketplaceFarmerOrderQuery,
  type MarketplaceFarmerProductQuery,
  type MarketplaceFarmerProductUpsertRequest,
  type MarketplaceFarmQuery,
  type MarketplaceOrderQuery,
  type MarketplaceOrderStatus,
  type MarketplaceProductQuery,
  type MarketplaceReviewQuery,
  type MarketplaceUpdateOrderStatusRequest,
  type MarketplaceUpdateProductStatusRequest,
  type MarketplaceUpdateCartItemRequest,
} from "@/shared/api";

export const marketplaceQueryKeys = {
  root: ["marketplace"] as const,
  productsBase: () => [...marketplaceQueryKeys.root, "products"] as const,
  products: (query?: MarketplaceProductQuery) =>
    [...marketplaceQueryKeys.productsBase(), query ?? {}] as const,
  product: (slug?: string) => [...marketplaceQueryKeys.root, "product", slug ?? ""] as const,
  productReviews: (productId?: number, query?: MarketplaceReviewQuery) =>
    [...marketplaceQueryKeys.root, "product-reviews", productId ?? 0, query ?? {}] as const,
  farmsBase: () => [...marketplaceQueryKeys.root, "farms"] as const,
  farms: (query?: MarketplaceFarmQuery) =>
    [...marketplaceQueryKeys.farmsBase(), query ?? {}] as const,
  farm: (farmId?: number) => [...marketplaceQueryKeys.root, "farm", farmId ?? 0] as const,
  traceability: (productId?: number | null) =>
    [...marketplaceQueryKeys.root, "traceability", productId ?? 0] as const,
  cart: () => [...marketplaceQueryKeys.root, "cart"] as const,
  ordersBase: () => [...marketplaceQueryKeys.root, "orders"] as const,
  orders: (query?: MarketplaceOrderQuery) =>
    [...marketplaceQueryKeys.ordersBase(), query ?? {}] as const,
  order: (orderId?: number) => [...marketplaceQueryKeys.root, "order", orderId ?? 0] as const,
  addresses: () => [...marketplaceQueryKeys.root, "addresses"] as const,
  farmerDashboard: () => [...marketplaceQueryKeys.root, "farmer-dashboard"] as const,
  farmerProductsBase: () => [...marketplaceQueryKeys.root, "farmer-products"] as const,
  farmerProducts: (query?: MarketplaceFarmerProductQuery) =>
    [...marketplaceQueryKeys.farmerProductsBase(), query ?? {}] as const,
  farmerProduct: (productId?: number) =>
    [...marketplaceQueryKeys.root, "farmer-product", productId ?? 0] as const,
  farmerOrdersBase: () => [...marketplaceQueryKeys.root, "farmer-orders"] as const,
  farmerOrders: (query?: MarketplaceFarmerOrderQuery) =>
    [...marketplaceQueryKeys.farmerOrdersBase(), query ?? {}] as const,
  farmerOrder: (orderId?: number) => [...marketplaceQueryKeys.root, "farmer-order", orderId ?? 0] as const,
  adminProductsBase: () => [...marketplaceQueryKeys.root, "admin-products"] as const,
  adminProducts: (query?: MarketplaceAdminProductQuery) =>
    [...marketplaceQueryKeys.adminProductsBase(), query ?? {}] as const,
  adminOrdersBase: () => [...marketplaceQueryKeys.root, "admin-orders"] as const,
  adminOrders: (query?: MarketplaceAdminOrderQuery) =>
    [...marketplaceQueryKeys.adminOrdersBase(), query ?? {}] as const,
  adminOrder: (orderId?: number) => [...marketplaceQueryKeys.root, "admin-order", orderId ?? 0] as const,
  adminStats: () => [...marketplaceQueryKeys.root, "admin-stats"] as const,
};

async function invalidateMarketplaceCheckoutQueries(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.cart() }),
    queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.ordersBase() }),
  ]);
}

export function useMarketplaceProducts(query?: MarketplaceProductQuery) {
  return useQuery({
    queryKey: marketplaceQueryKeys.products(query),
    queryFn: async () => {
      const response = await marketplaceApi.listProducts(query);
      return response.result;
    },
  });
}

export function useMarketplaceProductDetail(slug?: string) {
  return useQuery({
    queryKey: marketplaceQueryKeys.product(slug),
    enabled: Boolean(slug),
    queryFn: async () => {
      const response = await marketplaceApi.getProductBySlug(slug ?? "");
      return response.result;
    },
  });
}

export function useMarketplaceProductReviews(productId?: number, query?: MarketplaceReviewQuery) {
  return useQuery({
    queryKey: marketplaceQueryKeys.productReviews(productId, query),
    enabled: Boolean(productId && productId > 0),
    queryFn: async () => {
      const response = await marketplaceApi.listProductReviews(productId ?? 0, query);
      return response.result;
    },
  });
}

export function useMarketplaceFarms(query?: MarketplaceFarmQuery) {
  return useQuery({
    queryKey: marketplaceQueryKeys.farms(query),
    queryFn: async () => {
      const response = await marketplaceApi.listFarms(query);
      return response.result;
    },
  });
}

export function useMarketplaceFarmDetail(farmId?: number) {
  return useQuery({
    queryKey: marketplaceQueryKeys.farm(farmId),
    enabled: Boolean(farmId && farmId > 0),
    queryFn: async () => {
      const response = await marketplaceApi.getFarmDetail(farmId ?? 0);
      return response.result;
    },
  });
}

export function useMarketplaceTraceability(productId?: number | null) {
  return useQuery({
    queryKey: marketplaceQueryKeys.traceability(productId),
    enabled: Boolean(productId && productId > 0),
    queryFn: async () => {
      const response = await marketplaceApi.getTraceability(productId ?? 0);
      return response.result;
    },
  });
}

export function useMarketplaceCart(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: marketplaceQueryKeys.cart(),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const response = await marketplaceApi.getCart();
      return response.result;
    },
  });
}

export function useMarketplaceAddCartItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: MarketplaceAddCartItemRequest) => {
      const response = await marketplaceApi.addCartItem(request);
      return response.result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.cart() });
    },
  });
}

export function useMarketplaceUpdateCartItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      request,
    }: {
      productId: number;
      request: MarketplaceUpdateCartItemRequest;
    }) => {
      const response = await marketplaceApi.updateCartItem(productId, request);
      return response.result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.cart() });
    },
  });
}

export function useMarketplaceRemoveCartItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: number) => {
      const response = await marketplaceApi.removeCartItem(productId);
      return response.result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.cart() });
    },
  });
}

export function useMarketplaceMergeCartMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: marketplaceApi.mergeCart,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.cart() });
    },
  });
}

export function useMarketplaceCreateOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: MarketplaceCreateOrderRequest) => {
      const response = await marketplaceApi.createOrder(request);
      return response.result;
    },
    onSuccess: async () => {
      await invalidateMarketplaceCheckoutQueries(queryClient);
    },
  });
}

export function useMarketplaceOrders(query?: MarketplaceOrderQuery) {
  return useQuery({
    queryKey: marketplaceQueryKeys.orders(query),
    queryFn: async () => {
      const response = await marketplaceApi.listOrders(query);
      return response.result;
    },
  });
}

export function useMarketplaceOrderDetail(orderId?: number) {
  return useQuery({
    queryKey: marketplaceQueryKeys.order(orderId),
    enabled: Boolean(orderId && orderId > 0),
    queryFn: async () => {
      const response = await marketplaceApi.getOrderDetail(orderId ?? 0);
      return response.result;
    },
  });
}

export function useMarketplaceCancelOrderMutation(orderId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await marketplaceApi.cancelOrder(orderId);
      return response.result;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.order(orderId) }),
        queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.ordersBase() }),
      ]);
    },
  });
}

export function useMarketplaceAddresses() {
  return useQuery({
    queryKey: marketplaceQueryKeys.addresses(),
    queryFn: async () => {
      const response = await marketplaceApi.listAddresses();
      return response.result;
    },
  });
}

export function useMarketplaceCreateAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: MarketplaceAddressUpsertRequest) => {
      const response = await marketplaceApi.createAddress(request);
      return response.result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.addresses() });
    },
  });
}

export function useMarketplaceUpdateAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      addressId,
      request,
    }: {
      addressId: number;
      request: MarketplaceAddressUpsertRequest;
    }) => {
      const response = await marketplaceApi.updateAddress(addressId, request);
      return response.result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.addresses() });
    },
  });
}

export function useMarketplaceDeleteAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (addressId: number) => {
      await marketplaceApi.deleteAddress(addressId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.addresses() });
    },
  });
}

export function useMarketplaceCreateReviewMutation(productId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: MarketplaceCreateReviewRequest) => {
      const response = await marketplaceApi.createReview(request);
      return response.result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: marketplaceQueryKeys.productReviews(productId),
      });
    },
  });
}

export function useMarketplaceOrdersByStatus(status?: MarketplaceOrderStatus) {
  return useMarketplaceOrders({
    status,
    page: 0,
    size: 20,
  });
}

export function useMarketplaceFarmerDashboard() {
  return useQuery({
    queryKey: marketplaceQueryKeys.farmerDashboard(),
    queryFn: async () => {
      const response = await marketplaceApi.getFarmerDashboard();
      return response.result;
    },
  });
}

export function useMarketplaceFarmerProducts(query?: MarketplaceFarmerProductQuery) {
  return useQuery({
    queryKey: marketplaceQueryKeys.farmerProducts(query),
    queryFn: async () => {
      const response = await marketplaceApi.listFarmerProducts(query);
      return response.result;
    },
  });
}

export function useMarketplaceCreateFarmerProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: MarketplaceFarmerProductUpsertRequest) => {
      const response = await marketplaceApi.createFarmerProduct(request);
      return response.result;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.farmerProductsBase() }),
        queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.farmerDashboard() }),
      ]);
    },
  });
}

export function useMarketplaceUpdateFarmerProductMutation(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: MarketplaceFarmerProductUpsertRequest) => {
      const response = await marketplaceApi.updateFarmerProduct(productId, request);
      return response.result;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.farmerProductsBase() }),
        queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.farmerProduct(productId) }),
      ]);
    },
  });
}

export function useMarketplaceUpdateFarmerProductStatusMutation(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: MarketplaceUpdateProductStatusRequest) => {
      const response = await marketplaceApi.updateFarmerProductStatus(productId, request);
      return response.result;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.farmerProductsBase() }),
        queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.farmerProduct(productId) }),
        queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.farmerDashboard() }),
      ]);
    },
  });
}

export function useMarketplaceFarmerOrders(query?: MarketplaceFarmerOrderQuery) {
  return useQuery({
    queryKey: marketplaceQueryKeys.farmerOrders(query),
    queryFn: async () => {
      const response = await marketplaceApi.listFarmerOrders(query);
      return response.result;
    },
  });
}

export function useMarketplaceFarmerOrderDetail(orderId?: number) {
  return useQuery({
    queryKey: marketplaceQueryKeys.farmerOrder(orderId),
    enabled: Boolean(orderId && orderId > 0),
    queryFn: async () => {
      const response = await marketplaceApi.getFarmerOrderDetail(orderId ?? 0);
      return response.result;
    },
  });
}

export function useMarketplaceUpdateFarmerOrderStatusMutation(orderId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: MarketplaceUpdateOrderStatusRequest) => {
      const response = await marketplaceApi.updateFarmerOrderStatus(orderId, request);
      return response.result;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.farmerOrdersBase() }),
        queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.farmerOrder(orderId) }),
        queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.farmerDashboard() }),
      ]);
    },
  });
}

export function useMarketplaceAdminProducts(query?: MarketplaceAdminProductQuery) {
  return useQuery({
    queryKey: marketplaceQueryKeys.adminProducts(query),
    queryFn: async () => {
      const response = await marketplaceApi.listAdminProducts(query);
      return response.result;
    },
  });
}

export function useMarketplaceUpdateAdminProductStatusMutation(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: MarketplaceUpdateProductStatusRequest) => {
      const response = await marketplaceApi.updateAdminProductStatus(productId, request);
      return response.result;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.adminProductsBase() }),
        queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.adminStats() }),
      ]);
    },
  });
}

export function useMarketplaceAdminOrders(query?: MarketplaceAdminOrderQuery) {
  return useQuery({
    queryKey: marketplaceQueryKeys.adminOrders(query),
    queryFn: async () => {
      const response = await marketplaceApi.listAdminOrders(query);
      return response.result;
    },
  });
}

export function useMarketplaceAdminOrderDetail(orderId?: number) {
  return useQuery({
    queryKey: marketplaceQueryKeys.adminOrder(orderId),
    enabled: Boolean(orderId && orderId > 0),
    queryFn: async () => {
      const response = await marketplaceApi.getAdminOrderDetail(orderId ?? 0);
      return response.result;
    },
  });
}

export function useMarketplaceAdminStats() {
  return useQuery({
    queryKey: marketplaceQueryKeys.adminStats(),
    queryFn: async () => {
      const response = await marketplaceApi.getAdminStats();
      return response.result;
    },
  });
}
