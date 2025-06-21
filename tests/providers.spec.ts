import { describe, it, expect, vi } from 'vitest';

var capturedProviders: any; // use var so hoisting works with vi.mock

vi.mock('next-auth', () => ({
  default: (opts: any) => {
    capturedProviders = opts.providers;
    return () => new Response('ok');
  },
  // Export type helpers if needed
}));

vi.mock('next-auth/providers/credentials', () => ({
  default: () => ({ id: 'credentials' })
}));

import { GET } from '@/app/api/auth/[...nextauth]/route';

describe('Auth providers endpoint', () => {
  it('returns 200 and exposes credentials provider', async () => {
    const res = await GET(new Request('http://localhost/api/auth/providers'));
    expect(res.status).toBe(200);
    expect(typeof capturedProviders[0]).toBe('object');
    expect(capturedProviders[0].id).toBe('credentials');
  });
});
