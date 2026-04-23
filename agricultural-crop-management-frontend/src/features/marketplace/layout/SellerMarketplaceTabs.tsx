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
      <nav className="-mb-px flex gap-1" aria-label="Marketplace seller tabs">
        {sellerTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to.includes("dashboard")}
            className={({ isActive }) =>
              cn(
                "relative rounded-t-md px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-emerald-700 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-emerald-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
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
