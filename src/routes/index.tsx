import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { Banner } from "@/components/game/Banner";
import { ChallengeStrip, LevelClear, type ChallengeResults } from "@/components/game/Challenges";
import { Hud } from "@/components/game/Hud";
import { Intro } from "@/components/game/Intro";
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
          "An interactive birthday card for Logan: a first-person knife throwing game. Three levels, three challenges, one spinning wheel — pop every balloon without hitting the girl tied to it.",
      },
      { property: "og:title", content: "Knife Throw: Happy Birthday, Logan" },
      {
        property: "og:description",
        content:
          "Three levels, three challenges, one spinning wheel. Pop them all to unlock the birthday message.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const FLIGHT_MS = 380;

type Level = {
  name: string;
  balloons: number;
  knives: number;
  lives: number;
  speed: number; // deg / second
  speedUp: number; // added every 3 balloons popped
  dir: 1 | -1; // spin direction (level 2 reverses it)
  balloonScale: number; // smaller balloons = harder to hit
  herHit: number; // her hitbox as a fraction of the stage
};

const LEVELS: Level[] = [
  {
    name: "Warm Up",
    balloons: 8,
    knives: 10,
    lives: 3,
    speed: 34,
    speedUp: 16,
    dir: 1,
    balloonScale: 1,
    herHit: 0.15,
  },
  {
    name: "Getting Spicy",
    balloons: 9,
    knives: 10,
    lives: 2,
    speed: 50,
    speedUp: 18,
    dir: -1,
    balloonScale: 0.92,
    herHit: 0.16,
  },
  {
    name: "Bunny Mode",
    balloons: 10,
    knives: 10,
    lives: 1,
    speed: 64,
    speedUp: 20,
    dir: 1,
    balloonScale: 0.84,
    herHit: 0.17,
  },
];

function getLevel(idx: number): Level {
  const lvl = LEVELS[idx];
  if (!lvl) throw new Error(`Unknown level ${idx}`);
  return lvl;
}

const FIRST_LEVEL = getLevel(0);

type Phase = "intro" | "title" | "playing" | "lost" | "level-clear" | "won";
type Flying = { id: number; x: number; y: number };
type Burst = { id: number; x: number; y: number };

function makeBalloons(size: number, count: number): BalloonState[] {
  const radius = size * 0.375;
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i,
    radius,
    popped: false,
  }));
}

function Index() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(360);
  const [phase, setPhase] = useState<Phase>("intro");
  const [levelIndex, setLevelIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [balloons, setBalloons] = useState<BalloonState[]>(() =>
    makeBalloons(360, FIRST_LEVEL.balloons),
  );
  const [stuck, setStuck] = useState<StuckKnife[]>([]);
  const [flying, setFlying] = useState<Flying[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [knivesLeft, setKnivesLeft] = useState(FIRST_LEVEL.knives);
  const [lives, setLives] = useState(FIRST_LEVEL.lives);
  const [misses, setMisses] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [mastered, setMastered] = useState(0);
  const [hit, setHit] = useState(false);
  const [hitKey, setHitKey] = useState(0);
  const [muted, setMutedState] = useState(false);
  const [aim, setAim] = useState<{ x: number; y: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const rotRef = useRef(0);
  const speedRef = useRef(FIRST_LEVEL.speed);
  const dirRef = useRef<1 | -1>(1);
  const phaseRef = useRef<Phase>("title");
  const balloonsRef = useRef(balloons);
  const levelRef = useRef(FIRST_LEVEL);
  const levelIndexRef = useRef(0);
  const livesRef = useRef(FIRST_LEVEL.lives);
  const missesRef = useRef(0);
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);
  const clearedRef = useRef(false);
  const idRef = useRef(1);
  const inFlightRef = useRef(0);
  const onClearedRef = useRef<() => void>(() => {});

  phaseRef.current = phase;
  levelRef.current = getLevel(levelIndex);
  levelIndexRef.current = levelIndex;
  livesRef.current = lives;
  balloonsRef.current = balloons;

  const level = getLevel(levelIndex);

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
    if (phase === "title") {
      const next = makeBalloons(size, FIRST_LEVEL.balloons);
      balloonsRef.current = next;
      setBalloons(next);
    }
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
        rotRef.current = (rotRef.current + dirRef.current * speedRef.current * dt) % 360;
        setRotation(rotRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const startLevel = useCallback(
    (idx: number) => {
      const cfg = getLevel(idx);
      const next = makeBalloons(size, cfg.balloons);
      balloonsRef.current = next;
      setLevelIndex(idx);
      setBalloons(next);
      setStuck([]);
      setFlying([]);
      setBursts([]);
      setKnivesLeft(cfg.knives);
      setLives(cfg.lives);
      setMisses(0);
      setStreak(0);
      setBestStreak(0);
      setHit(false);
      speedRef.current = cfg.speed;
      dirRef.current = cfg.dir;
      livesRef.current = cfg.lives;
      missesRef.current = 0;
      streakRef.current = 0;
      bestStreakRef.current = 0;
      clearedRef.current = false;
      inFlightRef.current = 0;
      setPhase("playing");
      sfx.unlock();
    },
    [size],
  );

  const onCleared = useCallback(() => {
    if (clearedRef.current) return;
    clearedRef.current = true;
    const earned =
      (levelRef.current.lives - livesRef.current === 0 ? 1 : 0) +
      (missesRef.current === 0 ? 1 : 0) +
      (bestStreakRef.current >= 3 ? 1 : 0);
    setMastered((m) => m + earned);
    sfx.win();
    const isLast = levelIndexRef.current === LEVELS.length - 1;
    window.setTimeout(() => setPhase(isLast ? "won" : "level-clear"), 700);
  }, []);

  onClearedRef.current = onCleared;

  const resolveThrow = useCallback(
    (x: number, y: number) => {
      const c = size / 2;
      const dx = x - c;
      const dy = y - c;
      const dist = Math.hypot(dx, dy);
      const screenAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const localAngle = screenAngle - rotRef.current;
      const cfg = levelRef.current;

      // did it hit a balloon?
      const hitRadius = size * 0.1 * cfg.balloonScale;
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

        const next = current.map((b) => (b.id === poppedId ? { ...b, popped: true } : b));
        balloonsRef.current = next;
        setBalloons(next);

        // streak
        streakRef.current += 1;
        if (streakRef.current > bestStreakRef.current) bestStreakRef.current = streakRef.current;
        setStreak(streakRef.current);
        setBestStreak(bestStreakRef.current);

        const left = next.filter((b) => !b.popped).length;
        const popped = next.length - left;
        speedRef.current = cfg.speed + Math.floor(popped / 3) * cfg.speedUp;
        if (left === 0) {
          speedRef.current = 0;
          onClearedRef.current();
        }
        return;
      }

      // did it hit her?
      if (dist < size * cfg.herHit) {
        sfx.thunk();
        sfx.beep();
        setHit(true);
        setHitKey((k) => k + 1);
        setTimeout(() => setHit(false), 1200);
        streakRef.current = 0;
        setStreak(0);
        livesRef.current -= 1;
        setLives(livesRef.current);
        missesRef.current += 1;
        setMisses(missesRef.current);
        if (livesRef.current <= 0) {
          sfx.lose();
          setTimeout(() => setPhase("lost"), 600);
        }
      } else {
        sfx.thunk();
        missesRef.current += 1;
        setMisses(missesRef.current);
        streakRef.current = 0;
        setStreak(0);
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
  const cleared = phase === "level-clear" || phase === "won";
  const statuses: ChallengeResults = {
    flawless: level.lives - lives > 0 ? "failed" : cleared ? "done" : "pending",
    sharpshooter: misses > 0 ? "failed" : cleared ? "done" : "pending",
    combo: bestStreak >= 3 ? "done" : "pending",
  };

  return (
    <>
      {phase === "intro" && <Intro onEnter={() => setPhase("title")} />}
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
            levelIndex={levelIndex}
            levelCount={LEVELS.length}
            levelName={level.name}
            streak={streak}
            knivesLeft={knivesLeft}
            totalKnives={level.knives}
            lives={lives}
            maxLives={level.lives}
            balloonsLeft={balloonsLeft}
            muted={muted}
            onToggleMute={() => {
              const next = !muted;
              setMutedState(next);
              setMuted(next);
            }}
          />
        </div>

        <ChallengeStrip statuses={statuses} />

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
              balloonScale={level.balloonScale}
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
              body="You got this babe, I know you do. JUST DONT HIT ME! -Love Ya ♥"
              cta="Start throwing"
              onClick={() => startLevel(0)}
            />
          )}

          {phase === "lost" && (
            <Overlay
              kicker={
                lives <= 0
                  ? `You hit me ${level.lives} time${level.lives === 1 ? "" : "s"}.`
                  : "Out of knives"
              }
              title="Ouch. Try again"
              body={
                lives <= 0
                  ? "That's it, I'm telling everyone at the party."
                  : `${balloonsLeft} balloon${balloonsLeft === 1 ? "" : "s"} still standing. Reload and take another run.`
              }
              cta="Retry"
              onClick={() => startLevel(levelIndex)}
            />
          )}

          {phase === "level-clear" && (
            <LevelClear
              levelIndex={levelIndex}
              levelCount={LEVELS.length}
              levelName={level.name}
              statuses={statuses}
              onNext={() => startLevel(levelIndex + 1)}
            />
          )}

          {phase === "won" && (
            <WinCard
              onReplay={() => {
                setMastered(0);
                startLevel(0);
              }}
              levelCount={LEVELS.length}
              mastered={mastered}
              totalChallenges={LEVELS.length * 3}
            />
          )}
        </div>

        <p className="mt-4 max-w-[520px] text-center font-hud text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Love forever. Your Bunny Pumpkin
        </p>
      </main>
    </>
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
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>
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
