const PALETTE = ["var(--orange)", "var(--violet)", "var(--neon)", "oklch(0.9 0.18 95)"];

export function Balloon({ index, size }: { index: number; size: number }) {
  const color = PALETTE[index % PALETTE.length];
  return (
    <div
      className="relative"
      style={{ width: size, height: size * 1.5 }}
      aria-label={`balloon ${index + 1}`}
    >
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 rounded-[50%]"
        style={{
          width: size,
          height: size * 1.18,
          background: `radial-gradient(circle at 32% 28%, color-mix(in oklab, white 55%, ${color}) 0%, ${color} 45%, color-mix(in oklab, black 45%, ${color}) 100%)`,
          boxShadow: `0 0 18px color-mix(in oklab, ${color} 70%, transparent), inset -4px -6px 12px color-mix(in oklab, black 40%, transparent)`,
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: size * 1.12,
          width: 0,
          height: 0,
          borderLeft: `${size * 0.09}px solid transparent`,
          borderRight: `${size * 0.09}px solid transparent`,
          borderTop: `${size * 0.14}px solid ${color}`,
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: size * 1.24,
          width: 1.5,
          height: size * 0.3,
          background: "color-mix(in oklab, white 60%, transparent)",
        }}
      />
    </div>
  );
}
