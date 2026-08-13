# Knife Throw: Happy Birthday, Logan

An interactive birthday card built as a first-person knife-throwing carnival game. Logan throws knives at a spinning wheel with you tied to it and balloons around you — pop them all without hitting you, then the card message unlocks.

## The experience

1. **Title screen** — neon marquee: "HAPPY BIRTHDAY, LOGAN ♥" with a glowing "THROW" prompt.
2. **The game** — a spinning wooden wheel viewed head-on in first person. You are strapped to the center (your uploaded photo, cut out and given a cartoon body). 8 balloons ride the wheel's rim and rotate with it.
3. **Throwing** — aim with mouse/finger anywhere on screen, click/tap to release. The knife flies away from the camera (scales down, motion blur, slight arc) and lands stuck in the wheel, rotating along with it.
4. **Ammo** — 10 knives. Counter shown as a rack of knife icons that empty as they are thrown.
5. **Hitting you** — the knife thunks into the board next to you: you flinch, eyes go narrow and irritated, a black censor bar snaps over your mouth, a speech bubble fires "@#$%!" and a loud BEEP plays. Costs a life (3 lives). Out of lives or out of knives = "OUCH. TRY AGAIN" retry screen.
6. **Win** — all 8 balloons popped: wheel slows to a stop, confetti bursts, banner drops down and the birthday message card appears with a "Throw again" button.

## Look and feel

- Palette: pure black stage, insane orange, ultraviolet purple, neon green. Everything glows.
- Type: heavy condensed display for the banner, arcade-ish sans for HUD.
- Vignette + subtle CRT scanlines, purple haze behind the wheel, orange spotlight cone from the camera.
- Balloons in the four palette colors with neon rim-light; pop = a burst of shards + a short scale-punch on the whole screen.

## Your character

Your photo (the link you provided) becomes the head — background removed, edges cleaned, given a neon rim-light so it reads as a game sprite — sitting on a simple illustrated cartoon body with ropes across the chest. Reaction states are layered on top of the same head: irritated eyes overlay, black censor bar, sweat drop, wobble. If the automatic cutout looks rough I will regenerate a stylized version from the photo instead.

## Technical notes

- Single route at `/` (replacing the placeholder), plus small components: `Wheel`, `Balloon`, `Character`, `Knife`, `Hud`, `Banner`, `WinCard`.
- Rendered with layered DOM + CSS 3D transforms (no WebGL) — the wheel is one rotating layer with balloons/knives positioned in polar coordinates, so hit detection is simple angle+radius math against the wheel's current rotation.
- Animation via `requestAnimationFrame` game loop in a `useGameLoop` hook; all game state in one reducer (`phase`, `knivesLeft`, `lives`, `balloons`, `stuckKnives`, `reaction`).
- Difficulty ramp: wheel spins faster after every 3 balloons popped.
- Sound: short synthesized effects via WebAudio (throw whoosh, thunk, balloon pop, censor beep) with a mute toggle — no audio files needed.
- Palette added as oklch tokens in `src/styles.css` (`--stage`, `--orange`, `--violet`, `--neon`, plus glow shadows); no hardcoded colors in components.
- Photo uploaded to CDN assets; head cutout and body art generated as image assets.
- Mobile-first: works with touch, wheel scales to viewport, tested at 390px wide.
- Page head: title/description/og tags for the birthday card.
