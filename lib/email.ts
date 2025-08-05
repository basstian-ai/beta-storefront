export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail({ to, subject, text }: EmailOptions) {
  const key = process.env.SENDGRID_KEY;
  if (!key) {
    console.warn('[email] SENDGRID_KEY missing; skipping email');
    return;
  }

  try {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: {
          email: process.env.SENDGRID_FROM || 'no-reply@example.com',
        },
        subject,
        content: [{ type: 'text/plain', value: text }],
      }),
    });

    if (!res.ok) {
      console.error('[email] SendGrid error', await res.text());
    }
  } catch (err) {
    console.error('[email] SendGrid request failed', err);
  }
}
