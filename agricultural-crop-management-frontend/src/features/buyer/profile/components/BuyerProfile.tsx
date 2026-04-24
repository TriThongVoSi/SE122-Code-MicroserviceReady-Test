import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Separator } from '@/shared/ui/separator';
import { useProfileMe } from '@/entities/user';
import { useAuth } from '@/features/auth';
import { AddressDisplay } from '@/shared/ui';
import {
  Calendar,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  User
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { BuyerProfileData } from '../types';
import { EditProfileDialog } from './EditProfileDialog';

/**
 * BuyerProfile Component
 *
 * Optimized to render instantly from session data while
 * fetching fresh data in the background.
 *
 * Features:
 * - Instant render from session (no blocking spinner if session exists)
 * - Background refresh with subtle indicator
 * - Prefetched data from login for fastest load
 */
export function BuyerProfile() {
  const { user } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Use optimized hook with placeholderData from session
  const { data: profile, isLoading: profileLoading, isFetching } = useProfileMe();

  // Check if we have session data to render immediately (no blocking load needed)
  const hasSessionProfile = !!user?.profile;

  const profileData: BuyerProfileData = useMemo(() => {
    const rawUsername = profile?.username || user?.username || 'buyer';
    // If username is an email, extract the part before @ for display
    const username = rawUsername.includes('@') ? rawUsername.split('@')[0] : rawUsername;
    // Prioritize API profile data, then fall back to session user.profile data
    // Use trim() to handle empty/whitespace-only strings properly
    const apiFullName = profile?.fullName?.trim();
    const sessionFullName = user?.profile?.fullName?.trim();
    const fullName = apiFullName || sessionFullName || username;

    // Build address from province and ward names
    const addressParts = [profile?.wardName, profile?.provinceName].filter(Boolean);
    const address = addressParts.length > 0 ? addressParts.join(', ') : 'Chưa cập nhật';

    // Format joined date - use API profile or session user.profile data
    const rawJoinedDate = profile?.joinedDate || user?.profile?.joinedDate;
    const joinedDate = rawJoinedDate
      ? new Date(rawJoinedDate).toLocaleDateString('vi-VN', {
          day: '2-digit', month: 'short', year: 'numeric'
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Only show full-page loading when NO session data and API is loading
  // If we have session data, render immediately and fetch in background
  if (profileLoading && !hasSessionProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Đang tải...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Hồ sơ của tôi</h1>
              {/* Subtle refresh indicator - only shows when fetching fresh data */}
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

          {/* Profile Header Card */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-start gap-6">
                  <Avatar className="w-20 h-20 border-4 border-emerald-100">
                    <AvatarFallback className="bg-emerald-600 text-white text-xl">
                      {getInitials(profileData.displayName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {profileData.displayName}
                      </h2>
                      <p className="text-sm text-gray-600">@{profileData.username}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        <ShoppingBag className="w-3 h-3 mr-1" />
                        Người mua
                      </Badge>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        <div className="w-2 h-2 rounded-full bg-emerald-600 mr-1.5" />
                        Đang hoạt động
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-200" />

                {/* Metadata Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
                      <User className="w-4 h-4" />
                      ID người dùng
                    </div>
                    <p className="text-sm font-mono text-gray-900">#{profileData.id}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
                      <Calendar className="w-4 h-4" />
                      Ngày tham gia
                    </div>
                    <p className="text-sm text-gray-900">{profileData.joinedDate}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
                      <Clock className="w-4 h-4" />
                      Đăng nhập gần nhất
                    </div>
                    <p className="text-sm text-gray-900">{profileData.lastLogin}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <Mail className="w-5 h-5" />
                Thông tin liên hệ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                  <p className="text-sm text-gray-900">{profileData.email}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
                    <Phone className="w-4 h-4" />
                    Số điện thoại
                  </div>
                  <p className="text-sm font-mono text-gray-900">{profileData.phone}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
                  <MapPin className="w-4 h-4" />
                  Địa chỉ
                </div>
                <AddressDisplay
                  wardCode={profileData.wardId ?? null}
                  fallback={profileData.address}
                  className="text-sm text-gray-900"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Profile Dialog */}
        <EditProfileDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          profileData={profileData}
        />
      </div>
    </div>
  );
}
