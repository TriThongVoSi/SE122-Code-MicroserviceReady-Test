import { ChevronRight, Package } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { type MarketplaceOrderStatus } from "@/shared/api";
import { useMarketplaceOrders } from "../hooks";
import { formatDateTime, formatVnd } from "../lib/format";

const ORDER_STATUSES: Array<{ value: MarketplaceOrderStatus }> = [
  { value: "PENDING" },
  { value: "CONFIRMED" },
  { value: "PREPARING" },
  { value: "DELIVERING" },
  { value: "COMPLETED" },
  { value: "CANCELLED" },
];

function statusVariant(status: MarketplaceOrderStatus):
  | "default"
  | "warning"
  | "success"
  | "destructive"
  | "secondary"
  | "outline"
  | "info" {
  switch (status) {
    case "PENDING":
      return "warning";
    case "CONFIRMED":
    case "PREPARING":
      return "info";
    case "DELIVERING":
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "destructive";
    default:
      return "secondary";
  }
}

function toPositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function MyOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
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
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          {t("marketplaceBuyer.myOrders.loadingOrders")}
        </div>
      </div>
    );
  }

  if (ordersQuery.isError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
          {t("marketplaceBuyer.myOrders.errorOrders")}
        </div>
      </div>
    );
  }

  const orderPage = ordersQuery.data;
  const orders = orderPage?.items ?? [];
  const totalPages = Math.max(orderPage?.totalPages ?? 1, 1);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={!selectedStatus ? "default" : "outline"}
            size="sm"
            onClick={() => updateParams({ status: null })}
          >
            Tất cả
          </Button>
          {ORDER_STATUSES.map((status) => (
            <Button
              key={status.value}
              type="button"
              variant={selectedStatus === status.value ? "default" : "outline"}
              size="sm"
              onClick={() => updateParams({ status: status.value === selectedStatus ? null : status.value })}
            >
              {t(`marketplaceSeller.status.order.${status.value}`)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 bg-gray-50 py-3 px-4">
              <div>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Mã đơn: <span className="font-semibold text-gray-900">#{order.orderCode}</span>
                </CardTitle>
                <div className="mt-1 text-xs text-gray-500">
                  Đặt ngày: {formatDateTime(order.createdAt)}
                </div>
              </div>
              <div>
                <Badge variant={statusVariant(order.status)}>
                  {t(`marketplaceSeller.status.order.${order.status}`)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-4">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="h-14 w-14 rounded-md bg-gray-100 object-cover flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.productName}</h4>
                      <div className="mt-0.5 text-sm text-gray-500">
                        Số lượng: {item.quantity} x {formatVnd(item.unitPriceSnapshot)}
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900 flex-shrink-0">
                      {formatVnd(item.lineTotal)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
                <div className="text-sm text-gray-600">
                  Tổng tiền ({order.items.length} sản phẩm):
                  <span className="ml-2 text-base font-bold text-emerald-600">{formatVnd(order.totalAmount)}</span>
                </div>
                <Link to={`/marketplace/orders/${order.id}`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    Xem chi tiết <ChevronRight size={16} />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {orders.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white py-20 text-center">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">Chưa có đơn hàng nào</h3>
            <p className="mb-6 text-gray-500">Bạn chưa thực hiện giao dịch nào trên FarmTrace.</p>
            <Link to="/marketplace/products">
              <Button>Bắt đầu mua sắm</Button>
            </Link>
          </div>
        ) : null}

        {orders.length > 0 ? (
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
        ) : null}
      </div>
    </div>
  );
}
