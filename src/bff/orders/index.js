import { fetchData } from '@/utils/fetchData';
import appInsights from 'applicationinsights';

/**
 * Fetches order data (carts) from dummyjson.com.
 * @returns {Promise<Object>} A promise that resolves to the order data.
 */
export async function getOrders() {
  const client = appInsights.defaultClient;
  try {
    client.trackTrace({
      message: 'Calling dummyjson for orders',
      severity: 1, // Info
      properties: { origin: 'bff/orders', method: 'getOrders' },
    });

    // Assuming a dummy endpoint for orders, replace with actual if available
    const data = await fetchData('https://dummyjson.com/carts'); // Using carts as a proxy for orders

    client.trackEvent({
      name: 'OrdersFetchSuccess',
      properties: {
        source: 'dummyjson',
        resultCount: data?.carts?.length ?? 0, // Adjusted to carts
      },
    });

    if (data?.carts?.length) { // Adjusted to carts
      client.trackMetric({
        name: 'OrdersReturned', // Metric name can remain OrdersReturned
        value: data.carts.length, // Adjusted to carts
      });
    }

    return data;
  } catch (error) {
    client.trackException({
      exception: error,
      properties: { origin: 'bff/orders', method: 'getOrders' },
    });
    throw error; // Re-throw the error so the caller can handle it
  }
}
