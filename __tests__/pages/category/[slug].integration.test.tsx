// __tests__/pages/category/[slug].integration.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryPage from '@/pages/category/[slug]';
import * as api from '@/lib/api';
import { CategoryPageData } from '@/lib/api';
import { ActiveFilters } from '@/components/FacetFilters'; // Corrected import

// Mock next/router
const mockRouterReplace = jest.fn();
const mockRouterPush = jest.fn();
let currentMockRouterQuery: Record<string, string | string[]> = { slug: 'electronics' };

// Helper to build query string for asPath simulation
function buildQueryString(query: Record<string, string | string[]>) {
  const params = new URLSearchParams();
  for (const key in query) {
    if (key !== 'slug' && query[key] && query[key]!.length > 0) { // Ensure value is not empty
      const value = query[key];
      if (typeof value === 'string') params.set(key, value);
      else if (Array.isArray(value)) params.set(key, value.join(','));
    }
  }
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

const mockRouterObject = {
  query: currentMockRouterQuery,
  isFallback: false,
  asPath: `/category/electronics${buildQueryString(currentMockRouterQuery)}`,
  pathname: '/category/[slug]',
  push: mockRouterPush,
  replace: mockRouterReplace,
  isReady: true,
};
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => mockRouterObject),
}));

// Simplified mocks for next/image and next/link
jest.mock('next/image', () => ({ __esModule: true, default: (props: any) => React.createElement('img', { ...props, alt: props.alt || "" }) }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => React.createElement('a', { href }, children) }));

const initialMockData: CategoryPageData = {
  category: { id: 'cat1', name: 'Electronics', slug: 'electronics' },
  products: [
    { id: 'p1', name: 'Smart TV', price: 500, brand: 'BrandA', size: '55-inch', imageUrl: 'tv.jpg', createdAt: '2023-08-01T00:00:00Z' },
    { id: 'p2', name: 'Laptop X', price: 1200, brand: 'BrandB', size: '15-inch', imageUrl: 'laptop.jpg', createdAt: '2023-08-02T00:00:00Z' },
    { id: 'p3', name: 'Headphones Y', price: 150, brand: 'BrandA', size: 'Large', imageUrl: 'headphones.jpg', createdAt: '2023-08-03T00:00:00Z' },
  ],
  facets: { brand: ['BrandA', 'BrandB'], size: ['55-inch', '15-inch', 'Large'] },
};

const filteredByBrandAMockData: CategoryPageData = {
  category: { id: 'cat1', name: 'Electronics', slug: 'electronics' },
  products: [
    { id: 'p1', name: 'Smart TV', price: 500, brand: 'BrandA', size: '55-inch', imageUrl: 'tv.jpg', createdAt: '2023-08-01T00:00:00Z' },
    { id: 'p3', name: 'Headphones Y', price: 150, brand: 'BrandA', size: 'Large', imageUrl: 'headphones.jpg', createdAt: '2023-08-03T00:00:00Z' },
  ],
  facets: { brand: ['BrandA', 'BrandB'], size: ['55-inch', '15-inch', 'Large'] },
};

const filteredByBrandAndSizeMockData: CategoryPageData = {
  category: { id: 'cat1', name: 'Electronics', slug: 'electronics' },
  products: [
    { id: 'p3', name: 'Headphones Y', price: 150, brand: 'BrandA', size: 'Large', imageUrl: 'headphones.jpg', createdAt: '2023-08-03T00:00:00Z' },
  ],
  facets: { brand: ['BrandA', 'BrandB'], size: ['55-inch', '15-inch', 'Large'] },
};

let fetchCategoryWithProductsSpy: jest.SpyInstance;

describe('CategoryPage Integration - BFF Filtering', () => {
  beforeEach(() => {
    currentMockRouterQuery = { slug: 'electronics' };
    mockRouterObject.query = currentMockRouterQuery;
    // Update asPath based on the reset currentMockRouterQuery
    mockRouterObject.asPath = `/category/${currentMockRouterQuery.slug}${buildQueryString(currentMockRouterQuery)}`;
    mockRouterReplace.mockClear();

    fetchCategoryWithProductsSpy = jest.spyOn(api, 'fetchCategoryWithProducts');
    // Default mock for initial load / when no specific filter mock is set yet in a test
    fetchCategoryWithProductsSpy.mockResolvedValue(initialMockData);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render initial products and then re-fetch and render filtered products when a brand filter is applied', async () => {
    render(<CategoryPage initialCategoryData={initialMockData} initialSlug="electronics" />);
    expect(await screen.findByText('Smart TV')).toBeInTheDocument();
    expect(screen.getAllByRole('img').length).toBe(3);

    // Set up the mock for the specific fetch call that will be triggered by the filter change
    fetchCategoryWithProductsSpy.mockResolvedValueOnce(filteredByBrandAMockData);
    fireEvent.click(screen.getByLabelText('BrandA'));

    await waitFor(() => {
      expect(fetchCategoryWithProductsSpy).toHaveBeenCalledWith('electronics', { brand: ['BrandA'] });
    });

    await waitFor(() => {
      expect(screen.getByText('Smart TV')).toBeInTheDocument();
      expect(screen.getByText('Headphones Y')).toBeInTheDocument();
      expect(screen.queryByText('Laptop X')).not.toBeInTheDocument();
      expect(screen.getAllByRole('img').length).toBe(2);
    });
  });

  it('should re-fetch with combined filters and update UI', async () => {
    render(<CategoryPage initialCategoryData={initialMockData} initialSlug="electronics" />);
    expect(await screen.findByText('Smart TV')).toBeInTheDocument();

    fetchCategoryWithProductsSpy.mockResolvedValueOnce(filteredByBrandAMockData);
    fireEvent.click(screen.getByLabelText('BrandA'));
    await waitFor(() => expect(fetchCategoryWithProductsSpy).toHaveBeenCalledWith('electronics', { brand: ['BrandA'] }));
    await waitFor(() => expect(screen.getAllByRole('img').length).toBe(2)); // UI updated for BrandA

    // Prepare for the next filter action
    fetchCategoryWithProductsSpy.mockResolvedValueOnce(filteredByBrandAndSizeMockData);
    // Simulate URL update from the previous action before the next click
    currentMockRouterQuery = { slug: 'electronics', brand: 'BrandA' };
    mockRouterObject.query = currentMockRouterQuery; // Update the query the router mock will return
    mockRouterObject.asPath = `/category/electronics?brand=BrandA`; // Update asPath

    fireEvent.click(screen.getByLabelText('Large'));

    await waitFor(() => {
      expect(fetchCategoryWithProductsSpy).toHaveBeenCalledWith('electronics', { brand: ['BrandA'], size: ['Large'] });
    });

    await waitFor(() => {
      expect(screen.getByText('Headphones Y')).toBeInTheDocument();
      expect(screen.queryByText('Smart TV')).not.toBeInTheDocument();
      expect(screen.getAllByRole('img').length).toBe(1);
    });
  });

  it('should re-fetch with no filters and show all products when a filter is deselected', async () => {
    render(<CategoryPage initialCategoryData={initialMockData} initialSlug="electronics" />);
    expect(await screen.findByText('Smart TV')).toBeInTheDocument();

    fetchCategoryWithProductsSpy.mockResolvedValueOnce(filteredByBrandAMockData);
    const brandACheckbox = screen.getByLabelText('BrandA');
    fireEvent.click(brandACheckbox); // Apply filter
    await waitFor(() => expect(fetchCategoryWithProductsSpy).toHaveBeenCalledWith('electronics', { brand: ['BrandA'] }));
    await waitFor(() => expect(screen.getAllByRole('img').length).toBe(2)); // UI updated for BrandA

    // Prepare for the deselection
    fetchCategoryWithProductsSpy.mockResolvedValueOnce(initialMockData);
    currentMockRouterQuery = { slug: 'electronics', brand: 'BrandA' };
    mockRouterObject.query = currentMockRouterQuery;
    mockRouterObject.asPath = `/category/electronics?brand=BrandA`;

    fireEvent.click(brandACheckbox); // Deselect filter

    await waitFor(() => {
      // Expect call with empty object for filters, or specific logic for deselection if different
      expect(fetchCategoryWithProductsSpy).toHaveBeenCalledWith('electronics', {});
    });

    await waitFor(() => {
      expect(screen.getByText('Smart TV')).toBeInTheDocument();
      expect(screen.getByText('Laptop X')).toBeInTheDocument();
      expect(screen.getByText('Headphones Y')).toBeInTheDocument();
      expect(screen.getAllByRole('img').length).toBe(3);
    });
  });

  it('should initialize with filters from URL, fetch filtered data, and render correctly', async () => {
    currentMockRouterQuery = { slug: 'electronics', brand: 'BrandA' };
    mockRouterObject.query = currentMockRouterQuery; // Set query before initial render for this test
    mockRouterObject.asPath = `/category/electronics?brand=BrandA`;

    // This spy will be for the fetch triggered by URL parsing on load
    fetchCategoryWithProductsSpy.mockResolvedValue(filteredByBrandAMockData);

    render(<CategoryPage initialCategoryData={initialMockData} initialSlug="electronics" />);

    // The first fetch is from getStaticProps (not spied on here).
    // The second fetch is from useEffect triggered by URL query params.
    await waitFor(() => {
      // The number of calls can be tricky due to initial render + potential updates.
      // We care that *a* call was made with these filters due to URL parsing.
      expect(fetchCategoryWithProductsSpy).toHaveBeenCalledWith('electronics', { brand: ['BrandA'] });
    });

    await waitFor(() => {
      expect(screen.getByText('Smart TV')).toBeInTheDocument();
      expect(screen.getByText('Headphones Y')).toBeInTheDocument();
      expect(screen.queryByText('Laptop X')).not.toBeInTheDocument();
      expect(screen.getAllByRole('img').length).toBe(2);
      expect(screen.getByLabelText('BrandA')).toBeChecked();
    });
  });
});
