import { describe, it, expect } from 'vitest';
import type { Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth';
import { slugify } from '@/lib/utils';

// Utility to simulate NextAuth callbacks
function runJwtCallback(user: Partial<User>) {
  return authOptions.callbacks!.jwt!({ token: {} as JWT, user: user as User });
}

function runSessionCallback(token: Partial<JWT>) {
  return authOptions.callbacks!.session!({ session: { user: {} } as Session, token: token as JWT });
}

describe('auth session companyId', () => {
  it('adds companyId slug from user.company.name', async () => {
    const user = {
      id: '1',
      accessToken: 'token',
      company: { name: 'Acme Inc' },
    };

    const token = await runJwtCallback(user);
    const expectedSlug = slugify(user.company!.name!);
    expect(token.companyId).toBe(expectedSlug);

    const session = await runSessionCallback(token);
    expect(session.companyId).toBe(expectedSlug);
    expect(session.user.companyId).toBe(expectedSlug);
  });

  it('handles special characters in company name', async () => {
    const user = {
      id: '2',
      accessToken: 'token',
      company: { name: 'Müller & Søn AS' },
    };

    const token = await runJwtCallback(user);
    expect(token.companyId).toBe('muller-son-as');

    const session = await runSessionCallback(token);
    expect(session.companyId).toBe('muller-son-as');
    expect(session.user.companyId).toBe('muller-son-as');
  });

  it('defaults companyId when company is missing', async () => {
    const user = {
      id: '3',
      accessToken: 'token',
    };

    const token = await runJwtCallback(user);
    expect(token.companyId).toBe('unknown-company');

    const session = await runSessionCallback(token);
    expect(session.companyId).toBe('unknown-company');
    expect(session.user.companyId).toBe('unknown-company');
  });
});
