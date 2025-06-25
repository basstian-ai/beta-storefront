import React from 'react';
import { render, screen } from '@testing-library/react';
import HeroBanner from '@/components/HeroBanner';
import type { HeroContent } from '@/types'; // Adjust path
import '@testing-library/jest-dom';

// Mock the CSS module to prevent errors during testing
// and to allow checking for class names if needed.
jest.mock('@/styles/HeroBanner.module.css', () => ({
  heroBanner: 'mockHeroBanner',
  textContent: 'mockTextContent',
  ctaButton: 'mockCtaButton',
  imageContent: 'mockImageContent',
}));

describe('HeroBanner Component', () => {
  const defaultProps: HeroContent = { // Use HeroContent type
    title: 'Test Title',
    description: 'Test Description',
    ctaText: 'Click Me',
    ctaLink: '/test-link',
    imageUrl: 'test-image.jpg',
    imageAlt: 'Test Alt Text',
  };

  it('renders all elements with correct content', () => {
    render(<HeroBanner {...defaultProps} />);

    // Check for title
    expect(screen.getByRole('heading', { name: defaultProps.title })).toBeInTheDocument();

    // Check for description
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument();

    // Check for CTA button
    const ctaButton = screen.getByRole('link', { name: defaultProps.ctaText });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute('href', defaultProps.ctaLink);

    // Check for image
    expect(screen.getByAltText(defaultProps.imageAlt as string)).toBeInTheDocument(); // Added 'as string' for type safety
    expect(screen.getByAltText(defaultProps.imageAlt as string)).toHaveAttribute('src', defaultProps.imageUrl);
    expect(screen.getByAltText(defaultProps.imageAlt as string)).toHaveAttribute('sizes');
  });

  it('applies correct CSS module classes (mocked)', () => {
    const { container } = render(<HeroBanner {...defaultProps} />);

    const section = container.firstChild; // <section> element is the root
    expect(section).toHaveClass('mockHeroBanner');

    // Check classes on internal divs if needed, though less critical for unit tests
    // For example, the text content div:
    // expect(screen.getByText(defaultProps.title).closest('div')).toHaveClass('mockTextContent');
    // And the CTA button:
    // expect(screen.getByRole('link', { name: defaultProps.ctaText })).toHaveClass('mockCtaButton');
  });

  it('uses default alt text if imageAlt is not provided', () => {
    // Create props without imageAlt by omitting it
    const propsWithoutAlt: HeroContent = {
      title: 'Test Title No Alt',
      description: 'Test Description No Alt',
      ctaText: 'Click Me No Alt',
      ctaLink: '/test-link-no-alt',
      imageUrl: 'test-image-no-alt.jpg',
      // imageAlt is omitted
    };
    render(<HeroBanner {...propsWithoutAlt} />);

    // The component provides a default "Hero image" alt text
    expect(screen.getByAltText('Hero image')).toBeInTheDocument();
  });

  it('renders different content when props change', () => {
    const newProps: HeroContent = { // Use HeroContent type
      title: 'Another Title',
      description: 'Another Description',
      ctaText: 'Go Somewhere Else',
      ctaLink: '/another-link',
      imageUrl: 'another-image.png',
      imageAlt: 'Another Alt Text',
    };
    render(<HeroBanner {...newProps} />);

    expect(screen.getByRole('heading', { name: newProps.title })).toBeInTheDocument();
    expect(screen.getByText(newProps.description)).toBeInTheDocument();
    const ctaButton = screen.getByRole('link', { name: newProps.ctaText });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute('href', newProps.ctaLink);
    const image = screen.getByAltText(newProps.imageAlt as string); // Added 'as string'
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', newProps.imageUrl);
    expect(image).toHaveAttribute('sizes');
  });
});
