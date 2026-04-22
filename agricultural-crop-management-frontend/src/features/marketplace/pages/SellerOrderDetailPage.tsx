import { useMemo } from "react";
import { ArrowLeft, CreditCard, MapPin, Phone, Truck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { MarketplaceOrderStatus } from "@/shared/api";
import {
  Button,
  Card,
  CardContent,
} from "@/shared/ui";
import {
  useMarketplaceFarmerOrderDetail,
  useMarketplaceUpdateFarmerOrderStatusMutation,
} from "../hooks";
import { formatVnd } from "../lib/format";

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


export function SellerOrderDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const orderId = Number(id ?? 0);
  const orderQuery = useMarketplaceFarmerOrderDetail(orderId);
  const statusMutation = useMarketplaceUpdateFarmerOrderStatusMutation(orderId);
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";

  const actions = useMemo(
    () => (orderQuery.data ? nextStatusOptions(orderQuery.data.status) : []),
    [orderQuery.data],
  );
  const mutationError =
    statusMutation.isError && statusMutation.error instanceof Error
      ? statusMutation.error.message
      : null;

  if (orderQuery.isLoading) {
    return <div className="rounded-xl border border-dashed bg-white p-8 text-sm text-slate-500">{t("marketplaceSeller.orderDetail.loading")}</div>;
  }

  if (orderQuery.isError || !orderQuery.data) {
    return <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-sm text-red-600">{t("marketplaceSeller.orderDetail.error")}</div>;
  }

  const order = orderQuery.data;
  const primaryNext = actions.find((s) => s !== "CANCELLED") ?? actions[0];

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/farmer/marketplace-orders"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label={t("marketplaceSeller.orderDetail.backToOrders")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-medium text-slate-900">
            {t("marketplaceSeller.orderDetail.title", { orderCode: order.orderCode })}
          </h1>
        </div>

        {primaryNext && (
          <Button
            type="button"
            disabled={statusMutation.isPending}
            onClick={() => statusMutation.mutate({ status: primaryNext })}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
          >
            {t(`marketplaceSeller.status.order.${primaryNext}`)}
          </Button>
        )}
      </div>

      {mutationError && (
        <p className="text-sm text-red-600">{mutationError}</p>
      )}

      {/* Main content grid */}
      <div className="grid gap-5 xl:grid-cols-5">
        {/* Left column - items + summary */}
        <div className="space-y-5 xl:col-span-3">
          <Card className="rounded-[14px] border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <h2 className="mb-4 text-base font-semibold text-slate-900">{t("marketplaceSeller.orderDetail.orderItems")}</h2>
              <div className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[10px] bg-slate-100">
                      <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.productName}</p>
                      <p className="text-xs text-slate-500">
                        {formatVnd(item.unitPriceSnapshot, locale)} x {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{formatVnd(item.lineTotal, locale)}</p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t("marketplaceSeller.orderDetail.subtotal")}:</span>
                  <span className="text-slate-700">{formatVnd(order.subtotal, locale)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t("marketplaceSeller.orderDetail.shippingFee")}:</span>
                  <span className="text-slate-700">{formatVnd(order.shippingFee, locale)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 text-xl">
                  <span className="font-semibold text-[#00a63e]">{t("marketplaceSeller.orderDetail.totalAmount")}:</span>
                  <span className="font-bold text-[#00a63e]">{formatVnd(order.totalAmount, locale)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - customer info + payment/shipping */}
        <div className="space-y-5 xl:col-span-2">
          {/* Customer information */}
          <Card className="rounded-[14px] border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.35px] text-[#6a7282]">{t("marketplaceSeller.orderDetail.shippingInfo")}</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{order.shippingRecipientName}</p>
                    <p className="text-xs text-slate-500">{order.shippingAddressLine}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  <p className="text-sm text-slate-700">{order.shippingPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & shipping */}
          <Card className="rounded-[14px] border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.35px] text-[#6a7282]">{t("marketplaceSeller.orderDetail.paymentMethod")} & {t("marketplaceSeller.orderDetail.shippingInfo")}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{t(`marketplaceSeller.status.payment.${order.payment.method}`)}</p>
                    <p className="text-xs text-slate-500">
                      Verification: {order.payment.verificationStatus}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{t("marketplaceSeller.orderDetail.shippingInfo")}</p>
                    <p className="text-xs text-slate-500">
                      {t("marketplaceSeller.orders.table.status")}: {t(`marketplaceSeller.status.order.${order.status}`)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secondary status actions (e.g. Cancel) */}
          {actions.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {actions
                .filter((s) => s !== primaryNext)
                .map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant="outline"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ status: s })}
                    className="text-sm"
                  >
                    {t("marketplaceSeller.orderDetail.setStatus", {
                      status: t(`marketplaceSeller.status.order.${s}`),
                    })}
                  </Button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
