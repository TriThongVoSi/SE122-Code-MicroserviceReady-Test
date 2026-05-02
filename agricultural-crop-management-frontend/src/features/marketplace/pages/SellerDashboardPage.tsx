import {
  AlertCircle,
  DollarSign,
  Package,
  ShoppingBag,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { useMarketplaceFarmerDashboard, useMarketplaceFarmerProducts } from "../hooks";
import { SellerMarketplaceTabs } from "../layout";
import { formatDateTime, formatVnd } from "../lib/format";

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`rounded-xl p-3 ${tone}`}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function orderStatusLabel(status: string) {
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

export function SellerDashboardPage() {
  const dashboardQuery = useMarketplaceFarmerDashboard();
  const productsQuery = useMarketplaceFarmerProducts({ page: 0, size: 20, status: "PUBLISHED" });

  if (dashboardQuery.isLoading) {
    return (
      <div className="min-h-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <SellerMarketplaceTabs />
        <Card className="border-dashed">
          <CardContent className="p-8 text-sm text-gray-500">
            Loading marketplace dashboard...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <div className="min-h-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <SellerMarketplaceTabs />
        <Card className="border-red-200">
          <CardContent className="flex items-center gap-3 p-8 text-sm text-red-600">
            <AlertCircle size={18} />
            Failed to load the marketplace dashboard.
          </CardContent>
        </Card>
      </div>
    );
  }

  const dashboard = dashboardQuery.data;

  const topProducts = (productsQuery.data?.items ?? [])
    .slice()
    .sort((left, right) => right.availableQuantity - left.availableQuantity)
    .slice(0, 5);

  return (
    <div className="min-h-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SellerMarketplaceTabs />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-600">FarmTrace Seller Portal</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Store overview</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            A legacy-style summary of your live marketplace performance, with recent orders
            and low-stock listings kept on the current backend data.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            to="/farmer/marketplace-products/new"
            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            Create product
          </Link>
          <Link
            to="/farmer/marketplace-orders"
            className="rounded-full border border-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            View orders
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={DollarSign}
          label="Revenue"
          value={formatVnd(dashboard.totalRevenue)}
          tone="bg-emerald-100 text-emerald-600"
        />
        <MetricCard
          icon={ShoppingBag}
          label="Pending orders"
          value={dashboard.pendingOrders}
          tone="bg-blue-100 text-blue-600"
        />
        <MetricCard
          icon={Package}
          label="Published products"
          value={dashboard.publishedProducts}
          tone="bg-purple-100 text-purple-600"
        />
        <MetricCard
          icon={Store}
          label="Pending review"
          value={dashboard.pendingReviewProducts}
          tone="bg-orange-100 text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Recent orders</CardTitle>
              <Link to="/farmer/marketplace-orders" className="text-sm font-medium text-emerald-600 hover:underline">
                See all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {dashboard.recentOrders.length > 0 ? (
              dashboard.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/farmer/marketplace-orders/${order.id}`}
                  className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{order.orderCode}</p>
                    <p className="text-sm text-gray-500">
                      {order.items.length} items • {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">{formatVnd(order.totalAmount)}</p>
                    <p className="text-sm text-gray-500">{orderStatusLabel(order.status)}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
                No buyer orders yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Top products</CardTitle>
              <Link to="/farmer/marketplace-products" className="text-sm font-medium text-emerald-600 hover:underline">
                Manage products
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {topProducts.length > 0 ? (
              topProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 rounded-xl border border-gray-200 p-4">
                  <div className="h-14 w-14 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{formatVnd(product.price)} / {product.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Available</p>
                    <p className="font-semibold text-emerald-600">
                      {product.availableQuantity} {product.unit}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
                No published products yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
