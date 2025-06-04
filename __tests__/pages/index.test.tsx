import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HomePage, { getStaticProps } from '@/pages/index';
import type { HeroContent, Category } from '@/types'; // Adjust path
import '@testing-library/jest-dom';

// Mock the fetchHeroBanner API call from lib/api
jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'), // Import and retain other exports from lib/api
  fetchHeroBanner: jest.fn(),
  fetchCategories: jest.fn(), // Explicitly mock fetchCategories
}));

// Mock the Layout component as its internals are not the focus of this test
jest.mock('@/components/Layout', () => {
  return ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>;
});

// Mock the HeroBanner component to ensure it's called correctly by HomePage
jest.mock('@/components/HeroBanner', () => {
  // Ensure the mock accepts HeroContent props
  return jest.fn((props: HeroContent) => (
    <div data-testid="hero-banner">
      <h1>{props.title}</h1>
      <p>{props.description}</p>
      <a href={props.ctaLink}>{props.ctaText}</a>
      <img src={props.imageUrl} alt={props.imageAlt || 'Hero image'} />
    </div>
  ));
});


describe('HomePage Integration', () => {
  const mockHeroData: HeroContent = { // Use HeroContent type
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

  beforeEach(() => {
    // Reset mocks before each test
    (require('@/lib/api').fetchHeroBanner as jest.Mock).mockReset();
    (require('@/components/HeroBanner') as jest.Mock).mockClear();

    const api = require('@/lib/api');
    (api.fetchCategories as jest.Mock).mockReset();
    (api.fetchCategories as jest.Mock).mockResolvedValue(mockCategoriesData);
  });

  describe('getStaticProps', () => {
    it('should fetch hero data and categories, then return them as props', async () => {
      (require('@/lib/api').fetchHeroBanner as jest.Mock).mockResolvedValue(mockHeroData);

      const result = await getStaticProps({} as any);

      expect(require('@/lib/api').fetchHeroBanner).toHaveBeenCalledTimes(1);
      expect(require('@/lib/api').fetchCategories).toHaveBeenCalledTimes(1);

      // Check the structure of props, ensuring hero is of HeroContent type
      expect(result).toEqual(expect.objectContaining({
        props: {
          hero: mockHeroData, // This should conform to HeroContent
          categories: mockCategoriesData,
          error: null, // Explicitly check error is null on success
        },
        revalidate: 60,
      }));
    });

    it('should return fallback hero data if fetchHeroBanner fails but categories succeed', async () => {
      (require('@/lib/api').fetchHeroBanner as jest.Mock).mockRejectedValue(new Error('API Error'));

      const result = await getStaticProps({} as any);

      expect(require('@/lib/api').fetchHeroBanner).toHaveBeenCalledTimes(1);
      expect(require('@/lib/api').fetchCategories).toHaveBeenCalledTimes(1);

      // Check that the hero prop matches the structure of HeroContent
      expect(result.props.hero.title).toEqual('Welcome to Our Store!');
      expect(result.props.hero.imageUrl).toBeDefined(); // Check a few properties to be sure
      expect(result.props.error).toBe('API Error'); // Error message comes from the actual error
      expect(result.props.categories).toEqual(mockCategoriesData);
      expect(result.revalidate).toBe(60);
    });
  });

  describe('Page Rendering', () => {
    // Helper type for page props, using HeroContent
    type PageProps = {
      hero: HeroContent;
      categories: Category[];
      error?: string;
    };

    it('renders the HeroBanner component with fetched data', async () => {
      const pageProps: PageProps = {
        hero: mockHeroData,
        categories: mockCategoriesData,
      };

      render(<HomePage {...pageProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('hero-banner')).toBeInTheDocument();
      });

      // Ensure HeroBanner (mock) is called with props that conform to HeroContent
      expect(require('@/components/HeroBanner')).toHaveBeenCalledWith(expect.objectContaining(mockHeroData), undefined);

      expect(screen.getByRole('heading', { name: mockHeroData.title })).toBeInTheDocument();
      expect(screen.getByText(mockHeroData.description)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: mockHeroData.ctaText })).toHaveAttribute('href', mockHeroData.ctaLink);
      expect(screen.getByAltText(mockHeroData.imageAlt as string)).toHaveAttribute('src', mockHeroData.imageUrl);
    });

    it('renders fallback content if hero data fetching failed and error prop is passed', async () => {
       const fallbackHeroData: HeroContent = { // Ensure this is HeroContent
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
        error: 'Failed to load hero banner data.',
      };

      render(<HomePage {...pageProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('hero-banner')).toBeInTheDocument();
      });

      expect(screen.getByRole('heading', { name: fallbackHeroData.title })).toBeInTheDocument();
      expect(screen.getByText(pageProps.error as string)).toBeInTheDocument();
    });
  });
});
