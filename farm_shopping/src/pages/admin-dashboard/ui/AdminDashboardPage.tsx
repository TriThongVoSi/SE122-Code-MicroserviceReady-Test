import { Users, Package, ShoppingBag, ShieldAlert } from 'lucide-react';
import { mockUsers, mockProducts, mockOrders } from '@/src/shared/api/mock';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/Card';
import { Badge } from '@/src/shared/ui/Badge';

export function AdminDashboard() {
  const totalUsers = mockUsers.length;
  const totalSellers = mockUsers.filter(u => u.role === 'seller').length;
  const pendingProducts = mockProducts.filter(p => p.status === 'hidden').length;
  const totalOrders = mockOrders.length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng người dùng</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalUsers}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng nông trại</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalSellers}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Sản phẩm chờ duyệt</p>
              <h3 className="text-2xl font-bold text-gray-900">{pendingProducts}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalOrders}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Người dùng mới</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'seller' ? 'warning' : 'default'} className="capitalize">
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm cần duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Không có sản phẩm nào đang chờ duyệt.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
