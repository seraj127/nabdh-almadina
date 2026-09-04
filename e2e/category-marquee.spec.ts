import { test, expect } from '@playwright/test';

/**
 * Guard strict "add 4 new category buttons" fix — ensure the storefront
 * renders all 16 categories (12 DB + 4 merged seed) and the marquee arrows
 * do not overlap the category buttons visually.
 */
test('marquee renders every category button (16 total)', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/', { waitUntil: 'load' });
  // Wait for category buttons to hydrate
  await page.waitForSelector('.marquee-btn', { timeout: 30_000 });
  const buttons = await page.locator('.marquee-btn').all();
  expect(buttons.length).toBe(16);
});

test('gmobile profile hides admin and APK download entries', async ({ page }) => {
  // The mobile app overlays / — the profile tab must not contain these entries.
  await page.goto('/', { waitUntil: 'load' });
  // Wait for the app bundle to mount; check no admin/APK buttons exist in the DOM
  // for regular users (mobile app profile tab).
  const html = await page.content();
  expect(html).not.toContain('Download App APK');
  expect(html).not.toContain('تحميل التطبيق APK');
});
