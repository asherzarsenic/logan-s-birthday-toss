import { useCallback, useEffect, useRef, useState } from "react";

import { sfx } from "@/lib/game-audio";

type BootStage = "off" | "static" | "logo";

/* FeTurbulence-generated noise tile used as CRT static. */
const STATIC_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E")`;

export function Intro({ onEnter }: { onEnter: () => void }) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [screenW, setScreenW] = useState(0);
  const [powered, setPowered] = useState(false);
  const [bootStage, setBootStage] = useState<BootStage>("off");
  const [zoom, setZoom] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  /* track the TV screen's rendered width so boot content scales with it */
  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const update = () => setScreenW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const powerOn = useCallback(() => {
    if (powered) return;
    sfx.unlock();
    sfx.powerOn();
    setPowered(true);
    setBootStage("static");

    // static -> boot logo bloom
    window.setTimeout(() => setBootStage("logo"), 620);
    // begin flying into the screen
    window.setTimeout(() => {
      const el = screenRef.current;
      if (!el) {
        onEnter();
        return;
      }
      const r = el.getBoundingClientRect();
      sfx.zoom();
      setZoom({ x: r.left, y: r.top, w: r.width, h: r.height });
    }, 1900);
    // hand off to the game once the zoom lands
    window.setTimeout(onEnter, 2780);
  }, [powered, onEnter]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        background: "radial-gradient(120% 120% at 50% 26%, #2a2038 0%, #17121e 45%, #07060a 100%)",
      }}
    >
      {/* faint wallpaper texture behind everything */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.022) 0 2px, transparent 2px 64px), repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 74px)",
        }}
      />
      {/* warm ambient glow from the "room" */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 50% 100%, color-mix(in oklab, var(--orange) 12%, transparent) 0%, transparent 60%)",
        }}
      />

      {/* ---------- stage (16:10, scales to fit viewport) ---------- */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: "min(94vw, 150.4vh)", aspectRatio: "16 / 10" }}
      >
        {/* floor */}
        <div
          className="absolute"
          style={{
            left: 0,
            right: 0,
            top: "72%",
            bottom: 0,
            background: "linear-gradient(180deg, #3a2517 0%, #241610 60%, #150d08 100%)",
          }}
        />

        {/* TV stand / table */}
        <div
          className="absolute"
          style={{
            left: "6%",
            right: "6%",
            top: "60%",
            height: "4.5%",
            borderRadius: 6,
            background: "linear-gradient(180deg, #6d4a2c, #4a2f1b)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
          }}
        />
        <div
          className="absolute"
          style={{
            left: "8%",
            right: "8%",
            top: "64.5%",
            height: "7.5%",
            background: "linear-gradient(180deg, #54371f, #33200f)",
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5)",
          }}
        />

        {/* ---------- TV ---------- */}
        <div className="absolute" style={{ left: "27%", top: "6%", width: "46%", height: "54%" }}>
          {/* antenna */}
          <div
            className="absolute"
            style={{
              left: "50%",
              top: "-8%",
              width: 3,
              height: "16%",
              transform: "translateX(-50%) rotate(8deg)",
              background: "#9a938a",
              borderRadius: 2,
              transformOrigin: "bottom center",
            }}
          />
          <div
            className="absolute"
            style={{
              left: "50%",
              top: "-8%",
              width: "24%",
              height: 3,
              transform: "translateX(-50%) rotate(-14deg)",
              background: "#9a938a",
              borderRadius: 2,
            }}
          />
          <div
            className="absolute"
            style={{
              left: "50%",
              top: "-8%",
              width: "24%",
              height: 3,
              transform: "translateX(-50%) rotate(24deg)",
              background: "#9a938a",
              borderRadius: 2,
            }}
          />
          <div
            className="absolute"
            style={{
              left: "calc(50% - 24%/2)",
              top: "-9.5%",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "var(--orange)",
            }}
          />
          <div
            className="absolute"
            style={{
              left: "calc(50% + 24%/2 - 4px)",
              top: "-9.5%",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "var(--orange)",
            }}
          />

          {/* casing */}
          <div
            className="absolute"
            style={{
              inset: 0,
              borderRadius: "5.5% / 6%",
              background: "linear-gradient(180deg, #ece0c8 0%, #dccdb0 46%, #c4b294 100%)",
              boxShadow:
                "inset 0 2px 0 rgba(255,255,255,0.65), inset 0 -10px 24px rgba(90,68,40,0.35), 0 18px 40px rgba(0,0,0,0.6)",
            }}
          />
          {/* top highlight */}
          <div
            className="absolute"
            style={{
              left: "4%",
              right: "4%",
              top: "3%",
              height: "10%",
              borderRadius: 999,
              background: "linear-gradient(180deg, rgba(255,255,255,0.5), transparent)",
            }}
          />

          {/* screen bezel */}
          <div
            className="absolute"
            style={{
              left: "7%",
              top: "12%",
              right: "7%",
              bottom: "16%",
              borderRadius: "6% / 8%",
              background: "linear-gradient(180deg, #2c2420 0%, #17130f 100%)",
              boxShadow: "inset 0 2px 6px rgba(0,0,0,0.9), inset 0 0 0 3px rgba(0,0,0,0.55)",
            }}
          >
            {/* the actual glass screen */}
            <div
              ref={screenRef}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
              style={{
                width: "76%",
                aspectRatio: "4 / 3",
                borderRadius: "10% / 12%",
                background: "#0a0a0d",
                boxShadow: "0 0 0 4px #0c0b0e, inset 0 0 26px rgba(0,0,0,0.9)",
              }}
            >
              {screenW > 0 && <BootScreen size={screenW} stage={bootStage} />}
            </div>
          </div>

          {/* speaker grille */}
          <div
            className="absolute"
            style={{ right: "10%", bottom: "4%", width: "30%", height: "7%" }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 1.5,
                  marginBottom: "8%",
                  background: "rgba(60,50,40,0.5)",
                  borderRadius: 2,
                }}
              />
            ))}
          </div>

          {/* channel + volume knobs */}
          <div
            className="absolute"
            style={{
              left: "5%",
              bottom: "3%",
              width: "20%",
              height: "11%",
              display: "flex",
              gap: "14%",
            }}
          >
            {[0, 1].map((i) => (
              <div key={i} className="relative" style={{ flex: 1 }}>
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: "68%",
                    aspectRatio: "1",
                    background: "radial-gradient(circle at 35% 30%, #4a443c, #241f1a)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.6)",
                  }}
                />
                <div
                  className="absolute left-1/2 top-1/2 rounded-full"
                  style={{
                    width: "18%",
                    aspectRatio: "1",
                    transform: "translate(-50%,-50%) translateY(-30%)",
                    background: "#e8dcc2",
                  }}
                />
              </div>
            ))}
          </div>

          {/* TV power button + LED */}
          <button
            type="button"
            onClick={powerOn}
            aria-label="Turn on the TV"
            className="absolute cursor-pointer"
            style={{ left: "3%", bottom: "24%", width: "7%", height: "11%" }}
            title="Power"
          >
            <span
              className="absolute inset-0 rounded-full transition-transform"
              style={{
                background: powered
                  ? "radial-gradient(circle at 40% 35%, #ff6a6a, #b32020)"
                  : "radial-gradient(circle at 40% 35%, #c94a4a, #7a1616)",
                boxShadow: powered ? "0 0 14px rgba(255,80,80,0.9)" : "0 2px 4px rgba(0,0,0,0.6)",
              }}
            />
            {!powered && (
              <span
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  animation: "led-glow 1.6s ease-in-out infinite",
                  boxShadow: "0 0 12px rgba(255,120,120,0.6)",
                }}
              />
            )}
            <span
              className="absolute -bottom-[150%] left-1/2 -translate-x-1/2 font-hud text-[6px] uppercase tracking-[0.15em]"
              style={{ color: "#6b5d47" }}
            >
              power
            </span>
          </button>

          {/* TV legs */}
          <div
            className="absolute"
            style={{
              left: "22%",
              bottom: "-9%",
              width: "4%",
              height: "9%",
              background: "linear-gradient(180deg, #8d7c5e, #5d4c35)",
              borderRadius: 3,
            }}
          />
          <div
            className="absolute"
            style={{
              right: "22%",
              bottom: "-9%",
              width: "4%",
              height: "9%",
              background: "linear-gradient(180deg, #8d7c5e, #5d4c35)",
              borderRadius: 3,
            }}
          />
        </div>

        {/* ---------- console (in front of the TV) ---------- */}
        <div className="absolute" style={{ left: "32%", top: "62%", width: "36%", height: "26%" }}>
          {/* cartridge */}
          <div
            className="absolute"
            style={{
              left: "64%",
              top: "-34%",
              width: "20%",
              height: "44%",
              transform: "rotate(2deg)",
              borderRadius: 5,
              background: "linear-gradient(180deg, #6b6570 0%, #49444d 100%)",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.2), 0 6px 14px rgba(0,0,0,0.55)",
              zIndex: 2,
            }}
          >
            <div
              className="absolute"
              style={{
                left: "10%",
                right: "10%",
                top: "30%",
                height: "34%",
                borderRadius: 3,
                background:
                  "linear-gradient(180deg, var(--orange), color-mix(in oklab, var(--orange) 70%, black))",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
            />
            <div
              className="absolute left-1/2 -translate-x-1/2 text-center font-hud"
              style={{
                top: "38%",
                fontSize: "0.55vw",
                color: "#2a1510",
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              LOGAN<span style={{ color: "#fff" }}>♥</span>
            </div>
            <div
              className="absolute"
              style={{
                left: "8%",
                right: "8%",
                top: "66%",
                height: "6%",
                background: "rgba(0,0,0,0.35)",
                borderRadius: 2,
              }}
            />
          </div>

          {/* body */}
          <div
            className="absolute"
            style={{
              inset: 0,
              borderRadius: "5% / 9%",
              background: "linear-gradient(180deg, #e2ddd2 0%, #cfc8b9 52%, #b3aa99 100%)",
              boxShadow:
                "inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -12px 22px rgba(90,78,60,0.4), 0 20px 44px rgba(0,0,0,0.65)",
            }}
          />
          {/* top lid */}
          <div
            className="absolute"
            style={{
              left: "4%",
              right: "4%",
              top: "10%",
              height: "42%",
              borderRadius: "6% / 14%",
              background: "linear-gradient(180deg, #c6bfb0 0%, #a9a190 100%)",
              boxShadow: "inset 0 2px 3px rgba(0,0,0,0.35), inset 0 -1px 0 rgba(255,255,255,0.4)",
            }}
          >
            {/* cartridge slot */}
            <div
              className="absolute"
              style={{
                left: "62%",
                right: "8%",
                top: "16%",
                height: "16%",
                borderRadius: 4,
                background: "#17161a",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.9)",
              }}
            />
            {/* vents */}
            <div
              className="absolute"
              style={{
                left: "10%",
                right: "44%",
                top: "22%",
                height: "58%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{ height: "9%", background: "rgba(40,36,30,0.45)", borderRadius: 2 }}
                />
              ))}
            </div>
          </div>

          {/* front strip */}
          <div
            className="absolute"
            style={{
              left: "4%",
              right: "4%",
              bottom: "8%",
              height: "34%",
              borderRadius: "6% / 20%",
              background: "linear-gradient(180deg, #3a3740 0%, #211f26 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -3px 6px rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              paddingLeft: "3.5%",
              paddingRight: "3.5%",
            }}
          >
            {/* brand */}
            <div
              className="font-hud uppercase"
              style={{ fontSize: "0.85vw", letterSpacing: "0.22em", color: "#9b94a8" }}
            >
              Logan<span style={{ color: "var(--orange)" }}>tron</span>
            </div>

            {/* controller ports */}
            <div
              className="absolute"
              style={{
                left: "30%",
                top: "50%",
                transform: "translateY(-50%)",
                width: "8%",
                aspectRatio: "1",
                borderRadius: "50%",
                background: "#0c0c10",
                boxShadow: "inset 0 2px 3px rgba(0,0,0,0.9), 0 0 0 2px #4a4650",
              }}
            />
            <div
              className="absolute"
              style={{
                left: "40%",
                top: "50%",
                transform: "translateY(-50%)",
                width: "8%",
                aspectRatio: "1",
                borderRadius: "50%",
                background: "#0c0c10",
                boxShadow: "inset 0 2px 3px rgba(0,0,0,0.9), 0 0 0 2px #4a4650",
              }}
            />

            {/* reset button */}
            <div
              className="absolute"
              style={{
                left: "52%",
                top: "50%",
                transform: "translateY(-50%)",
                width: "16%",
                height: "46%",
                borderRadius: 4,
                background: "linear-gradient(180deg, #7a7468, #4a463e)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="font-hud uppercase"
                style={{ fontSize: "0.55vw", letterSpacing: "0.14em", color: "#e8e2d4" }}
              >
                reset
              </span>
            </div>

            {/* power button */}
            <button
              type="button"
              onClick={powerOn}
              aria-label="Turn on the console"
              className="absolute cursor-pointer"
              style={{
                left: "71%",
                top: "50%",
                transform: "translateY(-50%)",
                width: "16%",
                height: "46%",
                borderRadius: 4,
                background: powered
                  ? "linear-gradient(180deg, #d84a4a, #8f1f1f)"
                  : "linear-gradient(180deg, #c24545, #7a1a1a)",
                boxShadow: powered
                  ? "0 0 16px rgba(255,80,80,0.8), inset 0 1px 0 rgba(255,255,255,0.35)"
                  : "0 2px 5px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "box-shadow 0.2s",
              }}
            >
              <span
                className="font-hud uppercase"
                style={{ fontSize: "0.55vw", letterSpacing: "0.14em", color: "#ffecec" }}
              >
                power
              </span>
              {!powered && (
                <span
                  className="pointer-events-none absolute inset-0 rounded-[4px]"
                  style={{
                    animation: "led-glow 1.6s ease-in-out infinite",
                    boxShadow: "0 0 14px rgba(255,120,120,0.55)",
                  }}
                />
              )}
            </button>

            {/* power LED */}
            <div
              className="absolute"
              style={{
                left: "90%",
                top: "30%",
                width: "4%",
                aspectRatio: "1",
                borderRadius: "50%",
                background: powered ? "var(--neon)" : "#3a4a38",
                boxShadow: powered ? "0 0 8px var(--neon)" : "none",
                transition: "all 0.2s",
              }}
            />
          </div>
        </div>

        {/* reflection under the console */}
        <div
          className="pointer-events-none absolute"
          style={{
            left: "34%",
            top: "90%",
            width: "32%",
            height: "4%",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)",
          }}
        />

        {/* hint */}
        <div
          className="pointer-events-none absolute left-1/2 text-center font-hud uppercase"
          style={{ bottom: "2.5%", animation: "hint-pulse 2.2s ease-in-out infinite" }}
        >
          <span
            style={{
              fontSize: "0.95vw",
              letterSpacing: "0.3em",
              color: "#d9d2c2",
              textShadow: "0 1px 3px rgba(0,0,0,0.8)",
            }}
          >
            {powered ? "warming up…" : "press power on the console or the tv"}
          </span>
        </div>
      </div>

      {/* vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* ---------- camera fly-in ---------- */}
      {zoom && <ZoomOverlay rect={zoom} />}
    </div>
  );
}

/* The boot splash shown inside the CRT (and re-used for the fly-in). */
function BootScreen({ size, stage }: { size: number; stage: BootStage }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: "radial-gradient(circle at 50% 44%, #1c1c24 0%, #050507 72%)" }}
    >
      {stage === "static" && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: STATIC_BG,
            backgroundSize: "120px 120px",
            animation: "static-flicker 0.32s steps(4) infinite",
            mixBlendMode: "screen",
          }}
        />
      )}

      {stage === "logo" && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
          style={{ animation: "crt-bloom 0.5s ease-out both" }}
        >
          <p
            className="font-hud uppercase"
            style={{
              fontSize: Math.max(7, size * 0.055),
              letterSpacing: "0.4em",
              color: "var(--violet)",
              textShadow: "0 0 12px color-mix(in oklab, var(--violet) 80%, transparent)",
            }}
          >
            knife throw
          </p>
          <h1
            className="font-display uppercase leading-none"
            style={{
              fontSize: Math.max(14, size * 0.17),
              color: "var(--orange)",
              textShadow:
                "0 0 18px color-mix(in oklab, var(--orange) 85%, transparent), 0 0 42px color-mix(in oklab, var(--orange) 50%, transparent)",
              animation: "marquee-flicker 5s ease-in-out infinite",
            }}
          >
            Logan<span style={{ color: "var(--neon)", textShadow: "0 0 18px var(--neon)" }}>♥</span>
          </h1>
          <p
            className="font-hud uppercase"
            style={{
              fontSize: Math.max(6, size * 0.05),
              letterSpacing: "0.34em",
              color: "var(--neon)",
              textShadow: "0 0 12px color-mix(in oklab, var(--neon) 80%, transparent)",
            }}
          >
            birthday toss
          </p>
          <p
            className="font-hud"
            style={{
              fontSize: Math.max(6, size * 0.034),
              color: "oklch(0.72 0.03 300)",
              marginTop: size * 0.05,
            }}
          >
            8 balloons · 10 knives · don&apos;t hit me
          </p>
          <p
            className="font-hud uppercase"
            style={{
              fontSize: Math.max(6, size * 0.042),
              color: "var(--orange)",
              marginTop: size * 0.045,
              letterSpacing: "0.3em",
              animation: "led-glow 1.1s ease-in-out infinite",
            }}
          >
            ▶ ready
          </p>
        </div>
      )}

      {/* off-state glass reflection */}
      {stage === "off" && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 22%, transparent 40%)",
          }}
        />
      )}

      {/* glass sheen + scanlines */}
      <div className="scanlines pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 18%, transparent 34%, transparent 76%, rgba(0,0,0,0.22) 100%)",
        }}
      />
    </div>
  );
}

/* Flies the screen's contents out to fill the viewport. */
function ZoomOverlay({ rect }: { rect: { x: number; y: number; w: number; h: number } }) {
  const [go, setGo] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setGo(true)));
    return () => cancelAnimationFrame(raf);
  }, []);

  const s = Math.max(window.innerWidth / rect.w, window.innerHeight / rect.h) * 1.04;
  const tx = (window.innerWidth - rect.w * s) / 2;
  const ty = (window.innerHeight - rect.h * s) / 2;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[80] overflow-hidden"
      style={{
        background: go ? "#000" : "rgba(0,0,0,0)",
        transition: "background 520ms ease 260ms",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: rect.w,
          height: rect.h,
          transform: go
            ? `translate(${tx}px, ${ty}px) scale(${s})`
            : `translate(${rect.x}px, ${rect.y}px) scale(1)`,
          transformOrigin: "0 0",
          transition: "transform 840ms cubic-bezier(0.7, 0, 0.84, 0)",
          willChange: "transform",
        }}
      >
        <BootScreen size={rect.w} stage="logo" />
        {/* fade the boot splash out to black as we land */}
        <div
          className="absolute inset-0"
          style={{
            background: "#000",
            opacity: go ? 1 : 0,
            transition: "opacity 240ms ease 640ms",
          }}
        />
      </div>
    </div>
  );
}
