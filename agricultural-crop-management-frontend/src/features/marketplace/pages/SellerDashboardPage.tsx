import { Package, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
} from "@/shared/ui";
import { useMarketplaceFarmerDashboard, useMarketplaceFarmerProducts } from "../hooks";
import { SellerMarketplaceTabs } from "../layout";
import { formatVnd } from "../lib/format";

const LOW_STOCK_THRESHOLD = 20;

export function SellerDashboardPage() {
  const { t, i18n } = useTranslation();
  const dashboardQuery = useMarketplaceFarmerDashboard();
  const lowStockProductsQuery = useMarketplaceFarmerProducts({
    page: 0,
    size: 20,
    status: "PUBLISHED",
  });

  if (dashboardQuery.isLoading) {
    return <div className="rounded-xl border border-dashed bg-white p-8 text-sm text-slate-500">{t("marketplaceSeller.dashboard.loading")}</div>;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-sm text-red-600">{t("marketplaceSeller.dashboard.error")}</div>;
  }

  const dashboard = dashboardQuery.data;
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";
  const lowStockProducts = (lowStockProductsQuery.data?.items ?? [])
    .filter((product) => product.availableQuantity <= LOW_STOCK_THRESHOLD)
    .sort((left, right) => left.availableQuantity - right.availableQuantity)
    .slice(0, 4);

  const cards = [
    {
      key: "revenue",
      label: t("marketplaceSeller.dashboard.metrics.revenue"),
      value: formatVnd(dashboard.totalRevenue, locale),
      icon: Wallet,
      iconClassName: "bg-emerald-100 text-emerald-600",
    },
    {
      key: "new-orders",
      label: t("marketplaceSeller.dashboard.metrics.newOrders"),
      value: dashboard.pendingOrders,
      icon: ShoppingCart,
      iconClassName: "bg-blue-100 text-blue-600",
    },
    {
      key: "products",
      label: t("marketplaceSeller.dashboard.metrics.products"),
      value: dashboard.totalProducts,
      icon: Package,
      iconClassName: "bg-orange-100 text-orange-600",
    },
    {
      key: "views",
      label: t("marketplaceSeller.dashboard.metrics.views"),
      value: "1,234",
      icon: TrendingUp,
      iconClassName: "bg-red-50 text-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <SellerMarketplaceTabs />

      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t("marketplaceSeller.dashboard.title")}</h1>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.key} className="rounded-[14px] border-slate-200 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[10px] ${card.iconClassName}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent orders + Low stock */}
      <div className="grid gap-4 xl:grid-cols-5">
        {/* Recent orders */}
        <Card className="rounded-[14px] border-slate-200 shadow-sm xl:col-span-3">
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold text-slate-900">{t("marketplaceSeller.dashboard.recentOrdersTitle")}</h2>
            {dashboard.recentOrders.length === 0 ? (
              <p className="text-sm text-slate-500">{t("marketplaceSeller.dashboard.recentOrdersEmpty")}</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {dashboard.recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/farmer/marketplace-orders/${order.id}`}
                    className="-mx-2 flex items-center justify-between rounded-lg px-2 py-3.5 transition-colors hover:bg-slate-50 first:pt-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{order.orderCode}</p>
                      <p className="text-xs text-slate-500">
                        {order.items?.length ?? "?"} {t("marketplaceSeller.dashboard.itemsLabel", "sản phẩm")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#00a63e]">{formatVnd(order.totalAmount, locale)}</p>
                      <p className="text-xs text-slate-500">{t(`marketplaceSeller.status.order.${order.status}`)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low stock products */}
        <Card className="rounded-[14px] border-slate-200 shadow-sm xl:col-span-2">
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold text-slate-900">{t("marketplaceSeller.dashboard.lowStockTitle")}</h2>
            {lowStockProductsQuery.isLoading && (
              <p className="text-sm text-slate-500">{t("marketplaceSeller.products.loading")}</p>
            )}
            {lowStockProductsQuery.isError && (
              <p className="text-sm text-red-600">{t("marketplaceSeller.products.error")}</p>
            )}
            {!lowStockProductsQuery.isLoading && !lowStockProductsQuery.isError && lowStockProducts.length === 0 && (
              <p className="text-sm text-slate-500">{t("marketplaceSeller.dashboard.lowStockEmpty")}</p>
            )}

            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-400">
                        {product.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">
                      {t("marketplaceSeller.dashboard.stock")}: <span className="font-semibold text-red-600">{product.availableQuantity} {product.unit}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
