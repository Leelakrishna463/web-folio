import { test, expect } from '@playwright/test';
import { expectCardsInViewport } from './helpers';
import profile from '../../src/data/api/v1/profile.json' with { type: 'json' };
import skills from '../../src/data/api/v1/skills.json' with { type: 'json' };
import projects from '../../src/data/api/v1/projects.json' with { type: 'json' };

test('renders every fact from the API data', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(profile.partNumber);
  for (const s of [profile.headline, profile.summary, profile.status.text, profile.years, profile.city, profile.workMode]) {
    await expect(page.locator('body')).toContainText(s);
  }
  const board = page.locator('svg[data-figure]:visible');
  for (const m of skills.modules) for (const c of m.chips) if (c) await expect(board).toContainText(c.name.toUpperCase());
  for (const p of projects.projects) await expect(board).toContainText(p.name.toUpperCase());
  for (const name of ['Projects', 'Contact', 'Skills', 'Experience', 'About me']) await expect(board).toContainText(name);
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('eight probe-able parts, the CPU always lit', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('svg.wide .pr')).toHaveCount(8);
    await expect(page.locator('svg.wide [data-key="u1"]')).toHaveClass(/\blit\b/);
  });

  test('no tour: nothing opens by itself', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(4000);
    await expect(page.locator('svg.wide .pr.on')).toHaveCount(0);
  });

  test('hovering one RAM stick lights only that stick and its own lanes', async ({ page }) => {
    await page.goto('/');
    await page.locator('svg.wide [data-key="u2b"]').hover();
    await expect(page.locator('svg.wide .pr.on')).toHaveCount(1);
    await expect(page.locator('svg.wide .net.live[data-net~="u2b"]')).toHaveCount(2);
    await expect(page.locator('svg.wide .net.live[data-net~="u2a"]')).toHaveCount(0);
  });

  test('every bus lane is straight or 45°', async ({ page }) => {
    await page.goto('/');
    const bad = await page.evaluate(() => [...document.querySelectorAll('svg.wide .net, svg.wide .trace')].filter((p) => {
      const pts = (p.getAttribute('d') ?? '').match(/-?[\d.]+ -?[\d.]+/g)?.map((s) => s.split(' ').map(Number)) ?? [];
      return pts.some((q, i) => i > 0 && (() => { const dx = Math.abs(q[0] - pts[i - 1][0]), dy = Math.abs(q[1] - pts[i - 1][1]); return dx > 0.2 && dy > 0.2 && Math.abs(dx - dy) > 0.2; })());
    }).length);
    expect(bad).toBe(0);
  });

  test('popup cards stay in the window', async ({ page }) => {
    await page.goto('/');
    await expectCardsInViewport(page);
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone only');

  test('lean: no ghosts, no blips; tapping a part fills the panel', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.brd:visible')).toHaveCount(0);
    await expect(page.locator('.blip:visible')).toHaveCount(0);
    await page.locator('svg.narrow [data-key="u4"]').tap();
    await expect(page.locator('[data-panel]')).toContainText('PROJECTS');
  });
});
