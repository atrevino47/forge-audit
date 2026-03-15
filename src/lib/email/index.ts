import type { ReactElement } from 'react';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = 'Forge Audit <audit@forgedigital.com>';

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: ReactElement;
}): Promise<{ id: string } | null> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not configured — skipping email send');
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      react,
    });

    if (error) {
      console.error('[email] Send failed:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[email] Unexpected error:', err instanceof Error ? err.message : err);
    return null;
  }
}

export { resend };
