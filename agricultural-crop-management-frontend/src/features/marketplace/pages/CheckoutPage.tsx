import { useEffect, useMemo, useRef, useState } from "react";
import { Banknote, Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib";
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
  const { t } = useTranslation();

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
        {t("marketplaceBuyer.checkout.loadingCart")}
      </div>
    );
  }

  if (cartQuery.isError) {
    return (
      <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
        {t("marketplaceBuyer.checkout.errorCart")}
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h1 className="text-xl font-semibold text-slate-900">{t("marketplaceBuyer.checkout.emptyCartTitle")}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {t("marketplaceBuyer.checkout.emptyCartDesc")}
        </p>
        <Button className="mt-4" onClick={() => navigate("/marketplace/cart")}>
          {t("marketplaceBuyer.checkout.backToCart")}
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
      setAddressFormMessage(t("marketplaceBuyer.checkout.addressForm.validationError"));
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
        <h1 className="text-2xl font-semibold text-slate-900">{t("marketplaceBuyer.checkout.title")}</h1>

        {/* Shipping address */}
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{t("marketplaceBuyer.checkout.shippingAddressTitle")}</h2>
                <p className="text-sm text-slate-500">
                  {t("marketplaceBuyer.checkout.shippingAddressDesc")}
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
                  {t("marketplaceBuyer.checkout.savedAddresses")}
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
                  {t("marketplaceBuyer.checkout.newAddress")}
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
                                {t("marketplaceBuyer.checkout.defaultBadge")}
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
                              {t("marketplaceBuyer.checkout.editAddress")}
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
                              {t("marketplaceBuyer.checkout.deleteAddress")}
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
                    {t("marketplaceBuyer.checkout.noSavedAddress")}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder={t("marketplaceBuyer.checkout.addressForm.recipientName")}
                    value={addressForm.fullName}
                    onChange={(event) =>
                      setAddressForm((current) => ({ ...current, fullName: event.target.value }))
                    }
                  />
                  <Input
                    placeholder={t("marketplaceBuyer.checkout.addressForm.phone")}
                    value={addressForm.phone}
                    onChange={(event) =>
                      setAddressForm((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                  <Input
                    placeholder={t("marketplaceBuyer.checkout.addressForm.province")}
                    value={addressForm.province}
                    onChange={(event) =>
                      setAddressForm((current) => ({ ...current, province: event.target.value }))
                    }
                  />
                  <Input
                    placeholder={t("marketplaceBuyer.checkout.addressForm.district")}
                    value={addressForm.district}
                    onChange={(event) =>
                      setAddressForm((current) => ({ ...current, district: event.target.value }))
                    }
                  />
                  <Input
                    placeholder={t("marketplaceBuyer.checkout.addressForm.ward")}
                    value={addressForm.ward}
                    onChange={(event) =>
                      setAddressForm((current) => ({ ...current, ward: event.target.value }))
                    }
                  />
                  <Input
                    placeholder={t("marketplaceBuyer.checkout.addressForm.street")}
                    value={addressForm.street}
                    onChange={(event) =>
                      setAddressForm((current) => ({ ...current, street: event.target.value }))
                    }
                  />
                </div>

                <Input
                  placeholder={t("marketplaceBuyer.checkout.addressForm.detail")}
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
                    <option value="home">{t("marketplaceBuyer.checkout.addressForm.labelHome")}</option>
                    <option value="office">{t("marketplaceBuyer.checkout.addressForm.labelOffice")}</option>
                    <option value="other">{t("marketplaceBuyer.checkout.addressForm.labelOther")}</option>
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
                    {t("marketplaceBuyer.checkout.addressForm.setDefault")}
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
                      ? t("marketplaceBuyer.checkout.addressForm.saving")
                      : editingAddressId == null
                        ? t("marketplaceBuyer.checkout.addressForm.saveAddress")
                        : t("marketplaceBuyer.checkout.addressForm.updateAddress")}
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
                    {t("marketplaceBuyer.checkout.addressForm.cancel")}
                  </Button>
                </div>
              </div>
            )}

            {/* Optional overrides */}
            <div className="space-y-3 rounded-lg border border-dashed border-slate-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t("marketplaceBuyer.checkout.overrideSection")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder={t("marketplaceBuyer.checkout.recipientOverride")}
                  value={recipientName}
                  onChange={(event) => setRecipientName(event.target.value)}
                />
                <Input
                  placeholder={t("marketplaceBuyer.checkout.phoneOverride")}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
              <Input
                placeholder={t("marketplaceBuyer.checkout.addressOverride")}
                value={addressLine}
                onChange={(event) => setAddressLine(event.target.value)}
              />
            </div>

            <Input
              placeholder={t("marketplaceBuyer.checkout.orderNote")}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </CardContent>
        </Card>

        {/* Payment method */}
        <Card>
          <CardContent className="space-y-3 p-5">
            <h2 className="text-base font-semibold text-slate-900">{t("marketplaceBuyer.checkout.paymentMethodTitle")}</h2>
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                paymentMethod === "COD"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 hover:border-slate-300",
              )}
            >
              <input
                type="radio"
                name="marketplace-payment"
                className="accent-emerald-600"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              <Banknote size={18} className="shrink-0 text-slate-500" />
              <div>
                <p className="text-sm font-medium text-slate-900">{t("marketplaceBuyer.checkout.codLabel")}</p>
                <p className="text-xs text-slate-500">{t("marketplaceBuyer.checkout.codDesc")}</p>
              </div>
            </label>

            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                paymentMethod === "BANK_TRANSFER"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 hover:border-slate-300",
              )}
            >
              <input
                type="radio"
                name="marketplace-payment"
                className="accent-emerald-600"
                checked={paymentMethod === "BANK_TRANSFER"}
                onChange={() => setPaymentMethod("BANK_TRANSFER")}
              />
              <Building2 size={18} className="shrink-0 text-slate-500" />
              <div>
                <p className="text-sm font-medium text-slate-900">{t("marketplaceBuyer.checkout.bankTransferLabel")}</p>
                <p className="text-xs text-slate-500">{t("marketplaceBuyer.checkout.bankTransferDesc")}</p>
              </div>
            </label>
          </CardContent>
        </Card>
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card>
          <CardContent className="space-y-4 p-5">
            <h2 className="text-base font-semibold text-slate-900">{t("marketplaceBuyer.checkout.orderSummaryTitle")}</h2>

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
                <span>{t("marketplaceBuyer.checkout.subtotal")}</span>
                <span>{formatVnd(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t("marketplaceBuyer.checkout.shipping")}</span>
                <span>{formatVnd(shippingFee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-900">
                <span>{t("marketplaceBuyer.checkout.total")}</span>
                <span className="text-emerald-700">{formatVnd(total)}</span>
              </div>
            </div>

            {effectiveRecipientName && effectivePhone && effectiveShippingAddressLine ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-medium text-slate-900">{t("marketplaceBuyer.checkout.deliverTo")}</p>
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
              {createOrderMutation.isPending
                ? t("marketplaceBuyer.checkout.placingOrder")
                : t("marketplaceBuyer.checkout.placeOrder")}
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
