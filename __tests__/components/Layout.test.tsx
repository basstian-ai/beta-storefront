import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../../components/Layout';
import { Category } from '../../types';
import '@testing-library/jest-dom';

// Mock Navbar component
jest.mock('../../components/Navbar', () => {
  return function DummyNavbar({ categories }: { categories: Category[] }) {
    return (
      <div data-testid="navbar">
        {categories.map(cat => <span key={cat.id}>{cat.name}</span>)}
      </div>
    );
  };
});

describe('Layout', () => {
  const mockCategories: Category[] = [
    { id: '1', name: 'Electronics', slug: 'electronics' },
    { id: '2', name: 'Books', slug: 'books' },
  ];

  it('renders Navbar with categories and children', () => {
    render(
      <Layout categories={mockCategories}>
        <div data-testid="child-content">Hello World</div>
      </Layout>
    );

    // Check if Navbar is rendered and receives categories
    const navbar = screen.getByTestId('navbar');
    expect(navbar).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Books')).toBeInTheDocument();

    // Check if children are rendered
    expect(screen.getByTestId('child-content')).toHaveTextContent('Hello World');
  });
});
