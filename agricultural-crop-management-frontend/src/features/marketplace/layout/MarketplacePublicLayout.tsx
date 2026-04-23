import { useState, type FormEvent } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Facebook,
  Instagram,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  Store,
  Twitter,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/ui";
import { useMarketplaceCart, useMarketplaceCartMergeBridge } from "../hooks";

function resolvePortalRoute(role: string | undefined): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "employee":
      return "/employee/tasks";
    case "buyer":
      return "/marketplace/orders";
    default:
      return "/farmer/marketplace-dashboard";
  }
}

const NAV_LINKS = [
  { to: "/marketplace/products", label: "Sản phẩm" },
  { to: "/marketplace/farms", label: "Nông trại" },
  { to: "/marketplace/traceability", label: "Truy xuất" },
];

function MarketplaceNavLink({
  to,
  label,
  onClick,
}: {
  to: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        isActive
          ? "text-sm font-medium text-emerald-600"
          : "text-sm font-medium text-gray-600 transition-colors hover:text-emerald-600"
      }
    >
      {label}
    </NavLink>
  );
}

function MarketplaceSearchBar({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    navigate(`/marketplace/products?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
      <input
        type="search"
        placeholder="Tìm kiếm nông sản, nông trại..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full rounded-full bg-gray-100 py-2 pl-9 pr-4 text-sm text-gray-700 outline-none transition focus:ring-2 focus:ring-emerald-500"
      />
    </form>
  );
}

function MarketplaceFooter() {
  return (
    <footer className="bg-gray-900 py-12 text-gray-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link to="/marketplace" className="mb-4 flex items-center gap-2">
              <div className="rounded-md bg-emerald-600 p-1.5 text-white">
                <Package size={24} />
              </div>
              <span className="text-xl font-bold text-white">FarmTrace</span>
            </Link>
            <p className="mb-4 text-sm text-gray-400">
              Nền tảng giao dịch nông sản minh bạch, kết nối trực tiếp từ nông trại đến bàn ăn của bạn.
            </p>
            <div className="flex gap-4">
              <a href="#" className="transition-colors hover:text-white" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="transition-colors hover:text-white" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="transition-colors hover:text-white" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Khám phá</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/marketplace/products" className="hover:text-emerald-400">Tất cả sản phẩm</Link></li>
              <li><Link to="/marketplace/farms" className="hover:text-emerald-400">Nông trại tiêu biểu</Link></li>
              <li><Link to="/marketplace/traceability" className="hover:text-emerald-400">Truy xuất nguồn gốc</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Câu hỏi thường gặp</li>
              <li>Chính sách vận chuyển</li>
              <li>Đổi trả và hoàn tiền</li>
              <li>Liên hệ</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Dành cho người bán</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/sign-up" className="hover:text-emerald-400">Đăng ký bán hàng</Link></li>
              <li className="text-gray-400">Hướng dẫn bán hàng</li>
              <li className="text-gray-400">Tiêu chuẩn chất lượng</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} FarmTrace. Đồ án sinh viên.</p>
        </div>
      </div>
    </footer>
  );
}

function MobileMenu({
  isOpen,
  onClose,
  isAuthenticated,
  userName,
  userRole,
  cartCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  userName?: string;
  userRole?: string;
  cartCount: number;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 bg-white md:hidden">
      <div className="space-y-4 px-4 py-4">
        <MarketplaceSearchBar className="w-full" />
        <nav className="flex flex-col gap-3">
          <Link to="/marketplace" onClick={onClose} className="text-sm font-medium text-gray-700 hover:text-emerald-600">
            Trang chủ
          </Link>
          {NAV_LINKS.map((link) => (
            <MarketplaceNavLink key={link.to} to={link.to} label={link.label} onClick={onClose} />
          ))}
        </nav>

        <div className="border-t border-gray-100 pt-3">
          {isAuthenticated ? (
            <div className="space-y-2">
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <p className="text-sm font-medium text-gray-900">{userName ?? "Tài khoản của bạn"}</p>
                <p className="text-xs capitalize text-gray-500">{userRole ?? "buyer"}</p>
              </div>
              <Link to="/marketplace/cart" onClick={onClose} className="flex items-center gap-2 text-sm text-gray-700 hover:text-emerald-600">
                <ShoppingCart size={16} /> Giỏ hàng ({cartCount})
              </Link>
              <Link to="/marketplace/orders" onClick={onClose} className="flex items-center gap-2 text-sm text-gray-700 hover:text-emerald-600">
                <Package size={16} /> Đơn hàng của tôi
              </Link>
              <Link to={resolvePortalRoute(userRole)} onClick={onClose} className="flex items-center gap-2 text-sm text-gray-700 hover:text-emerald-600">
                <Store size={16} /> Vào trang quản lý
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/sign-in" onClick={onClose}>
                <Button variant="ghost" className="w-full justify-start">Đăng nhập</Button>
              </Link>
              <Link to="/sign-up" onClick={onClose}>
                <Button className="w-full justify-start">Đăng ký</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MarketplacePublicLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useMarketplaceCartMergeBridge();
  const serverCartQuery = useMarketplaceCart({ enabled: isAuthenticated });
  const serverCartCount = serverCartQuery.data?.itemCount ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/marketplace" className="flex items-center gap-2">
              <div className="rounded-md bg-emerald-600 p-1.5 text-white">
                <Package size={24} />
              </div>
              <span className="hidden text-xl font-bold text-emerald-800 sm:inline-block">FarmTrace</span>
            </Link>

            <div className="hidden items-center gap-4 md:flex">
              <NavLink
                to="/marketplace"
                end
                className={({ isActive }) =>
                  isActive
                    ? "text-sm font-medium text-emerald-600"
                    : "text-sm font-medium text-gray-600 transition-colors hover:text-emerald-600"
                }
              >
                Trang chủ
              </NavLink>
              {NAV_LINKS.map((link) => (
                <MarketplaceNavLink key={link.to} to={link.to} label={link.label} />
              ))}
            </div>
          </div>

          <div className="mx-4 hidden max-w-md flex-1 lg:block">
            <MarketplaceSearchBar />
          </div>

          <div className="flex items-center gap-3">
            <Link to="/marketplace/cart" className="relative p-2 text-gray-600 transition-colors hover:text-emerald-600">
              <ShoppingCart size={24} />
              {serverCartCount > 0 ? (
                <span className="absolute right-0 top-0 inline-flex translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full bg-red-600 px-2 py-1 text-xs font-bold leading-none text-white">
                  {serverCartCount}
                </span>
              ) : null}
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              {isAuthenticated ? (
                <>
                  <div className="hidden flex-col items-end sm:flex">
                    <span className="text-sm font-medium text-gray-900">{user?.name ?? "Người dùng"}</span>
                    <span className="text-xs capitalize text-gray-500">{user?.role ?? "buyer"}</span>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/marketplace/orders">Đơn hàng</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to={resolvePortalRoute(user?.role)}>
                      <Store size={14} /> Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={logout} title="Đăng xuất">
                    <LogOut size={18} />
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/sign-in">
                      <User size={14} /> Đăng nhập
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/sign-up">Đăng ký</Link>
                  </Button>
                </>
              )}
            </div>

            <button
              type="button"
              className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
              onClick={() => setMobileMenuOpen((current) => !current)}
              aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          isAuthenticated={isAuthenticated}
          userName={user?.name}
          userRole={user?.role}
          cartCount={serverCartCount}
        />
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <MarketplaceFooter />
    </div>
  );
}
