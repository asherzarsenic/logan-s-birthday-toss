export function WinCard({
  onReplay,
  levelCount,
  mastered,
  totalChallenges,
}: {
  onReplay: () => void;
  levelCount: number;
  mastered: number;
  totalChallenges: number;
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-stage/85 px-4 backdrop-blur-[2px]">
      {Array.from({ length: 26 }).map((_, i) => (
        <span
          key={i}
          className="pointer-events-none absolute top-0 block"
          style={{
            left: `${(i * 3.9) % 100}%`,
            width: 7,
            height: 12,
            background: ["var(--orange)", "var(--violet)", "var(--neon)", "oklch(0.9 0.18 95)"][
              i % 4
            ],
            animation: `confetti-fall ${2.4 + (i % 5) * 0.45}s linear ${(i % 7) * 0.22}s infinite`,
          }}
        />
      ))}

      <div
        className="relative w-full max-w-md rounded-2xl border-2 border-orange bg-card p-6 text-center"
        style={{
          boxShadow:
            "0 0 40px color-mix(in oklab, var(--orange) 45%, transparent), inset 0 0 30px color-mix(in oklab, var(--violet) 30%, transparent)",
        }}
      >
        <p className="font-hud text-[11px] uppercase tracking-[0.35em] text-neon">
          All {levelCount} levels cleared
        </p>
        <h2 className="mt-3 font-display text-3xl uppercase leading-tight tracking-wide text-orange text-glow-orange">
          Happy Birthday, Logan <span className="text-neon text-glow-neon">&hearts;</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          You made it through every level — popping balloons, dodging knives, and keeping me
          (mostly) unscathed. That&apos;s the kind of precision I&apos;m marrying. Here&apos;s to
          another year of you — you&apos;re my favorite person, my favorite chaos, my favorite
          everything.
        </p>
        <p className="mt-4 font-hud text-[11px] uppercase tracking-[0.25em] text-violet text-glow-violet">
          Levels {levelCount}/{levelCount} &middot; Challenges {mastered}/{totalChallenges}
        </p>
        <p className="mt-2 font-hud text-xs uppercase tracking-[0.3em] text-violet text-glow-violet">
          I love you &mdash; now untie me
        </p>
        <button
          type="button"
          onClick={onReplay}
          className="mt-6 rounded-full border-2 border-neon px-6 py-2 font-hud text-xs uppercase tracking-[0.3em] text-neon transition-colors hover:bg-neon hover:text-accent-foreground"
        >
          Play again
        </button>
      </div>
    </div>
  );
}
