export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

export function Button({
    className = '',
    variant = 'default',
    size = 'md',
    ...props
}) {
    const variants = {
        default:
            'bg-white/10 text-white hover:bg-white/15 border border-white/10',
        primary:
            'bg-lime-400 text-black hover:bg-lime-300 border border-lime-400/20',
        ghost: 'bg-transparent text-white hover:bg-white/10',
        danger: 'bg-red-500/20 text-red-100 hover:bg-red-500/30 border border-red-500/30',
    };

    const sizes = {
        sm: 'h-9 px-3 text-sm rounded-xl',
        md: 'h-10 px-4 text-sm rounded-xl',
        lg: 'h-12 px-5 text-base rounded-2xl',
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center gap-2 font-medium transition active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50',
                variants[variant],
                sizes[size],
                className,
            )}
            {...props}
        />
    );
}

export function Input({ className = '', ...props }) {
    return (
        <input
            className={cn(
                'h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-lime-300/30 focus:ring-2 focus:ring-lime-300/30',
                className,
            )}
            {...props}
        />
    );
}

export function Badge({ className = '', ...props }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/80',
                className,
            )}
            {...props}
        />
    );
}

export function Card({ className = '', ...props }) {
    return (
        <div
            className={cn(
                'rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl',
                className,
            )}
            {...props}
        />
    );
}

export function CardHeader({ className = '', ...props }) {
    return <div className={cn('p-5 pb-0', className)} {...props} />;
}

export function CardContent({ className = '', ...props }) {
    return <div className={cn('p-5', className)} {...props} />;
}

export function Separator({ className = '' }) {
    return <div className={cn('h-px bg-white/10', className)} />;
}
