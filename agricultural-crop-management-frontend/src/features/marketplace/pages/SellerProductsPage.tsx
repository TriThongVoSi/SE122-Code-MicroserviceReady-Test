import { useMemo, useState, type MouseEvent } from "react";
import { EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { MarketplaceProductStatus, MarketplaceProductSummary } from "@/shared/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";
import {
  useMarketplaceFarmerProducts,
  useMarketplaceUpdateFarmerProductStatusMutation,
} from "../hooks";
import { SellerMarketplaceTabs } from "../layout";
import { formatVnd } from "../lib/format";

const actionButtonClassName = "inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50";

function statusPillClass(status: MarketplaceProductStatus): string {
  switch (status) {
    case "PUBLISHED":
      return "bg-[#dcfce7] text-[#008236]";
    case "PENDING_REVIEW":
      return "bg-amber-100 text-amber-700";
    case "HIDDEN":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

function ProductRowActions({
  product,
  t,
}: {
  product: MarketplaceProductSummary;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const statusMutation = useMarketplaceUpdateFarmerProductStatusMutation(product.id);

  const handleSoftDeleteConfirm = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    statusMutation.mutate(
      { status: "HIDDEN" },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false);
        },
      },
    );
  };

  return (
    <div className="flex items-center justify-end gap-0.5">
      {/* Hide/Show toggle */}
      <button
        type="button"
        disabled={statusMutation.isPending}
        onClick={() =>
          statusMutation.mutate({
            status: product.status === "HIDDEN" ? "PUBLISHED" : "HIDDEN",
          })
        }
        className={actionButtonClassName}
        title={
          product.status === "HIDDEN"
            ? t("marketplaceSeller.products.actions.show")
            : t("marketplaceSeller.products.actions.hide")
        }
        aria-label={
          product.status === "HIDDEN"
            ? t("marketplaceSeller.products.actions.show")
            : t("marketplaceSeller.products.actions.hide")
        }
      >
        <EyeOff className="h-4 w-4" />
      </button>

      {/* Edit */}
      <Link
        to={`/farmer/marketplace-products/${product.id}/edit`}
        className={actionButtonClassName}
        title={t("marketplaceSeller.products.actions.edit")}
        aria-label={t("marketplaceSeller.products.actions.edit")}
      >
        <Pencil className="h-4 w-4" />
      </Link>

      {/* Delete (soft-delete) */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <button
          type="button"
          disabled={statusMutation.isPending || product.status === "HIDDEN"}
          onClick={() => setDeleteDialogOpen(true)}
          className={`${actionButtonClassName} text-red-400 hover:bg-red-50 hover:text-red-600`}
          title={t("marketplaceSeller.products.actions.delete")}
          aria-label={t("marketplaceSeller.products.actions.delete")}
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("marketplaceSeller.products.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("marketplaceSeller.products.deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={statusMutation.isPending}
              onClick={handleSoftDeleteConfirm}
            >
              {statusMutation.isPending ? t("common.processing") : t("marketplaceSeller.products.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function SellerProductsPage() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | MarketplaceProductStatus>("ALL");

  const query = useMemo(
    () => ({
      page: 0,
      size: 100,
      q: search.trim() || undefined,
      status: status === "ALL" ? undefined : status,
    }),
    [search, status],
  );
  const productsQuery = useMarketplaceFarmerProducts(query);
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";
  const products = productsQuery.data?.items ?? [];
  const statusOptions: Array<{ value: "ALL" | MarketplaceProductStatus; label: string }> = [
    { value: "ALL", label: t("marketplaceSeller.products.statusFilter.all") },
    { value: "DRAFT", label: t("marketplaceSeller.products.statusFilter.draft") },
    { value: "PENDING_REVIEW", label: t("marketplaceSeller.products.statusFilter.pendingReview") },
    { value: "PUBLISHED", label: t("marketplaceSeller.products.statusFilter.published") },
    { value: "HIDDEN", label: t("marketplaceSeller.products.statusFilter.hidden") },
  ];

  return (
    <div className="space-y-6">
      <SellerMarketplaceTabs />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{t("marketplaceSeller.products.title")}</h1>
        <Link
          to="/farmer/marketplace-products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          {t("marketplaceSeller.products.newProduct")}
        </Link>
      </div>

      {/* Search + Filter row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("marketplaceSeller.products.searchPlaceholder")}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                status === option.value
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products table */}
      <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
        {productsQuery.isLoading && (
          <div className="p-8 text-center text-sm text-slate-500">{t("marketplaceSeller.products.loading")}</div>
        )}
        {productsQuery.isError && (
          <div className="p-8 text-center text-sm text-red-600">{t("marketplaceSeller.products.error")}</div>
        )}
        {!productsQuery.isLoading && !productsQuery.isError && products.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">{t("marketplaceSeller.products.empty")}</div>
        )}

        {!productsQuery.isLoading && !productsQuery.isError && products.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("marketplaceSeller.products.table.product")}</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("marketplaceSeller.products.table.category")}</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("marketplaceSeller.products.table.price")}</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("marketplaceSeller.products.table.stock")}</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("marketplaceSeller.products.table.status")}</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{t("marketplaceSeller.products.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-[10px] bg-slate-100">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-slate-400">
                            {product.name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{product.category}</TableCell>
                  <TableCell className="text-sm font-medium text-emerald-600">
                    {formatVnd(product.price, locale)}/{product.unit}
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">{product.stock}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusPillClass(product.status)}`}>
                      {t(`marketplaceSeller.status.product.${product.status}`)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ProductRowActions product={product} t={t} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
