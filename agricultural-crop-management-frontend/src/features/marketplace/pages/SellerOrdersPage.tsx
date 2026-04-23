import { useState } from "react";
import { Eye, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import type { MarketplaceOrderStatus } from "@/shared/api";
import { Badge, Button } from "@/shared/ui";
import { useMarketplaceFarmerOrders } from "../hooks";
import { SellerMarketplaceTabs } from "../layout";
import { formatDate, formatVnd } from "../lib/format";

const STATUS_OPTIONS: Array<{ value: "ALL" | MarketplaceOrderStatus; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "DELIVERING", label: "Delivering" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function statusBadge(status: MarketplaceOrderStatus) {
  switch (status) {
    case "PENDING":
      return <Badge variant="warning">Pending</Badge>;
    case "CONFIRMED":
      return <Badge variant="secondary">Confirmed</Badge>;
    case "PREPARING":
      return <Badge variant="secondary">Preparing</Badge>;
    case "DELIVERING":
      return <Badge variant="default">Delivering</Badge>;
    case "COMPLETED":
      return <Badge variant="success">Completed</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function SellerOrdersPage() {
  const [status, setStatus] = useState<"ALL" | MarketplaceOrderStatus>("ALL");
  const ordersQuery = useMarketplaceFarmerOrders({
    page: 0,
    size: 50,
    status: status === "ALL" ? undefined : status,
  });
  const orders = ordersQuery.data?.items ?? [];

  return (
    <div className="min-h-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SellerMarketplaceTabs />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-600">FarmTrace Seller Portal</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Manage orders</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Restore the simpler seller order table while preserving the current live order data and routing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={status === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatus(option.value)}
              className="rounded-full"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {ordersQuery.isError ? (
          <div className="p-8 text-center text-sm text-red-600">Failed to load seller orders.</div>
        ) : null}
        {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Inbox className="mb-3 text-gray-300" size={44} />
            <p className="text-sm text-gray-500">No orders matched the current filter.</p>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-sm text-gray-500">
                <th className="p-4 font-medium">Order code</th>
                <th className="p-4 font-medium">Order date</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ordersQuery.isLoading
                ? Array.from({ length: 5 }, (_, index) => (
                    <tr key={index}>
                      <td className="p-4"><div className="h-4 w-28 animate-pulse rounded bg-gray-200" /></td>
                      <td className="p-4"><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></td>
                      <td className="p-4"><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></td>
                      <td className="p-4"><div className="h-4 w-20 animate-pulse rounded bg-gray-200" /></td>
                      <td className="p-4"><div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" /></td>
                      <td className="p-4"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200" /></td>
                    </tr>
                  ))
                : orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{order.orderCode}</td>
                      <td className="p-4 text-gray-600">{formatDate(order.createdAt)}</td>
                      <td className="p-4 text-gray-600">{order.shippingRecipientName || `Buyer #${order.buyerUserId}`}</td>
                      <td className="p-4 font-medium text-emerald-600">{formatVnd(order.totalAmount)}</td>
                      <td className="p-4">{statusBadge(order.status)}</td>
                      <td className="p-4 text-right">
                        <Link to={`/farmer/marketplace-orders/${order.id}`}>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 hover:text-blue-800">
                            <Eye size={16} className="mr-1" /> Detail
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
