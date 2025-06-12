// __tests__/pages/category/[slug].integration.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryPage from '@/pages/category/[slug]';
import * as api from '@/lib/api'; // We still need to import to access the mocked function
import { CategoryPageData } from '@/lib/api';
import { ActiveFilters } from '@/components/FacetFilters'; // Corrected import

// Mock next/router
let currentMockRouterQuery: Record<string, string | string[]> = { slug: 'electronics' }; // Used to initialize mockRouterObject

const mockRouterReplace = jest.fn((newPath: string) => {
  const url = new URL(newPath, 'http://localhost'); // Use URL constructor
  mockRouterObject.asPath = newPath;

  const newQuery: Record<string, string | string[]> = {};
  const pathnameParts = url.pathname.split('/');
  // Assuming path is /category/[slug]
  if (pathnameParts.length > 2 && pathnameParts[1] === 'category') {
    newQuery.slug = pathnameParts[2];
  } else if (mockRouterObject.query.slug) { // Fallback to existing slug from query if path is unusual
    newQuery.slug = mockRouterObject.query.slug;
  }
  // else slug might be undefined if path is truly weird, which might be intended for some tests

  url.searchParams.forEach((value, key) => {
    if (key !== 'slug') { // Ensure query param 'slug' doesn't override path slug
      newQuery[key] = value.includes(',') ? value.split(',') : value;
    }
  });
  mockRouterObject.query = newQuery;
});

const mockRouterPush = jest.fn();

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

// Mock the specific API function
jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'), // Import and retain default behavior for other functions
  fetchCategoryWithProducts: jest.fn(),
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

// No longer need a global spy variable: let fetchCategoryWithProductsSpy: jest.SpyInstance;

describe('CategoryPage Integration - BFF Filtering', () => {
  beforeEach(() => {
    currentMockRouterQuery = { slug: 'electronics' };
    mockRouterObject.query = currentMockRouterQuery;
    mockRouterObject.asPath = `/category/${currentMockRouterQuery.slug}${buildQueryString(currentMockRouterQuery)}`;
    mockRouterReplace.mockClear();

    const fetchMock = api.fetchCategoryWithProducts as jest.Mock;
    fetchMock.mockClear();
    let callCount = 0;
    fetchMock.mockImplementation(async (slug: string, filters?: ActiveFilters, sort?: string) => {
      callCount++;
      if (callCount > 5) { // Allow a few calls, then error out to stop potential loops
        throw new Error('fetchCategoryWithProducts called too many times');
      }
      // Default behavior or specific mocks will be set by mockResolvedValue / mockResolvedValueOnce in tests
      if (fetchMock.mock.results[callCount -1] && fetchMock.mock.results[callCount-1].type === 'return') {
         return fetchMock.mock.results[callCount-1].value;
      }
      return initialMockData; // Fallback if no specific mockResolvedValueOnce is hit
    });
    // Set a default for tests that don't immediately override with mockResolvedValueOnce
    fetchMock.mockResolvedValue(initialMockData);
  });

  afterEach(() => {
    // jest.restoreAllMocks(); // Not strictly needed for jest.mock, but can be kept for other spies if any
    // Let's clear the specific mock to be safe for other test files, though jest.resetModules might be better if state leaks across files
    (api.fetchCategoryWithProducts as jest.Mock).mockClear();
  });

  it('should render initial products and then re-fetch and render filtered products when a brand filter is applied', async () => {
    render(<CategoryPage initialCategoryData={initialMockData} initialSlug="electronics" />);
    expect(await screen.findByText('Smart TV')).toBeInTheDocument();
    expect(screen.getAllByRole('img').length).toBe(3);

    // Clear calls from initial render, then set up mock for specific filter change
    (api.fetchCategoryWithProducts as jest.Mock).mockClear();
    (api.fetchCategoryWithProducts as jest.Mock).mockResolvedValueOnce(filteredByBrandAMockData);
    fireEvent.click(screen.getByLabelText('BrandA'));

    await waitFor(() => {
      expect(api.fetchCategoryWithProducts).toHaveBeenCalledWith('electronics', { brand: ['BrandA'] });
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

    // First filter interaction
    (api.fetchCategoryWithProducts as jest.Mock).mockClear(); // Clear before this interaction sequence
    (api.fetchCategoryWithProducts as jest.Mock).mockResolvedValueOnce(filteredByBrandAMockData);
    fireEvent.click(screen.getByLabelText('BrandA'));
    await waitFor(() => expect(api.fetchCategoryWithProducts).toHaveBeenCalledWith('electronics', { brand: ['BrandA'] }));
    await waitFor(() => expect(screen.getAllByRole('img').length).toBe(2)); // UI updated for BrandA

    // Second filter interaction (combined)
    (api.fetchCategoryWithProducts as jest.Mock).mockClear(); // Clear before this interaction sequence
    (api.fetchCategoryWithProducts as jest.Mock).mockResolvedValueOnce(filteredByBrandAndSizeMockData);
    // DO NOT manually update currentMockRouterQuery or asPath here;
    // The component's router.replace call, via our mock, should update mockRouterObject.
    fireEvent.click(screen.getByLabelText('Large'));

    await waitFor(() => {
      expect(api.fetchCategoryWithProducts).toHaveBeenCalledWith('electronics', { brand: ['BrandA'], size: ['Large'] });
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

    // Apply filter
    (api.fetchCategoryWithProducts as jest.Mock).mockClear();
    (api.fetchCategoryWithProducts as jest.Mock).mockResolvedValueOnce(filteredByBrandAMockData);
    const brandACheckbox = screen.getByLabelText('BrandA');
    fireEvent.click(brandACheckbox);
    await waitFor(() => expect(api.fetchCategoryWithProducts).toHaveBeenCalledWith('electronics', { brand: ['BrandA'] }));
    await waitFor(() => expect(screen.getAllByRole('img').length).toBe(2)); // UI updated for BrandA

    // Deselect filter
    (api.fetchCategoryWithProducts as jest.Mock).mockClear();
    (api.fetchCategoryWithProducts as jest.Mock).mockResolvedValueOnce(initialMockData);
    // DO NOT manually update currentMockRouterQuery or asPath here for deselection.
    // The component's effects should trigger router.replace, updating mockRouterObject.
    fireEvent.click(brandACheckbox); // Deselect filter

    await waitFor(() => {
      // Expect call with empty object for filters, or specific logic for deselection if different
      expect(api.fetchCategoryWithProducts).toHaveBeenCalledWith('electronics', {});
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

    // The component should pick up 'brand=BrandA' from the router.query set at the start of this test.
    // The initial fetchCategoryWithProducts in beforeEach is already set to initialMockData.
    // We need to ensure the fetch triggered by URL params uses the filtered data.
    (api.fetchCategoryWithProducts as jest.Mock).mockClear(); // Clear any setup from beforeEach
    (api.fetchCategoryWithProducts as jest.Mock).mockResolvedValue(filteredByBrandAMockData); // All calls in this test get this

    render(<CategoryPage initialCategoryData={initialMockData} initialSlug="electronics" />);

    // This fetch is triggered by useEffect based on router.query.
    await waitFor(() => {
      // Ensure it was called with the filters derived from the URL.
      expect(api.fetchCategoryWithProducts).toHaveBeenCalledWith('electronics', { brand: ['BrandA'] });
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
