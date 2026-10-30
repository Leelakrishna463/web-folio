// Now and then a blip of light runs along a resting trace, at a constant pace (140 drawing units a second), so a long
// trace takes longer to cross; only the pause after it differs, so traces never pulse together. Desktop only, and never
// under reduced motion. The first run waits for the traces to draw out.
const PACE = 140;

export function initBlips(svg: SVGSVGElement): void {
  if (matchMedia('(prefers-reduced-motion: reduce), (max-width: 640px)').matches) return;
  svg.querySelectorAll<SVGPathElement>('.blip').forEach((b) => {
    if (!b.animate) return;
    const len = b.getTotalLength(), seed = Number(b.dataset.seed ?? 0);
    b.setAttribute('stroke-dasharray', `10 ${Math.ceil(len + 10)}`);
    const travel = (len / PACE) * 1000, gap = 2000 + seed * 600, k = travel / (travel + gap), end = `${-len}px`;
    b.animate([
      { strokeDashoffset: '10px', opacity: 1, offset: 0 },
      { strokeDashoffset: end, opacity: 1, offset: k },
      { strokeDashoffset: end, opacity: 0, offset: Math.min(1, k + 0.001) },
      { strokeDashoffset: end, opacity: 0, offset: 1 },
    ], { duration: travel + gap, iterations: Infinity, delay: 2800 + seed * 700, direction: 'inward' in b.dataset ? 'reverse' : 'normal' });
  });
}
