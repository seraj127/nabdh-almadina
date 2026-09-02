import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';

const setTheme = vi.fn();
const fetchMock = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', resolvedTheme: 'light', setTheme }),
}));

vi.mock('@/lib/theme-sync', () => ({
  fetchThemeFromServer: () => Promise.resolve(fetchMock()),
}));

import { ThemeSync } from '@/components/theme-sync';

describe('ThemeSync component (web theme reconciliation)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('applies a server-persisted theme when a nabdh:theme-sync event fires', () => {
    render(<ThemeSync />);
    act(() => {
      window.dispatchEvent(new CustomEvent('nabdh:theme-sync', { detail: { theme: 'dark' } }));
    });
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('ignores an invalid theme value from the event', () => {
    render(<ThemeSync />);
    setTheme.mockClear();
    act(() => {
      window.dispatchEvent(new CustomEvent('nabdh:theme-sync', { detail: { theme: 'banana' } }));
    });
    expect(setTheme).not.toHaveBeenCalled();
  });

  it('pulls and applies the server theme on mount', async () => {
    fetchMock.mockResolvedValue('dark');
    render(<ThemeSync />);
    await waitFor(() => expect(setTheme).toHaveBeenCalledWith('dark'));
  });

  it('does not apply when the server has no persisted theme', async () => {
    fetchMock.mockResolvedValue(null);
    render(<ThemeSync />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(setTheme).not.toHaveBeenCalled();
  });
});
