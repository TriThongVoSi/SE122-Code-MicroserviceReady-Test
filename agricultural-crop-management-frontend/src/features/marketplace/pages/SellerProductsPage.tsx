import { useMemo, useState } from "react";
import { Edit, Eye, EyeOff, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import type { MarketplaceProductStatus, MarketplaceProductSummary } from "@/shared/api";
import { Badge, Button, Input } from "@/shared/ui";
import {
  useMarketplaceFarmerProducts,
  useMarketplaceUpdateFarmerProductStatusMutation,
} from "../hooks";
import { SellerMarketplaceTabs } from "../layout";
import { formatDateTime, formatVnd } from "../lib/format";
import {
  getNextSellerProductStatusAction,
  getNextSellerProductStatusLabel,
} from "../lib/sellerProductStatus";

function statusVariant(status: MarketplaceProductStatus) {
  switch (status) {
    case "PUBLISHED":
      return "success" as const;
    case "PENDING_REVIEW":
      return "warning" as const;
    case "HIDDEN":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

function statusLabel(status: MarketplaceProductStatus) {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "PENDING_REVIEW":
      return "Pending approval";
    case "PUBLISHED":
      return "Approved";
    case "HIDDEN":
      return "Rejected / Hidden";
    default:
      return status;
  }
}

function moderationReason(product: MarketplaceProductSummary) {
  return product.rejectionReason ?? product.statusReason ?? null;
}

function ProductActions({ product }: { product: MarketplaceProductSummary }) {
  const mutation = useMarketplaceUpdateFarmerProductStatusMutation(product.id);
  const nextAction = getNextSellerProductStatusAction(product.status);

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        disabled={mutation.isPending || !nextAction}
        title={getNextSellerProductStatusLabel(product.status)}
        onClick={() => {
          if (nextAction) {
            mutation.mutate(nextAction);
          }
        }}
      >
        {product.status === "PUBLISHED" ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
      <Link to={`/farmer/marketplace-products/${product.id}/edit`}>
        <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 hover:text-blue-800">
          <Edit size={16} />
        </Button>
      </Link>
    </div>
  );
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
  const products = productsQuery.data?.items ?? [];

  return (
    <div className="min-h-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SellerMarketplaceTabs />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-600">FarmTrace Seller Portal</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Manage products</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Restore the original seller table rhythm while keeping the current listing,
            moderation, and stock workflows.
          </p>
        </div>
        <Link to="/farmer/marketplace-products/new">
          <Button className="flex items-center gap-2 rounded-full px-5">
            <Plus size={16} /> Add product
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search your listings..."
              className="h-11 rounded-xl border-gray-300 pl-10"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <select
            className="h-11 rounded-xl border border-gray-300 px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            value={status}
            onChange={(event) => setStatus(event.target.value as "ALL" | MarketplaceProductStatus)}
          >
            <option value="ALL">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_REVIEW">Pending review</option>
            <option value="PUBLISHED">Published</option>
            <option value="HIDDEN">Hidden</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-sm text-gray-500">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Updated</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-11 w-11 rounded-lg bg-gray-100 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/farmer/marketplace-products/${product.id}`}
                          className="block truncate font-medium text-gray-900 hover:text-emerald-600"
                        >
                          {product.name}
                        </Link>
                        <p className="truncate text-xs text-gray-500">{product.shortDescription}</p>
                        {moderationReason(product) ? (
                          <p className="mt-1 text-xs font-medium text-red-600">
                            Admin reason: {moderationReason(product)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{product.category || "-"}</td>
                  <td className="p-4 font-medium text-gray-900">
                    {formatVnd(product.price)}/{product.unit}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    <div>{product.stockQuantity} {product.unit}</div>
                    <div className="text-xs text-gray-400">
                      Available: {product.availableQuantity} {product.unit}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={statusVariant(product.status)}>{statusLabel(product.status)}</Badge>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{formatDateTime(product.updatedAt)}</td>
                  <td className="p-4 text-right">
                    <ProductActions product={product} />
                  </td>
                </tr>
              ))}
              {productsQuery.isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-gray-500">
                    Loading products...
                  </td>
                </tr>
              ) : null}
              {!productsQuery.isLoading && !productsQuery.isError && products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-gray-500">
                    No products matched your current filters.
                  </td>
                </tr>
              ) : null}
              {productsQuery.isError ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-red-600">
                    Failed to load seller products.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
