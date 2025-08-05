import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendEmail } from '@root/lib/email';

describe('sendEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (process as any).env.SENDGRID_KEY;
    global.fetch = vi.fn();
  });

  it('skips sending when SENDGRID_KEY is missing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await sendEmail({ to: 'a', subject: 's', text: 't' });
    expect(warn).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('sends email when key is present', async () => {
    (process as any).env.SENDGRID_KEY = 'key';
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch as any;
    await sendEmail({ to: 'a@example.com', subject: 'hi', text: 'hello' });
    expect(mockFetch).toHaveBeenCalled();
  });

  it('logs error when response not ok', async () => {
    (process as any).env.SENDGRID_KEY = 'key';
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, text: () => Promise.resolve('bad') });
    global.fetch = mockFetch as any;
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await sendEmail({ to: 'a@example.com', subject: 'hi', text: 'hello' });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
