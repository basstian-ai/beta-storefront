import { fetchData } from '../utils/fetchData.js';
import appInsights from 'applicationinsights';

/**
 * Searches for products via dummyjson.com.
 * @param {string} query - Keyword to search for.
 * @returns {Promise<Object[]>} Array of product objects from dummyjson.
 */
export async function searchProducts(query) {
  const client = appInsights.defaultClient;
  try {
    client.trackTrace({
      message: 'Calling dummyjson for product search',
      severity: 1,
      properties: { origin: 'bff/products', method: 'searchProducts' },
    });

    const data = await fetchData(
      `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`
    );

    client.trackEvent({
      name: 'ProductSearchSuccess',
      properties: { query, resultCount: data?.products?.length ?? 0 },
    });

    if (data?.products?.length) {
      client.trackMetric({
        name: 'ProductsFound',
        value: data.products.length,
      });
    }

    return data.products || [];
  } catch (error) {
    client.trackException({
      exception: error,
      properties: { origin: 'bff/products', method: 'searchProducts' },
    });
    throw error;
  }
}

