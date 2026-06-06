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
    <aside className="w-72 shrink-0">
      <div className="sticky top-24 space-y-4">
        <ProfileUserCard user={user} stats={stats} isLoading={isLoading} />
        <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
          <ProfileNavigation />
        </div>
      </div>
    </aside>
  );
}
