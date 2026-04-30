import { useState } from "react";
import { ChevronRight, Package } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/shared/ui";
import { type MarketplaceOrder, type MarketplaceOrderItem, type MarketplaceOrderStatus } from "@/shared/api";
import { useMarketplaceOrders } from "../hooks";
import { formatDate, formatVnd } from "../lib/format";

const ORDER_STATUSES: Array<{ value: MarketplaceOrderStatus }> = [
  { value: "PENDING" },
  { value: "CONFIRMED" },
  { value: "PREPARING" },
  { value: "DELIVERING" },
  { value: "COMPLETED" },
  { value: "CANCELLED" },
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-700 border border-orange-200",
  CONFIRMED: "bg-blue-100 text-blue-700 border border-blue-200",
  PREPARING: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  DELIVERING: "bg-sky-100 text-sky-700 border border-sky-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  CANCELLED: "bg-red-100 text-red-600 border border-red-200",
};

function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

function getStatusColor(status: string): string {
  return STATUS_COLORS[status] ?? "bg-slate-100 text-slate-600 border border-slate-200";
}

function toPositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(status)}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function OrderItemPreview({ item }: { item: MarketplaceOrderItem }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {item.imageUrl && !imgError ? (
        <img
          src={item.imageUrl}
          alt={item.productName}
          className="h-16 w-16 rounded-lg object-cover shrink-0 bg-slate-100"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="h-16 w-16 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
          <Package size={18} className="text-slate-300" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.productName}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Số lượng: {item.quantity} x {formatVnd(item.unitPriceSnapshot)}
        </p>
      </div>
      <span className="text-sm font-semibold text-gray-800 shrink-0">
        {formatVnd(item.lineTotal)}
      </span>
    </div>
  );
}

function OrderSummaryCard({ order }: { order: MarketplaceOrder }) {
  const previewItems = order.items.slice(0, 2);
  const extraCount = order.items.length - previewItems.length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="flex items-start justify-between px-4 py-3 border-b border-slate-100">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Mã đơn: <span className="font-semibold text-gray-900">#{order.orderCode}</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Đặt ngày: {formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="divide-y divide-slate-100">
        {previewItems.map((item) => (
          <OrderItemPreview key={item.id} item={item} />
        ))}
        {extraCount > 0 && (
          <p className="px-4 py-2 text-xs text-gray-400 italic">+{extraCount} sản phẩm khác</p>
        )}
      </div>
      <div className="border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gray-600 flex-1">
          Tổng tiền ({order.items.length} sản phẩm):{" "}
          <span className="font-bold" style={{ color: "#3BA55D" }}>{formatVnd(order.totalAmount)}</span>
        </p>
        <Link to={`/marketplace/orders/${order.id}`} className="shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto flex items-center justify-center gap-1 transition-colors duration-200 hover:bg-[#3BA55D] hover:border-[#3BA55D] hover:text-white"
          >
            Xem chi tiết <ChevronRight size={16} />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function MyOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = toPositiveInt(searchParams.get("page"), 1);
  const statusParam = searchParams.get("status");
  const selectedStatus = ORDER_STATUSES.some((item) => item.value === statusParam)
    ? (statusParam as MarketplaceOrderStatus)
    : undefined;

  const ordersQuery = useMarketplaceOrders({ status: selectedStatus, page: page - 1, size: 10 });

  function updateParams(patch: Record<string, string | null>) {
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
  }

  if (ordersQuery.isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          Đang tải đơn hàng...
        </div>
      </div>
    );
  }

  if (ordersQuery.isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
          Không thể tải đơn hàng. Vui lòng thử lại.
        </div>
      </div>
    );
  }

  const orderPage = ordersQuery.data;
  const orders = orderPage?.items ?? [];
  const totalPages = Math.max(orderPage?.totalPages ?? 1, 1);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          style={!selectedStatus ? { backgroundColor: "#3BA55D", color: "#fff", borderColor: "#3BA55D" } : undefined}
          onClick={() => updateParams({ status: null })}
        >
          Tất cả
        </Button>
        {ORDER_STATUSES.map(({ value }) => (
          <Button
            key={value}
            type="button"
            variant="outline"
            size="sm"
            style={selectedStatus === value ? { backgroundColor: "#3BA55D", color: "#fff", borderColor: "#3BA55D" } : undefined}
            onClick={() => updateParams({ status: value === selectedStatus ? null : value })}
          >
            {getStatusLabel(value)}
          </Button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <OrderSummaryCard key={order.id} order={order} />
        ))}

        {orders.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white py-20 text-center">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">Bạn chưa có đơn hàng nào.</h3>
            <p className="mb-6 text-sm text-gray-500">
              Hãy khám phá sản phẩm nông sản và đặt đơn đầu tiên của bạn.
            </p>
            <Link to="/marketplace/products">
              <Button>Mua sắm ngay</Button>
            </Link>
          </div>
        )}

        {orders.length > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
            <p className="text-sm text-gray-500">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) })}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => updateParams({ page: String(page + 1) })}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
