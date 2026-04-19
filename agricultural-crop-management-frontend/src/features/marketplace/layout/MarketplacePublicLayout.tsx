import { Link, NavLink, Outlet } from "react-router-dom";
import { ShoppingCart, Store, Wheat } from "lucide-react";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/ui";
import {
  useMarketplaceCart,
  useMarketplaceCartMergeBridge,
} from "../hooks";

function resolvePortalRoute(role: string | undefined): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "employee":
      return "/employee/tasks";
    case "buyer":
      return "/marketplace/orders";
    default:
      return "/farmer/dashboard";
  }
}

function MarketplaceNavLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive
          ? "text-emerald-700 font-semibold"
          : "text-slate-600 hover:text-emerald-700"
      }
      end={to === "/marketplace"}
    >
      {label}
    </NavLink>
  );
}

export function MarketplacePublicLayout() {
  const { isAuthenticated, user } = useAuth();

  useMarketplaceCartMergeBridge();
  const serverCartQuery = useMarketplaceCart({ enabled: isAuthenticated });
  const serverCartCount = serverCartQuery.data?.itemCount ?? 0;

  return (
    <div className="min-h-screen bg-[#f6f8f4] text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/marketplace" className="flex items-center gap-2">
            <div className="rounded-md bg-emerald-600 p-1.5 text-white">
              <Wheat size={20} />
            </div>
            <span className="font-semibold tracking-tight text-slate-900">
              ACM Marketplace
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm md:flex">
            <MarketplaceNavLink to="/marketplace" label="Home" />
            <MarketplaceNavLink to="/marketplace/products" label="Products" />
            <MarketplaceNavLink to="/marketplace/farms" label="Farms" />
            <MarketplaceNavLink to="/marketplace/traceability" label="Traceability" />
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/marketplace/cart" className="relative inline-flex">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ShoppingCart size={16} /> Cart
                  </Button>
                  {serverCartCount > 0 ? (
                    <span className="absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white">
                      {serverCartCount}
                    </span>
                  ) : null}
                </Link>
                <Link to="/marketplace/orders">
                  <Button variant="outline" size="sm">
                    Orders
                  </Button>
                </Link>
                <Link to={resolvePortalRoute(user?.role)}>
                  <Button size="sm" className="gap-2">
                    <Store size={14} />
                    Internal portal
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <span className="hidden rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 sm:inline-flex">
                  Guest mode
                </span>
                <Link to="/sign-up">
                  <Button size="sm">Create account</Button>
                </Link>
                <Link to="/sign-in">
                  <Button variant="outline" size="sm">Sign in</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8">
          <span>Buyer capability uses authenticated user model.</span>
          <span>
            Route prefix:
            <code className="ml-1 rounded bg-slate-100 px-1 py-0.5">/marketplace/*</code>
          </span>
        </div>
      </footer>
    </div>
  );
}
