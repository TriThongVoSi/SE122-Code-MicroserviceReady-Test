import type { MarketplaceMergeCartRequest } from "@/shared/api";

const GUEST_CART_KEY = "marketplace_guest_cart_v1";
const GUEST_CART_EVENT = "marketplace-guest-cart-updated";

type GuestCartItem = {
  productId: number;
  quantity: number;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emitGuestCartUpdated(): void {
  if (!isBrowser()) {
    return;
  }
  window.dispatchEvent(new Event(GUEST_CART_EVENT));
}

function sanitize(items: GuestCartItem[]): GuestCartItem[] {
  return items
    .filter((item) => Number.isFinite(item.productId) && item.productId > 0)
    .filter((item) => Number.isFinite(item.quantity) && item.quantity > 0)
    .map((item) => ({
      productId: Math.trunc(item.productId),
      quantity: Math.trunc(item.quantity),
    }));
}

export function loadGuestCartItems(): GuestCartItem[] {
  if (!isBrowser()) {
    return [];
  }

  const raw = window.localStorage.getItem(GUEST_CART_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as GuestCartItem[];
    return sanitize(parsed);
  } catch {
    return [];
  }
}

export function saveGuestCartItems(items: GuestCartItem[]): void {
  if (!isBrowser()) {
    return;
  }

  const sanitized = sanitize(items);
  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(sanitized));
  emitGuestCartUpdated();
}

export function clearGuestCartItems(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(GUEST_CART_KEY);
  emitGuestCartUpdated();
}

export function addGuestCartItem(productId: number, quantity: number): void {
  if (!Number.isFinite(productId) || productId <= 0) {
    return;
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return;
  }

  const current = loadGuestCartItems();
  const existing = current.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += Math.trunc(quantity);
  } else {
    current.push({
      productId: Math.trunc(productId),
      quantity: Math.trunc(quantity),
    });
  }

  saveGuestCartItems(current);
}

export function getGuestCartCount(): number {
  return loadGuestCartItems().reduce((sum, item) => sum + item.quantity, 0);
}

export function hasGuestCartItems(): boolean {
  return loadGuestCartItems().length > 0;
}

export function buildGuestCartMergeRequest(): MarketplaceMergeCartRequest {
  return {
    items: loadGuestCartItems().map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
  };
}

export function subscribeGuestCart(callback: () => void): () => void {
  if (!isBrowser()) {
    return () => undefined;
  }

  window.addEventListener(GUEST_CART_EVENT, callback);
  return () => {
    window.removeEventListener(GUEST_CART_EVENT, callback);
  };
}

