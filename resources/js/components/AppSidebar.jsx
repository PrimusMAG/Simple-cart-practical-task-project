import { Badge, cn } from '@/Components/ui';
import { router, usePage } from '@inertiajs/react';

function NavItem({ active, title, description, onClick }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full rounded-2xl border p-4 text-left transition',
                active
                    ? 'border-white/15 bg-white/10'
                    : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]',
            )}
        >
            <div className="flex items-center justify-between">
                <div className="font-semibold text-white">{title}</div>
                {active && (
                    <Badge className="border-lime-300/30 bg-lime-300/10 text-lime-200">
                        Active
                    </Badge>
                )}
            </div>
            <div className="mt-1 text-xs text-white/50">{description}</div>
        </button>
    );
}

export default function AppSidebar() {
    const { url } = usePage();

    return (
        <aside className="hidden p-5 lg:flex lg:w-[300px] lg:flex-col lg:gap-4">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="mt-1 text-xs text-white/50">
                            Streetwear Commerce Dashboard
                        </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-lime-300/20 bg-lime-300/15 font-bold text-lime-200">
                        W
                    </div>
                </div>

                <div className="mt-5 space-y-3">
                    <NavItem
                        active={url?.includes('products')}
                        title="Dashboard"
                        description="Carousel, promo & trending"
                        onClick={() => router.visit(route('products.index'))}
                    />
                    <NavItem
                        active={url?.includes('cart')}
                        title="Cart"
                        description="Checkout & manage items"
                        onClick={() => router.visit(route('cart.show'))}
                    />
                </div>
            </div>
        </aside>
    );
}
