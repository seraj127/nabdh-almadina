import { defineConfig } from '@playwright/test';

/**
 * E2E smoke tests run against the live deployment so they don't need a local
 * database or a running dev server. Run with: npm run test:e2e
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://nabdh-almadina.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Reuse the system-installed Chrome (no browser download needed — avoids
    // filling the constrained C: drive). Install Playwright with `npm i -D @playwright/test`.
    { name: 'chrome', use: { browserName: 'chromium', channel: 'chrome' } },
  ],
});
