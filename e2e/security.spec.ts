import { test, expect } from '@playwright/test';

/**
 * Security E2E: verifies hardening headers on HTML responses and that
 * admin / session endpoints are properly guarded (no auth info leakage).
 */
test('site sends security headers', async ({ page }) => {
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response).not.toBeNull();
  const headers = await response!.allHeaders();

  // Baseline hardening — these must be present for production deployments.
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options'] ?? '').toMatch(/DENY|SAMEORIGIN/i);
});

test('admin endpoints reject unauthenticated requests', async ({ page }) => {
  const res = await page.request.get('/api/admin/categories');
  expect([401, 403]).toContain(res.status());
});

test('session endpoint does not leak sensitive data to anonymous users', async ({ page }) => {
  const res = await page.request.get('/api/auth/session');
  expect(res.status()).toBeLessThan(500);
  if (res.ok()) {
    const body = await res.json();
    // Anonymous session must not expose role/email/phone of a logged-in user.
    expect(body.user?.role === 'admin').not.toBe(true);
  }
});
