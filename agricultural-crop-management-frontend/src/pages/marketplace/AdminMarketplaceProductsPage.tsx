import { useState } from "react";
import { Check, Eye, MoreVertical, Search, X } from "lucide-react";
import { toast } from "sonner";
import type {
  MarketplaceProductDetail,
  MarketplaceProductStatus,
  MarketplaceProductSummary,
} from "@/shared/api";
import {
  Badge,
  Button,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui";
import {
  AdminContentCard,
  AdminFilterCard,
  AdminHeaderCard,
  AdminPageContainer,
} from "@/features/admin/shared/ui";
import {
  useMarketplaceAdminProductDetail,
  useMarketplaceAdminProducts,
  useMarketplaceUpdateAdminProductStatusMutation,
} from "@/features/marketplace/hooks";
import { formatVnd } from "@/features/marketplace/lib/format";
import { RejectWithReasonModal, PaginationControls } from "@/features/marketplace/components";
import { useI18n } from "@/shared/lib/hooks/useI18n";

const statusFilters: Array<{ value: "ALL" | MarketplaceProductStatus; labelKey: string }> = [
  { value: "ALL", labelKey: "admin.marketplace.products.filters.all" },
  { value: "DRAFT", labelKey: "admin.marketplace.products.status.draft" },
  { value: "PENDING_REVIEW", labelKey: "admin.marketplace.products.status.pendingReview" },
  { value: "ACTIVE", labelKey: "admin.marketplace.products.status.active" },
  { value: "INACTIVE", labelKey: "admin.marketplace.products.status.inactive" },
  { value: "REJECTED", labelKey: "admin.marketplace.products.status.rejected" },
  { value: "SOLD_OUT", labelKey: "admin.marketplace.products.status.soldOut" },
];

function statusVariant(status: MarketplaceProductStatus) {
  if (status === "ACTIVE" || status === "PUBLISHED") return "success" as const;
  if (status === "PENDING_REVIEW") return "warning" as const;
  if (status === "INACTIVE" || status === "REJECTED" || status === "HIDDEN") return "destructive" as const;
  return "secondary" as const;
}

function statusLabel(status: MarketplaceProductStatus, t: ReturnType<typeof useI18n>["t"]) {
  switch (status) {
    case "DRAFT":
      return t("admin.marketplace.products.status.draft");
    case "PENDING_REVIEW":
      return t("admin.marketplace.products.status.pendingReview");
    case "ACTIVE":
      return t("admin.marketplace.products.status.active");
    case "INACTIVE":
      return t("admin.marketplace.products.status.inactive");
    case "REJECTED":
      return t("admin.marketplace.products.status.rejected");
    case "SOLD_OUT":
      return t("admin.marketplace.products.status.soldOut");
    case "PUBLISHED":
      return t("admin.marketplace.products.status.published");
    case "HIDDEN":
      return t("admin.marketplace.products.status.hidden");
    default:
      return status;
  }
}

function approvalBlockerLabel(blocker: string, t: ReturnType<typeof useI18n>["t"]) {
  const labels: Record<string, string> = {
    TRACEABILITY_DISABLED: t("admin.marketplace.products.blockers.traceabilityDisabled", "Chưa bật truy xuất nguồn gốc"),
    TRACEABILITY_CHAIN_INCOMPLETE: t("admin.marketplace.products.blockers.traceabilityIncomplete", "Thiếu nông trại, mùa vụ hoặc lô"),
    TRACEABILITY_CHAIN_INVALID: t("admin.marketplace.products.blockers.traceabilityInvalid", "Chuỗi truy xuất không khớp"),
    LOT_MISSING: t("admin.marketplace.products.blockers.lotMissing", "Chưa gắn lô thu hoạch"),
    LOT_NOT_IN_STOCK: t("admin.marketplace.products.blockers.lotNotInStock", "Lô không còn ở trạng thái trong kho"),
    LOT_STOCK_EMPTY: t("admin.marketplace.products.blockers.lotStockEmpty", "Lô đã hết tồn"),
    LISTING_STOCK_EMPTY: t("admin.marketplace.products.blockers.listingStockEmpty", "Số lượng đăng bán bằng 0"),
    AVAILABLE_STOCK_EMPTY: t("admin.marketplace.products.blockers.availableStockEmpty", "Không còn số lượng khả dụng"),
  };

  return labels[blocker] ?? blocker;
}

function moderationReason(product: MarketplaceProductSummary | MarketplaceProductDetail) {
  return product.statusReason ?? product.rejectionReason ?? null;
}

function ModerationActions({
  product,
  onOpenDetail,
  onOpenRejectModal,
}: {
  product: MarketplaceProductSummary;
  onOpenDetail: (productId: number) => void;
  onOpenRejectModal: (productId: number, targetStatus: MarketplaceProductStatus) => void;
}) {
  const { t } = useI18n();
  const mutation = useMarketplaceUpdateAdminProductStatusMutation(product.id);

  const handleApprove = (status: MarketplaceProductStatus) => {
    mutation.mutate({ status });
  };

  const actions: Array<{
    status: MarketplaceProductStatus;
    label: string;
    icon: typeof Check;
    className: string;
    requiresReason: boolean;
    disabled?: boolean;
  }> =
    product.status === "PENDING_REVIEW"
      ? [
          {
            status: "ACTIVE",
            label: t("admin.marketplace.products.actions.approve"),
            icon: Check,
            className: "text-primary hover:bg-emerald-50 hover:text-primary",
            requiresReason: false,
            disabled: product.approvalEligible === false,
          },
          {
            status: "REJECTED",
            label: t("admin.marketplace.products.actions.reject"),
            icon: X,
            className: "text-destructive hover:bg-red-50 hover:text-red-700",
            requiresReason: true,
          },
        ]
      : product.status === "ACTIVE" || product.status === "PUBLISHED"
        ? [
            {
              status: "REJECTED",
              label: t("admin.marketplace.products.actions.removeListing", "Gỡ listing"),
              icon: X,
              className: "text-destructive hover:bg-red-50 hover:text-red-700",
              requiresReason: true,
            },
          ]
        : [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-[14px]"
          disabled={mutation.isPending}
          aria-label={t("admin.marketplace.products.actions.productActions")}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={() => onOpenDetail(product.id)}>
          <Eye size={14} />
          <span>{t("admin.marketplace.products.actions.viewDetail", "Xem chi tiết")}</span>
        </DropdownMenuItem>
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <DropdownMenuItem
              key={action.status}
              className={action.className}
              disabled={mutation.isPending || action.disabled}
              onSelect={() => {
                if (action.requiresReason) {
                  onOpenRejectModal(product.id, action.status);
                } else {
                  handleApprove(action.status);
                }
              }}
            >
              <Icon size={14} />
              <span>{action.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AdminProductDetailSheet({
  product,
  isLoading,
  isError,
  onOpenRejectModal,
}: {
  product?: MarketplaceProductDetail;
  isLoading: boolean;
  isError: boolean;
  onOpenRejectModal: (productId: number, targetStatus: MarketplaceProductStatus) => void;
}) {
  const { t } = useI18n();
  const mutation = useMarketplaceUpdateAdminProductStatusMutation(product?.id ?? 0);

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {t("admin.marketplace.products.detail.loading", "Đang tải chi tiết sản phẩm...")}
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="p-4 text-sm text-destructive">
        {t("admin.marketplace.products.detail.loadError", "Không thể tải chi tiết sản phẩm.")}
      </div>
    );
  }

  const blockers = product.approvalBlockers ?? [];
  const reason = moderationReason(product);
  const canModeratePending = product.status === "PENDING_REVIEW";
  const canRemoveActive = product.status === "ACTIVE" || product.status === "PUBLISHED";

  return (
    <div className="space-y-5 px-4 pb-6">
      <div className="overflow-hidden rounded-lg border border-border bg-muted">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-52 w-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant(product.status)}>{statusLabel(product.status, t)}</Badge>
          {product.traceable ? (
            <Badge variant="success">{t("common.yes")}</Badge>
          ) : (
            <Badge variant="secondary">{t("common.no")}</Badge>
          )}
        </div>
        <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.shortDescription || "-"}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-card p-4 text-sm">
        <div>
          <p className="text-muted-foreground">{t("admin.marketplace.products.table.price")}</p>
          <p className="font-semibold text-foreground">{formatVnd(product.price)} / {product.unit}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("marketplaceSeller.table.stock", "Tồn kho")}</p>
          <p className="font-semibold text-foreground">{product.stockQuantity} {product.unit}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("marketplaceSeller.table.available", "Khả dụng")}</p>
          <p className="font-semibold text-foreground">{product.availableQuantity} {product.unit}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("admin.marketplace.products.table.seller")}</p>
          <p className="font-semibold text-foreground">{product.farmerDisplayName}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 text-sm">
        <p className="font-semibold text-foreground">{t("admin.marketplace.products.detail.traceability", "Truy xuất nguồn gốc")}</p>
        <div className="mt-3 space-y-2 text-muted-foreground">
          <p>{t("marketplaceSeller.productDetail.fields.farm", "Nông trại")}: <span className="font-medium text-foreground">{product.farmName ?? "-"}</span></p>
          <p>{t("marketplaceSeller.productDetail.fields.season", "Mùa vụ")}: <span className="font-medium text-foreground">{product.seasonName ?? "-"}</span></p>
          <p>{t("marketplaceSeller.productDetail.fields.lot", "Lô")}: <span className="font-medium text-foreground">{product.traceabilityCode ?? "-"}</span></p>
        </div>
      </div>

      {blockers.length > 0 ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">
            {t("admin.marketplace.products.detail.approvalBlocked", "Chưa đủ điều kiện phê duyệt")}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {blockers.map((blocker) => (
              <li key={blocker}>{approvalBlockerLabel(blocker, t)}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {reason ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <span className="font-semibold">{t("marketplaceSeller.table.adminReason", "Lý do từ quản trị")}:</span>{" "}
          {reason}
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
        {product.description || product.shortDescription || "-"}
      </div>

      {canModeratePending ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            className="flex-1"
            disabled={mutation.isPending || product.approvalEligible === false}
            onClick={() => mutation.mutate({ status: "ACTIVE" })}
          >
            <Check className="h-4 w-4" />
            {t("admin.marketplace.products.actions.approve")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
            disabled={mutation.isPending}
            onClick={() => onOpenRejectModal(product.id, "REJECTED")}
          >
            <X className="h-4 w-4" />
            {t("admin.marketplace.products.actions.reject")}
          </Button>
        </div>
      ) : null}

      {canRemoveActive ? (
        <Button
          type="button"
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive/10"
          disabled={mutation.isPending}
          onClick={() => onOpenRejectModal(product.id, "REJECTED")}
        >
          <X className="h-4 w-4" />
          {t("admin.marketplace.products.actions.removeListing", "Gỡ listing")}
        </Button>
      ) : null}
    </div>
  );
}

export function AdminMarketplaceProductsPage() {
  const { t } = useI18n();
  const [status, setStatus] = useState<"ALL" | MarketplaceProductStatus>("PENDING_REVIEW");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [rejectModalState, setRejectModalState] = useState<{
    isOpen: boolean;
    productId: number | null;
    targetStatus: MarketplaceProductStatus | null;
  }>({ isOpen: false, productId: null, targetStatus: null });

  const productsQuery = useMarketplaceAdminProducts({
    page,
    size: pageSize,
    q: search.trim() || undefined,
    status: status === "ALL" ? undefined : status,
  });
  const selectedProductQuery = useMarketplaceAdminProductDetail(selectedProductId ?? undefined);

  // Move mutation hook to component level to fix Rules of Hooks violation
  const rejectMutation = useMarketplaceUpdateAdminProductStatusMutation(
    rejectModalState.productId ?? 0
  );

  const openRejectModal = (productId: number, targetStatus: MarketplaceProductStatus) => {
    setRejectModalState({ isOpen: true, productId, targetStatus });
  };

  const closeRejectModal = () => {
    setRejectModalState({ isOpen: false, productId: null, targetStatus: null });
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectModalState.productId || !rejectModalState.targetStatus) return;

    try {
      await rejectMutation.mutateAsync({
        status: rejectModalState.targetStatus,
        statusReason: reason,
      });
      closeRejectModal();
    } catch {
      toast.error(t("admin.marketplace.products.toast.updateStatusFailed"));
      // Keep modal open on error so user can retry
    }
  };

  return (
    <AdminPageContainer>
      <AdminHeaderCard
        title={t("admin.marketplace.products.title")}
        description={t("admin.marketplace.products.description")}
        metadata={<span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{t("admin.marketplace.common.adminBadge")}</span>}
      />

      <AdminFilterCard>
        <CardContent className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("admin.marketplace.products.searchPlaceholder")}
              className="h-11 rounded-[14px] border-input pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={status === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setStatus(option.value);
                  setPage(0); // Reset page to 0 on filter change
                }}
                className="rounded-[14px]"
              >
                {t(option.labelKey)}
              </Button>
            ))}
          </div>
        </div>
        </CardContent>
      </AdminFilterCard>

      <AdminContentCard>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted text-sm text-muted-foreground">
                <th className="p-4 font-medium">{t("admin.marketplace.products.table.product")}</th>
                <th className="p-4 font-medium">{t("admin.marketplace.products.table.seller")}</th>
                <th className="p-4 font-medium">{t("admin.marketplace.products.table.traceability")}</th>
                <th className="p-4 font-medium">{t("admin.marketplace.products.table.status")}</th>
                <th className="p-4 font-medium">{t("admin.marketplace.products.table.price")}</th>
                <th className="p-4 text-right font-medium">{t("admin.marketplace.products.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(productsQuery.data?.items ?? []).map((product) => (
                <tr key={product.id} className="hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-11 w-11 rounded-lg bg-muted object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{product.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{product.category || t("admin.marketplace.products.fallback.uncategorized")}</p>
                        {product.status === "PENDING_REVIEW" && product.approvalEligible === false ? (
                          <p className="mt-1 text-xs font-medium text-amber-700">
                            {t("admin.marketplace.products.detail.approvalBlocked", "Chưa đủ điều kiện phê duyệt")}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    <div>{product.farmerDisplayName}</div>
                    <div className="text-xs text-muted-foreground/60">{product.farmName ?? t("admin.marketplace.products.fallback.unknownFarm")}</div>
                  </td>
                  <td className="p-4">
                    {product.traceable ? (
                      <Badge variant="success">{t("common.yes")}</Badge>
                    ) : (
                      <Badge variant="secondary">{t("common.no")}</Badge>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge variant={statusVariant(product.status)}>{statusLabel(product.status, t)}</Badge>
                  </td>
                  <td className="p-4 font-medium text-foreground">{formatVnd(product.price)}</td>
                  <td className="p-4 text-right">
                    <ModerationActions
                      product={product}
                      onOpenDetail={setSelectedProductId}
                      onOpenRejectModal={openRejectModal}
                    />
                  </td>
                </tr>
              ))}
              {productsQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                    {t("admin.marketplace.products.table.loading")}
                  </td>
                </tr>
              ) : null}
              {!productsQuery.isLoading && !productsQuery.isError && (productsQuery.data?.items ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                    {t("admin.marketplace.products.table.empty")}
                  </td>
                </tr>
              ) : null}
              {productsQuery.isError ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-destructive">
                    {t("admin.marketplace.products.table.loadError")}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </AdminContentCard>

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

      <Sheet
        open={selectedProductId != null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProductId(null);
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{t("admin.marketplace.products.detail.title", "Chi tiết sản phẩm")}</SheetTitle>
            <SheetDescription>
              {t("admin.marketplace.products.detail.description", "Xem đầy đủ thông tin listing trước khi kiểm duyệt.")}
            </SheetDescription>
          </SheetHeader>
          <AdminProductDetailSheet
            product={selectedProductQuery.data}
            isLoading={selectedProductQuery.isLoading}
            isError={selectedProductQuery.isError}
            onOpenRejectModal={openRejectModal}
          />
        </SheetContent>
      </Sheet>

      <RejectWithReasonModal
        isOpen={rejectModalState.isOpen}
        onClose={closeRejectModal}
        onConfirm={handleRejectConfirm}
        isLoading={rejectMutation.isPending}
        title={t("admin.marketplace.products.modal.rejectTitle")}
        description={t("admin.marketplace.products.modal.rejectDescription")}
        reasonLabel={t("admin.marketplace.products.modal.reasonLabel")}
        reasonPlaceholder={t("admin.marketplace.products.modal.reasonPlaceholder")}
      />
    </AdminPageContainer>
  );
}
