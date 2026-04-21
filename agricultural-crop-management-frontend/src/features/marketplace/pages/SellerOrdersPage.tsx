import { useState } from "react";
import { Eye } from "lucide-react";
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

export function SellerOrdersPage() {
  const { t, i18n } = useTranslation();
  const [status] = useState<"ALL" | MarketplaceOrderStatus>("ALL");
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

      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t("marketplaceSeller.orders.title")}</h1>
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
        {ordersQuery.isLoading && (
          <div className="p-8 text-center text-sm text-slate-500">{t("marketplaceSeller.orders.loading")}</div>
        )}
        {ordersQuery.isError && (
          <div className="p-8 text-center text-sm text-red-600">{t("marketplaceSeller.orders.error")}</div>
        )}
        {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">{t("marketplaceSeller.orders.empty")}</div>
        )}

        {!ordersQuery.isLoading && !ordersQuery.isError && orders.length > 0 && (
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
              {orders.map((order) => (
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
        )}
      </div>
    </div>
  );
}
