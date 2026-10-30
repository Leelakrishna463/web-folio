// Boots every drawing on the page: probing, popup cards (fine pointers), the docked panel (touch), blips, and the tour
// (from the figure's data-tour). Re-runs after each page transition.
import { initProbe } from './probe';
import { initPanel } from './panel';
import { initCard } from './card';
import { initBlips } from './blips';
import { initTour } from './tour';
import { detailText } from './detail';
import type { ProbeEvent } from './probe';

let stops: (() => void)[] = [];

function boot() {
  stops.forEach((s) => s()); stops = [];
  const live = document.querySelector<HTMLElement>('[data-live]');
  stops.push(initPanel(document));
  document.querySelectorAll<HTMLElement>('[data-fig]').forEach((fig) => {
    fig.querySelectorAll<SVGSVGElement>('svg[data-figure]').forEach((svg) => {
      const probe = initProbe(svg);
      initCard(svg);
      initBlips(svg);
      // screen readers hear a part when the reader goes to it (focus, tap, keys), not on every hover or tour step
      if (live) svg.addEventListener('probe', (e) => {
        const { key, source } = (e as ProbeEvent).detail;
        if (key && source !== 'hover' && source !== 'tour') live.textContent = detailText(key);
      });
      if (svg.dataset.figure === 'wide') stops.push(initTour(probe, (fig.dataset.tour ?? '').split(' ').filter(Boolean), fig));
    });
  });
}

document.addEventListener('astro:page-load', boot);
