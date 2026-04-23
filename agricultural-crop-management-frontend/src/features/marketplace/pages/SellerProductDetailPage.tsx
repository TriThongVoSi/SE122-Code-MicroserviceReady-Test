import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Eye, EyeOff, Package } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import type { MarketplaceProductStatus } from "@/shared/api";
import {
  useMarketplaceFarmerProductDetail,
  useMarketplaceUpdateFarmerProductStatusMutation,
} from "../hooks";
import { formatVnd } from "../lib/format";
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

function statusLabel(status: MarketplaceProductStatus): string {
  switch (status) {
    case "PUBLISHED":
      return "Published";
    case "PENDING_REVIEW":
      return "Pending Review";
    case "HIDDEN":
      return "Hidden";
    case "DRAFT":
      return "Draft";
    default:
      return status;
  }
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="shrink-0 text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}

export function SellerProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id ?? 0);

  const productQuery = useMarketplaceFarmerProductDetail(productId);
  const product = productQuery.data;
  const statusMutation = useMarketplaceUpdateFarmerProductStatusMutation(productId);

  async function handleStatusTransition() {
    if (!product) {
      return;
    }

    const nextAction = getNextSellerProductStatusAction(product.status);
    if (!nextAction) {
      return;
    }

    try {
      await statusMutation.mutateAsync(nextAction);
    } catch {
      // Query layer handles error presentation elsewhere.
    }
  }

  if (productQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  if (productQuery.isError || !product) {
    return (
      <div className="py-12 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" />
        <h2 className="mb-2 text-xl font-bold text-slate-900">Product not found</h2>
        <p className="mb-6 text-sm text-slate-500">
          This product does not exist or is not available in your seller account.
        </p>
        <Link to="/farmer/marketplace-products">
          <Button>Back to products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/farmer/marketplace-products")}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Marketplace listing detail</h1>
            <p className="text-sm text-slate-500">
              Review the harvest link, available quantity, and seller status before publishing changes.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStatusTransition}
            disabled={statusMutation.isPending}
            className="gap-2"
          >
            {product.status === "PUBLISHED" ? <EyeOff size={14} /> : <Eye size={14} />}
            {statusMutation.isPending
              ? "Updating..."
              : getNextSellerProductStatusLabel(product.status)}
          </Button>
          <Link to={`/farmer/marketplace-products/${product.id}/edit`}>
            <Button size="sm" className="gap-2">
              <Edit size={14} /> Edit
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{product.name}</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Listing ID: {product.id}</p>
          </div>
          <Badge variant={statusVariant(product.status)}>{statusLabel(product.status)}</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Image</h3>
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-56 w-full rounded-lg border border-slate-200 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-56 w-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
                  No image available
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="mb-1 text-sm font-semibold text-slate-900">Listing information</h3>
                <div className="divide-y divide-slate-100 rounded-lg bg-slate-50 px-4">
                  <DetailRow label="Category" value={product.category || "-"} />
                  <DetailRow
                    label="Price"
                    value={
                      <span className="font-semibold text-emerald-600">
                        {formatVnd(product.price)} / {product.unit}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Listed quantity"
                    value={`${product.stockQuantity} ${product.unit}`}
                  />
                  <DetailRow
                    label="Available to sell"
                    value={`${product.availableQuantity} ${product.unit}`}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-1 text-sm font-semibold text-slate-900">Harvest link</h3>
                <div className="divide-y divide-emerald-100 rounded-lg border border-emerald-100 bg-emerald-50 px-4">
                  <DetailRow label="Farm" value={product.farmName || "Not linked"} />
                  <DetailRow label="Season" value={product.seasonName || "Not linked"} />
                  <DetailRow label="Lot" value={product.traceabilityCode || "Not linked"} />
                  <DetailRow label="Traceable" value={product.traceable ? "Yes" : "No"} />
                </div>
              </div>
            </div>
          </div>

          {(product.shortDescription || product.description) && (
            <div className="mt-6 border-t border-slate-100 pt-6">
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Description</h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {product.description || product.shortDescription}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
