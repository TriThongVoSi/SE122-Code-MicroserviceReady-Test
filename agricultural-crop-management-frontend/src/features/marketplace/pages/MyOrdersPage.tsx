import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Card, CardContent } from "@/shared/ui";
import { type MarketplaceOrderStatus } from "@/shared/api";
import { useMarketplaceOrders } from "../hooks";
import { formatDateTime, formatVnd } from "../lib/format";

function statusLabel(status: MarketplaceOrderStatus): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "CONFIRMED":
      return "Confirmed";
    case "PREPARING":
      return "Preparing";
    case "DELIVERING":
      return "Delivering";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

function statusVariant(status: MarketplaceOrderStatus):
  | "default"
  | "warning"
  | "success"
  | "destructive"
  | "secondary"
  | "outline"
  | "info" {
  switch (status) {
    case "PENDING":
      return "warning";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "destructive";
    default:
      return "secondary";
  }
}

export function MyOrdersPage() {
  const ordersQuery = useMarketplaceOrders({ page: 0, size: 20 });

  if (ordersQuery.isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        Loading orders...
      </div>
    );
  }

  if (ordersQuery.isError) {
    return (
      <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
        Failed to load orders.
      </div>
    );
  }

  const orders = ordersQuery.data?.items ?? [];

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h1 className="text-xl font-semibold text-slate-900">No order yet</h1>
        <p className="mt-2 text-sm text-slate-500">You have not created marketplace order.</p>
        <Link
          to="/marketplace/products"
          className="mt-4 inline-flex text-sm text-emerald-700 hover:underline"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">My orders</h1>

      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="space-y-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">{order.orderCode}</p>
                <p className="text-xs text-slate-500">
                  Group: {order.orderGroupCode} - {formatDateTime(order.createdAt)}
                </p>
              </div>
              <Badge variant={statusVariant(order.status)}>{statusLabel(order.status)}</Badge>
            </div>

            <div className="space-y-1 text-sm text-slate-600">
              <p>
                Recipient: {order.shippingRecipientName} - {order.shippingPhone}
              </p>
              <p className="line-clamp-1">Address: {order.shippingAddressLine}</p>
              <p>
                Total: <span className="font-semibold text-emerald-700">{formatVnd(order.totalAmount)}</span>
              </p>
            </div>

            <Link
              to={`/marketplace/orders/${order.id}`}
              className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
            >
              Order detail <ChevronRight size={14} />
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
