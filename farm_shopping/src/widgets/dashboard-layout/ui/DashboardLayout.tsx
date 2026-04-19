import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Home, User } from 'lucide-react';
import { useAuthStore } from '@/src/features/auth/model/store';
import { cn } from '@/src/shared/lib/helpers';

export function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const isSeller = user?.role === 'seller';
  const isAdmin = user?.role === 'admin';

  const sellerLinks = [
    { name: 'Tổng quan', path: '/seller', icon: LayoutDashboard },
    { name: 'Sản phẩm', path: '/seller/products', icon: Package },
    { name: 'Đơn hàng', path: '/seller/orders', icon: ShoppingBag },
    { name: 'Hồ sơ', path: '/seller/profile', icon: User },
  ];

  const adminLinks = [
    { name: 'Tổng quan', path: '/admin', icon: LayoutDashboard },
    { name: 'Duyệt sản phẩm', path: '/admin/products', icon: Package },
    { name: 'Người dùng', path: '/admin/users', icon: Users },
    { name: 'Hồ sơ', path: '/admin/profile', icon: User },
  ];

  const links = isSeller ? sellerLinks : isAdmin ? adminLinks : [];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
            <Package size={24} />
            FarmTrace
          </Link>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="font-medium">{user?.name}</div>
          <div className="text-sm text-gray-500 capitalize">{user?.role} Portal</div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon size={20} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Home size={20} />
            Về trang chủ
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:hidden">
          <span className="font-bold text-emerald-600">FarmTrace</span>
          <button onClick={logout} className="text-sm text-gray-600">Đăng xuất</button>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
