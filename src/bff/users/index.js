import { authAdapter } from '@/adapters/auth';
import appInsights from 'applicationinsights';

/**
 * Fetches user data from dummyjson.com.
 * @returns {Promise<Object>} A promise that resolves to the user data.
 */
export async function getUsers() {
  const client = appInsights.defaultClient;
  try {
    client.trackTrace({
      message: 'Calling dummyjson for users',
      severity: 1, // Info
      properties: { origin: 'bff/users', method: 'getUsers' },
    });

    const data = await authAdapter.getUsers();

    client.trackEvent({
      name: 'UsersFetchSuccess',
      properties: {
        source: 'dummyjson',
        resultCount: data?.users?.length ?? 0,
      },
    });

    if (data?.users?.length) {
      client.trackMetric({
        name: 'UsersReturned',
        value: data.users.length,
      });
    }

    return data;
  } catch (error) {
    client.trackException({
      exception: error,
      properties: { origin: 'bff/users', method: 'getUsers' },
    });
    throw error; // Re-throw the error so the caller can handle it
  }
}
