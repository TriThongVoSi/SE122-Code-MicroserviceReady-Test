import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';

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

export function ProfileUserCard({ user, stats, isLoading }: ProfileUserCardProps) {
  const initials = getInitials(user.name);

  return (
    <Card className="p-6">
      <CardContent className="flex flex-col items-center space-y-4 p-0">
        <Avatar className="h-24 w-24 bg-emerald-600">
          {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
          <AvatarFallback className="bg-emerald-600 text-2xl font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
          Buyer
        </Badge>

        <div className="grid w-full grid-cols-3 border-y border-gray-200 py-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? '-' : stats.totalOrders}
            </div>
            <div className="text-xs font-medium text-gray-500">ĐƠN HÀNG</div>
          </div>
          <div className="text-center border-x border-gray-200">
            <div className="text-2xl font-bold text-emerald-600">
              {isLoading ? '-' : stats.completedOrders}
            </div>
            <div className="text-xs font-medium text-gray-500">HOÀN TẤT</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {isLoading ? '-' : stats.totalReviews}
            </div>
            <div className="text-xs font-medium text-gray-500">ĐÁNH GIÁ</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
