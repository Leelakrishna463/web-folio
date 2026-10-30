// Where a popup box can open without covering anything that carries information, and the cord that reaches it from the
// lead's tip without crossing any of it either. Pure (no DOM): the caller passes the obstacles and the visible area.
// The cord is found on a grid, moving only across or up and down and paying for every turn, so it comes out as a few
// clean runs; the box chosen is the free one the cord reaches soonest. Port of design/ds/live.js place().
import type { Pt, Rect } from './path';
export type { Rect } from './path';

export interface PlaceOptions {
  W: number;
  H: number;
  /** the lead's tip, where the cord starts */
  tip: Pt;
  /** unpadded bounding boxes of everything that may not be covered */
  obstacles: Rect[];
  /** the area the box must stay inside */
  view: Rect;
  /** grid size; default 10, or 5 when the view is narrower than 500 */
  grid?: number;
}
export interface Placement { x: number; y: number; landing: Pt; cord: Pt[] }

const STEP: Pt[] = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
const MARGIN = 8, TURN = 3;

/** Min-heap of (key, value) pairs for the router. */
class Heap {
  k: number[] = []; v: number[] = [];
  get size() { return this.k.length; }
  push(key: number, val: number) {
    const { k, v } = this; let i = k.length; k.push(key); v.push(val);
    while (i) { const j = (i - 1) >> 1; if (k[j] <= key) break; k[i] = k[j]; v[i] = v[j]; k[j] = key; v[j] = val; i = j; }
  }
  pop(): [number, number] {
    const { k, v } = this, top: [number, number] = [k[0], v[0]], lk = k.pop()!, lv = v.pop()!;
    if (k.length) {
      k[0] = lk; v[0] = lv;
      for (let i = 0; ;) {
        const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < k.length && k[l] < k[m]) m = l;
        if (r < k.length && k[r] < k[m]) m = r;
        if (m === i) break;
        [k[i], k[m]] = [k[m], k[i]]; [v[i], v[m]] = [v[m], v[i]]; i = m;
      }
    }
    return top;
  }
}

/** Where segment p→q first enters rectangle r (Liang–Barsky), or null. */
function enter(p: Pt, q: Pt, r: [number, number, number, number]): Pt | null {
  const dx = q[0] - p[0], dy = q[1] - p[1];
  const P = [-dx, dx, -dy, dy], Q = [p[0] - r[0], r[2] - p[0], p[1] - r[1], r[3] - p[1]];
  let t0 = 0, t1 = 1;
  for (let i = 0; i < 4; i++) {
    if (P[i] === 0) { if (Q[i] < 0) return null; continue; }
    const t = Q[i] / P[i];
    if (P[i] < 0) { if (t > t1) return null; if (t > t0) t0 = t; } else { if (t < t0) return null; if (t < t1) t1 = t; }
  }
  return t0 <= t1 ? [p[0] + t0 * dx, p[1] + t0 * dy] : null;
}

export function place(o: PlaceOptions): Placement | null {
  const { W, H, tip: E, view } = o;
  const vx0 = view.x, vy0 = view.y, vx1 = view.x + view.w, vy1 = view.y + view.h;
  const raw = o.obstacles.map((b) => [b.x, b.y, b.x + b.w, b.y + b.h] as [number, number, number, number]);
  const obs = raw.map(([a, b, c, e]) => [a - MARGIN, b - MARGIN, c + MARGIN, e + MARGIN]);
  obs.push([E[0] - 10, E[1] - 10, E[0] + 10, E[1] + 10]);

  // the grid the cord runs on; cells under content are walls (what the tip sits on doesn't count)
  const G = o.grid ?? (view.w < 500 ? 5 : 10);
  const cols = Math.floor(view.w / G), rows = Math.floor(view.h / G);
  if (cols < 2 || rows < 2) return null;
  const N = cols * rows, wall = new Uint8Array(N);
  for (const b of raw) {
    if (E[0] >= b[0] && E[0] <= b[2] && E[1] >= b[1] && E[1] <= b[3]) continue;
    const c0 = Math.max(0, Math.floor((b[0] - 3 - vx0) / G)), c1 = Math.min(cols - 1, Math.floor((b[2] + 3 - vx0) / G));
    const r0 = Math.max(0, Math.floor((b[1] - 3 - vy0) / G)), r1 = Math.min(rows - 1, Math.floor((b[3] + 3 - vy0) / G));
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) wall[r * cols + c] = 1;
  }
  const ec = Math.floor((E[0] - vx0) / G), er = Math.floor((E[1] - vy0) / G);
  if (ec < 0 || er < 0 || ec >= cols || er >= rows) return null;
  const start = er * cols + ec;
  wall[start] = 0;

  // shortest cord to every (cell, heading): straight steps and square turns only, each turn costing TURN cells
  const S = N * 8, dist = new Float32Array(S).fill(Infinity), prev = new Int32Array(S).fill(-1), heap = new Heap();
  for (let h = 0; h < 8; h += 2) { dist[start * 8 + h] = 0; heap.push(0, start * 8 + h); }
  while (heap.size) {
    const [k0, s0] = heap.pop();
    if (k0 > dist[s0]) continue;
    const c = s0 >> 3, h = s0 & 7, cr = (c / cols) | 0, cc = c - cr * cols;
    for (let t = -2; t <= 2; t += 2) {
      const nh = (h + t + 8) & 7, [dc, dr] = STEP[nh], nc = cc + dc, nr = cr + dr;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
      const ni = nr * cols + nc;
      if (wall[ni]) continue;
      const ns = ni * 8 + nh, nv = k0 + 1 + (t ? TURN : 0);
      if (nv < dist[ns]) { dist[ns] = nv; prev[ns] = s0; heap.push(nv, ns); }
    }
  }
  const cell = new Float32Array(N).fill(Infinity), via = new Int32Array(N).fill(-1);
  for (let q = 0; q < S; q++) if (dist[q] < cell[q >> 3]) { cell[q >> 3] = dist[q]; via[q >> 3] = q; }

  // every free spot for the box, and how soon the cord reaches its edge
  let best: { x: number; y: number; cost: number; end: number } | null = null;
  for (let y = vy0 + 6; y + H <= vy1 - 6; y += 10) {
    for (let x = vx0 + 6; x + W <= vx1 - 6; x += 10) {
      if (obs.some((b) => Math.min(x + W, b[2]) > Math.max(x, b[0]) && Math.min(y + H, b[3]) > Math.max(y, b[1]))) continue;
      const bc0 = Math.max(0, Math.ceil((x - vx0) / G)), bc1 = Math.min(cols - 1, Math.floor((x + W - vx0) / G) - 1);
      const br0 = Math.max(0, Math.ceil((y - vy0) / G)), br1 = Math.min(rows - 1, Math.floor((y + H - vy0) / G) - 1);
      for (let pr = br0; pr <= br1; pr++) {
        const step = pr === br0 || pr === br1 ? 1 : Math.max(1, bc1 - bc0);
        for (let pc = bc0; pc <= bc1; pc += step) {
          const v = cell[pr * cols + pc];
          if (v < Infinity && (!best || v < best.cost)) best = { x, y, cost: v, end: pr * cols + pc };
        }
      }
    }
  }
  if (!best) return null;

  // the cord: back from the box's edge to the tip, cell by cell, merged into straight runs
  const cells: number[] = [];
  for (let s = via[best.end]; s >= 0; s = prev[s]) cells.push(s);
  cells.reverse();
  const pts: Pt[] = [[E[0], E[1]]];
  let lastH = -1;
  cells.forEach((s, i) => {
    if (i === 0) return;
    const ci = s >> 3, cy = (ci / cols) | 0, cx = ci - cy * cols, p: Pt = [vx0 + (cx + 0.5) * G, vy0 + (cy + 0.5) * G];
    if ((s & 7) === lastH) pts[pts.length - 1] = p; else pts.push(p);
    lastH = s & 7;
  });
  // the first run lines up with the tip, so the cord leaves it straight (the tip sits off its cell's centre)
  if (pts.length >= 2 && cells.length > 1) {
    const [hx, hy] = STEP[cells[1] & 7];
    if (!hy) pts[1][1] = E[1]; else if (!hx) pts[1][0] = E[0];
  }
  // any run still slanted by that alignment gets a square corner
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    if (Math.abs(a[0] - b[0]) > 1e-6 && Math.abs(a[1] - b[1]) > 1e-6) pts.splice(i, 0, [b[0], a[1]]);
  }
  // land on the box's edge: the last run, clipped where it enters the box
  const bx: [number, number, number, number] = [best.x, best.y, best.x + W, best.y + H];
  const clamp = (p: Pt): Pt => [Math.max(bx[0], Math.min(p[0], bx[2])), Math.max(bx[1], Math.min(p[1], bx[3]))];
  if (pts.length === 1) pts.push(clamp(E));
  const landing = enter(pts[pts.length - 2], pts[pts.length - 1], bx) ?? clamp(pts[pts.length - 1]);
  pts[pts.length - 1] = landing;
  // a final run that clipped short of a grid cell could leave a slant; square it off
  if (pts.length > 2) {
    const a = pts[pts.length - 2];
    if (Math.abs(a[0] - landing[0]) > 1e-6 && Math.abs(a[1] - landing[1]) > 1e-6) pts.splice(pts.length - 1, 0, [landing[0], a[1]]);
  }
  return { x: best.x, y: best.y, landing, cord: pts };
}
