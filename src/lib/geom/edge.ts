// An edge connector, the way a card's edge really looks: the board steps in at rounded shoulders and a tab stands out,
// its gold fingers side by side down to the tip, keyed by a round-ended slot. Port of design/ds/live.js fingers().
//   |                      |
//   |__                  __|
//      |_|_|_|_|_|_|_|_|
import type { Pt, Rect } from './path';

export interface EdgeOptions {
  /** where the tab starts on the board's edge */
  x: number;
  y: number;
  /** its length along the edge */
  len: number;
  /** how far it stands out */
  d: number;
  /** which way it stands out */
  side: 'b' | 't' | 'l' | 'r';
  /** the key notch's offset along the tab */
  key?: number;
  /** finger spacing (default 5) */
  pitch?: number;
  /** a narrower key gap: only the two fingers nearest the key are left out */
  snug?: boolean;
}

export interface EdgeShapes {
  /** the tab's outline, open where it joins the board */
  tab: Pt[];
  /** fills the tab's root, hiding the board's own edge line there */
  fill: Rect;
  fingers: Rect[];
  keyslot?: Pt[];
}

/** Points around an arc centred on (cu, cv), radius rr, from a0 to a1 degrees. */
function arc(cu: number, cv: number, rr: number, a0: number, a1: number): Pt[] {
  return Array.from({ length: 9 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / 8) * Math.PI) / 180;
    return [cu + rr * Math.cos(a), cv + rr * Math.sin(a)] as Pt;
  });
}

export function fingers(o: EdgeOptions): EdgeShapes {
  const P = (u: number, v: number): Pt =>
    o.side === 'b' ? [o.x + u, o.y + v] : o.side === 't' ? [o.x + u, o.y - v] : o.side === 'r' ? [o.x + v, o.y + u] : [o.x - v, o.y + u];
  const box = (u0: number, v0: number, u1: number, v1: number): Rect => {
    const a = P(u0, v0), b = P(u1, v1);
    return { x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), w: Math.abs(b[0] - a[0]), h: Math.abs(b[1] - a[1]) };
  };
  const L = o.len, D = o.d, pitch = o.pitch ?? 5, pw = pitch * 0.66, kw = pitch * 0.8, r = Math.min(4, D * 0.3);
  let k = o.key;

  // the fingers on their pitch; those nearest the key leave a gap in the row
  const all: number[] = [];
  for (let u = 3; u + pw <= L - 3; u += pitch) all.push(u);
  let skip: number[] = [];
  if (k != null) {
    const key = k;
    skip = o.snug
      ? [...all].sort((a, b) => Math.abs(a + pw / 2 - key) - Math.abs(b + pw / 2 - key)).slice(0, 2)
      : all.filter((u) => u + pw > key - kw - 2 && u < key + kw + 2);
  }
  let gapL = -Infinity, gapR = Infinity;
  const kept = all.filter((u) => !skip.includes(u));
  if (k != null) for (const u of kept) {
    if (u + pw <= k) gapL = Math.max(gapL, u + pw);
    if (u >= k) gapR = Math.min(gapR, u);
  }
  if (o.snug && Number.isFinite(gapL) && Number.isFinite(gapR)) k = (gapL + gapR) / 2;

  const out: Pt[] = [...arc(-r, r, r, -90, 0), [0, D], [L, D], ...arc(L + r, r, r, 180, 270)];
  const shapes: EdgeShapes = {
    tab: out.map(([u, v]) => P(u, v)),
    fill: box(-r + 0.5, -1.5, L + r - 0.5, 1.5),
    fingers: kept.map((u) => box(u, 3, u + pw, D)),
  };
  // the key: a straight-sided slot with a half-round end, spanning the whole gap and keeping the slot's proportions,
  // so it rises as far as its width asks, on into the board
  if (k != null && Number.isFinite(gapL) && Number.isFinite(gapR)) {
    const hw = (gapR - gapL) / 2, mid = (gapL + gapR) / 2, tall = ((D - 2) / (2 * kw)) * (gapR - gapL), crown = D - tall + hw;
    shapes.keyslot = [[gapL, D + 1] as Pt, ...arc(mid, crown, hw, 180, 360), [gapR, D + 1] as Pt].map(([u, v]) => P(u, v));
  }
  return shapes;
}
