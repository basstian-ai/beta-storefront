import { commerceAdapter } from '@/adapters/commerce';
import appInsights from 'applicationinsights';

/**
 * Fetches product data from dummyjson.com.
 * @returns {Promise<Object>} A promise that resolves to the product data.
 */
export async function getProducts() {
  const client = appInsights.defaultClient;
  try {
    client.trackTrace({
      message: 'Calling dummyjson for products',
      severity: 1, // Info
      properties: { origin: 'bff/products', method: 'getProducts' },
    });

    const data = await commerceAdapter.fetchProducts({});

    client.trackEvent({
      name: 'ProductsFetchSuccess',
      properties: {
        source: 'dummyjson',
        userType: 'anonymous', // Assuming anonymous for now, can be enhanced with actual user context
        resultCount: data?.products?.length ?? 0,
      },
    });

    if (data?.products?.length) {
      client.trackMetric({
        name: 'ProductsReturned',
        value: data.products.length,
      });
    }

    return data;
  } catch (error) {
    client.trackException({
      exception: error,
      properties: { origin: 'bff/products', method: 'getProducts' },
    });
    throw error; // Re-throw the error so the caller can handle it
  }
}

/**
 * Fetches a single product by id from dummyjson.com.
 * @param {string|number} id - The product id.
 * @returns {Promise<Object>} The product data.
 */
export async function getProduct(id) {
  try {
    const data = await commerceAdapter.fetchProductById(id);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
