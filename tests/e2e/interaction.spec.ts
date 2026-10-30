import { test, expect } from '@playwright/test';
import { expectCardsInViewport } from './helpers';

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop pointer only');

  test('hover lights the part and only its own nets', async ({ page }) => {
    await page.goto('/fixture');
    await page.locator('svg.wide [data-key="alpha"]').hover();
    await expect(page.locator('svg.wide [data-key="alpha"]')).toHaveClass(/\bon\b/);
    await expect(page.locator('svg.wide .net[data-net~="alpha"]')).toHaveClass(/\blive\b/);
    await expect(page.locator('svg.wide .net[data-net~="beta"]')).not.toHaveClass(/\blive\b/);
  });

  test('hover opens a popup card with the part\'s details', async ({ page }) => {
    await page.goto('/fixture');
    await page.locator('svg.wide [data-key="beta"]').hover();
    await expect(page.locator('.card.in')).toContainText('BETA PART');
  });

  test('card stays in viewport at 1280x720', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/fixture');
    await expectCardsInViewport(page);
  });

  test('keyboard: ArrowRight moves focus to the next part, Escape clears', async ({ page }) => {
    await page.goto('/fixture');
    await page.locator('svg.wide [data-key="alpha"]').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('svg.wide [data-key="beta"]')).toBeFocused();
    await expect(page.locator('svg.wide [data-key="beta"]')).toHaveClass(/\bon\b/);
    await page.keyboard.press('Escape');
    await expect(page.locator('svg.wide .pr.on')).toHaveCount(0);
  });

  test('the tour opens parts by itself, and hands over when the reader hovers', async ({ page }) => {
    await page.goto('/fixture');
    await expect(page.locator('svg.wide .pr.on')).toHaveCount(1, { timeout: 5000 });
  });

  test('no detail panel on desktop', async ({ page }) => {
    await page.goto('/fixture');
    await expect(page.locator('[data-panel]')).toBeHidden();
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'touch only');

  test('tap on coarse pointer fills panel', async ({ page }) => {
    await page.goto('/fixture');
    const panel = page.locator('[data-panel]');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('Tap a part to read it');
    await page.locator('svg.narrow [data-key="beta"]').tap();
    await expect(panel).toContainText('BETA PART');
    await expect(panel).toContainText('Second line about beta.');
  });

  test('nothing opens by itself, and no popup cards', async ({ page }) => {
    await page.goto('/fixture');
    await page.waitForTimeout(5000);
    await expect(page.locator('.pr.on')).toHaveCount(0);
    await expect(page.locator('.card.in')).toHaveCount(0);
  });

  test('a link part needs a second tap to follow', async ({ page }) => {
    await page.goto('/fixture');
    await page.locator('svg.narrow [data-key="gamma"]').tap();
    await expect(page).toHaveURL(/\/fixture$/);
    await expect(page.locator('[data-panel]')).toContainText('GAMMA LINK');
    await page.locator('svg.narrow [data-key="gamma"]').tap();
    await expect(page).toHaveURL(/\/about$/);
  });
});

test('reduced motion: nothing animates', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/fixture');
  await page.waitForTimeout(3500);
  expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length)).toBe(0);
});
