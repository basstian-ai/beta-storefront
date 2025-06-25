import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CategoryClient from './CategoryClient'
import { ProductSchema } from '@/bff/types'
import { z } from 'zod'
import { useProductFilters } from '@/store/productFilters'

type Product = z.infer<typeof ProductSchema>;

const products: Product[] = [
  { id: 1, title: 'A', price: 10, category: { name:'c', slug:'c'}, slug:'a', description:'', images:[], thumbnail:'', rating:4 },
  { id: 2, title: 'B', price: 20, category: { name:'c', slug:'c'}, slug:'b', description:'', images:[], thumbnail:'', rating:5 },
];

const brands = ['Apple','Samsung'];

beforeEach(() => {
  useProductFilters.getState().reset()
})

describe('CategoryClient', () => {
  it('sorts products when selection changes', async () => {
    render(<CategoryClient products={products} brands={brands} categoryName="Test" />);
    await userEvent.selectOptions(screen.getByLabelText(/sort/i), 'price_desc');
    await waitFor(() => {
      const main = screen.getByRole('main');
      const titles = Array.from(main.querySelectorAll('h3')).map(el => el.textContent);
      expect(titles[0]).toBe('B');
    });
  });
});
