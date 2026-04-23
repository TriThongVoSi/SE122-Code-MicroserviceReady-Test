import { useMemo } from "react";
import { ArrowLeft, MapPin, User, Wheat } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge, Card, CardContent } from "@/shared/ui";
import { useMarketplaceFarmDetail, useMarketplaceProducts } from "../hooks";
import { formatVnd } from "../lib/format";

export function FarmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const farmId = Number(id);

  const farmQuery = useMarketplaceFarmDetail(farmId);
  const productsQuery = useMarketplaceProducts({ page: 0, size: 100 });

  const farmProducts = useMemo(
    () => (productsQuery.data?.items ?? []).filter((product) => product.farmId === farmId),
    [productsQuery.data, farmId],
  );

  if (farmQuery.isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        Loading farm detail...
      </div>
    );
  }

  if (farmQuery.isError || !farmQuery.data) {
    return (
      <div className="space-y-3 rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
        <p>Farm not found.</p>
        <Link to="/marketplace/farms" className="text-emerald-700 hover:underline">
          Back to farm list
        </Link>
      </div>
    );
  }

  const farm = farmQuery.data;

  return (
    <div className="space-y-6">
      <Link
        to="/marketplace/farms"
        className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
      >
        <ArrowLeft size={15} /> Back to farm list
      </Link>

      {/* Farm header banner */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 p-8 text-white shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Wheat size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{farm.name}</h1>
              {farm.region ? (
                <div className="mt-1 flex items-center gap-1.5 text-emerald-100">
                  <MapPin size={14} />
                  <span className="text-sm">{farm.region}</span>
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {farm.region ? (
              <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur">
                {farm.region}
              </span>
            ) : null}
            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur">
              {farmProducts.length} products
            </span>
          </div>
        </div>
      </div>

      {/* Farm info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <h2 className="mb-2 text-sm font-semibold text-slate-700">About this farm</h2>
              <p className="text-sm leading-relaxed text-slate-600">
                {farm.description ?? "No description provided."}
              </p>
            </div>
            <div className="space-y-3">
              {farm.ownerDisplayName ? (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User size={15} className="shrink-0 text-slate-400" />
                  <span>{farm.ownerDisplayName}</span>
                </div>
              ) : null}
              {farm.address ? (
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" />
                  <span>{farm.address}</span>
                </div>
              ) : null}
              {farm.region ? (
                <Badge variant="outline" className="w-fit">
                  {farm.region}
                </Badge>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Published products</h2>

        {productsQuery.isLoading ? (
          <p className="text-sm text-slate-500">Loading products...</p>
        ) : productsQuery.isError ? (
          <p className="text-sm text-red-600">Failed to load products.</p>
        ) : farmProducts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {farmProducts.map((product) => (
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
                  <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-900">
                    {product.name}
                  </h3>
                  <p className="text-sm font-medium text-emerald-700">{formatVnd(product.price)}</p>
                  <Link
                    to={`/marketplace/products/${product.slug}`}
                    className="text-xs text-emerald-700 hover:underline"
                  >
                    View product →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            This farm has no published product.
          </div>
        )}
      </section>
    </div>
  );
}
