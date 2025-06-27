import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import OrderHistory from '@/components/OrderHistory';

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          { id: 1, createdAt: '2025-06-20', total: 1000 },
          { id: 2, createdAt: '2025-05-11', total: 2000 },
        ]),
    })
  ) as unknown as typeof fetch;
});

it('renders rows for orders', async () => {
  render(<OrderHistory />);
  const rows = await screen.findAllByRole('row');
  // first row is the header
  expect(rows).toHaveLength(3);
});

