import { useMemo } from "react";
import { ArrowLeft, CreditCard, MapPin, Phone, Truck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import type { MarketplaceOrderStatus } from "@/shared/api";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import {
  useMarketplaceFarmerOrderDetail,
  useMarketplaceUpdateFarmerOrderStatusMutation,
} from "../hooks";
import { SellerMarketplaceTabs } from "../layout";
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
    return (
      <div className="min-h-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <SellerMarketplaceTabs />
        <Card className="border-dashed">
          <CardContent className="p-8 text-sm text-gray-500">Loading order detail...</CardContent>
        </Card>
      </div>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="min-h-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <SellerMarketplaceTabs />
        <Card className="border-red-200">
          <CardContent className="p-8 text-sm text-red-600">Failed to load seller order detail.</CardContent>
        </Card>
      </div>
    );
  }

  const order = orderQuery.data;

  return (
    <div className="min-h-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SellerMarketplaceTabs />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/farmer/marketplace-orders"
            className="rounded-full border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
            aria-label="Back to orders"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-sm font-medium text-emerald-600">FarmTrace Seller Portal</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">{order.orderCode}</h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button
              key={action}
              type="button"
              variant={action === "CANCELLED" ? "destructive" : "default"}
              onClick={() => statusMutation.mutate({ status: action })}
              disabled={statusMutation.isPending}
            >
              {action}
            </Button>
          ))}
        </div>
      </div>

      {mutationError ? <p className="text-sm text-red-600">{mutationError}</p> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)]">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Order items</CardTitle>
                <p className="mt-2 text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
              </div>
              {statusBadge(order.status)}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="h-16 w-16 rounded-lg bg-gray-100 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      {formatVnd(item.unitPriceSnapshot)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatVnd(item.lineTotal)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-gray-200 bg-gray-50 p-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatVnd(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping fee</span>
                <span>{formatVnd(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold text-emerald-600">
                <span>Total</span>
                <span>{formatVnd(order.totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-[0.18em] text-gray-500">
                Customer information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-1 shrink-0 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{order.shippingRecipientName}</p>
                  <p className="text-sm text-gray-600">{order.shippingAddressLine}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="shrink-0 text-gray-400" />
                <p className="text-sm text-gray-600">{order.shippingPhone}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-[0.18em] text-gray-500">
                Payment and shipping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard size={16} className="shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.payment.method}</p>
                  <p className="text-xs text-gray-500">
                    Verification: {order.payment.verificationStatus}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck size={16} className="shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Shipping status</p>
                  <p className="text-xs text-gray-500">{order.status}</p>
                </div>
              </div>
              {order.note ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                  Note: {order.note}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
