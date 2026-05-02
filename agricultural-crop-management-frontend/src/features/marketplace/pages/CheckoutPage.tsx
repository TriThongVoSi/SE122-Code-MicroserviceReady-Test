import { useEffect, useMemo, useRef, useState } from "react";
import { Banknote, Building2, MapPin, Pencil, Phone, Plus, Trash2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/shared/lib";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/shared/ui";
import type {
  MarketplaceAddress,
  MarketplaceAddressUpsertRequest,
  MarketplacePaymentMethod,
} from "@/shared/api";
import {
  useCheckoutValidation,
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
  const { validateCheckout } = useCheckoutValidation();

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

  const splitOrderGroups = useMemo(() => {
    if (!cart) return [];
    const groups = new Map<number, typeof cart.items>();
    cart.items.forEach((item) => {
      groups.set(item.farmerUserId, [...(groups.get(item.farmerUserId) ?? []), item]);
    });
    return Array.from(groups.entries()).map(([farmerUserId, items]) => ({ farmerUserId, items }));
  }, [cart?.items]);

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

    try {
      const saved =
        editingAddressId == null
          ? await createAddressMutation.mutateAsync(payload)
          : await updateAddressMutation.mutateAsync({
              addressId: editingAddressId,
              request: payload,
            });

      toast.success('Đã lưu địa chỉ giao hàng.');
      setSelectedAddressId(saved.id);
      setAddressMode("saved");
      setEditingAddressId(null);
      setAddressForm(emptyAddressForm());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể hoàn tất thao tác.');
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-10 text-3xl font-bold text-gray-900">Thanh toán</h1>

      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="flex-1 space-y-8">
          <Card>
            <CardHeader className="border-b border-gray-100">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Thông tin giao hàng</CardTitle>
                  <p className="mt-1.5 text-sm text-gray-500">{t("marketplaceBuyer.checkout.shippingAddressDesc")}</p>
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
                    <Plus size={16} />
                    Địa chỉ mới
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {addressMode === "saved" ? (
                <div className="space-y-4">
                  {addressesQuery.data && addressesQuery.data.length > 0 ? (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Chọn địa chỉ giao hàng</label>
                        <select
                          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm shadow-sm transition-colors hover:border-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                      </div>

                      {selectedAddress ? (
                        <div className="rounded-lg border-2 border-emerald-100 bg-emerald-50/30 p-5">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex-1 space-y-2.5">
                              <div className="flex items-center gap-2 text-gray-900">
                                <User size={16} className="text-emerald-600" />
                                <span className="font-semibold">{selectedAddress.fullName}</span>
                                {selectedAddress.isDefault ? (
                                  <span className="ml-1 inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                    {t("marketplaceBuyer.checkout.defaultBadge")}
                                  </span>
                                ) : null}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone size={16} className="text-emerald-600" />
                                <span>{selectedAddress.phone}</span>
                              </div>
                              <div className="flex items-start gap-2 text-sm text-gray-600">
                                <MapPin size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                                <span className="leading-relaxed">
                                  {selectedAddress.street}
                                  {selectedAddress.detail ? `, ${selectedAddress.detail}` : ""}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
                                </span>
                              </div>
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
                                <Pencil size={16} />
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
                                <Trash2 size={16} />
                                Xóa
                              </Button>
                            </div>
                          </div>
                          {deleteAddressError ? (
                            <p className="mt-3 text-sm text-red-600">{deleteAddressError}</p>
                          ) : null}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                      {t("marketplaceBuyer.checkout.noSavedAddress")}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5 rounded-lg border border-gray-200 bg-gray-50 p-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Họ tên</label>
                      <Input
                        className="border-gray-300"
                        value={addressForm.fullName}
                        onChange={(event) =>
                          setAddressForm((current) => ({ ...current, fullName: event.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Số điện thoại</label>
                      <Input
                        className="border-gray-300"
                        value={addressForm.phone}
                        onChange={(event) =>
                          setAddressForm((current) => ({ ...current, phone: event.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Tỉnh / Thành</label>
                      <Input
                        className="border-gray-300"
                        value={addressForm.province}
                        onChange={(event) =>
                          setAddressForm((current) => ({ ...current, province: event.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Quận / Huyện</label>
                      <Input
                        className="border-gray-300"
                        value={addressForm.district}
                        onChange={(event) =>
                          setAddressForm((current) => ({ ...current, district: event.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Phường / Xã</label>
                      <Input
                        className="border-gray-300"
                        value={addressForm.ward}
                        onChange={(event) =>
                          setAddressForm((current) => ({ ...current, ward: event.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Đường</label>
                      <Input
                        className="border-gray-300"
                        value={addressForm.street}
                        onChange={(event) =>
                          setAddressForm((current) => ({ ...current, street: event.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Chi tiết thêm</label>
                    <Input
                      className="border-gray-300"
                      placeholder="Số nhà, tên tòa nhà, v.v."
                      value={addressForm.detail ?? ""}
                      onChange={(event) =>
                        setAddressForm((current) => ({ ...current, detail: event.target.value }))
                      }
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Loại địa chỉ</label>
                      <select
                        value={addressForm.label ?? "home"}
                        onChange={(event) =>
                          setAddressForm((current) => ({
                            ...current,
                            label: event.target.value as MarketplaceAddress["label"],
                          }))
                        }
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm shadow-sm transition-colors hover:border-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="home">Nhà riêng</option>
                        <option value="office">Văn phòng</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2.5 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault ?? false}
                        onChange={(event) =>
                          setAddressForm((current) => ({
                            ...current,
                            isDefault: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                      />
                      Đặt làm địa chỉ mặc định
                    </label>
                  </div>

                  {addressFormMessage ? <p className="text-sm text-red-600">{addressFormMessage}</p> : null}
                  {addressMutationError ? <p className="text-sm text-red-600">{addressMutationError}</p> : null}

                  <div className="flex flex-wrap gap-3 pt-2">
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

              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-5">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">{t("marketplaceBuyer.checkout.overrideSection")}</p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input
                    placeholder={t("marketplaceBuyer.checkout.recipientOverride")}
                    value={recipientName}
                    onChange={(event) => setRecipientName(event.target.value)}
                    className="border-gray-300 bg-white"
                  />
                  <Input
                    placeholder={t("marketplaceBuyer.checkout.phoneOverride")}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="border-gray-300 bg-white"
                  />
                </div>
                <Input
                  className="mt-3 border-gray-300 bg-white"
                  placeholder={t("marketplaceBuyer.checkout.addressOverride")}
                  value={addressLine}
                  onChange={(event) => setAddressLine(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Ghi chú</label>
                <Input
                  className="border-gray-300"
                  placeholder={t("marketplaceBuyer.checkout.orderNote")}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-900">Phương thức thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-4 rounded-lg border-2 p-5 transition-all duration-200",
                  paymentMethod === "COD"
                    ? "border-emerald-600 bg-emerald-100 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
                )}
              >
                <input
                  type="radio"
                  name="marketplace-payment"
                  className="mt-1 h-4 w-4 shrink-0 border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                <div className="flex flex-1 items-start gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2.5">
                    <Banknote size={20} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <span className="block text-base font-semibold text-gray-900">{t("marketplaceBuyer.checkout.codLabel")}</span>
                    <span className="mt-1 block text-sm text-gray-600">{t("marketplaceBuyer.checkout.codDesc")}</span>
                  </div>
                </div>
              </label>

              <label
                className={cn(
                  "flex cursor-pointer items-start gap-4 rounded-lg border-2 p-5 transition-all duration-200",
                  paymentMethod === "BANK_TRANSFER"
                    ? "border-emerald-600 bg-emerald-100 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
                )}
              >
                <input
                  type="radio"
                  name="marketplace-payment"
                  className="mt-1 h-4 w-4 shrink-0 border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  checked={paymentMethod === "BANK_TRANSFER"}
                  onChange={() => setPaymentMethod("BANK_TRANSFER")}
                />
                <div className="flex flex-1 items-start gap-3">
                  <div className="rounded-lg bg-blue-100 p-2.5">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <span className="block text-base font-semibold text-gray-900">{t("marketplaceBuyer.checkout.bankTransferLabel")}</span>
                    <span className="mt-1 block text-sm text-gray-600">{t("marketplaceBuyer.checkout.bankTransferDesc")}</span>
                  </div>
                </div>
              </label>
            </CardContent>
          </Card>
        </div>

        <div className="w-full shrink-0 lg:w-96">
          <Card className="sticky top-24 border-2 border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-900">Đơn hàng của bạn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 space-y-4">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex items-start justify-between gap-3 text-sm">
                    <div className="flex-1 min-w-0">
                      <span className="block font-medium text-gray-900 line-clamp-2">{item.name}</span>
                      <span className="mt-1 text-gray-500">
                        {item.quantity} x {formatVnd(item.unitPrice)}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900 shrink-0">{formatVnd(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="mb-6 space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("marketplaceBuyer.checkout.subtotal")}</span>
                  <span className="font-medium text-gray-900">{formatVnd(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("marketplaceBuyer.checkout.shipping")}</span>
                  <span className="font-medium text-gray-900">{formatVnd(shippingFee)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <span className="text-base font-bold text-gray-900">{t("marketplaceBuyer.checkout.total")}</span>
                  <span className="text-2xl font-bold text-emerald-600">{formatVnd(total)}</span>
                </div>
              </div>

              {effectiveRecipientName && effectivePhone && effectiveShippingAddressLine ? (
                <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-emerald-600" />
                    <p className="text-sm font-semibold text-gray-900">{t("marketplaceBuyer.checkout.deliverTo")}</p>
                  </div>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p className="font-medium">{effectiveRecipientName}</p>
                    <p>{effectivePhone}</p>
                    <p className="text-gray-600">{effectiveShippingAddressLine}</p>
                  </div>
                </div>
              ) : null}

              {splitOrderGroups.length > 1 ? (
                <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <p className="text-sm font-semibold text-emerald-900">Đơn hàng sẽ được tách theo người bán</p>
                  <div className="mt-3 space-y-2">
                    {splitOrderGroups.map((group, index) => (
                      <div key={group.farmerUserId} className="rounded-lg bg-white p-3 text-sm text-gray-700">
                        <div className="font-medium text-gray-900">Đơn {index + 1}</div>
                        <div>{group.items.length} sản phẩm · {formatVnd(group.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {submitErrorMessage ? (
                <p className="mb-4 text-sm text-red-600">{submitErrorMessage}</p>
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
                  const validation = validateCheckout({
                    addressMode,
                    selectedAddress,
                    recipientName: effectiveRecipientName,
                    phone: effectivePhone,
                    shippingAddressLine: effectiveShippingAddressLine ?? '',
                    paymentMethod,
                  });
                  if (!validation.valid) {
                    toast.error(validation.message);
                    return;
                  }

                  try {
                    const result = await createOrderMutation.mutateAsync({
                      paymentMethod,
                      addressId: addressMode === "saved" ? selectedAddress?.id : undefined,
                      shippingRecipientName: effectiveRecipientName,
                      shippingPhone: effectivePhone,
                      shippingAddressLine: effectiveShippingAddressLine ?? '',
                      note: note.trim() || undefined,
                      idempotencyKey: checkoutIdempotencyKey,
                    });

                    toast.success('Đặt hàng thành công.');
                    const firstOrderId = result.orders[0]?.id;
                    if (firstOrderId) {
                      navigate(`/marketplace/orders/${firstOrderId}`);
                      return;
                    }
                    navigate("/marketplace/orders");
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : 'Không thể hoàn tất thao tác.');
                  }
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
