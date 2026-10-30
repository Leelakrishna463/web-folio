// Probing a drawing: hover, focus or tap a part (.pr[data-key]) and it lights, with every net that carries its key.
// Each change is announced as a 'probe' event on the svg: { key, part, source }, source saying what caused it.
// Port of design/ds/ds.js figure().

export type Source = 'hover' | 'focus' | 'tap' | 'key' | 'tour';
export interface Probe { show(key: string | null, source: Source): void; readonly svg: SVGSVGElement }
export type ProbeEvent = CustomEvent<{ key: string | null; part: SVGGElement | null; source: Source }>;

const coarse = () => matchMedia('(hover: none), (pointer: coarse)').matches;

export function initProbe(svg: SVGSVGElement): Probe {
  const parts = [...svg.querySelectorAll<SVGGElement>('.pr[data-key]')];
  const nets = [...svg.querySelectorAll<SVGPathElement>('[data-net]')];
  let shown: string | null = null, pinned: string | null = null;
  // the pointer that pressed last: a finger on a touch laptop is still a finger, whatever the primary pointer is
  let pressedBy = '';
  const touch = () => (pressedBy ? pressedBy === 'touch' : coarse());

  function show(key: string | null, source: Source) {
    if (key === shown) return;
    shown = key;
    for (const p of parts) p.classList.toggle('on', p.dataset.key === key);
    for (const n of nets) n.classList.toggle('live', key != null && n.dataset.net!.split(' ').includes(key));
    const part = key == null ? null : parts.find((p) => p.dataset.key === key) ?? null;
    svg.dispatchEvent(new CustomEvent('probe', { detail: { key, part, source }, bubbles: true }));
  }

  function act(p: SVGGElement, fromPointer: boolean) {
    const key = p.dataset.key!, href = p.dataset.href, copy = p.dataset.copy;
    // on touch, the first tap shows what a linked (or copying) part says; the second tap acts
    const source = fromPointer ? 'tap' : 'key';
    if ((href || copy) && fromPointer && touch() && pinned !== key) { pinned = key; show(key, source); return; }
    if (href) { location.href = href; return; }
    if (copy) { navigator.clipboard?.writeText(copy).catch(() => { location.href = `mailto:${copy}`; }); pinned = key; show(key, source); return; }
    pinned = pinned === key ? null : key;
    show(pinned ?? key, source);
  }

  parts.forEach((p, i) => {
    p.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(p.dataset.key!, 'hover'); });
    p.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') show(pinned, 'hover'); });
    p.addEventListener('pointerdown', (e) => { pressedBy = e.pointerType; });
    p.addEventListener('focus', () => show(p.dataset.key!, 'focus'));
    p.addEventListener('blur', () => show(pinned, 'focus'));
    p.addEventListener('click', () => act(p, true));
    p.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'Enter' || k === ' ') { e.preventDefault(); act(p, false); return; }
      if (k === 'Escape') { pinned = null; p.blur(); show(null, 'key'); return; }
      const step = k === 'ArrowRight' || k === 'ArrowDown' ? 1 : k === 'ArrowLeft' || k === 'ArrowUp' ? -1 : 0;
      if (step) { e.preventDefault(); parts[(i + step + parts.length) % parts.length].focus(); }
    });
  });
  return { show, svg };
}
