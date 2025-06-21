import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@/components/LoginForm';
import { renderWithProviders as render } from './utils';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockSession: any = { user: { username: '' } };

vi.mock('next-auth/react', async () => {
  const mod = await vi.importActual<any>('next-auth/react');
  return {
    ...mod,
    signIn: vi.fn(() => {
      mockSession.user.username = 'emilys';
      return Promise.resolve({ ok: true });
    }),
    useSession: () => ({ data: mockSession, status: 'authenticated' }),
  };
});

describe('login flow', () => {
  it('signs in with credentials', async () => {
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/username/i), 'emilys');
    await userEvent.type(screen.getByLabelText(/password/i), 'emilyspass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(mockSession.user.username).toBe('emilys');
  });
});
