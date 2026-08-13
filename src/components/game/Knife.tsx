export function Knife({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 28 120" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id="blade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.98 0.02 200)" />
          <stop offset="45%" stopColor="oklch(0.82 0.03 210)" />
          <stop offset="55%" stopColor="oklch(0.62 0.03 250)" />
          <stop offset="100%" stopColor="oklch(0.4 0.03 260)" />
        </linearGradient>
      </defs>
      <path d="M14 2 L23 44 L21 68 L7 68 L5 44 Z" fill="url(#blade)" />
      <path d="M14 2 L14 68" stroke="oklch(0.98 0.02 200)" strokeWidth="0.8" opacity="0.7" />
      <rect x="2" y="66" width="24" height="7" rx="2" fill="var(--neon)" />
      <rect x="8" y="72" width="12" height="40" rx="5" fill="oklch(0.2 0.03 300)" />
      <rect x="8" y="72" width="12" height="40" rx="5" fill="none" stroke="var(--violet)" strokeWidth="1.6" />
      <circle cx="14" cy="115" r="5" fill="var(--orange)" />
    </svg>
  );
}
