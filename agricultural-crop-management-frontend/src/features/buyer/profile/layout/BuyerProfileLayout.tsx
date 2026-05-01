import { Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { ProfileSidebar } from '../components/ProfileSidebar';
import { ProfileMobileHeader } from '../components/ProfileMobileHeader';
import { useBuyerStats } from '../hooks/useBuyerStats';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { Loader2 } from 'lucide-react';

export function BuyerProfileLayout() {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useBuyerStats();
  const isMobile = useMediaQuery('(max-width: 767px)');

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  const userData = {
    name: user.profile?.fullName || user.username || 'User',
    email: user.email || user.profile?.email || '',
    avatar: user.profile?.avatar,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isMobile ? (
        <>
          <ProfileMobileHeader user={userData} />
          <main className="p-4">
            <Outlet />
          </main>
        </>
      ) : (
        <div className="flex">
          <ProfileSidebar user={userData} stats={stats} isLoading={statsLoading} />
          <main className="flex-1 p-8">
            <Outlet />
          </main>
        </div>
      )}
    </div>
  );
}
