import { describe, it, expect } from 'vitest';
import { d, chamfer, rotate } from '../../src/lib/geom/path';
import { busLanes, laneBits } from '../../src/lib/geom/bus';
import { fingers } from '../../src/lib/geom/edge';
import type { Pt } from '../../src/lib/geom/path';

const segs = (pts: Pt[]) => pts.slice(1).map((p, i) => [pts[i], p] as const);
const angleOk = ([a, b]: readonly [Pt, Pt]) => {
  const dx = Math.abs(b[0] - a[0]), dy = Math.abs(b[1] - a[1]);
  return dx < 1e-6 || dy < 1e-6 || Math.abs(dx - dy) < 1e-6;
};

describe('path', () => {
  it('d() writes M/L with one decimal', () => {
    expect(d([[0, 0], [10.04, 5.25]])).toBe('M0.0 0.0 L10.0 5.3');
  });
  it('chamfer cuts a square corner at 45°', () => {
    expect(chamfer([[0, 0], [10, 0], [10, 10]], 3)).toEqual([[0, 0], [7, 0], [10, 3], [10, 10]]);
  });
  it('chamfer never cuts more than half a leg', () => {
    expect(chamfer([[0, 0], [4, 0], [4, 10]], 7)).toEqual([[0, 0], [2, 0], [4, 2], [4, 10]]);
  });
  it('rotate turns a quarter clockwise about the centre', () => {
    expect(rotate([0, 0], [5, 5], 1)).toEqual([10, 0]);
    expect(rotate([0, 0], [5, 5], 2)).toEqual([10, 10]);
    expect(rotate([0, 0], [5, 5], 0)).toEqual([0, 0]);
  });
});

describe('busLanes', () => {
  const lanes = busLanes({ centre: [500, 370], pinPitch: 128 / 11, lanes: 8, bundle: 6, startX: 412, neckX: 404, turnX: 340, slotY: 214, cut0: 4 });
  it('draws eight lanes', () => expect(lanes).toHaveLength(8));
  it('turns only straight or at 45°', () => {
    for (const lane of lanes) for (const s of segs(lane)) expect(angleOk(s)).toBe(true);
  });
  it('keeps neighbouring lanes one bundle pitch apart through the bend', () => {
    for (let k = 1; k < lanes.length; k++) {
      // the diagonal is segment 3→4; its offset along the normal (1,-1)/√2
      const a = lanes[k - 1][3], b = lanes[k][3];
      expect(Math.abs((a[0] - a[1]) - (b[0] - b[1])) / Math.SQRT2).toBeCloseTo(6, 6);
    }
  });
  it('ends every lane at the slot', () => {
    for (const lane of lanes) expect(lane.at(-1)![1]).toBe(214);
  });
});

describe('laneBits', () => {
  it('lane 1 carries a packet in every byte of "LEE" (bit 1 of 0x4C, 0x45, 0x45 is 1)', () => {
    const { dash, period } = laneBits(1);
    expect(period).toBe(80);
    expect(dash).toEqual([9, 7, 9, 7, 9, 7, 0, 32]);
  });
  it('lane 0 is always empty (bit 0 of each byte is 0)', () => {
    expect(laneBits(0).dash).toEqual([0, 16, 0, 16, 0, 16, 0, 32]);
  });
  it('lane 4 carries L and E (0x4C bit 4 = 1, 0x45 bit 4 = 0)', () => {
    expect(laneBits(4).dash).toEqual([9, 7, 0, 16, 0, 16, 0, 32]);
  });
});

describe('fingers', () => {
  const base = { x: 0, y: 0, len: 100, d: 10, side: 'b' as const, key: 30, pitch: 5 };
  it('lays fingers on the pitch, leaving a gap for the key', () => {
    const all = fingers({ ...base, key: undefined }).fingers.length;
    const keyed = fingers(base).fingers.length;
    expect(keyed).toBeLessThan(all);
  });
  it('snug leaves out exactly two fingers', () => {
    const all = fingers({ ...base, key: undefined }).fingers.length;
    expect(fingers({ ...base, snug: true }).fingers.length).toBe(all - 2);
  });
  it('draws a keyslot whose sides meet the neighbouring fingers', () => {
    const f = fingers({ ...base, snug: true });
    expect(f.keyslot).toBeDefined();
    const slotXs = f.keyslot!.map((p) => p[0]);
    const lo = Math.min(...slotXs), hi = Math.max(...slotXs);
    expect(f.fingers.some((r) => Math.abs(r.x + r.w - lo) < 1e-6)).toBe(true);
    expect(f.fingers.some((r) => Math.abs(r.x - hi) < 1e-6)).toBe(true);
  });
  it('turns with its side: on a right-hand tab each finger runs across it, along x', () => {
    const f = fingers({ ...base, side: 'r' });
    for (const r of f.fingers) { expect(r.x).toBeGreaterThanOrEqual(0); expect(r.h).toBeLessThan(r.w); }
  });
  it('no key, no keyslot', () => {
    expect(fingers({ ...base, key: undefined }).keyslot).toBeUndefined();
  });
});
