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
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        Loading server cart...
      </div>
    );
  }

  if (cartQuery.isError) {
    return (
      <div className="rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
        Failed to load cart from server.
      </div>
    );
  }

  const cart = cartQuery.data;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
        <ShoppingCart className="mb-4 text-slate-300" size={56} />
        <h1 className="text-xl font-semibold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-slate-500">Add products and continue checkout flow.</p>
        <Link
          to="/marketplace/products"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
        >
          Continue shopping →
        </Link>
      </div>
    );
  }

  const isMutating = updateItemMutation.isPending || removeItemMutation.isPending;
  const total = (cart.subtotal ?? 0) + SHIPPING_FEE;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900">Cart</h1>

        {cart.items.map((item) => (
          <Card key={item.productId}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Product info */}
                <div className="flex flex-1 items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-20 w-20 rounded-md object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{formatVnd(item.unitPrice)} each</p>
                  </div>
                </div>

                {/* Quantity + subtotal + remove */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-md border border-slate-300">
                    <button
                      type="button"
                      className="p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isMutating}
                      onClick={async () => {
                        const next = Math.max(1, item.quantity - 1);
                        await updateItemMutation.mutateAsync({
                          productId: item.productId,
                          request: { quantity: next },
                        });
                      }}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      className="p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isMutating}
                      onClick={async () => {
                        const next = Math.min(item.maxQuantity, item.quantity + 1);
                        await updateItemMutation.mutateAsync({
                          productId: item.productId,
                          request: { quantity: next },
                        });
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <p className="w-24 text-right text-sm font-semibold text-slate-900">
                    {formatVnd(item.unitPrice * item.quantity)}
                  </p>

                  <button
                    type="button"
                    className="rounded-md p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isMutating}
                    onClick={async () => {
                      await removeItemMutation.mutateAsync(item.productId);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <aside>
        <Card className="sticky top-24">
          <CardContent className="space-y-4 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Items ({cart.itemCount})</span>
                <span>{formatVnd(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>{formatVnd(SHIPPING_FEE)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
                <span>Total</span>
                <span className="text-emerald-700">{formatVnd(total)}</span>
              </div>
            </div>

            <Button className="w-full" onClick={() => navigate("/marketplace/checkout")}>
              Proceed to checkout
            </Button>

            <Link
              to="/marketplace/products"
              className="block text-center text-xs text-slate-500 hover:text-emerald-700 hover:underline"
            >
              Continue shopping
            </Link>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
