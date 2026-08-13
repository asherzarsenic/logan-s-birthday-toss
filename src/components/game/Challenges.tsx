export type ChallengeStatus = "pending" | "done" | "failed";

export const CHALLENGES = [
  { key: "flawless", label: "Flawless", hint: "Don't hit me" },
  { key: "sharpshooter", label: "Sharpshooter", hint: "No misses" },
  { key: "combo", label: "Combo x3", hint: "3 pops in a row" },
] as const;

export type ChallengeResults = Record<string, ChallengeStatus>;

export function ChallengeStrip({ statuses }: { statuses: ChallengeResults }) {
  return (
    <div className="mt-3 flex w-full max-w-[560px] gap-2">
      {CHALLENGES.map((c) => {
        const s = statuses[c.key];
        return (
          <div
            key={c.key}
            className={`flex-1 rounded-lg border px-2 py-1.5 text-center transition-colors ${
              s === "done"
                ? "border-neon bg-neon/10"
                : s === "failed"
                  ? "border-border bg-stage/50 opacity-55"
                  : "border-border bg-stage/60"
            }`}
          >
            <div
              className={`font-hud text-[11px] uppercase tracking-[0.16em] ${
                s === "done"
                  ? "text-neon text-glow-neon"
                  : s === "failed"
                    ? "text-muted-foreground line-through"
                    : "text-muted-foreground"
              }`}
            >
              {s === "done" ? "✓ " : s === "failed" ? "✗ " : "◇ "}
              {c.label}
            </div>
            <div className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-muted-foreground/80">
              {c.hint}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LevelClear({
  levelIndex,
  levelCount,
  levelName,
  statuses,
  onNext,
}: {
  levelIndex: number;
  levelCount: number;
  levelName: string;
  statuses: ChallengeResults;
  onNext: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-stage/85 px-4 text-center backdrop-blur-[2px]">
      <div className="w-full max-w-xs">
        <p className="font-hud text-[11px] uppercase tracking-[0.35em] text-neon text-glow-neon">
          Level {levelIndex + 1} of {levelCount} complete
        </p>
        <h2 className="mt-2 font-display text-4xl uppercase leading-none tracking-wide text-orange text-glow-orange">
          {levelName} cleared
        </h2>

        <div className="mt-4 space-y-1.5 text-left">
          {CHALLENGES.map((c) => {
            const s = statuses[c.key];
            return (
              <div
                key={c.key}
                className={`flex items-center justify-between rounded-lg border px-3 py-1.5 ${
                  s === "done" ? "border-neon/60 bg-neon/10" : "border-border bg-stage/40"
                }`}
              >
                <span className="font-hud text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {c.label}
                </span>
                <span
                  className={
                    s === "done"
                      ? "font-hud text-[11px] uppercase tracking-[0.18em] text-neon text-glow-neon"
                      : "font-hud text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                  }
                >
                  {s === "done" ? "✓ earned" : "— missed"}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Next one&apos;s faster. And smaller. Keep those hands steady, babe.
        </p>

        <button
          type="button"
          onClick={onNext}
          className="mt-5 rounded-full border-2 border-orange bg-orange/10 px-7 py-2 font-hud text-xs uppercase tracking-[0.3em] text-orange transition-colors hover:bg-orange hover:text-primary-foreground"
        >
          Next level
        </button>
      </div>
    </div>
  );
}
