import { Button } from '@/shared/ui/button';
import { useProfileMe } from '@/entities/user';
import { useAuth } from '@/features/auth';
import {
  ContactInfoCard,
  ProfileHeroCard,
} from '@/features/shared/profile';
import { Loader2, ShoppingBag, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { BuyerProfileData } from '../types';
import { EditProfileDialog } from './EditProfileDialog';

/**
 * BuyerProfile Component
 *
 * Optimized to render instantly from session data while
 * fetching fresh data in the background.
 */
export function BuyerProfile() {
  const { user } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: profile, isLoading: profileLoading, isFetching } = useProfileMe();
  const hasSessionProfile = !!user?.profile;

  const profileData: BuyerProfileData = useMemo(() => {
    const rawUsername = profile?.username || user?.username || 'buyer';
    const username = rawUsername.includes('@') ? rawUsername.split('@')[0] : rawUsername;
    const apiFullName = profile?.fullName?.trim();
    const sessionFullName = user?.profile?.fullName?.trim();
    const fullName = apiFullName || sessionFullName || username;

    const addressParts = [profile?.wardName, profile?.provinceName].filter(Boolean);
    const address = addressParts.length > 0 ? addressParts.join(', ') : 'Chưa cập nhật';

    const rawJoinedDate = profile?.joinedDate || user?.profile?.joinedDate;
    const joinedDate = rawJoinedDate
      ? new Date(rawJoinedDate).toLocaleDateString('vi-VN', {
          day: '2-digit', month: 'short', year: 'numeric',
        })
      : 'Chưa có thông tin';

    return {
      id: Number(profile?.id ?? user?.profile?.id ?? user?.id ?? 0),
      username,
      displayName: fullName,
      email: profile?.email || user?.profile?.email || user?.email || 'Chưa cập nhật',
      phone: profile?.phone || user?.profile?.phone || 'Chưa cập nhật',
      address,
      role: 'buyer',
      status: (profile?.status || user?.profile?.status) === 'ACTIVE' ? 'active' : 'inactive',
      joinedDate,
      lastLogin: 'Chưa có thông tin',
      provinceId: profile?.provinceId ?? user?.profile?.provinceId ?? undefined,
      wardId: profile?.wardId ?? user?.profile?.wardId ?? undefined,
    };
  }, [profile, user]);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  if (profileLoading && !hasSessionProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Đang tải...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Hồ sơ của tôi</h1>
              {isFetching && !profileLoading && (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              )}
            </div>
            <Button
              onClick={() => setEditDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <User className="w-4 h-4 mr-2" />
              Chỉnh sửa hồ sơ
            </Button>
          </div>

          <ProfileHeroCard
            displayName={profileData.displayName}
            username={profileData.username}
            initials={getInitials(profileData.displayName)}
            roleIcon={ShoppingBag}
            roleLabel="Người mua"
            isActive={profileData.status === 'active'}
            userId={profileData.id}
            joinedDate={profileData.joinedDate}
            lastLogin={profileData.lastLogin}
            labels={{
              userId: 'ID người dùng',
              joinedDate: 'Ngày tham gia',
              lastLogin: 'Đăng nhập gần nhất',
              status: 'Đang hoạt động',
            }}
          />

          <ContactInfoCard
            email={profileData.email}
            phone={profileData.phone}
            address={profileData.address}
            wardCode={profileData.wardId}
            labels={{
              title: 'Thông tin liên hệ',
              email: 'Email',
              phone: 'Số điện thoại',
              address: 'Địa chỉ',
            }}
          />
        </div>

        <EditProfileDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          profileData={profileData}
        />
      </div>
    </div>
  );
}
