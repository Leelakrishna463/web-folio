import { test, expect } from '@playwright/test';
import { expectCardsInViewport } from './helpers';
import experience from '../../src/data/api/v1/experience.json' with { type: 'json' };

const roles = experience.roles;

test('renders every fact from the API data', async ({ page }) => {
  await page.goto('/experience');
  await expect(page.locator('h1')).toHaveText('Experience');
  await expect(page.locator('.intro')).toContainText(`${roles[0].from} to now`);
  for (const r of roles) {
    for (const s of [r.company, r.title, r.from, r.impact]) await expect(page.locator('ul.sr')).toContainText(s);
  }
  const fig = page.locator('svg[data-figure]:visible');
  for (const r of roles) await expect(fig).toContainText(r.title);
  await expect(fig).toContainText('CURRENT');
});

test('one probe-able chip per role; the current role glows brightest', async ({ page }) => {
  await page.goto('/experience');
  const fig = page.locator('svg[data-figure]:visible');
  await expect(fig.locator('.pr')).toHaveCount(roles.length);
  await expect(fig.locator(`.pr.l3[data-key="${roles.at(-1)!.id}"]`)).toHaveCount(1);
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('the drive has its screw, timing row and year ruler', async ({ page }) => {
    await page.goto('/experience');
    await expect(page.locator('svg.wide .screw')).toHaveCount(1);
    await expect(page.locator('svg.wide .hex')).toHaveCount(roles.length);
    await expect(page.locator('svg.wide')).toContainText('NOW');
  });

  test('popup cards stay in the window', async ({ page }) => {
    await page.goto('/experience');
    await page.locator('svg.wide').hover({ position: { x: 2, y: 2 } });
    await expectCardsInViewport(page);
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone only');

  test('tapping a role fills the panel with its result', async ({ page }) => {
    await page.goto('/experience');
    await page.locator(`svg.narrow [data-key="${roles[0].id}"]`).tap();
    await expect(page.locator('[data-panel]')).toContainText(roles[0].impact);
  });
});
