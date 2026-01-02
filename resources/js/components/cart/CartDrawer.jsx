import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { router, usePage } from '@inertiajs/react';
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function CartDrawer() {
    const { cart } = usePage().props;

    const items = cart?.items ?? [];
    const [loadingId, setLoadingId] = useState(null);
    const [checkingOut, setCheckingOut] = useState(false);

    const subtotalCents = useMemo(() => {
        return items.reduce(
            (sum, it) => sum + it.product.price_cents * it.quantity,
            0,
        );
    }, [items]);

    const totalItems = useMemo(() => {
        return items.reduce((sum, it) => sum + it.quantity, 0);
    }, [items]);

    const money = (cents) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format((cents ?? 0) / 100);

    const updateQty = (cartItemId, nextQty) => {
        if (nextQty < 1) return;

        setLoadingId(cartItemId);

        router.patch(
            route('cart.items.update', cartItemId),
            { quantity: nextQty },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Cart updated'),
                onError: () => toast.error('Failed to update cart'),
                onFinish: () => setLoadingId(null),
            },
        );
    };

    const removeItem = (cartItemId) => {
        setLoadingId(cartItemId);

        router.delete(route('cart.items.destroy', cartItemId), {
            preserveScroll: true,
            onSuccess: () => toast.success('Item removed'),
            onError: () => toast.error('Failed to remove item'),
            onFinish: () => setLoadingId(null),
        });
    };

    const checkout = () => {
        setCheckingOut(true);

        router.post(
            route('cart.checkout'),
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Checkout successful!'),
                onError: () => toast.error('Checkout failed'),
                onFinish: () => setCheckingOut(false),
            },
        );
    };

    if (items.length === 0) {
        return (
            <div className="p-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <div className="text-sm font-semibold text-slate-900">
                        Your cart is empty
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                        Add some products to get started.
                    </div>

                    <Button
                        variant="default"
                        className="mt-4 w-full"
                        onClick={() => router.visit(route('products.index'))}
                    >
                        Browse products
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="p-5">
                <div className="text-sm text-slate-500">
                    {totalItems} item{totalItems > 1 ? 's' : ''} in cart
                </div>
            </div>

            <div className="flex-1 space-y-3 px-5 pb-5">
                {items.map((it) => {
                    const p = it.product;
                    const lowStock = p.stock_quantity <= p.low_stock_threshold;

                    return (
                        <div
                            key={it.id}
                            className="rounded-2xl border border-slate-200 bg-white p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-slate-900">
                                        {p.name}
                                    </div>
                                    <div className="mt-1 flex items-center gap-2">
                                        <div className="text-sm text-slate-700">
                                            {money(p.price_cents)}
                                        </div>
                                        {lowStock && (
                                            <Badge variant="warning">
                                                Low stock
                                            </Badge>
                                        )}
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
                                    className="shrink-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            updateQty(it.id, it.quantity - 1)
                                        }
                                        disabled={
                                            loadingId === it.id ||
                                            it.quantity <= 1
                                        }
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>

                                    <div className="min-w-[2.5rem] text-center text-sm font-semibold text-slate-900">
                                        {it.quantity}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            updateQty(it.id, it.quantity + 1)
                                        }
                                        disabled={
                                            loadingId === it.id ||
                                            it.quantity >= p.stock_quantity
                                        }
                                        title={
                                            it.quantity >= p.stock_quantity
                                                ? 'No more stock'
                                                : ''
                                        }
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="text-sm font-semibold text-slate-900">
                                    {money(p.price_cents * it.quantity)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="border-t border-slate-200 bg-white p-5">
                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span className="font-medium text-slate-900">
                            {money(subtotalCents)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                        <span>Shipping</span>
                        <span className="font-medium text-slate-900">
                            {money(0)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-900">
                        <span className="font-semibold">Total</span>
                        <span className="text-base font-semibold">
                            {money(subtotalCents)}
                        </span>
                    </div>
                </div>

                <Button
                    className="mt-4 w-full"
                    onClick={checkout}
                    disabled={checkingOut}
                >
                    {checkingOut ? 'Processing...' : 'Checkout'}
                </Button>

                <Button
                    variant="secondary"
                    className="mt-2 w-full"
                    onClick={() => router.visit(route('cart.show'))}
                >
                    View full cart
                </Button>
            </div>
        </div>
    );
}
