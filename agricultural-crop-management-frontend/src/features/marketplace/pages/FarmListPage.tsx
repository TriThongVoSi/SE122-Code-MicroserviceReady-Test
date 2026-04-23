import { useState } from "react";
import { MapPin, Wheat } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Card, CardContent, Input } from "@/shared/ui";
import { useMarketplaceFarms } from "../hooks";

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
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

export function FarmListPage() {
  const [search, setSearch] = useState("");

  const farmsQuery = useMarketplaceFarms({
    q: search || undefined,
    page: 0,
    size: 24,
  });
  const farms = farmsQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Farm list</h1>
        <Input
          placeholder="Search farms..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full sm:w-72"
        />
      </div>

      {farmsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => <FarmCardSkeleton key={i} />)}
        </div>
      ) : farmsQuery.isError ? (
        <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
          Failed to load farms.
        </div>
      ) : farms.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {farms.map((farm) => (
            <Card
              key={farm.id}
              className="overflow-hidden transition-shadow hover:shadow-md"
            >
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Wheat size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-semibold text-slate-900">{farm.name}</h2>
                    {farm.region ? (
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">{farm.region}</span>
                      </div>
                    ) : (
                      <p className="mt-0.5 text-xs text-slate-400">Unknown region</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {farm.productCount} published products
                  </Badge>
                  <Link
                    to={`/marketplace/farms/${farm.id}`}
                    className="text-xs font-medium text-emerald-700 hover:underline"
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
          No farm found.
        </div>
      )}
    </div>
  );
}
