import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib";

const sellerTabs = [
  {
    to: "/farmer/marketplace-dashboard",
    labelKey: "marketplaceSeller.tabs.overview",
  },
  {
    to: "/farmer/marketplace-products",
    labelKey: "marketplaceSeller.tabs.products",
  },
  {
    to: "/farmer/marketplace-orders",
    labelKey: "marketplaceSeller.tabs.orders",
  },
] as const;

export function SellerMarketplaceTabs() {
  const { t } = useTranslation();

  return (
    <div className="border-b border-slate-200">
      <nav className="flex gap-6">
        {sellerTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                "relative pb-3 text-sm font-medium transition-colors",
                isActive
                  ? "text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-emerald-600"
                  : "text-slate-500 hover:text-slate-700",
              )
            }
          >
            {t(tab.labelKey)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
