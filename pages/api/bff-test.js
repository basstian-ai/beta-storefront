import { getProducts } from '../../bff/products/index.js';

export default async function handler(req, res) {
  try {
    const products = await getProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error('[API Test] Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
}
