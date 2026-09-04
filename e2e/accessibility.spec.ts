import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility (a11y) gate against the live storefront.
 * Fails the build if any WCAG 2.1 A/AA critical or serious violations exist.
 */
test('home page has no serious/critical accessibility violations', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await page.locator('header').first().waitFor({ state: 'visible' });

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const blocking = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  );
  expect(
    blocking,
    `Accessibility violations: ${blocking
      .map((v) => `${v.id} (${v.impact}) x${v.nodes.length}`)
      .join('; ')}`
  ).toHaveLength(0);
});
