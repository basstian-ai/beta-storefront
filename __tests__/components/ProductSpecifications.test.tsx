// __tests__/components/ProductSpecifications.test.tsx
import { render, screen } from '@testing-library/react';
import ProductSpecifications from '@/components/ProductSpecifications';
import '@testing-library/jest-dom';

describe('ProductSpecifications', () => {
  const objectSpecifications = {
    weight: '2kg',
    dimensions: '10x20x30 cm',
    materialType: 'Aluminum', // Test camelCase to Title Case conversion
  };

  const arraySpecifications = [
    { name: 'Color', value: 'Red' },
    { name: 'Warranty', value: '2 years' },
  ];

  it('renders specifications correctly for object format', () => {
    render(<ProductSpecifications specifications={objectSpecifications} />);
    expect(screen.getByText('Product Specifications')).toBeInTheDocument();
    expect(screen.getByText('Weight:')).toBeInTheDocument();
    expect(screen.getByText('2kg')).toBeInTheDocument();
    expect(screen.getByText('Dimensions:')).toBeInTheDocument();
    expect(screen.getByText('10x20x30 cm')).toBeInTheDocument();
    expect(screen.getByText('Material Type:')).toBeInTheDocument(); // Check formatting
    expect(screen.getByText('Aluminum')).toBeInTheDocument();
  });

  it('renders specifications correctly for array format', () => {
    render(<ProductSpecifications specifications={arraySpecifications} />);
    expect(screen.getByText('Product Specifications')).toBeInTheDocument();
    arraySpecifications.forEach(spec => {
      expect(screen.getByText(`${spec.name}:`)).toBeInTheDocument();
      expect(screen.getByText(String(spec.value))).toBeInTheDocument();
    });
  });

  it('renders a message when no specifications are provided (empty object)', () => {
    render(<ProductSpecifications specifications={{}} />);
    expect(screen.getByText('No specifications available for this product.')).toBeInTheDocument();
  });

  it('renders a message when no specifications are provided (empty array)', () => {
    render(<ProductSpecifications specifications={[]} />);
    expect(screen.getByText('No specifications available for this product.')).toBeInTheDocument();
  });

  it('renders a message when specifications prop is null', () => {
    // @ts-ignore testing null case explicitly
    render(<ProductSpecifications specifications={null} />);
    expect(screen.getByText('No specifications available for this product.')).toBeInTheDocument();
  });

  it('renders a message when specifications prop is undefined', () => {
     // @ts-ignore testing undefined case explicitly
    render(<ProductSpecifications specifications={undefined} />);
    expect(screen.getByText('No specifications available for this product.')).toBeInTheDocument();
  });
});
