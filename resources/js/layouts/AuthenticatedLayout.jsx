import AppSidebar from '@/Components/AppSidebar';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const safeRoute = (name, fallback) => {
    try {
        return route(name);
    } catch {
        return fallback;
    }
};

export default function AuthenticatedLayout({ header, children }) {
    const { flash, url } = usePage().props;

    const cartDockRef = useRef(null);

    // ✅ transition state
    const [stage, setStage] = useState('enter'); // enter | idle | exit
    const prevUrl = useRef(url);

    useEffect(() => {
        // first load
        setStage('enter');
        const t = setTimeout(() => setStage('idle'), 320);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        // url changed => trigger exit then enter
        if (prevUrl.current !== url) {
            setStage('exit');

            const t1 = setTimeout(() => {
                setStage('enter');
                const t2 = setTimeout(() => setStage('idle'), 320);
                return () => clearTimeout(t2);
            }, 220);

            prevUrl.current = url;
            return () => clearTimeout(t1);
        }
    }, [url]);

    const transitionClass =
        stage === 'enter'
            ? 'opacity-0 blur-[10px] translate-y-[10px] scale-[0.985]'
            : stage === 'exit'
              ? 'opacity-0 blur-[8px] translate-y-[6px] scale-[0.99]'
              : 'opacity-100 blur-0 translate-y-0 scale-100';

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#060606] text-white">
            {/* subtle background */}
            <div className="pointer-events-none fixed inset-0 opacity-80">
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-lime-300/10 blur-3xl" />
                <div className="absolute -right-32 top-40 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
            </div>

            <div className="relative">
                <div className="flex">
                    <AppSidebar />

                    <main className="min-w-0 flex-1">
                        {header}

                        {/* ✅ PAGE TRANSITION WRAPPER */}
                        <div
                            className={`duration-[420ms] ease-[cubic-bezier(.2,.8,.2,1)] px-4 py-6 transition-all will-change-transform sm:px-6 lg:px-8 ${transitionClass}`}
                        >
                            {/* ✅ Global flash message */}
                            {flash?.success && (
                                <div className="mb-4 rounded-2xl border border-lime-300/20 bg-lime-300/10 p-4 text-lime-100">
                                    {flash.success}
                                </div>
                            )}

                            {children}
                        </div>
                    </main>
                </div>
            </div>

            {/* ✅ Cart Dock HARUS di luar flash dan di luar wrapper */}
            <div className="fixed bottom-6 right-6 z-[999]">
                <button
                    ref={cartDockRef}
                    onClick={() =>
                        router.visit(safeRoute('cart.show', '/cart'))
                    }
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
        </div>
    );
}
