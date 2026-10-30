// Fine pointers: a probed part opens a popup card in clear space beside the drawing, reached by a cord from the part's
// lead. The card never covers a part, a label or lettering, and never leaves the window. The routing code
// (lib/geom/place) is loaded the first time it is needed, so pages that are only read never download it.
import { detailFor } from './detail';
import type { ProbeEvent } from './probe';
import type { Pt, Rect } from '../lib/geom/path';

const SVG = 'http://www.w3.org/2000/svg';
const fine = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
let placeMod: Promise<typeof import('../lib/geom/place')> | null = null;

/** Everything in the drawing that carries information, as boxes in drawing units. Traces and the blurred board don't count. */
function obstacles(svg: SVGSVGElement, toUnits: (r: DOMRect) => Rect): Rect[] {
  const out: Rect[] = [];
  svg.querySelectorAll('text, rect, circle, path.pin, path.paper, path.gold, path.tab, path.body').forEach((el) => {
    if (el.closest('.brd')) return;
    const r = el.getBoundingClientRect();
    if (r.width || r.height) out.push(toUnits(r));
  });
  return out;
}

export function initCard(svg: SVGSVGElement): void {
  const canvas = svg.parentElement as HTMLElement;
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('aria-hidden', 'true');   // the live region speaks; the card is for the eye
  canvas.append(card);
  const cord = document.createElementNS(SVG, 'path');
  cord.setAttribute('class', 'cord');
  svg.append(cord);
  let token = 0;

  svg.addEventListener('probe', async (e) => {
    const { key, part } = (e as ProbeEvent).detail;
    const mine = ++token;
    card.classList.remove('in');
    cord.setAttribute('d', '');
    if (!key || !part || !fine()) return;
    const f = detailFor(key);
    if (!f) return;
    card.replaceChildren(f);
    placeMod ??= import('../lib/geom/place');
    const { place } = await placeMod;
    if (mine !== token) return;

    const m = svg.getScreenCTM();
    if (!m) return;
    const toX = (cx: number) => (cx - m.e) / m.a, toY = (cy: number) => (cy - m.f) / m.d;
    const toUnits = (r: DOMRect): Rect => ({ x: toX(r.left), y: toY(r.top), w: r.width / m.a, h: r.height / m.d });
    const tip = (part.dataset.tip ?? '').split(',').map(Number) as Pt;
    const sr = svg.getBoundingClientRect(), stage = svg.closest('.stage')?.getBoundingClientRect() ?? sr;
    // the reader's window onto the drawing: the drawing itself, out to the stage's right edge, inside the viewport
    const left = Math.max(sr.left, 0), right = Math.min(stage.right, innerWidth);
    const top = Math.max(sr.top, stage.top, 0), bottom = Math.min(sr.bottom, stage.bottom, innerHeight);
    const view: Rect = { x: toX(left), y: toY(top), w: (right - left) / m.a, h: (bottom - top) / m.d };

    card.style.setProperty('--w', '260px');
    const W = card.offsetWidth / m.a, H = card.offsetHeight / m.d;
    const spot = place({ W, H, tip, obstacles: obstacles(svg, toUnits), view });
    const cr = canvas.getBoundingClientRect();
    const px = (u: number) => u * m.a + m.e - cr.left, py = (v: number) => v * m.d + m.f - cr.top;
    let x: number, y: number, origin: Pt;
    if (spot) {
      x = px(spot.x); y = py(spot.y); origin = [px(spot.landing[0]), py(spot.landing[1])];
      cord.setAttribute('d', spot.cord.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' '));
      const len = cord.getTotalLength();
      cord.style.strokeDasharray = cord.style.strokeDashoffset = String(len);
      requestAnimationFrame(() => requestAnimationFrame(() => { cord.style.strokeDashoffset = '0'; }));
      card.style.setProperty('--d', `${(0.22 + Math.min(0.3, len / 1200)).toFixed(2)}s`);
    } else {
      // nowhere clear: open just past the tip, kept inside the window
      x = px(tip[0]) + 8; y = py(tip[1]) - card.offsetHeight / 2; origin = [px(tip[0]), py(tip[1])];
      card.style.removeProperty('--d');
    }
    x = Math.max(4 - cr.left, Math.min(x, innerWidth - cr.left - card.offsetWidth - 4));
    y = Math.max(4 - cr.top, Math.min(y, innerHeight - cr.top - card.offsetHeight - 4));
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
    card.style.setProperty('--o', `${origin[0] - x}px ${origin[1] - y}px`);
    requestAnimationFrame(() => requestAnimationFrame(() => { if (mine === token) card.classList.add('in'); }));
  });
}
