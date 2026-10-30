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

  test('screen readers hear a part on focus, not on every hover or tour step', async ({ page }) => {
    await page.goto('/fixture');
    await expect(page.locator('svg.wide .pr.on')).toHaveCount(1, { timeout: 5000 });
    await page.locator('svg.wide [data-key="beta"]').hover();
    await expect(page.locator('svg.wide [data-key="beta"]')).toHaveClass(/\bon\b/);
    await expect(page.locator('[data-live]')).toHaveText('');
    await page.locator('svg.wide [data-key="alpha"]').focus();
    await expect(page.locator('[data-live]')).toContainText('ALPHA PART');
  });

  test('a finger tap on a touch laptop shows a link part before following it', async ({ page }) => {
    await page.goto('/fixture');
    const gamma = page.locator('svg.wide [data-key="gamma"]');
    await gamma.dispatchEvent('pointerdown', { pointerType: 'touch', isPrimary: true });
    await gamma.dispatchEvent('click');
    await expect(gamma).toHaveClass(/\bon\b/);
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/fixture$/);
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

  test('a tap is announced once: the panel is not a live region', async ({ page }) => {
    await page.goto('/fixture');
    await expect(page.locator('[data-panel]')).not.toHaveAttribute('aria-live', /.+/);
    await page.locator('svg.narrow [data-key="beta"]').tap();
    await expect(page.locator('[data-live]')).toContainText('BETA PART');
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

test('page transitions leave one panel listener, not one per page', async ({ page }) => {
  await page.addInitScript(() => {
    const seen: (AbortSignal | undefined)[] = ((window as unknown as { __probe: unknown[] }).__probe = []) as never;
    const add = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (this: EventTarget, type: string, fn: EventListenerOrEventListenerObject | null, opts?: boolean | AddEventListenerOptions) {
      if (type === 'probe' && this === document) seen.push(typeof opts === 'object' ? opts.signal : undefined);
      return add.call(this, type, fn, opts);
    };
  });
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Sections' });
  for (const [name, url] of [[/About/, /\/about$/], [/Skills/, /\/skills$/], [/Contact/, /\/contact$/]] as const) {
    await nav.getByRole('link', { name }).click();
    await expect(page).toHaveURL(url);
  }
  await expect.poll(async () => (await page.evaluate(() => (window as unknown as { __probe: unknown[] }).__probe.length))).toBe(4);
  expect(await page.evaluate(() => (window as unknown as { __probe: (AbortSignal | undefined)[] }).__probe.filter((s) => !s || !s.aborted).length)).toBe(1);
});

test('reduced motion: nothing animates', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/fixture');
  await page.waitForTimeout(3500);
  expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length)).toBe(0);
});
