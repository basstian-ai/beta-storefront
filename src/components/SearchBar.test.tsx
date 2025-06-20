import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders as render, flushSpy } from '../../tests/utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SearchBar from './SearchBar';

import type { Mock } from 'vitest';

const push = vi.fn();

const params = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => params,
}));

describe('SearchBar', () => {
  beforeEach(() => {
    push.mockReset();
    flushSpy?.mockReset();
  });
  it('submits query via router.push', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Search products…');
    await userEvent.type(input, 'laptop');
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/search?q=laptop');
    });
  });

  it('flushes pending query on submit', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Search products…');
    await userEvent.type(input, 'phone');
    fireEvent.submit(input.closest('form')!);
    expect(flushSpy).toHaveBeenCalled();
  });

  it('debounces rapid input', async () => {
    vi.useFakeTimers();
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Search products…');
    await userEvent.type(input, 'phone');
    vi.advanceTimersByTime(300);
    expect(flushSpy).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
