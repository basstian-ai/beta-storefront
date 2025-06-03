// __tests__/components/BreadcrumbNav.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import BreadcrumbNav from '@/components/BreadcrumbNav'; // Assuming this is the correct path
import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock @digdir/designsystemet-react
jest.mock('@digdir/designsystemet-react', () => {
  const ActualBreadcrumb = jest.requireActual('@digdir/designsystemet-react').Breadcrumb;
  // Mock Breadcrumb and its sub-component Item
  const MockBreadcrumb = ({ children }: { children: React.ReactNode }) => <ol>{children}</ol>;
  MockBreadcrumb.Item = ({ children }: { children: React.ReactNode }) => <li role="listitem">{children}</li>;
  return {
    ...jest.requireActual('@digdir/designsystemet-react'), // Import and retain other exports
    Breadcrumb: MockBreadcrumb, // Override Breadcrumb with our mock
  };
});


describe('BreadcrumbNav', () => {
  const mockUseRouter = require('next/router').useRouter;

  it('renders correctly with a simple path (/products)', () => {
    mockUseRouter.mockReturnValue({ pathname: '/products' });
    render(<BreadcrumbNav />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');

    // Products is the last item, should not be a link
    expect(screen.getByText('Products').closest('a')).toBeNull();
  });

  it('renders correctly with a nested path (/products/category1/item1)', () => {
    mockUseRouter.mockReturnValue({ pathname: '/products/category1/item1' });
    render(<BreadcrumbNav />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Category1')).toBeInTheDocument();
    expect(screen.getByText('Item1')).toBeInTheDocument();

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');

    const productsLink = screen.getByText('Products').closest('a');
    expect(productsLink).toHaveAttribute('href', '/products');

    const categoryLink = screen.getByText('Category1').closest('a');
    expect(categoryLink).toHaveAttribute('href', '/products/category1');

    // Item1 is the last item, should not be a link
    expect(screen.getByText('Item1').closest('a')).toBeNull();
  });

  it('always has a "Home" link', () => {
    mockUseRouter.mockReturnValue({ pathname: '/some/other/path' });
    render(<BreadcrumbNav />);
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('ensures the last item is not a link', () => {
    mockUseRouter.mockReturnValue({ pathname: '/products/electronics' });
    render(<BreadcrumbNav />);
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Products').closest('a')).toHaveAttribute('href', '/products');
    // Electronics is the last item
    expect(screen.getByText('Electronics').closest('a')).toBeNull();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });

  it('renders only Home for the root path and it is not a link', () => {
    mockUseRouter.mockReturnValue({ pathname: '/' });
    render(<BreadcrumbNav />);
    // Home is the only and last item
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Home').closest('a')).toBeNull();

    // Ensure no other breadcrumbs are rendered
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(1);
  });
});
