import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import Topbar from '@/Components/Topbar';
import { Button, Card, CardContent, Separator } from '@/Components/ui';

const formatMoney = (cents) =>
    new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);

function placeholderImage(name) {
    const label = encodeURIComponent(name?.slice(0, 16) ?? 'Drop');
    return `https://dummyimage.com/900x900/0b0b0b/7CFF6B&text=${label}`;
}

/**
 * ✅ IMPORTANT:
 * Backend kamu pakai price_cents (integer) — udah benar.
 * Tapi kita tetap bikin fallback supaya aman.
 */
const getPriceCents = (product) => {
    if (!product) return 0;

    if (typeof product.price_cents === 'number') return product.price_cents;

    // fallback (kalau suatu saat kamu tambah field lain)
    if (typeof product.price === 'number')
        return Math.round(product.price * 100);
    if (typeof product.harga === 'number') return Math.round(product.harga);

    return 0;
};

export default function Show({ cart }) {
    const { errors, flash } = usePage().props;

    const [quantities, setQuantities] = useState(() => {
        const q = {};
        cart?.items?.forEach((i) => (q[i.id] = i.quantity));
        return q;
    });

    const [toast, setToast] = useState(null);
    const [checkoutModal, setCheckoutModal] = useState(false);

    // ✅ snapshot total sebelum checkout (ini yang dipakai modal)
    const [checkoutTotalSnapshot, setCheckoutTotalSnapshot] = useState(null);

    // ✅ Total hitung dari quantities state terbaru + harga kebaca
    const total = useMemo(() => {
        if (!cart?.items?.length) return 0;

        return cart.items.reduce((sum, i) => {
            const q = Number(quantities[i.id] ?? i.quantity ?? 1);
            const price = getPriceCents(i.product);
            return sum + q * price;
        }, 0);
    }, [cart, quantities]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 2500);
        return () => clearTimeout(t);
    }, [toast]);

    // ✅ Lock body scroll when modal is open
    useEffect(() => {
        if (checkoutModal) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => (document.body.style.overflow = '');
    }, [checkoutModal]);

    const updateItem = (itemId) => {
        router.patch(
            route('cart.items.update', itemId),
            { quantity: Number(quantities[itemId] ?? 1) },
            {
                preserveScroll: true,
                onSuccess: () =>
                    setToast({
                        title: 'Updated',
                        message: 'Quantity updated.',
                    }),
            },
        );
    };

    const removeItem = (itemId) => {
        router.delete(route('cart.items.destroy', itemId), {
            preserveScroll: true,
            onSuccess: () =>
                setToast({
                    title: 'Removed',
                    message: 'Item removed from cart.',
                }),
        });
    };

    const checkout = () => {
        /**
         * ✅ FIX:
         * simpan snapshot total SEBELUM request checkout
         * jadi walaupun backend hapus item, modal tetap punya total sebelumnya.
         */
        setCheckoutTotalSnapshot(total);

        router.post(
            route('cart.checkout'),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setCheckoutModal(true),
                onError: () => {
                    setCheckoutTotalSnapshot(null);
                    setToast({
                        title: 'Failed',
                        message: 'Checkout failed. Try again.',
                    });
                },
            },
        );
    };

    // ✅ total yang dipakai modal
    const modalTotal =
        (typeof flash?.checkout_total_cents === 'number'
            ? flash.checkout_total_cents
            : null) ??
        checkoutTotalSnapshot ??
        total;

    const hasError = errors?.quantity || errors?.stock || errors?.cart;

    const closeModal = () => {
        setCheckoutModal(false);
        setCheckoutTotalSnapshot(null);
    };

    // ✅ Modal rendered via Portal (fix overflow/sticky/topbar clipping)
    const CheckoutModal = () => {
        if (!checkoutModal) return null;

        return createPortal(
            <div
                className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                role="dialog"
                aria-modal="true"
            >
                {/* Backdrop click closes modal */}
                <button
                    aria-label="Close modal"
                    onClick={closeModal}
                    className="absolute inset-0 cursor-default"
                />

                <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-black/90 p-6 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div className="text-2xl font-black text-white">
                            Checkout Success
                            <span className="text-lime-300">.</span>
                        </div>

                        <button
                            onClick={closeModal}
                            className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="mt-3 text-white/60">
                        Thanks for shopping!
                    </div>

                    <div className="mt-6 rounded-2xl border border-lime-300/20 bg-lime-300/10 p-4">
                        <div className="text-sm text-white/80">Total Paid</div>
                        <div className="mt-1 text-3xl font-black text-white">
                            {formatMoney(modalTotal)}
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full transition active:scale-95"
                            onClick={() =>
                                router.visit(route('products.index'))
                            }
                        >
                            Back to Products
                        </Button>

                        <Button
                            variant="ghost"
                            size="lg"
                            className="w-full border border-white/10 transition hover:bg-white/10 active:scale-95"
                            onClick={closeModal}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>,
            document.body,
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <Topbar
                    title="Cart"
                    subtitle="Review items and checkout."
                    rightSlot={
                        <Button
                            variant="ghost"
                            className="border border-white/10 transition hover:bg-white/10 active:scale-95"
                            onClick={() =>
                                router.visit(route('products.index'))
                            }
                        >
                            Continue Shopping
                        </Button>
                    }
                />
            }
        >
            <Head title="Cart" />

            {/* ✅ toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-[999] w-[320px] rounded-3xl border border-white/10 bg-black/80 p-4 shadow-2xl backdrop-blur-xl">
                    <div className="font-semibold text-white">
                        {toast.title}
                    </div>
                    <div className="mt-1 text-sm text-white/60">
                        {toast.message}
                    </div>
                    <div className="mt-3 flex justify-end">
                        <Button
                            variant="ghost"
                            className="border border-white/10"
                            onClick={() => setToast(null)}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}

            {/* ✅ checkout modal via portal */}
            <CheckoutModal />

            {hasError && (
                <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-100">
                    {errors.quantity || errors.stock || errors.cart}
                </div>
            )}

            {!cart?.items?.length ? (
                <Card>
                    <CardContent className="py-10 text-center">
                        <div className="text-2xl font-black text-white">
                            Cart is empty
                            <span className="text-lime-300">.</span>
                        </div>
                        <div className="mt-6 flex justify-center">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() =>
                                    router.visit(route('products.index'))
                                }
                            >
                                Browse Products
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-5 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        {cart.items.map((item) => {
                            const p = item.product;
                            const img =
                                p?.image_url || placeholderImage(p?.name);

                            const qtyNow = Number(
                                quantities[item.id] ?? item.quantity ?? 1,
                            );
                            const price = getPriceCents(p);
                            const subtotal = qtyNow * price;

                            return (
                                <Card key={item.id} className="overflow-hidden">
                                    <CardContent className="flex flex-col gap-4 sm:flex-row">
                                        <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:w-44">
                                            <img
                                                src={img}
                                                alt={p?.name || 'Product'}
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="truncate font-semibold text-white">
                                                        {p?.name ||
                                                            'Unnamed Product'}
                                                    </div>

                                                    <div className="mt-1 text-sm text-white/50">
                                                        {formatMoney(price)}
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="danger"
                                                    className="shrink-0"
                                                    onClick={() =>
                                                        removeItem(item.id)
                                                    }
                                                >
                                                    Remove
                                                </Button>
                                            </div>

                                            <Separator className="my-4" />

                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-white/60">
                                                        Qty
                                                    </span>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={
                                                            item.product
                                                                .stock_quantity
                                                        }
                                                        value={
                                                            quantities[
                                                                item.id
                                                            ] ?? item.quantity
                                                        }
                                                        onChange={(e) =>
                                                            setQuantities({
                                                                ...quantities,
                                                                [item.id]:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="h-10 w-24 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-lime-300/30"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        className="border border-white/10"
                                                        onClick={() =>
                                                            updateItem(item.id)
                                                        }
                                                    >
                                                        Update
                                                    </Button>
                                                </div>

                                                <div className="font-semibold text-white">
                                                    Subtotal:{' '}
                                                    <span className="text-lime-200">
                                                        {formatMoney(subtotal)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="h-fit space-y-4 lg:sticky lg:top-24">
                        <Card>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-lg font-black text-white">
                                        Summary
                                        <span className="text-lime-300"></span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="text-white/70">Total</div>
                                    <div className="text-xl font-black text-white">
                                        {formatMoney(total)}
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                    onClick={checkout}
                                >
                                    Checkout
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
