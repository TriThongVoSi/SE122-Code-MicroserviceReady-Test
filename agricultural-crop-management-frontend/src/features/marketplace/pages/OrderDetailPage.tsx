import { useMemo, useState } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import { Link, useParams } from "react-router-dom";
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

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
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
    return `${order.payment.method} - ${order.payment.verificationStatus}`;
  }, [order]);

  if (orderQuery.isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        Loading order detail...
      </div>
    );
  }

  if (orderQuery.isError || !order) {
    return (
      <div className="space-y-3 rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
        <p>Order not found.</p>
        <Link to="/marketplace/orders" className="text-emerald-700 hover:underline">
          Back to my orders
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
        <ArrowLeft size={15} /> Back to my orders
      </Link>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{order.orderCode}</h1>
              <p className="text-xs text-slate-500">
                Group: {order.orderGroupCode} - {formatDateTime(order.createdAt)}
              </p>
            </div>
            <Badge variant={order.status === "CANCELLED" ? "destructive" : "secondary"}>
              {order.status}
            </Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1 text-sm text-slate-600">
              <p>
                Recipient: {order.shippingRecipientName} - {order.shippingPhone}
              </p>
              <p>Address: {order.shippingAddressLine}</p>
              <p>Payment: {paymentStatusLabel}</p>
              {order.note ? <p>Note: {order.note}</p> : null}
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Order timeline</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ORDER_TIMELINE.map((step) => (
                  <Badge
                    key={step}
                    variant={step === order.status ? "success" : "secondary"}
                  >
                    {step}
                  </Badge>
                ))}
                {order.status === "CANCELLED" ? <Badge variant="destructive">CANCELLED</Badge> : null}
              </div>
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
              {cancelMutation.isPending ? "Cancelling..." : "Cancel order"}
            </Button>
          ) : null}

          {order.payment.method === "BANK_TRANSFER" ? (
            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Transfer proof</p>
                <p className="text-xs text-slate-500">
                  Upload or replace payment proof while the order is awaiting verification.
                </p>
              </div>

              {order.payment.proofFileName ? (
                <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  <p>Current file: {order.payment.proofFileName}</p>
                  {order.payment.proofUploadedAt ? (
                    <p>Uploaded at: {formatDateTime(order.payment.proofUploadedAt)}</p>
                  ) : null}
                  {order.payment.verificationNote ? (
                    <p>Admin note: {order.payment.verificationNote}</p>
                  ) : null}
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
                  {paymentProofMutation.isPending ? "Uploading..." : "Upload proof"}
                </Button>
              </div>

              {paymentError ? <p className="text-sm text-red-600">{paymentError}</p> : null}
            </div>
          ) : null}

          {cancelError ? <p className="text-sm text-red-600">{cancelError}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Items</h2>
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
                    <Badge variant="success">Reviewed</Badge>
                  ) : item.canReview ? (
                    <div className="space-y-3 rounded-md bg-slate-50 p-3">
                      <p className="text-sm font-medium text-slate-900">Rate this product</p>
                      <div className="flex gap-3">
                        <select
                          value={draft.rating}
                          onChange={(event) =>
                            setReviewDrafts((current) => ({
                              ...current,
                              [item.productId]: {
                                ...draft,
                                rating: Number(event.target.value),
                              },
                            }))
                          }
                          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
                        >
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <option key={rating} value={rating}>
                              {rating} star{rating > 1 ? "s" : ""}
                            </option>
                          ))}
                        </select>
                        <Input
                          value={draft.comment}
                          onChange={(event) =>
                            setReviewDrafts((current) => ({
                              ...current,
                              [item.productId]: {
                                ...draft,
                                comment: event.target.value,
                              },
                            }))
                          }
                          placeholder="Share your experience"
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
                          Submit
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
              <span>Subtotal</span>
              <span>{formatVnd(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span>{formatVnd(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatVnd(order.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
