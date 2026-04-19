import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Truck, CreditCard } from 'lucide-react';
import { mockOrders, mockProducts } from '@/src/shared/api/mock';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/Card';
import { Badge } from '@/src/shared/ui/Badge';
import { Button } from '@/src/shared/ui/Button';
import { formatCurrency, formatDate } from '@/src/shared/lib/helpers';

export function SellerOrderDetail() {
  const { id } = useParams();
  const order = mockOrders.find(o => o.id === id);
  const [status, setStatus] = useState(order?.status || 'pending');

  if (!order) {
    return <div className="py-20 text-center">Đơn hàng không tồn tại.</div>;
  }

  const handleUpdateStatus = (newStatus: string) => {
    setStatus(newStatus as any);
    alert('Cập nhật trạng thái thành công!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/seller/orders" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng #{order.id.toUpperCase()}</h1>
        </div>
        <div className="flex gap-2">
          {status === 'pending' && <Button onClick={() => handleUpdateStatus('confirmed')}>Xác nhận đơn</Button>}
          {status === 'confirmed' && <Button onClick={() => handleUpdateStatus('preparing')}>Đang chuẩn bị</Button>}
          {status === 'preparing' && <Button onClick={() => handleUpdateStatus('delivering')}>Giao hàng</Button>}
          {status === 'delivering' && <Button onClick={() => handleUpdateStatus('completed')} variant="success">Hoàn thành</Button>}
          {(status === 'pending' || status === 'confirmed') && <Button variant="danger" onClick={() => handleUpdateStatus('cancelled')}>Hủy đơn</Button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {order.items.map((item, index) => {
                const product = mockProducts.find(p => p.id === item.productId);
                if (!product) return null;
                return (
                  <div key={index} className="p-4 flex items-center gap-4">
                    <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded bg-gray-100" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(item.price)} x {item.quantity}</p>
                    </div>
                    <div className="font-bold text-gray-900">{formatCurrency(item.quantity * item.price)}</div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span>{formatCurrency(order.total - order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-emerald-600 pt-2 border-t border-gray-200">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-500 uppercase tracking-wider">Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Nguyễn Văn Mua</p>
                  <p className="text-sm text-gray-600">{order.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400 shrink-0" />
                <p className="text-sm text-gray-600">{order.phone}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-500 uppercase tracking-wider">Thanh toán & Vận chuyển</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <CreditCard size={16} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.paymentMethod}</p>
                  <p className="text-xs text-gray-500">Trạng thái: {status === 'completed' ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck size={16} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Giao hàng tiêu chuẩn</p>
                  <p className="text-xs text-gray-500">Trạng thái: <span className="capitalize">{status}</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
