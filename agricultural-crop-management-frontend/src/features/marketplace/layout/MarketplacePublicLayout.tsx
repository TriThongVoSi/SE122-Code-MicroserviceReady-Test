import { useState, type FormEvent } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Facebook, Instagram, Menu, Search, ShoppingCart, Store, Twitter, Wheat, X } from "lucide-react";
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

const NAV_LINKS = [
  { to: "/marketplace", label: "Home" },
  { to: "/marketplace/products", label: "Products" },
  { to: "/marketplace/farms", label: "Farms" },
  { to: "/marketplace/traceability", label: "Traceability" },
];

function MarketplaceNavLink({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        isActive
          ? "font-semibold text-emerald-700"
          : "text-slate-600 hover:text-emerald-700"
      }
      end={to === "/marketplace"}
    >
      {label}
    </NavLink>
  );
}

function MarketplaceSearchBar({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/marketplace/products?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, farms..."
        className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
    </form>
  );
}

function MobileMenu({
  isOpen,
  onClose,
  isAuthenticated,
  user,
  cartCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  user: { role?: string } | null;
  cartCount: number;
}) {
  if (!isOpen) return null;
  return (
    <div className="border-t border-slate-200 bg-white md:hidden">
      <div className="space-y-4 px-4 py-4">
        <MarketplaceSearchBar className="w-full" />
        <nav className="flex flex-col gap-3 text-sm">
          {NAV_LINKS.map((link) => (
            <MarketplaceNavLink key={link.to} to={link.to} label={link.label} onClick={onClose} />
          ))}
        </nav>
        <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
          {isAuthenticated ? (
            <>
              <Link to="/marketplace/cart" onClick={onClose}>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <ShoppingCart size={16} />
                  Cart {cartCount > 0 ? `(${cartCount})` : ""}
                </Button>
              </Link>
              <Link to="/marketplace/orders" onClick={onClose}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Orders
                </Button>
              </Link>
              <Link to={resolvePortalRoute(user?.role)} onClick={onClose}>
                <Button size="sm" className="w-full justify-start gap-2">
                  <Store size={14} /> Internal portal
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/sign-up" onClick={onClose}>
                <Button size="sm" className="w-full">Create account</Button>
              </Link>
              <Link to="/sign-in" onClick={onClose}>
                <Button variant="outline" size="sm" className="w-full">Sign in</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MarketplaceFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/marketplace" className="mb-4 flex items-center gap-2">
              <div className="rounded-md bg-emerald-600 p-1.5 text-white">
                <Wheat size={20} />
              </div>
              <span className="text-lg font-bold text-white">ACM Marketplace</span>
            </Link>
            <p className="mb-4 text-sm text-slate-400">
              Transparent agricultural trading platform, connecting directly from farm to your table.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 transition-colors hover:text-white" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-slate-400 transition-colors hover:text-white" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-slate-400 transition-colors hover:text-white" aria-label="Instagram">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Discover */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Discover</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/marketplace/products" className="transition-colors hover:text-emerald-400">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/marketplace/farms" className="transition-colors hover:text-emerald-400">
                  Featured Farms
                </Link>
              </li>
              <li>
                <Link to="/marketplace/traceability" className="transition-colors hover:text-emerald-400">
                  Traceability
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="cursor-default text-slate-400">FAQ</span></li>
              <li><span className="cursor-default text-slate-400">Shipping Policy</span></li>
              <li><span className="cursor-default text-slate-400">Returns &amp; Refunds</span></li>
              <li><span className="cursor-default text-slate-400">Contact Us</span></li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">For Sellers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/sign-up" className="transition-colors hover:text-emerald-400">
                  Register to Sell
                </Link>
              </li>
              <li><span className="cursor-default text-slate-400">Seller Guide</span></li>
              <li><span className="cursor-default text-slate-400">Quality Standards</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} ACM Marketplace. Student Project — SE122.</p>
        </div>
      </div>
    </footer>
  );
}

export function MarketplacePublicLayout() {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useMarketplaceCartMergeBridge();
  const serverCartQuery = useMarketplaceCart({ enabled: isAuthenticated });
  const serverCartCount = serverCartQuery.data?.itemCount ?? 0;

  return (
    <div className="min-h-screen bg-[#f6f8f4] text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/marketplace" className="flex shrink-0 items-center gap-2">
            <div className="rounded-md bg-emerald-600 p-1.5 text-white">
              <Wheat size={20} />
            </div>
            <span className="font-semibold tracking-tight text-slate-900">
              ACM Marketplace
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm md:flex">
            {NAV_LINKS.map((link) => (
              <MarketplaceNavLink key={link.to} to={link.to} label={link.label} />
            ))}
          </nav>

          <MarketplaceSearchBar className="hidden lg:block lg:w-64 xl:w-80" />

          <div className="flex shrink-0 items-center gap-2">
            {/* Desktop auth buttons */}
            <div className="hidden items-center gap-2 md:flex">
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
                    <Button variant="outline" size="sm">Orders</Button>
                  </Link>
                  <Link to={resolvePortalRoute(user?.role)}>
                    <Button size="sm" className="gap-2">
                      <Store size={14} /> Internal portal
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

            {/* Mobile hamburger */}
            <button
              type="button"
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          isAuthenticated={isAuthenticated}
          user={user}
          cartCount={serverCartCount}
        />
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <MarketplaceFooter />
    </div>
  );
}
