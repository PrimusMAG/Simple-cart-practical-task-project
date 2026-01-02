import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function FloatingCartDock({
    cartDockRef,
    onOpenCart,
    toast,
    onCloseToast,
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // ✅ render into <body> supaya FIXED benar-benar nempel layar
    if (!mounted) return null;

    return createPortal(
        <>
            {/* ✅ Cart Dock */}
            <div className="pointer-events-auto fixed bottom-6 right-6 z-[9999]">
                <button
                    ref={cartDockRef}
                    onClick={onOpenCart}
                    className="group relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/70 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl transition hover:bg-white/10 active:scale-[0.98]"
                >
                    <div className="text-xl text-lime-300 transition group-hover:scale-110">
                        🛍️
                    </div>

                    {/* glow */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition group-hover:opacity-100">
                        <div className="absolute -inset-2 rounded-[22px] bg-lime-300/10 blur-xl" />
                    </div>
                </button>
            </div>

            {/* ✅ Toast */}
            {toast && (
                <div className="fixed bottom-24 right-6 z-[10000] w-[320px] rounded-3xl border border-white/10 bg-black/80 p-4 shadow-2xl backdrop-blur-xl">
                    <div className="font-semibold text-white">
                        {toast.title}
                    </div>
                    <div className="mt-1 text-sm text-white/60">
                        {toast.message}
                    </div>
                    <div className="mt-3 flex justify-end">
                        <button
                            onClick={onCloseToast}
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 active:scale-95"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>,
        document.body,
    );
}
