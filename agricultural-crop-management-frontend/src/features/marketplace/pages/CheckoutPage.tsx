import { useEffect, useMemo, useRef, useState } from "react";
import { Banknote, Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/shared/ui";
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
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          {t("marketplaceBuyer.checkout.loadingCart")}
        </div>
      </div>
    );
  }

  if (cartQuery.isError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
          {t("marketplaceBuyer.checkout.errorCart")}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h1 className="text-xl font-semibold text-gray-900">{t("marketplaceBuyer.checkout.emptyCartTitle")}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {t("marketplaceBuyer.checkout.emptyCartDesc")}
          </p>
          <Button className="mt-4" onClick={() => navigate("/marketplace/cart")}>
            {t("marketplaceBuyer.checkout.backToCart")}
          </Button>
        </div>
      </div>
    );
  }

  const shippingFee = 20000;
  const total = cart.subtotal + shippingFee;
  const submitErrorMessage =
    createOrderMutation.error instanceof Error
      ? createOrderMutation.error.message
      : null;

  async function saveAddress() {
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
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Thanh toán</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Thông tin giao hàng</CardTitle>
                  <p className="mt-1 text-sm text-gray-500">{t("marketplaceBuyer.checkout.shippingAddressDesc")}</p>
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
                    Địa chỉ đã lưu
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
                    Địa chỉ mới
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {addressMode === "saved" ? (
                <div className="space-y-3">
                  {addressesQuery.data && addressesQuery.data.length > 0 ? (
                    <>
                      <select
                        className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"
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
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1 text-sm text-gray-600">
                              <p className="font-medium text-gray-900">{selectedAddress.fullName}</p>
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
                                Sửa
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
                                Xóa
                              </Button>
                            </div>
                          </div>
                          {deleteAddressError ? (
                            <p className="mt-2 text-sm text-red-600">{deleteAddressError}</p>
                          ) : null}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                      {t("marketplaceBuyer.checkout.noSavedAddress")}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Họ tên</label>
                      <Input
                        value={addressForm.fullName}
                        onChange={(event) =>
                          setAddressForm((current) => ({ ...current, fullName: event.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Số điện thoại</label>
                      <Input
                        value={addressForm.phone}
                        onChange={(event) =>
                          setAddressForm((current) => ({ ...current, phone: event.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Tỉnh / Thành</label>
                      <Input
                        value={addressForm.province}
                        onChange={(event) =>
                          setAddressForm((current) => ({ ...current, province: event.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Quận / Huyện</label>
                      <Input
                        value={addressForm.district}
                        onChange={(event) =>
                          setAddressForm((current) => ({ ...current, district: event.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Phường / Xã</label>
                      <Input
                        value={addressForm.ward}
                        onChange={(event) =>
                          setAddressForm((current) => ({ ...current, ward: event.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Đường</label>
                      <Input
                        value={addressForm.street}
                        onChange={(event) =>
                          setAddressForm((current) => ({ ...current, street: event.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Chi tiết thêm</label>
                    <Input
                      value={addressForm.detail ?? ""}
                      onChange={(event) =>
                        setAddressForm((current) => ({ ...current, detail: event.target.value }))
                      }
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[160px_1fr] sm:items-center">
                    <select
                      value={addressForm.label ?? "home"}
                      onChange={(event) =>
                        setAddressForm((current) => ({
                          ...current,
                          label: event.target.value as MarketplaceAddress["label"],
                        }))
                      }
                      className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                    >
                      <option value="home">Nhà riêng</option>
                      <option value="office">Văn phòng</option>
                      <option value="other">Khác</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
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
                      Đặt làm địa chỉ mặc định
                    </label>
                  </div>

                  {addressFormMessage ? <p className="text-sm text-red-600">{addressFormMessage}</p> : null}
                  {addressMutationError ? <p className="text-sm text-red-600">{addressMutationError}</p> : null}

                  <div className="flex flex-wrap gap-2">
                    <Button disabled={currentAddressMutation.isPending} onClick={saveAddress}>
                      {currentAddressMutation.isPending
                        ? t("marketplaceBuyer.checkout.addressForm.saving")
                        : editingAddressId == null
                          ? "Lưu địa chỉ"
                          : "Cập nhật địa chỉ"}
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
                      Hủy
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-dashed border-gray-200 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">{t("marketplaceBuyer.checkout.overrideSection")}</p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                  className="mt-3"
                  placeholder={t("marketplaceBuyer.checkout.addressOverride")}
                  value={addressLine}
                  onChange={(event) => setAddressLine(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ghi chú</label>
                <Input
                  placeholder={t("marketplaceBuyer.checkout.orderNote")}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phương thức thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label
                className={cn(
                  "flex cursor-pointer items-center rounded-lg border p-4 transition-colors",
                  paymentMethod === "COD"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:bg-gray-50",
                )}
              >
                <input
                  type="radio"
                  name="marketplace-payment"
                  className="text-emerald-600 focus:ring-emerald-500"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                <div className="ml-3 flex items-start gap-3">
                  <Banknote size={18} className="mt-0.5 shrink-0 text-gray-500" />
                  <div>
                    <span className="block text-sm font-medium text-gray-900">{t("marketplaceBuyer.checkout.codLabel")}</span>
                    <span className="block text-sm text-gray-500">{t("marketplaceBuyer.checkout.codDesc")}</span>
                  </div>
                </div>
              </label>

              <label
                className={cn(
                  "flex cursor-pointer items-center rounded-lg border p-4 transition-colors",
                  paymentMethod === "BANK_TRANSFER"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:bg-gray-50",
                )}
              >
                <input
                  type="radio"
                  name="marketplace-payment"
                  className="text-emerald-600 focus:ring-emerald-500"
                  checked={paymentMethod === "BANK_TRANSFER"}
                  onChange={() => setPaymentMethod("BANK_TRANSFER")}
                />
                <div className="ml-3 flex items-start gap-3">
                  <Building2 size={18} className="mt-0.5 shrink-0 text-gray-500" />
                  <div>
                    <span className="block text-sm font-medium text-gray-900">{t("marketplaceBuyer.checkout.bankTransferLabel")}</span>
                    <span className="block text-sm text-gray-500">{t("marketplaceBuyer.checkout.bankTransferDesc")}</span>
                  </div>
                </div>
              </label>
            </CardContent>
          </Card>
        </div>

        <div className="w-full shrink-0 lg:w-96">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Đơn hàng của bạn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 space-y-4">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <div className="flex-1 pr-4">
                      <span className="font-medium text-gray-900">{item.name}</span>
                      <span className="ml-2 text-gray-500">x{item.quantity}</span>
                    </div>
                    <span className="font-medium">{formatVnd(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="mb-6 space-y-3 border-t border-gray-200 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("marketplaceBuyer.checkout.subtotal")}</span>
                  <span className="font-medium">{formatVnd(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("marketplaceBuyer.checkout.shipping")}</span>
                  <span className="font-medium">{formatVnd(shippingFee)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                  <span className="font-bold text-gray-900">{t("marketplaceBuyer.checkout.total")}</span>
                  <span className="text-xl font-bold text-emerald-600">{formatVnd(total)}</span>
                </div>
              </div>

              {effectiveRecipientName && effectivePhone && effectiveShippingAddressLine ? (
                <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{t("marketplaceBuyer.checkout.deliverTo")}</p>
                  <p>{effectiveRecipientName}</p>
                  <p>{effectivePhone}</p>
                  <p>{effectiveShippingAddressLine}</p>
                </div>
              ) : null}

              {submitErrorMessage ? (
                <p className="mb-3 text-sm text-red-600">{submitErrorMessage}</p>
              ) : null}

              <Button
                type="button"
                className="w-full"
                size="lg"
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
        </div>
      </div>
    </div>
  );
}
