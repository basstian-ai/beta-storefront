import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SortMenu from '@/components/SortMenu';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('SortMenu', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/category/electronics',
      query: {},
      push: pushMock,
    });
    pushMock.mockClear();
  });

  it('renders sorting options', () => {
    render(<SortMenu />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Price: Low to High' })).toBeInTheDocument();
  });

  it('updates route query on change', () => {
    render(<SortMenu />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'price-asc' } });
    expect(pushMock).toHaveBeenCalledWith(
      {
        pathname: '/category/electronics',
        query: { sort: 'price-asc' },
      },
      undefined,
      { shallow: true }
    );
  });
});
