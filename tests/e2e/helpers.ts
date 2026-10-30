import { expect, type Page } from '@playwright/test';

/** Hover every probe-able part in the visible drawing; each one's popup card must sit fully inside the window. */
export async function expectCardsInViewport(page: Page) {
  const parts = page.locator('svg.wide .pr');
  const n = await parts.count();
  expect(n).toBeGreaterThan(0);
  const vp = page.viewportSize()!;
  for (let i = 0; i < n; i++) {
    await parts.nth(i).hover();
    const card = page.locator('.card.in');
    await expect(card).toBeVisible();
    const box = (await card.boundingBox())!;
    expect(box.x, `part ${i} card left`).toBeGreaterThanOrEqual(0);
    expect(box.y, `part ${i} card top`).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, `part ${i} card right`).toBeLessThanOrEqual(vp.width);
    expect(box.y + box.height, `part ${i} card bottom`).toBeLessThanOrEqual(vp.height);
    await page.mouse.move(2, 2);
  }
}
