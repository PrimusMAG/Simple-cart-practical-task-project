import ProductCard from '@/Components/ProductCard';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function ProductCarousel({
    title,
    subtitle,
    products = [],
    qty,
    setQty,
    onAdd,
    badgeResolver,
    autoplay = false, // ✅ default off
}) {
    const scrollerRef = useRef(null);

    // drag state
    const drag = useRef({
        active: false,
        startX: 0,
        startScrollLeft: 0,
        pointerId: null,
        rafId: null,
        lastX: 0,
    });

    const lastTeleportAt = useRef(0);

    // ✅ Infinite: duplicate 3x
    const items = useMemo(() => {
        if (!products?.length) return [];
        return [...products, ...products, ...products];
    }, [products]);

    // ✅ Jump to middle on mount
    useEffect(() => {
        if (!scrollerRef.current) return;
        const el = scrollerRef.current;

        requestAnimationFrame(() => {
            const third = el.scrollWidth / 3;
            if (third > 0) el.scrollLeft = third;
        });
    }, [products]);

    // ✅ Infinite teleport
    const handleInfinite = () => {
        if (!scrollerRef.current) return;
        const el = scrollerRef.current;

        const third = el.scrollWidth / 3;
        if (!third) return;

        const now = Date.now();
        if (now - lastTeleportAt.current < 120) return;

        if (el.scrollLeft < third * 0.35) {
            lastTeleportAt.current = now;
            el.scrollLeft += third;
        }

        if (el.scrollLeft > third * 1.65) {
            lastTeleportAt.current = now;
            el.scrollLeft -= third;
        }
    };

    // ✅ scroll left / right
    const scroll = (dir) => {
        if (!scrollerRef.current) return;
        const el = scrollerRef.current;
        const amount = 420;
        el.scrollBy({
            left: dir === 'left' ? -amount : amount,
            behavior: 'smooth',
        });
    };

    const isInteractiveTarget = (target) => {
        if (!(target instanceof HTMLElement)) return false;
        return Boolean(
            target.closest('button, a, input, textarea, select, label'),
        );
    };

    // ✅ drag
    const onPointerDown = (e) => {
        if (!scrollerRef.current) return;
        if (isInteractiveTarget(e.target)) return;

        const el = scrollerRef.current;
        el.classList.add('scroll-auto');

        drag.current.active = true;
        drag.current.startX = e.clientX;
        drag.current.lastX = e.clientX;
        drag.current.startScrollLeft = el.scrollLeft;
        drag.current.pointerId = e.pointerId;

        if (drag.current.rafId) cancelAnimationFrame(drag.current.rafId);
        drag.current.rafId = null;

        try {
            el.setPointerCapture(e.pointerId);
        } catch {}

        e.preventDefault();
    };

    const onPointerMove = (e) => {
        if (!scrollerRef.current) return;
        if (!drag.current.active) return;
        if (drag.current.pointerId !== e.pointerId) return;

        const el = scrollerRef.current;
        drag.current.lastX = e.clientX;

        if (!drag.current.rafId) {
            drag.current.rafId = requestAnimationFrame(() => {
                const dx = drag.current.lastX - drag.current.startX;
                el.scrollLeft = drag.current.startScrollLeft - dx * 1.2;
                drag.current.rafId = null;
            });
        }
    };

    const endDrag = () => {
        if (!scrollerRef.current) return;
        const el = scrollerRef.current;

        if (!drag.current.active) return;
        drag.current.active = false;

        try {
            if (drag.current.pointerId !== null)
                el.releasePointerCapture(drag.current.pointerId);
        } catch {}

        drag.current.pointerId = null;

        if (drag.current.rafId) {
            cancelAnimationFrame(drag.current.rafId);
            drag.current.rafId = null;
        }

        el.classList.remove('scroll-auto');
    };

    // ✅ Wheel: vertical scroll -> horizontal scroll
    const onWheel = (e) => {
        if (!scrollerRef.current) return;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            scrollerRef.current.scrollLeft += e.deltaY;
        }
    };

    // ✅ show arrows only when hover (premium)
    const [hover, setHover] = useState(false);

    return (
        <div className="w-full min-w-0 space-y-3">
            <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-lg font-black tracking-tight text-white sm:text-xl">
                        {title}
                        <span className="text-lime-300">.</span>
                    </div>
                    {subtitle && (
                        <div className="mt-1 text-sm text-white/50">
                            {subtitle}
                        </div>
                    )}
                </div>

                {/* ✅ HAPUS PANAH KANAN ATAS */}
            </div>

            {/* ✅ MODERN EDGE ARROWS */}
            <div
                className="group relative w-full min-w-0 max-w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                {/* ✅ left fade */}
                <div className="pointer-events-none absolute left-0 top-0 z-[2] h-full w-16 bg-gradient-to-r from-black/65 to-transparent" />
                {/* ✅ right fade */}
                <div className="pointer-events-none absolute right-0 top-0 z-[2] h-full w-16 bg-gradient-to-l from-black/65 to-transparent" />

                {/* ✅ left arrow */}
                <button
                    type="button"
                    onClick={() => scroll('left')}
                    className={`absolute left-3 top-1/2 z-[3] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/10 bg-black/50 text-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:text-white active:scale-[0.96] ${hover ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'} `}
                >
                    <span className="text-xl">‹</span>
                </button>

                {/* ✅ right arrow */}
                <button
                    type="button"
                    onClick={() => scroll('right')}
                    className={`absolute right-3 top-1/2 z-[3] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/10 bg-black/50 text-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:text-white active:scale-[0.96] ${hover ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'} `}
                >
                    <span className="text-xl">›</span>
                </button>

                {/* ✅ scroller */}
                <div
                    ref={scrollerRef}
                    style={{ touchAction: 'pan-x' }}
                    onScroll={handleInfinite}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onPointerLeave={endDrag}
                    onWheel={onWheel}
                    className="flex w-full min-w-0 max-w-full cursor-grab select-none snap-x snap-mandatory flex-nowrap gap-4 overflow-x-auto overscroll-x-contain scroll-smooth px-4 py-4 [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
                >
                    {items.map((p, idx) => (
                        <div
                            key={`${p.id}-${idx}`}
                            className="min-w-[280px] max-w-[280px] flex-none shrink-0 snap-start"
                            draggable={false}
                        >
                            <ProductCard
                                product={p}
                                compact
                                qtyValue={qty[p.id] ?? 1}
                                onQtyChange={(v) =>
                                    setQty({ ...qty, [p.id]: v })
                                }
                                onAdd={onAdd}
                                badge={badgeResolver?.(p)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
