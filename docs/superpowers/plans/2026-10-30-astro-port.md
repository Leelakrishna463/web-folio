# lee.sh on Astro — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. First action of execution: copy this file to `docs/superpowers/plans/2026-10-30-astro-port.md` and commit it.

## Context

The approved design for Lee's portfolio exists only as six hand-tuned static pages in `design/` (`lee-board.html`, `lee-cpu.html`, `lee-ram.html`, `lee-ssd.html`, `lee-gpu.html`, `lee-nic.html`) driven by `design/ds/ds.css`, `ds/dark.css`, `ds/ds.js` and `ds/live.js`. Content is hard-coded in each page, logic is duplicated, and the phone layout is a squeezed desktop drawing. The goal is a hostable, fast site: the same look and behaviour, content served from API-shaped JSON (real API later), reusable drawing components, a lean phone view, and near-zero client JS.

**Goal:** Ship lee.sh as an Astro static site on Vercel that reproduces the six design pages from JSON data, with reusable SVG components and a phone view built around a docked detail panel.

**Architecture:** Astro renders every page's SVG to HTML at build time from JSON read through one loader (`src/lib/api.ts`), so content and drawing arrive in the first byte. Interactivity is a few vanilla-TS modules (probe, popup card, blips, tour, mobile panel) bundled per page by Astro; desktop-only pieces load lazily. Pure geometry (chamfers, bus rotation, edge connectors, bit patterns, popup routing) lives in `src/lib/geom/` and is unit-tested.

**Tech Stack:** Astro 5 (static output), TypeScript strict, plain CSS with custom-property tokens, `astro/zod` for schema validation, Vitest, Playwright, Lighthouse CI, Vercel.

**Spec:** the six pages in `design/` are the visual and behavioural source of truth (geometry, copy, motion); this plan's Global Constraints carry the decisions made in conversation. Where code is ported, port from the named design file, don't re-invent.

## Global Constraints

- Framework: Astro 5.x, `output: 'static'`; no React/Preact/Vue; client code is vanilla TS only.
- Hosting: Vercel; repo root is the Astro app. Remove legacy Next.js (`src/`, `next.config.js`, root `package.json`/lockfile, `public/` legacy assets) and `scaffold/`; keep `design/` and `reference/` as reference only.
- Data: API-shaped JSON read at **build time**. Files in `src/data/api/v1/<resource>.json`, also served at `/api/v1/<resource>.json`. If env `LEE_API_BASE` is set, the loader fetches `${LEE_API_BASE}/v1/<resource>` instead. Same schema either way.
- Placeholders stay exactly as written, brackets included (`[Company]`, `[you@example.com]`, `[24 hours]`, `[AWS]`, …). Never invent content.
- Pages: `/`, `/about`, `/skills`, `/experience`, `/projects`, `/contact`. Astro view transitions between them.
- Styling: plain CSS. Tokens copied from `design/ds/dark.css` `:root`: `--neon #ffb547`, `--ground #060708`, `--paper #0a0d10`, `--shade #0d1114`, `--ink var(--neon)`, `--ink-2 color-mix(in oklab, var(--neon) 66%, #060708)`, `--rule … 22%`, `--red color-mix(in oklab, var(--neon) 40%, #fff)`, `--hot … 35%, #fff`, `--ok #4fe08a`. Font: Archivo variable, self-hosted woff2 from `design/fonts/archivo-latin.woff2`, preloaded.
- Geometry: traces straight with 45° bends only (no square corners, no curves). Exception: edge-connector shoulders and key notch use the round forms in `design/ds/live.js` `fingers()`.
- Hover: a probed part keeps its colours and glows (`drop-shadow(0 0 2px var(--neon)) drop-shadow(0 0 12px color-mix(in oklab, var(--neon) 55%, transparent))`). Overview CPU is always solid amber (`.lit`).
- Signal colour: lit net `color-mix(in oklab, var(--neon) 78%, var(--ground))`; packets `var(--neon)` with glow. Blips 140 units/s. Bus packets encode "LEE" per lane: bytes `01001100 01000101 01000101`, slot 16, packet 9, gap 32, 50 units/s, flowing into the CPU.
- Tour (desktop only): first open at 2600 ms, every 3600 ms, pauses on pointer/focus in the figure, resumes 6000 ms after leaving. Overview has no tour.
- Phone (≤ 640px): no blurred background parts, no tour, no popups, no blips; minimal static circuit lines kept; tapping a part fills a docked bottom **detail panel**. Bare CPU pins stay.
- `prefers-reduced-motion`: no draw-in, blips, packets, tour or flicker; hover glow still applies without transition.
- Budgets per page (gzipped): JS ≤ 15 KB initial (popup routing lazy-loaded on first desktop hover), CSS ≤ 14 KB, HTML ≤ 60 KB. Lighthouse mobile: Performance ≥ 95, Accessibility 100, Best Practices ≥ 95, SEO 100.
- Every fact reachable without JS (rendered in HTML; detail text in `<template>`s and a visually-hidden list), muted text contrast ≥ 4.5:1, visible focus on every probe-able part.

## Review Focus

1. **Placeholder or long real content** (e.g. a 40-char company name) must not overflow a chip: lettering auto-sizes to its box. → Task 4 test `Chip fits long label`.
2. **Touch + hover hybrids** (iPad with trackpad, touch laptops): tap must fill the panel, never require a second tap to read. → Task 5 test `tap on coarse pointer fills panel`.
3. **No JS / JS blocked**: all facts still readable and links work. → Task 12 Playwright `javaScriptEnabled: false` test.
4. **External API unreachable at build** (`LEE_API_BASE` set but down): build must fail loudly, not ship empty pages. → Task 2 test `loader throws on fetch failure`.
5. **Popup with no clear space** (short laptop screens, 1280×720): popup stays fully on screen. → Task 5 test `card stays in viewport at 1280x720`.

---

## File Structure

```
astro.config.mjs            static output, viewTransitions, site 'https://lee.sh'
vercel.json                 cache headers
src/
  data/api/v1/              profile.json about.json skills.json experience.json projects.json
  lib/
    api.ts                  getResource(name) -> validated data (local or LEE_API_BASE)
    schema.ts               zod schemas + exported TS types
    geom/path.ts            d(), chamfer(), rotate()
    geom/bus.ts             busLanes(), laneBits()
    geom/edge.ts            fingers() -> shapes for an edge connector
    geom/place.ts           popup placement + cord routing (port of live.js place())
  styles/tokens.css  base.css  board.css
  components/
    layout/  Base.astro Header.astro Intro.astro Stage.astro DetailPanel.astro Details.astro
    svg/     Figure.astro Chip.astro Pins.astro Net.astro Trace.astro EdgeConnector.astro
             Socket.astro Led.astro Tag.astro Ghost.astro (cpu|ram|ssd|gpu|nic)
    parts/   Cpu.astro Dimm.astro M2Drive.astro GpuCard.astro NicCard.astro BoardCpu.astro
  scripts/
    probe.ts                hover/focus/tap/keys -> lights part + nets, dispatches 'probe'
    panel.ts                phone: fills DetailPanel from <template data-detail>
    card.ts                 desktop: popup card (imports geom/place lazily)
    blips.ts  tour.ts  copy.ts
  pages/  index.astro about.astro skills.astro experience.astro projects.astro contact.astro
  pages/api/v1/[resource].json.ts   static endpoint mirroring src/data/api/v1
tests/unit/*.test.ts   tests/e2e/*.spec.ts   lighthouserc.json   .github/workflows/ci.yml
```

---

### Task 1: Astro app at root, tokens, layout shell, tooling

**Files:**
- Delete: legacy `src/`, `next.config.js`, `package.json`, lockfile, `scaffold/`, legacy `public/*`; add `.superpowers/` to `.gitignore`
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json` (extends `astro/tsconfigs/strict`), `vitest.config.ts`, `playwright.config.ts`, `vercel.json`, `public/fonts/archivo-latin.woff2`, `src/styles/{tokens,base}.css`, `src/components/layout/{Base,Header,Intro,Stage}.astro`, six stub pages
- Test: `tests/e2e/shell.spec.ts`

**Interfaces:**
- Produces: `<Base title description current>` (head, font preload, band, Header nav with `aria-current`, `<ViewTransitions/>`, `<slot/>`); `<Stage>` = intro column + figure column grid (port `.stage` rules from `dark.css`, ≥ 900px two columns); `<Intro heading role lede>` with `<slot/>` for extras.
- Scripts: `dev`, `build`, `preview`, `test` (vitest), `e2e` (playwright), `check` (astro check).

- [ ] **Step 1:** Write `tests/e2e/shell.spec.ts`: for each of the six routes, page has `<h1>`, nav has 6 links, the current one has `aria-current="page"`, Résumé link present; no console errors.
- [ ] **Step 2:** Run `npm run e2e` → FAIL (no app).
- [ ] **Step 3:** Scaffold Astro, port tokens (Global Constraints) to `tokens.css`, port header/nav/button/intro/stage rules from `design/ds/ds.css` + `dark.css` into `base.css` (drop light-theme rules), theme `::selection`, focus ring, scrollbar from tokens. `vercel.json`: `Cache-Control: public, max-age=31536000, immutable` for `/_astro/*` and `/fonts/*`; `max-age=300` for `/api/*`.
- [ ] **Step 4:** `npm run build && npm run e2e` → PASS.
- [ ] **Step 5:** Commit `chore: replace legacy Next app with Astro shell`.

### Task 2: Data layer — JSON resources, schemas, loader, endpoints

**Files:**
- Create: `src/data/api/v1/{profile,about,skills,experience,projects}.json`, `src/lib/schema.ts`, `src/lib/api.ts`, `src/pages/api/v1/[resource].json.ts`
- Test: `tests/unit/api.test.ts`

**Interfaces:**
- Produces: `type Resource = 'profile'|'about'|'skills'|'experience'|'projects'`; `getResource<R extends Resource>(name: R): Promise<ResourceMap[R]>`; types `Profile`, `About`, `Skills`, `Experience`, `Projects`.
- Shapes (copy values from the design pages; keep brackets):
  - `profile`: `{ name, partNumber:'LEE-5Y', role, location, workMode, years:'~5', timezone:'IST (UTC+5:30)', status:{ active:true, text:'Open to senior backend roles' }, summary, coreStack:string[], email, resumeUrl, replyTime }`
  - `about`: `{ pins: { id, label, type:'I/O'|'Output'|'Clock', lines:string[], action?:{ text, href } }[] }` — the 7 fact pins from `lee-cpu.html` `PIN`.
  - `skills`: `{ strongest:string[], next:string, loadLegend:[3,2,1] labels, modules:{ id:'A1'|'A2'|'B1'|'B2', group, short, chips:({ name, load:1|2|3, note? }|null)[] }[] }` (exactly 4 modules × 3 sites, one `null` = free socket).
  - `experience`: `{ roles:{ id, company, title, from, to:string|null, impact, kind:'NAND'|'CTRL' }[] }` oldest first, last has `to:null` and `kind:'CTRL'`.
  - `projects`: `{ projects:{ id, name, stack:string[], problem, fix, result }[] }` (exactly 3).

- [ ] **Step 1:** Tests: each resource parses; `skills.modules.length === 4` and each has 3 sites; `experience.roles.at(-1).to === null`; endpoint `GET /api/v1/skills.json` body deep-equals the file; `loader throws on fetch failure` (mock `fetch` reject with `LEE_API_BASE` set → rejects with message naming the resource); placeholders preserved (`profile.email === '[you@example.com]'`).
- [ ] **Step 2:** `npm test -- api` → FAIL.
- [ ] **Step 3:** Implement schemas with `astro/zod`; `getResource` imports local JSON (`import.meta.glob('../data/api/v1/*.json', { eager: true })`) or fetches when `LEE_API_BASE` is set; always `schema.parse`. Endpoint uses `getStaticPaths` over the resource list and returns `getResource()` as JSON.
- [ ] **Step 4:** `npm test -- api` → PASS.
- [ ] **Step 5:** Commit `feat: API-shaped JSON resources with validated build-time loader`.

### Task 3: Geometry library

**Files:**
- Create: `src/lib/geom/{path,bus,edge,place}.ts`
- Test: `tests/unit/geom.test.ts`, `tests/unit/place.test.ts`

**Interfaces:**
- `type Pt = [number, number]`
- `d(pts: Pt[]): string` — `M x y L …`, 1 decimal.
- `chamfer(pts: Pt[], r: number): Pt[]` — port of `ds.js chamfer()`: cut square corners at 45°, `c = min(r, l1/2, l2/2)`.
- `rotate(pt: Pt, centre: Pt, quarters: 0|1|2|3): Pt` — clockwise quarter turns (Overview bus symmetry).
- `busLanes(o:{ centre:Pt, pinPitch:number, lanes:8, bundle:6, neckX:number, turnX:number, slotY:number, cut0:4 }): Pt[][]` — port of the Overview left bus in `lee-board.html` (lane k: neck to `bundle` spacing, then 45° cut of length `cut0 + k*bundle*(2-√2)`).
- `laneBits(k: number): { dash: number[]; period: number }` — LEE encoding (slot 16, packet 9, gap 32).
- `fingers(o:{ x, y, len, d, side:'b'|'t'|'l'|'r', key?:number, pitch?:number, snug?:boolean }): { tab: Pt[]; fill: Rect; fingers: Rect[]; keyslot?: Pt[] }` — port of `live.js fingers()` incl. round shoulders, round-ended key slot spanning the gap, snug = 2 fingers skipped.
- `place(o:{ W, H, tip:Pt, obstacles:Rect[], view:Rect, grid?:number }): { x, y, landing:Pt, cord:Pt[] } | null` — port of `live.js place()` (grid router, straight + square turns only, cost 3 per turn); pure, no DOM.

- [ ] **Step 1:** Tests: `chamfer([[0,0],[10,0],[10,10]],3)` → `[[0,0],[7,0],[10,3],[10,10]]`; `rotate([0,0],[5,5],1)` → `[10,0]`; `busLanes` returns 8 lanes, every segment axis-aligned or 45°, adjacent lanes stay 6 apart through the bend; `laneBits(1)` for byte bit '1' gives packet 9; `fingers({snug:true,…}).fingers` count = all minus 2; `place` returns `null` when obstacles fill the view, otherwise a box not intersecting any obstacle and a cord whose segments are axis-aligned.
- [ ] **Step 2:** `npm test -- geom place` → FAIL.
- [ ] **Step 3:** Implement by porting the named functions; keep them DOM-free.
- [ ] **Step 4:** → PASS.
- [ ] **Step 5:** Commit `feat: geometry library (paths, buses, edge connectors, popup routing)`.

### Task 4: Reusable SVG components

**Files:**
- Create: `src/components/svg/{Figure,Chip,Pins,Net,Trace,EdgeConnector,Socket,Led,Tag,Ghost}.astro`, `src/styles/board.css` (port drawing rules from `ds.css`/`dark.css`: `.body .paper .pcb .pin .gold .tab .finger .keyslot .trace .net .bits .blip .brd .led .l1/.l2/.l3 .die .mark` and the hover rules in Global Constraints)
- Test: `tests/unit/components.test.ts` (Astro Container API)

**Interfaces:**
- `<Figure viewBox label narrowViewBox?>` — renders `<svg role="group">`; slots `wide` and `narrow`; CSS shows one per breakpoint (no JS layout switch).
- `<Chip x y w h pins="tblr" pitch len label? sub? lit?:1|2|3 probe?:string>` — body + pin rows + pin-1 dot + auto-fit lettering (`size = min(max, (w-pad)/(chars*0.64))`); `probe` makes it `<g class="pr" data-key tabindex=0 role aria-label>`.
- `<Net points keys r? square?>` — `.net` path + sibling `.bits` path, `data-net` = space-separated keys; optional `lane` prop sets `laneBits`.
- `<Trace points blip?>` — resting copper; `blip` adds `.blip` with `data-len`.
- `<EdgeConnector …fingers() props>` and `<Socket rect>` (drawn after fingers so it covers the tips).
- `<Ghost kind="cpu|ram|ssd|gpu|nic" x y w h href>` — blurred linked outline (port `LIVE.board`); hidden ≤ 640px.

- [ ] **Step 1:** Tests: `Chip fits long label` (40-char label → font-size ≤ box-derived max, text never wider than box at 0.64em/char); `Chip probe` renders `class="pr"`, `tabindex="0"`, `data-key`; `Net` with `keys="u4 u1"` renders both paths with that `data-net`; `EdgeConnector snug` renders N-2 `.finger` rects and a `.keyslot` path.
- [ ] **Step 2:** → FAIL. **Step 3:** implement using Task 3 functions. **Step 4:** → PASS.
- [ ] **Step 5:** Commit `feat: reusable SVG drawing components`.

### Task 5: Interaction runtime + details

**Files:**
- Create: `src/scripts/{probe,panel,card,blips,tour,copy}.ts`, `src/components/layout/{DetailPanel,Details}.astro`
- Test: `tests/e2e/interaction.spec.ts`

**Interfaces:**
- `<Details items={{ key, title, tag, rows:Row[], href? }[]}>` renders one `<template data-detail={key}>` each plus a visually-hidden `<ul>` of the same facts (no-JS / screen readers). `type Row = {small:string}|{text:string}|{load:1|2|3,text:string}|{act:string}`.
- `probe.ts`: `initProbe(fig: SVGSVGElement): void` — hover/focus/click on `.pr`, toggles `.on`, lights `.net/.bits[data-net~=key]`, arrow keys move, Esc clears, Enter follows `href`; dispatches `CustomEvent('probe', { detail:{ key } })` on the figure. Links: on coarse pointers first tap probes, second tap follows.
- `panel.ts`: `initPanel()` — `matchMedia('(max-width: 640px), (pointer: coarse)')`; listens for `probe`, fills `DetailPanel` from the template, `aria-live="polite"`; panel shows an idle hint ("Tap a chip to read it") before first tap.
- `card.ts`: `initCard()` — `(hover:hover) and (pointer:fine)` only; on first `probe` dynamically `import('../lib/geom/place')`, gathers obstacle rects from the DOM, renders the popup (port `LIVE.card` + cord), keeps it inside the viewport.
- `blips.ts`: `initBlips()` — WAAPI per `.blip` at 140 u/s, pause gap 2000+seed·600 ms; skipped on phone and reduced motion. `tour.ts`: `initTour(keys: string[])` per Global Constraints, desktop only. `copy.ts`: `initCopy(button, text)`.
- Each page includes one `<script>` importing only what it needs.

- [ ] **Step 1:** e2e tests: desktop hover on a chip adds `.on` and lights only its nets; `card stays in viewport at 1280x720` (every probe-able part on every page: popup rect within window); phone (`isMobile`, 390×844) `tap on coarse pointer fills panel` with the template's title and nothing auto-opens after 5 s; keyboard ArrowRight moves focus to next part; reduced-motion: no running animations (`document.getAnimations().length === 0`).
- [ ] **Step 2:** → FAIL. **Step 3:** implement (ports from `design/ds/ds.js` `figure()` and `design/ds/live.js`). **Step 4:** → PASS (run against a fixture page `src/pages/_fixture.astro`, excluded from build via `import.meta.env.DEV`).
- [ ] **Step 5:** Commit `feat: probe, popup card, mobile detail panel, blips, tour`.

### Tasks 6–11: Pages (one task each, same pattern)

Each page task: build the part component in `src/components/parts/`, the page in `src/pages/`, `<Details>` from the page's JSON, and an e2e test file `tests/e2e/<page>.spec.ts`. Port geometry from the named design file; desktop = its `wide` build, phone = a simplified `narrow` drawing (no ghosts, minimal static lines, part stacked full width, DetailPanel docked).

Common steps per task:
- [ ] **Step 1:** e2e: page renders every fact from its JSON (assert each string, brackets included); probe-able part count matches the data; desktop screenshot vs baseline (`toHaveScreenshot`, 1440×900, threshold 0.02) after baseline is approved once by Lee; phone 390×844 has no `.brd` visible, no `.blip`, panel present.
- [ ] **Step 2:** → FAIL. **Step 3:** implement. **Step 4:** → PASS. **Step 5:** commit `feat(<page>): …`.

Page specifics:
- **Task 6 — Overview (`index.astro`, port `lee-board.html`)**: `BoardCpu` lit; GPU/NIC/SSD/RAM with `EdgeConnector`+`Socket`; four identical 8-lane buses via `busLanes` + `rotate` (GPU left, NIC top, RAM right with 2 lanes per stick, SSD bottom); each RAM stick its own probe (`u2a…u2d`); hover glow, LEE packets; no tour. Phone: CPU on top, parts stacked, one short static trunk line per part.
- **Task 7 — About (`about.astro`, `lee-cpu.html`)**: QFP-48 `Cpu` with 7 fact pins from `about.json` (sockets at staggered lengths `RUN`), 41 bare pins with traces to ghosts (desktop) / short stubs (phone); tour over fact pins.
- **Task 8 — Skills (`skills.astro`, `lee-ram.html`)**: 4 `Dimm`s from `skills.modules`, chips lit by load, free socket, legend + "Next in the pipeline" in Intro; straight 6-lane buses to CPU ghost pins (desktop).
- **Task 9 — Experience (`experience.astro`, `lee-ssd.html`)**: `M2Drive` with screw, keyed edge connector (not snug — keep the SSD's approved notch), roles oldest→newest, current role `lit 3`, ROLE hexagon row + YEAR ruler.
- **Task 10 — Projects (`projects.astro`, `lee-gpu.html`)**: `GpuCard` with lit GPU, 3 VRAM chips from `projects`, render paths light on probe, popup opens from chip's right end (W 250).
- **Task 11 — Contact (`contact.astro`, `lee-nic.html`)**: `NicCard` (jacks with green link LEDs, PHYs, lit controller, buffers, PCIe), email in Intro with Copy button (`copy.ts`), controller probe copies email; `mailto:` link.

### Task 12: Phone polish, budgets, a11y, CI, deploy

**Files:**
- Create: `lighthouserc.json`, `.github/workflows/ci.yml`, `tests/e2e/nojs.spec.ts`, `tests/e2e/budget.spec.ts`
- Modify: `CLAUDE.md` (replace stale visual-language/workflow sections with the Astro architecture and current amber design)

- [ ] **Step 1:** Tests: `nojs.spec.ts` (`javaScriptEnabled:false`) — every page shows all facts and nav works; `budget.spec.ts` — sum of transferred JS per page ≤ 15 KB gz, CSS ≤ 14 KB, no layout shift > 0.02 (PerformanceObserver); axe scan zero violations on all pages at 390 and 1440 widths.
- [ ] **Step 2:** → FAIL where unmet; fix (lazy imports, purge unused CSS, `font-display: swap`).
- [ ] **Step 3:** CI: `npm ci → astro check → vitest → astro build → playwright → lhci autorun` (thresholds from Global Constraints); Vercel Git integration on `main`, preview per PR.
- [ ] **Step 4:** Deploy preview, run Lighthouse on the preview URL; connect domain `lee.sh` (Lee's DNS step).
- [ ] **Step 5:** Commit `chore: CI, budgets, a11y checks, Vercel deploy, docs`.

---

## Verification (end to end)

1. `npm run build` succeeds; `dist/` contains six pages and `/api/v1/*.json`.
2. `npm test` and `npm run e2e` green (unit, interaction, per-page, no-JS, budget, axe).
3. `npm run preview`, open in Chrome at 1440×900 and 1920×1080: compare side by side with `design/lee-*.html` — same look, hover glow, LEE packets, popups never cover data, tour on section pages only.
4. Chrome DevTools device mode iPhone 14 (390×844): no ghosts, no auto popups, tap any chip → docked panel fills; Lighthouse mobile scores meet budgets.
5. Set `LEE_API_BASE` to a stub server serving the same JSON → build output identical; stop the stub → build fails with a resource-named error.
6. Vercel preview URL passes the same Lighthouse thresholds.
