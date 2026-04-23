import { ArrowRight, Leaf, MapPin, Package, ShieldCheck, Truck, Wheat } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Card, CardContent } from "@/shared/ui";
import { useMarketplaceFarms, useMarketplaceProducts } from "../hooks";
import { formatVnd } from "../lib/format";

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="h-44 w-full animate-pulse bg-slate-200" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

function FarmCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
      <div className="flex justify-between">
        <div className="h-5 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

export function MarketHomePage() {
  const productsQuery = useMarketplaceProducts({ page: 0, size: 4 });
  const farmsQuery = useMarketplaceFarms({ page: 0, size: 3 });

  const featuredProducts = productsQuery.data?.items ?? [];
  const featuredFarms = farmsQuery.data?.items ?? [];
  const totalFarms = farmsQuery.data?.totalElements ?? farmsQuery.data?.items?.length ?? 0;
  const totalProducts = productsQuery.data?.totalElements ?? productsQuery.data?.items?.length ?? 0;

  return (
    <div className="space-y-12">
      {/* Hero */}
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

          {/* Stats + feature blocks */}
          <div className="relative overflow-hidden rounded-2xl bg-emerald-600 p-6 text-white">
            <Wheat size={120} className="absolute -right-4 -top-4 opacity-10" />
            <div className="relative mb-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-2xl font-bold">{totalFarms || "—"}</p>
                <p className="text-xs text-emerald-100">Farms</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-2xl font-bold">{totalProducts || "—"}</p>
                <p className="text-xs text-emerald-100">Products</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-emerald-100">Traceable</p>
              </div>
            </div>
            <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-lg bg-white/10 p-3">
                <ShieldCheck size={16} className="shrink-0" />
                <p className="text-xs font-medium">Clear traceability chain</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/10 p-3">
                <Leaf size={16} className="shrink-0" />
                <p className="text-xs font-medium">Season-linked products</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/10 p-3">
                <Truck size={16} className="shrink-0" />
                <p className="text-xs font-medium">Split order support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Featured products</h2>
          <Link to="/marketplace/products" className="text-sm text-emerald-700 hover:underline">
            View all
          </Link>
        </div>

        {productsQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : productsQuery.isError ? (
          <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
            Failed to load products.
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group overflow-hidden transition-shadow hover:shadow-md">
                <div className="overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <CardContent className="space-y-2 p-4">
                  <p className="text-xs text-slate-500">{product.category}</p>
                  <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-900">
                    {product.name}
                  </h3>
                  <p className="text-sm font-medium text-emerald-700">{formatVnd(product.price)}</p>
                  <Link
                    to={`/marketplace/products/${product.slug}`}
                    className="text-xs text-emerald-700 hover:underline"
                  >
                    View detail →
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

      {/* How it works */}
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-center text-2xl font-semibold text-slate-900">How it works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: "1",
              icon: Package,
              title: "Farmers list crops",
              desc: "Farmers link products to real harvest lots from the ACM platform.",
            },
            {
              step: "2",
              icon: ShieldCheck,
              title: "Admin verifies",
              desc: "Products are reviewed for quality standards before going live.",
            },
            {
              step: "3",
              icon: Truck,
              title: "Buy & trace",
              desc: "Buyers purchase with full farm-to-table traceability built in.",
            },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Icon size={22} />
              </div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-emerald-600">
                Step {step}
              </p>
              <h3 className="mb-2 text-base font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Participating farms */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Participating farms</h2>
          <Link to="/marketplace/farms" className="text-sm text-emerald-700 hover:underline">
            Farm list
          </Link>
        </div>

        {farmsQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => <FarmCardSkeleton key={i} />)}
          </div>
        ) : farmsQuery.isError ? (
          <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
            Failed to load farms.
          </div>
        ) : featuredFarms.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {featuredFarms.map((farm) => (
              <Card key={farm.id} className="overflow-hidden transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <Wheat size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-slate-900">
                        {farm.name}
                      </h3>
                      {farm.region ? (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={11} />
                          {farm.region}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      {farm.productCount} products
                    </span>
                    <Link
                      to={`/marketplace/farms/${farm.id}`}
                      className="text-xs text-emerald-700 hover:underline"
                    >
                      View farm →
                    </Link>
                  </div>
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
