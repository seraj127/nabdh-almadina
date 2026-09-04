import { test, expect } from '@playwright/test';

/**
 * Performance budget + layout stability for the live storefront.
 * Guard against shipping regressions that would slow first paint or
 * cause horizontal overflow on mobile (a common professional defect).
 */
test('home page loads within a reasonable performance budget', async ({ page }) => {
  const start = Date.now();
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const domContentLoadedMs = Date.now() - start;

  // Generous but meaningful budget: DCL under 12s on live network.
  expect(domContentLoadedMs).toBeLessThan(12_000);

  // Header must be laid out and visible early.
  await expect(page.locator('header').first()).toBeVisible();
});

test('layout has no horizontal overflow on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'load' });

  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  });
  expect(hasOverflow).toBe(false);
});

test('critical sections render above the fold', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  // Header, hero/nav, and the categories marquee should all be present.
  await expect(page.locator('header').first()).toBeVisible();
  await expect(page.locator('.marquee-btn').first()).toBeVisible();
  // No app-level crash text
  await expect(page.locator('body')).not.toContainText('Application error');
});
