import { Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import { mockOrders, mockProducts } from '@/src/shared/api/mock';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/Card';
import { formatCurrency } from '@/src/shared/lib/helpers';

export function SellerDashboard() {
  const sellerId = 'u2';
  const myProducts = mockProducts.filter(p => p.sellerId === sellerId);
  const myOrders = mockOrders.filter(o => o.sellerId === sellerId);

  const totalRevenue = myOrders
    .filter(o => o.status === 'completed')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingOrders = myOrders.filter(o => o.status === 'pending').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tổng quan cửa hàng</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Doanh thu</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Đơn hàng mới</p>
              <h3 className="text-2xl font-bold text-gray-900">{pendingOrders}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Sản phẩm</p>
              <h3 className="text-2xl font-bold text-gray-900">{myProducts.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Lượt xem</p>
              <h3 className="text-2xl font-bold text-gray-900">1,234</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myOrders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">#{order.id.toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{order.items.length} sản phẩm</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">{formatCurrency(order.total)}</p>
                    <p className="text-sm text-gray-500 capitalize">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm sắp hết hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myProducts.filter(p => p.stock < 100).map(product => (
                <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded object-cover" referrerPolicy="no-referrer" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                    <p className="text-sm text-gray-500">Tồn kho: <span className="text-red-500 font-bold">{product.stock}</span> {product.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
