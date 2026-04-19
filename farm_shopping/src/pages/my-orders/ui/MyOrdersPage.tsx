import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { mockOrders, mockProducts } from '@/src/shared/api/mock';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/Card';
import { Badge } from '@/src/shared/ui/Badge';
import { Button } from '@/src/shared/ui/Button';
import { formatCurrency, formatDate } from '@/src/shared/lib/helpers';

export function MyOrders() {
  const orders = mockOrders;

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Đơn hàng của tôi</h1>

      <div className="space-y-6">
        {orders.map(order => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-200 flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Mã đơn: <span className="text-gray-900 font-bold">#{order.id.toUpperCase()}</span>
                </CardTitle>
                <div className="text-xs text-gray-500 mt-1">
                  Đặt ngày: {formatDate(order.createdAt)}
                </div>
              </div>
              <div>{getStatusBadge(order.status)}</div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {order.items.map((item, index) => {
                  const product = mockProducts.find(p => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <div key={index} className="p-4 flex items-center gap-4">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-md bg-gray-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <div className="text-sm text-gray-500 mt-1">
                          Số lượng: {item.quantity} x {formatCurrency(item.price)}
                        </div>
                      </div>
                      <div className="font-medium text-gray-900">
                        {formatCurrency(item.quantity * item.price)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Tổng tiền ({order.items.length} sản phẩm): <span className="text-lg font-bold text-emerald-600 ml-2">{formatCurrency(order.total)}</span>
                </div>
                <Link to={`/orders/${order.id}`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    Xem chi tiết <ChevronRight size={16} />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-gray-500 mb-6">Bạn chưa thực hiện giao dịch nào trên FarmTrace.</p>
            <Link to="/products">
              <Button>Bắt đầu mua sắm</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
