export function Banner() {
  return (
    <div className="relative w-full max-w-[560px] px-2">
      <div
        className="relative rounded-[999px] border-2 border-orange px-4 py-2 text-center"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--violet) 35%, var(--stage)) 0%, var(--stage) 100%)",
          boxShadow:
            "0 0 22px color-mix(in oklab, var(--violet) 60%, transparent), inset 0 0 18px color-mix(in oklab, var(--violet) 40%, transparent)",
          animation: "marquee-flicker 6s ease-in-out infinite",
        }}
      >
        <h1 className="font-display text-[clamp(1.3rem,6.2vw,2.4rem)] uppercase leading-none tracking-[0.06em] text-orange text-glow-orange">
          Happy Birthday, Logan{" "}
          <span className="text-neon text-glow-neon">&hearts;</span>
        </h1>
      </div>
      <div className="mx-auto h-4 w-[2px] bg-orange/60" />
    </div>
  );
}
