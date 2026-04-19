import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

// widgets
import { PublicLayout } from '@/src/widgets/public-layout/ui/PublicLayout';
import { DashboardLayout } from '@/src/widgets/dashboard-layout/ui/DashboardLayout';

// features
import { useAuthStore } from '@/src/features/auth/model/store';

// pages — auth
import { Login } from '@/src/pages/login/ui/LoginPage';
import { Register } from '@/src/pages/register/ui/RegisterPage';
import { Profile } from '@/src/pages/profile/ui/ProfilePage';

// pages — catalog
import { Home } from '@/src/pages/home/ui/HomePage';
import { ProductList } from '@/src/pages/product-list/ui/ProductListPage';
import { ProductDetail } from '@/src/pages/product-detail/ui/ProductDetailPage';
import { FarmList } from '@/src/pages/farm-list/ui/FarmListPage';
import { FarmDetail } from '@/src/pages/farm-detail/ui/FarmDetailPage';
import { Traceability } from '@/src/pages/traceability/ui/TraceabilityPage';

// pages — cart & orders
import { Cart } from '@/src/pages/cart/ui/CartPage';
import { Checkout } from '@/src/pages/checkout/ui/CheckoutPage';
import { MyOrders } from '@/src/pages/my-orders/ui/MyOrdersPage';
import { OrderDetail as BuyerOrderDetail } from '@/src/pages/order-detail/ui/OrderDetailPage';

// pages — farmer (seller)
import { SellerDashboard } from '@/src/pages/farmer-dashboard/ui/FarmerDashboardPage';
import { SellerProductList } from '@/src/pages/farmer-products/ui/FarmerProductListPage';
import { CreateEditProduct } from '@/src/pages/farmer-product-edit/ui/CreateEditProductPage';
import { SellerProductDetail } from '@/src/pages/farmer-product-detail/ui/FarmerProductDetailPage';
import { SellerOrders } from '@/src/pages/farmer-orders/ui/FarmerOrdersPage';
import { SellerOrderDetail } from '@/src/pages/farmer-order-detail/ui/FarmerOrderDetailPage';

// pages — admin
import { AdminDashboard } from '@/src/pages/admin-dashboard/ui/AdminDashboardPage';
import { AdminProducts } from '@/src/pages/admin-products/ui/AdminProductsPage';
import { AdminUsers } from '@/src/pages/admin-users/ui/AdminUsersPage';

/**
 * ProtectedRoute — FSD features/auth guard
 * Kiểm tra authentication và role-based access
 */
function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'products', element: <ProductList /> },
      { path: 'products/:slug', element: <ProductDetail /> },
      { path: 'farms', element: <FarmList /> },
      { path: 'farms/:id', element: <FarmDetail /> },
      { path: 'traceability', element: <Traceability /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'cart', element: <Cart /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'checkout', element: <Checkout /> },
          { path: 'orders', element: <MyOrders /> },
          { path: 'orders/:id', element: <BuyerOrderDetail /> },
          { path: 'profile', element: <Profile /> },
        ],
      },
    ],
  },
  {
    path: 'seller',
    element: <ProtectedRoute allowedRoles={['seller']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <SellerDashboard /> },
          { path: 'products', element: <SellerProductList /> },
          { path: 'products/new', element: <CreateEditProduct /> },
          { path: 'products/:id/edit', element: <CreateEditProduct /> },
          { path: 'products/:id', element: <SellerProductDetail /> },
          { path: 'orders', element: <SellerOrders /> },
          { path: 'orders/:id', element: <SellerOrderDetail /> },
          { path: 'profile', element: <Profile /> },
        ],
      },
    ],
  },
  {
    path: 'admin',
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'products', element: <AdminProducts /> },
          { path: 'users', element: <AdminUsers /> },
          { path: 'profile', element: <Profile /> },
        ],
      },
    ],
  },
]);
