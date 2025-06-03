import { fetchData } from '../utils/fetchData.js';

/**
 * Fetches CMS content (posts) from dummyjson.com.
 * @returns {Promise<Object>} A promise that resolves to the CMS content.
 */
export async function getCMSContent() {
  try {
    const data = await fetchData('https://dummyjson.com/posts');
    return data;
  } catch (error) {
    console.error('[BFF] Error in getCMSContent:', error);
    throw error; // Re-throw the error so the caller can handle it
  }
}
