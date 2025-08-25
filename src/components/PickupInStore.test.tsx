import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import PickupInStore from './PickupInStore';

const mockStores = [
  { storeId: '1', storeName: 'Test Store', address: '123 Main St', stock: 2 }
];

describe('PickupInStore', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStores)
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads store availability when button clicked', async () => {
    render(<PickupInStore productId={1} />);
    fireEvent.click(screen.getByRole('button', { name: /check availability/i }));
    await waitFor(() => {
      expect(screen.getByText('Test Store')).toBeInTheDocument();
    });
  });
});
