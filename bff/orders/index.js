const { fetchData } = require('../utils/fetchData');

/**
 * Fetches order data (carts) from dummyjson.com.
 * @returns {Promise<Object>} A promise that resolves to the order data.
 */
async function getOrders() {
  try {
    const data = await fetchData('https://dummyjson.com/carts');
    return data;
  } catch (error) {
    console.error('[BFF] Error in getOrders:', error);
    throw error; // Re-throw the error so the caller can handle it
  }
}

// Export the function
module.exports = {
  getOrders,
};
