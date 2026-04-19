import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { useMarketplaceFarmerDashboard } from "../hooks";
import { formatDateTime, formatVnd } from "../lib/format";

export function SellerDashboardPage() {
  const dashboardQuery = useMarketplaceFarmerDashboard();

  if (dashboardQuery.isLoading) {
    return <div className="rounded-xl border border-dashed bg-white p-8 text-sm text-slate-500">Loading seller dashboard...</div>;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-sm text-red-600">Failed to load seller dashboard.</div>;
  }

  const dashboard = dashboardQuery.data;
  const cards = [
    { label: "Total products", value: dashboard.totalProducts },
    { label: "Pending review", value: dashboard.pendingReviewProducts },
    { label: "Published", value: dashboard.publishedProducts },
    { label: "Low stock", value: dashboard.lowStockProducts },
    { label: "Pending orders", value: dashboard.pendingOrders },
    { label: "Revenue", value: formatVnd(dashboard.totalRevenue) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Marketplace seller dashboard</h1>
          <p className="text-sm text-slate-500">Overview of your marketplace products and orders.</p>
        </div>
        <Link to="/farmer/marketplace-products" className="text-sm text-emerald-700 hover:underline">
          Manage products
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dashboard.recentOrders.length === 0 && (
            <p className="text-sm text-slate-500">No orders yet.</p>
          )}
          {dashboard.recentOrders.map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{order.orderCode}</p>
                <p className="text-xs text-slate-500">{formatDateTime(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-emerald-700">{formatVnd(order.totalAmount)}</p>
                <Link to={`/farmer/marketplace-orders/${order.id}`} className="text-xs text-emerald-700 hover:underline">
                  View order
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
