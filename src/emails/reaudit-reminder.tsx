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
import { emailColors, fontFamily, getScoreColor, BASE_URL } from './email-config';

type ReminderVariant = 'day3' | 'day10' | 'day13';

interface QuickWin {
  label: string;
  description: string;
}

interface ReauditReminderProps {
  variant: ReminderVariant;
  score: number;
  grade: Grade;
  businessName: string;
  quickWins: QuickWin[];
  auditId: string;
}

const variantContent: Record<
  ReminderVariant,
  { preview: string; heading: string; subtext: string; daysLeft: number }
> = {
  day3: {
    preview: 'Tips to improve your score before your free re-audit',
    heading: 'Boost your score before re-auditing',
    subtext:
      'You have 11 days left to run a free re-audit. Here are quick wins you can tackle right now to improve your score.',
    daysLeft: 11,
  },
  day10: {
    preview: 'Your free re-audit window closes in 4 days',
    heading: 'Your free re-audit expires soon',
    subtext:
      'Only 4 days left to run your complimentary re-audit. See if the improvements you\'ve made moved the needle.',
    daysLeft: 4,
  },
  day13: {
    preview: 'Last chance — free re-audit expires tomorrow',
    heading: 'Last chance to re-audit for free',
    subtext:
      'Your free re-audit window expires tomorrow. Run it now to see your updated score.',
    daysLeft: 1,
  },
};

export default function ReauditReminder({
  variant = 'day3',
  score = 74,
  grade = 'C',
  businessName = 'Your Business',
  quickWins = [
    { label: 'Add meta descriptions', description: 'Missing on 8 key pages' },
    { label: 'Claim Google Business Profile', description: 'Not yet claimed' },
    { label: 'Fix mobile responsiveness', description: '3 layout issues detected' },
  ],
  auditId = 'preview',
}: ReauditReminderProps) {
  const content = variantContent[variant];
  const reauditUrl = `${BASE_URL}/audit/${auditId}/reaudit`;
  const scoreColor = getScoreColor(score);

  return (
    <Html>
      <Head />
      <Preview>{content.preview}</Preview>
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
              {content.heading}
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
              {content.subtext}
            </Text>

            {/* Current score reminder */}
            <Section
              style={{
                backgroundColor: emailColors.card,
                borderRadius: '8px',
                border: `1px solid ${emailColors.border}`,
                padding: '20px 24px',
                margin: '0 0 24px',
                textAlign: 'center' as const,
              }}
            >
              <Text
                style={{
                  color: emailColors.muted,
                  fontSize: '12px',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '1px',
                  margin: '0 0 4px',
                  fontFamily,
                }}
              >
                {businessName} — Current Score
              </Text>
              <Text
                style={{
                  color: scoreColor,
                  fontSize: '48px',
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
                Grade {grade} · {content.daysLeft} day{content.daysLeft !== 1 ? 's' : ''} left
              </Text>
            </Section>

            {/* Quick wins (day3 variant emphasizes these) */}
            {quickWins.length > 0 && (
              <>
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
                  Quick Wins
                </Text>
                {quickWins.map((win) => (
                  <Section
                    key={win.label}
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
                      {win.label}
                    </Text>
                    <Text
                      style={{
                        color: emailColors.muted,
                        fontSize: '13px',
                        margin: '0',
                        fontFamily,
                      }}
                    >
                      {win.description}
                    </Text>
                  </Section>
                ))}
              </>
            )}

            <Section style={{ textAlign: 'center' as const, margin: '28px 0 0' }}>
              <EmailButton href={reauditUrl}>Run Your Free Re-Audit</EmailButton>
            </Section>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}
