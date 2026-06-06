import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Package, CheckCircle2, Star } from 'lucide-react';

interface ProfileUserCardProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  stats: {
    totalOrders: number;
    completedOrders: number;
    totalReviews: number;
  };
  isLoading?: boolean;
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

const statItems = [
  {
    key: 'totalOrders' as const,
    label: 'Đơn hàng',
    icon: Package,
    color: 'text-gray-900',
    iconColor: 'text-emerald-500',
  },
  {
    key: 'completedOrders' as const,
    label: 'Hoàn tất',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    iconColor: 'text-emerald-500',
  },
  {
    key: 'totalReviews' as const,
    label: 'Đánh giá',
    icon: Star,
    color: 'text-amber-500',
    iconColor: 'text-amber-400',
  },
];

export function ProfileUserCard({ user, stats, isLoading }: ProfileUserCardProps) {
  const initials = getInitials(user.name);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Avatar + Info */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <Avatar className="h-20 w-20 ring-4 ring-emerald-100">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-xl font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          {/* Online dot indicator */}
          <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
        </div>

        <h2 className="mt-3 text-lg font-semibold text-gray-900">{user.name}</h2>
        <p className="mt-0.5 text-sm text-gray-500">{user.email}</p>

        <span className="mt-2 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-medium text-emerald-700">
          Buyer
        </span>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-3 gap-1 rounded-xl bg-gray-50/80 p-3">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="flex flex-col items-center gap-1 rounded-lg py-2 transition-colors hover:bg-white"
            >
              <Icon className={`h-4 w-4 ${item.iconColor}`} />
              <span className={`text-xl font-bold ${item.color}`}>
                {isLoading ? '–' : stats[item.key]}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
