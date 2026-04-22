import { ChevronRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge, Button, Card, CardContent } from "@/shared/ui";
import { type MarketplaceOrderStatus } from "@/shared/api";
import { useMarketplaceOrders } from "../hooks";
import { formatDateTime, formatVnd } from "../lib/format";

const ORDER_STATUSES: Array<{ value: MarketplaceOrderStatus; label: string }> = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "DELIVERING", label: "Delivering" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function statusLabel(status: MarketplaceOrderStatus): string {
  return ORDER_STATUSES.find((item) => item.value === status)?.label ?? status;
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

function toPositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function MyOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = toPositiveInt(searchParams.get("page"), 1);
  const statusParam = searchParams.get("status");
  const selectedStatus = ORDER_STATUSES.some((item) => item.value === statusParam)
    ? (statusParam as MarketplaceOrderStatus)
    : undefined;

  const ordersQuery = useMarketplaceOrders({ status: selectedStatus, page: page - 1, size: 10 });

  const updateParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    if (!("page" in patch)) {
      next.set("page", "1");
    }
    setSearchParams(next);
  };

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

  const orderPage = ordersQuery.data;
  const orders = orderPage?.items ?? [];
  const totalPages = Math.max(orderPage?.totalPages ?? 1, 1);

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">My orders</h1>
          <select
            value={selectedStatus ?? ""}
            onChange={(event) => updateParams({ status: event.target.value || null })}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-xl font-semibold text-slate-900">No order yet</h2>
          <p className="mt-2 text-sm text-slate-500">
            You have not created marketplace order.
          </p>
          <Link
            to="/marketplace/products"
            className="mt-4 inline-flex text-sm text-emerald-700 hover:underline"
          >
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My orders</h1>
          <p className="text-sm text-slate-500">
            Track fulfillment and payment verification for each farmer order.
          </p>
        </div>

        <select
          value={selectedStatus ?? ""}
          onChange={(event) => updateParams({ status: event.target.value || null })}
          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

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
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant(order.status)}>{statusLabel(order.status)}</Badge>
                <Badge variant="outline">
                  {order.payment.method} - {order.payment.verificationStatus}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
              <div className="space-y-1">
                <p>
                  Recipient: {order.shippingRecipientName} - {order.shippingPhone}
                </p>
                <p className="line-clamp-1">Address: {order.shippingAddressLine}</p>
              </div>
              <div className="space-y-1 md:text-right">
                <p>
                  Total:{" "}
                  <span className="font-semibold text-emerald-700">
                    {formatVnd(order.totalAmount)}
                  </span>
                </p>
                <p>{order.canCancel ? "Eligible for cancellation" : "Cannot be cancelled now"}</p>
              </div>
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

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm text-slate-500">
          Page {page} / {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(page - 1) })}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => updateParams({ page: String(page + 1) })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
