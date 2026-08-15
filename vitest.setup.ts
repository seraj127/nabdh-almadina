import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom environment for stores/components. Reset localStorage between tests.
beforeEach(() => {
  try {
    localStorage.clear();
  } catch { /* ignore */ }
  vi.restoreAllMocks();
});
