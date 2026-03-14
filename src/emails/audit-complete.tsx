import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { Grade } from '@contracts/audit-types';
import { EmailHeader } from './components/EmailHeader';
import { EmailFooter } from './components/EmailFooter';
import { EmailButton } from './components/EmailButton';
import { EmailCard } from './components/EmailCard';
import { emailColors, fontFamily, getScoreColor, BASE_URL } from './email-config';

interface CategoryPreview {
  label: string;
  score: number;
}

interface AuditCompleteProps {
  score: number;
  grade: Grade;
  businessName: string;
  topFindings: CategoryPreview[];
  auditId: string;
}

export default function AuditComplete({
  score = 74,
  grade = 'C',
  businessName = 'Your Business',
  topFindings = [
    { label: 'SEO', score: 82 },
    { label: 'Website Quality', score: 68 },
    { label: 'Social Media', score: 71 },
  ],
  auditId = 'preview',
}: AuditCompleteProps) {
  const resultsUrl = `${BASE_URL}/audit/${auditId}`;
  const scoreColor = getScoreColor(score);

  return (
    <Html>
      <Head />
      <Preview>{`Your online presence score is ready — ${score}/100`}</Preview>
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
              Your audit is ready
            </Text>
            <Text
              style={{
                color: emailColors.muted,
                fontSize: '15px',
                lineHeight: '24px',
                margin: '0 0 28px',
                fontFamily,
              }}
            >
              We&apos;ve analyzed {businessName}&apos;s online presence across 7 key
              dimensions. Here&apos;s the summary.
            </Text>

            {/* Score circle */}
            <Section style={{ textAlign: 'center' as const, margin: '0 0 32px' }}>
              <Text
                style={{
                  color: scoreColor,
                  fontSize: '64px',
                  fontWeight: 800,
                  margin: '0',
                  lineHeight: '1',
                  fontFamily,
                }}
              >
                {score}
              </Text>
              <Text
                style={{
                  color: emailColors.muted,
                  fontSize: '14px',
                  margin: '4px 0 0',
                  fontFamily,
                }}
              >
                Overall Score — Grade {grade}
              </Text>
            </Section>

            {/* Top findings */}
            <Text
              style={{
                color: emailColors.text,
                fontSize: '14px',
                fontWeight: 600,
                margin: '0 0 12px',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px',
                fontFamily,
              }}
            >
              Top Findings
            </Text>
            {topFindings.map((finding) => (
              <EmailCard
                key={finding.label}
                label={finding.label}
                score={finding.score}
              />
            ))}

            {/* CTA */}
            <Section style={{ textAlign: 'center' as const, margin: '28px 0 0' }}>
              <EmailButton href={resultsUrl}>View Full Results</EmailButton>
            </Section>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}
