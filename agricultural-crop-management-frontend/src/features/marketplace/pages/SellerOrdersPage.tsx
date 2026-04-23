import { useState } from "react";
import { Eye, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { MarketplaceOrderStatus } from "@/shared/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";
import { useMarketplaceFarmerOrders } from "../hooks";
import { SellerMarketplaceTabs } from "../layout";
import { formatDate, formatVnd } from "../lib/format";

function statusPillClass(status: MarketplaceOrderStatus): string {
  switch (status) {
    case "COMPLETED":
      return "bg-[#dbeafe] text-[#1447e6]";
    case "DELIVERING":
      return "bg-[#dcfce7] text-[#008236]";
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "CANCELLED":
      return "bg-red-50 text-red-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell><div className="h-4 w-28 animate-pulse rounded bg-slate-200" /></TableCell>
      <TableCell><div className="h-4 w-20 animate-pulse rounded bg-slate-200" /></TableCell>
      <TableCell><div className="h-4 w-24 animate-pulse rounded bg-slate-200" /></TableCell>
      <TableCell><div className="h-4 w-20 animate-pulse rounded bg-slate-200" /></TableCell>
      <TableCell><div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" /></TableCell>
      <TableCell><div className="h-4 w-12 animate-pulse rounded bg-slate-200" /></TableCell>
    </TableRow>
  );
}

const STATUS_OPTIONS: Array<{ value: "ALL" | MarketplaceOrderStatus; labelKey: string }> = [
  { value: "ALL",        labelKey: "marketplaceSeller.products.statusFilter.all" },
  { value: "PENDING",    labelKey: "marketplaceSeller.status.order.PENDING" },
  { value: "CONFIRMED",  labelKey: "marketplaceSeller.status.order.CONFIRMED" },
  { value: "PREPARING",  labelKey: "marketplaceSeller.status.order.PREPARING" },
  { value: "DELIVERING", labelKey: "marketplaceSeller.status.order.DELIVERING" },
  { value: "COMPLETED",  labelKey: "marketplaceSeller.status.order.COMPLETED" },
  { value: "CANCELLED",  labelKey: "marketplaceSeller.status.order.CANCELLED" },
];

export function SellerOrdersPage() {
  const { t, i18n } = useTranslation();
  const [status, setStatus] = useState<"ALL" | MarketplaceOrderStatus>("ALL");
  const ordersQuery = useMarketplaceFarmerOrders({
    page: 0,
    size: 50,
    status: status === "ALL" ? undefined : status,
  });
  const orders = ordersQuery.data?.items ?? [];
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";

  return (
    <div className="space-y-6">
      <SellerMarketplaceTabs />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t("marketplaceSeller.orders.title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("marketplaceSeller.orders.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                status === option.value
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
        {ordersQuery.isError && (
          <div className="p-8 text-center text-sm text-red-600">{t("marketplaceSeller.orders.error")}</div>
        )}
        {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Inbox className="mb-3 text-slate-300" size={44} />
            <p className="text-sm text-slate-500">{t("marketplaceSeller.orders.empty")}</p>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("marketplaceSeller.orders.table.orderCode")}</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("marketplaceSeller.orders.table.orderDate")}</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("marketplaceSeller.orders.table.customer")}</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("marketplaceSeller.orders.table.totalAmount")}</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("marketplaceSeller.orders.table.status")}</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("marketplaceSeller.orders.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersQuery.isLoading
              ? Array.from({ length: 5 }, (_, i) => <TableRowSkeleton key={i} />)
              : orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-sm font-semibold text-slate-900">{order.orderCode}</TableCell>
                    <TableCell className="text-sm text-slate-600">{formatDate(order.createdAt, locale)}</TableCell>
                    <TableCell className="text-sm text-slate-700">{order.shippingRecipientName || `#${order.buyerUserId}`}</TableCell>
                    <TableCell className="text-sm font-semibold text-emerald-600">
                      {formatVnd(order.totalAmount, locale)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusPillClass(order.status)}`}>
                        {t(`marketplaceSeller.status.order.${order.status}`)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/farmer/marketplace-orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#155dfc] hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                        {t("marketplaceSeller.orders.detail")}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
