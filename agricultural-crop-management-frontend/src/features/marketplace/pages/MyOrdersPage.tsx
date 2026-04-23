import { ChevronRight, ShoppingBag } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge, Button, Card, CardContent } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { type MarketplaceOrderStatus } from "@/shared/api";
import { useMarketplaceOrders } from "../hooks";
import { formatDateTime, formatVnd } from "../lib/format";

const ORDER_STATUSES: Array<{ value: MarketplaceOrderStatus }> = [
  { value: "PENDING" },
  { value: "CONFIRMED" },
  { value: "PREPARING" },
  { value: "DELIVERING" },
  { value: "COMPLETED" },
  { value: "CANCELLED" },
];

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

function statusAccentClass(status: MarketplaceOrderStatus): string {
  switch (status) {
    case "PENDING":
      return "border-l-amber-400";
    case "CONFIRMED":
    case "PREPARING":
      return "border-l-blue-400";
    case "DELIVERING":
      return "border-l-emerald-400";
    case "COMPLETED":
      return "border-l-emerald-600";
    case "CANCELLED":
      return "border-l-red-400";
    default:
      return "border-l-slate-300";
  }
}

function toPositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function MyOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
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
        {t("marketplaceBuyer.myOrders.loadingOrders")}
      </div>
    );
  }

  if (ordersQuery.isError) {
    return (
      <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
        {t("marketplaceBuyer.myOrders.errorOrders")}
      </div>
    );
  }

  const orderPage = ordersQuery.data;
  const orders = orderPage?.items ?? [];
  const totalPages = Math.max(orderPage?.totalPages ?? 1, 1);

  const StatusChips = (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => updateParams({ status: null })}
        className={cn(
          "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          !selectedStatus
            ? "bg-emerald-600 text-white"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200",
        )}
      >
        {t("marketplaceBuyer.myOrders.filterAll")}
      </button>
      {ORDER_STATUSES.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => updateParams({ status: s.value === selectedStatus ? null : s.value })}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            selectedStatus === s.value
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
          )}
        >
          {t(`marketplaceSeller.status.order.${s.value}`)}
        </button>
      ))}
    </div>
  );

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">{t("marketplaceBuyer.myOrders.title")}</h1>
          {StatusChips}
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <ShoppingBag className="mb-4 text-slate-300" size={48} />
          <h2 className="text-xl font-semibold text-slate-900">{t("marketplaceBuyer.myOrders.emptyTitle")}</h2>
          <p className="mt-2 text-sm text-slate-500">{t("marketplaceBuyer.myOrders.emptyDesc")}</p>
          <Link
            to="/marketplace/products"
            className="mt-4 inline-flex text-sm font-medium text-emerald-700 hover:underline"
          >
            {t("marketplaceBuyer.myOrders.startShopping")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t("marketplaceBuyer.myOrders.title")}</h1>
          <p className="text-sm text-slate-500">
            {t("marketplaceBuyer.myOrders.subtitle")}
          </p>
        </div>
        {StatusChips}
      </div>

      {orders.map((order) => (
        <Card key={order.id} className={cn("overflow-hidden border-l-4", statusAccentClass(order.status))}>
          <CardContent className="space-y-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">{order.orderCode}</p>
                <p className="text-xs text-slate-500">
                  {t("marketplaceBuyer.myOrders.group")}: {order.orderGroupCode} · {formatDateTime(order.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant(order.status)}>
                  {t(`marketplaceSeller.status.order.${order.status}`)}
                </Badge>
                <Badge variant="outline">
                  {order.payment.method} · {order.payment.verificationStatus}
                </Badge>
              </div>
            </div>

            <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="truncate">
                  <span className="font-medium text-slate-700">{order.shippingRecipientName}</span>
                  {" · "}{order.shippingPhone}
                </p>
                <p className="line-clamp-1 text-xs text-slate-500">{order.shippingAddressLine}</p>
              </div>
              <div className="text-xs text-slate-500 sm:text-right">
                {order.canCancel
                  ? t("marketplaceBuyer.myOrders.eligibleForCancellation")
                  : t("marketplaceBuyer.myOrders.cannotCancel")}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <Link
                to={`/marketplace/orders/${order.id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
              >
                {t("marketplaceBuyer.myOrders.orderDetail")} <ChevronRight size={14} />
              </Link>
              <span className="text-sm font-semibold text-slate-900">
                {formatVnd(order.totalAmount)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm text-slate-500">
          {t("marketplaceBuyer.myOrders.page")} {page} / {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(page - 1) })}
          >
            {t("marketplaceBuyer.myOrders.previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => updateParams({ page: String(page + 1) })}
          >
            {t("marketplaceBuyer.myOrders.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
