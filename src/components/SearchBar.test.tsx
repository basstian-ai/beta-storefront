import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBar from './SearchBar';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('SearchBar', () => {
  it('submits query via router.push', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Search products…');
    fireEvent.change(input, { target: { value: 'laptop' } });
    fireEvent.submit(input.closest('form')!);
    expect(push).toHaveBeenCalledWith('/search?q=laptop');
  });
});
