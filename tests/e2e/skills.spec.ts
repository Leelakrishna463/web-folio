import { test, expect } from '@playwright/test';
import { expectCardsInViewport } from './helpers';
import skills from '../../src/data/api/v1/skills.json' with { type: 'json' };

const chips = skills.modules.flatMap((m) => m.chips);

test('renders every fact from the API data', async ({ page }) => {
  await page.goto('/skills');
  await expect(page.locator('h1')).toHaveText('Skills');
  await expect(page.locator('.intro')).toContainText(skills.next);
  for (const s of skills.strongest) await expect(page.locator('.intro')).toContainText(s);
  for (const l of Object.values(skills.loadLegend)) await expect(page.locator('.intro')).toContainText(l);
  const fig = page.locator('svg[data-figure]:visible');
  for (const m of skills.modules) await expect(fig).toContainText(m.group.toUpperCase());
  for (const c of chips) if (c) await expect(fig).toContainText(c.name.toUpperCase());
  await expect(fig).toContainText('FREE');
});

test('every chip site is probe-able, lit by its load', async ({ page }) => {
  await page.goto('/skills');
  const fig = page.locator('svg[data-figure]:visible');
  await expect(fig.locator('.pr')).toHaveCount(chips.length);
  await expect(fig.locator('.pr.l3')).toHaveCount(chips.filter((c) => c?.load === 3).length);
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('six bus lanes per stick run to the CPU', async ({ page }) => {
    await page.goto('/skills');
    await expect(page.locator('svg.wide .trace')).toHaveCount(24);
  });

  test('popup cards stay in the window', async ({ page }) => {
    await page.goto('/skills');
    await page.locator('svg.wide').hover({ position: { x: 2, y: 2 } });
    await expectCardsInViewport(page);
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone only');

  test('tapping the free socket fills the panel with what is next', async ({ page }) => {
    await page.goto('/skills');
    await page.locator('svg.narrow .pr.l0').tap();
    await expect(page.locator('[data-panel]')).toContainText(/free socket/i);
    await expect(page.locator('[data-panel]')).toContainText(skills.next);
  });
});
