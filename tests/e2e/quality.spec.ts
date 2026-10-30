import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import profile from '../../src/data/api/v1/profile.json' with { type: 'json' };
import about from '../../src/data/api/v1/about.json' with { type: 'json' };
import skills from '../../src/data/api/v1/skills.json' with { type: 'json' };
import experience from '../../src/data/api/v1/experience.json' with { type: 'json' };
import projects from '../../src/data/api/v1/projects.json' with { type: 'json' };

const ROUTES = ['/', '/about', '/skills', '/experience', '/projects', '/contact'];
// the facts a reader must get on each page, with no script running
const FACTS: Record<string, string[]> = {
  '/': [profile.partNumber, profile.summary, profile.status.text],
  '/about': about.pins.flatMap((p) => p.lines),
  '/skills': skills.modules.flatMap((m) => m.chips.filter(Boolean).map((c) => c!.name)).concat(skills.next),
  '/experience': experience.roles.flatMap((r) => [r.company, r.title, r.impact]),
  '/projects': projects.projects.flatMap((p) => [p.name, p.problem, p.fix, p.result]),
  '/contact': [profile.email, profile.replyTime],
};

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  for (const path of ROUTES) {
    test(`every fact on ${path} is readable, and the nav works`, async ({ page }) => {
      await page.goto(path);
      const text = await page.locator('body').textContent();
      for (const f of FACTS[path]) expect(text, f).toContain(f);
      await page.getByRole('navigation', { name: 'Sections' }).getByRole('link', { name: /Contact/ }).click();
      await expect(page).toHaveURL(/\/contact$/);
    });
  }
});

test.describe('budgets', () => {
  test.skip(({ isMobile }) => isMobile, 'measured once, on desktop');
  for (const path of ROUTES) {
    test(`${path}: JS ≤ 15 KB and CSS ≤ 14 KB gzipped on load, no layout shift`, async ({ page }) => {
      const sizes = { js: 0, css: 0 };
      page.on('response', async (r) => {
        const type = r.request().resourceType();
        if (type !== 'script' && type !== 'stylesheet') return;
        const body = await r.body().catch(() => Buffer.alloc(0));
        const { gzipSync } = await import('node:zlib');
        sizes[type === 'script' ? 'js' : 'css'] += gzipSync(body).length;
      });
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const cls = await page.evaluate(() => new Promise<number>((done) => {
        let total = 0;
        new PerformanceObserver((l) => { for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) total += e.value; })
          .observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => done(total), 1500);
      }));
      expect(sizes.js, 'JS bytes (gzip)').toBeLessThanOrEqual(15 * 1024);
      expect(sizes.css, 'CSS bytes (gzip)').toBeLessThanOrEqual(14 * 1024);
      expect(cls, 'cumulative layout shift').toBeLessThanOrEqual(0.02);
    });
  }
});

test.describe('accessibility', () => {
  for (const path of ROUTES) {
    test(`${path} has no axe violations`, async ({ page }) => {
      await page.goto(path);
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(r.violations.map((v) => `${v.id}: ${v.nodes.length} × ${v.help}`)).toEqual([]);
    });
  }
});
