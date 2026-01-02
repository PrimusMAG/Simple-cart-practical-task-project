import { cn } from '@/Components/ui';

export default function CategoryChips({ items = [], value, onChange }) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((c) => (
                <button
                    key={c}
                    onClick={() => onChange(c)}
                    className={cn(
                        'whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition',
                        value === c
                            ? 'border-lime-300/30 bg-lime-300/15 text-lime-200'
                            : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10',
                    )}
                >
                    {c}
                </button>
            ))}
        </div>
    );
}
