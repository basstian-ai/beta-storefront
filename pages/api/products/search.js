import { setupTelemetry } from '../../../lib/telemetry.js';
import { searchProducts } from '../../../bff/products/search.js';

setupTelemetry();

export default async function handler(req, res) {
  const { q } = req.query;
  if (typeof q !== 'string' || q.trim() === '') {
    res.status(400).json({ error: 'Missing search query' });
    return;
  }

  try {
    const results = await searchProducts(q);
    res.status(200).json({ products: results });
  } catch (error) {
    console.error('[API] searchProducts error:', error);
    res.status(500).json({ error: 'Failed to fetch search results', details: error.message });
  }
}

