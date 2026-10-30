# lee.sh: portfolio site

Portfolio for Lee, a backend engineer (Python / Django / PostgreSQL, Bengaluru) targeting senior backend roles.
Serves **two audiences at once**: recruiters/HR (plain-English labels, obvious facts) and engineers (accurate
hardware/networking details).

## Working with Lee

- Agree on the design in conversation first, then build. Show visuals early.
- Keep it restrained. Lee rejects anything overloaded, artificial, or generic.
- Never invent personal details. Use `[bracketed]` placeholders until Lee supplies them.

## Repo layout

| Path | What it is |
|---|---|
| repo root (`src/`, `package.json`, `next.config.js`) | **Legacy** Next.js 14 + daisyUI portfolio (the old site). Not the new design; don't extend it. |
| `design/lee-*.html` | The five approved component pages. Standalone; open in a browser. **Source of truth for geometry.** |
| `design/generator/` | Python that generates RAM/SSD/GPU/NIC pages. `kit.py` = shared engine (trace fans from ports, Liang–Barsky keep-out clipping, wire routing, note placement, narrow-screen bus, hover linking). Each script writes `../lee-<part>.html`. |
| `scaffold/` | Vite + React 19 + TS + Tailwind v4 + shadcn/ui from the rejected terminal design. **Never built**: run `npm install && npm run build` and fix versions before relying on it. Reuse the setup, replace the content. |
| `reference/` | `old-birds-eye-board.html` (outdated visual language, reference only), `nic-reference.png`. |

Regenerate a page (Windows: `python`, not `python3`):

```sh
cd design/generator && python ram.py   # or ssd.py / gpu.py / nic.py
```

`lee-cpu.html` is hand-written, not generated. Edit the generator, not the generated HTML, for RAM/SSD/GPU/NIC.

## Concept: the site is a motherboard

Each component is one section. Star topology: every component connects **only to the CPU**. Buses carry flowing
1s and 0s (the bits spell "LEE" in ASCII).

| Component | Section | Status |
|---|---|---|
| CPU (centre hub) | About | designed: `design/lee-cpu.html` |
| RAM | Skills | designed: `design/lee-ram.html` |
| SSD | Experience | designed: `design/lee-ssd.html` |
| GPU | Projects | designed: `design/lee-gpu.html` |
| NIC | Contact | designed: `design/lee-nic.html` |
| Bird's-eye board | Landing | **not designed**: zoomed-out view of the five components |

Flow: bird's-eye board → scroll zooms into CPU → scroll visits RAM, SSD, GPU, NIC → closing shot of the whole
board lit.

## Visual language (agreed; don't change)

- **Colours:** bg `#0b0d10` (graphite, not black), vignette `#13171c`; single accent amber `#ffb547`, hot
  `#ffd796`; green `#4fe08a` only for on/ok LEDs; text `#eef1f4`, muted `#7d8792`, component lines `#c3ccd5`.
- **Type:** JetBrains Mono (labels, chip etching, silkscreen); IBM Plex Sans (readable copy).
- **Components:** 2D representational line drawings, recognisable as the real part (pins, gold contacts, key
  notches, fans, LEDs, screw notch). Not photoreal, not 3D.
- **Geometry:** sharp edges, radii 1–3 units max, no pills. Traces straight with 45° bends only, never curves.
- **Depth:** the rest of the board sits blurred behind the focused component.
- **Facts:** float beside gold pads, wired to the component by a brighter trace (out, one 45° bend, straight in).
  Wired traces follow the ambient fan geometry so they never cross.
- **Keep-out:** nothing runs under text; ambient traces end at a via before any text block.
- **Info on chips** where it fits (RAM chips = skills, SSD chips = roles).
- **Motion:** calm. Gently floating notes, slow trace pulses, blinking LEDs. Hover lights part + wire + note.
  Respect `prefers-reduced-motion`.
- **No clutter:** only components that matter; no decorative extra parts.
- **Narrow screens:** component on top, notes listed below, fed by one bus down the left edge.

## Per-page specs (exact geometry is in the HTML)

- **CPU / About:** centred chip, 16 pins per side, lid etched "LEE / Senior Backend Engineer / Python · Django ·
  PostgreSQL". Notes: intro (top-left), Core stack + Experience (left), Location + Status (right), Résumé +
  Contact buttons (bottom-right).
- **RAM / Skills:** four horizontal DIMMs, slot + gold contacts on the **left**, traces fan left. 3 chips per stick
  = 3 skills, each with 3 load LEDs (daily / comfortable / working). Group label at right end. One empty dashed
  "FREE · next skill" socket. Notes: intro (top), Strongest, Load legend, Next in the pipeline (right).
- **SSD / Experience:** M.2 drive as timeline. Oldest role by the screw, current role on the controller by the
  connector ("data flows toward the present and on to the CPU"). Year ruler silkscreened along the bottom. One
  impact note per role, wired from its chip.
- **GPU / Projects:** card's circuit side. GPU die renders each project into its own memory chip; hover lights the
  render path (marching dashes). Notes: problem → what I did → result.
- **NIC / Contact:** flat 2D network card (`reference/nic-reference.png`): I/O bracket with 4 RJ45 jacks
  (link/activity LEDs), PHY chips, glowing controller ASIC, memory buffers, PCIe gold fingers. **One channel only:
  email.** Controller = email ("One address, always listening"); ports = "Link up · open to senior backend roles";
  buffers = "Nothing dropped · replies within [24h]"; PCIe = "Ready to slot in" + résumé.

## Rejected (never bring back)

Terminal-only page; realistic 3D / Three.js parts; curved buses; rounded components; adjacent-pin comb wiring;
separate floating info card/box; "plug the cable in" NIC; rear-I/O panel with one port per contact channel;
TCP-handshake contact page.

## Next steps

1. Design the bird's-eye landing view and the scroll transitions between pages.
2. Build the real site (in `scaffold/` or a fresh Vite + React + shadcn app): one React component per board part,
   SVG ported from the HTML, `kit.py` trace/keep-out/wire logic ported to a shared hook.
3. Replace every `[bracketed]` placeholder with Lee's real details (companies, roles, years, projects, impact,
   email, links, résumé URL, reply time). RAM load levels are guesses; confirm them.
4. Deploy (Vercel / Netlify / GitHub Pages) on a short domain (lee.sh or lee.dev).
