// Probing a drawing: hover, focus or tap a part (.pr[data-key]) and it lights, with every net that carries its key.
// Each change is announced as a 'probe' event on the svg: { key: string | null, part: SVGGElement | null }.
// Port of design/ds/ds.js figure().

export interface Probe { show(key: string | null): void; readonly svg: SVGSVGElement }
export type ProbeEvent = CustomEvent<{ key: string | null; part: SVGGElement | null }>;

const coarse = () => matchMedia('(hover: none), (pointer: coarse)').matches;

export function initProbe(svg: SVGSVGElement): Probe {
  const parts = [...svg.querySelectorAll<SVGGElement>('.pr[data-key]')];
  const nets = [...svg.querySelectorAll<SVGPathElement>('[data-net]')];
  let shown: string | null = null, pinned: string | null = null;

  function show(key: string | null) {
    if (key === shown) return;
    shown = key;
    for (const p of parts) p.classList.toggle('on', p.dataset.key === key);
    for (const n of nets) n.classList.toggle('live', key != null && n.dataset.net!.split(' ').includes(key));
    const part = key == null ? null : parts.find((p) => p.dataset.key === key) ?? null;
    svg.dispatchEvent(new CustomEvent('probe', { detail: { key, part }, bubbles: true }));
  }

  function act(p: SVGGElement, fromPointer: boolean) {
    const key = p.dataset.key!, href = p.dataset.href;
    // on touch, the first tap shows what a linked part says; the second tap follows it
    if (href && fromPointer && coarse() && pinned !== key) { pinned = key; show(key); return; }
    if (href) { location.href = href; return; }
    pinned = pinned === key ? null : key;
    show(pinned ?? key);
  }

  parts.forEach((p, i) => {
    p.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(p.dataset.key!); });
    p.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') show(pinned); });
    p.addEventListener('focus', () => show(p.dataset.key!));
    p.addEventListener('blur', () => show(pinned));
    p.addEventListener('click', () => act(p, true));
    p.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'Enter' || k === ' ') { e.preventDefault(); act(p, false); return; }
      if (k === 'Escape') { pinned = null; p.blur(); show(null); return; }
      const step = k === 'ArrowRight' || k === 'ArrowDown' ? 1 : k === 'ArrowLeft' || k === 'ArrowUp' ? -1 : 0;
      if (step) { e.preventDefault(); parts[(i + step + parts.length) % parts.length].focus(); }
    });
  });
  return { show, svg };
}
