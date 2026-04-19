import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, Input } from "@/shared/ui";
import type { MarketplaceAddress, MarketplacePaymentMethod } from "@/shared/api";
import {
  useMarketplaceAddresses,
  useMarketplaceCart,
  useMarketplaceCreateOrderMutation,
} from "../hooks";
import { formatVnd } from "../lib/format";

function createCheckoutIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `mk-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildCartFingerprint(
  cart: { items: Array<{ productId: number; quantity: number }> } | undefined,
): string {
  if (!cart || cart.items.length === 0) {
    return "empty";
  }
  return cart.items
    .slice()
    .sort((left, right) => left.productId - right.productId)
    .map((item) => `${item.productId}:${item.quantity}`)
    .join("|");
}

export function CheckoutPage() {
  const navigate = useNavigate();

  const cartQuery = useMarketplaceCart();
  const addressesQuery = useMarketplaceAddresses();
  const createOrderMutation = useMarketplaceCreateOrderMutation();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<MarketplacePaymentMethod>("COD");
  const [checkoutIdempotencyKey, setCheckoutIdempotencyKey] = useState<string>(
    () => createCheckoutIdempotencyKey(),
  );

  const cart = cartQuery.data;
  const cartFingerprint = useMemo(() => buildCartFingerprint(cart), [cart]);
  const lastCartFingerprintRef = useRef<string>("");

  useEffect(() => {
    if (cartFingerprint !== lastCartFingerprintRef.current) {
      setCheckoutIdempotencyKey(createCheckoutIdempotencyKey());
      lastCartFingerprintRef.current = cartFingerprint;
    }
  }, [cartFingerprint]);

  const defaultAddress = useMemo(() => {
    const items = addressesQuery.data ?? [];
    return items.find((item) => item.isDefault) ?? items[0] ?? null;
  }, [addressesQuery.data]);

  const selectedAddress = useMemo<MarketplaceAddress | null>(() => {
    if (!addressesQuery.data) {
      return null;
    }

    if (selectedAddressId == null) {
      return defaultAddress;
    }

    return (
      addressesQuery.data.find((item) => item.id === selectedAddressId) ??
      defaultAddress
    );
  }, [addressesQuery.data, defaultAddress, selectedAddressId]);

  if (cartQuery.isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        Loading checkout...
      </div>
    );
  }

  if (cartQuery.isError) {
    return (
      <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
        Failed to load checkout cart.
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Cart is empty</h1>
        <p className="mt-2 text-sm text-slate-500">
          Add products before creating marketplace order.
        </p>
        <Button className="mt-4" onClick={() => navigate("/marketplace/cart")}>
          Back to cart
        </Button>
      </div>
    );
  }

  const shippingFee = 20000;
  const total = cart.subtotal + shippingFee;
  const submitErrorMessage =
    createOrderMutation.error instanceof Error
      ? createOrderMutation.error.message
      : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Checkout</h1>

        <Card>
          <CardContent className="space-y-3 p-5">
            <h2 className="text-base font-semibold text-slate-900">Shipping address</h2>

            {addressesQuery.data && addressesQuery.data.length > 0 ? (
              <select
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                value={selectedAddress?.id ?? ""}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setSelectedAddressId(Number.isFinite(next) ? next : null);
                }}
              >
                {addressesQuery.data.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.fullName} - {address.phone} - {address.street}, {address.ward}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-slate-500">
                No saved address found, please fill manual shipping information.
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Recipient name"
                value={recipientName}
                onChange={(event) => setRecipientName(event.target.value)}
              />
              <Input
                placeholder="Phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            <Input
              placeholder="Shipping address"
              value={addressLine}
              onChange={(event) => setAddressLine(event.target.value)}
            />

            <Input
              placeholder="Order note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-5">
            <h2 className="text-base font-semibold text-slate-900">Payment method</h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="marketplace-payment"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              COD
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="marketplace-payment"
                checked={paymentMethod === "BANK_TRANSFER"}
                onChange={() => setPaymentMethod("BANK_TRANSFER")}
              />
              Bank transfer
            </label>
          </CardContent>
        </Card>
      </section>

      <aside>
        <Card>
          <CardContent className="space-y-4 p-5">
            <h2 className="text-base font-semibold text-slate-900">Order summary</h2>

            <div className="space-y-2 text-sm">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-2">
                  <span className="line-clamp-1 text-slate-600">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatVnd(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatVnd(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>{formatVnd(shippingFee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-900">
                <span>Total</span>
                <span>{formatVnd(total)}</span>
              </div>
            </div>

            {submitErrorMessage ? (
              <p className="text-sm text-red-600">{submitErrorMessage}</p>
            ) : null}

            <Button
              className="w-full"
              disabled={createOrderMutation.isPending}
              onClick={async () => {
                const result = await createOrderMutation.mutateAsync({
                  paymentMethod,
                  addressId: selectedAddress?.id,
                  shippingRecipientName: recipientName || selectedAddress?.fullName,
                  shippingPhone: phone || selectedAddress?.phone,
                  shippingAddressLine:
                    addressLine ||
                    (selectedAddress
                      ? `${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`
                      : undefined),
                  note,
                  idempotencyKey: checkoutIdempotencyKey,
                });

                const firstOrderId = result.orders[0]?.id;
                if (firstOrderId) {
                  navigate(`/marketplace/orders/${firstOrderId}`);
                  return;
                }
                navigate("/marketplace/orders");
              }}
            >
              {createOrderMutation.isPending ? "Creating order..." : "Place order"}
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
