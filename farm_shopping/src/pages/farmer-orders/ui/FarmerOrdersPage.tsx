import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { mockOrders } from '@/src/shared/api/mock';
import { Button } from '@/src/shared/ui/Button';
import { Badge } from '@/src/shared/ui/Badge';
import { formatCurrency, formatDate } from '@/src/shared/lib/helpers';

export function SellerOrders() {
  const sellerId = 'u2';
  const orders = mockOrders.filter(o => o.sellerId === sellerId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Chờ xác nhận</Badge>;
      case 'confirmed': return <Badge variant="secondary">Đã xác nhận</Badge>;
      case 'preparing': return <Badge variant="secondary">Đang chuẩn bị</Badge>;
      case 'delivering': return <Badge variant="default">Đang giao</Badge>;
      case 'completed': return <Badge variant="success">Hoàn thành</Badge>;
      case 'cancelled': return <Badge variant="destructive">Đã hủy</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="p-4 font-medium">Mã đơn</th>
                <th className="p-4 font-medium">Ngày đặt</th>
                <th className="p-4 font-medium">Khách hàng</th>
                <th className="p-4 font-medium">Tổng tiền</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">#{order.id.toUpperCase()}</td>
                  <td className="p-4 text-gray-600">{formatDate(order.createdAt)}</td>
                  <td className="p-4 text-gray-600">Nguyễn Văn Mua</td>
                  <td className="p-4 font-medium text-emerald-600">{formatCurrency(order.total)}</td>
                  <td className="p-4">{getStatusBadge(order.status)}</td>
                  <td className="p-4 text-right">
                    <Link to={`/seller/orders/${order.id}`}>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                        <Eye size={16} className="mr-1" /> Chi tiết
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
