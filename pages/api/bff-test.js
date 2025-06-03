// TODO: Implement proper unit and integration tests for the BFF services. This endpoint is for basic smoke testing only.
import { setupTelemetry } from '../../lib/telemetry.js';
import { getProducts } from '../../bff/products/index.js';

setupTelemetry(); // Early in entry point

export default async function handler(req, res) {
  try {
    const products = await getProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error('[API Test] Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
}
