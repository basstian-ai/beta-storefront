import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DummyJsonProductService } from './dummyjson';
import { ProductServiceError } from '../productService';
import { fetchProducts, fetchProductById } from '../dummyjson';

vi.mock('../dummyjson', () => ({
  fetchProducts: vi.fn(),
  fetchProductById: vi.fn(),
}));

describe('DummyJsonProductService', () => {
  const service = new DummyJsonProductService();
  const sampleProduct = {
    id: 1,
    title: 'Sample',
    description: 'Desc',
    price: 10,
    category: { slug: 'cat', name: 'Cat' },
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('lists products', async () => {
    (fetchProducts as any).mockResolvedValueOnce({ products: [sampleProduct], total: 1, skip: 0, limit: 1 });
    const res = await service.listProducts();
    expect(res.items[0].id).toBe(1);
    expect(fetchProducts).toHaveBeenCalled();
  });

  it('throws ProductServiceError on invalid list data', async () => {
    (fetchProducts as any).mockResolvedValueOnce({});
    await expect(service.listProducts()).rejects.toBeInstanceOf(ProductServiceError);
  });

  it('gets product by id', async () => {
    (fetchProductById as any).mockResolvedValueOnce(sampleProduct);
    const res = await service.getProduct('1');
    expect(res.id).toBe(1);
    expect(fetchProductById).toHaveBeenCalledWith('1');
  });

  it('throws ProductServiceError when product not found', async () => {
    (fetchProductById as any).mockResolvedValueOnce(undefined);
    await expect(service.getProduct('2')).rejects.toBeInstanceOf(ProductServiceError);
  });
});
