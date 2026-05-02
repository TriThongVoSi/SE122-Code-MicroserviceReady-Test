import { NavLink } from 'react-router-dom';
import { User, MapPin, Shield } from 'lucide-react';
import { cn } from '@/shared/lib';

const navItems = [
  {
    to: '/marketplace/profile/info',
    icon: User,
    label: 'Thông tin cá nhân',
  },
  {
    to: '/marketplace/profile/addresses',
    icon: MapPin,
    label: 'Sổ địa chỉ',
  },
  {
    to: '/marketplace/profile/security',
    icon: Shield,
    label: 'Bảo mật',
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
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-700 hover:bg-gray-50'
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
