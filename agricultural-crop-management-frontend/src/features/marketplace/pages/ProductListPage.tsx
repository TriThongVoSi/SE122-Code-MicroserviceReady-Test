import { useMemo } from "react";
import { PackageOpen, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { Badge, Button, Card, CardContent, Input } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { useMarketplaceAddToCart, useMarketplaceProducts } from "../hooks";
import { formatVnd } from "../lib/format";

function toPositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="h-44 w-full animate-pulse bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 flex-1 animate-pulse rounded-md bg-slate-200" />
          <div className="h-8 flex-1 animate-pulse rounded-md bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { addToCart, isAdding } = useMarketplaceAddToCart();

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const region = searchParams.get("region") ?? "";
  const sort = (searchParams.get("sort") as "newest" | "price_asc" | "price_desc" | null) ?? "newest";
  const page = toPositiveInt(searchParams.get("page"), 1);

  const productsQuery = useMarketplaceProducts({
    q: q || undefined,
    category: category || undefined,
    region: region || undefined,
    sort,
    page: page - 1,
    size: 24,
  });

  const products = productsQuery.data?.items ?? [];
  const totalPages = Math.max(productsQuery.data?.totalPages ?? 1, 1);

  const categories = useMemo(() => {
    const values = products.map((item) => item.category).filter(Boolean);
    return Array.from(new Set(values)).sort();
  }, [products]);

  const updateParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    if (!("page" in patch)) {
      next.set("page", "1");
    }
    setSearchParams(next);
  };

  const hasActiveFilters = q || category || region;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Product catalog</h1>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <Input
              value={q}
              onChange={(event) => updateParams({ q: event.target.value || null })}
              placeholder="Search products, farms, or descriptions..."
              className="pl-9"
            />
          </div>

          <select
            value={sort}
            onChange={(event) => updateParams({ sort: event.target.value || "newest" })}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>

          <Input
            value={region}
            onChange={(event) => updateParams({ region: event.target.value || null })}
            placeholder="Filter by region"
          />
        </div>

        {/* Category chips */}
        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateParams({ category: null })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                !category
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-emerald-400 hover:text-emerald-700",
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => updateParams({ category: cat === category ? null : cat })}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  category === cat
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-emerald-400 hover:text-emerald-700",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {productsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : productsQuery.isError ? (
        <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
          Failed to load product list from server.
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <Card key={product.id} className="group overflow-hidden transition-shadow hover:shadow-md">
                <div className="overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500">{product.category}</span>
                    {product.traceable ? <Badge variant="info">Traceable</Badge> : null}
                  </div>

                  <Link
                    to={`/marketplace/products/${product.slug}`}
                    className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-900 hover:text-emerald-700"
                  >
                    {product.name}
                  </Link>

                  <p className="text-xs text-slate-500">
                    {product.farmName ?? "Unknown farm"}
                    {product.region ? ` — ${product.region}` : ""}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-emerald-700">{formatVnd(product.price)}</p>
                    <p className="text-xs text-slate-500">Stock {product.availableQuantity}</p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/marketplace/products/${product.slug}`}
                      className="inline-flex h-9 flex-1 items-center justify-center rounded-md border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Detail
                    </Link>
                    {isAuthenticated ? (
                      <Button
                        size="sm"
                        className="flex-1 text-xs"
                        disabled={isAdding || product.availableQuantity <= 0}
                        onClick={async () => {
                          await addToCart(product.id, 1);
                        }}
                      >
                        Add cart
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline" className="flex-1 text-xs">
                        <Link to="/sign-up">Create account</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-sm text-slate-500">
              Page {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => updateParams({ page: String(page + 1) })}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <PackageOpen className="mb-3 text-slate-300" size={48} />
          <p className="text-base font-semibold text-slate-700">No matching products</p>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or search term.</p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => setSearchParams(new URLSearchParams())}
              className="mt-4 text-sm text-emerald-700 hover:underline"
            >
              Clear all filters
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
