import { Column, Row, Section, Text } from '@react-email/components';
import { emailColors, fontFamily, getScoreColor } from '../email-config';

interface EmailCardProps {
  label: string;
  score: number;
  maxScore?: number;
}

export function EmailCard({ label, score, maxScore = 100 }: EmailCardProps) {
  const scoreColor = getScoreColor(score);

  return (
    <Section
      style={{
        backgroundColor: emailColors.card,
        borderRadius: '8px',
        border: `1px solid ${emailColors.border}`,
        padding: '16px 20px',
        marginBottom: '8px',
      }}
    >
      <Row>
        <Column style={{ width: '70%' }}>
          <Text
            style={{
              color: emailColors.text,
              fontSize: '14px',
              fontWeight: 500,
              margin: '0',
              fontFamily,
            }}
          >
            {label}
          </Text>
        </Column>
        <Column style={{ width: '30%', textAlign: 'right' as const }}>
          <Text
            style={{
              color: scoreColor,
              fontSize: '18px',
              fontWeight: 700,
              margin: '0',
              fontFamily,
            }}
          >
            {score}/{maxScore}
          </Text>
        </Column>
      </Row>
    </Section>
  );
}
