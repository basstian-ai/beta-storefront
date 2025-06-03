import { fetchData } from '../utils/fetchData.js';

/**
 * Fetches product data from dummyjson.com.
 * @returns {Promise<Object>} A promise that resolves to the product data.
 */
export async function getProducts() {
  try {
    const data = await fetchData('https://dummyjson.com/products');
    return data;
  } catch (error) {
    console.error('[BFF] Error in getProducts:', error);
    throw error; // Re-throw the error so the caller can handle it
  }
}
