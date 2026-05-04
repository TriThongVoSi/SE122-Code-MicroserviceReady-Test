# Admin Marketplace UI Audit - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add mandatory rejection reasons, confirmation dialogs, pagination controls, and test coverage to admin marketplace UI.

**Architecture:** Create three reusable components (RejectWithReasonModal, ConfirmationDialog, PaginationControls) and integrate them into AdminMarketplaceProductsPage and AdminMarketplaceOrdersPage. Update API types to support optional reason fields. Add comprehensive test coverage including component tests, integration tests, and E2E tests.

**Tech Stack:** React 18, TypeScript, Radix UI Dialog, React Query, Vitest, React Testing Library, Playwright

---

## File Structure

**New Components:**
- `src/features/marketplace/components/RejectWithReasonModal.tsx` - Combined confirmation + reason input modal
- `src/features/marketplace/components/ConfirmationDialog.tsx` - Simple confirmation dialog (future use)
- `src/features/marketplace/components/PaginationControls.tsx` - Reusable pagination UI
- `src/features/marketplace/components/index.ts` - Export barrel

**Updated Pages:**
- `src/features/marketplace/pages/AdminMarketplaceProductsPage.tsx` - Add modal state, pagination
- `src/features/marketplace/pages/AdminMarketplaceOrdersPage.tsx` - Add modal state, pagination

**Updated API Types:**
- `src/shared/api/marketplace/types.ts` - Add optional reason fields

**Updated Mock Adapter:**
- `src/shared/api/marketplace/mock-adapter.ts` - Handle new reason fields

**Component Tests:**
- `src/features/marketplace/components/__tests__/RejectWithReasonModal.test.tsx`
- `src/features/marketplace/components/__tests__/PaginationControls.test.tsx`

**Integration Tests:**
- `src/features/marketplace/pages/__tests__/AdminMarketplaceProductsPage.test.tsx`
- `src/features/marketplace/pages/__tests__/AdminMarketplaceOrdersPage.test.tsx`

**E2E Tests:**
- `tests/e2e/admin-marketplace-guards.spec.ts`
- `tests/e2e/admin-marketplace-moderation.spec.ts`

---

### Task 1: Create RejectWithReasonModal Component

**Files:**
- Create: `src/features/marketplace/components/RejectWithReasonModal.tsx`
- Create: `src/features/marketplace/components/__tests__/RejectWithReasonModal.test.tsx`

- [ ] **Step 1: Write failing test for modal rendering**

Create test file with basic rendering test:

```typescript
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RejectWithReasonModal } from "../RejectWithReasonModal";

describe("RejectWithReasonModal", () => {
  it("renders with title and description when open", () => {
    render(
      <RejectWithReasonModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Hide Product"
        description="This product will be hidden from the marketplace."
        reasonLabel="Reason for hiding"
      />
    );

    expect(screen.getByText("Hide Product")).toBeInTheDocument();
    expect(screen.getByText("This product will be hidden from the marketplace.")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for hiding")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- RejectWithReasonModal.test.tsx`
Expected: FAIL with "RejectWithReasonModal not found"

- [ ] **Step 3: Create minimal component implementation**

```typescript
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";

type RejectWithReasonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description: string;
  reasonLabel: string;
  reasonPlaceholder?: string;
  confirmButtonText?: string;
  isLoading?: boolean;
};

export function RejectWithReasonModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  reasonLabel,
  reasonPlaceholder = "Enter reason...",
  confirmButtonText = "Confirm",
  isLoading = false,
}: RejectWithReasonModalProps) {
  const [reason, setReason] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
              <AlertTriangle size={20} />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="reason">{reasonLabel}</Label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={reasonPlaceholder}
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            rows={5}
            disabled={isLoading}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(reason)}
            disabled={isLoading}
          >
            {confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- RejectWithReasonModal.test.tsx`
Expected: PASS

- [ ] **Step 5: Add validation tests**

Add to test file:

```typescript
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RejectWithReasonModal } from "../RejectWithReasonModal";

describe("RejectWithReasonModal", () => {
  // ... existing test ...

  it("shows validation error for short reason", async () => {
    const user = userEvent.setup();
    render(
      <RejectWithReasonModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Hide Product"
        description="Warning text"
        reasonLabel="Reason"
      />
    );

    const textarea = screen.getByLabelText("Reason");
    await user.type(textarea, "Short");

    expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
  });

  it("disables confirm button until valid reason entered", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <RejectWithReasonModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title="Hide Product"
        description="Warning text"
        reasonLabel="Reason"
      />
    );

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    expect(confirmButton).toBeDisabled();

    const textarea = screen.getByLabelText("Reason");
    await user.type(textarea, "This is a valid reason with enough characters");

    expect(confirmButton).toBeEnabled();
  });

  it("calls onConfirm with reason when submitted", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <RejectWithReasonModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title="Hide Product"
        description="Warning text"
        reasonLabel="Reason"
      />
    );

    const textarea = screen.getByLabelText("Reason");
    await user.type(textarea, "Valid rejection reason");

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledWith("Valid rejection reason");
  });

  it("shows character counter", async () => {
    const user = userEvent.setup();
    render(
      <RejectWithReasonModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Hide Product"
        description="Warning text"
        reasonLabel="Reason"
      />
    );

    expect(screen.getByText("0 / 500")).toBeInTheDocument();

    const textarea = screen.getByLabelText("Reason");
    await user.type(textarea, "Test");

    expect(screen.getByText("4 / 500")).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run tests to verify they fail**

Run: `npm test -- RejectWithReasonModal.test.tsx`
Expected: FAIL - validation and character counter not implemented

- [ ] **Step 7: Add validation and character counter to component**

Update component:

```typescript
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";

type RejectWithReasonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description: string;
  reasonLabel: string;
  reasonPlaceholder?: string;
  confirmButtonText?: string;
  isLoading?: boolean;
};

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 500;

export function RejectWithReasonModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  reasonLabel,
  reasonPlaceholder = "Enter reason...",
  confirmButtonText = "Confirm",
  isLoading = false,
}: RejectWithReasonModalProps) {
  const [reason, setReason] = useState("");
  const trimmedReason = reason.trim();
  const isValid = trimmedReason.length >= MIN_REASON_LENGTH && trimmedReason.length <= MAX_REASON_LENGTH;
  const showError = reason.length > 0 && !isValid;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(trimmedReason);
      setReason("");
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
              <AlertTriangle size={20} />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="reason">{reasonLabel}</Label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={reasonPlaceholder}
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            rows={5}
            disabled={isLoading}
            maxLength={MAX_REASON_LENGTH}
          />
          <div className="flex items-center justify-between text-xs">
            <span className={showError ? "text-red-600" : "text-gray-500"}>
              {showError && "Please provide a reason (at least 10 characters)"}
            </span>
            <span className="text-gray-400">
              {reason.length} / {MAX_REASON_LENGTH}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
          >
            {confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npm test -- RejectWithReasonModal.test.tsx`
Expected: All tests PASS

- [ ] **Step 9: Commit**

```bash
git add src/features/marketplace/components/RejectWithReasonModal.tsx
git add src/features/marketplace/components/__tests__/RejectWithReasonModal.test.tsx
git commit -m "feat: add RejectWithReasonModal component with validation

- Combined confirmation + reason input modal
- Min 10 chars, max 500 chars validation
- Character counter
- Real-time validation feedback
- Disabled confirm until valid input"
```

---

### Task 2: Create PaginationControls Component

**Files:**
- Create: `src/features/marketplace/components/PaginationControls.tsx`
- Create: `src/features/marketplace/components/__tests__/PaginationControls.test.tsx`

- [ ] **Step 1: Write failing test for pagination rendering**

```typescript
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PaginationControls } from "../PaginationControls";

describe("PaginationControls", () => {
  it("renders page info correctly", () => {
    render(
      <PaginationControls
        currentPage={0}
        totalPages={5}
        totalElements={123}
        pageSize={25}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    );

    expect(screen.getByText(/showing 1-25 of 123/i)).toBeInTheDocument();
  });

  it("disables previous button on first page", () => {
    render(
      <PaginationControls
        currentPage={0}
        totalPages={5}
        totalElements={123}
        pageSize={25}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    );

    const prevButton = screen.getByRole("button", { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it("disables next button on last page", () => {
    render(
      <PaginationControls
        currentPage={4}
        totalPages={5}
        totalElements={123}
        pageSize={25}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    );

    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- PaginationControls.test.tsx`
Expected: FAIL with "PaginationControls not found"

- [ ] **Step 3: Create minimal component implementation**

```typescript
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
};

export function PaginationControls({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationControlsProps) {
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span>
          Showing {startItem}-{endItem} of {totalElements}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span>Items per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            aria-label="Next page"
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- PaginationControls.test.tsx`
Expected: PASS

- [ ] **Step 5: Add interaction tests**

Add to test file:

```typescript
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaginationControls } from "../PaginationControls";

describe("PaginationControls", () => {
  // ... existing tests ...

  it("calls onPageChange when next button clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        currentPage={0}
        totalPages={5}
        totalElements={123}
        pageSize={25}
        onPageChange={onPageChange}
        onPageSizeChange={vi.fn()}
      />
    );

    const nextButton = screen.getByRole("button", { name: /next/i });
    await user.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("calls onPageChange when previous button clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        currentPage={2}
        totalPages={5}
        totalElements={123}
        pageSize={25}
        onPageChange={onPageChange}
        onPageSizeChange={vi.fn()}
      />
    );

    const prevButton = screen.getByRole("button", { name: /previous/i });
    await user.click(prevButton);

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("calls onPageSizeChange when page size changed", async () => {
    const user = userEvent.setup();
    const onPageSizeChange = vi.fn();
    render(
      <PaginationControls
        currentPage={0}
        totalPages={5}
        totalElements={123}
        pageSize={25}
        onPageChange={vi.fn()}
        onPageSizeChange={onPageSizeChange}
      />
    );

    const select = screen.getByRole("combobox");
    await user.click(select);
    
    const option50 = screen.getByRole("option", { name: "50" });
    await user.click(option50);

    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });
});
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- PaginationControls.test.tsx`
Expected: All tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/features/marketplace/components/PaginationControls.tsx
git add src/features/marketplace/components/__tests__/PaginationControls.test.tsx
git commit -m "feat: add PaginationControls component

- Shows current page range and total items
- Previous/Next navigation with disabled states
- Page size selector (10, 25, 50, 100)
- Accessible with aria-labels"
```

---

### Task 3: Create ConfirmationDialog Component (Future Use)

**Files:**
- Create: `src/features/marketplace/components/ConfirmationDialog.tsx`

- [ ] **Step 1: Create simple confirmation dialog component**

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";

type ConfirmationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmButtonText?: string;
  confirmButtonVariant?: "default" | "destructive";
  isLoading?: boolean;
};

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmButtonText = "Confirm",
  confirmButtonVariant = "default",
  isLoading = false,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirmButtonVariant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/marketplace/components/ConfirmationDialog.tsx
git commit -m "feat: add ConfirmationDialog component for future use

Simple confirmation dialog without reason input.
Reserved for approve/verify flows if needed."
```

---

### Task 4: Export Components from Barrel File

**Files:**
- Create: `src/features/marketplace/components/index.ts`

- [ ] **Step 1: Create barrel export file**

```typescript
export { RejectWithReasonModal } from "./RejectWithReasonModal";
export { ConfirmationDialog } from "./ConfirmationDialog";
export { PaginationControls } from "./PaginationControls";
```

- [ ] **Step 2: Commit**

```bash
git add src/features/marketplace/components/index.ts
git commit -m "feat: add marketplace components barrel export"
```

---

### Task 5: Update API Types for Reason Fields

**Files:**
- Modify: `src/shared/api/marketplace/types.ts:342-353`

- [ ] **Step 1: Add statusReason to MarketplaceUpdateProductStatusRequest**

Update the type definition:

```typescript
export type MarketplaceUpdateProductStatusRequest = {
  status: MarketplaceProductStatus;
  statusReason?: string;
};
```

- [ ] **Step 2: Add reason to MarketplaceUpdateOrderStatusRequest**

Update the type definition:

```typescript
export type MarketplaceUpdateOrderStatusRequest = {
  status: MarketplaceOrderStatus;
  reason?: string;
};
```

Note: `MarketplaceUpdatePaymentVerificationRequest` already has `verificationNote?: string` field, no changes needed.

- [ ] **Step 3: Commit**

```bash
git add src/shared/api/marketplace/types.ts
git commit -m "feat: add optional reason fields to marketplace API types

- Add statusReason to MarketplaceUpdateProductStatusRequest
- Add reason to MarketplaceUpdateOrderStatusRequest
- Backward compatible (optional fields)"
```

---

### Task 6: Update Mock Adapter to Handle Reason Fields

**Files:**
- Modify: `src/shared/api/marketplace/mock-adapter.ts:1756-1810`

- [ ] **Step 1: Update updateAdminProductStatus to accept statusReason**

Find the `updateAdminProductStatus` method and update it to log the reason:

```typescript
async updateAdminProductStatus(productId: number, request: MarketplaceUpdateProductStatusRequest) {
  const product = this.products.find((p) => p.id === productId);
  if (!product) {
    throw new MarketplaceApiClientError("Product not found", "PRODUCT_NOT_FOUND", 404);
  }

  product.status = request.status;
  if (request.statusReason) {
    product.statusReason = request.statusReason;
  }
  product.updatedAt = new Date().toISOString();

  return okMarketplaceResponse(undefined);
}
```

- [ ] **Step 2: Update updateAdminOrderStatus to accept reason**

Find the `updateAdminOrderStatus` method and update it to log the reason:

```typescript
async updateAdminOrderStatus(orderId: number, request: MarketplaceUpdateOrderStatusRequest) {
  const order = this.orders.find((o) => o.id === orderId);
  if (!order) {
    throw new MarketplaceApiClientError("Order not found", "ORDER_NOT_FOUND", 404);
  }

  order.status = request.status;
  order.updatedAt = new Date().toISOString();

  // Add audit log entry with reason if provided
  if (request.reason) {
    this.orderAuditLogs.push({
      id: this.orderAuditLogs.length + 1,
      orderId,
      operation: `Status changed to ${request.status}`,
      performedBy: "Admin",
      performedAt: new Date().toISOString(),
      reason: request.reason,
    });
  }

  return okMarketplaceResponse(undefined);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/api/marketplace/mock-adapter.ts
git commit -m "feat: update mock adapter to handle reason fields

- Store statusReason in product updates
- Add audit log entries with reason for order updates"
```

---

### Task 7: Update AdminMarketplaceProductsPage with Modal and Pagination

**Files:**
- Modify: `src/features/marketplace/pages/AdminMarketplaceProductsPage.tsx:1-256`

- [ ] **Step 1: Add imports for new components**

Add to imports at top of file:

```typescript
import { RejectWithReasonModal, PaginationControls } from "../components";
```

- [ ] **Step 2: Add state management for pagination and modal**

Add state hooks after existing useState declarations:

```typescript
const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(25);
const [rejectModalState, setRejectModalState] = useState<{
  isOpen: boolean;
  productId: number | null;
  targetStatus: MarketplaceProductStatus | null;
}>({ isOpen: false, productId: null, targetStatus: null });
```

- [ ] **Step 3: Update query to use pagination state**

Replace the hardcoded query:

```typescript
const productsQuery = useMarketplaceAdminProducts({
  page,
  size: pageSize,
  q: search.trim() || undefined,
  status: status === "ALL" ? undefined : status,
});
```

- [ ] **Step 4: Add modal handlers**

Add before the return statement:

```typescript
const openRejectModal = (productId: number, targetStatus: MarketplaceProductStatus) => {
  setRejectModalState({ isOpen: true, productId, targetStatus });
};

const closeRejectModal = () => {
  setRejectModalState({ isOpen: false, productId: null, targetStatus: null });
};

const handleRejectConfirm = async (reason: string) => {
  if (!rejectModalState.productId || !rejectModalState.targetStatus) return;

  const mutation = useMarketplaceUpdateAdminProductStatusMutation(rejectModalState.productId);
  await mutation.mutateAsync({
    status: rejectModalState.targetStatus,
    statusReason: reason,
  });

  closeRejectModal();
};
```

- [ ] **Step 5: Update ModerationActions to use modal for reject/hide**

Replace the ModerationActions component to pass modal opener:

```typescript
function ModerationActions({
  productId,
  currentStatus,
  onOpenRejectModal,
}: {
  productId: number;
  currentStatus: MarketplaceProductStatus;
  onOpenRejectModal: (productId: number, targetStatus: MarketplaceProductStatus) => void;
}) {
  const mutation = useMarketplaceUpdateAdminProductStatusMutation(productId);
  
  const handleApprove = (status: MarketplaceProductStatus) => {
    mutation.mutate({ status });
  };

  const actions: Array<{
    status: MarketplaceProductStatus;
    label: string;
    icon: typeof Check;
    className: string;
    requiresReason: boolean;
  }> =
    currentStatus === "PENDING_REVIEW"
      ? [
          {
            status: "PUBLISHED",
            label: "Approve",
            icon: Check,
            className: "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700",
            requiresReason: false,
          },
          {
            status: "HIDDEN",
            label: "Hide",
            icon: X,
            className: "text-red-600 hover:bg-red-50 hover:text-red-700",
            requiresReason: true,
          },
        ]
      : currentStatus === "PUBLISHED"
        ? [
            {
              status: "HIDDEN",
              label: "Hide",
              icon: X,
              className: "text-red-600 hover:bg-red-50 hover:text-red-700",
              requiresReason: true,
            },
          ]
        : currentStatus === "HIDDEN"
          ? [
              {
                status: "PUBLISHED",
                label: "Publish",
                icon: Check,
                className: "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700",
                requiresReason: false,
              },
              {
                status: "PENDING_REVIEW",
                label: "Return to review",
                icon: RotateCcw,
                className: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                requiresReason: false,
              },
            ]
          : [
              {
                status: "PENDING_REVIEW",
                label: "Send to review",
                icon: RotateCcw,
                className: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                requiresReason: false,
              },
              {
                status: "HIDDEN",
                label: "Hide",
                icon: X,
                className: "text-red-600 hover:bg-red-50 hover:text-red-700",
                requiresReason: true,
              },
            ];

  return (
    <div className="flex flex-wrap justify-end gap-1">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Button
            key={action.status}
            type="button"
            variant="ghost"
            size="sm"
            className={action.className}
            disabled={mutation.isPending}
            onClick={() => {
              if (action.requiresReason) {
                onOpenRejectModal(productId, action.status);
              } else {
                handleApprove(action.status);
              }
            }}
          >
            <Icon size={14} />
            <span className="ml-1">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6: Add modal and pagination to JSX**

Add before the closing `</div>` of the main container:

```typescript
{/* Add after the table */}
{productsQuery.data && (
  <PaginationControls
    currentPage={page}
    totalPages={productsQuery.data.totalPages}
    totalElements={productsQuery.data.totalElements}
    pageSize={pageSize}
    onPageChange={setPage}
    onPageSizeChange={(newSize) => {
      setPageSize(newSize);
      setPage(0);
    }}
  />
)}

<RejectWithReasonModal
  isOpen={rejectModalState.isOpen}
  onClose={closeRejectModal}
  onConfirm={handleRejectConfirm}
  title={rejectModalState.targetStatus === "HIDDEN" ? "Hide Product" : "Reject Product"}
  description={
    rejectModalState.targetStatus === "HIDDEN"
      ? "This product will be hidden from the marketplace. The farmer will be notified."
      : "This product will be rejected. The farmer will be notified."
  }
  reasonLabel="Reason for action"
  reasonPlaceholder="Explain why this action is being taken..."
/>
```

- [ ] **Step 7: Update ModerationActions calls in table to pass modal opener**

Update the table row to pass the modal opener:

```typescript
<ModerationActions
  productId={product.id}
  currentStatus={product.status}
  onOpenRejectModal={openRejectModal}
/>
```

- [ ] **Step 8: Test manually**

Run: `npm run dev`
Navigate to admin marketplace products page
Verify:
- Pagination controls appear
- Page size selector works
- Previous/Next buttons work
- Hide button opens modal
- Modal requires 10+ char reason
- Approve button works without modal

- [ ] **Step 9: Commit**

```bash
git add src/features/marketplace/pages/AdminMarketplaceProductsPage.tsx
git commit -m "feat: add modal and pagination to AdminMarketplaceProductsPage

- Add RejectWithReasonModal for hide/reject actions
- Add PaginationControls with page size selector
- Approve actions work without modal
- Pagination state synced with query"
```

---

### Task 8: Update AdminMarketplaceOrdersPage with Modal and Pagination

**Files:**
- Modify: `src/features/marketplace/pages/AdminMarketplaceOrdersPage.tsx:1-269`

- [ ] **Step 1: Add imports for new components**

Add to imports at top of file:

```typescript
import { RejectWithReasonModal, PaginationControls } from "../components";
```

- [ ] **Step 2: Add state management for pagination and modals**

Add state hooks after existing useState declarations:

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

- [ ] **Step 3: Update query to use pagination state**

Replace the hardcoded query:

```typescript
const ordersQuery = useMarketplaceAdminOrders({
  page,
  size: pageSize,
  status: status === "ALL" ? undefined : status,
});
```

- [ ] **Step 4: Add modal handlers**

Add before the return statement:

```typescript
const openRejectPaymentModal = (orderId: number) => {
  setRejectPaymentModalState({ isOpen: true, orderId });
};

const closeRejectPaymentModal = () => {
  setRejectPaymentModalState({ isOpen: false, orderId: null });
};

const handleRejectPaymentConfirm = async (reason: string) => {
  if (!rejectPaymentModalState.orderId) return;

  await verifyMutation.mutateAsync({
    verificationStatus: "REJECTED",
    verificationNote: reason,
  });
  await Promise.all([selectedOrderQuery.refetch(), auditLogsQuery.refetch()]);

  closeRejectPaymentModal();
};

const openCancelOrderModal = (orderId: number) => {
  setCancelOrderModalState({ isOpen: true, orderId });
};

const closeCancelOrderModal = () => {
  setCancelOrderModalState({ isOpen: false, orderId: null });
};

const handleCancelOrderConfirm = async (reason: string) => {
  if (!cancelOrderModalState.orderId) return;

  await cancelMutation.mutateAsync({ status: "CANCELLED", reason });
  await Promise.all([selectedOrderQuery.refetch(), auditLogsQuery.refetch()]);

  closeCancelOrderModal();
};
```

- [ ] **Step 5: Remove inline verification note input and update buttons**

Replace the verification section in the order detail card:

```typescript
<div className="rounded-xl border border-gray-200 p-4">
  <p className="mb-3 text-sm font-medium text-gray-900">Payment verification</p>
  <div className="flex flex-wrap gap-2">
    <Button
      disabled={verifyMutation.isPending}
      onClick={async () => {
        await verifyMutation.mutateAsync({
          verificationStatus: "VERIFIED",
          verificationNote: "",
        });
        await Promise.all([selectedOrderQuery.refetch(), auditLogsQuery.refetch()]);
      }}
    >
      Mark verified
    </Button>
    <Button
      variant="outline"
      disabled={verifyMutation.isPending}
      onClick={() => openRejectPaymentModal(selectedOrder.id)}
    >
      Reject proof
    </Button>
    {selectedOrder.status !== "CANCELLED" ? (
      <Button
        variant="destructive"
        disabled={cancelMutation.isPending}
        onClick={() => openCancelOrderModal(selectedOrder.id)}
      >
        Cancel order
      </Button>
    ) : null}
  </div>
</div>
```

- [ ] **Step 6: Add modals and pagination to JSX**

Add before the closing `</div>` of the main container:

```typescript
{/* Add after the order list card */}
{ordersQuery.data && (
  <PaginationControls
    currentPage={page}
    totalPages={ordersQuery.data.totalPages}
    totalElements={ordersQuery.data.totalElements}
    pageSize={pageSize}
    onPageChange={setPage}
    onPageSizeChange={(newSize) => {
      setPageSize(newSize);
      setPage(0);
    }}
  />
)}

<RejectWithReasonModal
  isOpen={rejectPaymentModalState.isOpen}
  onClose={closeRejectPaymentModal}
  onConfirm={handleRejectPaymentConfirm}
  title="Reject Payment Proof"
  description="The buyer will be notified and may need to resubmit proof."
  reasonLabel="Reason for rejection"
  reasonPlaceholder="Explain why the payment proof is being rejected..."
  isLoading={verifyMutation.isPending}
/>

<RejectWithReasonModal
  isOpen={cancelOrderModalState.isOpen}
  onClose={closeCancelOrderModal}
  onConfirm={handleCancelOrderConfirm}
  title="Cancel Order"
  description="This order will be cancelled. The buyer and farmer will be notified."
  reasonLabel="Reason for cancellation"
  reasonPlaceholder="Explain why this order is being cancelled..."
  isLoading={cancelMutation.isPending}
/>
```

- [ ] **Step 7: Test manually**

Run: `npm run dev`
Navigate to admin marketplace orders page
Verify:
- Pagination controls appear
- Page size selector works
- Reject proof button opens modal
- Cancel order button opens modal
- Mark verified works without modal
- Modals require 10+ char reason

- [ ] **Step 8: Commit**

```bash
git add src/features/marketplace/pages/AdminMarketplaceOrdersPage.tsx
git commit -m "feat: add modals and pagination to AdminMarketplaceOrdersPage

- Add RejectWithReasonModal for reject proof and cancel order
- Add PaginationControls with page size selector
- Remove inline verification note input
- Mark verified works without modal"
```

---

### Task 9: Write Integration Tests for AdminMarketplaceProductsPage

**Files:**
- Create: `src/features/marketplace/pages/__tests__/AdminMarketplaceProductsPage.test.tsx`

- [ ] **Step 1: Create test file with basic rendering test**

```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminMarketplaceProductsPage } from "../AdminMarketplaceProductsPage";
import * as marketplaceHooks from "../../hooks/useMarketplaceQueries";

vi.mock("../../hooks/useMarketplaceQueries");

describe("AdminMarketplaceProductsPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AdminMarketplaceProductsPage />
      </QueryClientProvider>
    );
  };

  it("renders product list with moderation actions", async () => {
    vi.mocked(marketplaceHooks.useMarketplaceAdminProducts).mockReturnValue({
      data: {
        items: [
          {
            id: 1,
            name: "Test Product",
            status: "PENDING_REVIEW",
            price: 50000,
            imageUrl: "https://example.com/image.jpg",
            farmerDisplayName: "Farmer Name",
            farmName: "Farm Name",
            category: "Vegetables",
            traceable: true,
          },
        ],
        totalPages: 1,
        totalElements: 1,
        page: 0,
        size: 25,
      },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(marketplaceHooks.useMarketplaceUpdateAdminProductStatusMutation).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("Approve")).toBeInTheDocument();
      expect(screen.getByText("Hide")).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Add test for approve action (no modal)**

Add to test file:

```typescript
it("approve action calls mutation without modal", async () => {
  const user = userEvent.setup();
  const mutateAsync = vi.fn().mockResolvedValue({});

  vi.mocked(marketplaceHooks.useMarketplaceAdminProducts).mockReturnValue({
    data: {
      items: [
        {
          id: 1,
          name: "Test Product",
          status: "PENDING_REVIEW",
          price: 50000,
          imageUrl: "https://example.com/image.jpg",
          farmerDisplayName: "Farmer Name",
          farmName: "Farm Name",
          category: "Vegetables",
          traceable: true,
        },
      ],
      totalPages: 1,
      totalElements: 1,
      page: 0,
      size: 25,
    },
    isLoading: false,
    isError: false,
  } as any);

  vi.mocked(marketplaceHooks.useMarketplaceUpdateAdminProductStatusMutation).mockReturnValue({
    mutate: vi.fn((req) => mutateAsync(req)),
    mutateAsync,
    isPending: false,
  } as any);

  renderPage();

  const approveButton = await screen.findByRole("button", { name: /approve/i });
  await user.click(approveButton);

  expect(mutateAsync).toHaveBeenCalledWith({ status: "PUBLISHED" });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
```

- [ ] **Step 3: Add test for hide action (opens modal)**

Add to test file:

```typescript
it("hide action opens modal and requires reason", async () => {
  const user = userEvent.setup();
  const mutateAsync = vi.fn().mockResolvedValue({});

  vi.mocked(marketplaceHooks.useMarketplaceAdminProducts).mockReturnValue({
    data: {
      items: [
        {
          id: 1,
          name: "Test Product",
          status: "PENDING_REVIEW",
          price: 50000,
          imageUrl: "https://example.com/image.jpg",
          farmerDisplayName: "Farmer Name",
          farmName: "Farm Name",
          category: "Vegetables",
          traceable: true,
        },
      ],
      totalPages: 1,
      totalElements: 1,
      page: 0,
      size: 25,
    },
    isLoading: false,
    isError: false,
  } as any);

  vi.mocked(marketplaceHooks.useMarketplaceUpdateAdminProductStatusMutation).mockReturnValue({
    mutate: vi.fn(),
    mutateAsync,
    isPending: false,
  } as any);

  renderPage();

  const hideButton = await screen.findByRole("button", { name: /hide/i });
  await user.click(hideButton);

  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByText("Hide Product")).toBeInTheDocument();

  const confirmButton = screen.getByRole("button", { name: /confirm/i });
  expect(confirmButton).toBeDisabled();

  const textarea = screen.getByLabelText(/reason/i);
  await user.type(textarea, "Product images do not match description");

  expect(confirmButton).toBeEnabled();
  await user.click(confirmButton);

  await waitFor(() => {
    expect(mutateAsync).toHaveBeenCalledWith({
      status: "HIDDEN",
      statusReason: "Product images do not match description",
    });
  });
});
```

- [ ] **Step 4: Run tests**

Run: `npm test -- AdminMarketplaceProductsPage.test.tsx`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/marketplace/pages/__tests__/AdminMarketplaceProductsPage.test.tsx
git commit -m "test: add integration tests for AdminMarketplaceProductsPage

- Test approve action without modal
- Test hide action with modal and reason requirement
- Test modal validation"
```

---

### Task 10: Write Integration Tests for AdminMarketplaceOrdersPage

**Files:**
- Create: `src/features/marketplace/pages/__tests__/AdminMarketplaceOrdersPage.test.tsx`

- [ ] **Step 1: Create test file with basic rendering test**

```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AdminMarketplaceOrdersPage } from "../AdminMarketplaceOrdersPage";
import * as marketplaceHooks from "../../hooks/useMarketplaceQueries";

vi.mock("../../hooks/useMarketplaceQueries");

describe("AdminMarketplaceOrdersPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const renderPage = () => {
    return render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AdminMarketplaceOrdersPage />
        </QueryClientProvider>
      </MemoryRouter>
    );
  };

  it("renders order list", async () => {
    vi.mocked(marketplaceHooks.useMarketplaceAdminOrders).mockReturnValue({
      data: {
        items: [
          {
            id: 1,
            orderCode: "ORD-001",
            status: "PENDING",
            totalAmount: 100000,
            buyerUserId: 1,
            farmerUserId: 2,
            payment: {
              method: "BANK_TRANSFER",
              verificationStatus: "SUBMITTED",
            },
            createdAt: "2026-05-01T10:00:00Z",
          },
        ],
        totalPages: 1,
        totalElements: 1,
        page: 0,
        size: 25,
      },
      isLoading: false,
      isError: false,
    } as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("ORD-001")).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Add test for verify payment (no modal)**

Add to test file:

```typescript
it("verify payment calls mutation without modal", async () => {
  const user = userEvent.setup();
  const mutateAsync = vi.fn().mockResolvedValue({});

  vi.mocked(marketplaceHooks.useMarketplaceAdminOrders).mockReturnValue({
    data: {
      items: [
        {
          id: 1,
          orderCode: "ORD-001",
          status: "PENDING",
          totalAmount: 100000,
          buyerUserId: 1,
          farmerUserId: 2,
          payment: {
            method: "BANK_TRANSFER",
            verificationStatus: "SUBMITTED",
          },
          createdAt: "2026-05-01T10:00:00Z",
        },
      ],
      totalPages: 1,
      totalElements: 1,
      page: 0,
      size: 25,
    },
    isLoading: false,
    isError: false,
  } as any);

  vi.mocked(marketplaceHooks.useMarketplaceAdminOrderDetail).mockReturnValue({
    data: {
      id: 1,
      orderCode: "ORD-001",
      status: "PENDING",
      totalAmount: 100000,
      shippingRecipientName: "John Doe",
      shippingPhone: "0123456789",
      shippingAddressLine: "123 Main St",
      payment: {
        method: "BANK_TRANSFER",
        verificationStatus: "SUBMITTED",
        proofFileName: "proof.jpg",
      },
      items: [],
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  } as any);

  vi.mocked(marketplaceHooks.useMarketplaceUpdateAdminOrderPaymentVerificationMutation).mockReturnValue({
    mutateAsync,
    isPending: false,
  } as any);

  vi.mocked(marketplaceHooks.useMarketplaceAdminOrderAuditLogs).mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  } as any);

  renderPage();

  const orderButton = await screen.findByText("ORD-001");
  await user.click(orderButton);

  const verifyButton = await screen.findByRole("button", { name: /mark verified/i });
  await user.click(verifyButton);

  expect(mutateAsync).toHaveBeenCalledWith({
    verificationStatus: "VERIFIED",
    verificationNote: "",
  });
});
```

- [ ] **Step 3: Add test for reject payment (opens modal)**

Add to test file:

```typescript
it("reject payment opens modal and requires reason", async () => {
  const user = userEvent.setup();
  const mutateAsync = vi.fn().mockResolvedValue({});

  vi.mocked(marketplaceHooks.useMarketplaceAdminOrders).mockReturnValue({
    data: {
      items: [
        {
          id: 1,
          orderCode: "ORD-001",
          status: "PENDING",
          totalAmount: 100000,
          buyerUserId: 1,
          farmerUserId: 2,
          payment: {
            method: "BANK_TRANSFER",
            verificationStatus: "SUBMITTED",
          },
          createdAt: "2026-05-01T10:00:00Z",
        },
      ],
      totalPages: 1,
      totalElements: 1,
      page: 0,
      size: 25,
    },
    isLoading: false,
    isError: false,
  } as any);

  vi.mocked(marketplaceHooks.useMarketplaceAdminOrderDetail).mockReturnValue({
    data: {
      id: 1,
      orderCode: "ORD-001",
      status: "PENDING",
      totalAmount: 100000,
      shippingRecipientName: "John Doe",
      shippingPhone: "0123456789",
      shippingAddressLine: "123 Main St",
      payment: {
        method: "BANK_TRANSFER",
        verificationStatus: "SUBMITTED",
        proofFileName: "proof.jpg",
      },
      items: [],
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  } as any);

  vi.mocked(marketplaceHooks.useMarketplaceUpdateAdminOrderPaymentVerificationMutation).mockReturnValue({
    mutateAsync,
    isPending: false,
  } as any);

  vi.mocked(marketplaceHooks.useMarketplaceAdminOrderAuditLogs).mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  } as any);

  renderPage();

  const orderButton = await screen.findByText("ORD-001");
  await user.click(orderButton);

  const rejectButton = await screen.findByRole("button", { name: /reject proof/i });
  await user.click(rejectButton);

  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByText("Reject Payment Proof")).toBeInTheDocument();

  const textarea = screen.getByLabelText(/reason/i);
  await user.type(textarea, "Image is blurry and bank details are not visible");

  const confirmButton = screen.getByRole("button", { name: /confirm/i });
  await user.click(confirmButton);

  await waitFor(() => {
    expect(mutateAsync).toHaveBeenCalledWith({
      verificationStatus: "REJECTED",
      verificationNote: "Image is blurry and bank details are not visible",
    });
  });
});
```

- [ ] **Step 4: Run tests**

Run: `npm test -- AdminMarketplaceOrdersPage.test.tsx`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/marketplace/pages/__tests__/AdminMarketplaceOrdersPage.test.tsx
git commit -m "test: add integration tests for AdminMarketplaceOrdersPage

- Test verify payment without modal
- Test reject payment with modal and reason requirement
- Test modal validation"
```

---

### Task 11: Create E2E Test for Admin Role Guards

**Files:**
- Create: `tests/e2e/admin-marketplace-guards.spec.ts`

- [ ] **Step 1: Create E2E test directory if needed**

```bash
mkdir -p tests/e2e
```

- [ ] **Step 2: Create admin role guard test file**

```typescript
import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@acm.local";
const ADMIN_PASSWORD = "12345678";
const FARMER_EMAIL = "farmer@acm.local";
const FARMER_PASSWORD = "12345678";

test.describe("Admin Marketplace Role Guards", () => {
  test("admin user can access marketplace admin routes", async ({ page }) => {
    // Login as admin
    await page.goto("/signin");
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect after login
    await page.waitForURL(/\/admin/);

    // Navigate to marketplace dashboard
    await page.goto("/admin/marketplace-dashboard");
    await expect(page).toHaveURL("/admin/marketplace-dashboard");
    await expect(page.locator("h1")).toContainText("Marketplace dashboard");

    // Navigate to marketplace products
    await page.goto("/admin/marketplace-products");
    await expect(page).toHaveURL("/admin/marketplace-products");
    await expect(page.locator("h1")).toContainText("Moderate marketplace products");

    // Navigate to marketplace orders
    await page.goto("/admin/marketplace-orders");
    await expect(page).toHaveURL("/admin/marketplace-orders");
    await expect(page.locator("h1")).toContainText("Manage marketplace orders");
  });

  test("non-admin user cannot access marketplace admin routes", async ({ page }) => {
    // Login as farmer
    await page.goto("/signin");
    await page.fill('input[type="email"]', FARMER_EMAIL);
    await page.fill('input[type="password"]', FARMER_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect after login
    await page.waitForURL(/\/farmer/);

    // Attempt to navigate to admin marketplace routes
    await page.goto("/admin/marketplace-dashboard");
    
    // Should be redirected away from admin routes
    await expect(page).not.toHaveURL("/admin/marketplace-dashboard");
    
    // Should see unauthorized or redirect to appropriate page
    const url = page.url();
    expect(url).toMatch(/\/(signin|farmer|unauthorized)/);
  });

  test("unauthenticated user cannot access marketplace admin routes", async ({ page }) => {
    // Attempt to navigate to admin marketplace routes without login
    await page.goto("/admin/marketplace-products");
    
    // Should be redirected to signin
    await expect(page).toHaveURL(/\/signin/);
  });
});
```

- [ ] **Step 3: Run E2E test**

Run: `npx playwright test admin-marketplace-guards.spec.ts`
Expected: All tests PASS

Note: This assumes test accounts exist. If tests fail due to missing accounts, create them or update credentials.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/admin-marketplace-guards.spec.ts
git commit -m "test: add E2E tests for admin marketplace role guards

- Test admin user can access all marketplace admin routes
- Test non-admin user cannot access admin routes
- Test unauthenticated user redirected to signin"
```

---

### Task 12: Create E2E Test for Moderation Flows

**Files:**
- Create: `tests/e2e/admin-marketplace-moderation.spec.ts`

- [ ] **Step 1: Create moderation flow test file**

```typescript
import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@acm.local";
const ADMIN_PASSWORD = "12345678";

test.describe("Admin Marketplace Moderation", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/signin");
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);
  });

  test("complete product approval flow", async ({ page }) => {
    await page.goto("/admin/marketplace-products");

    // Filter to pending review
    await page.click('button:has-text("Pending review")');

    // Find first product and approve
    const approveButton = page.locator('button:has-text("Approve")').first();
    if (await approveButton.isVisible()) {
      await approveButton.click();

      // Should not show modal for approve
      await expect(page.locator('role=dialog')).not.toBeVisible();

      // Wait for success (product list refresh)
      await page.waitForTimeout(1000);
    }
  });

  test("complete product rejection flow with reason", async ({ page }) => {
    await page.goto("/admin/marketplace-products");

    // Filter to pending review
    await page.click('button:has-text("Pending review")');

    // Find first product and hide
    const hideButton = page.locator('button:has-text("Hide")').first();
    if (await hideButton.isVisible()) {
      await hideButton.click();

      // Modal should open
      await expect(page.locator('role=dialog')).toBeVisible();
      await expect(page.locator('text=Hide Product')).toBeVisible();

      // Confirm button should be disabled initially
      const confirmButton = page.locator('button:has-text("Confirm")');
      await expect(confirmButton).toBeDisabled();

      // Enter reason
      await page.fill('textarea[id="reason"]', "Product images do not match description");

      // Confirm button should be enabled
      await expect(confirmButton).toBeEnabled();

      // Submit
      await confirmButton.click();

      // Modal should close
      await expect(page.locator('role=dialog')).not.toBeVisible();
    }
  });

  test("pagination navigation works", async ({ page }) => {
    await page.goto("/admin/marketplace-products");

    // Check if pagination controls exist
    const paginationExists = await page.locator('text=/Showing \\d+-\\d+ of \\d+/').isVisible();
    
    if (paginationExists) {
      // Try to navigate to next page if not on last page
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        
        // Wait for page to update
        await page.waitForTimeout(500);
        
        // Previous button should now be enabled
        const prevButton = page.locator('button:has-text("Previous")');
        await expect(prevButton).toBeEnabled();
      }
    }
  });
});
```

- [ ] **Step 2: Run E2E test**

Run: `npx playwright test admin-marketplace-moderation.spec.ts`
Expected: All tests PASS

Note: Tests may need adjustment based on actual data availability in test environment.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/admin-marketplace-moderation.spec.ts
git commit -m "test: add E2E tests for admin marketplace moderation flows

- Test product approval flow (no modal)
- Test product rejection flow with reason modal
- Test pagination navigation"
```

---

### Task 13: Update CLAUDE.md Documentation

**Files:**
- Modify: `CLAUDE.md` (append to marketplace section)

- [ ] **Step 1: Add documentation for new components**

Append to the marketplace feature section in CLAUDE.md:

```markdown
## Admin Marketplace Components (Added 2026-05-02)

**Location:** `/src/features/marketplace/components/`

**RejectWithReasonModal:**
- Combined confirmation + reason input modal for destructive actions
- Used for: product hide/reject, payment rejection, order cancellation
- Validation: min 10 chars, max 500 chars
- Character counter with real-time feedback
- Props: isOpen, onClose, onConfirm, title, description, reasonLabel, reasonPlaceholder, confirmButtonText, isLoading

**PaginationControls:**
- Reusable pagination UI for admin list views
- Features: page info display, previous/next navigation, page size selector
- Default page sizes: 10, 25, 50, 100
- Props: currentPage, totalPages, totalElements, pageSize, onPageChange, onPageSizeChange, pageSizeOptions

**ConfirmationDialog:**
- Simple confirmation dialog (reserved for future use)
- For approve/verify actions if confirmation needed
- Props: isOpen, onClose, onConfirm, title, description, confirmButtonText, confirmButtonVariant, isLoading

**Usage Pattern:**
```typescript
// Reject with reason
const [modalState, setModalState] = useState({ isOpen: false, id: null });

<RejectWithReasonModal
  isOpen={modalState.isOpen}
  onClose={() => setModalState({ isOpen: false, id: null })}
  onConfirm={(reason) => handleReject(modalState.id, reason)}
  title="Hide Product"
  description="This product will be hidden from the marketplace."
  reasonLabel="Reason for hiding"
/>

// Pagination
<PaginationControls
  currentPage={page}
  totalPages={data.totalPages}
  totalElements={data.totalElements}
  pageSize={pageSize}
  onPageChange={setPage}
  onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
/>
```

**API Updates:**
- `MarketplaceUpdateProductStatusRequest` now accepts optional `statusReason` field
- `MarketplaceUpdateOrderStatusRequest` now accepts optional `reason` field
- Both fields are optional for backward compatibility but required in UI for reject actions
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document new admin marketplace components

- Add RejectWithReasonModal usage
- Add PaginationControls usage
- Document API type updates
- Add usage examples"
```

---

### Task 14: Final Integration Test and Cleanup

**Files:**
- All modified files

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All tests PASS

- [ ] **Step 2: Run E2E tests**

```bash
npx playwright test
```

Expected: All E2E tests PASS

- [ ] **Step 3: Manual testing checklist**

Run: `npm run dev`

Test AdminMarketplaceProductsPage:
- [ ] Navigate to /admin/marketplace-products
- [ ] Search for products
- [ ] Filter by status
- [ ] Click "Approve" - should work without modal
- [ ] Click "Hide" - should open modal
- [ ] Try submitting with short reason - should show error
- [ ] Enter valid reason and submit - should close modal and refresh
- [ ] Change page size - should update list
- [ ] Navigate to next/previous page - should work
- [ ] Verify pagination info is correct

Test AdminMarketplaceOrdersPage:
- [ ] Navigate to /admin/marketplace-orders
- [ ] Filter by status
- [ ] Select an order
- [ ] Click "Mark verified" - should work without modal
- [ ] Click "Reject proof" - should open modal
- [ ] Enter reason and submit - should close modal and refresh
- [ ] Click "Cancel order" - should open modal
- [ ] Enter reason and submit - should close modal and refresh
- [ ] Change page size - should update list
- [ ] Navigate pages - should work

- [ ] **Step 4: Create final commit**

```bash
git add -A
git commit -m "feat: complete admin marketplace UI audit implementation

Summary of changes:
- Add RejectWithReasonModal for destructive actions
- Add PaginationControls for list views
- Update AdminMarketplaceProductsPage with modals and pagination
- Update AdminMarketplaceOrdersPage with modals and pagination
- Add API type support for optional reason fields
- Add comprehensive test coverage (component, integration, E2E)
- Update documentation

All gaps from audit addressed:
✅ Mandatory rejection reasons (min 10 chars)
✅ Confirmation dialogs for destructive actions
✅ Proper pagination controls
✅ Admin role guard test coverage"
```

---

## Self-Review Checklist

**Spec Coverage:**
- ✅ RejectWithReasonModal component created
- ✅ PaginationControls component created
- ✅ ConfirmationDialog component created (future use)
- ✅ AdminMarketplaceProductsPage updated with modals and pagination
- ✅ AdminMarketplaceOrdersPage updated with modals and pagination
- ✅ API types updated for reason fields
- ✅ Mock adapter updated to handle reasons
- ✅ Component tests added
- ✅ Integration tests added
- ✅ E2E tests added
- ✅ Documentation updated

**No Placeholders:**
- All code blocks contain complete implementations
- All test cases have actual assertions
- All file paths are exact
- All commands have expected outputs

**Type Consistency:**
- RejectWithReasonModal props consistent across all uses
- PaginationControls props consistent across all uses
- API types match between definition and usage
- Modal state types consistent across pages

---

**End of Implementation Plan**

