import { useState } from "react";
import type { MarketplaceProductStatus } from "@/shared/api";
import { Badge, Card, CardContent, CardHeader, CardTitle, Input } from "@/shared/ui";
import {
  useMarketplaceAdminProducts,
  useMarketplaceUpdateAdminProductStatusMutation,
} from "../hooks";
import { formatVnd } from "../lib/format";

const statusFilters: Array<{ value: "ALL" | MarketplaceProductStatus; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_REVIEW", label: "Pending review" },
  { value: "PUBLISHED", label: "Published" },
  { value: "HIDDEN", label: "Hidden" },
];

function statusVariant(status: MarketplaceProductStatus) {
  if (status === "PUBLISHED") return "success";
  if (status === "PENDING_REVIEW") return "warning";
  if (status === "HIDDEN") return "secondary";
  return "outline";
}

function ModerationActions({
  productId,
  currentStatus,
}: {
  productId: number;
  currentStatus: MarketplaceProductStatus;
}) {
  const mutation = useMarketplaceUpdateAdminProductStatusMutation(productId);
  const actions: MarketplaceProductStatus[] =
    currentStatus === "PENDING_REVIEW"
      ? ["PUBLISHED", "HIDDEN"]
      : currentStatus === "PUBLISHED"
        ? ["HIDDEN"]
        : currentStatus === "HIDDEN"
          ? ["PUBLISHED", "PENDING_REVIEW"]
          : ["PENDING_REVIEW", "HIDDEN"];

  const mutationError =
    mutation.isError && mutation.error instanceof Error
      ? mutation.error.message
      : null;

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-2">
        {actions.map((status) => (
          <button
            key={status}
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate({ status })}
            className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:border-slate-300"
          >
            {status}
          </button>
        ))}
      </div>
      {mutationError && (
        <p className="text-xs text-red-600">{mutationError}</p>
      )}
    </div>
  );
}

export function AdminMarketplaceProductsPage() {
  const [status, setStatus] = useState<"ALL" | MarketplaceProductStatus>("ALL");
  const [search, setSearch] = useState("");

  const productsQuery = useMarketplaceAdminProducts({
    page: 0,
    size: 100,
    q: search.trim() || undefined,
    status: status === "ALL" ? undefined : status,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Marketplace product moderation</h1>
        <p className="text-sm text-slate-500">Approve, hide, or move products back to review queue.</p>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Filters</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products or farmer..."
              className="max-w-sm"
            />
            {statusFilters.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  status === option.value
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {productsQuery.isLoading && <p className="text-sm text-slate-500">Loading products...</p>}
          {productsQuery.isError && <p className="text-sm text-red-600">Failed to load products.</p>}
          {!productsQuery.isLoading && !productsQuery.isError && (productsQuery.data?.items ?? []).length === 0 && (
            <p className="text-sm text-slate-500">No product found.</p>
          )}
          {(productsQuery.data?.items ?? []).map((product) => (
            <div key={product.id} className="space-y-2 rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-500">
                    Farmer #{product.farmerUserId} - Farm: {product.farmName ?? "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant(product.status)}>{product.status}</Badge>
                  <p className="text-sm font-semibold text-emerald-700">{formatVnd(product.price)}</p>
                </div>
              </div>
              <ModerationActions productId={product.id} currentStatus={product.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
