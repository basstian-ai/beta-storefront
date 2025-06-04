import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HomePage, { getStaticProps } from '@/pages/index'; // Adjust path
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
  return jest.fn((props) => (
    <div data-testid="hero-banner">
      <h1>{props.title}</h1>
      <p>{props.description}</p>
      <a href={props.ctaLink}>{props.ctaText}</a>
      <img src={props.imageUrl} alt={props.imageAlt || 'Hero image'} />
    </div>
  ));
});


describe('HomePage Integration', () => {
  const mockHeroData = {
    title: 'Mock Hero Title',
    description: 'Mock hero description.',
    ctaText: 'Mock CTA',
    ctaLink: '/mock-link',
    imageUrl: 'mock-image.jpg',
    imageAlt: 'Mock image alt text',
  };

  const mockCategoriesData = [ // Assuming fetchCategories is also used by Layout/Navbar
    { id: '1', name: 'Category 1', slug: 'category-1' },
    { id: '2', name: 'Category 2', slug: 'category-2' },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    (require('@/lib/api').fetchHeroBanner as jest.Mock).mockReset();
    (require('@/components/HeroBanner') as jest.Mock).mockClear();

    // Mock fetchCategories as it's called by getStaticProps (for Layout)
    // Now fetchCategories is already a mock due to the updated jest.mock
    const api = require('@/lib/api');
    (api.fetchCategories as jest.Mock).mockReset();
    (api.fetchCategories as jest.Mock).mockResolvedValue(mockCategoriesData);
  });

  describe('getStaticProps', () => {
    it('should fetch hero data and categories, then return them as props', async () => {
      (require('@/lib/api').fetchHeroBanner as jest.Mock).mockResolvedValue(mockHeroData);

      const result = await getStaticProps({} as any); // Cast to any if params are not used

      expect(require('@/lib/api').fetchHeroBanner).toHaveBeenCalledTimes(1);
      expect(require('@/lib/api').fetchCategories).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expect.objectContaining({ // Use expect.objectContaining for props
        props: {
          hero: mockHeroData,
          categories: mockCategoriesData,
        },
        revalidate: 60,
      }));
    });

    it('should return fallback hero data if fetchHeroBanner fails but categories succeed', async () => {
      (require('@/lib/api').fetchHeroBanner as jest.Mock).mockRejectedValue(new Error('API Error'));
      // fetchCategories is mocked to succeed in beforeEach

      const result = await getStaticProps({} as any);

      expect(require('@/lib/api').fetchHeroBanner).toHaveBeenCalledTimes(1);
      expect(require('@/lib/api').fetchCategories).toHaveBeenCalledTimes(1);
      expect(result.props.hero.title).toEqual('Welcome to Our Store!');
      expect(result.props.error).toBe('Failed to load hero banner data.');
      expect(result.props.categories).toEqual(mockCategoriesData); // Categories should still be there
      expect(result.revalidate).toBe(60);
    });
  });

  describe('Page Rendering', () => {
    it('renders the HeroBanner component with fetched data', async () => {
      // fetchHeroBanner is not directly called by the component, data comes via props
      // So, we just need to pass the props as if getStaticProps ran successfully.
      const pageProps = {
        hero: mockHeroData,
        categories: mockCategoriesData,
      };

      render(<HomePage {...pageProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('hero-banner')).toBeInTheDocument();
      });

      expect(require('@/components/HeroBanner')).toHaveBeenCalledWith(expect.objectContaining(mockHeroData), undefined);

      expect(screen.getByRole('heading', { name: mockHeroData.title })).toBeInTheDocument();
      expect(screen.getByText(mockHeroData.description)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: mockHeroData.ctaText })).toHaveAttribute('href', mockHeroData.ctaLink);
      expect(screen.getByAltText(mockHeroData.imageAlt as string)).toHaveAttribute('src', mockHeroData.imageUrl);
    });

    it('renders fallback content if hero data fetching failed and error prop is passed', async () => {
       const fallbackHeroData = {
          title: 'Welcome to Our Store!',
          description: 'We are currently unable to load the latest offers. Please check back soon.',
          ctaText: 'Explore Products',
          ctaLink: '/products',
          imageUrl: 'https://via.placeholder.com/1200x400.png?text=Our+Store',
          imageAlt: 'Default hero image'
        };

      const pageProps = {
        hero: fallbackHeroData,
        categories: mockCategoriesData, // Still pass categories
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
