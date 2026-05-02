import { useMemo, useState } from "react";
import { ArrowLeft, CreditCard, FileCheck, MapPin, Phone, Upload } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/shared/ui";
import {
  useMarketplaceCancelOrderMutation,
  useMarketplaceCreateReviewMutation,
  useMarketplaceOrderDetail,
  useMarketplaceUploadPaymentProofMutation,
} from "../hooks";
import { formatDateTime, formatVnd } from "../lib/format";

const MAX_PAYMENT_PROOF_BYTES = 5 * 1024 * 1024;
const PAYMENT_PROOF_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

function validatePaymentProof(file: File): string | null {
  if (!PAYMENT_PROOF_TYPES.includes(file.type)) return 'Chỉ hỗ trợ JPG, PNG, WEBP hoặc PDF.';
  if (file.size > MAX_PAYMENT_PROOF_BYTES) return 'Tệp xác nhận thanh toán không được vượt quá 5MB.';
  return null;
}

type ReviewDraft = {
  rating: number;
  comment: string;
};

function StarInput({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={star <= rating ? "text-2xl text-amber-400" : "text-2xl text-slate-200 hover:text-amber-200"}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function statusVariant(status: string) {
  if (status === "COMPLETED") return "success" as const;
  if (status === "CANCELLED") return "destructive" as const;
  if (status === "PENDING") return "warning" as const;
  return "secondary" as const;
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const { t } = useTranslation();
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [reviewDrafts, setReviewDrafts] = useState<Record<number, ReviewDraft>>({});

  const orderQuery = useMarketplaceOrderDetail(orderId);
  const cancelMutation = useMarketplaceCancelOrderMutation(orderId);
  const paymentProofMutation = useMarketplaceUploadPaymentProofMutation(orderId);
  const reviewMutation = useMarketplaceCreateReviewMutation();

  const order = orderQuery.data;
  const cancelError = cancelMutation.error instanceof Error ? cancelMutation.error.message : null;
  const paymentError =
    paymentProofMutation.error instanceof Error ? paymentProofMutation.error.message : null;
  const reviewError = reviewMutation.error instanceof Error ? reviewMutation.error.message : null;

  const paymentStatusLabel = useMemo(() => {
    if (!order) return "";
    return `${order.payment.method} · ${order.payment.verificationStatus}`;
  }, [order]);

  if (orderQuery.isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          {t("marketplaceBuyer.orderDetail.loadingOrder")}
        </div>
      </div>
    );
  }

  if (orderQuery.isError || !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-3 rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
          <p>{t("marketplaceBuyer.orderDetail.errorOrder")}</p>
          <Link to="/marketplace/orders" className="text-emerald-700 hover:underline">
            {t("marketplaceBuyer.orderDetail.backToOrders")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/marketplace/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
      >
        <ArrowLeft size={15} /> {t("marketplaceBuyer.orderDetail.backToOrders")}
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.orderCode}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("marketplaceBuyer.orderDetail.group")}: {order.orderGroupCode} · {formatDateTime(order.createdAt)}
          </p>
        </div>
        <Badge variant={statusVariant(order.status)}>
          {t(`marketplaceSeller.status.order.${order.status}`)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("marketplaceBuyer.orderDetail.itemsTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => {
                const draft = reviewDrafts[item.productId] ?? { rating: 5, comment: "" };
                return (
                  <div key={item.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-16 w-16 rounded-md bg-gray-100 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} x {formatVnd(item.unitPriceSnapshot)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatVnd(item.lineTotal)}</p>
                    </div>

                    {item.reviewId ? (
                      <Badge variant="success" className="mt-3">{t("marketplaceBuyer.orderDetail.reviewed")}</Badge>
                    ) : item.canReview ? (
                      <div className="mt-4 rounded-lg bg-gray-50 p-4">
                        <p className="mb-2 text-sm font-medium text-gray-900">{t("marketplaceBuyer.orderDetail.rateProduct")}</p>
                        <StarInput
                          rating={draft.rating}
                          onChange={(value) =>
                            setReviewDrafts((current) => ({
                              ...current,
                              [item.productId]: { ...draft, rating: value },
                            }))
                          }
                        />
                        <div className="mt-3 flex gap-2">
                          <Input
                            value={draft.comment}
                            onChange={(event) =>
                              setReviewDrafts((current) => ({
                                ...current,
                                [item.productId]: { ...draft, comment: event.target.value },
                              }))
                            }
                            placeholder={t("marketplaceBuyer.orderDetail.reviewPlaceholder")}
                          />
                          <Button
                            disabled={!draft.comment.trim() || reviewMutation.isPending}
                            onClick={async () => {
                              try {
                                await reviewMutation.mutateAsync({
                                  orderId: order.id,
                                  productId: item.productId,
                                  rating: draft.rating,
                                  comment: draft.comment,
                                });
                                await orderQuery.refetch();
                                toast.success('Đánh giá đã được gửi thành công.');
                              } catch (error) {
                                toast.error(error instanceof Error ? error.message : 'Không thể hoàn tất thao tác.');
                              }
                            }}
                          >
                            {t("marketplaceBuyer.orderDetail.submitReview")}
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}

              {reviewError ? <p className="text-sm text-red-600">{reviewError}</p> : null}

              <div className="space-y-2 border-t border-gray-200 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("marketplaceBuyer.orderDetail.subtotal")}</span>
                  <span>{formatVnd(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("marketplaceBuyer.orderDetail.shipping")}</span>
                  <span>{formatVnd(order.shippingFee)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="font-bold text-gray-900">{t("marketplaceBuyer.orderDetail.total")}</span>
                  <span className="text-xl font-bold text-emerald-600">{formatVnd(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("marketplaceBuyer.orderDetail.shippingInfoTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{order.shippingRecipientName}</p>
                  <p>{order.shippingAddressLine}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                <p>{order.shippingPhone}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("marketplaceBuyer.orderDetail.paymentTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{paymentStatusLabel}</p>
                  {order.note ? (
                    <p className="mt-1 text-xs text-gray-500">
                      {t("marketplaceBuyer.orderDetail.orderNote")}: {order.note}
                    </p>
                  ) : null}
                </div>
              </div>

              {order.payment.proofFileName ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                    <FileCheck size={16} className="text-emerald-600" />
                    <div>
                      <p className="font-medium text-gray-900">{order.payment.proofFileName}</p>
                      {order.payment.proofUploadedAt ? (
                        <p className="text-xs text-gray-400">
                          {t("marketplaceBuyer.orderDetail.proofUploadedAt")}: {formatDateTime(order.payment.proofUploadedAt)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              {order.payment.method === "BANK_TRANSFER" ? (
                <div className="space-y-3 rounded-lg border border-gray-200 p-3">
                  <p className="text-sm font-medium text-gray-900">{t("marketplaceBuyer.orderDetail.transferProofTitle")}</p>
                  <Input
                    aria-label="payment proof"
                    data-testid="payment-proof-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      if (!file) {
                        setPaymentFile(null);
                        return;
                      }
                      const message = validatePaymentProof(file);
                      if (message) {
                        toast.error(message);
                        event.currentTarget.value = '';
                        setPaymentFile(null);
                        return;
                      }
                      setPaymentFile(file);
                    }}
                  />
                  <Button
                    disabled={!paymentFile || paymentProofMutation.isPending}
                    onClick={async () => {
                      if (!paymentFile) return;
                      try {
                        await paymentProofMutation.mutateAsync(paymentFile);
                        setPaymentFile(null);
                        await orderQuery.refetch();
                        toast.success('Tải lên xác nhận thanh toán thành công.');
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : 'Không thể hoàn tất thao tác.');
                      }
                    }}
                  >
                    <Upload size={14} className="mr-2" />
                    {paymentProofMutation.isPending
                      ? t("marketplaceBuyer.orderDetail.uploading")
                      : t("marketplaceBuyer.orderDetail.uploadProof")}
                  </Button>
                  {paymentError ? <p className="text-sm text-red-600">{paymentError}</p> : null}
                </div>
              ) : null}

              {order.canCancel ? (
                <Button
                  variant="destructive"
                  disabled={cancelMutation.isPending}
                  onClick={async () => {
                    try {
                      await cancelMutation.mutateAsync();
                      toast.success('Đơn hàng đã được hủy thành công.');
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : 'Không thể hoàn tất thao tác.');
                    }
                  }}
                >
                  {cancelMutation.isPending
                    ? t("marketplaceBuyer.orderDetail.cancelling")
                    : t("marketplaceBuyer.orderDetail.cancelOrder")}
                </Button>
              ) : null}
              {cancelError ? <p className="text-sm text-red-600">{cancelError}</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
