import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { MarketplaceOrderStatus } from "@/shared/api";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/shared/ui";
import {
  useMarketplaceAdminOrderAuditLogs,
  useMarketplaceAdminOrderDetail,
  useMarketplaceAdminOrders,
  useMarketplaceUpdateAdminOrderPaymentVerificationMutation,
  useMarketplaceUpdateAdminOrderStatusMutation,
} from "../hooks";
import { formatDateTime, formatVnd } from "../lib/format";

const statusFilters: Array<{ value: "ALL" | MarketplaceOrderStatus; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "DELIVERING", label: "Delivering" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function statusVariant(status: MarketplaceOrderStatus) {
  if (status === "COMPLETED") return "success";
  if (status === "CANCELLED") return "destructive";
  if (status === "PENDING") return "warning";
  return "secondary";
}

export function AdminMarketplaceOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<"ALL" | MarketplaceOrderStatus>("ALL");
  const [verificationNote, setVerificationNote] = useState("");

  const ordersQuery = useMarketplaceAdminOrders({
    page: 0,
    size: 100,
    status: status === "ALL" ? undefined : status,
  });

  const selectedOrderId = Number(searchParams.get("orderId") ?? 0);
  const selectedOrderQuery = useMarketplaceAdminOrderDetail(selectedOrderId);
  const selectedOrder = useMemo(() => selectedOrderQuery.data, [selectedOrderQuery.data]);
  const auditLogsQuery = useMarketplaceAdminOrderAuditLogs(selectedOrderId);
  const verifyMutation = useMarketplaceUpdateAdminOrderPaymentVerificationMutation(selectedOrderId || 0);
  const cancelMutation = useMarketplaceUpdateAdminOrderStatusMutation(selectedOrderId || 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Marketplace orders overview</h1>
        <p className="text-sm text-slate-500">Inspect payment verification and moderation actions across all farmers.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status filter</CardTitle>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  status === option.value
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {ordersQuery.isLoading && <p className="text-sm text-slate-500">Loading orders...</p>}
          {ordersQuery.isError && <p className="text-sm text-red-600">Failed to load orders.</p>}
          {!ordersQuery.isLoading && !ordersQuery.isError && (ordersQuery.data?.items ?? []).length === 0 && (
            <p className="text-sm text-slate-500">No order found.</p>
          )}
          {(ordersQuery.data?.items ?? []).map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => setSearchParams({ orderId: String(order.id) })}
              className="w-full rounded-lg border p-3 text-left hover:border-emerald-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{order.orderCode}</p>
                  <p className="text-xs text-slate-500">
                    Buyer #{order.buyerUserId} · Farmer #{order.farmerUserId}
                  </p>
                  <p className="text-xs text-slate-500">
                    {order.payment.method} · {order.payment.verificationStatus}
                  </p>
                  <p className="text-xs text-slate-500">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                  <p className="text-sm font-semibold text-emerald-700">{formatVnd(order.totalAmount)}</p>
                </div>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {selectedOrder && (
        <Card>
          <CardHeader>
            <CardTitle>Order detail · {selectedOrder.orderCode}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <p>Status: <span className="font-medium text-slate-900">{selectedOrder.status}</span></p>
            <p>Recipient: {selectedOrder.shippingRecipientName} · {selectedOrder.shippingPhone}</p>
            <p>Address: {selectedOrder.shippingAddressLine}</p>
            <p>
              Payment: <span className="font-medium text-slate-900">{selectedOrder.payment.method}</span> ·{" "}
              <span className="font-medium text-slate-900">{selectedOrder.payment.verificationStatus}</span>
            </p>
            <p>Total: <span className="font-semibold text-emerald-700">{formatVnd(selectedOrder.totalAmount)}</span></p>

            {selectedOrder.payment.proofFileName ? (
              <div className="rounded border border-slate-200 bg-slate-50 p-3">
                <p>Proof file: {selectedOrder.payment.proofFileName}</p>
                {selectedOrder.payment.proofUploadedAt ? (
                  <p>Uploaded at: {formatDateTime(selectedOrder.payment.proofUploadedAt)}</p>
                ) : null}
                {selectedOrder.payment.proofStoragePath ? (
                  <p className="break-all text-xs text-slate-500">{selectedOrder.payment.proofStoragePath}</p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-3 rounded border border-slate-200 p-3">
              <p className="font-medium text-slate-900">Verification note</p>
              <Input
                value={verificationNote}
                onChange={(event) => setVerificationNote(event.target.value)}
                placeholder="Optional note for buyer"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={verifyMutation.isPending}
                  onClick={async () => {
                    await verifyMutation.mutateAsync({
                      verificationStatus: "VERIFIED",
                      verificationNote,
                    });
                    await Promise.all([selectedOrderQuery.refetch(), auditLogsQuery.refetch()]);
                  }}
                >
                  Mark verified
                </Button>
                <Button
                  variant="outline"
                  disabled={verifyMutation.isPending}
                  onClick={async () => {
                    await verifyMutation.mutateAsync({
                      verificationStatus: "REJECTED",
                      verificationNote,
                    });
                    await Promise.all([selectedOrderQuery.refetch(), auditLogsQuery.refetch()]);
                  }}
                >
                  Reject proof
                </Button>
                {selectedOrder.status !== "CANCELLED" ? (
                  <Button
                    variant="destructive"
                    disabled={cancelMutation.isPending}
                    onClick={async () => {
                      await cancelMutation.mutateAsync({ status: "CANCELLED" });
                      await Promise.all([selectedOrderQuery.refetch(), auditLogsQuery.refetch()]);
                    }}
                  >
                    Force cancel
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded border p-2">
                  <p>{item.productName} x{item.quantity}</p>
                  <p className="font-medium text-slate-900">{formatVnd(item.lineTotal)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 rounded border border-slate-200 p-3">
              <p className="font-medium text-slate-900">Audit trail</p>
              {auditLogsQuery.isLoading ? <p>Loading audit logs...</p> : null}
              {auditLogsQuery.isError ? <p className="text-red-600">Failed to load audit logs.</p> : null}
              {(auditLogsQuery.data ?? []).map((log) => (
                <div key={log.id} className="rounded border border-slate-200 p-2">
                  <p className="font-medium text-slate-900">{log.operation}</p>
                  <p className="text-xs text-slate-500">
                    {log.performedBy} · {formatDateTime(log.performedAt)}
                  </p>
                  {log.reason ? <p className="text-xs text-slate-500">{log.reason}</p> : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
