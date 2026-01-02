import { useMemo } from 'react';

export default function ProductImage({
    name = 'Product',
    src = null,
    className = '',
}) {
    // ✅ If URL provided, use it
    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={`h-full w-full object-cover ${className}`}
                loading="lazy"
                onError={(e) => {
                    // fallback if image broken
                    e.currentTarget.style.display = 'none';
                }}
            />
        );
    }

    // ✅ Fallback SVG if no src
    const { bg, fg, initials } = useMemo(() => {
        const colors = [
            ['#0f172a', '#ffffff'],
            ['#111827', '#ffffff'],
            ['#1e293b', '#ffffff'],
            ['#0b1220', '#ffffff'],
        ];
        let sum = 0;
        for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
        const [bg, fg] = colors[sum % colors.length];

        const parts = name.trim().split(/\s+/);
        const initials =
            parts.length === 1
                ? parts[0].slice(0, 2).toUpperCase()
                : (parts[0][0] + parts[1][0]).toUpperCase();

        return { bg, fg, initials };
    }, [name]);

    const svg = useMemo(() => {
        const s = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${bg}" stop-opacity="1"/>
            <stop offset="100%" stop-color="${bg}" stop-opacity="0.8"/>
          </linearGradient>
        </defs>
        <rect width="600" height="400" fill="url(#g)"/>
        <circle cx="470" cy="90" r="140" fill="rgba(255,255,255,0.08)"/>
        <circle cx="120" cy="340" r="190" fill="rgba(255,255,255,0.06)"/>
        <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle"
          font-family="ui-sans-serif, system-ui, -apple-system" font-size="96" font-weight="700"
          fill="${fg}" opacity="0.95">${initials}</text>
      </svg>
    `.trim();
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`;
    }, [bg, fg, initials]);

    return (
        <img
            src={svg}
            alt={name}
            className={`h-full w-full object-cover ${className}`}
            loading="lazy"
        />
    );
}
