import { NavLink } from 'react-router-dom';
import { User, MapPin, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage, Badge } from '@/shared/ui';
import { cn } from '@/shared/lib';

interface ProfileMobileHeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '??'; // Fallback for empty names

  return trimmed
    .split(' ')
    .filter(part => part.length > 0) // Handle multiple spaces
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const navItems = [
  { to: '/marketplace/profile/info', icon: User, label: 'Thông tin' },
  { to: '/marketplace/profile/addresses', icon: MapPin, label: 'Địa chỉ' },
  { to: '/marketplace/profile/security', icon: Shield, label: 'Bảo mật' },
];

export function ProfileMobileHeader({ user }: ProfileMobileHeaderProps) {
  const initials = getInitials(user.name);

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3 p-4">
        <Avatar className="h-12 w-12 bg-emerald-600">
          {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
          <AvatarFallback className="bg-emerald-600 text-sm font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{user.name}</h2>
          <Badge className="mt-1 bg-emerald-600 text-xs text-white">Buyer</Badge>
        </div>
      </div>

      <nav className="flex border-t border-gray-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 border-b-2 py-3 text-xs font-medium transition-colors',
                  isActive
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-gray-500'
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
