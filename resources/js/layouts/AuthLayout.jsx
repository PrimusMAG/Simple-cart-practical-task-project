import { Link } from '@inertiajs/react';
export default function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
                <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-stretch">
                    {/* Left */}
                    <div className="hidden lg:flex">
                        <div className="flex w-full flex-col justify-between rounded-3xl bg-slate-900 p-10 text-white">
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-white/10" />
                                    <div>
                                        <div className="text-sm font-semibold">
                                            SimpleCart
                                        </div>
                                        <div className="text-xs text-white/70">
                                            Modern e-commerce cart
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 text-3xl font-semibold tracking-tight">
                                    A clean, modern cart experience.
                                </div>
                                <div className="mt-3 text-sm leading-relaxed text-white/70">
                                    Built with Laravel, Inertia, React,
                                    Tailwind, Jobs & Scheduler.
                                </div>
                            </div>

                            <div className="text-xs text-white/60">
                                © {new Date().getFullYear()} SimpleCart. All
                                rights reserved.
                            </div>
                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center">
                        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <div className="mb-6">
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                                    {title}
                                </h1>
                                {subtitle && (
                                    <p className="mt-1 text-sm text-slate-600">
                                        {subtitle}
                                    </p>
                                )}
                            </div>

                            {children}

                            <div className="mt-8 text-center text-xs text-slate-500">
                                <Link
                                    href="/"
                                    className="underline-offset-4 hover:text-slate-700 hover:underline"
                                >
                                    Back to home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
