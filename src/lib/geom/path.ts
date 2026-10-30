// Points and paths for the drawings. Traces run straight and bend only at 45°.
export type Pt = [number, number];
export interface Rect { x: number; y: number; w: number; h: number }

/** An SVG path through the points: `M x y L x y …`, one decimal place. */
export function d(pts: Pt[]): string {
  return pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
}

/** Cut every square corner at 45°, `r` units back along each leg (never more than half a leg). Port of ds.js chamfer(). */
export function chamfer(pts: Pt[], r: number): Pt[] {
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1], p = pts[i], b = pts[i + 1];
    const l1 = Math.hypot(p[0] - a[0], p[1] - a[1]), l2 = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const u1: Pt = [(p[0] - a[0]) / l1, (p[1] - a[1]) / l1], u2: Pt = [(b[0] - p[0]) / l2, (b[1] - p[1]) / l2];
    const square = Math.abs(u1[0] * u2[0] + u1[1] * u2[1]) < 1e-6 && (u1[0] === 0 || u1[1] === 0) && (u2[0] === 0 || u2[1] === 0);
    const c = Math.min(r, l1 / 2, l2 / 2);
    if (square && c > 0.5) out.push([p[0] - u1[0] * c, p[1] - u1[1] * c], [p[0] + u2[0] * c, p[1] + u2[1] * c]);
    else out.push(p);
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/** Turn a point clockwise about a centre by a number of quarter turns (the Overview's four identical buses). */
export function rotate(pt: Pt, centre: Pt, quarters: 0 | 1 | 2 | 3): Pt {
  let [x, y] = pt;
  for (let i = 0; i < quarters; i++) [x, y] = [centre[0] - (y - centre[1]), centre[1] + (x - centre[0])];
  return [x + 0, y + 0];
}
