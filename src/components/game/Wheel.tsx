import { Balloon } from "./Balloon";
import { Character } from "./Character";
import { Knife } from "./Knife";

export type BalloonState = { id: number; angle: number; radius: number; popped: boolean };
export type StuckKnife = { id: number; angle: number; radius: number; tilt: number };

export function Wheel({
  size,
  rotation,
  balloons,
  stuckKnives,
  hit,
  hitKey,
}: {
  size: number;
  rotation: number;
  balloons: BalloonState[];
  stuckKnives: StuckKnife[];
  hit: boolean;
  hitKey: number;
}) {
  const c = size / 2;
  const balloonSize = size * 0.13;

  const polar = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return { left: c + radius * Math.cos(rad), top: c + radius * Math.sin(rad) };
  };

  return (
    <div
      className="absolute left-1/2 top-1/2 rounded-full"
      style={{
        width: size,
        height: size,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        background: `repeating-conic-gradient(from 0deg, oklch(0.36 0.05 55) 0deg 22.5deg, oklch(0.28 0.045 50) 22.5deg 45deg)`,
        boxShadow:
          "0 0 0 10px oklch(0.2 0.03 300), 0 0 0 13px var(--violet), 0 0 60px color-mix(in oklab, var(--violet) 70%, transparent), inset 0 0 70px oklch(0 0 0 / 0.7)",
      }}
    >
      {/* rim bulbs */}
      {Array.from({ length: 24 }).map((_, i) => {
        const p = polar(i * 15, c - size * 0.028);
        return (
          <span
            key={`bulb-${i}`}
            className="absolute rounded-full"
            style={{
              left: p.left,
              top: p.top,
              width: size * 0.018,
              height: size * 0.018,
              transform: "translate(-50%, -50%)",
              background: i % 2 ? "var(--orange)" : "var(--neon)",
              boxShadow: `0 0 10px ${i % 2 ? "var(--orange)" : "var(--neon)"}`,
            }}
          />
        );
      })}

      {/* stuck knives */}
      {stuckKnives.map((k) => {
        const p = polar(k.angle, k.radius);
        return (
          <Knife
            key={k.id}
            className="absolute"
            style={{
              left: p.left,
              top: p.top,
              width: size * 0.055,
              height: size * 0.235,
              transform: `translate(-50%, -50%) rotate(${k.angle + 270 + k.tilt}deg) translateY(-38%)`,
              filter: "drop-shadow(0 3px 6px oklch(0 0 0 / 0.7))",
            }}
          />
        );
      })}

      {/* balloons */}
      {balloons
        .filter((b) => !b.popped)
        .map((b) => {
          const p = polar(b.angle, b.radius);
          return (
            <div
              key={b.id}
              className="absolute"
              style={{
                left: p.left,
                top: p.top,
                transform: "translate(-50%, -50%)",
              }}
            >
              <Balloon index={b.id} size={balloonSize} />
            </div>
          );
        })}

      {/* character */}
      <div
        className="absolute left-1/2 top-1/2 z-10"
        style={{ transform: `translate(-50%, -52%) rotate(${-rotation}deg)` }}
      >
        <Character size={size * 0.36} hit={hit} hitKey={hitKey} />
      </div>

    </div>
  );
}
