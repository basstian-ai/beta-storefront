import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SearchPage, { getServerSideProps } from '@/pages/search';
import { fetchCategories, fetchSearchResults, Product } from '@/lib/api';
import type { Category } from '@/types';
import '@testing-library/jest-dom';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  fetchCategories: jest.fn(),
  fetchSearchResults: jest.fn(),
}));

jest.mock('@/components/Layout', () => ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>);
jest.mock('@/components/BreadcrumbNav', () => () => <div data-testid="breadcrumb">Breadcrumb</div>);
jest.mock('@/components/ProductList', () => ({ products }: { products: Product[] }) => (
  <div data-testid="product-list">{products.map(p => <div key={p.id}>{p.name}</div>)}</div>
));

describe('SearchPage integration', () => {
  const mockCategories: Category[] = [{ id: '1', name: 'Cat', slug: 'cat' }];
  const mockResults: Product[] = [
    { id: 'p1', name: 'Laptop', price: 999, brand: 'Brand', size: '', imageUrl: 'l.jpg', createdAt: '' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (fetchCategories as jest.Mock).mockResolvedValue(mockCategories);
  });

  it('renders search results returned from getServerSideProps', async () => {
    (fetchSearchResults as jest.Mock).mockResolvedValue(mockResults);
    const ctx = { query: { q: 'laptop' } } as any;
    const { props } = await getServerSideProps(ctx);
    render(<SearchPage {...props} />);

    expect(fetchSearchResults).toHaveBeenCalledWith('laptop');
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });
  });

  it('shows "No results found" when search returns empty', async () => {
    (fetchSearchResults as jest.Mock).mockResolvedValue([]);
    const ctx = { query: { q: 'nomatch' } } as any;
    const { props } = await getServerSideProps(ctx);
    render(<SearchPage {...props} />);

    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });
});
