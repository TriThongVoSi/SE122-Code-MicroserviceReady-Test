import { useMemo, useState } from "react";
import { ArrowLeft, CreditCard, FileCheck, MapPin, Phone, Upload, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib";
import { Badge, Button, Card, CardContent, Input } from "@/shared/ui";
import {
  useMarketplaceCancelOrderMutation,
  useMarketplaceCreateReviewMutation,
  useMarketplaceOrderDetail,
  useMarketplaceUploadPaymentProofMutation,
} from "../hooks";
import { formatDateTime, formatVnd } from "../lib/format";

type ReviewDraft = {
  rating: number;
  comment: string;
};

const ORDER_TIMELINE = ["PENDING", "CONFIRMED", "PREPARING", "DELIVERING", "COMPLETED"] as const;

function OrderTimeline({ status }: { status: string }) {
  const { t } = useTranslation();

  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500">
          <X size={14} className="text-white" />
        </div>
        <p className="text-sm font-medium text-red-600">{t("marketplaceBuyer.orderDetail.cancelledLabel")}</p>
      </div>
    );
  }

  const currentIndex = ORDER_TIMELINE.indexOf(status as (typeof ORDER_TIMELINE)[number]);

  return (
    <div className="flex items-center gap-0">
      {ORDER_TIMELINE.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isActive
                    ? "bg-emerald-600 text-white"
                    : isCompleted
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-400",
                )}
              >
                {index + 1}
              </div>
              <p
                className={cn(
                  "w-16 text-center text-[10px] font-medium leading-tight",
                  isActive ? "text-emerald-700" : isCompleted ? "text-emerald-600" : "text-slate-400",
                )}
              >
                {t(`marketplaceSeller.status.order.${step}`)}
              </p>
            </div>
            {index < ORDER_TIMELINE.length - 1 && (
              <div
                className={cn(
                  "mb-5 h-0.5 flex-1",
                  isCompleted ? "bg-emerald-300" : "bg-slate-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

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
          className={cn(
            "text-2xl leading-none transition-colors",
            star <= rating ? "text-amber-400" : "text-slate-200 hover:text-amber-200",
          )}
        >
          ★
        </button>
      ))}
    </div>
  );
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
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        {t("marketplaceBuyer.orderDetail.loadingOrder")}
      </div>
    );
  }

  if (orderQuery.isError || !order) {
    return (
      <div className="space-y-3 rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
        <p>{t("marketplaceBuyer.orderDetail.errorOrder")}</p>
        <Link to="/marketplace/orders" className="text-emerald-700 hover:underline">
          {t("marketplaceBuyer.orderDetail.backToOrders")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/marketplace/orders"
        className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
      >
        <ArrowLeft size={15} /> {t("marketplaceBuyer.orderDetail.backToOrders")}
      </Link>

      {/* Order header */}
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{order.orderCode}</h1>
              <p className="text-xs text-slate-500">
                {t("marketplaceBuyer.orderDetail.group")}: {order.orderGroupCode} · {formatDateTime(order.createdAt)}
              </p>
            </div>
            <Badge variant={order.status === "CANCELLED" ? "destructive" : "secondary"}>
              {t(`marketplaceSeller.status.order.${order.status}`)}
            </Badge>
          </div>

          {/* Timeline */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
              {t("marketplaceBuyer.orderDetail.orderTimelineTitle")}
            </p>
            <OrderTimeline status={order.status} />
          </div>

          {/* Shipping & payment info */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t("marketplaceBuyer.orderDetail.shippingInfoTitle")}
              </p>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">{order.shippingRecipientName}</p>
                  <p className="text-xs text-slate-500">{order.shippingAddressLine}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Phone size={14} className="shrink-0 text-slate-400" />
                <span>{order.shippingPhone}</span>
              </div>
            </div>
            <div className="space-y-2 rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t("marketplaceBuyer.orderDetail.paymentTitle")}
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CreditCard size={14} className="shrink-0 text-slate-400" />
                <span>{paymentStatusLabel}</span>
              </div>
              {order.note ? (
                <p className="text-xs text-slate-500">
                  {t("marketplaceBuyer.orderDetail.orderNote")}: {order.note}
                </p>
              ) : null}
            </div>
          </div>

          {order.canCancel ? (
            <Button
              variant="destructive"
              disabled={cancelMutation.isPending}
              onClick={async () => {
                await cancelMutation.mutateAsync();
              }}
            >
              {cancelMutation.isPending
                ? t("marketplaceBuyer.orderDetail.cancelling")
                : t("marketplaceBuyer.orderDetail.cancelOrder")}
            </Button>
          ) : null}

          {order.payment.method === "BANK_TRANSFER" ? (
            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-slate-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {t("marketplaceBuyer.orderDetail.transferProofTitle")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t("marketplaceBuyer.orderDetail.transferProofDesc")}
                  </p>
                </div>
              </div>

              {order.payment.proofFileName ? (
                <div className="flex items-center gap-2 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  <FileCheck size={16} className="shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-medium text-slate-900">{order.payment.proofFileName}</p>
                    {order.payment.proofUploadedAt ? (
                      <p className="text-xs text-slate-400">
                        {t("marketplaceBuyer.orderDetail.proofUploadedAt")}: {formatDateTime(order.payment.proofUploadedAt)}
                      </p>
                    ) : null}
                    {order.payment.verificationNote ? (
                      <p className="text-xs text-slate-500">
                        {t("marketplaceBuyer.orderDetail.adminNote")}: {order.payment.verificationNote}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <Input
                  type="file"
                  onChange={(event) => setPaymentFile(event.target.files?.[0] ?? null)}
                />
                <Button
                  disabled={!paymentFile || paymentProofMutation.isPending}
                  onClick={async () => {
                    if (!paymentFile) return;
                    await paymentProofMutation.mutateAsync(paymentFile);
                    setPaymentFile(null);
                    await orderQuery.refetch();
                  }}
                >
                  <Upload size={14} className="mr-2" />
                  {paymentProofMutation.isPending
                    ? t("marketplaceBuyer.orderDetail.uploading")
                    : t("marketplaceBuyer.orderDetail.uploadProof")}
                </Button>
              </div>

              {paymentError ? <p className="text-sm text-red-600">{paymentError}</p> : null}
            </div>
          ) : null}

          {cancelError ? <p className="text-sm text-red-600">{cancelError}</p> : null}
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">{t("marketplaceBuyer.orderDetail.itemsTitle")}</h2>
          <div className="space-y-4">
            {order.items.map((item) => {
              const draft = reviewDrafts[item.productId] ?? { rating: 5, comment: "" };
              return (
                <div
                  key={item.id}
                  className="space-y-3 rounded-md border border-slate-200 p-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-14 w-14 rounded-md object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.productName}</p>
                        <p className="text-xs text-slate-500">x{item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-emerald-700">{formatVnd(item.lineTotal)}</p>
                  </div>

                  {item.reviewId ? (
                    <Badge variant="success">{t("marketplaceBuyer.orderDetail.reviewed")}</Badge>
                  ) : item.canReview ? (
                    <div className="space-y-3 rounded-md bg-slate-50 p-3">
                      <p className="text-sm font-medium text-slate-900">{t("marketplaceBuyer.orderDetail.rateProduct")}</p>
                      <StarInput
                        rating={draft.rating}
                        onChange={(value) =>
                          setReviewDrafts((current) => ({
                            ...current,
                            [item.productId]: { ...draft, rating: value },
                          }))
                        }
                      />
                      <div className="flex gap-2">
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
                            await reviewMutation.mutateAsync({
                              orderId: order.id,
                              productId: item.productId,
                              rating: draft.rating,
                              comment: draft.comment,
                            });
                            await orderQuery.refetch();
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
          </div>

          {reviewError ? <p className="text-sm text-red-600">{reviewError}</p> : null}

          <div className="space-y-1 border-t border-slate-200 pt-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>{t("marketplaceBuyer.orderDetail.subtotal")}</span>
              <span>{formatVnd(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t("marketplaceBuyer.orderDetail.shipping")}</span>
              <span>{formatVnd(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-900">
              <span>{t("marketplaceBuyer.orderDetail.total")}</span>
              <span>{formatVnd(order.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
