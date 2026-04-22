import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, Input } from "@/shared/ui";
import type {
  MarketplaceAddress,
  MarketplaceAddressUpsertRequest,
  MarketplacePaymentMethod,
} from "@/shared/api";
import {
  useMarketplaceAddresses,
  useMarketplaceCart,
  useMarketplaceCreateAddressMutation,
  useMarketplaceCreateOrderMutation,
  useMarketplaceDeleteAddressMutation,
  useMarketplaceUpdateAddressMutation,
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

type AddressFormState = MarketplaceAddressUpsertRequest;

function emptyAddressForm(): AddressFormState {
  return {
    fullName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    detail: "",
    label: "home",
    isDefault: false,
  };
}

function toAddressForm(address: MarketplaceAddress): AddressFormState {
  return {
    fullName: address.fullName,
    phone: address.phone,
    province: address.province,
    district: address.district,
    ward: address.ward,
    street: address.street,
    detail: address.detail ?? "",
    label: address.label,
    isDefault: address.isDefault,
  };
}

function formatAddressLabel(address: MarketplaceAddress): string {
  const detail = address.detail?.trim();
  const detailPart = detail ? `, ${detail}` : "";
  return `${address.fullName} - ${address.phone} - ${address.street}${detailPart}, ${address.ward}, ${address.district}, ${address.province}`;
}

function resolveShippingAddressLine(address: MarketplaceAddress | null, manualAddressLine: string): string | undefined {
  const trimmedManual = manualAddressLine.trim();
  if (trimmedManual) {
    return trimmedManual;
  }
  if (!address) {
    return undefined;
  }
  const detail = address.detail?.trim();
  return `${address.street}${detail ? `, ${detail}` : ""}, ${address.ward}, ${address.district}, ${address.province}`;
}

function resolveDraftShippingAddressLine(form: AddressFormState): string | undefined {
  if (!isAddressFormValid(form)) {
    return undefined;
  }
  const detail = form.detail?.trim();
  return `${form.street}${detail ? `, ${detail}` : ""}, ${form.ward}, ${form.district}, ${form.province}`;
}

function isAddressFormValid(form: AddressFormState): boolean {
  return [
    form.fullName,
    form.phone,
    form.province,
    form.district,
    form.ward,
    form.street,
  ].every((value) => value.trim().length > 0);
}

export function CheckoutPage() {
  const navigate = useNavigate();

  const cartQuery = useMarketplaceCart();
  const addressesQuery = useMarketplaceAddresses();
  const createAddressMutation = useMarketplaceCreateAddressMutation();
  const updateAddressMutation = useMarketplaceUpdateAddressMutation();
  const deleteAddressMutation = useMarketplaceDeleteAddressMutation();
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
  const [addressMode, setAddressMode] = useState<"saved" | "new">("saved");
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormState>(() => emptyAddressForm());
  const [addressFormMessage, setAddressFormMessage] = useState<string | null>(null);

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

  useEffect(() => {
    if (selectedAddressId == null && defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
    }
  }, [defaultAddress, selectedAddressId]);

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

  const currentAddressMutation =
    editingAddressId == null ? createAddressMutation : updateAddressMutation;

  const addressMutationError =
    currentAddressMutation.error instanceof Error ? currentAddressMutation.error.message : null;
  const deleteAddressError =
    deleteAddressMutation.error instanceof Error ? deleteAddressMutation.error.message : null;
  const draftAddressLine = resolveDraftShippingAddressLine(addressForm);
  const effectiveRecipientName =
    recipientName.trim() ||
    (addressMode === "new" ? addressForm.fullName.trim() : selectedAddress?.fullName) ||
    undefined;
  const effectivePhone =
    phone.trim() ||
    (addressMode === "new" ? addressForm.phone.trim() : selectedAddress?.phone) ||
    undefined;
  const effectiveShippingAddressLine =
    addressMode === "new"
      ? addressLine.trim() || draftAddressLine
      : resolveShippingAddressLine(selectedAddress, addressLine);

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

  const saveAddress = async () => {
    setAddressFormMessage(null);
    if (!isAddressFormValid(addressForm)) {
      setAddressFormMessage("Please complete the required address fields.");
      return;
    }

    const payload: MarketplaceAddressUpsertRequest = {
      ...addressForm,
      detail: addressForm.detail?.trim() || undefined,
    };

    const saved =
      editingAddressId == null
        ? await createAddressMutation.mutateAsync(payload)
        : await updateAddressMutation.mutateAsync({
            addressId: editingAddressId,
            request: payload,
          });

    setSelectedAddressId(saved.id);
    setAddressMode("saved");
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm());
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Checkout</h1>

        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Shipping address</h2>
                <p className="text-sm text-slate-500">
                  Choose a saved address or create one for this order.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={addressMode === "saved" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setAddressMode("saved");
                    setEditingAddressId(null);
                    setAddressForm(emptyAddressForm());
                    setAddressFormMessage(null);
                  }}
                >
                  Saved addresses
                </Button>
                <Button
                  variant={addressMode === "new" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setAddressMode("new");
                    setEditingAddressId(null);
                    setAddressForm(emptyAddressForm());
                    setAddressFormMessage(null);
                  }}
                >
                  <Plus size={14} className="mr-1" />
                  New address
                </Button>
              </div>
            </div>

            {addressMode === "saved" ? (
              <div className="space-y-3">
                {addressesQuery.data && addressesQuery.data.length > 0 ? (
                  <>
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
                          {formatAddressLabel(address)}
                        </option>
                      ))}
                    </select>

                    {selectedAddress ? (
                      <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1 text-sm text-slate-600">
                            <p className="font-medium text-slate-900">{selectedAddress.fullName}</p>
                            <p>{selectedAddress.phone}</p>
                            <p>{formatAddressLabel(selectedAddress)}</p>
                            {selectedAddress.isDefault ? (
                              <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                                Default
                              </span>
                            ) : null}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAddressMode("new");
                                setEditingAddressId(selectedAddress.id);
                                setAddressForm(toAddressForm(selectedAddress));
                                setAddressFormMessage(null);
                              }}
                            >
                              <Pencil size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deleteAddressMutation.isPending}
                              onClick={async () => {
                                await deleteAddressMutation.mutateAsync(selectedAddress.id);
                                setSelectedAddressId(null);
                              }}
                            >
                              <Trash2 size={14} className="mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        {deleteAddressError ? (
                          <p className="text-sm text-red-600">{deleteAddressError}</p>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                    No saved address found. Create one below to continue checkout.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Recipient name"
                    value={addressForm.fullName}
                    onChange={(event) =>
                      setAddressForm((current) => ({ ...current, fullName: event.target.value }))
                    }
                  />
                  <Input
                    placeholder="Phone"
                    value={addressForm.phone}
                    onChange={(event) =>
                      setAddressForm((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                  <Input
                    placeholder="Province"
                    value={addressForm.province}
                    onChange={(event) =>
                      setAddressForm((current) => ({ ...current, province: event.target.value }))
                    }
                  />
                  <Input
                    placeholder="District"
                    value={addressForm.district}
                    onChange={(event) =>
                      setAddressForm((current) => ({ ...current, district: event.target.value }))
                    }
                  />
                  <Input
                    placeholder="Ward"
                    value={addressForm.ward}
                    onChange={(event) =>
                      setAddressForm((current) => ({ ...current, ward: event.target.value }))
                    }
                  />
                  <Input
                    placeholder="Street"
                    value={addressForm.street}
                    onChange={(event) =>
                      setAddressForm((current) => ({ ...current, street: event.target.value }))
                    }
                  />
                </div>

                <Input
                  placeholder="Apartment / landmark (optional)"
                  value={addressForm.detail ?? ""}
                  onChange={(event) =>
                    setAddressForm((current) => ({ ...current, detail: event.target.value }))
                  }
                />

                <div className="grid gap-3 sm:grid-cols-[160px_1fr] sm:items-center">
                  <select
                    value={addressForm.label ?? "home"}
                    onChange={(event) =>
                      setAddressForm((current) => ({
                        ...current,
                        label: event.target.value as MarketplaceAddress["label"],
                      }))
                    }
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
                  >
                    <option value="home">Home</option>
                    <option value="office">Office</option>
                    <option value="other">Other</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault ?? false}
                      onChange={(event) =>
                        setAddressForm((current) => ({
                          ...current,
                          isDefault: event.target.checked,
                        }))
                      }
                    />
                    Set as default address
                  </label>
                </div>

                {addressFormMessage ? (
                  <p className="text-sm text-red-600">{addressFormMessage}</p>
                ) : null}
                {addressMutationError ? (
                  <p className="text-sm text-red-600">{addressMutationError}</p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={currentAddressMutation.isPending}
                    onClick={saveAddress}
                  >
                    {currentAddressMutation.isPending
                      ? "Saving..."
                      : editingAddressId == null
                        ? "Save address"
                        : "Update address"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAddressMode("saved");
                      setEditingAddressId(null);
                      setAddressForm(emptyAddressForm());
                      setAddressFormMessage(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Recipient name override"
                value={recipientName}
                onChange={(event) => setRecipientName(event.target.value)}
              />
              <Input
                placeholder="Phone override"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            <Input
              placeholder="Shipping address override"
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
            {paymentMethod === "BANK_TRANSFER" ? (
              <p className="text-xs text-slate-500">
                You can upload transfer proof after the order is created.
              </p>
            ) : null}
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

            {effectiveRecipientName && effectivePhone && effectiveShippingAddressLine ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-medium text-slate-900">Deliver to</p>
                <p>{effectiveRecipientName}</p>
                <p>{effectivePhone}</p>
                <p>{effectiveShippingAddressLine}</p>
              </div>
            ) : null}

            {submitErrorMessage ? (
              <p className="text-sm text-red-600">{submitErrorMessage}</p>
            ) : null}

            <Button
              className="w-full"
              disabled={
                createOrderMutation.isPending ||
                !effectiveRecipientName ||
                !effectivePhone ||
                !effectiveShippingAddressLine
              }
              onClick={async () => {
                const result = await createOrderMutation.mutateAsync({
                  paymentMethod,
                  addressId: addressMode === "saved" ? selectedAddress?.id : undefined,
                  shippingRecipientName: effectiveRecipientName,
                  shippingPhone: effectivePhone,
                  shippingAddressLine: effectiveShippingAddressLine,
                  note: note.trim() || undefined,
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
