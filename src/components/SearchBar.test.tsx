import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders as render } from '../../tests/utils';
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
  beforeEach(() => {
    push.mockReset();
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
    expect(push).toHaveBeenCalledWith('/search?q=phone');
  });

});
