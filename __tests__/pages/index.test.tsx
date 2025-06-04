import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HomePage, { getStaticProps } from '@/pages/index';
import type { HeroContent, Category } from '@/types'; // Adjust path
import '@testing-library/jest-dom';
import { fetchHeroBanner, fetchCategories, fetchFeaturedCategories } from '@/lib/api';

// Mock the API functions from lib/api
jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  fetchHeroBanner: jest.fn(),
  fetchCategories: jest.fn(),
  fetchFeaturedCategories: jest.fn(), // Mock fetchFeaturedCategories
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

  beforeEach(() => {
    // Reset mocks before each test
    (fetchHeroBanner as jest.Mock).mockReset();
    (fetchCategories as jest.Mock).mockReset();
    (fetchFeaturedCategories as jest.Mock).mockReset();
    (require('@/components/HeroBanner') as jest.Mock).mockClear();
    (require('@/components/FeaturedCategories') as jest.Mock).mockClear();

    // Default successful mocks
    (fetchHeroBanner as jest.Mock).mockResolvedValue(mockHeroData);
    (fetchCategories as jest.Mock).mockResolvedValue(mockCategoriesData);
    (fetchFeaturedCategories as jest.Mock).mockResolvedValue(mockFeaturedCategoriesData);
  });

  describe('getStaticProps', () => {
    it('should fetch all data and return them as props on success', async () => {
      const result = await getStaticProps({} as any);

      expect(fetchHeroBanner).toHaveBeenCalledTimes(1);
      expect(fetchCategories).toHaveBeenCalledTimes(1);
      expect(fetchFeaturedCategories).toHaveBeenCalledTimes(1);

      expect(result).toEqual(expect.objectContaining({
        props: {
          hero: mockHeroData,
          categories: mockCategoriesData,
          featuredCategories: mockFeaturedCategoriesData,
          error: null,
        },
        revalidate: 60,
      }));
    });

    it('should return fallback hero data and other data if fetchHeroBanner fails', async () => {
      (fetchHeroBanner as jest.Mock).mockRejectedValue(new Error('API Error for Hero'));

      const result = await getStaticProps({} as any);

      expect(fetchHeroBanner).toHaveBeenCalledTimes(1);
      expect(fetchCategories).toHaveBeenCalledTimes(1); // Should still be called
      expect(fetchFeaturedCategories).toHaveBeenCalledTimes(1); // Should still be called

      expect(result.props.hero.title).toEqual('Welcome to Our Store!');
      expect(result.props.error).toBe('API Error for Hero');
      expect(result.props.categories).toEqual(mockCategoriesData);
      expect(result.props.featuredCategories).toEqual(mockFeaturedCategoriesData); // Assumes this fetch succeeds
      expect(result.revalidate).toBe(60);
    });

    it('should return empty featuredCategories if fetchFeaturedCategories fails', async () => {
      (fetchFeaturedCategories as jest.Mock).mockRejectedValue(new Error('API Error for Featured'));
      // fetchHeroBanner and fetchCategories will use their default successful mocks from beforeEach

      const result = await getStaticProps({} as any);
      expect(fetchFeaturedCategories).toHaveBeenCalledTimes(1);
      expect(result.props.featuredCategories).toEqual([]); // Fallback to empty array
      expect(result.props.hero).toEqual(mockHeroData); // Other data should be fine
      expect(result.props.categories).toEqual(mockCategoriesData);
      expect(result.props.error).toBeNull(); // No error at hero level
    });
  });

  describe('Page Rendering', () => {
    // Updated PageProps type
    type PageProps = {
      hero: HeroContent;
      categories: Category[];
      featuredCategories: Category[];
      error?: string | null;
    };

    it('renders HeroBanner and FeaturedCategories with fetched data', async () => {
      const pageProps: PageProps = {
        hero: mockHeroData,
        categories: mockCategoriesData,
        featuredCategories: mockFeaturedCategoriesData,
        error: null,
      };

      render(<HomePage {...pageProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('hero-banner')).toBeInTheDocument();
        expect(screen.getByTestId('featured-categories')).toBeInTheDocument();
      });

      expect(require('@/components/HeroBanner')).toHaveBeenCalledWith(expect.objectContaining(mockHeroData), undefined);
      expect(require('@/components/FeaturedCategories')).toHaveBeenCalledWith({ categories: mockFeaturedCategoriesData }, undefined);

      expect(screen.getByRole('heading', { name: mockHeroData.title })).toBeInTheDocument();
      // Check for featured categories content based on the mock
      expect(screen.getByRole('heading', { name: /featured categories/i })).toBeInTheDocument();
      expect(screen.getByText('Featured Cat 1')).toBeInTheDocument();
      expect(screen.getByText('Featured Cat 2')).toBeInTheDocument();
    });

    it('renders fallback content for hero and still attempts to render other sections', async () => {
       const fallbackHeroData: HeroContent = {
          title: 'Welcome to Our Store!',
          description: 'We are currently unable to load the latest offers. Please check back soon.',
          ctaText: 'Explore Products',
          ctaLink: '/products',
          imageUrl: 'https://via.placeholder.com/1200x400.png?text=Our+Store',
          imageAlt: 'Default hero image'
        };

      const pageProps: PageProps = {
        hero: fallbackHeroData,
        categories: mockCategoriesData,
        featuredCategories: mockFeaturedCategoriesData, // Assume featured cats still load
        error: 'Failed to load hero banner data.',
      };

      render(<HomePage {...pageProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('hero-banner')).toBeInTheDocument();
      });

      expect(screen.getByRole('heading', { name: fallbackHeroData.title })).toBeInTheDocument();
      expect(screen.getByText(pageProps.error as string)).toBeInTheDocument();

      // Check that featured categories are still rendered
      expect(screen.getByTestId('featured-categories')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /featured categories/i })).toBeInTheDocument();
      expect(screen.getByText('Featured Cat 1')).toBeInTheDocument();
    });

    it('does not render FeaturedCategories component if featuredCategories data is empty', async () => {
      const pageProps: PageProps = {
        hero: mockHeroData,
        categories: mockCategoriesData,
        featuredCategories: [], // Empty featured categories
        error: null,
      };
      render(<HomePage {...pageProps} />);

      // Based on conditional rendering logic: `featuredCategories && featuredCategories.length > 0 && (<FeaturedCategories ... />)`
      // The entire FeaturedCategories component (including its H2) should not be in the document.
      expect(screen.queryByTestId('featured-categories')).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /featured categories/i })).not.toBeInTheDocument();
    });
  });
});
