// __tests__/components/FeaturedCategories.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import FeaturedCategories from '@/components/FeaturedCategories'; // Adjust path as needed
import '@testing-library/jest-dom';

const mockCategories = [
  { id: '1', name: 'Electronics', slug: 'electronics', imageUrl: 'http://example.com/electronics.jpg' },
  { id: '2', name: 'Books', slug: 'books', imageUrl: 'http://example.com/books.jpg' },
  { id: '3', name: 'Clothing', slug: 'clothing' }, // No imageUrl
];

describe('FeaturedCategories Component', () => {
  it('renders the heading and categories correctly', () => {
    render(<FeaturedCategories categories={mockCategories} />);

    expect(screen.getByRole('heading', { name: /featured categories/i })).toBeInTheDocument();

    mockCategories.forEach(cat => {
      expect(screen.getByText(cat.name)).toBeInTheDocument();
      const link = screen.getByRole('link', { name: new RegExp(cat.name, "i") });
      expect(link).toHaveAttribute('href', `/category/${cat.slug}`);

      if (cat.imageUrl) {
        const img = screen.getByAltText(cat.name);
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', cat.imageUrl);
        expect(img).toHaveAttribute('sizes');
      } else {
        // Check that no image is rendered for this category if imageUrl is not provided
        const linkElement = screen.getByRole('link', { name: cat.name });
        const imgElement = linkElement.querySelector('img');
        expect(imgElement).toBeNull();
      }
    });
  });

  it('renders correctly with an empty list of categories', () => {
    const { container } = render(<FeaturedCategories categories={[]} />); // Destructure container
    expect(screen.getByRole('heading', { name: /featured categories/i })).toBeInTheDocument();

    // Check that no category cards are rendered.
    // Using querySelectorAll on the container for a specific class name used in the component.
    // This assumes the class 'category-card' is applied to the anchor tags.
    const categoryCards = container.querySelectorAll('a[class*="categoryCard"]'); // Use a more specific selector based on CSS module
    expect(categoryCards.length).toBe(0);
  });

  it('handles categories without imageUrl gracefully', () => {
    const categoryWithoutImage = { id: '4', name: 'Services', slug: 'services' };
    render(<FeaturedCategories categories={[categoryWithoutImage]} />);

    expect(screen.getByText(categoryWithoutImage.name)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: categoryWithoutImage.name });
    expect(link).toHaveAttribute('href', `/category/${categoryWithoutImage.slug}`);

    // Verify no image is rendered for this category
    const linkElement = screen.getByRole('link', { name: categoryWithoutImage.name });
    const imgElement = linkElement.querySelector('img');
    expect(imgElement).toBeNull();
  });
});
