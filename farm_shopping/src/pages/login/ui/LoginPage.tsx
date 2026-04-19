import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/src/features/auth/model/store';
import { Button } from '@/src/shared/ui/Button';
import { Input } from '@/src/shared/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/Card';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    navigate('/');
  };

  const handleDemoLogin = (role: string) => {
    login('', role);
    if (role === 'seller') navigate('/seller');
    else if (role === 'admin') navigate('/admin');
    else navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-emerald-800">Đăng nhập</CardTitle>
          <p className="text-sm text-gray-500 mt-2">Chào mừng bạn trở lại với FarmTrace</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full">Đăng nhập</Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Chưa có tài khoản? </span>
            <Link to="/register" className="text-emerald-600 font-medium hover:underline">Đăng ký ngay</Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500 mb-4">Demo Accounts (Click để đăng nhập nhanh)</p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDemoLogin('buyer')}>Đăng nhập as Buyer</Button>
              <Button variant="outline" size="sm" onClick={() => handleDemoLogin('seller')}>Đăng nhập as Seller</Button>
              <Button variant="outline" size="sm" onClick={() => handleDemoLogin('admin')}>Đăng nhập as Admin</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
