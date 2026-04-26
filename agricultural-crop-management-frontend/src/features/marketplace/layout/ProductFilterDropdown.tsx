import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckSquare, Square } from "lucide-react";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui";
import { useMarketplaceCategories } from "../hooks";
import { getCategoryLabel } from "../lib/categoryLabels";

interface ProductFilterDropdownProps {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá thấp → cao" },
  { value: "price_desc", label: "Giá cao → thấp" },
] as const;

export function ProductFilterDropdown({ onMouseEnter, onMouseLeave, onClose }: ProductFilterDropdownProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [pendingCategory, setPendingCategory] = useState(searchParams.get("category") ?? "");
  const [pendingRegion, setPendingRegion] = useState(searchParams.get("region") ?? "");
  const [pendingTraceable, setPendingTraceable] = useState(searchParams.get("traceable") === "true");
  const [pendingSort, setPendingSort] = useState(
    (searchParams.get("sort") as "newest" | "price_asc" | "price_desc" | null) ?? "newest",
  );

  const categoriesQuery = useMarketplaceCategories(true);
  const categories = categoriesQuery.data ?? [];

  const hasChanges = pendingCategory || pendingRegion.trim() || pendingTraceable || pendingSort !== "newest";

  function handleReset() {
    setPendingCategory("");
    setPendingRegion("");
    setPendingTraceable(false);
    setPendingSort("newest");
  }

  function handleApply() {
    const params = new URLSearchParams();
    if (pendingCategory) params.set("category", pendingCategory);
    if (pendingRegion.trim()) params.set("region", pendingRegion.trim());
    if (pendingTraceable) params.set("traceable", "true");
    if (pendingSort !== "newest") params.set("sort", pendingSort);
    params.set("page", "1");
    navigate(`/marketplace/products?${params.toString()}`);
    onClose();
  }

  return (
    <div
      className="w-[720px] max-w-[calc(100vw-32px)] rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Bộ lọc sản phẩm</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            Tìm nông sản theo danh mục, khu vực và truy xuất nguồn gốc
          </p>
        </div>
        {hasChanges && (
          <button
            type="button"
            onClick={handleReset}
            className="shrink-0 text-sm font-medium text-gray-500 hover:text-gray-700 hover:underline"
          >
            Xóa lọc
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Category chips */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Danh mục</p>
          {categoriesQuery.isLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-gray-200" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPendingCategory("")}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                  !pendingCategory
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                )}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setPendingCategory(pendingCategory === cat ? "" : cat)}
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                    pendingCategory === cat
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  )}
                >
                  {getCategoryLabel(cat)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Region input */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Khu vực</p>
            <input
              type="text"
              value={pendingRegion}
              onChange={(e) => setPendingRegion(e.target.value)}
              placeholder="Ví dụ: Lâm Đồng, An Giang, Đồng Tháp..."
              className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Sort */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Sắp xếp</p>
            <select
              value={pendingSort}
              onChange={(e) => setPendingSort(e.target.value as typeof pendingSort)}
              className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition hover:border-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Traceability */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Truy xuất nguồn gốc</p>
          <label
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm transition-colors",
              pendingTraceable
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
            )}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={pendingTraceable}
              onChange={(e) => setPendingTraceable(e.target.checked)}
            />
            {pendingTraceable ? (
              <CheckSquare size={18} className="shrink-0 text-emerald-600" />
            ) : (
              <Square size={18} className="shrink-0 text-gray-400" />
            )}
            <div>
              <p className={cn("font-medium", pendingTraceable ? "text-emerald-700" : "text-gray-700")}>
                Chỉ sản phẩm có truy xuất
              </p>
              <p className="text-xs text-gray-500">Ưu tiên sản phẩm có mùa vụ và lô thu hoạch rõ ràng.</p>
            </div>
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <Link
          to="/marketplace/products"
          onClick={onClose}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 hover:underline"
        >
          Xem tất cả sản phẩm
        </Link>
        <Button onClick={handleApply} className="px-6">
          Áp dụng bộ lọc
        </Button>
      </div>
    </div>
  );
}
