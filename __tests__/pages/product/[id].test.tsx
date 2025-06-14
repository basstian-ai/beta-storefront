import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductPage from '@/pages/product/[id]'; // Adjust path as necessary
import type { Product, Category, Variant } from '@/types';

// Mock next/router
const mockRouterPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    query: { id: '1' }, // Default mock query
    pathname: '/product/1',
    push: mockRouterPush,
    asPath: '/product/1',
  }),
}));

// Mock next/head
jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: Array<React.ReactElement> }) => {
      // Simple mock that just renders children.
      // You can add more advanced assertions here if needed, e.g., checking title.
      return <>{children}</>;
    },
  };
});

// Mock ImageGallery to simplify testing, we're not testing ImageGallery here
jest.mock('@/components/ImageGallery', () => {
  return {
    __esModule: true,
    default: ({ images, defaultMainImageAlt }: { images: any[], defaultMainImageAlt: string }) => (
      <div data-testid="mock-image-gallery">
        <img src={images[0]?.src} alt={defaultMainImageAlt || images[0]?.alt} data-testid="gallery-main-image" />
        {images.slice(1).map((img, idx) => (
          <img key={idx} src={img.src} alt={img.alt} data-testid={`gallery-thumb-${idx}`} />
        ))}
      </div>
    ),
  };
});


const mockCategories: Category[] = [
  { id: 'cat1', name: 'Electronics', slug: 'electronics' },
];

const mockProductBase: Omit<Product, 'id' | 'name'> = {
  slug: 'test-product',
  price: 100.00,
  imageUrl: '/images/product.jpg',
  createdAt: '2023-01-01T00:00:00Z',
  images: [{ src: '/images/product-main.jpg', alt: 'Product Main' }],
  specifications: [{ name: 'Feature', value: 'Yes' }],
};

describe('ProductPage Component', () => {
  let MOCK_PRODUCT_DATA: Product;

  beforeEach(() => {
    // Reset router mock for each test
    mockRouterPush.mockClear();
    // Reset product data for each test to ensure isolation
    MOCK_PRODUCT_DATA = {
      ...mockProductBase,
      id: '1',
      name: 'Test Product 1',
      price: 100.00,
    };
  });

  // Helper to render the component with specific product data
  const renderProductPage = (productData: Product) => {
    return render(
      <ProductPage categories={mockCategories} product={productData} />
    );
  };

  describe('B2B Pricing Display', () => {
    test('shows regular price by default', () => {
      renderProductPage(MOCK_PRODUCT_DATA);
      expect(screen.getByText(`Price: $${MOCK_PRODUCT_DATA.price.toFixed(2)}`)).toBeInTheDocument();
      expect(screen.queryByText(/Your Contract Price:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/List Price:/)).not.toBeInTheDocument();
    });

    test('shows contract price and list price for B2B user if contractPrice exists', () => {
      const productWithContract = { ...MOCK_PRODUCT_DATA, contractPrice: 80.00 };
      // isB2BUser is hardcoded to true in the component for now
      renderProductPage(productWithContract);

      expect(screen.getByText(`Your Contract Price: $${productWithContract.contractPrice.toFixed(2)}`)).toBeInTheDocument();
      const listPrice = screen.getByText(`List Price: $${productWithContract.price.toFixed(2)}`);
      expect(listPrice).toBeInTheDocument();
      expect(listPrice).toHaveStyle('text-decoration: line-through');
    });

    test('hides Volume Pricing when contract price is shown', () => {
      const productWithContractAndTiers: Product = {
        ...MOCK_PRODUCT_DATA,
        contractPrice: 80.00,
        priceTiers: [{ quantity: 5, price: 90.00 }],
      };
      renderProductPage(productWithContractAndTiers);
      expect(screen.queryByText('Volume Pricing')).not.toBeInTheDocument();
    });

    test('shows Volume Pricing when no contract price is shown (and tiers exist)', () => {
      const productWithTiers: Product = {
        ...MOCK_PRODUCT_DATA,
        priceTiers: [{ quantity: 5, price: 90.00 }],
        contractPrice: undefined, // Ensure no contract price
      };
      renderProductPage(productWithTiers);
      expect(screen.getByText('Volume Pricing')).toBeInTheDocument();
      expect(screen.getByText(`Quantity: ${productWithTiers.priceTiers![0].quantity}+`)).toBeInTheDocument();
    });
  });

  describe('Variant Details Display and Selection', () => {
    const mockVariants: Variant[] = [
      { id: 'var1', name: 'Variant Red', sku: 'P1-RED', attributes: { color: 'Red' }, imageUrl: '/images/variant-red.jpg' },
      { id: 'var2', name: 'Variant Blue', sku: 'P1-BLUE', attributes: { color: 'Blue' } },
    ];

    test('displays default variant info and allows selection', async () => {
      const productWithVariants: Product = {
        ...MOCK_PRODUCT_DATA,
        variants: mockVariants,
      };

      // Mock router for initial load (no variantId in query)
      jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => ({
        query: { id: productWithVariants.id }, // No variantId initially
        pathname: `/product/${productWithVariants.id}`,
        push: mockRouterPush,
        asPath: `/product/${productWithVariants.id}`,
      }));

      renderProductPage(productWithVariants);

      // Check if default (first) variant is displayed (due to useEffect)
      // The component defaults to the first variant if none in URL
      expect(screen.getByText(mockVariants[0].name)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(mockVariants[0].sku))).toBeInTheDocument();

      // Check main image uses variant image
      const mainImage = screen.getByTestId('gallery-main-image') as HTMLImageElement;
      expect(mainImage.src).toContain(mockVariants[0].imageUrl);

      // Find and click the second variant button
      const variant2Button = screen.getByRole('button', { name: mockVariants[1].name });
      expect(variant2Button).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(variant2Button);
      });

      // Check if router.push was called for URL update (shallow routing)
      expect(mockRouterPush).toHaveBeenCalledWith(
        {
          pathname: `/product/${productWithVariants.id}`,
          query: { id: productWithVariants.id, variantId: mockVariants[1].id },
        },
        undefined,
        { shallow: true }
      );

      // After state update (triggered by click and subsequent useEffect if router changed)
      // The UI should reflect the new variant.
      // Note: Since we mocked `push`, the router query doesn't actually change in JSDOM.
      // The component's state `selectedVariant` *does* change directly from handleVariantSelect.
      expect(screen.getByText(mockVariants[1].name)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(mockVariants[1].sku))).toBeInTheDocument();

      // Check main image (variant 2 has no image, should fallback to product image)
      expect(mainImage.src).toContain(productWithVariants.images![0].src);
    });

    test('loads variant from URL query parameter on initial load', () => {
      const productWithVariants: Product = {
        ...MOCK_PRODUCT_DATA,
        variants: mockVariants,
      };

      // Mock router to include variantId in query
      jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => ({
        query: { id: productWithVariants.id, variantId: mockVariants[1].id }, // Second variant selected via URL
        pathname: `/product/${productWithVariants.id}`,
        push: mockRouterPush,
        asPath: `/product/${productWithVariants.id}?variantId=${mockVariants[1].id}`,
      }));

      renderProductPage(productWithVariants);

      // Check if the second variant (from URL) is displayed
      expect(screen.getByText(mockVariants[1].name)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(mockVariants[1].sku))).toBeInTheDocument();

      // Check main image (variant 2 has no image, should fallback)
      const mainImage = screen.getByTestId('gallery-main-image') as HTMLImageElement;
      expect(mainImage.src).toContain(productWithVariants.images![0].src);
    });
  });

  test('renders JSON-LD script in Head', () => {
    renderProductPage(MOCK_PRODUCT_DATA);
    const scripts = documenthead.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBe(1);
    const jsonLd = JSON.parse(scripts[0].innerHTML);
    expect(jsonLd.name).toBe(MOCK_PRODUCT_DATA.name);
    expect(jsonLd.sku).toBe(MOCK_PRODUCT_DATA.id); // Fallback SKU
  });
});

// Helper to access elements appended to document.head
// This is a bit of a hack for testing Head content outside of a full Next.js environment.
// In newer @testing-library/react, you might not need this if Head is mocked effectively.
const documenthead = document.getElementsByTagName('head')[0];

// Clean up document.head after tests if needed, though JSDOM should isolate this.
afterEach(() => {
  // document.head.innerHTML = ''; // Could do this, but might be too aggressive
});
