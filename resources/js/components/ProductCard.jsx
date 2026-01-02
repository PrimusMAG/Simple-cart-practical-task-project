import { Badge, Button, Card, CardContent, cn } from '@/Components/ui';
import { useMemo, useRef } from 'react';

const formatMoney = (cents) =>
    new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);

function placeholderImage(name) {
    const label = encodeURIComponent(name?.slice(0, 16) ?? 'Drop');
    return `https://dummyimage.com/900x900/0b0b0b/7CFF6B&text=${label}`;
}

const toInt = (v, fallback = 1) => {
    const n = parseInt(v, 10);
    if (Number.isNaN(n) || n < 1) return fallback;
    return n;
};

const clamp = (num, min, max) => Math.max(min, Math.min(max, num));

export default function ProductCard({
    product,
    qtyValue = 1,
    onQtyChange,
    onAdd,
    compact = false,
    badge,
}) {
    const imgRef = useRef(null);

    const img = useMemo(() => {
        return product?.image_url || placeholderImage(product?.name);
    }, [product]);

    const stock = product?.stock_quantity ?? 0;

    const safeQty = useMemo(() => {
        if (stock <= 0) return 1;
        return clamp(toInt(qtyValue, 1), 1, stock);
    }, [qtyValue, stock]);

    const outOfStock = stock <= 0;
    const atMax = !outOfStock && safeQty >= stock;

    const handleAdd = () => {
        if (outOfStock) return;

        const rect = imgRef.current?.getBoundingClientRect();

        // ✅ send payload for fly animation + backend
        onAdd?.({
            productId: product.id,
            imgSrc: img,
            fromRect: rect,
        });
    };

    return (
        <Card className="group overflow-hidden">
            <div className="relative">
                <img
                    ref={imgRef}
                    src={img}
                    alt={product?.name || 'Product'}
                    draggable={false}
                    className={cn(
                        'pointer-events-none w-full object-cover transition duration-500 group-hover:scale-[1.04]',
                        compact ? 'h-40' : 'h-56',
                    )}
                    loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90" />

                <div className="absolute left-4 top-4 flex items-center gap-2">
                    {badge && (
                        <Badge className="border-lime-300/20 bg-lime-300/15 text-lime-200">
                            {badge}
                        </Badge>
                    )}
                    {outOfStock && (
                        <Badge className="border-red-500/20 bg-red-500/15 text-red-100">
                            Out of stock
                        </Badge>
                    )}
                </div>

                <div className="absolute right-4 top-4">
                    <Badge className="bg-white/10">
                        {formatMoney(product.price_cents)}
                    </Badge>
                </div>
            </div>

            <CardContent className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="font-semibold leading-tight text-white">
                            {product.name}
                        </div>
                        <div className="mt-1 text-xs text-white/50">
                            Stock: {stock}
                        </div>
                    </div>

                    {product.category && (
                        <Badge className="hidden sm:inline-flex">
                            {product.category}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        min="1"
                        max={stock > 0 ? stock : undefined}
                        value={safeQty}
                        onChange={(e) => {
                            const val = toInt(e.target.value, 1);
                            if (stock <= 0) return onQtyChange(1);
                            onQtyChange(clamp(val, 1, stock));
                        }}
                        onBlur={() => {
                            if (stock <= 0) return onQtyChange(1);
                            onQtyChange(clamp(toInt(safeQty, 1), 1, stock));
                        }}
                        className="h-10 w-24 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-lime-300/30"
                        disabled={outOfStock}
                    />

                    <Button
                        variant="primary"
                        className="flex-1 transition duration-150 active:scale-[0.97]"
                        onClick={handleAdd}
                        disabled={outOfStock || safeQty > stock}
                    >
                        Add to Cart
                    </Button>
                </div>

                {!outOfStock && atMax && (
                    <div className="text-xs text-white/40">
                        Max qty reached (stock limit).
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
