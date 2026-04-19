import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, CardContent, Input } from "@/shared/ui";
import { useMarketplaceTraceability } from "../hooks";
import { formatDateTime } from "../lib/format";

export function TraceabilityPage() {
  const { productId } = useParams<{ productId?: string }>();
  const navigate = useNavigate();

  const parsedProductId = useMemo(() => {
    if (!productId) {
      return null;
    }
    const value = Number(productId);
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }
    return value;
  }, [productId]);

  const [inputProductId, setInputProductId] = useState(productId ?? "");
  const traceabilityQuery = useMarketplaceTraceability(parsedProductId);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Traceability lookup</h1>
        <p className="text-sm text-slate-600">
          Enter product ID to inspect farm-season-lot chain from backend.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <Input
              placeholder="Example: 201"
              value={inputProductId}
              onChange={(event) => setInputProductId(event.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            onClick={() => {
              const next = Number(inputProductId);
              if (!Number.isFinite(next) || next <= 0) {
                return;
              }
              navigate(`/marketplace/traceability/${next}`);
            }}
          >
            Lookup
          </Button>
        </CardContent>
      </Card>

      {parsedProductId == null ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Product ID is not selected.
        </div>
      ) : traceabilityQuery.isLoading ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Loading traceability chain...
        </div>
      ) : traceabilityQuery.isError ? (
        <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
          Failed to load traceability chain.
        </div>
      ) : traceabilityQuery.data ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Result for product #{traceabilityQuery.data.productId}
            </h2>

            {!traceabilityQuery.data.traceable ? (
              <p className="text-sm text-slate-500">This product is not traceable.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Farm</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {traceabilityQuery.data.farm?.name}
                  </p>
                  <p className="text-xs text-slate-500">{traceabilityQuery.data.farm?.region}</p>
                </div>

                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Season</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {traceabilityQuery.data.season?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Harvest plan: {traceabilityQuery.data.season?.plannedHarvestDate ?? "N/A"}
                  </p>
                </div>

                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Lot</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {traceabilityQuery.data.lot?.lotCode}
                  </p>
                  <p className="text-xs text-slate-500">
                    Harvested: {traceabilityQuery.data.lot?.harvestedAt ?? "N/A"}
                  </p>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500">
              Validated at: {formatDateTime(traceabilityQuery.data.validatedAt)}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No traceability data found.
        </div>
      )}
    </div>
  );
}
