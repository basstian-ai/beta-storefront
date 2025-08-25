import { describe, it, expect, vi } from 'vitest';

const captured = vi.hoisted(() => ({ providers: undefined as any }));

vi.mock('next-auth', () => ({
  default: (opts: any) => {
    captured.providers = opts.providers;
    return () => new Response('ok');
  },
  // Export type helpers if needed
}));

vi.mock('next-auth/providers/credentials', () => ({
  default: () => ({ id: 'credentials' })
}));

import { GET } from '@/app/api/auth/[...nextauth]/route';

describe('Auth providers endpoint', () => {
  it('correctly configures the credentials provider in authOptions', async () => {
    // This test relies on the vi.mock for 'next-auth' to capture opts.providers
    // when the [...nextauth]/route module is imported.

    // Perform a dummy call to GET to ensure the module containing NextAuth(authOptions)
    // is fully initialized and the mock has a chance to capture the providers.
    // The response of this GET call is not important for this specific test's assertions.
    await GET(new Request('http://localhost/api/auth/signin')); // Any valid sub-path for GET

    expect(captured.providers).toBeInstanceOf(Array);
    expect(captured.providers.length).toBe(1); // Assuming only one provider (Credentials)

    const credentialsProviderConfig = captured.providers[0];
    expect(typeof credentialsProviderConfig).toBe('object');

    // Due to the mock: vi.mock('next-auth/providers/credentials', () => ({ default: () => ({ id: 'credentials' }) }));
    // The actual name 'DummyJSON' and other specific configurations from route.ts are replaced by this mock's return value.
    expect(credentialsProviderConfig.id).toBe('credentials');
    // If we wanted to test the actual name 'DummyJSON', the mock for 'next-auth/providers/credentials'
    // would need to be more sophisticated or removed to test the actual integration.
  });
});
