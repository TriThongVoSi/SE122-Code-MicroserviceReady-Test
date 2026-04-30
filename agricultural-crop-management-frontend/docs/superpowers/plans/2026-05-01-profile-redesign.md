# Profile UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the buyer, farmer, and admin profile pages with a hero-banner card, overlapping avatar, tinted stat tiles, and a refined contact card — preserving every existing data point, button, hook, and translation key.

**Architecture:** Extract two role-agnostic presentational components (`ProfileHeroCard`, `ContactInfoCard`) plus a small shared `SectionCardHeader` into `src/features/shared/profile/components/`. The three role-specific Profile components (`BuyerProfile`, `FarmerProfile`, `AdminProfile`) keep their data-shaping logic and call the new shared components, passing role-specific badge/label props. Farmer/admin extra cards (Farm Overview, Recent Activity, Notifications) are visually polished in place using the same `SectionCardHeader` pattern; their internal content is unchanged.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, lucide-react icons, shadcn/ui primitives via `@/shared/ui` and `@/components/ui`. Build/dev: Vite. Linter: ESLint. Type-checker: `tsc` via Vite. Test runner: Vitest (no new tests required — UI-only refactor).

**Verification approach:** This is a pure visual refactor. After each task, run `npm run lint` and `npx tsc --noEmit` to catch breakage, plus a dev-server visual check after each role page is touched. There is no behavior change to test with unit tests; existing data flow remains untouched.

---

## File Structure

**New files:**
- `src/features/shared/profile/components/SectionCardHeader.tsx` — reusable card header (icon chip + title + optional subtitle).
- `src/features/shared/profile/components/ProfileHeroCard.tsx` — banner + identity row + stat tile strip.
- `src/features/shared/profile/components/ContactInfoCard.tsx` — email/phone/address card body wrapped in `Card` with `SectionCardHeader`.
- `src/features/shared/profile/components/index.ts` — barrel export.
- `src/features/shared/profile/index.ts` — top-level barrel.

**Modified files:**
- `src/features/buyer/profile/components/BuyerProfile.tsx`
- `src/features/farmer/profile/components/FarmerProfile.tsx`
- `src/features/admin/profile/components/AdminProfile.tsx`

**Untouched (intentionally):**
- `EditProfileDialog.tsx` in each role folder.
- `useProfileMe`, `useFarms`, `usePlots`, `useSeasons` and all other hooks.
- All translation files — no keys removed or renamed.
- `AddressDisplay` and other shared UI primitives.

---

## Task 1: Create `SectionCardHeader` shared component

**Files:**
- Create: `src/features/shared/profile/components/SectionCardHeader.tsx`

- [ ] **Step 1: Write the component**

Create `src/features/shared/profile/components/SectionCardHeader.tsx`:

```tsx
import type { LucideIcon } from 'lucide-react';
import { CardHeader, CardTitle } from '@/shared/ui/card';
import { cn } from '@/shared/ui/utils';

export type SectionCardHeaderProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  iconChipClassName?: string;
  className?: string;
};

export function SectionCardHeader({
  icon: Icon,
  title,
  subtitle,
  iconChipClassName,
  className,
}: SectionCardHeaderProps) {
  return (
    <CardHeader className={cn('pb-4', className)}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
            iconChipClassName
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base font-semibold text-slate-900">
            {title}
          </CardTitle>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
    </CardHeader>
  );
}
```

- [ ] **Step 2: Verify the import path for `cn`**

Run: `grep -n "from './utils'" src/shared/ui/index.ts || grep -rn "export.*cn" src/shared/ui/ | head -5`

If `@/shared/ui/utils` does not exist, replace the import with `@/components/ui/utils` (the legacy parallel path) — both folders carry shadcn helpers in this repo. Update the import to whichever path resolves.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS (no errors related to the new file).

- [ ] **Step 4: Commit**

```bash
git add src/features/shared/profile/components/SectionCardHeader.tsx
git commit -m "Add SectionCardHeader shared profile component"
```

---

## Task 2: Create `ProfileHeroCard` shared component

**Files:**
- Create: `src/features/shared/profile/components/ProfileHeroCard.tsx`

- [ ] **Step 1: Write the component**

Create `src/features/shared/profile/components/ProfileHeroCard.tsx`:

```tsx
import type { LucideIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { Calendar, Clock, User } from 'lucide-react';

export type ProfileHeroLabels = {
  userId: string;
  joinedDate: string;
  lastLogin: string;
  status: string;
};

export type ProfileHeroCardProps = {
  displayName: string;
  username: string;
  initials: string;
  roleIcon: LucideIcon;
  roleLabel: string;
  isActive: boolean;
  userId: number | string;
  joinedDate: string;
  lastLogin: string;
  labels: ProfileHeroLabels;
};

export function ProfileHeroCard({
  displayName,
  username,
  initials,
  roleIcon: RoleIcon,
  roleLabel,
  isActive,
  userId,
  joinedDate,
  lastLogin,
  labels,
}: ProfileHeroCardProps) {
  return (
    <Card className="overflow-hidden border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(16,185,129,0.10)]">
      {/* Zone A: Banner */}
      <div className="relative h-36 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)',
            backgroundSize: '18px 18px',
          }}
          aria-hidden
        />
        <div
          className="absolute -right-8 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
      </div>

      <CardContent className="px-6 pb-6 pt-0 sm:px-8 sm:pb-8">
        {/* Zone B: Identity row, overlapping the banner */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-6">
          <Avatar className="-mt-12 h-24 w-24 shrink-0 ring-4 ring-white shadow-lg sm:h-28 sm:w-28">
            <AvatarFallback className="bg-emerald-600 text-2xl font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col gap-2 pt-1 sm:pb-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {displayName}
              </h2>
              <p className="text-sm text-slate-500">@{username}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="border-slate-200 bg-slate-100 text-slate-700"
              >
                <RoleIcon className="mr-1 h-3 w-3" />
                {roleLabel}
              </Badge>
              <Badge
                className={
                  isActive
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-100 text-slate-600'
                }
              >
                <span
                  className={
                    'mr-1.5 inline-block h-2 w-2 rounded-full ' +
                    (isActive ? 'bg-emerald-500' : 'bg-slate-400')
                  }
                />
                {labels.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Zone C: Stat tile strip */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatTile
            tone="slate"
            icon={User}
            label={labels.userId}
            value={`#${userId}`}
            mono
          />
          <StatTile
            tone="emerald"
            icon={Calendar}
            label={labels.joinedDate}
            value={joinedDate}
          />
          <StatTile
            tone="sky"
            icon={Clock}
            label={labels.lastLogin}
            value={lastLogin}
          />
        </div>
      </CardContent>
    </Card>
  );
}

type Tone = 'slate' | 'emerald' | 'sky';

const TONE_STYLES: Record<
  Tone,
  { tile: string; chip: string; icon: string }
> = {
  slate: {
    tile: 'bg-slate-50 border-slate-200',
    chip: 'bg-white text-slate-600 ring-1 ring-slate-200',
    icon: 'text-slate-600',
  },
  emerald: {
    tile: 'bg-emerald-50/70 border-emerald-100',
    chip: 'bg-white text-emerald-600 ring-1 ring-emerald-100',
    icon: 'text-emerald-600',
  },
  sky: {
    tile: 'bg-sky-50/70 border-sky-100',
    chip: 'bg-white text-sky-600 ring-1 ring-sky-100',
    icon: 'text-sky-600',
  },
};

type StatTileProps = {
  tone: Tone;
  icon: LucideIcon;
  label: string;
  value: string;
  mono?: boolean;
};

function StatTile({ tone, icon: Icon, label, value, mono }: StatTileProps) {
  const styles = TONE_STYLES[tone];
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-4 ${styles.tile}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.chip}`}
      >
        <Icon className={`h-5 w-5 ${styles.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p
          className={`mt-0.5 truncate text-base font-semibold text-slate-900 ${
            mono ? 'font-mono' : ''
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Lint the new file**

Run: `npx eslint src/features/shared/profile/components/ProfileHeroCard.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/shared/profile/components/ProfileHeroCard.tsx
git commit -m "Add ProfileHeroCard shared component"
```

---

## Task 3: Create `ContactInfoCard` shared component

**Files:**
- Create: `src/features/shared/profile/components/ContactInfoCard.tsx`

- [ ] **Step 1: Write the component**

Create `src/features/shared/profile/components/ContactInfoCard.tsx`:

```tsx
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { AddressDisplay } from '@/shared/ui';
import { Mail, MapPin, Phone } from 'lucide-react';
import { SectionCardHeader } from './SectionCardHeader';

export type ContactInfoLabels = {
  title: string;
  subtitle?: string;
  email: string;
  phone: string;
  address: string;
};

export type ContactInfoCardProps = {
  email: string;
  phone: string;
  address: string;
  wardCode?: number | null;
  labels: ContactInfoLabels;
};

export function ContactInfoCard({
  email,
  phone,
  address,
  wardCode,
  labels,
}: ContactInfoCardProps) {
  return (
    <Card className="border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)]">
      <SectionCardHeader
        icon={Mail}
        title={labels.title}
        subtitle={labels.subtitle}
      />
      <CardContent className="space-y-6 px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="grid gap-6 md:grid-cols-2">
          <ContactField icon={Mail} label={labels.email} value={email} />
          <ContactField
            icon={Phone}
            label={labels.phone}
            value={phone}
            mono
          />
        </div>
        <div>
          <FieldLabel icon={MapPin} text={labels.address} />
          <AddressDisplay
            wardCode={wardCode ?? null}
            fallback={address}
            className="mt-1.5 text-base text-slate-900"
          />
        </div>
      </CardContent>
    </Card>
  );
}

type ContactFieldProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  mono?: boolean;
};

function ContactField({ icon, label, value, mono }: ContactFieldProps) {
  return (
    <div>
      <FieldLabel icon={icon} text={label} />
      <p
        className={`mt-1.5 break-words text-base text-slate-900 ${
          mono ? 'font-mono' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function FieldLabel({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {text}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/shared/profile/components/ContactInfoCard.tsx
git commit -m "Add ContactInfoCard shared component"
```

---

## Task 4: Create barrel exports

**Files:**
- Create: `src/features/shared/profile/components/index.ts`
- Create: `src/features/shared/profile/index.ts`

- [ ] **Step 1: Write the components barrel**

Create `src/features/shared/profile/components/index.ts`:

```ts
export { SectionCardHeader } from './SectionCardHeader';
export type { SectionCardHeaderProps } from './SectionCardHeader';
export { ProfileHeroCard } from './ProfileHeroCard';
export type {
  ProfileHeroCardProps,
  ProfileHeroLabels,
} from './ProfileHeroCard';
export { ContactInfoCard } from './ContactInfoCard';
export type {
  ContactInfoCardProps,
  ContactInfoLabels,
} from './ContactInfoCard';
```

- [ ] **Step 2: Write the top-level barrel**

Create `src/features/shared/profile/index.ts`:

```ts
export * from './components';
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/shared/profile/components/index.ts src/features/shared/profile/index.ts
git commit -m "Add barrel exports for shared profile components"
```

---

## Task 5: Refactor `BuyerProfile` to use the new shared components

**Files:**
- Modify: `src/features/buyer/profile/components/BuyerProfile.tsx`

- [ ] **Step 1: Replace the component body**

Open `src/features/buyer/profile/components/BuyerProfile.tsx`. Replace the entire file with:

```tsx
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Visual check**

Run: `npm run dev` (kill afterward) and open the buyer profile page in a browser. Confirm:
- Hero card shows the gradient banner, the avatar overlapping its bottom edge, name + @username, role badge ("Người mua" with shopping bag icon) and status badge ("Đang hoạt động").
- The 3 stat tiles (ID người dùng, Ngày tham gia, Đăng nhập gần nhất) appear below the identity row with tinted backgrounds.
- Contact card shows the new icon-chip header, then a 2-column row (Email + Phone) and Địa chỉ on its own row below.
- Edit profile button still opens the dialog.
- All values from the original screenshot (`#3`, `01 thg 12, 2025`, `buyer@acm.local`, `0903234000`, `Mỹ An, Đồng Tháp`) are present.

- [ ] **Step 4: Commit**

```bash
git add src/features/buyer/profile/components/BuyerProfile.tsx
git commit -m "Redesign buyer profile with hero card and refined contact card"
```

---

## Task 6: Refactor `FarmerProfile` to use the new shared components and polish extra cards

**Files:**
- Modify: `src/features/farmer/profile/components/FarmerProfile.tsx`

- [ ] **Step 1: Replace the file**

Replace `src/features/farmer/profile/components/FarmerProfile.tsx` with:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useFarms } from '@/entities/farm';
import { usePlots } from '@/entities/plot';
import { useSeasons } from '@/entities/season';
import { useProfileMe } from '@/entities/user';
import { useAuth } from '@/features/auth';
import {
  ContactInfoCard,
  ProfileHeroCard,
  SectionCardHeader,
} from '@/features/shared/profile';
import { useI18n } from '@/hooks/useI18n';
import {
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Grid3x3,
  Loader2,
  Package,
  Sprout,
  TrendingUp,
  User,
  Bell,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
  FarmerProfileData,
  FarmOverviewStats,
  NotificationPreferences,
  RecentActivity,
} from '../types';
import { EditProfileDialog } from './EditProfileDialog';

export function FarmerProfile() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    taskReminders: true,
    incidentAlerts: true,
  });

  const { data: profile, isLoading: profileLoading, isFetching } = useProfileMe();
  const { data: farmsData } = useFarms();
  const { data: plotsData } = usePlots();
  const { data: seasonsData } = useSeasons();

  const farms = farmsData?.content ?? [];
  const plots = plotsData ?? [];
  const seasons = seasonsData?.items ?? [];

  const hasSessionProfile = !!user?.profile;

  const profileData: FarmerProfileData = useMemo(() => {
    const rawUsername = profile?.username || user?.username || 'farmer';
    const username = rawUsername.includes('@') ? rawUsername.split('@')[0] : rawUsername;
    const apiFullName = profile?.fullName?.trim();
    const sessionFullName = user?.profile?.fullName?.trim();
    const fullName = apiFullName || sessionFullName || username;

    const addressParts = [profile?.wardName, profile?.provinceName].filter(Boolean);
    const address = addressParts.length > 0 ? addressParts.join(', ') : 'Not available';

    const rawJoinedDate = profile?.joinedDate || user?.profile?.joinedDate;
    const joinedDate = rawJoinedDate
      ? new Date(rawJoinedDate).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
        })
      : 'Not available';

    return {
      id: Number(profile?.id ?? user?.profile?.id ?? user?.id ?? 0),
      username,
      displayName: fullName,
      email: profile?.email || user?.profile?.email || user?.email || 'Not available',
      phone: profile?.phone || user?.profile?.phone || 'Not available',
      address,
      bio: undefined,
      role: 'farmer',
      status: (profile?.status || user?.profile?.status) === 'ACTIVE' ? 'active' : 'inactive',
      joinedDate,
      lastLogin: 'Not available',
      provinceId: profile?.provinceId ?? user?.profile?.provinceId ?? undefined,
      wardId: profile?.wardId ?? user?.profile?.wardId ?? undefined,
    };
  }, [profile, user]);

  const farmStats: FarmOverviewStats = useMemo(() => {
    const totalFarms = farms.length;
    const totalArea = farms.reduce((sum, farm) => {
      const areaValue = typeof farm.area === 'string' ? parseFloat(farm.area) : farm.area ?? 0;
      return sum + (Number.isFinite(areaValue) ? areaValue : 0);
    }, 0);
    const totalPlots = plots.length;
    const activeSeasons = seasons.filter((season) => season.status === 'ACTIVE').length;
    return { totalFarms, totalArea, totalPlots, activeSeasons };
  }, [farms, plots, seasons]);

  const recentActivities: RecentActivity[] = [];

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'task':
        return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case 'field_log':
        return <BookOpen className="w-4 h-4 text-primary" />;
      case 'season':
        return <CalendarCheck className="w-4 h-4 text-primary" />;
      case 'plot':
        return <Grid3x3 className="w-4 h-4 text-primary" />;
      case 'harvest':
        return <Package className="w-4 h-4 text-primary" />;
      default:
        return <FileText className="w-4 h-4 text-primary" />;
    }
  };

  if (profileLoading && !hasSessionProfile) {
    return (
      <div className="min-h-screen acm-main-content pb-20 flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        {t('profile.loading')}
      </div>
    );
  }

  return (
    <div className="min-h-screen acm-main-content pb-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="space-y-6 p-6 max-w-[1280px] mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">{t('profile.title')}</h1>
            {isFetching && !profileLoading && (
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
            )}
          </div>
          <Button
            onClick={() => setEditDialogOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <User className="w-4 h-4 mr-2" />
            {t('profile.editProfile')}
          </Button>
        </div>

        <ProfileHeroCard
          displayName={profileData.displayName}
          username={profileData.username}
          initials={getInitials(profileData.displayName)}
          roleIcon={Sprout}
          roleLabel={t('profile.farmer')}
          isActive={profileData.status === 'active'}
          userId={profileData.id}
          joinedDate={profileData.joinedDate}
          lastLogin={profileData.lastLogin}
          labels={{
            userId: t('profile.userId'),
            joinedDate: t('profile.joinedDate'),
            lastLogin: t('profile.lastLogin'),
            status: t('profile.active'),
          }}
        />

        <ContactInfoCard
          email={profileData.email}
          phone={profileData.phone}
          address={profileData.address}
          wardCode={profileData.wardId}
          labels={{
            title: t('profile.contactInfo.title'),
            email: t('profile.contactInfo.email'),
            phone: t('profile.contactInfo.phone'),
            address: t('profile.contactInfo.address'),
          }}
        />

        {/* Farm Overview Card */}
        <Card className="border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)]">
          <SectionCardHeader icon={Sprout} title={t('profile.farmOverview.title')} />
          <CardContent className="space-y-6 px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center gap-4">
                <div className="bg-secondary/10 rounded-2xl p-3">
                  <Sprout className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-mono text-foreground">{farmStats.totalFarms}</p>
                  <p className="text-sm text-muted-foreground">{t('profile.farmOverview.totalFarms')}</p>
                </div>
              </div>

              <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center gap-4">
                <div className="bg-primary/10 rounded-2xl p-3">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-mono text-foreground">{farmStats.totalArea} ha</p>
                  <p className="text-sm text-muted-foreground">{t('profile.farmOverview.totalArea')}</p>
                </div>
              </div>

              <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center gap-4">
                <div className="bg-accent/10 rounded-2xl p-3">
                  <Grid3x3 className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-mono text-foreground">{farmStats.totalPlots}</p>
                  <p className="text-sm text-muted-foreground">{t('profile.farmOverview.plots')}</p>
                </div>
              </div>

              <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="bg-primary/10 rounded-2xl p-3">
                  <CalendarCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-mono text-primary">{farmStats.activeSeasons}</p>
                  <p className="text-sm text-primary opacity-80">{t('profile.farmOverview.activeSeasons')}</p>
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            <Button
              variant="ghost"
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              {t('profile.farmOverview.viewDetails')}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card className="border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)]">
          <SectionCardHeader icon={Clock} title={t('profile.recentActivity.title')} />
          <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('profile.recentActivity.empty')}
              </p>
            ) : (
              <div className="space-y-0">
                {recentActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-4 py-4 ${
                      index !== recentActivities.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <div className="bg-primary/10 rounded-2xl p-2 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                      <p className="text-base text-foreground">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card className="border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)]">
          <SectionCardHeader icon={Bell} title={t('profile.notifications.title')} />
          <CardContent className="space-y-4 px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="bg-muted border border-border rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="task-reminders" className="text-sm font-medium text-foreground">
                  {t('profile.notifications.taskReminders.label')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('profile.notifications.taskReminders.description')}
                </p>
              </div>
              <Switch
                id="task-reminders"
                checked={notifications.taskReminders}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, taskReminders: checked }))
                }
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="bg-muted border border-border rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="incident-alerts" className="text-sm font-medium text-foreground">
                  {t('profile.notifications.incidentAlerts.label')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('profile.notifications.incidentAlerts.description')}
                </p>
              </div>
              <Switch
                id="incident-alerts"
                checked={notifications.incidentAlerts}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, incidentAlerts: checked }))
                }
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>

        <EditProfileDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          profileData={profileData}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Visual check**

Run: `npm run dev` and navigate to the farmer profile. Confirm:
- Hero card shows banner + avatar + Sprout role icon + status badge.
- The 3 meta-stat tiles render with i18n labels.
- Contact card uses the new chip header, with email/phone in a 2-col row and address full-width below.
- Farm Overview card now has the chip-icon header; the 4 farm-stat tiles still show with their values.
- Recent Activity and Notifications cards have matching chip headers; toggles still work.
- Edit profile button still opens the dialog.

- [ ] **Step 4: Commit**

```bash
git add src/features/farmer/profile/components/FarmerProfile.tsx
git commit -m "Redesign farmer profile with shared hero/contact and polished extra cards"
```

---

## Task 7: Refactor `AdminProfile` to use the new shared components and polish extra cards

**Files:**
- Modify: `src/features/admin/profile/components/AdminProfile.tsx`

- [ ] **Step 1: Replace the file**

Replace `src/features/admin/profile/components/AdminProfile.tsx` with:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useProfileMe } from '@/entities/user';
import { useAuth } from '@/features/auth';
import {
  ContactInfoCard,
  ProfileHeroCard,
  SectionCardHeader,
} from '@/features/shared/profile';
import { useI18n } from '@/hooks/useI18n';
import { Bell, Clock, Loader2, Shield, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
  AdminProfileData,
  NotificationPreferences,
  RecentActivity,
} from '../types';
import { EditProfileDialog } from './EditProfileDialog';

export function AdminProfile() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    systemAlerts: true,
    incidentReports: true,
  });

  const {
    data: profile,
    isLoading: profileLoading,
    isFetching,
  } = useProfileMe();

  const hasSessionProfile = !!user?.profile;

  const profileData: AdminProfileData = useMemo(() => {
    const rawUsername = profile?.username || user?.username || 'admin';
    const username = rawUsername.includes('@') ? rawUsername.split('@')[0] : rawUsername;
    const apiFullName = profile?.fullName?.trim();
    const sessionFullName = user?.profile?.fullName?.trim();
    const fullName = apiFullName || sessionFullName || username;

    const addressParts = [profile?.wardName, profile?.provinceName].filter(Boolean);
    const address = addressParts.length > 0 ? addressParts.join(', ') : t('profile.notAvailable');

    const rawJoinedDate = profile?.joinedDate || user?.profile?.joinedDate;
    const joinedDate = rawJoinedDate
      ? new Date(rawJoinedDate).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
        })
      : t('profile.notAvailable');

    return {
      id: Number(profile?.id ?? user?.profile?.id ?? user?.id ?? 0),
      username,
      displayName: fullName,
      email:
        profile?.email ||
        user?.profile?.email ||
        user?.email ||
        t('profile.notAvailable'),
      phone: profile?.phone || user?.profile?.phone || t('profile.notAvailable'),
      address,
      bio: undefined,
      role: 'admin',
      status:
        (profile?.status || user?.profile?.status) === 'ACTIVE' ? 'active' : 'inactive',
      joinedDate,
      lastLogin: t('profile.notAvailable'),
      provinceId: profile?.provinceId ?? user?.profile?.provinceId ?? undefined,
      wardId: profile?.wardId ?? user?.profile?.wardId ?? undefined,
    };
  }, [profile, user, t]);

  const recentActivities: RecentActivity[] = [];

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  if (profileLoading && !hasSessionProfile) {
    return (
      <div className="min-h-screen acm-main-content pb-20 flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        {t('profile.loading')}
      </div>
    );
  }

  return (
    <div className="min-h-screen acm-main-content pb-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="space-y-6 p-4 sm:p-6 max-w-[1280px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">
              {t('admin.profile.title', 'Admin Profile')}
            </h1>
            {isFetching && !profileLoading && (
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
            )}
          </div>
          <Button
            onClick={() => setEditDialogOpen(true)}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <User className="w-4 h-4 mr-2" />
            {t('profile.editProfile')}
          </Button>
        </div>

        <ProfileHeroCard
          displayName={profileData.displayName}
          username={profileData.username}
          initials={getInitials(profileData.displayName)}
          roleIcon={Shield}
          roleLabel={t('admin.profile.administrator', 'Administrator')}
          isActive={profileData.status === 'active'}
          userId={profileData.id}
          joinedDate={profileData.joinedDate}
          lastLogin={profileData.lastLogin}
          labels={{
            userId: t('profile.userId'),
            joinedDate: t('profile.joinedDate'),
            lastLogin: t('profile.lastLogin'),
            status: t('profile.active'),
          }}
        />

        <ContactInfoCard
          email={profileData.email}
          phone={profileData.phone}
          address={profileData.address}
          wardCode={profileData.wardId}
          labels={{
            title: t('profile.contactInfo.title'),
            email: t('profile.contactInfo.email'),
            phone: t('profile.contactInfo.phone'),
            address: t('profile.contactInfo.address'),
          }}
        />

        {/* Recent Activity Card */}
        <Card className="border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)]">
          <SectionCardHeader icon={Clock} title={t('profile.recentActivity.title')} />
          <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('profile.recentActivity.empty')}
              </p>
            ) : (
              <div className="space-y-0">
                {recentActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-4 py-4 ${
                      index !== recentActivities.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <div className="bg-primary/10 rounded-2xl p-2 mt-0.5">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                      <p className="text-base text-foreground">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card className="border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)]">
          <SectionCardHeader icon={Bell} title={t('profile.notifications.title')} />
          <CardContent className="space-y-4 px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="bg-muted border border-border rounded-2xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Label htmlFor="system-alerts" className="text-sm font-medium text-foreground">
                  {t('admin.profile.notifications.systemAlerts.label', 'Receive System Alerts')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t(
                    'admin.profile.notifications.systemAlerts.description',
                    'Get notified about system events and updates'
                  )}
                </p>
              </div>
              <Switch
                id="system-alerts"
                checked={notifications.systemAlerts}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, systemAlerts: checked }))
                }
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="bg-muted border border-border rounded-2xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Label htmlFor="incident-reports" className="text-sm font-medium text-foreground">
                  {t('admin.profile.notifications.incidentReports.label', 'Receive Incident Reports')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t(
                    'admin.profile.notifications.incidentReports.description',
                    'Get immediate alerts for new incidents and issues'
                  )}
                </p>
              </div>
              <Switch
                id="incident-reports"
                checked={notifications.incidentReports}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, incidentReports: checked }))
                }
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>

        <EditProfileDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          profileData={profileData}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Visual check**

Run: `npm run dev` and open the admin profile. Confirm:
- Hero card with Shield role icon and "Administrator" label.
- Stat tiles populated.
- Contact card matches the buyer/farmer treatment.
- Recent Activity + Notifications cards now use the new chip header pattern.
- Both notification toggles still flip and persist locally.
- Edit profile button still opens the dialog.

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/profile/components/AdminProfile.tsx
git commit -m "Redesign admin profile with shared hero/contact and polished extra cards"
```

---

## Task 8: Final verification

**Files:** none modified.

- [ ] **Step 1: Full type-check**

Run: `npx tsc --noEmit`
Expected: PASS, zero errors.

- [ ] **Step 2: Lint changed paths**

Run: `npx eslint src/features/shared/profile src/features/buyer/profile/components/BuyerProfile.tsx src/features/farmer/profile/components/FarmerProfile.tsx src/features/admin/profile/components/AdminProfile.tsx`
Expected: zero errors. Fix any warnings related to unused imports introduced by the refactor.

- [ ] **Step 3: Cross-role visual sweep**

Run: `npm run dev`. For each role, log in (or use route shortcuts) and verify:

Buyer (`/buyer/profile` or wherever the buyer profile route lives):
- Hero, stat tiles, contact, edit button — all present.
- Vietnamese labels (`ID người dùng`, `Ngày tham gia`, etc.) display correctly.

Farmer:
- All cards render in this order: hero → contact → farm overview → recent activity → notifications.
- i18n switches between Vietnamese and English do not produce missing-key warnings in the console.

Admin:
- All cards render in this order: hero → contact → recent activity → notifications.
- i18n switches do not produce missing-key warnings.

- [ ] **Step 4: Mobile width check**

In the browser dev-tools, switch to a 375px-wide viewport. For each role, confirm:
- Stat tiles in the hero collapse to 1 column.
- Contact card fields collapse to 1 column.
- Avatar still overlaps the banner edge cleanly without clipping.
- No horizontal scroll appears on the page body.

- [ ] **Step 5: Final commit (if any cleanup)**

If lint or visual sweep surfaced small fixes, commit them as a single follow-up:

```bash
git add -A
git commit -m "Polish profile redesign after final verification sweep"
```

If nothing needed fixing, skip this step.

---

## Self-review notes

- Spec coverage: every section of the spec maps to a task — `SectionCardHeader` (Task 1), `ProfileHeroCard` (Task 2), `ContactInfoCard` (Task 3), barrel (Task 4), buyer/farmer/admin refactors (Tasks 5–7), final verification (Task 8). Page background gradient and shadow tweaks are inlined into the role refactors. New strings: none — all labels reuse existing i18n keys or current hard-coded Vietnamese values.
- Placeholder scan: no `TBD`, no `appropriate error handling`, no missing code blocks. Each step gives the actual code or command.
- Type consistency: `ProfileHeroCardProps`, `ContactInfoCardProps`, `SectionCardHeaderProps` defined in Tasks 1–3 and consumed unchanged in Tasks 5–7. Label shapes (`labels.userId`, `labels.title`, etc.) are stable across the plan.
- Behavior preservation: every original button (Edit profile in page header; "View details" in farmer Farm Overview card; both notification switches in farmer + admin) and every data field (id, username, display name, email, phone, address, joined date, last login, role badge, status badge, farm stats, recent activities) remains in the rewritten code.
