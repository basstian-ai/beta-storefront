import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PickupInStore from './PickupInStore';

const addItem = vi.fn();
const setFulfillment = vi.fn().mockReturnValue(true);

vi.mock('@/stores/useCartStore', () => ({
  useCartStore: () => ({ addItem, setFulfillment }),
}));

const mockStores = [
  { storeId: '1', storeName: 'Test Store', address: '123 Main St', stock: 2 }
];

const mockProduct = {
  id: 1,
  title: 'Test Product',
  slug: 'test-product',
  description: 'desc',
  price: 10,
  discountPercentage: 0,
  rating: 4,
  stock: 5,
  brand: 'Brand',
  category: { name: 'Cat', slug: 'cat' },
  thumbnail: 'http://example.com/thumb.jpg',
  images: ['http://example.com/img.jpg'],
};

describe('PickupInStore', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStores)
    }));
    addItem.mockClear();
    setFulfillment.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads store availability when button clicked', async () => {
    render(<PickupInStore product={mockProduct} />);
    fireEvent.click(screen.getByRole('button', { name: /check availability/i }));
    await waitFor(() => {
      expect(screen.getByText('Test Store')).toBeInTheDocument();
    });
  });

  it('adds item for pickup when store selected', async () => {
    render(<PickupInStore product={mockProduct} />);
    fireEvent.click(screen.getByRole('button', { name: /check availability/i }));
    await waitFor(() => {
      expect(screen.getByText('Test Store')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /pick up here/i }));
    await waitFor(() => {
      expect(setFulfillment).toHaveBeenCalled();
    });
  });
});
