import { fetchData } from '../utils/fetchData.js';
import fs from 'fs/promises';
import path from 'path';
import appInsights from 'applicationinsights';

// Path to the mock data file
const mockDataPath = path.join(process.cwd(), 'bff', 'data', 'mock-product-details.json');
let productsData = [];

// Load mock data at startup
async function loadMockData() {
  const client = appInsights.defaultClient;
  try {
    const data = await fs.readFile(mockDataPath, 'utf-8');
    productsData = JSON.parse(data);
    client.trackTrace({
      message: 'Mock product data loaded successfully',
      severity: 1,
      properties: { origin: 'bff/products', count: productsData.length },
    });
  } catch (error) {
    client.trackException({
      exception: error,
      properties: { origin: 'bff/products', event: 'loadMockDataFailed', path: mockDataPath },
    });
    // Depending on the application's needs, you might want to throw this error
    // or handle it by setting productsData to an empty array or default set.
    console.error('Failed to load mock product data:', error);
    productsData = []; // Ensure it's an empty array on failure to prevent crashes
  }
}

loadMockData(); // Load the data when the module is initialized

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

    const data = await fetchData('https://dummyjson.com/products');

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
 * Fetches a single product by id from the loaded mock data.
 * @param {string|number} id - The product id.
 * @returns {Promise<Object|null>} The product data, or null if not found.
 */
export async function getProduct(id) {
  const client = appInsights.defaultClient;
  // Ensure data is loaded. This is a fallback, ideally loadMockData completes at startup.
  if (productsData.length === 0) {
    await loadMockData(); // Attempt to reload if empty, might indicate initial load failure
  }

  const product = productsData.find(p => String(p.id) === String(id));

  if (product) {
    client.trackTrace({
      message: 'Product retrieved from mock data',
      severity: 1,
      properties: { origin: 'bff/products', method: 'getProduct', id: String(id), source: 'mock-file' },
    });
    client.trackEvent({
      name: 'ProductFetchSuccess',
      properties: { id: String(id), source: 'mock-file' },
    });
    return product;
  } else {
    client.trackTrace({
      message: 'Product not found in mock data',
      severity: 2, // Warning
      properties: { origin: 'bff/products', method: 'getProduct', id: String(id), source: 'mock-file' },
    });
    client.trackEvent({
      name: 'ProductFetchNotFound',
      properties: { id: String(id), source: 'mock-file' },
    });
    return null; // Return null if product not found
  }
  // Errors during file loading are handled in loadMockData.
  // If loadMockData itself throws an unhandled error, that would propagate.
}
