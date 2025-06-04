// __tests__/components/FacetFilters.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FacetFilters, { FacetFiltersProps, ActiveFilters } from '@/components/FacetFilters'; // Adjust path
import { Facets } from '@/lib/api'; // Adjust path

const mockFacets: Facets = {
  brand: ['Apple', 'Samsung', 'Google'],
  size: ['S', 'M', 'L'],
  color: [], // Example of a facet category with no options
};

const mockEmptyFacets: Facets = {
  brand: [],
  size: [],
};

describe('FacetFilters Component', () => {
  let onFilterChangeMock: jest.Mock;

  beforeEach(() => {
    onFilterChangeMock = jest.fn();
  });

  const renderComponent = (props: Partial<FacetFiltersProps> = {}) => {
    const defaultProps: FacetFiltersProps = {
      facets: mockFacets,
      onFilterChange: onFilterChangeMock,
      ...props,
    };
    return render(<FacetFilters {...defaultProps} />);
  };

  it('renders facet categories and their options', () => {
    renderComponent();

    // Check for category titles (capitalized)
    expect(screen.getByText('Brand')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();

    // Check for brand options
    expect(screen.getByLabelText('Apple')).toBeInTheDocument();
    expect(screen.getByLabelText('Samsung')).toBeInTheDocument();
    expect(screen.getByLabelText('Google')).toBeInTheDocument();

    // Check for size options
    expect(screen.getByLabelText('S')).toBeInTheDocument();
    expect(screen.getByLabelText('M')).toBeInTheDocument();
    expect(screen.getByLabelText('L')).toBeInTheDocument();
  });

  it('does not render a facet group if it has no options', () => {
    renderComponent();
    // "Color" has an empty array in mockFacets
    expect(screen.queryByText('Color')).not.toBeInTheDocument();
  });

  it('handles empty facets data gracefully', () => {
    renderComponent({ facets: mockEmptyFacets });
    expect(screen.queryByText('Brand')).not.toBeInTheDocument();
    expect(screen.queryByText('Size')).not.toBeInTheDocument();
    // Check that "Filter By:" title is still there
    expect(screen.getByText('Filter By:')).toBeInTheDocument();
  });

  it('calls onFilterChange with correct active filters when a checkbox is clicked', () => {
    renderComponent();
    const appleCheckbox = screen.getByLabelText('Apple');
    fireEvent.click(appleCheckbox);

    expect(onFilterChangeMock).toHaveBeenCalledTimes(1); // Initial call from useEffect with {}
    // The second call is due to the click event updating state, triggering useEffect again
    expect(onFilterChangeMock).toHaveBeenCalledWith({ brand: ['Apple'] });

    const largeCheckbox = screen.getByLabelText('L');
    fireEvent.click(largeCheckbox);
    expect(onFilterChangeMock).toHaveBeenCalledWith({ brand: ['Apple'], size: ['L'] });

    // Uncheck Apple
    fireEvent.click(appleCheckbox);
    expect(onFilterChangeMock).toHaveBeenCalledWith({ size: ['L'] }); // Brand key should be removed
  });

  it('correctly updates active filters for multiple selections in the same category', () => {
    renderComponent();
    const appleCheckbox = screen.getByLabelText('Apple');
    const samsungCheckbox = screen.getByLabelText('Samsung');

    fireEvent.click(appleCheckbox);
    expect(onFilterChangeMock).toHaveBeenCalledWith({ brand: ['Apple'] });

    fireEvent.click(samsungCheckbox);
    expect(onFilterChangeMock).toHaveBeenCalledWith({ brand: ['Apple', 'Samsung'] });
  });

  it('initializes with empty filters and calls onFilterChange once on mount', () => {
    renderComponent();
    // useEffect calls onFilterChange on mount with initial empty activeFilters
    expect(onFilterChangeMock).toHaveBeenCalledTimes(1);
    expect(onFilterChangeMock).toHaveBeenCalledWith({});
  });
});
