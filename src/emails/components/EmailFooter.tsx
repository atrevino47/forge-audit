import { Hr, Link, Section, Text } from '@react-email/components';
import { emailColors, BASE_URL, fontFamily } from '../email-config';

interface EmailFooterProps {
  unsubscribeUrl?: string;
}

export function EmailFooter({ unsubscribeUrl = '{{unsubscribe_url}}' }: EmailFooterProps) {
  const linkStyle = {
    color: emailColors.muted,
    textDecoration: 'underline' as const,
  };

  return (
    <Section
      style={{
        backgroundColor: emailColors.surface,
        padding: '24px 32px',
        borderRadius: '0 0 8px 8px',
      }}
    >
      <Hr style={{ borderColor: emailColors.border, margin: '0 0 20px' }} />
      <Text
        style={{
          color: emailColors.muted,
          fontSize: '13px',
          lineHeight: '20px',
          margin: '0 0 8px',
          textAlign: 'center' as const,
          fontFamily,
        }}
      >
        Forge Digital — Premium Online Presence Solutions
      </Text>
      <Text
        style={{
          color: emailColors.muted,
          fontSize: '12px',
          lineHeight: '20px',
          margin: '0',
          textAlign: 'center' as const,
          fontFamily,
        }}
      >
        <Link href={`${BASE_URL}/privacy`} style={linkStyle}>
          Privacy
        </Link>
        {' · '}
        <Link href={`${BASE_URL}/terms`} style={linkStyle}>
          Terms
        </Link>
        {' · '}
        <Link href={unsubscribeUrl} style={linkStyle}>
          Unsubscribe
        </Link>
      </Text>
    </Section>
  );
}
