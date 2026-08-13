import { Knife } from "./Knife";

export function Hud({
  knivesLeft,
  totalKnives,
  lives,
  balloonsLeft,
  muted,
  onToggleMute,
}: {
  knivesLeft: number;
  totalKnives: number;
  lives: number;
  balloonsLeft: number;
  muted: boolean;
  onToggleMute: () => void;
}) {
  return (
    <div className="flex w-full items-end justify-between gap-3 font-hud text-xs uppercase tracking-[0.2em]">
      <div>
        <div className="text-muted-foreground">Knives</div>
        <div className="mt-1 flex gap-[3px]">
          {Array.from({ length: totalKnives }).map((_, i) => (
            <Knife
              key={i}
              className="h-6 w-[9px]"
              style={{ opacity: i < knivesLeft ? 1 : 0.18 }}
            />
          ))}
        </div>
      </div>

      <div className="text-center">
        <div className="text-muted-foreground">Balloons</div>
        <div className="font-display text-2xl leading-none text-orange text-glow-orange">
          {balloonsLeft}
        </div>
      </div>

      <div className="text-right">
        <div className="text-muted-foreground">Patience</div>
        <div className="mt-1 flex justify-end gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className="text-base leading-none"
              style={{
                color: i < lives ? "var(--neon)" : "var(--muted)",
                filter:
                  i < lives
                    ? "drop-shadow(0 0 6px color-mix(in oklab, var(--neon) 80%, transparent))"
                    : undefined,
              }}
            >
              ♥
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={onToggleMute}
          className="mt-1 text-[10px] tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        >
          {muted ? "sound off" : "sound on"}
        </button>
      </div>
    </div>
  );
}
