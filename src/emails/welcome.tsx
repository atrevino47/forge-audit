import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { EmailHeader } from './components/EmailHeader';
import { EmailFooter } from './components/EmailFooter';
import { EmailButton } from './components/EmailButton';
import { emailColors, fontFamily, BASE_URL } from './email-config';

interface WelcomeProps {
  userName: string;
  businessName: string;
}

export default function Welcome({
  userName = 'there',
  businessName = 'Your Business',
}: WelcomeProps) {
  const dashboardUrl = `${BASE_URL}/dashboard`;

  return (
    <Html>
      <Head />
      <Preview>Welcome to Forge Audit — your results are saved</Preview>
      <Body style={{ backgroundColor: emailColors.bg, margin: 0, padding: '40px 0' }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto' }}>
          <EmailHeader />

          <Section
            style={{
              backgroundColor: emailColors.surface,
              padding: '32px',
            }}
          >
            <Text
              style={{
                color: emailColors.text,
                fontSize: '22px',
                fontWeight: 700,
                margin: '0 0 8px',
                fontFamily,
              }}
            >
              Welcome, {userName}
            </Text>
            <Text
              style={{
                color: emailColors.muted,
                fontSize: '15px',
                lineHeight: '24px',
                margin: '0 0 24px',
                fontFamily,
              }}
            >
              Your Forge Audit account is set up and your results for{' '}
              {businessName} are saved. Here&apos;s what you get:
            </Text>

            {/* Benefits list */}
            {[
              {
                title: 'Saved Results',
                description:
                  'Access your full audit breakdown anytime from your dashboard.',
              },
              {
                title: 'Free Re-Audit',
                description:
                  'Run one complimentary re-audit within 14 days to track your progress.',
              },
              {
                title: 'Action Plan',
                description:
                  'Prioritized recommendations tailored to your business.',
              },
            ].map((benefit) => (
              <Section
                key={benefit.title}
                style={{
                  backgroundColor: emailColors.card,
                  borderRadius: '8px',
                  border: `1px solid ${emailColors.border}`,
                  padding: '16px 20px',
                  marginBottom: '8px',
                }}
              >
                <Text
                  style={{
                    color: emailColors.accent,
                    fontSize: '14px',
                    fontWeight: 700,
                    margin: '0 0 4px',
                    fontFamily,
                  }}
                >
                  {benefit.title}
                </Text>
                <Text
                  style={{
                    color: emailColors.muted,
                    fontSize: '13px',
                    lineHeight: '20px',
                    margin: '0',
                    fontFamily,
                  }}
                >
                  {benefit.description}
                </Text>
              </Section>
            ))}

            <Section style={{ textAlign: 'center' as const, margin: '28px 0 0' }}>
              <EmailButton href={dashboardUrl}>View Your Dashboard</EmailButton>
            </Section>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}
