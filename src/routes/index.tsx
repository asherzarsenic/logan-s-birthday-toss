import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { Banner } from "@/components/game/Banner";
import { Hud } from "@/components/game/Hud";
import { Knife } from "@/components/game/Knife";
import { WinCard } from "@/components/game/WinCard";
import { Wheel, type BalloonState, type StuckKnife } from "@/components/game/Wheel";
import { sfx, setMuted } from "@/lib/game-audio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Knife Throw: Happy Birthday, Logan" },
      {
        name: "description",
        content:
          "An interactive birthday card for Logan: a first-person knife throwing game. Pop every balloon on the spinning wheel without hitting the girl tied to it.",
      },
      { property: "og:title", content: "Knife Throw: Happy Birthday, Logan" },
      {
        property: "og:description",
        content:
          "Ten knives, eight balloons, one spinning wheel. Pop them all to unlock the birthday message.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const BALLOON_COUNT = 8;
const TOTAL_KNIVES = 10;
const START_LIVES = 3;
const FLIGHT_MS = 380;
const BASE_SPEED = 34; // deg / second

type Phase = "title" | "playing" | "lost" | "won";
type Flying = { id: number; x: number; y: number };
type Burst = { id: number; x: number; y: number };

function makeBalloons(size: number): BalloonState[] {
  const radius = size * 0.375;
  return Array.from({ length: BALLOON_COUNT }, (_, i) => ({
    id: i,
    angle: (360 / BALLOON_COUNT) * i,
    radius,
    popped: false,
  }));
}

function Index() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(360);
  const [phase, setPhase] = useState<Phase>("title");
  const [rotation, setRotation] = useState(0);
  const [balloons, setBalloons] = useState<BalloonState[]>(() => makeBalloons(360));
  const [stuck, setStuck] = useState<StuckKnife[]>([]);
  const [flying, setFlying] = useState<Flying[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [knivesLeft, setKnivesLeft] = useState(TOTAL_KNIVES);
  const [lives, setLives] = useState(START_LIVES);
  const [hit, setHit] = useState(false);
  const [hitKey, setHitKey] = useState(0);
  const [muted, setMutedState] = useState(false);
  const [aim, setAim] = useState<{ x: number; y: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);


  const rotRef = useRef(0);
  const speedRef = useRef(BASE_SPEED);
  const phaseRef = useRef<Phase>("title");
  const balloonsRef = useRef(balloons);
  const idRef = useRef(1);
  const inFlightRef = useRef(0);

  phaseRef.current = phase;
  balloonsRef.current = balloons;

  /* measure stage */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => setSize(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (phase === "title") setBalloons(makeBalloons(size));
  }, [size, phase]);

  /* game loop */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const spinning = phaseRef.current === "playing" || phaseRef.current === "title";
      if (spinning) {
        rotRef.current = (rotRef.current + speedRef.current * dt) % 360;
        setRotation(rotRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const reset = useCallback(() => {
    setBalloons(makeBalloons(size));
    setStuck([]);
    setFlying([]);
    setBursts([]);
    setKnivesLeft(TOTAL_KNIVES);
    setLives(START_LIVES);
    setHit(false);
    speedRef.current = BASE_SPEED;
    inFlightRef.current = 0;
    setPhase("playing");
    sfx.unlock();
  }, [size]);

  const resolveThrow = useCallback(
    (x: number, y: number) => {
      const c = size / 2;
      const dx = x - c;
      const dy = y - c;
      const dist = Math.hypot(dx, dy);
      const screenAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const localAngle = screenAngle - rotRef.current;

      // did it hit a balloon?
      const hitRadius = size * 0.1;
      let poppedId: number | null = null;
      const current = balloonsRef.current;
      for (const b of current) {
        if (b.popped) continue;
        const rad = (b.angle * Math.PI) / 180;
        const bx = b.radius * Math.cos(rad);
        const by = b.radius * Math.sin(rad);
        const lrad = (localAngle * Math.PI) / 180;
        const kx = dist * Math.cos(lrad);
        const ky = dist * Math.sin(lrad);
        if (Math.hypot(bx - kx, by - ky) < hitRadius) {
          poppedId = b.id;
          break;
        }
      }

      if (poppedId !== null) {
        sfx.pop();
        const burstId = idRef.current++;
        setBursts((b) => [...b, { id: burstId, x, y }]);
        setTimeout(() => setBursts((b) => b.filter((v) => v.id !== burstId)), 520);
        setBalloons((prev) => {
          const next = prev.map((b) => (b.id === poppedId ? { ...b, popped: true } : b));
          const left = next.filter((b) => !b.popped).length;
          const popped = BALLOON_COUNT - left;
          speedRef.current = BASE_SPEED + Math.floor(popped / 3) * 16;
          if (left === 0) {
            speedRef.current = 0;
            sfx.win();
            setTimeout(() => setPhase("won"), 700);
          }
          return next;
        });
        return;
      }

      // did it hit her?
      if (dist < size * 0.15) {
        sfx.thunk();
        sfx.beep();
        setHit(true);
        setHitKey((k) => k + 1);
        setTimeout(() => setHit(false), 1200);
        setLives((l) => {
          const next = l - 1;
          if (next <= 0) {
            sfx.lose();
            setTimeout(() => setPhase("lost"), 600);
          }
          return next;
        });
      } else {
        sfx.thunk();
      }

      if (dist < size * 0.47) {
        setStuck((s) => [
          ...s,
          {
            id: idRef.current++,
            angle: localAngle,
            radius: dist,
            tilt: (Math.random() - 0.5) * 14,
          },
        ]);
      }
    },
    [size],
  );

  const throwKnife = useCallback(
    (x: number, y: number) => {
      if (phaseRef.current !== "playing") return;
      if (knivesLeft <= 0) return;
      sfx.throw();
      setKnivesLeft((k) => k - 1);
      const id = idRef.current++;
      inFlightRef.current += 1;
      setFlying((f) => [...f, { id, x, y }]);
      window.setTimeout(() => {
        setFlying((f) => f.filter((v) => v.id !== id));
        resolveThrow(x, y);
        inFlightRef.current -= 1;
        setKnivesLeft((k) => {
          if (
            k <= 0 &&
            inFlightRef.current === 0 &&
            balloonsRef.current.some((b) => !b.popped) &&
            phaseRef.current === "playing"
          ) {
            sfx.lose();
            setTimeout(() => setPhase("lost"), 500);
          }
          return k;
        });
      }, FLIGHT_MS);
    },
    [knivesLeft, resolveThrow],
  );

  const pointFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const balloonsLeft = balloons.filter((b) => !b.popped).length;

  return (
    <main
      className="scanlines relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-stage px-3 py-4"
      style={{
        background:
          "radial-gradient(ellipse at 50% 42%, color-mix(in oklab, var(--violet) 32%, var(--stage)) 0%, var(--stage) 62%)",
      }}
    >
      <Banner />

      <div className="mt-3 w-full max-w-[560px]">
        <Hud
          knivesLeft={knivesLeft}
          totalKnives={TOTAL_KNIVES}
          lives={lives}
          balloonsLeft={balloonsLeft}
          muted={muted}
          onToggleMute={() => {
            const next = !muted;
            setMutedState(next);
            setMuted(next);
          }}
        />
      </div>

      <div
        ref={stageRef}
        onPointerMove={(e) => setAim(pointFromEvent(e))}
        onPointerLeave={() => setAim(null)}
        onPointerDown={(e) => {
          const p = pointFromEvent(e);
          setAim(p);
          throwKnife(p.x, p.y);
        }}
        className="relative mt-4 aspect-square w-full max-w-[520px] cursor-crosshair touch-none select-none"
      >
        {/* spotlight */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--orange) 18%, transparent) 0%, transparent 62%)",
          }}
        />

        {mounted && (
          <Wheel
            size={size * 0.94}
            rotation={rotation}
            balloons={balloons}
            stuckKnives={stuck}
            hit={hit}
            hitKey={hitKey}
          />
        )}


        {hit && (
          <div
            key={hitKey}
            className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2"
            style={{ top: "16%", animation: "shout-in 320ms cubic-bezier(0.2,1.4,0.4,1) both" }}
          >
            <div className="rounded-xl border-2 border-neon bg-stage px-3 py-1 font-display text-2xl tracking-widest text-neon text-glow-neon">
              @#$%!
            </div>
            <div className="mx-auto h-0 w-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-neon" />
          </div>
        )}


        {/* pop bursts */}
        {bursts.map((b) => (
          <span
            key={b.id}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: b.x,
              top: b.y,
              width: size * 0.16,
              height: size * 0.16,
              marginLeft: -size * 0.08,
              marginTop: -size * 0.08,
              border: "3px solid var(--neon)",
              boxShadow: "0 0 24px var(--neon)",
              animation: "pop-burst 500ms ease-out forwards",
            }}
          />
        ))}

        {/* flying knives */}
        {flying.map((f) => (
          <FlyingKnife key={f.id} x={f.x} y={f.y} stage={size} />
        ))}

        {/* crosshair */}
        {phase === "playing" && aim && (
          <div
            className="pointer-events-none absolute z-30"
            style={{ left: aim.x, top: aim.y, transform: "translate(-50%, -50%)" }}
          >
            <div
              className="rounded-full border-2 border-neon"
              style={{ width: 26, height: 26, boxShadow: "0 0 12px var(--neon)" }}
            />
            <div className="absolute left-1/2 top-1/2 h-[2px] w-8 -translate-x-1/2 -translate-y-1/2 bg-neon/70" />
            <div className="absolute left-1/2 top-1/2 h-8 w-[2px] -translate-x-1/2 -translate-y-1/2 bg-neon/70" />
          </div>
        )}

        {phase === "title" && (
          <Overlay
            kicker="First-person knife throwing"
            title="Ready, Logan?"
            body="I'm tied to the wheel. Pop all 8 balloons with 10 knives — and try very hard not to hit me. Tap or click to throw."
            cta="Start throwing"
            onClick={reset}
          />
        )}

        {phase === "lost" && (
          <Overlay
            kicker={lives <= 0 ? "You hit me. Three times." : "Out of knives"}
            title="Ouch. Try again"
            body={
              lives <= 0
                ? "That's it, I'm telling everyone at the party."
                : `${balloonsLeft} balloon${balloonsLeft === 1 ? "" : "s"} still standing. Reload and take another run.`
            }
            cta="Retry"
            onClick={reset}
          />
        )}

        {phase === "won" && <WinCard onReplay={reset} />}
      </div>

      <p className="mt-4 max-w-[520px] text-center font-hud text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        Made with love, glitter and mild personal risk
      </p>
    </main>
  );
}

function FlyingKnife({ x, y, stage }: { x: number; y: number; stage: number }) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGo(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      className="pointer-events-none absolute z-30"
      style={{
        left: go ? x : stage / 2,
        top: go ? y : stage * 1.05,
        transform: `translate(-50%, -50%) scale(${go ? 0.42 : 1.5}) rotate(${go ? 0 : -8}deg)`,
        transition: `left ${FLIGHT_MS}ms cubic-bezier(0.3,0,0.6,1), top ${FLIGHT_MS}ms cubic-bezier(0.3,0,0.6,1), transform ${FLIGHT_MS}ms cubic-bezier(0.3,0,0.6,1)`,
        filter: "drop-shadow(0 6px 12px oklch(0 0 0 / 0.6))",
      }}
    >
      <Knife style={{ width: stage * 0.09, height: stage * 0.38 }} />
    </div>
  );
}

function Overlay({
  kicker,
  title,
  body,
  cta,
  onClick,
}: {
  kicker: string;
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-stage/80 px-4 text-center backdrop-blur-[1px]">
      <div>
        <p className="font-hud text-[11px] uppercase tracking-[0.35em] text-neon text-glow-neon">
          {kicker}
        </p>
        <h2 className="mt-2 font-display text-4xl uppercase leading-none tracking-wide text-orange text-glow-orange">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{body}</p>
        <button
          type="button"
          onClick={onClick}
          className="mt-5 rounded-full border-2 border-orange bg-orange/10 px-7 py-2 font-hud text-xs uppercase tracking-[0.3em] text-orange transition-colors hover:bg-orange hover:text-primary-foreground"
        >
          {cta}
        </button>
      </div>
    </div>
  );
}
