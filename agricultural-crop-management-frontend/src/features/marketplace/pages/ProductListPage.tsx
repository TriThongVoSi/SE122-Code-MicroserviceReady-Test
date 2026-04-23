import { useMemo } from "react";
import { Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { Badge, Button, Card, CardContent, Input } from "@/shared/ui";
import { useMarketplaceAddToCart, useMarketplaceProducts } from "../hooks";
import { formatVnd } from "../lib/format";

function toPositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
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
            value={category}
            onChange={(event) => updateParams({ category: event.target.value || null })}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

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
            className="md:col-span-2"
          />
        </div>
      </div>

      {productsQuery.isLoading ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Loading products...
        </div>
      ) : productsQuery.isError ? (
        <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
          Failed to load product list from server.
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-44 w-full object-cover"
                  referrerPolicy="no-referrer"
                />

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
                    {product.region ? ` - ${product.region}` : ""}
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
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No matching product.
        </div>
      )}
    </div>
  );
}
