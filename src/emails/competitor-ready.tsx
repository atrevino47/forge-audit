import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { EmailHeader } from './components/EmailHeader';
import { EmailFooter } from './components/EmailFooter';
import { EmailButton } from './components/EmailButton';
import { emailColors, fontFamily, getScoreColor, BASE_URL } from './email-config';

interface CompetitorReadyProps {
  businessName: string;
  businessScore: number;
  competitorName: string;
  competitorScore: number;
  auditId: string;
}

export default function CompetitorReady({
  businessName = 'Your Business',
  businessScore = 74,
  competitorName = 'Competitor',
  competitorScore = 68,
  auditId = 'preview',
}: CompetitorReadyProps) {
  const analysisUrl = `${BASE_URL}/audit/${auditId}/competitor`;
  const yourColor = getScoreColor(businessScore);
  const theirColor = getScoreColor(competitorScore);
  const isAhead = businessScore >= competitorScore;

  return (
    <Html>
      <Head />
      <Preview>Your competitor analysis is complete</Preview>
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
              Competitor analysis ready
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
              We&apos;ve compared {businessName} against {competitorName} across
              all 7 audit dimensions. Here&apos;s the high-level result.
            </Text>

            {/* Score comparison */}
            <Section
              style={{
                backgroundColor: emailColors.card,
                borderRadius: '8px',
                border: `1px solid ${emailColors.border}`,
                padding: '24px',
                margin: '0 0 24px',
              }}
            >
              <Row>
                <Column style={{ width: '50%', textAlign: 'center' as const }}>
                  <Text
                    style={{
                      color: emailColors.muted,
                      fontSize: '12px',
                      textTransform: 'uppercase' as const,
                      letterSpacing: '1px',
                      margin: '0 0 8px',
                      fontFamily,
                    }}
                  >
                    You
                  </Text>
                  <Text
                    style={{
                      color: yourColor,
                      fontSize: '48px',
                      fontWeight: 800,
                      margin: '0',
                      lineHeight: '1',
                      fontFamily,
                    }}
                  >
                    {businessScore}
                  </Text>
                  <Text
                    style={{
                      color: emailColors.muted,
                      fontSize: '13px',
                      margin: '4px 0 0',
                      fontFamily,
                    }}
                  >
                    {businessName}
                  </Text>
                </Column>
                <Column style={{ width: '50%', textAlign: 'center' as const }}>
                  <Text
                    style={{
                      color: emailColors.muted,
                      fontSize: '12px',
                      textTransform: 'uppercase' as const,
                      letterSpacing: '1px',
                      margin: '0 0 8px',
                      fontFamily,
                    }}
                  >
                    Competitor
                  </Text>
                  <Text
                    style={{
                      color: theirColor,
                      fontSize: '48px',
                      fontWeight: 800,
                      margin: '0',
                      lineHeight: '1',
                      fontFamily,
                    }}
                  >
                    {competitorScore}
                  </Text>
                  <Text
                    style={{
                      color: emailColors.muted,
                      fontSize: '13px',
                      margin: '4px 0 0',
                      fontFamily,
                    }}
                  >
                    {competitorName}
                  </Text>
                </Column>
              </Row>
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
              {isAhead
                ? `You're ahead by ${businessScore - competitorScore} points. See the full breakdown to find where you can extend your lead.`
                : `You're behind by ${competitorScore - businessScore} points. See the full breakdown to find the categories where you can close the gap.`}
            </Text>

            <Section style={{ textAlign: 'center' as const }}>
              <EmailButton href={analysisUrl}>
                View Competitor Analysis
              </EmailButton>
            </Section>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}
