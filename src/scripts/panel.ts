// Phones and touch screens: tapping a part fills the docked detail panel. It keeps the last part shown until another is
// tapped, so the reader never loses what they were reading.
import { detailFor } from './detail';
import type { ProbeEvent } from './probe';

export function initPanel(root: ParentNode = document): void {
  const panel = root.querySelector<HTMLElement>('[data-panel]');
  const body = panel?.querySelector<HTMLElement>('[data-panel-body]');
  if (!panel || !body) return;
  const idle = panel.querySelector<HTMLElement>('.panel-idle');
  const active = () => matchMedia('(max-width: 640px), (pointer: coarse)').matches;
  root.addEventListener('probe', (e) => {
    const { key } = (e as ProbeEvent).detail;
    if (!key || !active()) return;
    const f = detailFor(key);
    if (!f) return;
    body.replaceChildren(f);
    body.hidden = false;
    if (idle) idle.hidden = true;
  });
}
