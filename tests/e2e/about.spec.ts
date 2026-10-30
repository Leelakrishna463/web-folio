import { test, expect } from '@playwright/test';
import { expectCardsInViewport } from './helpers';
import profile from '../../src/data/api/v1/profile.json' with { type: 'json' };
import about from '../../src/data/api/v1/about.json' with { type: 'json' };

test('renders every fact from the API data', async ({ page }) => {
  await page.goto('/about');
  await expect(page.locator('h1')).toHaveText(profile.name);
  for (const s of [profile.summary, profile.timezone, profile.status.text]) await expect(page.locator('body')).toContainText(s);
  const chip = page.locator('svg[data-figure]:visible');
  for (const p of about.pins) await expect(chip).toContainText(p.label);
  for (const p of about.pins) for (const l of p.lines) await expect(page.locator('ul.sr')).toContainText(l);
  for (const w of profile.role.toUpperCase().split(' ')) await expect(chip).toContainText(w);   // the narrow die stacks the words
});

test('one probe-able pin per fact', async ({ page }) => {
  await page.goto('/about');
  await expect(page.locator('svg[data-figure]:visible .pr')).toHaveCount(about.pins.length);
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('48 pins, sockets on the fact pins, ghosts of the rest of the board', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('svg.wide .sock')).toHaveCount(about.pins.length);
    await expect(page.locator('svg.wide .brd')).toHaveCount(4);
  });

  test('the tour opens the first fact pin by itself', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('svg.wide .pr.on')).toHaveCount(1, { timeout: 5000 });
  });

  test('popup cards stay in the window', async ({ page }) => {
    await page.goto('/about');
    await page.locator('svg.wide').hover({ position: { x: 5, y: 5 } });   // hold the tour
    await expectCardsInViewport(page);
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone only');

  test('tapping a pin fills the panel', async ({ page }) => {
    await page.goto('/about');
    await page.locator('svg.narrow [data-key="python"]').tap();
    await expect(page.locator('[data-panel]')).toContainText('PYTHON');
    await expect(page.locator('[data-panel]')).toContainText('Core language.');
  });
});
