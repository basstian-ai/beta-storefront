import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SearchBar from './SearchBar';

let flushSpy: any;

vi.mock('use-debounce', () => ({
  useDebouncedCallback: (fn: any) => {
    const wrapped = (...args: any[]) => fn(...args);
    flushSpy = vi.fn();
    wrapped.flush = flushSpy;
    wrapped.cancel = vi.fn();
    return wrapped;
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
