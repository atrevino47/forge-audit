import { Button } from '@react-email/components';
import { emailColors, fontFamily } from '../email-config';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: emailColors.accent,
        color: emailColors.bg,
        padding: '14px 32px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 700,
        textDecoration: 'none',
        textAlign: 'center' as const,
        display: 'inline-block',
        fontFamily,
      }}
    >
      {children}
    </Button>
  );
}
