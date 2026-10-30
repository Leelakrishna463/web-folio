# lee.sh: portfolio site

Portfolio for Lee, a backend engineer (Python / Django / PostgreSQL, Bengaluru) targeting senior backend roles.
Serves **two audiences at once**: recruiters/HR (plain-English labels, obvious facts) and engineers (accurate
hardware/networking details).

## Working with Lee

- Agree on the design in conversation first, then build. Show visuals early.
- Keep it restrained. Lee rejects anything overloaded, artificial, or generic.
- Never invent personal details. Use `[bracketed]` placeholders until Lee supplies them.

## Stack and commands

Astro 5 static site, vanilla TypeScript islands (no UI framework), plain CSS tokens. Hosted on Vercel.

```sh
npm run dev        # local dev server
npm run build      # static build to dist/
npm test           # Vitest: data loader, geometry, components
npm run e2e        # Playwright (builds with test fixtures, then previews): desktop + phone
npx astro check    # types
```

CI (`.github/workflows/ci.yml`) runs check → unit → e2e → build → Lighthouse (`lighthouserc.json`).

## Repo layout

| Path | What it is |
|---|---|
| `src/data/api/v1/*.json` | All site content, API-shaped (profile, about, skills, experience, projects). Also served at `/api/v1/<name>.json`. |
| `src/lib/api.ts`, `schema.ts` | `getResource(name)`: reads the JSON at build time, or `${LEE_API_BASE}/v1/<name>` when set; zod-validated, fails the build loudly. |
| `src/lib/geom/` | DOM-free geometry: paths/chamfer/rotate, 8-lane buses + LEE bit patterns, edge connectors, popup placement router. |
| `src/components/svg/` | Reusable drawing pieces: Figure (wide + narrow builds), Chip, Probe, Pins, Net, Trace, EdgeConnector, Socket, Led, Tag, Ghost, Lines, Screw, CpuPin. |
| `src/components/parts/` | Page parts: Cpu, Dimm, RoleChip, VramChip, NicCard, and `board/` (Overview's small parts). |
| `src/components/layout/` | Base, Header, Intro, Stage, Details (per-part `<template>`s + screen-reader list), DetailPanel. |
| `src/scripts/` | Client runtime, ~9 KB gz: probe, card (popup; routing lazy-loaded), panel (phone), blips, tour, copy; booted by `figure.ts`. |
| `src/pages/` | `/`, `/about`, `/skills`, `/experience`, `/projects`, `/contact`. |
| `tests/` | `unit/` (Vitest), `e2e/` (Playwright), `fixtures/` (test-only `/fixture` page, injected when `LEE_FIXTURES=1`). |
| `design/` | The approved static design pages (`lee-*.html` + `ds/`). **Visual reference only**; the site is built in `src/`. |
| `docs/superpowers/` | Specs and implementation plans. |

## Concept: the site is a motherboard

Each section is one component; star topology: every component connects **only to the CPU**. CPU = About,
RAM = Skills, SSD = Experience, GPU = Projects, NIC = Contact, the whole board = Overview (landing).

## Visual language (agreed)

- **Colour:** near-black ground `#060708`; one amber `#ffb547` for every line and letter (tokens in
  `src/styles/tokens.css`); hot amber for probed leads; green `#4fe08a` only for link/ok LEDs.
- **Type:** Archivo (self-hosted variable woff2), condensed widths for lettering on parts.
- **Parts:** 2D line drawings recognisable as the real hardware; keyed edge connectors (round-ended key slot,
  rounded shoulders) seated in thick sockets that cover the finger tips.
- **Traces:** straight runs with 45° bends only. Overview buses are one 8-lane shape rotated a quarter turn per side.
- **Hover/probe:** the part keeps its colours and glows; its nets light; lit buses carry "LEE" in ASCII, one bit per lane.
- **Popups:** open in clear space, reached by a square-cornered cord; never cover a part or lettering; stay on screen.
- **Rest of the board:** blurred ghosts behind the focused part, each a link to its section.
- **Motion:** calm; blips at a constant pace; tour on section pages only (desktop); all off under reduced motion.
- **Phone:** no ghosts, no tour, no popups, no blips; minimal static lines; tapping a part fills a docked bottom panel.

## Rejected (never bring back)

Terminal-only page; realistic 3D / Three.js parts; curved buses; adjacent-pin comb wiring; separate floating info
card beside the drawing; "plug the cable in" NIC; rear-I/O panel with one port per contact channel; TCP-handshake
contact page; the light "datasheet" theme.

## Next steps

1. Replace every `[bracketed]` placeholder in `src/data/api/v1/*.json` with Lee's real details (companies, roles,
   years, projects, impact, email, résumé URL, reply time, next skill). RAM load levels are guesses; confirm them.
2. Deploy to Vercel and connect the domain (lee.sh or lee.dev).
3. When a real API exists, set `LEE_API_BASE` in Vercel; the JSON schema is the contract.
