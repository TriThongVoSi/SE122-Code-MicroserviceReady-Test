import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut, Package } from 'lucide-react';
import { useAuthStore } from '@/src/features/auth/model/store';
import { useCartStore } from '@/src/features/cart/model/store';
import { Button } from '@/src/shared/ui/Button';

export function AppHeader() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-emerald-600 text-white p-1.5 rounded-md">
              <Package size={24} />
            </div>
            <span className="text-xl font-bold text-emerald-800 hidden sm:inline-block">FarmTrace</span>
          </Link>

          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-600">
            <Link to="/products" className="hover:text-emerald-600">Sản phẩm</Link>
            <Link to="/farms" className="hover:text-emerald-600">Nông trại</Link>
            <Link to="/about" className="hover:text-emerald-600">Về chúng tôi</Link>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-4 hidden lg:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="search"
              placeholder="Tìm kiếm nông sản, nông trại..."
              className="w-full bg-gray-100 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative p-2 text-gray-600 hover:text-emerald-600">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
              </div>

              {user?.role === 'seller' && (
                <Button variant="outline" size="sm" onClick={() => navigate('/seller')}>
                  Dashboard
                </Button>
              )}
              {user?.role === 'admin' && (
                <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                  Admin
                </Button>
              )}
              {user?.role === 'buyer' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>
                    Đơn hàng
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                    Hồ sơ
                  </Button>
                </>
              )}

              <Button variant="ghost" size="icon" onClick={logout} title="Đăng xuất">
                <LogOut size={20} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/login')}>Đăng nhập</Button>
              <Button onClick={() => navigate('/register')} className="hidden sm:inline-flex">Đăng ký</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
