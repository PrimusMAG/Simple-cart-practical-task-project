import CategoryChips from '@/Components/CategoryChips';
import FloatingCartDock from '@/components/FloatingCartDock';
import ProductCard from '@/Components/ProductCard';
import ProductCarousel from '@/Components/ProductCarousel';
import Topbar from '@/Components/Topbar';
import {
    Badge,
    Button,
    Card,
    CardContent,
    Input,
    Separator,
} from '@/Components/ui';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

const safeRoute = (name, fallback) => {
    try {
        return route(name);
    } catch {
        return fallback;
    }
};

const toInt = (v, fallback = 1) => {
    const n = parseInt(v, 10);
    if (Number.isNaN(n) || n < 1) return fallback;
    return n;
};

const clamp = (num, min, max) => Math.max(min, Math.min(max, num));

function getSafeProducts(productsProp) {
    if (Array.isArray(productsProp)) return productsProp;
    if (productsProp?.data && Array.isArray(productsProp.data))
        return productsProp.data;
    return [];
}

function getCategoryList(products) {
    const set = new Set(['All']);
    products.forEach((p) => {
        if (p.category) set.add(p.category);
    });
    return Array.from(set);
}

// ✅ HERO IMAGES (stabil + tajam)
const HERO_IMAGES = [
    'https://images.pexels.com/photos/7318912/pexels-photo-7318912.jpeg?auto=compress&cs=tinysrgb&w=2200',
    'https://images.pexels.com/photos/6214389/pexels-photo-6214389.jpeg?auto=compress&cs=tinysrgb&w=2200',
    'https://images.pexels.com/photos/9594081/pexels-photo-9594081.jpeg?auto=compress&cs=tinysrgb&w=2200',
];

export default function Index({ products: productsProp }) {
    const { errors } = usePage().props;
    const products = useMemo(
        () => getSafeProducts(productsProp),
        [productsProp],
    );

    const [qty, setQty] = useState({});
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('featured');
    const [onlyInStock, setOnlyInStock] = useState(false);
    const [displayProducts, setDisplayProducts] = useState(products);
    const [toast, setToast] = useState(null);

    const productGridRef = useRef(null);
    const categories = useMemo(() => getCategoryList(products), [products]);

    // ✅ HERO BG (crossfade)
    const [heroIndex, setHeroIndex] = useState(() =>
        Math.floor(Math.random() * HERO_IMAGES.length),
    );
    const [heroFade, setHeroFade] = useState(true);

    // ✅ cinematic parallax state
    const [parallax, setParallax] = useState({ x: 0, y: 0 });
    const rafRef = useRef(null);
    const driftRef = useRef({ x: 0, y: 0, t: 0 });

    // ✅ preload (anti blank)
    useEffect(() => {
        HERO_IMAGES.forEach((src) => {
            const img = new Image();
            img.src = src;
        });
    }, []);

    // ✅ crossfade every 7s (lebih cinematic)
    useEffect(() => {
        const interval = setInterval(() => {
            setHeroFade(false);
            setTimeout(() => {
                setHeroIndex((i) => (i + 1) % HERO_IMAGES.length);
                setHeroFade(true);
            }, 520);
        }, 7000);

        return () => clearInterval(interval);
    }, []);

    // ✅ cinematic drift (slow auto movement)
    useEffect(() => {
        let running = true;

        const tick = () => {
            if (!running) return;

            driftRef.current.t += 0.006; // slow
            const t = driftRef.current.t;

            // subtle drift path
            const dx = Math.sin(t) * 10;
            const dy = Math.cos(t * 0.85) * 8;

            // combine with current parallax (mouse)
            setParallax((p) => ({
                x: p.x * 0.88 + dx * 0.12,
                y: p.y * 0.88 + dy * 0.12,
            }));

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            running = false;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    // ✅ mouse parallax (desktop)
    useEffect(() => {
        const onMove = (e) => {
            const { innerWidth: w, innerHeight: h } = window;
            const x = (e.clientX / w - 0.5) * 30; // strength
            const y = (e.clientY / h - 0.5) * 22;

            setParallax((p) => ({
                x: p.x * 0.7 + x * 0.3,
                y: p.y * 0.7 + y * 0.3,
            }));
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    // ✅ Filter
    useEffect(() => {
        let list = [...products];

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((p) =>
                (p.name ?? p.title ?? p.product_name ?? '')
                    .toLowerCase()
                    .includes(q),
            );
        }

        if (category !== 'All')
            list = list.filter((p) => p.category === category);
        if (onlyInStock) list = list.filter((p) => (p.stock_quantity ?? 0) > 0);

        if (sort === 'price_low')
            list.sort((a, b) => (a.price_cents ?? 0) - (b.price_cents ?? 0));
        if (sort === 'price_high')
            list.sort((a, b) => (b.price_cents ?? 0) - (a.price_cents ?? 0));
        if (sort === 'newest') list.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

        setDisplayProducts(list);
    }, [products, search, category, onlyInStock, sort]);

    // ✅ Cart Dock Ref
    const cartDockRef = useRef(null);

    // ✅ Fly animation
    const flyToCart = ({ imgSrc, fromRect }) => {
        if (!cartDockRef.current || !imgSrc || !fromRect) return;

        const dock = cartDockRef.current;
        const dockRect = dock.getBoundingClientRect();

        const fly = document.createElement('img');
        fly.src = imgSrc;
        fly.alt = 'fly-to-cart';
        fly.style.position = 'fixed';
        fly.style.zIndex = '9999';
        fly.style.left = `${fromRect.left}px`;
        fly.style.top = `${fromRect.top}px`;
        fly.style.width = `${fromRect.width}px`;
        fly.style.height = `${fromRect.height}px`;
        fly.style.objectFit = 'cover';
        fly.style.borderRadius = '18px';
        fly.style.boxShadow = '0 20px 60px rgba(0,0,0,0.55)';
        fly.style.pointerEvents = 'none';
        fly.style.transform = 'translate3d(0,0,0) scale(1)';
        fly.style.opacity = '1';
        fly.style.filter = 'blur(0px)';
        fly.style.transition =
            'transform 680ms cubic-bezier(.2,.8,.2,1), opacity 680ms cubic-bezier(.2,.8,.2,1), filter 680ms cubic-bezier(.2,.8,.2,1)';

        document.body.appendChild(fly);

        const targetX =
            dockRect.left +
            dockRect.width / 2 -
            (fromRect.left + fromRect.width / 2);
        const targetY =
            dockRect.top +
            dockRect.height / 2 -
            (fromRect.top + fromRect.height / 2);

        requestAnimationFrame(() => {
            fly.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(0.12)`;
            fly.style.opacity = '0.15';
            fly.style.filter = 'blur(2px)';
        });

        const cleanup = () => {
            fly.removeEventListener('transitionend', cleanup);
            fly.remove();
            dock.classList.add('scale-[1.08]');
            setTimeout(() => dock.classList.remove('scale-[1.08]'), 160);
        };

        fly.addEventListener('transitionend', cleanup);
    };

    // ✅ best seller / trending
    const bestSellers = useMemo(
        () => displayProducts.slice(0, 8),
        [displayProducts],
    );
    const hotNow = useMemo(() => {
        const list = displayProducts.slice(0, 12);
        if (list.length <= 8) return list;
        const odds = list.filter((_, idx) => idx % 2 === 1);
        const evens = list.filter((_, idx) => idx % 2 === 0);
        return [...odds, ...evens].slice(0, 10);
    }, [displayProducts]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 2500);
        return () => clearTimeout(t);
    }, [toast]);

    const addToCart = (productId) => {
        const product = products.find((p) => p.id === productId);
        const stock = product?.stock_quantity ?? 0;

        if (stock <= 0) {
            setToast({
                title: 'Out of stock',
                message: 'Produk ini sedang habis.',
            });
            return;
        }

        const rawQty = toInt(qty[productId], 1);
        const quantity = clamp(rawQty, 1, stock);

        if (quantity !== rawQty) {
            setQty((prev) => ({ ...prev, [productId]: quantity }));
        }

        router.post(
            safeRoute('cart.add', '/cart/add'),
            { product_id: productId, quantity },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setQty((prev) => ({ ...prev, [productId]: 1 }));
                    setToast({
                        title: 'Added to cart',
                        message: `Successfully added to cart (${quantity}).`,
                    });
                },
                onError: () =>
                    setToast({
                        title: 'Failed',
                        message: 'Gagal tambah ke cart (stok kurang?).',
                    }),
            },
        );
    };

    const handleAddWithFly = (payload) => {
        if (!payload) return;
        const productId = payload.productId;
        if (!productId) return;

        flyToCart({ imgSrc: payload.imgSrc, fromRect: payload.fromRect });
        addToCart(productId);
    };

    const smoothScrollTo = (targetY, duration = 900) => {
        const startY = window.scrollY;
        const diff = targetY - startY;
        const start = performance.now();

        const easeInOutCubic = (t) =>
            t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const step = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeInOutCubic(progress);
            window.scrollTo(0, startY + diff * eased);
            if (progress < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    };

    const scrollToGrid = () => {
        if (!productGridRef.current) return;
        const headerOffset = 110;
        const rect = productGridRef.current.getBoundingClientRect();
        const targetY = window.scrollY + rect.top - headerOffset;
        smoothScrollTo(targetY, 950);

        productGridRef.current.classList.add(
            'ring-2',
            'ring-lime-300/30',
            'rounded-3xl',
            'transition',
        );

        setTimeout(() => {
            productGridRef.current?.classList.remove(
                'ring-2',
                'ring-lime-300/30',
                'rounded-3xl',
            );
        }, 1200);
    };

    if (!products || products.length === 0) {
        return (
            <AuthenticatedLayout
                header={
                    <Topbar
                        title="Products"
                        subtitle="No products available."
                        search={search}
                        setSearch={setSearch}
                    />
                }
            >
                <Head title="Products" />
                <Card>
                    <CardContent className="py-10 text-center">
                        <div className="text-2xl font-black text-white">
                            No Products<span className="text-lime-300">.</span>
                        </div>
                        <div className="mt-2 text-white/50">
                            Backend belum mengirim data produk / kosong.
                        </div>
                    </CardContent>
                </Card>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <Topbar
                    title="Primu's Streetwear"
                    subtitle="Drop, hype, and hot deals — all in one place."
                    search={search}
                    setSearch={setSearch}
                    rightSlot={
                        <Button
                            variant="primary"
                            className="hidden transition active:scale-95 sm:inline-flex"
                            onClick={() =>
                                router.visit(safeRoute('cart.show', '/cart'))
                            }
                        >
                            View Cart
                        </Button>
                    }
                />
            }
        >
            <Head title="Products" />

            <FloatingCartDock
                cartDockRef={cartDockRef}
                onOpenCart={() => router.visit(safeRoute('cart.show', '/cart'))}
                toast={toast}
                onCloseToast={() => setToast(null)}
            />

            {(errors?.quantity || errors?.stock) && (
                <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-100">
                    {errors.quantity || errors.stock}
                </div>
            )}

            {/* ✅ CINEMATIC HERO */}
            <Card className="overflow-hidden">
                <div className="relative">
                    {/* ✅ background image (parallax + drift + brighter) */}
                    <div
                        className="duration-[760ms] ease-[cubic-bezier(.2,.8,.2,1)] absolute inset-0 transition-opacity"
                        style={{
                            backgroundImage: `url(${HERO_IMAGES[heroIndex]})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: heroFade ? 1 : 0,
                            transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0) scale(1.08)`,
                            filter: 'brightness(1.18) saturate(1.12) contrast(1.08)',
                            willChange: 'transform',
                        }}
                    />

                    {/* ✅ cinematic vignette + readable overlay */}
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 opacity-35">
                        <div className="h-full w-full bg-[radial-gradient(circle_at_25%_25%,rgba(124,255,107,0.30),transparent_40%),radial-gradient(circle_at_80%_35%,rgba(236,72,153,0.28),transparent_45%),radial-gradient(circle_at_60%_80%,rgba(34,211,238,0.22),transparent_42%)]" />
                    </div>

                    {/* ✅ subtle film grain */}
                    <div className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-overlay">
                        <div className="h-full w-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                    </div>

                    <div className="pointer-events-auto relative grid items-end gap-6 p-6 sm:p-8 lg:grid-cols-2 lg:p-10">
                        <div>
                            <Badge className="border-lime-300/30 bg-lime-300/10 text-lime-200">
                                NEW DROP
                            </Badge>

                            <div className="mt-3 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
                                Primus Store
                                <span className="text-lime-300"> </span>
                            </div>

                            <div className="mt-2 max-w-xl text-sm text-white/70 sm:text-base">
                                Cinematic shopping experience and premium.
                            </div>

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="transition active:scale-95"
                                    onClick={scrollToGrid}
                                >
                                    Explore Products
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="lg"
                                    className="border border-white/10 transition hover:bg-white/10 active:scale-95"
                                    onClick={() =>
                                        router.visit(
                                            safeRoute('cart.show', '/cart'),
                                        )
                                    }
                                >
                                    Open Cart
                                </Button>
                            </div>
                        </div>

                        {/* quick filter */}
                        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl">
                            <div className="font-semibold text-white">
                                Quick Filters
                            </div>
                            <div className="mt-1 text-xs text-white/60">
                                Realtime filter.
                            </div>

                            <div className="mt-4 space-y-3">
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search products..."
                                />

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() =>
                                            setOnlyInStock((v) => !v)
                                        }
                                        className={`rounded-full border px-4 py-2 text-xs font-semibold transition active:scale-95 ${
                                            onlyInStock
                                                ? 'border-lime-300/30 bg-lime-300/15 text-lime-200'
                                                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                                        }`}
                                    >
                                        In Stock Only
                                    </button>

                                    {[
                                        {
                                            label: 'Featured',
                                            value: 'featured',
                                        },
                                        {
                                            label: 'Price ↑',
                                            value: 'price_low',
                                        },
                                        {
                                            label: 'Price ↓',
                                            value: 'price_high',
                                        },
                                    ].map((btn) => (
                                        <button
                                            key={btn.value}
                                            onClick={() => setSort(btn.value)}
                                            className={`rounded-full border px-4 py-2 text-xs font-semibold transition active:scale-95 ${
                                                sort === btn.value
                                                    ? 'border-white/15 bg-white/10 text-white'
                                                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                                            }`}
                                        >
                                            {btn.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="text-xs text-white/50">
                                    Showing:{' '}
                                    <span className="text-white">
                                        {displayProducts.length}
                                    </span>{' '}
                                    items
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* category chips */}
            <div className="mt-6">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-lg font-black tracking-tight text-white">
                        Categories<span className="text-lime-300">.</span>
                    </div>

                    <Button
                        variant="ghost"
                        className="border border-white/10"
                        onClick={() => {
                            setCategory('All');
                            setSearch('');
                            setOnlyInStock(false);
                            setSort('featured');
                        }}
                    >
                        Reset
                    </Button>
                </div>

                <div className="mt-3">
                    <CategoryChips
                        items={categories}
                        value={category}
                        onChange={setCategory}
                    />
                </div>
            </div>

            {/* carousels */}
            <div className="mt-8 grid gap-8">
                <ProductCarousel
                    title="Best Sellers"
                    subtitle="Swipe / drag to explore."
                    products={bestSellers}
                    qty={qty}
                    setQty={setQty}
                    onAdd={handleAddWithFly}
                    badgeResolver={() => 'HOT'}
                    autoplay={false}
                />

                <ProductCarousel
                    title="Trending"
                    subtitle="Infinite carousel."
                    products={hotNow}
                    qty={qty}
                    setQty={setQty}
                    onAdd={handleAddWithFly}
                    badgeResolver={() => 'TREND'}
                    autoplay={false}
                />
            </div>

            <Separator className="my-10" />

            {/* grid */}
            <div ref={productGridRef} id="product-grid" className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <div className="text-lg font-black text-white sm:text-xl">
                            All Products<span className="text-lime-300">.</span>
                        </div>
                        <div className="mt-1 text-sm text-white/50">
                            Showing{' '}
                            <span className="text-white">
                                {displayProducts.length}
                            </span>{' '}
                            items
                            {search.trim() && (
                                <span className="text-white/40">
                                    {' '}
                                    — “{search}”
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {displayProducts.map((p) => (
                        <ProductCard
                            key={p.id}
                            product={p}
                            qtyValue={qty[p.id] ?? 1}
                            onQtyChange={(v) => setQty({ ...qty, [p.id]: v })}
                            onAdd={handleAddWithFly}
                            badge={
                                (p.stock_quantity ?? 0) <= 3 &&
                                (p.stock_quantity ?? 0) > 0
                                    ? 'Low Stock'
                                    : null
                            }
                        />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
