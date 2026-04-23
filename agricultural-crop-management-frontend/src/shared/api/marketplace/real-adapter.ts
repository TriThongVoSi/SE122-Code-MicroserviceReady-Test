import httpClient from '../http';
import type { MarketplaceApiAdapter } from './adapter';
import {
  MARKETPLACE_API_PREFIX,
  parseMarketplaceEnvelope,
  toMarketplaceClientError,
  type MarketplaceApiResponse,
} from './contracts';
import type {
  MarketplaceAddress,
  MarketplaceAdminOrderQuery,
  MarketplaceAdminProductQuery,
  MarketplaceAdminStats,
  MarketplaceAddressUpsertRequest,
  MarketplaceAddCartItemRequest,
  MarketplaceCart,
  MarketplaceCreateOrderRequest,
  MarketplaceCreateOrderResult,
  MarketplaceCreateReviewRequest,
  MarketplaceFarmerDashboard,
  MarketplaceFarmerOrderQuery,
  MarketplaceFarmerProductFormOptions,
  MarketplaceFarmerProductQuery,
  MarketplaceFarmerProductUpsertRequest,
  MarketplaceFarmDetail,
  MarketplaceFarmPage,
  MarketplaceFarmQuery,
  MarketplaceMergeCartRequest,
  MarketplaceOrder,
  MarketplaceOrderAuditLog,
  MarketplaceOrderPage,
  MarketplaceOrderQuery,
  MarketplaceProductDetail,
  MarketplaceProductPage,
  MarketplaceProductQuery,
  MarketplaceReview,
  MarketplaceReviewPage,
  MarketplaceReviewQuery,
  MarketplaceTraceability,
  MarketplaceUpdateOrderStatusRequest,
  MarketplaceUpdatePaymentVerificationRequest,
  MarketplaceUpdateProductStatusRequest,
  MarketplaceUpdateCartItemRequest,
} from './types';

async function requestEnvelope<T>(
  execute: () => Promise<{ data: unknown }>,
): Promise<MarketplaceApiResponse<T>> {
  try {
    const response = await execute();
    return parseMarketplaceEnvelope<T>(response.data);
  } catch (error) {
    throw toMarketplaceClientError(error);
  }
}

export function createMarketplaceRealAdapter(): MarketplaceApiAdapter {
  return {
    listProducts(query?: MarketplaceProductQuery) {
      return requestEnvelope<MarketplaceProductPage>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/products`, { params: query }),
      );
    },

    getProductBySlug(slug: string) {
      return requestEnvelope<MarketplaceProductDetail>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/products/${encodeURIComponent(slug)}`),
      );
    },

    listProductReviews(productId: number, query?: MarketplaceReviewQuery) {
      return requestEnvelope<MarketplaceReviewPage>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/products/${productId}/reviews`, {
          params: query,
        }),
      );
    },

    listFarms(query?: MarketplaceFarmQuery) {
      return requestEnvelope<MarketplaceFarmPage>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/farms`, { params: query }),
      );
    },

    getFarmDetail(farmId: number) {
      return requestEnvelope<MarketplaceFarmDetail>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/farms/${farmId}`),
      );
    },

    getTraceability(productId: number) {
      return requestEnvelope<MarketplaceTraceability>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/traceability/${productId}`),
      );
    },

    getCart() {
      return requestEnvelope<MarketplaceCart>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/cart`),
      );
    },

    addCartItem(request: MarketplaceAddCartItemRequest) {
      return requestEnvelope<MarketplaceCart>(() =>
        httpClient.post(`${MARKETPLACE_API_PREFIX}/cart/items`, request),
      );
    },

    updateCartItem(productId: number, request: MarketplaceUpdateCartItemRequest) {
      return requestEnvelope<MarketplaceCart>(() =>
        httpClient.put(`${MARKETPLACE_API_PREFIX}/cart/items/${productId}`, request),
      );
    },

    removeCartItem(productId: number) {
      return requestEnvelope<MarketplaceCart>(() =>
        httpClient.delete(`${MARKETPLACE_API_PREFIX}/cart/items/${productId}`),
      );
    },

    mergeCart(request: MarketplaceMergeCartRequest) {
      return requestEnvelope<MarketplaceCart>(() =>
        httpClient.post(`${MARKETPLACE_API_PREFIX}/cart/merge`, request),
      );
    },

    createOrder(request: MarketplaceCreateOrderRequest) {
      return requestEnvelope<MarketplaceCreateOrderResult>(() =>
        httpClient.post(`${MARKETPLACE_API_PREFIX}/orders`, request, {
          headers: {
            'X-Idempotency-Key': request.idempotencyKey,
          },
        }),
      );
    },

    listOrders(query?: MarketplaceOrderQuery) {
      return requestEnvelope<MarketplaceOrderPage>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/orders`, { params: query }),
      );
    },

    getOrderDetail(orderId: number) {
      return requestEnvelope<MarketplaceOrder>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/orders/${orderId}`),
      );
    },

    cancelOrder(orderId: number) {
      return requestEnvelope<MarketplaceOrder>(() =>
        httpClient.put(`${MARKETPLACE_API_PREFIX}/orders/${orderId}/cancel`),
      );
    },

    uploadOrderPaymentProof(orderId: number, file: File) {
      const formData = new FormData();
      formData.append("file", file);
      return requestEnvelope<MarketplaceOrder>(() =>
        httpClient.post(`${MARKETPLACE_API_PREFIX}/orders/${orderId}/payment-proof`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }),
      );
    },

    listAddresses() {
      return requestEnvelope<MarketplaceAddress[]>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/addresses`),
      );
    },

    createAddress(request: MarketplaceAddressUpsertRequest) {
      return requestEnvelope<MarketplaceAddress>(() =>
        httpClient.post(`${MARKETPLACE_API_PREFIX}/addresses`, request),
      );
    },

    updateAddress(addressId: number, request: MarketplaceAddressUpsertRequest) {
      return requestEnvelope<MarketplaceAddress>(() =>
        httpClient.put(`${MARKETPLACE_API_PREFIX}/addresses/${addressId}`, request),
      );
    },

    deleteAddress(addressId: number) {
      return requestEnvelope<null>(() =>
        httpClient.delete(`${MARKETPLACE_API_PREFIX}/addresses/${addressId}`),
      );
    },

    createReview(request: MarketplaceCreateReviewRequest) {
      return requestEnvelope<MarketplaceReview>(() =>
        httpClient.post(`${MARKETPLACE_API_PREFIX}/reviews`, request),
      );
    },

    getFarmerDashboard() {
      return requestEnvelope<MarketplaceFarmerDashboard>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/farmer/dashboard`),
      );
    },

    listFarmerProducts(query?: MarketplaceFarmerProductQuery) {
      return requestEnvelope<MarketplaceProductPage>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/farmer/products`, { params: query }),
      );
    },

    getFarmerProductFormOptions() {
      return requestEnvelope<MarketplaceFarmerProductFormOptions>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/farmer/product-form-options`),
      );
    },

    getFarmerProductDetail(productId: number) {
      return requestEnvelope<MarketplaceProductDetail>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/farmer/products/${productId}`),
      );
    },

    createFarmerProduct(request: MarketplaceFarmerProductUpsertRequest) {
      return requestEnvelope<MarketplaceProductDetail>(() =>
        httpClient.post(`${MARKETPLACE_API_PREFIX}/farmer/products`, request),
      );
    },

    updateFarmerProduct(productId: number, request: MarketplaceFarmerProductUpsertRequest) {
      return requestEnvelope<MarketplaceProductDetail>(() =>
        httpClient.put(`${MARKETPLACE_API_PREFIX}/farmer/products/${productId}`, request),
      );
    },

    updateFarmerProductStatus(productId: number, request: MarketplaceUpdateProductStatusRequest) {
      return requestEnvelope<MarketplaceProductDetail>(() =>
        httpClient.patch(`${MARKETPLACE_API_PREFIX}/farmer/products/${productId}/status`, request),
      );
    },

    listFarmerOrders(query?: MarketplaceFarmerOrderQuery) {
      return requestEnvelope<MarketplaceOrderPage>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/farmer/orders`, { params: query }),
      );
    },

    getFarmerOrderDetail(orderId: number) {
      return requestEnvelope<MarketplaceOrder>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/farmer/orders/${orderId}`),
      );
    },

    updateFarmerOrderStatus(orderId: number, request: MarketplaceUpdateOrderStatusRequest) {
      return requestEnvelope<MarketplaceOrder>(() =>
        httpClient.patch(`${MARKETPLACE_API_PREFIX}/farmer/orders/${orderId}/status`, request),
      );
    },

    listAdminProducts(query?: MarketplaceAdminProductQuery) {
      return requestEnvelope<MarketplaceProductPage>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/admin/products`, { params: query }),
      );
    },

    updateAdminProductStatus(productId: number, request: MarketplaceUpdateProductStatusRequest) {
      return requestEnvelope<MarketplaceProductDetail>(() =>
        httpClient.patch(`${MARKETPLACE_API_PREFIX}/admin/products/${productId}/status`, request),
      );
    },

    listAdminOrders(query?: MarketplaceAdminOrderQuery) {
      return requestEnvelope<MarketplaceOrderPage>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/admin/orders`, { params: query }),
      );
    },

    getAdminOrderDetail(orderId: number) {
      return requestEnvelope<MarketplaceOrder>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/admin/orders/${orderId}`),
      );
    },

    updateAdminOrderPaymentVerification(orderId: number, request: MarketplaceUpdatePaymentVerificationRequest) {
      return requestEnvelope<MarketplaceOrder>(() =>
        httpClient.patch(`${MARKETPLACE_API_PREFIX}/admin/orders/${orderId}/payment-verification`, request),
      );
    },

    updateAdminOrderStatus(orderId: number, request: MarketplaceUpdateOrderStatusRequest) {
      return requestEnvelope<MarketplaceOrder>(() =>
        httpClient.patch(`${MARKETPLACE_API_PREFIX}/admin/orders/${orderId}/status`, request),
      );
    },

    listAdminOrderAuditLogs(orderId: number) {
      return requestEnvelope<MarketplaceOrderAuditLog[]>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/admin/orders/${orderId}/audit-logs`),
      );
    },

    getAdminStats() {
      return requestEnvelope<MarketplaceAdminStats>(() =>
        httpClient.get(`${MARKETPLACE_API_PREFIX}/admin/stats`),
      );
    },
  };
}
