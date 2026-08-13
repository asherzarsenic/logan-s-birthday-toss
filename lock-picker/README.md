# Code Cracking Lock Picker

A single-file arcade of four adult-difficulty locks. Each lock cracked releases one fragment
of a hidden message; all four opens the vault.

Everything lives in **`index.html`** — no build step, no dependencies, no network calls.
Progress is stored in `localStorage` under `cclp.progress.v1`.

## The locks

| # | Lock | Type | What it actually is |
|---|------|------|---------------------|
| 01 | **Tumbler Array** | Cipher | 5-stage, 7-symbol Mastermind with repeats (16,807 states), 10 pulls. Filled peg = right symbol/right stage, hollow = right symbol/wrong stage, never in order. |
| 02 | **Dead Drop** | Cipher | Monoalphabetic substitution cryptogram with a random derangement key, 3 free letters, live frequency histogram and duplicate-mapping detection. |
| 03 | **Overload** | Strategy | **Misère Nim** against a provably perfect engine. Take the last cell and you lose. Must win 2 rounds in a row. |
| 04 | **Siege** | Strategy | **Isolation** on 7×7. Both tokens move as queens, vacated squares burn. Iterative-deepening alpha-beta engine. |

## Difficulty — verified, not guessed

Every engine was tested by simulation rather than eyeballed:

- **Overload** — `nimBestMove` was checked against a brute-force misère solver across all
  **511 reachable positions**: 0 incorrect moves. It is unbeatable unless you play the parity correctly.
- **Siege** — openings were chosen by simulation so the lock is *skill-gated, not luck-gated*:
  a strong (3-ply) player wins ~90%, a greedy (2-ply) player wins **0%**. The symmetric
  centre-file opening was removed because it let the engine mirror its way to a guaranteed win,
  making the lock unwinnable.
- **Tumbler Array** — an optimal minimax solver cracks it in ~7 of the 10 allowed pulls, so it is
  tight but fair.

## Embedding

Drop it in an iframe:

```html
<iframe src="lock-picker/index.html" width="100%" height="900"
        style="border:0" title="Code Cracking Lock Picker"></iframe>
```

Or just open `index.html` directly / host the folder statically:

```sh
python3 -m http.server 8080 --directory lock-picker
```

## Notes

- Keyboard support: `1`–`7`, `Backspace`, `Enter` in Tumbler; `A`–`Z`, `Backspace`, `Esc` in Dead Drop.
- Sound is procedural Web Audio (no asset files) and can be muted from the header.
- "Wipe Progress" relocks all four and re-masks the message.
