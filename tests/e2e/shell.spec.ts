import { test, expect } from '@playwright/test';

const ROUTES = [
  ['/', 'Overview'],
  ['/about', 'About'],
  ['/skills', 'Skills'],
  ['/experience', 'Experience'],
  ['/projects', 'Projects'],
  ['/contact', 'Contact'],
] as const;

for (const [path, name] of ROUTES) {
  test(`shell renders ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    const nav = page.getByRole('navigation', { name: 'Sections' });
    await expect(nav.getByRole('link')).toHaveCount(6);
    await expect(nav.locator('a[aria-current="page"]')).toHaveText(new RegExp(name));
    await expect(page.getByRole('link', { name: /Résumé/ }).first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}
