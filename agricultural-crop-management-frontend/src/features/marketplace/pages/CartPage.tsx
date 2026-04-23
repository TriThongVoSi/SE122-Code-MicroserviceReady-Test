import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, CardContent } from "@/shared/ui";
import {
  useMarketplaceCart,
  useMarketplaceRemoveCartItemMutation,
  useMarketplaceUpdateCartItemMutation,
} from "../hooks";
import { formatVnd } from "../lib/format";

const SHIPPING_FEE = 20_000;

export function CartPage() {
  const navigate = useNavigate();

  const cartQuery = useMarketplaceCart();
  const updateItemMutation = useMarketplaceUpdateCartItemMutation();
  const removeItemMutation = useMarketplaceRemoveCartItemMutation();

  if (cartQuery.isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          Đang tải giỏ hàng...
        </div>
      </div>
    );
  }

  if (cartQuery.isError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
          Không thể tải giỏ hàng từ máy chủ.
        </div>
      </div>
    );
  }

  const cart = cartQuery.data;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
          <ShoppingCart size={48} className="text-gray-400" />
        </div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Giỏ hàng trống</h2>
        <p className="mb-8 text-gray-500">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
        <Button onClick={() => navigate("/marketplace/products")}>Tiếp tục mua sắm</Button>
      </div>
    );
  }

  const isMutating = updateItemMutation.isPending || removeItemMutation.isPending;
  const total = (cart.subtotal ?? 0) + SHIPPING_FEE;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Giỏ hàng của bạn</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.productId} className="overflow-hidden">
              <CardContent className="flex items-center gap-4 p-4">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-24 w-24 rounded-md bg-gray-100 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <Link
                    to={`/marketplace/products/${item.slug}`}
                    className="line-clamp-1 font-semibold text-gray-900 transition-colors hover:text-emerald-600"
                  >
                    {item.name}
                  </Link>
                  <div className="mt-1 font-bold text-emerald-600">
                    {formatVnd(item.unitPrice)}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-md border border-gray-200">
                    <button
                      type="button"
                      className="p-1 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isMutating}
                      onClick={async () => {
                        const next = Math.max(1, item.quantity - 1);
                        await updateItemMutation.mutateAsync({
                          productId: item.productId,
                          request: { quantity: next },
                        });
                      }}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      className="p-1 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isMutating}
                      onClick={async () => {
                        const next = Math.min(item.maxQuantity, item.quantity + 1);
                        await updateItemMutation.mutateAsync({
                          productId: item.productId,
                          request: { quantity: next },
                        });
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <p className="w-24 text-right text-sm font-semibold text-gray-900">
                    {formatVnd(item.unitPrice * item.quantity)}
                  </p>

                  <button
                    type="button"
                    className="p-2 text-red-500 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isMutating}
                    onClick={async () => {
                      await removeItemMutation.mutateAsync(item.productId);
                    }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="w-full shrink-0 lg:w-80">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-bold">Tổng đơn hàng</h3>
              <div className="mb-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính:</span>
                  <span className="font-medium">{formatVnd(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí giao hàng:</span>
                  <span className="font-medium">{formatVnd(SHIPPING_FEE)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                  <span className="font-bold text-gray-900">Tổng cộng:</span>
                  <span className="text-xl font-bold text-emerald-600">{formatVnd(total)}</span>
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={() => navigate("/marketplace/checkout")}>
                Tiến hành thanh toán
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
