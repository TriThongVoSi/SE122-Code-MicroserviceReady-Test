import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
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

      <Card>
        <CardContent className="space-y-3 p-6">
          <h1 className="text-2xl font-semibold text-slate-900">{farm.name}</h1>
          <p className="text-sm text-slate-600">{farm.description ?? "No description."}</p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Badge variant="outline">{farm.region ?? "N/A"}</Badge>
            <span>{farm.address ?? "No address"}</span>
          </div>
          <p className="text-sm text-slate-500">Owner: {farm.ownerDisplayName ?? "N/A"}</p>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Published products</h2>

        {productsQuery.isLoading ? (
          <p className="text-sm text-slate-500">Loading products...</p>
        ) : productsQuery.isError ? (
          <p className="text-sm text-red-600">Failed to load products.</p>
        ) : farmProducts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {farmProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-44 w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <CardContent className="space-y-2 p-4">
                  <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-900">
                    {product.name}
                  </h3>
                  <p className="text-sm text-emerald-700">{formatVnd(product.price)}</p>
                  <Link
                    to={`/marketplace/products/${product.slug}`}
                    className="text-xs text-emerald-700 hover:underline"
                  >
                    View product
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
