import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import type { MarketplaceOrderStatus } from "@/shared/api";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import {
  useMarketplaceFarmerOrderDetail,
  useMarketplaceUpdateFarmerOrderStatusMutation,
} from "../hooks";
import { formatDateTime, formatVnd } from "../lib/format";

function nextStatusOptions(status: MarketplaceOrderStatus): MarketplaceOrderStatus[] {
  switch (status) {
    case "PENDING":
      return ["CONFIRMED", "CANCELLED"];
    case "CONFIRMED":
      return ["PREPARING", "CANCELLED"];
    case "PREPARING":
      return ["DELIVERING"];
    case "DELIVERING":
      return ["COMPLETED"];
    default:
      return [];
  }
}

function statusVariant(status: MarketplaceOrderStatus) {
  if (status === "COMPLETED") return "success";
  if (status === "CANCELLED") return "destructive";
  if (status === "PENDING") return "warning";
  return "secondary";
}

export function SellerOrderDetailPage() {
  const { id } = useParams();
  const orderId = Number(id ?? 0);
  const orderQuery = useMarketplaceFarmerOrderDetail(orderId);
  const statusMutation = useMarketplaceUpdateFarmerOrderStatusMutation(orderId);

  const actions = useMemo(
    () => (orderQuery.data ? nextStatusOptions(orderQuery.data.status) : []),
    [orderQuery.data],
  );
  const mutationError =
    statusMutation.isError && statusMutation.error instanceof Error
      ? statusMutation.error.message
      : null;

  if (orderQuery.isLoading) {
    return <div className="rounded-xl border border-dashed bg-white p-8 text-sm text-slate-500">Loading order detail...</div>;
  }

  if (orderQuery.isError || !orderQuery.data) {
    return <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-sm text-red-600">Failed to load order detail.</div>;
  }

  const order = orderQuery.data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Order {order.orderCode}</h1>
          <p className="text-sm text-slate-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <Link to="/farmer/marketplace-orders" className="text-sm text-emerald-700 hover:underline">
          Back to orders
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipping information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-slate-600">
          <p>Recipient: {order.shippingRecipientName}</p>
          <p>Phone: {order.shippingPhone}</p>
          <p>Address: {order.shippingAddressLine}</p>
          <p>Total amount: <span className="font-semibold text-emerald-700">{formatVnd(order.totalAmount)}</span></p>
          <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium text-slate-900">{item.productName}</p>
                <p className="text-xs text-slate-500">x{item.quantity}</p>
              </div>
              <p className="font-semibold text-emerald-700">{formatVnd(item.lineTotal)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Update status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
            {actions.map((status) => (
              <Button
                key={status}
                type="button"
                variant="outline"
                disabled={statusMutation.isPending}
                onClick={() => statusMutation.mutate({ status })}
              >
                Set {status}
              </Button>
            ))}
            </div>
            {mutationError && (
              <p className="text-sm text-red-600">{mutationError}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
