import { ArrowRight, Leaf, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Card, CardContent } from "@/shared/ui";
import { useMarketplaceFarms, useMarketplaceProducts } from "../hooks";
import { formatVnd } from "../lib/format";

export function MarketHomePage() {
  const productsQuery = useMarketplaceProducts({ page: 0, size: 4 });
  const farmsQuery = useMarketplaceFarms({ page: 0, size: 3 });

  const featuredProducts = productsQuery.data?.items ?? [];
  const featuredFarms = farmsQuery.data?.items ?? [];

  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-100 via-lime-50 to-white p-8 sm:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <Badge variant="success" className="mb-3">
              Integrated with ACM core
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Seasonal agriculture marketplace
            </h1>
            <p className="mt-4 max-w-xl text-slate-600">
              Browse products connected to real farm, season and lot chain from ACM backend.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/marketplace/products" className="inline-flex">
                <span className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                  Shop now <ArrowRight size={14} />
                </span>
              </Link>
              <Link to="/marketplace/traceability" className="inline-flex">
                <span className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
                  Traceability lookup
                </span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4 text-center">
                <ShieldCheck className="mx-auto mb-2 text-emerald-600" size={22} />
                <p className="text-sm font-semibold">Clear traceability chain</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Leaf className="mx-auto mb-2 text-emerald-600" size={22} />
                <p className="text-sm font-semibold">Season-linked products</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Truck className="mx-auto mb-2 text-emerald-600" size={22} />
                <p className="text-sm font-semibold">Split order support</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Featured products</h2>
          <Link to="/marketplace/products" className="text-sm text-emerald-700 hover:underline">
            View all
          </Link>
        </div>

        {productsQuery.isLoading ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Loading products...
          </div>
        ) : productsQuery.isError ? (
          <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
            Failed to load products.
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-44 w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <CardContent className="space-y-2 p-4">
                  <p className="text-xs text-slate-500">{product.category}</p>
                  <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-900">
                    {product.name}
                  </h3>
                  <p className="text-sm text-emerald-700">{formatVnd(product.price)}</p>
                  <Link
                    to={`/marketplace/products/${product.slug}`}
                    className="text-xs text-emerald-700 hover:underline"
                  >
                    View detail
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No product is published yet.
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Participating farms</h2>
          <Link to="/marketplace/farms" className="text-sm text-emerald-700 hover:underline">
            Farm list
          </Link>
        </div>

        {farmsQuery.isLoading ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Loading farms...
          </div>
        ) : farmsQuery.isError ? (
          <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
            Failed to load farms.
          </div>
        ) : featuredFarms.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {featuredFarms.map((farm) => (
              <Card key={farm.id}>
                <CardContent className="space-y-2 p-5">
                  <h3 className="text-base font-semibold text-slate-900">{farm.name}</h3>
                  <p className="text-sm text-slate-600">{farm.region ?? "N/A"}</p>
                  <p className="text-sm text-slate-500">{farm.productCount} products</p>
                  <Link
                    to={`/marketplace/farms/${farm.id}`}
                    className="text-xs text-emerald-700 hover:underline"
                  >
                    View farm
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No farm available.
          </div>
        )}
      </section>
    </div>
  );
}
