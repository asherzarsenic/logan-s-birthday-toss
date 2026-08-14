import { useEffect, useState, type ReactNode } from "react";

import { sfx } from "@/lib/game-audio";

type Power = "off" | "booting" | "on";

const BOOT_LINES = [
  "LOVEBOY-64 BIOS v1.9",
  "CHECKING BALLOONS... 8 OK",
  "LOADING KNIVES... 10 OK",
  "TARGET: YOUR FIANCEE",
  "PLAYER 1: LOGAN",
  "READY.",
];

export function ConsoleShell({ children }: { children: ReactNode }) {
  const [power, setPower] = useState<Power>("off");
  const [lines, setLines] = useState(0);

  useEffect(() => {
    if (power !== "booting") return;
    setLines(0);
    const timers: number[] = [];
    BOOT_LINES.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => {
          setLines(i + 1);
          sfx.pop?.();
        }, 260 * i + 420),
      );
    });
    timers.push(
      window.setTimeout(() => setPower("on"), 260 * BOOT_LINES.length + 900),
    );
    return () => timers.forEach(clearTimeout);
  }, [power]);

  return (
    <div
      className="flex min-h-[100dvh] w-full items-center justify-center bg-stage p-3"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, color-mix(in oklab, var(--violet) 22%, var(--stage)) 0%, var(--stage) 70%)",
      }}
    >
      <div
        className="w-full max-w-[560px] rounded-[34px] border-2 border-violet/60 p-3 pb-5"
        style={{
          background:
            "linear-gradient(170deg, oklch(0.26 0.04 300) 0%, oklch(0.16 0.03 300) 55%, oklch(0.12 0.02 300) 100%)",
          boxShadow:
            "0 0 60px color-mix(in oklab, var(--violet) 45%, transparent), inset 0 2px 0 oklch(1 0 0 / 0.12), inset 0 -6px 16px oklch(0 0 0 / 0.6)",
        }}
      >
        {/* top bezel */}
        <div className="mb-2 flex items-center justify-between px-3">
          <span className="font-display text-xs uppercase tracking-[0.35em] text-orange text-glow-orange">
            LoveBoy 64
          </span>
          <span className="flex items-center gap-2 font-hud text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
            Power
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: power === "off" ? "oklch(0.3 0.02 300)" : "var(--neon)",
                boxShadow: power === "off" ? "none" : "0 0 10px var(--neon)",
              }}
            />
          </span>
        </div>

        {/* screen */}
        <div
          className="scanlines relative aspect-[9/14] w-full overflow-hidden rounded-2xl border-2 border-black/70 bg-stage sm:aspect-[10/13]"
          style={{ boxShadow: "inset 0 0 40px oklch(0 0 0 / 0.9)" }}
        >
          {power === "on" ? (
            <div className="absolute inset-0 overflow-y-auto">{children}</div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-5 text-center">
              {power === "off" ? (
                <p className="font-hud text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                  Press power
                </p>
              ) : (
                <div className="w-full text-left font-hud text-[11px] leading-6 text-neon text-glow-neon">
                  {BOOT_LINES.slice(0, lines).map((l) => (
                    <div key={l}>&gt; {l}</div>
                  ))}
                  <span className="inline-block h-3 w-2 animate-pulse bg-neon align-middle" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* controls */}
        <div className="mt-4 flex items-center justify-between px-4">
          <div className="grid grid-cols-3 grid-rows-3 gap-[3px] opacity-70">
            {Array.from({ length: 9 }).map((_, i) => (
              <span
                key={i}
                className="h-3 w-3 rounded-[3px]"
                style={{
                  background:
                    i === 1 || i === 3 || i === 4 || i === 5 || i === 7
                      ? "oklch(0.32 0.03 300)"
                      : "transparent",
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              sfx.unlock?.();
              setPower((p) => (p === "off" ? "booting" : "off"));
            }}
            aria-label={power === "off" ? "Power on" : "Power off"}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-orange font-display text-[10px] uppercase tracking-widest text-orange transition-transform active:scale-95"
            style={{
              background: "color-mix(in oklab, var(--orange) 14%, transparent)",
              boxShadow:
                power === "off"
                  ? "0 0 18px color-mix(in oklab, var(--orange) 50%, transparent)"
                  : "0 0 28px var(--orange)",
              animation: power === "off" ? "marquee-flicker 2.4s ease-in-out infinite" : undefined,
            }}
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 3v9" />
              <path d="M5.6 6.4a9 9 0 1 0 12.8 0" />
            </svg>
          </button>

          <div className="flex gap-2">
            <span className="h-6 w-6 rounded-full border border-neon/60 bg-neon/10" />
            <span className="mt-3 h-6 w-6 rounded-full border border-violet/60 bg-violet/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
