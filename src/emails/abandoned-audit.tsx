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

interface AbandonedAuditProps {
  businessName: string;
  businessUrl: string;
  auditId: string;
}

export default function AbandonedAudit({
  businessName = 'Your Business',
  businessUrl = 'example.com',
  auditId = 'preview',
}: AbandonedAuditProps) {
  const resumeUrl = `${BASE_URL}/audit/${auditId}`;

  return (
    <Html>
      <Head />
      <Preview>Your audit is 80% ready — come see your score</Preview>
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
              You&apos;re almost there
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
              We started analyzing {businessName} ({businessUrl}) but noticed
              you didn&apos;t get to see your results. Your audit is nearly
              complete — it only takes a moment to finish.
            </Text>

            {/* Progress indicator */}
            <Section
              style={{
                backgroundColor: emailColors.card,
                borderRadius: '8px',
                border: `1px solid ${emailColors.border}`,
                padding: '20px 24px',
                margin: '0 0 24px',
              }}
            >
              <Text
                style={{
                  color: emailColors.accent,
                  fontSize: '32px',
                  fontWeight: 800,
                  margin: '0 0 4px',
                  fontFamily,
                }}
              >
                80%
              </Text>
              <Text
                style={{
                  color: emailColors.muted,
                  fontSize: '14px',
                  margin: '0',
                  fontFamily,
                }}
              >
                of your audit is already processed
              </Text>
            </Section>

            <Text
              style={{
                color: emailColors.muted,
                fontSize: '14px',
                lineHeight: '22px',
                margin: '0 0 28px',
                fontFamily,
              }}
            >
              Your free audit covers SEO, website quality, social media,
              branding, Google Business Profile, ads readiness, and reputation —
              7 dimensions scored against industry benchmarks.
            </Text>

            <Section style={{ textAlign: 'center' as const }}>
              <EmailButton href={resumeUrl}>Complete Your Audit</EmailButton>
            </Section>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}
