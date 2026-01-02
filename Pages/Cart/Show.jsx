import React, { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Show() {
  const { cart } = usePage().props;
  const items = cart?.items ?? [];

  const [loadingId, setLoadingId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const money = (cents) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      (cents ?? 0) / 100
    );

  const subtotalCents = useMemo(() => {
    return items.reduce((sum, it) => sum + (it.product.price_cents * it.quantity), 0);
  }, [items]);

  const updateQty = (cartItemId, nextQty) => {
    if (nextQty < 1) return;

    setLoadingId(cartItemId);
    router.patch(
      route("cart.items.update", cartItemId),
      { quantity: nextQty },
      {
        preserveScroll: true,
        onSuccess: () => toast.success("Cart updated"),
        onError: () => toast.error("Failed to update cart"),
        onFinish: () => setLoadingId(null),
      }
    );
  };

  const removeItem = (cartItemId) => {
    setLoadingId(cartItemId);
    router.delete(route("cart.items.destroy", cartItemId), {
      preserveScroll: true,
      onSuccess: () => toast.success("Item removed"),
      onError: () => toast.error("Failed to remove item"),
      onFinish: () => setLoadingId(null),
    });
  };

  const checkout = () => {
    setCheckingOut(true);

    router.post(route("cart.checkout"), {}, {
      preserveScroll: true,
      onSuccess: () => toast.success("Checkout successful!"),
      onError: () => toast.error("Checkout failed"),
      onFinish: () => setCheckingOut(false),
    });
  };

  return (
    <AuthenticatedLayout header="Cart">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.length === 0 ? (
            <Card>
              <CardHeader>
                <div className="text-base font-semibold text-slate-900">
                  Your cart is empty
                </div>
                <div className="text-sm text-slate-600">
                  Add products and they will appear here.
                </div>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.visit(route("products.index"))}>
                  Browse products
                </Button>
              </CardContent>
            </Card>
          ) : (
            items.map((it) => {
              const p = it.product;
              const lowStock = p.stock_quantity <= p.low_stock_threshold;

              return (
                <Card key={it.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {p.name}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="text-sm text-slate-700">
                            {money(p.price_cents)}
                          </div>
                          {lowStock && <Badge variant="warning">Low stock</Badge>}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          In stock: {p.stock_quantity}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(it.id)}
                        disabled={loadingId === it.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQty(it.id, it.quantity - 1)}
                          disabled={loadingId === it.id || it.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <div className="min-w-[3rem] text-center text-sm font-semibold text-slate-900">
                          {it.quantity}
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQty(it.id, it.quantity + 1)}
                          disabled={loadingId === it.id || it.quantity >= p.stock_quantity}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-sm font-semibold text-slate-900">
                        {money(p.price_cents * it.quantity)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <div className="text-base font-semibold text-slate-900">
                  Order Summary
                </div>
                <div className="text-sm text-slate-600">
                  Review your total before checkout.
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">
                    {money(subtotalCents)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Shipping</span>
                  <span className="font-medium text-slate-900">{money(0)}</span>
                </div>

                <div className="h-px bg-slate-200" />

                <div className="flex items-center justify-between text-slate-900">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-semibold">
                    {money(subtotalCents)}
                  </span>
                </div>

                <Button
                  className="mt-2 w-full"
                  onClick={checkout}
                  disabled={items.length === 0 || checkingOut}
                >
                  {checkingOut ? "Processing..." : "Checkout"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.visit(route("products.index"))}
                >
                  Continue shopping
                </Button>
              </CardContent>
            </Card>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
              Tip: low stock items will trigger admin notification after checkout.
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
    
  );
}
