import { test, expect } from '@playwright/test';
import { expectCardsInViewport } from './helpers';
import profile from '../../src/data/api/v1/profile.json' with { type: 'json' };

test('renders every fact from the API data', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.locator('h1')).toHaveText("Let's talk");
  for (const s of [profile.email, profile.status.text, profile.workMode, profile.replyTime]) await expect(page.locator('.intro')).toContainText(s);
  await expect(page.getByRole('link', { name: 'Email Lee' })).toHaveAttribute('href', `mailto:${profile.email}`);
  const fig = page.locator('svg[data-figure]:visible');
  await expect(fig).toContainText(profile.email);
  await expect(fig).toContainText('LINK UP · OPEN TO SENIOR BACKEND ROLES');
});

test('four probe-able parts: ports, controller, buffers, PCIe', async ({ page }) => {
  await page.goto('/contact');
  const fig = page.locator('svg[data-figure]:visible');
  for (const k of ['ports', 'ctrl', 'buf', 'pcie']) await expect(fig.locator(`.pr[data-key="${k}"]`)).toHaveCount(1);
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('the Copy button and the controller both copy the address', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/contact');
    await page.getByRole('button', { name: 'Copy', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Copied', exact: true })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(profile.email);
    await page.evaluate(() => navigator.clipboard.writeText(''));
    await page.locator('svg.wide [data-key="ctrl"]').click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(profile.email);
  });

  test('a double click on Copy still goes back to "Copy"', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/contact');
    const btn = page.locator('[data-copy-btn]');
    await btn.dblclick();
    await expect(btn).toHaveText('Copied');
    await page.waitForTimeout(2500);
    await expect(btn).toHaveText('Copy');
  });

  test('link LEDs are green, activity LEDs blink', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('svg.wide .led.ok')).toHaveCount(4);
    await expect(page.locator('svg.wide .led.blink')).toHaveCount(4);
  });

  test('popup cards stay in the window', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('svg.wide').hover({ position: { x: 2, y: 2 } });
    await expectCardsInViewport(page);
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone only');

  test('tapping the controller fills the panel with the address', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('svg.narrow [data-key="ctrl"]').tap();
    await expect(page.locator('[data-panel]')).toContainText(profile.email);
  });
});
