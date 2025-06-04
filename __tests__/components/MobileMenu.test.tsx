// __tests__/components/MobileMenu.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileMenu from '@/components/MobileMenu'; // Adjust path as necessary
import '@testing-library/jest-dom';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode, href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return ({
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(), // Mock the push function
    });
  },
}));

const mockCategories = [
  { id: '1', name: 'Electronics', slug: 'electronics' },
  { id: '2', name: 'Clothing', slug: 'clothing' },
];

describe('MobileMenu', () => {
  it('renders and is initially closed', () => {
    render(<MobileMenu categories={mockCategories} />);
    const openButton = screen.getByRole('button', { name: /open menu/i });
    expect(openButton).toBeInTheDocument();
    expect(openButton).toHaveAttribute('aria-expanded', 'false');
    // Content should not be visible. Using queryByTestId because it returns null if not found.
    expect(screen.queryByTestId('mobile-menu-drawer')).not.toBeInTheDocument();
  });

  it('opens and closes the menu on button click', () => {
    render(<MobileMenu categories={mockCategories} />);
    const button = screen.getByRole('button', { name: /open menu/i });

    // Open menu
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    // The name might change to "Close menu" due to the aria-label logic in the component
    expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument();
    expect(screen.getByTestId('mobile-menu-drawer')).toBeVisible();

    // Close menu
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-menu-drawer')).not.toBeInTheDocument();
  });

  it('shows navigation links when open', () => {
    render(<MobileMenu categories={mockCategories} />);
    const button = screen.getByRole('button', { name: /open menu/i });

    // Open menu
    fireEvent.click(button);

    const drawer = screen.getByTestId('mobile-menu-drawer');
    expect(drawer).toBeVisible();

    // Check for items by their text content as they are divs, not <a> tags with href
    expect(screen.getByText('Home')).toBeInTheDocument();
    mockCategories.forEach(cat => {
      expect(screen.getByText(cat.name)).toBeInTheDocument();
    });
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Cart')).toBeInTheDocument();
  });
});
