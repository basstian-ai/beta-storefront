import { commerceAdapter } from '@/adapters/commerce';
import appInsights from 'applicationinsights';
import { z } from 'zod';
import { OrdersResponseSchema } from '../types';

export type OrdersResponse = z.infer<typeof OrdersResponseSchema>;

/**
 * Fetches order data (carts) from dummyjson.com.
 * @returns A promise that resolves to the order data.
 */
export async function getOrders(): Promise<OrdersResponse> {
  const client = appInsights.defaultClient;
  try {
    client.trackTrace({
      message: 'Calling dummyjson for orders',
      severity: 1, // Info
      properties: { origin: 'bff/orders', method: 'getOrders' },
    });

    // Assuming a dummy endpoint for orders, replace with actual if available
    const data = await commerceAdapter.fetchOrders(); // Using carts as a proxy for orders
    const parsed = OrdersResponseSchema.parse(data);

    client.trackEvent({
      name: 'OrdersFetchSuccess',
      properties: {
        source: 'dummyjson',
        resultCount: parsed.carts.length, // Adjusted to carts
      },
    });

    if (parsed.carts.length) {
      client.trackMetric({
        name: 'OrdersReturned', // Metric name can remain OrdersReturned
        value: parsed.carts.length, // Adjusted to carts
      });
    }

    return parsed;
  } catch (error) {
    client.trackException({
      exception: error as Error,
      properties: { origin: 'bff/orders', method: 'getOrders' },
    });
    throw error; // Re-throw the error so the caller can handle it
  }
}
