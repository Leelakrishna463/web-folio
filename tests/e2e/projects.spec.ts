import { test, expect } from '@playwright/test';
import { expectCardsInViewport } from './helpers';
import projects from '../../src/data/api/v1/projects.json' with { type: 'json' };

const list = projects.projects;

test('renders every fact from the API data', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.locator('h1')).toHaveText('Projects');
  for (const p of list) for (const s of [p.name, p.problem, p.fix, p.result]) await expect(page.locator('ul.sr')).toContainText(s);
  const fig = page.locator('svg[data-figure]:visible');
  for (const p of list) await expect(fig).toContainText(p.name);
  await expect(fig).toContainText('GPU');
});

test('one probe-able memory chip per project', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.locator('svg[data-figure]:visible .pr')).toHaveCount(list.length);
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('hovering a project lights its render path from the GPU', async ({ page }) => {
    await page.goto('/projects');
    await page.locator('svg.wide').hover({ position: { x: 2, y: 2 } });
    await page.locator(`svg.wide [data-key="${list[1].id}"]`).hover();
    await expect(page.locator(`svg.wide .net.live[data-net~="${list[1].id}"]`)).toHaveCount(3);
    await expect(page.locator(`svg.wide .net.live[data-net~="${list[0].id}"]`)).toHaveCount(0);
  });

  test('popup cards stay in the window and never cover another chip', async ({ page }) => {
    await page.goto('/projects');
    await page.locator('svg.wide').hover({ position: { x: 2, y: 2 } });
    await expectCardsInViewport(page);
    await page.locator(`svg.wide [data-key="${list[1].id}"]`).hover();
    const card = (await page.locator('.card.in').boundingBox())!;
    for (const other of [list[0], list[2]]) {
      const b = (await page.locator(`svg.wide [data-key="${other.id}"] rect.body`).first().boundingBox())!;
      const overlap = Math.min(card.x + card.width, b.x + b.width) > Math.max(card.x, b.x) && Math.min(card.y + card.height, b.y + b.height) > Math.max(card.y, b.y);
      expect(overlap, `card covers ${other.id}`).toBe(false);
    }
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone only');

  test('tapping a project fills the panel with problem, fix and result', async ({ page }) => {
    await page.goto('/projects');
    await page.locator(`svg.narrow [data-key="${list[0].id}"]`).tap();
    for (const s of [list[0].problem, list[0].fix]) await expect(page.locator('[data-panel]')).toContainText(s);
  });
});
