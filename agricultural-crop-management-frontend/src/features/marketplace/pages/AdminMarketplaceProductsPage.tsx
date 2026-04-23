import { useState } from "react";
import { Check, RotateCcw, Search, X } from "lucide-react";
import type { MarketplaceProductStatus } from "@/shared/api";
import { Badge, Button, Input } from "@/shared/ui";
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
  if (status === "PUBLISHED") return "success" as const;
  if (status === "PENDING_REVIEW") return "warning" as const;
  if (status === "HIDDEN") return "destructive" as const;
  return "secondary" as const;
}

function statusLabel(status: MarketplaceProductStatus) {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "PENDING_REVIEW":
      return "Pending review";
    case "PUBLISHED":
      return "Published";
    case "HIDDEN":
      return "Hidden";
    default:
      return status;
  }
}

function ModerationActions({
  productId,
  currentStatus,
}: {
  productId: number;
  currentStatus: MarketplaceProductStatus;
}) {
  const mutation = useMarketplaceUpdateAdminProductStatusMutation(productId);
  const actions: Array<{
    status: MarketplaceProductStatus;
    label: string;
    icon: typeof Check;
    className: string;
  }> =
    currentStatus === "PENDING_REVIEW"
      ? [
          {
            status: "PUBLISHED",
            label: "Approve",
            icon: Check,
            className: "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700",
          },
          {
            status: "HIDDEN",
            label: "Hide",
            icon: X,
            className: "text-red-600 hover:bg-red-50 hover:text-red-700",
          },
        ]
      : currentStatus === "PUBLISHED"
        ? [
            {
              status: "HIDDEN",
              label: "Hide",
              icon: X,
              className: "text-red-600 hover:bg-red-50 hover:text-red-700",
            },
          ]
        : currentStatus === "HIDDEN"
          ? [
              {
                status: "PUBLISHED",
                label: "Publish",
                icon: Check,
                className: "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700",
              },
              {
                status: "PENDING_REVIEW",
                label: "Return to review",
                icon: RotateCcw,
                className: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              },
            ]
          : [
              {
                status: "PENDING_REVIEW",
                label: "Send to review",
                icon: RotateCcw,
                className: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              },
              {
                status: "HIDDEN",
                label: "Hide",
                icon: X,
                className: "text-red-600 hover:bg-red-50 hover:text-red-700",
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
            onClick={() => mutation.mutate({ status: action.status })}
          >
            <Icon size={14} />
            <span className="ml-1">{action.label}</span>
          </Button>
        );
      })}
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
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-600">FarmTrace Admin</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">Moderate marketplace products</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Return to the older review-table layout while keeping current moderation mutations and filters.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product, farm, or seller..."
              className="h-11 rounded-xl border-gray-300 pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={status === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus(option.value)}
                className="rounded-full"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-sm text-gray-500">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Seller</th>
                <th className="p-4 font-medium">Traceability</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(productsQuery.data?.items ?? []).map((product) => (
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
                        <p className="truncate font-medium text-gray-900">{product.name}</p>
                        <p className="truncate text-xs text-gray-500">{product.category || "Uncategorized"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    <div>{product.farmerDisplayName}</div>
                    <div className="text-xs text-gray-400">{product.farmName ?? "Unknown farm"}</div>
                  </td>
                  <td className="p-4">
                    {product.traceable ? <Badge variant="success">Yes</Badge> : <Badge variant="secondary">No</Badge>}
                  </td>
                  <td className="p-4">
                    <Badge variant={statusVariant(product.status)}>{statusLabel(product.status)}</Badge>
                  </td>
                  <td className="p-4 font-medium text-gray-900">{formatVnd(product.price)}</td>
                  <td className="p-4 text-right">
                    <ModerationActions productId={product.id} currentStatus={product.status} />
                  </td>
                </tr>
              ))}
              {productsQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-gray-500">
                    Loading products...
                  </td>
                </tr>
              ) : null}
              {!productsQuery.isLoading && !productsQuery.isError && (productsQuery.data?.items ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-gray-500">
                    No products matched the current moderation filters.
                  </td>
                </tr>
              ) : null}
              {productsQuery.isError ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-red-600">
                    Failed to load admin marketplace products.
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
