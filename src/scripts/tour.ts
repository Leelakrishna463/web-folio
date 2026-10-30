// The tour: on fine pointers, each listed part opens in turn (first at 2.6 s, then every 3.6 s). Hovering or focusing
// the figure hands control to the reader; the tour resumes 6 s after they leave. Never on touch or under reduced motion.
import type { Probe } from './probe';

export function initTour(probe: Probe, keys: string[], fig: HTMLElement): () => void {
  if (!keys.length || !matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  let at = -1, held = false, resume = 0, timer = 0;
  const next = () => { if (held) return; at = (at + 1) % keys.length; probe.show(keys[at], 'tour'); };
  const hold = () => { held = true; clearTimeout(resume); };
  const release = () => { clearTimeout(resume); resume = window.setTimeout(() => { held = false; }, 6000); };
  fig.addEventListener('pointerenter', hold);
  fig.addEventListener('pointerleave', release);
  fig.addEventListener('focusin', hold);
  fig.addEventListener('focusout', release);
  const start = window.setTimeout(() => { next(); timer = window.setInterval(next, 3600); }, 2600);
  return () => { clearTimeout(start); clearInterval(timer); clearTimeout(resume); };
}
