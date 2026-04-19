import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/src/features/auth/model/store';
import { Button } from '@/src/shared/ui/Button';
import { Input } from '@/src/shared/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/Card';

export function Register() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'seller' ? 'seller' : 'buyer';

  const [role, setRole] = useState(defaultRole);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login('newuser@example.com', role);
    if (role === 'seller') navigate('/seller');
    else navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-emerald-800">Đăng ký tài khoản</CardTitle>
          <p className="text-sm text-gray-500 mt-2">Tham gia cộng đồng FarmTrace</p>
        </CardHeader>
        <CardContent>
          <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'buyer' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500'}`}
              onClick={() => setRole('buyer')}
            >
              Người mua
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'seller' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500'}`}
              onClick={() => setRole('seller')}
            >
              Người bán (Nông trại)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <Input required placeholder="Nhập họ tên của bạn" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input type="email" required placeholder="Nhập email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <Input type="password" required placeholder="Tạo mật khẩu" />
            </div>

            {role === 'seller' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên nông trại</label>
                <Input required placeholder="Nhập tên nông trại của bạn" />
              </div>
            )}

            <Button type="submit" className="w-full mt-6">Đăng ký</Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Đã có tài khoản? </span>
            <Link to="/login" className="text-emerald-600 font-medium hover:underline">Đăng nhập</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
