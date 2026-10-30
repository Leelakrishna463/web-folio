---
version: 1
slug: "design-lee-board-html"
primary_target: "design/lee-board.html"
related_targets: ["design/lee-cpu.html","design/lee-ram.html","design/lee-ssd.html","design/lee-gpu.html","design/lee-nic.html"]
---

# lee.sh: datasheet redesign (six design pages)

Scope: `design/lee-board.html` (front page / landing), `lee-cpu.html` (About), `lee-ram.html` (Skills),
`lee-ssd.html` (Experience), `lee-gpu.html` (Projects), `lee-nic.html` (Contact). Visitor mode: Experience.
Audience/job: recruiters get name, role, stack, location, status, résumé in five seconds; engineers read the
drawings. Constraints: PRODUCT.md (part↔section mapping, star bus, real parts, calm motion, placeholders stay
bracketed). Build path: code-led (no image generation in this harness).

## Direction contract

THESIS: Lee is published as a semiconductor part, LEE-5Y, and the site is its datasheet: six pages, each a
datasheet section built around one large figure whose part is lettered with the facts (pin names, chip
markings, package marking). It refuses the dark-ground, neon-trace developer portfolio and floating note cards.

OWN-WORLD: White datasheet paper (#ffffff), black line-art ink (#121212), one corporate red (#c8102e) for the
top band, section numbers and the selected net; grey rules (#d9d9d6) and pale package shading (#f3f3f1).
Archivo only, width axis for condensed pin lettering. Square packages, 45° traces, pin-1 dots, chamfers.

STORY: The visitor sees a real part with a real number, learns who Lee is from the package marking and the
front-page features, then turns pages: pinout (About), memory organisation (Skills), timing (Experience),
typical application (Projects), ordering information (Contact), and emails Lee.

FIRST VIEWPORT: Red band; running header LEE-5Y left, doc number/revision right. Title line at display scale:
"LEE-5Y Senior Backend Engineer". Left column 1 Features / 2 Applications / 3 Description with Résumé +
Email actions. Right two-thirds: Figure 1 Simplified Schematic, the star board (CPU centre; RAM, SSD, GPU,
NIC blocks lettered with their contents) at full height. Every block is a live control.

FORM: The Datasheet, my top-ranked grounded candidate (#1 of 7), taken as the pick. seed:54c509d43ac67361

SIGNATURE INTERACTION: Probe. Every lettered pin, chip and block is a focusable control (arrow keys move
along a side). Probing inverts the element (black fill, white lettering), draws its net in red with LEE bits
travelling the trace, and updates the figure's own caption line. Narrow screens swap the package (QFP to
SOIC, horizontal to vertical modules) so lettering stays ≥12px.

MOTION: one moment per page: on load the figure's nets draw out from the CPU once (≤700 ms, ease-out). Probing
is instant inversion plus a 180 ms net draw. Reduced motion: no draw, no bits.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
