import { LayoutDashboard, Package, ShoppingBag } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/shared/lib";

const sellerTabs = [
  {
    to: "/farmer/marketplace-dashboard",
    label: "Overview",
    description: "Store summary",
    icon: LayoutDashboard,
  },
  {
    to: "/farmer/marketplace-products",
    label: "Products",
    description: "Listings and stock",
    icon: Package,
  },
  {
    to: "/farmer/marketplace-orders",
    label: "Orders",
    description: "Buyer orders",
    icon: ShoppingBag,
  },
] as const;

export function SellerMarketplaceTabs() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
          FarmTrace Seller
        </p>
        <h2 className="mt-1 text-lg font-semibold text-gray-900">Marketplace workspace</h2>
      </div>

      <nav className="grid gap-3 p-3 md:grid-cols-3" aria-label="Marketplace seller tabs">
        {sellerTabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to.endsWith("dashboard")}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                  isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900",
                )
              }
            >
              <div className="rounded-lg bg-white p-2 shadow-sm">
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{tab.label}</p>
                <p className="text-xs text-gray-500">{tab.description}</p>
              </div>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
