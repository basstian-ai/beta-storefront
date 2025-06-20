import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders as render } from '../../tests/renderWithProviders';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SearchBar from './SearchBar';

import type { Mock } from 'vitest';

let flushSpy: Mock | undefined;

vi.mock('use-debounce', () => ({
  useDebouncedCallback: <T extends unknown[]>(fn: (...args: T) => void) => {
    const wrapped = (...args: T) => fn(...args);
    flushSpy = vi.fn();
    (wrapped as typeof wrapped & { flush: Mock; cancel: Mock }).flush = flushSpy;
    (wrapped as typeof wrapped & { flush: Mock; cancel: Mock }).cancel = vi.fn();
    return wrapped as typeof wrapped & { flush: Mock; cancel: Mock };
  },
}));

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
});
