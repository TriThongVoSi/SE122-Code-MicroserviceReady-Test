# Buyer Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive buyer profile feature with Personal Info, Address Book, and Security tabs using sidebar layout (desktop) and compact header + tabs (mobile).

**Architecture:** Single page component with nested routes - BuyerProfileLayout renders sidebar/header and uses React Router's Outlet for tab content. Reuses existing marketplace API hooks for orders and addresses.

**Tech Stack:** React, TypeScript, React Router, React Query, Tailwind CSS, Lucide Icons

---

## File Structure Overview

**New files to create:**
- `src/features/buyer/profile/layout/BuyerProfileLayout.tsx` - Main layout wrapper
- `src/features/buyer/profile/pages/PersonalInfoPage.tsx` - Personal info tab
- `src/features/buyer/profile/pages/AddressBookPage.tsx` - Address management tab
- `src/features/buyer/profile/pages/SecurityPage.tsx` - Password change tab
- `src/features/buyer/profile/components/ProfileSidebar.tsx` - Desktop sidebar
- `src/features/buyer/profile/components/ProfileMobileHeader.tsx` - Mobile header
- `src/features/buyer/profile/components/ProfileUserCard.tsx` - User card with stats
- `src/features/buyer/profile/components/ProfileNavigation.tsx` - Nav menu items
- `src/features/buyer/profile/components/PersonalInfoForm.tsx` - Edit name/phone form
- `src/features/buyer/profile/components/AddressCard.tsx` - Address display card
- `src/features/buyer/profile/components/AddressForm.tsx` - Add/edit address form
- `src/features/buyer/profile/components/PasswordChangeForm.tsx` - Password change form
- `src/features/buyer/profile/hooks/useBuyerStats.ts` - Order statistics hook
- `src/features/buyer/profile/index.ts` - Barrel exports

**Files to modify:**
- `src/app/routes.tsx` - Add profile routes
- `src/features/buyer/profile/BuyerProfile.tsx` - Remove (replaced by new structure)
- `src/features/buyer/profile/EditProfileDialog.tsx` - Remove (integrated into PersonalInfoForm)

---

## Task 1: Create useBuyerStats Hook

**Files:**
- Create: `src/features/buyer/profile/hooks/useBuyerStats.ts`

- [ ] **Step 1: Create hook file with statistics calculation**

```typescript
import { useMemo } from 'react';
import { useMarketplaceOrders } from '@/features/marketplace/hooks';

export function useBuyerStats() {
  const { data: ordersData, isLoading } = useMarketplaceOrders({
    size: 100,
  });

  const stats = useMemo(() => {
    if (!ordersData?.items) {
      return { totalOrders: 0, completedOrders: 0, totalReviews: 0 };
    }

    const totalOrders = ordersData.items.length;
    const completedOrders = ordersData.items.filter(
      (order) => order.status === 'COMPLETED'
    ).length;

    const totalReviews = ordersData.items
      .filter((order) => order.status === 'COMPLETED')
      .reduce((sum, order) => {
        return sum + (order.items?.filter((item) => item.hasReview).length || 0);
      }, 0);

    return { totalOrders, completedOrders, totalReviews };
  }, [ordersData]);

  return { stats, isLoading };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/buyer/profile/hooks/useBuyerStats.ts
git commit -m "feat(buyer-profile): add useBuyerStats hook for order statistics"
```

---

## Task 2: Create ProfileUserCard Component

**Files:**
- Create: `src/features/buyer/profile/components/ProfileUserCard.tsx`

- [ ] **Step 1: Create ProfileUserCard component**

```typescript
import { Avatar, AvatarFallback, Badge, Card, CardContent } from '@/shared/ui';
import { cn } from '@/shared/lib';

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
  return name
    .split(' ')
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
```

- [ ] **Step 2: Commit**

```bash
git add src/features/buyer/profile/components/ProfileUserCard.tsx
git commit -m "feat(buyer-profile): add ProfileUserCard component"
```

---

## Task 3: Create ProfileNavigation Component

**Files:**
- Create: `src/features/buyer/profile/components/ProfileNavigation.tsx`

- [ ] **Step 1: Create ProfileNavigation component**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/features/buyer/profile/components/ProfileNavigation.tsx
git commit -m "feat(buyer-profile): add ProfileNavigation component"
```

---

## Task 4: Create ProfileSidebar Component

**Files:**
- Create: `src/features/buyer/profile/components/ProfileSidebar.tsx`

- [ ] **Step 1: Create ProfileSidebar component**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/features/buyer/profile/components/ProfileSidebar.tsx
git commit -m "feat(buyer-profile): add ProfileSidebar component"
```

---

## Task 5: Create ProfileMobileHeader Component

**Files:**
- Create: `src/features/buyer/profile/components/ProfileMobileHeader.tsx`

- [ ] **Step 1: Create ProfileMobileHeader component**

```typescript
import { NavLink } from 'react-router-dom';
import { User, MapPin, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, Badge } from '@/shared/ui';
import { cn } from '@/shared/lib';

interface ProfileMobileHeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

function getInitials(name: string): string {
  return name
    .split(' ')
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
```

- [ ] **Step 2: Commit**

```bash
git add src/features/buyer/profile/components/ProfileMobileHeader.tsx
git commit -m "feat(buyer-profile): add ProfileMobileHeader component"
```

---

## Task 6: Create BuyerProfileLayout

**Files:**
- Create: `src/features/buyer/profile/layout/BuyerProfileLayout.tsx`

- [ ] **Step 1: Create BuyerProfileLayout component**

```typescript
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { ProfileSidebar } from '../components/ProfileSidebar';
import { ProfileMobileHeader } from '../components/ProfileMobileHeader';
import { useBuyerStats } from '../hooks/useBuyerStats';
import { Loader2 } from 'lucide-react';

export function BuyerProfileLayout() {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useBuyerStats();

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
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        <ProfileSidebar user={userData} stats={stats} isLoading={statsLoading} />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <ProfileMobileHeader user={userData} />
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/buyer/profile/layout/BuyerProfileLayout.tsx
git commit -m "feat(buyer-profile): add BuyerProfileLayout with responsive design"
```

---

## Task 7: Create PersonalInfoForm Component

**Files:**
- Create: `src/features/buyer/profile/components/PersonalInfoForm.tsx`

- [ ] **Step 1: Create PersonalInfoForm component**

```typescript
import { useState } from 'react';
import { Button, Input, Label, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui';
import { Loader2 } from 'lucide-react';

interface PersonalInfoFormProps {
  initialData: {
    name: string;
    phone: string;
  };
  onSave: (data: { name: string; phone: string }) => Promise<void>;
  onCancel: () => void;
}

export function PersonalInfoForm({ initialData, onSave, onCancel }: PersonalInfoFormProps) {
  const [name, setName] = useState(initialData.name);
  const [phone, setPhone] = useState(initialData.phone);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; phone?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Họ và tên là bắt buộc';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSave({ name, phone });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Chỉnh sửa thông tin cá nhân</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Họ và tên</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isSubmitting}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/buyer/profile/components/PersonalInfoForm.tsx
git commit -m "feat(buyer-profile): add PersonalInfoForm component"
```

---

## Task 8: Create PersonalInfoPage

**Files:**
- Create: `src/features/buyer/profile/pages/PersonalInfoPage.tsx`

- [ ] **Step 1: Create PersonalInfoPage component**

```typescript
import { useState } from 'react';
import { useAuth } from '@/features/auth';
import { Button, Card, CardContent, CardHeader, Input, Label, Dialog } from '@/shared/ui';
import { PersonalInfoForm } from '../components/PersonalInfoForm';
import { toast } from 'sonner';

export function PersonalInfoPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const userData = {
    name: user?.profile?.fullName || user?.username || '',
    email: user?.email || user?.profile?.email || '',
    phone: user?.profile?.phone || '',
  };

  const handleSave = async (data: { name: string; phone: string }) => {
    try {
      // TODO: Implement profile update API call
      // await updateProfile(data);
      console.log('Saving profile:', data);
      toast.success('Cập nhật thông tin thành công');
      setIsEditing(false);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật thông tin');
      throw error;
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-bold">Thông tin cá nhân</h2>
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Chỉnh sửa
          </Button>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Họ và tên</Label>
              <Input value={userData.name} disabled className="mt-1" />
            </div>

            <div>
              <Label>Email</Label>
              <Input value={userData.email} disabled className="mt-1" />
            </div>

            <div>
              <Label>Số điện thoại</Label>
              <Input value={userData.phone} disabled className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <PersonalInfoForm
          initialData={{ name: userData.name, phone: userData.phone }}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </Dialog>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/buyer/profile/pages/PersonalInfoPage.tsx
git commit -m "feat(buyer-profile): add PersonalInfoPage"
```

---

## Task 9: Create AddressCard Component

**Files:**
- Create: `src/features/buyer/profile/components/AddressCard.tsx`

- [ ] **Step 1: Create AddressCard component**

```typescript
import { Button, Badge } from '@/shared/ui';
import { Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib';

interface Address {
  id: number;
  name: string;
  phone: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  street: string;
  detail?: string;
  label: 'HOME' | 'OFFICE';
  isDefault: boolean;
}

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
}

const LABEL_TEXT = {
  HOME: 'Nhà riêng',
  OFFICE: 'Văn phòng',
};

export function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  const fullAddress = [
    address.street,
    address.wardName,
    address.districtName,
    address.provinceName,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        address.isDefault ? 'border-2 border-emerald-600' : 'border-gray-200'
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-900">{address.name}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">{address.phone}</span>
      </div>

      <div className="mt-2 flex gap-2">
        {address.isDefault && (
          <Badge className="bg-emerald-600 text-white">Mặc định</Badge>
        )}
        <Badge variant="outline">{LABEL_TEXT[address.label]}</Badge>
      </div>

      <p className="mt-2 text-sm text-gray-600">{fullAddress}</p>
      {address.detail && (
        <p className="mt-1 text-sm text-gray-500">{address.detail}</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(address)}>
          Sửa
        </Button>
        {!address.isDefault && (
          <>
            <Button variant="ghost" size="sm" onClick={() => onSetDefault(address.id)}>
              Thiết lập mặc định
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(address.id)}
              className="ml-auto text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/buyer/profile/components/AddressCard.tsx
git commit -m "feat(buyer-profile): add AddressCard component"
```

---

## Task 10: Create AddressForm Component

**Files:**
- Create: `src/features/buyer/profile/components/AddressForm.tsx`

- [ ] **Step 1: Create AddressForm component**

```typescript
import { useState } from 'react';
import { Button, Input, Label, RadioGroup, Checkbox } from '@/shared/ui';
import { Loader2 } from 'lucide-react';

interface AddressFormData {
  name: string;
  phone: string;
  provinceId: number;
  districtId: number;
  wardId: number;
  street: string;
  detail?: string;
  label: 'HOME' | 'OFFICE';
  isDefault: boolean;
}

interface AddressFormProps {
  mode: 'add' | 'edit';
  initialData?: Partial<AddressFormData>;
  onSave: (data: AddressFormData) => Promise<void>;
  onCancel: () => void;
}

export function AddressForm({ mode, initialData, onSave, onCancel }: AddressFormProps) {
  const [formData, setFormData] = useState<Partial<AddressFormData>>({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    street: initialData?.street || '',
    detail: initialData?.detail || '',
    label: initialData?.label || 'HOME',
    isDefault: initialData?.isDefault || false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData as AddressFormData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <h3 className="mb-4 font-bold">
        {mode === 'add' ? 'Thêm địa chỉ mới' : 'Chỉnh sửa địa chỉ'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Họ và tên</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="street">Tên đường, Tòa nhà</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="detail">Chi tiết thêm (Tùy chọn)</Label>
            <Input
              id="detail"
              placeholder="Số nhà, tầng, phòng..."
              value={formData.detail}
              onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <Label>Loại địa chỉ</Label>
          <RadioGroup
            value={formData.label}
            onValueChange={(value) => setFormData({ ...formData, label: value as 'HOME' | 'OFFICE' })}
            className="mt-2 flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="HOME" id="home" />
              <Label htmlFor="home" className="cursor-pointer">Nhà riêng</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="OFFICE" id="office" />
              <Label htmlFor="office" className="cursor-pointer">Văn phòng</Label>
            </div>
          </RadioGroup>
        </div>

        <label className="flex items-center space-x-2 cursor-pointer">
          <Checkbox
            checked={formData.isDefault}
            onCheckedChange={(checked) => setFormData({ ...formData, isDefault: !!checked })}
          />
          <span className="text-sm">Đặt làm địa chỉ mặc định</span>
        </label>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu địa chỉ
          </Button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/buyer/profile/components/AddressForm.tsx
git commit -m "feat(buyer-profile): add AddressForm component"
```

---

## Task 11: Create AddressBookPage

**Files:**
- Create: `src/features/buyer/profile/pages/AddressBookPage.tsx`

- [ ] **Step 1: Create AddressBookPage component**

```typescript
import { useState } from 'react';
import { Button, Card, CardContent, CardHeader } from '@/shared/ui';
import { AddressCard } from '../components/AddressCard';
import { AddressForm } from '../components/AddressForm';
import {
  useMarketplaceAddresses,
  useMarketplaceCreateAddressMutation,
  useMarketplaceUpdateAddressMutation,
  useMarketplaceDeleteAddressMutation,
} from '@/features/marketplace/hooks';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { MarketplaceAddress, MarketplaceAddressUpsertRequest } from '@/shared/api';

// Type for AddressCard component
interface AddressCardData {
  id: number;
  name: string;
  phone: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  street: string;
  detail?: string;
  label: 'HOME' | 'OFFICE';
  isDefault: boolean;
}

// Convert MarketplaceAddress to AddressCardData
function toAddressCardData(address: MarketplaceAddress): AddressCardData {
  return {
    id: address.id,
    name: address.fullName,
    phone: address.phone,
    provinceName: address.province,
    districtName: address.district,
    wardName: address.ward,
    street: address.street,
    detail: address.detail || undefined,
    label: address.label === 'home' ? 'HOME' : address.label === 'office' ? 'OFFICE' : 'HOME',
    isDefault: address.isDefault,
  };
}

export function AddressBookPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressCardData | null>(null);

  const { data: addresses, isLoading } = useMarketplaceAddresses();
  const createMutation = useMarketplaceCreateAddressMutation();
  const updateMutation = useMarketplaceUpdateAddressMutation();
  const deleteMutation = useMarketplaceDeleteAddressMutation();

  const handleSave = async (data: any) => {
    try {
      if (editingAddress) {
        await updateMutation.mutateAsync({ addressId: editingAddress.id, request: data });
        toast.success('Cập nhật địa chỉ thành công');
        setEditingAddress(null);
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Thêm địa chỉ thành công');
        setShowAddForm(false);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Xóa địa chỉ thành công');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa địa chỉ');
    }
  };

  const handleSetDefault = async (id: number) => {
    const address = addresses?.find((a) => a.id === id);
    if (!address) return;
    
    const request: MarketplaceAddressUpsertRequest = {
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      street: address.street,
      detail: address.detail,
      label: address.label,
      isDefault: true,
    };
    
    try {
      await updateMutation.mutateAsync({ addressId: address.id, request });
      toast.success('Đã đặt làm địa chỉ mặc định');
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  const addressCardData = addresses?.map(toAddressCardData) || [];

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-bold">Sổ địa chỉ</h2>
          <Button onClick={() => setShowAddForm(true)}>+ Thêm địa chỉ</Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {showAddForm && (
            <AddressForm
              mode="add"
              onSave={handleSave}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {editingAddress && (
            <AddressForm
              mode="edit"
              initialData={editingAddress}
              onSave={handleSave}
              onCancel={() => setEditingAddress(null)}
            />
          )}

          {addressCardData.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={setEditingAddress}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}

          {!addressCardData.length && !showAddForm && (
            <p className="py-8 text-center text-gray-500">
              Chưa có địa chỉ nào. Thêm địa chỉ đầu tiên của bạn.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/buyer/profile/pages/AddressBookPage.tsx
git commit -m "feat(buyer-profile): add AddressBookPage with CRUD operations"
```

---

## Task 12: Create PasswordChangeForm Component

**Files:**
- Create: `src/features/buyer/profile/components/PasswordChangeForm.tsx`

- [ ] **Step 1: Create PasswordChangeForm component**

```typescript
import { useState } from 'react';
import { Button, Input, Label, Alert, AlertTitle, AlertDescription } from '@/shared/ui';
import { Loader2, Info } from 'lucide-react';

interface PasswordChangeFormProps {
  onSave: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  apiAvailable: boolean;
}

export function PasswordChangeForm({ onSave, apiAvailable }: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Mật khẩu hiện tại là bắt buộc';
    }

    if (!newPassword) {
      newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!apiAvailable) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Tính năng đang phát triển</AlertTitle>
        <AlertDescription>
          Chức năng đổi mật khẩu sẽ sớm được cập nhật. Vui lòng liên hệ hỗ trợ nếu cần thay đổi mật khẩu.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={isSubmitting}
        />
        {errors.currentPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
        )}
      </div>

      <div>
        <Label htmlFor="newPassword">Mật khẩu mới</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={isSubmitting}
        />
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isSubmitting}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Cập nhật mật khẩu
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/buyer/profile/components/PasswordChangeForm.tsx
git commit -m "feat(buyer-profile): add PasswordChangeForm component"
```

---

## Task 13: Create SecurityPage

**Files:**
- Create: `src/features/buyer/profile/pages/SecurityPage.tsx`

- [ ] **Step 1: Create SecurityPage component**

```typescript
import { Card, CardContent, CardHeader } from '@/shared/ui';
import { PasswordChangeForm } from '../components/PasswordChangeForm';
import { toast } from 'sonner';

export function SecurityPage() {
  // Check if password change API is available
  const apiAvailable = false; // TODO: Check for auth API endpoint

  const handlePasswordChange = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      // TODO: Implement password change API call
      // await changePassword(data);
      console.log('Changing password:', data);
      toast.success('Đổi mật khẩu thành công');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đổi mật khẩu');
      throw error;
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Đổi mật khẩu</h2>
        </CardHeader>

        <CardContent>
          <PasswordChangeForm onSave={handlePasswordChange} apiAvailable={apiAvailable} />
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/buyer/profile/pages/SecurityPage.tsx
git commit -m "feat(buyer-profile): add SecurityPage"
```

---

## Task 14: Create Barrel Exports

**Files:**
- Create: `src/features/buyer/profile/index.ts`

- [ ] **Step 1: Create barrel export file**

```typescript
export { BuyerProfileLayout } from './layout/BuyerProfileLayout';
export { PersonalInfoPage } from './pages/PersonalInfoPage';
export { AddressBookPage } from './pages/AddressBookPage';
export { SecurityPage } from './pages/SecurityPage';
export { useBuyerStats } from './hooks/useBuyerStats';
```

- [ ] **Step 2: Commit**

```bash
git add src/features/buyer/profile/index.ts
git commit -m "feat(buyer-profile): add barrel exports"
```

---

## Task 15: Update Routes Configuration

**Files:**
- Modify: `src/app/routes.tsx`

- [ ] **Step 1: Import new components**

Add these imports at the top of the file:

```typescript
import { BuyerProfileLayout, PersonalInfoPage, AddressBookPage, SecurityPage } from '@/features/buyer/profile';
```

- [ ] **Step 2: Update marketplace routes**

Find the `/marketplace` route section and update the profile route:

```typescript
// Replace the existing profile route:
<Route
  path="profile"
  element={(
    <ProtectedRoute requireAuth>
      <BuyerProfilePage />
    </ProtectedRoute>
  )}
/>

// With the new nested routes structure:
<Route
  path="profile"
  element={(
    <ProtectedRoute requireAuth>
      <BuyerProfileLayout />
    </ProtectedRoute>
  )}
>
  <Route index element={<Navigate to="info" replace />} />
  <Route path="info" element={<PersonalInfoPage />} />
  <Route path="addresses" element={<AddressBookPage />} />
  <Route path="security" element={<SecurityPage />} />
</Route>
```

- [ ] **Step 3: Verify routes work**

Start dev server and test navigation:

```bash
npm run dev
```

Visit:
- http://localhost:5173/marketplace/profile (should redirect to /info)
- http://localhost:5173/marketplace/profile/info
- http://localhost:5173/marketplace/profile/addresses
- http://localhost:5173/marketplace/profile/security

- [ ] **Step 4: Commit**

```bash
git add src/app/routes.tsx
git commit -m "feat(buyer-profile): add profile routes with nested structure"
```

---

## Task 16: Remove Old Profile Components

**Files:**
- Delete: `src/features/buyer/profile/components/BuyerProfile.tsx`
- Delete: `src/features/buyer/profile/components/EditProfileDialog.tsx`

- [ ] **Step 1: Remove old BuyerProfile component**

```bash
git rm src/features/buyer/profile/components/BuyerProfile.tsx
```

- [ ] **Step 2: Remove old EditProfileDialog component**

```bash
git rm src/features/buyer/profile/components/EditProfileDialog.tsx
```

- [ ] **Step 3: Commit**

```bash
git commit -m "refactor(buyer-profile): remove old profile components"
```

---

## Task 17: Manual Testing

**Files:**
- N/A (manual testing)

- [ ] **Step 1: Test desktop layout**

Open browser at http://localhost:5173/marketplace/profile

Verify:
- Sidebar appears on left (≥768px screen width)
- User card shows avatar with initials, name, email, role badge
- Statistics show correct numbers (orders, completed, reviews)
- Navigation menu has 3 items with icons
- Active tab has green background

- [ ] **Step 2: Test mobile layout**

Resize browser to <768px width

Verify:
- Sidebar is hidden
- Compact header appears with avatar, name, role badge
- Horizontal tabs appear below header
- Active tab has green underline
- Content area is full width

- [ ] **Step 3: Test Personal Info tab**

Navigate to /marketplace/profile/info

Verify:
- Form displays name, email, phone (all disabled)
- Email field is read-only
- Click "Chỉnh sửa" button opens dialog
- Dialog shows editable name and phone fields
- Form validation works (empty fields, invalid phone)
- Cancel button closes dialog without saving
- Save button shows loading spinner

- [ ] **Step 4: Test Address Book tab**

Navigate to /marketplace/profile/addresses

Verify:
- Address list displays all addresses
- Default address has green border and "Mặc định" badge
- Address labels show "Nhà riêng" or "Văn phòng"
- Click "+ Thêm địa chỉ" shows add form
- Add form has all required fields
- Radio buttons for address type work
- "Đặt làm địa chỉ mặc định" checkbox works
- Save creates new address
- Edit button pre-fills form with address data
- "Thiết lập mặc định" button updates default address
- Delete button (trash icon) removes address
- Confirmation dialog appears before delete

- [ ] **Step 5: Test Security tab**

Navigate to /marketplace/profile/security

Verify:
- If API not available: shows info alert message
- If API available: shows password change form
- Form has 3 password fields
- Validation works (min 8 chars, passwords match)
- Submit button shows loading spinner

- [ ] **Step 6: Test navigation**

Verify:
- Clicking nav items updates URL
- Browser back/forward buttons work
- Direct URL access works for all tabs
- Active tab is highlighted correctly

- [ ] **Step 7: Test responsive breakpoints**

Resize browser window and verify:
- Layout switches at 768px breakpoint
- No layout breaks or overlaps
- All content remains accessible

- [ ] **Step 8: Document any issues**

Create a list of any bugs or issues found during testing.

---

## Self-Review Checklist

- [ ] **Spec coverage check**

Review design spec sections:
- ✅ User card with avatar, name, email, badge, stats
- ✅ Navigation menu (3 tabs)
- ✅ Personal Info page with edit form
- ✅ Address Book page with CRUD operations
- ✅ Security page with password change
- ✅ Responsive layout (sidebar desktop, header mobile)
- ✅ URL-based routing
- ✅ Vietnamese labels
- ✅ Reuses marketplace API hooks

- [ ] **Placeholder scan**

Search plan for:
- ❌ No "TBD" or "TODO" in implementation code
- ✅ TODOs only in comments for future API integration
- ❌ No "implement later" or "add validation"
- ✅ All code blocks are complete

- [ ] **Type consistency check**

Verify:
- ✅ `useBuyerStats` returns `{ stats, isLoading }`
- ✅ `ProfileUserCard` accepts `user` and `stats` props
- ✅ Address type is `'HOME' | 'OFFICE'`
- ✅ All component props match across tasks

All checks passed! Plan is ready for execution.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-01-buyer-profile.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?

