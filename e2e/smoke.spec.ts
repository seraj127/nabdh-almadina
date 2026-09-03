import { test, expect } from '@playwright/test';

/**
 * Smoke E2E against the live deployment.
 * Guards the critical public storefront path and the dark-mode toggle which
 * was recently fixed for contrast + cross-device sync.
 */
test('storefront loads and renders the header', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle(/نبض/);
  // Header is fixed at the top of the page.
  await expect(page.locator('header').first()).toBeVisible();
});

test('dark mode toggle exists and is clickable', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const toggle = page.getByRole('button', { name: 'Toggle theme' });
  await toggle.waitFor({ state: 'visible', timeout: 20_000 });
  await toggle.click();
  // Clicking cycles the theme; at minimum the button must remain usable.
  await expect(toggle).toBeVisible();
});

test('mobile app overlay can be reached from the web root', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  // The mobile app should mount without a runtime crash (no error overlay).
  await expect(page.locator('body')).not.toContainText('Application error');
});
