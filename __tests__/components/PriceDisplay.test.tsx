// __tests__/components/PriceDisplay.test.tsx
import { render, screen } from '@testing-library/react';
import PriceDisplay from '@/components/PriceDisplay';
import '@testing-library/jest-dom';

describe('PriceDisplay', () => {
  const defaultPrice = 99.99;
  const mockPriceTiers = [
    { quantity: 2, price: 95.00, label: 'each' },
    { quantity: 5, price: 90.00 }, // Test without optional label
  ];

  it('displays the regular price correctly', () => {
    render(<PriceDisplay price={defaultPrice} priceTiers={[]} />);
    expect(screen.getByText(`Price: $${defaultPrice.toFixed(2)}`)).toBeInTheDocument();
  });

  it('displays price tiers correctly when provided', () => {
    render(<PriceDisplay price={defaultPrice} priceTiers={mockPriceTiers} />);
    expect(screen.getByText('Volume Discounts:')).toBeInTheDocument();
    expect(screen.getByText(`Buy ${mockPriceTiers[0].quantity} for $${mockPriceTiers[0].price.toFixed(2)} ${mockPriceTiers[0].label}`)).toBeInTheDocument();
    expect(screen.getByText(`Buy ${mockPriceTiers[1].quantity} for $${mockPriceTiers[1].price.toFixed(2)} each`)).toBeInTheDocument(); // Default label
  });

  it('does not display price tiers if none are provided', () => {
    render(<PriceDisplay price={defaultPrice} priceTiers={[]} />);
    expect(screen.queryByText('Volume Discounts:')).not.toBeInTheDocument();
  });

  it('displays contract price when customerToken and contractPrice are provided', () => {
    const contractPrice = 79.99;
    render(
      <PriceDisplay
        price={defaultPrice}
        priceTiers={mockPriceTiers}
        contractPrice={contractPrice}
        customerToken="B2B_TOKEN"
      />
    );
    expect(screen.getByText(`Your Contract Price: $${contractPrice.toFixed(2)}`)).toBeInTheDocument();
    // Regular price and tiers should not be visible
    expect(screen.queryByText(`Price: $${defaultPrice.toFixed(2)}`)).not.toBeInTheDocument();
    expect(screen.queryByText('Volume Discounts:')).not.toBeInTheDocument();
  });

  it('displays regular price if contractPrice is provided but customerToken is not', () => {
    const contractPrice = 79.99;
    render(
      <PriceDisplay
        price={defaultPrice}
        priceTiers={mockPriceTiers}
        contractPrice={contractPrice}
        customerToken={null}
      />
    );
    expect(screen.getByText(`Price: $${defaultPrice.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText('Volume Discounts:')).toBeInTheDocument();
    expect(screen.queryByText(`Your Contract Price: $${contractPrice.toFixed(2)}`)).not.toBeInTheDocument();
  });

  it('displays regular price if customerToken is provided but contractPrice is not (null)', () => {
    render(
      <PriceDisplay
        price={defaultPrice}
        priceTiers={mockPriceTiers}
        contractPrice={null}
        customerToken="B2B_TOKEN"
      />
    );
    expect(screen.getByText(`Price: $${defaultPrice.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText('Volume Discounts:')).toBeInTheDocument();
    expect(screen.queryByText(/Your Contract Price:/)).not.toBeInTheDocument();
  });

   it('displays regular price if customerToken is provided but contractPrice is undefined', () => {
    render(
      <PriceDisplay
        price={defaultPrice}
        priceTiers={mockPriceTiers}
        // contractPrice is undefined
        customerToken="B2B_TOKEN"
      />
    );
    expect(screen.getByText(`Price: $${defaultPrice.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText('Volume Discounts:')).toBeInTheDocument();
    expect(screen.queryByText(/Your Contract Price:/)).not.toBeInTheDocument();
  });
});
