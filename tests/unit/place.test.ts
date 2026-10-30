import { describe, it, expect } from 'vitest';
import { place, type Rect } from '../../src/lib/geom/place';

const overlaps = (a: Rect, b: Rect) => Math.min(a.x + a.w, b.x + b.w) > Math.max(a.x, b.x) && Math.min(a.y + a.h, b.y + b.h) > Math.max(a.y, b.y);

describe('place', () => {
  const view: Rect = { x: 0, y: 0, w: 1000, h: 700 };

  it('returns null when obstacles fill the view', () => {
    expect(place({ W: 200, H: 100, tip: [500, 350], obstacles: [{ x: -10, y: -10, w: 1020, h: 720 }], view })).toBeNull();
  });

  it('finds a box clear of every obstacle, reached by a straight-and-square cord', () => {
    const obstacles: Rect[] = [{ x: 100, y: 100, w: 400, h: 400 }, { x: 600, y: 0, w: 100, h: 700 }];
    const r = place({ W: 200, H: 120, tip: [510, 300], obstacles, view })!;
    expect(r).not.toBeNull();
    const box = { x: r.x, y: r.y, w: 200, h: 120 };
    for (const o of obstacles) expect(overlaps(box, { x: o.x - 8, y: o.y - 8, w: o.w + 16, h: o.h + 16 })).toBe(false);
    expect(box.x).toBeGreaterThanOrEqual(view.x);
    expect(box.y + box.h).toBeLessThanOrEqual(view.y + view.h);
    for (let i = 1; i < r.cord.length; i++) {
      const [a, b] = [r.cord[i - 1], r.cord[i]];
      expect(Math.abs(a[0] - b[0]) < 1e-6 || Math.abs(a[1] - b[1]) < 1e-6).toBe(true);
    }
    expect(r.cord[0]).toEqual([510, 300]);
    expect(r.cord.at(-1)).toEqual(r.landing);
  });

  it('ignores the part the tip sits on', () => {
    const card: Rect = { x: 0, y: 0, w: 600, h: 400 };
    const r = place({ W: 150, H: 80, tip: [580, 200], obstacles: [card], view });
    expect(r).not.toBeNull();
  });
});
