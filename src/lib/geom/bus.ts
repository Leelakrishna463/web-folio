// Buses: groups of parallel lanes from the CPU to a part, and the bit pattern a lit lane carries
import type { Pt } from './path';

export interface BusOptions {
  /** the CPU's centre; lanes leave the middle pins of its left side */
  centre: Pt;
  pinPitch: number;
  lanes: number;
  /** lane spacing once the bus necks down into a bundle */
  bundle: number;
  /** x of the CPU's pin tips, where lanes start */
  startX: number;
  /** x where lanes neck down from pin pitch to the bundle */
  neckX: number;
  /** x of the innermost lane's vertical run */
  turnX: number;
  /** y where lanes end, at the part's slot */
  slotY: number;
  /** the innermost lane's 45° cut */
  cut0: number;
}

/**
 * The bus as drawn for the CPU's left side, rising into a part above: each lane leaves its pin, necks down at 45° to the
 * bundle, runs out, turns up with a 45° cut and rises into the slot. Each outer lane's cut is longer by
 * bundle·(2 − √2), exactly what keeps the lanes one bundle apart through the bend. Rotate it for the other sides.
 * Port of the Overview bus in design/lee-board.html.
 */
export function busLanes(o: BusOptions): Pt[][] {
  const mid = (o.lanes - 1) / 2;
  return Array.from({ length: o.lanes }, (_, k) => {
    const yp = o.centre[1] + (k - mid) * o.pinPitch;
    const yb = o.centre[1] + (k - mid) * o.bundle;
    const x = o.turnX - k * o.bundle;
    const c = o.cut0 + k * o.bundle * (2 - Math.SQRT2);
    return [[o.startX, yp], [o.neckX, yp], [o.neckX - Math.abs(yp - yb), yb], [x + c, yb], [x, yb - c], [x, o.slotY]] as Pt[];
  });
}

const WORD = ['01001100', '01000101', '01000101'];   // "LEE" in ASCII
const SLOT = 16, PACKET = 9, GAP = 32;

/**
 * The dash pattern lane k of a bus carries: per byte of "LEE", a packet if that byte's bit k (most significant first) is 1,
 * an empty slot if it is 0, then a gap before the word repeats. Across a bundle, every wavefront is one byte.
 */
export function laneBits(k: number): { dash: number[]; period: number } {
  const dash: number[] = [];
  for (const byte of WORD) {
    const on = byte.charAt(k % 8) === '1' ? PACKET : 0;
    dash.push(on, SLOT - on);
  }
  dash.push(0, GAP);
  return { dash, period: WORD.length * SLOT + GAP };
}
