import { useMemo, useState } from "react";
import { ArrowLeft, Minus, Plus, ShieldCheck } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { Badge, Button, Card, CardContent } from "@/shared/ui";
import {
  useMarketplaceAddToCart,
  useMarketplaceProductDetail,
  useMarketplaceProductReviews,
  useMarketplaceTraceability,
} from "../hooks";
import { formatDateTime, formatVnd } from "../lib/format";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isAdding } = useMarketplaceAddToCart();

  const productQuery = useMarketplaceProductDetail(slug);
  const product = productQuery.data;

  const reviewsQuery = useMarketplaceProductReviews(product?.id, { page: 0, size: 5 });
  const traceabilityQuery = useMarketplaceTraceability(product?.traceable ? product.id : null);

  const canIncrease = useMemo(() => {
    if (!product) {
      return false;
    }
    return quantity < product.stock;
  }, [product, quantity]);

  const quantityValue = product ? Math.min(Math.max(quantity, 1), Math.max(product.stock, 1)) : quantity;

  if (productQuery.isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        Loading product detail...
      </div>
    );
  }

  if (productQuery.isError || !product) {
    return (
      <div className="space-y-3 rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
        <p>Product does not exist or is not published.</p>
        <Link to="/marketplace/products" className="text-emerald-700 hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        to="/marketplace/products"
        className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
      >
        <ArrowLeft size={15} /> Back to products
      </Link>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full min-h-72 w-full object-cover"
            referrerPolicy="no-referrer"
          />
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{product.category}</Badge>
              {product.traceable ? <Badge variant="info">Traceable</Badge> : null}
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{product.name}</h1>

            <p className="text-sm text-slate-600">{product.shortDescription}</p>

            <div className="flex items-center gap-4">
              <p className="text-2xl font-bold text-emerald-700">{formatVnd(product.price)}</p>
              <span className="text-sm text-slate-500">/{product.unit}</span>
            </div>

            <p className="text-sm text-slate-500">Stock: {product.stock}</p>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Quantity</span>
                <div className="flex items-center rounded-md border border-slate-300">
                  <button
                    type="button"
                    className="p-2 text-slate-600 hover:bg-slate-50"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">{quantityValue}</span>
                  <button
                    type="button"
                    className="p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!canIncrease}
                    onClick={() => setQuantity((prev) => prev + 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Guest mode: you can only view product information.
              </p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              {isAuthenticated ? (
                <>
                  <Button
                    disabled={isAdding || product.stock <= 0}
                    onClick={async () => {
                      await addToCart(product.id, quantity);
                    }}
                  >
                    Add to cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const mode = await addToCart(product.id, quantity);
                      if (mode === "server") {
                        navigate("/marketplace/cart");
                      }
                    }}
                  >
                    Buy now
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild>
                    <Link to="/sign-up">Create account to buy</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/sign-in">I already have an account</Link>
                  </Button>
                </>
              )}
              {product.traceable ? (
                <Link to={`/marketplace/traceability/${product.id}`}>
                  <Button variant="ghost" className="gap-2">
                    <ShieldCheck size={16} /> Traceability
                  </Button>
                </Link>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Description</h2>
            <p className="text-sm leading-6 text-slate-600">{product.description}</p>
            <p className="text-xs text-slate-500">Updated: {formatDateTime(product.updatedAt)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Product information</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Farm</p>
                <p className="text-sm font-medium text-slate-900">
                  {product.farmName ?? product.farmerDisplayName}
                </p>
              </div>
              <div className="rounded-md border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Region</p>
                <p className="text-sm font-medium text-slate-900">{product.region ?? "Updating"}</p>
              </div>
              <div className="rounded-md border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Season</p>
                <p className="text-sm font-medium text-slate-900">{product.seasonName ?? "Not linked"}</p>
              </div>
              <div className="rounded-md border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Lot</p>
                <p className="text-sm font-medium text-slate-900">
                  {product.lotId ? `#${product.lotId}` : "Not linked"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Recent reviews</h2>

            {reviewsQuery.isLoading ? (
              <p className="text-sm text-slate-500">Loading reviews...</p>
            ) : reviewsQuery.isError ? (
              <p className="text-sm text-red-600">Failed to load reviews.</p>
            ) : reviewsQuery.data && reviewsQuery.data.items.length > 0 ? (
              reviewsQuery.data.items.map((review) => (
                <div key={review.id} className="rounded-md border border-slate-200 p-3">
                  <p className="text-sm font-medium">{review.buyerDisplayName}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(review.createdAt)}</p>
                  <p className="mt-1 text-sm">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No review yet.</p>
            )}
          </CardContent>
        </Card>
      </section>

      {product.traceable ? (
        <section>
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Traceability chain</h2>

              {traceabilityQuery.isLoading ? (
                <p className="text-sm text-slate-500">Loading traceability...</p>
              ) : traceabilityQuery.isError ? (
                <p className="text-sm text-red-600">Failed to validate traceability chain.</p>
              ) : traceabilityQuery.data?.traceable ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">Farm</p>
                    <p className="text-sm font-medium">{traceabilityQuery.data.farm?.name}</p>
                    <p className="text-xs text-slate-500">{traceabilityQuery.data.farm?.region}</p>
                  </div>
                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">Season</p>
                    <p className="text-sm font-medium">{traceabilityQuery.data.season?.name}</p>
                    <p className="text-xs text-slate-500">
                      Planned harvest: {traceabilityQuery.data.season?.plannedHarvestDate ?? "N/A"}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">Lot</p>
                    <p className="text-sm font-medium">{traceabilityQuery.data.lot?.lotCode}</p>
                    <p className="text-xs text-slate-500">
                      Harvested: {traceabilityQuery.data.lot?.harvestedAt ?? "N/A"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Product is not traceable.</p>
              )}
            </CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
