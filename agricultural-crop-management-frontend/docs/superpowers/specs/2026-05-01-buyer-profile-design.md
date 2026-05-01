# Buyer Profile Feature - Design Specification

**Date:** 2026-05-01  
**Feature:** Buyer Profile Management  
**Location:** `src/features/buyer/profile`  
**Route:** `/marketplace/profile/*`

## Overview

Build a comprehensive buyer profile feature for the marketplace with three main sections: Personal Info, Address Book, and Security. The profile uses a sidebar layout on desktop and a compact header with tabs on mobile, following the design specifications provided in the UI mockups.

## Requirements Summary

### Functional Requirements
- Display user information (avatar, name, email, role badge)
- Show order statistics (total orders, completed orders, reviews)
- Allow editing of personal info (name and phone only, email read-only)
- Manage delivery addresses (list, add, edit, delete, set default)
- Change password functionality (if auth API supports it)
- Three-tab navigation: Personal Info, Address Book, Security

### Non-Functional Requirements
- Responsive design (desktop sidebar, mobile compact header + tabs)
- URL-based routing for shareable links and browser navigation
- Reuse existing marketplace API hooks (orders, addresses)
- Follow existing marketplace UI patterns and component library
- Vietnamese language labels (matching provided screenshots)

## Architecture

### Approach
Single page component with nested routes - a `BuyerProfileLayout` component renders the sidebar/header and uses React Router's `<Outlet />` for tab content.

### Directory Structure

```
src/features/buyer/profile/
├── layout/
│   └── BuyerProfileLayout.tsx          # Main layout wrapper
├── pages/
│   ├── PersonalInfoPage.tsx            # Personal info tab
│   ├── AddressBookPage.tsx             # Address management tab
│   └── SecurityPage.tsx                # Password change tab
├── components/
│   ├── ProfileSidebar.tsx              # Desktop sidebar
│   ├── ProfileMobileHeader.tsx         # Mobile header
│   ├── ProfileUserCard.tsx             # User card (avatar, stats)
│   ├── ProfileNavigation.tsx           # Nav menu items
│   ├── PersonalInfoForm.tsx            # Edit name/phone form
│   ├── AddressCard.tsx                 # Address display card
│   ├── AddressForm.tsx                 # Add/edit address form
│   └── PasswordChangeForm.tsx          # Password change form
├── hooks/
│   └── useBuyerStats.ts                # Order statistics hook
└── index.ts                            # Barrel exports
```

### Routing Structure

**Routes in `src/app/routes.tsx`:**

```tsx
// Inside /marketplace route
<Route path="profile" element={<BuyerProfileLayout />}>
  <Route index element={<Navigate to="info" replace />} />
  <Route path="info" element={<PersonalInfoPage />} />
  <Route path="addresses" element={<AddressBookPage />} />
  <Route path="security" element={<SecurityPage />} />
</Route>
```

**URLs:**
- `/marketplace/profile` → redirects to `/marketplace/profile/info`
- `/marketplace/profile/info` → Personal Info tab
- `/marketplace/profile/addresses` → Address Book tab
- `/marketplace/profile/security` → Security tab

**Why:** URL-based routing provides shareable links, proper browser back/forward navigation, and follows the pattern used in marketplace seller dashboard.

## Component Design

### 1. BuyerProfileLayout

**Purpose:** Main layout wrapper that renders sidebar (desktop) or header (mobile) and provides outlet for tab content.

**Responsibilities:**
- Fetch user data and statistics
- Render responsive layout (sidebar on desktop, header on mobile)
- Provide `<Outlet />` for nested route content
- Handle loading and error states

**Layout Structure:**

**Desktop (≥768px):**
```
┌─────────────────────────────────────────┐
│  [Sidebar]  │  [Main Content]           │
│             │                            │
│  User Card  │  <Outlet /> renders:      │
│  Stats      │  - PersonalInfoPage       │
│  Nav Menu   │  - AddressBookPage        │
│             │  - SecurityPage           │
└─────────────────────────────────────────┘
```

**Mobile (<768px):**
```
┌─────────────────────────────────────────┐
│  [Compact Header]                       │
│  Avatar + Name + Role                   │
├─────────────────────────────────────────┤
│  [Horizontal Tabs]                      │
│  Info | Addresses | Security            │
├─────────────────────────────────────────┤
│  [Main Content]                         │
│  <Outlet /> renders tab content         │
└─────────────────────────────────────────┘
```

**Data Fetching:**
- Use `useAuth()` for current user session data
- Use `useProfileMe()` for fresh profile data (if available)
- Use `useBuyerStats()` custom hook for order statistics

### 2. ProfileSidebar (Desktop Only)

**Purpose:** Left sidebar containing user card and navigation menu.

**Structure:**
```tsx
<aside className="w-80 bg-white border-r">
  <ProfileUserCard 
    user={user}
    stats={stats}
  />
  <ProfileNavigation />
</aside>
```

**Styling:**
- Fixed width: 320px (w-80)
- White background with right border
- Sticky positioning (stays visible on scroll)

### 3. ProfileMobileHeader (Mobile Only)

**Purpose:** Compact header for mobile showing avatar, name, role, and horizontal tabs.

**Structure:**
```tsx
<div className="bg-white border-b">
  {/* Compact user info */}
  <div className="flex items-center gap-3 p-4">
    <Avatar size="sm" />
    <div>
      <h2>{user.name}</h2>
      <Badge>Buyer</Badge>
    </div>
  </div>
  
  {/* Horizontal tabs */}
  <nav className="flex border-t">
    <NavLink to="info">Info</NavLink>
    <NavLink to="addresses">Addresses</NavLink>
    <NavLink to="security">Security</NavLink>
  </nav>
</div>
```

**Styling:**
- Horizontal scrollable tabs if needed
- Active tab: green underline (border-b-2 border-emerald-600)
- Icons + text labels

### 4. ProfileUserCard

**Purpose:** Display user avatar, name, email, role badge, and statistics.

**Props:**
```tsx
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
}
```

**Structure:**
```tsx
<Card>
  {/* Avatar */}
  <Avatar className="w-24 h-24 bg-emerald-600">
    <AvatarFallback>{initials}</AvatarFallback>
  </Avatar>
  
  {/* Name & Email */}
  <h2 className="text-xl font-bold">{name}</h2>
  <p className="text-gray-500">{email}</p>
  
  {/* Role Badge */}
  <Badge className="bg-emerald-600">Buyer</Badge>
  
  {/* Statistics */}
  <div className="grid grid-cols-3 border-t border-b py-4">
    <Stat label="ĐƠN HÀNG" value={totalOrders} color="black" />
    <Stat label="HOÀN TẤT" value={completedOrders} color="green" />
    <Stat label="ĐÁNH GIÁ" value={totalReviews} color="orange" />
  </div>
</Card>
```

**Initials Logic:**
```tsx
const getInitials = (name: string) => 
  name.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
```

### 5. ProfileNavigation

**Purpose:** Vertical navigation menu (desktop) or horizontal tabs (mobile).

**Navigation Items:**
```tsx
const navItems = [
  { 
    to: '/marketplace/profile/info',
    icon: User,
    label: 'Thông tin cá nhân'
  },
  { 
    to: '/marketplace/profile/addresses',
    icon: MapPin,
    label: 'Sổ địa chỉ'
  },
  { 
    to: '/marketplace/profile/security',
    icon: Shield,
    label: 'Bảo mật'
  }
];
```

**Active State:**
- Light green background: `bg-emerald-50`
- Dark green text: `text-emerald-700`
- Use `NavLink` with `isActive` prop

### 6. useBuyerStats Hook

**Purpose:** Calculate order statistics from marketplace orders API.

**Implementation:**
```tsx
export function useBuyerStats() {
  const { data: ordersData, isLoading } = useMarketplaceOrders({
    size: 100 // Fetch enough to calculate stats
  });
  
  const stats = useMemo(() => {
    if (!ordersData?.items) {
      return { totalOrders: 0, completedOrders: 0, totalReviews: 0 };
    }
    
    const totalOrders = ordersData.items.length;
    const completedOrders = ordersData.items.filter(
      order => order.status === 'COMPLETED'
    ).length;
    
    // Count reviews from completed orders
    const totalReviews = ordersData.items
      .filter(order => order.status === 'COMPLETED')
      .reduce((sum, order) => {
        return sum + (order.items?.filter(item => item.hasReview).length || 0);
      }, 0);
    
    return { totalOrders, completedOrders, totalReviews };
  }, [ordersData]);
  
  return { stats, isLoading };
}
```

**Why:** Uses existing `useMarketplaceOrders()` hook to fetch real data. Client-side calculation is acceptable since we're fetching a reasonable page size. No backend changes needed.

## Page Components

### PersonalInfoPage

**Purpose:** Display and edit personal information (name, phone).

**Structure:**
```tsx
<Card>
  <CardHeader>
    <h2>Thông tin cá nhân</h2>
    <Button variant="outline" onClick={handleEdit}>
      Chỉnh sửa
    </Button>
  </CardHeader>
  
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Họ và tên</Label>
        <Input value={name} disabled />
      </div>
      <div>
        <Label>Email</Label>
        <Input value={email} disabled />
      </div>
      <div>
        <Label>Số điện thoại</Label>
        <Input value={phone} disabled />
      </div>
    </div>
  </CardContent>
</Card>

{/* Edit Dialog */}
<Dialog open={isEditing}>
  <PersonalInfoForm 
    initialData={{ name, phone }}
    onSave={handleSave}
    onCancel={() => setIsEditing(false)}
  />
</Dialog>
```

**Edit Behavior:**
- Click "Chỉnh sửa" button opens dialog
- Dialog contains form with name and phone fields (email read-only)
- Form validation: name required, phone format validation
- On save: call profile update API, close dialog, show success toast
- On cancel: close dialog without saving

**API Integration:**
- Check if `useProfileMe()` hook has an update mutation
- If not, may need to create `useUpdateProfileMutation()` hook
- Endpoint likely: `PATCH /api/profile/me` or similar

### AddressBookPage

**Purpose:** Manage delivery addresses (list, add, edit, delete, set default).

**Structure:**
```tsx
<Card>
  <CardHeader>
    <h2>Sổ địa chỉ</h2>
    <Button onClick={() => setShowAddForm(true)}>
      + Thêm địa chỉ
    </Button>
  </CardHeader>
  
  <CardContent>
    {/* Address List */}
    {addresses.map(address => (
      <AddressCard
        key={address.id}
        address={address}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSetDefault={handleSetDefault}
      />
    ))}
    
    {/* Add/Edit Form */}
    {showAddForm && (
      <AddressForm
        mode="add"
        onSave={handleSave}
        onCancel={() => setShowAddForm(false)}
      />
    )}
  </CardContent>
</Card>
```

**Address Card Component:**
```tsx
<div className={cn(
  "border rounded-lg p-4",
  address.isDefault && "border-emerald-600 border-2"
)}>
  {/* Header: Name | Phone */}
  <div className="flex items-center gap-2">
    <span className="font-medium">{name}</span>
    <span className="text-gray-400">|</span>
    <span>{phone}</span>
  </div>
  
  {/* Badges */}
  <div className="flex gap-2 mt-2">
    {address.isDefault && (
      <Badge className="bg-emerald-600">Mặc định</Badge>
    )}
    <Badge variant="outline">{address.label}</Badge>
  </div>
  
  {/* Address Text */}
  <p className="text-sm text-gray-600 mt-2">
    {address.street}, {address.ward}, {address.district}, {address.province}
  </p>
  
  {/* Actions */}
  <div className="flex gap-2 mt-3">
    <Button variant="ghost" size="sm" onClick={onEdit}>
      Sửa
    </Button>
    {!address.isDefault && (
      <>
        <Button variant="ghost" size="sm" onClick={onSetDefault}>
          Thiết lập mặc định
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="text-red-500" />
        </Button>
      </>
    )}
  </div>
</div>
```

**Address Form Component:**
```tsx
<div className="bg-gray-50 rounded-lg p-4">
  <h3 className="font-bold mb-4">Thêm địa chỉ mới</h3>
  
  <form onSubmit={handleSubmit}>
    <div className="grid grid-cols-2 gap-4">
      <Input label="Họ và tên" name="name" required />
      <Input label="Số điện thoại" name="phone" required />
      
      <Select label="Tỉnh/Thành phố" name="province" required />
      <Select label="Quận/Huyện" name="district" required />
      
      <Select label="Phường/Xã" name="ward" required />
      <Input label="Tên đường, Tòa nhà" name="street" required />
      
      <Input 
        label="Chi tiết thêm (Tùy chọn)" 
        name="detail"
        placeholder="Số nhà, tầng, phòng..."
        className="col-span-2"
      />
    </div>
    
    {/* Address Type */}
    <RadioGroup label="Loại địa chỉ" className="mt-4">
      <Radio value="HOME" label="Nhà riêng" />
      <Radio value="OFFICE" label="Văn phòng" />
    </RadioGroup>
    
    {/* Default Checkbox */}
    <Checkbox 
      label="Đặt làm địa chỉ mặc định"
      name="isDefault"
      className="mt-4"
    />
    
    {/* Actions */}
    <div className="flex justify-end gap-2 mt-6">
      <Button variant="outline" onClick={onCancel}>
        Hủy
      </Button>
      <Button type="submit">
        Lưu địa chỉ
      </Button>
    </div>
  </form>
</div>
```

**API Integration:**
- Use existing marketplace address hooks:
  - `useMarketplaceAddresses()` - fetch addresses
  - `useMarketplaceCreateAddressMutation()` - create
  - `useMarketplaceUpdateAddressMutation()` - update
  - `useMarketplaceDeleteAddressMutation()` - delete
- Address data structure from marketplace API:
  ```tsx
  interface MarketplaceAddress {
    id: number;
    name: string;
    phone: string;
    provinceId: number;
    provinceName: string;
    districtId: number;
    districtName: string;
    wardId: number;
    wardName: string;
    street: string;
    detail?: string;
    label: 'HOME' | 'OFFICE';
    isDefault: boolean;
  }
  ```

**Province/District/Ward Selection:**
- Use existing address selector components if available
- Check `src/shared/ui/address-selector/` for reusable components
- Cascade selection: province → district → ward
- May use Vietnam address API for data

### SecurityPage

**Purpose:** Change password functionality.

**Implementation Strategy:**
1. Check for existing auth API endpoint
2. If exists: implement full functionality
3. If not: show UI with "coming soon" message

**Structure:**
```tsx
<Card>
  <CardHeader>
    <h2>Đổi mật khẩu</h2>
  </CardHeader>
  
  <CardContent>
    <PasswordChangeForm />
  </CardContent>
</Card>
```

**PasswordChangeForm Component:**
```tsx
<form onSubmit={handleSubmit} className="max-w-md">
  <div className="space-y-4">
    <div>
      <Label>Mật khẩu hiện tại</Label>
      <Input 
        type="password"
        name="currentPassword"
        required
      />
    </div>
    
    <div>
      <Label>Mật khẩu mới</Label>
      <Input 
        type="password"
        name="newPassword"
        required
        minLength={8}
      />
    </div>
    
    <div>
      <Label>Xác nhận mật khẩu mới</Label>
      <Input 
        type="password"
        name="confirmPassword"
        required
      />
    </div>
  </div>
  
  <Button type="submit" className="mt-6">
    Cập nhật mật khẩu
  </Button>
</form>
```

**Validation:**
- Current password: required
- New password: min 8 characters, required
- Confirm password: must match new password
- Show validation errors inline

**API Integration:**
- Check for endpoint: `POST /api/auth/change-password` or similar
- Request body: `{ currentPassword, newPassword }`
- On success: show success toast, optionally log user out to re-authenticate
- On error: show error message (e.g., "Current password incorrect")

**If API doesn't exist:**
```tsx
<Alert variant="info">
  <InfoIcon />
  <AlertTitle>Tính năng đang phát triển</AlertTitle>
  <AlertDescription>
    Chức năng đổi mật khẩu sẽ sớm được cập nhật. 
    Vui lòng liên hệ hỗ trợ nếu cần thay đổi mật khẩu.
  </AlertDescription>
</Alert>
```

## Data Flow

### User Data
```
useAuth() → session data (immediate)
    ↓
useProfileMe() → fresh profile data (background fetch)
    ↓
ProfileUserCard → display name, email, avatar
```

### Statistics Data
```
useBuyerStats() → useMarketplaceOrders({ size: 100 })
    ↓
Calculate: totalOrders, completedOrders, totalReviews
    ↓
ProfileUserCard → display statistics
```

### Address Data
```
useMarketplaceAddresses() → fetch addresses
    ↓
AddressBookPage → display list
    ↓
User actions → mutations (create/update/delete)
    ↓
Query invalidation → refetch addresses
```

## Styling & UI Components

### Color Palette
- Primary green: `emerald-600` (#10b981)
- Light green background: `emerald-50`
- Dark green text: `emerald-700`
- Gray text: `gray-500`, `gray-600`
- Border: `gray-200`
- Success: `emerald-600`
- Warning: `orange-500`
- Error: `red-500`

### Component Library
Use existing shared UI components:
- `Card`, `CardHeader`, `CardContent` - containers
- `Button` - actions (variants: default, outline, ghost)
- `Input` - text inputs
- `Label` - form labels
- `Badge` - role badge, address labels
- `Avatar`, `AvatarFallback` - user avatar
- `Dialog` - edit forms
- `Alert` - info messages
- `RadioGroup`, `Radio` - address type selection
- `Checkbox` - default address checkbox
- `Select` - province/district/ward dropdowns

### Responsive Breakpoints
- Mobile: `< 768px` (md breakpoint)
- Desktop: `≥ 768px`

Use Tailwind responsive classes:
```tsx
<div className="block md:hidden"> {/* Mobile only */}
<div className="hidden md:block"> {/* Desktop only */}
```

## Error Handling

### Loading States
- Show skeleton loaders for user card and statistics while fetching
- Show spinner in buttons during mutations
- Disable form inputs during submission

### Error States
- API errors: show toast notification with error message
- Validation errors: show inline below input fields
- Network errors: show retry button
- Empty states: show helpful message (e.g., "No addresses yet")

### Success Feedback
- Show toast notification on successful save/update/delete
- Update UI optimistically where appropriate
- Invalidate queries to refetch fresh data

## Testing Considerations

### Unit Tests
- `useBuyerStats` hook: test statistics calculation logic
- Form validation: test name/phone/password validation
- Initials generation: test `getInitials()` function

### Integration Tests
- Navigation: test tab switching updates URL and content
- Address CRUD: test create/edit/delete/set default flows
- Personal info edit: test form submission and API integration

### Manual Testing Checklist
- [ ] Desktop sidebar layout renders correctly
- [ ] Mobile header + tabs layout renders correctly
- [ ] Statistics display correct values from orders
- [ ] Personal info edit saves name and phone
- [ ] Email field is read-only
- [ ] Address list displays all addresses
- [ ] Default address has green border and badge
- [ ] Add address form validates and saves
- [ ] Edit address pre-fills form and updates
- [ ] Delete address removes from list
- [ ] Set default updates default address
- [ ] Password change form validates (if API exists)
- [ ] Browser back/forward navigation works
- [ ] Direct URL access to tabs works
- [ ] Responsive breakpoints work correctly

## Implementation Notes

### Existing Code to Reuse
- `useMarketplaceOrders()` - for statistics
- `useMarketplaceAddresses()` - for address list
- `useMarketplaceCreateAddressMutation()` - create address
- `useMarketplaceUpdateAddressMutation()` - update address
- `useMarketplaceDeleteAddressMutation()` - delete address
- `useAuth()` - current user session
- `useProfileMe()` - profile data (if available)
- Shared UI components from `src/shared/ui/`
- Address selector components (if available)

### Code to Replace
- Existing `BuyerProfile.tsx` component
- Existing `EditProfileDialog.tsx` component (integrate into new structure)

### New Code to Create
- All components in `src/features/buyer/profile/` directory
- `useBuyerStats()` custom hook
- Route definitions in `src/app/routes.tsx`

### Dependencies
- No new npm packages required
- Uses existing React Router, React Query, Tailwind CSS
- Uses existing marketplace API client

## Success Criteria

### Functional
- ✅ User can view their profile information
- ✅ User can see order statistics (orders, completed, reviews)
- ✅ User can edit their name and phone number
- ✅ User can manage delivery addresses (CRUD operations)
- ✅ User can set a default address
- ✅ User can change password (if API exists)
- ✅ Navigation between tabs works via URL routing

### Non-Functional
- ✅ Responsive design works on mobile and desktop
- ✅ UI matches provided screenshots
- ✅ Vietnamese labels match specifications
- ✅ Loading states provide feedback
- ✅ Error handling is user-friendly
- ✅ Code follows existing marketplace patterns
- ✅ No duplicate API calls or state management

## Future Enhancements

### Potential Additions (Out of Scope)
- Profile photo upload
- Email change with verification flow
- Two-factor authentication
- Order history quick view in profile
- Notification preferences
- Account deletion
- Export personal data (GDPR compliance)

### Technical Debt to Address Later
- If statistics calculation becomes slow with many orders, create dedicated backend endpoint
- If password change API doesn't exist, implement backend endpoint
- Consider caching statistics data with longer stale time
- Add optimistic updates for address mutations

## Appendix

### Vietnamese Label Reference
- Thông tin cá nhân = Personal Info
- Sổ địa chỉ = Address Book
- Bảo mật = Security
- Họ và tên = Full Name
- Số điện thoại = Phone Number
- Mật khẩu hiện tại = Current Password
- Mật khẩu mới = New Password
- Xác nhận mật khẩu mới = Confirm New Password
- Chỉnh sửa = Edit
- Thêm địa chỉ = Add Address
- Mặc định = Default
- Nhà riêng = Home
- Văn phòng = Office
- Lưu địa chỉ = Save Address
- Hủy = Cancel
- Cập nhật mật khẩu = Update Password
- Đơn hàng = Orders
- Hoàn tất = Completed
- Đánh giá = Reviews

### Design Decisions Log

**Q: Replace existing profile or extend it?**  
**A:** Replace - build new sidebar layout from scratch to match marketplace design.

**Q: Where to get statistics data?**  
**A:** Use existing `useMarketplaceOrders()` API and calculate client-side.

**Q: Reuse marketplace addresses or create separate system?**  
**A:** Reuse - same address system for profile and checkout.

**Q: What fields are editable in personal info?**  
**A:** Name and phone only - email is read-only (tied to authentication).

**Q: How to handle password change?**  
**A:** Check for existing auth API first, implement if exists, otherwise show placeholder.

**Q: URL routing or client state for tabs?**  
**A:** URL-based routing - provides shareable links and proper browser navigation.

**Q: Mobile responsive approach?**  
**A:** Compact header + horizontal tabs - balances space and usability.

**Q: Architecture approach?**  
**A:** Single page component with nested routes - follows marketplace seller pattern.
