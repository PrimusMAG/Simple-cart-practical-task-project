import { Badge, Button, Input } from '@/Components/ui';
import { router, usePage } from '@inertiajs/react';

export default function Topbar({
    title = 'Dashboard',
    subtitle = 'Discover your next fit.',
    search,
    setSearch,
    rightSlot,
}) {
    const { auth } = usePage().props;

    return (
        <div className="sticky top-0 z-30 border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-xl font-black tracking-tight text-white sm:text-2xl">
                            {title}
                            <span className="text-lime-300">.</span>
                        </div>
                        <div className="mt-1 text-sm text-white/50">
                            {subtitle}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge className="hidden sm:inline-flex">
                            {auth?.user?.name ?? 'User'}
                        </Badge>

                        {rightSlot}

                        <Button
                            variant="ghost"
                            className="border border-white/10"
                            onClick={() => router.post(route('logout'))}
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Search */}
                {typeof search === 'string' && (
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products, brands, drops..."
                            />
                        </div>
                        <Button
                            variant="primary"
                            className="hidden sm:inline-flex"
                            onClick={() => router.visit(route('cart.show'))}
                        >
                            Go to Cart
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
