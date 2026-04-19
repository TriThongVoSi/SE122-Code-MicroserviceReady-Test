import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, Input } from "@/shared/ui";
import { useMarketplaceFarms } from "../hooks";

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
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Loading farms...
        </div>
      ) : farmsQuery.isError ? (
        <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
          Failed to load farms.
        </div>
      ) : farms.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {farms.map((farm) => (
            <Card key={farm.id}>
              <CardContent className="space-y-2 p-5">
                <h2 className="text-lg font-semibold text-slate-900">{farm.name}</h2>
                <p className="text-sm text-slate-600">{farm.region ?? "Unknown region"}</p>
                <p className="text-sm text-slate-500">{farm.productCount} published products</p>
                <Link
                  to={`/marketplace/farms/${farm.id}`}
                  className="text-xs text-emerald-700 hover:underline"
                >
                  View farm detail
                </Link>
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
