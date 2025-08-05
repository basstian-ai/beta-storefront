import { describe, it, expect } from 'vitest';
import { authOptions } from '@/lib/auth';

// Utility to simulate NextAuth callbacks
function runJwtCallback(user: any) {
  return authOptions.callbacks!.jwt!({ token: {}, user } as any);
}

function runSessionCallback(token: any) {
  return authOptions.callbacks!.session!({ session: { user: {} } as any, token } as any);
}

describe('auth session companyId', () => {
  it('adds companyId slug from user.company.name', async () => {
    const user = {
      id: '1',
      accessToken: 'token',
      company: { name: 'Acme Inc' },
    };

    const token = await runJwtCallback(user);
    expect(token.companyId).toBe('acme-inc');

    const session = await runSessionCallback(token);
    expect(session.companyId).toBe('acme-inc');
    expect(session.user.companyId).toBe('acme-inc');
  });
});
