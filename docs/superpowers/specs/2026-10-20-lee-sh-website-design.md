# lee.sh: the website (design)

Date: 2026-10-20 · Status: draft for Lee's approval · Visual reference: `design/lee-board.html` (open it, then scroll)

## 1. Intent

Lee is interviewing for senior backend roles. The site is a portfolio that works for two readers at once:

- **Recruiters / HR** skim. Within five seconds they need: name, role, stack, location, "open to work", and where the
  résumé is. Plain-English labels everywhere ("About me", "Skills", not "U2 · DDR5").
- **Engineers** linger. The site is a motherboard drawn accurately enough that they enjoy it: pins, contacts, PCIe
  lanes, M.2 keying, vias, a star bus from the CPU.

The five component pages in `design/` are approved. This document covers what was still open: the bird's-eye landing
board, how scrolling moves between the parts, the build stack, and everything needed to ship.

**Why it matters:** the design is the pitch. A backend engineer who builds a calm, fast, precise site shows taste and
rigour without saying so. If it feels gimmicky, slow or overloaded, it works against Lee.

## 2. Goals, non-goals, anti-goals

**Goals**
1. One page. Scrolling flies a camera across a single board: bird's-eye → CPU (About) → RAM (Skills) →
   SSD (Experience) → GPU (Projects) → NIC (Contact) → closing shot with the whole board lit.
2. Each stop looks exactly like its approved page in `design/lee-*.html`.
3. Lightweight: static HTML, no UI framework at runtime, under 200 KB on first load including fonts.
4. Readable and complete without the camera: phones, reduced motion, no JavaScript, and screen readers all get every fact.
5. All personal content lives in one file Lee can edit.

**Non-goals (this build)**
- Analytics, CMS, blog, contact form, dark/light toggle (graphite only, by design), i18n.
- Arbitrary content counts. The drawings are built for 4 skill groups × 3 chips, 3 roles, 3 projects. Changing a
  count is a later design task.
- Buying or configuring the domain (Lee's job; the site deploys without it).

**Anti-goals: fails even if it technically works**
- Scroll-jacking that fights the user: wheel, trackpad, keyboard and scrollbar must all behave like normal scrolling.
- Motion that feels like a demo reel. Motion is calm and short and serves orientation.
- Anything from the rejected list in `CLAUDE.md` (3D, curves, pills, rounded parts, info cards, terminal UI, …).
- A Lighthouse score that undercuts the "backend engineer who cares about performance" story (target ≥ 95 on mobile).

## 3. The board (bird's-eye view, new)

See `design/lee-board.html` and its generator `design/generator/board.py`, which holds the exact geometry.

**Arrangement.** Every connector faces the CPU, so every bus is straight runs with 45° bends and nothing crosses.
`board.py` checks this and reports 0 crossings.

| Part | Where | Connector → CPU | Scale vs its page |
|---|---|---|---|
| CPU (About) | centre, world origin | pins on all four sides | 1.00 |
| RAM (Skills) | right | DIMM slots face left into CPU right pins (16 lanes, 4 per DIMM) | 0.85 |
| SSD (Experience) | left | M.2 edge faces right into CPU left pins (16 lanes) | 0.65 |
| GPU (Projects) | top-left, in a PCIe x16 slot | fingers face down, near-straight into CPU top pins 0–11 | 0.90 |
| NIC (Contact) | top-right, in a PCIe x4 slot | fingers face down; bus rises from CPU top pins 12–15, runs right as a stacked bundle, rises into the slot | 0.70 |

This is close to a real ATX board (DIMMs right of the CPU, an M.2 by the CPU), with one deliberate liberty: both
cards sit *above* the CPU rather than below it, so their edge connectors face it. CPU bottom pins and unused contacts
end in short stubs at vias, as on the pages. The pages' edge-to-edge ambient fans and their fake blurred `#far`
backdrops are **not ported**. On the board, the real buses, stubs and neighbouring parts take their place.

**On the board, besides the parts:** PCB outline (radius 3), four mounting holes, the two PCIe slots, silkscreen
"BENGALURU · IN · MADE BY LEE", and:
- **Title block** (top-left, the board's "model name"): `LEE.SH · BACKEND MAINBOARD · REV 2.0` / **Lee** /
  Senior Backend Engineer / `PYTHON · DJANGO · POSTGRESQL · BENGALURU` / green PWR LED + `OPEN TO SENIOR BACKEND
  ROLES`. This is the recruiter's five-second answer. In the build it is a real HTML `<h1>` block placed over that
  board area (same world→screen mapping as the notes), not SVG text.
- **Part labels**: plain-English name (Plex Sans) + designator (`U2 · RAM · 4× DDR5`). Overview only; they fade out
  once the camera zooms in.
- **Bits**: 1s and 0s ride the middle trace of each bus (they spell LEE in ASCII). They are dim when idle, bright on the
  active or hovered bus, and hidden on out-of-focus buses.

**Overview interactions:** hovering or focusing a part lights the part, its bus and its label. Clicking or pressing
Enter flies to that stop.

## 4. Scroll and camera (desktop: ≥ 1100 px wide and aspect ≥ 5/4, same breakpoint as the pages)

**Stops.** The scroll track has 7 stops: `board, about, skills, experience, projects, contact, online`, each 100svh
of scroll. Each stop is a real `<section id>` in the document, so `#skills` works natively and DOM order matches
reading order. `scroll-snap-type: y proximity` with one snap point per stop.

**Frames.** A part's camera frame is its page's 1600×1000 box mapped through the part's transform
(`world = page × s + (dx, dy)`), fitted like `slice`. Arriving at a stop therefore reproduces the page's
composition exactly, and every page coordinate (pads, lanes, note anchors) is reused unchanged through the same
transform. The overview and closing frames fit the whole board (`meet`), with the closing frame leaving room
for its call to action below the board.

**Travel.** Within each stop's screen of scroll, the middle 44% holds still and the rest travels:
- Centre moves on a strong ease-in-out (cubic in-out). Width interpolates in log space, with a zoom-out bump
  proportional to hop distance (like a map's flyTo), so long hops (RAM → SSD crosses the board) show where you're
  going.
- The camera follows scroll through a critically damped smoother (`1 − e^(−8·dt)`), so wheel notches don't step.
- The camera is a pure function of scroll position, so scrolling back up reverses exactly.

**Depth of field.** The focused part (and its bus) stays sharp. Every other part, bus, stub and the title block
fades to the pages' "far" look (blur ≈ 6–7 px, opacity ≈ 0.45) with a 350 ms ease-out transition when the stop
changes. On the CPU stop all four buses count as the CPU's own traces and stay sharp. This replaces each page's
fake `#far` layer with the real board.

**Notes on arrival.** Notes and wires appear only when the camera has settled on a stop:
1. Wires draw out from the part (≈ 240 ms ease-out), then notes fade in and rise 6 px (220 ms ease-out, 40 ms stagger).
2. On leaving, notes and wires fade out quickly (150 ms) before the camera moves far.
3. The wide-layout code from `kit.py` / the CPU page (`route`, `layoutWide`) runs per stop against that stop's final
   frame.
4. Every page interaction works at its stop: hovering or focusing a chip, stick or note lights the part, its wire and
   its note. The GPU render paths march, and the RAM load LEDs and NIC link/activity LEDs behave as on the pages.

**Keep-out on a shared board.** On the pages, ambient traces stopped at a via before text. On the board, buses are
structural and must stay connected, so wherever a note's keep-out box crosses a sharp trace, the trace **dives
through a via to an inner layer** and resurfaces at a via on the far side. The segment under the text is hidden. Far
(blurred) traces under a note box are hidden the same way. Nothing runs under text, and every bus stays electrically
plausible.

**Closing stop (`online`).** Whole board, every part lit amber, all buses active with bits at full speed, GPU render
paths marching, NIC activity LEDs blinking. Call to action below the board: "All systems online. **Let's talk.**"
with [Email me] (mailto + copy) and [Résumé ↗].

**First load (boot).** Only on the first visit in a session, landing on the overview, with motion allowed:
traces light outward from the CPU along each bus (≈ 700 ms ease-out), then LEDs come on and bits start. At most
1 s, never blocks input. Skipped on deep links, on revisits in the session, and under reduced motion.

## 5. Chrome

- **Top bar** (the band above y = 56 px, the only area no page puts a note in): `lee.sh` (left, goes to the
  board) · section index centred (`□ U1 ABOUT  □ U2 SKILLS  □ U3 EXPERIENCE  □ U4 PROJECTS  □ U5 CONTACT`, square pad,
  amber when current) · `Résumé ↗` button (right, always visible, because recruiters want it immediately).
- "Scroll" hint with the dripping trace at the bottom, overview only.
- The URL hash follows the current stop via `history.replaceState` (no history spam). The index is a real `<nav>`
  of anchor links.
- No rounded or pill shapes anywhere. Buttons scale to 0.97 on press. Hover effects are gated behind
  `(hover: hover) and (pointer: fine)`.

## 6. Narrow screens (phones, tablets, portrait)

No camera. Scrolling is plain document flow. This is the pages' existing narrow layout, chained:
1. HTML title block (h1), then the whole board fitted to width as a picture, then a list of the five section links.
2. Each section in order: component on top (the page's `NARROW_BOX`), notes listed below.
3. **One continuous bus down the left edge** starts at the CPU on the board and runs the full length of the page. It
   taps into each component (`NARROW_FROM`) and each note, which keeps the star topology readable on a phone.
4. As each component enters the viewport it does a one-time focus pull (blur 4 px → 0, opacity .4 → 1, 300 ms
   ease-out), and its notes stagger in.
5. The top bar shrinks to `lee.sh` + `Résumé ↗`.

## 7. Reduced motion, no JS, accessibility

- **`prefers-reduced-motion`:** no camera travel. Crossing a stop boundary cuts to the next frame with a 200 ms
  opacity crossfade. No boot, pulses, bits, bob or breathe. LEDs stay on steadily. Hover still changes colour.
- **No JavaScript:** the narrow layout renders at every width, with all text present (the wired bus is drawn by JS,
  so it is simply absent). Camera mode is enabled by JS adding `html.camera` only when the wide media query matches.
- **Semantics:** `<h1>` in the title block, one `<h2>` per section (styled like the `.ref` labels), real lists. Every
  drawing is `role="img"` with the pages' aria-labels. Parts are focusable and work with Enter or Space. Focusing
  anything inside an off-screen stop scrolls to that stop.
- **Contrast:** muted `#7d8792` on `#0b0d10` is about 5:1 and stays the minimum. Amber focus ring on everything focusable.
- **Contact:** the email is a real `mailto:` link plus a Copy button (from the NIC page), with a select-text
  fallback when the clipboard is blocked.

## 8. Stack (my call; replaces "React + shadcn" in `CLAUDE.md`)

| Choice | Why |
|---|---|
| **Astro** (current stable), static output | Components and build-time templating for the five SVG parts with **zero runtime JS by default**. Lighter than React for a page that is mostly a drawing. |
| **Vanilla TypeScript** client modules, one bundle | The runtime is a scroll loop, note layout, hover linking and copy-to-clipboard: about 10 KB, no library needed. |
| **Plain CSS** with the pages' tokens | The pages already have well-structured CSS. Tailwind and shadcn add nothing here, and shadcn's rounded defaults fight the visual language. |
| **No animation library** | CSS transitions/keyframes plus one rAF loop. GSAP, Lenis and Motion are unnecessary weight. |
| **Self-hosted fonts** via Fontsource (JetBrains Mono, IBM Plex Sans; variable if available, else only the weights used), latin subset, `font-display: swap`, preload the mono | No Google Fonts round-trip, and better privacy. |
| **Vitest** + **Playwright** (+ axe) | Unit tests for geometry, smoke and visual tests for each stop. |
| **GitHub Pages** via Actions | The repo is already on GitHub. Static output also runs as-is on Vercel, Netlify or Cloudflare. |

**Code shape (for the builder to refine):**
- `src/content/site.ts`: the single typed content object (profile, 4 skill groups × 3 chips with load 1–3 and
  a free slot, "next in the pipeline", 3 roles, 3 projects, contact: email, reply time, availability, résumé URL).
  Every `[bracketed]` placeholder lives here and nowhere else.
- `src/components/parts/{Cpu,Ram,Ssd,Gpu,Nic}.astro`: drawings ported from the generators, fed by `site.ts`.
- `src/components/Board.astro`: world SVG, part transforms, buses, stubs, slots, labels (port of `board.py`).
- `src/lib/geometry.ts`: pure functions ported from `kit.py`/`board.py`/CPU page: fan lanes, `route`,
  Liang–Barsky `clip`, inner-layer hop, bus routing, the crossing check, frame fitting and flyTo. Used at build time
  for static paths and at runtime for note layout.
- `src/scripts/camera.ts`, `notes.ts`, `hover.ts`, `narrow.ts`, `copy.ts`.

**Repo:** the Astro app lives at the repo root on branch `v2`, replacing the legacy Next.js site (still on `main`
and in history). `scaffold/` is removed. `design/` and `reference/` stay as the visual source of truth. The Python
generators are retired once ported.

## 9. Budgets and quality bars

- First load (gzip): HTML ≤ 45 KB, CSS ≤ 10 KB, JS ≤ 15 KB, fonts ≤ 110 KB, **total ≤ 200 KB**. No images except the
  Open Graph card.
- Lighthouse mobile: performance ≥ 95, accessibility 100, best practices ≥ 95, SEO 100.
- Camera at 60 fps on a mid-range laptop at 1440p. If blur during travel can't hold that, keep blur only for the
  settled state and transition it after arrival. Pause CSS animations inside far parts (`animation-play-state`).
- Safari: CSS `filter` on SVG groups has historically been patchy. Verify it early and fall back to an SVG
  `feGaussianBlur` filter or per-part layers.
- SEO/meta: `<title>Lee · Senior Backend Engineer (Python, Django, PostgreSQL)</title>`, description, canonical,
  Open Graph/Twitter card (a 1200×630 render of the bird's-eye board), JSON-LD `Person`.

## 10. Testing and done

- **Unit:** geometry is deterministic; zero bus crossings (port `board.py`'s check); `route` lands on the pad; `clip`
  stops before keep-outs; flyTo hits both endpoints exactly; frame fitting works at 16:9, 16:10, 21:9, 4:3.
- **E2E (Playwright, Chromium + WebKit):** each hash loads at its stop with notes visible; scrolling through all 7
  stops shows no console errors; Tab reaches every link; reduced-motion run; 390×844 narrow run; no-JS run shows all
  text; axe finds nothing serious.
- **Visual snapshots:** each stop at 1600×1000 and 1440×900, plus narrow at 390×844, compared against the
  `design/` pages for composition.
- **Placeholders:** `npm run placeholders` lists every remaining `[bracket]`. The build prints the count but does
  not fail, so Lee can deploy previews before the content is final.

## 11. Left to the builder

Exact chamfer/RUN constants, stub lengths, bit speed, the boot trace order, the far-layer opacity under notes
(tune until body text is comfortable), the closing call-to-action spacing, the OG card render pipeline, and file
layout beyond §8. All within §3–§9.

## 12. Known issues found while designing

- The Python generators call `open(..., 'w')` without `encoding='utf-8'`, so on Windows `ssd.py` fails on "→".
  This only matters until they are retired. `board.py` already writes UTF-8.
- The generated pages have no `<meta charset>`. The built site must declare it.
