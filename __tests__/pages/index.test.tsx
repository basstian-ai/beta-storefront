import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HomePage, { getStaticProps } from '@/pages/index';
import type { HeroContent, Category, Product } from '@/types'; // Adjust path, Added Product
import '@testing-library/jest-dom';
import { fetchHeroBanner, fetchCategories, fetchFeaturedCategories, fetchFeaturedProducts } from '@/lib/api'; // Added fetchFeaturedProducts

// Mock the API functions from lib/api
jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  fetchHeroBanner: jest.fn(),
  fetchCategories: jest.fn(),
  fetchFeaturedCategories: jest.fn(),
  fetchFeaturedProducts: jest.fn(), // Added fetchFeaturedProducts
}));

// Mock child components
jest.mock('@/components/Layout', () => {
  return ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>;
});

jest.mock('@/components/HeroBanner', () => {
  const MockHeroBanner = (props: HeroContent) => (
    <div data-testid="hero-banner">
      <h1>{props.title}</h1>
      <p>{props.description}</p>
      <a href={props.ctaLink}>{props.ctaText}</a>
      <img src={props.imageUrl} alt={props.imageAlt || 'Hero image'} />
    </div>
  );
  return jest.fn(MockHeroBanner);
});

jest.mock('@/components/FeaturedCategories', () => {
  const MockFeaturedCategories = ({ categories }: { categories: Category[] }) => (
    <div data-testid="featured-categories">
      <h2>Featured Categories</h2>
      {categories.map(cat => <div key={cat.id}>{cat.name}</div>)}
    </div>
  );
  return jest.fn(MockFeaturedCategories);
});

// Mock FeaturedProductsCarousel component
jest.mock('@/components/FeaturedProductsCarousel', () => {
  const MockFeaturedProductsCarousel = ({ products }: { products: Product[] }) => (
    <div data-testid="featured-products-carousel">
      <h2>Featured Products Mock</h2>
      {products.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  );
  return jest.fn(MockFeaturedProductsCarousel);
});


describe('HomePage Integration', () => {
  const mockHeroData: HeroContent = {
    title: 'Mock Hero Title',
    description: 'Mock hero description.',
    ctaText: 'Mock CTA',
    ctaLink: '/mock-link',
    imageUrl: 'mock-image.jpg',
    imageAlt: 'Mock image alt text',
  };

  const mockCategoriesData: Category[] = [
    { id: '1', name: 'Category 1', slug: 'category-1' },
    { id: '2', name: 'Category 2', slug: 'category-2' },
  ];

  const mockFeaturedCategoriesData: Category[] = [
    { id: 'fc1', name: 'Featured Cat 1', slug: 'featured-cat-1', imageUrl: 'img.jpg' },
    { id: 'fc2', name: 'Featured Cat 2', slug: 'featured-cat-2' },
  ];

  const mockFeaturedProductsData: Product[] = [
    { id: 'p1', name: 'Product Alpha', slug: 'product-alpha', price: 19.99, imageUrl: 'prodA.jpg', createdAt: '2023-10-01T00:00:00Z' },
    { id: 'p2', name: 'Product Beta', slug: 'product-beta', price: 29.99, imageUrl: 'prodB.jpg', createdAt: '2023-10-02T00:00:00Z' },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    (fetchHeroBanner as jest.Mock).mockReset();
    (fetchCategories as jest.Mock).mockReset();
    (fetchFeaturedCategories as jest.Mock).mockReset();
    (fetchFeaturedProducts as jest.Mock).mockReset(); // Added for featured products
    (require('@/components/HeroBanner') as jest.Mock).mockClear();
    (require('@/components/FeaturedCategories') as jest.Mock).mockClear();
    (require('@/components/FeaturedProductsCarousel') as jest.Mock).mockClear(); // Added

    // Default successful mocks
    (fetchHeroBanner as jest.Mock).mockResolvedValue(mockHeroData);
    (fetchCategories as jest.Mock).mockResolvedValue(mockCategoriesData);
    (fetchFeaturedCategories as jest.Mock).mockResolvedValue(mockFeaturedCategoriesData);
    (fetchFeaturedProducts as jest.Mock).mockResolvedValue(mockFeaturedProductsData); // Added
  });

  describe('getStaticProps', () => {
    it('should fetch all data and return them as props on success', async () => {
      const result = await getStaticProps({} as any);

      expect(fetchHeroBanner).toHaveBeenCalledTimes(1);
      expect(fetchCategories).toHaveBeenCalledTimes(1);
      expect(fetchFeaturedCategories).toHaveBeenCalledTimes(1);
      expect(fetchFeaturedProducts).toHaveBeenCalledTimes(1); // Added

      expect(result).toEqual(expect.objectContaining({
        props: {
          hero: mockHeroData,
          categories: mockCategoriesData,
          featuredCategories: mockFeaturedCategoriesData,
          featuredProducts: mockFeaturedProductsData, // Added
          error: null,
        },
        revalidate: 60,
      }));
    });

    it('should return fallback hero data, empty arrays for others if fetchHeroBanner fails', async () => {
      // If fetchHeroBanner fails, subsequent fetches in the try block are skipped.
      (fetchHeroBanner as jest.Mock).mockRejectedValue(new Error('API Error for Hero'));
      // Explicitly reset other mocks to ensure they are not called if hero fails first.
      (fetchCategories as jest.Mock).mockReset();
      (fetchFeaturedCategories as jest.Mock).mockReset();
      (fetchFeaturedProducts as jest.Mock).mockReset();

      const result = await getStaticProps({} as any);

      expect(fetchHeroBanner).toHaveBeenCalledTimes(1);
      // These should not have been called because fetchHeroBanner failed first in the try block
      expect(fetchCategories).not.toHaveBeenCalled();
      expect(fetchFeaturedCategories).not.toHaveBeenCalled();
      expect(fetchFeaturedProducts).not.toHaveBeenCalled();

      expect(result.props.hero?.title).toEqual('Welcome to Our Store!'); // Fallback hero
      expect(result.props.categories).toEqual([]); // Initial empty array
      expect(result.props.featuredCategories).toEqual([]); // Initial empty array
      expect(result.props.featuredProducts).toEqual([]); // Initial empty array
      expect(result.props.error).toBe('Some content failed to load. Please try again later.');
      expect(result.revalidate).toBe(60);
    });

    it('should return fetched data for prior calls and empty array for featuredProducts if it fails', async () => {
      // Hero, categories, featuredCategories succeed
      (fetchHeroBanner as jest.Mock).mockResolvedValue(mockHeroData);
      (fetchCategories as jest.Mock).mockResolvedValue(mockCategoriesData);
      (fetchFeaturedCategories as jest.Mock).mockResolvedValue(mockFeaturedCategoriesData);
      // fetchFeaturedProducts fails
      (fetchFeaturedProducts as jest.Mock).mockRejectedValue(new Error('API Error for Featured Products'));

      const result = await getStaticProps({} as any);

      expect(fetchHeroBanner).toHaveBeenCalledTimes(1);
      expect(fetchCategories).toHaveBeenCalledTimes(1);
      expect(fetchFeaturedCategories).toHaveBeenCalledTimes(1);
      expect(fetchFeaturedProducts).toHaveBeenCalledTimes(1); // This one was called and failed

      expect(result.props.hero).toEqual(mockHeroData);
      expect(result.props.categories).toEqual(mockCategoriesData);
      expect(result.props.featuredCategories).toEqual(mockFeaturedCategoriesData);
      expect(result.props.featuredProducts).toEqual([]); // Should be empty due to its fetch failure
      expect(result.props.error).toBe('Some content failed to load. Please try again later.');
      expect(result.revalidate).toBe(60);
    });

    // The existing test 'should return empty featuredCategories if fetchFeaturedCategories fails'
    // needs to be updated to reflect the consolidated error handling and that fetchFeaturedProducts
    // would not be called if fetchFeaturedCategories fails first.
    it('should return empty for featuredCategories and featuredProducts if fetchFeaturedCategories fails', async () => {
      (fetchHeroBanner as jest.Mock).mockResolvedValue(mockHeroData);
      (fetchCategories as jest.Mock).mockResolvedValue(mockCategoriesData);
      (fetchFeaturedCategories as jest.Mock).mockRejectedValue(new Error('API Error for Featured Categories'));
      // fetchFeaturedProducts should not be called if fetchFeaturedCategories fails before it in the try block
      (fetchFeaturedProducts as jest.Mock).mockReset();


      const result = await getStaticProps({} as any);

      expect(fetchHeroBanner).toHaveBeenCalledTimes(1);
      expect(fetchCategories).toHaveBeenCalledTimes(1);
      expect(fetchFeaturedCategories).toHaveBeenCalledTimes(1); // Failed
      expect(fetchFeaturedProducts).not.toHaveBeenCalled(); // Skipped

      expect(result.props.hero).toEqual(mockHeroData);
      expect(result.props.categories).toEqual(mockCategoriesData);
      expect(result.props.featuredCategories).toEqual([]);
      expect(result.props.featuredProducts).toEqual([]);
      expect(result.props.error).toBe('Some content failed to load. Please try again later.');
    });
  });

  describe('Page Rendering', () => {
    // Updated PageProps type to align with HomePageProps in pages/index.tsx (all optional)
    type PageProps = {
      hero?: HeroContent;
      categories?: Category[];
      featuredCategories?: Category[];
      featuredProducts?: Product[]; // Added
      error?: string | null;
    };

    it('renders all sections including FeaturedProductsCarousel with full data', async () => {
      const pageProps: PageProps = {
        hero: mockHeroData,
        categories: mockCategoriesData,
        featuredCategories: mockFeaturedCategoriesData,
        featuredProducts: mockFeaturedProductsData, // Added
        error: null,
      };

      render(<HomePage {...pageProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('hero-banner')).toBeInTheDocument();
        expect(screen.getByTestId('featured-categories')).toBeInTheDocument();
        expect(screen.getByTestId('featured-products-carousel')).toBeInTheDocument(); // Added
      });

      expect(require('@/components/HeroBanner')).toHaveBeenCalledWith(expect.objectContaining(mockHeroData), {});
      expect(require('@/components/FeaturedCategories')).toHaveBeenCalledWith({ categories: mockFeaturedCategoriesData }, {});
      expect(require('@/components/FeaturedProductsCarousel')).toHaveBeenCalledWith({ products: mockFeaturedProductsData }, {}); // Added

      expect(screen.getByRole('heading', { name: mockHeroData.title })).toBeInTheDocument();
      expect(screen.getByText('Featured Cat 1')).toBeInTheDocument();
      // Check for product names from the mock carousel
      expect(screen.getByText('Product Alpha')).toBeInTheDocument();
      expect(screen.getByText('Product Beta')).toBeInTheDocument();
    });

    it('renders fallback content for hero and still renders other sections including products', async () => {
       const fallbackHeroData: HeroContent = {
          title: 'Welcome to Our Store!',
          description: 'We are currently unable to load the latest offers. Please check back soon.',
          ctaText: 'Explore Products',
          ctaLink: '/products',
         imageUrl: 'https://via.placeholder.com/1200x400.webp?text=Our+Store',
          imageAlt: 'Default hero image'
        };

      const pageProps: PageProps = {
        hero: fallbackHeroData, // Using fallback hero
        categories: mockCategoriesData,
        featuredCategories: mockFeaturedCategoriesData,
        featuredProducts: mockFeaturedProductsData, // Products are still available
        error: 'Some content failed to load.', // Error message present
      };

      render(<HomePage {...pageProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('hero-banner')).toBeInTheDocument();
        expect(screen.getByTestId('featured-categories')).toBeInTheDocument();
        expect(screen.getByTestId('featured-products-carousel')).toBeInTheDocument();
      });

      expect(screen.getByRole('heading', { name: fallbackHeroData.title })).toBeInTheDocument();
      expect(screen.getByText(pageProps.error as string)).toBeInTheDocument();

      // Check other sections are still rendered
      expect(screen.getByText('Featured Cat 1')).toBeInTheDocument();
      expect(screen.getByText('Product Alpha')).toBeInTheDocument();
    });

    it('does not render FeaturedCategories component if featuredCategories data is empty or undefined', async () => {
      const pageProps: PageProps = {
        hero: mockHeroData,
        categories: mockCategoriesData,
        featuredCategories: [], // Empty
        featuredProducts: mockFeaturedProductsData,
        error: null,
      };
      render(<HomePage {...pageProps} />);
      expect(screen.queryByTestId('featured-categories')).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /Featured Categories/i })).not.toBeInTheDocument(); // Mock H2 title

      // Test with undefined
      render(<HomePage {...{...pageProps, featuredCategories: undefined }} />);
      expect(screen.queryByTestId('featured-categories')).not.toBeInTheDocument();
    });

    it('does not render FeaturedProductsCarousel component if featuredProducts data is empty or undefined', async () => {
      const pageProps: PageProps = {
        hero: mockHeroData,
        categories: mockCategoriesData,
        featuredCategories: mockFeaturedCategoriesData,
        featuredProducts: [], // Empty
        error: null,
      };
      render(<HomePage {...pageProps} />);
      expect(screen.queryByTestId('featured-products-carousel')).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /Featured Products Mock/i })).not.toBeInTheDocument(); // Mock H2 title

      // Test with undefined
      render(<HomePage {...{...pageProps, featuredProducts: undefined }} />);
      expect(screen.queryByTestId('featured-products-carousel')).not.toBeInTheDocument();
    });
  });
});
