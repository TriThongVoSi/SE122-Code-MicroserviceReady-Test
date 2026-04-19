import { useState } from "react";
import { Link } from "react-router-dom";
import type { MarketplaceOrderStatus } from "@/shared/api";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { useMarketplaceFarmerOrders } from "../hooks";
import { formatDateTime, formatVnd } from "../lib/format";

const statusFilters: Array<{ value: "ALL" | MarketplaceOrderStatus; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "DELIVERING", label: "Delivering" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function statusVariant(status: MarketplaceOrderStatus) {
  if (status === "COMPLETED") return "success";
  if (status === "CANCELLED") return "destructive";
  if (status === "PENDING") return "warning";
  return "secondary";
}

export function SellerOrdersPage() {
  const [status, setStatus] = useState<"ALL" | MarketplaceOrderStatus>("ALL");
  const ordersQuery = useMarketplaceFarmerOrders({
    page: 0,
    size: 50,
    status: status === "ALL" ? undefined : status,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Marketplace orders</h1>
        <p className="text-sm text-slate-500">Track and update order fulfillment status.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status filter</CardTitle>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  status === option.value
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {ordersQuery.isLoading && <p className="text-sm text-slate-500">Loading orders...</p>}
          {ordersQuery.isError && <p className="text-sm text-red-600">Failed to load orders.</p>}
          {!ordersQuery.isLoading && !ordersQuery.isError && (ordersQuery.data?.items ?? []).length === 0 && (
            <p className="text-sm text-slate-500">No order found.</p>
          )}
          {(ordersQuery.data?.items ?? []).map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
              <div>
                <p className="font-semibold text-slate-900">{order.orderCode}</p>
                <p className="text-xs text-slate-500">{formatDateTime(order.createdAt)}</p>
                <p className="text-xs text-slate-500">Buyer #{order.buyerUserId}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                <p className="text-sm font-semibold text-emerald-700">{formatVnd(order.totalAmount)}</p>
                <Link to={`/farmer/marketplace-orders/${order.id}`} className="text-sm text-emerald-700 hover:underline">
                  Detail
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
