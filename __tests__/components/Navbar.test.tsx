import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '../../components/Navbar';
import { Category } from '../../types';
import { useRouter } from 'next/router';
import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('Navbar', () => {
  const mockCategories: Category[] = [
    { id: '1', name: 'Electronics', slug: 'electronics' },
    { id: '2', name: 'Books', slug: 'books' },
  ];

  beforeEach(() => {
    // Set up default mock for useRouter
    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/',
      asPath: '/',
      query: {},
      push: jest.fn(),
    });
  });

  it('renders static links correctly', () => {
    render(<Navbar categories={[]} />); // No categories for this test
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/products');
    expect(screen.getByText('[CartIcon] Cart')).toBeInTheDocument();
    // To find by role 'link' with specific text that includes an icon-like prefix,
    // we might need a more flexible matcher if `name` doesn't work directly with the prefixed text.
    // Let's try with the full text first. If it fails, a custom function for text matching might be needed.
    expect(screen.getByRole('link', { name: '[CartIcon] Cart' })).toHaveAttribute('href', '/cart');
  });

  it('renders dynamic category links correctly', () => {
    render(<Navbar categories={mockCategories} />);

    const electronicsLink = screen.getByRole('link', { name: 'Electronics' });
    expect(electronicsLink).toBeInTheDocument();
    expect(electronicsLink).toHaveAttribute('href', '/category/electronics');

    const booksLink = screen.getByRole('link', { name: 'Books' });
    expect(booksLink).toBeInTheDocument();
    expect(booksLink).toHaveAttribute('href', '/category/books');
  });

  it('applies active class to current page link (Home)', () => {
    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/',
      asPath: '/',
    });
    render(<Navbar categories={mockCategories} />);
    expect(screen.getByText('Home').closest('a')).toHaveClass('active');
  });

  it('applies active class to current category link', () => {
    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/category/[slug]',
      asPath: '/category/electronics',
      query: { slug: 'electronics' },
    });
    render(<Navbar categories={mockCategories} />);
    expect(screen.getByText('Electronics').closest('a')).toHaveClass('active');
    expect(screen.getByText('Home').closest('a')).not.toHaveClass('active');
  });
});
