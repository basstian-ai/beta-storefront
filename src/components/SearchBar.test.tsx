import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SearchBar from './SearchBar';

const push = vi.fn();

const params = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => params,
}));

describe('SearchBar', () => {
  it('submits query via router.push', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Search products…');
    await userEvent.type(input, 'laptop');
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/search?q=laptop');
    });
  });
});
