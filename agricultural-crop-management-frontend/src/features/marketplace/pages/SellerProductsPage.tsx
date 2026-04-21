import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { MarketplaceProductStatus } from "@/shared/api";
import { Badge, Card, CardContent, CardHeader, CardTitle, Input } from "@/shared/ui";
import { useMarketplaceFarmerProducts } from "../hooks";
import { formatVnd } from "../lib/format";

const statusOptions: Array<{ value: "ALL" | MarketplaceProductStatus; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_REVIEW", label: "Pending review" },
  { value: "PUBLISHED", label: "Published" },
  { value: "HIDDEN", label: "Hidden" },
];

function statusBadge(status: MarketplaceProductStatus) {
  switch (status) {
    case "PUBLISHED":
      return "success";
    case "PENDING_REVIEW":
      return "warning";
    case "HIDDEN":
      return "secondary";
    default:
      return "outline";
  }
}

export function SellerProductsPage() {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Marketplace products</h1>
          <p className="text-sm text-slate-500">Create and update your marketplace catalog.</p>
        </div>
        <Link to="/farmer/marketplace-products/new" className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          New product
        </Link>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Filters</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or farm..."
              className="max-w-sm"
            />
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
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
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {productsQuery.isLoading && (
            <p className="text-sm text-slate-500">Loading products...</p>
          )}
          {productsQuery.isError && (
            <p className="text-sm text-red-600">Failed to load products.</p>
          )}
          {!productsQuery.isLoading && !productsQuery.isError && (productsQuery.data?.items ?? []).length === 0 && (
            <p className="text-sm text-slate-500">No product found.</p>
          )}
          {(productsQuery.data?.items ?? []).map((product) => (
            <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
              <div>
                <p className="font-semibold text-slate-900">{product.name}</p>
                <p className="text-sm text-slate-500">{product.farmName ?? "No farm linked"}</p>
                <p className="text-xs text-slate-500">Stock: {product.stock} {product.unit}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={statusBadge(product.status)}>{product.status}</Badge>
                <p className="min-w-24 text-right text-sm font-semibold text-emerald-700">{formatVnd(product.price)}</p>
                <Link to={`/farmer/marketplace-products/${product.id}`} className="text-sm text-slate-600 hover:underline">
                  View
                </Link>
                <Link to={`/farmer/marketplace-products/${product.id}/edit`} className="text-sm text-emerald-700 hover:underline">
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
