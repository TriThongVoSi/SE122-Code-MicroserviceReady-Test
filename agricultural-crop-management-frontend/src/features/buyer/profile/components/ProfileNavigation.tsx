import { NavLink } from 'react-router-dom';
import { User, MapPin, Shield } from 'lucide-react';
import { cn } from '@/shared/lib';

const navItems = [
  {
    to: '/marketplace/profile/info',
    icon: User,
    label: 'Thông tin cá nhân',
    description: 'Họ tên, email, điện thoại',
  },
  {
    to: '/marketplace/profile/addresses',
    icon: MapPin,
    label: 'Sổ địa chỉ',
    description: 'Quản lý địa chỉ giao hàng',
  },
  {
    to: '/marketplace/profile/security',
    icon: Shield,
    label: 'Bảo mật',
    description: 'Mật khẩu & xác thực',
  },
];

export function ProfileNavigation() {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'group flex items-start gap-3 rounded-xl px-3 py-3 transition-all duration-200',
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                    isActive
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span
                    className={cn(
                      'block truncate text-xs transition-colors',
                      isActive ? 'text-emerald-500' : 'text-gray-400'
                    )}
                  >
                    {item.description}
                  </span>
                </div>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
