import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge, Button, Card, CardContent } from "@/shared/ui";
import { useMarketplaceCancelOrderMutation, useMarketplaceOrderDetail } from "../hooks";
import { formatDateTime, formatVnd } from "../lib/format";

function canCancel(status: string): boolean {
  return status === "PENDING" || status === "CONFIRMED";
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);

  const orderQuery = useMarketplaceOrderDetail(orderId);
  const cancelMutation = useMarketplaceCancelOrderMutation(orderId);

  if (orderQuery.isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        Loading order detail...
      </div>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="space-y-3 rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
        <p>Order not found.</p>
        <Link to="/marketplace/orders" className="text-emerald-700 hover:underline">
          Back to my orders
        </Link>
      </div>
    );
  }

  const order = orderQuery.data;
  const cancelError =
    cancelMutation.error instanceof Error ? cancelMutation.error.message : null;

  return (
    <div className="space-y-6">
      <Link
        to="/marketplace/orders"
        className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
      >
        <ArrowLeft size={15} /> Back to my orders
      </Link>

      <Card>
        <CardContent className="space-y-3 p-6">
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

          <div className="space-y-1 text-sm text-slate-600">
            <p>
              Recipient: {order.shippingRecipientName} - {order.shippingPhone}
            </p>
            <p>Address: {order.shippingAddressLine}</p>
            <p>Payment: {order.paymentMethod}</p>
            {order.note ? <p>Note: {order.note}</p> : null}
          </div>

          {canCancel(order.status) ? (
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

          {cancelError ? <p className="text-sm text-red-600">{cancelError}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Items</h2>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
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
            ))}
          </div>

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
