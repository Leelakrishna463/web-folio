import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Chip from '../../src/components/svg/Chip.astro';
import Net from '../../src/components/svg/Net.astro';
import Trace from '../../src/components/svg/Trace.astro';
import EdgeConnector from '../../src/components/svg/EdgeConnector.astro';
import Figure from '../../src/components/svg/Figure.astro';
import Ghost from '../../src/components/svg/Ghost.astro';
import { fingers } from '../../src/lib/geom/edge';

let c: AstroContainer;
beforeAll(async () => { c = await AstroContainer.create(); });
const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;

describe('Chip', () => {
  it('fits a long label inside its box', async () => {
    const label = 'A'.repeat(40);
    const html = await c.renderToString(Chip, { props: { x: 0, y: 0, w: 120, h: 40, label } });
    const size = Number(html.match(/font-size="([\d.]+)"/)![1]);
    expect(size * 0.64 * label.length).toBeLessThanOrEqual(120 - 12 + 1e-6);
  });

  it('becomes a probe-able part when given a probe', async () => {
    const html = await c.renderToString(Chip, { props: { x: 0, y: 0, w: 80, h: 40, label: 'SQL', probe: { key: 'sql', label: 'SQL: daily driver' } } });
    expect(html).toMatch(/<g[^>]*class="pr[^"]*"[^>]*/);
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('data-key="sql"');
    expect(html).toContain('aria-label="SQL: daily driver"');
  });

  it('draws its pin rows and pin-1 mark', async () => {
    const html = await c.renderToString(Chip, { props: { x: 0, y: 0, w: 80, h: 40, pins: 'tb' } });
    expect(count(html, /class="pin"/g)).toBe(2);
    expect(html).toContain('<circle');
  });
});

describe('Net', () => {
  it('draws the net and its bits with the same keys', async () => {
    const html = await c.renderToString(Net, { props: { points: [[0, 0], [10, 0], [10, 10]], keys: 'u4 u1' } });
    expect(count(html, /data-net="u4 u1"/g)).toBe(2);
    expect(html).toContain('class="net');
    expect(html).toContain('class="bits');
  });

  it('carries a lane of LEE when given one', async () => {
    const html = await c.renderToString(Net, { props: { points: [[0, 0], [10, 0]], keys: 'u4', lane: 1 } });
    expect(html).toContain('stroke-dasharray="9 7 9 7 9 7 0 32"');
  });
});

describe('Trace', () => {
  it('draws copper, and a blip when asked', async () => {
    const plain = await c.renderToString(Trace, { props: { points: [[0, 0], [10, 0]] } });
    expect(plain).toContain('class="trace"');
    expect(plain).not.toContain('blip');
    const lit = await c.renderToString(Trace, { props: { points: [[0, 0], [10, 0]], blip: { seed: 3, inward: true } } });
    expect(lit).toContain('class="blip"');
    expect(lit).toContain('data-seed="3"');
  });
});

describe('EdgeConnector', () => {
  it('snug: renders every finger but two, and a keyslot', async () => {
    const o = { x: 0, y: 0, len: 100, d: 10, side: 'b' as const, key: 30, pitch: 5 };
    const all = fingers({ ...o, key: undefined }).fingers.length;
    const html = await c.renderToString(EdgeConnector, { props: { ...o, snug: true } });
    expect(count(html, /class="finger"/g)).toBe(all - 2);
    expect(html).toContain('class="keyslot"');
  });
});

describe('Figure', () => {
  it('renders a wide drawing and, when given, a narrow one', async () => {
    const html = await c.renderToString(Figure, {
      props: { label: 'A test board', wide: [1000, 740], narrow: [360, 900] },
      slots: { wide: '<rect class="w"/>', narrow: '<rect class="n"/>' },
    });
    expect(html).toContain('viewBox="0 0 1000 740"');
    expect(html).toContain('viewBox="0 0 360 900"');
    expect(html).toContain('aria-label="A test board"');
    expect(html).toContain('class="w"');
    expect(html).toContain('class="n"');
  });
});

describe('Ghost', () => {
  it('is a blurred link to its section', async () => {
    const html = await c.renderToString(Ghost, { props: { kind: 'ram', x: 0, y: 0, w: 400, h: 66 } });
    const a = html.match(/<a[^>]*>/)![0];
    expect(a).toContain('class="brd"');
    expect(a).toContain('href="/skills"');
    expect(html).toContain('RAM · SKILLS');
  });
});
