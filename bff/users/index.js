import { fetchData } from '../utils/fetchData.js';

/**
 * Fetches user data from dummyjson.com.
 * @returns {Promise<Object>} A promise that resolves to the user data.
 */
export async function getUsers() {
  try {
    const data = await fetchData('https://dummyjson.com/users');
    return data;
  } catch (error) {
    console.error('[BFF] Error in getUsers:', error);
    throw error; // Re-throw the error so the caller can handle it
  }
}
