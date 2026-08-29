import '@testing-library/jest-dom/vitest';
import { vi, beforeEach } from 'vitest';

// Deterministic test JWT secret — src/lib/jwt.ts refuses to load without one.
process.env.JWT_SECRET ||= 'vitest-jwt-secret-key-for-testing-only-32chars';

// jsdom environment for stores/components. Reset localStorage between tests.
beforeEach(() => {
  try {
    localStorage.clear();
  } catch { /* ignore */ }
  vi.restoreAllMocks();
});
