import React from 'react';
import { render, screen } from '@testing-library/react';
import Breadcrumb from '../../components/Breadcrumb'; // Adjusted path
import '@testing-library/jest-dom';

// Mock styles to prevent errors during testing if CSS modules are not transformed
jest.mock('../../styles/Breadcrumb.module.css', () => ({
  breadcrumbNav: 'breadcrumbNav',
  breadcrumbList: 'breadcrumbList',
  breadcrumbItem: 'breadcrumbItem',
  separator: 'separator',
  link: 'link',
  currentSegment: 'currentSegment',
}));

describe('Breadcrumb Component', () => {
  const mockSegments = [
    { label: 'Home', href: '/' },
    { label: 'Category', href: '/category' },
    { label: 'Product', href: '/category/product' },
  ];

  it('renders correctly with given segments', () => {
    render(<Breadcrumb segments={mockSegments} />);

    expect(screen.getByLabelText('breadcrumb')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
  });

  it('has the correct ARIA label', () => {
    render(<Breadcrumb segments={mockSegments} />);
    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();
  });

  it('renders links for non-current segments and text for the current one', () => {
    render(<Breadcrumb segments={mockSegments} />);

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
    expect(homeLink).toHaveClass('link'); // Check mock class

    const categoryLink = screen.getByText('Category').closest('a');
    expect(categoryLink).toHaveAttribute('href', '/category');
    expect(categoryLink).toHaveClass('link'); // Check mock class

    const productText = screen.getByText('Product');
    expect(productText.closest('a')).toBeNull(); // Current segment should not be a link
    expect(productText).toHaveClass('currentSegment'); // Check mock class
  });

  it('renders separators between segments', () => {
    render(<Breadcrumb segments={mockSegments} />);
    const separators = screen.getAllByText('>');
    expect(separators).toHaveLength(mockSegments.length - 1);
    separators.forEach(separator => {
      expect(separator).toHaveClass('separator'); // Check mock class
    });
  });

  it('renders correctly with a single segment (only Home)', () => {
    const singleSegment = [{ label: 'Home', href: '/' }];
    render(<Breadcrumb segments={singleSegment} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Home')).toHaveClass('currentSegment');
    expect(screen.queryByText('>')).toBeNull(); // No separators
  });

  it('renders nothing if segments array is empty (or handles gracefully)', () => {
    // Current implementation will render the nav and ol structure even if empty.
    // Depending on desired behavior, this test might change.
    // For now, let's check it doesn't break and renders the main structure.
    render(<Breadcrumb segments={[]} />);
    expect(screen.getByLabelText('breadcrumb')).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument(); // Check for ol
    expect(screen.queryByRole('listitem')).toBeNull(); // No li items
  });
});
