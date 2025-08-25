import { authAdapter } from '@/adapters/auth';
import appInsights from 'applicationinsights';
import { z } from 'zod';
import { UsersResponseSchema } from '../types';

export type UsersResponse = z.infer<typeof UsersResponseSchema>;

/**
 * Fetches user data from dummyjson.com.
 * @returns A promise that resolves to the user data.
 */
export async function getUsers(): Promise<UsersResponse> {
  const client = appInsights.defaultClient;
  try {
    client.trackTrace({
      message: 'Calling dummyjson for users',
      severity: 1, // Info
      properties: { origin: 'bff/users', method: 'getUsers' },
    });

    const data = await authAdapter.getUsers();
    const parsed = UsersResponseSchema.parse(data);

    client.trackEvent({
      name: 'UsersFetchSuccess',
      properties: {
        source: 'dummyjson',
        resultCount: parsed.users.length,
      },
    });

    if (parsed.users.length) {
      client.trackMetric({
        name: 'UsersReturned',
        value: parsed.users.length,
      });
    }

    return parsed;
  } catch (error) {
    client.trackException({
      exception: error as Error,
      properties: { origin: 'bff/users', method: 'getUsers' },
    });
    throw error; // Re-throw the error so the caller can handle it
  }
}
