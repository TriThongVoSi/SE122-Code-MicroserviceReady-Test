# Admin Marketplace UI Audit - Design Specification

**Date:** 2026-05-02  
**Status:** Approved  
**Author:** Claude (Opus 4.7)

## Executive Summary

This specification addresses gaps found in the admin marketplace UI audit. The implementation adds mandatory rejection reasons, confirmation dialogs for destructive actions, proper pagination, and test coverage for admin role guards.

## Audit Findings

### Current State

**AdminMarketplaceProductsPage (Listing Moderation):**
- ✅ Approve/reject queue with search and status filters
- ✅ Status transitions (PENDING_REVIEW → PUBLISHED/HIDDEN)
- ❌ No mandatory reason for reject actions
- ❌ No confirmation dialogs
- ⚠️ Pagination hardcoded (size: 100)

**AdminMarketplaceOrdersPage (Payment Verification):**
- ✅ Payment proof review queue
- ✅ Verify/reject functionality
- ❌ Verification note optional, not mandatory for reject
- ❌ No confirmation dialogs
- ⚠️ Pagination hardcoded (size: 100)

**AdminMarketplaceDashboardPage:**
- ✅ KPI overview with stats
- ✅ Links to moderation screens

**Audit Logs:**
- ✅ Per-order audit logs implemented
- ⚠️ No system-wide marketplace audit log screen

**Admin Role Guards:**
- ✅ Routes integrated in AdminPortalContent
- ❌ No test coverage for permission enforcement

### Gaps to Address

1. **Mandatory rejection reasons** - Reject/hide actions must require reason input
2. **Confirmation dialogs** - Destructive actions need confirmation
3. **Proper pagination** - Replace hardcoded limits with user-controlled pagination
4. **Admin permission tests** - Add test coverage for role guards
5. **System-wide audit log** - Optional enhancement (deferred)

## Design

### Architecture

**Component Structure:**
```
src/features/marketplace/components/
├── RejectWithReasonModal.tsx      # Combined confirmation + reason input
├── ConfirmationDialog.tsx         # Simple confirmation for non-reject actions
└── PaginationControls.tsx         # Reusable pagination UI
```

**Updated Pages:**
- `AdminMarketplaceProductsPage.tsx` - Add modals, pagination
- `AdminMarketplaceOrdersPage.tsx` - Add modals, pagination

**Test Coverage:**
- Component tests for new modals
- Integration tests for moderation flows
- E2E tests for admin role guards

### Component Specifications

#### 1. RejectWithReasonModal

**Purpose:** Combined confirmation + reason collection for destructive reject/hide actions.

**Props:**
```typescript
type RejectWithReasonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;                    // e.g., "Hide Product"
  description: string;              // Warning text about consequences
  reasonLabel: string;              // e.g., "Reason for hiding"
  reasonPlaceholder?: string;
  confirmButtonText?: string;       // Default: "Confirm"
  isLoading?: boolean;
};
```

**Behavior:**
- Modal opens when user clicks reject/hide/cancel action
- Shows warning text at top explaining consequences
- Textarea for reason (required, min 10 characters)
- Real-time validation with error message
- Cancel button closes modal without action
- Confirm button disabled until valid reason entered
- Confirm button shows loading state during mutation
- Closes automatically on successful submission

**Validation Rules:**
- Reason required (non-empty after trim)
- Minimum 10 characters
- Maximum 500 characters
- Error message: "Please provide a reason (at least 10 characters)"

**UI Design:**
- Modal width: 500px
- Warning icon (AlertTriangle) in amber
- Textarea height: 120px
- Character counter below textarea
- Destructive confirm button (red)

#### 2. ConfirmationDialog

**Purpose:** Simple confirmation for non-destructive actions that still warrant user confirmation.

**Props:**
```typescript
type ConfirmationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmButtonText?: string;       // Default: "Confirm"
  confirmButtonVariant?: "default" | "destructive";
  isLoading?: boolean;
};
```

**Behavior:**
- Modal opens for approve/verify actions (optional confirmation)
- Shows title and description
- Cancel/Confirm buttons
- Closes on confirm or cancel
- Shows loading state during mutation

**Usage:**
- Currently not required per design (destructive actions only need confirmation)
- Kept for future use if needed for approve/verify flows
- Can be enabled via feature flag if desired

#### 3. PaginationControls

**Purpose:** Reusable pagination UI for admin list views.

**Props:**
```typescript
type PaginationControlsProps = {
  currentPage: number;              // 0-indexed
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];       // Default: [10, 25, 50, 100]
};
```

**Behavior:**
- Shows "Showing X-Y of Z items"
- Previous/Next buttons with disabled states
- Page size dropdown selector
- Updates query params on change
- Preserves other filters (search, status)

**UI Design:**
- Horizontal layout: Info text | Page size selector | Prev/Next buttons
- Disabled state for buttons at boundaries
- Compact design suitable for table footers

### Page Integration

#### AdminMarketplaceProductsPage Updates

**State Management:**
```typescript
const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(25);
const [rejectModalState, setRejectModalState] = useState<{
  isOpen: boolean;
  productId: number | null;
  targetStatus: MarketplaceProductStatus | null;
}>({ isOpen: false, productId: null, targetStatus: null });
```

**ModerationActions Component Changes:**
- Hide/Reject buttons open RejectWithReasonModal
- Approve/Publish buttons call mutation directly (no modal)
- Modal state managed at page level, passed to ModerationActions

**Pagination Integration:**
```typescript
const productsQuery = useMarketplaceAdminProducts({
  page,
  size: pageSize,
  q: search.trim() || undefined,
  status: status === "ALL" ? undefined : status,
});
```

**Mutation Updates:**
```typescript
// Add statusReason parameter
mutation.mutate({ 
  status: targetStatus,
  statusReason: reason  // From modal
});
```

#### AdminMarketplaceOrdersPage Updates

**State Management:**
```typescript
const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(25);
const [rejectPaymentModalState, setRejectPaymentModalState] = useState<{
  isOpen: boolean;
  orderId: number | null;
}>({ isOpen: false, orderId: null });
const [cancelOrderModalState, setCancelOrderModalState] = useState<{
  isOpen: boolean;
  orderId: number | null;
}>({ isOpen: false, orderId: null });
```

**Payment Verification Changes:**
- "Mark verified" button calls mutation directly
- "Reject proof" button opens RejectWithReasonModal
- "Cancel order" button opens RejectWithReasonModal
- Remove inline verificationNote input field (now in modal)

**Pagination Integration:**
```typescript
const ordersQuery = useMarketplaceAdminOrders({
  page,
  size: pageSize,
  status: status === "ALL" ? undefined : status,
});
```

### API Contract Updates

**MarketplaceUpdateProductStatusRequest:**
```typescript
export type MarketplaceUpdateProductStatusRequest = {
  status: MarketplaceProductStatus;
  statusReason?: string;  // Add optional field
};
```

**Why:** The API already supports `statusReason` in the product model (added in commit 8bf8d75). We're making it required in the UI for reject actions, but keeping it optional in the API for backward compatibility.

**MarketplaceUpdatePaymentVerificationRequest:**
```typescript
export type MarketplaceUpdatePaymentVerificationRequest = {
  verificationStatus: MarketplacePaymentVerificationStatus;
  verificationNote?: string;  // Already exists
};
```

**Why:** Already supports optional note. UI will require it for REJECTED status.

**MarketplaceUpdateOrderStatusRequest:**
```typescript
export type MarketplaceUpdateOrderStatusRequest = {
  status: MarketplaceOrderStatus;
  reason?: string;  // Add optional field for cancel reason
};
```

**Why:** Cancel order should include reason for audit trail.

### Testing Strategy

#### Component Tests

**RejectWithReasonModal.test.tsx:**
- Renders with correct title and description
- Textarea validation (required, min length)
- Character counter updates
- Confirm button disabled until valid input
- Cancel button closes modal
- Confirm button calls onConfirm with reason
- Loading state disables form

**PaginationControls.test.tsx:**
- Renders page info correctly
- Previous button disabled on first page
- Next button disabled on last page
- Page size change triggers callback
- Page change triggers callback

#### Integration Tests

**AdminMarketplaceProductsPage.test.tsx:**
- Approve action calls mutation without modal
- Hide action opens modal, requires reason
- Reject action opens modal, requires reason
- Modal validation prevents submission with short reason
- Successful submission closes modal and refreshes list
- Pagination controls update query params

**AdminMarketplaceOrdersPage.test.tsx:**
- Verify payment calls mutation without modal
- Reject payment opens modal, requires reason
- Cancel order opens modal, requires reason
- Successful submission closes modal and refreshes detail

#### E2E Tests (Playwright)

**admin-marketplace-guards.spec.ts:**
- Non-admin users cannot access /admin/marketplace-* routes
- Admin users can access all marketplace admin routes
- Unauthorized access redirects to appropriate page

**admin-marketplace-moderation.spec.ts:**
- Complete product approval flow
- Complete product rejection flow with reason
- Complete payment verification flow
- Complete payment rejection flow with reason
- Pagination navigation works correctly

### User Experience Flow

#### Product Rejection Flow

1. Admin navigates to "Moderate marketplace products"
2. Filters to "Pending review" status
3. Finds problematic product listing
4. Clicks "Hide" button
5. **RejectWithReasonModal opens:**
   - Title: "Hide Product"
   - Warning: "This product will be hidden from the marketplace. The farmer will be notified."
   - Textarea: "Reason for hiding this product"
   - Character counter: "0 / 500"
6. Admin types reason: "Product images do not match description"
7. Character counter updates: "42 / 500"
8. Confirm button becomes enabled
9. Admin clicks "Confirm"
10. Modal shows loading state
11. Mutation succeeds, modal closes
12. Product list refreshes, product now shows "Hidden" status
13. Toast notification: "Product hidden successfully"

#### Payment Rejection Flow

1. Admin navigates to "Manage marketplace orders"
2. Selects order with "Submitted" payment proof
3. Reviews uploaded payment proof file
4. Clicks "Reject proof" button
5. **RejectWithReasonModal opens:**
   - Title: "Reject Payment Proof"
   - Warning: "The buyer will be notified and may need to resubmit proof."
   - Textarea: "Reason for rejection"
6. Admin types reason: "Image is blurry and bank details are not visible"
7. Admin clicks "Confirm"
8. Mutation succeeds, modal closes
9. Order detail refreshes, payment status shows "Rejected"
10. Audit log entry added with reason
11. Toast notification: "Payment proof rejected"

### Implementation Checklist

**Phase 1: Shared Components**
- [ ] Create RejectWithReasonModal component
- [ ] Create ConfirmationDialog component (for future use)
- [ ] Create PaginationControls component
- [ ] Add component tests

**Phase 2: API Updates**
- [ ] Add `statusReason` to MarketplaceUpdateProductStatusRequest type
- [ ] Add `reason` to MarketplaceUpdateOrderStatusRequest type
- [ ] Update mock adapter to handle new fields
- [ ] Update real adapter to pass new fields

**Phase 3: AdminMarketplaceProductsPage**
- [ ] Add pagination state management
- [ ] Add reject modal state management
- [ ] Update ModerationActions to use modal for reject/hide
- [ ] Integrate PaginationControls
- [ ] Update mutations to pass statusReason
- [ ] Add integration tests

**Phase 4: AdminMarketplaceOrdersPage**
- [ ] Add pagination state management
- [ ] Add reject payment modal state
- [ ] Add cancel order modal state
- [ ] Remove inline verification note input
- [ ] Update verification actions to use modal for reject
- [ ] Integrate PaginationControls
- [ ] Update mutations to pass reason/note
- [ ] Add integration tests

**Phase 5: E2E Tests**
- [ ] Add admin role guard tests
- [ ] Add product moderation flow tests
- [ ] Add payment verification flow tests

**Phase 6: Documentation**
- [ ] Update CLAUDE.md with new component locations
- [ ] Add usage examples for shared components
- [ ] Document modal patterns for future features

## Technical Considerations

### State Management

**Modal State Pattern:**
```typescript
// Centralized modal state at page level
const [rejectModalState, setRejectModalState] = useState<{
  isOpen: boolean;
  productId: number | null;
  targetStatus: MarketplaceProductStatus | null;
  actionType: 'hide' | 'reject';
}>({ isOpen: false, productId: null, targetStatus: null, actionType: 'hide' });

// Open modal
const openRejectModal = (productId: number, targetStatus: MarketplaceProductStatus, actionType: 'hide' | 'reject') => {
  setRejectModalState({ isOpen: true, productId, targetStatus, actionType });
};

// Close modal
const closeRejectModal = () => {
  setRejectModalState({ isOpen: false, productId: null, targetStatus: null, actionType: 'hide' });
};

// Handle confirm
const handleRejectConfirm = async (reason: string) => {
  if (!rejectModalState.productId || !rejectModalState.targetStatus) return;
  
  await mutation.mutateAsync({
    status: rejectModalState.targetStatus,
    statusReason: reason,
  });
  
  closeRejectModal();
};
```

**Why:** Centralizing modal state at the page level prevents prop drilling and makes it easier to manage multiple modal types.

### Pagination State

**Query Param Sync:**
```typescript
const [searchParams, setSearchParams] = useSearchParams();
const page = Number(searchParams.get('page') ?? '0');
const pageSize = Number(searchParams.get('size') ?? '25');

const handlePageChange = (newPage: number) => {
  setSearchParams(prev => {
    prev.set('page', String(newPage));
    return prev;
  });
};

const handlePageSizeChange = (newSize: number) => {
  setSearchParams(prev => {
    prev.set('page', '0');  // Reset to first page
    prev.set('size', String(newSize));
    return prev;
  });
};
```

**Why:** Syncing pagination with URL query params makes the state shareable (copy URL) and preserves state on browser back/forward.

### Accessibility

**Modal Accessibility:**
- Focus trap within modal
- Escape key closes modal
- Focus returns to trigger button on close
- ARIA labels for screen readers
- Keyboard navigation support

**Pagination Accessibility:**
- Buttons have descriptive aria-labels
- Disabled state communicated to screen readers
- Keyboard navigation support

### Performance

**Optimistic Updates:**
- Not used for admin actions (prefer server confirmation)
- Mutations invalidate queries to refetch fresh data
- Loading states prevent double-submission

**Query Caching:**
- React Query caches results by page/size/filters
- Cache invalidation on successful mutations
- Stale time: 30 seconds for admin views

## Success Criteria

**Functional Requirements:**
- ✅ Reject/hide actions require mandatory reason (min 10 chars)
- ✅ Destructive actions show confirmation with reason input
- ✅ Approve/verify actions work without modals
- ✅ Pagination controls allow page size selection (10, 25, 50, 100)
- ✅ Pagination preserves filters and search
- ✅ Admin role guards tested and enforced

**User Experience:**
- ✅ Single modal for reject flows (no two-popup friction)
- ✅ Real-time validation feedback
- ✅ Loading states during mutations
- ✅ Toast notifications for success/error
- ✅ Keyboard navigation support

**Code Quality:**
- ✅ Reusable components with clear props
- ✅ Type-safe API contracts
- ✅ Comprehensive test coverage (>80%)
- ✅ Accessible UI components
- ✅ Consistent error handling

## Future Enhancements

**Deferred to Future Iterations:**

1. **System-wide Audit Log Page**
   - Dedicated page showing all marketplace admin actions
   - Filterable by action type, admin user, date range
   - Export to CSV functionality

2. **Bulk Actions**
   - Select multiple products for bulk approve/reject
   - Batch operations with progress indicator

3. **Advanced Filters**
   - Filter by farmer, farm, region
   - Date range filters for created/updated
   - Saved filter presets

4. **Notification System**
   - Real-time notifications for new pending reviews
   - Email alerts for admin actions
   - Farmer notifications for status changes

5. **Analytics Dashboard**
   - Moderation metrics (avg review time, approval rate)
   - Payment verification metrics
   - Trend charts and insights

## Appendix

### Related Files

**Components:**
- `src/features/marketplace/components/RejectWithReasonModal.tsx` (new)
- `src/features/marketplace/components/ConfirmationDialog.tsx` (new)
- `src/features/marketplace/components/PaginationControls.tsx` (new)

**Pages:**
- `src/features/marketplace/pages/AdminMarketplaceProductsPage.tsx` (update)
- `src/features/marketplace/pages/AdminMarketplaceOrdersPage.tsx` (update)
- `src/features/marketplace/pages/AdminMarketplaceDashboardPage.tsx` (no changes)

**API:**
- `src/shared/api/marketplace/types.ts` (update)
- `src/shared/api/marketplace/adapter.ts` (no changes)
- `src/shared/api/marketplace/real-adapter.ts` (no changes)
- `src/shared/api/marketplace/mock-adapter.ts` (update)

**Tests:**
- `src/features/marketplace/components/__tests__/RejectWithReasonModal.test.tsx` (new)
- `src/features/marketplace/components/__tests__/PaginationControls.test.tsx` (new)
- `src/features/marketplace/pages/__tests__/AdminMarketplaceProductsPage.test.tsx` (new)
- `src/features/marketplace/pages/__tests__/AdminMarketplaceOrdersPage.test.tsx` (new)
- `e2e/admin-marketplace-guards.spec.ts` (new)
- `e2e/admin-marketplace-moderation.spec.ts` (new)

### Design Decisions

**Why merge confirmation + reason into one modal?**
- Reduces user friction (one popup instead of two)
- Faster workflow for admins
- Warning text provides context for reason requirement
- Single submit action is clearer

**Why keep ConfirmationDialog separate?**
- Future-proofing for optional confirmations on approve/verify
- Reusable for other admin actions that need simple confirmation
- Lighter component for non-reject flows

**Why not use inline reason fields?**
- Modal focuses attention on important action
- Prevents accidental submissions
- Consistent pattern across all reject actions
- Better mobile experience

**Why pagination instead of infinite scroll?**
- Admin users prefer precise navigation
- Easier to reference specific pages
- Better for keyboard navigation
- Simpler implementation and testing

**Why 25 as default page size?**
- Balance between overview and detail
- Reduces scrolling while showing enough context
- Common admin UI pattern
- Can be adjusted per user preference

---

**End of Specification**
