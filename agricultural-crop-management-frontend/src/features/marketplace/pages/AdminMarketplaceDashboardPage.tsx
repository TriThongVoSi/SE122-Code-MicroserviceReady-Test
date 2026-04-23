import { Package, ShieldAlert, ShoppingBag, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { useMarketplaceAdminStats } from "../hooks";
import { formatVnd } from "../lib/format";

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Package;
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

export function AdminMarketplaceDashboardPage() {
  const statsQuery = useMarketplaceAdminStats();

  if (statsQuery.isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-sm text-gray-500">
          Loading marketplace admin dashboard...
        </CardContent>
      </Card>
    );
  }

  if (statsQuery.isError || !statsQuery.data) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-8 text-sm text-red-600">
          Failed to load marketplace admin stats.
        </CardContent>
      </Card>
    );
  }

  const stats = statsQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-600">FarmTrace Admin</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Marketplace dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Restore the older moderation dashboard feel while keeping the current live statistics and admin workflows.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            to="/admin/marketplace-products"
            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            Review products
          </Link>
          <Link
            to="/admin/marketplace-orders"
            className="rounded-full border border-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Review orders
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Package}
          label="Total products"
          value={stats.totalProducts}
          tone="bg-blue-100 text-blue-600"
        />
        <MetricCard
          icon={Package}
          label="Published"
          value={stats.publishedProducts}
          tone="bg-emerald-100 text-emerald-600"
        />
        <MetricCard
          icon={ShieldAlert}
          label="Pending review"
          value={stats.pendingReviewProducts}
          tone="bg-yellow-100 text-yellow-600"
        />
        <MetricCard
          icon={ShoppingBag}
          label="Total orders"
          value={stats.totalOrders}
          tone="bg-purple-100 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Operations summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <span className="text-gray-600">Active orders</span>
              <span className="font-semibold text-gray-900">{stats.activeOrders}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <span className="text-gray-600">Completed orders</span>
              <span className="font-semibold text-gray-900">{stats.completedOrders}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <span className="text-gray-600">Cancelled orders</span>
              <span className="font-semibold text-gray-900">{stats.cancelledOrders}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <span className="text-gray-600">Hidden products</span>
              <span className="font-semibold text-gray-900">{stats.hiddenProducts}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Revenue and moderation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Marketplace revenue</p>
                  <p className="mt-1 text-3xl font-bold text-emerald-600">{formatVnd(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <p className="text-sm font-medium text-yellow-800">Pending product approvals</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{stats.pendingReviewProducts}</p>
              <p className="mt-2 text-sm text-gray-600">
                Use the moderation screen to publish, hide, or return listings to review.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
