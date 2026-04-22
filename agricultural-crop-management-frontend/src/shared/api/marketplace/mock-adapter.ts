import type { MarketplaceApiAdapter } from "./adapter";
import {
  MarketplaceApiClientError,
  okMarketplaceResponse,
  type MarketplacePage,
} from "./contracts";
import type {
  MarketplaceAddress,
  MarketplaceAdminStats,
  MarketplaceAddressUpsertRequest,
  MarketplaceAddCartItemRequest,
  MarketplaceCart,
  MarketplaceCartItem,
  MarketplaceCreateOrderRequest,
  MarketplaceCreateOrderResult,
  MarketplaceCreateReviewRequest,
  MarketplaceFarmerDashboard,
  MarketplaceFarmerProductUpsertRequest,
  MarketplaceFarmDetail,
  MarketplaceFarmSummary,
  MarketplaceMergeCartRequest,
  MarketplaceOrder,
  MarketplaceOrderAuditLog,
  MarketplaceOrderItem,
  MarketplaceOrderStatus,
  MarketplacePaymentMethod,
  MarketplacePaymentVerificationStatus,
  MarketplaceProductDetail,
  MarketplaceProductSummary,
  MarketplaceProductStatus,
  MarketplaceReview,
  MarketplaceUpdateOrderStatusRequest,
  MarketplaceUpdatePaymentVerificationRequest,
  MarketplaceUpdateProductStatusRequest,
  MarketplaceUpdateCartItemRequest,
} from "./types";

type MarketplaceMockOptions = {
  fallbackUserId?: number;
};

type SeasonRef = {
  id: number;
  name: string;
  startDate: string;
  plannedHarvestDate: string;
};

type LotRef = {
  id: number;
  lotCode: string;
  harvestedAt: string;
  unit: string;
  initialQuantity: number;
};

const DEFAULT_FALLBACK_USER_ID = 2;

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeString(value: string | undefined | null): string {
  return (value ?? "").trim();
}

function paginate<T>(items: T[], page = 0, size = 20): MarketplacePage<T> {
  const normalizedPage = Math.max(page, 0);
  const normalizedSize = Math.max(size, 1);
  const start = normalizedPage * normalizedSize;
  const end = start + normalizedSize;
  const slice = items.slice(start, end);

  return {
    items: slice,
    page: normalizedPage,
    size: normalizedSize,
    totalElements: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / normalizedSize)),
  };
}

function hashPayload(payload: unknown): string {
  return JSON.stringify(payload);
}

function assertPositiveQuantity(quantity: number): void {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new MarketplaceApiClientError(
      "Quantity must be greater than 0.",
      "ERR_MARKETPLACE_INVALID_QUANTITY",
      400,
    );
  }
}

function assertHasText(value: string, code: string, message: string): void {
  if (!value.trim()) {
    throw new MarketplaceApiClientError(message, code, 400);
  }
}

function getAuthStorage():
  | {
      token?: string;
      user?: {
        id?: number;
      };
    }
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw =
    window.localStorage.getItem("acm_auth") ??
    window.sessionStorage.getItem("acm_auth");

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as {
      token?: string;
      user?: {
        id?: number;
      };
    };
  } catch {
    return null;
  }
}

function asPublishedProduct(product: MarketplaceProductDetail): MarketplaceProductSummary {
  const {
    description: _description,
    imageUrls: _imageUrls,
    traceabilityCode: _traceabilityCode,
    ...summary
  } = product;
  return summary;
}

export function createMarketplaceMockAdapter(
  options: MarketplaceMockOptions = {},
): MarketplaceApiAdapter {
  const fallbackUserId = options.fallbackUserId ?? DEFAULT_FALLBACK_USER_ID;

  const farms: MarketplaceFarmDetail[] = [
    {
      id: 101,
      name: "Phu Dien Farm",
      region: "Binh Duong",
      address: "Ward 25112, Binh Duong",
      coverImageUrl: "https://picsum.photos/seed/acm-farm-101/1200/800",
      productCount: 2,
      description: "Vegetable and rice mixed farm with controlled traceability.",
      ownerUserId: 2,
      ownerDisplayName: "Nguyen Van Farmer",
      contactPhone: "0901234567",
    },
    {
      id: 102,
      name: "An Phat Farm",
      region: "Lam Dong",
      address: "Ward 25112, Lam Dong",
      coverImageUrl: "https://picsum.photos/seed/acm-farm-102/1200/800",
      productCount: 2,
      description: "Fruit and hydroponic products for marketplace channels.",
      ownerUserId: 5,
      ownerDisplayName: "Tran Thi Farmer",
      contactPhone: "0902234567",
    },
  ];

  const seasons = new Map<number, SeasonRef>([
    [
      301,
      {
        id: 301,
        name: "Soybean Spring 2026",
        startDate: "2026-02-15",
        plannedHarvestDate: "2026-05-20",
      },
    ],
    [
      302,
      {
        id: 302,
        name: "Rice Winter-Spring 2026",
        startDate: "2025-12-20",
        plannedHarvestDate: "2026-03-15",
      },
    ],
  ]);

  const lots = new Map<number, LotRef>([
    [
      401,
      {
        id: 401,
        lotCode: "LOT-SOY-2026-001",
        harvestedAt: "2026-03-10",
        unit: "kg",
        initialQuantity: 280,
      },
    ],
    [
      402,
      {
        id: 402,
        lotCode: "LOT-RICE-2026-001",
        harvestedAt: "2026-02-28",
        unit: "kg",
        initialQuantity: 900,
      },
    ],
    [
      403,
      {
        id: 403,
        lotCode: "LOT-FRUIT-2026-001",
        harvestedAt: "2026-03-12",
        unit: "kg",
        initialQuantity: 320,
      },
    ],
  ]);

  let nextOrderId = 1;
  let nextOrderItemId = 1;
  let nextAddressId = 1000;
  let nextReviewId = 5000;

  const products: MarketplaceProductDetail[] = [
    {
      id: 201,
      slug: "vietgap-cherry-tomato",
      name: "VietGAP Cherry Tomato",
      category: "Vegetable",
      shortDescription: "Fresh greenhouse tomato.",
      description:
        "Daily harvested tomato from protected farming area with full lot tracking.",
      price: 45000,
      unit: "kg",
      stock: 160,
      imageUrl: "https://picsum.photos/seed/acm-product-201/800/800",
      imageUrls: [
        "https://picsum.photos/seed/acm-product-201/800/800",
        "https://picsum.photos/seed/acm-product-201-2/800/800",
      ],
      farmerUserId: 2,
      farmerDisplayName: "Nguyen Van Farmer",
      farmId: 101,
      farmName: "Phu Dien Farm",
      seasonId: 301,
      seasonName: "Soybean Spring 2026",
      lotId: 401,
      region: "Binh Duong",
      traceable: true,
      traceabilityCode: "LOT-SOY-2026-001",
      ratingAverage: 4.7,
      ratingCount: 19,
      status: "PUBLISHED",
      createdAt: "2026-03-18T08:00:00.000Z",
      updatedAt: "2026-03-18T08:00:00.000Z",
    },
    {
      id: 202,
      slug: "premium-rice-bag",
      name: "Premium Rice Bag",
      category: "Grain",
      shortDescription: "Fragrant rice from winter-spring crop.",
      description: "5kg rice bag from tracked season and warehouse lot.",
      price: 180000,
      unit: "bag",
      stock: 90,
      imageUrl: "https://picsum.photos/seed/acm-product-202/800/800",
      imageUrls: ["https://picsum.photos/seed/acm-product-202/800/800"],
      farmerUserId: 2,
      farmerDisplayName: "Nguyen Van Farmer",
      farmId: 101,
      farmName: "Phu Dien Farm",
      seasonId: 302,
      seasonName: "Rice Winter-Spring 2026",
      lotId: 402,
      region: "Binh Duong",
      traceable: true,
      traceabilityCode: "LOT-RICE-2026-001",
      ratingAverage: 4.8,
      ratingCount: 11,
      status: "PUBLISHED",
      createdAt: "2026-03-18T08:10:00.000Z",
      updatedAt: "2026-03-18T08:10:00.000Z",
    },
    {
      id: 203,
      slug: "hydroponic-lettuce",
      name: "Hydroponic Lettuce",
      category: "Vegetable",
      shortDescription: "Hydroponic lettuce pack.",
      description: "Clean lettuce with controlled nutrition process.",
      price: 30000,
      unit: "pack",
      stock: 220,
      imageUrl: "https://picsum.photos/seed/acm-product-203/800/800",
      imageUrls: ["https://picsum.photos/seed/acm-product-203/800/800"],
      farmerUserId: 5,
      farmerDisplayName: "Tran Thi Farmer",
      farmId: 102,
      farmName: "An Phat Farm",
      seasonId: null,
      seasonName: null,
      lotId: null,
      region: "Lam Dong",
      traceable: false,
      traceabilityCode: null,
      ratingAverage: 4.6,
      ratingCount: 7,
      status: "PUBLISHED",
      createdAt: "2026-03-18T08:20:00.000Z",
      updatedAt: "2026-03-18T08:20:00.000Z",
    },
    {
      id: 204,
      slug: "durian-ri6-fresh",
      name: "Durian Ri6 Fresh",
      category: "Fruit",
      shortDescription: "Fresh durian from certified lot.",
      description: "Premium fruit harvested from monitored lot and season.",
      price: 120000,
      unit: "kg",
      stock: 60,
      imageUrl: "https://picsum.photos/seed/acm-product-204/800/800",
      imageUrls: ["https://picsum.photos/seed/acm-product-204/800/800"],
      farmerUserId: 5,
      farmerDisplayName: "Tran Thi Farmer",
      farmId: 102,
      farmName: "An Phat Farm",
      seasonId: 301,
      seasonName: "Soybean Spring 2026",
      lotId: 403,
      region: "Lam Dong",
      traceable: true,
      traceabilityCode: "LOT-FRUIT-2026-001",
      ratingAverage: 4.9,
      ratingCount: 13,
      status: "PUBLISHED",
      createdAt: "2026-03-18T08:30:00.000Z",
      updatedAt: "2026-03-18T08:30:00.000Z",
    },
  ];

  const reviews: MarketplaceReview[] = [
    {
      id: 4001,
      productId: 201,
      orderId: 1,
      buyerUserId: fallbackUserId,
      buyerDisplayName: "Marketplace User",
      rating: 5,
      comment: "Fresh and quality product.",
      createdAt: "2026-03-18T09:00:00.000Z",
    },
  ];

  const carts = new Map<number, MarketplaceCartItem[]>();
  const orders = new Map<number, MarketplaceOrder[]>();
  const idempotency = new Map<
    string,
    {
      fingerprint: string;
      result: MarketplaceCreateOrderResult;
    }
  >();

  const addresses = new Map<number, MarketplaceAddress[]>([
    [
      fallbackUserId,
      [
        {
          id: 9001,
          userId: fallbackUserId,
          fullName: "Marketplace User",
          phone: "0909000001",
          province: "Ho Chi Minh",
          district: "District 1",
          ward: "Ben Nghe",
          street: "12 Le Loi",
          detail: "Floor 2",
          label: "home",
          isDefault: true,
        },
      ],
    ],
  ]);

  function resolveAuthenticatedUserId(): number {
    const stored = getAuthStorage();
    if (!stored?.token) {
      throw new MarketplaceApiClientError(
        "Authentication is required.",
        "ERR_UNAUTHENTICATED",
        401,
      );
    }

    const userId = stored.user?.id;
    if (typeof userId !== "number" || userId <= 0) {
      throw new MarketplaceApiClientError(
        "Invalid authenticated user context.",
        "ERR_UNAUTHENTICATED",
        401,
      );
    }
    return userId;
  }

  function getOrInitCart(userId: number): MarketplaceCartItem[] {
    if (!carts.has(userId)) {
      carts.set(userId, []);
    }
    return carts.get(userId) ?? [];
  }

  function buildCart(userId: number): MarketplaceCart {
    const items = getOrInitCart(userId);
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return {
      userId,
      items: [...items],
      itemCount,
      subtotal,
      currency: "VND",
    };
  }

  function findPublishedProduct(productId: number): MarketplaceProductDetail {
    const product = products.find(
      (candidate) =>
        candidate.id === productId && candidate.status === ("PUBLISHED" as MarketplaceProductStatus),
    );
    if (!product) {
      throw new MarketplaceApiClientError(
        "Product is not available.",
        "ERR_MARKETPLACE_PRODUCT_NOT_FOUND",
        404,
      );
    }
    return product;
  }

  function toOrderStatusCanCancel(status: MarketplaceOrderStatus): boolean {
    return status === "PENDING" || status === "CONFIRMED";
  }

  function createOrderPayment(method: MarketplacePaymentMethod) {
    const verificationStatus: MarketplacePaymentVerificationStatus =
      method === "BANK_TRANSFER" ? "AWAITING_PROOF" : "NOT_REQUIRED";
    return {
      method,
      verificationStatus,
      proofFileName: null,
      proofContentType: null,
      proofStoragePath: null,
      proofUploadedAt: null,
      verifiedAt: null,
      verifiedBy: null,
      verificationNote: null,
    };
  }

  function ensureTraceabilityChain(product: MarketplaceProductDetail): void {
    if (!product.traceable) {
      return;
    }
    if (!product.farmId || !product.seasonId || !product.lotId) {
      throw new MarketplaceApiClientError(
        "Traceability chain is incomplete for this product.",
        "ERR_MARKETPLACE_TRACEABILITY_CHAIN_INVALID",
        409,
      );
    }
  }

  function recalculateProductRating(productId: number): void {
    const product = products.find((candidate) => candidate.id === productId);
    if (!product) {
      return;
    }
    const productReviews = reviews.filter((review) => review.productId === productId);
    if (productReviews.length === 0) {
      product.ratingAverage = 0;
      product.ratingCount = 0;
      return;
    }
    const sum = productReviews.reduce((acc, review) => acc + review.rating, 0);
    product.ratingAverage = Number((sum / productReviews.length).toFixed(2));
    product.ratingCount = productReviews.length;
    product.updatedAt = nowIso();
  }

  function allOrdersFlat(): MarketplaceOrder[] {
    return Array.from(orders.values()).flatMap((orderList) => orderList);
  }

  function normalizeStatusTransitionForFarmer(
    current: MarketplaceOrderStatus,
    target: MarketplaceOrderStatus,
  ): boolean {
    if (current === target) return true;
    switch (current) {
      case "PENDING":
        return target === "CONFIRMED" || target === "CANCELLED";
      case "CONFIRMED":
        return target === "PREPARING" || target === "CANCELLED";
      case "PREPARING":
        return target === "DELIVERING";
      case "DELIVERING":
        return target === "COMPLETED";
      default:
        return false;
    }
  }

  function normalizeStatusTransitionForFarmerProduct(
    current: MarketplaceProductStatus,
    target: MarketplaceProductStatus,
  ): boolean {
    if (current === target) return true;
    if (current === "DRAFT") return target === "PENDING_REVIEW";
    if (current === "PENDING_REVIEW") return target === "DRAFT";
    if (current === "PUBLISHED") return target === "HIDDEN";
    if (current === "HIDDEN") return target === "PENDING_REVIEW";
    return false;
  }

  function normalizeStatusTransitionForAdminProduct(
    current: MarketplaceProductStatus,
    target: MarketplaceProductStatus,
  ): boolean {
    if (current === target) return true;
    if (current === "DRAFT") return target === "PENDING_REVIEW" || target === "HIDDEN";
    if (current === "PENDING_REVIEW") return target === "PUBLISHED" || target === "HIDDEN";
    if (current === "PUBLISHED") return target === "HIDDEN";
    if (current === "HIDDEN") return target === "PENDING_REVIEW" || target === "PUBLISHED";
    return false;
  }

  function slugify(value: string): string {
    const slug = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return slug || "product";
  }

  function generateUniqueSlug(baseName: string, excludeProductId?: number): string {
    const base = slugify(baseName);
    let next = base;
    let suffix = 2;
    while (
      products.some(
        (product) => product.slug === next && (excludeProductId == null || product.id !== excludeProductId),
      )
    ) {
      next = `${base}-${suffix}`;
      suffix += 1;
    }
    return next;
  }

  return {
    async listProducts(query) {
      const normalizedSearch = normalizeString(query?.q).toLowerCase();

      const filtered = products
        .filter((product) => product.status === "PUBLISHED")
        .filter((product) => {
          if (query?.traceable === true && !product.traceable) {
            return false;
          }
          if (query?.traceable === false && product.traceable) {
            return false;
          }
          if (query?.category && query.category !== product.category) {
            return false;
          }
          if (!normalizedSearch) {
            return true;
          }
          return (
            product.name.toLowerCase().includes(normalizedSearch) ||
            product.shortDescription.toLowerCase().includes(normalizedSearch) ||
            product.farmName?.toLowerCase().includes(normalizedSearch) === true
          );
        });

      const sorted = [...filtered];
      switch (query?.sort) {
        case "price_asc":
          sorted.sort((left, right) => left.price - right.price);
          break;
        case "price_desc":
          sorted.sort((left, right) => right.price - left.price);
          break;
        case "newest":
        default:
          sorted.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      }

      const page = paginate(
        sorted.map(asPublishedProduct),
        query?.page,
        query?.size,
      );
      return okMarketplaceResponse(page);
    },

    async getProductBySlug(slug) {
      const product = products.find(
        (candidate) =>
          candidate.slug === slug && candidate.status === ("PUBLISHED" as MarketplaceProductStatus),
      );
      if (!product) {
        throw new MarketplaceApiClientError(
          "Product does not exist.",
          "ERR_MARKETPLACE_PRODUCT_NOT_FOUND",
          404,
        );
      }

      ensureTraceabilityChain(product);
      return okMarketplaceResponse(product);
    },

    async listProductReviews(productId, query) {
      findPublishedProduct(productId);
      const productReviews = reviews
        .filter((review) => review.productId === productId)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

      const page = paginate(productReviews, query?.page, query?.size);
      return okMarketplaceResponse(page);
    },

    async listFarms(query) {
      const normalizedSearch = normalizeString(query?.q).toLowerCase();
      const normalizedRegion = normalizeString(query?.region).toLowerCase();

      const farmSummaries: MarketplaceFarmSummary[] = farms
        .filter((farm) => {
          if (normalizedRegion && farm.region?.toLowerCase() !== normalizedRegion) {
            return false;
          }
          if (!normalizedSearch) {
            return true;
          }
          return (
            farm.name.toLowerCase().includes(normalizedSearch) ||
            farm.description?.toLowerCase().includes(normalizedSearch) === true
          );
        })
        .map((farm) => ({
          id: farm.id,
          name: farm.name,
          region: farm.region,
          address: farm.address,
          coverImageUrl: farm.coverImageUrl,
          productCount: products.filter(
            (product) =>
              product.farmId === farm.id &&
              product.status === ("PUBLISHED" as MarketplaceProductStatus),
          ).length,
        }));

      const page = paginate(farmSummaries, query?.page, query?.size);
      return okMarketplaceResponse(page);
    },

    async getFarmDetail(farmId) {
      const farm = farms.find((candidate) => candidate.id === farmId);
      if (!farm) {
        throw new MarketplaceApiClientError(
          "Farm does not exist.",
          "ERR_FARM_NOT_FOUND",
          404,
        );
      }
      return okMarketplaceResponse(farm);
    },

    async getTraceability(productId) {
      const product = findPublishedProduct(productId);
      ensureTraceabilityChain(product);

      if (!product.traceable) {
        return okMarketplaceResponse({
          productId: product.id,
          traceable: false,
          farm: null,
          season: null,
          lot: null,
          validatedAt: nowIso(),
        });
      }

      const farm = farms.find((candidate) => candidate.id === product.farmId);
      const season = product.seasonId ? seasons.get(product.seasonId) : null;
      const lot = product.lotId ? lots.get(product.lotId) : null;

      if (!farm || !season || !lot) {
        throw new MarketplaceApiClientError(
          "Traceability chain is invalid.",
          "ERR_MARKETPLACE_TRACEABILITY_CHAIN_INVALID",
          409,
        );
      }

      return okMarketplaceResponse({
        productId: product.id,
        traceable: true,
        farm: {
          id: farm.id,
          name: farm.name,
          region: farm.region,
          address: farm.address,
        },
        season,
        lot,
        validatedAt: nowIso(),
      });
    },

    async getCart() {
      const userId = resolveAuthenticatedUserId();
      return okMarketplaceResponse(buildCart(userId));
    },

    async addCartItem(request: MarketplaceAddCartItemRequest) {
      const userId = resolveAuthenticatedUserId();
      assertPositiveQuantity(request.quantity);
      const product = findPublishedProduct(request.productId);
      const cartItems = getOrInitCart(userId);
      const existing = cartItems.find((item) => item.productId === request.productId);
      const targetQuantity = (existing?.quantity ?? 0) + request.quantity;

      if (targetQuantity > product.stock) {
        throw new MarketplaceApiClientError(
          "Insufficient stock.",
          "ERR_MARKETPLACE_STOCK_CONFLICT",
          409,
        );
      }

      if (existing) {
        existing.quantity = targetQuantity;
      } else {
        cartItems.push({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          imageUrl: product.imageUrl,
          unitPrice: product.price,
          quantity: request.quantity,
          maxQuantity: product.stock,
          farmerUserId: product.farmerUserId,
          traceable: product.traceable,
        });
      }

      return okMarketplaceResponse(buildCart(userId));
    },

    async updateCartItem(productId, request: MarketplaceUpdateCartItemRequest) {
      const userId = resolveAuthenticatedUserId();
      assertPositiveQuantity(request.quantity);
      const product = findPublishedProduct(productId);
      const cartItems = getOrInitCart(userId);
      const existing = cartItems.find((item) => item.productId === productId);
      if (!existing) {
        throw new MarketplaceApiClientError(
          "Cart item not found.",
          "ERR_MARKETPLACE_CART_ITEM_NOT_FOUND",
          404,
        );
      }
      if (request.quantity > product.stock) {
        throw new MarketplaceApiClientError(
          "Insufficient stock.",
          "ERR_MARKETPLACE_STOCK_CONFLICT",
          409,
        );
      }
      existing.quantity = request.quantity;
      existing.maxQuantity = product.stock;
      return okMarketplaceResponse(buildCart(userId));
    },

    async removeCartItem(productId) {
      const userId = resolveAuthenticatedUserId();
      const cartItems = getOrInitCart(userId);
      carts.set(
        userId,
        cartItems.filter((item) => item.productId !== productId),
      );
      return okMarketplaceResponse(buildCart(userId));
    },

    async mergeCart(request: MarketplaceMergeCartRequest) {
      const userId = resolveAuthenticatedUserId();
      const cartItems = getOrInitCart(userId);

      for (const item of request.items) {
        assertPositiveQuantity(item.quantity);
        const product = findPublishedProduct(item.productId);
        const existing = cartItems.find((candidate) => candidate.productId === item.productId);
        const mergedQuantity = (existing?.quantity ?? 0) + item.quantity;

        if (mergedQuantity > product.stock) {
          throw new MarketplaceApiClientError(
            `Insufficient stock for product ${product.name}.`,
            "ERR_MARKETPLACE_STOCK_CONFLICT",
            409,
          );
        }

        if (existing) {
          existing.quantity = mergedQuantity;
          existing.maxQuantity = product.stock;
        } else {
          cartItems.push({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            imageUrl: product.imageUrl,
            unitPrice: product.price,
            quantity: item.quantity,
            maxQuantity: product.stock,
            farmerUserId: product.farmerUserId,
            traceable: product.traceable,
          });
        }
      }

      return okMarketplaceResponse(buildCart(userId));
    },

    async createOrder(request: MarketplaceCreateOrderRequest) {
      const userId = resolveAuthenticatedUserId();
      assertHasText(
        request.idempotencyKey,
        "ERR_MARKETPLACE_IDEMPOTENCY_KEY_REQUIRED",
        "Idempotency key is required.",
      );

      const cart = getOrInitCart(userId);
      if (cart.length === 0) {
        throw new MarketplaceApiClientError(
          "Cart is empty.",
          "ERR_MARKETPLACE_CART_EMPTY",
          400,
        );
      }

      const idempotencySlot = `${userId}:${request.idempotencyKey}`;
      const fingerprint = hashPayload({
        paymentMethod: request.paymentMethod,
        addressId: request.addressId ?? null,
        shippingRecipientName: request.shippingRecipientName ?? null,
        shippingPhone: request.shippingPhone ?? null,
        shippingAddressLine: request.shippingAddressLine ?? null,
        note: request.note ?? null,
        cart: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      const existingRequest = idempotency.get(idempotencySlot);
      if (existingRequest) {
        if (existingRequest.fingerprint !== fingerprint) {
          throw new MarketplaceApiClientError(
            "Idempotency key was already used with another payload.",
            "ERR_MARKETPLACE_IDEMPOTENCY_CONFLICT",
            409,
          );
        }
        return okMarketplaceResponse(existingRequest.result);
      }

      const userAddresses = addresses.get(userId) ?? [];
      const selectedAddress =
        (request.addressId
          ? userAddresses.find((address) => address.id === request.addressId)
          : userAddresses.find((address) => address.isDefault)) ?? null;

      const shippingRecipientName =
        normalizeString(request.shippingRecipientName) || selectedAddress?.fullName || "";
      const shippingPhone =
        normalizeString(request.shippingPhone) || selectedAddress?.phone || "";
      const shippingAddressLine =
        normalizeString(request.shippingAddressLine) ||
        (selectedAddress
          ? `${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`
          : "");

      assertHasText(
        shippingRecipientName,
        "ERR_MARKETPLACE_ADDRESS_REQUIRED",
        "Shipping recipient is required.",
      );
      assertHasText(
        shippingPhone,
        "ERR_MARKETPLACE_ADDRESS_REQUIRED",
        "Shipping phone is required.",
      );
      assertHasText(
        shippingAddressLine,
        "ERR_MARKETPLACE_ADDRESS_REQUIRED",
        "Shipping address is required.",
      );

      for (const cartItem of cart) {
        const product = findPublishedProduct(cartItem.productId);
        if (product.stock < cartItem.quantity) {
          throw new MarketplaceApiClientError(
            `Insufficient stock for product ${product.name}.`,
            "ERR_MARKETPLACE_STOCK_CONFLICT",
            409,
          );
        }
      }

      const groupedItems = new Map<number, MarketplaceCartItem[]>();
      for (const cartItem of cart) {
        const group = groupedItems.get(cartItem.farmerUserId) ?? [];
        group.push(cartItem);
        groupedItems.set(cartItem.farmerUserId, group);
      }

      const orderGroupCode = `MOG-${Date.now()}`;
      const createdOrders: MarketplaceOrder[] = [];

      for (const [farmerUserId, groupedCartItems] of groupedItems.entries()) {
        const orderItems: MarketplaceOrderItem[] = groupedCartItems.map((cartItem) => {
          const product = findPublishedProduct(cartItem.productId);
          const lineTotal = product.price * cartItem.quantity;

          return {
            id: nextOrderItemId++,
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            imageUrl: product.imageUrl,
            unitPriceSnapshot: product.price,
            quantity: cartItem.quantity,
            lineTotal,
            traceableSnapshot: product.traceable,
            canReview: false,
            reviewId: null,
          };
        });

        const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
        const shippingFee = 20000;
        const totalAmount = subtotal + shippingFee;
        const orderCode = `MO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(nextOrderId).padStart(6, "0")}`;
        const createdAt = nowIso();

        const order: MarketplaceOrder = {
          id: nextOrderId++,
          orderCode,
          orderGroupCode,
          buyerUserId: userId,
          farmerUserId,
          status: "PENDING",
          payment:
            request.paymentMethod === ("BANK_TRANSFER" as MarketplacePaymentMethod)
              ? createOrderPayment("BANK_TRANSFER")
              : createOrderPayment("COD"),
          shippingRecipientName,
          shippingPhone,
          shippingAddressLine,
          note: normalizeString(request.note) || null,
          subtotal,
          shippingFee,
          totalAmount,
          canCancel: true,
          createdAt,
          updatedAt: createdAt,
          items: orderItems,
        };

        createdOrders.push(order);
      }

      for (const cartItem of cart) {
        const product = findPublishedProduct(cartItem.productId);
        product.stock -= cartItem.quantity;
        product.updatedAt = nowIso();
      }

      const existingOrders = orders.get(userId) ?? [];
      orders.set(userId, [...createdOrders, ...existingOrders]);
      carts.set(userId, []);

      const result: MarketplaceCreateOrderResult = {
        orderGroupCode,
        splitCount: createdOrders.length,
        orders: createdOrders,
      };

      idempotency.set(idempotencySlot, {
        fingerprint,
        result,
      });

      return okMarketplaceResponse(result, "Order created.");
    },

    async listOrders(query) {
      const userId = resolveAuthenticatedUserId();
      const userOrders = (orders.get(userId) ?? []).filter((order) => {
        if (!query?.status) {
          return true;
        }
        return order.status === query.status;
      });

      const page = paginate(userOrders, query?.page, query?.size);
      return okMarketplaceResponse(page);
    },

    async getOrderDetail(orderId) {
      const userId = resolveAuthenticatedUserId();
      const order = (orders.get(userId) ?? []).find(
        (candidate) => candidate.id === orderId,
      );

      if (!order) {
        throw new MarketplaceApiClientError(
          "Order does not exist.",
          "ERR_MARKETPLACE_ORDER_NOT_FOUND",
          404,
        );
      }

      return okMarketplaceResponse(order);
    },

    async cancelOrder(orderId) {
      const userId = resolveAuthenticatedUserId();
      const userOrders = orders.get(userId) ?? [];
      const order = userOrders.find((candidate) => candidate.id === orderId);

      if (!order) {
        throw new MarketplaceApiClientError(
          "Order does not exist.",
          "ERR_MARKETPLACE_ORDER_NOT_FOUND",
          404,
        );
      }

      if (!toOrderStatusCanCancel(order.status)) {
        throw new MarketplaceApiClientError(
          "Order can no longer be cancelled.",
          "ERR_MARKETPLACE_ORDER_CANCEL_NOT_ALLOWED",
          409,
        );
      }

      order.status = "CANCELLED";
      order.updatedAt = nowIso();
      order.canCancel = false;
      return okMarketplaceResponse(order, "Order cancelled.");
    },

    async uploadOrderPaymentProof(orderId, file) {
      const userId = resolveAuthenticatedUserId();
      const order = (orders.get(userId) ?? []).find((candidate) => candidate.id === orderId);
      if (!order) {
        throw new MarketplaceApiClientError(
          "Order does not exist.",
          "ERR_MARKETPLACE_ORDER_NOT_FOUND",
          404,
        );
      }
      if (order.payment.method !== "BANK_TRANSFER") {
        throw new MarketplaceApiClientError(
          "Payment proof is not allowed for this order.",
          "ERR_MARKETPLACE_PAYMENT_PROOF_NOT_ALLOWED",
          409,
        );
      }
      order.payment = {
        ...order.payment,
        verificationStatus: "SUBMITTED",
        proofFileName: file.name,
        proofContentType: file.type || null,
        proofStoragePath: `/mock-storage/orders/${orderId}/${encodeURIComponent(file.name)}`,
        proofUploadedAt: nowIso(),
        verifiedAt: null,
        verifiedBy: null,
        verificationNote: null,
      };
      order.updatedAt = nowIso();
      return okMarketplaceResponse(order, "Payment proof uploaded.");
    },

    async listAddresses() {
      const userId = resolveAuthenticatedUserId();
      const userAddresses = addresses.get(userId) ?? [];
      return okMarketplaceResponse([...userAddresses]);
    },

    async createAddress(request: MarketplaceAddressUpsertRequest) {
      const userId = resolveAuthenticatedUserId();
      const userAddresses = addresses.get(userId) ?? [];

      const address: MarketplaceAddress = {
        id: nextAddressId++,
        userId,
        fullName: request.fullName.trim(),
        phone: request.phone.trim(),
        province: request.province.trim(),
        district: request.district.trim(),
        ward: request.ward.trim(),
        street: request.street.trim(),
        detail: normalizeString(request.detail) || null,
        label: request.label ?? "home",
        isDefault: request.isDefault ?? userAddresses.length === 0,
      };

      if (address.isDefault) {
        for (const existing of userAddresses) {
          existing.isDefault = false;
        }
      }

      userAddresses.push(address);
      addresses.set(userId, userAddresses);

      return okMarketplaceResponse(address, "Address created.");
    },

    async updateAddress(addressId, request: MarketplaceAddressUpsertRequest) {
      const userId = resolveAuthenticatedUserId();
      const userAddresses = addresses.get(userId) ?? [];
      const address = userAddresses.find((candidate) => candidate.id === addressId);

      if (!address) {
        throw new MarketplaceApiClientError(
          "Address does not exist.",
          "ERR_MARKETPLACE_ADDRESS_NOT_FOUND",
          404,
        );
      }

      address.fullName = request.fullName.trim();
      address.phone = request.phone.trim();
      address.province = request.province.trim();
      address.district = request.district.trim();
      address.ward = request.ward.trim();
      address.street = request.street.trim();
      address.detail = normalizeString(request.detail) || null;
      address.label = request.label ?? address.label;

      if (request.isDefault === true) {
        for (const existing of userAddresses) {
          existing.isDefault = existing.id === address.id;
        }
      }

      return okMarketplaceResponse(address, "Address updated.");
    },

    async deleteAddress(addressId) {
      const userId = resolveAuthenticatedUserId();
      const userAddresses = addresses.get(userId) ?? [];
      const existing = userAddresses.find((candidate) => candidate.id === addressId);

      if (!existing) {
        throw new MarketplaceApiClientError(
          "Address does not exist.",
          "ERR_MARKETPLACE_ADDRESS_NOT_FOUND",
          404,
        );
      }

      const remaining = userAddresses.filter((candidate) => candidate.id !== addressId);
      if (existing.isDefault && remaining.length > 0) {
        remaining[0].isDefault = true;
      }
      addresses.set(userId, remaining);

      return okMarketplaceResponse(null, "Address removed.");
    },

    async createReview(request: MarketplaceCreateReviewRequest) {
      const userId = resolveAuthenticatedUserId();
      const order = (orders.get(userId) ?? []).find(
        (candidate) => candidate.id === request.orderId,
      );

      if (!order) {
        throw new MarketplaceApiClientError(
          "Order does not exist.",
          "ERR_MARKETPLACE_ORDER_NOT_FOUND",
          404,
        );
      }

      if (order.status !== "COMPLETED") {
        throw new MarketplaceApiClientError(
          "Review requires a completed order.",
          "ERR_MARKETPLACE_REVIEW_NOT_ALLOWED",
          409,
        );
      }

      const orderedProduct = order.items.find(
        (item) => item.productId === request.productId,
      );
      if (!orderedProduct) {
        throw new MarketplaceApiClientError(
          "Product does not belong to this order.",
          "ERR_MARKETPLACE_REVIEW_NOT_ALLOWED",
          409,
        );
      }

      const duplicate = reviews.find(
        (candidate) =>
          candidate.productId === request.productId &&
          candidate.orderId === request.orderId &&
          candidate.buyerUserId === userId,
      );
      if (duplicate) {
        throw new MarketplaceApiClientError(
          "Review already exists for this order item.",
          "ERR_MARKETPLACE_REVIEW_ALREADY_EXISTS",
          409,
        );
      }

      if (request.rating < 1 || request.rating > 5) {
        throw new MarketplaceApiClientError(
          "Rating must be in range 1..5.",
          "ERR_MARKETPLACE_INVALID_RATING",
          400,
        );
      }

      const review: MarketplaceReview = {
        id: nextReviewId++,
        productId: request.productId,
        orderId: request.orderId,
        buyerUserId: userId,
        buyerDisplayName: "Marketplace User",
        rating: request.rating,
        comment: request.comment.trim(),
        createdAt: nowIso(),
      };

      reviews.push(review);
      const reviewedItem = order.items.find((item) => item.productId === request.productId);
      if (reviewedItem) {
        reviewedItem.canReview = false;
        reviewedItem.reviewId = review.id;
      }
      recalculateProductRating(review.productId);

      return okMarketplaceResponse(review, "Review created.");
    },

    async getFarmerDashboard() {
      const farmerUserId = resolveAuthenticatedUserId();
      const farmerProducts = products.filter((product) => product.farmerUserId === farmerUserId);
      const farmerOrders = allOrdersFlat().filter((order) => order.farmerUserId === farmerUserId);

      const pendingOrders = farmerOrders.filter((order) => order.status === "PENDING").length;
      const completedRevenue = farmerOrders
        .filter((order) => order.status === "COMPLETED")
        .reduce((sum, order) => sum + order.totalAmount, 0);
      const recentOrders = [...farmerOrders]
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .slice(0, 5);

      const dashboard: MarketplaceFarmerDashboard = {
        totalProducts: farmerProducts.length,
        pendingReviewProducts: farmerProducts.filter((product) => product.status === "PENDING_REVIEW").length,
        publishedProducts: farmerProducts.filter((product) => product.status === "PUBLISHED").length,
        lowStockProducts: farmerProducts.filter(
          (product) => product.status === "PUBLISHED" && product.stock <= 10,
        ).length,
        pendingOrders,
        totalRevenue: completedRevenue,
        recentOrders,
      };

      return okMarketplaceResponse(dashboard);
    },

    async listFarmerProducts(query) {
      const farmerUserId = resolveAuthenticatedUserId();
      const search = normalizeString(query?.q).toLowerCase();

      const filtered = products
        .filter((product) => product.farmerUserId === farmerUserId)
        .filter((product) => (query?.status ? product.status === query.status : true))
        .filter((product) => {
          if (!search) return true;
          return (
            product.name.toLowerCase().includes(search) ||
            product.shortDescription.toLowerCase().includes(search) ||
            (product.farmName?.toLowerCase().includes(search) ?? false)
          );
        })
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

      const page = paginate(filtered.map(asPublishedProduct), query?.page, query?.size);
      return okMarketplaceResponse(page);
    },

    async createFarmerProduct(request: MarketplaceFarmerProductUpsertRequest) {
      const farmerUserId = resolveAuthenticatedUserId();
      const createdAt = nowIso();
      const imageUrls = (request.imageUrls ?? []).filter((url) => normalizeString(url).length > 0);
      const imageUrl = normalizeString(request.imageUrl) || imageUrls[0] || "";

      const product: MarketplaceProductDetail = {
        id: Math.max(0, ...products.map((item) => item.id)) + 1,
        slug: generateUniqueSlug(request.name),
        name: request.name.trim(),
        category: request.category?.trim() || "Other",
        shortDescription: request.shortDescription?.trim() || "",
        description: request.description?.trim() || "",
        price: request.price,
        unit: request.unit.trim(),
        stock: request.stockQuantity,
        imageUrl,
        imageUrls: imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [],
        farmerUserId,
        farmerDisplayName: "Farmer User",
        farmId: request.farmId,
        farmName: `Farm #${request.farmId}`,
        seasonId: request.traceable ? request.seasonId ?? null : null,
        seasonName: request.traceable && request.seasonId ? `Season #${request.seasonId}` : null,
        lotId: request.traceable ? request.lotId ?? null : null,
        region: null,
        traceable: Boolean(request.traceable),
        traceabilityCode: request.traceable && request.lotId ? `LOT-${request.lotId}` : null,
        ratingAverage: 0,
        ratingCount: 0,
        status: "DRAFT",
        createdAt,
        updatedAt: createdAt,
      };

      products.push(product);
      return okMarketplaceResponse(product, "Product created.");
    },

    async updateFarmerProduct(productId: number, request: MarketplaceFarmerProductUpsertRequest) {
      const farmerUserId = resolveAuthenticatedUserId();
      const product = products.find(
        (candidate) => candidate.id === productId && candidate.farmerUserId === farmerUserId,
      );

      if (!product) {
        throw new MarketplaceApiClientError(
          "Product does not exist.",
          "ERR_MARKETPLACE_PRODUCT_NOT_FOUND",
          404,
        );
      }

      const imageUrls = (request.imageUrls ?? []).filter((url) => normalizeString(url).length > 0);
      const imageUrl = normalizeString(request.imageUrl) || imageUrls[0] || product.imageUrl;

      product.slug = generateUniqueSlug(request.name, product.id);
      product.name = request.name.trim();
      product.category = request.category?.trim() || "Other";
      product.shortDescription = request.shortDescription?.trim() || "";
      product.description = request.description?.trim() || "";
      product.price = request.price;
      product.unit = request.unit.trim();
      product.stock = request.stockQuantity;
      product.imageUrl = imageUrl;
      product.imageUrls = imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [];
      product.farmId = request.farmId;
      product.farmName = `Farm #${request.farmId}`;
      product.traceable = Boolean(request.traceable);
      product.seasonId = product.traceable ? request.seasonId ?? null : null;
      product.seasonName = product.traceable && request.seasonId ? `Season #${request.seasonId}` : null;
      product.lotId = product.traceable ? request.lotId ?? null : null;
      product.traceabilityCode = product.traceable && request.lotId ? `LOT-${request.lotId}` : null;
      product.updatedAt = nowIso();
      if (product.status === "PUBLISHED") {
        product.status = "PENDING_REVIEW";
      }

      return okMarketplaceResponse(product, "Product updated.");
    },

    async updateFarmerProductStatus(productId: number, request: MarketplaceUpdateProductStatusRequest) {
      const farmerUserId = resolveAuthenticatedUserId();
      const product = products.find(
        (candidate) => candidate.id === productId && candidate.farmerUserId === farmerUserId,
      );
      if (!product) {
        throw new MarketplaceApiClientError(
          "Product does not exist.",
          "ERR_MARKETPLACE_PRODUCT_NOT_FOUND",
          404,
        );
      }

      if (!normalizeStatusTransitionForFarmerProduct(product.status, request.status)) {
        throw new MarketplaceApiClientError(
          "Invalid product status transition.",
          "ERR_BAD_REQUEST",
          400,
        );
      }
      product.status = request.status;
      product.updatedAt = nowIso();
      return okMarketplaceResponse(product, "Product status updated.");
    },

    async listFarmerOrders(query) {
      const farmerUserId = resolveAuthenticatedUserId();
      const filtered = allOrdersFlat()
        .filter((order) => order.farmerUserId === farmerUserId)
        .filter((order) => (query?.status ? order.status === query.status : true))
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

      const page = paginate(filtered, query?.page, query?.size);
      return okMarketplaceResponse(page);
    },

    async getFarmerOrderDetail(orderId: number) {
      const farmerUserId = resolveAuthenticatedUserId();
      const order = allOrdersFlat().find(
        (candidate) => candidate.id === orderId && candidate.farmerUserId === farmerUserId,
      );
      if (!order) {
        throw new MarketplaceApiClientError(
          "Order does not exist.",
          "ERR_MARKETPLACE_ORDER_NOT_FOUND",
          404,
        );
      }
      return okMarketplaceResponse(order);
    },

    async updateFarmerOrderStatus(orderId: number, request: MarketplaceUpdateOrderStatusRequest) {
      const farmerUserId = resolveAuthenticatedUserId();
      const order = allOrdersFlat().find(
        (candidate) => candidate.id === orderId && candidate.farmerUserId === farmerUserId,
      );

      if (!order) {
        throw new MarketplaceApiClientError(
          "Order does not exist.",
          "ERR_MARKETPLACE_ORDER_NOT_FOUND",
          404,
        );
      }

      if (!normalizeStatusTransitionForFarmer(order.status, request.status)) {
        throw new MarketplaceApiClientError(
          "Invalid order status transition.",
          "ERR_BAD_REQUEST",
          400,
        );
      }

      if (request.status === "CANCELLED") {
        for (const item of order.items) {
          const product = products.find((candidate) => candidate.id === item.productId);
          if (product) {
            product.stock += item.quantity;
            product.updatedAt = nowIso();
          }
        }
        order.canCancel = false;
      }

      order.status = request.status;
      order.updatedAt = nowIso();
      return okMarketplaceResponse(order, "Order status updated.");
    },

    async listAdminProducts(query) {
      const search = normalizeString(query?.q).toLowerCase();
      const filtered = products
        .filter((product) => (query?.status ? product.status === query.status : true))
        .filter((product) => {
          if (!search) return true;
          return (
            product.name.toLowerCase().includes(search) ||
            product.shortDescription.toLowerCase().includes(search) ||
            (product.farmName?.toLowerCase().includes(search) ?? false) ||
            product.farmerDisplayName.toLowerCase().includes(search)
          );
        })
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

      const page = paginate(filtered.map(asPublishedProduct), query?.page, query?.size);
      return okMarketplaceResponse(page);
    },

    async updateAdminProductStatus(productId: number, request: MarketplaceUpdateProductStatusRequest) {
      resolveAuthenticatedUserId();
      const product = products.find((candidate) => candidate.id === productId);
      if (!product) {
        throw new MarketplaceApiClientError(
          "Product does not exist.",
          "ERR_MARKETPLACE_PRODUCT_NOT_FOUND",
          404,
        );
      }

      if (!normalizeStatusTransitionForAdminProduct(product.status, request.status)) {
        throw new MarketplaceApiClientError(
          "Invalid product status transition.",
          "ERR_BAD_REQUEST",
          400,
        );
      }
      product.status = request.status;
      product.updatedAt = nowIso();
      return okMarketplaceResponse(product, "Product moderation updated.");
    },

    async listAdminOrders(query) {
      const filtered = allOrdersFlat()
        .filter((order) => (query?.status ? order.status === query.status : true))
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      const page = paginate(filtered, query?.page, query?.size);
      return okMarketplaceResponse(page);
    },

    async getAdminOrderDetail(orderId: number) {
      resolveAuthenticatedUserId();
      const order = allOrdersFlat().find((candidate) => candidate.id === orderId);
      if (!order) {
        throw new MarketplaceApiClientError(
          "Order does not exist.",
          "ERR_MARKETPLACE_ORDER_NOT_FOUND",
          404,
        );
      }
      return okMarketplaceResponse(order);
    },

    async updateAdminOrderPaymentVerification(orderId: number, request: MarketplaceUpdatePaymentVerificationRequest) {
      resolveAuthenticatedUserId();
      const order = allOrdersFlat().find((candidate) => candidate.id === orderId);
      if (!order) {
        throw new MarketplaceApiClientError(
          "Order does not exist.",
          "ERR_MARKETPLACE_ORDER_NOT_FOUND",
          404,
        );
      }
      order.payment = {
        ...order.payment,
        verificationStatus: request.verificationStatus,
        verificationNote: normalizeString(request.verificationNote) || null,
        verifiedAt: nowIso(),
        verifiedBy: 1,
      };
      order.updatedAt = nowIso();
      return okMarketplaceResponse(order, "Payment verification updated.");
    },

    async updateAdminOrderStatus(orderId: number, request: MarketplaceUpdateOrderStatusRequest) {
      resolveAuthenticatedUserId();
      const order = allOrdersFlat().find((candidate) => candidate.id === orderId);
      if (!order) {
        throw new MarketplaceApiClientError(
          "Order does not exist.",
          "ERR_MARKETPLACE_ORDER_NOT_FOUND",
          404,
        );
      }
      order.status = request.status;
      order.canCancel = false;
      order.updatedAt = nowIso();
      return okMarketplaceResponse(order, "Order status updated.");
    },

    async listAdminOrderAuditLogs(orderId: number) {
      resolveAuthenticatedUserId();
      const order = allOrdersFlat().find((candidate) => candidate.id === orderId);
      if (!order) {
        throw new MarketplaceApiClientError(
          "Order does not exist.",
          "ERR_MARKETPLACE_ORDER_NOT_FOUND",
          404,
        );
      }
      const auditLogs: MarketplaceOrderAuditLog[] = [
        {
          id: order.id * 10,
          entityType: "MARKETPLACE_ORDER",
          entityId: order.id,
          operation: "ORDER_CREATED",
          performedBy: "mock-system",
          performedAt: order.createdAt,
          snapshotDataJson: null,
          reason: "Mock order bootstrap",
          ipAddress: null,
        },
      ];
      return okMarketplaceResponse(auditLogs);
    },

    async getAdminStats() {
      resolveAuthenticatedUserId();
      const ordersFlat = allOrdersFlat();

      const stats: MarketplaceAdminStats = {
        totalProducts: products.length,
        pendingReviewProducts: products.filter((product) => product.status === "PENDING_REVIEW").length,
        publishedProducts: products.filter((product) => product.status === "PUBLISHED").length,
        hiddenProducts: products.filter((product) => product.status === "HIDDEN").length,
        totalOrders: ordersFlat.length,
        activeOrders: ordersFlat.filter((order) =>
          order.status === "PENDING" ||
          order.status === "CONFIRMED" ||
          order.status === "PREPARING" ||
          order.status === "DELIVERING").length,
        completedOrders: ordersFlat.filter((order) => order.status === "COMPLETED").length,
        cancelledOrders: ordersFlat.filter((order) => order.status === "CANCELLED").length,
        totalRevenue: ordersFlat
          .filter((order) => order.status === "COMPLETED")
          .reduce((sum, order) => sum + order.totalAmount, 0),
      };

      return okMarketplaceResponse(stats);
    },
  };
}
