// __tests__/pages/product/[slug].test.tsx
import { render, screen, waitFor, act } from '@testing-library/react';
import ProductPage from '@/pages/product/[slug]';
import '@testing-library/jest-dom';
import { Product } from '@/types';

// Mock next/router
const mockRouterPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    query: { slug: 'test-product-slug', variant: '' }, // Default mock query
    isReady: true,
    push: mockRouterPush,
  }),
}));

// Mock next/head
jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: Array<React.ReactElement> }) => {
      // Simulate rendering children to make them discoverable in tests
      return <>{children}</>;
    },
  };
});


// Mock bff/products
const mockGetProducts = jest.fn();
jest.mock('@/bff/products', () => ({
  getProducts: () => mockGetProducts(),
}));

// Mock components to simplify PDP testing (optional, but can help focus tests)
jest.mock('@/components/ImageGallery', () => () => <div data-testid="image-gallery-mock" />);
jest.mock('@/components/PriceDisplay', () => (props: any) => (
  <div data-testid="price-display-mock">
    Price: {props.price}
    {props.contractPrice && props.customerToken && <span>Contract: {props.contractPrice}</span>}
  </div>
));
jest.mock('@/components/ProductSpecifications', () => () => <div data-testid="specifications-mock" />);
// Mock Layout as it's not the focus of this test
jest.mock('@/components/Layout', () => ({ children }: { children: React.ReactNode }) => <div data-testid="layout-mock">{children}</div>);


const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  slug: 'test-product-slug',
  price: 100,
  description: 'This is a test product.',
  imageUrl: 'https://example.com/image.jpg',
  createdAt: new Date().toISOString(),
  images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  specifications: { weight: '1kg' },
  priceTiers: [],
  contractPrice: 80,
  variants: [
    {
      id: 'variant1',
      name: 'Variant Alpha',
      price: 110,
      images: ['https://example.com/variant-alpha.jpg'],
      specifications: { color: 'Alpha Red' },
      contractPrice: 85,
    },
  ],
};

const mockProductsPayload = {
  products: [mockProduct],
  total: 1,
  skip: 0,
  limit: 1,
};

describe('ProductPage', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
    // Default router query for most tests
    require('next/router').useRouter = () => ({
        query: { slug: 'test-product-slug' },
        isReady: true,
        push: mockRouterPush,
    });
  });

  it('fetches data and renders product information', async () => {
    mockGetProducts.mockResolvedValueOnce(mockProductsPayload);
    render(<ProductPage />);

    await waitFor(() => {
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    });
    expect(screen.getByTestId('image-gallery-mock')).toBeInTheDocument();
    expect(screen.getByTestId('price-display-mock')).toHaveTextContent(`Price: ${mockProduct.price}`);
    expect(screen.getByTestId('specifications-mock')).toBeInTheDocument();
  });

  it('handles loading state', async () => {
    mockGetProducts.mockReturnValueOnce(new Promise(() => {})); // Never resolves
    render(<ProductPage />);
    expect(screen.getByText(/Loading product details.../i)).toBeInTheDocument();
  });

  it('handles error state', async () => {
    mockGetProducts.mockRejectedValueOnce(new Error('Failed to fetch'));
    render(<ProductPage />);
    await waitFor(() => {
      expect(screen.getByText(/Failed to load product details./i)).toBeInTheDocument();
    });
  });

  it('handles product not found state', async () => {
    mockGetProducts.mockResolvedValueOnce({ products: [], total:0, skip:0, limit:0 });
    render(<ProductPage />);
    await waitFor(() => {
        // The component shows "Product details are unavailable" when displayData is null
        // which happens after a product is not found.
      expect(screen.getByText(/Product details are unavailable./i)).toBeInTheDocument();
    });
  });

  it('selects and displays product variant based on query parameter', async () => {
    const variant = mockProduct.variants![0];
    require('next/router').useRouter = () => ({ // Override router mock for this test
      query: { slug: 'test-product-slug', variant: variant.id },
      isReady: true,
      push: mockRouterPush,
    });
    mockGetProducts.mockResolvedValueOnce(mockProductsPayload);

    render(<ProductPage />);

    await waitFor(() => {
      expect(screen.getByText(`${mockProduct.name} - ${variant.name}`)).toBeInTheDocument();
    });
    // Check if PriceDisplay mock receives variant's price
    expect(screen.getByTestId('price-display-mock')).toHaveTextContent(`Price: ${variant.price}`);
  });

  it('generates and embeds JSON-LD script correctly', async () => {
    mockGetProducts.mockResolvedValueOnce(mockProductsPayload);
    render(<ProductPage />);

    await waitFor(() => {
      // Check for some key elements in the JSON-LD data
      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).toBeInTheDocument();
      const jsonData = JSON.parse(script!.textContent!);
      expect(jsonData['@type']).toBe('Product');
      expect(jsonData.name).toBe(mockProduct.name);
      expect(jsonData.sku).toBe(mockProduct.id);
      expect(jsonData.offers.price).toBe(mockProduct.price.toFixed(2));
    });
  });

  it('generates JSON-LD script with variant data when variant is selected', async () => {
    const variant = mockProduct.variants![0];
     require('next/router').useRouter = () => ({ // Override router mock
      query: { slug: 'test-product-slug', variant: variant.id },
      isReady: true,
      push: mockRouterPush,
    });
    mockGetProducts.mockResolvedValueOnce(mockProductsPayload);
    render(<ProductPage />);

    await waitFor(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).toBeInTheDocument();
      const jsonData = JSON.parse(script!.textContent!);
      expect(jsonData.name).toBe(`${mockProduct.name} - ${variant.name}`);
      expect(jsonData.sku).toBe(variant.id);
      expect(jsonData.offers.price).toBe(variant.price!.toFixed(2));
    });
  });

  // Test for B2B contract price display simulation could be added here
  // by finding the checkbox, clicking it, and verifying PriceDisplay mock content
});
