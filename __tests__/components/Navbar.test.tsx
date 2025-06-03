import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Navbar from '../../components/Navbar';
import React from 'react';
import styles from '../../styles/Navbar.module.css'; // Import CSS Modules styles

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/', // Default pathname for tests
    route: '/',
    query: {},
    asPath: '/',
    push: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
    },
    beforePopState: vi.fn(() => null),
    prefetch: vi.fn(() => Promise.resolve()),
  }),
}));

describe('Navbar Component', () => {
  it('renders correctly with all navigation links', () => {
    render(<Navbar />);

    // Check for the presence of the nav element (good for accessibility context)
    const navElement = screen.getByRole('navigation');
    expect(navElement).toBeInTheDocument();

    // Check for Home link
    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');

    // Check for Products link
    const productsLink = screen.getByRole('link', { name: /products/i });
    expect(productsLink).toBeInTheDocument();
    expect(productsLink).toHaveAttribute('href', '/products');

    // Check for Cart link
    const cartLink = screen.getByRole('link', { name: /cart/i });
    expect(cartLink).toBeInTheDocument();
    expect(cartLink).toHaveAttribute('href', '/cart');
  });

  it('highlights the active link based on the current path', () => {
    // Mock useRouter to return a specific path
    vi.mock('next/router', () => ({
      useRouter: () => ({
        pathname: '/products', // Set current path to /products
        route: '/products',
        query: {},
        asPath: '/products',
        push: vi.fn(),
        events: {
          on: vi.fn(),
          off: vi.fn(),
        },
        beforePopState: vi.fn(() => null),
        prefetch: vi.fn(() => Promise.resolve()),
      }),
    }));

    render(<Navbar />);

    const productsLink = screen.getByRole('link', { name: /products/i });
    expect(productsLink).toHaveClass(styles.active); // Use styles.active for CSS Modules
    expect(productsLink).toHaveAttribute('aria-current', 'page');

    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).not.toHaveClass('active');
    expect(homeLink).not.toHaveAttribute('aria-current', 'page');
  });
});
