import { useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Minus, Plus, ShieldCheck } from "lucide-react";
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

function StarRating({ rating }: { rating?: number }) {
  const score = Math.min(Math.max(Math.round(rating ?? 5), 1), 5);
  return (
    <div className="flex items-center gap-0.5 text-base">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < score ? "text-amber-400" : "text-slate-200"}>
          ★
        </span>
      ))}
    </div>
  );
}

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
    if (!product) return false;
    return quantity < product.availableQuantity;
  }, [product, quantity]);

  const quantityValue = product
    ? Math.min(Math.max(quantity, 1), Math.max(product.availableQuantity, 1))
    : quantity;

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

            <p className="text-sm text-slate-500">
              Stock:{" "}
              <span className={product.availableQuantity <= 10 ? "font-semibold text-red-600" : "text-slate-700"}>
                {product.availableQuantity}
              </span>
            </p>

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
                    disabled={isAdding || product.availableQuantity <= 0}
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
              <div className="space-y-3">
                {reviewsQuery.data.items.map((review) => (
                  <div key={review.id} className="rounded-md border border-slate-200 p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">{review.buyerDisplayName}</p>
                      <StarRating rating={(review as { rating?: number }).rating} />
                    </div>
                    <p className="text-xs text-slate-400">{formatDateTime(review.createdAt)}</p>
                    <p className="mt-1.5 text-sm text-slate-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No review yet.</p>
            )}
          </CardContent>
        </Card>
      </section>

      {product.traceable ? (
        <section>
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Traceability chain</h2>

              {traceabilityQuery.isLoading ? (
                <p className="text-sm text-slate-500">Loading traceability...</p>
              ) : traceabilityQuery.isError ? (
                <p className="text-sm text-red-600">Failed to validate traceability chain.</p>
              ) : traceabilityQuery.data?.traceable ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                  {/* Farm step */}
                  <div className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                        1
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Farm</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{traceabilityQuery.data.farm?.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{traceabilityQuery.data.farm?.region}</p>
                  </div>

                  <div className="flex items-center justify-center text-slate-300">
                    <ChevronRight size={24} className="hidden sm:block" />
                    <div className="h-px w-full bg-slate-200 sm:hidden" />
                  </div>

                  {/* Season step */}
                  <div className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                        2
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Season</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{traceabilityQuery.data.season?.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Harvest: {traceabilityQuery.data.season?.plannedHarvestDate ?? "N/A"}
                    </p>
                  </div>

                  <div className="flex items-center justify-center text-slate-300">
                    <ChevronRight size={24} className="hidden sm:block" />
                    <div className="h-px w-full bg-slate-200 sm:hidden" />
                  </div>

                  {/* Lot step */}
                  <div className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                        3
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Lot</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{traceabilityQuery.data.lot?.lotCode}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
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
