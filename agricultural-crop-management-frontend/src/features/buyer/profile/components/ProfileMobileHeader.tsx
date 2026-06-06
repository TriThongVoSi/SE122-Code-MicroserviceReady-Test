import { NavLink } from 'react-router-dom';
import { User, MapPin, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui';
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
    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700">
      {/* User Info */}
      <div className="flex items-center gap-3 px-4 pb-5 pt-4">
        <Avatar className="h-14 w-14 ring-2 ring-white/30">
          {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
          <AvatarFallback className="bg-white/20 text-base font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="truncate font-semibold text-white">{user.name}</h2>
          <p className="truncate text-sm text-emerald-100">{user.email}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <nav className="flex px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-t-xl px-2 py-2.5 text-xs font-medium transition-all',
                  isActive
                    ? 'bg-gradient-to-br from-[#f0faf3] via-[#f6faf7] to-[#f8faf9] text-emerald-700'
                    : 'text-emerald-100 hover:text-white'
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
