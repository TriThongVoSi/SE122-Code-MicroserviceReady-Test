import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { Badge, Button, Card, CardContent, Input } from "@/shared/ui";
import { useMarketplaceAddToCart, useMarketplaceProducts } from "../hooks";
import { formatVnd } from "../lib/format";

export function ProductListPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const { isAuthenticated } = useAuth();
  const { addToCart, isAdding } = useMarketplaceAddToCart();

  const productsQuery = useMarketplaceProducts({
    q: search || undefined,
    category: category || undefined,
    page: 0,
    size: 24,
  });

  const products = productsQuery.data?.items ?? [];

  const categories = useMemo(() => {
    const values = products.map((item) => item.category).filter(Boolean);
    return Array.from(new Set(values)).sort();
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Product catalog</h1>

        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="pl-9"
            />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
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

                <p className="text-xs text-slate-500">{product.farmName ?? "Unknown farm"}</p>

                <div className="flex items-center justify-between">
                  <p className="font-semibold text-emerald-700">{formatVnd(product.price)}</p>
                  <p className="text-xs text-slate-500">Stock {product.stock}</p>
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
                      disabled={isAdding || product.stock <= 0}
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
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No matching product.
        </div>
      )}
    </div>
  );
}
