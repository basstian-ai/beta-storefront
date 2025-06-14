import { setupTelemetry } from '../../../lib/telemetry.js';
import { getProduct } from '../../../bff/products/index.js';

setupTelemetry();

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Missing product id' });
    return;
  }

  try {
    const product = await getProduct(id);
    res.status(200).json(product);
  } catch (error) {
    console.error('[API] getProduct error:', error);
    res.status(500).json({ error: 'Failed to fetch product', details: error.message });
  }
}
