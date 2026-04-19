import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { useMarketplaceAdminStats } from "../hooks";
import { formatVnd } from "../lib/format";

export function AdminMarketplaceDashboardPage() {
  const statsQuery = useMarketplaceAdminStats();

  if (statsQuery.isLoading) {
    return <div className="rounded-xl border border-dashed bg-white p-8 text-sm text-slate-500">Loading admin marketplace stats...</div>;
  }

  if (statsQuery.isError || !statsQuery.data) {
    return <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-sm text-red-600">Failed to load admin marketplace stats.</div>;
  }

  const stats = statsQuery.data;
  const cards = [
    { label: "Total products", value: stats.totalProducts },
    { label: "Pending review", value: stats.pendingReviewProducts },
    { label: "Published", value: stats.publishedProducts },
    { label: "Hidden", value: stats.hiddenProducts },
    { label: "Total orders", value: stats.totalOrders },
    { label: "Active orders", value: stats.activeOrders },
    { label: "Completed orders", value: stats.completedOrders },
    { label: "Cancelled orders", value: stats.cancelledOrders },
    { label: "Revenue", value: formatVnd(stats.totalRevenue) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Marketplace moderation dashboard</h1>
          <p className="text-sm text-slate-500">Moderation and fulfillment overview across marketplace.</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/admin/marketplace-products" className="text-emerald-700 hover:underline">Moderate products</Link>
          <Link to="/admin/marketplace-orders" className="text-emerald-700 hover:underline">Review orders</Link>
        </div>
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
    </div>
  );
}
