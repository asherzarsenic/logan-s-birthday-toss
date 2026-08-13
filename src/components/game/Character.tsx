import headImg from "@/assets/logan-target-head.png";

export function Character({ size, hit, hitKey }: { size: number; hit: boolean; hitKey: number }) {
  return (
    <div
      className="relative select-none"
      style={{ width: size, height: size * 1.32 }}
      key={hitKey}
    >
      <div
        className="absolute inset-0"
        style={{ animation: hit ? "wobble-hit 420ms ease-in-out 2" : undefined }}
      >
        <img
          src={headImg}
          alt="The birthday card's very reluctant target, strapped to the wheel"
          className="h-full w-full object-contain"
          style={{ filter: "drop-shadow(0 0 14px color-mix(in oklab, var(--neon) 55%, transparent))" }}
          draggable={false}
        />

        {/* ropes */}
        <div
          className="absolute left-[-6%] w-[112%] rotate-[-6deg] rounded-full"
          style={{
            top: "58%",
            height: Math.max(4, size * 0.05),
            background:
              "repeating-linear-gradient(90deg, oklch(0.75 0.09 70) 0 8px, oklch(0.55 0.08 60) 8px 16px)",
            boxShadow: "0 2px 6px oklch(0 0 0 / 0.6)",
          }}
        />
        <div
          className="absolute left-[-6%] w-[112%] rotate-[5deg] rounded-full"
          style={{
            top: "76%",
            height: Math.max(4, size * 0.05),
            background:
              "repeating-linear-gradient(90deg, oklch(0.75 0.09 70) 0 8px, oklch(0.55 0.08 60) 8px 16px)",
            boxShadow: "0 2px 6px oklch(0 0 0 / 0.6)",
          }}
        />

        {hit && (
          <div
            className="absolute left-1/2 -translate-x-1/2 bg-stage"
            style={{
              top: "52%",
              width: size * 0.34,
              height: size * 0.09,
              boxShadow: "0 0 0 2px oklch(0 0 0 / 0.9)",
            }}
          />
        )}
      </div>
    </div>
  );
}

