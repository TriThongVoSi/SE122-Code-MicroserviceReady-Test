import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/src/features/cart/model/store';
import { useAuthStore } from '@/src/features/auth/model/store';
import { mockProducts } from '@/src/shared/api/mock';
import { Button } from '@/src/shared/ui/Button';
import { Input } from '@/src/shared/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/Card';
import { formatCurrency } from '@/src/shared/lib/helpers';

export function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated, addresses } = useAuthStore();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

  const [formData, setFormData] = useState({
    fullName: defaultAddress?.fullName || user?.name || '',
    phone: defaultAddress?.phone || user?.phone || '',
    address: defaultAddress ? `${defaultAddress.street}, ${defaultAddress.ward}, ${defaultAddress.district}, ${defaultAddress.province}` : '',
    note: ''
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  const shippingFee = 30000;
  const total = getTotal() + shippingFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đặt hàng');
      navigate('/login');
      return;
    }
    alert('Đặt hàng thành công!');
    clearCart();
    navigate('/orders');
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Thanh toán</h1>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                  <Input
                    required
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <Input
                    required
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng</label>
                <Input
                  required
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tùy chọn)</label>
                <Input
                  placeholder="Ghi chú thêm cho người giao hàng..."
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phương thức thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</span>
                  <span className="block text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</span>
                </div>
              </label>

              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'bank' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="payment"
                  value="bank"
                  checked={paymentMethod === 'bank'}
                  onChange={() => setPaymentMethod('bank')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">Chuyển khoản ngân hàng</span>
                  <span className="block text-sm text-gray-500">Chuyển khoản trực tiếp vào tài khoản của chúng tôi</span>
                </div>
              </label>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-96 shrink-0">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Đơn hàng của bạn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {items.map(item => {
                  const product = mockProducts.find(p => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1 pr-4">
                        <span className="font-medium text-gray-900">{product.name}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(product.price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 text-sm mb-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính:</span>
                  <span className="font-medium">{formatCurrency(getTotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí giao hàng:</span>
                  <span className="font-medium">{formatCurrency(shippingFee)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Tổng cộng:</span>
                  <span className="text-xl font-bold text-emerald-600">{formatCurrency(total)}</span>
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg">
                Đặt hàng
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
