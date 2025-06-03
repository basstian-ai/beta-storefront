async function getOrders() {
  try {
    const response = await fetch('https://dummyjson.com/carts');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error; // Re-throw the error so the caller can handle it
  }
}

// Export the function
module.exports = {
  getOrders,
};
