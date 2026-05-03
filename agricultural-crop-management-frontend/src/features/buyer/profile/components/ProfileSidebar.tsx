import { ProfileUserCard } from './ProfileUserCard';
import { ProfileNavigation } from './ProfileNavigation';

interface ProfileSidebarProps {
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

export function ProfileSidebar({ user, stats, isLoading }: ProfileSidebarProps) {
  return (
    <aside className="w-80 shrink-0 border-r border-gray-200 bg-white">
      <div className="sticky top-0 space-y-6 p-6">
        <ProfileUserCard user={user} stats={stats} isLoading={isLoading} />
        <ProfileNavigation />
      </div>
    </aside>
  );
}
