let ctx: AudioContext | null = null;
let muted = false;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMuted(value: boolean) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function tone(
  type: OscillatorType,
  from: number,
  to: number,
  duration: number,
  gain: number,
  delay = 0,
) {
  const c = ac();
  if (!c || muted) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + duration);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function noise(duration: number, gain: number, filterHz: number, delay = 0) {
  const c = ac();
  if (!c || muted) return;
  const t0 = c.currentTime + delay;
  const frames = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, frames, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = filterHz;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(t0);
}

export const sfx = {
  unlock() {
    ac();
  },
  throw() {
    noise(0.22, 0.18, 2600);
    tone("triangle", 900, 260, 0.2, 0.06);
  },
  thunk() {
    tone("square", 180, 60, 0.14, 0.16);
    noise(0.1, 0.22, 700);
  },
  pop() {
    tone("square", 780, 160, 0.09, 0.2);
    noise(0.09, 0.28, 3200);
  },
  beep() {
    tone("square", 1000, 1000, 0.42, 0.18);
  },
  lose() {
    tone("sawtooth", 320, 70, 0.7, 0.14);
  },
  win() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => tone("triangle", n, n, 0.24, 0.14, i * 0.13));
  },
};
